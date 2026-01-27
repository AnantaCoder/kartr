"""
Test script for Gemini Image Generation.
Uses both the new google-genai SDK and the older google.generativeai SDK
to verify API key functionality and image generation capabilities.
"""
import os
import sys

# Add parent directory to path for config import
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Load .env from parent directory BEFORE importing config
from dotenv import load_dotenv
load_dotenv(os.path.join(parent_dir, '.env'))

from config import settings

# --- Configuration ---
PRIMARY_MODEL = settings.GEMINI_IMAGE_MODEL
FALLBACK_MODEL = "gemini-2.0-flash-exp"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def test_new_sdk():
    """Test image generation using the new google-genai SDK."""
    print("\n" + "="*60)
    print("Testing google-genai (New SDK)")
    print("="*60)
    
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("[ERROR] google-genai not installed. Run: pip install google-genai")
        return False
    
    if not settings.GEMINI_API_KEY:
        print(f"[ERROR] GEMINI_API_KEY not configured.gemini api key is {settings.GEMINI_API_KEY}")
        return False
    
    print(f"[INFO] Using API key: {settings.GEMINI_API_KEY[:8]}...{settings.GEMINI_API_KEY[-4:]}")
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    prompt = "A cute robot sitting on a park bench, reading a book, digital art style"
    
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]
    
    for model in models_to_try:
        print(f"\n[TEST] Attempting generation with model: {model}")
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['TEXT', 'IMAGE']
                )
            )
            
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.inline_data and part.inline_data.mime_type.startswith('image/'):
                        # Save the image
                        safe_model_name = model.replace(":", "_").replace("/", "_")
                        output_file = os.path.join(OUTPUT_DIR, f"generated_{safe_model_name}.png")
                        
                        with open(output_file, "wb") as f:
                            f.write(part.inline_data.data)
                        
                        print(f"[SUCCESS] Image generated and saved to: {output_file}")
                        return True
                        
            print(f"[WARNING] No image in response from {model}")
            
        except Exception as e:
            print(f"[ERROR] Failed with {model}: {e}")
    
    return False


def test_old_sdk_verify_key():
    """Verify API key using the older google.generativeai SDK."""
    print("\n" + "="*60)
    print("Verifying API Key with google.generativeai (Old SDK)")
    print("="*60)
    
    try:
        import google.generativeai as genai
    except ImportError:
        print("[ERROR] google.generativeai not installed.")
        return False
    
    if not settings.GEMINI_API_KEY:
        print("[ERROR] GEMINI_API_KEY not configured.")
        return False
    
    print(f"[INFO] Using API key: {settings.GEMINI_API_KEY[:8]}...{settings.GEMINI_API_KEY[-4:]}")
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        models = list(genai.list_models())
        
        print(f"[SUCCESS] API Key is valid! Found {len(models)} models.")
        
        # Check if image generation models are available
        image_models = [m.name for m in models if 'image' in m.name.lower()]
        if image_models:
            print(f"[INFO] Available image-related models:")
            for m in image_models[:5]:
                print(f"   - {m}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] API Key verification failed: {e}")
        return False


def main():
    print("\n" + "#"*60)
    print("# Gemini Image Generation Test Suite")
    print("#"*60)
    print(f"\nPrimary Model: {PRIMARY_MODEL}")
    print(f"Fallback Model: {FALLBACK_MODEL}")
    print(f"Output Directory: {OUTPUT_DIR}")
    
    # Test 1: Verify API key with old SDK
    key_valid = test_old_sdk_verify_key()
    
    if not key_valid:
        print("\n[FATAL] API Key is invalid. Cannot proceed with image generation tests.")
        return
    
    # Test 2: Try image generation with new SDK
    image_success = test_new_sdk()
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"API Key Valid: {'Yes' if key_valid else 'No'}")
    print(f"Image Generation: {'Success' if image_success else 'Failed'}")
    
    if image_success:
        print("\n[DONE] All tests passed!")
    elif key_valid:
        print("\n[PARTIAL] API key works, but image generation failed.")
        print("This might be due to model availability or quota limits.")
    else:
        print("\n[FAILED] Tests did not pass.")


if __name__ == "__main__":
    main()
