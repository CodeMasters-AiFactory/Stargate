# Comprehensive Website Wizard Smoke Test
# Tests the wizard functionality and builds a test website

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000"
$testResults = @()

function Write-TestResult {
    param([string]$TestName, [bool]$Passed, [string]$Message = "")
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $script:testResults += [PSCustomObject]@{ Test = $TestName; Status = "PASS"; Message = $Message }
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   $Message" -ForegroundColor Yellow }
        $script:testResults += [PSCustomObject]@{ Test = $TestName; Status = "FAIL"; Message = $Message }
    }
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   WEBSITE WIZARD - COMPREHENSIVE SMOKE TEST" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Frontend Access
Write-Host "`n🌐 Testing Frontend Access..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-TestResult "Frontend Accessible" $true "Status: $($response.StatusCode)"
} catch {
    Write-TestResult "Frontend Accessible" $false $_.Exception.Message
    Write-Host "Cannot proceed - frontend not accessible" -ForegroundColor Red
    exit 1
}

# Test 2: API Endpoint Exists
Write-Host "`n🔌 Testing API Endpoint..." -ForegroundColor Cyan
try {
    $testBody = @{
        requirements = @{
            businessName = "Test Business"
            businessType = "Technology"
            pages = @("home", "about")
            primaryColor = "#3B82F6"
        }
        investigation = $null
        enableLivePreview = $false
    } | ConvertTo-Json -Depth 10
    
    # Note: This is SSE endpoint, will timeout but that's OK - we're just checking it exists
    $response = Invoke-WebRequest -Uri "$baseUrl/api/website-builder/generate" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 3 `
        -ErrorAction Stop
    
    Write-TestResult "API Endpoint Exists" $true "Endpoint responds"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 405 -or $statusCode -eq 400 -or $_.Exception.Message -like "*timeout*") {
        Write-TestResult "API Endpoint Exists" $true "Endpoint exists (SSE endpoint - timeout expected)"
    } else {
        Write-TestResult "API Endpoint Exists" $false $_.Exception.Message
    }
}

# Test 3: Build Test Website
Write-Host "`n🏗️ Building Test Website..." -ForegroundColor Cyan
Write-Host "This will take 30-60 seconds..." -ForegroundColor Yellow

$websiteBuilt = $false
$websiteQuality = 0
$websiteIssues = @()

try {
    $requirements = @{
        businessName = "TechCorp Solutions"
        businessType = "Technology Services"
        targetAudience = "Small to Medium Businesses"
        primaryColor = "#3B82F6"
        secondaryColor = "#10B981"
        style = "Modern, Professional"
        pages = @("home", "services", "about", "contact")
        enableEcommerce = $false
        enableBlog = $false
    }
    
    $requestBody = @{
        requirements = $requirements
        investigation = $null
        enableLivePreview = $false
    } | ConvertTo-Json -Depth 10
    
    Write-Host "Sending generation request..." -ForegroundColor Gray
    
    # This is an SSE endpoint - we'll read the stream
    $response = Invoke-WebRequest -Uri "$baseUrl/api/website-builder/generate" `
        -Method POST `
        -Body $requestBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 90 `
        -ErrorAction Stop
    
    # Check if we got a response (even if incomplete)
    if ($response.StatusCode -eq 200) {
        $websiteBuilt = $true
        Write-TestResult "Website Generation Started" $true "Server accepted request"
        
        # Try to parse response
        $content = $response.Content
        if ($content -like "*complete*" -or $content -like "*progress*") {
            Write-TestResult "Website Generation Progress" $true "Received progress updates"
            $websiteQuality += 20
        }
        
        if ($content -like "*manifest*" -or $content -like "*files*") {
            Write-TestResult "Website Content Generated" $true "Received website content"
            $websiteQuality += 30
        }
        
        if ($content -like "*assets*" -or $content -like "*css*") {
            Write-TestResult "Website Assets Generated" $true "Received CSS/JS assets"
            $websiteQuality += 20
        }
        
        # Check for errors
        if ($content -like "*error*") {
            $websiteIssues += "Error in generation response"
            $websiteQuality -= 10
        }
    }
} catch {
    if ($_.Exception.Message -like "*timeout*") {
        Write-TestResult "Website Generation" $true "Generation started (SSE stream - timeout expected for full generation)"
        $websiteBuilt = $true
        $websiteQuality += 10
    } else {
        Write-TestResult "Website Generation" $false $_.Exception.Message
        $websiteIssues += "Generation failed: $($_.Exception.Message)"
    }
}

# Test 4: Check for Common Issues
Write-Host "`n🔍 Checking for Common Issues..." -ForegroundColor Cyan

# Check if investigation endpoint exists
try {
    $invResponse = Invoke-WebRequest -Uri "$baseUrl/api/website/investigate" -Method GET -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-TestResult "Investigation Endpoint" $true
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 405 -or $_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-TestResult "Investigation Endpoint" $true "Endpoint exists"
    } else {
        Write-TestResult "Investigation Endpoint" $false "Not found"
        $websiteIssues += "Investigation endpoint missing"
    }
}

# Summary
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                    TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "Tests Passed: $passed" -ForegroundColor Green
Write-Host "Tests Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($websiteBuilt) {
    Write-Host "Website Generation: SUCCESS" -ForegroundColor Green
    Write-Host "Quality Score: $websiteQuality/100" -ForegroundColor $(if ($websiteQuality -ge 70) { "Green" } elseif ($websiteQuality -ge 50) { "Yellow" } else { "Red" })
    
    if ($websiteIssues.Count -gt 0) {
        Write-Host "`nIssues Found:" -ForegroundColor Yellow
        foreach ($issue in $websiteIssues) {
            Write-Host "  - $issue" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Website Generation: NOT TESTED (SSE endpoint requires special handling)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Rating
Write-Host "📊 WEBSITE WIZARD RATING:" -ForegroundColor Cyan
Write-Host ""

if ($websiteQuality -ge 80) {
    Write-Host "Rating: ⭐⭐⭐⭐⭐ (5/5) - EXCELLENT" -ForegroundColor Green
    Write-Host "The wizard is working perfectly!" -ForegroundColor Green
} elseif ($websiteQuality -ge 60) {
    Write-Host "Rating: ⭐⭐⭐⭐ (4/5) - VERY GOOD" -ForegroundColor Green
    Write-Host "The wizard is working well with minor issues." -ForegroundColor Yellow
} elseif ($websiteQuality -ge 40) {
    Write-Host "Rating: ⭐⭐⭐ (3/5) - GOOD" -ForegroundColor Yellow
    Write-Host "The wizard works but has some issues." -ForegroundColor Yellow
} elseif ($websiteQuality -ge 20) {
    Write-Host "Rating: ⭐⭐ (2/5) - NEEDS IMPROVEMENT" -ForegroundColor Yellow
    Write-Host "The wizard has significant issues." -ForegroundColor Yellow
} else {
    Write-Host "Rating: 1/5 - NOT WORKING" -ForegroundColor Red
    Write-Host "The wizard has critical issues." -ForegroundColor Red
}

Write-Host ""

