from pydantic import BaseModel

class StoryRequest(BaseModel):
    role: str
    feature: str
    benefit: str
    create_in_jira: bool = False  # if true we will create a Story in Jira

class StoryResponse(BaseModel):
    user_story: str
    jira_issue_key: str | None = None
