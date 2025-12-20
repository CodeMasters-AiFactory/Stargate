# Verify Server is Running
Write-Host "Verifying server status..." -ForegroundColor Cyan

Start-Sleep -Seconds 5

$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
$portCheck = netstat -ano | Select-String ":5000.*LISTENING"

if ($nodeProcs -and $portCheck) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing
        Write-Host "âœ… Server is running on http://localhost:5000" -ForegroundColor Green
    } catch {
        Write-Host "âš ï¸ Server starting... (Status: )" -ForegroundColor Yellow
    }
} else {
    Write-Host "âš ï¸ Server may still be starting..." -ForegroundColor Yellow
}
