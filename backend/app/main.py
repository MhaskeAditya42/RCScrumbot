from fastapi import FastAPI
from app.routes.story_analyzer import router as story_router
from app.routes.backlog_grooming import router as grooming_router
from app.routes.estimation import router as estimation_router
from app.routes.prioritization import router as prioritization_router
from app.routes.retrospective import router as retro_router

app = FastAPI(title="Scrumbot AI Assistant (Jira + Gemini)")

app.include_router(story_router, prefix="/story-analyzer", tags=["Story Analyzer"])
app.include_router(grooming_router, prefix="/backlog-grooming", tags=["Backlog Grooming"])
app.include_router(estimation_router, prefix="/estimation", tags=["Estimation"])
app.include_router(prioritization_router, prefix="/prioritization", tags=["Prioritization"])
app.include_router(retro_router, prefix="/retrospective", tags=["Retrospective"])

@app.get("/")
def root():
    return {"message": "Scrumbot backend is running 🚀"}
