from typing import Optional, Dict
from pydantic import BaseModel, model_validator



class EstimationRequest(BaseModel):
    story_text: str | None = None
    issue_key: str | None = None

    @model_validator(mode="after")
    def check_either_story_or_issue(self):
        if not self.story_text and not self.issue_key:
            raise ValueError("Either story_text or issue_key must be provided")
        return self


class EstimationResponse(BaseModel):
    estimate: Dict  # {"story_points": int, "confidence": "low|medium|high", "rationale": str}
