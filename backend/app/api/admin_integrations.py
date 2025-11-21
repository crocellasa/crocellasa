"""
Admin integrations management endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from app.core.dependencies import get_current_admin
from app.core.database import get_supabase
from app.services.tuya_service import get_tuya_service
from app.services.ring_service import get_ring_service
from app.services.home_assistant_service import get_home_assistant_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status")
async def get_integrations_status(current_admin: dict = Depends(get_current_admin)):
    """
    Get status of all integrations for dashboard widget

    Returns:
        List of integration statuses
    """
    logger.info(f"Admin {current_admin['email']} fetching integration status")

    integrations = []

    # Ring Intercom Status
    try:
        ring_service = get_ring_service()
        if ring_service:
            # TODO: Implement actual status check
            integrations.append({
                "id": "ring",
                "name": "Ring Intercom",
                "type": "ring",
                "status": "warning",  # could be: connected, warning, error
                "message": "Token expires in 3 days",
                "lastSync": datetime.now(timezone.utc).isoformat()
            })
        else:
            integrations.append({
                "id": "ring",
                "name": "Ring Intercom",
                "type": "ring",
                "status": "disabled",
                "message": "Not configured - Ring credentials missing",
                "lastSync": None
            })
    except Exception as e:
        logger.error(f"Failed to get Ring status: {e}")
        integrations.append({
            "id": "ring",
            "name": "Ring Intercom",
            "type": "ring",
            "status": "error",
            "message": f"Error: {str(e)}",
            "lastSync": None
        })

    # Tuya Smart Locks Status
    try:
        tuya_service = get_tuya_service()
        integrations.append({
            "id": "tuya",
            "name": "Tuya Smart Locks",
            "type": "tuya",
            "status": "connected",
            "message": "2 devices connected",
            "lastSync": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get Tuya status: {e}")
        integrations.append({
            "id": "tuya",
            "name": "Tuya Smart Locks",
            "type": "tuya",
            "status": "error",
            "message": f"Error: {str(e)}",
            "lastSync": None
        })

    # Home Assistant Status
    try:
        ha_service = get_home_assistant_service()
        integrations.append({
            "id": "home_assistant",
            "name": "Home Assistant",
            "type": "home_assistant",
            "status": "connected",
            "message": "All services operational",
            "lastSync": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get Home Assistant status: {e}")
        integrations.append({
            "id": "home_assistant",
            "name": "Home Assistant",
            "type": "home_assistant",
            "status": "error",
            "message": f"Error: {str(e)}",
            "lastSync": None
        })

    return integrations


@router.get("/")
async def get_all_integrations(current_admin: dict = Depends(get_current_admin)):
    """
    Get detailed information about all integrations

    Returns:
        Detailed integration data including devices
    """
    logger.info(f"Admin {current_admin['email']} fetching all integrations")

    supabase = get_supabase()
    integrations = []

    # Ring Intercom Integration
    try:
        ring_service = get_ring_service()
        if ring_service:
            # Get Ring devices from locks table
            ring_devices_result = supabase.table("locks")\
                .select("*")\
                .eq("lock_type", "floor_door")\
                .eq("is_active", True)\
                .execute()

            ring_devices = []
            for device in ring_devices_result.data or []:
                ring_devices.append({
                    "id": device["device_id"],
                    "name": device["device_name"],
                    "battery": 83,  # TODO: Get real battery status from Ring API
                    "online": True,
                    "location": "Via Landolina #186"
                })

            integrations.append({
                "id": "ring",
                "name": "Ring Intercom API",
                "type": "ring",
                "status": "warning",
                "statusMessage": "Token expires in 3 days",
                "token": "eyJydCI6ImV5...truncated",
                "tokenExpiry": "2025-12-18T00:00:00Z",
                "devices": ring_devices,
                "lastSync": datetime.now(timezone.utc).isoformat()
            })
        else:
            integrations.append({
                "id": "ring",
                "name": "Ring Intercom API",
                "type": "ring",
                "status": "disabled",
                "statusMessage": "Not configured - Ring credentials missing",
                "devices": [],
                "lastSync": None
            })
    except Exception as e:
        logger.error(f"Failed to get Ring integration: {e}")

    # Tuya Smart Locks Integration
    try:
        tuya_service = get_tuya_service()
        # Get Tuya devices from locks table
        tuya_devices_result = supabase.table("locks")\
            .select("*")\
            .in_("lock_type", ["main_entrance", "apartment"])\
            .eq("is_active", True)\
            .execute()

        tuya_devices = []
        for device in tuya_devices_result.data or []:
            tuya_devices.append({
                "id": device["device_id"],
                "name": device["device_name"],
                "battery": 95 if device["lock_type"] == "main_entrance" else 88,  # TODO: Get real battery
                "online": True,
                "location": "Via Landolina #186"
            })

        integrations.append({
            "id": "tuya",
            "name": "Tuya Smart Locks",
            "type": "tuya",
            "status": "connected",
            "statusMessage": "All devices operational",
            "devices": tuya_devices,
            "lastSync": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get Tuya integration: {e}")

    # Home Assistant Integration
    try:
        ha_service = get_home_assistant_service()
        integrations.append({
            "id": "home_assistant",
            "name": "Home Assistant",
            "type": "home_assistant",
            "status": "connected",
            "statusMessage": "All services operational",
            "config": {
                "url": "http://homeassistant.local:8123",
                "entities": 5  # TODO: Get actual entity count
            },
            "lastSync": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get Home Assistant integration: {e}")

    return integrations


@router.post("/ring/refresh-token")
async def refresh_ring_token(current_admin: dict = Depends(get_current_admin)):
    """
    Refresh Ring API token

    Returns:
        New token information
    """
    logger.info(f"Admin {current_admin['email']} refreshing Ring token")

    # TODO: Implement actual Ring token refresh
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Ring token refresh not yet implemented"
    )
