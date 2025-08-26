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
            jql = f'''
                project = {projectKey}
                AND issuetype in (Task, Story)
                AND statusCategory != Done
                AND (labels IS EMPTY OR labels NOT IN ("INVEST_READY"))
                ORDER BY priority DESC, created DESC
            '''
            issues = jira.fetch_backlog(jql_filter=jql)
        else:
            jql = '''
                issuetype in (Task, Story)
                AND statusCategory != Done
                AND (labels IS EMPTY OR labels NOT IN ("INVEST_READY"))
                ORDER BY priority DESC, created DESC
            '''
            issues = jira.fetch_backlog(jql_filter=jql)
        return issues
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch backlog: {str(e)}")




@router.post("/", response_model=StoryResponse)
def story_analyzer(req: StoryRequest, request: Request):
    """
    Generates or updates a Jira user story with INVEST validation.
    Keeps the original task as the summary,
    and appends generated story/criteria/notes into description only.
    """
    prompt = (
        "You are an Agile Product Owner assistant. Generate a Jira user story "
        "and acceptance criteria that strictly follow INVEST principles:\n"
        "- Independent: story is self-contained\n"
        "- Negotiable: avoids prescribing exact implementation\n"
        "- Valuable: delivers clear value to the user\n"
        "- Estimable: clear enough to estimate effort\n"
        "- Small: can be completed within a sprint\n"
        "- Testable: has clear acceptance criteria\n\n"
        f"Task: {req.task}\n\n"
        "Also, validate clarity and completeness:\n"
        "- Identify any missing acceptance criteria.\n"
        "- Point out unclear requirements or assumptions.\n\n"
        "Return output in strict JSON format:\n"
        "{\n"
        '  "user_story": "As a [user], I want [goal] so that [value]",\n'
        '  "acceptance_criteria": ["Given ... When ... Then ...", "..."],\n'
        "}"
    )

    schema_hint = '{"user_story":"string","acceptance_criteria":["string"],"notes":["string"]}'
    data = gemini.gen_json(prompt, schema_hint)

    if "_error" in data:
        user_story = f"User story for task: {req.task}"
        acceptance = []
        notes = ["Failed to generate story. Please refine the task."]
    else:
        user_story = data.get("user_story", f"User story for task: {req.task}")
        acceptance = data.get("acceptance_criteria", [])
        notes = data.get("notes", [])

    jira_issue_key = None

    if req.create_in_jira:
        try:
            jira = JiraService()
            description_text = (
                f"Generated Story:\n{user_story}\n\n"
                f"Acceptance Criteria:\n" + "\n".join(acceptance) 
            )

            if req.issue_key:
                # Update existing issue → keep summary unchanged, update description only
                jira.update_issue(
                    issue_key=req.issue_key,
                    fields={
                        "description": description_text,
                        "labels": ["INVEST_READY"]
                    }
                )
                jira_issue_key = req.issue_key
            else:
                # Create a new issue → use frontend task as summary, story+criteria+notes as description
                new_issue = jira.create_issue(
                    project_key="SCRUM",
                    summary=req.task,  # ✅ keep the frontend input as summary
                    description=description_text,
                    issue_type="Task",
                    labels=["INVEST_READY"] 
                )
                jira_issue_key = new_issue["key"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process Jira issue: {str(e)}")

    return StoryResponse(
        user_story=user_story,
        acceptance_criteria=acceptance,
        jira_issue_key=jira_issue_key,
        notes=notes
    )
