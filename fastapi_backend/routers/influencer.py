
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from utils.dependencies import get_current_user
from services.youtube_service import youtube_service
from services.analysis_service import analyze_influencer_sponsors

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/influencer", tags=["Influencer Insights"])

@router.get("/analytics/{video_id}")
async def get_advanced_analytics(video_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get advanced analytics for a specific video/influencer.
    """
    try:
        # Fetch base stats
        video_stats = youtube_service.get_video_stats(video_id)
        if "error" in video_stats:
            raise HTTPException(status_code=404, detail=video_stats["error"])
        
        # Perform AI Analysis for sentiment and niche
        analysis_result = analyze_influencer_sponsors(video_id)
        analysis = analysis_result.get("analysis", {})
        
        # Calculate Advanced Metrics
        view_count = video_stats.get("view_count", 0)
        like_count = video_stats.get("like_count", 0)
        comment_count = video_stats.get("comment_count", 0)
        
        engagement_rate = 0
        if view_count > 0:
            engagement_rate = ((like_count + comment_count) / view_count) * 100
        
        # Mocking some historical/advanced data for demo purposes
        sentiment_score = 85 if analysis.get("sentiment") == "Positive" else 50
        niche = analysis.get("influencer_niche", "Tech")
        
        # Predefined Sponsor Logic (matching recommendations_map)
        top_sponsors = {
            "Tech": "NordVPN",
            "Gaming": "Razer",
            "Lifestyle": "HelloFresh",
            "Business": "Shopify"
        }
        suggested_partner = top_sponsors.get(niche, "NordVPN")
        
        analytics = {
            "engagement_rate": round(engagement_rate, 2),
            "sentiment_score": sentiment_score,
            "niche": niche,
            "audience_retention_estimate": 72.5,
            "brand_safety_score": 98.0,
            "growth_potential": "High" if engagement_rate > 5 else "Moderate",
            "suggested_partner": suggested_partner # New: Include name directly
        }
        
        return {
            "video_id": video_id,
            "title": video_stats.get("title"),
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"Error fetching advanced analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{niche}")
async def get_potential_sponsors(niche: str, current_user: dict = Depends(get_current_user)):
    """
    Recommend potential sponsors based on the influencer's niche.
    """
    # Logic: Match niche with industry
    # This uses a predefined mapping or common sponsor profiles for demo purposes
    recommendations_map = {
        "Tech": [
            {"name": "NordVPN", "industry": "Cybersecurity", "fit_score": 95, "reason": "High affinity with tech audience"},
            {"name": "Skillshare", "industry": "Education", "fit_score": 88, "reason": "Matches creative tech skills"},
            {"name": "Honey", "industry": "Ecommerce", "fit_score": 82, "reason": "Popular with savvy shoppers"}
        ],
        "Gaming": [
            {"name": "Razer", "industry": "Hardware", "fit_score": 92, "reason": "Direct overlap with gamers"},
            {"name": "GFuel", "industry": "Beverage", "fit_score": 90, "reason": "Strong gaming brand presence"},
            {"name": "Epic Games", "industry": "Entertainment", "fit_score": 85, "reason": "Core gaming platform"}
        ],
        "Lifestyle": [
            {"name": "HelloFresh", "industry": "Food & Beverage", "fit_score": 94, "reason": "Perfect for household demographics"},
            {"name": "Casper", "industry": "Home Decor", "fit_score": 87, "reason": "Home-focused lifestyle fit"},
            {"name": "Warby Parker", "industry": "Fashion", "fit_score": 80, "reason": "Trendy lifestyle accessory"}
        ],
        "Business": [
            {"name": "Shopify", "industry": "Ecommerce", "fit_score": 96, "reason": "Entrepreneurial audience match"},
            {"name": "HubSpot", "industry": "Software", "fit_score": 91, "reason": "B2B marketing focus"},
            {"name": "American Express", "industry": "Finance", "fit_score": 85, "reason": "High-net-worth business reach"}
        ]
    }
    
    # Simple lookup with default
    recommended = recommendations_map.get(niche, recommendations_map["Tech"])
    
    return {
        "niche": niche,
        "potential_sponsors": recommended
    }

from fastapi.responses import PlainTextResponse

@router.get("/export-pitch-deck/{video_id}", response_class=PlainTextResponse)
async def export_pitch_deck(video_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generate and export a professional Pitch Deck in Markdown format.
    """
    try:
        # Fetch data (same logic as analytics for consistency)
        video_stats = youtube_service.get_video_stats(video_id)
        analysis_result = analyze_influencer_sponsors(video_id)
        analysis = analysis_result.get("analysis", {})
        
        view_count = video_stats.get("view_count", 0)
        like_count = video_stats.get("like_count", 0)
        comment_count = video_stats.get("comment_count", 0)
        engagement_rate = round(((like_count + comment_count) / view_count * 100), 2) if view_count > 0 else 0
        
        niche = analysis.get("influencer_niche", "Tech")
        
        # Build Markdown
        pitch_deck = f"""# KARTR INFLUENCER PITCH DECK
---
## Video: {video_stats.get('title', 'Untitled')}
**Channel:** {video_stats.get('channel_title', 'Unknown')}
**Date Generated:** {current_user.get('email', 'User')} - 2026

### 📈 Performance Metrics
- **Views:** {view_count:,}
- **Engagement Rate:** {engagement_rate}%
- **Sentiment Score:** {"Positive" if analysis.get('sentiment') == "Positive" else "Neutral"}
- **Brand Safety Score:** 98/100

### 🎯 Content Strategy
- **Niche Alignment:** {niche}
- **Key Topics:** {", ".join(analysis.get('key_topics', []))}
- **Summary:** {analysis.get('content_summary', '')}

### 💼 Recommended Brand Partnerships
Based on our AI matching engine, here are top sponsors for this content:
1. **Brand 1:** High affinity with {niche} audience.
2. **Brand 2:** Strong alignment with engagement metrics.
3. **Brand 3:** Matches creator's core demographic.

---
*Generated by Kartr - AI-Powered Influencer Ecosystem*
"""
        return PlainTextResponse(content=pitch_deck, media_type="text/markdown", headers={
            "Content-Disposition": f"attachment; filename=Pitch_Deck_{video_id}.md"
        })
    except Exception as e:
        logger.error(f"Error exporting pitch deck: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate pitch deck")

@router.get("/top-influencers/{niche}")
async def get_top_influencers(niche: str, current_user: dict = Depends(get_current_user)):
    """
    Get top influencers in a specific niche for brands to discover.
    """
    influencers_map = {
        "Tech": [
            {"name": "Marques Brownlee", "handle": "@mkbhd", "engagement_rate": 8.5, "subscribers": "18.5M", "score": 98},
            {"name": "Linus Tech Tips", "handle": "@LinusTechTips", "engagement_rate": 7.2, "subscribers": "15.6M", "score": 95},
            {"name": "iJustine", "handle": "@ijustine", "engagement_rate": 6.8, "subscribers": "7.1M", "score": 92}
        ],
        "Gaming": [
            {"name": "PewDiePie", "handle": "@pewdiepie", "engagement_rate": 5.4, "subscribers": "111M", "score": 97},
            {"name": "MrBeast Gaming", "handle": "@mrbeastgaming", "engagement_rate": 12.1, "subscribers": "40M", "score": 99},
            {"name": "Markiplier", "handle": "@markiplier", "engagement_rate": 7.8, "subscribers": "36M", "score": 96}
        ],
        "Lifestyle": [
            {"name": "Casey Neistat", "handle": "@casey", "engagement_rate": 9.2, "subscribers": "12.6M", "score": 94},
            {"name": "Emma Chamberlain", "handle": "@emmachamberlain", "engagement_rate": 11.5, "subscribers": "12M", "score": 98},
            {"name": "Zoe Sugg", "handle": "@zoesugg", "engagement_rate": 5.5, "subscribers": "10M", "score": 89}
        ],
        "Business": [
            {"name": "GaryVee", "handle": "@garyvee", "engagement_rate": 4.5, "subscribers": "4.2M", "score": 93},
            {"name": "Graham Stephan", "handle": "@grahamstephan", "engagement_rate": 6.1, "subscribers": "4.5M", "score": 91},
            {"name": "Ali Abdaal", "handle": "@aliabdaal", "engagement_rate": 7.4, "subscribers": "5.2M", "score": 95}
        ]
    }
    
    return {
        "niche": niche,
        "top_influencers": influencers_map.get(niche, influencers_map["Tech"])
    }
