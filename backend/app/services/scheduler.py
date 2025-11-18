"""
APScheduler for automated tasks (auto-revoke codes, etc.)
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import get_supabase
from app.services.tuya_service import get_tuya_service
from app.services.notification_service import get_notification_service
import logging

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler = None


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

    # Daily auto-revoke job at 2 PM
    scheduler.add_job(
        revoke_expired_codes,
        trigger=CronTrigger(hour=settings.AUTO_REVOKE_HOUR, minute=0),
        id="auto_revoke_codes",
        name="Auto-revoke expired codes",
        replace_existing=True
    )

    scheduler.start()
    logger.info(f"✅ Scheduler started (timezone: {settings.SCHEDULER_TIMEZONE})")


def shutdown_scheduler():
    """
    Shutdown the scheduler gracefully
    """
    global scheduler
    if scheduler:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
