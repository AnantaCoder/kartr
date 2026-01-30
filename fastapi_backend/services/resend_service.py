"""
Service for sending emails via Resend
"""
import logging
import resend
from config import settings

logger = logging.getLogger(__name__)

class ResendService:
    """Service for sending professional emails using the Resend API"""
    
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        if self.api_key:
            resend.api_key = self.api_key
        else:
            logger.warning("RESEND_API_KEY not configured. Email features will be disabled.")

    def send_email(self, to: str, subject: str, html_content: str, from_email: str = "onboarding@resend.dev") -> dict:
        """
        Send an email using Resend.
        By default uses the 'onboarding@resend.dev' address for free tier testing.
        """
        if not self.api_key:
            return {"success": False, "error": "Resend API key not configured"}

        try:
            params = {
                "from": f"Kartr <{from_email}>",
                "to": [to],
                "subject": subject,
                "html": html_content,
            }
            
            response = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to}. ID: {response.get('id')}")
            return {"success": True, "id": response.get("id")}
            
        except Exception as e:
            logger.error(f"Error sending email via Resend: {e}")
            return {"success": False, "error": str(e)}

# Global instance
resend_service = ResendService()
