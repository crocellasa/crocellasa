"""
Admin authentication utilities
"""
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.config import settings

# Temporary hardcoded admin credentials
# TODO: Move to database with proper hashing
ADMIN_CREDENTIALS = {
    "admin@landolina.it": {
        "id": "admin-001",
        "name": "Admin",
        "email": "admin@landolina.it",
        "password_hash": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "role": "admin"
    }
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def authenticate_admin(email: str, password: str) -> Optional[dict]:
    """
    Authenticate admin user

    Returns:
        Admin user dict if valid, None otherwise
    """
    admin = ADMIN_CREDENTIALS.get(email)
    if not admin:
        return None

    if not verify_password(password, admin["password_hash"]):
        return None

    return {
        "id": admin["id"],
        "email": admin["email"],
        "name": admin["name"],
        "role": admin["role"]
    }


def create_access_token(admin_data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token for admin

    Args:
        admin_data: Admin user data
        expires_delta: Token expiration time

    Returns:
        JWT token string
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)

    payload = {
        "sub": admin_data["id"],
        "email": admin_data["email"],
        "role": admin_data["role"],
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    return token


def verify_token(token: str) -> Optional[dict]:
    """
    Verify JWT token and return payload

    Args:
        token: JWT token string

    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
