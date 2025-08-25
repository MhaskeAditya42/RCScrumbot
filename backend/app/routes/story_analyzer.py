from fastapi import APIRouter, HTTPException, Request, Query
from app.models.story_model import StoryRequest, StoryResponse
from app.services.gemini_service import GeminiService
from app.services.jira_service import JiraService

router = APIRouter()
gemini = GeminiService()

@router.get("/backlog")
def fetch_backlog(projectKey: str = Query(None, description="Jira project key (optional)")):
    try:
        jira = JiraService()
        if projectKey:
            jql = f'project={projectKey} AND statusCategory != Done ORDER BY priority DESC, created DESC'
            issues = jira.fetch_backlog(jql_filter=jql)
        else:
            issues = jira.fetch_backlog()
        return issues
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backlog: {str(e)}")

@router.post("/", response_model=StoryResponse)
def story_analyzer(req: StoryRequest, request: Request):
    """
    Generates or updates a Jira user story.
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
        user_story = f"User story for task: {req.task}"
        acceptance = []
    else:
        user_story = data.get("user_story", f"User story for task: {req.task}")
        acceptance = data.get("acceptance_criteria", [])

    jira_issue_key = None

    if req.create_in_jira:
        try:
            jira = JiraService()
            if req.issue_key:
                # Update existing issue in Jira
                jira.update_issue(
                    issue_key=req.issue_key,
                    fields={
                        "summary": user_story,
                        "description": "\n".join(acceptance)
                    }
                )
                jira_issue_key = req.issue_key
            else:
                # Create a new issue in Jira
                new_issue = jira.create_issue(
                    project_key="SCRUM",
                    summary=user_story,
                    description="\n".join(acceptance),
                    issue_type="Task"
                )
                jira_issue_key = new_issue["key"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process Jira issue: {str(e)}")

    return StoryResponse(
        user_story=user_story,
        acceptance_criteria=acceptance,
        jira_issue_key=jira_issue_key
    )