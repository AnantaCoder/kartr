"""
YouTube router - Stats, Demo, Channel Analysis
"""
import logging
import os
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from models.schemas import (
    YouTubeStatsRequest,
    YouTubeStatsResponse,
    VideoStats,
    ChannelStats,
    AnalyzeVideoRequest,
    AnalyzeVideoResponse,
    AnalyzeChannelRequest,
    SaveAnalysisRequest,
    YouTubeChannelResponse,
    MessageResponse,
)
from services.youtube_service import youtube_service
from utils.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/youtube", tags=["YouTube Analytics"])


@router.post("/stats", response_model=YouTubeStatsResponse)
async def get_youtube_stats(
    request: YouTubeStatsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Get statistics for a YouTube video/channel.
    """
    youtube_url = request.youtube_url
    
    # Get video stats
    video_data = youtube_service.get_video_stats(youtube_url)
    
    if video_data and "error" in video_data:
        return YouTubeStatsResponse(error=video_data["error"])
    
    video_stats = None
    channel_stats = None
    
    if video_data:
        video_stats = VideoStats(
            video_id=video_data.get("video_id", ""),
            title=video_data.get("title", ""),
            description=video_data.get("description", ""),
            view_count=video_data.get("view_count", 0),
            like_count=video_data.get("like_count", 0),
            comment_count=video_data.get("comment_count", 0),
            published_at=video_data.get("published_at", ""),
            thumbnail_url=video_data.get("thumbnail_url", ""),
        )
        
        # Get channel stats from video
        channel_id = video_data.get("channel_id")
        if channel_id:
            channel_data = youtube_service.get_channel_stats(channel_id)
            if channel_data and "error" not in channel_data:
                channel_stats = ChannelStats(
                    channel_id=channel_data.get("channel_id", ""),
                    title=channel_data.get("title", ""),
                    subscriber_count=channel_data.get("subscriber_count", 0),
                    video_count=channel_data.get("video_count", 0),
                    view_count=channel_data.get("view_count", 0),
                    description=channel_data.get("description", ""),
                    thumbnail_url=channel_data.get("thumbnail_url", ""),
                )
                
                # Save channel to user's linked channels
                youtube_service.save_channel(current_user["id"], channel_data)
    
    # Save search history
    youtube_service.save_search(
        user_id=current_user["id"],
        search_term=youtube_url,
        video_id=video_stats.video_id if video_stats else None
    )
    
    return YouTubeStatsResponse(
        video_stats=video_stats,
        channel_stats=channel_stats
    )


@router.post("/demo")
async def extract_video_info(
    request: YouTubeStatsRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Extract detailed information from a YouTube video for sponsors/influencers.
    """
    youtube_url = request.youtube_url
    
    # Get video stats
    video_data = youtube_service.get_video_stats(youtube_url)
    
    if not video_data or "error" in video_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=video_data.get("error", "Could not extract video information")
        )
    
    # Save search
    youtube_service.save_search(
        user_id=current_user["id"],
        search_term=youtube_url,
        video_id=video_data.get("video_id")
    )
    
    return video_data


@router.post(
    "/analyze-video",
    response_model=AnalyzeVideoResponse,
    summary="Analyze YouTube Video with AI",
    description="""
    Analyzes a YouTube video for influencer marketing and sponsorship information using Gemini AI.
    
    **Features:**
    - Fetches video metadata (title, description, views, likes, etc.)
    - Uses Gemini AI to analyze the content for sponsorship detection
    - Identifies sponsor name and industry
    - Determines influencer niche and content sentiment
    - Extracts key topics from the video
    
    **Response includes:**
    - Video statistics and metadata
    - AI-generated analysis with sponsorship details
    - Raw Gemini response for debugging
    """,
    responses={
        200: {"description": "Video analyzed successfully"},
        400: {"description": "Invalid video URL"},
        500: {"description": "Analysis failed"}
    }
)
async def analyze_video(
    request: AnalyzeVideoRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze a YouTube video for influencer and sponsor information.
    Uses Gemini AI for content analysis.
    """
    try:
        from services.analysis_service import analyze_influencer_sponsors
        result = analyze_influencer_sponsors(request.video_url)
        return result
    except ImportError:
        # Fallback to basic video info
        video_data = youtube_service.get_video_stats(request.video_url)
        return video_data or {"error": "Analysis module not available"}
    except Exception as e:
        logger.error(f"Video analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/analyze-channel")
async def analyze_channel(
    request: AnalyzeChannelRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze multiple videos from a YouTube channel.
    """
    try:
        # Get channel info
        channel_data = youtube_service.get_channel_stats(request.channel_id)
        videos = youtube_service.get_channel_videos(request.channel_id, request.max_videos)
        return {
            "channel": channel_data,
            "videos": videos
        }
    except Exception as e:
        logger.error(f"Channel analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/save-analysis", response_model=MessageResponse)
async def save_analysis(
    request: SaveAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Save analysis data to CSV file.
    """
    try:
        # Create data directory if it doesn't exist
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        csv_file = os.path.join(data_dir, 'analysis_results.csv')
        file_exists = os.path.isfile(csv_file)
        
        with open(csv_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Write header if file doesn't exist
            if not file_exists:
                writer.writerow([
                    'Date', 'User ID', 'Video/Channel Title', 'Channel Name',
                    'Creator Name', 'Creator Industry', 'Sponsor Name', 'Sponsor Industry'
                ])
            
            # Write data
            if not request.sponsors:
                writer.writerow([
                    datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    current_user["id"],
                    request.video_title,
                    request.channel_name,
                    request.creator_name,
                    request.creator_industry,
                    'No Sponsor',
                    'N/A'
                ])
            else:
                for sponsor in request.sponsors:
                    writer.writerow([
                        datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        current_user["id"],
                        request.video_title,
                        request.channel_name,
                        request.creator_name,
                        request.creator_industry,
                        sponsor.get('name', 'Unknown'),
                        sponsor.get('industry', 'Unknown')
                    ])
        
        return MessageResponse(success=True, message="Analysis saved successfully")
        
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/channels")
async def get_user_channels(current_user: dict = Depends(get_current_user)):
    """
    Get all YouTube channels linked to the current user.
    """
    channels = youtube_service.get_user_channels(current_user["id"])
    return {"channels": channels}
