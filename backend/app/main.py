import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routers import (
    auth,
    users,
    resumes,
    job_descriptions,
    interviews,
    scoring,
    analytics,
    career_coach,
    recruiter,
    copilot,
    gamification,
    realtime,
)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Initialize DB (create tables if they don't exist)
    await init_db()
    yield

app = FastAPI(
    title="HireIQ API",
    description="AI Hiring Intelligence Operating System Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resumes.router)
app.include_router(job_descriptions.router)
app.include_router(interviews.router)
app.include_router(scoring.router)
app.include_router(analytics.router)
app.include_router(career_coach.router)
app.include_router(recruiter.router)
app.include_router(copilot.router)
app.include_router(gamification.router)
app.include_router(realtime.router)

from fastapi.staticfiles import StaticFiles

# Serve static frontend files from 'out' folder if it exists
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "out"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "HireIQ Backend",
        "database": "connected",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
