# Test that captures both client and server-side behavior

Write-Host "`n=== Comprehensive Test with Logging ===" -ForegroundColor Cyan

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

$payloadFile = "$env:TEMP\test-payload-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testPayload | Out-File -FilePath $payloadFile -Encoding UTF8

Write-Host "`n1. Testing server response..." -ForegroundColor Yellow
Write-Host "   Payload: $payloadFile" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -InFile $payloadFile -ContentType "application/json" `
        -TimeoutSec 90 -UseBasicParsing -ErrorAction Stop
    
    Write-Host "`n✅ Response received!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "   Content Length: $($response.Content.Length) bytes" -ForegroundColor Cyan
    Write-Host "   Headers:" -ForegroundColor Cyan
    $response.Headers.GetEnumerator() | ForEach-Object {
        Write-Host "     $($_.Key): $($_.Value)" -ForegroundColor Gray
    }
    
    Write-Host "`n2. Parsing SSE messages..." -ForegroundColor Yellow
    $lines = $response.Content -split "`n"
    $messageCount = 0
    $rawMessages = @()
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            $rawMessages += $line
            try {
                $data = $matches[1] | ConvertFrom-Json
                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "   [$timestamp] Message #$messageCount : [$($data.stage)] ($($data.progress)%)" -ForegroundColor Cyan
                Write-Host "      Message: $($data.message)" -ForegroundColor Gray
            } catch {
                Write-Host "   ⚠️ Failed to parse: $line" -ForegroundColor Yellow
            }
        } elseif ($line -match "^:") {
            Write-Host "   Comment: $line" -ForegroundColor DarkGray
        }
    }
    
    Write-Host "`n3. Raw response (first 500 chars):" -ForegroundColor Yellow
    Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)) -ForegroundColor Gray
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total messages: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    
    if ($messageCount -eq 1) {
        Write-Host "`n❌ PROBLEM: Only 1 message received" -ForegroundColor Red
        Write-Host "`nThe server console should show:" -ForegroundColor Yellow
        Write-Host "  [Investigation] ✅ Wait complete, sending competitor_analysis..." -ForegroundColor White
        Write-Host "  [Investigation Route] 📤 Writing progress: competitor_analysis" -ForegroundColor White
        Write-Host "`nIf these logs are MISSING, the investigation function is stopping early." -ForegroundColor Yellow
        Write-Host "If these logs are PRESENT, the response write is failing silently." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`n✅ Multiple messages received!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status: $statusCode" -ForegroundColor Yellow
    }
    exit 1
} finally {
    if (Test-Path $payloadFile) {
        Remove-Item $payloadFile -Force
    }
}

