from fastapi import APIRouter
from app.models.estimation import EstimationRequest, EstimationResponse
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini = GeminiService()

@router.post("/", response_model=EstimationResponse)
def estimation(req: EstimationRequest):
    """
    Produces a story point estimate with confidence and short rationale.
    You can later bias with your team's historical sizing.
    """
    prompt = (
        "Estimate story points for the user story below using Fibonacci scale (1,2,3,5,8,13,21).\n"
        "Consider complexity, risk, and unknowns. Respond in strict JSON as:\n"
        '{"story_points": int, "confidence":"low|medium|high", "rationale":"string"}\n\n'
        f"Story:\n{req.story_text}"
    )
    schema_hint = '{"story_points":5,"confidence":"high","rationale":"string"}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        data = {"story_points": 5, "confidence": "medium", "rationale": "Default fallback."}

    return EstimationResponse(estimate=data)
