"""
AI Chat Service for Kartr Platform.

This service handles AI-powered chat interactions using Google's Gemini API.
The AI assistant has full context of the Kartr project and can help users
with questions about the platform, influencer-sponsor matching, analytics, etc.
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
import uuid

from config import settings
from database import is_firebase_configured, get_mock_db
from firebase_config import FirestoreRepository, get_firestore

logger = logging.getLogger(__name__)

# Gemini API availability check
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None
    logger.warning("Google Generative AI not installed. Install with: pip install google-generativeai")


# Kartr Project Context - This gives the AI full context of the platform
KARTR_CONTEXT = """
You are an AI assistant for **Kartr**, a modern influencer-sponsor matching platform. 
You have deep knowledge about the Kartr ecosystem and should help users navigate the platform effectively.

## About Kartr Platform

Kartr is a FastAPI-based backend application that connects influencers with sponsors. The platform offers:

### Core Features:
1. **User Management**: 
   - Two user types: Influencers and Sponsors
   - Email/password authentication with JWT tokens
   - Google OAuth integration
   - Profile management with email visibility toggle

2. **YouTube Analytics**:
   - Video and channel statistics analysis
   - AI-powered content analysis for sponsor detection
   - Save and track analyzed videos
   - Connect YouTube channels to user profiles

3. **Search & Discovery**:
   - Find influencers and sponsors
   - Search YouTube channels
   - Autocomplete suggestions

4. **Virtual Influencers**:
   - AI-powered virtual influencer marketplace
   - Rent virtual influencers for campaigns

5. **Social Media Integration**:
   - Multi-platform posting capabilities
   - Bluesky integration
   - Manage social media agents

6. **Image Generation**:
   - AI-powered promotional image creation
   - Brand-specific content generation

7. **Data Visualization**:
   - Creator-sponsor relationship graphs
   - Industry analytics
   - RAG-based Q&A on platform data

### Technical Stack:
- Backend: FastAPI (Python)
- Database: Firebase Firestore (with mock DB fallback)
- Authentication: JWT + Firebase Auth
- AI: Google Gemini API
- APIs: YouTube Data API v3

### User Types:
1. **Influencers**: Content creators looking for brand partnerships
   - Can link YouTube channels
   - Track analytics
   - Find sponsors

2. **Sponsors**: Brands looking to partner with influencers
   - Search for influencers
   - Analyze creator content
   - Manage campaigns

## Your Role:
You are a helpful AI assistant that can:
- Answer questions about the Kartr platform
- Help users understand features and how to use them
- Provide guidance on influencer marketing best practices
- Assist with YouTube analytics interpretation
- Give tips on sponsor-influencer matching
- Help troubleshoot common issues
- Provide general advice on content creation and brand partnerships

