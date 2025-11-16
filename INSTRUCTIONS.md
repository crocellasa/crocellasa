# Alcova Smart Check-in System - Instructions

## Quick Start

### Admin Portal Access
- **URL:** https://crocellasa.vercel.app/admin/login
- **Email:** admin@landolina.it
- **Password:** admin123

### Backend API
- **URL:** https://crocellasa-production.up.railway.app
- **Docs:** https://crocellasa-production.up.railway.app/docs

## Creating a Booking

1. Login to admin portal
2. Go to **Bookings** page
3. Click **"Create Manual Booking"** button
4. Fill out the form:
   - **Hospitable/Airbnb ID:** Must be unique (e.g., `TEST-001`, `BOOKING-123`)
   - **Guest Name:** Full name
   - **Email:** Valid email address
   - **Phone:** With country code (e.g., `+393331234567`)
   - **Language:** Italian or English
   - **Check-in Date:** Date and time
   - **Check-out Date:** Date and time
5. Click **"Create Booking"**

This will:
- Create booking in Supabase database
- Generate 2 PIN codes (Floor Door + Apartment Door)
- Attempt to create temporary passwords on Tuya smart locks
- Send WhatsApp/SMS notification to guest
- Generate guest portal link

## Deployments

### Frontend (Vercel)
- **Project:** crocellasa
- **URL:** https://crocellasa.vercel.app
- **Production Branch:** `claude/resolve-httpx-dependency-conflict-011CUxJaVjTAo2h1rFQtycR7`

**How to Deploy:**
1. Push to the production branch
2. Vercel auto-deploys
3. Check deployment status at https://vercel.com/dashboard

**Environment Variables (Vercel):**
```
NEXT_PUBLIC_API_URL=https://crocellasa-production.up.railway.app
```

### Backend (Railway)
- **Service:** crocellasa-production
- **URL:** https://crocellasa-production.up.railway.app
- **Deployment:** Auto-deploys on git push to production branch

**How to Deploy:**
1. Push to production branch
2. Railway auto-builds and deploys
3. Wait 2-3 minutes for deployment
4. Check logs in Railway dashboard

**Critical Environment Variables (Railway):**
```
CORS_ORIGINS=http://localhost:3000,https://crocellasa.vercel.app,https://crocellasa-frontend.vercel.app

# Supabase
SUPABASE_URL=https://fmymdarxvnuvwldmkjzw.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>

# Tuya
TUYA_CLIENT_ID=<your-client-id>
TUYA_SECRET=<your-secret>
TUYA_REGION=eu

# JWT
JWT_SECRET=<your-secret>

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_WHATSAPP_FROM=<whatsapp-number>
```

## Database (Supabase)

### Important Tables

**bookings**
- Stores all guest bookings
- `hospitable_id` must be unique
- Fields: guest_name, guest_email, guest_phone, checkin_date, checkout_date, status

**access_codes**
- Stores generated PIN codes for each booking
- Fields: booking_id, lock_id, lock_type, code, valid_from, valid_until, status
- Status can be: 'active', 'revoked', 'expired', 'failed'

**locks**
- Stores information about physical locks
- Fields: property_id, lock_type, device_id, device_name, display_order
- Lock types: 'main_entrance', 'floor_door', 'apartment_door'

### Current Locks Configuration
```sql
SELECT * FROM locks WHERE property_id = 'alcova_landolina_fi';
```
- **Floor Door:** device_id in locks table
- **Apartment Door:** device_id in locks table

### Refresh Supabase Schema Cache
If you add/modify columns and get "column not found" errors:

**Option 1 - API Settings:**
1. Go to Supabase Dashboard → API Settings
2. Scroll to "PostgREST Schema Cache"
3. Click **"Reload"**

**Option 2 - SQL:**
```sql
NOTIFY pgrst, 'reload schema';
```

## Common Issues & Solutions

### 1. "Failed to fetch" Error
**Cause:** CORS issue - backend not allowing frontend domain

**Fix:**
1. Go to Railway → Your backend service → Variables
2. Ensure `CORS_ORIGINS` includes your Vercel domain:
   ```
   http://localhost:3000,https://crocellasa.vercel.app,https://crocellasa-frontend.vercel.app
   ```
3. Redeploy Railway (it will auto-redeploy after saving variable)

### 2. "OPTIONS /api/... 400 Bad Request" in Railway Logs
**Cause:** Same as above - CORS preflight requests failing

