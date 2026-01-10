"""
Authentication router - Login, Register, Logout, Google OAuth, Password Reset
"""
import logging
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import RedirectResponse
from models.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    ForgotPasswordRequest,
    OTPVerifyRequest,
    MessageResponse,
)
from services.auth_service import AuthService
from utils.security import verify_otp
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# =========================================
# User Registration
# =========================================

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user (influencer or sponsor).
    
    - **username**: Unique username (3-64 characters)
    - **email**: Valid email address
    - **password**: Password (min 8 characters)
    - **user_type**: Either 'influencer' or 'sponsor'
    - **full_name**: User's full name (optional)
    
    Returns JWT token on successful registration.
    """
    success, user, error = AuthService.create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        user_type=user_data.user_type,
        full_name=getattr(user_data, 'full_name', '') or ''
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error or "Registration failed"
        )
    
    token = AuthService.generate_token(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            user_type=user["user_type"],
            full_name=user.get("full_name", ""),
            date_registered=user.get("date_registered", ""),
            email_visible=user.get("email_visible", False)
        )
    )


# =========================================
# Email/Password Login
# =========================================

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """
    Login with email and password.
    
    - **email**: Your registered email
    - **password**: Your password
    
    Returns JWT token on successful authentication.
    """
    success, user, error = AuthService.authenticate_user(
        email=login_data.email,
        password=login_data.password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error or "Invalid email or password"
        )
    
    token = AuthService.generate_token(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            user_type=user["user_type"],
            full_name=user.get("full_name", ""),
            date_registered=user.get("date_registered", ""),
            email_visible=user.get("email_visible", False)
        )
    )


# =========================================
# Google OAuth (via Supabase)
# =========================================

@router.get("/google")
async def google_login(
    redirect_url: str = Query(default="http://localhost:8000/api/auth/callback")
):
    """
    Initiate Google OAuth login via Supabase.
    
    - **redirect_url**: URL to redirect after successful login
    
    Redirects to Google OAuth consent screen.
    """
    success, oauth_url, error = AuthService.get_google_oauth_url(redirect_url)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=error or "Google OAuth not available"
        )
    
    return RedirectResponse(url=oauth_url)


@router.get("/callback")
async def oauth_callback(
    access_token: str = Query(None),
    refresh_token: str = Query(None),
    error: str = Query(None),
    error_description: str = Query(None)
):
    """
    Handle OAuth callback from Supabase.
    
    This endpoint receives the tokens after successful Google login.
    Returns JWT token for the application.
    """
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_description or error
        )
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No access token received"
        )
    
    success, user, error_msg = AuthService.handle_oauth_callback(access_token, refresh_token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_msg or "OAuth authentication failed"
        )
    
    token = AuthService.generate_token(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            user_type=user["user_type"],
            full_name=user.get("full_name", ""),
            date_registered=user.get("date_registered", ""),
            email_visible=user.get("email_visible", False)
        )
    )


# =========================================
# Logout
# =========================================

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user.
    
    Note: JWT tokens are stateless. For complete logout,
    the client should discard the token.
    """
    return MessageResponse(
        success=True,
        message="Logged out successfully"
    )


# =========================================
# Password Reset
# =========================================

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request password reset.
    
    - **email**: Your registered email address
    
    Sends password reset email via Supabase or OTP.
    """
    user = AuthService.get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found. Please register first."
        )
    
    success, error = AuthService.send_password_reset(request.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error or "Failed to send password reset"
        )
    
    return MessageResponse(
        success=True,
        message="Password reset instructions sent to your email"
    )


@router.post("/verify-otp", response_model=Token)
async def verify_otp_endpoint(request: OTPVerifyRequest):
    """
    Verify OTP and login user.
    
    - **email**: Your email address
    - **otp**: 6-digit OTP received via email
    """
    if not verify_otp(request.email, request.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    user = AuthService.get_user_by_email(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    token = AuthService.generate_token(user)
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            user_type=user["user_type"],
            full_name=user.get("full_name", ""),
            date_registered=user.get("date_registered", ""),
            email_visible=user.get("email_visible", False)
        )
    )


# =========================================
# Current User
# =========================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    
    Requires valid JWT token in Authorization header.
    """
    return UserResponse(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user["email"],
        user_type=current_user["user_type"],
        full_name=current_user.get("full_name", ""),
        date_registered=current_user.get("date_registered", ""),
        email_visible=current_user.get("email_visible", False)
    )
