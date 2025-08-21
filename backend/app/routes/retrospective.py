from fastapi import APIRouter
from app.models.retrospective import RetrospectiveRequest, RetrospectiveResponse
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini = GeminiService()

@router.post("/", response_model=RetrospectiveResponse)
def retrospective(req: RetrospectiveRequest):
    """
    Summarize sprint notes and propose actionable improvements.
    """
    bullets = "\n".join(f"- {n}" for n in req.sprint_notes)
    prompt = (
        "You are facilitating a Scrum retrospective. Summarize the notes and propose 3-5 concrete action items.\n"
        "Return JSON strictly as: {\"summary\":\"string\",\"action_items\":[\"string\"]}\n\n"
        f"Notes:\n{bullets}"
    )
    schema_hint = '{"summary":"string","action_items":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        data = {"summary": "Summary unavailable (fallback).", "action_items": []}

    return RetrospectiveResponse(**data)
