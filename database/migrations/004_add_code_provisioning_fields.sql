-- =====================================================
-- MIGRATION 004: Add Code Provisioning Tracking Fields
-- =====================================================
-- Adds fields to track automated code provisioning state
-- =====================================================

-- Add code provisioning tracking to bookings table
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS codes_provisioned BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS codes_provisioned_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS last_provisioning_attempt TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS provisioning_error TEXT;

-- Add index for finding bookings needing code provisioning
CREATE INDEX IF NOT EXISTS idx_bookings_codes_provisioned
    ON bookings(codes_provisioned, checkin_date)
    WHERE status IN ('confirmed', 'checked_in');

-- Add device_id to access_codes for easier lookups
ALTER TABLE access_codes
    ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);

-- Add comments
COMMENT ON COLUMN bookings.codes_provisioned IS 'Whether access codes have been provisioned for this booking';
COMMENT ON COLUMN bookings.codes_provisioned_at IS 'Timestamp when codes were successfully provisioned';
COMMENT ON COLUMN bookings.last_provisioning_attempt IS 'Last time the system attempted to provision codes';
COMMENT ON COLUMN bookings.provisioning_error IS 'Error message from last provisioning attempt if it failed';
COMMENT ON COLUMN access_codes.device_id IS 'Device ID for faster lookups (denormalized from locks table)';
