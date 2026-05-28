import asyncio
import subprocess
import uuid
from pathlib import Path

from video_moderator.config import get_ffmpeg_bin, settings
from video_moderator.utils.logger import logger


async def _run(cmd: list[str]) -> None:
    def _execute() -> None:
        proc = subprocess.run(cmd, capture_output=True)
        if proc.returncode != 0:
            error = proc.stderr.decode("utf-8", errors="replace")
            raise RuntimeError(f"FFmpeg failed:\n{error}")

    await asyncio.to_thread(_execute)


async def extract_audio(video_path: Path) -> Path:
    job_id = uuid.uuid4().hex[:8]
    audio_path = settings.EXTRACTED_DIR / f"audio_{job_id}.wav"

    cmd = [
        get_ffmpeg_bin(),
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        str(settings.AUDIO_SAMPLE_RATE),
        str(audio_path),
    ]
    logger.info("Extracting audio to %s", audio_path.name)
    await _run(cmd)
    return audio_path


async def extract_frames(video_path: Path) -> Path:
    job_id = uuid.uuid4().hex[:8]
    frame_dir = settings.FRAMES_DIR / f"frames_{job_id}"
    frame_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        get_ffmpeg_bin(),
        "-y",
        "-i",
        str(video_path),
        "-vf",
        f"fps={settings.FRAME_RATE}",
        "-frames:v",
        str(settings.MAX_FRAMES),
        str(frame_dir / "frame_%04d.jpg"),
    ]
    logger.info("Extracting frames to %s", frame_dir.name)
    await _run(cmd)
    return frame_dir