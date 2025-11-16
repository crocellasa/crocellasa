"""
Admin authentication models and schemas
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class AdminLoginRequest(BaseModel):
    """Admin login request"""
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    """Admin login response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    admin: dict


class AdminUser(BaseModel):
    """Admin user model"""
    id: str
    email: EmailStr
    name: str
    role: str = "admin"
    created_at: datetime


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str  # admin ID
    email: str
    role: str
    exp: int
    iat: int
