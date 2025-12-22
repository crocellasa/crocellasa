"""
APScheduler for automated tasks (booking sync, code provisioning, auto-revoke, etc.)
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import get_supabase
from app.services.tuya_service import get_tuya_service
from app.services.notification_service import get_notification_service
from app.services.booking_sync_service import get_booking_sync_service
import logging

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler = None


async def sync_bookings_from_lodgify():
    """
    Twice-daily job (12 AM and 6 PM) to sync bookings from Lodgify
    """
    logger.info("🔄 Running booking sync job...")

    try:
        booking_sync_service = get_booking_sync_service()
        result = await booking_sync_service.sync_bookings_from_lodgify()

        if result["status"] == "success":
            logger.info(f"✅ Booking sync complete: {result.get('total', 0)} bookings processed")
        elif result["status"] == "skipped":
            logger.info(f"⏭️ Booking sync skipped: {result.get('reason', 'unknown')}")
        else:
            logger.error(f"❌ Booking sync failed: {result.get('message', 'unknown error')}")

    except Exception as e:
        logger.error(f"❌ Booking sync job failed: {e}", exc_info=True)
        try:
            notification_service = get_notification_service()
            await notification_service.notify_admin_error(
                "Booking Sync Job Failed",
                str(e)
            )
        except:
            pass


async def provision_access_codes():
    """
    Twice-daily job (12 AM and 6 PM) to provision access codes for upcoming bookings
    """
    logger.info("🔄 Running code provisioning job...")

    try:
        booking_sync_service = get_booking_sync_service()
        result = await booking_sync_service.provision_codes_for_upcoming_bookings()

        if result["status"] == "success":
            logger.info(f"✅ Code provisioning complete: {result.get('codes_provisioned', 0)} bookings processed")
        else:
            logger.error(f"❌ Code provisioning failed: {result.get('message', 'unknown error')}")

    except Exception as e:
        logger.error(f"❌ Code provisioning job failed: {e}", exc_info=True)
        try:
            notification_service = get_notification_service()
            await notification_service.notify_admin_error(
                "Code Provisioning Job Failed",
                str(e)
            )
        except:
            pass


async def revoke_expired_codes():
    """
    Daily job to revoke expired access codes
    """
    logger.info("🔄 Running auto-revoke job...")

    try:
        supabase = get_supabase()
        tuya_service = get_tuya_service()

        # Get all codes that need revocation
        response = supabase.rpc("codes_to_revoke").execute()

        codes_to_revoke = response.data

        if not codes_to_revoke:
            logger.info("✅ No codes to revoke")
            return

        revoked_count = 0
        failed_count = 0

        for code in codes_to_revoke:
            try:
                # Delete from Tuya
                if code.get('tuya_password_id'):
                    success = tuya_service.delete_temporary_password(
                        code['device_id'],
                        code['tuya_password_id']
                    )

                    if success:
                        # Update database
                        supabase.table("access_codes").update({
                            "status": "revoked",
                            "revoked_at": datetime.now(timezone.utc).isoformat(),
                            "revoked_reason": "Auto-revoke: expired"
                        }).eq("id", code['id']).execute()

                        revoked_count += 1
                    else:
                        failed_count += 1
                else:
                    # No Tuya ID, just mark as revoked
                    supabase.table("access_codes").update({
                        "status": "revoked",
                        "revoked_at": datetime.now(timezone.utc).isoformat(),
                        "revoked_reason": "Auto-revoke: no tuya_id"
                    }).eq("id", code['id']).execute()
                    revoked_count += 1

            except Exception as e:
                logger.error(f"Failed to revoke code {code['id']}: {e}")
                failed_count += 1

        # Update checkout status
        supabase.table("bookings").update({
            "status": "checked_out"
        }).lt("checkout_date", datetime.now(timezone.utc).isoformat()).eq("status", "checked_in").execute()

        logger.info(f"✅ Auto-revoke complete: {revoked_count} revoked, {failed_count} failed")

        # Notify admin
        notification_service = get_notification_service()
        await notification_service.send_telegram(
            f"🧹 *Daily Auto-Revoke*\n\n"
            f"✅ Revocati: {revoked_count}\n"
            f"❌ Falliti: {failed_count}"
        )

    except Exception as e:
        logger.error(f"❌ Auto-revoke job failed: {e}", exc_info=True)

        # Notify admin of error
        try:
            notification_service = get_notification_service()
            await notification_service.notify_admin_error(
                "Auto-revoke Job Failed",
                str(e)
            )
        except:
            pass


def init_scheduler():
    """
    Initialize and start the scheduler
    """
    global scheduler

    scheduler = AsyncIOScheduler(timezone=settings.SCHEDULER_TIMEZONE)

    # Booking sync jobs (at 12 AM and 6 PM)
    for hour in settings.BOOKING_SYNC_HOURS:
        scheduler.add_job(
            sync_bookings_from_lodgify,
            trigger=CronTrigger(hour=hour, minute=0),
            id=f"sync_bookings_{hour:02d}00",
            name=f"Sync bookings from Lodgify at {hour:02d}:00",
            replace_existing=True
        )

    # Code provisioning jobs (at 12 AM and 6 PM)
    for hour in settings.CODE_PROVISIONING_HOURS:
        scheduler.add_job(
            provision_access_codes,
            trigger=CronTrigger(hour=hour, minute=0),
            id=f"provision_codes_{hour:02d}00",
            name=f"Provision access codes at {hour:02d}:00",
            replace_existing=True
        )

    # Daily auto-revoke job at 2 PM
    scheduler.add_job(
        revoke_expired_codes,
        trigger=CronTrigger(hour=settings.AUTO_REVOKE_HOUR, minute=0),
        id="auto_revoke_codes",
        name="Auto-revoke expired codes",
        replace_existing=True
    )

    scheduler.start()
    sync_times = ", ".join([f"{h:02d}:00" for h in settings.BOOKING_SYNC_HOURS])
    provisioning_times = ", ".join([f"{h:02d}:00" for h in settings.CODE_PROVISIONING_HOURS])
    total_jobs = 1 + len(settings.BOOKING_SYNC_HOURS) + len(settings.CODE_PROVISIONING_HOURS)
    logger.info(f"✅ Scheduler started with {total_jobs} jobs (timezone: {settings.SCHEDULER_TIMEZONE})")
    logger.info(f"   - Booking sync: daily at {sync_times}")
    logger.info(f"   - Code provisioning: daily at {provisioning_times}")
    logger.info(f"   - Auto-revoke: daily at {settings.AUTO_REVOKE_HOUR}:00")


def shutdown_scheduler():
    """
    Shutdown the scheduler gracefully
    """
    global scheduler
    if scheduler:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
