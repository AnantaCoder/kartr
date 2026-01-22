from fastapi import APIRouter, HTTPException, Depends
from models.social_schemas import BlueskyConnectRequest, BlueskyPostRequest, BlueskyPostResponse
from services.bluesky_service import bluesky_service
from services.auth_service import AuthService
from utils.dependencies import get_current_user

router = APIRouter(
    prefix="/bluesky",
    tags=["Bluesky"]
)

@router.post("/connect", response_model=dict)
async def connect_bluesky_account(
    request: BlueskyConnectRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Link a Bluesky account to the current user.
    Verifies credentials before saving.
    """
    # 1. Verify credentials with Bluesky
    is_valid = bluesky_service.verify_credentials(request.identifier, request.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid Bluesky credentials")
    
    # 2. Save to User Profile (Database)
    update_data = {
        "bluesky_handle": request.identifier,
        "bluesky_password": request.password # In production, encrypt this!
    }
    
    updated_user = AuthService.update_user(current_user["id"], update_data)
    
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to save Bluesky credentials to profile")
        
    return {"success": True, "message": f"Bluesky account {request.identifier} linked successfully"}


@router.post("/post", response_model=BlueskyPostResponse)
async def create_post(
    request: BlueskyPostRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a post on Bluesky.
    Uses linked account credentials.
    """
    # 1. Get credentials from current user
    # Note: verify_credentials in /connect ensures we have valid ones, hopefully.
    # We need to fetch the full user record again to be sure we have the password (if it's not in current_user dependency)
    # The current_user dependency usually returns the user dict *without* password_hash, but let's check if we return custom fields.
    # AuthService.get_user_by_id returns the user dict. If we added the fields to the schema, they should be there.
    # However, AuthService usually strips sensitive data. We might need a direct DB fetch or ensure 'bluesky_password' isn't stripped by default getters BUT stripped in the Pydantic response.
    
    # Let's re-fetch user to getting internal fields if needed, or rely on current_user if it includes it.
    # To be safe and secure, we should fetch specifically for this operation or ensure it's loaded.
    # Since we modified the user schema to *exclude* bluesky_password in response model, it might be hidden in API responses but present in the dict if not explicitly popped.
    
    # Let's check AuthService.get_user_by_id logic: it returns dict.
    # If we saved it to DB, it should be in the dict unless we popped it.
    
    user_full = AuthService.get_user_by_id(current_user["id"])
    if not user_full:
        raise HTTPException(status_code=404, detail="User not found")

    handle = user_full.get("bluesky_handle")
    password = user_full.get("bluesky_password")
    
    if not handle or not password:
        raise HTTPException(
            status_code=400, 
            detail="Bluesky account not linked. Please connect your account first via /bluesky/connect"
        )

    # 2. Post
    if request.video_path:
        return bluesky_service.post_video(
            identifier=handle,
            password=password,
            text=request.text, 
            video_path=request.video_path,
            alt_text=request.alt_text or "Video"
        )
    elif request.image_path:
        return bluesky_service.post_image(
            identifier=handle,
            password=password,
            text=request.text, 
            image_path=request.image_path,
            alt_text=request.alt_text or ""
        )
    else:
        return bluesky_service.post_text(
            identifier=handle,
            password=password,
            text=request.text
        )
