"""
Home Assistant integration service
Controls Tuya smart locks through Home Assistant
"""
import aiohttp
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class HomeAssistantService:
    """
    Service for controlling devices through Home Assistant REST API
    """

    def __init__(self):
        """
        Initialize Home Assistant service
        """
        self.url = settings.HOME_ASSISTANT_URL.rstrip('/')
        self.token = settings.HOME_ASSISTANT_TOKEN

        logger.info("✅ Home Assistant service initialized")

    async def _call_service(
        self,
        domain: str,
        service: str,
        entity_id: str,
        service_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Call a Home Assistant service

        Args:
            domain: Service domain (e.g., 'lock', 'button')
            service: Service name (e.g., 'unlock', 'press')
            entity_id: Entity ID to target
            service_data: Optional additional service data

        Returns:
            True if successful
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }

            payload = {
                "entity_id": entity_id
            }

            if service_data:
                payload.update(service_data)

            url = f"{self.url}/api/services/{domain}/{service}"

            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status in [200, 201]:
                        logger.info(f"✅ HA service called: {domain}.{service} on {entity_id}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ HA service error: {response.status} - {error_text}")
                        return False

        except Exception as e:
            logger.error(f"❌ Failed to call HA service: {e}", exc_info=True)
            return False

    async def unlock_lock(self, entity_id: str, code: Optional[str] = None) -> bool:
        """
        Unlock a smart lock through Home Assistant

        Args:
            entity_id: Lock entity ID (e.g., 'lock.tuya_main_entrance')
            code: Optional unlock code

        Returns:
            True if successful
        """
        service_data = {}
        if code:
            service_data["code"] = code

        return await self._call_service("lock", "unlock", entity_id, service_data)

    async def lock_lock(self, entity_id: str) -> bool:
        """
        Lock a smart lock through Home Assistant

        Args:
            entity_id: Lock entity ID

        Returns:
            True if successful
        """
        return await self._call_service("lock", "lock", entity_id)

    async def set_lock_code(
        self,
        entity_id: str,
        code: str,
        code_slot: int = 1,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Set a temporary code on a Tuya lock through Home Assistant

        Args:
            entity_id: Lock entity ID
            code: The PIN code to set
            code_slot: Code slot number (1-250 depending on lock)
            user_name: Optional user name for the code

        Returns:
            True if successful
        """
        service_data = {
            "code_slot": code_slot,
            "usercode": code
        }

        if user_name:
            service_data["name"] = user_name

        # This uses the lock.set_usercode service if available
        # Note: Service name may vary by integration
        return await self._call_service("lock", "set_usercode", entity_id, service_data)

    async def clear_lock_code(self, entity_id: str, code_slot: int) -> bool:
        """
        Clear a code from a lock

        Args:
            entity_id: Lock entity ID
            code_slot: Code slot number to clear

        Returns:
            True if successful
        """
        service_data = {
            "code_slot": code_slot
        }

        return await self._call_service("lock", "clear_usercode", entity_id, service_data)

    async def press_button(self, entity_id: str) -> bool:
        """
        Press a button entity (e.g., Ring intercom unlock button)

        Args:
            entity_id: Button entity ID

        Returns:
            True if successful
        """
        return await self._call_service("button", "press", entity_id)

    async def open_ring_intercom(self) -> bool:
        """
        Open the Ring intercom using the configured button entity

        Returns:
            True if successful
        """
        return await self.press_button(settings.RING_BUTTON_ENTITY_ID)

    async def get_state(self, entity_id: str) -> Optional[Dict]:
        """
        Get the current state of an entity

        Args:
            entity_id: Entity ID to query

        Returns:
            Entity state dict or None
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            url = f"{self.url}/api/states/{entity_id}"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        state = await response.json()
                        logger.info(f"✅ Retrieved state for {entity_id}")
                        return state
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to get HA state: {response.status} - {error_text}")
                        return None

        except Exception as e:
            logger.error(f"❌ Failed to get HA state: {e}", exc_info=True)
            return None

    async def get_lock_status(self, entity_id: str) -> Optional[str]:
        """
        Get the lock status (locked/unlocked)

        Args:
            entity_id: Lock entity ID

        Returns:
            Lock state ('locked', 'unlocked', 'jammed', etc.) or None
        """
        state = await self.get_state(entity_id)
        if state:
            return state.get("state")
        return None

    async def health_check(self) -> bool:
        """
        Check if Home Assistant is reachable

        Returns:
            True if HA is responding
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.token}",
            }

            url = f"{self.url}/api/"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"✅ HA health check passed: {result.get('message')}")
                        return True
                    else:
                        logger.error(f"❌ HA health check failed: {response.status}")
                        return False

        except Exception as e:
            logger.error(f"❌ HA health check error: {e}", exc_info=True)
            return False


# Global instance
_ha_service: Optional[HomeAssistantService] = None


def get_home_assistant_service() -> HomeAssistantService:
    """
    Get or create Home Assistant service singleton
    """
    global _ha_service
    if _ha_service is None:
        _ha_service = HomeAssistantService()
    return _ha_service
