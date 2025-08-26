from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.retrospective import RetrospectiveResponse
from app.services.gemini_service import GeminiService

router = APIRouter()
gemini = GeminiService()

@router.post("/", response_model=RetrospectiveResponse)
async def retrospective(file: UploadFile = File(...)):
    """
    Analyze retrospective transcript file and extract insights including risks,
    sprint notes, coaching nuggets, and detected Agile/Scrum anti-patterns.
    """
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")

    content = await file.read()
    transcript = content.decode("utf-8")

    prompt = (
        "You are an experienced Scrum coach analyzing a sprint retrospective transcript.\n"
        "The transcript may contain positive/negative feedback, discussions, and notes.\n"
        "Extract insights and return STRICT JSON with these fields:\n"
        "{"
        "\"summary\":\"string\","
        "\"risks\":[\"string\"],"
        "\"sprint_notes\":[\"string\"],"
        "\"anti_patterns\":[\"string\"],"
        "\"coaching_nugget\":\"string\""
        "}\n\n"
        f"Transcript:\n{transcript}"
    )

    schema_hint = (
        '{"summary":"string",'
        '"risks":["string"],'
        '"sprint_notes":["string"],'
        '"anti_patterns":["string"],'
        '"coaching_nugget":"string"}'
    )

    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        data = {
            "summary": "Summary unavailable (fallback).",
            "risks": [],
            "sprint_notes": [],
            "anti_patterns": [],
            "coaching_nugget": "Keep iterating and improving continuously!"
        }

    return RetrospectiveResponse(**data)
