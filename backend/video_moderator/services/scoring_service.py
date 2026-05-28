from video_moderator.config import settings
from video_moderator.models import ModerationResult
from video_moderator.utils.logger import logger


def aggregate(audio: dict, visual: dict) -> ModerationResult:
    audio_score = audio["audio_score"]
    visual_score = visual["visual_score"]
    final_score = round(
        settings.AUDIO_WEIGHT * audio_score + settings.VISUAL_WEIGHT * visual_score,
        2,
    )

    hard_reject_reason: str | None = None
    if visual["nsfw_hard_detected"]:
        hard_reject_reason = "At least one frame exceeded the NSFW hard threshold"
    elif audio["toxicity"] >= settings.TOXICITY_HARD_REJECT:
        hard_reject_reason = f"Toxicity score {audio['toxicity']:.2f} exceeds threshold"

    if hard_reject_reason:
        status = "REJECT"
    elif final_score <= settings.ALLOW_MAX:
        status = "ALLOW"
    elif final_score <= settings.REVIEW_MAX:
        status = "REVIEW"
    else:
        status = "REJECT"

    logger.info("Decision=%s final=%s audio=%s visual=%s", status, final_score, audio_score, visual_score)

    return ModerationResult(
        status=status,
        final_score=final_score,
        audio_score=audio_score,
        visual_score=visual_score,
        nsfw_hard_detected=visual["nsfw_hard_detected"],
        toxicity=audio["toxicity"],
        educational_probability=visual["educational_probability"],
        transcript=audio["transcript"],
        ocr_bad_words_found=visual["ocr_bad_words_found"],
        bad_words_found=audio["bad_words_found"],
        flags=visual.get("flags", []),
        hard_reject_reason=hard_reject_reason,
    )

