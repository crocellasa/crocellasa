# Alcova Smart Check-in System - Project Documentation

## Overview

Automated check-in system for Alcova Landolina apartments in Florence, Italy. Integrates Tuya smart locks, WhatsApp/SMS notifications, and provides both admin and guest portals.

**Property:** Alcova Landolina, Florence
**Property ID:** `alcova_landolina_fi`

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Admin Portal   │────────▶│  FastAPI Backend │────────▶│  Supabase DB    │
│  (Next.js)      │         │  (Railway)       │         │  (PostgreSQL)   │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌──────────┐    ┌──────────────┐
            │   Tuya    │    │  Twilio  │    │ Ring/HomeAss │
            │ Smart Lock│    │ WhatsApp │    │   Intercom   │
            │    API    │    │    SMS   │    │              │
            └───────────┘    └──────────┘    └──────────────┘
                    │
                    │
                    ▼
            ┌───────────────┐
            │ Guest Portal  │
            │   (Next.js)   │
            └───────────────┘
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Date Handling:** date-fns
- **Icons:** lucide-react
- **Deployment:** Vercel

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Database Client:** Supabase Python SDK
- **Authentication:** JWT (PyJWT)
- **Scheduling:** APScheduler
- **Deployment:** Railway
- **Server:** Uvicorn

### Database
- **Provider:** Supabase (PostgreSQL)
- **ORM:** Direct Supabase client (no ORM)

### External Services
- **Smart Locks:** Tuya IoT Platform (EU region)
- **Messaging:** Twilio (WhatsApp Business API, SMS)
- **Intercom:** Ring via Home Assistant (optional)
- **Booking PMS:** Hospitable webhooks (not yet implemented)

## Project Structure

```
crocellasa/
├── frontend/                    # Next.js frontend
│   ├── app/
│   │   ├── admin/              # Admin portal pages
│   │   │   ├── login/          # Admin login
│   │   │   ├── bookings/       # Bookings management ✅
│   │   │   ├── activity/       # Activity logs
│   │   │   ├── integrations/   # Integration status
│   │   │   ├── locations/      # Property management
│   │   │   └── layout.tsx      # Admin layout with sidebar
│   │   ├── g/[token]/          # Guest portal (JWT access)
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   └── admin/              # Admin-specific components
│   ├── lib/
│   │   └── auth.ts             # Auth utilities (login, fetchWithAuth)
│   ├── messages/               # i18n messages (IT/EN)
│   └── vercel.json             # Vercel config
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   │   ├── bookings.py     # Booking creation/management ✅
│   │   │   ├── guests.py       # Guest portal data
│   │   │   ├── admin_auth.py   # Admin authentication ✅
│   │   │   ├── admin_bookings.py  # Admin booking APIs ✅
│   │   │   ├── admin_dashboard.py # Dashboard stats
│   │   │   ├── admin_activity.py  # Activity logs
│   │   │   └── admin_integrations.py # Integration status
│   │   ├── core/               # Core functionality
│   │   │   ├── config.py       # Settings (env vars)
│   │   │   ├── database.py     # Supabase client
│   │   │   ├── security.py     # JWT generation
│   │   │   ├── admin_auth.py   # Admin auth logic ✅
│   │   │   └── dependencies.py # FastAPI dependencies
│   │   ├── models/             # Pydantic models
│   │   │   ├── booking.py      # Booking models
│   │   │   ├── guest.py        # Guest models
│   │   │   └── admin.py        # Admin models
│   │   ├── services/           # Business logic
│   │   │   ├── code_generator.py      # PIN generation ✅
│   │   │   ├── tuya_service.py        # Tuya API integration ⚠️
│   │   │   ├── notification_service.py # WhatsApp/SMS
│   │   │   ├── scheduler.py           # Auto-revoke codes
│   │   │   ├── ring_service.py        # Ring intercom
│   │   │   └── home_assistant_service.py # Home Assistant
│   │   └── main.py             # FastAPI app entry point ✅
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Railway deployment
│
├── INSTRUCTIONS.md             # This file - How to use/deploy
├── PROJECT.md                  # Project documentation
├── DEPLOYMENT.md               # Deployment notes
└── README.md                   # Project overview
```

## Database Schema

### Tables

**properties**
```sql
CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Europe/Rome',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**bookings**
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospitable_id VARCHAR(100) UNIQUE,
    confirmation_code VARCHAR(50),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_language VARCHAR(10) DEFAULT 'en',
    property_id VARCHAR(50) REFERENCES properties(id),
    checkin_date TIMESTAMP WITH TIME ZONE NOT NULL,
    checkout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    num_guests INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'confirmed',
    guest_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**locks**
```sql
CREATE TABLE locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id VARCHAR(50) REFERENCES properties(id),
    lock_type VARCHAR(50) CHECK (lock_type IN ('main_entrance', 'floor_door', 'apartment_door')),
    device_name VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    display_name_it VARCHAR(100),
    display_name_en VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**access_codes**
