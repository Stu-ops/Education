from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
from functools import lru_cache
import json
import logging

from helper import get_user_class_number

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/topics", tags=["topics"])

BASE_DIR = Path(__file__).resolve().parents[1]
TOPICS_PATH = BASE_DIR / "syllabus" / "topics.json"


@lru_cache(maxsize=1)
def load_topics_data():
    """Load topics JSON with caching to avoid repeated file I/O."""
    if not TOPICS_PATH.exists():
        raise HTTPException(status_code=500, detail="Topics data file path not found on server")

    try:
        with TOPICS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
        logger.info("Topics data loaded and cached")
        return data
    except Exception as e:
        logger.error(f"Failed to read topics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to read topics: {e}")


@router.get("/", response_model=list)
def get_topics_for_current_user(class_num: int = Depends(get_user_class_number)):
    """Return the list of topic category names for the current user's class."""
    key = f"class_{class_num}"
    data = load_topics_data()

    topics_for_class = data.get(key)
    if topics_for_class is None:
        raise HTTPException(status_code=404, detail=f"No topics found for class {class_num}")

    # Return only the topic category names (keys) as a list of strings
    logger.debug(f"Returned topics for class {class_num}: {list(topics_for_class.keys())}")
    return list(topics_for_class.keys())


