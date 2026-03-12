# AskMyDoc - Commands Reference

## 🚀 Initial Setup (First Time Only)

### 1. Initialize Git Repository
```bash
cd c:\Users\asiif\Downloads\Projects\DocumentChatFrontend
git init
```

### 2. Add Files to Git
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit: AskMyDoc RAG application

- React 19 + Vite frontend
- PDF upload with drag-drop support
- Chat interface with RAG backend
- Health monitoring dashboard
- Comprehensive error handling and validation"
```

### 4. Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `askmydoc` (or your preferred name)
3. Select "Public" or "Private"
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### 5. Add Remote and Push
```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/askmydoc.git
git branch -M main
git push -u origin main
```

---

## 💻 Run Locally

### 1. Navigate to Project Directory
```bash
cd c:\Users\asiif\Downloads\Projects\DocumentChatFrontend
```

### 2. Install Dependencies (First Time Only)
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

**Output**:
```
  VITE v5.1.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser ✅

---

## 📦 Build for Production

### Create Production Build
```bash
npm run build
```

**Output**:
```
dist/index.html                    (X.XX kB)
dist/assets/main.xxxxxxxx.js       (XXX.XX kB)
dist/assets/style.xxxxxxxx.css     (XX.XX kB)
```

### Preview Production Build Locally
```bash
npm run preview
```

---

## 🔄 After Making Changes

### 1. Check Status
```bash
git status
```

### 2. Add Changes
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "Description of changes"
```

Examples:
```bash
git commit -m "Fix: improved error messages in upload"
git commit -m "Feature: add dark mode toggle"
git commit -m "Docs: update README with API endpoints"
```

### 4. Push to GitHub
```bash
git push origin main
```

---

## 📚 Common Workflows

### Setup & Push (Complete Flow)
```bash
# Navigate to project
cd c:\Users\asiif\Downloads\Projects\DocumentChatFrontend

# Initialize git (if not done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: AskMyDoc application"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/askmydoc.git
git branch -M main
git push -u origin main
```

### Run Local Development
```bash
# Navigate to project
cd c:\Users\asiif\Downloads\Projects\DocumentChatFrontend

# Install dependencies (first time)
npm install

# Start dev server
npm run dev

# App opens at http://localhost:5173
```

### Make & Push Changes
```bash
# Edit files in VS Code...

# Check what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "What you changed"

# Push to GitHub
git push origin main
```

### Build for Deployment
```bash
# Create production build
npm run build

# This creates a 'dist' folder with optimized files
# You can upload this folder to:
# - Vercel (git push automatically)
# - Netlify (git push automatically)
# - GitHub Pages (npm run build + push)
# - Any static hosting
```

---

## 🔑 Important Notes

### Replace YOUR_USERNAME
Every time you see `YOUR_USERNAME`, replace with your actual GitHub username:
```bash
# ❌ Wrong
git remote add origin https://github.com/YOUR_USERNAME/askmydoc.git

# ✅ Correct
git remote add origin https://github.com/asiifbaloch/askmydoc.git
```

### Git Configuration (First Time Only)
If you get an error, configure git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### SSH vs HTTPS
The commands above use HTTPS. If you prefer SSH:
```bash
# Instead of:
git remote add origin https://github.com/YOUR_USERNAME/askmydoc.git

# Use:
git remote add origin git@github.com:YOUR_USERNAME/askmydoc.git
```
(Requires SSH key setup)

---

## 🚨 Troubleshooting Commands

### Check Git Configuration
```bash
git config --global user.name
git config --global user.email
git remote -v
```

### Reset if Something Goes Wrong
```bash
# See last few commits
git log --oneline -5

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Undo last commit (loses changes)
git reset --hard HEAD~1

# See all changes
git diff
```

### npm Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
npm install

# Check npm version
npm --version
```

### Port Already in Use (5173)
```bash
# If port 5173 is busy, Vite will use next available port
# Or manually specify:
npm run dev -- --port 3000
```

---

## 📋 Quick Cheat Sheet

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Check git status | `git status` |
| View git log | `git log --oneline` |
| Add files to git | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Pull latest changes | `git pull origin main` |
| Check remote URL | `git remote -v` |
| Create new branch | `git checkout -b feature-name` |
| Delete local branch | `git branch -d branch-name` |

---

## 🌐 Deploy to Vercel (Recommended)

### Option 1: Via GitHub (Easiest)
1. Push code to GitHub (using commands above)
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Done! Every git push auto-deploys

### Option 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (in project directory)
vercel

# Production deploy
vercel --prod
```

---

## 📱 Access Your App

**Local**: http://localhost:5173  
**GitHub**: https://github.com/YOUR_USERNAME/askmydoc  
**Vercel**: https://askmydoc-YOUR_USERNAME.vercel.app (after deployment)

---

**Last Updated**: 2026-03-12  
**App Version**: 0.0.1
