"""
Image Generation router - Generate promotional and LLM influencer images
"""
import logging
import os
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from datetime import datetime
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
    Generate a promotional image using Gemini AI with Pollinations.ai fallback.
    Supports multimodal inputs (text + images) for Gemini.
    
    - **prompt**: Description of the image to generate
    - **brand_name**: Brand name to incorporate
    - **face_image**: Optional face image to use as reference
    - **brand_image**: Optional brand logo/image to incorporate
    """
    import httpx
    import urllib.parse
    from PIL import Image
    import io

    # 1. Processing Inputs
    user_id = current_user.get("uid", "anonymous")
    logger.info(f"Image generation request from user {user_id} for brand {brand_name}")

    # Build the prompt with brand context and user details
    # You might want to pull more user preferences if available in current_user
    full_prompt = (
        f"Generate a high-quality professional promotional image for the brand '{brand_name}'."
        f"\n\nTask: {prompt}"
        "\n\nStyle: Professional, visually striking, photorealistic (unless specified otherwise)."
    )

    contents = [full_prompt]
    image_descriptions = []

    # Handle image uploads for Gemini
    uploaded_images = []
    
    try:
        if face_image:
            face_bytes = await face_image.read()
            face_pil = Image.open(io.BytesIO(face_bytes))
            uploaded_images.append(face_pil)
            contents.append(face_pil)
            image_descriptions.append("The first image provided is the face reference/subject that must be featured.")
            full_prompt += "\n\nReference: Use the face from the provided image as the main subject."

        if brand_image:
            brand_bytes = await brand_image.read()
            brand_pil = Image.open(io.BytesIO(brand_bytes))
            uploaded_images.append(brand_pil)
            contents.append(brand_pil)
            image_descriptions.append("The next image provided is the brand logo or product reference.")
            full_prompt += "\n\nReference: Incorporate the logo/product design from the provided image."

    except Exception as img_err:
        logger.error(f"Error processing uploaded images: {img_err}")
        return ImageGenerationResponse(success=False, error=f"Invalid image file: {str(img_err)}")

    # Update prompt with image cues if using Gemini
    if uploaded_images:
        contents[0] = full_prompt

    # --- Try Gemini First (Multimodal) ---
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types
            
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            # Using 'gemini-2.0-flash-exp' or configured model which supports images
            # Note: gemini-pro-vision (1.0) or gemini-1.5-flash/pro support images for *text* generation.
            # For *image* generation (Imagen 3 / Gemini Image), it typically takes text prompt.
            # However, some endpoints allow image editing/variation. 
            # Assuming 'gemini-3-pro-image-preview' might support editing or we use text description if not.
            # NOTE: If the model doesn't support image input for generation, this might fail.
            # Standard Imagen 3 API is text-to-image. Multimodal inputs usually implies image-to-text or editing.
            # Let's assume we pass text if image input fails or use a model that supports it.
            
            # Since standard image gen is Text->Image, passing images might raise error on some models.
            # We'll try passing images if supported, otherwise fallback to text only description.
            
            # Prioritize configured model (likely 'gemini-3-pro-image-preview'), then Imagen 3, then Flash
            models_to_try = []
            if settings.GEMINI_IMAGE_MODEL:
                models_to_try.append(settings.GEMINI_IMAGE_MODEL)
            models_to_try.extend(["imagen-3.0-generate-001", "gemini-2.0-flash-exp"])
            # Deduplicate while preserving order
            models_to_try = list(dict.fromkeys(models_to_try))
            
            for model in models_to_try:
                try:
                    logger.info(f"Attempting generation with Gemini model: {model}")
                    
                    # Construct request
                    # For simple text-to-image models, passing PIL images in 'contents' might fail if it expects string.
                    # We will try passing just text if images are present but model rejects multimodal.
                    
                    try:
                        response = client.models.generate_content(
                            model=model,
                            contents=contents, # List containing [text, image, image...]
                            config=types.GenerateContentConfig(
                                response_modalities=['TEXT', 'IMAGE']
                            )
                        )
                    except Exception as e_multi:
                        # If multimodal input fails (not supported for image gen), fallback to text-only prompt
                        if "invalid_argument" in str(e_multi).lower() and uploaded_images:
                            logger.warning(f"Model {model} may not support image inputs for generation. Retrying text-only.")
                            # enhance prompt to say we can't use reference directly
                            text_only_prompt = full_prompt + " (Note: Generate based on description as reference images could not be processed)."
                            response = client.models.generate_content(
                                model=model,
                                contents=text_only_prompt,
                                config=types.GenerateContentConfig(
                                    response_modalities=['TEXT', 'IMAGE']
                                )
                            )
                        else:
                            raise e_multi

                    # Extract the image from response
                    if response.candidates and response.candidates[0].content.parts:
                        for part in response.candidates[0].content.parts:
                            if part.inline_data and part.inline_data.mime_type.startswith('image/'):
                                # Decode and save locally
                                image_data = part.inline_data.data
                                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                                import uuid
                                filename = f"gen_{timestamp}_{uuid.uuid4().hex[:8]}.png"
                                
                                # Ensure directory exists
                                output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'generated_images')
                                os.makedirs(output_dir, exist_ok=True)
                                
                                file_path = os.path.join(output_dir, filename)
                                with open(file_path, "wb") as f:
                                    f.write(image_data)
                                    
                                logger.info(f"Image saved locally to: {file_path}")

                                image_base64 = base64.b64encode(image_data).decode('utf-8')
                                return ImageGenerationResponse(
                                    success=True,
                                    image_base64=image_base64,
                                    model_used=model
                                )
                except Exception as e:
                    logger.warning(f"Gemini model {model} failed: {e}")
                    continue
                    
        except ImportError:
            logger.warning("Google GenAI package not installed, skipping Gemini")
        except Exception as e:
            logger.warning(f"Gemini initialization/execution failed: {e}")
    
    # --- Fallback to Pollinations.ai (FREE, no API key needed, Text Only) ---
    logger.info("Gemini failed or unavailable. Falling back to Pollinations.ai (free)")
    
    try:
        # Pollinations only takes text. Append descriptions of images if we had them.
        fallback_prompt = full_prompt
        if uploaded_images:
            fallback_prompt += " [Image references were provided but could not be used directly. Ensure high quality based on text.]"

        encoded_prompt = urllib.parse.quote(fallback_prompt)
        # Add random seed to avoid caching same result
        import random
        seed = random.randint(0, 10000)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}&model=flux"
        
        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.get(image_url, follow_redirects=True)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type:
                    # Save locally
                    image_data = response.content
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    import uuid
                    filename = f"gen_pollinations_{timestamp}_{uuid.uuid4().hex[:8]}.jpg"
                    
                    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'generated_images')
                    os.makedirs(output_dir, exist_ok=True)
                    
                    file_path = os.path.join(output_dir, filename)
                    with open(file_path, "wb") as f:
                        f.write(image_data)
                        
                    logger.info(f"Image saved locally to: {file_path}")
                    
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                    return ImageGenerationResponse(
                        success=True,
                        image_base64=image_base64,
                        model_used="pollinations.ai (flux)",
                        error="Note: Reference images were ignored in fallback mode." if uploaded_images else None
                    )
                    
        logger.error(f"Pollinations.ai failed: HTTP {response.status_code}")
        
    except Exception as e:
        logger.error(f"Pollinations.ai fallback failed: {e}")
    
    return ImageGenerationResponse(
        success=False,
        error="All image generation methods failed. Gemini quota may be exceeded or service unavailable."
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
        
        # Use the modern client if possible, or fallback to configuration
        # This endpoint seems to be a placeholder for text-to-image logic
        # For now, we'll return a similar error or implement basic logic if needed.
        # Keeping existing logic but improving error message.
        
        return ImageGenerationResponse(
            success=False,
            error="LLM Influencer Generation not fully implemented. Please use the main /generate endpoint."
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
