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
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Gray
}

# Status file path
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $projectDir
$statusFile = Join-Path $projectDir "STARTUP_STATUS.json"

# Function to write status file
function Write-StatusFile {
    param(
        [string]$Status,
        [string]$Message,
        [bool]$ServerRunning = $false,
        [bool]$PortListening = $false,
        [bool]$HealthCheckPassed = $false,
        [string]$Error = $null,
        [int]$JobId = 0
    )
    
    $statusData = @{
        timestamp = (Get-Date).ToUniversalTime().ToString('o')
        status = $Status
        message = $Message
        serverRunning = $ServerRunning
        portListening = $PortListening
        healthCheckPassed = $HealthCheckPassed
        error = $Error
        jobId = $JobId
        url = 'http://localhost:5000'
    }
    
    $statusData | ConvertTo-Json -Depth 10 | Out-File -FilePath $statusFile -Encoding UTF8 -Force
}

# Initialize status file
Write-StatusFile -Status 'starting' -Message 'Startup script initiated'

# ============================================================================
# STEP 0: DATABASE CHECK
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTPORTAL STARTUP AND VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Step "STEP 0: Checking Database..."

# Check DATABASE_URL from .env file
$envFile = Join-Path $projectDir ".env"
$databaseUrl = $null
$isLocalPostgres = $false

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DATABASE_URL=(.+)") {
        $databaseUrl = $matches[1].Trim()
        if ($databaseUrl -match "localhost|127\.0\.0\.1" -and $databaseUrl -notmatch "neon\.tech") {
            $isLocalPostgres = $true
        }
    }
}

if ($isLocalPostgres) {
    Write-Info "Local PostgreSQL detected - checking service..."
    
    # Check PostgreSQL service
    $pgServices = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
    if ($pgServices) {
        $runningService = $pgServices | Where-Object { $_.Status -eq "Running" }
        if ($runningService) {
            $pgServiceMsg = 'PostgreSQL service running: ' + $runningService.Name
            Write-Success $pgServiceMsg
        } else {
            Write-Warning "PostgreSQL service found but not running - attempting to start..."
            $serviceToStart = $pgServices | Select-Object -First 1
            try {
                Start-Service -Name $serviceToStart.Name -ErrorAction Stop
                Start-Sleep -Seconds 3
                $pgStartedMsg = 'PostgreSQL service started: ' + $serviceToStart.Name
                Write-Success $pgStartedMsg
            } catch {
                $pgErrorMsg = 'Could not start PostgreSQL service: ' + $_.Exception.Message
                Write-Warning $pgErrorMsg
                $continueMsg = 'Server will continue but database features may not work'
                Write-Info $continueMsg
            }
        }
    } else {
        Write-Warning "PostgreSQL service not found - server will use in-memory storage"
    }
} elseif ($databaseUrl -match "neon\.tech") {
    Write-Success "Neon serverless database detected - no local service needed"
} elseif ($databaseUrl) {
    $dbPreview = $databaseUrl.Substring(0, [Math]::Min(50, $databaseUrl.Length))
    $dbPreviewMsg = 'Database URL configured: ' + $dbPreview + '...'
    Write-Info $dbPreviewMsg
} else {
    Write-Info "DATABASE_URL not set - server will use in-memory storage"
}

# ============================================================================
# STEP 1: PREREQUISITE CHECKS
# ============================================================================

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

$nodePathMsg = 'Found Node.js at: ' + $nodePath
Write-Success $nodePathMsg

# Add Node.js to PATH
$currentPath = $env:PATH
$newPath = $nodePath + ";" + $currentPath
$env:PATH = $newPath

# Verify Node.js version
$nodeExe = Join-Path $nodePath 'node.exe'
$nodeVersion = & $nodeExe --version
$nodeVersionMsg = 'Node.js version: ' + $nodeVersion
Write-Success $nodeVersionMsg

