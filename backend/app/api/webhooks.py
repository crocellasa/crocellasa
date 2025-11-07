"""
Webhook endpoints (primarily for n8n integration)
"""
from fastapi import APIRouter, HTTPException, Request, Header
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/hospitable")
async def hospitable_webhook(request: Request, x_webhook_secret: str = Header(None)):
    """
    Webhook endpoint for Hospitable

    This is primarily called by n8n, which will then call /bookings/create
    You can also configure Hospitable to call this directly.

    Args:
        request: FastAPI request with webhook payload
        x_webhook_secret: Optional webhook secret for validation

    Returns:
        Acknowledgement
    """
    try:
        # Validate webhook secret if configured
        if settings.N8N_WEBHOOK_SECRET and x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

        # Get payload
        payload = await request.json()

        logger.info(f"📨 Received Hospitable webhook: {payload.get('event_type', 'unknown')}")

        # Log webhook for debugging
        # In production, you might want to forward this to n8n or process directly

        return {
            "status": "received",
            "message": "Webhook received successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Webhook processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test")
async def test_webhook():
    """
    Test endpoint to verify webhooks are working
    """
    return {
        "status": "ok",
        "message": "Webhook endpoint is operational"
    }
