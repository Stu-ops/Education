from datetime import datetime
from typing import List, Optional

import logging
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import verify_token
from helper import get_db
from models.models import Admin, ShortVideo, Teacher
from models.schemas import ShortVideoOut
from r2_service import get_r2_service
from video_moderation_tasks import run_video_moderation_job

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/videos", tags=["videos"])

COMPLETED_STATUS = "completed"


class PresignedUploadURLRequest(BaseModel):
    title: str
    description: Optional[str] = None
    class_level: str
    subject: str
    is_public: bool = False
    filename: str
    content_type: str


class PresignedUploadURLResponse(BaseModel):
    upload_url: str
    object_key: str
    upload_expires_in_seconds: int
    video_id: int


class CompleteUploadRequest(BaseModel):
    video_id: int
    object_key: str
    file_size: int
    duration: float = 0.0
    codec_info: Optional[str] = None
    thumbnail_key: Optional[str] = None


class PresignedDownloadURLResponse(BaseModel):
    download_url: str
    expires_in_seconds: int


class CDNURLResponse(BaseModel):
    cdn_url: str


class ModerationStatusResponse(BaseModel):
    video_id: int
    status: str
    moderation_status: Optional[str] = None
    moderation_score: Optional[float] = None
    moderation_reason: Optional[str] = None
    moderated_at: Optional[str] = None


def _get_teacher_or_401(username: str, db: Session) -> Teacher:
    teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not teacher:
        raise HTTPException(status_code=401, detail="Not authenticated as teacher")
    if not teacher.is_active:
        raise HTTPException(status_code=403, detail="Teacher account is suspended")
    return teacher


def _ensure_owner(video: ShortVideo, teacher: Teacher) -> None:
    if video.user_id != teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this video")


def _ensure_playable(video: ShortVideo) -> None:
    if video.status != COMPLETED_STATUS:
        raise HTTPException(
            status_code=403,
            detail=f"Video is not playable until moderation completes. Current status: {video.status}",
        )


def _is_admin(username: str, db: Session) -> bool:
    return db.query(Admin).filter(Admin.username == username).first() is not None


