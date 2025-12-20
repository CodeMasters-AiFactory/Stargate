# Quick Start Script for Boardroom PC
# Run this to automatically set up and start the project

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   STARGATE PORTAL - BOARDROOM QUICK START" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org" -ForegroundColor Yellow
    Write-Host "Download the LTS version and install it, then run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Check npm
Write-Host "[2/5] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Check if node_modules exists
Write-Host "[3/5] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "[INFO] Installing dependencies (this may take 2-5 minutes)..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
        Write-Host "Try running: npm install" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Dependencies installed successfully" -ForegroundColor Green
}

# Step 4: Check if .env exists
Write-Host "[4/5] Checking configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "[WARN] .env file not found. Creating default..." -ForegroundColor Yellow
    @"
PORT=5000
NODE_ENV=development
DATABASE_URL=your_database_url_here
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "[OK] Created .env file" -ForegroundColor Green
} else {
    Write-Host "[OK] Configuration file found" -ForegroundColor Green
}

# Step 5: Start server
Write-Host "[5/5] Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Green
Write-Host "   STARTING SERVER..." -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server will start on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm run dev

