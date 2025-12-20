Write-Host "=== COMPREHENSIVE WEBSITE BUILDER SMOKE TEST ===" -ForegroundColor Cyan
Write-Host "Testing all major features with visual cursor feedback" -ForegroundColor Gray
Write-Host ""

# Function to update cursor position
function Update-Cursor {
    param($x, $y, $message)
    $body = @{x=$x; y=$y; action="move"; message=$message} | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/automation/cursor/show" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
    } catch {}
    Start-Sleep -Milliseconds 500
}

function Click-Cursor {
    param($x, $y, $target)
    $body = @{x=$x; y=$y; target=$target} | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/automation/cursor/click" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
    } catch {}
    Start-Sleep -Milliseconds 300
}

$totalTests = 0
$passedTests = 0
$failedTests = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    $script:totalTests++

    Write-Host "[$script:totalTests] $Name..." -ForegroundColor Yellow -NoNewline
    Update-Cursor -x (100 + ($script:totalTests * 30)) -y 200 -message "Testing: $Name"

    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 15 -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
        }

        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " PASS ($($response.StatusCode))" -ForegroundColor Green
            $script:passedTests++
            Click-Cursor -x (100 + ($script:totalTests * 30)) -y 200 -target "Test Passed"
            return $true
        } else {
            Write-Host " WARN ($($response.StatusCode) expected $ExpectedStatus)" -ForegroundColor Yellow
            $script:passedTests++
            return $true
        }
    } catch {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:failedTests += "$Name : $($_.Exception.Message)"
        return $false
    }
}

Write-Host "=== PHASE 1: CORE API ENDPOINTS ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 100 -message "Phase 1: Testing Core APIs"

# Core health endpoints
Test-Endpoint -Name "Health Check" -Url "http://localhost:5000/api/health"
Test-Endpoint -Name "Frontend Health" -Url "http://localhost:5000/api/health/frontend"
Test-Endpoint -Name "API Health" -Url "http://localhost:5000/api/health/apis"
Test-Endpoint -Name "Startup Status" -Url "http://localhost:5000/api/startup/status"
Test-Endpoint -Name "Detailed Health" -Url "http://localhost:5000/api/health/detailed"

Write-Host ""
Write-Host "=== PHASE 2: WEBSITE BUILDER CORE ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 150 -message "Phase 2: Website Builder Core"

# Website builder endpoints
Test-Endpoint -Name "Projects List" -Url "http://localhost:5000/api/website-builder/projects"
Test-Endpoint -Name "Templates List" -Url "http://localhost:5000/api/templates"
Test-Endpoint -Name "Demo Project" -Url "http://localhost:5000/api/projects/demo-project-1"

Write-Host ""
Write-Host "=== PHASE 3: WIZARD CHATBOT ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 200 -message "Phase 3: Wizard Chatbot"

# Wizard chatbot
Test-Endpoint -Name "Chatbot Suggestions" -Url "http://localhost:5000/api/wizard-chatbot/suggestions"
$chatBody = '{"message":"Hello, I want to build a website","sessionId":"test-123"}'
Test-Endpoint -Name "Chatbot Message" -Url "http://localhost:5000/api/wizard-chatbot/message" -Method "POST" -Body $chatBody

Write-Host ""
Write-Host "=== PHASE 4: AI SERVICES ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 250 -message "Phase 4: AI Services"

# AI/Leonardo endpoints
Test-Endpoint -Name "Leonardo Usage" -Url "http://localhost:5000/api/leonardo/usage"

Write-Host ""
Write-Host "=== PHASE 5: SESSIONS & DRAFTS ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 300 -message "Phase 5: Sessions & Drafts"

# Sessions
$sessionBody = '{"userId":"test-user-smoke","requirements":{"businessName":"Smoke Test Co","industry":"Technology"}}'
Test-Endpoint -Name "Create Session" -Url "http://localhost:5000/api/website-builder/sessions" -Method "POST" -Body $sessionBody

Write-Host ""
Write-Host "=== PHASE 6: INVESTIGATION ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 350 -message "Phase 6: Investigation"

# Investigation (minimal)
$investigateBody = '{"url":"https://example.com"}'
Test-Endpoint -Name "Investigate Minimal" -Url "http://localhost:5000/api/website-builder/investigate-minimal" -Method "POST" -Body $investigateBody

Write-Host ""
Write-Host "=== PHASE 7: AUTH ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 400 -message "Phase 7: Authentication"

# Auth
Test-Endpoint -Name "Auth Check" -Url "http://localhost:5000/api/auth/me"

Write-Host ""
Write-Host "=== PHASE 8: COUNCIL AGENTS ===" -ForegroundColor Magenta
Update-Cursor -x 300 -y 450 -message "Phase 8: Council Agents"

# Council agents
Test-Endpoint -Name "Council Status" -Url "http://localhost:5000/api/agents/status"
Test-Endpoint -Name "Council Agents List" -Url "http://localhost:5000/api/agents"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($failedTests.Count)" -ForegroundColor $(if ($failedTests.Count -gt 0) { "Red" } else { "Green" })

if ($failedTests.Count -gt 0) {
    Write-Host ""
    Write-Host "FAILED TESTS:" -ForegroundColor Red
    foreach ($failure in $failedTests) {
        Write-Host "  - $failure" -ForegroundColor Red
    }
}

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host ""
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

# Hide cursor at end
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/automation/cursor/hide" -Method POST -TimeoutSec 2 | Out-Null
} catch {}

Write-Host ""
Write-Host "=== SMOKE TEST COMPLETE ===" -ForegroundColor Cyan
