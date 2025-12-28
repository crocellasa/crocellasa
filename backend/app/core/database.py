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
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("⚠️ Supabase credentials missing. Database functionality will be unavailable.")
        return

    try:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        logger.info("✅ Supabase client initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase: {e}")


def get_supabase() -> Client:
    """
    Get Supabase client instance
    """
    if supabase is None:
        raise RuntimeError("Supabase client not initialized. Call init_database() first.")
    return supabase
