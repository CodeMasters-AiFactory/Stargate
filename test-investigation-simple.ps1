# Simple test to check if investigation function executes
# This bypasses SSE to see if the function itself works

$ErrorActionPreference = "Continue"

Write-Host "`n=== Simple Investigation Test ===" -ForegroundColor Cyan
Write-Host "Testing investigation function directly...`n" -ForegroundColor Yellow

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Sending request (will wait up to 60 seconds for response)..." -ForegroundColor Cyan

try {
    # Use a simple HTTP request without SSE handling
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST `
        -Body $testPayload `
        -ContentType "application/json" `
        -TimeoutSec 60 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "`n✅ Response received!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "Content Length: $($response.Content.Length) bytes" -ForegroundColor Cyan
    Write-Host "`nFirst 500 characters of response:" -ForegroundColor Yellow
    Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)) -ForegroundColor Gray
    
    # Count SSE messages
    $messageCount = ([regex]::Matches($response.Content, "data:\s*\{")).Count
    Write-Host "`nSSE Messages found: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    
} catch {
    Write-Host "`n❌ Request failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

