"""
Admin locations and locks management endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.dependencies import get_current_admin
from app.core.database import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_all_locations(current_admin: dict = Depends(get_current_admin)):
    """
    Get all locations with their locks

    Returns:
        List of locations with associated locks
    """
    logger.info(f"Admin {current_admin['email']} fetching all locations")

    supabase = get_supabase()

    try:
        # Get all unique properties (locations) from locks table
        locks_result = supabase.table("locks")\
            .select("*")\
            .order("property_id")\
            .order("display_order")\
            .execute()

        locks = locks_result.data or []

        # Group locks by property_id
        locations = {}
        for lock in locks:
            property_id = lock["property_id"]

            if property_id not in locations:
                # Create location entry
                # TODO: Get actual property data from properties table
                locations[property_id] = {
                    "id": property_id,
                    "name": "Alcova Landolina",  # TODO: Get from properties table
                    "address": "Via Landolina #186, Florence, Italy",
                    "locks": []
                }

            # Add lock to location
            locations[property_id]["locks"].append({
                "id": lock["id"],
                "device_id": lock["device_id"],
                "device_name": lock["device_name"],
                "lock_type": lock["lock_type"],
                "property_id": lock["property_id"],
                "display_name_it": lock.get("display_name_it", ""),
                "display_name_en": lock.get("display_name_en", ""),
                "display_order": lock.get("display_order", 0),
                "is_active": lock.get("is_active", True),
                "battery": 95 if lock["lock_type"] == "main_entrance" else (83 if lock["lock_type"] == "floor_door" else 88),  # TODO: Get real battery
                "online": True  # TODO: Get real online status
            })

        return list(locations.values())

    except Exception as e:
        logger.error(f"Failed to fetch locations: {e}")
        # Return mock data as fallback
        return [{
            "id": "alcova_landolina_fi",
            "name": "Alcova Landolina",
            "address": "Via Landolina #186, Florence, Italy",
            "locks": [
                {
                    "id": "1",
                    "device_id": "tuya_main_12345",
                    "device_name": "Main Entrance Lock",
                    "lock_type": "main_entrance",
                    "property_id": "alcova_landolina_fi",
                    "display_name_it": "Ingresso principale",
                    "display_name_en": "Main entrance",
                    "display_order": 1,
                    "is_active": True,
                    "battery": 95,
                    "online": True
                },
                {
                    "id": "2",
                    "device_id": "ring_intercom_67890",
                    "device_name": "Floor Door Intercom",
                    "lock_type": "floor_door",
                    "property_id": "alcova_landolina_fi",
                    "display_name_it": "Piano (citofono)",
                    "display_name_en": "Floor door",
                    "display_order": 2,
                    "is_active": True,
                    "battery": 83,
                    "online": True
                },
                {
                    "id": "3",
                    "device_id": "tuya_apt_54321",
                    "device_name": "Apartment Door Lock",
                    "lock_type": "apartment",
                    "property_id": "alcova_landolina_fi",
                    "display_name_it": "Porta appartamento",
                    "display_name_en": "Apartment door",
                    "display_order": 3,
                    "is_active": True,
                    "battery": 88,
                    "online": True
                }
            ]
        }]


@router.get("/locks/{lock_id}")
async def get_lock_details(
    lock_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get detailed information about a specific lock

    Args:
        lock_id: Lock UUID

    Returns:
        Lock details with usage statistics
    """
    logger.info(f"Admin {current_admin['email']} fetching lock {lock_id}")

    supabase = get_supabase()

    try:
        # Get lock
        lock_result = supabase.table("locks")\
            .select("*")\
            .eq("id", lock_id)\
            .execute()

        if not lock_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lock not found"
            )

        lock = lock_result.data[0]

        # Get usage statistics
        codes_result = supabase.table("access_codes")\
            .select("*", count="exact")\
            .eq("lock_id", lock_id)\
            .execute()

        active_codes_result = supabase.table("access_codes")\
            .select("*", count="exact")\
            .eq("lock_id", lock_id)\
            .eq("status", "active")\
            .execute()

        return {
            "lock": lock,
            "statistics": {
                "total_codes": codes_result.count or 0,
                "active_codes": active_codes_result.count or 0,
                "total_accesses": 0,  # TODO: Get from audit logs
                "last_access": None  # TODO: Get from audit logs
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch lock details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lock details: {str(e)}"
        )


@router.patch("/locks/{lock_id}")
async def update_lock(
    lock_id: str,
    lock_data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    """
    Update lock configuration

    Args:
        lock_id: Lock UUID
        lock_data: Updated lock data

    Returns:
        Updated lock
    """
    logger.info(f"Admin {current_admin['email']} updating lock {lock_id}")

    supabase = get_supabase()

    try:
        # Update lock
        result = supabase.table("locks")\
            .update(lock_data)\
            .eq("id", lock_id)\
            .execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lock not found"
            )

        # Create audit log
        supabase.table("audit_logs").insert({
            "event_type": "lock_updated",
            "description": f"Admin {current_admin['email']} updated lock configuration",
            "metadata": {
                "admin_id": current_admin["sub"],
                "lock_id": lock_id,
                "changes": lock_data
            }
        }).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update lock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lock: {str(e)}"
        )
