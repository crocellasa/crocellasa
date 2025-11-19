# 🚂 Railway Environment Variables Setup Guide

This guide helps you configure all required environment variables in Railway for the Alcova Smart Check-in backend.

---

## 🎯 Quick Setup Steps

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Select your project** (Alcova backend)
3. **Click "Variables" tab**
4. **Copy-paste the variables below** (use your actual values)

---

## 📋 Required Environment Variables

### Core Application Settings

```bash
APP_ENV=production
APP_NAME=Alcova Smart Check-in
SECRET_KEY=your-random-secret-key-min-32-chars-here
JWT_SECRET=your-jwt-secret-key-min-32-chars-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=720
```

**How to generate secrets:**
```bash
# Generate random secrets
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### Supabase (Database)

Get these from: https://supabase.com → Your Project → Settings → API

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Tuya Smart Locks

Get these from: https://iot.tuya.com → Cloud → Your Project

```bash
TUYA_CLIENT_ID=your_tuya_access_id
TUYA_SECRET=your_tuya_access_secret
TUYA_REGION=eu
TUYA_DEVICE_MAIN_ENTRANCE=bf...device_id_1
TUYA_DEVICE_FLOOR_DOOR=bf...device_id_2
TUYA_DEVICE_APARTMENT=bf...device_id_3
```

**Find device IDs:**
1. Go to Tuya IoT Platform → Devices
2. Click on each device
3. Copy the "Device ID"

---

### Twilio (WhatsApp & SMS)

Get these from: https://console.twilio.com

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SMS_FROM=+1234567890
```

**WhatsApp Sender:**
- For testing: Use Twilio Sandbox number (`whatsapp:+14155238886`)
- For production: Get approved WhatsApp Business sender

---

### Telegram Bot

Get these from: Telegram @BotFather

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=123456789
```

**How to get chat ID:**
1. Start chat with your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}`

---

### Home Assistant (Ring Intercom)

Get these from: Home Assistant → Settings → Users → Long-Lived Access Token

```bash
HOME_ASSISTANT_URL=http://your-home-assistant.local:8123
HOME_ASSISTANT_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
RING_BUTTON_ENTITY_ID=button.ring_intercom_unlock
RING_REFRESH_TOKEN=your_ring_refresh_token
RING_INTERCOM_DEVICE_ID=your_ring_device_id
```

**Find entity ID:**
1. Home Assistant → Settings → Devices & Services
2. Find your Ring device
3. Copy the entity ID (e.g., `button.ring_intercom_unlock`)

---

### Admin Authentication

```bash
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-admin-password
```

**Important:** Use a strong password for production!

---

### CORS & Frontend URL

```bash
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

---

### Optional (SMTP Email Backup)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Alcova Landolina <noreply@alcova.com>
```

---

## 🚀 Bulk Import via CLI

If you have Railway CLI installed:

```bash
# Navigate to backend directory
cd backend

# Login to Railway
railway login

# Link to your project
railway link

# Set all variables from your .env file
# Option 1: Import all at once (Railway reads .env)
railway up

# Option 2: Set individual variables
railway variables set SECRET_KEY="your-value-here"
railway variables set SUPABASE_URL="https://xxxxx.supabase.co"
# ... (repeat for all variables)

# Option 3: Use a script
while IFS='=' read -r key value; do
  [ -z "$key" ] || [[ "$key" == \#* ]] && continue
  railway variables set "$key=$value"
done < .env
```

---

## ✅ Verification Checklist

After setting all variables:

- [ ] All 19+ variables are set in Railway
- [ ] No typos in variable names (case-sensitive!)
- [ ] Values don't have extra spaces or quotes
- [ ] Secrets are properly generated (32+ characters)
- [ ] Supabase keys are from the correct project
- [ ] Tuya device IDs match your actual devices
- [ ] Twilio credentials are for the correct account
- [ ] Telegram bot token is valid
- [ ] Frontend URL matches your Vercel deployment

---

## 🧪 Test Your Deployment

After setting variables, Railway will automatically redeploy. Check:

1. **Railway Logs**: Watch for startup errors
   ```
   railway logs
   ```

2. **Health Check**: Once deployed, test the endpoint
   ```bash
   curl https://your-railway-app.railway.app/health
   ```

3. **API Docs**: Visit your app's Swagger UI
   ```
   https://your-railway-app.railway.app/docs
   ```

---

## 🐛 Common Issues

### Issue: "Field required" errors persist

**Solution:**
- Check variable names match exactly (case-sensitive)
- Ensure no extra spaces in values
- Make sure you clicked "Save" or "Add" in Railway dashboard

### Issue: Supabase connection fails

**Solution:**
- Verify you're using `SUPABASE_SERVICE_KEY` (not anon key)
- Check Supabase URL includes `https://`
- Ensure Supabase project is active (not paused)

### Issue: Tuya API errors

**Solution:**
- Verify Tuya region is correct (eu/us/cn)
- Check device IDs are from "Cloud" tab (not local IDs)
- Ensure Tuya API permissions are enabled

### Issue: Deployment still failing

**Solution:**
1. Check Railway logs: `railway logs --tail 100`
2. Look for specific error messages
3. Verify all required variables are set (not just some)
4. Try redeploying: Railway dashboard → Deployments → Redeploy

---

## 📞 Need Help?

1. **Check Railway logs** for specific errors
2. **Review the error message** - it usually tells you which variable is missing
3. **Compare with `.env.example`** to ensure you have all required variables
4. **Contact support**: crocellasalvo@gmail.com

---

## 🔒 Security Best Practices

- ✅ **Never commit `.env` files** to git
- ✅ **Use strong secrets** (32+ random characters)
- ✅ **Rotate secrets regularly** (every 90 days)
- ✅ **Use production credentials** only in Railway (not test/sandbox keys)
- ✅ **Limit Supabase service key** access (use RLS where possible)
- ✅ **Enable 2FA** on all external services (Twilio, Supabase, etc.)

---

**Last Updated:** November 19, 2025
**Version:** 1.0.0
