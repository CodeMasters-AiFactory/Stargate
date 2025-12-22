# ═══════════════════════════════════════════════════════════════════════════════
# STARGATE PORTAL - OVERNIGHT AGENT INITIALIZATION SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# Based on Anthropic's research: "Effective harnesses for long-running agents"
# https://www.anthropic.com/research/long-running-agents
# ═══════════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STARGATE PORTAL - OVERNIGHT AGENT HARNESS v1.0" -ForegroundColor Cyan
Write-Host "  Merlin 8.0 Industry DNA Expansion Mission" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\CURSOR PROJECTS\StargatePortal"
Write-Host "[OK] Working directory: $(Get-Location)" -ForegroundColor Green

# Check Node.js
Write-Host "[..] Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[..] Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Write-Host "[OK] Dependencies ready" -ForegroundColor Green

# Start development server in background
Write-Host "[..] Starting development server..." -ForegroundColor Yellow
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\CURSOR PROJECTS\StargatePortal"
    npm run dev 2>&1
}
Start-Sleep -Seconds 10

# Test if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Server running at http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Server may still be starting..." -ForegroundColor Yellow
}

# Display progress status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CURRENT PROGRESS STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Read and display feature status
if (Test-Path "feature_list.json") {
    $features = Get-Content "feature_list.json" | ConvertFrom-Json
    $total = $features.industries.Count
    $completed = ($features.industries | Where-Object { $_.passes -eq $true }).Count
    $remaining = $total - $completed
    
    Write-Host "Total Industries: $total" -ForegroundColor White
    Write-Host "Completed: $completed" -ForegroundColor Green
    Write-Host "Remaining: $remaining" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Next industries to implement:" -ForegroundColor Cyan
    $features.industries | Where-Object { $_.passes -eq $false } | Select-Object -First 5 | ForEach-Object {
        Write-Host "  - $($_.id): $($_.name)" -ForegroundColor Yellow
    }
}

# Display recent git activity
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  RECENT GIT COMMITS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
git log --oneline -5

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  READY FOR OVERNIGHT AGENT WORK" -ForegroundColor Green
Write-Host "  Read claude-progress.txt and feature_list.json to continue" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
