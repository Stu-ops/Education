from functools import lru_cache
from pathlib import Path

from video_moderator.config import settings
from video_moderator.utils.logger import logger


@lru_cache(maxsize=1)
def _get_model():
    from faster_whisper import WhisperModel

    logger.info("Loading Whisper model '%s' on %s", settings.WHISPER_MODEL, settings.WHISPER_DEVICE)
    return WhisperModel(
        settings.WHISPER_MODEL,
        device=settings.WHISPER_DEVICE,
        compute_type="int8",
    )


def transcribe(audio_path: Path) -> str:
    model = _get_model()
    logger.info("Transcribing %s", audio_path.name)
    segments, info = model.transcribe(str(audio_path), beam_size=5, task="translate")
    logger.info("Detected language: %s", info.language)
    return " ".join(seg.text.strip() for seg in segments)

