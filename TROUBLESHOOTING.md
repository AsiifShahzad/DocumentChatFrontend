# Build Error Troubleshooting Guide

## Issue: "npm run build" exited with 1

This guide will help you resolve common npm build issues.

---

## Quick Fix (Try First)

### Option 1: Run the Build Script (Easiest)

**Windows - Batch File:**
```batch
Double-click: BUILD.bat
```

**Windows - PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\BUILD.ps1
```

---

## Step-by-Step Manual Build

### Step 1: Check Node.js Installation
```bash
node --version  # Should show v18 or higher
npm --version   # Should show v9 or higher
```

If commands not found:
- 🔗 Download & install Node.js: https://nodejs.org/
- ✅ Check "Add to PATH" during installation
- ⚠️ **Restart VS Code or terminal after installation**

---

### Step 2: Fix package.json Name

The package.json name must be **lowercase** and use **hyphens** only (no spaces/underscores starting with numbers).

**Expected format:**
```json
{
  "name": "ask-my-doc",
  "version": "0.0.1",
  ...
}
```

---

### Step 3: Clear npm Cache

```bash
npm cache clean --force
```

---

### Step 4: Remove node_modules and pnpm Artifacts

```bash
# Windows
rmdir /s /q node_modules
del package-lock.json
del pnpm-lock.yaml

# Or manually delete:
# - node_modules folder
# - package-lock.json file
# - pnpm-lock.yaml file (if exists)
```

---

### Step 5: Reinstall Dependencies

```bash
npm install
```

Output should show: `added X packages in Y seconds`

If it hangs or takes >5 minutes:
- Press `Ctrl+C` to cancel
- Try: `npm install --no-optional`
- Or: `npm install --legacy-peer-deps`

---

### Step 6: Build the Project

```bash
npm run build
```

**Expected output:**
```
vite v5.1.0 building for production...
✓ 1234 modules transformed.
dist/index.html                  X.XX kB
dist/assets/main.xxxxxxxx.js     XXX.XX kB
dist/assets/style.xxxxxxxx.css   XX.XX kB
```

---

## Common Errors & Solutions

### Error: "Invalid package.json name"

**Cause:** Package name has invalid characters (spaces, uppercase, numbers at start)

**Fix:**
```json
❌ Wrong: { "name": "Ask My Doc" }
❌ Wrong: { "name": "AskMyDoc" }  
❌ Wrong: { "name": "1askmydoc" }
✅ Correct: { "name": "ask-my-doc" }
```

Then run:
```bash
npm cache clean --force
npm install
npm run build
```

---

### Error: "vite: command not found"

**Cause:** Dependencies not installed or Vite not in node_modules

**Fix:**
```bash
npm install
```

---

### Error: "React is not defined"

**Cause:** Missing React import in JSX files

Already fixed in our project, but check if any files are missing:
```javascript
// Should be at top of every .jsx file:
import React from 'react'  // or just use 'react' in imports
```

---

### Error: "Port 5173 already in use"

**Cause:** Another app is using port 5173

**Fix:**
```bash
# Use different port
npm run build  # Build doesn't use port

# For dev server, use different port:
npm run dev -- --port 3000
```

---

### Error: "Cannot find module '@vitejs/plugin-react'"

**Cause:** Dependencies not fully installed

**Fix:**
```bash
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

## Advanced Troubleshooting

### Check npm Configuration

```bash
npm config list
npm config get registry
```

Should show:
```
registry=https://registry.npmjs.org/
```

If different, reset to default:
```bash
npm config set registry https://registry.npmjs.org/
```

---

### Use Different npm Mirror (if npm registry is slow)

China users can try:
```bash
npm install -g cnpm
cnpm install
cnpm run build
```

---

### Check Disk Space

Build needs ~500MB free space for node_modules + build output

```bash
# Check disk space
wmic logicaldisk get name,freespace

# Delete build artifacts to free space
rmdir /s /q node_modules dist
```

---

### Verify File Integrity

Make sure all required files exist:
```
✓ package.json
✓ vite.config.js
✓ tailwind.config.js
✓ postcss.config.js
✓ index.html
✓ src/main.jsx
✓ src/app.jsx
✓ src/index.css
✓ src/components/*.jsx
```

---

## Nuclear Option (Complete Reset)

If nothing else works:

```bash
# Delete everything npm-related
rmdir /s /q node_modules
del package-lock.json
del pnpm-lock.yaml

# Clear cache
npm cache clean --force

# Clear npm config
npm config set registry https://registry.npmjs.org/

# Fresh install
npm install

# Test build
npm run build
```

---

## Verify Successful Build

After running `npm run build`, check:

1. **dist/ folder exists**
   - Should contain: `index.html`, `assets/` folder

2. **dist/assets has these files:**
   - `main.*.js` (main JavaScript bundle)
   - `style.*.css` (Tailwind CSS)

3. **File sizes are reasonable:**
   - `main.*.js`: 100-300 KB
   - `style.*.css`: 20-50 KB

4. **HTML references assets:**
   ```bash
   type dist/index.html
   # Should show <script src="/assets/main..." and <link href="/assets/style...
   ```

---

## Next Steps After Successful Build

### Preview Locally
```bash
npm run preview
# Opens at http://localhost:4173
```

### Deploy to Vercel (Recommended)
1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Fix: resolve build errors"
   git push origin main
   ```

2. Go to https://vercel.com
3. Import your GitHub repository
4. Click Deploy

### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

---

## Getting Help

If you still have issues:

1. **Check file exists**: `VERIFICATION_REPORT.md` has error handling details
2. **Check documentation**: `README.md` and `COMMANDS.md`
3. **Share error output**: Copy full error message and share
4. **Check backend**: Verify backend is online (health check at app top)
5. **Browser console**: Press F12, check Console tab for errors

---

## Prevention Tips

1. **Always use lowercase package names** with hyphens
2. **Keep node_modules out of git** (use `.gitignore`)
3. **Pin Node.js version** to LTS (18.x or 20.x)
4. **Run npm install** after cloning from GitHub
5. **Clear cache** when weird errors appear

---

**Last Updated:** 2026-03-12  
**Node Version:** 18+  
**npm Version:** 9+  
**Vite Version:** 5.1.0

