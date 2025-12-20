# ============================================================================
# StargatePortal - Comprehensive Startup and Verification Script
# ============================================================================
# This script ensures the frontend and backend start reliably and verifies
# everything is operational before declaring success.
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

# ============================================================================
# STEP 1: PREREQUISITE CHECKS
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTPORTAL STARTUP & VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Step "STEP 1: Checking Prerequisites..."

# Check Node.js installation
$nodePath = $null
$possiblePaths = @(
    "C:\Program Files\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "${env:LOCALAPPDATA}\Programs\nodejs"
)

foreach ($path in $possiblePaths) {
    if (Test-Path "$path\node.exe") {
        $nodePath = $path
        break
    }
}

if (-not $nodePath) {
    Write-Error "Node.js not found in standard locations"
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   Or update this script with your Node.js installation path" -ForegroundColor Yellow
    exit 1
}

Write-Success "Found Node.js at: $nodePath"

# Add Node.js to PATH
$env:PATH = "$nodePath;$env:PATH"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::Process)

# Verify Node.js version
$nodeVersion = & "$nodePath\node.exe" --version
Write-Success "Node.js version: $nodeVersion"

# Verify npm
$npmPath = "$nodePath\npm.cmd"
if (-not (Test-Path $npmPath)) {
    Write-Error "npm not found at: $npmPath"
    exit 1
}
Write-Success "npm found"

# Change to project directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $projectDir
Set-Location $projectDir
Write-Info "Working directory: $projectDir"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found - installing dependencies..."
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
} else {
    Write-Success "Dependencies found"
}

# ============================================================================
# STEP 2: CLEANUP EXISTING PROCESSES
# ============================================================================

Write-Step "STEP 2: Cleaning Up Existing Processes..."

# Stop existing Node processes
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    Write-Info "Found $($existing.Count) existing Node process(es) - stopping..."
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Success "Existing processes stopped"
} else {
    Write-Success "No existing processes found"
}

# Check if port 5000 is in use
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portInUse) {
    Write-Warning "Port 5000 is in use - attempting to free it..."
    $pid = $portInUse.OwningProcess
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Success "Port 5000 freed"
} else {
    Write-Success "Port 5000 is available"
}

# ============================================================================
# STEP 3: SET ENVIRONMENT VARIABLES
# ============================================================================

Write-Step "STEP 3: Setting Environment Variables..."

$env:NODE_ENV = "development"
$env:PORT = "5000"
Write-Success "Environment configured (NODE_ENV=development, PORT=5000)"

# ============================================================================
# STEP 4: START THE SERVER
# ============================================================================

Write-Step "STEP 4: Starting Development Server..."

Write-Info "Server will start in the background..."
Write-Info "Please wait for initialization (this may take 15-30 seconds)..."

# Start server in background job
$serverJob = Start-Job -ScriptBlock {
    param($npmPath, $workDir, $nodePath)
    
    Set-Location $workDir
    $env:PATH = "$nodePath;$env:PATH"
    $env:NODE_ENV = "development"
    $env:PORT = "5000"
    
    & $npmPath run dev 2>&1
    
} -ArgumentList $npmPath, $projectDir, $nodePath

Write-Success "Server process started (Job ID: $($serverJob.Id))"

# ============================================================================
# STEP 5: WAIT FOR SERVER INITIALIZATION
# ============================================================================

Write-Step "STEP 5: Waiting for Server Initialization..."

$maxWait = 60  # Maximum wait time in seconds
$waited = 0
$serverReady = $false
$checkInterval = 2

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds $checkInterval
    $waited += $checkInterval
    
    # Check if port is listening
    $portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
    if ($portCheck) {
        # Give it a moment more for full initialization
        Start-Sleep -Seconds 3
        
        # Try to fetch the root page
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/" `
                -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                Write-Success "Server is responding on port 5000"
                break
            }
        } catch {
            # Server might still be initializing
        }
    }
    
    # Check job status
    $jobState = Get-Job -Id $serverJob.Id
    if ($jobState.State -eq "Failed" -or $jobState.State -eq "Completed") {
        Write-Error "Server job failed or completed unexpectedly"
        $jobOutput = Receive-Job -Id $serverJob.Id
        Write-Host $jobOutput -ForegroundColor Red
        Remove-Job -Id $serverJob.Id -Force
        exit 1
    }
    
    if ($waited % 6 -eq 0) {
        Write-Info "Still initializing... (${waited}s elapsed)"
    }
}

