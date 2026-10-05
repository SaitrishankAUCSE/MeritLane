from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analytics

app = FastAPI(
    title="MeritLane Backend",
    description="Python Backend for MeritLane (FastAPI, Pandas, NumPy, Gemini)",
    version="1.0.0"
)

# Configure CORS for the Next.js React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://meritlane.com", "*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics.router)

@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "meritlane-python-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