@router.get("", response_model=List[ShortVideoOut])
async def list_videos(
    db: Session = Depends(get_db),
    class_level: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List public videos that passed moderation."""
    query = db.query(ShortVideo).filter(
        ShortVideo.is_public == True,
        ShortVideo.status == COMPLETED_STATUS,
    )

    if class_level:
        query = query.filter(ShortVideo.class_level == class_level)
    if subject:
        query = query.filter(ShortVideo.subject == subject)

    return query.offset(skip).limit(limit).all()


@router.get("/me/my-videos", response_model=List[ShortVideoOut])
async def get_my_videos(
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Get CDN videos uploaded by the authenticated teacher."""
    teacher = _get_teacher_or_401(username, db)
    return (
        db.query(ShortVideo)
        .filter(ShortVideo.user_id == teacher.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/presigned-upload-url", response_model=PresignedUploadURLResponse)
async def generate_presigned_upload_url(
    request: PresignedUploadURLRequest,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service=Depends(get_r2_service),
):
    """Create an uploading row and return a direct-to-storage upload URL."""
    teacher = _get_teacher_or_401(username, db)

    if not request.content_type.startswith("video/"):
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {request.content_type}")

    try:
        now = datetime.utcnow().isoformat()
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        object_key = f"videos/{teacher.id}/{timestamp}_{request.filename}"

        video = ShortVideo(
            title=request.title,
            description=request.description or "",
            user_id=teacher.id,
            class_level=request.class_level,
            subject=request.subject,
            is_public=request.is_public,
            object_key=object_key,
            status="uploading",
            moderation_status=None,
            created_at=now,
            updated_at=now,
        )
        db.add(video)
        db.flush()

        upload_url = r2_service.generate_presigned_upload_url(
            object_key=object_key,
            content_type=request.content_type,
            expires_in=3600,
        )

        db.commit()
        db.refresh(video)

        return PresignedUploadURLResponse(
            upload_url=upload_url,
            object_key=object_key,
            upload_expires_in_seconds=3600,
            video_id=video.id,
        )
    except Exception as exc:
        db.rollback()
        logger.error("Error generating presigned URL: %s", exc)
        raise HTTPException(status_code=500, detail=f"Error generating upload URL: {exc}")


@router.post("/complete-upload", response_model=ShortVideoOut)
async def complete_upload(
    request: CompleteUploadRequest,
    background_tasks: BackgroundTasks,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Finalize metadata, quarantine the upload, and start moderation."""
    teacher = _get_teacher_or_401(username, db)

    try:
        video = db.query(ShortVideo).filter(ShortVideo.id == request.video_id).first()
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")

        _ensure_owner(video, teacher)

        if video.object_key != request.object_key:
            raise HTTPException(status_code=400, detail="Object key does not match the upload session")

        now = datetime.utcnow().isoformat()
        video.file_size = request.file_size
        video.duration = request.duration
        video.codec_info = request.codec_info
        video.thumbnail_key = request.thumbnail_key
        video.status = "pending_moderation"
        video.moderation_status = "PENDING"
        video.moderation_reason = None
        video.updated_at = now

        db.commit()
        db.refresh(video)

        background_tasks.add_task(run_video_moderation_job, video.id)
        logger.info("Queued moderation for ShortVideo %s", video.id)
        return video
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error("Error completing upload: %s", exc)
        raise HTTPException(status_code=500, detail=f"Error completing upload: {exc}")


@router.get("/{video_id}/moderation-status", response_model=ModerationStatusResponse)
async def get_moderation_status(
    video_id: int,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Return moderation status for the owner or an admin."""
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not _is_admin(username, db):
        if not teacher:
            raise HTTPException(status_code=401, detail="Not authenticated")
        _ensure_owner(video, teacher)

    return ModerationStatusResponse(
        video_id=video.id,
        status=video.status,
        moderation_status=video.moderation_status,
        moderation_score=video.moderation_score,
        moderation_reason=video.moderation_reason,
        moderated_at=video.moderated_at,
    )


@router.get("/{video_id}/presigned-download-url", response_model=PresignedDownloadURLResponse)
async def get_presigned_download_url(
    video_id: int,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service=Depends(get_r2_service),
):
    """Generate a private download URL for completed owner videos."""
    teacher = _get_teacher_or_401(username, db)
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    _ensure_owner(video, teacher)
    _ensure_playable(video)

    if video.is_public:
        raise HTTPException(status_code=400, detail="Use /cdn-url for public videos")

    download_url = r2_service.generate_presigned_download_url(video.object_key, expires_in=3600)
    return PresignedDownloadURLResponse(download_url=download_url, expires_in_seconds=3600)


@router.get("/{video_id}/cdn-url", response_model=CDNURLResponse)
async def get_cdn_url(
    video_id: int,
    db: Session = Depends(get_db),
    r2_service=Depends(get_r2_service),
):
    """Get public CDN URL for public videos that passed moderation."""
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video.is_public:
        raise HTTPException(status_code=403, detail="Video is not public")
    _ensure_playable(video)

    return CDNURLResponse(cdn_url=r2_service.get_cdn_url(video.object_key))


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: int,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
    r2_service=Depends(get_r2_service),
):
    """Delete a CDN video and its storage objects."""
    teacher = _get_teacher_or_401(username, db)
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    _ensure_owner(video, teacher)

    try:
        try:
            r2_service.delete_object(video.object_key)
        except Exception as exc:
            logger.warning("Could not delete video object %s: %s", video.object_key, exc)

        if video.thumbnail_key:
            try:
                r2_service.delete_object(video.thumbnail_key)
            except Exception as exc:
                logger.warning("Could not delete thumbnail object %s: %s", video.thumbnail_key, exc)

        db.delete(video)
        db.commit()
        return None
    except Exception as exc:
        db.rollback()
        logger.error("Error deleting video: %s", exc)
        raise HTTPException(status_code=500, detail=f"Error deleting video: {exc}")


@router.post("/{video_id}/view", response_model=ShortVideoOut)
async def increment_view_count(
    video_id: int,
    db: Session = Depends(get_db),
):
    """Compatibility endpoint; ShortVideo does not currently store view counts."""
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    _ensure_playable(video)
    return video


@router.get("/{video_id}", response_model=ShortVideoOut)
async def get_video(video_id: int, db: Session = Depends(get_db)):
    """Get public metadata for a completed public CDN video."""
    video = db.query(ShortVideo).filter(ShortVideo.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.is_public:
        raise HTTPException(status_code=403, detail="Video is not public")
    _ensure_playable(video)
    return video
