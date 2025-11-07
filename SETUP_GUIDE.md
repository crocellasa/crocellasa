# 🚀 Setup Guide - Prossimi Passi

## ✅ Cosa abbiamo creato

Hai ora una struttura completa del progetto:

1. **Backend FastAPI** (`/backend`)
   - API endpoints completi
   - Integrazione Tuya per smart locks
   - Servizio notifiche (WhatsApp/SMS/Telegram)
   - Scheduler per auto-revoke
   - Integrazione Home Assistant (Ring Intercom)

2. **Frontend Next.js** (`/frontend`)
   - Guest portal personalizzato
   - Multi-lingua (IT/EN)
   - Design responsive con Tailwind
   - Componenti React modulari

3. **Database Schema** (`/database`)
   - Schema PostgreSQL completo
   - Funzioni e trigger
   - Row Level Security
   - Seed data per testing

4. **Documentazione**
   - MASTERPLAN.md completo
   - README.md con istruzioni setup
   - .env.example con tutte le variabili

---

## 🎯 Prossimi Step - Ordine Consigliato

### Step 1: Setup Supabase (15 minuti)

```bash
# 1. Vai su supabase.com e crea progetto
# 2. Copia database/schema.sql
# 3. Incolla nel SQL Editor di Supabase
# 4. Esegui lo script
# 5. Annota URL, anon_key, service_key
```

### Step 2: Configura Tuya Developer (20 minuti)

```bash
# 1. Registrati su iot.tuya.com
# 2. Crea Cloud Project
# 3. Abilita "Smart Home Basic Service"
# 4. Collega le tue serrature smart
# 5. Annota:
#    - Client ID
#    - Secret
#    - Device ID di ogni serratura (3 totali)
```

### Step 3: Setup Twilio (10 minuti)

```bash
# 1. Registrati su twilio.com
# 2. Acquista numero telefono
# 3. Configura WhatsApp sandbox per test
# 4. Annota:
#    - Account SID
#    - Auth Token
#    - WhatsApp From number
```

### Step 4: Setup Telegram Bot (5 minuti)

```bash
# 1. Apri Telegram
# 2. Cerca @BotFather
# 3. /newbot
# 4. Segui le istruzioni
# 5. Salva il token
# 6. Avvia chat col bot e invia /start
# 7. Usa @userinfobot per trovare il tuo chat_id
```

### Step 5: Configura Backend (10 minuti)

```bash
cd backend

# Crea virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installa dipendenze
pip install -r requirements.txt

# Configura .env
cp .env.example .env
# Apri .env e inserisci tutte le credenziali

# Test avvio
uvicorn app.main:app --reload
```

Vai su `http://localhost:8000/docs` - dovresti vedere la documentazione API.

### Step 6: Configura Frontend (5 minuti)

```bash
cd frontend

# Installa dipendenze
npm install

# Configura .env
cp .env.example .env.local
# Inserisci API_URL e Supabase credentials

# Test avvio
npm run dev
```

Vai su `http://localhost:3000` - dovresti vedere la landing page.

### Step 7: Test End-to-End (15 minuti)

```bash
# 1. Crea booking di test
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

# 2. Controlla risposta - dovresti ricevere:
#    - booking_id
#    - guest_token
#    - portal_url

# 3. Verifica Supabase
#    - Apri Supabase dashboard
#    - Table: bookings → dovresti vedere il booking
#    - Table: access_codes → dovresti vedere 3 codici

# 4. Verifica Tuya
#    - Apri Tuya Smart app
#    - Controlla le serrature
#    - Dovresti vedere i codici temporanei

# 5. Verifica WhatsApp
#    - Controlla il numero +393331234567
#    - Dovresti ricevere messaggio con codici

# 6. Verifica Telegram
#    - Controlla la chat del bot
#    - Dovresti ricevere notifica admin

# 7. Test Guest Portal
#    - Copia il guest_token dalla risposta
#    - Vai su http://localhost:3000/g/{token}?lang=it
#    - Dovresti vedere tutti i codici e info
```

### Step 8: Setup n8n (Opzionale ma consigliato) (30 minuti)

