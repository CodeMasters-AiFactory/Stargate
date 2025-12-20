# Automated Testing System - Like Replit's Live Testing
# Tests the investigation endpoint step-by-step with visual feedback

param(
    [int]$MaxRetries = 3,
    [int]$TestTimeout = 120,
    [switch]$Interactive = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param($Message, $Color = "Cyan")
    Write-Host "`n[$($script:StepNumber)] $Message" -ForegroundColor $Color
    $script:StepNumber++
}

function Test-ServerHealth {
    Write-Step "Checking server health..." "Yellow"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Server is responding" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "   ❌ Server is not responding" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-InvestigationEndpoint {
    param($Attempt = 1)
    
    Write-Step "Testing investigation endpoint (Attempt $Attempt/$MaxRetries)..." "Yellow"
    
    $payload = @{
        businessType = "restaurant"
        businessName = "Test Restaurant"
        description = "A test restaurant for automated testing"
        competitors = @(
            @{ url = "https://www.example.com" }
        )
    } | ConvertTo-Json -Depth 10
    
    Write-Host "   📤 Sending request..." -ForegroundColor Gray
    $startTime = Get-Date
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
            -Method POST -Body $payload -ContentType "application/json" `
            -TimeoutSec $TestTimeout -UseBasicParsing -ErrorAction Stop
        
        $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
        Write-Host "   ✅ Response received in ${elapsed}s" -ForegroundColor Green
        
        # Parse SSE messages
        $lines = $response.Content -split "`n"
        $messages = @()
        $stages = @()
        $completeReceived = $false
        $errorReceived = $false
        
        foreach ($line in $lines) {
            if ($line -match "^data:\s*(.+)$") {
                try {
                    $data = $matches[1] | ConvertFrom-Json
                    $messages += $data
                    $stages += $data.stage
                    
                    Write-Host "   📊 [$($data.stage)] ($($data.progress)%)" -ForegroundColor Cyan
                    
                    if ($data.stage -eq "complete") {
                        $completeReceived = $true
                        Write-Host "   ✅ COMPLETE message received!" -ForegroundColor Green
                    } elseif ($data.stage -eq "error") {
                        $errorReceived = $true
                        Write-Host "   ❌ ERROR: $($data.error)" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "   ⚠️ Failed to parse message: $line" -ForegroundColor Yellow
                }
            }
        }
        
        # Test Results
        Write-Step "Analyzing test results..." "Yellow"
        Write-Host "   Total messages: $($messages.Count)" -ForegroundColor White
        Write-Host "   Stages received: $($stages -join ', ')" -ForegroundColor White
        Write-Host "   Complete received: $completeReceived" -ForegroundColor $(if ($completeReceived) { "Green" } else { "Red" })
        Write-Host "   Error received: $errorReceived" -ForegroundColor $(if ($errorReceived) { "Red" } else { "Green" })
        
        # Success criteria
        $success = $completeReceived -and $messages.Count -ge 3 -and -not $errorReceived
        
        if ($success) {
            Write-Host "`n   ✅✅✅ TEST PASSED! ✅✅✅" -ForegroundColor Green
            return @{ Success = $true; Messages = $messages.Count; Stages = $stages }
        } else {
            Write-Host "`n   ❌ TEST FAILED" -ForegroundColor Red
            Write-Host "   Reasons:" -ForegroundColor Yellow
            if (-not $completeReceived) {
                Write-Host "     - Complete message not received" -ForegroundColor Red
            }
            if ($messages.Count -lt 3) {
                Write-Host "     - Only $($messages.Count) messages received (expected at least 3)" -ForegroundColor Red
            }
            if ($errorReceived) {
                Write-Host "     - Error message received" -ForegroundColor Red
            }
            return @{ Success = $false; Messages = $messages.Count; Stages = $stages }
        }
        
    } catch {
        Write-Host "   ❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Invoke-AutoRetry {
    Write-Host "`n=== AUTOMATED TESTING SYSTEM ===" -ForegroundColor Cyan
    Write-Host "Testing investigation endpoint with auto-retry..." -ForegroundColor Yellow
    
    $script:StepNumber = 1
    
    # Step 1: Check server
    if (-not (Test-ServerHealth)) {
        Write-Host "`n❌ Server is not running. Please start the server first." -ForegroundColor Red
        Write-Host "   Run: npm run dev" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 2: Run tests with retry
    $attempt = 1
    $result = $null
    
    while ($attempt -le $MaxRetries) {
        Write-Host "`n--- Test Attempt $attempt/$MaxRetries ---" -ForegroundColor Cyan
        
        $result = Test-InvestigationEndpoint -Attempt $attempt
        
        if ($result.Success) {
            Write-Host "`n✅✅✅ ALL TESTS PASSED! ✅✅✅" -ForegroundColor Green
            Write-Host "   Messages: $($result.Messages)" -ForegroundColor White
            Write-Host "   Stages: $($result.Stages -join ', ')" -ForegroundColor White
            exit 0
        }
        
        if ($attempt -lt $MaxRetries) {
            Write-Host "`n⏳ Waiting 5 seconds before retry..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
        
        $attempt++
    }
    
    # All attempts failed
    Write-Host "`n❌❌❌ ALL TEST ATTEMPTS FAILED ❌❌❌" -ForegroundColor Red
    Write-Host "`nInvestigation:" -ForegroundColor Yellow
    Write-Host "   1. Check server console for [STEP X] logs" -ForegroundColor White
    Write-Host "   2. Check server console for [ROUTE] logs" -ForegroundColor White
    Write-Host "   3. Look for errors in the server output" -ForegroundColor White
    Write-Host "   4. Verify server is running latest code (restart if needed)" -ForegroundColor White
    
    exit 1
}

# Run the automated test
Invoke-AutoRetry