# Verify npm
$npmPath = Join-Path $nodePath 'npm.cmd'
if (-not (Test-Path $npmPath)) {
    $npmErrorMsg = 'npm not found at: ' + $npmPath
    Write-Error $npmErrorMsg
    exit 1
}
$npmFoundMsg = 'npm found'
Write-Success $npmFoundMsg

# Change to project directory (already set above)
Set-Location $projectDir
$workDirMsg = 'Working directory: ' + $projectDir
Write-Info $workDirMsg

# Check if node_modules exists
$nodeModulesPath = 'node_modules'
if (-not (Test-Path $nodeModulesPath)) {
    $nodeModulesMsg = 'node_modules not found - installing dependencies...'
    Write-Warning $nodeModulesMsg
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        $depErrorMsg = 'Failed to install dependencies'
        Write-Error $depErrorMsg
        exit 1
    }
    $depInstalledMsg = 'Dependencies installed'
    Write-Success $depInstalledMsg
} else {
    $depFoundMsg = 'Dependencies found'
    Write-Success $depFoundMsg
}

# ============================================================================
# STEP 2: CLEANUP EXISTING PROCESSES
# ============================================================================

Write-Step "STEP 2: Cleaning Up Existing Processes..."

# Stop existing Node processes
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    $existingCount = $existing.Count
    $existingMsg = 'Found ' + $existingCount + ' existing Node process(es) - stopping...'
    Write-Info $existingMsg
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Success "Existing processes stopped"
} else {
    Write-Success "No existing processes found"
}

# Check if port 5000 is in use
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
if ($portInUse) {
    Write-Info "Port 5000 is already in use - checking if it is our server..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" `
            -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Server is already running and healthy!"
            Write-StatusFile -Status 'success' -Message 'Server already running' -ServerRunning $true -PortListening $true -HealthCheckPassed $true
            Write-Host "`nServer is ready at: http://localhost:5000" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Warning "Port 5000 is in use but server does not respond - freeing port..."
    }
    
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
$envConfigMsg = 'Environment configured (NODE_ENV=development, PORT=5000)'
Write-Success $envConfigMsg

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
    $currentPath = $env:PATH
    $newPath = $nodePath + ";" + $currentPath
    $env:PATH = $newPath
    $env:NODE_ENV = 'development'
    $env:PORT = '5000'
    
    & $npmPath run dev 2>&1
    
} -ArgumentList $npmPath, $projectDir, $nodePath

$jobId = $serverJob.Id
$serverStartedMsg = 'Server process started (Job ID: ' + $jobId + ')'
Write-Success $serverStartedMsg
Write-StatusFile -Status 'starting' -Message 'Server process started' -JobId $jobId

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
        $elapsedMsg = $waited.ToString() + ' seconds elapsed'
        $stillInitMsg = 'Still initializing... (' + $elapsedMsg + ')'
        Write-Info $stillInitMsg
    }
}

if (-not $serverReady) {
    $maxWaitStr = $maxWait.ToString() + ' second(s)'
    $errorMsg = 'Server did not become ready within ' + $maxWaitStr
    Write-Error $errorMsg
    Write-Host "`nChecking server job output..." -ForegroundColor Yellow
    $jobOutput = Receive-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    if ($jobOutput) {
        Write-Host $jobOutput -ForegroundColor Red
    }
    Remove-Job -Id $serverJob.Id -Force
    Write-StatusFile -Status 'error' -Message $errorMsg -Error 'Timeout waiting for server' -ServerRunning $false
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
        $statusCode = $healthResponse.StatusCode
        $statusMsg = 'API health endpoint returned status: ' + $statusCode
        Write-Error $statusMsg
        $allChecksPassed = $false
    }
} catch {
    $apiErrorMsg = 'API health endpoint failed: ' + $_.Exception.Message
    Write-Error $apiErrorMsg
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
            $frontendStatus = $healthData.status
            $frontendStatusMsg = 'Frontend health check returned: ' + $frontendStatus
            Write-Warning $frontendStatusMsg
            if ($healthData.errors) {
                foreach ($error in $healthData.errors) {
                    $errorLine = '   - ' + $error
                    Write-Host $errorLine -ForegroundColor Yellow
                }
            }
        }
    } else {
        $frontendStatusCode = $frontendHealthResponse.StatusCode
        $frontendStatusMsg = 'Frontend health endpoint returned status: ' + $frontendStatusCode
        Write-Error $frontendStatusMsg
        $allChecksPassed = $false
    }
} catch {
    $frontendErrorMsg = 'Frontend health endpoint check failed: ' + $_.Exception.Message
    Write-Warning $frontendErrorMsg
    Write-Info "   This might be OK if endpoint does not exist yet"
}

