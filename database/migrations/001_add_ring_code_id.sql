-- =====================================================
-- Migration: Add Ring intercom support to access_codes
-- Date: 2025-01-10
-- =====================================================

-- Add ring_code_id column to store Ring API code IDs
ALTER TABLE access_codes
ADD COLUMN ring_code_id VARCHAR(100);

-- Add index for ring_code_id lookups
CREATE INDEX idx_access_codes_ring_code_id ON access_codes(ring_code_id);

-- Add comment
COMMENT ON COLUMN access_codes.ring_code_id IS 'Ring intercom API code ID for floor door access';
