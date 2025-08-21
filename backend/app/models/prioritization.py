from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    title: str
    value: int   # business value 1-10
    time_criticality: int = 5
    risk_reduction: int = 5
    effort: int = 5  # 1-10 (proxy for job size)

class PrioritizationRequest(BaseModel):
    items: List[Item]

class PrioritizationResponse(BaseModel):
    prioritized_items: list  # list of titles ordered
    scores: list             # list of {title, wsjf}
