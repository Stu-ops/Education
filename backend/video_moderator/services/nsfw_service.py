from functools import lru_cache
from pathlib import Path

from video_moderator.config import settings
from video_moderator.utils.logger import logger

_nsfw_unavailable = False


@lru_cache(maxsize=1)
def _get_model():
    global _nsfw_unavailable

    if _nsfw_unavailable:
        return None

    try:
        import opennsfw2 as n2

        logger.info("Loading OpenNSFW2 model")
        return n2.make_open_nsfw_model()
    except Exception as exc:
        _nsfw_unavailable = True
        logger.warning("OpenNSFW2 unavailable; continuing without NSFW frame scoring. Reason: %s", exc)
        return None


def score_frame(image_path: Path) -> float:
    model = _get_model()
    if model is None:
        return 0.0

    import numpy as np
    import opennsfw2 as n2
    from PIL import Image

    image = Image.open(image_path).convert("RGB")
    image = n2.preprocess_image(image, n2.Preprocessing.YAHOO)
    predictions = model.predict(np.expand_dims(image, axis=0))
    return float(predictions[0][1])


def _quadratic_mean(scores: list[float]) -> float:
    if not scores:
        return 0.0

    import numpy as np

    return float(np.sqrt(np.mean(np.array(scores) ** 2)))


def _wilson_lower_bound(positive: int, total: int, z: float = 1.96) -> float:
    if total == 0:
        return 0.0

    p_hat = positive / total
    denominator = 1 + z ** 2 / total
    centre = (p_hat + z ** 2 / (2 * total)) / denominator
    margin = (
        z * ((p_hat * (1 - p_hat) / total) + z ** 2 / (4 * total ** 2)) ** 0.5
    ) / denominator
    return float(max(0.0, centre - margin))


def _aggregate_frame_scores(scores: list[float]) -> dict:
    if not scores:
        return {
            "rms_score": 0.0,
            "wilson_bad_ratio": 0.0,
            "hard_detected": False,
        }

    flagged = [score for score in scores if score >= settings.FRAME_FLAG_THRESHOLD]
    hard_detected = any(score >= settings.NSFW_HARD_THRESHOLD for score in scores)

    return {
        "rms_score": round(_quadratic_mean(scores), 4),
        "wilson_bad_ratio": round(_wilson_lower_bound(len(flagged), len(scores)), 4),
        "hard_detected": hard_detected,
    }


def score_frames(frame_dir: Path) -> dict:
    frames = sorted(frame_dir.glob("*.jpg"))
    if not frames:
        logger.warning("No frames found to score")
        return _aggregate_frame_scores([])

    raw_scores: list[float] = []
    for frame in frames:
        try:
            raw_scores.append(score_frame(frame))
        except Exception as exc:
            logger.warning("NSFW scoring failed for %s: %s", frame.name, exc)

    logger.info("Scored %s/%s frames successfully", len(raw_scores), len(frames))
    return _aggregate_frame_scores(raw_scores)

