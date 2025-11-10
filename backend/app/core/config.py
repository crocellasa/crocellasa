"""
Configuration management using Pydantic Settings
Loads environment variables from .env file
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
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

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://*.vercel.app"]

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

    # Scheduler
    SCHEDULER_TIMEZONE: str = "Europe/Rome"
    AUTO_REVOKE_HOUR: int = 14  # 2 PM daily check

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
