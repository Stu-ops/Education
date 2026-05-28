from functools import lru_cache

from video_moderator.config import settings
from video_moderator.utils.logger import logger

_detoxify_unavailable = False


@lru_cache(maxsize=1)
def _get_detoxify():
    from detoxify import Detoxify

    logger.info("Loading Detoxify model")
    return Detoxify("original")


def keyword_scan(text: str) -> bool:
    lower = text.lower()
    for keyword in settings.BANNED_KEYWORDS:
        if keyword in lower:
            logger.warning("Banned keyword detected: %s", keyword)
            return True
    return False


def toxicity_score(text: str) -> float:
    global _detoxify_unavailable

    max_words = 350
    if not text.strip() or _detoxify_unavailable:
        return 0.0

    try:
        import numpy as np

        model = _get_detoxify()
        words = text.split()
        chunks = [
            " ".join(words[index:index + max_words])
            for index in range(0, len(words), max_words)
        ]
        scores = model.predict(chunks)
        toxicity_scores = np.array(scores["toxicity"], dtype=float)
        return float(np.sqrt(np.mean(toxicity_scores ** 2)))
    except Exception as exc:
        _detoxify_unavailable = True
        logger.warning("Detoxify unavailable; continuing keyword-only moderation. Reason: %s", exc)
        return 0.0


def moderate_text(transcript: str) -> dict:
    bad_words = keyword_scan(transcript)
    toxicity = toxicity_score(transcript)
    audio_score = toxicity * 100

    if bad_words and toxicity >= settings.KEYWORD_CORROBORATION_THRESHOLD:
        audio_score = min(100.0, audio_score + 10.0)

    return {
        "transcript": transcript,
        "toxicity": round(toxicity, 4),
        "bad_words_found": bad_words,
        "audio_score": round(audio_score, 2),
    }

