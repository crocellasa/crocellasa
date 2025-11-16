"""
Admin authentication endpoints
"""
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.models.admin import AdminLoginRequest, AdminLoginResponse, AdminUser
from app.core.admin_auth import authenticate_admin, create_access_token
from app.core.dependencies import get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest):
    """
    Admin login endpoint

    Authenticates admin user and returns JWT access token.

    Args:
        credentials: Email and password

    Returns:
        JWT access token and admin user data

    Raises:
        HTTPException: If credentials are invalid
    """
    logger.info(f"Admin login attempt for: {credentials.email}")

    # Authenticate admin
    admin = authenticate_admin(credentials.email, credentials.password)

    if not admin:
        logger.warning(f"Failed login attempt for: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token (expires in 24 hours)
    access_token = create_access_token(
        admin_data=admin,
        expires_delta=timedelta(hours=24)
    )

    logger.info(f"Admin login successful: {credentials.email}")

    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=86400,  # 24 hours in seconds
        admin={
            "id": admin["id"],
            "email": admin["email"],
            "name": admin["name"],
            "role": admin["role"]
        }
    )


@router.get("/verify")
async def verify_admin_token(current_admin: dict = Depends(get_current_admin)):
    """
    Verify admin token

    Protected endpoint to verify if token is still valid.

    Returns:
        Admin user data if token is valid

    Raises:
        HTTPException: If token is invalid or expired
    """
    return {
        "valid": True,
        "admin": {
            "id": current_admin["sub"],
            "email": current_admin["email"],
            "role": current_admin["role"]
        }
    }


@router.post("/logout")
async def admin_logout(current_admin: dict = Depends(get_current_admin)):
    """
    Admin logout endpoint

    Note: Since we use stateless JWT, actual logout is handled client-side
    by removing the token. This endpoint just confirms the action.

    Returns:
        Success message
    """
    logger.info(f"Admin logout: {current_admin['email']}")

    return {
        "message": "Logged out successfully"
    }
