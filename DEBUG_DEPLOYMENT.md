# Deployment Debugging Checklist

If you see "Backend service unavailable - Some services are degraded or offline", follow these steps:

---

## Step 1: Check Browser Console for API URL

1. Open your deployed app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for messages starting with `[HealthBar] Checking health at:`
5. **Note the URL shown** - this is what your app is trying to reach

### What You Should See:
```
[HealthBar] Checking health at: https://your-backend-url/health
```

---

## Step 2: Verify the API URL is Correct

### If you see WRONG URL (missing domain or shows localhost):
- **Problem:** `VITE_API_URL` environment variable is not set in deployment
- **Solution:** 
  - Go to your deployment platform (Vercel/Netlify/etc.)
  - Add environment variable `VITE_API_URL` with your backend URL
  - **Redeploy** your app

### If you see CORRECT URL but still fails:
- Continue to Step 3

---

## Step 3: Check Network Requests

1. In DevTools, go to **Network** tab
2. Refresh the page
3. Look for a request to `/health`
4. Check the response:

### Response shows ERROR or NO RESPONSE:
- **Problem:** Your backend is not responding or CORS is blocked
- Check if your HuggingFace backend URL is correct and the service is running
- The backend may need CORS configuration

### Response shows 200 OK with service status:
- Look at the **Response** tab of that request
- You should see something like:
```json
{
  "embedding_model": "ok",
  "pinecone": "ok", 
  "reranker": "ok"
}
```
- If any service shows `"degraded"` or `"error"`, your backend services need attention

---

## Step 4: Test Backend Directly

Open your browser and visit:
```
https://your-backend-url/health
```

You should see a JSON response like:
```json
{
  "embedding_model": "ok",
  "pinecone": "ok",
  "reranker": "ok"
}
```

### If you get 404 or error:
- Your backend URL is wrong OR
- Your backend is not running OR
- The `/health` endpoint doesn't exist

---

## Step 5: Check CORS Configuration

If your health endpoint returns 200 OK but DevTools shows CORS error:

**The backend needs to allow requests from your frontend domain:**

Example backend fix (if using Python Flask):
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://your-deployed-frontend.com"]}})
```

---

## Summary of Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `[HealthBar] Checking health at: http://localhost:5173` | `VITE_API_URL` not set | Set environment variable in deployment |
| `[HealthBar] Checking health at: undefined/health` | `apiUrl` prop is undefined | Verify `VITE_API_URL` is configured |
| Network request shows 404 | Wrong backend URL | Double-check backend URL in `VITE_API_URL` |
| Network shows CORS error | Backend CORS not configured | Add your frontend domain to backend CORS |
| Response shows `"degraded"` or `"error"` | Backend service issue | Check HuggingFace/backend logs |

---

## Quick Test Command

Run this in your browser console to test:
```javascript
fetch('https://your-backend-url/health')
  .then(r => r.json())
  .then(d => console.log('Health:', d))
  .catch(e => console.error('Error:', e))
```

Replace `https://your-backend-url` with your actual backend URL.
