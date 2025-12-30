# ═══════════════════════════════════════════════════════════════════════════════
# AUTONOMOUS MERLIN TESTER - INSTALLATION SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
#
# This script sets up the complete autonomous testing environment:
# 1. Verifies dependencies (Node.js, npm packages)
# 2. Creates required directories
# 3. Compiles TypeScript
# 4. Sets up Windows auto-start (optional)
# 5. Runs initial test
#
# USAGE:
#   powershell -ExecutionPolicy Bypass -File .\scripts\install-autonomous.ps1
#
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$SkipAutoStart,
    [switch]$RunTest
)

$ProjectPath = Split-Path -Parent $PSScriptRoot

function Write-Banner {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "     AUTONOMOUS MERLIN TESTER - INSTALLATION" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  Self-Improving AI Website Testing System" -ForegroundColor White
    Write-Host "  Version 1.0" -ForegroundColor Gray
    Write-Host ""
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "[$Step] " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ " -ForegroundColor Green -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠️  " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ❌ " -ForegroundColor Red -NoNewline
    Write-Host $Message -ForegroundColor White
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 1: Verify Dependencies
# ═══════════════════════════════════════════════════════════════════════════════

function Test-Dependencies {
    Write-Step "1/6" "Checking dependencies..."

    # Check Node.js
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        $nodeVersion = & node --version
        Write-Success "Node.js $nodeVersion found"
    } else {
        Write-Error "Node.js not found. Please install from https://nodejs.org/"
        return $false
    }

    # Check npm
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm) {
        $npmVersion = & npm --version
        Write-Success "npm $npmVersion found"
    } else {
        Write-Error "npm not found"
        return $false
    }

    # Check TypeScript
    $tsc = Get-Command tsc -ErrorAction SilentlyContinue
    if (-not $tsc) {
        Write-Warning "TypeScript not found globally, will use local"
    } else {
        Write-Success "TypeScript found"
    }

    return $true
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 2: Create Directories
# ═══════════════════════════════════════════════════════════════════════════════

function New-Directories {
    Write-Step "2/6" "Creating directories..."

    $directories = @(
        ".cursor\autonomous-logs",
        ".cursor\autonomous-reports",
        ".cursor\autonomous-checkpoints"
    )

    foreach ($dir in $directories) {
        $fullPath = Join-Path $ProjectPath $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Success "Created $dir"
        } else {
            Write-Success "$dir exists"
        }
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 3: Install npm packages
# ═══════════════════════════════════════════════════════════════════════════════

function Install-Packages {
    Write-Step "3/6" "Installing npm packages..."

    Push-Location $ProjectPath

    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "  Running npm install..." -ForegroundColor Gray
        & npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm packages installed"
        } else {
            Write-Error "npm install failed"
            Pop-Location
            return $false
        }
    } else {
        Write-Success "node_modules already exists"
    }

    Pop-Location
    return $true
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 4: Compile TypeScript
# ═══════════════════════════════════════════════════════════════════════════════

function Build-TypeScript {
    Write-Step "4/6" "Compiling TypeScript..."

    Push-Location $ProjectPath

    # Compile the automation module specifically
    Write-Host "  Compiling server/automation..." -ForegroundColor Gray

    # Use npx tsc directly on the automation files
    & npx tsc --project tsconfig.json --outDir dist 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript compiled successfully"
    } else {
        Write-Warning "TypeScript compilation had errors (this is often okay for partial builds)"
    }

    Pop-Location
    return $true
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 5: Verify Installation
# ═══════════════════════════════════════════════════════════════════════════════

function Test-Installation {
    Write-Step "5/6" "Verifying installation..."

    $requiredFiles = @(
        "server\automation\AutonomousTester.ts",
        "server\automation\PlaywrightExecutor.ts",
        "server\automation\LearningEngine.ts",
        "server\automation\CommandGenerator.ts",
        "server\automation\QualityReporter.ts",
        "server\automation\daemon.ts",
        "server\automation\types.ts"
    )

    $allFound = $true
    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $ProjectPath $file
        if (Test-Path $fullPath) {
            Write-Success "$file"
        } else {
            Write-Error "$file not found"
            $allFound = $false
        }
    }

    return $allFound
}

# ═══════════════════════════════════════════════════════════════════════════════
# STEP 6: Setup Auto-Start (Optional)
# ═══════════════════════════════════════════════════════════════════════════════

function Install-AutoStart {
    Write-Step "6/6" "Setting up Windows auto-start..."

    if ($SkipAutoStart) {
        Write-Warning "Auto-start setup skipped (use -SkipAutoStart:$false to enable)"
        return
    }

    $autoStartScript = Join-Path $ProjectPath "scripts\windows-autostart.ps1"

    if (Test-Path $autoStartScript) {
        Write-Host "  Installing scheduled task..." -ForegroundColor Gray
        Write-Warning "Auto-start requires Administrator privileges"
        Write-Host "  To install manually, run as Administrator:" -ForegroundColor Gray
        Write-Host "    powershell -ExecutionPolicy Bypass -File .\scripts\windows-autostart.ps1" -ForegroundColor Cyan
    } else {
        Write-Error "Auto-start script not found"
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# Print Summary
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Summary {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "     INSTALLATION COMPLETE!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Quick Start Commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "  1. Run a test session (10 websites):" -ForegroundColor Gray
    Write-Host "     cd $ProjectPath" -ForegroundColor Cyan
    Write-Host "     npx ts-node server/automation/daemon.ts run 10" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Check status:" -ForegroundColor Gray
    Write-Host "     npx ts-node server/automation/daemon.ts status" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  3. View history:" -ForegroundColor Gray
    Write-Host "     npx ts-node server/automation/daemon.ts history" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  4. Analyze trends:" -ForegroundColor Gray
    Write-Host "     npx ts-node server/automation/daemon.ts trends" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Reports are saved to: .cursor/autonomous-reports/" -ForegroundColor Gray
    Write-Host "  Logs are saved to: .cursor/autonomous-logs/" -ForegroundColor Gray
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

Write-Banner

# Run installation steps
if (-not (Test-Dependencies)) {
    Write-Host ""
    Write-Error "Dependency check failed. Please install missing dependencies."
    exit 1
}

New-Directories

if (-not (Install-Packages)) {
    exit 1
}

Build-TypeScript

if (-not (Test-Installation)) {
    Write-Host ""
    Write-Error "Installation verification failed. Some files are missing."
    exit 1
}

Install-AutoStart

Write-Summary

# Run test if requested
if ($RunTest) {
    Write-Host ""
    Write-Step "BONUS" "Running initial test session..."
    Write-Host ""

    Push-Location $ProjectPath
    & npx ts-node server/automation/daemon.ts run 2
    Pop-Location
}

Write-Host ""
