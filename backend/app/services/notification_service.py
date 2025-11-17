"""
Notification service for WhatsApp, SMS, Email, and Telegram
"""
from twilio.rest import Client as TwilioClient
from telegram import Bot
from typing import Optional
from datetime import datetime, timezone
from app.core.config import settings
from app.core.database import get_supabase
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Unified notification service for multiple channels
    """

    def __init__(self):
        """
        Initialize notification clients
        """
        # Twilio for WhatsApp/SMS
        self.twilio = TwilioClient(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )

        # Telegram Bot
        self.telegram = Bot(token=settings.TELEGRAM_BOT_TOKEN)

        logger.info("✅ Notification service initialized")

    async def send_whatsapp(
        self,
        to: str,
        message: str,
        booking_id: Optional[str] = None
    ) -> bool:
        """
        Send WhatsApp message via Twilio

        Args:
            to: Recipient phone number (E.164 format)
            message: Message text
            booking_id: Optional booking ID for logging

        Returns:
            True if sent successfully
        """
        try:
            # Ensure recipient has 'whatsapp:' prefix
            if not to.startswith('whatsapp:'):
                to = f'whatsapp:{to}'

            # Send via Twilio
            twilio_message = self.twilio.messages.create(
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=to,
                body=message
            )

            # Log to database
            await self._log_notification(
                booking_id=booking_id,
                type="whatsapp",
                recipient=to,
                message=message,
                status="sent",
                provider="twilio",
                provider_message_id=twilio_message.sid
            )

            logger.info(f"✅ WhatsApp sent to {to}: {twilio_message.sid}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send WhatsApp: {e}")
            await self._log_notification(
                booking_id=booking_id,
                type="whatsapp",
                recipient=to,
                message=message,
                status="failed",
                error_message=str(e)
            )
            return False

    async def send_sms(
        self,
        to: str,
        message: str,
        booking_id: Optional[str] = None
    ) -> bool:
        """
        Send SMS via Twilio (fallback)

        Args:
            to: Recipient phone number
            message: Message text
            booking_id: Optional booking ID for logging

        Returns:
            True if sent successfully
        """
        try:
            twilio_message = self.twilio.messages.create(
                from_=settings.TWILIO_SMS_FROM,
                to=to,
                body=message
            )

            await self._log_notification(
                booking_id=booking_id,
                type="sms",
                recipient=to,
                message=message,
                status="sent",
                provider="twilio",
                provider_message_id=twilio_message.sid
            )

            logger.info(f"✅ SMS sent to {to}: {twilio_message.sid}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send SMS: {e}")
            await self._log_notification(
                booking_id=booking_id,
                type="sms",
                recipient=to,
                message=message,
                status="failed",
                error_message=str(e)
            )
            return False

    async def send_telegram(
        self,
        message: str,
        chat_id: Optional[str] = None
    ) -> bool:
        """
        Send Telegram message to admin

        Args:
            message: Message text (supports Markdown)
            chat_id: Optional chat ID (defaults to admin)

        Returns:
            True if sent successfully
        """
        try:
            if chat_id is None:
                chat_id = settings.TELEGRAM_ADMIN_CHAT_ID

            await self.telegram.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode='Markdown'
            )

            logger.info(f"✅ Telegram sent to {chat_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send Telegram: {e}")
            return False

    async def send_guest_welcome(
        self,
        booking_id: str,
        guest_name: str,
        guest_phone: str,
        guest_language: str,
        checkin_date: datetime,
        checkout_date: datetime,
        codes: list,
        portal_url: str
    ) -> bool:
        """
        Send welcome message to guest with access codes and portal link

        Args:
            booking_id: Booking UUID
            guest_name: Guest's first name
            guest_phone: Guest's phone number
            guest_language: 'it' or 'en'
            checkin_date: Check-in datetime
            checkout_date: Check-out datetime
            codes: List of access code dicts
            portal_url: Guest portal URL

        Returns:
            True if sent successfully
        """
        # Format dates
        checkin_str = checkin_date.strftime("%d %b, %H:%M")
        checkout_str = checkout_date.strftime("%d %b, %H:%M")

        # Build codes section
        codes_text = "\n".join([
            f"{code.get('display_name', code['lock_type'])}: {code['code']}"
            for code in codes
        ])

        # Message templates
        messages = {
            'it': f"""🏠 Benvenuto in Alcova Landolina!

Ciao {guest_name}, siamo felici di accoglierti!

📅 Check-in: {checkin_str}
📅 Check-out: {checkout_str}

🔑 I tuoi codici d'accesso:
{codes_text}

📱 Tutte le informazioni per il soggiorno:
{portal_url}

Il link scadrà 48h dopo il check-out.

A presto! ✨
""",
            'en': f"""🏠 Welcome to Alcova Landolina!

Hi {guest_name}, we're excited to host you!

📅 Check-in: {checkin_str}
📅 Check-out: {checkout_str}

🔑 Your access codes:
{codes_text}

📱 Everything you need for your stay:
{portal_url}

This link will expire 48h after check-out.

See you soon! ✨
"""
        }

        message = messages.get(guest_language, messages['en'])

        # Try WhatsApp first, fallback to SMS
        success = await self.send_whatsapp(guest_phone, message, booking_id)

        if not success:
            logger.warning("WhatsApp failed, falling back to SMS")
            success = await self.send_sms(guest_phone, message, booking_id)

        return success

    async def notify_admin_new_booking(
        self,
        guest_name: str,
        checkin_date: datetime,
        checkout_date: datetime,
        num_guests: int,
        codes_created: int
    ):
        """
        Notify admin about new booking

        Args:
            guest_name: Guest name
            checkin_date: Check-in datetime
            checkout_date: Check-out datetime
            num_guests: Number of guests
            codes_created: Number of access codes created
        """
        checkin_str = checkin_date.strftime("%d %b")
        checkout_str = checkout_date.strftime("%d %b")

        message = f"""✅ *Nuova Prenotazione*

👤 {guest_name}
📅 {checkin_str} - {checkout_str}
👥 {num_guests} ospiti
🔑 {codes_created} codici generati
📨 Messaggio inviato
"""

        await self.send_telegram(message)

    async def notify_admin_error(self, error_type: str, details: str):
        """
        Notify admin about errors

        Args:
            error_type: Type of error
            details: Error details
        """
        message = f"""❌ *Errore Sistema*

🔴 {error_type}

Dettagli:
{details}
"""

        await self.send_telegram(message)

    async def _log_notification(
        self,
        type: str,
        recipient: str,
        message: str,
        status: str,
        booking_id: Optional[str] = None,
        provider: Optional[str] = None,
        provider_message_id: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """
        Log notification to database

        Args:
            type: Notification type
            recipient: Recipient address
            message: Message content
            status: Status
            booking_id: Optional booking ID
            provider: Optional provider name
            provider_message_id: Optional provider message ID
            error_message: Optional error message
        """
        try:
            supabase = get_supabase()
            data = {
                "booking_id": booking_id,
                "type": type,
                "recipient": recipient,
                "message": message,
                "status": status,
                "provider": provider,
                "provider_message_id": provider_message_id,
                "error_message": error_message,
                "sent_at": datetime.now(timezone.utc).isoformat() if status == "sent" else None
            }

            supabase.table("notifications").insert(data).execute()

        except Exception as e:
            logger.error(f"Failed to log notification: {e}")


# Global instance
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    """
    Get or create notification service singleton
    """
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
