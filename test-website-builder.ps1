# Comprehensive Website Builder Test Script
# Tests the investigation endpoint step by step with automatic error handling

param(
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  WEBSITE BUILDER TEST - STEP BY STEP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Server
Write-Host "[STEP 1] Checking server status..." -ForegroundColor Yellow
$serverTest = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $serverTest) {
    Write-Host "❌ Server is NOT running on port 5000" -ForegroundColor Red
    Write-Host "Please start the server first: npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Server is running" -ForegroundColor Green

# Step 2: Prepare test payload
Write-Host "`n[STEP 2] Preparing test request..." -ForegroundColor Yellow
$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

Write-Host "✅ Test payload prepared" -ForegroundColor Green
Write-Host "   Business: Test Restaurant" -ForegroundColor Gray
Write-Host "   Type: restaurant" -ForegroundColor Gray
Write-Host "   Competitors: 1" -ForegroundColor Gray

# Step 3: Send request and monitor SSE stream
Write-Host "`n[STEP 3] Sending investigation request..." -ForegroundColor Yellow
Write-Host "   (This may take 30-60 seconds)" -ForegroundColor Gray

$errors = @()
$progressMessages = @()
$finalResult = $null
$testFailed = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST `
        -Body $testPayload `
        -ContentType "application/json" `
        -TimeoutSec $TimeoutSeconds `
        -UseBasicParsing `
        -ErrorAction Stop

    Write-Host "✅ Request completed" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Cyan

    # Parse SSE stream
    $lines = $response.Content -split "`n"
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            try {
                $data = $matches[1] | ConvertFrom-Json
                
                if ($data.stage) {
                    $progressMessages += $data
                    $stage = $data.stage
                    $progress = $data.progress
                    $message = $data.message
                    
                    Write-Host "   [$stage] ($progress%) $message" -ForegroundColor Cyan
                    
                    if ($data.error) {
                        $errors += $data.error
                        Write-Host "   ❌ ERROR: $($data.error)" -ForegroundColor Red
                        $testFailed = $true
                    }
                    
                    if ($data.data) {
                        $finalResult = $data.data
                    }
                }
            } catch {
                Write-Host "   ⚠️ Failed to parse SSE line: $line" -ForegroundColor Yellow
            }
        }
    }

    # Analyze results
    Write-Host "`n[STEP 4] Analyzing results..." -ForegroundColor Yellow
    
    if ($testFailed) {
        Write-Host "❌ TEST FAILED - Errors detected" -ForegroundColor Red
        Write-Host "`nErrors found:" -ForegroundColor Yellow
        foreach ($error in $errors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
        exit 1
    }
    
    if ($finalResult) {
        Write-Host "✅ Investigation completed successfully" -ForegroundColor Green
        
        # Check result structure
        $hasKeywords = $finalResult.keywords -and $finalResult.keywords.Count -gt 0
        $hasCompetitors = $finalResult.competitorInsights -and $finalResult.competitorInsights.Count -gt 0
        $hasSeoStrategy = $finalResult.seoStrategy -ne $null
        $hasDesign = $finalResult.designRecommendations -ne $null
        
        Write-Host "`nResult Structure:" -ForegroundColor Cyan
        Write-Host "   Keywords: $(if ($hasKeywords) { "✅ $($finalResult.keywords.Count) found" } else { "❌ Missing" })" -ForegroundColor $(if ($hasKeywords) { "Green" } else { "Red" })
        Write-Host "   Competitors: $(if ($hasCompetitors) { "✅ $($finalResult.competitorInsights.Count) analyzed" } else { "❌ Missing" })" -ForegroundColor $(if ($hasCompetitors) { "Green" } else { "Red" })
        Write-Host "   SEO Strategy: $(if ($hasSeoStrategy) { "✅ Present" } else { "❌ Missing" })" -ForegroundColor $(if ($hasSeoStrategy) { "Green" } else { "Red" })
        Write-Host "   Design: $(if ($hasDesign) { "✅ Present" } else { "❌ Missing" })" -ForegroundColor $(if ($hasDesign) { "Green" } else { "Red" })
        
        if (-not ($hasKeywords -and $hasCompetitors -and $hasSeoStrategy -and $hasDesign)) {
            Write-Host "`n⚠️ WARNING: Result structure incomplete" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "⚠️ No final result data received" -ForegroundColor Yellow
        Write-Host "   Progress messages: $($progressMessages.Count)" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "`n✅✅✅ ALL TESTS PASSED ✅✅✅" -ForegroundColor Green
    exit 0

} catch {
    Write-Host "`n❌ TEST FAILED - Exception occurred" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Type: $($_.Exception.GetType().Name)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errorBody" -ForegroundColor Yellow
        } catch {
            Write-Host "Could not read error body" -ForegroundColor Gray
        }
    }
    
    exit 1
}

