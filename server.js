import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:*'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Validate API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main prompt generation endpoint
app.post('/generate', async (req, res) => {
  const { userInput } = req.body;

  // Validate input
  if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Invalid input. Please provide a non-empty string.' 
    });
  }

  if (userInput.length > 1000) {
    return res.status(400).json({ 
      error: 'Input too long. Please keep it under 1000 characters.' 
    });
  }

  console.log(`📝 Processing request: "${userInput.substring(0, 50)}..."`);
  console.log(`🔑 Using API key: ${GEMINI_API_KEY.substring(0, 10)}...`);

  // Call Gemini API
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert AI prompt engineer. Transform this rough idea into a detailed, creative, and well-structured AI prompt that will generate high-quality results. Make it specific, actionable, and engaging. Add relevant context, style guidelines, and technical specifications where appropriate.

User's rough idea: "${userInput}"

Please provide only the refined prompt, no additional commentary or explanations.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    clearTimeout(timeoutId);
    
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('❌ Gemini API error:', errorData);
      console.error('❌ Response status:', geminiResponse.status);
      console.error('❌ Response headers:', geminiResponse.headers);
      return res.status(500).json({ 
        error: `Failed to generate prompt. API Error: ${errorData.error || 'Unknown error'}` 
      });
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid response from Gemini API:', data);
      return res.status(500).json({ 
        error: 'Invalid response from AI service.' 
      });
    }

    const generatedPrompt = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Successfully generated prompt');
    
    // Clear timeout on success
    clearTimeout(timeoutId);
    
    res.json({ 
      result: generatedPrompt,
      timestamp: new Date().toISOString(),
      inputLength: userInput.length,
      outputLength: generatedPrompt.length
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Server error:', error);
    
    if (error.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'Request timeout. Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Something went wrong. Please try again.' 
  });
});

// Serve favicon.ico to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Serve a simple index page for root requests
app.get('/', (req, res) => {
  res.json({
    message: 'AI Prompter Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generate: '/generate (POST)'
    },
    status: 'running'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/generate']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Prompter Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 API Key configured: ${GEMINI_API_KEY ? '✅ Yes' : '❌ No'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});
