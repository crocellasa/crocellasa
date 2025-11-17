"""
Ring Intercom integration service
Manages access codes for Ring intercom (floor door)
"""
import aiohttp
import logging
from typing import Optional, Dict
from datetime import datetime, timedelta, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)


class RingIntercomService:
    """
    Service for managing Ring Intercom access codes
    """

    # Ring API endpoints
    RING_API_BASE = "https://api.ring.com"
    OAUTH_ENDPOINT = f"{RING_API_BASE}/oauth/token"

    def __init__(self):
        """
        Initialize Ring Intercom service
        """
        self.refresh_token = settings.RING_REFRESH_TOKEN
        self.device_id = settings.RING_INTERCOM_DEVICE_ID
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[datetime] = None

        logger.info("✅ Ring Intercom service initialized")

    async def _get_access_token(self) -> str:
        """
        Get or refresh Ring API access token

        Returns:
            Valid access token
        """
        # Check if we have a valid token
        if self.access_token and self.token_expires_at:
            if datetime.now(timezone.utc) < self.token_expires_at:
                return self.access_token

        # Refresh token
        try:
            async with aiohttp.ClientSession() as session:
                data = {
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": "ring_official_android",  # Ring's official client ID
                }

                async with session.post(self.OAUTH_ENDPOINT, json=data) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"❌ Ring token refresh failed: {error_text}")
                        raise Exception(f"Ring authentication failed: {response.status}")

                    result = await response.json()
                    self.access_token = result["access_token"]

                    # Token typically expires in 1 hour, refresh 5 min early
                    expires_in = result.get("expires_in", 3600)
                    self.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in - 300)

                    logger.info("✅ Ring access token refreshed")
                    return self.access_token

        except Exception as e:
            logger.error(f"❌ Failed to get Ring access token: {e}", exc_info=True)
            raise

    async def create_access_code(
        self,
        guest_name: str,
        code: str,
        valid_from: datetime,
        valid_until: datetime
    ) -> Optional[str]:
        """
        Create a temporary access code on Ring intercom

        Args:
            guest_name: Name of the guest
            code: Access code (typically 4-6 digits)
            valid_from: Start validity datetime
            valid_until: End validity datetime

        Returns:
            Code ID if successful, None otherwise
        """
        try:
            token = await self._get_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            # Convert to Unix timestamps
            start_timestamp = int(valid_from.timestamp())
            end_timestamp = int(valid_until.timestamp())

            payload = {
                "description": guest_name,
                "code": code,
                "starts_at": start_timestamp,
                "ends_at": end_timestamp,
                "enabled": True
            }

            url = f"{self.RING_API_BASE}/clients_api/intercoms/{self.device_id}/codes"

            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status in [200, 201]:
                        result = await response.json()
                        code_id = result.get("id") or result.get("code_id") or f"ring_{code}"

                        logger.info(f"✅ Created Ring access code for {guest_name}: {code_id}")
                        return code_id
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Ring API error: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Failed to create Ring access code: {e}", exc_info=True)
            return None

    async def revoke_access_code(self, code_id: str) -> bool:
        """
        Revoke/delete an access code from Ring intercom

        Args:
            code_id: The Ring code ID to revoke

        Returns:
            True if successful
        """
        try:
            token = await self._get_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
            }

            url = f"{self.RING_API_BASE}/clients_api/intercoms/{self.device_id}/codes/{code_id}"

            async with aiohttp.ClientSession() as session:
                async with session.delete(url, headers=headers) as response:
                    if response.status in [200, 204]:
                        logger.info(f"✅ Revoked Ring access code: {code_id}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to revoke Ring code: {response.status} - {error_text}")
                        return False

        except Exception as e:
            logger.error(f"❌ Failed to revoke Ring access code: {e}", exc_info=True)
            return False

    async def get_device_status(self) -> Optional[Dict]:
        """
        Get Ring intercom device status

        Returns:
            Device status dict or None
        """
        try:
            token = await self._get_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
            }

            url = f"{self.RING_API_BASE}/clients_api/ring_devices"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        devices = await response.json()

                        # Find our specific intercom
                        for device in devices.get("intercoms", []):
                            if device.get("id") == int(self.device_id):
                                logger.info(f"✅ Ring device status retrieved")
                                return device

                        logger.warning(f"⚠️ Ring device {self.device_id} not found")
                        return None
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to get Ring status: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Failed to get Ring device status: {e}", exc_info=True)
            return None

    async def list_access_codes(self) -> list:
        """
        List all access codes for the Ring intercom

        Returns:
            List of access codes
        """
        try:
            token = await self._get_access_token()

            headers = {
                "Authorization": f"Bearer {token}",
            }

            url = f"{self.RING_API_BASE}/clients_api/intercoms/{self.device_id}/codes"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        codes = await response.json()
                        logger.info(f"✅ Retrieved {len(codes)} Ring access codes")
                        return codes
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to list Ring codes: {response.status} - {error_text}")
                        return []

        except Exception as e:
            logger.error(f"❌ Failed to list Ring access codes: {e}", exc_info=True)
            return []


# Global instance
_ring_service: Optional[RingIntercomService] = None


def get_ring_service() -> RingIntercomService:
    """
    Get or create Ring service singleton
    """
    global _ring_service
    if _ring_service is None:
        _ring_service = RingIntercomService()
    return _ring_service
