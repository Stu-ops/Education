from functools import lru_cache
from pathlib import Path

from video_moderator.utils.logger import logger

_EDUCATIONAL_PROMPTS = [
    "educational lecture",
    "classroom teaching",
    "whiteboard explanation",
    "science experiment",
    "academic presentation",
]

_REJECT_PROMPTS = [
    "pornographic content",
    "violent scene",
    "romantic intimate scene",
    "couple kissing or embracing",
    "sexual suggestive content",
    "gaming montage",
    "social media reel",
]

ALL_PROMPTS = _EDUCATIONAL_PROMPTS + _REJECT_PROMPTS


@lru_cache(maxsize=1)
def _load_clip():
    try:
        import clip
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model, preprocess = clip.load("ViT-B/32", device=device)
        logger.info("CLIP loaded on %s", device)
        return model, preprocess, device
    except Exception as exc:
        logger.warning("CLIP unavailable; educational scoring disabled. Reason: %s", exc)
        return None, None, None


def educational_probability(frame_dir: Path) -> float:
    model, preprocess, device = _load_clip()
    if model is None:
        return 0.5

    try:
        import clip
        import torch
        from PIL import Image

        frames = sorted(frame_dir.glob("*.jpg"))[:20]
        if not frames:
            return 0.5

        text_tokens = clip.tokenize(ALL_PROMPTS).to(device)
        edu_indices = list(range(len(_EDUCATIONAL_PROMPTS)))
        edu_probs: list[float] = []

        with torch.no_grad():
            text_features = model.encode_text(text_tokens)
            text_features /= text_features.norm(dim=-1, keepdim=True)

            for frame_path in frames:
                image = preprocess(Image.open(frame_path).convert("RGB")).unsqueeze(0).to(device)
                image_features = model.encode_image(image)
                image_features /= image_features.norm(dim=-1, keepdim=True)

                similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
                probs = similarity[0].cpu().tolist()
                edu_probs.append(sum(probs[index] for index in edu_indices))

        return round(sum(edu_probs) / len(edu_probs), 4)
    except Exception as exc:
        logger.warning("CLIP scoring failed: %s", exc)
        return 0.5
