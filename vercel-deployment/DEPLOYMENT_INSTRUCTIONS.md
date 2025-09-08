# 🚀 Deploy AI Prompter Backend to Vercel

## Method 1: Web Interface (Easiest)

### Step 1: Go to Vercel
1. Open [vercel.com](https://vercel.com) in your browser
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub" (recommended)

### Step 2: Create New Project
1. Click "Add New..." → "Project"
2. Click "Browse All Templates" or "Import Git Repository"
3. If you have a GitHub repo, import it
4. If not, click "Deploy" with the files in this folder

### Step 3: Upload Files
1. Drag and drop this entire folder to Vercel
2. Or click "Browse" and select this folder
3. Vercel will automatically detect it's a Node.js project

### Step 4: Configure Environment Variables
1. In your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your actual Gemini API key
   - **Environment:** Production, Preview, Development (select all)

### Step 5: Deploy
1. Click "Deploy" button
2. Wait for deployment to complete
3. Copy your deployment URL (e.g., `https://ai-prompter-backend-xyz.vercel.app`)

## Method 2: CLI (If you prefer)

```bash
# In the vercel-deployment folder
vercel login
vercel
vercel env add GEMINI_API_KEY
```

## After Deployment

### Test Your Backend
1. Health check: `https://your-url.vercel.app/api/health`
2. Generate test: 
```bash
curl -X POST https://your-url.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test prompt"}'
```

### Update Extension
1. Update `chrome-store-final/popup.js`:
   ```javascript
   this.apiUrl = 'https://your-actual-vercel-url.vercel.app';
   ```

2. Update `chrome-store-final/manifest.json`:
   ```json
   "host_permissions": [
     "https://your-actual-vercel-url.vercel.app/*"
   ]
   ```

## Files Included
- `api/generate.js` - Main API endpoint
- `api/health.js` - Health check endpoint  
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies

## Need Help?
- Vercel Docs: https://vercel.com/docs
- Support: https://vercel.com/help
