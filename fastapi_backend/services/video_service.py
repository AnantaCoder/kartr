import logging
import os
import time
import uuid
from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime
from services.storage_service import storage_service
from services.cloudinary_service import cloudinary_service

logger = logging.getLogger(__name__)

# Lazy imports for ML libraries to allow backend to start without them
torch = None
DiffusionPipeline = None
DPMSolverMultistepScheduler = None
export_to_video = None
np = None
cv2 = None

def _import_ml_libs():
    global torch, DiffusionPipeline, DPMSolverMultistepScheduler, export_to_video, np, cv2
    try:
        import torch
        from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler
        from diffusers.utils import export_to_video
        import numpy as np
        import cv2
        return True
    except Exception as e:
        logger.warning(f"ML libraries for video generation not available or incompatible: {e}")
        return False

class VideoService:
    _pipe = None
    _video_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'outputs', 'videos')
    _tasks: Dict[str, Dict[str, Any]] = {}  # task_id -> {status, result, error, progress}

    @classmethod
    def _initialize_pipeline(cls):
        if cls._pipe is not None:
            return True
        
        if not _import_ml_libs():
            return False
            
        try:
            logger.info("Initializing Video Diffusion Pipeline (damo-vilab/text-to-video-ms-1.7b)...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            dtype = torch.float16 if device == "cuda" else torch.float32
            variant = "fp16" if device == "cuda" else None
            
            logger.info(f"Using device: {device}, dtype: {dtype}, variant: {variant}")
            
            cls._pipe = DiffusionPipeline.from_pretrained(
                "damo-vilab/text-to-video-ms-1.7b", 
                torch_dtype=dtype, 
                variant=variant
            )
            cls._pipe.scheduler = DPMSolverMultistepScheduler.from_config(cls._pipe.scheduler.config)
            
            # Optimization for GPU memory
            if device == "cuda":
                logger.info("Enabling GPU memory optimizations (CPU offload + VAE slicing)")
                cls._pipe.enable_model_cpu_offload()
                cls._pipe.enable_vae_slicing()
            else:
                logger.info("Running on CPU. Expect slow generation.")
                cls._pipe.to("cpu")
                
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Video pipeline: {e}", exc_info=True)
            return False

    @classmethod
    def generate_video(
        cls, 
        prompt: str, 
        num_frames: int = 16, 
        num_inference_steps: int = 15, # Optimized for demo (was 25)
        fps: int = 8
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate a video from a text prompt.
        Returns: (success, video_rel_path, error_message)
        """
        # 1. Check Dependencies First
        if not _import_ml_libs():
             return False, None, "AI dependencies missing. Please run: pip install torch diffusers accelerate"

        # 2. Initialize Model (Downloads on first run)
        if not cls._initialize_pipeline():
            # Check if it was a CPU limitation
            device_msg = " (Running on CPU)" if torch and not torch.cuda.is_available() else ""
            return False, None, f"Video Model is still loading or failed to initialize{device_msg}. First run downloads ~4GB. Check terminal logs."

        try:
            # Create video directory if not exists
            os.makedirs(cls._video_dir, exist_ok=True)
            
            # Optimization: Cleanup old videos (older than 2 hours)
            storage_service.cleanup_directory(cls._video_dir, max_age_hours=2)
            
            video_filename = f"gen_video_{uuid.uuid4().hex[:8]}_{int(time.time())}.mp4"
            video_path = os.path.join(cls._video_dir, video_filename)
            
            logger.info(f"Generating video for prompt: '{prompt}'")
            
            # Generate frames
            # Note: num_frames is usually small for this model (e.g. 16)
            result = cls._pipe(
                prompt, 
                num_inference_steps=num_inference_steps, 
                num_frames=num_frames
            )
            video_frames = result.frames # List of numpy arrays or tensors
            
            # Process frames for export
            processed_frames = []
            for frame in video_frames[0]: # Result frames is often a list containing the batch
                if isinstance(frame, torch.Tensor):
                    frame = frame.detach().cpu().float().numpy()

                # If (C, H, W), transpose to (H, W, C)
                if frame.ndim == 3 and frame.shape[0] in [1, 3, 4]:
                    frame = frame.transpose(1, 2, 0)

                # Normalize and convert to uint8
                frame = (frame.clip(0, 1) * 255).astype(np.uint8)
                
                # Convert RGB to BGR for OpenCV
                frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                processed_frames.append(frame_bgr)

            # Export using OpenCV
            if not processed_frames:
                return False, None, "No frames generated."
                
            height, width, _ = processed_frames[0].shape
            
            # Try H.264 (X264) first as it's more web-compatible, fallback to mp4v
            # Common FourCC codes: 'avc1', 'X264', 'mp4v'
            fourcc_options = ['avc1', 'X264', 'mp4v']
            out = None
            
            for f_code in fourcc_options:
                try:
                    fourcc = cv2.VideoWriter_fourcc(*f_code)
                    out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
                    if out.isOpened():
                        logger.info(f"Successfully opened VideoWriter with FourCC: {f_code}")
                        break
                except:
                    continue
            
            if out is None or not out.isOpened():
                error_msg = "Could not open VideoWriter with any compatible FourCC."
                if np and hasattr(np, '__version__') and np.__version__.startswith('2.'):
                    error_msg += " (Note: NumPy 2.x detected, which may cause compatibility issues with some ML-driven OpenCV operations. Attempting to proceed...)"
                return False, None, error_msg
            
            for frame in processed_frames:
                out.write(frame)
            out.release()
            
            # Upload to Cloudinary
            cloudinary_url = cloudinary_service.upload_video(video_path)
            if cloudinary_url:
                logger.info(f"Video uploaded to Cloudinary: {cloudinary_url}")
                # Optional: delete local file after successful upload
                try: os.remove(video_path)
                except: pass
                return True, cloudinary_url, None

            # Return relative path for frontend access (fallback)
            rel_path = f"/data/outputs/videos/{video_filename}"
            logger.info(f"Video saved locally to: {video_path}")
            return True, rel_path, None
        except Exception as e:
            logger.error(f"Video generation error: {e}", exc_info=True)
            return False, None, str(e)

    @classmethod
    def get_task_status(cls, task_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve task state."""
        return cls._tasks.get(task_id)

    @classmethod
    async def generate_video_async(cls, task_id: str, prompt: str, **kwargs):
        """Background worker for video generation."""
        cls._tasks[task_id] = {"status": "processing", "progress": 10, "prompt": prompt}
        
        try:
            success, result_url, error_msg = cls.generate_video(prompt, **kwargs)
            
            if success:
                cls._tasks[task_id].update({
                    "status": "completed",
                    "progress": 100,
                    "result_url": result_url
                })
                logger.info(f"Task {task_id} completed successfully.")
            else:
                cls._tasks[task_id].update({
                    "status": "failed",
                    "error": error_msg
                })
                logger.error(f"Task {task_id} failed: {error_msg}")
                
        except Exception as e:
            cls._tasks[task_id].update({
                "status": "failed",
                "error": str(e)
            })
            logger.error(f"Async Task Error {task_id}: {e}")
