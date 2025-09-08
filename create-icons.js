// Create simple icon files for Chrome extension
import fs from 'fs';

console.log('🎨 Creating Chrome extension icons...\n');

// Create a simple SVG icon that can be converted to PNG
const svgIcon = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#grad)"/>
  <text x="64" y="80" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">✨</text>
</svg>`;

// Create SVG files for each size
const sizes = [16, 32, 48, 128];
const storeDir = 'chrome-store-package/icons';

sizes.forEach(size => {
    const svgContent = svgIcon.replace('128', size).replace('60', Math.floor(size * 0.47)).replace('80', Math.floor(size * 0.625));
    const filename = `${storeDir}/icon${size}.svg`;
    fs.writeFileSync(filename, svgContent);
    console.log(`✅ Created: icon${size}.svg`);
});

// Create a simple HTML file to convert SVG to PNG
const converterHtml = `<!DOCTYPE html>
<html>
<head>
    <title>SVG to PNG Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon { margin: 20px; display: inline-block; }
        canvas { border: 1px solid #ccc; }
        .download-btn { margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Convert SVG Icons to PNG</h1>
    <p>Click "Download" for each icon to get the PNG version.</p>
    
    ${sizes.map(size => `
    <div class="icon">
        <h3>${size}x${size}</h3>
        <canvas id="icon${size}" width="${size}" height="${size}"></canvas>
        <br>
        <button class="download-btn" onclick="downloadIcon('icon${size}', 'icon${size}.png')">Download PNG</button>
    </div>
    `).join('')}

    <script>
        function drawIcon(canvasId, size) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            // Rounded corners
            ctx.globalCompositeOperation = 'destination-in';
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, size * 0.16);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            
            // Sparkle icon
            ctx.fillStyle = 'white';
            ctx.font = \`\${size * 0.47}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', size/2, size/2);
        }
        
        function downloadIcon(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // Generate all icons
        ${sizes.map(size => `drawIcon('icon${size}', ${size});`).join('\n        ')}
    </script>
</body>
</html>`;

fs.writeFileSync(`${storeDir}/convert-to-png.html`, converterHtml);
console.log('✅ Created: convert-to-png.html');

console.log('\n📋 Next steps:');
console.log('1. Open chrome-store-package/icons/convert-to-png.html in your browser');
console.log('2. Download all 4 PNG files (icon16.png, icon32.png, icon48.png, icon128.png)');
console.log('3. Save them in the chrome-store-package/icons/ folder');
console.log('4. Update manifest.json to reference .png files instead of .svg');
