# 🏠 Alcova Smart Check-in

**Automated check-in system for Alcova Landolina apartments**

Complete end-to-end automation from booking to checkout: automatic code generation, guest notifications via WhatsApp/SMS, personalized guest portal, and Ring Intercom integration.

---

## 🎯 Features

### Guest Experience
- ✅ **Automatic Code Generation**: Creates temporary codes for 3 locks (2x Tuya + Ring)
- ✅ **Multi-Channel Notifications**: WhatsApp, SMS, and Email
- ✅ **Guest Portal**: Personalized portal with access codes, WiFi, map, and house rules
- ✅ **Ring Intercom Integration**: Open main door remotely via Home Assistant
- ✅ **Multi-Language**: Italian and English support

### Admin Dashboard (Xentra-inspired)
- ✅ **Real-time Analytics**: KPIs, trends, and usage charts
- ✅ **Booking Management**: Search, filter, view all bookings
- ✅ **Integration Monitoring**: Ring, Tuya, Home Assistant status
- ✅ **Device Management**: Battery levels, connectivity, health checks
- ✅ **Activity Log**: Complete timeline of all events
- ✅ **Access Link Generation**: Temporary codes for maintenance/cleaners

### Automation
- ✅ **Auto-Revoke**: Scheduled job to revoke expired codes
- ✅ **Telegram Alerts**: Real-time notifications for admins
- ✅ **Audit Logging**: Complete activity tracking
- ✅ **Webhook Integration**: Hospitable sync

---

## 📁 Project Structure

```
alcova-smart-checkin/
├── backend/              # FastAPI REST API
├── frontend/             # Next.js Guest Portal
├── database/             # Supabase SQL schemas
├── docs/                 # Documentation
├── MASTERPLAN.md         # Complete project plan
└── README.md             # This file
```

---

## 🚀 Quick Start

### ⚡ **Fast Deploy (Recommended)**

**Deploy in 5 minutes without local setup!**

1. **Backend** → Railway (already deployed)
2. **Frontend** → Vercel (follow [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md))
3. **Database** → Supabase

👉 **See detailed instructions**: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

---

### 💻 **Local Development**

#### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Supabase account** (free tier works)
- **Tuya Developer account** with smart locks configured
- **Twilio account** for WhatsApp/SMS
- **Telegram Bot**
- **Home Assistant** (for Ring Intercom)

#### 1. Clone Repository

```bash
git clone <your-repo-url>
cd alcova-smart-checkin
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema:

```bash
# Copy the SQL from database/schema.sql
# Paste it in Supabase SQL Editor and execute
```

3. Note down your:
   - Project URL
   - Anon key
   - Service key

### 3. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run database migrations (if needed)
# The schema is already in Supabase

# Start development server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 5. Setup n8n (Optional but Recommended)

1. Install n8n: `npm install -g n8n`
2. Start: `n8n start`
3. Import workflows from `n8n/` folder
4. Configure webhook URL in Hospitable

---

## 🔧 Configuration

### Required API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create project → Settings → API
3. Copy URL, anon key, service key

#### Tuya Developer
1. Register at [iot.tuya.com](https://iot.tuya.com)
2. Create Cloud Project
3. Enable "Smart Home Basic Service"
4. Link your smart locks
5. Note device IDs from Devices section

#### Twilio
1. Sign up at [twilio.com](https://twilio.com)
2. Get phone number
3. Enable WhatsApp sandbox for testing
4. Copy Account SID and Auth Token

#### Telegram Bot
1. Open Telegram, search @BotFather
2. Send `/newbot` and follow instructions
3. Copy bot token
4. Start chat with your bot
5. Use [@userinfobot](https://t.me/userinfobot) to get your chat_id

#### Home Assistant
1. Settings → Users → Create Long-Lived Token
2. Find Ring Intercom entity_id in Settings → Devices
3. Add both to .env

### Environment Variables

See `.env.example` for complete list. Key variables:

```bash
# Backend
SUPABASE_URL=https://xxxxx.supabase.co
TUYA_CLIENT_ID=your_client_id
TWILIO_ACCOUNT_SID=ACxxxxx
TELEGRAM_BOT_TOKEN=123456:ABCdef
HOME_ASSISTANT_URL=http://homeassistant.local:8123
JWT_SECRET=random-32-char-secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
JWT_SECRET=same-as-backend
```

---

## 📡 API Endpoints

### Bookings

- `POST /api/bookings/create` - Create new booking with codes
- `POST /api/bookings/{id}/cancel` - Cancel booking and revoke codes
- `GET /api/bookings/{id}` - Get booking details

### Guest Portal

- `GET /api/guests/{token}` - Get guest portal data (JWT protected)

### Access Codes

- `POST /api/codes/{id}/revoke` - Manually revoke a code
- `POST /api/codes/revoke-all` - Trigger auto-revoke job

### Intercom

- `POST /api/intercom/open` - Open Ring Intercom via Home Assistant

### Webhooks

- `POST /webhooks/hospitable` - Receive Hospitable webhooks

Full API documentation: `http://localhost:8000/docs`

