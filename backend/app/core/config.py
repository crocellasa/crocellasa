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
    SECRET_KEY: str
    DEBUG: bool = False

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str

    # Tuya
    TUYA_CLIENT_ID: str
    TUYA_SECRET: str
    TUYA_REGION: str = "eu"
    TUYA_DEVICE_MAIN_ENTRANCE: str  # Ingresso principale (portone edificio)
    TUYA_DEVICE_FLOOR_DOOR: Optional[str] = None  # Optional - uses Ring intercom instead
    TUYA_DEVICE_APARTMENT: str  # Porta appartamento

    # Twilio (WhatsApp/SMS)
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_WHATSAPP_FROM: str
    TWILIO_SMS_FROM: str

    # Telegram
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_ADMIN_CHAT_ID: str

    # Home Assistant (for Tuya locks automation)
    HOME_ASSISTANT_URL: str
    HOME_ASSISTANT_TOKEN: str

    # Ring Intercom (floor door)
    RING_REFRESH_TOKEN: str  # Ring API refresh token
    RING_INTERCOM_DEVICE_ID: str  # Ring intercom device ID
    RING_BUTTON_ENTITY_ID: str = "button.ring_intercom_unlock"  # HA entity for Ring

    # Email (Fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "Alcova Landolina <noreply@alcova.com>"

    # JWT
    JWT_SECRET: str
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
    BOOKING_SYNC_INTERVAL_HOURS: int = 1  # Hourly booking sync
    CODE_PROVISIONING_INTERVAL_MINUTES: int = 5  # Check every 5 minutes for codes to provision
    CODE_PROVISIONING_WINDOW_HOURS: int = 48  # Provision codes 48h before checkin

    # Property defaults
    DEFAULT_PROPERTY_ID: str = "alcova_landolina_fi"
    CODE_LENGTH: int = 6
    CODE_BUFFER_HOURS_BEFORE: int = 2  # Code valid 2h before checkin
    CODE_BUFFER_HOURS_AFTER: int = 2   # Code valid 2h after checkout

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
