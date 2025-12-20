# Quick Investigation Test (assumes server is running)
Write-Host "`n=== Quick Investigation Test ===" -ForegroundColor Cyan
Write-Host "Make sure server is running on port 5000 first!`n" -ForegroundColor Yellow

# Check if server is running
$port5000 = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if (-not $port5000) {
    Write-Host "ERROR: Server is not running on port 5000" -ForegroundColor Red
    Write-Host "Please start the server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Server is running`n" -ForegroundColor Green

# Test payload
$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

Write-Host "Sending investigation request...`n" -ForegroundColor Cyan

$startTime = Get-Date
$messages = @()
$errors = @()
$completeReceived = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $testPayload -ContentType "application/json" `
        -TimeoutSec 120 -UseBasicParsing -ErrorAction Stop
    
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    Write-Host "✅ Response received! (Time: ${elapsed}s)`n" -ForegroundColor Green
    
    # Parse messages
    $lines = $response.Content -split "`n"
    $messageCount = 0
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                $messages += $data
                $stage = $data.stage
                $progress = $data.progress
                
                if ($stage -eq "error") {
                    Write-Host "❌ ERROR: $($data.error)" -ForegroundColor Red
                    $errors += $data
                } elseif ($stage -eq "complete") {
                    Write-Host "✅ COMPLETE: Investigation finished!" -ForegroundColor Green
                    $completeReceived = $true
                } else {
                    $progressText = "$progress percent"
                    Write-Host "📊 [$stage] ($progressText)" -ForegroundColor Cyan
                }
            } catch {
                # Skip parse errors
            }
        }
    }
    
    Write-Host "`n=== Results ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    Write-Host "Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "Complete received: $completeReceived" -ForegroundColor $(if ($completeReceived) { "Green" } else { "Red" })
    
    if ($messageCount -gt 1 -and $completeReceived -and $errors.Count -eq 0) {
        Write-Host "`n✅ TEST PASSED!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
        if ($messageCount -eq 1) {
            Write-Host "   Issue: Only 1 message received - investigation stopped early" -ForegroundColor Yellow
        }
        if (-not $completeReceived) {
            Write-Host "   Issue: No complete message received" -ForegroundColor Yellow
        }
        if ($errors.Count -gt 0) {
            Write-Host "   Issue: Errors detected" -ForegroundColor Yellow
        }
        exit 1
    }
    
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "Request failed: $errorMsg" -ForegroundColor Red
    exit 1
}

