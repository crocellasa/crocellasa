-- Migration: Normalize Lodgify ID
-- Description: Add lodgify_id column and make hospitable_id optional

-- 1. Add lodgify_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'lodgify_id') THEN
        ALTER TABLE bookings ADD COLUMN lodgify_id VARCHAR(100);
    END IF;
END $$;

-- 2. Create index for lodgify_id
CREATE INDEX IF NOT EXISTS idx_bookings_lodgify_id ON bookings(lodgify_id);

-- 3. Make hospitable_id optional (it was UNIQUE NOT NULL in initial schema)
ALTER TABLE bookings ALTER COLUMN hospitable_id DROP NOT NULL;

-- 4. Update the active_bookings_with_codes view to include lodgify_id
CREATE OR REPLACE VIEW active_bookings_with_codes AS
SELECT
    b.id,
    b.hospitable_id,
    b.lodgify_id,
    b.guest_name,
    b.guest_email,
    b.checkin_date,
    b.checkout_date,
    b.status,
    COUNT(ac.id) as total_codes,
    COUNT(ac.id) FILTER (WHERE ac.status = 'active') as active_codes
FROM bookings b
LEFT JOIN access_codes ac ON b.id = ac.booking_id
WHERE b.status IN ('confirmed', 'checked_in')
GROUP BY b.id, b.hospitable_id, b.lodgify_id;
