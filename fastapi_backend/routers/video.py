"""
Video Generation Router - API endpoints for video generation
"""
import os
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from datetime import datetime

from services.video_service import video_service, VIDEOS_DIR
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/videos", tags=["Video Generation"])


# ============================================================================
# Request/Response Models
# ============================================================================

class GenerateStoryboardRequest(BaseModel):
    """Request model for storyboard generation"""
    prompt: str = Field(..., min_length=10, max_length=500, description="Video prompt/theme")

class StoryboardResponse(BaseModel):
    """Response model for storyboard generation"""
    success: bool
    cache_key: Optional[str] = None
    storyboard: Optional[str] = None
    prompt: Optional[str] = None
    created_at: Optional[str] = None
    error: Optional[str] = None

class GenerateVideoRequest(BaseModel):
    """Request model for video generation"""
    prompt: str = Field(..., min_length=10, max_length=500, description="Video prompt/theme")
    use_cached_storyboard: bool = Field(True, description="Use cached storyboard if available")

class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    success: bool
    video_url: Optional[str] = None
    video_filename: Optional[str] = None
    storyboard: Optional[str] = None
    cache_key: Optional[str] = None
    model_used: Optional[str] = None
    duration_seconds: Optional[int] = None
    remaining_requests: Optional[int] = None
    created_at: Optional[str] = None
    error: Optional[str] = None

class VideoListResponse(BaseModel):
    """Response model for video list"""
    videos: list
    count: int

class RateLimitInfoResponse(BaseModel):
    """Response model for rate limit info"""
    max_per_minute: int
    remaining: int
    reset_in_seconds: int = 60


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/storyboard", response_model=StoryboardResponse)
async def generate_storyboard(
    request: GenerateStoryboardRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a video storyboard from a prompt.
    
    The storyboard is cached for potential reuse when generating the actual video.
    This is a quick operation and doesn't count against the rate limit.
    """
    user_id = current_user.get("uid", current_user.get("id", "anonymous"))
    
    try:
        result = await video_service.generate_storyboard(
            prompt=request.prompt,
            user_id=user_id
        )
        
        return StoryboardResponse(
            success=True,
            cache_key=result["cache_key"],
            storyboard=result["storyboard"],
            prompt=result["prompt"],
            created_at=result["created_at"],
        )
        
    except Exception as e:
        logger.error(f"Storyboard generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/generate", response_model=VideoGenerationResponse)
async def generate_video(
    request: GenerateVideoRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate an AI video using Veo.
    
    **Rate Limit**: Maximum 3 videos per minute per user.
    
    Process:
    1. Generates a storyboard (cached)
    2. Sends prompt to Veo model
    3. Downloads and saves video to data/videos
    4. Returns video URL for streaming
    
    **Note**: Video generation can take 1-3 minutes.
    """
    user_id = current_user.get("uid", current_user.get("id", "anonymous"))
    
    try:
        result = await video_service.generate_video(
            prompt=request.prompt,
            user_id=user_id,
            use_cached_storyboard=request.use_cached_storyboard
        )
        
        return VideoGenerationResponse(
            success=True,
            video_url=result["video_url"],
            video_filename=result["video_filename"],
            storyboard=result["storyboard"],
            cache_key=result["cache_key"],
            model_used=result["model_used"],
            duration_seconds=result["duration_seconds"],
            remaining_requests=result["remaining_requests"],
            created_at=result["created_at"],
        )
        
    except RuntimeError as e:
        error_message = str(e)
        
        # Check if rate limit error
        if "Rate limit exceeded" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=error_message
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_message
        )
    except Exception as e:
        logger.error(f"Video generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/stream/{filename}")
async def stream_video(filename: str):
    """
    Stream a generated video file.
    
    Returns the video file for playback.
    """
    # Sanitize filename
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    filepath = os.path.join(VIDEOS_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    return FileResponse(
        filepath,
        media_type="video/mp4",
        filename=filename
    )


@router.get("/download/{filename}")
async def download_video(filename: str):
    """
    Download a generated video file.
    
    Returns the video file as an attachment.
    """
    # Sanitize filename
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    filepath = os.path.join(VIDEOS_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    return FileResponse(
        filepath,
        media_type="video/mp4",
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/list", response_model=VideoListResponse)
async def list_user_videos(
    current_user: dict = Depends(get_current_user)
):
    """
    List all videos generated by the current user.
    
    Returns a list of video metadata including URLs for streaming.
    """
    user_id = current_user.get("uid", current_user.get("id", "anonymous"))
    
    videos = video_service.list_user_videos(user_id)
    
    return VideoListResponse(
        videos=videos,
        count=len(videos)
    )


@router.get("/rate-limit", response_model=RateLimitInfoResponse)
async def get_rate_limit_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current rate limit status for video generation.
    
    Returns:
    - max_per_minute: Maximum videos allowed per minute
    - remaining: Remaining requests in current window
    - reset_in_seconds: Approximate seconds until rate limit resets
    """
    user_id = current_user.get("uid", current_user.get("id", "anonymous"))
    
    remaining = video_service._get_remaining_requests(user_id)
    
    return RateLimitInfoResponse(
        max_per_minute=3,
        remaining=remaining,
        reset_in_seconds=60  # Approximate
    )


@router.get("/storyboard/{cache_key}", response_model=StoryboardResponse)
async def get_cached_storyboard(
    cache_key: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve a cached storyboard by its cache key.
    """
    result = video_service.get_cached_storyboard(cache_key)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Storyboard not found in cache"
        )
    
    # Verify user owns this storyboard
    user_id = current_user.get("uid", current_user.get("id", "anonymous"))
    if result.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return StoryboardResponse(
        success=True,
        cache_key=result["cache_key"],
        storyboard=result["storyboard"],
        prompt=result["prompt"],
        created_at=result["created_at"],
    )
