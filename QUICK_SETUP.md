# 🚀 Quick Setup: Supabase & Tuya

Step-by-step guide to get your core integrations running.

---

## 1️⃣ SUPABASE DATABASE SETUP (10 minutes)

### Step 1: Create Supabase Project

1. **Go to** [supabase.com](https://supabase.com) and sign up/login
2. **Click** "New Project"
3. **Fill in:**
   - Organization: Create new or select existing
   - Project name: `alcova-checkin` (or whatever you prefer)
   - Database Password: Generate a strong password (SAVE THIS!)
   - Region: **Europe (Central)** - closest to Italy for GDPR compliance
   - Pricing Plan: Free (perfect for getting started)
4. **Click** "Create new project"
5. **Wait** ~2 minutes for provisioning

### Step 2: Get Your Credentials

1. Once project is ready, click on **Settings** (gear icon) → **API**
2. **Copy these 3 values:**

```bash
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS... (click "Reveal" first)
```

**⚠️ IMPORTANT:** Keep the `service_role` key secret! It has full database access.

### Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"+ New query"**
3. **Copy the entire SQL from below** and paste it:

```sql
-- =====================================================
-- ALCOVA SMART CHECK-IN - DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: properties
-- =====================================================

CREATE TABLE properties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'IT',

    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- WiFi
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),

    -- Instructions (localized)
    checkin_instructions_it TEXT,
    checkin_instructions_en TEXT,
    house_rules_it TEXT,
    house_rules_en TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: bookings
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
    property_id VARCHAR(50) NOT NULL REFERENCES properties(id),
    checkin_date TIMESTAMP WITH TIME ZONE NOT NULL,
    checkout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    num_guests INTEGER DEFAULT 1 CHECK (num_guests > 0),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),

    -- Guest portal
    guest_token TEXT,
    portal_opened_at TIMESTAMP WITH TIME ZONE,
    portal_views INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_dates CHECK (checkout_date > checkin_date)
);

CREATE INDEX idx_bookings_hospitable_id ON bookings(hospitable_id);
CREATE INDEX idx_bookings_checkin_date ON bookings(checkin_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- TABLE: access_codes
-- =====================================================

CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

    -- Lock details
    lock_type VARCHAR(50) NOT NULL CHECK (lock_type IN ('main_entrance', 'floor_door', 'apartment_door')),
    device_id VARCHAR(100) NOT NULL,

    -- Code details
    code VARCHAR(20) NOT NULL,
    code_id VARCHAR(100), -- Tuya's internal ID for the code

    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    revoked_at TIMESTAMP WITH TIME ZONE,

    -- Display names (localized)
    display_name_it VARCHAR(100),
    display_name_en VARCHAR(100),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_access_codes_booking_id ON access_codes(booking_id);
CREATE INDEX idx_access_codes_status ON access_codes(status);
CREATE INDEX idx_access_codes_valid_until ON access_codes(valid_until);

-- =====================================================
-- TABLE: notifications
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN ('whatsapp', 'sms', 'email', 'telegram')),
    recipient VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),

    -- Provider info
    provider VARCHAR(50), -- twilio, sendgrid, etc.
    provider_message_id VARCHAR(255),
    error_message TEXT,

    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);

-- =====================================================
-- TABLE: audit_logs
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

    -- Event details
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,

    -- User/system
    performed_by VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_booking_id ON audit_logs(booking_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- SEED DATA: Insert Alcova Landolina property
-- =====================================================

INSERT INTO properties (
    id,
    name,
    address,
    city,
    postal_code,
    country,
    latitude,
    longitude,
    wifi_ssid,
    wifi_password,
    checkin_instructions_it,
    checkin_instructions_en,
    house_rules_it,
    house_rules_en
) VALUES (
    'alcova_landolina_fi',
    'Alcova Landolina',
    'Via Landolina, Firenze',
    'Firenze',
    '50100',
    'IT',
    43.7733,
    11.2536,
    'Alcova_WiFi',
    'changeme123',  -- CHANGE THIS to your actual WiFi password

    -- Italian check-in instructions
    'Benvenuto in Alcova Landolina!

1. Usa il codice per il portone principale
2. Sali al piano e usa il codice per la porta del piano
3. Entra nell''appartamento con il terzo codice

I codici sono validi dalle ore 15:00 del giorno del check-in.

Per emergenze, contattaci via WhatsApp.',

    -- English check-in instructions
    'Welcome to Alcova Landolina!

1. Use the main entrance code for the building door
2. Go to your floor and use the floor door code
3. Enter the apartment with the third code

Codes are valid from 3:00 PM on check-in day.

For emergencies, contact us via WhatsApp.',

    -- Italian house rules
    '📋 Regole della Casa

• Check-in: dalle 15:00
• Check-out: entro le 11:00
• Silenzio: 22:00 - 08:00
• Vietato fumare in casa
• No feste o eventi
• Rispetta i vicini
• Separa i rifiuti correttamente

Grazie per la collaborazione! 🏠',

    -- English house rules
    '📋 House Rules

• Check-in: from 3:00 PM
• Check-out: by 11:00 AM
• Quiet hours: 10:00 PM - 8:00 AM
• No smoking inside
• No parties or events
• Respect the neighbors
• Sort waste properly

Thank you for your cooperation! 🏠'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE 'Tables: properties, bookings, access_codes, notifications, audit_logs';
    RAISE NOTICE 'Property "Alcova Landolina" added to database';
END $$;
```

4. **Click** "Run" (or press Cmd/Ctrl + Enter)
5. **Verify:** You should see "Success. No rows returned" and the notice messages

### Step 4: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see 5 tables:
   - ✅ `properties`
   - ✅ `bookings`
   - ✅ `access_codes`
   - ✅ `notifications`
   - ✅ `audit_logs`
3. Click on `properties` → You should see 1 row: "Alcova Landolina"

### Step 5: Update WiFi Password

1. In Table Editor → `properties`
2. Click on the row for "Alcova Landolina"
3. Update `wifi_password` with your actual WiFi password
4. Click "Save"

**✅ Supabase is ready!** Keep your credentials handy for the next step.

---

## 2️⃣ TUYA SMART LOCKS SETUP (20 minutes)

### Step 1: Create Tuya Developer Account

1. **Go to** [iot.tuya.com](https://iot.tuya.com)
2. **Click** "Register" (top right)
3. **Fill in:**
   - Email/Phone
   - Password
   - Verification code
4. **Complete** identity verification (might take a few minutes)

### Step 2: Create Cloud Project

1. After login, go to **Cloud** → **Development**
2. **Click** "Create Cloud Project"
3. **Fill in:**
   - Project Name: `Alcova Smart Checkin`
   - Description: `Smart lock automation for guest check-in`
   - Industry: **Smart Home**
   - Development Method: **Custom Development**
   - Data Center: **Central Europe** (or Western Europe if available)
4. **Click** "Create"

### Step 3: Get API Credentials

1. **Open** your newly created project
2. Go to **Overview** tab
3. **Copy these values:**

```bash
Access ID/Client ID: xxxxxxxxxxxxxxxx
Access Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Keep these secret!**

### Step 4: Enable API Services

1. In your project, go to **API Products** tab
2. **Subscribe to these APIs** (all free):
   - **IoT Core** - Click "Subscribe" → Confirm
   - **Authorization** - Click "Subscribe" → Confirm
   - **Smart Lock** - Click "Subscribe" → Confirm
   - **Device Status Notification** - Click "Subscribe" → Confirm
3. Wait for "Subscribed" status (usually instant)

### Step 5: Link Your Tuya App

**If you already have locks in Tuya Smart app:**

1. In IoT Platform, go to **Devices** → **Link Tuya App Account**
2. **Scan** the QR code with **Tuya Smart** app (or **Smart Life** app)
3. **Confirm** linking in the app
4. **Wait** for devices to sync (~30 seconds)
5. Go to **All Devices** → Your locks should appear!

**If you don't have the app yet:**

1. Download **Tuya Smart** app from App Store/Play Store
2. Register and login
3. Add your smart locks following manufacturer instructions
4. Then come back and follow the linking steps above

### Step 6: Get Device IDs

1. In IoT Platform, go to **Devices** → **All Devices**
2. You should see your 3 locks listed
3. **Click** on each lock to open details
4. **Copy** the **Device ID** (format: `xxxxxxxxxxxxxx` - usually 22 characters)

**Map your locks:**
```bash
Main Entrance Lock ID: ______________________ (portone principale)
Floor Door Lock ID: ______________________ (porta del piano)
Apartment Lock ID: ______________________ (porta appartamento)
```

### Step 7: Test API Connection (Optional but Recommended)

**Quick test using curl:**

```bash
# Get access token
curl -X POST 'https://openapi.tuyaeu.com/v1.0/token?grant_type=1' \
  -H 'client_id: YOUR_CLIENT_ID' \
  -H 'sign: YOUR_CALCULATED_SIGNATURE' \
  -H 'sign_method: HMAC-SHA256' \
  -H 't: TIMESTAMP'
```

**Or use the Tuya API Explorer:**
1. In your project, go to **API Explorer**
2. Try **Get Device List** API
3. You should see your locks in the response

**✅ Tuya is ready!** Note down all your device IDs.

---

## 3️⃣ ADD CREDENTIALS TO RAILWAY

Now let's add all these credentials to your Railway backend.

### Step 1: Open Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Open your project: `crocellasa-production`
3. Click on your backend service
4. Go to **Variables** tab

### Step 2: Add Supabase Variables

Click **"+ New Variable"** for each:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (your anon public key)
SUPABASE_SERVICE_KEY=eyJhbGc... (your service_role key - keep secret!)
```

### Step 3: Add Tuya Variables

Click **"+ New Variable"** for each:

```bash
TUYA_CLIENT_ID=your_access_id_from_tuya
TUYA_SECRET=your_access_secret_from_tuya
TUYA_REGION=eu  (or us/cn/in based on your data center)
TUYA_DEVICE_MAIN_ENTRANCE=your_main_entrance_device_id
TUYA_DEVICE_FLOOR_DOOR=your_floor_door_device_id
TUYA_DEVICE_APARTMENT=your_apartment_device_id
```

### Step 4: Verify Required Variables

Make sure you also have these (should already be set):

```bash
APP_ENV=production
SECRET_KEY=... (some random string)
JWT_SECRET=... (some random string, same as frontend)
```

### Step 5: Trigger Redeploy

1. Railway will **automatically redeploy** when you add variables
2. **Wait** ~2 minutes for deployment to complete
3. Check **Deployments** tab for status

---

## 4️⃣ TEST THE INTEGRATIONS

### Test 1: Check API Health

```bash
curl https://crocellasa-production.up.railway.app/health
```

**Expected:** `{"status":"healthy","database":"connected"}`

### Test 2: Create Test Booking

```bash
curl -X POST https://crocellasa-production.up.railway.app/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "hospitable_id": "TEST-001",
    "guest_name": "Mario Rossi",
    "guest_email": "your-email@example.com",
    "guest_phone": "+393331234567",
    "guest_language": "it",
    "checkin_date": "2025-11-20T15:00:00Z",
    "checkout_date": "2025-11-22T11:00:00Z",
    "property_id": "alcova_landolina_fi",
    "num_guests": 2
  }'
```

**Expected response:**
```json
{
  "booking": {
    "id": "uuid-here",
    "guest_name": "Mario Rossi",
    "status": "confirmed"
  },
  "access_codes": [
    {
      "lock_type": "main_entrance",
      "code": "123456",
      "valid_from": "2025-11-20T13:00:00Z",
      "valid_until": "2025-11-22T13:00:00Z"
    },
    {
      "lock_type": "floor_door",
      "code": "234567",
      ...
    },
    {
      "lock_type": "apartment_door",
      "code": "345678",
      ...
    }
  ],
  "guest_token": "eyJhbGc...",
  "portal_url": "https://your-frontend.vercel.app/g/eyJhbGc...?lang=it"
}
```

### Test 3: Verify in Supabase

1. Go to Supabase → **Table Editor** → `bookings`
2. You should see 1 booking: "Mario Rossi"
3. Click on `access_codes` → You should see 3 codes

### Test 4: Verify in Tuya App

1. Open **Tuya Smart** app
2. Go to each lock
3. Check **Temporary Passwords** section
4. You should see 3 new codes with validity dates

### Test 5: Check Railway Logs

1. In Railway, go to **Deployments** → Latest deployment
2. Click **View Logs**
3. Look for:
   - ✅ `Supabase initialized successfully`
   - ✅ `Created access code for main_entrance`
   - ✅ `Created access code for floor_door`
   - ✅ `Created access code for apartment_door`

---

## ✅ SUCCESS CRITERIA

You're ready if you see:

- ✅ Supabase tables created and property added
- ✅ Tuya API credentials working
- ✅ All 3 locks visible in Tuya IoT Platform
- ✅ Railway environment variables configured
- ✅ Test booking creates 3 access codes
- ✅ Codes appear in Tuya Smart app
- ✅ Data saved to Supabase database

---

## 🆘 TROUBLESHOOTING

### "Supabase connection failed"
- Check SUPABASE_URL ends with `.supabase.co`
- Verify SERVICE_KEY (not anon key) for backend
- Check project isn't paused (free tier sleeps after 7 days)

### "Tuya: Device not found"
- Verify devices are **online** in Tuya Smart app
- Check device IDs are exact (no spaces)
- Ensure region matches data center (eu/us/cn)
- Verify API permissions are subscribed

### "Access codes not creating"
- Check Railway logs for specific error
- Verify all 6 Tuya variables are set correctly
- Test API connection in Tuya API Explorer
- Ensure locks support temporary passwords

### Codes create but don't appear in app
- Wait 30 seconds and refresh app
- Check code validity dates are in future
- Verify locks are online and connected
- Try manually creating code in app to test lock

---

## 🎯 NEXT STEPS

Once both integrations work:

1. ✅ Set up **Twilio** for WhatsApp notifications
2. ✅ Configure **Ring Intercom** (if you have Home Assistant)
3. ✅ Deploy **frontend** to Vercel
4. ✅ Test complete guest flow end-to-end
5. ✅ Set up webhooks from Hospitable

Need help with any step? Just ask! 🚀
