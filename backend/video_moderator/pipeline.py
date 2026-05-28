import asyncio
from pathlib import Path

from video_moderator.models import ModerationResult
from video_moderator.services.ffmpeg_service import extract_audio, extract_frames
from video_moderator.services.frame_service import analyze_frames
from video_moderator.services.scoring_service import aggregate
from video_moderator.services.stt_service import transcribe
from video_moderator.services.text_moderation import moderate_text
from video_moderator.utils.file_utils import cleanup_dir, cleanup_file
from video_moderator.utils.logger import logger


async def moderate_video_file(video_path: Path) -> ModerationResult:
    audio_path: Path | None = None
    frame_dir: Path | None = None

    try:
        logger.info("Starting moderation pipeline for %s", video_path)
        audio_path, frame_dir = await asyncio.gather(
            extract_audio(video_path),
            extract_frames(video_path),
        )

        transcript = await asyncio.to_thread(transcribe, audio_path)
        audio_result = await asyncio.to_thread(moderate_text, transcript)
        visual_result = await asyncio.to_thread(analyze_frames, frame_dir)
        return aggregate(audio_result, visual_result)
    finally:
        if audio_path:
            cleanup_file(audio_path)
        if frame_dir:
            cleanup_dir(frame_dir)
            try:
                frame_dir.rmdir()
            except Exception as exc:
                logger.warning("Could not remove frame directory %s: %s", frame_dir, exc)

