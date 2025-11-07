"""
Ring Intercom integration via Home Assistant
"""
from fastapi import APIRouter, HTTPException, status
import httpx
import logging

from app.core.config import settings
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/open")
async def open_intercom(booking_id: str = None):
    """
    Open Ring Intercom via Home Assistant

    Args:
        booking_id: Optional booking ID for audit logging

    Returns:
        Success message
    """
    try:
        # Call Home Assistant REST API
        url = f"{settings.HOME_ASSISTANT_URL}/api/services/button/press"

        headers = {
            "Authorization": f"Bearer {settings.HOME_ASSISTANT_TOKEN}",
            "Content-Type": "application/json"
        }

        payload = {
            "entity_id": settings.RING_BUTTON_ENTITY_ID
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)

            if response.status_code not in [200, 201]:
                logger.error(f"Home Assistant error: {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to communicate with Home Assistant"
                )

        # Audit log
        if booking_id:
            supabase = get_supabase()
            supabase.table("audit_logs").insert({
                "event_type": "intercom_opened",
                "entity_type": "booking",
                "entity_id": booking_id,
                "actor_type": "guest",
                "description": "Ring intercom opened from guest portal",
                "status": "success"
            }).execute()

        logger.info(f"✅ Ring intercom opened (booking: {booking_id})")

        return {"message": "Intercom opened successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to open intercom: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
