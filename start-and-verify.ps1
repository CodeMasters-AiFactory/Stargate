# Start Server and Verify All Services
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Start server (this will show output)
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host "Watch for any errors below:" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

cd "C:\CURSOR PROJECTS\StargatePortal"
npm run dev

