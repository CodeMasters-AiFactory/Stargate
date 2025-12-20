# Test investigation endpoint with proper SSE streaming
$ErrorActionPreference = "Continue"

Write-Host "`n=== Investigation SSE Stream Test ===" -ForegroundColor Cyan
Write-Host "Testing with proper SSE stream handling`n" -ForegroundColor Yellow

# Prepare request
$payload = @{
    businessType = "restaurant"
    businessName = "Test Restaurant"
    description = "Test"
    competitors = @(@{ url = "https://www.example.com" })
} | ConvertTo-Json -Depth 10

Write-Host "[1] Sending request to /api/website-builder/investigate..." -ForegroundColor Yellow
$startTime = Get-Date

try {
    # Use .NET HttpClient for better SSE support
    Add-Type -AssemblyName System.Net.Http
    
    $handler = New-Object System.Net.Http.HttpClientHandler
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [System.TimeSpan]::FromSeconds(120)
    
    $content = New-Object System.Net.Http.StringContent($payload, [System.Text.Encoding]::UTF8, "application/json")
    $request = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, "http://localhost:5000/api/website-builder/investigate")
    $request.Content = $content
    
    $response = $client.SendAsync($request, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).Result
    
    if (!$response.IsSuccessStatusCode) {
        Write-Host "   ❌ Request failed: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   ✅ Response received, reading stream..." -ForegroundColor Green
    
    $stream = $response.Content.ReadAsStreamAsync().Result
    $reader = New-Object System.IO.StreamReader($stream)
    
    $messages = @()
    $buffer = ""
    $lastActivity = Get-Date
    $timeout = 60 # seconds
    
    Write-Host "`n[2] Reading SSE stream..." -ForegroundColor Yellow
    Write-Host "   (Waiting for messages, timeout: ${timeout}s)`n" -ForegroundColor Gray
    
    while ($true) {
        $line = $reader.ReadLine()
        
        if ($null -eq $line) {
            $elapsed = ((Get-Date) - $lastActivity).TotalSeconds
            if ($elapsed -gt $timeout) {
                Write-Host "`n   ⚠️ Timeout: No activity for ${elapsed}s" -ForegroundColor Yellow
                break
            }
            Start-Sleep -Milliseconds 100
            continue
        }
        
        $lastActivity = Get-Date
        
        if ($line -match "^data:\s*(.+)$") {
            try {
                $json = $matches[1]
                $data = $json | ConvertFrom-Json
                $messages += $data
                
                $num = $messages.Count
                $stage = $data.stage
                $progress = $data.progress
                $message = $data.message
                
                Write-Host "   📨 Message #$num : $stage ($progress%)" -ForegroundColor Cyan
                if ($message) {
                    Write-Host "      $message" -ForegroundColor Gray
                }
                
                if ($stage -eq "complete") {
                    Write-Host "`n   ✅ Complete message received!" -ForegroundColor Green
                    break
                }
            } catch {
                Write-Host "   ⚠️ Failed to parse: $line" -ForegroundColor Yellow
            }
        } elseif ($line -match "^:") {
            # Comment/keepalive
            Write-Host "   Keepalive" -ForegroundColor DarkGray
        }
    }
    
    $reader.Close()
    $stream.Close()
    $response.Dispose()
    $client.Dispose()
    
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)
    
    # Summary
    Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Total time: ${elapsed}s" -ForegroundColor White
    Write-Host "Messages received: $($messages.Count)" -ForegroundColor White
    Write-Host "Stages: $($messages.stage -join ', ')" -ForegroundColor White
    
    $completeReceived = ($messages | Where-Object { $_.stage -eq "complete" }).Count -gt 0
    Write-Host "Complete message: $(if ($completeReceived) { 'YES ✅' } else { 'NO ❌' })" -ForegroundColor $(if ($completeReceived) { "Green" } else { "Red" })
    
    if ($completeReceived -and $messages.Count -ge 3) {
        Write-Host "`n✅ TEST PASSED!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
        Write-Host "Expected at least 3 messages with complete message" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.StackTrace) {
        Write-Host "Stack: $($_.Exception.StackTrace)" -ForegroundColor Gray
    }
    exit 1
}

