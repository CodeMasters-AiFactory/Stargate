# Quick script to view latest investigation logs
# Usage: .\view-logs.ps1

$logsDir = Join-Path $PSScriptRoot "logs\investigations"

if (-not (Test-Path $logsDir)) {
    Write-Host "No logs directory found. Run an investigation first." -ForegroundColor Yellow
    exit 0
}

$sessions = Get-ChildItem $logsDir -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if (-not $sessions) {
    Write-Host "No investigation sessions found." -ForegroundColor Yellow
    exit 0
}

$latestSession = $sessions[0]
$sessionPath = $latestSession.FullName

Write-Host "`n=== Latest Investigation Logs ===" -ForegroundColor Cyan
Write-Host "Session: $($latestSession.Name)" -ForegroundColor Gray
Write-Host "Path: $sessionPath`n" -ForegroundColor Gray

$logFiles = Get-ChildItem $sessionPath -Filter "*.log" -ErrorAction SilentlyContinue | Sort-Object Name

if ($logFiles) {
    foreach ($logFile in $logFiles) {
        Write-Host "`n--- $($logFile.Name) ---" -ForegroundColor Yellow
        $content = Get-Content $logFile.FullName -Tail 20 -ErrorAction SilentlyContinue
        if ($content) {
            $content | ForEach-Object {
                if ($_ -match "\[ERROR\]") {
                    Write-Host $_ -ForegroundColor Red
                } elseif ($_ -match "\[SUCCESS\]") {
                    Write-Host $_ -ForegroundColor Green
                } elseif ($_ -match "\[WARN\]") {
                    Write-Host $_ -ForegroundColor Yellow
                } else {
                    Write-Host $_ -ForegroundColor White
                }
            }
        } else {
            Write-Host "  (empty)" -ForegroundColor Gray
        }
    }
    
    # Show summary if available
    $summaryFile = Join-Path $sessionPath "summary.json"
    if (Test-Path $summaryFile) {
        Write-Host "`n--- Summary ---" -ForegroundColor Yellow
        $summary = Get-Content $summaryFile | ConvertFrom-Json
        Write-Host "Log directory: $($summary.logDirectory)" -ForegroundColor Gray
        Write-Host "Stages: $($summary.summary.Count)" -ForegroundColor Gray
        foreach ($stage in $summary.summary) {
            $status = if ($stage.errors -gt 0) { "⚠️" } else { "✅" }
            Write-Host "  $status $($stage.stage): $($stage.entries) entries, $($stage.errors) errors" -ForegroundColor $(if ($stage.errors -gt 0) { "Red" } else { "Green" })
        }
    }
} else {
    Write-Host "No log files found in this session." -ForegroundColor Yellow
}

Write-Host "`nTo view full logs, open: $sessionPath" -ForegroundColor Cyan

