# ============================================================================
# StargatePortal - Comprehensive Auto-Start and Verification Script
# ============================================================================
# This script ensures everything starts reliably when opening the project:
# - Checks and starts PostgreSQL if needed
# - Verifies Node.js/npm availability
# - Cleans up existing processes
# - Starts server in background
# - Verifies all services
# - Writes status file for AI to read
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
        timestamp = (Get-Date).ToUniversalTime().ToString("o")
        status = $Status
        message = $Message
        serverRunning = $ServerRunning
        portListening = $PortListening
        healthCheckPassed = $HealthCheckPassed
        error = $Error
        jobId = $JobId
        url = "http://localhost:5000"
    }
    
    $statusData | ConvertTo-Json -Depth 10 | Out-File -FilePath $statusFile -Encoding UTF8 -Force
}

# Initialize status file
Write-StatusFile -Status "starting" -Message "Startup script initiated"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTPORTAL AUTO-START AND VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PHASE 1: DATABASE CHECK
# ============================================================================

Write-Step "PHASE 1: Checking Database..."

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
            Write-Success "PostgreSQL service running: $($runningService.Name)"
        } else {
            Write-Warning "PostgreSQL service found but not running - attempting to start..."
            $serviceToStart = $pgServices | Select-Object -First 1
            try {
                Start-Service -Name $serviceToStart.Name -ErrorAction Stop
                Start-Sleep -Seconds 3
                Write-Success "PostgreSQL service started: $($serviceToStart.Name)"
            } catch {
                Write-Warning "Could not start PostgreSQL service: $($_.Exception.Message)"
                Write-Info "Server will continue but database features may not work"
            }
        }
    } else {
        Write-Warning "PostgreSQL service not found - server will use in-memory storage"
    }
} elseif ($databaseUrl -match "neon\.tech") {
    Write-Success "Neon serverless database detected - no local service needed"
} elseif ($databaseUrl) {
    $dbPreview = $databaseUrl.Substring(0, [Math]::Min(50, $databaseUrl.Length))
    Write-Info "Database URL configured: $dbPreview..."
} else {
    Write-Info "DATABASE_URL not set - server will use in-memory storage"
}

# ============================================================================
# PHASE 2: PREREQUISITE CHECKS
# ============================================================================

Write