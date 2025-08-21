import requests
from typing import List, Dict, Optional
from app.config import settings
from requests.auth import HTTPBasicAuth

class JiraService:
    def __init__(self):
        self.base = settings.JIRA_BASE_URL.rstrip("/")
        self.auth = HTTPBasicAuth(settings.JIRA_EMAIL, settings.JIRA_API_TOKEN)
        self.headers = {"Accept": "application/json", "Content-Type": "application/json"}
        self.project_key = settings.JIRA_PROJECT_KEY

    # ---- Core helpers ----
    def search(self, jql: str, fields: Optional[List[str]] = None, max_results: int = 50) -> Dict:
        url = f"{self.base}/rest/api/3/search"
        params = {"jql": jql, "maxResults": max_results}
        if fields:
            params["fields"] = ",".join(fields)
        r = requests.get(url, headers=self.headers, auth=self.auth, params=params, timeout=30)
        r.raise_for_status()
        return r.json()

    def create_issue(self, summary: str, description: str, issue_type: str = "Story") -> Dict:
        url = f"{self.base}/rest/api/3/issue"
        payload = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": summary,
                "description": description,
                "issuetype": {"name": issue_type}
            }
        }
        r = requests.post(url, headers=self.headers, auth=self.auth, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()

    def update_issue(self, issue_key: str, fields: Dict) -> Dict:
        url = f"{self.base}/rest/api/3/issue/{issue_key}"
        payload = {"fields": fields}
        r = requests.put(url, headers=self.headers, auth=self.auth, json=payload, timeout=30)
        r.raise_for_status()
        return {"updated": True}

    # ---- Convenience wrappers for this app ----
    def fetch_backlog(self, board_id: Optional[int] = None, jql_filter: Optional[str] = None) -> List[Dict]:
        """
        If you know your board backlog JQL, pass it; otherwise fallback to project backlog-like JQL.
        """
        jql = jql_filter or f'project = {self.project_key} AND statusCategory != Done ORDER BY priority DESC, created DESC'
        data = self.search(jql, fields=["summary", "description", "priority", "labels"])
        issues = data.get("issues", [])
        items = []
        for i in issues:
            fields = i.get("fields", {})
            items.append({
                "key": i.get("key"),
                "summary": fields.get("summary"),
                "description": fields.get("description"),
                "priority": (fields.get("priority") or {}).get("name"),
                "labels": fields.get("labels") or []
            })
        return items
