"""
Service for AI-powered video analysis using Gemini with Grok (xAI) fallback.
"""
import logging
import json
from typing import Dict, Any, Optional

from config import settings
from services.youtube_service import youtube_service

logger = logging.getLogger(__name__)

# Initialize Gemini
GEMINI_AVAILABLE = False
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    logger.warning("google-generativeai not installed.")

# Initialize OpenAI (for Grok)
OPENAI_AVAILABLE = False
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    logger.warning("openai library not installed. Grok fallback unavailable.")

if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
        GEMINI_AVAILABLE = False


def _generate_with_fallback(prompt: str) -> tuple[Optional[str], str]:
    """
    Generate content using Gemini, falling back to Grok if it fails.
    Returns (raw_text_response, model_name) tuple.
    """
    # 1. Try Gemini
    if GEMINI_AVAILABLE:
        try:
            model = genai.GenerativeModel(settings.GEMINI_TEXT_MODEL)
            response = model.generate_content(prompt)
            if response.text:
                return response.text, settings.GEMINI_TEXT_MODEL
        except Exception as e:
            logger.warning(f"Gemini analysis failed: {e}. Attempting fallback...")
    
    # 2. Fallback to Grok (xAI)
    if OPENAI_AVAILABLE and settings.GROK_API_KEY:
        try:
            client = OpenAI(
                api_key=settings.GROK_API_KEY,
                base_url="https://api.x.ai/v1",
            )
            response = client.chat.completions.create(
                model=settings.GROK_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant analyzing YouTube videos."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content, settings.GROK_MODEL
        except Exception as e:
            logger.error(f"Grok fallback failed: {e}")
    
    return None, "None"


def analyze_influencer_sponsors(video_url: str) -> Dict[str, Any]:
    """
    Analyze a YouTube video for influencer and sponsor information.
    """
    # Get video stats first
    video_data = youtube_service.get_video_stats(video_url, full_description=True)
    
    if not video_data or "error" in video_data:
        return video_data or {"error": "Could not fetch video data"}
        
    if not GEMINI_AVAILABLE and not (OPENAI_AVAILABLE and settings.GROK_API_KEY):
        return {
            **video_data,
            "analysis": {"error": "No AI services avaliable (Gemini or Grok)"}
        }

    # Prepare prompt
    prompt = _create_analysis_prompt(video_data)
    
    # Call LLM with fallback
    response_text, model_used = _generate_with_fallback(prompt)
    
    if not response_text:
        return {
            **video_data,
            "analysis": {"error": "AI analysis failed (Both Gemini and Fallback)"},
            "gemini_raw_response": None,
            "model_used": "None"
        }

    # Parse Result
    analysis = _parse_llm_response(response_text)
    
    return {
        **video_data,
        "analysis": analysis,
        "raw_response": response_text,
        "model_used": model_used
    }

def analyze_bulk_influencer_sponsors(video_urls: list[str]) -> Dict[str, Any]:
    """
    Perform bulk analysis on multiple YouTube videos.
    """
    results = []
    success_count = 0
    failed_count = 0
    
    for url in video_urls:
        try:
            result = analyze_influencer_sponsors(url)
            results.append(result)
            if "error" not in result.get("analysis", {}):
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            logger.error(f"Bulk item failed ({url}): {e}")
            failed_count += 1
            results.append({
                "video_id": url,
                "error": str(e),
                "analysis": {"error": "Processing failed"}
            })
            
    return {
        "results": results,
        "total_count": len(video_urls),
        "success_count": success_count,
        "failed_count": failed_count
    }

def _create_analysis_prompt(video_data: Dict[str, Any]) -> str:
    """Create the prompt for analysis."""
    title = video_data.get("title", "")
    channel = video_data.get("channel_title", "")
    description = video_data.get("description", "")
    tags = ", ".join(video_data.get("tags", [])[:20])  # Limit tags
    
    return f"""
    Analyze the following YouTube video content to identify influencer marketing and sponsorship details.
    
    CRITICAL INSTRUCTION: Be extremely precise in identifying the "sponsor_name". 
    Look for:
    1. Mentions like "Thanks to [Brand] for sponsoring" or "Sponsored by [Brand]".
    2. Links in the description like "[Brand] Link:" or "Check out [Brand] at...".
    3. Discount codes like "Use code [BRANDNAME] to get...".
    If no clear sponsor is found, return "None".
    
    Video Title: {title}
    Channel: {channel}
    Tags: {tags}
    
    Description:
    {description[:4000]}
    
    Please provide a structured JSON response with the following keys (use snake_case):
    - is_sponsored (boolean): Is this video sponsored?
    - sponsor_name (string): Name of the sponsor (or "None")
    - sponsor_industry (string): Industry of the sponsor
    - influencer_niche (string): Primary niche of the creator
    - content_summary (string): Brief 1-2 sentence summary
    - sentiment (string): "Positive", "Neutral", or "Negative"
    - key_topics (list of strings): Top 3-5 topics discussed
    
    Return ONLY the valid JSON object. Do not include markdown formatting.
    """

def _parse_llm_response(text: str) -> Dict[str, Any]:
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
            
        data = json.loads(text.strip())
        
        # Normalize keys to snake_case (handle camelCase from LLM)
        normalized_data = {}
        key_mapping = {
            "isSponsored": "is_sponsored",
            "sponsorName": "sponsor_name",
            "sponsorIndustry": "sponsor_industry", 
            "influencerNiche": "influencer_niche",
            "contentSummary": "content_summary",
            "keyTopics": "key_topics"
        }
        
        for key, value in data.items():
            # Use mapped key if exists, otherwise existing key
            new_key = key_mapping.get(key, key)
            normalized_data[new_key] = value
            
        return normalized_data
        
    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM response: {text[:100]}...")
        # Handle case where AI might return text that isn't JSON
        return {"error": "Failed to parse AI response", "raw_response": text[:200]}
