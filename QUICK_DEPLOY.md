# 🚀 Quick Deploy - 5 Minuti

## Step 1: Vai su Vercel
👉 **https://vercel.com/new**

## Step 2: Import Repository
1. Clicca **"Add New Project"**
2. Connetti GitHub
3. Seleziona repository **`crocellasa`**

## Step 3: Configura
```
Framework: Next.js
Root Directory: frontend
Build Command: npm run build
```

## Step 4: Environment Variables
Aggiungi queste variabili (clicca "Environment Variables"):

### Backend URL (Railway)
```bash
NEXT_PUBLIC_API_URL=https://YOUR-APP.up.railway.app
```
👉 Trova su Railway dashboard

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```
👉 Trova su Supabase > Settings > API

### JWT Secret
```bash
JWT_SECRET=your-secret-key-min-32-chars
```
👉 Usa lo stesso del backend Railway

## Step 5: Deploy!
Clicca **"Deploy"** → Aspetta 2-3 minuti → ✅ Live!

---

## 🎯 Dopo il Deploy

Il tuo sito sarà live su:
```
https://your-project.vercel.app
```

### Testa queste pagine:
- **Homepage**: `/`
- **Admin Dashboard**: `/admin`
- **Bookings**: `/admin/bookings`
- **Integrations**: `/admin/integrations`

---

## 🔧 Configurazione CORS (Importante!)

Vai su **Railway** e aggiungi il dominio Vercel a CORS:

```bash
CORS_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

Poi **rideploy il backend** su Railway.

---

## ✅ Done!

Ogni push su GitHub farà auto-deploy su Vercel! 🎉

Per dettagli completi vedi: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
