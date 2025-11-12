"""
Admin bookings management endpoints
"""
import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, List
from datetime import datetime, timezone
from app.core.dependencies import get_current_admin
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_all_bookings(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by guest name, email, or confirmation code"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get all bookings with optional filtering

    Args:
        status_filter: Filter by booking status
        search: Search query for guest name, email, or confirmation code
        limit: Maximum number of results
        offset: Offset for pagination

    Returns:
        List of bookings with access codes count
    """
    logger.info(f"Admin {current_admin['email']} fetching bookings")

    supabase = get_supabase()

    try:
        # Build query
        query = supabase.table("bookings").select(
            "*, access_codes(count)"
        )

        # Apply status filter
        if status_filter and status_filter != "all":
            query = query.eq("status", status_filter)

        # Apply search (Note: Supabase doesn't support ILIKE directly in client,
        # so we fetch all and filter in Python for now)
        # TODO: Implement PostgreSQL full-text search

        # Execute query with pagination
        result = query.order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()

        bookings = result.data or []

        # Transform data for frontend
        transformed_bookings = []
        for booking in bookings:
            # Count access codes for this booking
            codes_result = supabase.table("access_codes")\
                .select("*", count="exact")\
                .eq("booking_id", booking["id"])\
                .eq("status", "active")\
                .execute()

            transformed_bookings.append({
                "id": booking["id"],
                "hospitable_id": booking.get("hospitable_id", ""),
                "confirmation_code": booking.get("confirmation_code", ""),
                "guest_name": booking["guest_name"],
                "guest_email": booking["guest_email"],
                "guest_phone": booking.get("guest_phone", ""),
                "property_id": booking["property_id"],
                "checkin_date": booking["checkin_date"],
                "checkout_date": booking["checkout_date"],
                "status": booking["status"],
                "created_at": booking["created_at"],
                "access_codes_count": codes_result.count or 0
            })

        # Apply search filter in Python (temporary solution)
        if search:
            search_lower = search.lower()
            transformed_bookings = [
                b for b in transformed_bookings
                if search_lower in b["guest_name"].lower()
                or search_lower in b["guest_email"].lower()
                or search_lower in b.get("confirmation_code", "").lower()
            ]

        return transformed_bookings

    except Exception as e:
        logger.error(f"Failed to fetch bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookings: {str(e)}"
        )


@router.get("/{booking_id}")
async def get_booking_details(
    booking_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get detailed booking information including access codes

    Args:
        booking_id: Booking UUID

    Returns:
        Booking details with all access codes
    """
    logger.info(f"Admin {current_admin['email']} fetching booking {booking_id}")

    supabase = get_supabase()

    try:
        # Get booking
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

        # Get access codes
        codes_result = supabase.table("access_codes")\
            .select("*, locks(*)")\
            .eq("booking_id", booking_id)\
            .order("created_at")\
            .execute()

        # Get audit logs for this booking
        logs_result = supabase.table("audit_logs")\
            .select("*")\
            .eq("booking_id", booking_id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()

        return {
            "booking": booking,
            "access_codes": codes_result.data or [],
            "activity_logs": logs_result.data or []
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch booking details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch booking details: {str(e)}"
        )


@router.post("/{booking_id}/resend-notification")
async def resend_booking_notification(
    booking_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """
    Resend booking notification to guest

    Args:
        booking_id: Booking UUID

    Returns:
        Success message
    """
    logger.info(f"Admin {current_admin['email']} resending notification for booking {booking_id}")

    supabase = get_supabase()

    try:
        # Get booking
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

        # TODO: Implement actual notification resend
        # For now, just log the action
        logger.info(f"Notification resend requested for booking {booking_id}")

        # Create audit log
        supabase.table("audit_logs").insert({
            "booking_id": booking_id,
            "event_type": "notification_resent",
            "description": f"Admin {current_admin['email']} resent notification",
            "metadata": {
                "admin_id": current_admin["sub"],
                "admin_email": current_admin["email"]
            }
        }).execute()

        return {
            "success": True,
            "message": "Notification will be resent to guest"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resend notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend notification: {str(e)}"
        )
