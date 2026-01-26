from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Optional
import logging

from models.video_schemas import VideoGenerationRequest, VideoGenerationResponse
from services.video_service import VideoService
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/video", tags=["AI Video Forge"])

# Schemas for async tasks
from pydantic import BaseModel
class VideoTaskResponse(BaseModel):
    task_id: str
    status: str

class VideoStatusResponse(BaseModel):
    task_id: str
    status: str
    result_url: Optional[str] = None
    error: Optional[str] = None
    progress: int = 0

@router.post("/generate", response_model=VideoTaskResponse)
async def start_video_generation(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Start asynchronous video generation.
    Returns a task ID for status polling.
    """
    import uuid
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    
    logger.info(f"User {current_user.get('email')} started async video generation: {request.prompt}")
    
    background_tasks.add_task(
        VideoService.generate_video_async,
        task_id=task_id,
        prompt=request.prompt,
        num_frames=request.num_frames,
        num_inference_steps=request.num_inference_steps,
        fps=request.fps
    )
    
    return VideoTaskResponse(task_id=task_id, status="pending")

@router.get("/status/{task_id}", response_model=VideoStatusResponse)
async def get_task_status(task_id: str):
    """Check status of a video generation task."""
    status_data = VideoService.get_task_status(task_id)
    
    if not status_data:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return VideoStatusResponse(
        task_id=task_id,
        status=status_data.get("status"),
        result_url=status_data.get("result_url"),
        error=status_data.get("error"),
        progress=status_data.get("progress", 0)
    )
