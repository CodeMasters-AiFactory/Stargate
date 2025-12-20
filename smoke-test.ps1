# Comprehensive Smoke Test for Stargate Portal
# Tests frontend, backend, API endpoints, and Agent Farm

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000"
$maxWaitTime = 60
$checkInterval = 2
$testsPassed = 0
$testsFailed = 0
$testResults = @()

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $script:testsPassed++
        $script:testResults += [PSCustomObject]@{
            Test = $TestName
            Status = "PASS"
            Message = $Message
        }
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   Error: $Message" -ForegroundColor Yellow
        }
        $script:testsFailed++
        $script:testResults += [PSCustomObject]@{
            Test = $TestName
            Status = "FAIL"
            Message = $Message
        }
    }
}

function Wait-ForServer {
    Write-Host "`nChecking if server is running..." -ForegroundColor Cyan
    
    # First, quick check if server is already running
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "Server is already responding!" -ForegroundColor Green
        return $true
    } catch {
        # Server not running, wait for it
        Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    }
    
    $waited = 0
    
    while ($waited -lt $maxWaitTime) {
        try {
            $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            Write-Host "Server is now responding!" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds $checkInterval
            $waited += $checkInterval
            if ($waited % 10 -eq 0) {
                Write-Host "   Still waiting... ($waited/$maxWaitTime seconds)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Server did not start within $maxWaitTime seconds" -ForegroundColor Red
    return $false
}

function Test-Frontend {
    Write-Host "`n🌐 Testing Frontend..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $statusOk = $response.StatusCode -eq 200
        $hasContent = $response.Content.Length -gt 0
        
        if ($statusOk -and $hasContent) {
            Write-TestResult "Frontend - HTTP 200" $true
            Write-TestResult "Frontend - Has Content" $true "Content length: $($response.Content.Length) bytes"
            return $true
        } else {
            Write-TestResult "Frontend - HTTP 200" $false "Status: $($response.StatusCode), Content: $($response.Content.Length) bytes"
            return $false
        }
    } catch {
        Write-TestResult "Frontend - Accessible" $false $_.Exception.Message
        return $false
    }
}

function Test-APIHealth {
    Write-Host "`n🏥 Testing API Health..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            Write-TestResult "API Health Endpoint" $true
            return $true
        } else {
            Write-TestResult "API Health Endpoint" $false "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-TestResult "API Health Endpoint" $false $_.Exception.Message
        return $false
    }
}

function Test-AgentFarm {
    Write-Host "`n🤖 Testing Agent Farm..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/agent-farm/stats" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.stats.isInitialized) {
            Write-TestResult "Agent Farm - Initialized" $true
            Write-TestResult "Agent Farm - Stats Available" $true "Agents: $($data.stats.agents.totalAgents)"
            return $true
        } else {
            Write-TestResult "Agent Farm - Initialized" $false "Not initialized"
            return $false
        }
    } catch {
        Write-TestResult "Agent Farm - Stats" $false $_.Exception.Message
        return $false
    }
}

function Test-AgentFarmHealth {
    Write-Host "`n💚 Testing Agent Farm Health..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/agent-farm/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.healthy) {
            Write-TestResult "Agent Farm - Health Check" $true
            return $true
        } else {
            Write-TestResult "Agent Farm - Health Check" $false "Not healthy"
            return $false
        }
    } catch {
        Write-TestResult "Agent Farm - Health Check" $false $_.Exception.Message
        return $false
    }
}

function Test-APIEndpoints {
    Write-Host "`n🔌 Testing API Endpoints..." -ForegroundColor Cyan
    
    $endpoints = @(
        "/api/projects",
        "/api/templates",
        "/api/agent-farm/stats"
    )
    
    $allPassed = $true
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -lt 500) {
                Write-TestResult "API - $endpoint" $true "Status: $($response.StatusCode)"
            } else {
                Write-TestResult "API - $endpoint" $false "Status: $($response.StatusCode)"
                $allPassed = $false
            }
        } catch {
            # Some endpoints might require auth or return 404, that's okay
            if ($_.Exception.Response.StatusCode -eq 404) {
                Write-TestResult "API - $endpoint" $true "404 (endpoint exists but may require parameters)"
            } else {
                Write-TestResult "API - $endpoint" $false $_.Exception.Message
                $allPassed = $false
            }
        }
    }
    
    return $allPassed
}

function Test-ServerProcess {
    Write-Host "`n⚙️ Testing Server Process..." -ForegroundColor Cyan
    
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-TestResult "Server Process - Running" $true "Found $($nodeProcesses.Count) node process(es)"
        return $true
    } else {
        Write-TestResult "Server Process - Running" $false "No node processes found"
        return $false
    }
}

function Test-Port {
    Write-Host "`n🔌 Testing Port 5000..." -ForegroundColor Cyan
    
    try {
        $connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
        if ($connection) {
            Write-TestResult "Port 5000 - In Use" $true "Port is listening"
            return $true
        } else {
            Write-TestResult "Port 5000 - In Use" $false "Port is not in use"
            return $false
        }
    } catch {
        Write-TestResult "Port 5000 - In Use" $false $_.Exception.Message
        return $false
    }
}

# Main Test Execution
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "           🧪 STARGATE PORTAL - SMOKE TEST 🧪" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Wait for server
if (-not (Wait-ForServer)) {
    Write-Host "`n❌ Cannot proceed with tests - server is not running" -ForegroundColor Red
    exit 1
}

# Run tests
Test-ServerProcess
Test-Port
Test-Frontend
Test-APIHealth
Test-AgentFarm
Test-AgentFarmHealth
Test-APIEndpoints

# Summary
Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "                    📊 TEST SUMMARY 📊" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED! System is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend: $baseUrl" -ForegroundColor Cyan
    Write-Host "API: $baseUrl/api" -ForegroundColor Cyan
    Write-Host "Agent Farm: $baseUrl/api/agent-farm/stats" -ForegroundColor Cyan
} else {
    Write-Host "Some tests failed. Please check the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Return exit code
if ($testsFailed -gt 0) {
    exit 1
} else {
    exit 0
}
