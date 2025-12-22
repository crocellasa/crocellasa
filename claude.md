# Automated Access Code Workflow

## Overview

This feature implements a fully-automated system for provisioning and revoking guest access codes for smart locks (Tuya and Ring devices). It replaces the previous manual and Notion-based processes with a robust, database-centric workflow.

## Workflow Description

The automated access code workflow operates as follows:

1. **Booking Synchronization (Twice Daily at 12 AM and 6 PM)**
   - Syncs upcoming bookings from Lodgify to the local database
   - Ensures the system has up-to-date booking information
   - Efficient: runs at the same time as code provisioning

2. **Code Provisioning (Twice Daily at 12 AM and 6 PM)**
   - Checks for bookings with impending check-ins (within 48 hours)
   - For qualifying bookings, the system:
     - Generates a single PIN code
     - Provisions the code on all configured devices (Tuya and Ring)
     - Sends codes to guest via Lodgify messaging system
     - Notifies admin via Telegram

3. **Code Expiration (9 AM Day After Checkout)**
   - Codes expire at 9:00 AM the day after checkout
   - **Security measure**: Forces guests to use physical key cards during stay
   - Prevents guests from leaving card inside and relying on code
   - Prevents re-entry after checkout

4. **Code Revocation (Daily at 2 PM)**
   - A daily job identifies and revokes all expired access codes
   - Ensures security by removing codes from all devices after expiration

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
     - Twice-daily booking sync (12 AM and 6 PM)
     - Twice-daily code provisioning (12 AM and 6 PM)
     - Daily code revocation (2 PM)

4. **backend/app/services/code_generator.py**
   - Updated code validity calculation
   - Codes expire at 9 AM the day after checkout (security measure)

### Database Migrations

5. **database/migrations/004_add_code_provisioning_fields.sql**
   - Adds necessary fields to track code provisioning state

6. **database/migrations/005_create_bookings_needing_codes_function.sql**
   - Creates a database function to identify bookings requiring access codes
   - Optimizes the query for finding bookings within the 48-hour check-in window

7. **database/migrations/006_create_codes_to_revoke_function.sql**
   - Creates a database function to identify expired access codes
   - Efficiently finds codes that need to be revoked

## Benefits

- **Automation**: Eliminates manual code generation and provisioning
- **Reliability**: Database-driven approach ensures consistency
- **Security**: Codes expire at 9 AM day after checkout (prevents misuse)
- **Efficiency**: Twice-daily schedule reduces resource usage
- **Cost Savings**: Uses Lodgify messaging instead of Twilio
- **Guest Experience**: Codes delivered 36-47 hours before check-in
- **Scalability**: Can handle multiple properties and devices

## Configuration

The workflow requires proper configuration in the backend settings:
- **Lodgify API credentials** (for booking sync and guest messaging)
- **Device configurations** (Tuya and Ring)
- **Telegram Bot** (for admin notifications only)
- **Timing parameters**:
  - Booking sync: 12 AM and 6 PM
  - Code provisioning: 12 AM and 6 PM (48h window)
  - Code expiration: 9 AM day after checkout
  - Auto-revoke: 2 PM daily

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
