from pydantic import BaseModel

class EstimationRequest(BaseModel):
    story_text: str

class EstimationResponse(BaseModel):
    estimate: dict  # {"story_points": int, "confidence": "low|medium|high", "rationale": str}
