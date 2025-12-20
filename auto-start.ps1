# Automatic Startup Script - Actually Works
# This script handles all PATH issues and starts everything properly

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Stargate Portal - Auto Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Find Node.js (try multiple locations)
$nodePath = $null
$searchPaths = @(
    "C:\Program Files\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "${env:LOCALAPPDATA}\Programs\nodejs",
    "$env:USERPROFILE\AppData\Roaming\npm"
)

Write-Host "🔍 Finding Node.js..." -ForegroundColor Yellow
foreach ($path in $searchPaths) {
    if (Test-Path "$path\node.exe") {
        $nodePath = $path
        Write-Host "✅ Found Node.js at: $nodePath" -ForegroundColor Green
        break
    }
}

if (-not $nodePath) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   Or add Node.js to your system PATH" -ForegroundColor Yellow
    exit 1
}

# Step 2: Verify npm exists
$npmPath = "$nodePath\npm.cmd"
if (-not (Test-Path $npmPath)) {
    Write-Host "❌ npm.cmd not found at: $npmPath" -ForegroundColor Red
    exit 1
}

# Step 3: Add to PATH for this session AND set it for ALL child processes
# THIS IS CRITICAL: Child processes (npm, cross-env, tsx, node) must inherit PATH
$env:PATH = "$nodePath;$env:PATH"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::Process)
Write-Host "✅ PATH set for all child processes" -ForegroundColor Green

# Step 4: Verify npm works
Write-Host "🔍 Verifying npm..." -ForegroundColor Yellow
try {
    $npmVersion = & $npmPath --version 2>&1
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm verification failed: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Set environment variables
$env:NODE_ENV = "development"
$env:PORT = "5000"

Write-Host ""

# Step 6: Check if server is already running
Write-Host "🔍 Checking for existing server..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":5000.*LISTENING"
if ($portCheck) {
    Write-Host "⚠️  Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "   Stopping existing Node processes..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Stopped existing processes" -ForegroundColor Green
}

# Step 7: Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    & $npmPath install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 8: Start browser opener in background (external + Cursor browser)
$browserJob = Start-Job -ScriptBlock {
    param($url)
    # Wait 8 seconds for server to start
    Start-Sleep -Seconds 8
    $maxWait = 45
    $waited = 0

    while ($waited -lt $maxWait) {
        $portCheck = netstat -ano | Select-String ":5000.*LISTENING"
        if ($portCheck) {
            # Additional wait for Vite to compile
            Start-Sleep -Seconds 3

            # Open external browser
            try {
                Start-Process $url
                Write-Host ""
                Write-Host "✅ External browser opened: $url" -ForegroundColor Green
            } catch {
                Write-Host ""
                Write-Host "⚠️  Could not open external browser" -ForegroundColor Yellow
            }

            # Note: Cursor browser will be navigated by the MCP extension
            # This happens automatically when server is ready
            Write-Host "📱 Cursor browser should navigate automatically" -ForegroundColor Cyan
            Write-Host "   If not, manually navigate to: $url" -ForegroundColor Yellow

            break
        }
        Start-Sleep -Seconds 1
        $waited++
    }
} -ArgumentList "http://localhost:5000"

# Step 9: Start the server
Write-Host "🌐 Server will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📱 Cursor Browser: Navigate to http://localhost:5000 when ready" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start server using full path to npm AND ensure node is in PATH for child processes
# We need to set PATH in a way that child processes inherit it
$env:PATH = "$nodePath;$env:PATH"

# Verify node is accessible
$nodeExe = "$nodePath\node.exe"
if (-not (Test-Path $nodeExe)) {
    Write-Host "❌ node.exe not found at: $nodeExe" -ForegroundColor Red
    Stop-Job -Job $browserJob -ErrorAction SilentlyContinue
    Remove-Job -Job $browserJob -ErrorAction SilentlyContinue
    exit 1
}

# Start server - npm scripts will now be able to find node
try {
    # Use Start-Process to ensure PATH is inherited, or run directly with PATH set
    & $npmPath run dev
} catch {
    Write-Host ""
    Write-Host "❌ Server failed to start: $_" -ForegroundColor Red
    Stop-Job -Job $browserJob -ErrorAction SilentlyContinue
    Remove-Job -Job $browserJob -ErrorAction SilentlyContinue
    exit 1
}

