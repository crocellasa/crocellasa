# 🔧 Alcova Smart Check-in - Integration Setup Guide

Complete guide to configure all integrations for your smart check-in system.

## 📋 Setup Checklist

- [ ] **Supabase Database** - Create tables and schema
- [ ] **Tuya Smart Locks** - Get API credentials and configure devices
- [ ] **Twilio WhatsApp/SMS** - Configure messaging service
- [ ] **Ring Intercom** - Set up Home Assistant integration
- [ ] **Environment Variables** - Configure all secrets
- [ ] **Test Complete Flow** - End-to-end booking test

---

## 1️⃣ Supabase Database Setup

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region (Europe for GDPR compliance)
4. Set database password (save it!)
5. Wait for project to provision (~2 minutes)

### Step 2: Get Credentials
1. Go to Project Settings → API
2. Copy these values:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc... (public anon key)
   SUPABASE_SERVICE_KEY=eyJhbGc... (secret service_role key)
   ```

### Step 3: Create Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Open the file `database/schema.sql` from your project
3. Copy the entire SQL content
4. Paste into SQL Editor and click "Run"
5. Verify tables were created: Go to Table Editor

**Expected Tables:**
- `properties` - Property information (Alcova Landolina)
- `bookings` - Guest bookings
- `access_codes` - Smart lock codes
- `notifications` - Communication log
- `audit_logs` - System activity tracking

### Step 4: Seed Initial Data (Optional)
1. Open `database/seed.sql`
2. Update the property data with your actual information:
   - Address, coordinates
   - WiFi credentials
   - House rules in IT/EN
3. Run the seed SQL in Supabase SQL Editor

---

## 2️⃣ Tuya Smart Locks Setup

### Step 1: Create Tuya Cloud Account
1. Go to [iot.tuya.com](https://iot.tuya.com)
2. Register for a developer account (free)
3. Complete verification

### Step 2: Create Cloud Project
1. Go to "Cloud" → "Development"
2. Click "Create Cloud Project"
3. Fill in:
   - **Name**: Alcova Smart Checkin
   - **Industry**: Smart Home
   - **Development Method**: Custom Development
   - **Data Center**: Choose your region (EU for Europe)
4. Click "Create"

### Step 3: Get API Credentials
1. Open your project
2. Go to "Overview" tab
3. Copy these credentials:
   ```
   TUYA_CLIENT_ID=xxxxx (Access ID/Client ID)
   TUYA_SECRET=xxxxx (Access Secret)
   TUYA_REGION=eu  (or us, cn, in based on data center)
   ```

### Step 4: Link Smart Lock Devices
1. Download **Tuya Smart** or **Smart Life** app on your phone
2. Add your smart locks to the app (follow device pairing instructions)
3. In Tuya IoT Platform:
   - Go to "Devices" → "Link Tuya App Account"
   - Scan QR code with Tuya Smart app
   - Your devices should now appear in the cloud platform

### Step 5: Get Device IDs
1. In Tuya IoT Platform, go to "Devices" → "All Devices"
2. Click on each lock to see its Device ID
3. Copy the Device IDs:
   ```
   TUYA_DEVICE_MAIN_ENTRANCE=xxxxx (Main entrance lock)
   TUYA_DEVICE_FLOOR_DOOR=xxxxx (Floor door lock)
   TUYA_DEVICE_APARTMENT=xxxxx (Apartment door lock)
   ```

### Step 6: Enable API Permissions
1. In your cloud project, go to "API Products"
2. Subscribe to these APIs (all free):
   - **Smart Lock** - For lock control
   - **Device Status** - To read device state
   - **IoT Core** - Basic device management
3. Click "Apply" for each

### Step 7: Test Connection (Optional)
You can test locally with Python:
```python
import tinytuya

cloud = tinytuya.Cloud(
    apiRegion="eu",
    apiKey="YOUR_CLIENT_ID",
    apiSecret="YOUR_SECRET"
)

# Get device list
devices = cloud.getdevices()
print(devices)
```

---

## 3️⃣ Twilio WhatsApp & SMS Setup

### Step 1: Create Twilio Account
1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up (free trial gives $15 credit)
3. Verify your phone number

### Step 2: Get Account Credentials
1. Go to Twilio Console
2. From Dashboard, copy:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx (click "Show" to reveal)
   ```

### Step 3: Set Up WhatsApp (Recommended for Guests)

**Option A: Twilio WhatsApp Sandbox (Testing)**
1. Go to Messaging → Try it out → Send a WhatsApp message
2. Follow instructions to connect your WhatsApp:
   - Send "join [code]" to the sandbox number
