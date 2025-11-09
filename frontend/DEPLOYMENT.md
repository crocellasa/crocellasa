# Frontend Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- Vercel account (free tier works fine)
- Vercel CLI: `npm install -g vercel`

### 2. Environment Variables

You'll need these values from your backend setup:

```bash
NEXT_PUBLIC_API_URL=https://crocellasa-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=same_secret_as_backend
```

### 3. Deploy from Local

```bash
# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (first time - will prompt for settings)
vercel

# Or deploy directly to production
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable:
   - `NEXT_PUBLIC_API_URL` → Production + Preview + Development
   - `NEXT_PUBLIC_SUPABASE_URL` → Production + Preview + Development
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Production + Preview + Development
   - `JWT_SECRET` → Production (mark as Secret)

4. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

### 5. Deploy from GitHub (Recommended for continuous deployment)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables (same as step 4)
6. Click "Deploy"

### 6. Update Backend CORS

After deployment, update your Railway backend environment variable:

```bash
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGINS=https://your-frontend-url.vercel.app,https://*.vercel.app
```

### 7. Test the Deployment

1. Get your Vercel URL (e.g., `https://alcova-guest-portal.vercel.app`)
2. Create a test booking via backend API
3. Get the `guest_token` from response
4. Visit: `https://your-vercel-url.vercel.app/g/{token}?lang=it`
5. Verify:
   - ✅ Access codes display correctly
   - ✅ Property information loads
   - ✅ Ring Intercom button works
   - ✅ Language switching works

## Troubleshooting

### Build fails with "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API calls fail with CORS error
- Check `CORS_ORIGINS` in backend includes your Vercel URL
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Environment variables not working
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Check Vercel dashboard → Deployments → Environment Variables

### Token validation fails
- Ensure `JWT_SECRET` matches exactly between frontend and backend
- Check token hasn't expired (default: 30 days)

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your values

# Run dev server
npm run dev

# Visit http://localhost:3000
```

## Production URLs

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://crocellasa-production.up.railway.app
- **API Docs**: https://crocellasa-production.up.railway.app/docs

## Next Steps After Deployment

1. Test complete booking flow end-to-end
2. Configure custom domain (optional)
3. Set up Vercel analytics (optional)
4. Configure webhooks from Hospitable
5. Test WhatsApp notifications with real guest data
