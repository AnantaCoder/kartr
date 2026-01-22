"""
Kartr FastAPI Backend - Main Application Entry Point

This is the main FastAPI application that serves as the backend for the Kartr
influencer-sponsor platform. It provides RESTful APIs for:
- User authentication (login, register, password reset)
- YouTube analytics (video/channel stats, analysis)
- Search functionality
- Virtual influencer management
- Social media integration
- Image generation
- Visualization and RAG-based Q&A
"""
import logging
import os
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers.auth import router as auth_router
from routers.youtube import router as youtube_router
from routers.search import router as search_router
from routers.virtual_influencer import router as virtual_influencer_router
from routers.social_media import router as social_media_router
from routers.image_generation import router as image_generation_router
from routers.visualization import router as visualization_router
from routers.utilities import router as utilities_router
from routers.chat import router as chat_router
from routers.bluesky import router as bluesky_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Kartr API",
    description="FastAPI backend for Kartr - Connect Influencers and Sponsors",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS - allowed origins for frontend
# Get additional origins from environment variable
ENV_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []

ALLOWED_ORIGINS = [
    "http://localhost:3000",      # Bun/React/Next.js development
    "http://127.0.0.1:3000",
    "http://localhost:3001",      # Alternative port
    "http://127.0.0.1:3001",
    "http://localhost:5173",      # Vite development
    "http://127.0.0.1:5173",
    "http://localhost:8080",      # Common dev port
    "http://127.0.0.1:8080",
] + [origin.strip() for origin in ENV_ORIGINS if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(youtube_router)
app.include_router(search_router)
app.include_router(virtual_influencer_router)
app.include_router(social_media_router)
app.include_router(image_generation_router)
app.include_router(visualization_router)
app.include_router(utilities_router)
app.include_router(chat_router)
app.include_router(bluesky_router)


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Kartr API",
        "version": "1.0.0",
        "description": "FastAPI backend for Kartr influencer-sponsor platform",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "An error occurred"
        }
    )


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Kartr FastAPI Backend starting up...")
    logger.info("API documentation available at /docs")
    
    # Check database configuration
    from database import is_firebase_configured
    from config import settings
    
    if not is_firebase_configured():
        logger.warning("Firebase not configured. Using in-memory mock database.")
    
    if not settings.YOUTUBE_API_KEY:
        logger.warning("YouTube API key not configured. Some features will be limited.")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Kartr FastAPI Backend shutting down...")


# For running with uvicorn directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
