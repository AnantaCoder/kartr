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
    Generate a promotional image using Gemini AI.
    
    - **prompt**: Description of the image to generate
    - **brand_name**: Brand name to incorporate (optional)
    - **face_image**: Optional face image for reference
    - **brand_image**: Optional brand logo/image for reference
    
    Requires authentication.
    """
    try:
        if not settings.GEMINI_API_KEY:
            return ImageGenerationResponse(
                success=False,
                error="Gemini API key not configured"
            )
        
        # Use google.genai (new package) for image generation
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Build the prompt with brand context
        full_prompt = f"Generate a professional promotional image for {brand_name}. {prompt}"
        
        # Generate the image
        try:
            logger.info(f"Attempting image generation with model: {settings.GEMINI_IMAGE_MODEL}")
            response = client.models.generate_content(
                model=settings.GEMINI_IMAGE_MODEL,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
            )
        except Exception as e:
            # Check for quota/resource exhausted errors or invalid model
            error_str = str(e).lower()
            if "resource" in error_str or "quota" in error_str or "found" in error_str or "429" in error_str:
                fallback_model = "gemini-2.0-flash-exp"
                logger.warning(f"Primary model {settings.GEMINI_IMAGE_MODEL} failed ({e}). Falling back to {fallback_model}")
                
                response = client.models.generate_content(
                    model=fallback_model,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=['TEXT', 'IMAGE']
                    )
                )
            else:
                raise e
        
        # Extract the image from response
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith('image/'):
                    # Return base64 encoded image
                    image_base64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                    return ImageGenerationResponse(
                        success=True,
                        image_base64=image_base64
                    )
        
        return ImageGenerationResponse(
            success=False,
            error="No image generated. The model may not support image generation or the prompt was rejected."
        )
                
    except ImportError:
        return ImageGenerationResponse(
            success=False,
            error="Google GenAI package not installed. Run: pip install google-genai"
        )
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return ImageGenerationResponse(
            success=False,
            # Return detailed error so user knows if fallback also failed
            error=f"Generation failed: {str(e)}"
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
