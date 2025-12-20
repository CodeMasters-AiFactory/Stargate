# Continuous Testing - Runs tests automatically and watches for failures
# Similar to Replit's live testing where it continuously validates

param(
    [int]$IntervalSeconds = 30,
    [switch]$StopOnFailure = $false
)

Write-Host "`n=== CONTINUOUS TESTING MODE ===" -ForegroundColor Cyan
Write-Host "This will run tests every $IntervalSeconds seconds" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

$testCount = 0
$passCount = 0
$failCount = 0

while ($true) {
    $testCount++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "`n[$timestamp] Test #$testCount" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Gray
    
    $result = & "$PSScriptRoot\test-automated.ps1" -MaxRetries 1 -TestTimeout 60
    
    if ($LASTEXITCODE -eq 0) {
        $passCount++
        Write-Host "`n✅ Test passed ($passCount passed, $failCount failed)" -ForegroundColor Green
    } else {
        $failCount++
        Write-Host "`n❌ Test failed ($passCount passed, $failCount failed)" -ForegroundColor Red
        
        if ($StopOnFailure) {
            Write-Host "`n🛑 Stopping on failure as requested" -ForegroundColor Yellow
            break
        }
    }
    
    Write-Host "`n⏳ Waiting $IntervalSeconds seconds until next test..." -ForegroundColor Gray
    Start-Sleep -Seconds $IntervalSeconds
}

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total tests: $testCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

