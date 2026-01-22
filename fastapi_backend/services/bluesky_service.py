import os
from atproto import Client, models
from fastapi import HTTPException
import mimetypes

class BlueskyService:
    """
    Stateless service for Bluesky interactions.
    Requires credentials for every operation to support multiple users.
    """
    
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
            with open(image_path, 'rb') as f:
                img_data = f.read()
            
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

bluesky_service = BlueskyService()
