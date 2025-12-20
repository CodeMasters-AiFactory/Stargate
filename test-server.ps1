# Comprehensive Server Test Script
Write-Host "🔍 Testing Stargate Portal Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment
$env:NODE_ENV = "development"
$env:PORT = "5000"

# Check prerequisites
Write-Host "1. Checking Prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if (-not $nodeVersion) {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green

if (-not $npmVersion) {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "   ❌ node_modules not found" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check critical files
Write-Host "2. Checking Critical Files..." -ForegroundColor Yellow
$files = @(
    "server/index.ts",
    "server/vite.ts",
    "client/index.html",
    "client/src/main.tsx"
)
$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}
if (-not $allFilesExist) {
    exit 1
}
Write-Host ""

# TypeScript check
Write-Host "3. Checking TypeScript Compilation..." -ForegroundColor Yellow
$tscOutput = npm run check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript check passed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ TypeScript errors found (may still work)" -ForegroundColor Yellow
    $tscOutput | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
}
Write-Host ""

# Start server and capture output
Write-Host "4. Starting Server..." -ForegroundColor Yellow
Write-Host "   (This will run for 30 seconds to capture startup output)" -ForegroundColor Gray
Write-Host ""

$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:NODE_ENV = "development"
    $env:PORT = "5000"
    npm run dev 2>&1
}

Start-Sleep -Seconds 30

$output = Receive-Job -Job $job
Stop-Job -Job $job
Remove-Job -Job $job

Write-Host "Server Output:" -ForegroundColor Cyan
Write-Host "--------------" -ForegroundColor Cyan
$output | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "5. Testing Server Connection..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$serverRunning = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($serverRunning) {
    Write-Host "   ✅ Server IS running on port 5000!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Frontend URL: http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ Server is NOT running on port 5000" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the output above for error messages." -ForegroundColor Yellow
}

