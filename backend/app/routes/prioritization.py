from fastapi import APIRouter, Depends
from app.models.prioritization import PrioritizationRequest, PrioritizationResponse
from app.services.jira_service import JiraService  # import your Jira service

router = APIRouter()

@router.get("/tasks")
def fetch_tasks():
    """
    Fetch backlog tasks from Jira and return minimal info for prioritization.
    """
    jira = JiraService()
    backlog_items = jira.fetch_backlog()

    # Pre-fill with default values (0) so frontend can adjust
    tasks = []
    for item in backlog_items:
        tasks.append({
            "title": f"{item['key']} - {item['summary']}",
            "value": 0,
            "time_criticality": 0,
            "risk_reduction": 0,
            "effort": 1,   # default to 1 to avoid divide by zero
        })
    return {"tasks": tasks}


@router.post("/", response_model=PrioritizationResponse)
def prioritize(req: PrioritizationRequest):
    """
    Deterministic WSJF (Scaled Agile): (BV + TC + RR) / JobSize.
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
