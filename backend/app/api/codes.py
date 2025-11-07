"""
Access codes management endpoints
"""
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import logging

from app.core.database import get_supabase
from app.services.tuya_service import get_tuya_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/{code_id}/revoke")
async def revoke_code(code_id: str):
    """
    Manually revoke an access code

    Args:
        code_id: UUID of the access code

    Returns:
        Success message
    """
    try:
        supabase = get_supabase()
        tuya_service = get_tuya_service()

        # Get code with lock info
        code_result = supabase.table("access_codes")\
            .select("*, locks(*)")\
            .eq("id", code_id)\
            .execute()

        if not code_result.data:
            raise HTTPException(status_code=404, detail="Access code not found")

        code = code_result.data[0]

        if code["status"] == "revoked":
            return {"message": "Code already revoked"}

        # Revoke on Tuya
        if code.get("tuya_password_id"):
            success = tuya_service.delete_temporary_password(
                code["locks"]["device_id"],
                code["tuya_password_id"]
            )

            if not success:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to revoke code on Tuya"
                )

        # Update database
        supabase.table("access_codes").update({
            "status": "revoked",
            "revoked_at": datetime.utcnow().isoformat(),
            "revoked_reason": "Manual revocation"
        }).eq("id", code_id).execute()

        # Audit log
        supabase.table("audit_logs").insert({
            "event_type": "code_revoked",
            "entity_type": "code",
            "entity_id": code_id,
            "actor_type": "admin",
            "description": f"Code manually revoked",
            "status": "success"
        }).execute()

        logger.info(f"✅ Code {code_id} revoked successfully")

        return {"message": "Code revoked successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to revoke code: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/revoke-all")
async def revoke_all_expired():
    """
    Manually trigger revocation of all expired codes
    (Same as scheduler job, but can be called manually)

    Returns:
        Summary of revocation
    """
    try:
        from app.services.scheduler import revoke_expired_codes
        await revoke_expired_codes()

        return {"message": "Expired codes revocation triggered"}

    except Exception as e:
        logger.error(f"❌ Failed to revoke expired codes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
