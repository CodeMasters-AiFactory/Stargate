@echo off
REM Stargate Portal - Auto-Start Services Script (Windows Batch)
REM This script starts all required services when opening the project

echo.
echo 🚀 Starting Stargate Portal Services...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Start the development server in a new window
echo 🌐 Starting development server on http://localhost:5000...
echo.

start "Stargate Portal - Dev Server" cmd /k "npm run dev"

echo ✅ Development server starting in new window
echo.
echo 📝 Services Status:
echo    • Frontend + Backend: Starting on port 5000
echo.
echo 🌐 Open your browser to: http://localhost:5000
echo.
echo Press any key to close this window (server will continue running)...
pause >nul

