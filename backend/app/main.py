from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.story_analyzer import router as story_router
from app.routes.backlog_grooming import router as grooming_router
from app.routes.estimation import router as estimation_router
from app.routes.prioritization import router as prioritization_router
from app.routes.retrospective import router as retro_router
from fastapi import Request
import requests
import os

app = FastAPI(title="Scrumbot AI Assistant (Jira + Gemini)")

CLIENT_ID = "onrggpjobrDq5uF2gtQt4xPncWjfWAhg"
CLIENT_SECRET = "ATOADlOTRSW-kdOq14VumR81XWEpuPJPgn3JoInsHUzAtOv3Tc-wksnt2iF__aopX6nQB85A8416"
REDIRECT_URI = "http://localhost:8000/oauth/callback"

origins = [
    "http://localhost:5173",   # Vite dev
    "http://127.0.0.1:5173",   # Sometimes Vite uses 127.0.0.1
    "http://localhost:3000",   # If you ever switch
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],         # allow all methods (GET, POST, etc.)
    allow_headers=["*"],         # allow all headers
)

app.include_router(story_router, prefix="/story-analyzer", tags=["Story Analyzer"])
app.include_router(grooming_router, prefix="/backlog-grooming", tags=["Backlog Grooming"])
app.include_router(estimation_router, prefix="/estimation", tags=["Estimation"])
app.include_router(prioritization_router, prefix="/prioritization", tags=["Prioritization"])
app.include_router(retro_router, prefix="/retrospective", tags=["Retrospective"])

@app.get("/")

@app.get("/oauth/callback")
def oauth_callback(request: Request, code: str, state: str):
    """
    This will be called by Atlassian after user consents.
    Exchange the code for an access token.
    """
    token_url = "https://auth.atlassian.com/oauth/token"
    response = requests.post(
        token_url,
        json={
            "grant_type": "authorization_code",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "redirect_uri": REDIRECT_URI,
        },
        headers={"Content-Type": "application/json"},
    )

    token_data = response.json()
    return token_data

@app.get("/get-cloud-id")
def get_cloud_id():
    access_token = "eyJraWQiOiJhdXRoLmF0bGFzc2lhbi5jb20tQUNDRVNTLTk0ZTczYTkwLTUxYWQtNGFjMS1hOWFjLWU4NGUwNDVjNDU3ZCIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiJjZmIzZjEwYi1mY2MyLTQyZWItODY1NS1jZWRlYTRkYzJmM2YiLCJzdWIiOiI3MTIwMjA6Zjg5YWJmN2YtYWE5Yy00MTAxLWEyYjYtMjY4MmZlMWUzMjI2IiwibmJmIjoxNzU1ODQzNjA0LCJpc3MiOiJodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbSIsImlhdCI6MTc1NTg0MzYwNCwiZXhwIjoxNzU1ODQ3MjA0LCJhdWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiYjgzOThjMTMtNTJmZi00ODVhLWFiZDUtMTQwZDVjN2RhZDA0IiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL29hdXRoQ2xpZW50SWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9hdXRoUHJvZmlsZSI6Im9hdXRoLmVjb3N5c3RlbS5vYXV0aEludGVncmF0aW9uIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3VqdCI6Ijc5NTUzMTNlLWQxODMtNDY2YS1iYzg4LTRkYWZjYmQ4ZTk2OCIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudElkIjoiNzEyMDIwOjZmZTg4OTY5LTdjNzAtNDJhZS1iNDczLTIwYjMyZGRmNjM4YyIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wcm9jZXNzUmVnaW9uIjoidXMtZWFzdC0xIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbCI6IjQwZWU2MWM3LTlkM2UtNDcyNi1iZjQzLTU4ZGNkM2JkMmMxNUBjb25uZWN0LmF0bGFzc2lhbi5jb20iLCJjbGllbnRfaWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsInNjb3BlIjoibWFuYWdlOmppcmEtcHJvamVjdCByZWFkOmppcmEtd29yayIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6dHJ1ZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSJ9.d0iSEWFMCtV3dwqF29x8gjEHE7SNnnYWl8ooExdkfMI2TYHWWYexRXhCelwRuFFXSnOuz5oF1Rjn1lB-B3XkXTXm-0Qqc_OuNrlC067d-SgOQ_TomCA0LVCKIYdXaXUuhaN8_5SUAEgRND3xUOJ6S4YtQ7ARyofonIU3AsfBiiwyeQPLZz5Fw4Q4HYNefORYFFfrneVxZ_JzIHD6GZaocNZNOJen9xaN9DNYiLLsEoKSFh2D7l6GqD3zlMxccATRjfbVRBUIqPAY4ypKlXgZ56D67fzxQ5x6ga0tMzM630LT9vJWKmMKd6UQ5GoWCgr6hfh8g0shuG8_9cXdhkfnuw"
    url = "https://api.atlassian.com/oauth/token/accessible-resources"
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    return response.json()