Always be helpful, professional, and provide accurate information about the platform.
When asked about features not yet implemented, honestly mention they may be in development.
"""


def initialize_gemini() -> bool:
    """Initialize Gemini API with the configured API key."""
    if not GEMINI_AVAILABLE:
        return False
    
    if not settings.GEMINI_API_KEY:
        logger.warning("Gemini API key not configured")
        return False
    
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return False


class ChatService:
    """Service for handling AI chat operations."""
    
    @staticmethod
    def get_chat_repository() -> Optional[FirestoreRepository]:
        """Get repository for chat conversations."""
        if not is_firebase_configured():
            return None
        return FirestoreRepository('chat_conversations')
    
    @staticmethod
    def get_messages_repository() -> Optional[FirestoreRepository]:
        """Get repository for chat messages."""
        if not is_firebase_configured():
            return None
        return FirestoreRepository('chat_messages')
    
    @staticmethod
    def _generate_conversation_id() -> str:
        """Generate a unique conversation ID."""
        return str(uuid.uuid4())
    
    @staticmethod
    def _generate_message_id() -> str:
        """Generate a unique message ID."""
        return str(uuid.uuid4())
    
    @classmethod
    def create_conversation(
        cls,
        user_id: str,
        title: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Create a new chat conversation for a user.
        
        Args:
            user_id: The user's ID
            title: Optional conversation title
            
        Returns:
            Tuple of (success, conversation_data, error_message)
        """
        conversation_id = cls._generate_conversation_id()
        now = datetime.utcnow().isoformat()
        
        conversation_data = {
            "id": conversation_id,
            "user_id": user_id,
            "title": title or "New Chat",
            "created_at": now,
            "updated_at": now,
            "message_count": 0,
            "is_active": True,
        }
        
        # Try Firebase first
        chat_repo = cls.get_chat_repository()
        if chat_repo:
            result = chat_repo.create(conversation_data, conversation_id)
            if result:
                logger.info(f"Created conversation {conversation_id} for user {user_id}")
                return True, result, None
            else:
                return False, None, "Failed to create conversation in database"
        
        # Fallback to mock database
        mock_db = get_mock_db()
        if not hasattr(mock_db, '_chat_conversations'):
            mock_db._chat_conversations = {}
        
        mock_db._chat_conversations[conversation_id] = conversation_data
        logger.info(f"Created conversation {conversation_id} in mock DB for user {user_id}")
        return True, conversation_data, None
    
    @classmethod
    def get_user_conversations(
        cls,
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated conversations for a user.
        
        Args:
            user_id: The user's ID
            page: Page number (1-indexed)
            page_size: Number of items per page
            
        Returns:
            Tuple of (conversations_list, total_count)
        """
        conversations = []
        
        # Try Firebase first
        chat_repo = cls.get_chat_repository()
        if chat_repo:
            all_convos = chat_repo.find_by_field("user_id", user_id)
            conversations = [c for c in all_convos if c.get("is_active", True)]
        else:
            # Fallback to mock database
            mock_db = get_mock_db()
            if hasattr(mock_db, '_chat_conversations'):
                conversations = [
                    c for c in mock_db._chat_conversations.values()
                    if c.get("user_id") == user_id and c.get("is_active", True)
                ]
        
        # Sort by updated_at descending
        conversations.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        
        total_count = len(conversations)
        
        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = conversations[start_idx:end_idx]
        
        return paginated, total_count
    
    @classmethod
    def get_conversation(
        cls,
        conversation_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific conversation.
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID (for authorization)
            
        Returns:
            Conversation data or None if not found/unauthorized
        """
        # Try Firebase first
        chat_repo = cls.get_chat_repository()
        if chat_repo:
            convo = chat_repo.find_by_id(conversation_id)
            if convo and convo.get("user_id") == user_id:
                return convo
            return None
        
        # Fallback to mock database
        mock_db = get_mock_db()
        if hasattr(mock_db, '_chat_conversations'):
            convo = mock_db._chat_conversations.get(conversation_id)
            if convo and convo.get("user_id") == user_id:
                return convo
        
        return None
    
    @classmethod
    def get_conversation_messages(
        cls,
        conversation_id: str,
        user_id: str,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated messages for a conversation.
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID (for authorization)
            page: Page number (1-indexed)
            page_size: Number of items per page
            
        Returns:
            Tuple of (messages_list, total_count)
        """
        # Verify user owns this conversation
        convo = cls.get_conversation(conversation_id, user_id)
        if not convo:
            return [], 0
        
        messages = []
        
        # Try Firebase first
        messages_repo = cls.get_messages_repository()
        if messages_repo:
            messages = messages_repo.find_by_field("conversation_id", conversation_id)
        else:
            # Fallback to mock database
            mock_db = get_mock_db()
            if hasattr(mock_db, '_chat_messages'):
                messages = [
                    m for m in mock_db._chat_messages.values()
                    if m.get("conversation_id") == conversation_id
                ]
        
        # Sort by created_at ascending (oldest first for chat display)
        messages.sort(key=lambda x: x.get("created_at", ""))
        
        total_count = len(messages)
        
        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated = messages[start_idx:end_idx]
        
        return paginated, total_count
    
    @classmethod
    def add_message(
        cls,
        conversation_id: str,
        user_id: str,
        content: str,
        role: str = "user"
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Add a message to a conversation.
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID
            content: Message content
            role: Message role ("user" or "assistant")
            
        Returns:
            Tuple of (success, message_data, error_message)
        """
        # Verify user owns this conversation
        convo = cls.get_conversation(conversation_id, user_id)
        if not convo:
            return False, None, "Conversation not found or access denied"
        
        message_id = cls._generate_message_id()
        now = datetime.utcnow().isoformat()
        
        message_data = {
            "id": message_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "content": content,
            "role": role,
            "created_at": now,
        }
        
        # Try Firebase first
        messages_repo = cls.get_messages_repository()
        if messages_repo:
            result = messages_repo.create(message_data, message_id)
            if result:
                # Update conversation's updated_at and message_count
                chat_repo = cls.get_chat_repository()
                if chat_repo:
                    chat_repo.update(conversation_id, {
                        "updated_at": now,
                        "message_count": convo.get("message_count", 0) + 1,
                        "title": content[:50] + "..." if len(content) > 50 and convo.get("title") == "New Chat" else convo.get("title")
                    })
                return True, result, None
            else:
                return False, None, "Failed to save message"
        
        # Fallback to mock database
        mock_db = get_mock_db()
        if not hasattr(mock_db, '_chat_messages'):
            mock_db._chat_messages = {}
        
        mock_db._chat_messages[message_id] = message_data
        
        # Update conversation in mock DB
        if hasattr(mock_db, '_chat_conversations') and conversation_id in mock_db._chat_conversations:
            mock_db._chat_conversations[conversation_id]["updated_at"] = now
            mock_db._chat_conversations[conversation_id]["message_count"] = \
                mock_db._chat_conversations[conversation_id].get("message_count", 0) + 1
            if mock_db._chat_conversations[conversation_id].get("title") == "New Chat":
                mock_db._chat_conversations[conversation_id]["title"] = content[:50] + "..." if len(content) > 50 else content
        
        return True, message_data, None
    
    @classmethod
    def generate_ai_response(
        cls,
        conversation_id: str,
        user_id: str,
        user_message: str
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate an AI response for the user's message.
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID
            user_message: The user's message content
            
        Returns:
            Tuple of (success, ai_response, error_message)
        """
        if not initialize_gemini():
            # Return a helpful fallback message if Gemini is not available
            fallback_response = (
                "I'm sorry, but the AI service is currently unavailable. "
                "Please make sure the Gemini API key is configured in the environment. "
                "In the meantime, I can tell you that Kartr is a platform connecting "
                "influencers with sponsors - feel free to explore our features!"
            )
            return True, fallback_response, None
        
        try:
            # Get conversation history for context
            messages_history, _ = cls.get_conversation_messages(
                conversation_id, user_id, page=1, page_size=20
            )
            
            # Build conversation context for Gemini
            chat_history = []
            for msg in messages_history:
                role = "user" if msg.get("role") == "user" else "model"
                chat_history.append({
                    "role": role,
                    "parts": [msg.get("content", "")]
                })
            
            # Initialize the model with Kartr context
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_CHAT_MODEL,
                system_instruction=KARTR_CONTEXT
            )
            
            # Start chat with history
            chat = model.start_chat(history=chat_history)
            
            # Generate response
            response = chat.send_message(user_message)
            ai_response = response.text
            
            return True, ai_response, None
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return False, None, f"Failed to generate AI response: {str(e)}"
    
    @classmethod
    def send_message_and_get_response(
        cls,
        conversation_id: str,
        user_id: str,
        user_message: str
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Send a user message and get an AI response.
        
        This is the main method for chat interactions. It:
        1. Saves the user's message
        2. Generates an AI response
        3. Saves the AI response
        4. Returns both messages
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID
            user_message: The user's message content
            
        Returns:
            Tuple of (success, response_data, error_message)
        """
        # Save user message
        success, user_msg_data, error = cls.add_message(
            conversation_id, user_id, user_message, role="user"
        )
        if not success:
            return False, None, error
        
        # Generate AI response
        success, ai_response, error = cls.generate_ai_response(
            conversation_id, user_id, user_message
        )
        if not success:
            return False, None, error
        
        # Save AI response
        success, ai_msg_data, error = cls.add_message(
            conversation_id, user_id, ai_response, role="assistant"
        )
        if not success:
            return False, None, error
        
        return True, {
            "user_message": user_msg_data,
            "assistant_message": ai_msg_data
        }, None
    
    @classmethod
    def delete_conversation(
        cls,
        conversation_id: str,
        user_id: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Soft delete a conversation (mark as inactive).
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID
            
        Returns:
            Tuple of (success, error_message)
        """
        # Verify user owns this conversation
        convo = cls.get_conversation(conversation_id, user_id)
        if not convo:
            return False, "Conversation not found or access denied"
        
        # Try Firebase first
        chat_repo = cls.get_chat_repository()
        if chat_repo:
            result = chat_repo.update(conversation_id, {"is_active": False})
            if result:
                return True, None
            return False, "Failed to delete conversation"
        
        # Fallback to mock database
        mock_db = get_mock_db()
        if hasattr(mock_db, '_chat_conversations') and conversation_id in mock_db._chat_conversations:
            mock_db._chat_conversations[conversation_id]["is_active"] = False
            return True, None
        
        return False, "Conversation not found"
    
    @classmethod
    def update_conversation_title(
        cls,
        conversation_id: str,
        user_id: str,
        title: str
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Update a conversation's title.
        
        Args:
            conversation_id: The conversation ID
            user_id: The user's ID
            title: New title
            
        Returns:
            Tuple of (success, updated_conversation, error_message)
        """
        # Verify user owns this conversation
        convo = cls.get_conversation(conversation_id, user_id)
        if not convo:
            return False, None, "Conversation not found or access denied"
        
        now = datetime.utcnow().isoformat()
        
        # Try Firebase first
        chat_repo = cls.get_chat_repository()
        if chat_repo:
            result = chat_repo.update(conversation_id, {
                "title": title,
                "updated_at": now
            })
            if result:
                return True, result, None
            return False, None, "Failed to update conversation"
        
        # Fallback to mock database
        mock_db = get_mock_db()
        if hasattr(mock_db, '_chat_conversations') and conversation_id in mock_db._chat_conversations:
            mock_db._chat_conversations[conversation_id]["title"] = title
            mock_db._chat_conversations[conversation_id]["updated_at"] = now
            return True, mock_db._chat_conversations[conversation_id], None
        
        return False, None, "Conversation not found"
        return False, None, "Conversation not found"

    @staticmethod
    def analyze_niche(channel_data: Dict[str, Any], videos: List[Dict[str, Any]]) -> Optional[str]:
        """
        Analyze YouTube channel content to determine niche using Gemini.
        
        Args:
            channel_data: Dictionary containing channel title, description, etc.
            videos: List of dictionaries containing video titles and descriptions.
            
        Returns:
            Determined niche (string) or None if analysis fails.
        """
        if not initialize_gemini():
            return None
            
        try:
            # Construct prompt context
            context = f"""
            Analyze the following YouTube channel and determine its primary niche (3-5 words max).
            
            Channel: {channel_data.get('title', 'Unknown')}
            Description: {channel_data.get('description', '')}
            
            Recent Videos:
            """
            
            for v in videos[:10]: # Analyze top 10 videos
                context += f"- {v.get('title', '')}: {v.get('description', '')[:100]}...\n"
                
            prompt = context + "\n\nBased on this content, what is the specific niche of this influencer? Return ONLY the niche name, nothing else."
            
            model = genai.GenerativeModel(model_name=settings.GEMINI_CHAT_MODEL)
            response = model.generate_content(prompt)
            
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error analyzing niche: {e}")
            return None
