"""
Booking synchronization and access code provisioning service
Handles automated workflow for Lodgify booking sync and code generation
"""
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional
from app.core.config import settings
from app.core.database import get_supabase
from app.services.code_generator import generate_pin_code, calculate_code_validity
from app.services.tuya_service import get_tuya_service
from app.services.ring_service import get_ring_service
from app.services.notification_service import get_notification_service
import logging
import httpx

logger = logging.getLogger(__name__)


class BookingSyncService:
    """
    Service for syncing bookings from Lodgify and provisioning access codes
    """

    def __init__(self):
        """
        Initialize booking sync service
        """
        self.supabase = get_supabase()
        self.tuya_service = get_tuya_service()
        self.ring_service = get_ring_service()
        self.notification_service = get_notification_service()
        logger.info("✅ Booking sync service initialized")

    async def sync_bookings_from_lodgify(self) -> Dict:
        """
        Sync upcoming bookings from Lodgify API

        Returns:
            Dict with sync statistics
        """
        logger.info("🔄 Starting Lodgify booking sync...")

        if not settings.LODGIFY_API_KEY or not settings.LODGIFY_PROPERTY_ID:
            logger.warning("⚠️ Lodgify API credentials not configured, skipping sync")
            return {"status": "skipped", "reason": "no_credentials"}

        try:
            # Calculate date range (next 90 days)
            start_date = datetime.now(timezone.utc).date()
            end_date = (datetime.now(timezone.utc) + timedelta(days=90)).date()

            # Fetch bookings from Lodgify API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.lodgify.com/v2/reservations",
                    headers={
                        "X-ApiKey": settings.LODGIFY_API_KEY,
                        "Accept": "application/json"
                    },
                    params={
                        "property_id": settings.LODGIFY_PROPERTY_ID,
                        "start": start_date.isoformat(),
                        "end": end_date.isoformat()
                    },
                    timeout=30.0
                )

                if response.status_code != 200:
                    logger.error(f"❌ Lodgify API error: {response.status_code}")
                    return {"status": "error", "message": response.text}

                lodgify_bookings = response.json()

            # Process each booking
            new_count = 0
            updated_count = 0

            for lb in lodgify_bookings:
                try:
                    # Extract booking data
                    booking_data = {
                        "hospitable_id": lb.get("id") or lb.get("booking_id"),
                        "confirmation_code": lb.get("confirmation_code"),
                        "guest_name": lb.get("guest", {}).get("name", "Guest"),
                        "guest_email": lb.get("guest", {}).get("email", ""),
                        "guest_phone": lb.get("guest", {}).get("phone", ""),
                        "guest_language": lb.get("guest", {}).get("language", "en"),
                        "property_id": settings.DEFAULT_PROPERTY_ID,
                        "checkin_date": lb.get("arrival"),
                        "checkout_date": lb.get("departure"),
                        "num_guests": lb.get("people", 1),
                        "status": self._map_lodgify_status(lb.get("status"))
                    }

                    # Upsert booking to database
                    result = self.supabase.table("bookings").upsert(
                        booking_data,
                        on_conflict="hospitable_id"
                    ).execute()

                    if result.data:
                        if len(result.data) > 0:
                            # Check if this was an insert or update
                            existing = self.supabase.table("bookings").select("id").eq(
                                "hospitable_id", booking_data["hospitable_id"]
                            ).execute()

                            if existing.data:
                                updated_count += 1
                            else:
                                new_count += 1

                except Exception as e:
                    logger.error(f"❌ Failed to process booking {lb.get('id')}: {e}")
                    continue

            logger.info(f"✅ Lodgify sync complete: {new_count} new, {updated_count} updated")

            return {
                "status": "success",
                "new_bookings": new_count,
                "updated_bookings": updated_count,
                "total": new_count + updated_count
            }

        except Exception as e:
            logger.error(f"❌ Lodgify sync failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}

    async def provision_codes_for_upcoming_bookings(self) -> Dict:
        """
        Find bookings within provisioning window and create access codes

        Returns:
            Dict with provisioning statistics
        """
        logger.info("🔄 Checking for bookings needing access codes...")

        try:
            # Get bookings needing codes (from database function)
            response = self.supabase.rpc("bookings_needing_codes").execute()

            bookings_needing_codes = response.data or []

            if not bookings_needing_codes:
                logger.info("✅ No bookings need code provisioning")
                return {"status": "success", "codes_provisioned": 0}

            provisioned_count = 0
            failed_count = 0

            for booking in bookings_needing_codes:
                try:
                    success = await self._provision_codes_for_booking(booking)
                    if success:
                        provisioned_count += 1
                    else:
                        failed_count += 1

                except Exception as e:
                    logger.error(f"❌ Failed to provision codes for booking {booking['id']}: {e}")
                    failed_count += 1

            logger.info(f"✅ Code provisioning complete: {provisioned_count} succeeded, {failed_count} failed")

            # Send admin notification
            await self.notification_service.send_telegram(
                f"🔑 *Code Provisioning*\n\n"
                f"✅ Provisioned: {provisioned_count}\n"
                f"❌ Failed: {failed_count}"
            )

            return {
                "status": "success",
                "codes_provisioned": provisioned_count,
                "failed": failed_count
            }

        except Exception as e:
            logger.error(f"❌ Code provisioning job failed: {e}", exc_info=True)
            await self.notification_service.notify_admin_error(
                "Code Provisioning Failed",
                str(e)
            )
            return {"status": "error", "message": str(e)}

    async def _provision_codes_for_booking(self, booking: Dict) -> bool:
        """
        Provision access codes for a single booking

        Args:
            booking: Booking data dict

        Returns:
            True if successful
        """
        booking_id = booking["id"]
        logger.info(f"🔑 Provisioning codes for booking {booking_id}")

        try:
            # Generate single PIN code for all locks
            pin_code = generate_pin_code()

            # Calculate validity period
            checkin_date = datetime.fromisoformat(booking["checkin_date"].replace('Z', '+00:00'))
            checkout_date = datetime.fromisoformat(booking["checkout_date"].replace('Z', '+00:00'))
            valid_from, valid_until = calculate_code_validity(checkin_date, checkout_date)

            # Get all active locks for this property
            locks_response = self.supabase.table("locks").select("*").eq(
                "property_id", booking["property_id"]
            ).eq("is_active", True).execute()

            locks = locks_response.data or []

            if not locks:
                logger.error(f"❌ No active locks found for property {booking['property_id']}")
                return False

            codes_created = []

            # Provision code on each lock
            for lock in locks:
                try:
                    device_id = lock["device_id"]
                    lock_type = lock["lock_type"]

                    # Provision on Tuya device
                    tuya_password_id = None
                    if lock_type in ['main_entrance', 'apartment_door']:
                        tuya_password_id = self.tuya_service.create_temporary_password(
                            device_id=device_id,
                            password=pin_code,
                            valid_from=valid_from,
                            valid_until=valid_until,
                            name=f"{booking['guest_name'][:20]}"
                        )

                    # Provision on Ring device
                    ring_code_id = None
                    if lock_type == 'floor_door':
                        ring_code_id = await self.ring_service.create_guest_code(
                            code=pin_code,
                            label=f"{booking['guest_name'][:20]}",
                            start_time=valid_from,
                            end_time=valid_until
                        )

                    # Create access_code record
                    code_data = {
                        "booking_id": booking_id,
                        "lock_id": lock["id"],
                        "code": pin_code,
                        "lock_name": lock_type,
                        "valid_from": valid_from.isoformat(),
                        "valid_until": valid_until.isoformat(),
                        "status": "active",
                        "tuya_sync_status": "synced" if tuya_password_id else "pending",
                        "tuya_password_id": tuya_password_id,
                        "ring_code_id": ring_code_id,
                        "device_id": device_id
                    }

                    result = self.supabase.table("access_codes").insert(code_data).execute()

                    if result.data:
                        codes_created.append({
                            "lock_type": lock_type,
                            "code": pin_code,
                            "display_name": lock.get("display_name_en", lock_type)
                        })
                        logger.info(f"✅ Code created for {lock_type}")

                except Exception as e:
                    logger.error(f"❌ Failed to provision code for lock {lock['id']}: {e}")
                    continue

            if not codes_created:
                logger.error(f"❌ No codes were successfully created for booking {booking_id}")
                return False

            # Update booking - mark codes as provisioned
            self.supabase.table("bookings").update({
                "codes_provisioned": True,
                "codes_provisioned_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", booking_id).execute()

            # Generate guest portal URL
            guest_token = booking.get("guest_token")
            portal_url = f"{settings.FRONTEND_URL}/guest/{guest_token}" if guest_token else settings.FRONTEND_URL

            # Send notification to guest
            await self.notification_service.send_guest_welcome(
                booking_id=booking_id,
                guest_name=booking["guest_name"],
                guest_phone=booking["guest_phone"],
                guest_language=booking.get("guest_language", "en"),
                checkin_date=checkin_date,
                checkout_date=checkout_date,
                codes=codes_created,
                portal_url=portal_url
            )

            # Notify admin
            await self.notification_service.notify_admin_new_booking(
                guest_name=booking["guest_name"],
                checkin_date=checkin_date,
                checkout_date=checkout_date,
                num_guests=booking.get("num_guests", 1),
                codes_created=len(codes_created)
            )

            logger.info(f"✅ Successfully provisioned codes for booking {booking_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to provision codes for booking {booking_id}: {e}", exc_info=True)
            return False

    def _map_lodgify_status(self, lodgify_status: str) -> str:
        """
        Map Lodgify booking status to internal status

        Args:
            lodgify_status: Lodgify status string

        Returns:
            Internal status string
        """
        status_map = {
            "confirmed": "confirmed",
            "reserved": "confirmed",
            "checked_in": "checked_in",
            "checked_out": "checked_out",
            "cancelled": "cancelled",
            "tentative": "confirmed"
        }

        return status_map.get(lodgify_status.lower(), "confirmed")


# Global instance
_booking_sync_service: Optional[BookingSyncService] = None


def get_booking_sync_service() -> BookingSyncService:
    """
    Get or create booking sync service singleton
    """
    global _booking_sync_service
    if _booking_sync_service is None:
        _booking_sync_service = BookingSyncService()
    return _booking_sync_service
