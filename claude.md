# Automated Access Code Workflow

## Overview

This feature implements a fully-automated system for provisioning and revoking guest access codes for smart locks (Tuya and Ring devices). It replaces the previous manual and Notion-based processes with a robust, database-centric workflow.

## Workflow Description

The automated access code workflow operates as follows:

1. **Booking Synchronization (Hourly)**
   - An hourly job syncs upcoming bookings from Lodgify to the local database
   - Ensures the system has up-to-date booking information

2. **Code Provisioning (Every 5 Minutes)**
   - A frequent job checks for bookings with impending check-ins (within 48 hours)
   - For qualifying bookings, the system:
     - Generates a single PIN code
     - Provisions the code on all configured devices (Tuya and Ring)
     - Sends a notification to the guest via WhatsApp/SMS with:
       - Their access code
       - A link to the guest portal

3. **Code Revocation (Daily)**
   - A daily job identifies and revokes all expired access codes
   - Ensures security by removing codes from all devices after check-out

## Implementation Details

### Modified Files

1. **backend/app/core/config.py**
   - Added configuration settings for the automated workflow

2. **backend/app/services/booking_sync_service.py**
   - Implements the booking synchronization logic
   - Handles the provisioning of access codes for upcoming bookings
   - Manages guest notifications

3. **backend/app/services/scheduler.py**
   - Configures the scheduled jobs for:
     - Hourly booking sync
     - 5-minute code provisioning checks
     - Daily code revocation

### Database Migrations

4. **database/migrations/004_add_code_provisioning_fields.sql**
   - Adds necessary fields to track code provisioning state

5. **database/migrations/005_create_bookings_needing_codes_function.sql**
   - Creates a database function to identify bookings requiring access codes
   - Optimizes the query for finding bookings within the 48-hour check-in window

6. **database/migrations/006_create_codes_to_revoke_function.sql**
   - Creates a database function to identify expired access codes
   - Efficiently finds codes that need to be revoked

## Benefits

- **Automation**: Eliminates manual code generation and provisioning
- **Reliability**: Database-driven approach ensures consistency
- **Security**: Automatic revocation of expired codes
- **Guest Experience**: Timely delivery of access codes before check-in
- **Scalability**: Can handle multiple properties and devices

## Configuration

The workflow requires proper configuration in the backend settings:
- Lodgify API credentials
- Device configurations (Tuya and Ring)
- Notification service settings (WhatsApp/SMS)
- Timing parameters (check-in window, job schedules)

## Monitoring

The system logs all operations for troubleshooting:
- Booking sync results
- Code provisioning attempts
- Notification delivery status
- Code revocation operations

## Future Enhancements

Potential improvements to consider:
- Custom code generation rules per property
- Multi-language notification support
- Advanced retry logic for failed operations
- Dashboard for monitoring code provisioning status
