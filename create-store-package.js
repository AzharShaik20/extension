// Script to create Chrome Web Store package
import fs from 'fs';
import path from 'path';

console.log('🏪 Creating Chrome Web Store Package...\n');

// Create store package directory
const storeDir = 'chrome-store-package';
if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir);
}

// Files to include in the extension package
const extensionFiles = [
    'manifest.json',
    'popup.html',
    'popup.css', 
    'popup.js',
    'icons/'
];

// Copy extension files
extensionFiles.forEach(file => {
    const srcPath = file;
    const destPath = path.join(storeDir, file);
    
    if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
            // Copy directory
            if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
            }
            copyDir(srcPath, destPath);
        } else {
            // Copy file
            fs.copyFileSync(srcPath, destPath);
        }
        console.log(`✅ Copied: ${file}`);
    } else {
        console.log(`⚠️ Missing: ${file}`);
    }
});

// Create store-ready manifest
const manifestPath = path.join(storeDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Update manifest for Chrome Web Store
manifest.version = "1.0.0";
manifest.description = "Transform your rough ideas into creative, structured AI prompts using Gemini AI";
manifest.author = "AI Prompter Team";
manifest.homepage_url = "https://github.com/yourusername/ai-prompter"; // Update this

// Add required fields for Chrome Web Store
manifest.minimum_chrome_version = "88";
manifest.offline_enabled = false;

// Update host permissions for production
manifest.host_permissions = [
    "https://your-backend-domain.com/*" // Update this to your actual backend URL
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Updated manifest.json for Chrome Web Store');

// Create privacy policy
const privacyPolicy = `# Privacy Policy for AI Prompter Chrome Extension

## Data Collection
This extension collects minimal data:
- User input text (prompts) are sent to our backend server
- Generated AI responses are temporarily stored locally
- No personal information is collected or stored

## Data Usage
- User prompts are sent to Google's Gemini AI API for processing
- Responses are returned to the user and stored locally in browser storage
- We do not share data with third parties except Google's Gemini API

## Data Storage
- Prompts are temporarily processed by our backend server
- Generated responses are stored locally in your browser
- No data is permanently stored on our servers

## Third-Party Services
This extension uses Google's Gemini AI API. Please review Google's privacy policy.

## Contact
For privacy concerns, contact: privacy@yourdomain.com

Last updated: ${new Date().toISOString().split('T')[0]}
`;

fs.writeFileSync(path.join(storeDir, 'PRIVACY_POLICY.md'), privacyPolicy);
console.log('✅ Created privacy policy');

// Create store listing assets
const storeAssets = {
    'store-listing.md': `# Chrome Web Store Listing

## Short Description
Transform rough ideas into creative AI prompts using Gemini AI.

## Detailed Description
AI Prompter helps you turn simple ideas into detailed, structured prompts perfect for AI tools like ChatGPT, Claude, and others. Simply type your rough concept and get a professionally crafted prompt that will generate better results.

## Features
- Beautiful, modern interface
- Smart input validation
- One-click copy functionality
- Keyboard shortcuts
- Built-in help system
- Secure API integration

## Screenshots Needed
1. Extension popup interface
2. Input example
3. Generated prompt output
4. Help modal

## Category
Productivity

## Tags
ai, prompt, productivity, gemini, chatgpt, claude
`
};

Object.entries(storeAssets).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(storeDir, filename), content);
    console.log(`✅ Created: ${filename}`);
});

function copyDir(src, dest) {
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (fs.statSync(srcFile).isDirectory()) {
            if (!fs.existsSync(destFile)) {
                fs.mkdirSync(destFile);
            }
            copyDir(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

console.log('\n🎉 Chrome Web Store package created in:', storeDir);
console.log('\n📋 Next steps:');
console.log('1. Generate actual PNG icons (16x16, 32x32, 48x48, 128x128)');
console.log('2. Update manifest.json with your actual backend URL');
console.log('3. Create screenshots for store listing');
console.log('4. Update privacy policy with your contact info');
console.log('5. Test the extension thoroughly');
console.log('6. Zip the chrome-store-package folder for submission');
