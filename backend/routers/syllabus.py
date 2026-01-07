from fastapi import APIRouter, HTTPException
from pathlib import Path
from functools import lru_cache
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/syllabus", tags=["syllabus"])

BASE_DIR = Path(__file__).resolve().parents[1]
TOPICS_PATH = BASE_DIR / "syllabus" / "topics.json"


@lru_cache(maxsize=1)
def load_topics_data():
    """Load topics JSON with caching to avoid repeated file I/O."""
    if not TOPICS_PATH.exists():
        raise HTTPException(status_code=500, detail="Topics data not found on server")
    
    try:
        with TOPICS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
        logger.info("Topics data loaded and cached")
        return data
    except Exception as e:
        logger.error(f"Failed to read topics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to read topics: {e}")


@router.get("/{class_num}")
def get_topics_by_class(class_num: int):
    """Return topics for a given class number (e.g. 1 -> class_1).

    Returns 404 if the class is not found or the JSON cannot be read.
    """
    key = f"class_{class_num}"
    data = load_topics_data()

    topics = data.get(key)
    if topics is None:
        raise HTTPException(status_code=404, detail=f"No topics found for class {class_num}")

    return {"class": class_num, "topics": topics}
