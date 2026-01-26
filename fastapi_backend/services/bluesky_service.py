import os
import logging
from atproto import Client, models
from fastapi import HTTPException
import mimetypes
from PIL import Image
import io
import httpx
import base64
import re

logger = logging.getLogger(__name__)

class BlueskyService:
    """
    Stateless service for Bluesky interactions.
    Requires credentials for every operation to support multiple users.
    """
    
    MAX_IMAGE_SIZE = 976.56 * 1024  # Bluesky max: ~976.56KB
    
    def _compress_image(self, image_path: str, max_size: int = int(MAX_IMAGE_SIZE)) -> bytes:
        """Compress image to fit Bluesky's size limit (~1MB)"""
        try:
            # Open image
            img = Image.open(image_path)
            
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            
            # Try to compress to target size
            quality = 85
            while quality > 10:
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                img_bytes = buffer.getvalue()
                
                if len(img_bytes) <= max_size:
                    return img_bytes
                
                quality -= 5
            
            # If still too large, resize image
            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=70, optimize=True)
            return buffer.getvalue()
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image compression failed: {str(e)}")
    
    def _get_client(self, identifier: str, password: str) -> Client:
        """Helper to get an authenticated client."""
        client = Client()
        try:
            client.login(identifier, password)
            return client
        except Exception as e:
            # Mask password in logs if needed, but for now just raise
            raise HTTPException(status_code=401, detail=f"Bluesky login failed: {str(e)}")

    def verify_credentials(self, identifier: str, password: str) -> bool:
        """Verify if credentials are valid."""
        try:
            self._get_client(identifier, password)
            return True
        except HTTPException:
            return False

    def post_text(self, identifier: str, password: str, text: str) -> dict:
        """Post text only"""
        client = self._get_client(identifier, password)
        try:
            post = client.send_post(text=text)
            return {
                "success": True, 
                "post_uri": post.uri, 
                "cid": post.cid,
                "message": "Text post created successfully"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to post text: {str(e)}")

    def post_image(self, identifier: str, password: str, text: str, image_path: str, alt_text: str = "") -> dict:
        """Post text with image"""
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail=f"Image file not found: {image_path}")
            
        client = self._get_client(identifier, password)
        try:
            # Compress image to Bluesky's size limit
            img_data = self._compress_image(image_path)
            
            post = client.send_image(text=text, image=img_data, image_alt=alt_text)
            return {
                "success": True,
                "post_uri": post.uri,
                "cid": post.cid,
                "message": "Image post created successfully"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to post image: {str(e)}")

    def post_video(self, identifier: str, password: str, text: str, video_path: str, alt_text: str = "Video") -> dict:
        """Post text with video"""
        if not os.path.exists(video_path):
            raise HTTPException(status_code=404, detail=f"Video file not found: {video_path}")
            
        client = self._get_client(identifier, password)
        try:
            # 1. Read file and determine mime type
            mime_type, _ = mimetypes.guess_type(video_path)
            if not mime_type:
                mime_type = "video/mp4"
                
            with open(video_path, 'rb') as f:
                video_data = f.read()
            
            # 2. Upload blob
            upload_response = client.upload_blob(video_data)
            
            # 3. Create video embed
            embed_video = models.AppBskyEmbedVideo.Main(
                video=upload_response.blob,
                aspect_ratio=models.AppBskyEmbedDefs.AspectRatio(width=16, height=9)
            )
            
            post = client.send_post(
                text=text,
                embed=embed_video
            )

            return {
                "success": True,
                "post_uri": post.uri,
                "cid": post.cid,
                "message": "Video post created successfully"
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to post video: {str(e)}")

    async def post_image_url(self, identifier: str, password: str, text: str, image_url: str, alt_text: str = "") -> dict:
        """Post text with image from URL or Data URI"""
        client = self._get_client(identifier, password)
        try:
            image_bytes = None
            
            # Handle Data URI
            if image_url.startswith('data:image/'):
                logger.info("Decoding image from Data URI for BlueSky")
                # Extract base64 part
                header, encoded = image_url.split(",", 1)
                image_bytes = base64.b64decode(encoded)
            else:
                # Regular URL
                async with httpx.AsyncClient() as httpx_client:
                    response = await httpx_client.get(image_url)
                    response.raise_for_status()
                    image_bytes = response.content
            
            # Compress if needed
            img = Image.open(io.BytesIO(image_bytes))
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            img_data = buffer.getvalue()
            
            post = client.send_image(text=text, image=img_data, image_alt=alt_text)
            return {
                "success": True,
                "post_uri": post.uri,
                "cid": post.cid,
                "message": "Image post created successfully"
            }
        except Exception as e:
            logger.error(f"BlueSky image post failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to post image: {str(e)}")

    async def post_video_url(self, identifier: str, password: str, text: str, video_url: str, alt_text: str = "Video") -> dict:
        """Post text with video from URL"""
        client = self._get_client(identifier, password)
        try:
            async with httpx.AsyncClient() as httpx_client:
                response = await httpx_client.get(video_url)
                response.raise_for_status()
                video_data = response.content
            
            # Upload blob
            upload_response = client.upload_blob(video_data)
            
            embed_video = models.AppBskyEmbedVideo.Main(
                video=upload_response.blob,
                aspect_ratio=models.AppBskyEmbedDefs.AspectRatio(width=16, height=9)
            )
            
            post = client.send_post(
                text=text,
                embed=embed_video
            )

            return {
                "success": True,
                "post_uri": post.uri,
                "cid": post.cid,
                "message": "Video post from URL created successfully"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to post video from URL: {str(e)}")

bluesky_service = BlueskyService()
