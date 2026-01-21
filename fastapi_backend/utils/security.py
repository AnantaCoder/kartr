"""
Security utilities for password hashing and JWT tokens
"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from config import settings

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Ensure password is encoded properly for bcrypt
    # bcrypt 5.0.0+ requires the password to be bytes or str < 72 chars
    if len(password.encode('utf-8')) > 72:
        # Truncate to 72 bytes (bcrypt limit) - this is standard bcrypt behavior
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        # bcrypt 4.1.0+ enforces 72-byte limit strictly before passlib can handle it
        # Always truncate to 72 bytes to prevent the error
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            plain_password = password_bytes[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        return None


def generate_otp() -> str:
    """Generate a 6-digit OTP"""
    import random
    return str(random.randint(100000, 999999))


# OTP storage (in-memory for simplicity, use Redis in production)
_otp_storage: dict = {}


def store_otp(email: str, otp: str, expires_minutes: int = 10) -> bool:
    """Store OTP with expiration"""
    try:
        expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
        _otp_storage[email] = {
            "otp": otp,
            "expires_at": expires_at
        }
        return True
    except Exception as e:
        logger.error(f"Error storing OTP: {e}")
        return False


def verify_otp(email: str, otp: str) -> bool:
    """Verify OTP for an email"""
    try:
        stored = _otp_storage.get(email)
        if not stored:
            return False
        
        if datetime.utcnow() > stored["expires_at"]:
            # OTP expired
            del _otp_storage[email]
            return False
        
        if stored["otp"] == otp:
            # OTP valid, remove it
            del _otp_storage[email]
            return True
        
        return False
    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
        return False
