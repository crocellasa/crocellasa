"""
FastAPI dependencies for authentication and authorization
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.admin_auth import verify_token
from typing import Optional

security = HTTPBearer()


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency to get current authenticated admin from JWT token

    Raises:
        HTTPException: If token is invalid or expired

    Returns:
        Admin user data from token
    """
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_optional_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Dependency to get current admin, but doesn't require authentication

    Returns:
        Admin user data if authenticated, None otherwise
    """
    if not credentials:
        return None

    token = credentials.credentials
    return verify_token(token)
