from pydantic import BaseModel
from typing import List

class RetrospectiveRequest(BaseModel):
    sprint_notes: List[str]

class RetrospectiveResponse(BaseModel):
    summary: str
    action_items: List[str]
