"""
Admin activity log endpoints
"""
import logging
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.core.dependencies import get_current_admin
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/recent")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get recent activity for dashboard widget

    Args:
        limit: Maximum number of results

    Returns:
        List of recent activity items
    """
    logger.info(f"Admin {current_admin['email']} fetching recent activity")

    supabase = get_supabase()

    try:
        result = supabase.table("audit_logs")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()

        activities = result.data or []

        # Transform for frontend
        transformed = []
        for activity in activities:
            # Determine activity type and icon
            event_type = activity.get("event_type", "unknown")

            # Map event types to frontend-friendly types
            type_mapping = {
                "door_open": "door_open",
                "booking_created": "booking_created",
                "booking_cancelled": "booking_cancelled",
                "code_created": "code_created",
                "code_revoked": "code_revoked",
                "notification_sent": "notification_sent"
            }

            transformed.append({
                "id": activity["id"],
                "type": type_mapping.get(event_type, event_type),
                "guestName": activity.get("metadata", {}).get("guest_name", "Unknown Guest"),
                "location": "Via Landolina #186",  # TODO: Get from property_id
                "timestamp": activity["created_at"],
                "details": activity.get("description", "")
            })

        return transformed

    except Exception as e:
        logger.error(f"Failed to fetch recent activity: {e}")
        # Return empty list as fallback
        return []


@router.get("/")
async def get_activity_log(
    period: str = Query("7days", description="Time period: today, 7days, 30days, all"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get full activity log with filtering

    Args:
        period: Time period to fetch
        event_type: Filter by event type
        limit: Maximum number of results
        offset: Offset for pagination

    Returns:
        List of activity log entries
    """
    logger.info(f"Admin {current_admin['email']} fetching activity log (period: {period}, type: {event_type})")

    supabase = get_supabase()

    try:
        # Calculate date range
        now = datetime.now(timezone.utc)
        if period == "today":
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "7days":
            start_date = now - timedelta(days=7)
        elif period == "30days":
            start_date = now - timedelta(days=30)
        else:  # all
            start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)

        # Build query
        query = supabase.table("audit_logs").select("*")

        # Apply date filter
        query = query.gte("created_at", start_date.isoformat())

        # Apply event type filter
        if event_type and event_type != "all":
            query = query.eq("event_type", event_type)

        # Execute with pagination
        result = query.order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()

        activities = result.data or []

        # Transform for frontend
        transformed = []
        for activity in activities:
            metadata = activity.get("metadata", {})

            transformed.append({
                "id": activity["id"],
                "event_type": activity.get("event_type", "unknown"),
                "guest_name": metadata.get("guest_name"),
                "property_id": activity.get("property_id", "alcova_landolina_fi"),
                "location": "Via Landolina #186",  # TODO: Map from property_id
                "details": activity.get("description", ""),
                "metadata": metadata,
                "timestamp": activity["created_at"]
            })

        return transformed

    except Exception as e:
        logger.error(f"Failed to fetch activity log: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch activity log: {str(e)}"
        )


@router.get("/export")
async def export_activity_log(
    period: str = Query("30days"),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Export activity log as CSV

    Args:
        period: Time period to export

    Returns:
        CSV data
    """
    logger.info(f"Admin {current_admin['email']} exporting activity log")

    # TODO: Implement CSV export
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="CSV export not yet implemented"
    )
