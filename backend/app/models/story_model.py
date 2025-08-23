
from pydantic import BaseModel
from typing import List, Optional

class StoryRequest(BaseModel):
    task: str
    issue_key: Optional[str] = None 
    create_in_jira: bool = False
    

class StoryResponse(BaseModel):
    user_story: str
    acceptance_criteria: List[str] = []
    jira_issue_key: Optional[str] = None
