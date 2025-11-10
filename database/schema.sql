-- =====================================================
-- ALCOVA SMART CHECK-IN - DATABASE SCHEMA
-- =====================================================
-- Database: PostgreSQL (Supabase)
-- Version: 1.0.0
-- Created: 2025-11-07
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: bookings
-- =====================================================
-- Stores all bookings from Hospitable/Airbnb
-- =====================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Hospitable/Airbnb data
    hospitable_id VARCHAR(100) UNIQUE NOT NULL,
    confirmation_code VARCHAR(50),

    -- Guest information
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_language VARCHAR(2) DEFAULT 'en' CHECK (guest_language IN ('it', 'en')),

    -- Booking details
    property_id VARCHAR(50) NOT NULL,
    checkin_date TIMESTAMP WITH TIME ZONE NOT NULL,
    checkout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    num_guests INTEGER DEFAULT 1 CHECK (num_guests > 0),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),

    -- Guest portal
    guest_token TEXT, -- JWT token for portal access
    portal_opened_at TIMESTAMP WITH TIME ZONE,
    portal_views INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_dates CHECK (checkout_date > checkin_date)
);

-- Indexes for bookings
CREATE INDEX idx_bookings_hospitable_id ON bookings(hospitable_id);
CREATE INDEX idx_bookings_checkin_date ON bookings(checkin_date);
CREATE INDEX idx_bookings_checkout_date ON bookings(checkout_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);

-- =====================================================
-- TABLE: locks
-- =====================================================
-- Configuration for Tuya smart locks
-- =====================================================

CREATE TABLE locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Tuya device details
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    lock_type VARCHAR(50) NOT NULL CHECK (lock_type IN ('main_entrance', 'floor_door', 'apartment_door')),

    -- Location
    property_id VARCHAR(50) NOT NULL,
    location_description TEXT,
    display_order INTEGER DEFAULT 0,

    -- Localized names
    display_name_it VARCHAR(100),
    display_name_en VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for locks
CREATE INDEX idx_locks_device_id ON locks(device_id);
CREATE INDEX idx_locks_property_id ON locks(property_id);
CREATE INDEX idx_locks_is_active ON locks(is_active);

-- =====================================================
-- TABLE: access_codes
-- =====================================================
-- Generated temporary codes for smart locks
-- =====================================================

CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relations
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    lock_id UUID NOT NULL REFERENCES locks(id) ON DELETE RESTRICT,

    -- Code details
    code VARCHAR(10) NOT NULL,
    lock_name VARCHAR(100) NOT NULL, -- Cached from locks.lock_type for quick access

    -- Validity period
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'failed')),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,

    -- Tuya synchronization
    tuya_sync_status VARCHAR(50) DEFAULT 'pending' CHECK (tuya_sync_status IN ('pending', 'synced', 'failed')),
    tuya_password_id VARCHAR(100), -- Tuya's internal password ID
    tuya_error_message TEXT,

    -- Ring intercom synchronization
    ring_code_id VARCHAR(100), -- Ring API code ID for floor door

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_code_dates CHECK (valid_until > valid_from),
    CONSTRAINT valid_code_length CHECK (char_length(code) >= 4 AND char_length(code) <= 10)
);

-- Indexes for access_codes
CREATE INDEX idx_access_codes_booking_id ON access_codes(booking_id);
CREATE INDEX idx_access_codes_lock_id ON access_codes(lock_id);
CREATE INDEX idx_access_codes_status ON access_codes(status);
CREATE INDEX idx_access_codes_validity ON access_codes(valid_from, valid_until);
CREATE INDEX idx_access_codes_tuya_sync ON access_codes(tuya_sync_status);
CREATE INDEX idx_access_codes_ring_code_id ON access_codes(ring_code_id);

-- =====================================================
-- TABLE: notifications
-- =====================================================
-- Log of all notifications sent to guests and admin
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relations (nullable for system notifications)
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN ('whatsapp', 'sms', 'email', 'telegram')),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'read')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Provider details
    provider VARCHAR(50), -- 'twilio', 'smtp', 'telegram'
    provider_message_id VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- TABLE: audit_logs
-- =====================================================
-- Comprehensive audit trail for all system activities
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event details
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'booking', 'code', 'notification', 'lock'
    entity_id UUID,

    -- Actor (who triggered the event)
    actor_type VARCHAR(50), -- 'system', 'guest', 'admin', 'n8n'
    actor_id VARCHAR(255),

    -- Context
    description TEXT,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB, -- Flexible storage for additional context

    -- Result
    status VARCHAR(50), -- 'success', 'failed', 'warning'
    error_message TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- =====================================================
-- TABLE: properties (future-proofing for multi-property)
-- =====================================================

CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY,

    -- Property details
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(2) DEFAULT 'IT',

    -- Coordinates for map
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Amenities
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),

    -- House rules & info
    checkin_instructions_it TEXT,
    checkin_instructions_en TEXT,
    house_rules_it TEXT,
    house_rules_en TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: bookings updated_at
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: locks updated_at
CREATE TRIGGER update_locks_updated_at
    BEFORE UPDATE ON locks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: access_codes updated_at
CREATE TRIGGER update_access_codes_updated_at
    BEFORE UPDATE ON access_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: properties updated_at
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-expire codes
CREATE OR REPLACE FUNCTION expire_old_codes()
RETURNS void AS $$
BEGIN
    UPDATE access_codes
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
    AND valid_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Get active codes for booking
CREATE OR REPLACE FUNCTION get_active_codes_for_booking(booking_uuid UUID)
RETURNS TABLE (
    lock_type VARCHAR,
    code VARCHAR,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    display_name_it VARCHAR,
    display_name_en VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.lock_type,
        ac.code,
        ac.valid_from,
        ac.valid_until,
        l.display_name_it,
        l.display_name_en
    FROM access_codes ac
    JOIN locks l ON ac.lock_id = l.id
    WHERE ac.booking_id = booking_uuid
    AND ac.status = 'active'
    ORDER BY l.display_order;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON locks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON access_codes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON properties FOR ALL USING (auth.role() = 'service_role');

-- Policy: Anon can read properties (for guest portal)
CREATE POLICY "Anon read properties" ON properties FOR SELECT USING (auth.role() = 'anon' AND is_active = true);

-- =====================================================
-- VIEWS (for analytics and reporting)
-- =====================================================

-- View: Active bookings with codes
CREATE VIEW active_bookings_with_codes AS
SELECT
    b.id,
    b.hospitable_id,
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
GROUP BY b.id;

-- View: Expired codes needing revocation
CREATE VIEW codes_to_revoke AS
SELECT
    ac.id,
    ac.booking_id,
    ac.lock_id,
    ac.code,
    ac.valid_until,
    b.guest_name,
    l.device_id
FROM access_codes ac
JOIN bookings b ON ac.booking_id = b.id
JOIN locks l ON ac.lock_id = l.id
WHERE ac.status = 'active'
AND ac.valid_until < NOW();

-- View: Daily statistics
CREATE VIEW daily_stats AS
SELECT
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE status = 'confirmed') as new_bookings,
    COUNT(*) FILTER (WHERE status = 'checked_out') as checkouts,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations
FROM bookings
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- SEED DATA (initial setup)
-- =====================================================

-- Insert default property
INSERT INTO properties (id, name, address, city, country, latitude, longitude, is_active)
VALUES (
    'alcova_landolina_fi',
    'Alcova Landolina',
    'Via Landolina 12, Firenze',
    'Firenze',
    'IT',
    43.7696,
    11.2558,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert locks (PLACEHOLDER - replace with actual Tuya device IDs)
INSERT INTO locks (device_id, device_name, lock_type, property_id, display_name_it, display_name_en, display_order)
VALUES
    ('TUYA_DEVICE_ID_MAIN', 'Main Entrance Lock', 'main_entrance', 'alcova_landolina_fi', 'Portone Principale', 'Main Entrance', 1),
    ('TUYA_DEVICE_ID_FLOOR', 'Floor Door Lock', 'floor_door', 'alcova_landolina_fi', 'Porta Piano', 'Floor Door', 2),
    ('TUYA_DEVICE_ID_APT', 'Apartment Door Lock', 'apartment_door', 'alcova_landolina_fi', 'Porta Appartamento', 'Apartment Door', 3)
ON CONFLICT (device_id) DO NOTHING;

-- =====================================================
-- COMMENTS (for documentation)
-- =====================================================

COMMENT ON TABLE bookings IS 'Stores all guest bookings from Hospitable/Airbnb';
COMMENT ON TABLE locks IS 'Configuration for Tuya smart locks';
COMMENT ON TABLE access_codes IS 'Temporary PIN codes generated for each booking';
COMMENT ON TABLE notifications IS 'Log of all notifications sent (WhatsApp, SMS, Email, Telegram)';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance and debugging';
COMMENT ON TABLE properties IS 'Multi-property support for future expansion';

COMMENT ON COLUMN bookings.guest_token IS 'JWT token for guest portal access, expires after checkout + 48h';
COMMENT ON COLUMN access_codes.tuya_password_id IS 'Tuya internal ID for the temporary password';
COMMENT ON COLUMN notifications.provider_message_id IS 'External provider message ID for tracking delivery';

-- =====================================================
-- SCHEMA VERSION TRACKING
-- =====================================================

CREATE TABLE schema_version (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_version (version, description)
VALUES ('1.0.0', 'Initial schema with bookings, locks, access_codes, notifications, audit_logs');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
