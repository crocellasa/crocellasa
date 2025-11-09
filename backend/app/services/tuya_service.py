"""
Tuya Smart Lock integration service
"""
from datetime import datetime
from typing import List, Dict, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Try to import Tuya library - gracefully handle if not available
try:
    import tinytuya
    TUYA_AVAILABLE = True
    logger.info("✅ TinyTuya library loaded")
except ImportError:
    TUYA_AVAILABLE = False
    logger.warning("⚠️ TinyTuya not available - Tuya features will be mocked")


class TuyaLockService:
    """
    Service for interacting with Tuya Cloud API to manage smart locks
    """

    def __init__(self):
        """
        Initialize Tuya Cloud API client
        """
        if not TUYA_AVAILABLE:
            logger.warning("⚠️ Tuya service running in MOCK mode")
            self.cloud = None
            return

        try:
            # Initialize TinyTuya Cloud
            self.cloud = tinytuya.Cloud(
                apiRegion=settings.TUYA_REGION,
                apiKey=settings.TUYA_CLIENT_ID,
                apiSecret=settings.TUYA_SECRET
            )
            logger.info("✅ Tuya Cloud API initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Tuya: {e}")
            self.cloud = None

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
        if not TUYA_AVAILABLE or not self.cloud:
            logger.warning(f"⚠️ MOCK: Would create password '{password}' for {name}")
            return f"mock_password_{password}"

        try:
            # Convert to timestamps (seconds for TinyTuya)
            start_time = int(valid_from.timestamp())
            end_time = int(valid_until.timestamp())

            # Call Tuya Cloud API
            # Note: The exact API endpoint may vary - this is a placeholder
            # You'll need to configure this with real Tuya credentials
            result = self.cloud.sendcommand(
                device_id,
                {
                    "commands": [{
                        "code": "temporary_password",
                        "value": {
                            "password": password,
                            "effective_time": start_time,
                            "invalid_time": end_time,
                            "name": name
                        }
                    }]
                }
            )

            if result and result.get("success"):
                password_id = result.get("result", {}).get("id", f"pwd_{password}")
                logger.info(f"✅ Created temporary password on device {device_id}")
                return password_id
            else:
                logger.error(f"❌ Failed to create password: {result}")
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
        if not TUYA_AVAILABLE or not self.cloud:
            logger.warning(f"⚠️ MOCK: Would delete password {password_id}")
            return True

        try:
            # Call Tuya Cloud API to delete password
            result = self.cloud.sendcommand(
                device_id,
                {
                    "commands": [{
                        "code": "delete_temporary_password",
                        "value": {"id": password_id}
                    }]
                }
            )

            if result and result.get("success"):
                logger.info(f"✅ Deleted password {password_id} from device {device_id}")
                return True
            else:
                logger.error(f"❌ Failed to delete password: {result}")
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
        if not TUYA_AVAILABLE or not self.cloud:
            logger.warning(f"⚠️ MOCK: Would get status for device {device_id}")
            return {"online": True, "status": "mock"}

        try:
            result = self.cloud.getstatus(device_id)

            if result and result.get("success"):
                return result.get("result")
            else:
                logger.error(f"❌ Failed to get device status: {result}")
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
        if not TUYA_AVAILABLE or not self.cloud:
            logger.warning(f"⚠️ MOCK: Would list passwords for device {device_id}")
            return []

        try:
            # This endpoint might not be directly available in TinyTuya
            # May need to use raw API calls
            logger.warning("⚠️ list_temporary_passwords not yet implemented for TinyTuya")
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
