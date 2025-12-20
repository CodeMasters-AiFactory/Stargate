# Ensure All Services Are Running
# This script starts and verifies all required services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any existing processes
Write-Host "Step 1: Cleaning up existing processes..." -ForegroundColor Yellow
$existingProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existingProcs) {
    Write-Host "  Stopping $($existingProcs.Count) existing Node process(es)..." -ForegroundColor Gray
    $existingProcs | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "  ✅ All processes stopped" -ForegroundColor Green
} else {
    Write-Host "  ✅ No existing processes to stop" -ForegroundColor Green
}

# Step 2: Check dependencies
Write-Host ""
Write-Host "Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  ⚠️  node_modules not found. Installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✅ Dependencies found" -ForegroundColor Green
}

# Step 3: Check port availability
Write-Host ""
Write-Host "Step 3: Checking port 5000..." -ForegroundColor Yellow
$portInUse = netstat -ano | Select-String ":5000.*LISTENING"
if ($portInUse) {
    Write-Host "  ⚠️  Port 5000 is in use. Finding and stopping process..." -ForegroundColor Yellow
    $pid = ($portInUse -split '\s+')[-1]
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ Port 5000 freed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Port 5000 is available" -ForegroundColor Green
}

# Step 4: Set environment variables
Write-Host ""
Write-Host "Step 4: Setting environment variables..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:PORT = "5000"
Write-Host "  ✅ Environment configured" -ForegroundColor Green

# Step 5: Start the server
Write-Host ""
Write-Host "Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "  This will start:" -ForegroundColor Gray
Write-Host "    - Backend server (Express)" -ForegroundColor Gray
Write-Host "    - Frontend (Vite)" -ForegroundColor Gray
Write-Host "    - Agent Farm (auto-initializes)" -ForegroundColor Gray
Write-Host "    - Startup Agent (auto-verifies)" -ForegroundColor Gray
Write-Host ""

# Start server in background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:NODE_ENV = "development"
    $env:PORT = "5000"
    npm run dev 2>&1
}

Write-Host "  ✅ Server starting in background..." -ForegroundColor Green
Write-Host ""

# Step 6: Wait and verify
Write-Host "Step 6: Waiting for server to start..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        $serverReady = $true
        Write-Host "  ✅ Server is responding! (Status: $($response.StatusCode))" -ForegroundColor Green
        break
    } catch {
        Write-Host "  Waiting... ($waited/$maxWait seconds)" -ForegroundColor Gray
    }
}

if (-not $serverReady) {
    Write-Host ""
    Write-Host "  ⚠️  Server is taking longer than expected to start" -ForegroundColor Yellow
    Write-Host "  Checking server output..." -ForegroundColor Yellow
    
    # Get job output
    $output = Receive-Job -Job $job
    if ($output) {
        Write-Host ""
        Write-Host "  Server output:" -ForegroundColor Gray
        $output | Select-Object -Last 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    }
}

# Step 7: Final verification
Write-Host ""
Write-Host "Step 7: Final service verification..." -ForegroundColor Yellow

$allGood = $true

# Check Node processes
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "  ✅ Node processes running: $($nodeProcs.Count)" -ForegroundColor Green
} else {
    Write-Host "  ❌ No Node processes found" -ForegroundColor Red
    $allGood = $false
}

# Check port
$portCheck = netstat -ano | Select-String ":5000.*LISTENING"
if ($portCheck) {
    Write-Host "  ✅ Port 5000 is listening" -ForegroundColor Green
} else {
    Write-Host "  ❌ Port 5000 not listening" -ForegroundColor Red
    $allGood = $false
}

# Check HTTP response
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "  ✅ HTTP server responding (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ HTTP server not responding: $($_.Exception.Message)" -ForegroundColor Red
    $allGood = $false
}

# Final summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood -and $serverReady) {
    Write-Host "  ✅ ALL SERVICES RUNNING!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Frontend: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "🔌 API: http://localhost:5000/api/*" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Yellow
    Write-Host "  - Open http://localhost:5000 in your browser" -ForegroundColor White
    Write-Host "  - View your improved landing page" -ForegroundColor White
    Write-Host "  - Start developing!" -ForegroundColor White
    Write-Host ""
    Write-Host "To view server logs, check the background job output." -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  SOME SERVICES MAY NOT BE RUNNING" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - Server terminal output for errors" -ForegroundColor White
    Write-Host "  - Node.js is installed and in PATH" -ForegroundColor White
    Write-Host "  - Dependencies are installed (npm install)" -ForegroundColor White
    Write-Host ""
    Write-Host "To see server output:" -ForegroundColor Gray
    Write-Host "  Receive-Job -Job job" -ForegroundColor Gray
}

