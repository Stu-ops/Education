import shutil
from pathlib import Path

from video_moderator.utils.logger import logger


def cleanup_dir(directory: Path) -> None:
    if directory.exists():
        for item in directory.iterdir():
            try:
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
            except Exception as exc:
                logger.warning("Could not delete %s: %s", item, exc)


def cleanup_file(path: Path) -> None:
    try:
        if path.exists():
            path.unlink()
    except Exception as exc:
        logger.warning("Could not delete %s: %s", path, exc)

