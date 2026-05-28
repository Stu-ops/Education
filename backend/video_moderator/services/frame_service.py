from pathlib import Path

from video_moderator.config import settings
from video_moderator.services.clip_service import educational_probability
from video_moderator.services.nsfw_service import score_frames
from video_moderator.services.ocr_service import extract_text_from_frames
from video_moderator.services.text_moderation import keyword_scan
from video_moderator.utils.logger import logger


def _build_visual_score(nsfw: dict, ocr_bad_words: bool, edu_prob: float) -> tuple[float, list[str]]:
    flags: list[str] = []
    visual_score = (nsfw["rms_score"] * 0.55 + nsfw["wilson_bad_ratio"] * 0.45) * 100

    if ocr_bad_words:
        if nsfw["rms_score"] >= settings.OCR_CORROBORATION_THRESHOLD:
            visual_score += 10.0
            flags.append("ocr_corroborates_visual")
        else:
            flags.append("ocr_bad_words_in_clean_video")

    if edu_prob >= settings.EDU_HIGH:
        flags.append("educational_context")
    elif edu_prob <= settings.EDU_LOW:
        if nsfw["rms_score"] > 0.30:
            flags.append("non_educational_with_elevated_nsfw")
        else:
            flags.append("non_educational_content_clean")

    visual_score = round(min(100.0, max(0.0, visual_score)), 2)
    logger.info(
        "Visual score=%s flags=%s rms=%.3f wilson=%.3f ocr_bad=%s edu=%.3f",
        visual_score,
        flags,
        nsfw["rms_score"],
        nsfw["wilson_bad_ratio"],
        ocr_bad_words,
        edu_prob,
    )
    return visual_score, flags


def analyze_frames(frame_dir: Path) -> dict:
    nsfw = score_frames(frame_dir)
    ocr_text = extract_text_from_frames(frame_dir)
    ocr_bad_words = keyword_scan(ocr_text)
    edu_prob = educational_probability(frame_dir)
    visual_score, flags = _build_visual_score(nsfw, ocr_bad_words, edu_prob)

    return {
        "visual_score": visual_score,
        "nsfw_rms": nsfw["rms_score"],
        "nsfw_hard_detected": nsfw["hard_detected"],
        "ocr_bad_words_found": ocr_bad_words,
        "educational_probability": edu_prob,
        "flags": flags,
    }

