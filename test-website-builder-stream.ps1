# Better SSE Stream Handler for Website Builder Test
# Uses .NET StreamReader to properly handle Server-Sent Events

param(
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  WEBSITE BUILDER TEST - SSE STREAM" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check Server
Write-Host "[STEP 1] Checking server..." -ForegroundColor Yellow
$serverTest = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $serverTest) {
    Write-Host "❌ Server is NOT running" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Server is running`n" -ForegroundColor Green

# Step 2: Prepare request
$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($testPayload)

# Step 3: Create HTTP request
Write-Host "[STEP 2] Sending investigation request..." -ForegroundColor Yellow
Write-Host "   (Monitoring SSE stream - this may take 60+ seconds)`n" -ForegroundColor Gray

$request = [System.Net.HttpWebRequest]::Create("http://localhost:5000/api/website-builder/investigate")
$request.Method = "POST"
$request.ContentType = "application/json"
$request.ContentLength = $payloadBytes.Length
$request.Timeout = $TimeoutSeconds * 1000
$request.ReadWriteTimeout = $TimeoutSeconds * 1000

# Write request body
$requestStream = $request.GetRequestStream()
$requestStream.Write($payloadBytes, 0, $payloadBytes.Length)
$requestStream.Close()

# Get response
try {
    $response = $request.GetResponse()
    $responseStream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($responseStream)
    
    $progressMessages = @()
    $errors = @()
    $finalResult = $null
    $testFailed = $false
    $startTime = Get-Date
    
    Write-Host "Streaming progress updates...`n" -ForegroundColor Cyan
    
    # Read SSE stream line by line
    while ($true) {
        $line = $reader.ReadLine()
        
        if ($null -eq $line) {
            # Check if we've been waiting too long
            $elapsed = (Get-Date) - $startTime
            if ($elapsed.TotalSeconds -gt $TimeoutSeconds) {
                Write-Host "`n⚠️ Timeout reached ($TimeoutSeconds seconds)" -ForegroundColor Yellow
                break
            }
            Start-Sleep -Milliseconds 100
            continue
        }
        
        # Parse SSE data line
        if ($line -match "^data:\s*(.+)$") {
            try {
                $jsonData = $matches[1] | ConvertFrom-Json
                $progressMessages += $jsonData
                
                $stage = $jsonData.stage
                $progress = $jsonData.progress
                $message = $jsonData.message
                
                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "[$timestamp] [$stage] ($progress%) $message" -ForegroundColor Cyan
                
                if ($jsonData.error) {
                    Write-Host "   ❌ ERROR: $($jsonData.error)" -ForegroundColor Red
                    $errors += $jsonData.error
                    $testFailed = $true
                }
                
                if ($jsonData.data -and $jsonData.stage -eq "complete") {
                    $finalResult = $jsonData.data
                    Write-Host "`n✅ Received final result data" -ForegroundColor Green
                    break
                }
                
                # If we got complete stage, wait a bit for final data
                if ($jsonData.stage -eq "complete") {
                    Start-Sleep -Seconds 2
                    break
                }
            } catch {
                Write-Host "   ⚠️ Failed to parse: $line" -ForegroundColor Yellow
            }
        }
    }
    
    $reader.Close()
    $responseStream.Close()
    $response.Close()
    
    # Analyze results
    Write-Host "`n[STEP 3] Analyzing results..." -ForegroundColor Yellow
    
    if ($testFailed) {
        Write-Host "❌ TEST FAILED - Errors detected" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
        exit 1
    }
    
    if ($finalResult) {
        Write-Host "✅ Investigation completed successfully`n" -ForegroundColor Green
        
        $hasKeywords = $finalResult.keywords -and $finalResult.keywords.Count -gt 0
        $hasCompetitors = $finalResult.competitorInsights -and $finalResult.competitorInsights.Count -gt 0
        $hasSeoStrategy = $finalResult.seoStrategy -ne $null
        $hasDesign = $finalResult.designRecommendations -ne $null
        
        Write-Host "Result Structure:" -ForegroundColor Cyan
        Write-Host "   Keywords: $(if ($hasKeywords) { "✅ $($finalResult.keywords.Count) found" } else { "❌ Missing" })" -ForegroundColor $(if ($hasKeywords) { "Green" } else { "Red" })
        Write-Host "   Competitors: $(if ($hasCompetitors) { "✅ $($finalResult.competitorInsights.Count) analyzed" } else { "❌ Missing" })" -ForegroundColor $(if ($hasCompetitors) { "Green" } else { "Red" })
        Write-Host "   SEO Strategy: $(if ($hasSeoStrategy) { "✅ Present" } else { "❌ Missing" })" -ForegroundColor $(if ($hasSeoStrategy) { "Green" } else { "Red" })
        Write-Host "   Design: $(if ($hasDesign) { "✅ Present" } else { "❌ Missing" })" -ForegroundColor $(if ($hasDesign) { "Green" } else { "Red" })
        
        if ($hasKeywords -and $hasCompetitors -and $hasSeoStrategy -and $hasDesign) {
            Write-Host "`n✅✅✅ ALL TESTS PASSED ✅✅✅" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "`n⚠️ WARNING: Result structure incomplete" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "⚠️ No final result data received" -ForegroundColor Yellow
        Write-Host "   Progress messages received: $($progressMessages.Count)" -ForegroundColor Gray
        if ($progressMessages.Count -eq 0) {
            Write-Host "   ❌ No progress messages received - investigation may have failed silently" -ForegroundColor Red
        }
        exit 1
    }
    
} catch {
    Write-Host "`n❌ TEST FAILED - Exception occurred" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Type: $($_.Exception.GetType().Name)" -ForegroundColor Yellow
    exit 1
}

