# Start server and connect Cursor browser automatically
# This script starts the server and then navigates Cursor's browser

Write-Host "🚀 Starting Server and Connecting Browser..." -ForegroundColor Cyan
Write-Host ""

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

# Add to PATH
if ($env:PATH -notlike "*$nodePath*") {
    $env:PATH = "$nodePath;$env:PATH"
}

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Kill existing Node processes
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 2
}

Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host "⏳ Please wait for server to start..." -ForegroundColor Yellow
Write-Host ""

# Start server in background
$serverJob = Start-Job -ScriptBlock {
    param($nodePath, $workDir)
    Set-Location $workDir
    $env:NODE_ENV = "development"
    $env:PORT = "5000"
    & "$nodePath\npm.cmd" run dev 2>&1
} -ArgumentList $nodePath, $PWD.Path

# Wait for server to be ready
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    $portCheck = netstat -ano | Select-String ":5000.*LISTENING"
    if ($portCheck) {
        $serverReady = $true
        Write-Host ""
        Write-Host "✅ Server is running on port 5000!" -ForegroundColor Green
        break
    }
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""

if (-not $serverReady) {
    Write-Host "❌ Server didn't start in time" -ForegroundColor Red
    Write-Host "   Check the server output for errors:" -ForegroundColor Yellow
    Receive-Job -Job $serverJob
    Stop-Job -Job $serverJob
    Remove-Job -Job $serverJob
    exit 1
}

Write-Host ""
Write-Host "🌐 Server is ready at: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "📱 To connect Cursor's browser:" -ForegroundColor Cyan
Write-Host "   1. Open the Browser panel in Cursor" -ForegroundColor White
Write-Host "   2. Type in address bar: http://localhost:5000" -ForegroundColor White
Write-Host "   3. Press Enter" -ForegroundColor White
Write-Host ""
Write-Host "💡 Server is running in the background" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop, or close this window" -ForegroundColor Yellow
Write-Host ""

# Keep job running and show output
try {
    Receive-Job -Job $serverJob -Wait
} catch {
    Write-Host "Server stopped" -ForegroundColor Yellow
} finally {
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
}

