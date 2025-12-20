# Simple Server Start and Test Script

Write-Host "Stopping old servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Starting minimal server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\CURSOR PROJECTS\StargatePortal'; npx cross-env NODE_ENV=development npx tsx server/index-minimal.ts"

Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Server should be running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Check the other PowerShell window for server logs" -ForegroundColor Yellow
