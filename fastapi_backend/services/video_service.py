"""
Video Generation Service - Generate AI videos using Veo
"""
import os
import time
import logging
import hashlib
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from collections import defaultdict
import requests

from config import settings

logger = logging.getLogger(__name__)

# Rate limiting storage (in-memory for simplicity)
# In production, use Redis
_rate_limit_cache: Dict[str, list] = defaultdict(list)
_storyboard_cache: Dict[str, Dict[str, Any]] = {}

# Constants
VIDEOS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "videos")
MAX_VIDEOS_PER_MINUTE = 3
VIDEO_DURATION_SECONDS = 8


class VideoService:
    """Service for generating videos using Google Veo models"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure video storage directory exists"""
        os.makedirs(VIDEOS_DIR, exist_ok=True)
    
    def _get_client(self):
        """Lazy initialization of Gemini client"""
        if self.client is None:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except ImportError:
                raise RuntimeError("google-genai package not installed")
        return self.client
    
    def _check_rate_limit(self, user_id: str) -> bool:
        """
        Check if user has exceeded rate limit (3 videos per minute).
        Returns True if allowed, False if rate limited.
        """
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)
        
        # Clean old entries
        _rate_limit_cache[user_id] = [
            ts for ts in _rate_limit_cache[user_id] 
            if ts > one_minute_ago
        ]
        
        # Check limit
        if len(_rate_limit_cache[user_id]) >= MAX_VIDEOS_PER_MINUTE:
            return False
        
        return True
    
    def _record_request(self, user_id: str):
        """Record a video generation request for rate limiting"""
        _rate_limit_cache[user_id].append(datetime.now())
    
    def _get_remaining_requests(self, user_id: str) -> int:
        """Get remaining requests for this minute"""
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)
        
        # Clean old entries
        _rate_limit_cache[user_id] = [
            ts for ts in _rate_limit_cache[user_id] 
            if ts > one_minute_ago
        ]
        
        return MAX_VIDEOS_PER_MINUTE - len(_rate_limit_cache[user_id])
    
    def _generate_cache_key(self, prompt: str, user_id: str) -> str:
        """Generate a cache key for the storyboard"""
        content = f"{prompt}:{user_id}:{datetime.now().strftime('%Y%m%d%H')}"
        return hashlib.md5(content.encode()).hexdigest()
    
    async def generate_storyboard(self, prompt: str, user_id: str) -> Dict[str, Any]:
        """
        Generate a video storyboard using Gemini.
        Caches the result for potential reuse.
        """
        cache_key = self._generate_cache_key(prompt, user_id)
        
        # Check cache first
        if cache_key in _storyboard_cache:
            logger.info(f"Returning cached storyboard for key {cache_key[:8]}")
            return _storyboard_cache[cache_key]
        
        client = self._get_client()
        
        storyboard_prompt = f"""
Create a detailed cinematic storyboard for a {VIDEO_DURATION_SECONDS}-second video.

Theme/Prompt: {prompt}

Requirements:
- Create 3-4 scenes that fit within {VIDEO_DURATION_SECONDS} seconds total
- Each scene should include:
  - Scene number
  - Shot description (visual details)
  - Camera movement (pan, zoom, static, etc.)
  - Duration in seconds
  - Mood/lighting notes
- Style: Cinematic, professional, engaging

Output the storyboard in a clear numbered format.
"""
        
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_TEXT_MODEL,
                contents=storyboard_prompt,
            )
            
            storyboard_text = ""
            for candidate in response.candidates or []:
                for part in candidate.content.parts or []:
                    if hasattr(part, "text"):
                        storyboard_text += part.text
            
            result = {
                "cache_key": cache_key,
                "prompt": prompt,
                "storyboard": storyboard_text,
                "created_at": datetime.now().isoformat(),
                "user_id": user_id,
            }
            
            # Cache the storyboard
            _storyboard_cache[cache_key] = result
            logger.info(f"Generated and cached storyboard for key {cache_key[:8]}")
            
            return result
            
        except Exception as e:
            logger.error(f"Storyboard generation failed: {e}")
            raise RuntimeError(f"Failed to generate storyboard: {str(e)}")
    
    def _find_best_veo_model(self) -> str:
        """Find the best available Veo model"""
        client = self._get_client()
        
        # Priority order: Veo 3.1 > Veo 3.0 > Veo 2.0
        model_priorities = ["veo-3.1", "veo-3.0", "veo-2.0"]
        
        try:
            for priority in model_priorities:
                for m in client.models.list():
                    if priority in m.name.lower() and "generate" in m.name.lower():
                        return m.name.split("/")[-1]
        except Exception as e:
            logger.warning(f"Model search failed: {e}")
        
        # Fallback
        return "veo-2.0-generate-001"
    
    async def generate_video(
        self, 
        prompt: str, 
        user_id: str,
        use_cached_storyboard: bool = True
    ) -> Dict[str, Any]:
    
        """
        Generate a video using Veo.
        
        1. Check rate limit
        2. Generate storyboard (cached)
        3. Generate video
        4. Save to data/videos
        5. Return result
        """
        # Check rate limit
        if not self._check_rate_limit(user_id):
            remaining_seconds = 60  # Approximate
            raise RuntimeError(
                f"Rate limit exceeded. Maximum {MAX_VIDEOS_PER_MINUTE} videos per minute. "
                f"Please wait {remaining_seconds} seconds."
            )
        
        # Record this request
        self._record_request(user_id)
        
        # Generate storyboard first
        storyboard_result = await self.generate_storyboard(prompt, user_id)
        
        # Get best Veo model
        veo_model = self._find_best_veo_model()
        logger.info(f"Using Veo model: {veo_model}")
        
        # Build video prompt from original prompt + storyboard context
        video_prompt = f"{prompt}. Cinematic quality, professional lighting, smooth camera movements."
        
        try:
            from google.genai import types
            
            client = self._get_client()
            
            # Start video generation
            operation = client.models.generate_videos(
                model=veo_model,
                prompt=video_prompt,
                config=types.GenerateVideosConfig(
                    number_of_videos=1,
                    duration_seconds=VIDEO_DURATION_SECONDS,
                )
            )
            
            # Poll for completion
            logger.info("Video generation started, polling for completion...")
            while not operation.done:
                await asyncio.sleep(5)
                operation = client.operations.get(operation)
            
            # Check result
            if not operation.result or not operation.result.generated_videos:
                raise RuntimeError("Video generation returned no result")
            
            generated_video = operation.result.generated_videos[0]
            
            # Download video from URI
            if not hasattr(generated_video.video, 'uri'):
                raise RuntimeError("No video URI in response")
            
            uri = generated_video.video.uri
            
            # Add API key for auth
            if '?' in uri:
                auth_uri = f"{uri}&key={self.api_key}"
            else:
                auth_uri = f"{uri}?key={self.api_key}"
            
            # Download
            response = requests.get(auth_uri, timeout=120)
            if response.status_code != 200:
                raise RuntimeError(f"Failed to download video: HTTP {response.status_code}")
            
            # Save video
            timestamp = int(time.time())
            safe_user_id = user_id.replace("@", "_").replace(".", "_")[:20]
            filename = f"video_{safe_user_id}_{timestamp}.mp4"
            filepath = os.path.join(VIDEOS_DIR, filename)
            
            with open(filepath, "wb") as f:
                f.write(response.content)
            
            logger.info(f"Video saved to: {filepath}")
            
            return {
                "success": True,
                "video_path": filepath,
                "video_filename": filename,
                "video_url": f"/api/videos/stream/{filename}",
                "storyboard": storyboard_result["storyboard"],
                "cache_key": storyboard_result["cache_key"],
                "model_used": veo_model,
                "duration_seconds": VIDEO_DURATION_SECONDS,
                "remaining_requests": self._get_remaining_requests(user_id),
                "created_at": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Video generation failed: {e}")
            raise RuntimeError(f"Video generation failed: {str(e)}")
    
    def get_cached_storyboard(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Retrieve a cached storyboard"""
        return _storyboard_cache.get(cache_key)
    
    def list_user_videos(self, user_id: str) -> list:
        """List all videos for a user"""
        safe_user_id = user_id.replace("@", "_").replace(".", "_")[:20]
        videos = []
        
        if not os.path.exists(VIDEOS_DIR):
            return videos
        
        for filename in os.listdir(VIDEOS_DIR):
            if filename.startswith(f"video_{safe_user_id}_") and filename.endswith(".mp4"):
                filepath = os.path.join(VIDEOS_DIR, filename)
                stat = os.stat(filepath)
                videos.append({
                    "filename": filename,
                    "url": f"/api/videos/stream/{filename}",
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                })
        
        return sorted(videos, key=lambda x: x["created_at"], reverse=True)


# Singleton instance
video_service = VideoService()
