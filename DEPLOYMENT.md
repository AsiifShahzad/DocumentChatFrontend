# Deployment Guide

## For Local Development

Your local setup is already working! The `.env` file contains:
```
VITE_API_URL=https://asiifbaloch-documentchat.hf.space
```

**To run locally:**
```bash
npm run dev    # Runs on http://localhost:5173
```

---

## For Production Deployment

### ⚠️ IMPORTANT: Set Environment Variable BEFORE Deploying

**Without setting `VITE_API_URL`, your deployed app will fail!**

Your app needs to know where your backend is. This is set via the `VITE_API_URL` environment variable.

### Step 1: Update Environment Variable

**Option A: Vercel (Recommended)**
1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your backend URL (e.g., `https://asiifbaloch-documentchat.hf.space`)
   - **Environments:** Select `Production`
4. Click **Save**
5. **Redeploy** your project (Settings → Deployments → Redeploy)

**Option B: Netlify**
1. Go to your Netlify site
2. Click **Site Settings** → **Build & deploy** → **Environment**
3. Click **Edit variables** (or **Add environment variables**)
4. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL
5. **Trigger a new deploy**

**Option C: GitHub Pages (Static Hosting)**
1. Create a `.env.production` file locally:
   ```
   VITE_API_URL=https://your-backend-url
   ```
2. Run: `npm run build`
3. Commit and push to your repository
4. GitHub Pages will redeploy with the correct API URL

### Step 2: Build for Production

```bash
npm run build    # Creates optimized files in 'dist' folder
```

### Step 3: Deploy the `dist` Folder

Your build output is in the `dist/` folder. Upload this to your hosting:

- **Vercel:** Automatically deploys from GitHub (after setting env vars)
- **Netlify:** Drag & drop `dist/` folder or connect GitHub  
- **GitHub Pages:** Push `dist/` to gh-pages branch
- **Traditional Server:** Copy `dist/` to your web server's public directory

### Step 4: Verify Deployment Works

After deploying, **before assuming it works**:

1. Open your deployed app in a browser
2. Press **F12** → **Console**
3. Look for the message: `[HealthBar] Checking health at: YOUR_BACKEND_URL/health`
4. If you see `undefined` or `localhost`, the environment variable isn't set

**If you see the error "Backend service unavailable", see [DEBUG_DEPLOYMENT.md](DEBUG_DEPLOYMENT.md) for troubleshooting!**

---

## Troubleshooting

If you're experiencing issues after deployment (like "Backend service unavailable"), refer to [DEBUG_DEPLOYMENT.md](DEBUG_DEPLOYMENT.md) for:
- How to check what API URL your deployed app is using
- How to verify environment variables are set correctly
- How to test your backend directly
- Common issues and their solutions

