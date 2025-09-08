# AI Prompter Chrome Extension

Transform your rough ideas into creative, structured AI prompts using Google's Gemini AI. This extension provides a beautiful interface to refine your thoughts into detailed prompts that can be used with various AI tools.

## ✨ Features

- **Beautiful UI**: Modern, responsive design with smooth animations
- **Smart Input Validation**: Real-time character counting and validation
- **Error Handling**: Comprehensive error handling with retry logic
- **Copy to Clipboard**: One-click copying of generated prompts
- **Help System**: Built-in help modal with examples and tips
- **Keyboard Shortcuts**: Ctrl+Enter to generate, Ctrl+C to copy
- **History Storage**: Automatically saves your recent prompts
- **Rate Limiting**: Prevents API abuse with built-in rate limiting
- **Secure**: API key is never exposed to the client

## 🏗️ Architecture

The extension consists of three main components:

1. **Chrome Extension** (Frontend)
   - Popup interface with HTML/CSS/JS
   - Communicates with backend server
   - Handles user interactions and UI

2. **Node.js Backend** (Server)
   - Express.js server with security middleware
   - Rate limiting and input validation
   - Communicates with Gemini API
   - Hides API key from client

3. **Gemini AI** (AI Service)
   - Google's Gemini Pro model
   - Transforms rough ideas into structured prompts

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Google Gemini API key
- Chrome browser

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env and add your Gemini API key
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 3. Start Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 4. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder containing `manifest.json`
5. The extension should appear in your toolbar

### 5. Generate Icons (Optional)

1. Open `icons/generate_icons.html` in your browser
2. Click "Download" for each icon size
3. Save them in the `icons/` folder

## 📁 Project Structure

```
chromeext/
├── manifest.json          # Chrome extension manifest
├── popup.html            # Extension popup interface
├── popup.css             # Styles for popup
├── popup.js              # Popup logic and API communication
├── server.js             # Backend Express server
├── package.json          # Node.js dependencies
├── env.example           # Environment variables template
├── icons/                # Extension icons
│   ├── generate_icons.html
│   ├── icon16.png        # 16x16 icon
│   ├── icon32.png        # 32x32 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### Chrome Extension Permissions

The extension requires these permissions:
- `activeTab`: Access to current tab
- `storage`: Save prompt history
- `host_permissions`: Communicate with localhost:5000

## 🎯 Usage

1. Click the AI Prompter extension icon
2. Type your rough idea in the text area
3. Click "Generate Prompt" or press Ctrl+Enter
4. Copy the refined prompt using the copy button or Ctrl+C
5. Use the generated prompt with your preferred AI tool

### Example Inputs

- "I want a website like Amazon"
- "Create a mobile app for fitness tracking"
- "Design a logo for my coffee shop"
- "Write a story about time travel"

## 🛠️ Development

### Backend Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Test the API
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test prompt"}'
```

### Extension Development

1. Make changes to popup files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test your changes

### API Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate AI prompt

## 🔒 Security Features

- **API Key Protection**: Never exposed to client
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Sanitizes and validates all inputs
- **CORS Protection**: Only allows requests from extension
- **Error Handling**: Doesn't expose sensitive information

## 🐛 Troubleshooting

### Common Issues

1. **"Cannot connect to server"**
   - Make sure backend server is running on localhost:5000
   - Check if port 5000 is available

2. **"Server Error"**
   - Verify your Gemini API key is correct
   - Check server logs for detailed error messages

3. **Extension not loading**
   - Ensure all files are in the same directory
   - Check Chrome developer console for errors
   - Verify manifest.json syntax

4. **Icons not showing**
   - Generate icons using `icons/generate_icons.html`
   - Ensure icon files are in the `icons/` folder

### Debug Mode

Enable Chrome extension debugging:
1. Go to `chrome://extensions/`
2. Click "Details" on your extension
3. Enable "Allow in incognito"
4. Open Chrome DevTools to see console logs

## 📝 API Reference

### Generate Prompt

```http
POST /generate
Content-Type: application/json

{
  "userInput": "Your rough idea here"
}
```

**Response:**
```json
{
  "result": "Detailed, structured AI prompt...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "inputLength": 25,
  "outputLength": 150
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for the AI capabilities
- Chrome Extensions team for the platform
- Express.js community for the backend framework

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the server logs
3. Check Chrome extension console
4. Open an issue with detailed error information

---

**Happy prompting! 🚀**
