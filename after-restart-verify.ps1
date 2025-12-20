# After PC Restart Verification Script
# Run this after you restart your PC to verify everything is working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  POST-RESTART VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script verifies that all services started automatically" -ForegroundColor Gray
Write-Host ""

# Step 1: Check Node.js in PATH
Write-Host "Step 1: Checking Node.js in PATH..." -ForegroundColor Yellow
$nodePath = "C:\Program Files\nodejs"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -like "*$nodePath*") {
    Write-Host "  ✅ Node.js in User PATH (permanent)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Node.js not in User PATH - adding for this session..." -ForegroundColor Yellow
    $env:PATH = "$nodePath;$env:PATH"
}

# Verify Node.js works
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not accessible!" -ForegroundColor Red
    Write-Host "  Please run: .\fix-permanent-startup.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if server is already running
Write-Host ""
Write-Host "Step 2: Checking if server is running..." -ForegroundColor Yellow
$nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
$portCheck = netstat -ano | Select-String ":5000.*LISTENING"

if ($nodeProcs -and $portCheck) {
    Write-Host "  ✅ Node processes running: $($nodeProcs.Count)" -ForegroundColor Green
    Write-Host "  ✅ Port 5000 is listening" -ForegroundColor Green
    
    # Test HTTP
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✅ HTTP Server responding (Status: $($response.StatusCode))" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ SUCCESS! Server is running!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Auto-startup worked! Server started automatically!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Open: http://localhost:5000" -ForegroundColor Yellow
        exit 0
    } catch {
        Write-Host "  ⚠️ Server processes exist but not responding yet" -ForegroundColor Yellow
        Write-Host "  Waiting a bit more..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            Write-Host "  ✅ HTTP Server now responding (Status: $($response.StatusCode))" -ForegroundColor Green
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  ✅ SUCCESS! Server is running!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Open: http://localhost:5000" -ForegroundColor Yellow
            exit 0
        } catch {
            Write-Host "  ❌ Server still not responding" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ⚠️ Server not running automatically" -ForegroundColor Yellow
    Write-Host "  This means auto-startup didn't work" -ForegroundColor Yellow
}

# Step 3: If server not running, start it manually
Write-Host ""
Write-Host "Step 3: Server not running - starting manually..." -ForegroundColor Yellow

if (-not (Test-Path "auto-start-server.ps1")) {
    Write-Host "  ❌ auto-start-server.ps1 not found!" -ForegroundColor Red
    Write-Host "  Please run: .\fix-permanent-startup.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Starting server with auto-start script..." -ForegroundColor Gray
Write-Host ""

# Start server in new window so user can see output
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-NoExit", "-File", "$PWD\auto-start-server.ps1"

Write-Host "  ✅ Server starting in new window..." -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for server to start..." -ForegroundColor Yellow

# Wait and verify
$maxWait = 30
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "  Checking... ($waited/$maxWait seconds)" -ForegroundColor Gray
    
    $portCheck = netstat -ano | Select-String ":5000.*LISTENING"
    if ($portCheck) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            $serverReady = $true
            Write-Host ""
            Write-Host "  ✅ Server is now running!" -ForegroundColor Green
            Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
            break
        } catch {
            # Still starting
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($serverReady) {
    Write-Host "  ✅ SERVER IS RUNNING!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Open: http://localhost:5000" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️ INVESTIGATION NEEDED" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Server didn't start automatically. Investigating..." -ForegroundColor Yellow
    Write-Host ""
    
    # Investigation
    Write-Host "Checking VS Code tasks..." -ForegroundColor Cyan
    if (Test-Path ".vscode\tasks.json") {
        Write-Host "  ✅ .vscode\tasks.json exists" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .vscode\tasks.json missing!" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Checking workspace settings..." -ForegroundColor Cyan
    if (Test-Path "StargatePortal.code-workspace") {
        $workspace = Get-Content "StargatePortal.code-workspace" | ConvertFrom-Json
        if ($workspace.settings."task.allowAutomaticTasks" -eq "on") {
            Write-Host "  ✅ Auto-tasks enabled" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Auto-tasks not enabled" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "  1. Make sure you opened the project in VS Code/Cursor" -ForegroundColor White
    Write-Host "  2. Check if VS Code asked to 'Trust Workspace' - click Yes" -ForegroundColor White
    Write-Host "  3. Check the terminal panel for any error messages" -ForegroundColor White
    Write-Host "  4. Manually run: .\auto-start-server.ps1" -ForegroundColor White
}

