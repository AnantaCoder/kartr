"""
Campaign Pydantic schemas for request/response validation.

Provides schemas for sponsor campaign management:
- Campaign CRUD operations
- Influencer matching and discovery
- Performance tracking
"""
from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    """Schema for creating a new campaign."""
    name: str = Field(..., min_length=3, max_length=128)
    description: str = Field(..., min_length=10, max_length=2000)
    niche: str = Field(..., min_length=2, max_length=64)
    target_audience: Optional[str] = Field(None, max_length=500)
    budget_min: Optional[float] = Field(None, ge=0)
    budget_max: Optional[float] = Field(None, ge=0)
    keywords: List[str] = Field(default_factory=list)
    requirements: Optional[str] = Field(None, max_length=1000)


class CampaignUpdate(BaseModel):
    """Schema for updating a campaign."""
    name: Optional[str] = Field(None, min_length=3, max_length=128)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    niche: Optional[str] = Field(None, min_length=2, max_length=64)
    target_audience: Optional[str] = Field(None, max_length=500)
    budget_min: Optional[float] = Field(None, ge=0)
    budget_max: Optional[float] = Field(None, ge=0)
    keywords: Optional[List[str]] = None
    requirements: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(draft|active|paused|completed)$")


class CampaignResponse(BaseModel):
    """Full campaign details response."""
    id: str
    sponsor_id: str
    name: str
    description: str
    niche: str
    target_audience: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    keywords: List[str] = []
    requirements: Optional[str] = None
    status: str = "draft"
    created_at: Union[datetime, str]
    updated_at: Union[datetime, str]
    matched_influencers_count: int = 0
    
    class Config:
        from_attributes = True


class CampaignListResponse(BaseModel):
    """Paginated campaign list."""
    campaigns: List[CampaignResponse]
    total_count: int
    page: int
    page_size: int


class InfluencerMatch(BaseModel):
    """Matched influencer for a campaign."""
    influencer_id: str
    username: str
    full_name: Optional[str] = ""
    relevance_score: float = Field(..., ge=0, le=100)
    matching_keywords: List[str] = []
    channel_stats: Optional[dict] = None
    ai_analysis: Optional[str] = None
    status: str = "suggested"


class CampaignInfluencersResponse(BaseModel):
    """Campaign with matched influencers."""
    campaign: CampaignResponse
    matched_influencers: List[InfluencerMatch]
    total_matches: int


class AddInfluencerRequest(BaseModel):
    """Add an influencer to a campaign."""
    influencer_id: str
    notes: Optional[str] = None
