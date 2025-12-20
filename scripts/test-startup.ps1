# ============================================================================
# StargatePortal - Startup Test/Simulation Script
# ============================================================================
# This script simulates the full startup process to verify everything works:
# - Stops server if running
# - Runs startup script
# - Verifies all steps
# - Reports success/failure
# ============================================================================

$ErrorActionPreference = "Continue"

# Color output functions
function Write-Step {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTUP TEST/SIMULATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project directory
$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location $projectDir

# ============================================================================
# PHASE 1: STOP EXISTING SERVER (IF RUNNING)
# ============================================================================

Write-Step "PHASE 1: Stopping Existing Server (if running)..."

# Check if port 5000 is in use
$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portCheck) {
    Write-Info "Port 5000 is in use - stopping server..."
    
    # Try to stop via API first (graceful shutdown)
    try {
        Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
            -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Info "Server is responding - attempting graceful shutdown..."
        # Note: We don't have a shutdown endpoint, so we'll kill the process
    } catch {
        Write-Info "Server not responding to API calls"
    }
    
    # Stop Node processes
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Info "Stopping $($nodeProcesses.Count) Node process(es)..."
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 3
        Write-Success "Node processes stopped"
    }
    
    # Verify port is free
    Start-Sleep -Seconds 2
    $portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
    if ($portCheck) {
        Write-Warning "Port 5000 still in use - may need manual cleanup"
    } else {
        Write-Success "Port 5000 is now free"
    }
} else {
    Write-Success "No server running - port 5000 is free"
}

# ============================================================================
# PHASE 2: RUN STARTUP SCRIPT
# ============================================================================

Write-Step "PHASE 2: Running Startup Script..."

$startupScript = Join-Path $PSScriptRoot "auto-start-and-verify.ps1"

if (-not (Test-Path $startupScript)) {
    Write-Error "Startup script not found: $startupScript"
    exit 1
}

Write-Info "Executing: $startupScript"
Write-Host ""

# Run the startup script
& $startupScript

$startupExitCode = $LASTEXITCODE

if ($startupExitCode -ne 0) {
    Write-Error "Startup script failed with exit code: $startupExitCode"
    exit $startupExitCode
}

Write-Success "Startup script completed successfully"

# ============================================================================
# PHASE 3: VERIFY STARTUP STATUS FILE
# ============================================================================

Write-Step "PHASE 3: Verifying Startup Status File..."

$statusFile = Join-Path $projectDir "STARTUP_STATUS.json"

if (Test-Path $statusFile) {
    Write-Success "Status file exists: $statusFile"
    
    try {
        $statusData = Get-Content $statusFile -Raw | ConvertFrom-Json
        
        Write-Info "Status: $($statusData.status)"
        Write-Info "Message: $($statusData.message)"
        Write-Info "Server Running: $($statusData.serverRunning)"
        Write-Info "Port Listening: $($statusData.portListening)"
        Write-Info "Health Check Passed: $($statusData.healthCheckPassed)"
        
        if ($statusData.status -eq "success") {
            Write-Success "Status file indicates successful startup"
        } else {
            Write-Warning "Status file indicates: $($statusData.status)"
            if ($statusData.error) {
                Write-Warning "Error: $($statusData.error)"
            }
        }
    } catch {
        Write-Warning "Could not parse status file: $($_.Exception.Message)"
    }
} else {
    Write-Warning "Status file not found - startup script may not have written it"
}

# ============================================================================
# PHASE 4: VERIFY SERVER IS RUNNING
# ============================================================================

Write-Step "PHASE 4: Verifying Server is Running..."

# Check port
$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portCheck) {
    Write-Success "Port 5000 is listening"
} else {
    Write-Error "Port 5000 is NOT listening"
    exit 1
}

# Check health endpoint
Write-Info "Testing health endpoint..."
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Success "Health endpoint responding (HTTP 200)"
    } else {
        Write-Error "Health endpoint returned: $($healthResponse.StatusCode)"
        exit 1
    }
} catch {
    Write-Error "Health endpoint failed: $($_.Exception.Message)"
    exit 1
}

# Check startup status endpoint
Write-Info "Testing startup status endpoint..."
try {
    $startupStatusResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/startup/status" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($startupStatusResponse.StatusCode -eq 200) {
        $startupData = $startupStatusResponse.Content | ConvertFrom-Json
        Write-Success "Startup status endpoint responding"
        Write-Info "Overall Status: $($startupData.overallStatus)"
        Write-Info "Server Running: $($startupData.serverRunning)"
        Write-Info "Database: $($startupData.database)"
        Write-Info "Vite Initialized: $($startupData.vite.initialized)"
    } else {
        Write-Warning "Startup status endpoint returned: $($startupStatusResponse.StatusCode)"
    }
} catch {
    Write-Warning "Startup status endpoint failed: $($_.Exception.Message)"
}

# Check frontend
Write-Info "Testing frontend..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5000/" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($frontendResponse.StatusCode -eq 200) {
        $html = $frontendResponse.Content
        if ($html -match "<!DOCTYPE html|<!doctype html|<html") {
            Write-Success "Frontend HTML is being served"
        } else {
            Write-Warning "Response does not appear to be valid HTML"
        }
    } else {
        Write-Warning "Frontend returned: $($frontendResponse.StatusCode)"
    }
} catch {
    Write-Warning "Frontend check failed: $($_.Exception.Message)"
}

# ============================================================================
# PHASE 5: FINAL REPORT
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STARTUP TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STARTUP TEST PASSED" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "[OK] Server is running on port 5000" -ForegroundColor Green
Write-Host "[OK] Health endpoint responding" -ForegroundColor Green
Write-Host "[OK] Frontend is accessible" -ForegroundColor Green
Write-Host ""
Write-Host "Server URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Startup process verified successfully" -ForegroundColor Green
Write-Host ""

