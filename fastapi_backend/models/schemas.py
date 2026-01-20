"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, EmailStr, Field


# ============================================
# Authentication Schemas
# ============================================

class UserCreate(BaseModel):
    """Schema for user registration"""
    username: str = Field(..., min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(..., min_length=8)
    user_type: str = Field(..., pattern="^(influencer|sponsor)$")
    full_name: Optional[str] = Field(default="", max_length=128)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response - supports both Firebase (string) and SQL (int) IDs"""
    id: Union[int, str]
    username: str
    email: str
    user_type: str
    full_name: Optional[str] = ""
    date_registered: Union[datetime, str]  # Accept both datetime and ISO string
    email_visible: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request"""
    email: EmailStr


class OTPVerifyRequest(BaseModel):
    """Schema for OTP verification"""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class GoogleLoginRequest(BaseModel):
    """Schema for Google Login using Firebase ID token"""
    id_token: str
    user_type: Optional[str] = "influencer"  # Default to influencer if not specified




# ============================================
# YouTube Schemas
# ============================================

class YouTubeStatsRequest(BaseModel):
    """Schema for YouTube stats request"""
    youtube_url: str


class VideoStats(BaseModel):
    """Video statistics"""
    video_id: str
    title: str
    description: Optional[str] = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    published_at: Optional[str] = None
    thumbnail_url: Optional[str] = None


class ChannelStats(BaseModel):
    """Channel statistics"""
    channel_id: str
    title: str
    subscriber_count: int = 0
    video_count: int = 0
    view_count: int = 0
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None


class YouTubeStatsResponse(BaseModel):
    """Response for YouTube stats"""
    video_stats: Optional[VideoStats] = None
    channel_stats: Optional[ChannelStats] = None
    error: Optional[str] = None


class AnalyzeVideoRequest(BaseModel):
    """Request to analyze a video for influencer and sponsor information"""
    video_url: str = Field(..., description="YouTube video URL to analyze")


class VideoAnalysis(BaseModel):
    """AI-generated analysis of a video"""
    is_sponsored: Optional[bool] = Field(None, description="Whether the video appears to be sponsored")
    sponsor_name: Optional[str] = Field(None, description="Name of the sponsor if detected")
    sponsor_industry: Optional[str] = Field(None, description="Industry of the sponsor")
    influencer_niche: Optional[str] = Field(None, description="Primary content niche of the creator")
    content_summary: Optional[str] = Field(None, description="Brief summary of the video content")
    sentiment: Optional[str] = Field(None, description="Overall sentiment: Positive, Neutral, or Negative")
    key_topics: Optional[List[str]] = Field(default=[], description="Main topics discussed in the video")
    error: Optional[str] = Field(None, description="Error message if analysis failed")


class AnalyzeVideoResponse(BaseModel):
    """Response from video analysis endpoint with Gemini AI insights"""
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., description="Video title")
    description: Optional[str] = Field(None, description="Video description")
    view_count: int = Field(0, description="Number of views")
    like_count: int = Field(0, description="Number of likes")
    comment_count: int = Field(0, description="Number of comments")
    published_at: Optional[str] = Field(None, description="Video publish date (ISO format)")
    thumbnail_url: Optional[str] = Field(None, description="URL to video thumbnail")
    channel_id: Optional[str] = Field(None, description="YouTube channel ID")
    channel_title: Optional[str] = Field(None, description="Channel name")
    tags: Optional[List[str]] = Field(default=[], description="Video tags")
    analysis: Optional[VideoAnalysis] = Field(None, description="AI-generated analysis from Gemini")
    gemini_raw_response: Optional[str] = Field(None, description="Raw text response from Gemini AI")
    error: Optional[str] = Field(None, description="Error message if video fetch failed")


class AnalyzeChannelRequest(BaseModel):
    """Request to analyze a channel"""
    channel_id: str
    max_videos: int = 5


class YouTubeChannelResponse(BaseModel):
    """Response for linked YouTube channel"""
    id: int
    channel_id: str
    title: str
    subscriber_count: Optional[int] = None
    video_count: Optional[int] = None
    view_count: Optional[int] = None
    date_added: datetime
    date_updated: datetime


class SaveAnalysisRequest(BaseModel):
    """Request to save analysis"""
    video_title: str
    channel_name: str
    creator_name: str
    creator_industry: str
    sponsors: Optional[List[dict]] = None


# ============================================
# Search Schemas
# ============================================

