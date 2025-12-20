# Stargate Portal - Auto-Start Script
# This script runs automatically when Windows starts

$ErrorActionPreference = "SilentlyContinue"

# Wait for Windows to fully boot (30 seconds)
Start-Sleep -Seconds 30

# Change to project directory
Set-Location "C:\CURSOR PROJECTS\StargatePortal"

# Wait for PostgreSQL to start
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue | Select-Object -First 1
if ($pgService) {
    $timeout = 60
    $elapsed = 0
    while ($pgService.Status -ne 'Running' -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $pgService.Refresh()
        $elapsed += 2
    }
    
    if ($pgService.Status -eq 'Running') {
        Write-Host "[Stargate Startup] PostgreSQL is running" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
    } else {
        Write-Host "[Stargate Startup] Warning: PostgreSQL did not start within timeout" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
    }
}

# Start the Node.js server
Write-Host "[Stargate Startup] Starting Stargate Portal server..." | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append

# Check if Node.js is available
if (Get-Command node -ErrorAction SilentlyContinue) {
    # Check if server is already running
    $portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
    if ($portCheck) {
        Write-Host "[Stargate Startup] Server already running on port 5000" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
        exit 0
    }
    
    # Start server in background (hidden window)
    $process = Start-Process -FilePath "node" -ArgumentList ""C:\CURSOR PROJECTS\StargatePortal\node_modules\.bin\tsx" "C:\CURSOR PROJECTS\StargatePortal\server\index.ts"" -WindowStyle Hidden -PassThru
    
    Write-Host "[Stargate Startup] Server started (PID: $($process.Id))" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
    Write-Host "[Stargate Startup] Server URL: http://localhost:5000" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
    Write-Host "[Stargate Startup] Started at: $(Get-Date)" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
} else {
    Write-Host "[Stargate Startup] ERROR: Node.js not found in PATH" | Out-File -FilePath "C:\CURSOR PROJECTS\StargatePortal\startup.log" -Append
}
