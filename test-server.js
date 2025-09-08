// Simple test script for the AI Prompter backend
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function testServer() {
    console.log('🧪 Testing AI Prompter Backend Server...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_URL}/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed:', healthData.status);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
            return;
        }

        // Test generate endpoint
        console.log('\n2. Testing generate endpoint...');
        const testInput = 'I want to create a simple todo app';
        
        const generateResponse = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: testInput })
        });

        if (generateResponse.ok) {
            const generateData = await generateResponse.json();
            console.log('✅ Generate endpoint working!');
            console.log('📝 Input:', testInput);
            console.log('✨ Output:', generateData.result.substring(0, 100) + '...');
            console.log('📊 Stats:', {
                inputLength: generateData.inputLength,
                outputLength: generateData.outputLength,
                timestamp: generateData.timestamp
            });
        } else {
            const errorData = await generateResponse.json().catch(() => ({}));
            console.log('❌ Generate endpoint failed:', generateResponse.status, errorData.error || 'Unknown error');
        }

        // Test error handling
        console.log('\n3. Testing error handling...');
        const errorResponse = await fetch(`${API_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: '' })
        });

        if (errorResponse.status === 400) {
            console.log('✅ Error handling working correctly');
        } else {
            console.log('⚠️ Error handling may need attention');
        }

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('\nMake sure:');
        console.log('- Backend server is running (npm start)');
        console.log('- Gemini API key is configured in .env');
        console.log('- Server is accessible on localhost:5000');
    }
}

// Run tests
testServer();
