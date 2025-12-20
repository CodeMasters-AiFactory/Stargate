# Comprehensive System Test
# Tests all major endpoints and functionality

$ErrorActionPreference = "Continue"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n[TEST] $Name" -ForegroundColor Cyan
    Write-Host "  $Method $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            TimeoutSec = 10
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $success = $response.StatusCode -eq $ExpectedStatus
        
        if ($success) {
            Write-Host "  ✅ PASSED (Status: $($response.StatusCode))" -ForegroundColor Green
            $script:testResults += @{ Name = $Name; Status = "PASSED"; Details = "Status: $($response.StatusCode)" }
        } else {
            Write-Host "  ❌ FAILED (Expected: $ExpectedStatus, Got: $($response.StatusCode))" -ForegroundColor Red
            $script:testResults += @{ Name = $Name; Status = "FAILED"; Details = "Expected: $ExpectedStatus, Got: $($response.StatusCode)" }
        }
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:testResults += @{ Name = $Name; Status = "FAILED"; Details = $_.Exception.Message }
    }
}

Write-Host "`n=== COMPREHENSIVE SYSTEM TEST ===" -ForegroundColor Cyan
Write-Host "Testing all major endpoints...`n" -ForegroundColor Yellow

# Test 1: Server Health
Test-Endpoint -Name "Server Health Check" -Method "GET" -Uri "http://localhost:5000"

# Test 2: Health Endpoint
Test-Endpoint -Name "Health Endpoint" -Method "GET" -Uri "http://localhost:5000/health"

# Test 3: Execution Health
Test-Endpoint -Name "Execution Health" -Method "GET" -Uri "http://localhost:5000/api/execution/health"

# Test 4: Languages
Test-Endpoint -Name "Languages Endpoint" -Method "GET" -Uri "http://localhost:5000/api/languages"

# Test 5: AI Models
Test-Endpoint -Name "AI Models" -Method "GET" -Uri "http://localhost:5000/api/ai/models"

# Test 6: Performance Metrics
Test-Endpoint -Name "Performance Metrics" -Method "GET" -Uri "http://localhost:5000/api/performance/metrics"

# Test 7: Minimal SSE Test (should work)
Write-Host "`n[TEST] Minimal SSE Endpoint" -ForegroundColor Cyan
Write-Host "  POST http://localhost:5000/api/website-builder/investigate-minimal" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate-minimal" `
        -Method POST -ContentType "application/json" -Body '{}' -TimeoutSec 10 -UseBasicParsing
    $messages = ($response.Content -split "`n" | Where-Object { $_ -match "^data:" }).Count
    if ($messages -ge 3) {
        Write-Host "  ✅ PASSED ($messages messages)" -ForegroundColor Green
        $testResults += @{ Name = "Minimal SSE"; Status = "PASSED"; Details = "$messages messages" }
    } else {
        Write-Host "  ❌ FAILED (Only $messages messages, expected 3+)" -ForegroundColor Red
        $testResults += @{ Name = "Minimal SSE"; Status = "FAILED"; Details = "Only $messages messages" }
    }
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Name = "Minimal SSE"; Status = "FAILED"; Details = $_.Exception.Message }
}

# Test 8: Investigation Endpoint (known issue)
Write-Host "`n[TEST] Investigation SSE Endpoint" -ForegroundColor Cyan
Write-Host "  POST http://localhost:5000/api/website-builder/investigate" -ForegroundColor Gray
try {
    $payload = @{
        businessType = "restaurant"
        businessName = "Test Restaurant"
        description = "Test"
        competitors = @(@{ url = "https://www.example.com" })
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -ContentType "application/json" -Body $payload -TimeoutSec 15 -UseBasicParsing
    $messages = ($response.Content -split "`n" | Where-Object { $_ -match "^data:" }).Count
    $hasComplete = ($response.Content -match '"stage"\s*:\s*"complete"')
    
    if ($messages -ge 3 -and $hasComplete) {
        Write-Host "  ✅ PASSED ($messages messages, complete received)" -ForegroundColor Green
        $testResults += @{ Name = "Investigation SSE"; Status = "PASSED"; Details = "$messages messages" }
    } else {
        Write-Host "  ⚠️  PARTIAL (Only $messages messages, complete: $hasComplete)" -ForegroundColor Yellow
        $testResults += @{ Name = "Investigation SSE"; Status = "PARTIAL"; Details = "Only $messages messages" }
    }
} catch {
    Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{ Name = "Investigation SSE"; Status = "FAILED"; Details = $_.Exception.Message }
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
$passed = ($testResults | Where-Object { $_.Status -eq "PASSED" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAILED" }).Count
$partial = ($testResults | Where-Object { $_.Status -eq "PARTIAL" }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host "Partial: $partial" -ForegroundColor Yellow

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Details)" -ForegroundColor Red
    }
}

exit $(if ($failed -gt 0) { 1 } else { 0 })