@app.get("/jira-projects")
def get_jira_projects():
    access_token = "eyJraWQiOiJhdXRoLmF0bGFzc2lhbi5jb20tQUNDRVNTLTk0ZTczYTkwLTUxYWQtNGFjMS1hOWFjLWU4NGUwNDVjNDU3ZCIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiJjZmIzZjEwYi1mY2MyLTQyZWItODY1NS1jZWRlYTRkYzJmM2YiLCJzdWIiOiI3MTIwMjA6Zjg5YWJmN2YtYWE5Yy00MTAxLWEyYjYtMjY4MmZlMWUzMjI2IiwibmJmIjoxNzU1ODQzNjA0LCJpc3MiOiJodHRwczovL2F1dGguYXRsYXNzaWFuLmNvbSIsImlhdCI6MTc1NTg0MzYwNCwiZXhwIjoxNzU1ODQ3MjA0LCJhdWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiYjgzOThjMTMtNTJmZi00ODVhLWFiZDUtMTQwZDVjN2RhZDA0IiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL29hdXRoQ2xpZW50SWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9hdXRoUHJvZmlsZSI6Im9hdXRoLmVjb3N5c3RlbS5vYXV0aEludGVncmF0aW9uIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3VqdCI6Ijc5NTUzMTNlLWQxODMtNDY2YS1iYzg4LTRkYWZjYmQ4ZTk2OCIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3ZlcmlmaWVkIjp0cnVlLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudElkIjoiNzEyMDIwOjZmZTg4OTY5LTdjNzAtNDJhZS1iNDczLTIwYjMyZGRmNjM4YyIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wcm9jZXNzUmVnaW9uIjoidXMtZWFzdC0xIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbCI6IjQwZWU2MWM3LTlkM2UtNDcyNi1iZjQzLTU4ZGNkM2JkMmMxNUBjb25uZWN0LmF0bGFzc2lhbi5jb20iLCJjbGllbnRfaWQiOiJvbnJnZ3Bqb2JyRHE1dUYyZ3RRdDR4UG5jV2pmV0FoZyIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9lbWFpbERvbWFpbiI6ImdtYWlsLmNvbSIsInNjb3BlIjoibWFuYWdlOmppcmEtcHJvamVjdCByZWFkOmppcmEtd29yayIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS92ZXJpZmllZCI6dHJ1ZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSJ9.d0iSEWFMCtV3dwqF29x8gjEHE7SNnnYWl8ooExdkfMI2TYHWWYexRXhCelwRuFFXSnOuz5oF1Rjn1lB-B3XkXTXm-0Qqc_OuNrlC067d-SgOQ_TomCA0LVCKIYdXaXUuhaN8_5SUAEgRND3xUOJ6S4YtQ7ARyofonIU3AsfBiiwyeQPLZz5Fw4Q4HYNefORYFFfrneVxZ_JzIHD6GZaocNZNOJen9xaN9DNYiLLsEoKSFh2D7l6GqD3zlMxccATRjfbVRBUIqPAY4ypKlXgZ56D67fzxQ5x6ga0tMzM630LT9vJWKmMKd6UQ5GoWCgr6hfh8g0shuG8_9cXdhkfnuw"
    cloud_id = "12bac46e-2b20-4cae-a20f-54c458023224"

    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project"
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    )
    return response.json()


def root():
    return {"message": "Scrumbot backend is running 🚀"}
