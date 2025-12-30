<#
.SYNOPSIS
    StargatePortal Development Environment Startup Script

.DESCRIPTION
    This script automates the startup of all development servers for StargatePortal.
    It performs environment checks, starts servers, and verifies they are running.

.EXAMPLE
    .\scripts\startup.ps1

.EXAMPLE
    .\scripts\startup.ps1 -SkipChecks
#>

param(
    [switch]$SkipChecks,
    [switch]$Docker,
    [int]$MaxRetries = 5,
    [int]$RetryDelay = 2
)

# Colors for output
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "Info",
        [switch]$NoNewLine
    )
    $color = $colors[$Status]
    if ($NoNewLine) {
        Write-Host $Message -ForegroundColor $color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $color
    }
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $colors.Header
    Write-Host "  $Title" -ForegroundColor $colors.Header
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $colors.Header
    Write-Host ""
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

function Wait-ForServer {
    param(
        [int]$Port,
        [string]$ServiceName,
        [int]$MaxRetries = 10,
        [int]$RetryDelay = 2
    )

    Write-Status "Waiting for $ServiceName on port $Port..." -Status "Info" -NoNewLine

    for ($i = 1; $i -le $MaxRetries; $i++) {
        if (Test-Port -Port $Port) {
            Write-Status " ✅ Running" -Status "Success"
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds $RetryDelay
    }

    Write-Status " ❌ Failed" -Status "Error"
    return $false
}

function Test-HttpEndpoint {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# ═══════════════════════════════════════════════════════════════
# MAIN SCRIPT
# ═══════════════════════════════════════════════════════════════

Write-Header "StargatePortal Startup Script"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectRoot

Write-Status "Project Root: $projectRoot" -Status "Info"

# ═══════════════════════════════════════════════════════════════
# STEP 1: Environment Checks
# ═══════════════════════════════════════════════════════════════

if (-not $SkipChecks) {
    Write-Header "Step 1: Environment Checks"

    # Check Node.js version
    Write-Status "Checking Node.js version..." -Status "Info" -NoNewLine
    try {
        $nodeVersion = (node --version) -replace 'v', ''
        $majorVersion = [int]($nodeVersion.Split('.')[0])
        if ($majorVersion -ge 20) {
            Write-Status " ✅ v$nodeVersion" -Status "Success"
        } else {
            Write-Status " ❌ v$nodeVersion (requires 20+)" -Status "Error"
            exit 1
        }
    } catch {
        Write-Status " ❌ Node.js not found" -Status "Error"
        exit 1
    }

    # Check .env file
    Write-Status "Checking .env file..." -Status "Info" -NoNewLine
    if (Test-Path ".env") {
        Write-Status " ✅ Found" -Status "Success"
    } else {
        Write-Status " ⚠️ Missing" -Status "Warning"
        if (Test-Path ".env.example") {
            Write-Status "Creating .env from .env.example..." -Status "Info"
            Copy-Item ".env.example" ".env"
            Write-Status "Please configure your API keys in .env" -Status "Warning"
        }
    }

    # Check node_modules
    Write-Status "Checking dependencies..." -Status "Info" -NoNewLine
    if (Test-Path "node_modules/.package-lock.json") {
        Write-Status " ✅ Installed" -Status "Success"
    } else {
        Write-Status " ⚠️ Missing" -Status "Warning"
        Write-Status "Installing dependencies..." -Status "Info"
        npm install
    }

    # Check if ports are available
    Write-Status "Checking port 5000..." -Status "Info" -NoNewLine
    if (Test-Port -Port 5000) {
        Write-Status " ⚠️ In use (server may already be running)" -Status "Warning"
    } else {
        Write-Status " ✅ Available" -Status "Success"
    }
}

# ═══════════════════════════════════════════════════════════════
# STEP 2: Start Servers
# ═══════════════════════════════════════════════════════════════

Write-Header "Step 2: Starting Development Servers"

# Check if server is already running
if (Test-Port -Port 5000) {
    Write-Status "Server already running on port 5000" -Status "Warning"
    $response = Read-Host "Restart server? (y/n)"
    if ($response -eq 'y') {
        Write-Status "Stopping existing server..." -Status "Info"
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Status "Skipping server start" -Status "Info"
    }
}

if ($Docker) {
    Write-Status "Starting with Docker Compose..." -Status "Info"
    docker-compose -f docker-compose.dev.yml up -d
} else {
    Write-Status "Starting development server..." -Status "Info"

    # Start npm run dev in a new window
    $process = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npm run dev" `
        -WorkingDirectory $projectRoot `
        -PassThru `
        -WindowStyle Normal

    Write-Status "Server process started (PID: $($process.Id))" -Status "Success"
}

# ═══════════════════════════════════════════════════════════════
# STEP 3: Verify Servers
# ═══════════════════════════════════════════════════════════════

Write-Header "Step 3: Verifying Servers"

# Wait for servers to start
Start-Sleep -Seconds 3

$allPassed = $true

# Check Express server
if (-not (Wait-ForServer -Port 5000 -ServiceName "Express Server" -MaxRetries $MaxRetries -RetryDelay $RetryDelay)) {
    $allPassed = $false
}

# Check HTTP response
Write-Status "Testing HTTP response..." -Status "Info" -NoNewLine
if (Test-HttpEndpoint -Url "http://localhost:5000") {
    Write-Status " ✅ OK" -Status "Success"
} else {
    Write-Status " ⚠️ No response (server may still be starting)" -Status "Warning"
}

# ═══════════════════════════════════════════════════════════════
# FINAL STATUS
# ═══════════════════════════════════════════════════════════════

Write-Header "Startup Complete"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $colors.Header
Write-Host "║              StargatePortal Development Server               ║" -ForegroundColor $colors.Header
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor $colors.Header
Write-Host "║                                                              ║" -ForegroundColor $colors.Header
Write-Host "║  Frontend:  http://localhost:5000                            ║" -ForegroundColor $colors.Success
Write-Host "║  API:       http://localhost:5000/api                        ║" -ForegroundColor $colors.Success
Write-Host "║  Vite HMR:  http://localhost:5173                            ║" -ForegroundColor $colors.Info
Write-Host "║                                                              ║" -ForegroundColor $colors.Header
Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor $colors.Header
Write-Host "║  Press Ctrl+C in the server window to stop                   ║" -ForegroundColor $colors.Info
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $colors.Header
Write-Host ""

if ($allPassed) {
    Write-Status "All services started successfully! 🚀" -Status "Success"
} else {
    Write-Status "Some services may not be running. Check the server window for errors." -Status "Warning"
}