```sql
CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    lock_id UUID REFERENCES locks(id),
    lock_type VARCHAR(50) CHECK (lock_type IN ('main_entrance', 'floor_door', 'apartment_door')),
    device_id VARCHAR(100),  -- Nullable
    code VARCHAR(10) NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'revoked', 'expired', 'failed')),
    tuya_sync_status VARCHAR(50),
    tuya_password_id VARCHAR(100),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**notifications**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    type VARCHAR(50),
    channel VARCHAR(50),
    recipient VARCHAR(255),
    status VARCHAR(50),
    message_text TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**audit_logs**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    event_type VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Public Endpoints

**Health Check**
```
GET /health
Returns: {"status": "healthy"}
```

**Create Booking**
```
POST /api/bookings/create
Body: {
    "hospitable_id": "string",
    "guest_name": "string",
    "guest_email": "string",
    "guest_phone": "string",
    "guest_language": "it" | "en",
    "checkin_date": "ISO datetime",
    "checkout_date": "ISO datetime",
    "num_guests": number
}
Returns: Booking with guest_token and portal_url
```

**Guest Portal Data**
```
GET /api/guests/{token}
Returns: Booking info + access codes for guest
```

### Admin Endpoints (Require JWT)

**Admin Login**
```
POST /api/admin/auth/login
Body: {"email": "string", "password": "string"}
Returns: {"access_token": "jwt", "admin": {...}}
```

**Verify Admin Token**
```
GET /api/admin/auth/verify
Headers: Authorization: Bearer {token}
Returns: Admin info
```

**List Bookings**
```
GET /api/admin/bookings?status=all&search=query
Headers: Authorization: Bearer {token}
Returns: Array of bookings
```

**Get Booking Details**
```
GET /api/admin/bookings/{booking_id}
Headers: Authorization: Bearer {token}
Returns: {booking, access_codes[], activity_logs[]}
```

**Resend Notification**
```
POST /api/admin/bookings/{booking_id}/resend-notification
Headers: Authorization: Bearer {token}
Returns: {success: true}
```

**Cancel Booking**
```
POST /api/bookings/{booking_id}/cancel
Returns: {message, codes_revoked}
```

## Authentication

### Admin Authentication
- **Method:** JWT tokens
- **Login:** Email + bcrypt password
- **Token Expiry:** 24 hours
- **Storage:** localStorage (frontend)

**Hardcoded Admin Credentials (in backend/app/core/admin_auth.py):**
```python
{
    "email": "admin@landolina.it",
    "password": "admin123"  # bcrypt hashed
}
```

### Guest Authentication
- **Method:** JWT tokens embedded in portal URL
- **Format:** `/g/{token}`
- **Token Expiry:** 30 days (JWT_EXPIRATION_HOURS = 720)
- **Payload:** booking_id

## Booking Flow

### 1. Admin Creates Booking
```
Admin Portal → Create Booking Form
    ↓
POST /api/bookings/create
    ↓
Backend validates data
    ↓
Create booking in Supabase
    ↓
Get locks for property from locks table
    ↓
For each lock:
    - Generate 6-digit PIN
    - Calculate validity (checkin - 2h to checkout + 2h)
    - Create temp password on Tuya ⚠️ Currently failing
    - Save access code to database
    ↓
Generate JWT guest token
    ↓
Send WhatsApp/SMS to guest
    ↓
Return booking + portal URL
```

### 2. Guest Access
```
Guest receives WhatsApp with link: https://crocellasa.vercel.app/g/{token}
    ↓
Frontend extracts token from URL
    ↓
GET /api/guests/{token}
    ↓
Backend verifies JWT
    ↓
Returns booking info + access codes
    ↓
Guest sees:
    - Welcome message
    - Check-in/out dates
    - Access codes with labels (IT/EN)
    - Property info
    - Instructions
```

## Code Generation Logic

**PIN Code:**
- Length: 6 digits (configurable via CODE_LENGTH)
- Format: Numeric only, cannot start with 0
- Uniqueness: Random per booking + lock combination

**Validity Period:**
- **Start:** Check-in date - 2 hours (CODE_BUFFER_HOURS_BEFORE)
- **End:** Check-out date + 2 hours (CODE_BUFFER_HOURS_AFTER)
- **Timezone:** All times stored as UTC in database

**Example:**
```
Check-in: 2025-11-15 15:00 UTC
Check-out: 2025-11-22 11:00 UTC

Code valid from: 2025-11-15 13:00 UTC
Code valid until: 2025-11-22 13:00 UTC
```

## Tuya Integration

### Current Status
⚠️ **NOT WORKING** - Returns error 2008: "command or value not support"

### Configuration
- **Region:** EU
- **API Endpoint:** openapi.tuyaeu.com
- **Credentials:** Set in Railway environment variables

### Expected Flow
```python
tuya_service.create_temporary_password(
    device_id="lock_device_id_from_locks_table",
    password="123456",  # 6-digit code
    valid_from=1731542400,  # Unix timestamp
    valid_until=1732147200,  # Unix timestamp
    name="Guest Name"
)
```

### API Call Made
```
POST https://openapi.tuyaeu.com/v1.0/devices/{device_id}/door-lock/temp-password
Headers:
    - client_id: TUYA_CLIENT_ID
    - sign: HMAC signature
    - t: timestamp
