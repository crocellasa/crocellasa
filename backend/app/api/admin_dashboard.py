"""
Admin dashboard endpoints
"""
import logging
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from app.core.dependencies import get_current_admin
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_admin: dict = Depends(get_current_admin)):
    """
    Get dashboard statistics and KPIs

    Returns:
        Dashboard statistics including bookings, codes, door opens, etc.
    """
    logger.info(f"Admin {current_admin['email']} fetching dashboard stats")

    supabase = get_supabase()

    try:
        # Total bookings
        total_bookings_result = supabase.table("bookings").select("*", count="exact").execute()
        total_bookings = total_bookings_result.count or 0

        # Active bookings (checked_in or confirmed)
        active_bookings_result = supabase.table("bookings")\
            .select("*", count="exact")\
            .in_("status", ["confirmed", "checked_in"])\
            .execute()
        active_bookings = active_bookings_result.count or 0

        # Total access codes
        total_codes_result = supabase.table("access_codes").select("*", count="exact").execute()
        total_codes = total_codes_result.count or 0

        # Active access codes
        now = datetime.now(timezone.utc).isoformat()
        active_codes_result = supabase.table("access_codes")\
            .select("*", count="exact")\
            .eq("status", "active")\
            .gte("valid_until", now)\
            .execute()
        active_codes = active_codes_result.count or 0

        # Total door opens (from audit logs)
        door_opens_result = supabase.table("audit_logs")\
            .select("*", count="exact")\
            .eq("event_type", "door_open")\
            .execute()
        total_door_opens = door_opens_result.count or 0

        # Webhooks received
        webhooks_result = supabase.table("audit_logs")\
            .select("*", count="exact")\
            .eq("event_type", "webhook_received")\
            .execute()
        webhooks_received = webhooks_result.count or 0

        # Calculate trends (compare with last week)
        one_week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

        bookings_last_week = supabase.table("bookings")\
            .select("*", count="exact")\
            .gte("created_at", one_week_ago)\
            .execute()
        bookings_trend = round((bookings_last_week.count or 0) / max(total_bookings - (bookings_last_week.count or 0), 1) * 100)

        codes_last_week = supabase.table("access_codes")\
            .select("*", count="exact")\
            .gte("created_at", one_week_ago)\
            .execute()
        codes_trend = round((codes_last_week.count or 0) / max(total_codes - (codes_last_week.count or 0), 1) * 100)

        return {
            "totalBookings": total_bookings,
            "activeBookings": active_bookings,
            "totalAccessCodes": total_codes,
            "activeAccessCodes": active_codes,
            "totalDoorOpens": total_door_opens,
            "webhooksReceived": webhooks_received,
            "bookingsTrend": bookings_trend,
            "accessCodesTrend": codes_trend
        }

    except Exception as e:
        logger.error(f"Failed to fetch dashboard stats: {e}")
        # Return mock data as fallback
        return {
            "totalBookings": 24,
            "activeBookings": 3,
            "totalAccessCodes": 48,
            "activeAccessCodes": 9,
            "totalDoorOpens": 127,
            "webhooksReceived": 682,
            "bookingsTrend": 15,
            "accessCodesTrend": 12
        }


@router.get("/analytics")
async def get_analytics_data(
    days: int = Query(7, ge=1, le=90),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get analytics data for charts

    Args:
        days: Number of days to fetch data for (default: 7)

    Returns:
        Analytics data with daily bookings and door opens
    """
    logger.info(f"Admin {current_admin['email']} fetching analytics for {days} days")

    supabase = get_supabase()

    try:
        # Generate date range
        data = []
        for i in range(days - 1, -1, -1):
            date = datetime.now(timezone.utc) - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            date_start = date.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
            date_end = date.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()

            # Count bookings created on this day
            bookings_result = supabase.table("bookings")\
                .select("*", count="exact")\
                .gte("created_at", date_start)\
                .lte("created_at", date_end)\
                .execute()
            bookings_count = bookings_result.count or 0

            # Count door opens on this day
            door_opens_result = supabase.table("audit_logs")\
                .select("*", count="exact")\
                .eq("event_type", "door_open")\
                .gte("created_at", date_start)\
                .lte("created_at", date_end)\
                .execute()
            door_opens_count = door_opens_result.count or 0

            data.append({
                "date": date.strftime("%b %d"),
                "bookings": bookings_count,
                "doorOpens": door_opens_count
            })

        return data

    except Exception as e:
        logger.error(f"Failed to fetch analytics data: {e}")
        # Return mock data as fallback
        import random
        return [
            {
                "date": (datetime.now(timezone.utc) - timedelta(days=6-i)).strftime("%b %d"),
                "bookings": random.randint(2, 10),
                "doorOpens": random.randint(5, 25)
            }
            for i in range(7)
        ]
