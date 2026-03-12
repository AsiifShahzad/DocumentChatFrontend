# AskMyDoc - Document RAG Chat Application

A modern React-based application for uploading PDFs and asking questions about their content using AI-powered retrieval-augmented generation (RAG).

## Features

- 📄 **PDF Upload** - Drag & drop or click to upload PDF documents
- 💬 **Smart Chat** - Ask questions about your documents
- 🔍 **Source Attribution** - See which pages your answers came from
- 📊 **Confidence Scores** - Know how confident the AI is in its answers
- 🏥 **Health Monitoring** - Real-time backend service status
- ⚡ **Fast & Responsive** - Built with React 19 and Vite

## Prerequisites

- **Node.js**: v18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm**: v9+ (comes with Node.js)
- **Git**: v2.0+ (Download from [git-scm.com](https://git-scm.com/))

## Quick Start - Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/askmydoc.git
cd askmydoc
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

Output files will be in the `dist/` folder

## Deploy to GitHub Pages

If deploying to GitHub Pages, update `vite.config.js`:
```javascript
export default {
  base: '/repository-name/',  // Change to your repo name
  plugins: [react()],
}
```

Then build and deploy:
```bash
npm run build
gh-page -d dist
```

## Architecture

- **Frontend**: React 19 with Tailwind CSS
- **Build Tool**: Vite 5.1
- **Backend**: HuggingFace Spaces API
- **State Management**: React Hooks (useState, useEffect)

## API Endpoints

**Base URL**: `https://asiifbaloch-documentchat.hf.space`

### Upload Document
```
POST /api/upload
Body: FormData { file: File }
Response: { filename: string, chunks_processed: number }
```

### Ask Question
```
POST /api/ask
Body: { question: string }
Response: { 
  answer: string,
  sources: [{ source: string, page: number }],
  confidence: number
}
```

### Health Check
```
GET /api/health
Response: {
  embedding_model: "ok" | "degraded" | "error",
  pinecone: "ok" | "degraded" | "error",
  reranker: "ok" | "degraded" | "error"
}
```

## Project Structure

```
askmydoc/
├── src/
│   ├── app.jsx              # Main app component & state
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── components/
│       ├── HealthBar.jsx    # Backend health status
│       ├── Sidebar.jsx      # PDF upload panel
│       └── ChatArea.jsx     # Chat interface
├── index.html               # HTML entry point
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── package.json            # Dependencies & scripts
└── .gitignore             # Git ignore file
```

## Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Limitations

- Maximum PDF file size: 50MB
- Maximum question length: 5000 characters
- Request timeouts: 30 seconds for chat, 120 seconds for upload
- Requires backend service to be online

## Troubleshooting

### Build Failed: "npm run build" exited with 1

**Quick Fix:**

1. **Use the Build Script** (easiest):
   ```bash
   .\BUILD.bat        # Windows Batch
   .\BUILD.ps1        # Windows PowerShell
   ```

2. **Manual Fix:**
   ```bash
   npm cache clean --force
   rmdir /s/q node_modules
   del package-lock.json
   npm install
   npm run build
   ```

**→ Full troubleshooting guide:** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Development

### Adding a New Component
```javascript
// src/components/MyComponent.jsx
import { useState } from 'react'

export default function MyComponent() {
  return (
    <div className="p-4">
      Your component here
    </div>
  )
}
```

### Customizing Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#2563EB',  // Change primary blue
  'primary-dark': '#1D4ED8',  // Darker variant
}
```

### Changing Backend URL
Edit `src/app.jsx`:
```javascript
const API_URL = 'https://your-backend-url.com'
```

## Error Handling

The app includes comprehensive error handling for:
- Network errors & timeouts
- Invalid file types & sizes
- Missing API responses
- Backend service degradation
- Invalid user input

All errors are shown as toast notifications with actionable messages.

## Performance

- **First Load**: ~2.5 seconds (first time)
- **Subsequent Loads**: ~1.2 seconds (cached)
- **Upload Speed**: Depends on file size & network
- **Chat Response**: ~5-15 seconds (LLM inference)

## License

MIT - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the [troubleshooting](#troubleshooting) section
2. Review the [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md)
3. Check backend health at the top of the app
4. Look at browser console for detailed errors (F12)

## Version

- **App**: v0.0.1
- **React**: 19.0.0
- **Vite**: 5.1.0
- **Tailwind**: 3.4.0
- **Node**: 18+

---

Made with ❤️ for document analysis
