# Test investigation and show detailed progress with server log monitoring
# This helps us see exactly where the process stops

param(
    [int]$Timeout = 30
)

$ErrorActionPreference = "Continue"

Write-Host "`n=== Investigation Test with Detailed Monitoring ===" -ForegroundColor Cyan
Write-Host "This will test the investigation and show detailed progress`n" -ForegroundColor Yellow

# Step 1: Check server
Write-Host "[1] Checking server health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Server is responding (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease start the server first: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Step 2: Send investigation request
Write-Host "`n[2] Preparing investigation request..." -ForegroundColor Yellow
$payload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A test restaurant for detailed monitoring"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

Write-Host "   📤 Request payload:" -ForegroundColor Gray
Write-Host "      Business: Test Restaurant" -ForegroundColor White
Write-Host "      Type: restaurant" -ForegroundColor White
Write-Host "      Competitors: 1" -ForegroundColor White

# Step 3: Send request and monitor
Write-Host "`n[3] Sending investigation request..." -ForegroundColor Yellow
Write-Host "   ⏳ Waiting for response (timeout: ${Timeout}s)..." -ForegroundColor Gray

$startTime = Get-Date
$messages = @()
$stages = @()
$completeReceived = $false
$errorReceived = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $payload -ContentType "application/json" `
        -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
    
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    Write-Host "   ✅ Response received in ${elapsed}s" -ForegroundColor Green
    
    # Parse SSE messages
    Write-Host "`n[4] Parsing SSE messages..." -ForegroundColor Yellow
    $lines = $response.Content -split "`n"
    $messageNumber = 0
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageNumber++
            try {
                $data = $matches[1] | ConvertFrom-Json
                $messages += $data
                $stages += $data.stage
                
                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "   [$timestamp] Message #$messageNumber" -ForegroundColor Cyan
                Write-Host "      Stage: $($data.stage)" -ForegroundColor White
                Write-Host "      Progress: $($data.progress)%" -ForegroundColor White
                if ($data.message) {
                    Write-Host "      Message: $($data.message)" -ForegroundColor Gray
                }
                if ($data.error) {
                    Write-Host "      Error: $($data.error)" -ForegroundColor Red
                    $errorReceived = $true
                }
                
                if ($data.stage -eq "complete") {
                    $completeReceived = $true
                    Write-Host "      COMPLETE message received!" -ForegroundColor Green
                    if ($data.data) {
                        $keys = $data.data.PSObject.Properties.Name -join ', '
                        Write-Host "      Data keys: $keys" -ForegroundColor Gray
                    }
                }
            } catch {
                $msg = $_.Exception.Message
                $linePreview = if ($line.Length -gt 100) { $line.Substring(0, 100) } else { $line }
                Write-Host "   Warning: Failed to parse message #$messageNumber : $msg" -ForegroundColor Yellow
                Write-Host "      Raw line: $linePreview" -ForegroundColor Gray
            }
        } elseif ($line -match "^:\s*(.+)$") {
            # Comment/keepalive message
            $comment = $matches[1].Trim()
            if ($comment -eq "connected") {
                Write-Host "   SSE connection established" -ForegroundColor Green
            } elseif ($comment -eq "keepalive") {
                Write-Host "   Keep-alive received" -ForegroundColor Gray
            }
        }
    }
    
    # Summary
    Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Total messages: $($messages.Count)" -ForegroundColor White
    Write-Host "Stages received: $($stages -join ', ')" -ForegroundColor White
    Write-Host "Complete received: $(if ($completeReceived) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($completeReceived) { "Green" } else { "Red" })
    Write-Host "Error received: $(if ($errorReceived) { '❌ YES' } else { '✅ NO' })" -ForegroundColor $(if ($errorReceived) { "Red" } else { "Green" })
    Write-Host "Total time: ${elapsed}s" -ForegroundColor White
    
    # Analysis
    Write-Host "`n=== ANALYSIS ===" -ForegroundColor Cyan
    if ($completeReceived -and $messages.Count -ge 3 -and -not $errorReceived) {
        Write-Host "✅✅✅ TEST PASSED! ✅✅✅" -ForegroundColor Green
        Write-Host "   All messages received successfully" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ TEST FAILED" -ForegroundColor Red
        Write-Host "`nIssues found:" -ForegroundColor Yellow
        if (-not $completeReceived) {
            Write-Host "   - Complete message NOT received" -ForegroundColor Red
            Write-Host "     Expected stages: keyword_research, competitor_analysis, ai_strategy, complete" -ForegroundColor Gray
            $stagesStr = $stages -join ', '
            Write-Host "     Received stages: $stagesStr" -ForegroundColor Gray
        }
        if ($messages.Count -lt 3) {
            Write-Host "   - Only $($messages.Count) message(s) received (expected at least 3)" -ForegroundColor Red
        }
        if ($errorReceived) {
            Write-Host "   - Error message received" -ForegroundColor Red
        }
        
        Write-Host "`n🔍 Next Steps:" -ForegroundColor Yellow
        Write-Host "   1. Check server console for [STEP X] logs" -ForegroundColor White
        Write-Host "   2. Check server console for [ROUTE] logs" -ForegroundColor White
        Write-Host "   3. Look for errors or warnings in server output" -ForegroundColor White
        Write-Host "   4. Verify the server restarted after code changes" -ForegroundColor White
        exit 1
    }
    
} catch {
    Write-Host "`n❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Error type: $($_.Exception.GetType().Name)" -ForegroundColor Gray
    if ($_.Exception.Response) {
        Write-Host "   Status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
    exit 1
}

