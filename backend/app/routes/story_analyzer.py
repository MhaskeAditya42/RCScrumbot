from fastapi import APIRouter, HTTPException
from app.models.story_model import StoryRequest, StoryResponse
from app.services.gemini_service import GeminiService
from app.services.jira_service import JiraService

router = APIRouter()
gemini = GeminiService()
jira = JiraService()

@router.post("/", response_model=StoryResponse)
def story_analyzer(req: StoryRequest):
    """
    Generates a Jira-style user story from role/feature/benefit.
    Optionally creates it as a Story in Jira when create_in_jira=True.
    """
    prompt = (
        "Create a descriptive Jira user story with acceptance criteria.\n"
        "Format JSON strictly as:\n"
        '{"user_story":"...", "acceptance_criteria":["...","..."]}\n\n'
        f"Role: {req.role}\n"
        f"Feature: {req.feature}\n"
        f"Benefit: {req.benefit}\n"
    )
    schema_hint = '{"user_story":"string","acceptance_criteria":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        # Fallback to simple text
        user_story = f"As a {req.role}, I want {req.feature} so that {req.benefit}."
        acceptance = []
    else:
        user_story = data.get("user_story") or f"As a {req.role}, I want {req.feature} so that {req.benefit}."
        acceptance = data.get("acceptance_criteria", [])

    issue_key = None
    if req.create_in_jira:
        description = user_story + "\n\nAcceptance Criteria:\n- " + "\n- ".join(acceptance) if acceptance else user_story
        try:
            created = jira.create_issue(summary=user_story, description=description, issue_type="Story")
            issue_key = created.get("key")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Jira create failed: {e}")

    return StoryResponse(user_story=user_story, jira_issue_key=issue_key)
