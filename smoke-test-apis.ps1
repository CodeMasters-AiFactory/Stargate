Write-Host "=== SMOKE TEST: WEBSITE BUILDER ===" -ForegroundColor Cyan
Write-Host ""

$endpoints = @(
    @{name="Projects List"; url="http://localhost:5000/api/website-builder/projects"; method="GET"},
    @{name="Templates"; url="http://localhost:5000/api/templates"; method="GET"},
    @{name="Frontend Health"; url="http://localhost:5000/api/health/frontend"; method="GET"},
    @{name="API Health"; url="http://localhost:5000/api/health/apis"; method="GET"},
    @{name="Wizard Chatbot"; url="http://localhost:5000/api/wizard-chatbot/suggestions"; method="GET"},
    @{name="Leonardo Usage"; url="http://localhost:5000/api/leonardo/usage"; method="GET"},
    @{name="Demo Project"; url="http://localhost:5000/api/projects/demo-project-1"; method="GET"},
    @{name="Auth Check"; url="http://localhost:5000/api/auth/me"; method="GET"}
)

$passed = 0
$failed = 0
$errors = @()

foreach ($endpoint in $endpoints) {
    $name = $endpoint.name
    $url = $endpoint.url
    Write-Host "Testing: $name..." -ForegroundColor Yellow -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        $status = $response.StatusCode
        if ($status -eq 200) {
            Write-Host " OK ($status)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host " WARNING ($status)" -ForegroundColor Yellow
            $passed++
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "   Error: $errorMsg" -ForegroundColor Red
        $failed++
        $errors += "$name : $errorMsg"
    }
}

Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "=== ERRORS ===" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== POST ENDPOINTS TEST ===" -ForegroundColor Cyan

# Test POST endpoints
$postTests = @(
    @{
        name="Create Session"
        url="http://localhost:5000/api/website-builder/sessions"
        body='{"userId":"test-123","requirements":{"businessName":"Test Co"}}'
    },
    @{
        name="Investigate Minimal"
        url="http://localhost:5000/api/website-builder/investigate-minimal"
        body='{"url":"https://example.com"}'
    }
)

foreach ($test in $postTests) {
    Write-Host "Testing POST: $($test.name)..." -ForegroundColor Yellow -NoNewline
    try {
        $response = Invoke-WebRequest -Uri $test.url -Method POST -Body $test.body -ContentType "application/json" -TimeoutSec 15 -UseBasicParsing
        Write-Host " OK ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== SMOKE TEST COMPLETE ===" -ForegroundColor Cyan
