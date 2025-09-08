// Vercel serverless function for AI Prompter
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Get API key from environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ 
        error: 'Server configuration error' 
      });
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return res.status(500).json({ 
        error: 'Failed to generate prompt. Please try again.' 
      });
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response from Gemini API:', data);
      return res.status(500).json({ 
        error: 'Invalid response from AI service.' 
      });
    }

    const generatedPrompt = data.candidates[0].content.parts[0].text;
    
    res.json({ 
      result: generatedPrompt,
      timestamp: new Date().toISOString(),
      inputLength: userInput.length,
      outputLength: generatedPrompt.length
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}
