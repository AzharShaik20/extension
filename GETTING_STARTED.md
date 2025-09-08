# 🚀 Getting Started with AI Prompter

## Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
1. Copy `env.example` to `.env`
2. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Add it to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start Backend Server
```bash
npm start
```
You should see: `🚀 AI Prompter Backend running on http://localhost:5000`

### 4. Generate Icons
1. Open `icons/generate_icons.html` in your browser
2. Download all 4 icon sizes (16x16, 32x32, 48x48, 128x128)
3. Save them in the `icons/` folder

### 5. Install Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this folder
5. Extension should appear in your toolbar

### 6. Test Everything
```bash
node test-server.js
```

## 🎯 How to Use

1. Click the AI Prompter icon in Chrome
2. Type your rough idea: "I want a website like Amazon"
3. Click "Generate Prompt" or press Ctrl+Enter
4. Copy the refined prompt with the copy button
5. Use it with ChatGPT, Claude, or any AI tool!

## 🔧 Troubleshooting

**"Cannot connect to server"**
- Make sure backend is running: `npm start`
- Check if port 5000 is free

**"Server Error"**
- Verify your Gemini API key in `.env`
- Check server logs for details

**Extension not loading**
- Ensure all files are in the same folder
- Check Chrome console for errors

## 📁 What's Included

- ✅ Secure Node.js backend with Express
- ✅ Beautiful Chrome extension popup
- ✅ Modern UI with animations
- ✅ Error handling and retry logic
- ✅ Rate limiting and security
- ✅ Copy to clipboard functionality
- ✅ Help system and keyboard shortcuts
- ✅ Comprehensive documentation

## 🎨 Customization

- Edit `popup.css` to change colors/styling
- Modify `server.js` to adjust AI prompt instructions
- Update `manifest.json` for extension settings

Happy prompting! ✨
