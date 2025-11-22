"""
Booking-related Pydantic models
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    CANCELLED = "cancelled"


class GuestLanguage(str, Enum):
    IT = "it"
    EN = "en"


class BookingCreate(BaseModel):
    """
    Model for creating a new booking
    """
    hospitable_id: Optional[str] = Field(None, description="Unique ID from Hospitable/Airbnb (deprecated, use smoobu_id)")
    smoobu_id: Optional[str] = Field(None, description="Unique ID from Smoobu (property manager)")
    confirmation_code: Optional[str] = None
    guest_name: str
    guest_email: EmailStr
    guest_phone: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")
    guest_language: GuestLanguage = GuestLanguage.EN
    property_id: str = Field(default="alcova_landolina_fi")
    checkin_date: datetime
    checkout_date: datetime
    num_guests: int = Field(default=1, ge=1, le=10)

    @validator('checkout_date')
    def checkout_after_checkin(cls, v, values):
        if 'checkin_date' in values and v <= values['checkin_date']:
            raise ValueError('checkout_date must be after checkin_date')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "hospitable_id": "HB123456",
                "confirmation_code": "AIRBNB789",
                "guest_name": "Mario Rossi",
                "guest_email": "mario@example.com",
                "guest_phone": "+393331234567",
                "guest_language": "it",
                "property_id": "alcova_landolina_fi",
                "checkin_date": "2025-11-20T15:00:00Z",
                "checkout_date": "2025-11-22T11:00:00Z",
                "num_guests": 2
            }
        }


class BookingResponse(BaseModel):
    """
    Model for booking response
    """
    id: str
    hospitable_id: str
    guest_name: str
    guest_email: str
    guest_phone: str
    guest_language: str
    property_id: str
    checkin_date: datetime
    checkout_date: datetime
    num_guests: int
    status: str
    guest_token: Optional[str] = None
    portal_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AccessCodeInfo(BaseModel):
    """
    Model for access code information
    """
    lock_type: str
    code: str
    valid_from: datetime
    valid_until: datetime
    display_name_it: Optional[str] = None
    display_name_en: Optional[str] = None


class GuestPortalData(BaseModel):
    """
    Complete data for guest portal
    """
    booking: BookingResponse
    access_codes: List[AccessCodeInfo]
    property: Optional[dict] = None
