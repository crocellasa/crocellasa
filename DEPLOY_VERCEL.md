# 🚀 Deploy Landolina Dashboard su Vercel

Guida completa per deployare la dashboard admin su Vercel in pochi minuti.

---

## 📋 **Prerequisiti**

1. Account Vercel (gratuito): https://vercel.com/signup
2. Backend già deployato su Railway
3. Database Supabase configurato

---

## 🎯 **Step 1: Preparazione**

### Verifica che il backend Railway sia attivo

Vai su Railway e copia l'URL del tuo backend:
- Esempio: `https://your-app-name.up.railway.app`

### Verifica le credenziali Supabase

Vai su Supabase > Settings > API e copia:
- **Project URL**: `https://xxxxx.supabase.co`
- **Anon/Public Key**: `eyJhbGc...`

---

## 🚀 **Step 2: Deploy su Vercel**

### Opzione A: Deploy da GitHub (Consigliato)

1. **Vai su Vercel**: https://vercel.com/new

2. **Import Git Repository**:
   - Clicca "Add New Project"
   - Connetti il tuo account GitHub
   - Seleziona il repository `crocellasa`

3. **Configura il progetto**:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Aggiungi Environment Variables**:

   Clicca su "Environment Variables" e aggiungi:

   ```bash
   # Backend API
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key

   # JWT Secret (stesso del backend)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   ```

5. **Deploy**:
   - Clicca "Deploy"
   - Aspetta 2-3 minuti
   - 🎉 Il tuo sito sarà live su `https://your-project.vercel.app`

---

### Opzione B: Deploy da CLI

1. **Installa Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Aggiungi environment variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add JWT_SECRET
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## ✅ **Step 3: Verifica il Deploy**

1. **Apri l'URL Vercel**: `https://your-project.vercel.app`

2. **Testa le pagine**:
   - Homepage: `/`
   - Admin Dashboard: `/admin`
   - Bookings: `/admin/bookings`
   - Integrations: `/admin/integrations`

3. **Controlla la console del browser** (F12):
   - Verifica che non ci siano errori
   - Le API calls potrebbero fallire (normale, usiamo mock data per ora)

---

## 🔧 **Step 4: Configurazione Post-Deploy**

### Aggiorna CORS sul Backend (Railway)

Aggiungi il dominio Vercel alle variabili d'ambiente Railway:

```bash
CORS_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

### Configura Custom Domain (Opzionale)

1. Vai su Vercel > Settings > Domains
2. Aggiungi il tuo dominio: `admin.landolina.it`
3. Configura DNS come indicato da Vercel

---

## 📊 **URLs Finali**

Dopo il deploy avrai:

- **Frontend (Vercel)**: `https://your-project.vercel.app`
  - Admin Dashboard: `/admin`
  - Guest Portal: `/g/[token]`

- **Backend (Railway)**: `https://your-backend.railway.app`
  - API Docs: `/docs`
  - Webhooks: `/webhooks/hospitable`

- **Database (Supabase)**: `https://xxxxx.supabase.co`
  - Dashboard: `https://app.supabase.com/project/xxxxx`

---

## 🐛 **Troubleshooting**

### Build fallisce su Vercel

**Errore**: `Module not found` o `Type errors`
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla i TypeScript types

```bash
cd frontend
npm install
npm run build  # Testa il build localmente
```

### Pagine bianche dopo deploy

**Problema**: Environment variables mancanti
- Vai su Vercel > Settings > Environment Variables
- Aggiungi tutte le variabili necessarie
- Redeploy: Vercel > Deployments > ... > Redeploy

### API calls falliscono

**Problema**: CORS o URL backend sbagliato
- Verifica `NEXT_PUBLIC_API_URL` su Vercel
- Controlla CORS sul backend Railway
- Apri DevTools (F12) > Network per vedere gli errori

### 404 su /admin

**Problema**: Next.js routing issue
- Verifica che `frontend/app/admin` esista
- Controlla che non ci siano errori di build
- Ricontrolla i logs su Vercel

---

## 🎉 **Deploy Completato!**

Ora puoi:
1. ✅ Accedere alla dashboard da qualsiasi dispositivo
2. ✅ Condividere l'URL con il team
3. ✅ Testare tutte le funzionalità
4. ✅ Ogni push su GitHub farà auto-deploy su Vercel

---

## 🔐 **Prossimi Step (Opzionali)**

1. **Aggiungere autenticazione**:
   - Login page
   - JWT protection
   - Password reset

2. **Collegare API reali**:
   - Sostituire mock data con chiamate API
   - Implementare admin endpoints nel backend

3. **Monitoraggio**:
   - Vercel Analytics
   - Error tracking (Sentry)
   - Performance monitoring

4. **Custom domain**:
   - admin.landolina.it
   - SSL automatico con Vercel

---

## 📞 **Supporto**

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Repository: https://github.com/yourusername/crocellasa
- 
# Deployment updated

---

**Buon deploy! 🚀**
