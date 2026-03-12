# ✅ Setup Checklist

Use this checklist to ensure everything is set up correctly before building.

---

## Prerequisites

- [ ] Node.js v18+ installed → [Download](https://nodejs.org/)
- [ ] npm v9+ installed (comes with Node.js)
- [ ] Git v2.0+ installed → [Download](https://git-scm.com/)
- [ ] VS Code or text editor → [Download](https://code.visualstudio.com/)

**Verify Installation:**
```bash
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
git --version     # Should show v2+ or higher
```

---

## Project Files

Verify all required files exist in the project root:

### Configuration Files
- [ ] `package.json` - npm configuration
- [ ] `vite.config.js` - Vite build configuration
- [ ] `tailwind.config.js` - Tailwind CSS configuration
- [ ] `postcss.config.js` - PostCSS configuration
- [ ] `.gitignore` - Git ignore rules
- [ ] `index.html` - HTML entry point

### Source Code
- [ ] `src/main.jsx` - React entry point
- [ ] `src/app.jsx` - Main application component
- [ ] `src/index.css` - Global styles
- [ ] `src/components/HealthBar.jsx` - Health status component
- [ ] `src/components/Sidebar.jsx` - Upload component
- [ ] `src/components/ChatArea.jsx` - Chat component

### Documentation
- [ ] `README.md` - Project documentation
- [ ] `COMMANDS.md` - Command reference
- [ ] `TROUBLESHOOTING.md` - Troubleshooting guide
- [ ] `VERIFICATION_REPORT.md` - Error handling report
- [ ] `BUILD.bat` - Build script (Windows Batch)
- [ ] `BUILD.ps1` - Build script (PowerShell)

### Git
- [ ] `.git/` directory exists (should be hidden)
- [ ] Can run `git status` without errors

---

## Package.json Validation

Open `package.json` and verify:

```json
{
  "name": "ask-my-doc",           // ✓ lowercase, hyphenated
  "version": "0.0.1",             // ✓ semantic versioning
  "private": true,                // ✓ private project
  "type": "module",               // ✓ ES modules
  "scripts": {
    "dev": "vite",                // ✓ dev server
    "build": "vite build",        // ✓ production build
    "preview": "vite preview"     // ✓ preview build
  },
  "dependencies": {
    "react": "^19.0.0",           // ✓ React installed
    "react-dom": "^19.0.0"        // ✓ React DOM installed
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",  // ✓ Vite React plugin
    "vite": "^5.1.0",                   // ✓ Vite build tool
    "tailwindcss": "^3.4.0",           // ✓ Tailwind CSS
    "postcss": "^8.4.0",               // ✓ PostCSS
    "autoprefixer": "^10.4.0"          // ✓ Autoprefixer
  }
}
```

---

## Environment Setup

### npm Configuration
- [ ] npm registry is set to https://registry.npmjs.org/
  ```bash
  npm config get registry
  # Should output: https://registry.npmjs.org/
  ```

- [ ] No old pnpm locks
  ```bash
  # These files should NOT exist:
  # ✗ pnpm-lock.yaml (if exists, delete it)
  # ✗ pnpm-workspace.yaml (if exists, delete it)
  ```

### Terminal Setup
- [ ] Using PowerShell, Command Prompt, or Git Bash
- [ ] No global npm errors
  ```bash
  npm install --help  # Should work without errors
  ```

---

## First-Time Setup

Complete these steps in order:

### 1. Navigate to Project
```bash
cd c:\Users\asiif\Downloads\Projects\DocumentChatFrontend
```
- [ ] Command completes without error

### 2. Check npm
```bash
npm --version
```
- [ ] Shows version 9+ or higher

### 3. Clean Install (If first time)
```bash
npm cache clean --force
rmdir /s/q node_modules       # Delete if exists
del package-lock.json         # Delete if exists
npm install
```
- [ ] Should complete without errors
- [ ] Should show "added X packages"
- [ ] Should create `node_modules/` folder

### 4. Test Dev Server
```bash
npm run dev
```
- [ ] Should show: `Local: http://localhost:5173/`
- [ ] Browser opens automatically
- [ ] App loads without errors
- [ ] Press `Ctrl+C` to stop

### 5. Build Test
```bash
npm run build
```
- [ ] Should complete without errors
- [ ] Should create `dist/` folder
- [ ] Should show file sizes for:
  - `dist/index.html`
  - `dist/assets/main.*.js`
  - `dist/assets/style.*.css`

---

## Common Issues Checklist

### Issue: "Invalid package.json name"
- [ ] Package name is lowercase
- [ ] Package name has no spaces
- [ ] Package name doesn't start with number
- [ ] Package name uses hyphens, not underscores
  - ✓ `ask-my-doc`
  - ✗ `Ask-My-Doc`
  - ✗ `ask_my_doc`
  - ✗ `1askmydoc`

### Issue: "vite: command not found"
- [ ] Ran `npm install`
- [ ] `node_modules/` folder exists
- [ ] `.bin/vite` exists in `node_modules/@vitejs/`

### Issue: "Port 5173 already in use"
- [ ] Close other instances of app/VS Code
- [ ] Kill process using port: `netstat -ano | find ":5173"`
- [ ] Or use different port: `npm run dev -- --port 3000`

### Issue: "Cannot find module" (build fails)
- [ ] All imports in `.jsx` files exist
- [ ] No typos in import paths
- [ ] All components exported correctly
  - Should end with: `export default ComponentName`

### Issue: Build takes very long (>5 minutes)
- [ ] Close other applications
- [ ] Check disk space (need ~500MB free)
- [ ] Try: `npm install --no-optional`

---

## Security Checklist

- [ ] No API keys in code (check `src/app.jsx`)
- [ ] `.gitignore` excludes `node_modules/`
- [ ] `.gitignore` excludes `.env` files
- [ ] No sensitive files committed
- [ ] GitHub repo visibility correct (Public/Private)

---

## Deployment Readiness

### Before Deploying to Vercel
- [ ] Build succeeds locally: `npm run build`
- [ ] No build warnings in terminal
- [ ] `dist/` folder has all files
- [ ] All components import correctly
- [ ] Backend API URL is correct in `src/app.jsx`

### Before Deploying to GitHub Pages
- [ ] Update Vite base path (if needed)
- [ ] Build succeeds
- [ ] Install `gh-pages`: `npm install --save-dev gh-pages`
- [ ] Add to `package.json`: `"deploy": "npm run build && gh-pages -d dist"`

---

## Final Testing

Before considering setup complete:

- [ ] Dev server runs: `npm run dev`
- [ ] App opens at `http://localhost:5173`
- [ ] App loads without console errors (F12)
- [ ] Build succeeds: `npm run build`
- [ ] Build output exists in `dist/` folder
- [ ] Can see app files: `index.html`, `assets/` folder
- [ ] Health bar shows backend status
- [ ] File upload works
- [ ] Chat works (with PDF uploaded)

---

## Troubleshooting Reference

If checklist fails at any point:

1. **See:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. **Check:** Common errors section
3. **Try:** Nuclear option (complete reset)
4. **Run:** `.\BUILD.bat` or `.\BUILD.ps1` scripts

---

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server
Ctrl+C                      # Stop dev server

# Building
npm run build              # Create production build
npm run preview            # Preview production build

# Maintenance
npm install                # Install/update dependencies
npm update                 # Update all packages
npm cache clean --force    # Clear npm cache

# Troubleshooting
npm config get registry    # Check npm registry
npm list                   # List installed packages
git status                 # Check git status
```

---

## Support Resources

- **Node.js Issues:** https://nodejs.org/
- **npm Docs:** https://docs.npmjs.com/
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Tailwind Docs:** https://tailwindcss.com/
- **This Project README:** [README.md](./README.md)
- **This Project COMMANDS:** [COMMANDS.md](./COMMANDS.md)

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-03-12  
**Status:** ✅ Ready for Production

