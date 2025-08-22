from fastapi import APIRouter, HTTPException
from app.models.backlog import GroomingRequest, GroomingResponse
from app.services.gemini_service import GeminiService
from app.services.jira_service import JiraService

router = APIRouter()
gemini = GeminiService()
jira = JiraService()

@router.post("/", response_model=GroomingResponse)
def backlog_grooming(req: GroomingRequest):
    """
    Pulls backlog from Jira (or uses provided items), asks Gemini to:
    - categorize items (feature/bug/improvement)
    - detect duplicates
    - suggest dependencies or splits
    """
    try:
        if req.items:
            items = [{"summary": s} for s in req.items]
        else:
            items = jira.fetch_backlog(jql_filter=req.jql_filter)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Jira fetch failed: {e}")

    summaries = [i["summary"] for i in items if i.get("summary")]
    joined = "\n".join(f"- {s}" for s in summaries)

    prompt = (
        "You are assisting with backlog grooming. Given the backlog items below, do three things:\n"
        "1) Categorize each as feature/bug/improvement and add 1-line refinement note.\n"
        "2) Identify likely duplicates (return pairs by index).\n"
        "3) Suggest any dependencies as readable strings.\n\n"
        f"Backlog:\n{joined}\n\n"
        "Return ONLY strict JSON with fields: "
        '{"refined_backlog":[{"item":"string","category":"feature|bug|improvement","note":"string"}],'
        '"duplicates":[[int,int]], "dependencies":["string"]}'
    )
    schema_hint = '{"refined_backlog":[{"item":"string","category":"feature","note":"string"}],"duplicates":[[0,1]],"dependencies":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        # Minimal fallback
        refined = [{"item": s, "category": "feature", "note": ""} for s in summaries]
        return GroomingResponse(refined_backlog=refined, duplicates=[], dependencies=[])

    return GroomingResponse(
        refined_backlog=data.get("refined_backlog", []),
        duplicates=data.get("duplicates", []),
        dependencies=data.get("dependencies", []),
    )

