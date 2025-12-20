# Windows Startup Script - Fallback Auto-Start Mechanism
# This script can be run independently or added to Windows Startup/Task Scheduler
# It ensures the server starts even if VS Code task doesn't run

$ErrorActionPreference = "Continue"

# Get project directory
$projectDir = "C:\CURSOR PROJECTS\StargatePortal"

# Check if server is already running
Write-Host "[INFO] Checking if server is already running..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Server is already running at http://localhost:5000" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "[INFO] Server is not running, starting now..." -ForegroundColor Yellow
}

# Check port 5000
$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portCheck) {
    Write-Host "[WARN] Port 5000 is in use but server doesn't respond - freeing port..." -ForegroundColor Yellow
    $pid = $portCheck.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Change to project directory
Set-Location $projectDir

# Find Node.js
$nodePath = "C:\Program Files\nodejs"
if (-not (Test-Path "$nodePath\node.exe")) {
    $nodePath = "${env:LOCALAPPDATA}\Programs\nodejs"
}

if (-not (Test-Path "$nodePath\node.exe")) {
    Write-Host "[ERROR] Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Add Node.js to PATH
$env:PATH = "$nodePath;$env:PATH"

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Start server in background
Write-Host "[INFO] Starting server..." -ForegroundColor Cyan
$npmPath = Join-Path $nodePath "npm.cmd"

# Start server as background job
$serverJob = Start-Job -ScriptBlock {
    param($npmPath, $workDir, $nodePath)
    
    Set-Location $workDir
    $env:PATH = "$nodePath;$env:PATH"
    $env:NODE_ENV = "development"
    $env:PORT = "5000"
    
    & $npmPath run dev 2>&1
    
} -ArgumentList $npmPath, $projectDir, $nodePath

Write-Host "[OK] Server process started (Job ID: $($serverJob.Id))" -ForegroundColor Green
Write-Host "[INFO] Waiting for server to initialize (this may take 30-60 seconds)..." -ForegroundColor Gray

# Wait and verify server started
$maxWait = 60
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 5
    $waited += 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "[SUCCESS] Server is running at http://localhost:5000" -ForegroundColor Green
            break
        }
    } catch {
        # Server still starting
    }
    
    if ($waited % 15 -eq 0) {
        Write-Host "[INFO] Still waiting... ($waited seconds elapsed)" -ForegroundColor Gray
    }
}

if (-not $serverReady) {
    Write-Host "[WARN] Server did not become ready within $maxWait seconds" -ForegroundColor Yellow
    Write-Host "[INFO] Check the server job output for errors" -ForegroundColor Yellow
    Write-Host "[INFO] Job ID: $($serverJob.Id)" -ForegroundColor Gray
    exit 1
}

Write-Host "[SUCCESS] Server startup complete!" -ForegroundColor Green
Write-Host "[INFO] Server is running in background job: $($serverJob.Id)" -ForegroundColor Gray
Write-Host "[INFO] Access server at: http://localhost:5000" -ForegroundColor Cyan

