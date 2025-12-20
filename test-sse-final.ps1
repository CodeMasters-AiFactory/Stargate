# Final SSE Test - Simplified version

$ErrorActionPreference = "Continue"

Write-Host "`n=== Final SSE Stream Test ===" -ForegroundColor Cyan

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

Write-Host "Sending request...`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $testPayload -ContentType "application/json" `
        -TimeoutSec 90 -UseBasicParsing
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "Content Length: $($response.Content.Length) bytes`n" -ForegroundColor Cyan
    
    # Count SSE messages
    $lines = $response.Content -split "`n"
    $messageCount = 0
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                Write-Host "Message #$messageCount : [$($data.stage)] ($($data.progress)%) $($data.message)" -ForegroundColor Cyan
            } catch {
                Write-Host "Message #$messageCount : (parse error)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    
    if ($messageCount -eq 1) {
        Write-Host "`n❌ Only 1 message - investigation stopped early" -ForegroundColor Red
        Write-Host "Check SERVER CONSOLE for logs starting with [Investigation]" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`n✅ Multiple messages received!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