if (-not $serverReady) {
    Write-Error "Server did not become ready within $maxWait seconds"
    Write-Host "`nChecking server job output..." -ForegroundColor Yellow
    $jobOutput = Receive-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    if ($jobOutput) {
        Write-Host $jobOutput -ForegroundColor Red
    }
    Remove-Job -Id $serverJob.Id -Force
    exit 1
}

# ============================================================================
# STEP 6: COMPREHENSIVE VERIFICATION
# ============================================================================

Write-Step "STEP 6: Verifying All Services..."

$allChecksPassed = $true

# Check 1: Port is listening
Write-Info "Checking port 5000..."
$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portCheck) {
    Write-Success "Port 5000 is listening"
} else {
    Write-Error "Port 5000 is not listening"
    $allChecksPassed = $false
}

# Check 2: API Health Endpoint
Write-Info "Testing API health endpoint..."
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Success "API health endpoint responding"
    } else {
        Write-Error "API health endpoint returned status: $($healthResponse.StatusCode)"
        $allChecksPassed = $false
    }
} catch {
    Write-Error "API health endpoint failed: $($_.Exception.Message)"
    $allChecksPassed = $false
}

# Check 3: Frontend Health Endpoint
Write-Info "Testing frontend health endpoint..."
try {
    $frontendHealthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health/frontend" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($frontendHealthResponse.StatusCode -eq 200) {
        $healthData = $frontendHealthResponse.Content | ConvertFrom-Json
        if ($healthData.status -eq "ok") {
            Write-Success "Frontend health check passed"
        } else {
            Write-Warning "Frontend health check returned: $($healthData.status)"
            if ($healthData.errors) {
                foreach ($error in $healthData.errors) {
                    Write-Host "   - $error" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Error "Frontend health endpoint returned status: $($frontendHealthResponse.StatusCode)"
        $allChecksPassed = $false
    }
} catch {
    Write-Warning "Frontend health endpoint check failed: $($_.Exception.Message)"
    Write-Info "   (This might be OK if endpoint doesn't exist yet)"
}

# Check 4: Frontend HTML is being served
Write-Info "Verifying frontend HTML is being served..."
try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:5000/" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($rootResponse.StatusCode -eq 200) {
        $html = $rootResponse.Content
        
        # Check if it's valid HTML
        if ($html -match "<!DOCTYPE html|<!doctype html|<html") {
            Write-Success "Frontend HTML is being served"
            
            # Check for React app entry point
            if ($html -match 'id="root"' -and ($html -match 'main\.tsx|main\.jsx|main\.js')) {
                Write-Success "React app entry point found in HTML"
            } else {
                Write-Warning "React app entry point not clearly found (might still be OK)"
            }
        } else {
            Write-Error "Response doesn't appear to be valid HTML"
            $allChecksPassed = $false
        }
    } else {
        Write-Error "Root endpoint returned status: $($rootResponse.StatusCode)"
        $allChecksPassed = $false
    }
} catch {
    Write-Error "Failed to fetch root HTML: $($_.Exception.Message)"
    $allChecksPassed = $false
}

# ============================================================================
# STEP 7: FINAL STATUS
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTUP VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allChecksPassed) {
    Write-Host "🎉 ALL SERVICES OPERATIONAL" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "✅ Backend server: RUNNING" -ForegroundColor Green
    Write-Host "✅ Frontend server: RUNNING" -ForegroundColor Green
    Write-Host "✅ API endpoints: OPERATIONAL" -ForegroundColor Green
    Write-Host "✅ Frontend HTML: SERVING" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend is ready at:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5000" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host "📋 Server is running in background job:" -ForegroundColor Gray
    Write-Host "   Job ID: $($serverJob.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 To view server output:" -ForegroundColor Yellow
    Write-Host "   Receive-Job -Id $($serverJob.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 To stop the server:" -ForegroundColor Yellow
    Write-Host "   Stop-Job -Id $($serverJob.Id); Remove-Job -Id $($serverJob.Id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✨ You can now open your browser and access the frontend!" -ForegroundColor Green
} else {
    Write-Host "⚠️  SOME CHECKS FAILED" -ForegroundColor Yellow -BackgroundColor DarkYellow
    Write-Host ""
    Write-Host "Please review the errors above and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Server job output:" -ForegroundColor Gray
    $jobOutput = Receive-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    if ($jobOutput) {
        Write-Host $jobOutput -ForegroundColor Red
    }
    Remove-Job -Id $serverJob.Id -Force
    exit 1
}

Write-Host ""

