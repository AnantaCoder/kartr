"""
Social media and virtual influencer Pydantic schemas for request/response validation
"""
from typing import Optional, List
from pydantic import BaseModel


class VirtualInfluencer(BaseModel):
    """Virtual influencer data"""
    id: str
    name: str
    description: str
    avatar_url: Optional[str] = None
    specialties: List[str] = []
    price_range: Optional[str] = None


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
