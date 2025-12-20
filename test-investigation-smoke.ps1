# Smoke Test for Investigation Endpoint
# Tests SSE stream handling and verifies all progress messages are received

Write-Host "Starting Investigation Endpoint Smoke Test..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$endpoint = "$baseUrl/api/website-builder/investigate"

# Test payload (demo mode - no OpenAI key needed)
$payload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A test restaurant for smoke testing"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json

Write-Host "Sending investigation request..." -ForegroundColor Yellow
Write-Host "   Endpoint: $endpoint"
Write-Host "   Payload: $($payload.Substring(0, [Math]::Min(100, $payload.Length)))..."
Write-Host ""

try {
    $messagesReceived = 0
    $stagesReceived = @()
    $startTime = Get-Date
    $timeout = 180 # 3 minutes timeout
    
    # Create HTTP request
    $request = [System.Net.HttpWebRequest]::Create($endpoint)
    $request.Method = "POST"
    $request.ContentType = "application/json"
    $request.Timeout = $timeout * 1000
    
    # Write request body
    $requestStream = $request.GetRequestStream()
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
    $requestStream.Write($bytes, 0, $bytes.Length)
    $requestStream.Close()
    
    # Get response stream
    $response = $request.GetResponse()
    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    
    Write-Host "SUCCESS: Connection established, receiving SSE stream..." -ForegroundColor Green
    Write-Host ""
    
    $buffer = ""
    $lastUpdate = Get-Date
    
    while ($true) {
        # Check timeout
        $elapsed = (Get-Date) - $startTime
            if ($elapsed.TotalSeconds -gt $timeout) {
                Write-Host ""
                Write-Host "TIMEOUT: After $($elapsed.TotalSeconds) seconds" -ForegroundColor Red
                break
            }
        
        # Read with timeout
        if ($stream.DataAvailable) {
            $chunk = $reader.ReadLine()
            if ($null -eq $chunk) {
                Start-Sleep -Milliseconds 100
                continue
            }
            
            $buffer += $chunk + "`n"
            $lastUpdate = Get-Date
            
            # Process complete SSE messages (ending with empty line)
            if ($buffer -match "data: (.+?)(?:\r?\n\r?\n|$)") {
                $dataLine = $matches[1]
                $buffer = $buffer -replace "data: .+?(?:\r?\n\r?\n|$)", ""
                
                try {
                    $data = $dataLine | ConvertFrom-Json
                    $messagesReceived++
                    $stage = $data.stage
                    $progress = $data.progress
                    $message = $data.message
                    
                    if ($stage) {
                        $stagesReceived += $stage
                        $msgNum = $messagesReceived
                        Write-Host "Message #${msgNum}: $stage ($progress%)" -ForegroundColor Cyan
                        if ($message) {
                            Write-Host "   - $message" -ForegroundColor Gray
                        }
                        
                        if ($stage -eq "complete") {
                            Write-Host ""
                            Write-Host "SUCCESS: Investigation completed successfully!" -ForegroundColor Green
                            break
                        }
                        
                        if ($stage -eq "error") {
                            Write-Host ""
                            Write-Host "ERROR: Investigation failed: $message" -ForegroundColor Red
                            break
                        }
                    }
                } catch {
                    Write-Host "WARNING: Failed to parse message: $_" -ForegroundColor Yellow
                }
            }
        } else {
            # Check if stream is closed
            if ($stream.CanRead -eq $false) {
                Write-Host ""
                Write-Host "WARNING: Stream closed by server" -ForegroundColor Yellow
                break
            }
            
            # Check for inactivity timeout (30 seconds)
            $inactiveTime = (Get-Date) - $lastUpdate
            if ($inactiveTime.TotalSeconds -gt 30) {
                Write-Host ""
                Write-Host "WARNING: No data received for 30 seconds, assuming stream ended" -ForegroundColor Yellow
                break
            }
            
            Start-Sleep -Milliseconds 100
        }
    }
    
    $reader.Close()
    $stream.Close()
    $response.Close()
    
    Write-Host ""
    Write-Host "Test Results:" -ForegroundColor Cyan
    Write-Host "   Messages received: $messagesReceived"
    Write-Host "   Stages received: $($stagesReceived -join ', ')"
    Write-Host "   Total time: $($elapsed.TotalSeconds.ToString('F2')) seconds"
    Write-Host ""
    
    # Verify expected stages
    $expectedStages = @("keyword_research", "competitor_analysis", "ai_strategy", "complete")
    $missingStages = $expectedStages | Where-Object { $_ -notin $stagesReceived }
    
    if ($missingStages.Count -eq 0) {
        Write-Host "SUCCESS: All expected stages received!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "ERROR: Missing stages: $($missingStages -join ', ')" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Test failed: $_" -ForegroundColor Red
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

