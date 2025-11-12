"""
Booking management endpoints
"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
from typing import List
import logging
import uuid

from app.models.booking import BookingCreate, BookingResponse
from app.core.database import get_supabase
from app.core.security import generate_guest_token
from app.core.config import settings
from app.services.code_generator import generate_pin_code, calculate_code_validity
from app.services.tuya_service import get_tuya_service
from app.services.notification_service import get_notification_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/create", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(booking: BookingCreate):
    """
    Create a new booking and generate access codes

    This endpoint:
    1. Creates booking in database
    2. Generates 3 access codes (main entrance, floor, apartment)
    3. Creates temporary passwords on Tuya locks
    4. Generates JWT token for guest portal
    5. Sends WhatsApp/SMS to guest
    6. Notifies admin via Telegram

    Args:
        booking: BookingCreate model with guest and booking details

    Returns:
        BookingResponse with booking details and portal URL
    """
    try:
        supabase = get_supabase()
        tuya_service = get_tuya_service()
        notification_service = get_notification_service()

        # 1. Create booking in database
        logger.info(f"Creating booking for {booking.guest_name}")

        booking_data = {
            "hospitable_id": booking.hospitable_id,
            "confirmation_code": booking.confirmation_code,
            "guest_name": booking.guest_name,
            "guest_email": booking.guest_email,
            "guest_phone": booking.guest_phone,
            "guest_language": booking.guest_language,
            "property_id": booking.property_id,
            "checkin_date": booking.checkin_date.isoformat(),
            "checkout_date": booking.checkout_date.isoformat(),
            "num_guests": booking.num_guests,
            "status": "confirmed"
        }

        booking_result = supabase.table("bookings").insert(booking_data).execute()

        if not booking_result.data:
            raise HTTPException(status_code=500, detail="Failed to create booking")

        booking_id = booking_result.data[0]["id"]

        # 2. Get locks for this property
        locks_result = supabase.table("locks")\
            .select("*")\
            .eq("property_id", booking.property_id)\
            .eq("is_active", True)\
            .order("display_order")\
            .execute()

        locks = locks_result.data

        if not locks:
            raise HTTPException(status_code=404, detail=f"No active locks found for property {booking.property_id}")

        # 3. Generate codes and create on Tuya
        valid_from, valid_until = calculate_code_validity(
            booking.checkin_date,
            booking.checkout_date
        )

        created_codes = []

        for lock in locks:
            # Generate unique PIN
            code = generate_pin_code()

            # Create on Tuya
            tuya_password_id = tuya_service.create_temporary_password(
                device_id=lock["device_id"],
                password=code,
                valid_from=valid_from,
                valid_until=valid_until,
                name=f"{booking.guest_name[:20]}"
            )

            # Save to database
            code_data = {
                "booking_id": booking_id,
                "lock_id": lock["id"],
                "code": code,
                "lock_name": lock["lock_type"],
                "valid_from": valid_from.isoformat(),
                "valid_until": valid_until.isoformat(),
                "status": "active" if tuya_password_id else "failed",
                "tuya_sync_status": "synced" if tuya_password_id else "failed",
                "tuya_password_id": tuya_password_id
            }

            code_result = supabase.table("access_codes").insert(code_data).execute()

            if code_result.data:
                created_codes.append({
                    "lock_type": lock["lock_type"],
                    "code": code,
                    "display_name": lock.get(f"display_name_{booking.guest_language}", lock["device_name"])
                })

        if not created_codes:
            raise HTTPException(status_code=500, detail="Failed to create any access codes")

        # 4. Generate JWT token
        guest_token = generate_guest_token(booking_id, booking.checkout_date)

        # Update booking with token
        supabase.table("bookings").update({
            "guest_token": guest_token
        }).eq("id", booking_id).execute()

        # 5. Generate portal URL
        portal_url = f"{settings.FRONTEND_URL}/g/{guest_token}"

        # 6. Send WhatsApp to guest
        await notification_service.send_guest_welcome(
            booking_id=booking_id,
            guest_name=booking.guest_name.split()[0],  # First name only
            guest_phone=booking.guest_phone,
            guest_language=booking.guest_language,
            checkin_date=booking.checkin_date,
            checkout_date=booking.checkout_date,
            codes=created_codes,
            portal_url=portal_url
        )

        # 7. Notify admin
        await notification_service.notify_admin_new_booking(
            guest_name=booking.guest_name,
            checkin_date=booking.checkin_date,
            checkout_date=booking.checkout_date,
            num_guests=booking.num_guests,
            codes_created=len(created_codes)
        )

        # 8. Return response
        logger.info(f"✅ Booking {booking_id} created successfully")

        return BookingResponse(
            id=booking_id,
            hospitable_id=booking.hospitable_id,
            guest_name=booking.guest_name,
            guest_email=booking.guest_email,
            guest_phone=booking.guest_phone,
            guest_language=booking.guest_language,
            property_id=booking.property_id,
            checkin_date=booking.checkin_date,
            checkout_date=booking.checkout_date,
            num_guests=booking.num_guests,
            status="confirmed",
            guest_token=guest_token,
            portal_url=portal_url,
            created_at=datetime.fromisoformat(booking_result.data[0]["created_at"])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to create booking: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    """
    Cancel a booking and revoke all access codes

    Args:
        booking_id: UUID of the booking

    Returns:
        Success message
    """
    try:
        supabase = get_supabase()
        tuya_service = get_tuya_service()

        # Get booking
        booking_result = supabase.table("bookings").select("*").eq("id", booking_id).execute()

        if not booking_result.data:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Get all codes for this booking
        codes_result = supabase.table("access_codes")\
            .select("*, locks(*)")\
            .eq("booking_id", booking_id)\
            .eq("status", "active")\
            .execute()

        # Revoke each code
        revoked_count = 0
        for code in codes_result.data:
            if code.get("tuya_password_id"):
                success = tuya_service.delete_temporary_password(
                    code["locks"]["device_id"],
                    code["tuya_password_id"]
                )

                if success:
                    supabase.table("access_codes").update({
                        "status": "revoked",
                        "revoked_at": datetime.utcnow().isoformat(),
                        "revoked_reason": "Booking cancelled"
                    }).eq("id", code["id"]).execute()
                    revoked_count += 1

        # Update booking status
        supabase.table("bookings").update({
            "status": "cancelled"
        }).eq("id", booking_id).execute()

        logger.info(f"✅ Booking {booking_id} cancelled, {revoked_count} codes revoked")

        return {
            "message": "Booking cancelled successfully",
            "codes_revoked": revoked_count
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to cancel booking: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{booking_id}/generate-token")
async def generate_token_for_booking(booking_id: str):
    """
    TEMPORARY TEST ENDPOINT: Generate JWT token for a booking

    Args:
        booking_id: UUID of the booking

    Returns:
        JWT token and portal URL
    """
    try:
        supabase = get_supabase()

        # Get booking
        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking = result.data[0]
        # Parse as naive UTC datetime (remove timezone info to match generate_guest_token expectations)
        checkout_str = booking["checkout_date"].replace('Z', '').replace('+00:00', '')
        checkout_date = datetime.fromisoformat(checkout_str)

        # Generate token
        token = generate_guest_token(booking_id, checkout_date)

        # Update booking with token
        supabase.table("bookings").update({
            "guest_token": token
        }).eq("id", booking_id).execute()

        portal_url = f"{settings.FRONTEND_URL}/g/{token}?lang={booking['guest_language']}"
        backend_url = f"https://crocellasa-production.up.railway.app/api/guests/{token}"

        return {
            "booking_id": booking_id,
            "guest_name": booking["guest_name"],
            "token": token,
            "portal_url": portal_url,
            "backend_api_url": backend_url
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to generate token: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: str):
    """
    Get booking details

    Args:
        booking_id: UUID of the booking

    Returns:
        BookingResponse
    """
    try:
        supabase = get_supabase()

        result = supabase.table("bookings").select("*").eq("id", booking_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking = result.data[0]

        return BookingResponse(**booking)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get booking: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
