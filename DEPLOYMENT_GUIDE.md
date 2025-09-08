# 🚀 Backend Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
```bash
vercel env add GEMINI_API_KEY
# Enter your Gemini API key when prompted
```

4. **Update Extension**
- Update `chrome-store-package/popup.js` with your Vercel URL
- Update `chrome-store-package/manifest.json` host_permissions

### Option 2: Netlify Functions

1. **Create netlify.toml**
```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Create netlify/functions/generate.js**
```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { userInput } = JSON.parse(event.body);
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Transform this into a detailed AI prompt: ${userInput}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: data.candidates[0].content.parts[0].text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
```

3. **Deploy to Netlify**
- Connect your GitHub repo
- Set GEMINI_API_KEY in environment variables

### Option 3: Railway

1. **Create railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

2. **Deploy**
```bash
railway login
railway init
railway up
```

## Environment Variables Setup

### Required Variables
- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (usually 5000)

### Getting Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key
4. Add to your deployment platform

## Testing Deployment

### Health Check
```bash
curl https://your-domain.com/health
```

### Generate Test
```bash
curl -X POST https://your-domain.com/generate \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test prompt"}'
```

## Update Extension for Production

1. **Update popup.js**
```javascript
this.apiUrl = 'https://your-deployed-domain.com';
```

2. **Update manifest.json**
```json
"host_permissions": [
  "https://your-deployed-domain.com/*"
]
```

3. **Test Extension**
- Load unpacked extension
- Test with production backend
- Verify all functionality works

## Common Issues

### CORS Errors
- Ensure your backend has proper CORS configuration
- Check host_permissions in manifest.json

### API Key Issues
- Verify API key is set correctly
- Check API key has proper permissions
- Test API key directly with curl

### Deployment Failures
- Check build logs
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

## Production Checklist

- [ ] Backend deployed successfully
- [ ] Health endpoint responding
- [ ] Generate endpoint working
- [ ] CORS configured properly
- [ ] Environment variables set
- [ ] Extension updated with production URL
- [ ] Extension tested with production backend
- [ ] Error handling working
- [ ] Rate limiting active

## Monitoring

### Vercel
- Check Vercel dashboard for logs
- Monitor function execution time
- Watch for errors

### Netlify
- Check Netlify dashboard
- Monitor function logs
- Watch bandwidth usage

### Railway
- Check Railway dashboard
- Monitor resource usage
- Watch deployment logs
