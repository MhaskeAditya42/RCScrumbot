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
        "You are an experienced Scrum coach facilitating a retrospective. Analyze the sprint notes, which include daily scrum transcripts with mixed positive and negative feedback.\n"
        "Provide a balanced summary, highlight what went well (positives), areas for improvement (challenges), 3-5 concrete action items to address issues, and 3-5 coaching nuggets (short, insightful tips for better Scrum practices).\n"
        "Return JSON strictly as: {\"summary\":\"string\",\"positives\":[\"string\"],\"challenges\":[\"string\"],\"action_items\":[\"string\"],\"coaching_nuggets\":[\"string\"]}\n\n"
        f"Notes:\n{bullets}"
    )
    schema_hint = '{"summary":"string","positives":["string"],"challenges":["string"],"action_items":["string"],"coaching_nuggets":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        data = {"summary": "Summary unavailable (fallback).", "positives": [], "challenges": [], "action_items": [], "coaching_nuggets": []}

    return RetrospectiveResponse(**data)