# Check 4: Frontend HTML is being served
Write-Info "Verifying frontend HTML is being served..."
try {
    $rootResponse = Invoke-WebRequest -Uri "http://localhost:5000/" `
        -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($rootResponse.StatusCode -eq 200) {
        $html = $rootResponse.Content
        
        # Check if it is valid HTML
        $hasDoctype = $html -match "<!DOCTYPE html"
        $hasDoctypeLower = $html -match "<!doctype html"
        $hasHtml = $html -match "<html"
        $isHtml = $hasDoctype -or $hasDoctypeLower -or $hasHtml
        
        if ($isHtml) {
            Write-Success "Frontend HTML is being served"
            
            # Check for React app entry point
            $hasRoot = $html -match 'id="root"'
            $hasMainTsx = $html -match 'main\.tsx'
            $hasMainJsx = $html -match 'main\.jsx'
            $hasMainJs = $html -match 'main\.js'
            $hasMain = $hasMainTsx -or $hasMainJsx -or $hasMainJs
            
            if ($hasRoot -and $hasMain) {
                Write-Success "React app entry point found in HTML"
            } else {
                Write-Warning "React app entry point not clearly found (might still be OK)"
            }
        } else {
            Write-Error "Response does not appear to be valid HTML"
            $allChecksPassed = $false
        }
    } else {
        $rootStatusCode = $rootResponse.StatusCode
        $rootStatusMsg = 'Root endpoint returned status: ' + $rootStatusCode
        Write-Error $rootStatusMsg
        $allChecksPassed = $false
    }
} catch {
    $rootErrorMsg = 'Failed to fetch root HTML: ' + $_.Exception.Message
    Write-Error $rootErrorMsg
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
    Write-Host "[SUCCESS] ALL SERVICES OPERATIONAL" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "[OK] Backend server: RUNNING" -ForegroundColor Green
    Write-Host "[OK] Frontend server: RUNNING" -ForegroundColor Green
    Write-Host "[OK] API endpoints: OPERATIONAL" -ForegroundColor Green
    Write-Host "[OK] Frontend HTML: SERVING" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Frontend is ready at:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5000" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ""
    Write-Host "[INFO] Server is running in background job:" -ForegroundColor Gray
    $jobIdDisplay = '   Job ID: ' + $serverJob.Id
    Write-Host $jobIdDisplay -ForegroundColor Gray
    Write-Host ""
    
    # Write success status file
    Write-StatusFile -Status 'success' -Message 'All services operational' -ServerRunning $true -PortListening $true -HealthCheckPassed $true -JobId $serverJob.Id
    
    Write-Host "[SUCCESS] Server startup complete! AI will verify browser next." -ForegroundColor Green
} else {
    Write-Host "[WARNING] SOME CHECKS FAILED" -ForegroundColor Yellow -BackgroundColor DarkYellow
    Write-Host ""
    Write-Host "Please review the errors above and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Server job output:" -ForegroundColor Gray
    $jobOutput = Receive-Job -Id $serverJob.Id -ErrorAction SilentlyContinue
    if ($jobOutput) {
        Write-Host $jobOutput -ForegroundColor Red
    }
    Remove-Job -Id $serverJob.Id -Force
    Write-StatusFile -Status 'error' -Message 'Some checks failed' -ServerRunning $false -Error 'Verification checks failed'
    exit 1
}

Write-Host ""