---

## 🧪 Testing

### Test Booking Creation

```bash
curl -X POST http://localhost:8000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "hospitable_id": "TEST123",
    "guest_name": "Mario Rossi",
    "guest_email": "test@example.com",
    "guest_phone": "+393331234567",
    "guest_language": "it",
    "checkin_date": "2025-11-20T15:00:00Z",
    "checkout_date": "2025-11-22T11:00:00Z",
    "property_id": "alcova_landolina_fi"
  }'
```

This will:
1. Create booking in database
2. Generate 3 access codes
3. Create codes on Tuya locks
4. Send WhatsApp to guest
5. Notify admin via Telegram
6. Return JWT token for guest portal

### Test Guest Portal

1. Copy the `guest_token` from booking response
2. Visit: `http://localhost:3000/g/{token}?lang=it`
3. Verify codes are displayed
4. Test Ring Intercom button

### Run Unit Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

---

## 🚀 Deployment

### Backend → Railway.app

```bash
cd backend

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
# Copy from .env

# Get deployment URL
railway domain
```

### Frontend → Vercel

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard

# Deploy to production
vercel --prod
```

Update `FRONTEND_URL` in backend .env to match Vercel URL.

---

## 🔄 Workflow: New Booking

1. **Guest books** on Airbnb/Hospitable
2. **Hospitable sends webhook** to n8n
3. **n8n calls** FastAPI `/bookings/create`
4. **Backend:**
   - Creates booking in Supabase
   - Generates 3 random PIN codes
   - Creates temporary passwords on Tuya locks
   - Generates JWT token
   - Sends WhatsApp to guest with codes + portal link
   - Notifies admin via Telegram
5. **Guest receives WhatsApp** with:
   - Access codes for 3 doors
   - Link to personalized portal
6. **Guest opens portal**:
   - Views codes with validity
   - Sees map, WiFi, house rules
   - Can open Ring Intercom remotely
7. **At checkout**, scheduler automatically revokes codes

---

## 📅 Automated Tasks

### Daily Auto-Revoke (2 PM)

- Checks for expired codes
- Deletes from Tuya locks
- Updates database status
- Changes booking status to "checked_out"
- Sends daily report to admin

### Manual Trigger

```bash
curl -X POST http://localhost:8000/api/codes/revoke-all
```

---

## 🛠️ Development

### Backend Development

```bash
cd backend

# Activate venv
source venv/bin/activate

# Install dev dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Format code
black .

# Lint
ruff check .

# Type checking
mypy .
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

---

## 📊 Monitoring

### Logs

- **Backend**: Stdout/stderr (capture with Railway logs)
- **Frontend**: Vercel logs
- **Database**: Supabase dashboard
- **Notifications**: Telegram admin chat

### Health Check

```bash
curl http://localhost:8000/health
```

### Supabase Dashboard

- View bookings, codes, notifications
- Check audit logs
- Monitor database performance

---

## 🐛 Troubleshooting

### Codes not created on Tuya

- Check `TUYA_CLIENT_ID` and `TUYA_SECRET`
- Verify device IDs in .env match Tuya dashboard
- Check Tuya API region (eu, us, cn)
- Look for errors in backend logs

### WhatsApp not sending

- Verify Twilio credentials
- Check phone number format (E.164: +393331234567)
- Ensure WhatsApp sandbox is approved (production) or configured (dev)
- Check Twilio logs dashboard

### Guest portal not loading

- Verify JWT_SECRET matches between backend and frontend
- Check token hasn't expired
- Ensure CORS is configured correctly
- Check browser console for errors

### Ring Intercom not opening

- Test Home Assistant is reachable from backend
- Verify `HOME_ASSISTANT_TOKEN` is valid
- Check `RING_BUTTON_ENTITY_ID` exists in HA
- Look for 502 errors in API response

---

## 📚 Documentation

- **[MASTERPLAN.md](./MASTERPLAN.md)** - Complete project plan and architecture
- **[database/schema.sql](./database/schema.sql)** - Database schema
- **[API Docs](http://localhost:8000/docs)** - Interactive API documentation

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

---

## 📄 License

Private project for Alcova Landolina.

---

## 📞 Support

For issues or questions:

- **Email**: crocellasalvo@gmail.com
- **Project**: See MASTERPLAN.md for detailed architecture

---

## 🎯 Next Steps

### Phase 2 Features (Future)

- [ ] Admin dashboard (React + Supabase Auth)
- [ ] Multi-property support (Firenze, Torino, etc.)
- [ ] Home Assistant climate control (auto-off after checkout)
- [ ] Google Calendar sync for cleaning schedule
- [ ] Analytics dashboard
- [ ] Review automation post-checkout
- [ ] Custom email templates

See **MASTERPLAN.md** for complete roadmap.

---

**Built with ❤️ for Alcova Landolina**

*Version 1.0.0 - November 2025*
