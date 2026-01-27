"""
Campaign Service - Business logic for campaign management.

Provides methods for sponsors to:
- Create and manage campaigns
- Find matching influencers using AI + keyword matching
- Track campaign performance
"""
import logging
import re
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from database import (
    get_mock_db,
    is_firebase_configured
)

logger = logging.getLogger(__name__)


class CampaignService:
    """Service for sponsor campaign operations."""
    
    # In-memory storage for campaigns (will be replaced with Firebase)
    _campaigns: Dict[str, Dict[str, Any]] = {}
    _campaign_influencers: Dict[str, List[Dict[str, Any]]] = {}
    
    @staticmethod
    def create_campaign(sponsor_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new campaign for a sponsor.
        
        Args:
            sponsor_id: ID of the sponsor creating the campaign
            data: Campaign data from CampaignCreate schema
            
        Returns:
            Created campaign data
        """
        campaign_id = f"campaign_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow().isoformat()
        
        campaign = {
            "id": campaign_id,
            "sponsor_id": sponsor_id,
            "name": data.get("name"),
            "description": data.get("description"),
            "niche": data.get("niche"),
            "target_audience": data.get("target_audience"),
            "budget_min": data.get("budget_min"),
            "budget_max": data.get("budget_max"),
            "keywords": data.get("keywords", []),
            "requirements": data.get("requirements"),
            "status": "draft",
            "created_at": now,
            "updated_at": now,
            "matched_influencers_count": 0
        }
        
        CampaignService._campaigns[campaign_id] = campaign
        CampaignService._campaign_influencers[campaign_id] = []
        
        logger.info(f"Created campaign {campaign_id} for sponsor {sponsor_id}")
        
        return campaign
    
    @staticmethod
    def list_campaigns(
        sponsor_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        List campaigns for a sponsor.
        
        Args:
            sponsor_id: Sponsor's ID
            page: Page number
            page_size: Items per page
            
        Returns:
            Paginated campaign list
        """
        campaigns = [
            c for c in CampaignService._campaigns.values()
            if c.get("sponsor_id") == sponsor_id
        ]
        
        # Sort by created_at descending
        campaigns.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        total_count = len(campaigns)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        return {
            "campaigns": campaigns[start_idx:end_idx],
            "total_count": total_count,
            "page": page,
            "page_size": page_size
        }
    
    @staticmethod
    def get_campaign(campaign_id: str, sponsor_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get campaign by ID.
        
        Args:
            campaign_id: Campaign's ID
            sponsor_id: If provided, verify ownership
            
        Returns:
            Campaign data or None
        """
        campaign = CampaignService._campaigns.get(campaign_id)
        
        if not campaign:
            return None
        
        if sponsor_id and campaign.get("sponsor_id") != sponsor_id:
            return None
        
        return campaign
    
    @staticmethod
    def update_campaign(
        campaign_id: str,
        sponsor_id: str,
        data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Update a campaign.
        
        Args:
            campaign_id: Campaign's ID
            sponsor_id: Sponsor's ID (for ownership check)
            data: Fields to update
            
        Returns:
            Updated campaign or None
        """
        campaign = CampaignService.get_campaign(campaign_id, sponsor_id)
        
        if not campaign:
            return None
        
        # Update only provided fields
        for key, value in data.items():
            if value is not None and key not in ["id", "sponsor_id", "created_at"]:
                campaign[key] = value
        
        campaign["updated_at"] = datetime.utcnow().isoformat()
        CampaignService._campaigns[campaign_id] = campaign
        
        return campaign
    
    @staticmethod
    def delete_campaign(campaign_id: str, sponsor_id: str) -> bool:
        """
        Delete a campaign.
        
        Args:
            campaign_id: Campaign's ID
            sponsor_id: Sponsor's ID (for ownership check)
            
        Returns:
            True if deleted successfully
        """
        campaign = CampaignService.get_campaign(campaign_id, sponsor_id)
        
        if not campaign:
            return False
        
        del CampaignService._campaigns[campaign_id]
        
        if campaign_id in CampaignService._campaign_influencers:
            del CampaignService._campaign_influencers[campaign_id]
        
        logger.info(f"Deleted campaign {campaign_id}")
        
        return True
    
    @staticmethod
    def find_matching_influencers(
        campaign_id: str,
        sponsor_id: str
    ) -> List[Dict[str, Any]]:
        """
        Find influencers matching a campaign using AI + YouTube analytics.
        
        Uses the InfluencerDiscoveryService for:
        - Keyword matching against influencer profiles
        - YouTube channel content analysis
        - Gemini AI semantic relevance scoring
        
        Args:
            campaign_id: Campaign's ID
            sponsor_id: Sponsor's ID
            
        Returns:
            List of matched influencers with scores and analytics
        """
        campaign = CampaignService.get_campaign(campaign_id, sponsor_id)
        
        if not campaign:
            return []
        
        # Use the AI-powered discovery service
        from services.influencer_discovery_service import influencer_discovery_service
        
        matched = influencer_discovery_service.discover_influencers(
            niche=campaign.get("niche", ""),
            keywords=campaign.get("keywords", []),
            campaign_description=campaign.get("description", ""),
            budget_min=campaign.get("budget_min"),
            budget_max=campaign.get("budget_max"),
            limit=20
        )
        
        # Update campaign with matched count
        campaign["matched_influencers_count"] = len(matched)
        CampaignService._campaigns[campaign_id] = campaign
        
        logger.info(f"Found {len(matched)} matching influencers for campaign {campaign_id}")
        
        return matched
    
    @staticmethod
    def add_influencer_to_campaign(
        campaign_id: str,
        sponsor_id: str,
        influencer_id: str,
        notes: Optional[str] = None
    ) -> bool:
        """
        Manually add an influencer to a campaign.
        
        Args:
            campaign_id: Campaign's ID
            sponsor_id: Sponsor's ID
            influencer_id: Influencer's ID
            notes: Optional notes about the influencer
            
        Returns:
            True if added successfully
        """
        campaign = CampaignService.get_campaign(campaign_id, sponsor_id)
        
        if not campaign:
            return False
        
        if campaign_id not in CampaignService._campaign_influencers:
            CampaignService._campaign_influencers[campaign_id] = []
        
        # Check if already added
        existing = [
            i for i in CampaignService._campaign_influencers[campaign_id]
            if i.get("influencer_id") == influencer_id
        ]
        
        if existing:
            return False
        
        CampaignService._campaign_influencers[campaign_id].append({
            "influencer_id": influencer_id,
            "notes": notes,
            "status": "invited",
            "added_at": datetime.utcnow().isoformat()
        })
        
        return True
    
    @staticmethod
    def get_campaign_influencers(
        campaign_id: str,
        sponsor_id: str
    ) -> List[Dict[str, Any]]:
        """Get all influencers associated with a campaign."""
        campaign = CampaignService.get_campaign(campaign_id, sponsor_id)
        
        if not campaign:
            return []
        
        return CampaignService._campaign_influencers.get(campaign_id, [])
    
    @staticmethod
    def _extract_keywords(text: str) -> List[str]:
        """Extract keywords from text using simple regex."""
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            "this", "that", "with", "from", "have", "been", "were", "will",
            "would", "could", "should", "about", "their", "what", "when",
            "where", "which", "while", "more", "other", "some", "than"
        }
        
        return [w for w in words if w not in stop_words][:10]
    
    @staticmethod
    def _calculate_match_score(
        influencer: Dict[str, Any],
        keywords: set,
        niche: str
    ) -> float:
        """Calculate match score between influencer and campaign."""
        score = 0.0
        
        username = influencer.get("username", "").lower()
        full_name = influencer.get("full_name", "").lower()
        
        # Check keyword matches in profile
        for keyword in keywords:
            if keyword in username or keyword in full_name:
                score += 20
        
        # Check niche match
        if niche and (niche in username or niche in full_name):
            score += 30
        
        # Base score for being an influencer
        if influencer.get("user_type") == "influencer":
            score += 10
        
        return min(score, 100)
