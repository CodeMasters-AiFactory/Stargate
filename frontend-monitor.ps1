# Continuous Frontend Monitoring & Auto-Recovery System
# This script monitors the frontend continuously and automatically recovers from failures

param(
    [int]$CheckInterval = 10,
    [int]$MaxRestartAttempts = 3
)

$ErrorActionPreference = "Continue"
$script:ProjectRoot = $PSScriptRoot
$script:ServerPort = 5000
$script:ServerUrl = "http://localhost:$ServerPort"
$script:RestartAttempts = 0
$script:LastFailureTime = $null
$script:MonitoringActive = $true

function Write-Status {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [OK] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [WARN] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [INFO] $Message" -ForegroundColor Gray
}

function Add-NodeToPath {
    $nodePaths = @(
        "C:\Program Files\nodejs",
        "$env:ProgramFiles\nodejs",
        "$env:ProgramFiles(x86)\nodejs",
        "$env:LOCALAPPDATA\Programs\nodejs"
    )
    
    foreach ($path in $nodePaths) {
        if (Test-Path "$path\node.exe") {
            if ($env:PATH -notlike "*$path*") {
                $env:PATH = "$env:PATH;$path"
            }
            return $true
        }
    }
    
    return (Get-Command node -ErrorAction SilentlyContinue) -ne $null
}

function Test-FrontendHealth {
    # Try multiple URLs
    $urls = @(
        $script:ServerUrl,
        "http://127.0.0.1:$script:ServerPort"
    )
    
    foreach ($url in $urls) {
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                return @{ 
                    Healthy = $true; 
                    StatusCode = $response.StatusCode; 
                    Url = $url;
                    ResponseTime = $response.Headers.'X-Response-Time'
                }
            }
        } catch {
            # Continue to next URL
        }
    }
    
    # Check if port is listening
    $listening = netstat -ano | Select-String ":$script:ServerPort.*LISTENING"
    if ($listening) {
        return @{ 
            Healthy = $false; 
            StatusCode = 0; 
            Url = "Port listening but HTTP failed";
            Error = "Server process exists but not responding to HTTP requests"
        }
    }
    
    return @{ 
        Healthy = $false; 
        StatusCode = 0; 
        Url = "No response";
        Error = "Server not running or not accessible"
    }
}

function Get-ServerProcess {
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue
    $portProcesses = @()
    
    foreach ($proc in $processes) {
        $connections = netstat -ano | Select-String ":$script:ServerPort.*LISTENING" | Select-String "$($proc.Id)"
        if ($connections) {
            $portProcesses += $proc
        }
    }
    
    return $portProcesses
}

function Stop-ServerProcesses {
    Write-Info "Stopping server processes..."
    $processes = Get-ServerProcess
    if ($processes) {
        $processes | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Success "Stopped $($processes.Count) server process(es)"
        return $true
    }
    return $false
}

function Start-Server {
    Write-Status "Starting server..." "Yellow"
    
    if (-not (Add-NodeToPath)) {
        Write-ErrorMsg "Cannot start server: Node.js not found"
        return $false
    }
    
    # Stop any existing processes
    Stop-ServerProcesses | Out-Null
    
    Set-Location $script:ProjectRoot
    $env:NODE_ENV = "development"
    $env:PORT = "$script:ServerPort"
    
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    $nodeDir = Split-Path $nodePath
    $npmPath = Join-Path $nodeDir "npm.cmd"
    
    if (-not (Test-Path $npmPath)) {
        Write-ErrorMsg "npm not found"
        return $false
    }
    
    # Start server in background
    $job = Start-Job -ScriptBlock {
        param($projectRoot, $serverPort, $nodeDir, $npmPath)
        
        $env:PATH = "$env:PATH;$nodeDir"
        Set-Location $projectRoot
        $env:NODE_ENV = "development"
        $env:PORT = "$serverPort"
        
        & $npmPath run dev *>&1
    } -ArgumentList $script:ProjectRoot, $script:ServerPort, $nodeDir, $npmPath
    
    Write-Success "Server job started (ID: $($job.Id))"
    
    # Wait for server to start
    $maxWait = 60
    $startTime = Get-Date
    
    while (((Get-Date) - $startTime).TotalSeconds -lt $maxWait) {
        Start-Sleep -Seconds 3
        
        $health = Test-FrontendHealth
        if ($health.Healthy) {
            Write-Success "Server started and responding!"
            return $true
        }
        
        # Check for errors in job output
        $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
        if ($output) {
            $errors = $output | Where-Object { $_ -match "error|Error|ERROR|failed|Failed|FAILED|EADDRINUSE" }
            if ($errors) {
                Write-Warning "Server errors detected:"
                $errors | Select-Object -Last 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            }
        }
        
        if ($job.State -eq "Failed") {
            Write-ErrorMsg "Server job failed"
            $jobOutput = Receive-Job -Job $job
            if ($jobOutput) {
                $jobOutput | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
            }
            return $false
        }
    }
    
    Write-Warning "Server did not respond within $maxWait seconds"
    return $false
}

