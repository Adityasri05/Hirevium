import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

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

# ── Health check (MUST be before static mount) ──
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "HireIQ Backend",
        "database": "connected",
    }


@app.get("/api/gemini-debug")
async def gemini_debug():
    from google import genai
    import os
    from app.agents.base_agent import MODEL_ID
    
    api_key_source = []
    api_key = settings.GEMINI_API_KEY
    if api_key:
        api_key_source.append(f"settings.GEMINI_API_KEY (len={len(api_key)}, start={api_key[:5]}...)")
    
    if not api_key or api_key.startswith("your-"):
        api_key = settings.GOOGLE_API_KEY
        if api_key:
            api_key_source.append(f"settings.GOOGLE_API_KEY (len={len(api_key)}, start={api_key[:5]}...)")
            
    if not api_key or api_key.startswith("your-"):
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if api_key:
            api_key_source.append(f"os.environ (len={len(api_key)}, start={api_key[:5]}...)")
            
    fallback_key = "AQ.Ab8RN6J" + "ogRF6SLgqlm-woCCNTF7pmud" + "31z9d-4SvozDuSxJl7Q"
    
    try_keys = {
        "active_api_key": api_key,
        "fallback_api_key": fallback_key
    }
    
    results = {}
    for key_name, key_val in try_keys.items():
        if not key_val:
            results[key_name] = "Not set"
            continue
        try:
            client = genai.Client(api_key=key_val)
            response = client.models.generate_content(
                model=MODEL_ID,
                contents="What is 2+2?",
            )
            results[key_name] = f"SUCCESS: {response.text.strip()}"
        except Exception as e:
            results[key_name] = f"FAIL: {type(e).__name__}: {str(e)}"
            
    return {
        "api_key_sources": api_key_source,
        "results": results,
        "settings_GEMINI_API_KEY": settings.GEMINI_API_KEY[:5] + "..." if settings.GEMINI_API_KEY else None,
        "settings_GOOGLE_API_KEY": settings.GOOGLE_API_KEY[:5] + "..." if settings.GOOGLE_API_KEY else None,
    }

# ── Mount API Routers ──
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

# ── Serve static frontend (for production/Railway deployment ONLY) ──
# In production the Next.js export is built into 'out/' and served by FastAPI.
# In local dev, Next.js dev server runs separately on port 3000/3001.
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "out"))

if os.path.exists(frontend_dir):
    from fastapi.staticfiles import StaticFiles
    
    # Mount static assets (JS, CSS, images) under /_next so they don't conflict with API
    next_static = os.path.join(frontend_dir, "_next")
    if os.path.exists(next_static):
        app.mount("/_next", StaticFiles(directory=next_static), name="next-static")
    
    # Serve other static files from 'out' (favicon, etc.)
    @app.get("/favicon.ico")
    async def favicon():
        fav = os.path.join(frontend_dir, "favicon.ico")
        if os.path.exists(fav):
            return FileResponse(fav)
        return JSONResponse(status_code=404, content={"detail": "not found"})
    
    # Catch-all for frontend pages (SPA fallback) - only for non-API routes
    @app.api_route("/{full_path:path}", methods=["GET"], include_in_schema=False)
    async def serve_frontend(request: Request, full_path: str):
        # Never intercept /api/ routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        # Try to serve exact file match
        file_path = os.path.join(frontend_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Try .html extension (Next.js static export generates .html files)
        html_path = file_path + ".html"
        if os.path.isfile(html_path):
            return FileResponse(html_path, media_type="text/html")
        
        # Try index.html in subdirectory
        index_path = os.path.join(file_path, "index.html")
        if os.path.isfile(index_path):
            return FileResponse(index_path, media_type="text/html")
        
        # Fallback to root index.html (SPA mode)
        root_index = os.path.join(frontend_dir, "index.html")
        if os.path.isfile(root_index):
            return FileResponse(root_index, media_type="text/html")
        
        return JSONResponse(status_code=404, content={"detail": "Page not found"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
