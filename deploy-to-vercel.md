# Deploy AI Prompter Backend to Vercel

## Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Backend
```bash
vercel
```

### 4. Set Environment Variables
```bash
vercel env add GEMINI_API_KEY
# Enter your Gemini API key when prompted
```

### 5. Get Your Deployment URL
After deployment, Vercel will give you a URL like:
`https://ai-prompter-backend-xyz.vercel.app`

### 6. Update Extension URLs
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

### 7. Test Backend
```bash
curl https://your-actual-vercel-url.vercel.app/api/health
```

### 8. Test Generate Endpoint
```bash
curl -X POST https://your-actual-vercel-url.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test prompt"}'
```

## Files to Deploy

The following files are ready for Vercel deployment:
- `api/generate.js` - Main API endpoint
- `api/health.js` - Health check endpoint
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies

## Environment Variables Required

- `GEMINI_API_KEY` - Your Google Gemini API key

## After Deployment

1. Update extension with production URL
2. Test extension with production backend
3. Create final screenshots
4. Submit to Chrome Web Store

## Troubleshooting

**CORS Errors:**
- Ensure Vercel headers are configured in `vercel.json`
- Check that extension origin is allowed

**API Key Issues:**
- Verify environment variable is set correctly
- Test API key directly with Gemini API

**Deployment Failures:**
- Check Vercel logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
