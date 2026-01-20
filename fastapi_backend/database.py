"""
Database access layer.

This module provides database access abstraction. It uses Firebase Firestore
as the primary database, with a mock in-memory fallback for development.
"""
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)

# Firebase availability check
try:
    from firebase_config import (
        FIREBASE_AVAILABLE,
        initialize_firebase,
        get_firestore,
        FirestoreRepository,
    )
except ImportError:
    FIREBASE_AVAILABLE = False
    initialize_firebase = lambda: False
    get_firestore = lambda: None
    FirestoreRepository = None
    logger.warning("Firebase config not found. Using mock database only.")


def is_firebase_configured() -> bool:
    """Check if Firebase is properly configured and available."""
    if not FIREBASE_AVAILABLE:
        return False
    return initialize_firebase()


def get_db_client():
    """
    Get the database client.
    
    Returns Firestore client if available, otherwise None.
    Use get_mock_db() as fallback when this returns None.
    """
    return get_firestore()


# Backward compatibility alias
def get_supabase_client():
    """
    Deprecated: Use get_db_client() instead.
    
    Kept for backward compatibility during migration.
    """
    return get_db_client()


def get_db():
    """Dependency function for FastAPI route injection."""
    return get_db_client()


# =============================================================================
# Repository Factory
# =============================================================================

def get_users_repository() -> Optional['FirestoreRepository']:
    """Get repository for users collection."""
    if not is_firebase_configured():
        return None
    return FirestoreRepository('users')


def get_youtube_channels_repository() -> Optional['FirestoreRepository']:
    """Get repository for youtube_channels collection."""
    if not is_firebase_configured():
        return None
    return FirestoreRepository('youtube_channels')


def get_searches_repository() -> Optional['FirestoreRepository']:
    """Get repository for searches collection."""
    if not is_firebase_configured():
        return None
    return FirestoreRepository('searches')


def get_chat_conversations_repository() -> Optional['FirestoreRepository']:
    """Get repository for chat_conversations collection."""
    if not is_firebase_configured():
        return None
    return FirestoreRepository('chat_conversations')


def get_chat_messages_repository() -> Optional['FirestoreRepository']:
    """Get repository for chat_messages collection."""
    if not is_firebase_configured():
        return None
    return FirestoreRepository('chat_messages')


# =============================================================================
# Mock Database for Development
# =============================================================================

class MockDatabase:
    """
    In-memory mock database for development without Firebase.
    
    Provides the same interface as the Firebase repositories for testing
    and development purposes. Data is not persisted between restarts.
    """
    
    def __init__(self):
        self._users: Dict[str, Dict[str, Any]] = {}
        self._youtube_channels: Dict[str, Dict[str, Any]] = {}
        self._searches: Dict[str, Dict[str, Any]] = {}
        self._id_counters = {
            'users': 0,
            'youtube_channels': 0,
            'searches': 0,
        }
    
    def _generate_id(self, collection: str) -> str:
        """Generate a unique ID for a collection."""
        self._id_counters[collection] += 1
        return str(self._id_counters[collection])
    
    # -------------------------------------------------------------------------
    # User Operations
    # -------------------------------------------------------------------------
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user."""
        user_id = self._generate_id('users')
        user = user_data.copy()
        user['id'] = user_id
        self._users[user_id] = user
        logger.debug(f"MockDB: Created user {user_id}")
        return user
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address."""
        for user in self._users.values():
            if user.get('email') == email:
                return user
        return None
    
    def get_user_by_id(self, user_id) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        return self._users.get(str(user_id))
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username."""
        for user in self._users.values():
            if user.get('username') == username:
                return user
        return None
    
    def update_user(self, user_id, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user data."""
        user_id = str(user_id)
        if user_id not in self._users:
            return None
        self._users[user_id].update(data)
        logger.debug(f"MockDB: Updated user {user_id}")
        return self._users[user_id]
    
    # -------------------------------------------------------------------------
    # YouTube Channel Operations
    # -------------------------------------------------------------------------
    
    def create_youtube_channel(self, channel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a YouTube channel record."""
        channel_id = self._generate_id('youtube_channels')
        channel = channel_data.copy()
        channel['id'] = channel_id
        self._youtube_channels[channel_id] = channel
        logger.debug(f"MockDB: Created youtube_channel {channel_id}")
        return channel
    
    def get_channels_by_user(self, user_id) -> List[Dict[str, Any]]:
        """Get all channels for a user."""
        user_id_str = str(user_id)
        return [
            ch for ch in self._youtube_channels.values()
            if str(ch.get('user_id')) == user_id_str
        ]
    
    def get_channel_by_id(self, channel_id: str, user_id) -> Optional[Dict[str, Any]]:
        """Get a specific channel for a user."""
        channel = self._youtube_channels.get(str(channel_id))
        if channel and str(channel.get('user_id')) == str(user_id):
            return channel
        return None
    
    def update_youtube_channel(self, channel_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a YouTube channel record."""
        channel_id = str(channel_id)
        if channel_id not in self._youtube_channels:
            return None
        self._youtube_channels[channel_id].update(data)
        return self._youtube_channels[channel_id]
    
    def search_channels(self, query: str) -> List[Dict[str, Any]]:
        """Search channels by title (case-insensitive)."""
        query_lower = query.lower()
        return [
            ch for ch in self._youtube_channels.values()
            if query_lower in ch.get('title', '').lower()
        ]
    
    # -------------------------------------------------------------------------
    # Search History Operations
    # -------------------------------------------------------------------------
    
    def create_search(self, search_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a search history record."""
        search_id = self._generate_id('searches')
        search = search_data.copy()
        search['id'] = search_id
        self._searches[search_id] = search
        logger.debug(f"MockDB: Created search record {search_id}")
        return search
    
    def get_searches_by_user(self, user_id, limit: int = 50) -> List[Dict[str, Any]]:
        """Get search history for a user."""
        user_id_str = str(user_id)
        results = [
            s for s in self._searches.values()
            if str(s.get('user_id')) == user_id_str
        ]
        # Sort by date descending and limit
        results.sort(key=lambda x: x.get('date_searched', ''), reverse=True)
        return results[:limit]


# Global mock database instance (singleton)
_mock_db: Optional[MockDatabase] = None


def get_mock_db() -> MockDatabase:
    """
    Get the mock database instance.
    
    This is used when Firebase is not configured or for testing.
    """
    global _mock_db
    if _mock_db is None:
        _mock_db = MockDatabase()
        logger.info("Initialized mock database for development")
    return _mock_db
