from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.story_model import StoryRequest, StoryResponse
from app.services.gemini_service import GeminiService
from app.services.jira_service import JiraService
from app.services.auth_service import get_jira_token

router = APIRouter()
gemini = GeminiService()

@router.post("/", response_model=StoryResponse)
def story_analyzer(req: StoryRequest, request: Request):
    """
    Generates a Jira-style user story from a task/requirement.
    Optionally creates it as a Story in Jira when create_in_jira=True.
    """
    prompt = (
        "Create a Jira user story and acceptance criteria based on the following task:\n"
        f"Task: {req.task}\n\n"
        "Format JSON strictly as:\n"
        '{"user_story":"...", "acceptance_criteria":["...","..."]}'
    )

    schema_hint = '{"user_story":"string","acceptance_criteria":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        # Fallback if Gemini fails
        user_story = f"User story for task: {req.task}"
        acceptance = []
    else:
        user_story = data.get("user_story") or f"User story for task: {req.task}"
        acceptance = data.get("acceptance_criteria", [])

    issue_key = None
    if req.create_in_jira:
        description = user_story + "\n\nAcceptance Criteria:\n- " + "\n- ".join(acceptance) if acceptance else user_story
        try:
            # Initialize JiraService without token to force Basic Auth
            jira = JiraService()
            created = jira.create_issue(
                summary=user_story,
                description=description,
                issue_type="Story"
            )
            issue_key = created.get("key")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Jira create failed: {str(e)}")

    return StoryResponse(
        user_story=user_story,
        acceptance_criteria=acceptance,
        jira_issue_key=issue_key
    )