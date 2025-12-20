# Quick Start - Fixes the node PATH issue
# This ensures node is in PATH when npm runs

$ErrorActionPreference = "Continue"

Write-Host "🚀 Starting Frontend..." -ForegroundColor Cyan
Write-Host ""

# Find Node.js
$nodePath = "C:\Program Files\nodejs"
if (-not (Test-Path "$nodePath\node.exe")) {
    Write-Host "❌ Node.js not found at: $nodePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Node.js at: $nodePath" -ForegroundColor Green

# CRITICAL: Add Node.js to PATH so child processes can find it
$env:PATH = "$nodePath;$env:PATH"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::Process)

# Verify node is accessible
$nodeExe = "$nodePath\node.exe"
$npmPath = "$nodePath\npm.cmd"

Write-Host "✅ Node.js added to PATH" -ForegroundColor Green
Write-Host ""

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Stop existing servers
$existing = Get-Process -Name node -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow
    $existing | Stop-Process -Force
    Start-Sleep -Seconds 2
}

Write-Host "🚀 Starting server..." -ForegroundColor Cyan
Write-Host "🌐 Will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start server - node will now be in PATH for all child processes
& $npmPath run dev

