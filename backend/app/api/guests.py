"""
Guest portal endpoints
"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timezone
import logging

from app.core.database import get_supabase
from app.core.security import decode_token
from app.models.booking import GuestPortalData, BookingResponse, AccessCodeInfo

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{token}", response_model=GuestPortalData)
async def get_guest_portal_data(token: str):
    """
    Get all data for guest portal using JWT token

    This endpoint:
    1. Validates JWT token
    2. Retrieves booking details
    3. Retrieves access codes
    4. Retrieves property information
    5. Logs portal access

    Args:
        token: JWT token from guest portal URL

    Returns:
        Complete guest portal data
    """
    try:
        # 1. Validate JWT token
        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        booking_id = payload.get("booking_id")

        if not booking_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        supabase = get_supabase()

        # 2. Get booking details
        booking_result = supabase.table("bookings")\
            .select("*")\
            .eq("id", booking_id)\
            .execute()

        if not booking_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )

        booking = booking_result.data[0]

        # Check if booking is cancelled
        if booking["status"] == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This booking has been cancelled"
            )

        # 3. Get access codes using custom function
        codes_result = supabase.rpc(
            "get_active_codes_for_booking",
            {"booking_uuid": booking_id}
        ).execute()

        access_codes = [
            AccessCodeInfo(**code) for code in codes_result.data
        ]

        # 4. Get property information
        property_result = supabase.table("properties")\
            .select("*")\
            .eq("id", booking["property_id"])\
            .execute()

        property_data = property_result.data[0] if property_result.data else None

        # 5. Log portal access
        now = datetime.now(timezone.utc).isoformat()

        # Update portal views
        supabase.table("bookings").update({
            "portal_views": booking.get("portal_views", 0) + 1,
            "portal_opened_at": booking.get("portal_opened_at") or now
        }).eq("id", booking_id).execute()

        # Audit log
        supabase.table("audit_logs").insert({
            "event_type": "portal_opened",
            "entity_type": "booking",
            "entity_id": booking_id,
            "actor_type": "guest",
            "description": f"Guest portal accessed by {booking['guest_name']}",
            "status": "success"
        }).execute()

        logger.info(f"✅ Guest portal accessed for booking {booking_id}")

        # 6. Return response
        return GuestPortalData(
            booking=BookingResponse(**booking),
            access_codes=access_codes,
            property=property_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get guest portal data: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
