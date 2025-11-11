"""
Configuration management using Pydantic Settings
Loads environment variables from .env file
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional, Union


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """

    # Application
    APP_ENV: str = "development"
    APP_NAME: str = "Alcova Smart Check-in"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    SECRET_KEY: str = "INSECURE-CHANGE-ME-IN-PRODUCTION"  # Must be set in production!
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://*.vercel.app"]

    # Supabase (optional until configured)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None

    # Tuya (optional until configured)
    TUYA_CLIENT_ID: Optional[str] = None
    TUYA_SECRET: Optional[str] = None
    TUYA_REGION: str = "eu"
    TUYA_DEVICE_MAIN_ENTRANCE: Optional[str] = None
    TUYA_DEVICE_FLOOR_DOOR: Optional[str] = None
    TUYA_DEVICE_APARTMENT: Optional[str] = None

    # Twilio (WhatsApp/SMS) (optional until configured)
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_FROM: Optional[str] = None
    TWILIO_SMS_FROM: Optional[str] = None

    # Telegram (optional - currently disabled)
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_ADMIN_CHAT_ID: Optional[str] = None

    # Home Assistant (Ring Intercom) (optional until configured)
    HOME_ASSISTANT_URL: Optional[str] = None
    HOME_ASSISTANT_TOKEN: Optional[str] = None
    RING_BUTTON_ENTITY_ID: str = "button.ring_intercom_unlock"

    # Email (Fallback)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: str = "Alcova Landolina <noreply@alcova.com>"

    # JWT
    JWT_SECRET: str = "INSECURE-JWT-CHANGE-ME-IN-PRODUCTION"  # Must be set in production!
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

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS_ORIGINS from string (comma-separated) or list"""
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
