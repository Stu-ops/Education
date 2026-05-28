from functools import lru_cache
from pathlib import Path

from video_moderator.utils.logger import logger


@lru_cache(maxsize=1)
def _get_reader():
    import easyocr

    logger.info("Loading EasyOCR reader")
    return easyocr.Reader(["en"], gpu=False)


def extract_text_from_frames(frame_dir: Path) -> str:
    reader = _get_reader()
    frames = sorted(frame_dir.glob("*.jpg"))
    all_text: list[str] = []

    for frame in frames:
        try:
            all_text.extend(reader.readtext(str(frame), detail=0))
        except Exception as exc:
            logger.warning("OCR failed for %s: %s", frame.name, exc)

    return " ".join(all_text)

