# Visual Testing - Shows step-by-step execution like Replit's live testing
# Displays what's happening in real-time with visual feedback

param(
    [switch]$Watch = $false
)

function Show-Step {
    param(
        [string]$Step,
        [string]$Status = "running",
        [string]$Details = ""
    )
    
    $symbol = switch ($Status) {
        "running" { "⏳" }
        "success" { "✅" }
        "error" { "❌" }
        "warning" { "⚠️" }
        default { "•" }
    }
    
    $color = switch ($Status) {
        "running" { "Yellow" }
        "success" { "Green" }
        "error" { "Red" }
        "warning" { "Yellow" }
        default { "White" }
    }
    
    Write-Host "$symbol $Step" -ForegroundColor $color
    if ($Details) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
}

function Test-InvestigationVisual {
    Write-Host "`n=== VISUAL TEST EXECUTION ===" -ForegroundColor Cyan
    Write-Host "This shows each step as it executes (like Replit's live testing)`n" -ForegroundColor Yellow
    
    # Step 1: Server Check
    Show-Step "Checking server health" "running"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Show-Step "Server is responding" "success" "Status: $($response.StatusCode)"
    } catch {
        Show-Step "Server check failed" "error" $_.Exception.Message
        return $false
    }
    
    # Step 2: Send Request
    Show-Step "Preparing investigation request" "running"
    $payload = @{
        businessType = "restaurant"
        businessName = "Test Restaurant"
        description = "Visual test"
        competitors = @(@{ url = "https://www.example.com" })
    } | ConvertTo-Json -Depth 10
    Show-Step "Request prepared" "success" "Business: Test Restaurant"
    
    # Step 3: Send Request
    Show-Step "Sending investigation request" "running"
    $startTime = Get-Date
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
            -Method POST -Body $payload -ContentType "application/json" `
            -TimeoutSec 120 -UseBasicParsing -ErrorAction Stop
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
        Show-Step "Request sent and response received" "success" "Time: ${elapsed}s"
    } catch {
        Show-Step "Request failed" "error" $_.Exception.Message
        return $false
    }
    
    # Step 4: Parse Messages
    Show-Step "Parsing SSE messages" "running"
    $lines = $response.Content -split "`n"
    $messages = @()
    $stages = @()
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            try {
                $data = $matches[1] | ConvertFrom-Json
                $messages += $data
                $stages += $data.stage
                
                Show-Step "Message received: $($data.stage)" "success" "Progress: $($data.progress)%"
                
                if ($data.stage -eq "complete") {
                    Show-Step "Complete message received" "success" "Investigation finished!"
                } elseif ($data.stage -eq "error") {
                    Show-Step "Error message received" "error" $data.error
                }
            } catch {
                Show-Step "Failed to parse message" "warning" $line
            }
        }
    }
    
    Show-Step "Message parsing complete" "success" "Total: $($messages.Count) messages"
    
    # Step 5: Validate Results
    Show-Step "Validating test results" "running"
    $completeReceived = $stages -contains "complete"
    $hasErrors = $stages -contains "error"
    $minMessages = $messages.Count -ge 3
    
    if ($completeReceived) {
        Show-Step "Complete message found" "success"
    } else {
        Show-Step "Complete message missing" "error"
    }
    
    if ($minMessages) {
        Show-Step "Minimum messages received" "success" "$($messages.Count) messages"
    } else {
        Show-Step "Insufficient messages" "error" "Only $($messages.Count) messages (need 3+)"
    }
    
    if (-not $hasErrors) {
        Show-Step "No errors detected" "success"
    } else {
        Show-Step "Errors detected" "error"
    }
    
    # Final Result
    if ($completeReceived -and $minMessages -and -not $hasErrors) {
        Write-Host "`n✅✅✅ TEST PASSED ✅✅✅" -ForegroundColor Green
        return $true
    } else {
        Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
        return $false
    }
}

# Run visual test
if ($Watch) {
    Write-Host "Watching mode - will run test continuously..." -ForegroundColor Yellow
    while ($true) {
        Test-InvestigationVisual
        Write-Host "`n⏳ Waiting 30 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
} else {
    Test-InvestigationVisual
}

