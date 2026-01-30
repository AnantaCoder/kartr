import os
import logging
import time
import requests
import asyncio
from atproto import Client, models
from fastapi import HTTPException
from PIL import Image
import io

logger = logging.getLogger(__name__)

class BlueskyService:
    """
    Stateless service for Bluesky interactions.
    Requires credentials for every operation to support multiple users.
    """
    
    MAX_IMAGE_SIZE = 976.56 * 1024  # Bluesky max: ~976.56KB
    VIDEO_SERVICE_URL = "https://video.bsky.app"
    
    def _compress_image(self, image_path: str, max_size: int = int(MAX_IMAGE_SIZE)) -> bytes:
        """Compress image to fit Bluesky's size limit (~1MB)"""
        try:
            img = Image.open(image_path)
            
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            
            quality = 85
            while quality > 10:
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                img_bytes = buffer.getvalue()
                
                if len(img_bytes) <= max_size:
                    return img_bytes
                
                quality -= 5
            
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

    async def _upload_video_to_service(self, client: Client, video_path: str) -> dict:
        """
        Upload video to Bluesky's video processing service.
        This is the proper way to upload videos - they require transcoding.
        """
        import httpx
        
        did = client.me.did
        file_size = os.path.getsize(video_path)
        
        # Step 1: Get service auth token for video upload
        logger.info("Getting service auth token...")
        try:
            # We need to get the service auth for the VIDEO service, but scoped correctly.
            # According to the error: "should be the user's PDS DID".
            # The AtProto client handles this somewhat automatically if we ask for the right thing.
            # Based on docs/examples, for video upload we usually need the video service DID as 'aud',
            # BUT some PDSs require their own DID as 'aud' for the proxying. 
            
            # Let's try to get the PDS's DID first.
            # client.me.did is the user's DID.
            # We can find the PDS endpoint from the session or resolve it.
            
            # Using 'did:web:video.bsky.app' directly caused the error.
            # The error suggests using "did:web:discina.us-west.host.bsky.network" (YOUR PDS).
            
            # The correct way is usually to ask the client to get a token for the *service* we are using.
            # If we are uploading directly to video.bsky.app, we need a token for IT.
            # However, the error comes FROM video.bsky.app saying the token aud is wrong.
            
            # UPDATE: The "lxm" (lexicon method) `app.bsky.video.uploadVideo` is correct.
            # The `aud` should be the service that will *verify* the token.
            # It seems we should use the user's PDS DID as the audience because the PDS delegates/verifies?
            # Or simpler: let's try using the PDS DID mentioned in the error if we can find it, 
            # OR better yet, let's try identifying the PDS DID dynamically.
            
            # Actually, `com.atproto.server.describe_server` might give us the DID.
            # But let's try a simpler approach: 
            # The error says "should be the user's PDS DID".
            # We can get the PDS URL from the client session.
            
            # Let's dynamically resolve the PDS DID or use a generic 'did:web:bsky.social' if that's the main usage,
            # but for federated hosts (like discina.us-west...), we need that specific DID.
            
            # ATProto python client usually manages the service auth if we just pass the right Params.
            # Let's try NOT specifying 'aud' and see if it defaults correctly, OR specify the PDS.
            
            # Strategy: Resolve the user's PDS DID.
            # We can try to fetch it via `describe_server`.
            # This asks the server we are connected to (the PDS) for its info.
            
            pds_info = client.com.atproto.server.describe_server()
            pds_did = pds_info.did
            
            logger.info(f"Target PDS DID for auth: {pds_did}")
            
            service_auth = client.com.atproto.server.get_service_auth(
                models.ComAtprotoServerGetServiceAuth.Params(
                    aud=pds_did,
                    lxm="app.bsky.video.uploadVideo"
                )
            )
        except Exception as e:
            raise Exception(f"Failed to get service auth token: {str(e)}")
        
        # Step 2: Upload video to video service with retries
        logger.info(f"Uploading {file_size} bytes from {video_path} to video service...")
        
        upload_url = f"{self.VIDEO_SERVICE_URL}/xrpc/app.bsky.video.uploadVideo"
        headers = {
            "Authorization": f"Bearer {service_auth.token}",
            "Content-Type": "video/mp4",
            "Content-Length": str(file_size),
            "User-Agent": "Kartr/1.0 (FastAPI Backend; Windows)"
        }
        params = {
            "did": did,
            "name": f"video_{int(time.time())}.mp4"
        }
        
        upload_max_retries = 3
        
        # Use httpx for robust connection handling
        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
        timeout = httpx.Timeout(300.0, connect=60.0) # 5 min total, 60s connect
        
        async with httpx.AsyncClient(limits=limits, timeout=timeout) as http_client:
            for attempt in range(upload_max_retries):
                try:
                    # Read file content into memory for async upload
                    # Note: For very large files, we should use aiofiles, but for <50MB this is fine
                    # and avoids "sync request with AsyncClient" error
                    with open(video_path, 'rb') as f:
                        video_bytes = f.read()
                        
                    response = await http_client.post(
                        upload_url, 
                        headers=headers, 
                        params=params, 
                        content=video_bytes
                    )
                    
                    if response.status_code != 200:
                        logger.error(f"Video upload failed (Attempt {attempt+1}): {response.status_code} - {response.text}")
                        raise Exception(f"Video upload failed: {response.text}")
                    
                    job_status = response.json()
                    logger.info(f"Video upload started, job ID: {job_status.get('jobId')}")
                    break
                except Exception as e:
                    logger.warning(f"Video upload attempt {attempt+1} failed: {str(e)}")
                    if attempt < upload_max_retries - 1:
                        await asyncio.sleep(2 * (attempt + 1))
                    else:
                        raise Exception(f"Video upload failed after {upload_max_retries} attempts: {str(e)}")
        
        # Step 3: Poll for job completion
        job_id = job_status.get("jobId")
        if not job_id:
            if job_status.get("blob"):
                return job_status
            raise Exception("No job ID or blob in response")
        
        status_url = f"{self.VIDEO_SERVICE_URL}/xrpc/app.bsky.video.getJobStatus"
        max_attempts = 60
        
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            for attempt in range(max_attempts):
                await asyncio.sleep(5)
                
                try:
                    status_response = await http_client.get(
                        status_url,
                        headers={"Authorization": f"Bearer {service_auth.token}"},
                        params={"jobId": job_id}
                    )
                    
                    if status_response.status_code != 200:
                        logger.warning(f"Status check failed: {status_response.text}")
                        continue
                    
                    status = status_response.json().get("jobStatus", {})
                    state = status.get("state")
                    logger.info(f"Video processing status: {state} (attempt {attempt + 1})")
                    
                    if state == "JOB_STATE_COMPLETED":
                        blob = status.get("blob")
                        if blob:
                            logger.info("Video processing completed!")
                            return {"blob": blob}
                        raise Exception("Job completed but no blob returned")
                    
                    elif state == "JOB_STATE_FAILED":
                        error = status.get("error", "Unknown error")
                        raise Exception(f"Video processing failed: {error}")
                        
                except Exception as e:
                    logger.warning(f"Checking status failed (network error): {str(e)}")
                    continue
        
        raise Exception("Video processing timed out after 5 minutes")

    async def post_video(self, identifier: str, password: str, text: str, video_path: str, alt_text: str = "Video") -> dict:
        """Post text with video using Bluesky's video processing service"""
        if not os.path.exists(video_path):
            raise HTTPException(status_code=404, detail=f"Video file not found: {video_path}")
        
        file_size = os.path.getsize(video_path)
        logger.info(f"Video file size: {file_size / (1024*1024):.2f} MB at {video_path}")
        
        # Bluesky limits
        if file_size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"Video exceeds 50MB limit")
            
        client = self._get_client(identifier, password)
        
        try:
            # Upload to video service and wait for processing
            video_result = await self._upload_video_to_service(client, video_path)
            
            # Create post with video embed
            blob_data = video_result.get("blob")
            if not blob_data:
                raise Exception("No blob data returned from video service")
            
            # Construct the blob reference
            video_blob = models.BlobRef(
                mime_type=blob_data.get("mimeType", "video/mp4"),
                size=blob_data.get("size", file_size),
                ref=models.common.BlobRefLink(link=blob_data.get("ref", {}).get("$link"))
            )
            
            # Create video embed
            embed = models.AppBskyEmbedVideo.Main(
                video=video_blob,
                alt=alt_text,
                aspect_ratio=models.AppBskyEmbedDefs.AspectRatio(width=16, height=9)
            )
            
            # Send post
            # Note: client.send_post is synchronous, but that's okay as it's quick
            # The heavy lifting (video upload) is now async
            post = client.send_post(text=text, embed=embed)
            
            logger.info(f"Video posted successfully: {post.uri}")
            return {
                "success": True,
                "post_uri": post.uri,
                "cid": post.cid,
                "message": "Video post created successfully"
            }

        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to post video: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Failed to post video: {error_msg}")

bluesky_service = BlueskyService()
