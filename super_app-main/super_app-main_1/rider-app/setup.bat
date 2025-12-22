@echo off
echo 🚀 Setting up Rider App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if api.js exists, if not copy from example
if not exist "src\config\api.js" (
    echo 🔧 Setting up API configuration...
    copy "src\config\api.example.js" "src\config\api.js"
    echo ⚠️  IMPORTANT: Please edit src\config\api.js and add your API keys:
    echo    - LocationIQ API key (required for routing)
    echo    - Google Maps API key (optional)
    echo.
    echo    Get LocationIQ API key: https://locationiq.com/
    echo    Get Google Maps API key: https://console.cloud.google.com/
) else (
    echo ✅ API configuration already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit src\config\api.js and add your API keys
echo 2. Run 'npm start' to start the development server
echo 3. Open http://localhost:3000 in your browser
echo.
echo Demo credentials:
echo    Email: captain@pilot.com
echo    Password: password123
echo.
pause
