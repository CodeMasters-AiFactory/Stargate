# Deep diagnostic test for investigation endpoint
# This will show us exactly what's happening

Write-Host "`n=== Deep Investigation Diagnostic Test ===" -ForegroundColor Cyan
Write-Host "This test will monitor the entire investigation process...`n" -ForegroundColor Yellow

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

Write-Host "1. Sending investigation request..." -ForegroundColor Cyan
Write-Host "   Business: Test Restaurant (restaurant)" -ForegroundColor Gray
Write-Host "   Competitors: 1 provided`n" -ForegroundColor Gray

$startTime = Get-Date
$messages = @()
$errors = @()

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $testPayload -ContentType "application/json" `
        -TimeoutSec 120 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "2. Response received!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Cyan
    Write-Host "   Time elapsed: $([math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)) seconds`n" -ForegroundColor Cyan
    
    Write-Host "3. Parsing SSE messages...`n" -ForegroundColor Cyan
    
    $lines = $response.Content -split "`n"
    $messageCount = 0
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                $messages += $data
                
                $timestamp = Get-Date -Format "HH:mm:ss"
                $stage = $data.stage
                $progress = $data.progress
                $msg = $data.message
                
                if ($stage -eq "error") {
                    Write-Host "[$timestamp] ❌ ERROR MESSAGE #$messageCount" -ForegroundColor Red
                    Write-Host "   Stage: $stage" -ForegroundColor Red
                    Write-Host "   Error: $($data.error)" -ForegroundColor Red
                    Write-Host "   Message: $msg" -ForegroundColor Red
                    $errors += $data
                } elseif ($stage -eq "complete") {
                    Write-Host "[$timestamp] ✅ COMPLETE MESSAGE #$messageCount" -ForegroundColor Green
                    Write-Host "   Stage: $stage" -ForegroundColor Green
                    Write-Host "   Progress: $progress%" -ForegroundColor Green
                    Write-Host "   Has data: $(!!$data.data)" -ForegroundColor Green
                } else {
                    Write-Host "[$timestamp] Message #$messageCount : [$stage] ($progress%)" -ForegroundColor Cyan
                    Write-Host "   $msg" -ForegroundColor Gray
                }
            } catch {
                Write-Host "   ⚠️ Failed to parse: $line" -ForegroundColor Yellow
            }
        } elseif ($line -match "^:\s*(.+)$") {
            Write-Host "   Comment: $($matches[1])" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    Write-Host "Error messages: $($errors.Count)" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Green" })
    Write-Host "Complete messages: $(($messages | Where-Object { $_.stage -eq 'complete' }).Count)" -ForegroundColor Cyan
    
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ ERRORS FOUND:" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   - $($err.error)" -ForegroundColor Red
        }
    }
    
    if ($messageCount -eq 1) {
        Write-Host "`n❌ PROBLEM: Only 1 message received" -ForegroundColor Red
        Write-Host "   This means the investigation stopped early." -ForegroundColor Yellow
        Write-Host "   Check the SERVER CONSOLE for detailed logs." -ForegroundColor Yellow
        exit 1
    } elseif (($messages | Where-Object { $_.stage -eq 'complete' }).Count -eq 0) {
        Write-Host "`n❌ PROBLEM: No complete message received" -ForegroundColor Red
        Write-Host "   Investigation did not complete successfully." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`n✅ Investigation completed successfully!" -ForegroundColor Green
        exit 0
    }
    
} catch {
    Write-Host "`n❌ REQUEST FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
    exit 1
}

