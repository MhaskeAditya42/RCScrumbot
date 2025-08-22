import os
from fastapi import HTTPException

def get_jira_token():
    """
    Fetches JIRA_API_TOKEN from environment for Basic Auth.
    Raises an error if the token is missing.
    """
    token = os.getenv("JIRA_API_TOKEN")
    if not token:
        raise HTTPException(status_code=401, detail="Jira API token missing in environment")
    return token