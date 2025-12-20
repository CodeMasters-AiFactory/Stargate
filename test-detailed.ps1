# Detailed investigation test with step-by-step monitoring

$ErrorActionPreference = "Continue"

Write-Host "`n=== Detailed Investigation Test ===" -ForegroundColor Cyan
Write-Host "Testing investigation endpoint with detailed progress monitoring`n" -ForegroundColor Yellow

# Check server
Write-Host "[1] Checking server..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   Server is responding" -ForegroundColor Green
} catch {
    Write-Host "   Server not responding. Please start server first." -ForegroundColor Red
    exit 1
}

# Prepare request
Write-Host "`n[2] Preparing request..." -ForegroundColor Yellow
$payload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "Test"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

# Send request
Write-Host "[3] Sending request..." -ForegroundColor Yellow
$startTime = Get-Date
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $payload -ContentType "application/json" `
        -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
    
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    Write-Host "   Response received in ${elapsed}s" -ForegroundColor Green
    
    # Parse messages
    Write-Host "`n[4] Parsing messages..." -ForegroundColor Yellow
    $lines = $response.Content -split "`n"
    $messages = @()
    $stages = @()
    $completeReceived = $false
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            try {
                $json = $matches[1]
                $data = $json | ConvertFrom-Json
                $messages += $data
                $stages += $data.stage
                
                $num = $messages.Count
                Write-Host "   Message #$num : $($data.stage) ($($data.progress)%)" -ForegroundColor Cyan
                if ($data.message) {
                    Write-Host "      $($data.message)" -ForegroundColor Gray
                }
                if ($data.stage -eq "complete") {
                    $completeReceived = $true
                    Write-Host "      COMPLETE!" -ForegroundColor Green
                }
            } catch {
                Write-Host "   Warning: Failed to parse line" -ForegroundColor Yellow
            }
        }
    }
    
    # Summary
    Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Messages: $($messages.Count)" -ForegroundColor White
    Write-Host "Stages: $($stages -join ', ')" -ForegroundColor White
    Write-Host "Complete: $(if ($completeReceived) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($completeReceived) { "Green" } else { "Red" })
    
    if ($completeReceived -and $messages.Count -ge 3) {
        Write-Host "`nTEST PASSED!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`nTEST FAILED" -ForegroundColor Red
        Write-Host "Check server console for [STEP X] logs" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "`nRequest failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