Body:
    {
        "password": "123456",
        "effective_time": 1731542400,
        "invalid_time": 1732147200,
        "name": "Guest Name"
    }
```

### Troubleshooting Tuya
1. Verify device_id in locks table matches Tuya IoT Platform
2. Check lock supports temporary password API
3. Test API in Tuya IoT Platform → Cloud → API Explorer
4. Confirm lock is online and connected
5. Check API permissions in Tuya project

## Environment Variables

### Frontend (.env or Vercel)
```bash
NEXT_PUBLIC_API_URL=https://crocellasa-production.up.railway.app
```

### Backend (Railway)
```bash
# CORS
CORS_ORIGINS=http://localhost:3000,https://crocellasa.vercel.app,https://crocellasa-frontend.vercel.app

# Database
SUPABASE_URL=https://fmymdarxvnuvwldmkjzw.supabase.co
SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_KEY=<key>

# Tuya
TUYA_CLIENT_ID=<id>
TUYA_SECRET=<secret>
TUYA_REGION=eu

# Twilio
TWILIO_ACCOUNT_SID=<sid>
TWILIO_AUTH_TOKEN=<token>
TWILIO_WHATSAPP_FROM=whatsapp:+<number>
TWILIO_SMS_FROM=+<number>

# Security
JWT_SECRET=<random-string>
SECRET_KEY=<random-string>

# Optional
HOME_ASSISTANT_URL=<url>
HOME_ASSISTANT_TOKEN=<token>
TELEGRAM_BOT_TOKEN=<token>
TELEGRAM_ADMIN_CHAT_ID=<id>
```

## Recent Fixes & Known Issues

### ✅ Fixed
1. Admin portal buttons now functional (commit: `34485ea`)
2. CORS configuration for multiple Vercel domains
3. Admin authentication with JWT
4. Booking creation flow
5. Access codes table schema (`lock_type` instead of `lock_name`)
6. Timezone-aware datetime handling (commit: `dddce24`)
7. Database constraints (device_id nullable, status includes 'failed')

### ⚠️ Known Issues
1. **Tuya API Error 2008** - Temporary password creation failing
   - Need to verify device IDs
   - Check lock model API compatibility
   - Test with Tuya API Explorer

2. **WhatsApp/SMS Not Tested**
   - Twilio credentials configured but not verified
   - Need to test notification sending

3. **Hospitable Webhook Not Implemented**
   - Manual booking creation only
   - Need to add webhook endpoint for auto-import

4. **RLS Not Enabled on Supabase**
   - All tables are public (no row-level security)
   - Should be enabled for production

5. **Admin Dashboard APIs 404**
   - `/admin/dashboard/stats` - Not implemented
   - `/admin/activity/recent` - Not implemented
   - `/admin/integrations/status` - Returns 404

## Development Workflow

### Local Development
```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:3000

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

### Deploying Changes
```bash
git add .
git commit -m "description"
git push -u origin claude/resolve-httpx-dependency-conflict-011CUxJaVjTAo2h1rFQtycR7
```
Both Railway and Vercel will auto-deploy.

## Testing Checklist

- [ ] Admin login works
- [ ] Create manual booking (with unique hospitable_id)
- [ ] View booking details
- [ ] Access codes generated and saved to database
- [ ] Tuya codes created on physical locks (FAILING)
- [ ] WhatsApp notification sent to guest
- [ ] Guest can access portal with token
- [ ] Guest portal displays correct codes and info
- [ ] Resend notification works
- [ ] Cancel booking revokes codes
- [ ] Codes auto-expire after checkout

## Support & Contact

- **Project Repository:** https://github.com/YOUR_USERNAME/crocellasa
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com
- **Supabase Dashboard:** https://supabase.com

## Future Enhancements

1. **Hospitable Integration**
   - Webhook endpoint to auto-create bookings
   - Sync booking updates/cancellations

2. **Ring Intercom**
   - Integrate with Home Assistant
   - Auto-unlock main entrance via Ring

3. **Better Error Handling**
   - User-friendly error messages
   - Retry logic for failed Tuya calls
   - Admin notifications for failures

4. **Analytics Dashboard**
   - Booking statistics
   - Code usage analytics
   - Integration health monitoring

5. **Multi-Property Support**
   - Currently hardcoded to `alcova_landolina_fi`
   - Add property selection in admin

6. **Email Notifications**
   - SMTP fallback if WhatsApp fails
   - Send check-in instructions via email

7. **Mobile App**
   - Native mobile app for guests
   - Push notifications
