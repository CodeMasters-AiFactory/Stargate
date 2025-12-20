# Final investigation test
Write-Host "`n=== Testing Investigation Endpoint ===" -ForegroundColor Cyan

$payload = '{"businessType":"restaurant","businessName":"Test Restaurant","description":"Test","competitors":[{"url":"https://www.example.com"}]}'

try {
    Write-Host "Sending request..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $payload -ContentType "application/json" `
        -TimeoutSec 60 -UseBasicParsing
    
    Write-Host "Response received! Status: $($response.StatusCode)" -ForegroundColor Green
    
    $lines = $response.Content -split "`n"
    $messages = 0
    $complete = $false
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messages++
            try {
                $data = $matches[1] | ConvertFrom-Json
                Write-Host "[$messages] $($data.stage) - $($data.progress)%" -ForegroundColor Cyan
                if ($data.stage -eq "complete") {
                    $complete = $true
                }
            } catch {}
        }
    }
    
    Write-Host "`nTotal messages: $messages" -ForegroundColor Yellow
    Write-Host "Complete received: $complete" -ForegroundColor $(if ($complete) { "Green" } else { "Red" })
    
    if ($complete -and $messages -ge 3) {
        Write-Host "`nSUCCESS! Investigation completed!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`nFAILED - Investigation incomplete" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

