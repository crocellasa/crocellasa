"""
Supabase database client initialization
"""
from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global Supabase client
supabase: Client = None


async def init_database():
    """
    Initialize Supabase client
    """
    global supabase
    try:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        logger.info("✅ Supabase client initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase: {e}")
        raise


def get_supabase() -> Client:
    """
    Get Supabase client instance
    """
    if supabase is None:
        raise RuntimeError("Supabase client not initialized. Call init_database() first.")
    return supabase
