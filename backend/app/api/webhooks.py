"""
Webhook endpoints (primarily for n8n integration)
"""
from fastapi import APIRouter, HTTPException, Request, Header
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/n8n")
async def n8n_webhook(request: Request, x_webhook_secret: str = Header(None)):
    """
    Generic ingress for n8n workflows
    """
    if settings.N8N_WEBHOOK_SECRET and x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    
    payload = await request.json()
    logger.info(f"⚡ Received n8n signal: {payload.get('action', 'unknown')}")
    
    # This acts as a router for various n8n actions if needed
    # For now, just acknowledge
    return {"status": "ok", "received": True}


@router.post("/lodgify")
async def lodgify_webhook(request: Request, x_webhook_secret: str = Header(None)):
    """
    Webhook endpoint for Lodgify (v2 API)
    Can be called directly by Lodgify or forwarded by n8n
    """
    try:
        # Validate webhook secret if configured
        if settings.N8N_WEBHOOK_SECRET and x_webhook_secret != settings.N8N_WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

        # Get payload
        payload = await request.json()
        logger.info(f"📨 Received Lodgify webhook: {payload.get('event_type', 'unknown')}")

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
