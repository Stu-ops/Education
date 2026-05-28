import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path

from database import SessionLocal
from models.models import ShortVideo
from r2_service import get_r2_service
from video_moderator.config import settings as moderator_settings
from video_moderator.pipeline import moderate_video_file
from video_moderator.utils.file_utils import cleanup_file

logger = logging.getLogger(__name__)


def _status_for_decision(decision: str) -> str:
    if decision == "ALLOW":
        return "completed"
    if decision == "REVIEW":
        return "moderation_review"
    return "moderation_rejected"


async def run_video_moderation_job(video_id: int) -> None:
    """Download a completed storage upload, moderate it, and persist the decision."""
    db = SessionLocal()
    local_path: Path | None = None

    try:
        video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
        if not video:
            logger.warning("Moderation job skipped; ShortVideo %s not found", video_id)
            return

        object_key = video.object_key
        local_path = moderator_settings.UPLOAD_DIR / f"short_video_{video_id}_{Path(object_key).name}"

        r2_service = get_r2_service()
        await asyncio.to_thread(r2_service.download_object_to_file, object_key, local_path)

        result = await moderate_video_file(local_path)
        result_dict = result.model_dump()
        now = datetime.utcnow().isoformat()

        video.moderation_status = result.status
        video.moderation_result_json = json.dumps(result_dict)
        video.moderation_score = result.final_score
        video.moderation_reason = result.hard_reject_reason or ",".join(result.flags)
        video.moderated_at = now
        video.updated_at = now
        video.status = _status_for_decision(result.status)

        if result.status == "ALLOW":
            video.file_url = r2_service.get_cdn_url(object_key) if video.is_public else None
        elif result.status == "REJECT":
            try:
                await asyncio.to_thread(r2_service.delete_object, object_key)
            except Exception as exc:
                logger.warning("Rejected video %s but storage delete failed: %s", video_id, exc)

        db.commit()
        logger.info("Moderation completed for ShortVideo %s: %s", video_id, result.status)

    except Exception as exc:
        logger.exception("Moderation failed for ShortVideo %s: %s", video_id, exc)
        try:
            video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
            if video:
                video.status = "moderation_failed"
                video.moderation_status = "ERROR"
                video.moderation_reason = str(exc)
                video.updated_at = datetime.utcnow().isoformat()
                db.commit()
        except Exception:
            db.rollback()
            logger.exception("Could not persist moderation failure for ShortVideo %s", video_id)
    finally:
        if local_path:
            cleanup_file(local_path)
        db.close()

