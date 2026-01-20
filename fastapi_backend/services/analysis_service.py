"""
Service for AI-powered video analysis using Gemini.
"""
import logging
import json
from typing import Dict, Any, Optional

from config import settings
from services.youtube_service import youtube_service

logger = logging.getLogger(__name__)

GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai not installed. Gemini analysis unavailable.")

if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
        GEMINI_AVAILABLE = False

def analyze_influencer_sponsors(video_url: str) -> Dict[str, Any]:
    """
    Analyze a YouTube video for influencer and sponsor information using Gemini AI.
    
    Args:
        video_url: The URL of the YouTube video to analyze.
        
    Returns:
        A dictionary containing the analysis results.
    """
    # Get video stats first
    video_data = youtube_service.get_video_stats(video_url, full_description=True)
    
    if not video_data or "error" in video_data:
        return video_data or {"error": "Could not fetch video data"}
        
    if not GEMINI_AVAILABLE:
        return {
            **video_data,
            "analysis": {"error": "Gemini AI not available or configured"}
        }

    # Prepare prompt for Gemini
    prompt = _create_analysis_prompt(video_data)
    
    try:
        model = genai.GenerativeModel(settings.GEMINI_TEXT_MODEL)
        response = model.generate_content(prompt)
        
        # Store raw response text
        raw_response_text = response.text if response.text else ""
        
        # Parse JSON from response
        if response.text:
            analysis = _parse_gemini_response(response.text)
        else:
            analysis = {"error": "Empty response from AI"}
        
        return {
            **video_data,
            "analysis": analysis,
            "gemini_raw_response": raw_response_text
        }
        
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")
        return {
            **video_data,
            "analysis": {"error": f"AI analysis failed: {str(e)}"},
            "gemini_raw_response": None
        }

def _create_analysis_prompt(video_data: Dict[str, Any]) -> str:
    """Create the prompt for Gemini analysis."""
    title = video_data.get("title", "")
    channel = video_data.get("channel_title", "")
    description = video_data.get("description", "")
    tags = ", ".join(video_data.get("tags", [])[:20])  # Limit tags
    
    return f"""
    Analyze the following YouTube video content to identify influencer marketing and sponsorship details.
    
    Video Title: {title}
    Channel: {channel}
    Tags: {tags}
    
    Description:
    {description[:3000]}
    
    Please provide a structured JSON response with the following keys:
    - is_sponsored (boolean): Is this video sponsored?
    - sponsor_name (string): Name of the sponsor (or "None")
    - sponsor_industry (string): Industry of the sponsor
    - influencer_niche (string): Primary niche of the creator
    - content_summary (string): Brief 1-2 sentence summary
    - sentiment (string): "Positive", "Neutral", or "Negative"
    - key_topics (list of strings): Top 3-5 topics discussed
    
    Return ONLY the valid JSON object. Do not include markdown formatting.
    """

def _parse_gemini_response(text: str) -> Dict[str, Any]:
    """Clean and parse JSON from LLM response."""
    try:
        text = text.strip()
        # Remove markdown code blocks if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Gemini response: {text[:100]}...")
        # Handle case where AI might return text that isn't JSON
        return {"error": "Failed to parse AI response", "raw_response": text[:200]}
