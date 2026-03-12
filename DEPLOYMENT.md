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

### Step 1: Update Environment Variable

Before deploying, you need to set the API URL to your **deployed backend**.

**Option A: Vercel (Recommended)**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your deployed backend URL (e.g., `https://your-backend.com`)
4. Redeploy your site

**Option B: Netlify**
1. Go to your Netlify site settings → **Build & deploy**
2. Set **Build environment variables:**
   - **Key:** `VITE_API_URL`
   - **Value:** Your deployed backend URL
3. Trigger a new deploy

**Option C: GitHub Pages**
1. Add to your `.env.production` file (locally):
   ```
   VITE_API_URL=https://your-backend.com
   ```
2. Run build and commit: `npm run build`
3. Push to GitHub - GitHub Pages will deploy

### Step 2: Build for Production

```bash
npm run build    # Creates optimized files in 'dist' folder
```

### Step 3: Deploy the `dist` Folder

Your build output is in the `dist/` folder. Upload this to your hosting:

- **Vercel:** Connect your GitHub repo → auto-deploys
- **Netlify:** Drag & drop `dist/` folder or connect GitHub
- **GitHub Pages:** Push `dist/` to gh-pages branch
- **Traditional Server:** Copy `dist/` to your web server's public directory

---

## Troubleshooting Deployment Issues

### "Network error" or "Failed to load"
- Verify `VITE_API_URL` is set correctly in your deployment
- Check that your backend is running and accessible
- Look at browser **DevTools → Network** tab to see actual API calls

### CORS Errors
Your backend needs to allow requests from your frontend domain. Configure CORS on the backend (HuggingFace Spaces or your server).

### Build Succeeds but Site Won't Load
- Check that `dist/index.html` exists
- Verify all assets are loading (check DevTools → Console)
- Clear browser cache and refresh

---

## Verify Your Setup

After deployment, open your browser's **DevTools (F12)** and check:
1. **Console tab** - Should show no errors
2. **Network tab** - Check if `/ask` and `/upload` requests reach your backend
3. Look for the API URL being used (should match your deployed backend)
