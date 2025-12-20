# Stargate Portal - Windows Startup Configuration Script
# This script configures Stargate to start automatically with Windows

Write-Host "Stargate Portal - Windows Startup Configuration" -ForegroundColor Cyan
Write-Host ""

# Get the project directory
$projectDir = $PSScriptRoot | Split-Path -Parent
$startupScript = Join-Path $projectDir "scripts\start-stargate-on-boot.ps1"

Write-Host "Project Directory: $projectDir" -ForegroundColor Gray
Write-Host ""

# Check PostgreSQL service
Write-Host "Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue | Select-Object -First 1

if ($pgService) {
    Write-Host "SUCCESS: PostgreSQL found: $($pgService.Name)" -ForegroundColor Green
    
    # Check startup type
    if ($pgService.StartType -eq 'Automatic') {
        Write-Host "   SUCCESS: Already set to start automatically" -ForegroundColor Green
    } else {
        Write-Host "   Setting to start automatically..." -ForegroundColor Yellow
        Set-Service -Name $pgService.Name -StartupType Automatic
        Write-Host "   SUCCESS: PostgreSQL will now start with Windows" -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: PostgreSQL service not found" -ForegroundColor Yellow
    Write-Host "   PostgreSQL may not be installed or service name is different" -ForegroundColor Gray
}

Write-Host ""

# Create startup script
Write-Host "Creating startup script..." -ForegroundColor Yellow

$startupScriptContent = @"
# Stargate Portal - Auto-Start Script
# This script runs automatically when Windows starts

`$ErrorActionPreference = "SilentlyContinue"

# Wait for Windows to fully boot (30 seconds)
Start-Sleep -Seconds 30

# Change to project directory
Set-Location "$projectDir"

# Wait for PostgreSQL to start
`$pgService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue | Select-Object -First 1
if (`$pgService) {
    `$timeout = 60
    `$elapsed = 0
    while (`$pgService.Status -ne 'Running' -and `$elapsed -lt `$timeout) {
        Start-Sleep -Seconds 2
        `$pgService.Refresh()
        `$elapsed += 2
    }
    
    if (`$pgService.Status -eq 'Running') {
        Write-Host "[Stargate Startup] PostgreSQL is running" | Out-File -FilePath "$projectDir\startup.log" -Append
    } else {
        Write-Host "[Stargate Startup] Warning: PostgreSQL did not start within timeout" | Out-File -FilePath "$projectDir\startup.log" -Append
    }
}

# Start the Node.js server
Write-Host "[Stargate Startup] Starting Stargate Portal server..." | Out-File -FilePath "$projectDir\startup.log" -Append

# Check if Node.js is available
if (Get-Command node -ErrorAction SilentlyContinue) {
    # Check if server is already running
    `$portCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue -State Listen
    if (`$portCheck) {
        Write-Host "[Stargate Startup] Server already running on port 5000" | Out-File -FilePath "$projectDir\startup.log" -Append
        exit 0
    }
    
    # Start server in background (hidden window)
    `$process = Start-Process -FilePath "node" -ArgumentList "`"$projectDir\node_modules\.bin\tsx`" `"$projectDir\server\index.ts`"" -WindowStyle Hidden -PassThru
    
    Write-Host "[Stargate Startup] Server started (PID: `$(`$process.Id))" | Out-File -FilePath "$projectDir\startup.log" -Append
    Write-Host "[Stargate Startup] Server URL: http://localhost:5000" | Out-File -FilePath "$projectDir\startup.log" -Append
    Write-Host "[Stargate Startup] Started at: `$(Get-Date)" | Out-File -FilePath "$projectDir\startup.log" -Append
} else {
    Write-Host "[Stargate Startup] ERROR: Node.js not found in PATH" | Out-File -FilePath "$projectDir\startup.log" -Append
}
"@

# Write the startup script
$startupScriptContent | Out-File -FilePath $startupScript -Encoding UTF8
Write-Host "SUCCESS: Startup script created: $startupScript" -ForegroundColor Green
Write-Host ""

# Create Task Scheduler task
Write-Host "Creating Windows Task Scheduler task..." -ForegroundColor Yellow

$taskName = "StargatePortal-AutoStart"
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($taskExists) {
    Write-Host "WARNING: Task already exists. Updating..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the task action
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$startupScript`""

# Create the task trigger (on system startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create the task principal (run as current user)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Create task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

# Register the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Auto-start Stargate Portal on Windows boot" | Out-Null
    Write-Host "SUCCESS: Task Scheduler task created successfully!" -ForegroundColor Green
    Write-Host "   Task Name: $taskName" -ForegroundColor Gray
    Write-Host "   Trigger: On system startup" -ForegroundColor Gray
    Write-Host "   Script: $startupScript" -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Failed to create Task Scheduler task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Add to Windows Startup folder:" -ForegroundColor Yellow
    Write-Host "   1. Press Win+R, type: shell:startup" -ForegroundColor Gray
    Write-Host "   2. Create a shortcut to: $startupScript" -ForegroundColor Gray
}

Write-Host ""
Write-Host "SUCCESS: Windows startup configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   - PostgreSQL: Set to start automatically" -ForegroundColor Gray
Write-Host "   - Stargate Server: Will start 30 seconds after Windows boot" -ForegroundColor Gray
Write-Host "   - Logs: Check startup.log in project directory for startup messages" -ForegroundColor Gray
Write-Host ""
Write-Host "To test: Restart your PC and check http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
