"""
Tuya Smart Lock integration service
"""
from tuya_connector import TuyaOpenAPI
from datetime import datetime
from typing import List, Dict, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class TuyaLockService:
    """
    Service for interacting with Tuya Cloud API to manage smart locks
    """

    def __init__(self):
        """
        Initialize Tuya OpenAPI client
        """
        self.api = TuyaOpenAPI(
            endpoint=f"https://openapi.tuya{settings.TUYA_REGION}.com",
            access_id=settings.TUYA_CLIENT_ID,
            access_secret=settings.TUYA_SECRET
        )
        self.api.connect()
        logger.info("✅ Tuya API initialized")

    def create_temporary_password(
        self,
        device_id: str,
        password: str,
        valid_from: datetime,
        valid_until: datetime,
        name: str = "Guest"
    ) -> Optional[str]:
        """
        Create a temporary password on Tuya lock

        Args:
            device_id: Tuya device ID
            password: PIN code (6-10 digits)
            valid_from: Start validity timestamp
            valid_until: End validity timestamp
            name: Name/description for the password

        Returns:
            Tuya password ID if successful, None otherwise
        """
        try:
            # Convert to timestamps (milliseconds)
            start_time = int(valid_from.timestamp() * 1000)
            end_time = int(valid_until.timestamp() * 1000)

            # API payload
            payload = {
                "password": password,
                "password_type": "ticket",  # temporary password
                "ticket_id": name,
                "effective_time": start_time,
                "invalid_time": end_time,
                "name": name
            }

            # Call Tuya API
            response = self.api.post(
                f"/v1.0/devices/{device_id}/door-lock/temp-password",
                payload
            )

            if response.get("success"):
                password_id = response.get("result", {}).get("id")
                logger.info(f"✅ Created temporary password on device {device_id}: {password_id}")
                return password_id
            else:
                logger.error(f"❌ Failed to create password: {response.get('msg')}")
                return None

        except Exception as e:
            logger.error(f"❌ Tuya API error: {e}", exc_info=True)
            return None

    def delete_temporary_password(self, device_id: str, password_id: str) -> bool:
        """
        Delete a temporary password from Tuya lock

        Args:
            device_id: Tuya device ID
            password_id: Tuya password ID to delete

        Returns:
            True if successful
        """
        try:
            response = self.api.delete(
                f"/v1.0/devices/{device_id}/door-lock/temp-passwords/{password_id}"
            )

            if response.get("success"):
                logger.info(f"✅ Deleted password {password_id} from device {device_id}")
                return True
            else:
                logger.error(f"❌ Failed to delete password: {response.get('msg')}")
                return False

        except Exception as e:
            logger.error(f"❌ Tuya API error: {e}", exc_info=True)
            return False

    def get_device_status(self, device_id: str) -> Optional[Dict]:
        """
        Get lock device status

        Args:
            device_id: Tuya device ID

        Returns:
            Device status dict or None
        """
        try:
            response = self.api.get(f"/v1.0/devices/{device_id}")

            if response.get("success"):
                return response.get("result")
            else:
                logger.error(f"❌ Failed to get device status: {response.get('msg')}")
                return None

        except Exception as e:
            logger.error(f"❌ Tuya API error: {e}", exc_info=True)
            return None

    def list_temporary_passwords(self, device_id: str) -> List[Dict]:
        """
        List all temporary passwords for a device

        Args:
            device_id: Tuya device ID

        Returns:
            List of password dictionaries
        """
        try:
            response = self.api.get(f"/v1.0/devices/{device_id}/door-lock/temp-passwords")

            if response.get("success"):
                return response.get("result", [])
            else:
                logger.error(f"❌ Failed to list passwords: {response.get('msg')}")
                return []

        except Exception as e:
            logger.error(f"❌ Tuya API error: {e}", exc_info=True)
            return []


# Global instance
_tuya_service: Optional[TuyaLockService] = None


def get_tuya_service() -> TuyaLockService:
    """
    Get or create Tuya service singleton
    """
    global _tuya_service
    if _tuya_service is None:
        _tuya_service = TuyaLockService()
    return _tuya_service
