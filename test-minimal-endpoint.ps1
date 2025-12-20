# Test the minimal endpoint to verify SSE works
Write-Host "`n=== Testing Minimal SSE Endpoint ===" -ForegroundColor Cyan
Write-Host "This tests if SSE streaming works at all...`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate-minimal" `
        -Method POST -ContentType "application/json" `
        -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop

    Write-Host "✅ Response received! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nParsing messages...`n" -ForegroundColor Cyan

    $lines = $response.Content -split "`n"
    $messageCount = 0

    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                Write-Host "[$messageCount] Stage: $($data.stage), Progress: $($data.progress)%" -ForegroundColor Cyan
                Write-Host "   Message: $($data.message)" -ForegroundColor Gray
            } catch {
                Write-Host "[$messageCount] (parse error)" -ForegroundColor Yellow
            }
        }
    }

    Write-Host "`n=== Results ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -ge 3) { "Green" } else { "Red" })

    if ($messageCount -ge 3) {
        Write-Host "`n✅ MINIMAL TEST PASSED - SSE is working!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n❌ MINIMAL TEST FAILED - Only $messageCount messages received" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "`n❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

