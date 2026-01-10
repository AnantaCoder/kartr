"""
Virtual Influencer router
"""
import logging
from typing import List
from fastapi import APIRouter, Depends
from models.schemas import VirtualInfluencer
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/virtual-influencers", tags=["Virtual Influencer"])


def get_available_virtual_influencers() -> List[dict]:
    """Get list of available virtual influencers"""
    # This would typically come from a database
    return [
        {
            "id": "vi_001",
            "name": "Luna Digital",
            "description": "AI-powered lifestyle and fashion influencer with engaging content creation abilities.",
            "avatar_url": "/static/images/virtual_influencer_1.png",
            "specialties": ["Fashion", "Lifestyle", "Beauty"],
            "price_range": "$500 - $2000 per post"
        },
        {
            "id": "vi_002",
            "name": "TechBot Max",
            "description": "Virtual tech reviewer and gadget enthusiast for product demonstrations.",
            "avatar_url": "/static/images/virtual_influencer_2.png",
            "specialties": ["Technology", "Gaming", "Reviews"],
            "price_range": "$750 - $3000 per video"
        },
        {
            "id": "vi_003",
            "name": "FitVirtual",
            "description": "AI fitness coach and wellness advocate for health brand partnerships.",
            "avatar_url": "/static/images/virtual_influencer_3.png",
            "specialties": ["Fitness", "Health", "Nutrition"],
            "price_range": "$400 - $1500 per campaign"
        },
        {
            "id": "vi_004",
            "name": "Artisan AI",
            "description": "Creative virtual artist for design and art-focused brand collaborations.",
            "avatar_url": "/static/images/virtual_influencer_4.png",
            "specialties": ["Art", "Design", "Creativity"],
            "price_range": "$600 - $2500 per project"
        },
    ]


@router.get("", response_model=List[VirtualInfluencer])
async def list_virtual_influencers(current_user: dict = Depends(get_current_user)):
    """
    Get list of available virtual influencers for rent.
    """
    influencers = get_available_virtual_influencers()
    return [VirtualInfluencer(**inf) for inf in influencers]


@router.get("/{influencer_id}")
async def get_virtual_influencer(
    influencer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get details of a specific virtual influencer.
    """
    influencers = get_available_virtual_influencers()
    
    for inf in influencers:
        if inf["id"] == influencer_id:
            return VirtualInfluencer(**inf)
    
    return {"error": "Virtual influencer not found"}
