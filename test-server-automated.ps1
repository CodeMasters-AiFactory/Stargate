# Automated Server Testing Script
# This script kills old servers, starts fresh, and tests everything

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Automated Server Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all Node processes
Write-Host "1. Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   ✓ Done" -ForegroundColor Green
Write-Host ""

# Step 2: Start minimal server
Write-Host "2. Starting minimal server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location "c:\CURSOR PROJECTS\StargatePortal"
    npx cross-env NODE_ENV=development npx tsx server/index-minimal.ts
}
Start-Sleep -Seconds 8
Write-Host "   ✓ Server started" -ForegroundColor Green
Write-Host ""

# Step 3: Test server responds
Write-Host "3. Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Server responding: $($healthData.server)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Server not responding" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Stop-Job -Job $serverJob
    Remove-Job -Job $serverJob
    exit 1
}
Write-Host ""

# Step 4: Open browser
Write-Host "4. Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5000"
Start-Sleep -Seconds 3
Write-Host "   ✓ Browser opened" -ForegroundColor Green
Write-Host ""

# Step 5: Show server logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server is running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Server logs:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# Show live logs
Receive-Job -Job $serverJob -Wait