3. Copy sandbox number:
   ```
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
4. **Limitation**: Only works with numbers that have "joined" the sandbox

**Option B: Production WhatsApp Business (Recommended for Production)**
1. Go to Messaging → Senders → WhatsApp senders
2. Click "Add WhatsApp sender"
3. Connect your Facebook Business Manager account
4. Submit WhatsApp Business Profile for approval
5. Once approved, get your sender number:
   ```
   TWILIO_WHATSAPP_FROM=whatsapp:+[your-number]
   ```
6. Create approved message templates for guest notifications

### Step 4: Set Up SMS (Fallback)
1. Go to Phone Numbers → Manage → Buy a number
2. Choose a number in your country (Italy: +39)
3. Purchase number (~$1/month)
4. Copy your number:
   ```
   TWILIO_SMS_FROM=+39xxxxxxxxxx
   ```

### Step 5: Test WhatsApp/SMS
Test in Twilio Console → Messaging → Try it out

---

## 4️⃣ Ring Intercom via Home Assistant Setup

### Step 1: Set Up Home Assistant
If you don't have Home Assistant yet:

1. **Option A: Home Assistant OS (Recommended)**
   - Use Raspberry Pi or dedicated hardware
   - Install from [home-assistant.io](https://www.home-assistant.io/installation/)

2. **Option B: Home Assistant Container (Docker)**
   ```bash
   docker run -d \
     --name homeassistant \
     --restart=unless-stopped \
     -v /path/to/config:/config \
     --network=host \
     ghcr.io/home-assistant/home-assistant:stable
   ```

### Step 2: Install Ring Integration
1. In Home Assistant, go to Settings → Devices & Services
2. Click "+ Add Integration"
3. Search for "Ring"
4. Log in with your Ring account credentials
5. Complete 2FA if required

### Step 3: Find Your Ring Intercom Entity
1. Go to Settings → Devices & Services → Ring
2. Find your Ring Intercom device
3. Look for the unlock button entity, usually:
   ```
   button.ring_intercom_unlock
   ```
4. Copy the exact entity ID

### Step 4: Create Long-Lived Access Token
1. In Home Assistant, click on your profile (bottom left)
2. Scroll down to "Long-Lived Access Tokens"
3. Click "Create Token"
4. Give it a name: "Alcova API Access"
5. Copy the token (you'll only see it once!):
   ```
   HOME_ASSISTANT_TOKEN=eyJhbGc...
   ```

### Step 5: Get Home Assistant URL
Your Home Assistant must be accessible from Railway backend:

**Option A: Local Network**
```
HOME_ASSISTANT_URL=http://192.168.1.xxx:8123
```
**Note**: This won't work if backend is on Railway (different network)

**Option B: Nabu Casa Cloud (Recommended - $6.50/month)**
1. Go to Settings → Home Assistant Cloud
2. Sign up for Nabu Casa subscription
3. Get your remote URL:
   ```
   HOME_ASSISTANT_URL=https://xxxxx.ui.nabu.casa
   ```

**Option C: Custom Domain with DuckDNS (Free)**
1. Set up DuckDNS and Let's Encrypt
2. Expose Home Assistant to internet (configure router)
3. Use your custom URL:
   ```
   HOME_ASSISTANT_URL=https://yourhome.duckdns.org
   ```

### Step 6: Test Intercom Unlock
Test in Home Assistant Developer Tools → Services:
```yaml
service: button.press
target:
  entity_id: button.ring_intercom_unlock
```

---

## 5️⃣ Environment Variables Configuration

### Backend (Railway)

Go to Railway Dashboard → Your Project → Variables:

```bash
# Application
APP_ENV=production
APP_NAME=Alcova Smart Check-in
APP_URL=https://crocellasa-production.up.railway.app
FRONTEND_URL=https://your-vercel-url.vercel.app
SECRET_KEY=generate-random-32-char-string
DEBUG=false

# CORS
CORS_ORIGINS=https://your-vercel-url.vercel.app,https://*.vercel.app

# Supabase (from Step 1)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Tuya (from Step 2)
TUYA_CLIENT_ID=xxxxx
TUYA_SECRET=xxxxx
TUYA_REGION=eu
TUYA_DEVICE_MAIN_ENTRANCE=xxxxx
TUYA_DEVICE_FLOOR_DOOR=xxxxx
TUYA_DEVICE_APARTMENT=xxxxx

# Twilio (from Step 3)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+39xxxxxxxxxx

# Telegram (Optional - currently disabled)
# TELEGRAM_BOT_TOKEN=xxxxx
# TELEGRAM_ADMIN_CHAT_ID=xxxxx

# Home Assistant (from Step 4)
HOME_ASSISTANT_URL=https://xxxxx.ui.nabu.casa
HOME_ASSISTANT_TOKEN=eyJhbGc...
RING_BUTTON_ENTITY_ID=button.ring_intercom_unlock

# Email (Fallback - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Alcova Landolina <noreply@alcova.com>

# JWT
JWT_SECRET=same-as-frontend-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=720

# n8n (Optional)
N8N_WEBHOOK_SECRET=random-secret-string

# Scheduler
SCHEDULER_TIMEZONE=Europe/Rome
AUTO_REVOKE_HOUR=14
```

### Frontend (Vercel)

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://crocellasa-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
JWT_SECRET=same-as-backend-secret
```

