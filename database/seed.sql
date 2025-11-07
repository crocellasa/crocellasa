-- =====================================================
-- SEED DATA - Test data for development
-- =====================================================

-- Test booking 1: Current active booking
INSERT INTO bookings (
    hospitable_id,
    confirmation_code,
    guest_name,
    guest_email,
    guest_phone,
    guest_language,
    property_id,
    checkin_date,
    checkout_date,
    num_guests,
    status
) VALUES (
    'TEST_BOOKING_001',
    'AIRBNB_123456',
    'Mario Rossi',
    'mario.rossi@example.com',
    '+393331234567',
    'it',
    'alcova_landolina_fi',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '5 days',
    2,
    'confirmed'
);

-- Test booking 2: Past booking (checked out)
INSERT INTO bookings (
    hospitable_id,
    confirmation_code,
    guest_name,
    guest_email,
    guest_phone,
    guest_language,
    property_id,
    checkin_date,
    checkout_date,
    num_guests,
    status
) VALUES (
    'TEST_BOOKING_002',
    'AIRBNB_789012',
    'John Smith',
    'john.smith@example.com',
    '+14155551234',
    'en',
    'alcova_landolina_fi',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days',
    1,
    'checked_out'
);

-- Test notification
INSERT INTO notifications (
    booking_id,
    type,
    recipient,
    subject,
    message,
    status,
    provider
) VALUES (
    (SELECT id FROM bookings WHERE hospitable_id = 'TEST_BOOKING_001'),
    'whatsapp',
    '+393331234567',
    'Welcome to Alcova',
    'Your check-in codes are ready!',
    'sent',
    'twilio'
);

-- Test audit log
INSERT INTO audit_logs (
    event_type,
    entity_type,
    entity_id,
    actor_type,
    description,
    status
) VALUES (
    'booking_created',
    'booking',
    (SELECT id FROM bookings WHERE hospitable_id = 'TEST_BOOKING_001'),
    'system',
    'Test booking created from seed data',
    'success'
);
