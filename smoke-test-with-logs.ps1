# Smoke Test with Real-Time Log Monitoring
# This test runs an investigation and monitors the logs as they're created

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   INVESTIGATION SMOKE TEST + LOG MONITOR" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Step 1: Check server
Write-Host "[1/5] Checking server status..." -ForegroundColor Cyan
$port5000 = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if (-not $port5000) {
    Write-Host "   Server is not running on port 5000" -ForegroundColor Red
    Write-Host "   Please start the server first: npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host "   Server is running" -ForegroundColor Green

# Step 2: Clear old logs and prepare
Write-Host "`n[2/5] Preparing log monitoring..." -ForegroundColor Cyan
$logsDir = Join-Path $PSScriptRoot "logs\investigations"
if (Test-Path $logsDir) {
    Write-Host "   Logs directory exists: $logsDir" -ForegroundColor Green
} else {
    Write-Host "   Creating logs directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    Write-Host "   Created: $logsDir" -ForegroundColor Green
}

# Step 3: Start log monitoring in background
Write-Host "`n[3/5] Starting log monitor..." -ForegroundColor Cyan
$logMonitorScript = @"
`$logsDir = '$logsDir'
`$lastCheck = Get-Date
while (`$true) {
    Start-Sleep -Seconds 1
    `$sessions = Get-ChildItem `$logsDir -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if (`$sessions) {
        `$latestSession = `$sessions[0]
        `$sessionPath = `$latestSession.FullName
        `$logFiles = Get-ChildItem `$sessionPath -Filter "*.log" -ErrorAction SilentlyContinue
        foreach (`$logFile in `$logFiles) {
            `$content = Get-Content `$logFile.FullName -Tail 5 -ErrorAction SilentlyContinue
            if (`$content) {
                `$lastWrite = `$logFile.LastWriteTime
                if (`$lastWrite -gt `$lastCheck) {
                    Write-Host "[`$(`$logFile.BaseName)] " -ForegroundColor Cyan -NoNewline
                    Write-Host (`$content[-1]) -ForegroundColor White
                }
            }
        }
        `$lastCheck = Get-Date
    }
}
"@

$logMonitorJob = Start-Job -ScriptBlock ([scriptblock]::Create($logMonitorScript))

# Step 4: Run investigation
Write-Host "`n[4/5] Running investigation test..." -ForegroundColor Cyan
Write-Host "   This will take 30-60 seconds...`n" -ForegroundColor Yellow

$testPayload = @{
    businessType = "restaurant"
    businessName = "Smoke Test Restaurant"
    description = "A fine dining restaurant for smoke testing"
    targetAudience = "food enthusiasts"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

$startTime = Get-Date
$messages = @()
$errors = @()
$completeReceived = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/investigate" `
        -Method POST -Body $testPayload -ContentType "application/json" `
        -TimeoutSec 120 -UseBasicParsing -ErrorAction Stop
    
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    Write-Host "   Response received! (Time: ${elapsed}s)`n" -ForegroundColor Green
    
    # Parse messages
    $lines = $response.Content -split "`n"
    $messageCount = 0
    
    foreach ($line in $lines) {
        if ($line -match "^data:\s*(.+)$") {
            $messageCount++
            try {
                $data = $matches[1] | ConvertFrom-Json
                $messages += $data
                $stage = $data.stage
                $progress = $data.progress
                
                if ($stage -eq "error") {
                    Write-Host "   ERROR: $($data.error)" -ForegroundColor Red
                    $errors += $data
                } elseif ($stage -eq "complete") {
                    Write-Host "   COMPLETE: Investigation finished!" -ForegroundColor Green
                    $completeReceived = $true
                } else {
                    Write-Host "   [$stage] ($progress%)" -ForegroundColor Cyan
                }
            } catch {
                # Skip parse errors
            }
        }
    }
    
} catch {
    Write-Host "   Request failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Analyze logs
Write-Host "`n[5/5] Analyzing logs..." -ForegroundColor Cyan
Start-Sleep -Seconds 2  # Give logs time to finalize

Stop-Job $logMonitorJob -ErrorAction SilentlyContinue
Remove-Job $logMonitorJob -ErrorAction SilentlyContinue

$sessions = Get-ChildItem $logsDir -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
if ($sessions) {
    $latestSession = $sessions[0]
    $sessionPath = $latestSession.FullName
    
    Write-Host "`n   Latest investigation session: $($latestSession.Name)" -ForegroundColor Green
    Write-Host "   Log directory: $sessionPath" -ForegroundColor Gray
    
    $logFiles = Get-ChildItem $sessionPath -Filter "*.log" -ErrorAction SilentlyContinue
    Write-Host "`n   Log files found:" -ForegroundColor Cyan
    foreach ($logFile in $logFiles) {
        $lineCount = (Get-Content $logFile.FullName -ErrorAction SilentlyContinue).Count
        $errorCount = (Select-String -Path $logFile.FullName -Pattern "\[ERROR\]" -ErrorAction SilentlyContinue).Count
        $status = if ($errorCount -gt 0) { "⚠️ $errorCount errors" } else { "✅ OK" }
        Write-Host "      - $($logFile.Name): $lineCount lines, $status" -ForegroundColor $(if ($errorCount -gt 0) { "Yellow" } else { "Green" })
    }
    
    # Check for summary
    $summaryFile = Join-Path $sessionPath "summary.json"
    if (Test-Path $summaryFile) {
        Write-Host "`n   Summary file: summary.json" -ForegroundColor Green
        $summary = Get-Content $summaryFile | ConvertFrom-Json
        Write-Host "      Stages: $($summary.summary.Count)" -ForegroundColor Gray
        $totalErrors = ($summary.summary | Measure-Object -Property errors -Sum).Sum
        Write-Host "      Total errors: $totalErrors" -ForegroundColor $(if ($totalErrors -gt 0) { "Red" } else { "Green" })
    }
} else {
    Write-Host "   No log sessions found" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($messageCount -gt 1 -and $completeReceived -and $errors.Count -eq 0) {
    Write-Host "`n   SMOKE TEST PASSED!" -ForegroundColor Green
    Write-Host "      - Messages: $messageCount" -ForegroundColor Gray
    Write-Host "      - Complete: Yes" -ForegroundColor Gray
    Write-Host "      - Errors: $($errors.Count)" -ForegroundColor Gray
    Write-Host "`n   Check logs for detailed information!" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "`n   SMOKE TEST FAILED" -ForegroundColor Red
    Write-Host "      - Messages: $messageCount" -ForegroundColor Yellow
    Write-Host "      - Complete: $completeReceived" -ForegroundColor Yellow
    Write-Host "      - Errors: $($errors.Count)" -ForegroundColor Yellow
    Write-Host "`n   Check logs in: $logsDir" -ForegroundColor Yellow
    exit 1
}

