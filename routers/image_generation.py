"""
Image Generation router - Generate promotional and LLM influencer images
"""
import logging
import os
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from models.schemas import GenerateImageRequest, GenerateLLMImageRequest, ImageGenerationResponse
from utils.dependencies import get_current_user
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/images", tags=["Image Generation"])


@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_promotional_image(
    prompt: str = Form(...),
    brand_name: str = Form("YourBrand"),
    face_image: Optional[UploadFile] = File(None),
    brand_image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a promotional image with face and brand integration.
    """
    try:
        if not face_image or not brand_image:
            return ImageGenerationResponse(
                success=False,
                error="Both face_image and brand_image are required"
            )
        
        # For now, return placeholder response
        # In production, integrate with image generation service
        return ImageGenerationResponse(
            success=False,
            error="Image generation service coming soon. Please configure Gemini or other image API."
        )
                
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return ImageGenerationResponse(
            success=False,
            error=str(e)
        )


@router.post("/generate-llm", response_model=ImageGenerationResponse)
async def generate_llm_influencer(
    request: GenerateLLMImageRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate an LLM-based influencer image using Gemini.
    """
    try:
        import google.generativeai as genai
        
        if not settings.GEMINI_API_KEY:
            return ImageGenerationResponse(
                success=False,
                error="Gemini API key not configured"
            )
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Note: Gemini text models don't generate images directly
        # This would require Imagen API or similar
        return ImageGenerationResponse(
            success=False,
            error="LLM image generation requires Imagen API. Text prompt received: " + request.prompt[:100]
        )
            
    except ImportError:
        return ImageGenerationResponse(
            success=False,
            error="Google Generative AI module not installed"
        )
    except Exception as e:
        logger.error(f"LLM image generation error: {e}")
        return ImageGenerationResponse(
            success=False,
            error=str(e)
        )


@router.get("/generated")
async def list_generated_images(current_user: dict = Depends(get_current_user)):
    """
    List all generated images.
    """
    try:
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        images = []
        
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.lower().endswith(('.png', '.jpg', '.jpeg')) and file.startswith('output_'):
                    file_path = os.path.join(data_dir, file)
                    images.append({
                        "filename": file,
                        "path": file_path,
                        "size": os.path.getsize(file_path),
                        "created": os.path.getctime(file_path)
                    })
        
        # Sort by creation time (newest first)
        images.sort(key=lambda x: x['created'], reverse=True)
        
        return {"images": images}
        
    except Exception as e:
        logger.error(f"Error listing generated images: {e}")
        return {"images": [], "error": str(e)}
