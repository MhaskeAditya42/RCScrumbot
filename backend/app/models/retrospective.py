from pydantic import BaseModel
from typing import List

class RetrospectiveRequest(BaseModel):
    sprint_notes: List[str]

class RetrospectiveResponse(BaseModel):
    summary: str
    risks: List[str]
    sprint_notes: List[str]
    anti_patterns: List[str]
    coaching_nugget: str