class SearchRequest(BaseModel):
    """Schema for search request"""
    query: str = Field(..., min_length=1)


class SearchResult(BaseModel):
    """Single search result"""
    id: str
    text: str
    type: str
    email: Optional[str] = None


class SearchResponse(BaseModel):
    """Response for search"""
    channels: List[dict] = []
    users: List[dict] = []
    query: str


class SearchSuggestion(BaseModel):
    """Search suggestion for autocomplete"""
    id: str
    text: str
    type: str
    email: Optional[str] = None


# ============================================
# Virtual Influencer Schemas
# ============================================

class VirtualInfluencer(BaseModel):
    """Virtual influencer data"""
    id: str
    name: str
    description: str
    avatar_url: Optional[str] = None
    specialties: List[str] = []
    price_range: Optional[str] = None


# ============================================
# Social Media Schemas
# ============================================

class SocialMediaAgent(BaseModel):
    """Social media agent data"""
    id: str
    name: str
    platform: str
    description: str
    capabilities: List[str] = []


class BlueskyPostRequest(BaseModel):
    """Request to post to Bluesky"""
    text: str
    image_path: Optional[str] = None


class BlueskyPostResponse(BaseModel):
    """Response from Bluesky post"""
    success: bool
    message: Optional[str] = None
    post_uri: Optional[str] = None


# ============================================
# Image Generation Schemas
# ============================================

class GenerateImageRequest(BaseModel):
    """Request to generate promotional image"""
    prompt: str
    brand_name: str = "YourBrand"


class GenerateLLMImageRequest(BaseModel):
    """Request to generate LLM influencer image"""
    prompt: str


class ImageGenerationResponse(BaseModel):
    """Response for image generation"""
    success: bool
    image_base64: Optional[str] = None
    error: Optional[str] = None


# ============================================
# Graph/Visualization Schemas
# ============================================

class GraphData(BaseModel):
    """Graph data for visualization"""
    nodes: List[dict] = []
    edges: List[dict] = []


class QuestionRequest(BaseModel):
    """Request for RAG question answering"""
    question: str


class QuestionResponse(BaseModel):
    """Response for question answering"""
    answer: str


# ============================================
# User/Utility Schemas
# ============================================

class EmailVisibilityRequest(BaseModel):
    """Request to toggle email visibility"""
    email_visible: bool


class PlatformStats(BaseModel):
    """Platform statistics"""
    influencers: int = 0
    sponsors: int = 0
    total_users: int = 0
    partnerships: int = 0


class MessageResponse(BaseModel):
    """Generic message response"""
    success: bool
    message: str


# ============================================
# AI Chat Schemas
# ============================================

class ChatMessage(BaseModel):
    """A single chat message"""
    id: str
    conversation_id: str
    user_id: str
    content: str
    role: str = Field(..., pattern="^(user|assistant)$")
    created_at: str


class ChatConversation(BaseModel):
    """A chat conversation"""
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int = 0
    is_active: bool = True


class CreateConversationRequest(BaseModel):
    """Request to create a new conversation"""
    title: Optional[str] = Field(default=None, max_length=255)


class CreateConversationResponse(BaseModel):
    """Response for conversation creation"""
    success: bool
    conversation: Optional[ChatConversation] = None
    error: Optional[str] = None


class SendMessageRequest(BaseModel):
    """Request to send a chat message"""
    message: str = Field(..., min_length=1, max_length=10000)


class SendMessageResponse(BaseModel):
    """Response for sending a message"""
    success: bool
    user_message: Optional[ChatMessage] = None
    assistant_message: Optional[ChatMessage] = None
    error: Optional[str] = None


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int
    page_size: int
    total_count: int
    total_pages: int
    has_next: bool
    has_previous: bool


class ConversationsListResponse(BaseModel):
    """Paginated list of conversations"""
    success: bool
    conversations: List[ChatConversation] = []
    pagination: Optional[PaginationMeta] = None
    error: Optional[str] = None


class MessagesListResponse(BaseModel):
    """Paginated list of messages"""
    success: bool
    messages: List[ChatMessage] = []
    pagination: Optional[PaginationMeta] = None
    error: Optional[str] = None


class UpdateConversationTitleRequest(BaseModel):
    """Request to update conversation title"""
    title: str = Field(..., min_length=1, max_length=255)


class DeleteConversationResponse(BaseModel):
    """Response for deleting a conversation"""
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
