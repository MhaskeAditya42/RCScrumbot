from typing import Optional
from fastapi import APIRouter, HTTPException
from app.models.estimation import EstimationRequest, EstimationResponse
from app.services.gemini_service import GeminiService
from app.services.jira_service import JiraService  # ensure import path

router = APIRouter()
gemini = GeminiService()

@router.get("/tasks")
def list_tasks(jql_filter: Optional[str] = None):
    """
    Returns current project tasks for a dropdown.
    """
    try:
        jira = JiraService()
        items = jira.fetch_backlog(jql_filter)
        # Keep it lightweight for dropdown
        return [
            {
                "key": it["key"],
                "summary": it["summary"],
                "priority": it.get("priority"),
                "labels": it.get("labels", []),
            }
            for it in items
            if it.get("key") and it.get("summary")
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=EstimationResponse)
def estimation(req: EstimationRequest):
    """
    Produces a story point estimate with confidence and short rationale.
    Accepts either raw story_text or a Jira issue_key.
    """
    story_text = req.story_text

    # If issue_key is provided, fetch text from Jira
    if req.issue_key:
        jira = JiraService()
        issue = jira.get_issue(req.issue_key, fields=["summary", "description"])
        fields = issue.get("fields", {}) or {}
        summary = fields.get("summary") or ""
        description = fields.get("description")
        # Convert ADF description (if present) to text
        if isinstance(description, dict):
            description_text = jira._adf_to_text(description)
        else:
            description_text = description or ""
        story_text = (summary + "\n\n" + description_text).strip()

    prompt = (
        "Estimate story points for the user story below using Fibonacci scale (1,2,3,5,8,13,21).\n"
        "Consider complexity, risk, and unknowns. Respond in strict JSON as:\n"
        '{"story_points": int, "confidence":"low|medium|high", "rationale":"string"}\n\n'
        f"Story:\n{story_text}"
    )
    schema_hint = '{"story_points":5,"confidence":"high","rationale":"string"}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        data = {"story_points": 5, "confidence": "medium", "rationale": "Default fallback."}

    return EstimationResponse(estimate=data)