```bash
# 1. Installa n8n
npm install -g n8n

# 2. Avvia n8n
n8n start

# 3. Vai su http://localhost:5678

# 4. Crea workflow "New Booking":
#    - Webhook Trigger (POST)
#    - HTTP Request → Backend /bookings/create
#    - Telegram → Notify admin

# 5. Copia webhook URL

# 6. Configura in Hospitable:
#    Settings → Webhooks → Add webhook
#    URL: {n8n_webhook_url}
#    Events: booking.created
```

### Step 9: Setup Home Assistant + Ring (Varia)

```bash
# Se hai già Home Assistant:

# 1. Integra Ring Intercom
#    - Settings → Devices → Add Integration
#    - Cerca "Ring"
#    - Segui setup

# 2. Trova entity_id
#    - Settings → Devices → Ring Intercom
#    - Cerca button.ring_*_unlock
#    - Copia entity_id

# 3. Crea Long-Lived Token
#    - Settings → Users → Click sul tuo utente
#    - Long-Lived Access Tokens → Create Token
#    - Copia e salva

# 4. Aggiungi a backend/.env:
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN={token}
RING_BUTTON_ENTITY_ID={entity_id}

# 5. Test apertura
curl -X POST http://localhost:8000/api/intercom/open
```

### Step 10: Deploy Production (1 ora)

#### Backend → Railway

```bash
cd backend

# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crea progetto
railway init

# Deploy
railway up

# Configura env variables
# Vai su railway.app dashboard
# Copia tutte le variabili da .env

# Ottieni URL
railway domain
# Annotalo per usarlo nel frontend
```

#### Frontend → Vercel

```bash
cd frontend

# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configura env variables
# Vai su vercel.com dashboard
# Aggiungi NEXT_PUBLIC_API_URL (Railway URL)

# Deploy production
vercel --prod
```

---

## ⚠️ Note Importanti

### Tuya Lock IDs

Devi trovare i Device ID reali nel database Supabase:

```sql
-- Aggiorna con i tuoi device ID reali
UPDATE locks
SET device_id = 'bf...'
WHERE lock_type = 'main_entrance';

UPDATE locks
SET device_id = 'bf...'
WHERE lock_type = 'floor_door';

UPDATE locks
SET device_id = 'bf...'
WHERE lock_type = 'apartment_door';
```

### Property Info

Aggiorna le informazioni della proprietà:

```sql
UPDATE properties
SET
  address = 'Via Landolina 12, Firenze',
  latitude = 43.7696,
  longitude = 11.2558,
  wifi_ssid = 'Alcova_WiFi',
  wifi_password = 'your_wifi_password',
  checkin_instructions_it = 'Istruzioni in italiano...',
  checkin_instructions_en = 'Instructions in English...'
WHERE id = 'alcova_landolina_fi';
```

### Testing Checklist

Prima di andare in produzione:

- [ ] Booking creato con successo
- [ ] Codici generati su Tuya
- [ ] WhatsApp/SMS inviato
- [ ] Telegram notifica ricevuta
- [ ] Guest portal accessibile
- [ ] Ring Intercom funzionante
- [ ] Auto-revoke testato (modifica checkout date)
- [ ] Multi-lingua IT/EN funziona
- [ ] Mobile responsive verificato

---

## 🆘 Problemi Comuni

### "Tuya API error: Invalid client_id"

- Verifica Client ID e Secret in .env
- Controlla che il progetto Cloud sia attivo
- Verifica che "Smart Home Basic Service" sia abilitato

### "WhatsApp not sending"

- Per testing usa Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
- Devi "opt-in" mandando messaggio specifico al numero Twilio
- In produzione serve WhatsApp Business API (richiesta approval)

### "JWT expired"

- Verifica che JWT_SECRET sia lo stesso in backend e frontend
- Controlla che il token non sia scaduto (default: 30 giorni dopo checkout)

### "Ring Intercom not found"

- Verifica Home Assistant raggiungibile da backend
- Controlla entity_id esatto (deve esistere in HA)
- Test: `curl http://homeassistant.local:8123/api/ -H "Authorization: Bearer {token}"`

---

## 📞 Supporto

Se hai problemi:

1. Controlla i log del backend: `tail -f backend/logs/*.log`
2. Controlla Supabase dashboard → Logs
3. Verifica .env ha tutte le variabili
4. Consulta MASTERPLAN.md per architettura completa

Buon lavoro! 🚀
