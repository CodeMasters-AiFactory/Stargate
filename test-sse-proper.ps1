# Proper SSE Stream Test - Keeps connection open
# This will help us see if the server is actually sending more messages

$ErrorActionPreference = "Continue"

Write-Host "`n=== Proper SSE Stream Test ===" -ForegroundColor Cyan
Write-Host "This test keeps the connection open to receive all SSE messages...`n" -ForegroundColor Yellow

$testPayload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "A fine dining restaurant"
    competitors = @(
        @{ url = "https://www.example.com" }
    )
} | ConvertTo-Json -Depth 10

$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($testPayload)

Write-Host "Sending request and keeping connection open for 90 seconds...`n" -ForegroundColor Cyan

$request = [System.Net.HttpWebRequest]::Create("http://localhost:5000/api/website-builder/investigate")
$request.Method = "POST"
$request.ContentType = "application/json"
$request.ContentLength = $payloadBytes.Length
$request.Timeout = 90000
$request.ReadWriteTimeout = 90000

# Write request body
$requestStream = $request.GetRequestStream()
$requestStream.Write($payloadBytes, 0, $payloadBytes.Length)
$requestStream.Close()

try {
    $response = $request.GetResponse()
    $responseStream = $response.GetResponseStream()
    
    $messageCount = 0
    $startTime = Get-Date
    $timeout = 90 # seconds
    $completeReceived = $false
    
    Write-Host "Reading SSE stream (will wait up to $timeout seconds)...`n" -ForegroundColor Cyan
    
    $buffer = ""
    $lastActivity = Get-Date
    
    while ($true) {
        $elapsed = (Get-Date) - $startTime
        if ($elapsed.TotalSeconds -gt $timeout) {
            Write-Host "`n⏱️ Timeout reached ($timeout seconds)" -ForegroundColor Yellow
            break
        }
        
        # Read available data
        if ($responseStream.DataAvailable) {
            $bytes = New-Object byte[] 1024
            $bytesRead = $responseStream.Read($bytes, 0, $bytes.Length)
            
            if ($bytesRead -gt 0) {
                $lastActivity = Get-Date
                $buffer += [System.Text.Encoding]::UTF8.GetString($bytes, 0, $bytesRead)
                
                # Process complete SSE messages (separated by \n\n)
                while ($buffer -match "(.+?)\n\n") {
                    $message = $matches[1]
                    $buffer = $buffer.Substring($matches[0].Length)
                    
                    # Parse SSE data line
                    if ($message -match "^data:\s*(.+)$") {
                        $messageCount++
                        try {
                            $jsonData = $matches[1] | ConvertFrom-Json
                            $timestamp = Get-Date -Format "HH:mm:ss"
                            Write-Host "[$timestamp] Message #$messageCount : [$($jsonData.stage)] ($($jsonData.progress)%) $($jsonData.message)" -ForegroundColor Cyan
                            
                            if ($jsonData.stage -eq "complete") {
                                Write-Host "`n✅ Received complete message!" -ForegroundColor Green
                                $completeReceived = $true
                                break
                            }
                        } catch {
                            Write-Host "   ⚠️ Failed to parse: $message" -ForegroundColor Yellow
                        }
                    }
                }
                
                if ($completeReceived) { break }
            }
        } else {
            # No data available, check if we've been idle too long
            $idleTime = (Get-Date) - $lastActivity
            if ($idleTime.TotalSeconds -gt 5 -and $messageCount -gt 0) {
                Write-Host "`n📴 No activity for 5 seconds, stream may be closed" -ForegroundColor Yellow
                break
            }
            Start-Sleep -Milliseconds 100
        }
        
        # Check if stream is closed
        if (-not $responseStream.CanRead) {
            Write-Host "`n📴 Stream closed by server" -ForegroundColor Yellow
            break
        }
        
        if ($completeReceived) { break }
    }
    
    $responseStream.Close()
    $response.Close()
    
    Write-Host "`n=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total messages received: $messageCount" -ForegroundColor $(if ($messageCount -gt 1) { "Green" } else { "Red" })
    Write-Host "Time elapsed: $([math]::Round($elapsed.TotalSeconds, 2)) seconds" -ForegroundColor Cyan
    
    if ($messageCount -eq 1) {
        Write-Host "`n❌ Only 1 message received - investigation stopped early" -ForegroundColor Red
        Write-Host "Check the SERVER CONSOLE for detailed logs" -ForegroundColor Yellow
        exit 1
    } elseif ($messageCount -gt 1) {
        Write-Host "`n✅ Multiple messages received - investigation is working!" -ForegroundColor Green
        exit 0
    }
    
} catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

