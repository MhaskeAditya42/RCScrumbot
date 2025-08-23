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
from dotenv import load_dotenv

app = FastAPI(title="Scrumbot AI Assistant (Jira + Gemini)")

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

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
    access_token = os.getenv("ACCESS_TOKEN")
    url = "https://api.atlassian.com/oauth/token/accessible-resources"
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {access_token}"}
    )
    return response.json()

@app.get("/jira-projects")
def get_jira_projects():
    access_token = os.getenv("ACCESS_TOKEN") 
    cloud_id = "12bac46e-2b20-4cae-a20f-54c458023224"
    url = f"https://api.atlassian.com/ex/jira/{cloud_id}/rest/api/3/project"
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"}
    )
    return response.json()


def root():
    return {"message": "Scrumbot backend is running 🚀"}
