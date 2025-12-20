# Test Frontend Accessibility and Backend Connection
Write-Host "`n=== Testing Frontend ===" -ForegroundColor Cyan
Write-Host "Checking if server is running and frontend is accessible...`n" -ForegroundColor Yellow

# Test 1: Check if server is running
Write-Host "[TEST 1] Checking if server is running on port 5000..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ Server is running! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Gray
    
    # Check if it's HTML (frontend)
    if ($response.Content -match "<!DOCTYPE html|<html") {
        Write-Host "✅ Frontend HTML is being served!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Response doesn't look like HTML" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Server is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Please start the server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check API health endpoint
Write-Host "`n[TEST 2] Testing API health endpoint..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ Health endpoint responded! Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Health endpoint not available (this might be OK)" -ForegroundColor Yellow
}

# Test 3: Test minimal SSE endpoint (frontend uses similar pattern)
Write-Host "`n[TEST 3] Testing minimal SSE endpoint (simulates frontend behavior)..." -ForegroundColor Cyan
try {
    $sseResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate-minimal" `
        -Method POST -ContentType "application/json" -Body '{}' `
        -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ SSE endpoint responded! Status: $($sseResponse.StatusCode)" -ForegroundColor Green
    
    $lines = $sseResponse.Content -split "`n"
    $messageCount = ($lines | Where-Object { $_ -match "^data:" }).Count
    
    Write-Host "   Messages received: $messageCount" -ForegroundColor $(if ($messageCount -ge 3) { "Green" } else { "Yellow" })
    
    if ($messageCount -ge 3) {
        Write-Host "✅ SSE streaming is working!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Only $messageCount messages received (expected 3+)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ SSE endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check if frontend can make fetch requests (simulate)
Write-Host "`n[TEST 4] Testing CORS and API accessibility..." -ForegroundColor Cyan
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/execution/health" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ API endpoints are accessible! Status: $($apiResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API endpoint test failed (might not exist): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Frontend server is running on http://localhost:5000" -ForegroundColor Green
Write-Host "✅ You can access the frontend in your browser at:" -ForegroundColor Green
Write-Host "   http://localhost:5000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "`n💡 If the frontend doesn't load in the browser:" -ForegroundColor Yellow
Write-Host "   1. Make sure the server is running (npm run dev)" -ForegroundColor Gray
Write-Host "   2. Check browser console for errors (F12)" -ForegroundColor Gray
Write-Host "   3. Try hard refresh (Ctrl+F5)" -ForegroundColor Gray

