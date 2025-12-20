# Test using curl (which properly handles SSE streams)

Write-Host "`n=== Testing with curl (SSE-compatible) ===" -ForegroundColor Cyan

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

$payloadFile = "$env:TEMP\test-payload.json"
$testPayload | Out-File -FilePath $payloadFile -Encoding UTF8

Write-Host "Sending request with curl (will show all SSE messages)...`n" -ForegroundColor Yellow

try {
    # Use curl which properly handles SSE streams
    $curlOutput = & curl.exe -X POST `
        -H "Content-Type: application/json" `
        -d "@$payloadFile" `
        -N `
        -s `
        --max-time 90 `
        "http://localhost:5000/api/website-builder/investigate" 2>&1
    
    $messageCount = 0
    $lines = $curlOutput -split "`n"
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "[$timestamp] Message #$messageCount : [$($data.stage)] ($($data.progress)%) $($data.message)" -ForegroundColor Cyan
                
                if ($data.stage -eq "complete") {
                    Write-Host "`n✅ Received complete message!" -ForegroundColor Green
                    break
                }
            } catch {
                Write-Host "   ⚠️ Failed to parse: $line" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    
    if ($messageCount -eq 1) {
        Write-Host "`n❌ Only 1 message - investigation stopped early" -ForegroundColor Red
        Write-Host "Check SERVER CONSOLE for logs" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`n✅ Multiple messages received!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure curl is installed (comes with Windows 10+)" -ForegroundColor Yellow
    exit 1
} finally {
    if (Test-Path $payloadFile) {
        Remove-Item $payloadFile -Force
    }
}