**Fix:** Set correct CORS_ORIGINS (see #1)

### 3. "Could not find the 'xxx' column in schema cache"
**Cause:** Supabase PostgREST hasn't refreshed after schema changes

**Fix:** Reload schema cache (see Database section above)

### 4. "duplicate key violates unique constraint bookings_hospitable_id"
**Cause:** You're trying to use a hospitable_id that already exists

**Fix:** Use a different unique hospitable_id in the form

### 5. "can't subtract offset-naive and offset-aware datetimes"
**Cause:** Timezone mismatch in datetime calculations

**Status:** FIXED in commit `dddce24`

### 6. Buttons Not Working / Old Code Showing
**Cause:** Browser caching old version

**Fix:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Wait for Vercel deployment to complete

### 7. Vercel Deploying Wrong Branch
**Fix:**
1. Go to Vercel → Settings → Git
2. Set Production Branch to: `claude/resolve-httpx-dependency-conflict-011CUxJaVjTAo2h1rFQtycR7`
3. Redeploy

## Tuya Integration Issues

### Current Status
⚠️ **Tuya API returns error 2008: "command or value not support"**

This means the temporary password API call is being rejected by Tuya.

**Possible Causes:**
1. Device IDs in `locks` table are incorrect
2. Lock model doesn't support temporary passwords via API
3. API credentials are wrong
4. API call format needs adjustment for specific lock model

**To Debug:**
1. Verify device IDs in Supabase `locks` table match Tuya IoT Platform
2. Check Tuya IoT Platform → Cloud → API Explorer
3. Test the "Create Temporary Password" API manually
4. Check lock model specifications for API support

**Tuya API Call Made:**
```python
tuya_service.create_temporary_password(
    device_id=lock["device_id"],
    password=code,  # 6-digit PIN
    valid_from=valid_from,  # Unix timestamp
    valid_until=valid_until,  # Unix timestamp
    name=booking.guest_name[:20]
)
```

## Testing Guest Portal

1. Create a booking via admin portal
2. Find the booking ID in Supabase or admin bookings list
3. Generate guest token:
   ```
   GET https://crocellasa-production.up.railway.app/api/bookings/{booking_id}/generate-token
   ```
4. Access guest portal with token:
   ```
   https://crocellasa.vercel.app/g/{token}
   ```

## Database Schema Fixes Applied

If you need to recreate the database or fix schema issues:

```sql
-- Fix access_codes table constraints
ALTER TABLE access_codes
ALTER COLUMN device_id DROP NOT NULL;

ALTER TABLE access_codes
DROP CONSTRAINT IF EXISTS access_codes_status_check;

ALTER TABLE access_codes
ADD CONSTRAINT access_codes_status_check
CHECK (status IN ('active', 'revoked', 'expired', 'failed'));

-- Make hospitable_id unique but allow duplicates if NULL
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_hospitable_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_hospitable_id_unique
ON bookings (hospitable_id)
WHERE hospitable_id IS NOT NULL;

-- Add missing columns to access_codes if needed
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS lock_id UUID REFERENCES locks(id),
ADD COLUMN IF NOT EXISTS tuya_sync_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tuya_password_id VARCHAR(100);
```

## Git Workflow

**Current Production Branch:**
```
claude/resolve-httpx-dependency-conflict-011CUxJaVjTAo2h1rFQtycR7
```

**To Make Changes:**
```bash
# Make your changes locally
git add .
git commit -m "your message"
git push -u origin claude/resolve-httpx-dependency-conflict-011CUxJaVjTAo2h1rFQtycR7
```

**Both Railway and Vercel will auto-deploy.**

## Monitoring

### Railway Logs
1. Go to Railway → Your service
2. Click latest deployment
3. View logs tab
4. Look for errors marked with `[err]`

### Browser Console
1. Press F12
2. Console tab - for JavaScript errors
3. Network tab - for API request failures
4. Look for red errors

## Next Steps / TODO

- [ ] Fix Tuya API error 2008 - verify device IDs and API compatibility
- [ ] Test WhatsApp/SMS notifications (Twilio configured?)
- [ ] Test full booking flow end-to-end
- [ ] Enable Row Level Security (RLS) on Supabase tables
- [ ] Set up Hospitable webhook integration for automatic booking creation
- [ ] Configure Ring Intercom integration (Home Assistant)
- [ ] Add proper error handling and user feedback in frontend
- [ ] Set up monitoring/alerting for production
