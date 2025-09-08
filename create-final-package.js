// Create final Chrome Web Store submission package
import fs from 'fs';
import path from 'path';

console.log('📦 Creating final Chrome Web Store submission package...\n');

const finalPackageDir = 'chrome-store-final';
const sourceDir = 'chrome-store-package';

// Create final package directory
if (fs.existsSync(finalPackageDir)) {
    fs.rmSync(finalPackageDir, { recursive: true });
}
fs.mkdirSync(finalPackageDir);

// Copy all extension files
const filesToCopy = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'icons/'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(finalPackageDir, file);
    
    if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
            // Copy directory
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

// Clean up icons directory - remove SVG files and HTML converters
const iconsDir = path.join(finalPackageDir, 'icons');
if (fs.existsSync(iconsDir)) {
    const files = fs.readdirSync(iconsDir);
    files.forEach(file => {
        if (file.endsWith('.svg') || file.endsWith('.html')) {
            fs.unlinkSync(path.join(iconsDir, file));
            console.log(`🗑️ Removed: icons/${file}`);
        }
    });
}

// Verify PNG icons exist
const requiredIcons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
let allIconsPresent = true;

requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
        console.log(`✅ Icon present: ${icon}`);
    } else {
        console.log(`❌ Missing icon: ${icon}`);
        allIconsPresent = false;
    }
});

// Create submission info file
const submissionInfo = `# Chrome Web Store Submission Package

## Package Contents
- manifest.json - Extension configuration
- popup.html - User interface
- popup.css - Styling
- popup.js - Functionality
- icons/ - Extension icons (16, 32, 48, 128px PNG files)

## Next Steps
1. Deploy backend server (see DEPLOYMENT_GUIDE.md)
2. Update popup.js with production API URL
3. Update manifest.json host_permissions with your domain
4. Create screenshots (1280x800 or 640x400)
5. Zip this folder and submit to Chrome Web Store

## Files Ready for Submission
${allIconsPresent ? '✅ All required files present' : '❌ Some files missing'}

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(finalPackageDir, 'SUBMISSION_INFO.md'), submissionInfo);

console.log('\n🎉 Final submission package created!');
console.log(`📁 Location: ${finalPackageDir}/`);
console.log(`📊 Icons status: ${allIconsPresent ? '✅ Complete' : '❌ Incomplete'}`);

if (allIconsPresent) {
    console.log('\n🚀 Ready for Chrome Web Store submission!');
    console.log('\n📋 Final checklist:');
    console.log('✅ PNG icons generated');
    console.log('✅ Extension files organized');
    console.log('✅ Development files removed');
    console.log('⚠️ Deploy backend server');
    console.log('⚠️ Update production URLs');
    console.log('⚠️ Create screenshots');
    console.log('⚠️ Submit to Chrome Web Store');
} else {
    console.log('\n❌ Please generate missing icons before submission');
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (fs.statSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}
