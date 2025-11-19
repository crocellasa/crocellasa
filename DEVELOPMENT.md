# 🚀 Development Guide - Alcova Smart Check-in

**Last Updated:** November 19, 2025
**Version:** 1.1.0
**Status:** 🟢 Active Development

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Progress Summary](#progress-summary)
3. [Current Architecture](#current-architecture)
4. [Development Environment Setup](#development-environment-setup)
5. [Deployment Guide](#deployment-guide)
6. [Railway Deployment Fix](#railway-deployment-fix)
7. [Future Development Tasks](#future-development-tasks)
8. [Code Structure & Conventions](#code-structure--conventions)
9. [Testing Strategy](#testing-strategy)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Alcova Smart Check-in** is an automated guest check-in system for Alcova Landolina apartments. It provides:

- **Automated code generation** for 3 smart locks (Tuya-based)
- **Multi-channel notifications** (WhatsApp, SMS, Email, Telegram)
- **Guest portal** with access codes, property info, and Ring Intercom control
- **Admin dashboard** for monitoring bookings, integrations, and analytics
- **Integration with Smoobu** property management system

---

## 📊 Progress Summary

### ✅ Completed Features (as of Nov 19, 2025)

#### Backend (FastAPI)
- ✅ Core API structure with FastAPI
- ✅ Supabase database integration
- ✅ Tuya smart lock service (code generation & revocation)
- ✅ Code generator service (6-digit PIN codes)
- ✅ Notification service (WhatsApp via Twilio, Telegram, Email)
- ✅ JWT token service for guest portal authentication
- ✅ Scheduler service for automatic code revocation
- ✅ Ring Intercom integration via Home Assistant
- ✅ Admin authentication with bcrypt password hashing
- ✅ Webhook endpoint for Smoobu integration
- ✅ Admin API endpoints (dashboard, bookings, integrations, locations, activity)

#### Frontend (Next.js 14)
- ✅ Guest portal (`/g/[token]`) with:
  - Access codes display for 3 doors
  - Property information and map
  - WiFi credentials with QR code
  - House rules (IT/EN)
  - Ring Intercom button
  - Multilingual support (IT/EN)
- ✅ Admin dashboard (`/admin`) with:
  - KPI cards (bookings, active codes, revenue, occupancy)
  - Analytics charts (bookings over time, occupancy rates)
  - Recent activity timeline
  - Integration status monitoring
  - Booking management
  - Location/device management
  - Access link generation
  - Activity logs

#### Database (Supabase/PostgreSQL)
- ✅ Complete schema with tables:
  - `bookings` - Guest reservations
  - `access_codes` - Temporary lock codes
  - `locks` - Smart lock configuration
  - `notifications` - Communication logs
  - `audit_logs` - System activity tracking
  - `admin_users` - Admin authentication
  - `properties` - Multi-property support

#### Integrations
- ✅ **Smoobu** - Property management system (migrated from Hospitable)
- ✅ **Tuya Cloud API** - Smart lock control
- ✅ **Twilio** - WhatsApp and SMS notifications
- ✅ **Telegram Bot** - Admin alerts
- ✅ **Home Assistant** - Ring Intercom control
- ✅ **Supabase** - Database and authentication

### 🚧 In Progress

- 🔄 Railway deployment configuration (see [Railway Deployment Fix](#railway-deployment-fix))
- 🔄 Production environment testing
- 🔄 End-to-end testing with real bookings

### 📝 Recent Changes (Git Log)

```
3a67205 Fix: Ensure proper line separation for smoobu_id and confirmation_code
528bbef Fix: Properly separate smoobu_id and confirmation_code declarations
b40173a fix: Separate smoobu_id and confirmation_code into two lines
572dad6 fix: Correct Field parameter order in smoobu_id definition
8338326 fix: Correct Field syntax in smoobu_id declaration
6409e69 fix: Make smoobu_id optional for backwards compatibility
b869df3 feat: Migrate from Hospitable to Smoobu integration
44be0dd Add python-telegram-bot to requirements
ed0454a Update httpx in requirements.txt
4796317 Modify httpx version in requirements.txt
```

**Key Migration:** The system has been migrated from **Hospitable** to **Smoobu** for property management integration.

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SMOOBU (Property Manager)                │
│                     Webhook Endpoint                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ POST /webhooks/smoobu
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND FASTAPI (Railway.app)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ API ENDPOINTS                                        │   │
│  │ • POST /api/bookings/create                         │   │
│  │ • POST /api/bookings/{id}/cancel                    │   │
│  │ • GET  /api/guests/{token}                          │   │
│  │ • POST /api/intercom/open                           │   │
│  │ • POST /api/codes/revoke                            │   │
│  │ • GET  /api/admin/dashboard                         │   │
│  │ • GET  /api/admin/bookings                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ SERVICES                                             │   │
│  │ • TuyaService: 3 smart locks management             │   │
│  │ • CodeGenerator: 6-digit PIN generation             │   │
│  │ • NotificationService: WhatsApp/SMS/Email           │   │
│  │ • TokenService: JWT for guest portal                │   │
│  │ • SchedulerService: Auto-revoke codes               │   │
│  │ • HomeAssistantService: Ring Intercom               │   │
│  └──────────────────────────────────────────────────────┘   │
└───┬────────┬────────┬────────┬────────┬──────────┬──────────┘
    │        │        │        │        │          │
    ▼        ▼        ▼        ▼        ▼          ▼
┌────────┐ ┌────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐
│Supabase│ │Tuya│ │Twilio│ │Home  │ │Telegram│ │SMTP  │
│   DB   │ │API │ │  API │ │Assist│ │  Bot   │ │Email │
└────────┘ └────┘ └──────┘ └──────┘ └────────┘ └──────┘
    ▲
    │ Read/Write data
    │
┌───┴────────────────────────────────────────────────────────┐
│           FRONTEND (Next.js 14 - Vercel)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GUEST PORTAL (/g/[token])                           │   │
│  │ • Access codes (3 doors)                            │   │
│  │ • Property info + map                               │   │
│  │ • WiFi + QR code                                    │   │
│  │ • Ring Intercom button                              │   │
│  │ • House rules (IT/EN)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ADMIN DASHBOARD (/admin)                            │   │
│  │ • KPIs & analytics                                  │   │
│  │ • Booking management                                │   │
│  │ • Integration monitoring                            │   │
│  │ • Activity logs                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

---

## 💻 Development Environment Setup

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Supabase account** (free tier)
- **Tuya Developer account**
- **Twilio account**
- **Telegram Bot**
- **Home Assistant** (optional, for Ring Intercom)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd crocellasa
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see .env.example for all variables)

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

### 3. Frontend Setup

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

### 4. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the schema from `database/schema.sql`
4. Note your Project URL and API keys
5. Update `.env` files with Supabase credentials

---

## 🚀 Deployment Guide

### Backend → Railway.app

#### Option 1: Deploy Backend Directory Only (Recommended)

Railway's Railpack had issues detecting the build process because the repository has a monorepo structure. The solution is to deploy only the backend directory.

**Steps:**

1. **Login to Railway**
   ```bash
   cd backend
   railway login
   ```

2. **Initialize project**
   ```bash
   railway init
   ```

3. **Link to existing project or create new**
   ```bash
   railway link
   # or
   railway init
   ```

4. **Deploy backend**
   ```bash
   railway up
   ```

5. **Set environment variables**
   - Go to Railway dashboard
   - Click on your project
   - Go to "Variables" tab
   - Add all variables from `backend/.env`

6. **Get deployment URL**
   ```bash
   railway domain
   ```

#### Option 2: Add Railway Configuration Files

Create `railway.json` in the **root directory**:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Or create a `Procfile` in the **root directory**:

```
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Or create `start.sh` in the **root directory**:

```bash
#!/bin/bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Make it executable:
```bash
chmod +x start.sh
```

#### Option 3: Use Dockerfile

The backend already has a `Dockerfile`. Railway can use it:

1. Go to Railway dashboard
2. Settings → Build
3. Set "Builder" to "Docker"
4. Set "Docker Context" to "backend"
5. Redeploy

### Frontend → Vercel

See detailed instructions in [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

**Quick steps:**

```bash
cd frontend
vercel login
vercel
# Follow prompts
vercel --prod
```

Don't forget to set environment variables in Vercel dashboard!

---

## 🔧 Railway Deployment Fix

### The Problem

Railway's Railpack encountered this error:

```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

**Root cause:** The repository has a monorepo structure with `backend/`, `frontend/`, and `database/` directories. Railway couldn't determine which one to deploy or how to start it.

### The Solution

Choose one of these approaches:

#### ✅ Solution 1: Deploy Backend Directory Only (Easiest)

```bash
cd backend
railway login
railway init
railway up
```

This tells Railway to only look at the backend directory.

#### ✅ Solution 2: Add railway.json

Create `/railway.json` in the root:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### ✅ Solution 3: Add Procfile

Create `/Procfile`:

```
web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### ✅ Solution 4: Add start.sh

Create `/start.sh`:

```bash
#!/bin/bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Make executable and commit:
```bash
chmod +x start.sh
git add start.sh
git commit -m "Add start.sh for Railway deployment"
```

#### ✅ Solution 5: Use Docker

Railway dashboard → Settings → Builder → "Docker"

Set "Root Directory" to `backend` or ensure Dockerfile is in root.

### Recommended Approach

**Use Solution 1 (deploy backend directory only)** for simplicity, or **Solution 2 (railway.json)** for more control.

---

## 📝 Future Development Tasks

### High Priority

- [ ] **Production Testing**
  - [ ] Test end-to-end booking flow with real Smoobu webhook
  - [ ] Verify Tuya code generation/revocation on real locks
  - [ ] Test WhatsApp delivery to actual guest phone numbers
  - [ ] Verify Ring Intercom integration
  - [ ] Test scheduler job for auto-revoke

- [ ] **Monitoring & Alerts**
  - [ ] Set up error monitoring (Sentry recommended)
  - [ ] Configure uptime monitoring (UptimeRobot/Better Uptime)
  - [ ] Add Telegram alerts for critical failures
  - [ ] Set up log aggregation (Logtail/Papertrail)

- [ ] **Security Hardening**
  - [ ] Add rate limiting to API endpoints
  - [ ] Implement API key authentication for webhooks
  - [ ] Add CORS configuration for production
  - [ ] Set up SSL/TLS certificates
  - [ ] Audit admin authentication flow

### Medium Priority

- [ ] **Enhanced Features**
  - [ ] Add email fallback for guests without WhatsApp
  - [ ] Implement cleaning schedule integration (Google Calendar)
  - [ ] Add guest check-in confirmation workflow
  - [ ] Create custom email templates
  - [ ] Add support for multiple properties (Firenze, Torino)

- [ ] **Admin Dashboard Improvements**
  - [ ] Add export functionality (CSV/PDF reports)
  - [ ] Implement advanced filtering and search
  - [ ] Add bulk actions for bookings
  - [ ] Create maintenance mode toggle
  - [ ] Add system health dashboard

- [ ] **Testing & Quality**
  - [ ] Write unit tests for services (`pytest`)
  - [ ] Add integration tests for API endpoints
  - [ ] Set up CI/CD pipeline (GitHub Actions)
  - [ ] Add end-to-end tests for guest portal
  - [ ] Implement API contract testing

### Low Priority / Future Enhancements

- [ ] **Advanced Automation**
  - [ ] Climate control automation (turn off heating/AC after checkout)
  - [ ] Auto-generate cleaning tasks
  - [ ] Smart home integration (lights, blinds)
  - [ ] Automated review request emails

- [ ] **Analytics & Reporting**
  - [ ] Guest behavior analytics
  - [ ] Revenue forecasting
  - [ ] Occupancy optimization suggestions
  - [ ] Integration usage statistics

- [ ] **Mobile App**
  - [ ] Native iOS/Android app for guests
  - [ ] Admin mobile app for on-the-go management
  - [ ] Push notifications

---

## 📂 Code Structure & Conventions

### Backend Structure

```
backend/
├── app/
│   ├── api/               # API route handlers
│   │   ├── admin_*.py     # Admin endpoints
│   │   ├── bookings.py    # Booking management
│   │   ├── codes.py       # Code management
│   │   ├── guests.py      # Guest portal data
│   │   ├── intercom.py    # Ring Intercom control
│   │   └── webhooks.py    # External webhooks (Smoobu)
│   │
│   ├── core/              # Core configuration
│   │   ├── config.py      # Environment settings
│   │   ├── database.py    # Supabase client
│   │   ├── security.py    # JWT, encryption
│   │   └── admin_auth.py  # Admin authentication
│   │
│   ├── models/            # Pydantic models
│   │   ├── booking.py     # Booking schemas
│   │   └── admin.py       # Admin schemas
│   │
│   ├── services/          # Business logic
│   │   ├── code_generator.py      # PIN generation
│   │   ├── tuya_service.py        # Smart locks
│   │   ├── notification_service.py # Messaging
│   │   ├── home_assistant_service.py # Ring
│   │   ├── ring_service.py        # Ring (legacy)
│   │   └── scheduler.py           # Scheduled jobs
│   │
│   └── main.py            # FastAPI app entry point
│
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── .env.example          # Environment template
```

### Frontend Structure

```
frontend/
├── app/
│   ├── g/[token]/         # Guest portal
│   │   └── page.tsx
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard home
│   │   ├── bookings/      # Booking management
│   │   ├── locations/     # Device management
│   │   ├── integrations/  # Integration status
│   │   ├── activity/      # Activity logs
│   │   └── login/         # Admin login
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/
│   ├── AccessCodes.tsx    # Code display
│   ├── PropertyInfo.tsx   # Location info
│   ├── IntercomButton.tsx # Ring control
│   ├── GuestHeader.tsx    # Portal header
│   ├── HouseRules.tsx     # Rules display
│   └── admin/             # Admin components
│       ├── AdminHeader.tsx
│       ├── AdminSidebar.tsx
│       ├── KPICard.tsx
│       ├── AnalyticsChart.tsx
│       └── ...
│
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── jwt.ts             # Token utilities
│
├── messages/              # i18n translations
│   ├── it.json
│   └── en.json
│
└── package.json
```

### Coding Conventions

#### Backend (Python)

- **Style:** Follow PEP 8
- **Formatting:** Use `black` for auto-formatting
- **Type hints:** Always use type hints for function parameters and returns
- **Docstrings:** Use docstrings for all public functions/classes
- **Error handling:** Use custom exceptions, log errors properly
- **Async:** Use `async/await` for I/O operations

Example:
```python
async def create_booking(booking_data: BookingCreate) -> BookingResponse:
    """
    Create a new booking and generate access codes.

    Args:
        booking_data: Validated booking information

    Returns:
        BookingResponse with generated codes and guest token

    Raises:
        BookingError: If booking creation fails
    """
    try:
        # Implementation
        pass
    except Exception as e:
        logger.error(f"Failed to create booking: {e}")
        raise BookingError(str(e))
```

#### Frontend (TypeScript/React)

- **Style:** Follow ESLint configuration
- **Components:** Use functional components with hooks
- **TypeScript:** Always use proper types, avoid `any`
- **File naming:** PascalCase for components, camelCase for utilities
- **State management:** Use React hooks (useState, useEffect)
- **API calls:** Use try/catch, handle loading and error states

Example:
```typescript
interface GuestData {
  name: string;
  codes: AccessCode[];
}

export default function GuestPortal({ token }: { token: string }) {
  const [data, setData] = useState<GuestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/guests/${token}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load guest data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // Component render
}
```

---

## 🧪 Testing Strategy

### Backend Testing

```bash
cd backend

# Install test dependencies (uncomment in requirements.txt)
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_code_generator.py

# Run with verbose output
pytest -v
```

**Test structure:**
```
backend/tests/
├── test_api/
│   ├── test_bookings.py
│   ├── test_guests.py
│   └── test_admin.py
├── test_services/
│   ├── test_code_generator.py
│   ├── test_tuya_service.py
│   └── test_notification_service.py
└── conftest.py  # Fixtures
```

### Frontend Testing

```bash
cd frontend

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

### Integration Testing

Use `curl` or Postman to test API endpoints:

```bash
# Test health check
curl http://localhost:8000/health

# Test booking creation
curl -X POST http://localhost:8000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "smoobu_id": "TEST123",
    "guest_name": "Mario Rossi",
    "guest_email": "test@example.com",
    "guest_phone": "+393331234567",
    "guest_language": "it",
    "checkin_date": "2025-11-20T15:00:00Z",
    "checkout_date": "2025-11-22T11:00:00Z",
    "property_id": "alcova_landolina_fi"
  }'
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### Database connection fails

**Error:** `Connection refused` or `Invalid API key`

**Solution:**
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Verify Supabase project is active
- Check if IP is allowed in Supabase settings

#### Tuya API errors

**Error:** `Tuya API authentication failed`

**Solution:**
- Verify `TUYA_CLIENT_ID` and `TUYA_SECRET`
- Check Tuya region is correct (eu/us/cn)
- Ensure devices are linked in Tuya IoT Platform
- Verify API permissions are enabled

#### WhatsApp not sending

**Error:** `Twilio error 21211` or messages not delivered

**Solution:**
- Check phone number format (E.164: `+393331234567`)
- Verify Twilio credentials in `.env`
- For production, WhatsApp sender must be approved
- For testing, use Twilio sandbox

#### Frontend build fails

**Error:** `Module not found` or TypeScript errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

#### JWT token invalid

**Error:** `Invalid token` or `Token expired`

**Solution:**
- Ensure `JWT_SECRET` is the same in backend and frontend
- Check token hasn't expired (default: 30 days)
- Verify token is passed correctly in Authorization header

### Getting Help

1. Check the documentation: README.md, MASTERPLAN.md, SETUP_GUIDE.md
2. Review API docs: `http://localhost:8000/docs`
3. Check logs:
   - Backend: stdout/stderr in terminal
   - Railway: `railway logs`
   - Vercel: Dashboard → Logs
4. Contact: crocellasalvo@gmail.com

---

## 📞 Support & Resources

### Documentation

- **[README.md](./README.md)** - Quick start guide
- **[MASTERPLAN.md](./MASTERPLAN.md)** - Complete project plan
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** - Frontend deployment
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Fast deployment overview

### API Documentation

- Backend API: `http://localhost:8000/docs` (Swagger UI)
- Alternative: `http://localhost:8000/redoc` (ReDoc)

### External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tuya Developer Docs](https://developer.tuya.com)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Backend development
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend development
cd frontend && npm run dev

# Deploy backend to Railway
cd backend && railway up

# Deploy frontend to Vercel
cd frontend && vercel --prod

# Run tests
cd backend && pytest
cd frontend && npm test

# Check logs
railway logs
vercel logs
```

### Environment Variables Checklist

Backend `.env`:
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_KEY
- [ ] TUYA_CLIENT_ID
- [ ] TUYA_SECRET
- [ ] TUYA_DEVICE_* (3 devices)
- [ ] TWILIO_ACCOUNT_SID
- [ ] TWILIO_AUTH_TOKEN
- [ ] TELEGRAM_BOT_TOKEN
- [ ] HOME_ASSISTANT_URL
- [ ] HOME_ASSISTANT_TOKEN
- [ ] JWT_SECRET
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD

Frontend `.env.local`:
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] JWT_SECRET

---

**Built with ❤️ for Alcova Landolina**

*Last updated: November 19, 2025*
