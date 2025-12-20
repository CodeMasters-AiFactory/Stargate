# Auto-Start Server Script
# This script ensures Node.js is in PATH and starts the server

# Add Node.js to PATH if not already there
$nodePath = "C:\Program Files\nodejs"
if ($env:PATH -notlike "*$nodePath*") {
    $env:PATH = "$nodePath;$env:PATH"
}

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Stop any existing processes
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Stopping existing processes..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Check port 5000
$portInUse = netstat -ano | Select-String ":5000.*LISTENING"
if ($portInUse) {
    $pid = ($portInUse -split '\s+')[-1]
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# Change to project directory
Set-Location "C:\CURSOR PROJECTS\StargatePortal"

# Start server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Stargate Portal Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Node.js: $(& "$nodePath\node.exe" --version)" -ForegroundColor Green
Write-Host "Project: C:\CURSOR PROJECTS\StargatePortal" -ForegroundColor Green
Write-Host "Port: 5000" -ForegroundColor Green
Write-Host ""
Write-Host "Server starting..." -ForegroundColor Yellow
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" run dev
