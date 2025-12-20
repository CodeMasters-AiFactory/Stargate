# Simple Auto-Start Script - No emojis, just works
$ErrorActionPreference = "Continue"

# Find Node.js
$nodePath = "C:\Program Files\nodejs"
if (-not (Test-Path "$nodePath\node.exe")) {
    $nodePath = "${env:LOCALAPPDATA}\Programs\nodejs"
}

if (-not (Test-Path "$nodePath\node.exe")) {
    Write-Host "[ERROR] Node.js not found" -ForegroundColor Red
    exit 1
}

# Get project directory
$projectDir = Split-Path -Parent $PSScriptRoot

# Check if server already running
$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portCheck) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Server already running" -ForegroundColor Green
            exit 0
        }
    } catch {
        # Port in use but not our server - kill it
        $pid = $portCheck.OwningProcess
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start server in a NEW WINDOW that stays open
Write-Host "[INFO] Starting server..." -ForegroundColor Cyan
$npmPath = Join-Path $nodePath "npm.cmd"

Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$projectDir`" && `"$npmPath`" run dev" -WorkingDirectory $projectDir

Write-Host "[OK] Server starting in new window" -ForegroundColor Green
Write-Host "[INFO] Wait 10 seconds for server to initialize..." -ForegroundColor Gray

# Wait and verify
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[SUCCESS] Server is running at http://localhost:5000" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Server may still be starting - check the command window" -ForegroundColor Yellow
}

