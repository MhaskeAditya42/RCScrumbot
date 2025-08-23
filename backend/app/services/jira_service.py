import os
import requests
from typing import List, Dict, Optional
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class JiraService:
    def __init__(self, token: str = None):
        """
        JiraService can authenticate with either:
        - OAuth Bearer token (if token is provided), OR
        - Basic Auth using JIRA_EMAIL + JIRA_API_TOKEN from .env
        """
        self.base = os.getenv("JIRA_SITE") or os.getenv("JIRA_BASE_URL")
        if not self.base:
            raise ValueError("JIRA_SITE or JIRA_BASE_URL must be set in environment")
        self.base = self.base.rstrip("/")

        self.project_key = os.getenv("JIRA_PROJECT_KEY")
        if not self.project_key:
            raise ValueError("JIRA_PROJECT_KEY must be set in environment")

        self.use_bearer = bool(token)
        if self.use_bearer:
            # OAuth Bearer token
            self.auth_header = {
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            self.auth = None
        else:
            # Basic auth from environment
            email = os.getenv("JIRA_EMAIL")
            api_token = os.getenv("JIRA_API_TOKEN")
            if not email or not api_token:
                raise ValueError("Missing JIRA_EMAIL or JIRA_API_TOKEN in environment")
            self.auth = HTTPBasicAuth(email, api_token)
            self.auth_header = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }

    # ---------- ADF helpers ----------
    def _adf_paragraph(self, text: str) -> Dict:
        return {
            "type": "paragraph",
            "content": [{"type": "text", "text": text}] if text else [],
        }

    def _adf_bullet_list(self, items: List[str]) -> Dict:
        return {
            "type": "bulletList",
            "content": [
                {"type": "listItem", "content": [self._adf_paragraph(i)]}
                for i in items if i.strip()
            ],
        }

    def _adf_from_text(self, text: str) -> Dict:
        lines = [l.rstrip() for l in (text or "").split("\n")]
        content: List[Dict] = []
        bucket: List[str] = []

        def flush_bucket():
            if bucket:
                content.append(self._adf_bullet_list(bucket.copy()))
                bucket.clear()

        for line in lines:
            if line.strip().startswith("- "):
                bucket.append(line.strip()[2:].strip())
            elif line.strip() == "":
                flush_bucket()
                content.append(self._adf_paragraph(""))
            else:
                flush_bucket()
                content.append(self._adf_paragraph(line))

        flush_bucket()
        return {"type": "doc", "version": 1, "content": content or [self._adf_paragraph("")]}

    # ---------- Core helpers ----------
    def _raise_for_jira(self, r: requests.Response):
        try:
            r.raise_for_status()
        except requests.HTTPError:
            try:
                payload = r.json()
            except Exception:
                payload = {"raw": r.text}

            msgs = []
            if isinstance(payload, dict):
                if payload.get("errorMessages"):
                    msgs.extend(payload["errorMessages"])
                if payload.get("errors"):
                    msgs.extend([f"{k}: {v}" for k, v in payload["errors"].items()])

            detail = "; ".join(msgs) if msgs else str(payload)
            raise requests.HTTPError(f"Jira API error {r.status_code}: {detail}")

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = f"{self.base}/rest/api/3/{path.lstrip('/')}"
        if self.use_bearer:
            headers = {**self.auth_header, **kwargs.pop("headers", {})}
            r = requests.request(method, url, headers=headers, **kwargs)
        else:
            r = requests.request(
                method, url, headers=self.auth_header, auth=self.auth, **kwargs
            )
        return r

    # ---------- API wrappers ----------
    def search(self, jql: str, fields: Optional[List[str]] = None, max_results: int = 50) -> Dict:
        params = {"jql": jql, "maxResults": max_results}
        if fields:
            params["fields"] = ",".join(fields)
        r = self._request("GET", "search", params=params, timeout=30)
        self._raise_for_jira(r)
        return r.json()

    def create_issue(self, summary: str, description: str, issue_type: str = "Story", project_key: Optional[str] = None) -> Dict:
        adf_description = self._adf_from_text(description)
        payload = {
            "fields": {
                "project": {"key": project_key or self.project_key},
                "summary": summary,
                "description": adf_description,
                "issuetype": {"name": issue_type},
            }
        }
        r = self._request("POST", "issue", json=payload, timeout=30)
        self._raise_for_jira(r)
        return r.json()

    def update_issue(self, issue_key: str, fields: Dict) -> Dict:
        if "description" in fields and isinstance(fields["description"], str):
            fields["description"] = self._adf_from_text(fields["description"])
        payload = {"fields": fields}
        r = self._request("PUT", f"issue/{issue_key}", json=payload, timeout=30)
        self._raise_for_jira(r)
        return {"updated": True}


    def fetch_backlog(self, jql_filter: Optional[str] = None) -> List[Dict]:
        jql = (
            jql_filter
            or f'project = {self.project_key} AND statusCategory != Done ORDER BY priority DESC, created DESC'
        )
        data = self.search(jql, fields=["summary", "description", "priority", "labels"])
        issues = data.get("issues", [])
        items = []
        for i in issues:
            f = i.get("fields", {}) or {}
            items.append(
                {
                    "key": i.get("key"),
                    "summary": f.get("summary"),
                    "description": f.get("description"),
                    "priority": (f.get("priority") or {}).get("name"),
                    "labels": f.get("labels") or [],
                }
            )
        return items
    
    def get_issue(self, issue_key: str, fields: Optional[List[str]] = None) -> Dict:
        params = {}
        if fields:
            params["fields"] = ",".join(fields)
        r = self._request("GET", f"issue/{issue_key}", params=params, timeout=30)
        self._raise_for_jira(r)
        return r.json()

    # ---- ADF (Atlassian) -> plain text (simple)
    def _adf_to_text(self, adf: Dict) -> str:
        if not isinstance(adf, dict):
            return str(adf) if adf is not None else ""

        result = []

        def walk(node):
            if not isinstance(node, dict):
                return
            t = node.get("type")
            if t == "text":
                result.append(node.get("text", ""))
            elif t in ("paragraph", "listItem"):
                for c in node.get("content", []) or []:
                    walk(c)
                if t == "paragraph":
                    result.append("\n")
            elif t in ("bulletList", "orderedList", "doc"):
                for c in node.get("content", []) or []:
                    walk(c)
            else:
                for c in node.get("content", []) or []:
                    walk(c)

        walk(adf)
        text = "".join(result)
        # normalize blank lines
        lines = [l.rstrip() for l in text.splitlines()]
        return "\n".join(lines).strip()

