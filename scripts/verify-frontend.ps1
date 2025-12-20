# ============================================================================
# StargatePortal - Frontend Verification Script
# ============================================================================
# Standalone script to verify the frontend is fully operational.
# Can be run independently or called from other scripts.
# ============================================================================

$ErrorActionPreference = "Continue"

# Color output functions
function Write-Step {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Gray
}

# Configuration
$baseUrl = "http://localhost:5000"
$timeoutSeconds = 5

# Results tracking
$checksPassed = 0
$checksFailed = 0
$checkResults = @()

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$FailureMessage = ""
    )
    
    Write-Info "Testing: $Name"
    try {
        $result = & $Test
        if ($result) {
            Write-Success "$Name - PASSED"
            $script:checksPassed++
            $script:checkResults += @{
                Name = $Name
                Status = "PASSED"
                Message = ""
            }
            return $true
        } else {
            Write-Error "$Name - FAILED"
            if ($FailureMessage) {
                Write-Host "   $FailureMessage" -ForegroundColor Yellow
            }
            $script:checksFailed++
            $script:checkResults += @{
                Name = $Name
                Status = "FAILED"
                Message = $FailureMessage
            }
            return $false
        }
    } catch {
        Write-Error "$Name - FAILED"
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:checksFailed++
        $script:checkResults += @{
            Name = $Name
            Status = "FAILED"
            Message = $_.Exception.Message
        }
        return $false
    }
}

# ============================================================================
# MAIN VERIFICATION
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FRONTEND VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Step "Verifying frontend at $baseUrl..."

# Check 1: Port is listening
Test-Check -Name "Port 5000 Listening" -Test {
    $portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
    return ($null -ne $portCheck)
} -FailureMessage "Port 5000 is not listening. Is the server running?"

# Check 2: Root endpoint responds
Test-Check -Name "Root Endpoint Responds" -Test {
    $response = Invoke-WebRequest -Uri $baseUrl `
        -Method GET -TimeoutSec $timeoutSeconds -UseBasicParsing -ErrorAction Stop
    return ($response.StatusCode -eq 200)
} -FailureMessage "Root endpoint returned non-200 status or is unreachable."

# Check 3: HTML is being served
$htmlContent = $null
Test-Check -Name "HTML Content Served" -Test {
    $response = Invoke-WebRequest -Uri $baseUrl `
        -Method GET -TimeoutSec $timeoutSeconds -UseBasicParsing -ErrorAction Stop
    $script:htmlContent = $response.Content
    return ($htmlContent -match "<!DOCTYPE html|<!doctype html|<html")
} -FailureMessage "Response doesn't appear to be valid HTML."

# Check 4: React app entry point exists
if ($null -ne $htmlContent) {
    Test-Check -Name "React Entry Point Found" -Test {
        return ($htmlContent -match 'id="root"' -and 
                ($htmlContent -match 'main\.tsx|main\.jsx|main\.js'))
    } -FailureMessage "React app entry point (root div or main.tsx/jsx) not found in HTML."
} else {
    Write-Warning "Skipping React entry point check (HTML content not available)"
    $checksFailed++
}

# Check 5: API Health Endpoint
Test-Check -Name "API Health Endpoint" -Test {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" `
        -Method GET -TimeoutSec $timeoutSeconds -UseBasicParsing -ErrorAction Stop
    return ($response.StatusCode -eq 200)
} -FailureMessage "API health endpoint not accessible."

# Check 6: Frontend Health Endpoint (if available)
$frontendHealthOk = Test-Check -Name "Frontend Health Check" -Test {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health/frontend" `
        -Method GET -TimeoutSec $timeoutSeconds -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        $healthData = $response.Content | ConvertFrom-Json
        if ($healthData.status -eq "ok") {
            return $true
        } else {
            Write-Warning "Frontend health returned: $($healthData.status)"
            if ($healthData.errors) {
                foreach ($error in $healthData.errors) {
                    Write-Host "   - $error" -ForegroundColor Yellow
                }
            }
            return $false
        }
    }
    return $false
} -FailureMessage "Frontend health check endpoint unavailable or returned errors."

# Check 7: Content-Type is HTML
if ($null -ne $htmlContent) {
    Test-Check -Name "Correct Content-Type" -Test {
        $response = Invoke-WebRequest -Uri $baseUrl `
            -Method GET -TimeoutSec $timeoutSeconds -UseBasicParsing -ErrorAction Stop
        $contentType = $response.Headers['Content-Type']
        return ($contentType -match "text/html|text/html;")
    } -FailureMessage "Content-Type is not text/html"
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Checks: $($checksPassed + $checksFailed)" -ForegroundColor Gray
Write-Host "Passed: $checksPassed" -ForegroundColor $(if ($checksPassed -gt 0) { "Green" } else { "Red" })
Write-Host "Failed: $checksFailed" -ForegroundColor $(if ($checksFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($checksFailed -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "✅ Frontend is fully operational" -ForegroundColor Green
    Write-Host "🌐 Available at: $baseUrl" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} else {
    Write-Host "⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow -BackgroundColor DarkYellow
    Write-Host ""
    Write-Host "Failed checks:" -ForegroundColor Yellow
    foreach ($result in $checkResults) {
        if ($result.Status -eq "FAILED") {
            Write-Host "   - $($result.Name)" -ForegroundColor Red
            if ($result.Message) {
                Write-Host "     $($result.Message)" -ForegroundColor Gray
            }
        }
    }
    Write-Host ""
    Write-Host "💡 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Ensure server is running: npm run dev" -ForegroundColor Gray
    Write-Host "   2. Check server logs for errors" -ForegroundColor Gray
    Write-Host "   3. Verify port 5000 is not in use by another process" -ForegroundColor Gray
    Write-Host "   4. Try restarting the server" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

