"""
Configuration management using Pydantic Settings
Loads environment variables from .env file
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List, Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """

    # Application
    APP_ENV: str = "development"
    APP_NAME: str = "Alcova Smart Check-in"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    SECRET_KEY: Optional[str] = None
    DEBUG: bool = False

    # Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # Tuya
    TUYA_CLIENT_ID: Optional[str] = None
    TUYA_SECRET: Optional[str] = None
    TUYA_REGION: str = "eu"
    TUYA_DEVICE_MAIN_ENTRANCE: Optional[str] = None
    TUYA_DEVICE_FLOOR_DOOR: Optional[str] = None
    TUYA_DEVICE_APARTMENT: Optional[str] = None

    # Twilio (WhatsApp/SMS)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_FROM: Optional[str] = None
    TWILIO_SMS_FROM: Optional[str] = None

    # Telegram
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_ADMIN_CHAT_ID: Optional[str] = None

    # Home Assistant (for Tuya locks automation)
    HOME_ASSISTANT_URL: Optional[str] = None
    HOME_ASSISTANT_TOKEN: Optional[str] = None

    # Ring Intercom (floor door)
    RING_REFRESH_TOKEN: Optional[str] = None  # Ring API refresh token
    RING_INTERCOM_DEVICE_ID: Optional[str] = None  # Ring intercom device ID
    RING_BUTTON_ENTITY_ID: str = "button.ring_intercom_unlock"  # HA entity for Ring

    # Email (Fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "Alcova Landolina <noreply@alcova.com>"

    # JWT
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 720  # 30 days

    # n8n
    N8N_WEBHOOK_SECRET: Optional[str] = None

    # Lodgify API (for booking sync)
    LODGIFY_API_KEY: Optional[str] = None
    LODGIFY_PROPERTY_ID: Optional[str] = None

    # Scheduler
    SCHEDULER_TIMEZONE: str = "Europe/Rome"
    AUTO_REVOKE_HOUR: int = 14  # 2 PM daily check
    BOOKING_SYNC_HOURS: List[int] = [0, 18]  # Sync bookings at 12 AM and 6 PM
    CODE_PROVISIONING_HOURS: List[int] = [0, 18]  # Check at 12 AM and 6 PM for codes to provision
    CODE_PROVISIONING_WINDOW_HOURS: int = 48  # Provision codes 48h before checkin

    # Property defaults
    DEFAULT_PROPERTY_ID: str = "alcova_landolina_fi"
    CODE_LENGTH: int = 6
    CODE_BUFFER_HOURS_BEFORE: int = 2  # Code valid 2h before checkin
    CODE_BUFFER_HOURS_AFTER: int = 2   # Buffer after checkout for overlap/issues
    CODE_EXPIRY_NEXT_DAY_HOUR: int = 9  # Code expires at 9 AM the day after checkout

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()


# CORS origins - loaded separately to avoid Pydantic JSON parsing
def get_cors_origins() -> List[str]:
    """
    Get CORS origins from environment variable (comma-separated string)
    Bypasses Pydantic to avoid JSON parsing issues
    """
    cors_str = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
    if not cors_str or cors_str.strip() == '':
        return ["http://localhost:3000"]
    # Split by comma and strip whitespace
    return [origin.strip() for origin in cors_str.split(',') if origin.strip()]
