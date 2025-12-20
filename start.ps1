# Simple Startup Script - Just Start the Server
# No complex logic, just get Node.js and run npm

# Find Node.js
$nodePath = $null
$paths = @("C:\Program Files\nodejs", "${env:ProgramFiles(x86)}\nodejs", "${env:LOCALAPPDATA}\Programs\nodejs")

foreach ($p in $paths) {
    if (Test-Path "$p\node.exe") {
        $nodePath = $p
        break
    }
}

if (-not $nodePath) {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Add to PATH (both for current session and system PATH)
if ($env:PATH -notlike "*$nodePath*") {
    $env:PATH = "$nodePath;$env:PATH"
}
# Also add to system PATH for this session
[Environment]::SetEnvironmentVariable("PATH", "$env:PATH", [EnvironmentVariableTarget]::Process)

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Kill existing Node processes on port 5000
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 1
}

# Start server and open browser
Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host "🌐 Browser will open automatically when server is ready" -ForegroundColor Cyan
Write-Host "📱 Cursor Browser: Navigate to http://localhost:5000 when server is ready" -ForegroundColor Yellow
Write-Host ""

# Start browser opener in background (waits 5 seconds then opens)
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    $url = "http://localhost:5000"
    $maxWait = 30
    $waited = 0
    
    # Wait for server to be ready
    while ($waited -lt $maxWait) {
        $portCheck = netstat -ano | Select-String ":5000.*LISTENING"
        if ($portCheck) {
            # Open in default browser
            try {
                Start-Process $url
                Write-Host "✅ Browser opened: $url" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Could not open browser automatically" -ForegroundColor Yellow
                Write-Host "   Please open manually: $url" -ForegroundColor Yellow
            }
            break
        }
        Start-Sleep -Seconds 1
        $waited++
    }
    
    if ($waited -ge $maxWait) {
        Write-Host "⚠️  Server didn't start in time" -ForegroundColor Yellow
        Write-Host "   Please check the terminal for errors" -ForegroundColor Yellow
    }
} | Out-Null

# Verify npm is accessible using full path
$npmPath = "$nodePath\npm.cmd"
if (-not (Test-Path $npmPath)) {
    Write-Host "❌ npm.cmd not found at: $npmPath" -ForegroundColor Red
    exit 1
}

# Start the server using full path to npm (this blocks)
Write-Host "Starting server with: $npmPath run dev" -ForegroundColor Gray
Write-Host ""
& $npmPath run dev