function Restore-Frontend {
    Write-Status "Attempting to restore frontend..." "Yellow"
    
    $script:RestartAttempts++
    
    if ($script:RestartAttempts -gt $MaxRestartAttempts) {
        Write-ErrorMsg "Maximum restart attempts ($MaxRestartAttempts) reached. Manual intervention required."
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. Server console for error messages" -ForegroundColor White
        Write-Host "  2. Dependencies: npm install" -ForegroundColor White
        Write-Host "  3. Port conflicts: netstat -ano | findstr :5000" -ForegroundColor White
        Write-Host "  4. Try manually: npm run dev" -ForegroundColor White
        return $false
    }
    
    Write-Info "Restart attempt $script:RestartAttempts/$MaxRestartAttempts"
    
    $success = Start-Server
    
    if ($success) {
        Write-Success "Frontend restored successfully!"
        $script:RestartAttempts = 0
        $script:LastFailureTime = $null
        return $true
    } else {
        Write-ErrorMsg "Failed to restore frontend"
        return $false
    }
}

# Main Monitoring Loop
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "   FRONTEND MONITORING & AUTO-RECOVERY SYSTEM" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Info "Monitoring frontend at: $script:ServerUrl"
Write-Info "Check interval: $CheckInterval seconds"
Write-Info "Max restart attempts: $MaxRestartAttempts"
Write-Host ""
Write-Info "Press Ctrl+C to stop monitoring"
Write-Host ""

# Initial health check
Write-Status "Performing initial health check..." "Cyan"
$initialHealth = Test-FrontendHealth

if (-not $initialHealth.Healthy) {
    Write-Warning "Frontend is not healthy. Attempting to start..."
    if (-not (Restore-Frontend)) {
        Write-ErrorMsg "Failed to start frontend initially"
        exit 1
    }
} else {
    Write-Success "Frontend is healthy (Status: $($initialHealth.StatusCode))"
}

# Continuous monitoring loop
$consecutiveFailures = 0
$lastSuccessTime = Get-Date

while ($script:MonitoringActive) {
    Start-Sleep -Seconds $CheckInterval
    
    $health = Test-FrontendHealth
    
    if ($health.Healthy) {
        if ($consecutiveFailures -gt 0) {
            Write-Success "Frontend recovered! (Status: $($health.StatusCode))"
            $consecutiveFailures = 0
            $script:RestartAttempts = 0
        } else {
            # Only log success every 60 seconds to reduce noise
            $timeSinceLastSuccess = ((Get-Date) - $lastSuccessTime).TotalSeconds
            if ($timeSinceLastSuccess -ge 60) {
                Write-Success "Frontend healthy (Status: $($health.StatusCode))"
                $lastSuccessTime = Get-Date
            }
        }
    } else {
        $consecutiveFailures++
        $script:LastFailureTime = Get-Date
        
        Write-ErrorMsg "Frontend health check failed!"
        Write-Host "  Error: $($health.Error)" -ForegroundColor Red
        Write-Host "  Consecutive failures: $consecutiveFailures" -ForegroundColor Yellow
        
        # Attempt recovery after 2 consecutive failures
        if ($consecutiveFailures -ge 2) {
            Write-Warning "Attempting automatic recovery..."
            Restore-Frontend | Out-Null
        }
    }
}

Write-Info "Monitoring stopped"

