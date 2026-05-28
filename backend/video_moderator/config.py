import os
from pathlib import Path

from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent.parent
MODERATOR_DIR = BASE_DIR / "video_moderator_runtime"
HF_CACHE_DIR = MODERATOR_DIR / ".cache" / "huggingface"
HF_CACHE_DIR.mkdir(parents=True, exist_ok=True)

os.environ.setdefault("HF_HOME", str(HF_CACHE_DIR))
os.environ.setdefault("HF_HUB_CACHE", str(HF_CACHE_DIR / "hub"))


class Settings(BaseSettings):
    BASE_DIR: Path = BASE_DIR
    UPLOAD_DIR: Path = MODERATOR_DIR / "uploads"
    EXTRACTED_DIR: Path = MODERATOR_DIR / "extracted"
    FRAMES_DIR: Path = MODERATOR_DIR / "frames"
    RESULTS_DIR: Path = MODERATOR_DIR / "results"

    FFMPEG_BIN: str = ""
    FRAME_RATE: str = "1/3"
    MAX_FRAMES: int = 60
    AUDIO_SAMPLE_RATE: int = 16000

    WHISPER_MODEL: str = "base"
    WHISPER_DEVICE: str = "cpu"

    FRAME_FLAG_THRESHOLD: float = 0.50
    NSFW_HARD_THRESHOLD: float = 0.80
    OCR_CORROBORATION_THRESHOLD: float = 0.40
    EDU_HIGH: float = 0.70
    EDU_LOW: float = 0.30

    AUDIO_WEIGHT: float = 0.5
    VISUAL_WEIGHT: float = 0.5
    ALLOW_MAX: int = 30
    REVIEW_MAX: int = 60

    TOXICITY_HARD_REJECT: float = 0.80
    KEYWORD_CORROBORATION_THRESHOLD: float = 0.40

    BANNED_KEYWORDS: list[str] = [
        "fuck",
        "shit",
        "bitch",
        "asshole",
        "nigger",
        "faggot",
        "kill yourself",
        "rape",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

for directory in (
    settings.UPLOAD_DIR,
    settings.EXTRACTED_DIR,
    settings.FRAMES_DIR,
    settings.RESULTS_DIR,
):
    directory.mkdir(parents=True, exist_ok=True)


def get_ffmpeg_bin() -> str:
    if settings.FFMPEG_BIN:
        return settings.FFMPEG_BIN

    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()
