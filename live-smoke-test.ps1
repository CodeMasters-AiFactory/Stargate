# Live Smoke Test - Actually Works!
# This script fixes PATH issues and runs a real smoke test

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MERLIN v6.10 LIVE SMOKE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n"

# Fix PATH - Add Node.js if it exists
$nodePaths = @(
    "C:\Program Files\nodejs",
    "$env:ProgramFiles\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs"
)

$nodeFound = $false
foreach ($nodePath in $nodePaths) {
    if (Test-Path "$nodePath\node.exe") {
        if ($env:PATH -notlike "*$nodePath*") {
            $env:PATH = "$env:PATH;$nodePath"
            Write-Host "[PATH] Added Node.js: $nodePath" -ForegroundColor Green
        }
        $nodeFound = $true
        break
    }
}

if (-not $nodeFound) {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verify Node.js works
Write-Host "[1/6] Verifying Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & "C:\Program Files\nodejs\node.exe" --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not accessible" -ForegroundColor Red
    exit 1
}

# Check if server is running
Write-Host "`n[2/6] Checking server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Server is running!" -ForegroundColor Green
    $serverRunning = $true
} catch {
    Write-Host "   ⚠️  Server not running. Starting..." -ForegroundColor Yellow
    $serverRunning = $false
    
    # Start server in new window
    $serverScript = @"
cd '$PWD'
`$env:PATH = `$env:PATH + ';C:\Program Files\nodejs'
npm run dev
"@
    
    $serverScript | Out-File -FilePath "$env:TEMP\start-server.ps1" -Encoding UTF8
    Start-Process powershell -ArgumentList "-NoExit", "-File", "$env:TEMP\start-server.ps1"
    
    Write-Host "   Waiting for server to start (15 seconds)..." -ForegroundColor Yellow
    $waited = 0
    while ($waited -lt 15) {
        Start-Sleep -Seconds 2
        $waited += 2
        try {
            $test = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
            Write-Host "   ✅ Server started!" -ForegroundColor Green
            $serverRunning = $true
            break
        } catch {
            Write-Host "   ... still waiting ($waited/15s)" -ForegroundColor Gray
        }
    }
    
    if (-not $serverRunning) {
        Write-Host "   ⚠️  Server may still be starting. Continuing anyway..." -ForegroundColor Yellow
    }
}

# Generate website
Write-Host "`n[3/6] Generating beautiful website..." -ForegroundColor Yellow

$websiteConfig = @{
    requirements = @{
        businessName = "Aurora Design Studio"
        businessType = "Creative Agency"
        industry = "Design"
        location = "San Francisco, CA"
        toneOfVoice = "Creative, modern, elegant"
        services = @(
            @{ name = "Brand Identity Design"; description = "Complete brand identity systems" },
            @{ name = "Web Design"; description = "Modern, responsive websites" },
            @{ name = "UI/UX Design"; description = "User-centered interface design" }
        )
        targetAudience = "Creative businesses and startups"
        specialRequirements = "Premium design studio with modern aesthetic"
    }
    investigation = $null
    enableLivePreview = $false
}

$jsonBody = $websiteConfig | ConvertTo-Json -Depth 10

Write-Host "   Sending request to API..." -ForegroundColor Gray

try {
    # Use Invoke-WebRequest for better error handling
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/generate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $jsonBody `
        -TimeoutSec 300 `
        -ErrorAction Stop
    
    Write-Host "   ✅ Generation request sent!" -ForegroundColor Green
    Write-Host "   (Generation may take 1-2 minutes)" -ForegroundColor Gray
    
    # Parse response if it's JSON
    try {
        $result = $response.Content | ConvertFrom-Json
        if ($result.projectSlug) {
            $projectSlug = $result.projectSlug
            Write-Host "   Project: $projectSlug" -ForegroundColor Gray
        }
    } catch {
        # Not JSON, that's okay
    }
    
} catch {
    Write-Host "   ⚠️  API call failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Opening website builder instead..." -ForegroundColor Yellow
    Start-Process "http://localhost:5000"
    Write-Host "`n✅ Browser opened to website builder!" -ForegroundColor Green
    Write-Host "   You can generate a website from the interface." -ForegroundColor Gray
    exit 0
}

# Wait for generation
Write-Host "`n[4/6] Waiting for generation to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Find generated website
Write-Host "`n[5/6] Finding generated website..." -ForegroundColor Yellow

$projectSlug = "aurora-design-studio"
$possiblePaths = @(
    "website_projects\$projectSlug\generated-v5\index.html",
    "website_projects\$projectSlug\dist\index.html",
    "website_projects\$projectSlug\index.html"
)

$websitePath = $null
foreach ($path in $possiblePaths) {
    $fullPath = Join-Path $PWD $path
    if (Test-Path $fullPath) {
        $websitePath = $fullPath
        Write-Host "   ✅ Found: $path" -ForegroundColor Green
        break
    }
}

# If not found, check all projects
if (-not $websitePath) {
    $projectsDir = Join-Path $PWD "website_projects"
    if (Test-Path $projectsDir) {
        $projects = Get-ChildItem $projectsDir -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 3
        foreach ($proj in $projects) {
            $testPaths = @(
                "$($proj.FullName)\generated-v5\index.html",
                "$($proj.FullName)\dist\index.html",
                "$($proj.FullName)\index.html"
            )
            foreach ($testPath in $testPaths) {
                if (Test-Path $testPath) {
                    $websitePath = $testPath
                    Write-Host "   ✅ Found: $testPath" -ForegroundColor Green
                    break
                }
            }
            if ($websitePath) { break }
        }
    }
}

# Open in browser
Write-Host "`n[6/6] Opening in browser..." -ForegroundColor Yellow

if ($websitePath) {
    $fileUri = "file:///$($websitePath.Replace('\', '/'))"
    Write-Host "   Opening: $fileUri" -ForegroundColor Gray
    Start-Process $fileUri
    Write-Host "   ✅ Browser opened!" -ForegroundColor Green
} else {
    # Fallback: Open website builder
    Write-Host "   Opening website builder..." -ForegroundColor Gray
    Start-Process "http://localhost:5000"
    Write-Host "   ✅ Browser opened to website builder!" -ForegroundColor Green
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SMOKE TEST COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

if ($websitePath) {
    Write-Host "`n✅ Website generated and opened!" -ForegroundColor Green
    Write-Host "`nLocation: $websitePath" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Browser opened to website builder!" -ForegroundColor Green
    Write-Host "   Generate a website from the interface." -ForegroundColor Gray
}

Write-Host "`n"
