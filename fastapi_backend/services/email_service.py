"""
Email service for sending OTP and notifications
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple
from config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_otp_email(email: str, otp: str) -> Tuple[bool, str]:
        """
        Send OTP to user's email.
        Returns: (success, message)
        """
        if not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
            logger.warning("Email credentials not configured")
            return False, "Email service not configured"
        
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.EMAIL_USER
            msg['To'] = email
            msg['Subject'] = 'Kartr - Your Verification Code'
            
            body = f"""
            <html>
            <body>
                <h2>Kartr Verification Code</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">{otp}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <br>
                <p>Best regards,<br>The Kartr Team</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"OTP email sent to {email}")
            return True, "OTP sent successfully"
            
        except Exception as e:
            logger.error(f"Error sending OTP email: {e}")
            return False, str(e)
    
    @staticmethod
    def send_welcome_email(email: str, username: str) -> Tuple[bool, str]:
        """
        Send welcome email to new user.
        Returns: (success, message)
        """
        if not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
            return False, "Email service not configured"
        
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.EMAIL_USER
            msg['To'] = email
            msg['Subject'] = 'Welcome to Kartr!'
            
            body = f"""
            <html>
            <body>
                <h2>Welcome to Kartr, {username}!</h2>
                <p>Thank you for joining our platform connecting influencers and sponsors.</p>
                <p>You can now:</p>
                <ul>
                    <li>Analyze YouTube channels and videos</li>
                    <li>Connect with potential partners</li>
                    <li>Generate promotional content</li>
                </ul>
                <p>Get started by logging in to your account.</p>
                <br>
                <p>Best regards,<br>The Kartr Team</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.starttls()
                server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Welcome email sent to {email}")
            return True, "Welcome email sent"
            
        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")
            return False, str(e)


# Global service instance
email_service = EmailService()
