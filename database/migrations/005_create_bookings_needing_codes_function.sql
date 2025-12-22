-- =====================================================
-- MIGRATION 005: Create Bookings Needing Codes Function
-- =====================================================
-- Creates a PostgreSQL function to identify bookings that need
-- access code provisioning (within 48 hours of check-in)
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS bookings_needing_codes();

-- Create function to find bookings needing access codes
CREATE OR REPLACE FUNCTION bookings_needing_codes()
RETURNS TABLE (
    id UUID,
    hospitable_id VARCHAR,
    guest_name VARCHAR,
    guest_email VARCHAR,
    guest_phone VARCHAR,
    guest_language VARCHAR,
    property_id VARCHAR,
    checkin_date TIMESTAMP WITH TIME ZONE,
    checkout_date TIMESTAMP WITH TIME ZONE,
    num_guests INTEGER,
    status VARCHAR,
    guest_token TEXT,
    codes_provisioned BOOLEAN,
    codes_provisioned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.hospitable_id,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.guest_language,
        b.property_id,
        b.checkin_date,
        b.checkout_date,
        b.num_guests,
        b.status,
        b.guest_token,
        b.codes_provisioned,
        b.codes_provisioned_at
    FROM bookings b
    WHERE
        -- Booking is confirmed or checked_in
        b.status IN ('confirmed', 'checked_in')
        -- Codes have not been provisioned yet
        AND (b.codes_provisioned IS NULL OR b.codes_provisioned = false)
        -- Check-in is within the provisioning window (48 hours)
        AND b.checkin_date <= (NOW() + INTERVAL '48 hours')
        -- Check-in hasn't passed (still upcoming)
        AND b.checkin_date > NOW()
        -- Guest has a phone number for notification
        AND b.guest_phone IS NOT NULL
        AND b.guest_phone != ''
    ORDER BY b.checkin_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION bookings_needing_codes() IS 'Returns bookings within 48h of check-in that need access codes provisioned';
