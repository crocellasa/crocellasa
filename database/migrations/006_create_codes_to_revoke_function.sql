-- =====================================================
-- MIGRATION 006: Create Codes to Revoke Function
-- =====================================================
-- Creates a PostgreSQL function to identify expired access codes
-- that need to be revoked from devices
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS codes_to_revoke();

-- Create function to find codes that need revocation
CREATE OR REPLACE FUNCTION codes_to_revoke()
RETURNS TABLE (
    id UUID,
    booking_id UUID,
    lock_id UUID,
    code VARCHAR,
    lock_name VARCHAR,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    status VARCHAR,
    tuya_password_id VARCHAR,
    ring_code_id VARCHAR,
    device_id VARCHAR,
    guest_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.id,
        ac.booking_id,
        ac.lock_id,
        ac.code,
        ac.lock_name,
        ac.valid_from,
        ac.valid_until,
        ac.status,
        ac.tuya_password_id,
        ac.ring_code_id,
        ac.device_id,
        b.guest_name
    FROM access_codes ac
    JOIN bookings b ON ac.booking_id = b.id
    WHERE
        -- Code is still marked as active
        ac.status = 'active'
        -- Validity period has expired
        AND ac.valid_until < NOW()
        -- Has a Tuya or Ring ID to revoke
        AND (ac.tuya_password_id IS NOT NULL OR ac.ring_code_id IS NOT NULL)
    ORDER BY ac.valid_until ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION codes_to_revoke() IS 'Returns active access codes that have expired and need to be revoked from devices';
