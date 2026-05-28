from typing import Literal

from pydantic import BaseModel, Field


class AudioResult(BaseModel):
    transcript: str
    toxicity: float
    bad_words_found: bool
    audio_score: float


class VisualResult(BaseModel):
    visual_score: float
    nsfw_rms: float
    nsfw_hard_detected: bool
    ocr_bad_words_found: bool
    educational_probability: float
    flags: list[str]


class ModerationResult(BaseModel):
    status: Literal["ALLOW", "REVIEW", "REJECT"]
    final_score: float
    audio_score: float
    visual_score: float
    nsfw_hard_detected: bool
    toxicity: float
    educational_probability: float
    transcript: str
    ocr_bad_words_found: bool
    bad_words_found: bool
    flags: list[str] = Field(default_factory=list)
    hard_reject_reason: str | None = None

