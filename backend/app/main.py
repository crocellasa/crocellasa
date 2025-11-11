"""
Main FastAPI application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings, get_cors_origins
from app.core.database import init_database
from app.services.scheduler import init_scheduler, shutdown_scheduler
from app.api import bookings, guests, codes, intercom, webhooks
from app.api import admin_auth, admin_dashboard, admin_bookings, admin_activity, admin_integrations, admin_locations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Alcova Smart Check-in API")

    # Initialize database connection
    await init_database()
    logger.info("✅ Database initialized")

    # Initialize scheduler for auto-revoke
    init_scheduler()
    logger.info("✅ Scheduler initialized")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Alcova Smart Check-in API")
    shutdown_scheduler()


# Create FastAPI app
app = FastAPI(
    title="Alcova Smart Check-in API",
    description="Automated check-in system for Alcova Landolina apartments",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "service": "alcova-checkin-api",
        "version": "1.0.0",
        "environment": settings.APP_ENV
    }


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Alcova Smart Check-in API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Include routers
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(guests.router, prefix="/api/guests", tags=["Guests"])
app.include_router(codes.router, prefix="/api/codes", tags=["Access Codes"])
app.include_router(intercom.router, prefix="/api/intercom", tags=["Intercom"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])

# Admin routers
app.include_router(admin_auth.router, prefix="/api/admin/auth", tags=["Admin Auth"])
app.include_router(admin_dashboard.router, prefix="/api/admin/dashboard", tags=["Admin Dashboard"])
app.include_router(admin_bookings.router, prefix="/api/admin/bookings", tags=["Admin Bookings"])
app.include_router(admin_activity.router, prefix="/api/admin/activity", tags=["Admin Activity"])
app.include_router(admin_integrations.router, prefix="/api/admin/integrations", tags=["Admin Integrations"])
app.include_router(admin_locations.router, prefix="/api/admin/locations", tags=["Admin Locations"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
