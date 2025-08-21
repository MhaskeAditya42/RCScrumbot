from pydantic import BaseModel
from typing import List, Optional

class GroomingRequest(BaseModel):
    jql_filter: Optional[str] = None
    items: Optional[List[str]] = None  # fallback if not pulling from Jira

class GroomingResponse(BaseModel):
    refined_backlog: list  # list of dicts {item, category, notes?}
    duplicates: list       # list of pairs or keys
    dependencies: list     # textual dependency hints

