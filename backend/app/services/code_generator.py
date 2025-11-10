"""
Service for generating temporary access codes
"""
import random
import string
from datetime import datetime, timedelta, timezone
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def generate_pin_code(length: int = None) -> str:
    """
    Generate a random numeric PIN code

    Args:
        length: Length of the PIN (default from settings)

    Returns:
        Random PIN code as string
    """
    if length is None:
        length = settings.CODE_LENGTH

    # Generate random digits
    code = ''.join(random.choices(string.digits, k=length))

    # Avoid codes starting with 0
    while code[0] == '0':
        code = ''.join(random.choices(string.digits, k=length))

    logger.info(f"Generated PIN code: {code[:2]}****")
    return code


def calculate_code_validity(checkin_date: datetime, checkout_date: datetime) -> tuple[datetime, datetime]:
    """
    Calculate validity period for access codes

    Args:
        checkin_date: Guest check-in date
        checkout_date: Guest check-out date

    Returns:
        Tuple of (valid_from, valid_until)
    """
    # Ensure datetimes are timezone-aware (convert naive to UTC)
    if checkin_date.tzinfo is None:
        checkin_date = checkin_date.replace(tzinfo=timezone.utc)

    if checkout_date.tzinfo is None:
        checkout_date = checkout_date.replace(tzinfo=timezone.utc)

    # Add buffer hours before checkin
    valid_from = checkin_date - timedelta(hours=settings.CODE_BUFFER_HOURS_BEFORE)

    # Add buffer hours after checkout
    valid_until = checkout_date + timedelta(hours=settings.CODE_BUFFER_HOURS_AFTER)

    logger.info(f"Code validity: {valid_from} to {valid_until}")

    return valid_from, valid_until


def validate_code_format(code: str) -> bool:
    """
    Validate that a code meets format requirements

    Args:
        code: Code to validate

    Returns:
        True if valid format
    """
    if not code:
        return False

    if len(code) < 4 or len(code) > 10:
        return False

    if not code.isdigit():
        return False

    return True
