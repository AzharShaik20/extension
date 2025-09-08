@echo off
echo AI Prompter Chrome Extension Setup
echo ================================

echo.
echo Step 1: Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up environment file...
if not exist .env (
    copy env.example .env
    echo Created .env file. Please edit it and add your Gemini API key.
) else (
    echo .env file already exists.
)

echo.
echo Step 3: Generating icons...
echo Please open icons/generate_icons.html in your browser and download all icons.

echo.
echo Setup complete! Next steps:
echo 1. Edit .env file and add your Gemini API key
echo 2. Run: npm start (to start the backend server)
echo 3. Load the extension in Chrome from chrome://extensions/
echo.
pause