---

## 6️⃣ Testing All Integrations

### Test 1: Supabase Connection
```bash
curl https://crocellasa-production.up.railway.app/health
# Should return: {"status": "healthy", "database": "connected"}
```

### Test 2: Create Test Booking
```bash
curl -X POST https://crocellasa-production.up.railway.app/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "hospitable_id": "TEST001",
    "guest_name": "Mario Rossi",
    "guest_email": "test@example.com",
    "guest_phone": "+39YOUR_PHONE",
    "guest_language": "it",
    "checkin_date": "2025-11-20T15:00:00Z",
    "checkout_date": "2025-11-22T11:00:00Z",
    "property_id": "alcova_landolina_fi",
    "num_guests": 2
  }'
```

**Expected Response:**
```json
{
  "booking": {
    "id": "uuid...",
    "guest_name": "Mario Rossi",
    "status": "confirmed"
  },
  "access_codes": [
    {"lock_type": "main_entrance", "code": "123456"},
    {"lock_type": "floor_door", "code": "234567"},
    {"lock_type": "apartment", "code": "345678"}
  ],
  "guest_token": "eyJhbGc...",
  "portal_url": "https://your-vercel-url.vercel.app/g/eyJhbGc...?lang=it"
}
```

### Test 3: Verify Tuya Codes Created
1. Open Tuya Smart app
2. Check each lock
3. Verify temporary passwords were created with correct validity dates

### Test 4: Check WhatsApp Notification
1. Check your phone for WhatsApp message from Twilio
2. Should contain:
   - Welcome message
   - Check-in/out dates
   - All 3 access codes
   - Portal link

### Test 5: Open Guest Portal
1. Copy `portal_url` from response
2. Open in browser
3. Verify:
   - ✅ Guest name and dates display
   - ✅ All 3 access codes visible
   - ✅ WiFi credentials shown
   - ✅ Property address and map
   - ✅ House rules display

### Test 6: Test Ring Intercom
1. In guest portal, click "Apri Citofono" / "Open Intercom" button
2. Verify:
   - ✅ Button shows loading state
   - ✅ Success message appears
   - ✅ Ring Intercom actually unlocks (if you're nearby)

### Test 7: Check Supabase Data
1. Go to Supabase → Table Editor
2. Verify data in:
   - `bookings` table - new booking created
   - `access_codes` table - 3 codes created
   - `notifications` table - WhatsApp sent logged

---

## 🔍 Troubleshooting

### Tuya: "Device not found" or codes not creating
- Verify devices are online in Tuya Smart app
- Check API permissions are enabled in IoT Platform
- Ensure device IDs are correct (no spaces)
- Verify region matches your data center (eu/us/cn)

### Twilio: WhatsApp not sending
- If using sandbox: ensure recipient has joined with "join [code]"
- Check Twilio Console → Logs for error messages
- Verify phone number format: +[country][number] (no spaces/dashes)
- For production: ensure message templates are approved

### Ring Intercom: Not unlocking
- Test directly in Home Assistant first
- Verify entity ID is exactly correct (case-sensitive)
- Check Home Assistant is accessible from Railway
- Verify long-lived token hasn't expired

### Guest Portal: "Invalid token" error
- Check JWT_SECRET matches between frontend and backend
- Verify backend API URL is correct in Vercel env vars
- Check CORS_ORIGINS includes your Vercel URL
- Look for errors in Vercel deployment logs

### Supabase: Connection timeout
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Verify credentials are correct
- Check database password allows special characters

---

## ✅ Production Readiness Checklist

Before going live with real guests:

- [ ] **Supabase**: Tables created, seed data loaded
- [ ] **Tuya**: All 3 locks connected and tested
- [ ] **Twilio**: WhatsApp Business approved (or SMS ready)
- [ ] **Ring**: Intercom tested and unlocking reliably
- [ ] **Environment**: All secrets configured in Railway/Vercel
- [ ] **Testing**: Complete end-to-end booking flow successful
- [ ] **Monitoring**: Check Railway logs for errors
- [ ] **Backup**: Supabase automatic backups enabled
- [ ] **Domain**: Custom domain configured (optional)
- [ ] **Webhooks**: Hospitable webhook pointing to your API

---

## 📞 Support Resources

- **Tuya Documentation**: [developer.tuya.com/docs](https://developer.tuya.com/en/docs)
- **Twilio WhatsApp**: [twilio.com/whatsapp](https://www.twilio.com/whatsapp)
- **Home Assistant**: [home-assistant.io/docs](https://www.home-assistant.io/docs/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Railway Support**: [railway.app/help](https://railway.app/help)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---

## 🎯 Next: Hospitable Integration (Phase 2)

Once all integrations are working:
1. Set up webhook in Hospitable to your backend
2. Configure n8n workflow for booking automation
3. Add custom domain for professional URLs
4. Enable Sentry for error monitoring
5. Set up backup/restore procedures
