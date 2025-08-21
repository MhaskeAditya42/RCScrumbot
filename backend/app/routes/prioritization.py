from fastapi import APIRouter
from app.models.prioritization import PrioritizationRequest, PrioritizationResponse

router = APIRouter()

@router.post("/", response_model=PrioritizationResponse)
def prioritize(req: PrioritizationRequest):
    """
    Deterministic WSJF (Scaled Agile): (BV + TC + RR) / JobSize.
    Items with higher WSJF rank first. No LLM needed here.
    """
    scored = []
    for it in req.items:
        numerator = it.value + it.time_criticality + it.risk_reduction
        job_size = max(1, it.effort)
        wsjf = round(numerator / job_size, 3)
        scored.append({"title": it.title, "wsjf": wsjf})

    scored.sort(key=lambda x: x["wsjf"], reverse=True)
    return PrioritizationResponse(
        prioritized_items=[s["title"] for s in scored],
        scores=scored
    )
