# ═══════════════════════════════════════════════════════════════════════════════
# AUTONOMOUS MERLIN TESTER - WINDOWS AUTO-START SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
#
# This script creates a Windows Task Scheduler task to automatically start
# the Autonomous Merlin Tester daemon when Windows starts.
#
# USAGE:
#   Run as Administrator:
#   powershell -ExecutionPolicy Bypass -File .\scripts\windows-autostart.ps1
#
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$Uninstall,
    [switch]$Status,
    [string]$ProjectPath = (Split-Path -Parent $PSScriptRoot)
)

$TaskName = "MerlinAutonomousTester"
$Description = "Autonomous Merlin Website Tester - Self-Improving AI System"

function Write-Banner {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  AUTONOMOUS MERLIN TESTER - WINDOWS AUTO-START INSTALLER" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Administrator {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-NodePath {
    $nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $nodePath) {
        Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
        exit 1
    }
    return $nodePath
}

function Install-ScheduledTask {
    Write-Host "📦 Installing scheduled task..." -ForegroundColor Yellow

    $nodePath = Get-NodePath
    $daemonScript = Join-Path $ProjectPath "server\automation\daemon.js"

    # Check if daemon script exists (compiled)
    if (-not (Test-Path $daemonScript)) {
        Write-Host "⚠️  Daemon script not found. Attempting to compile TypeScript..." -ForegroundColor Yellow

        # Try to compile
        Push-Location $ProjectPath
        & npm run build
        Pop-Location

        if (-not (Test-Path $daemonScript)) {
            Write-Host "❌ Failed to compile daemon. Please run 'npm run build' first." -ForegroundColor Red
            exit 1
        }
    }

    # Create the scheduled task action
    $action = New-ScheduledTaskAction `
        -Execute $nodePath `
        -Argument "daemon.js start" `
        -WorkingDirectory (Join-Path $ProjectPath "server\automation")

    # Create trigger to run at startup
    $trigger = New-ScheduledTaskTrigger -AtStartup

    # Create settings
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit (New-TimeSpan -Hours 0) # No time limit

    # Create principal (run as current user)
    $principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Limited

    # Register the task
    try {
        # Remove existing task if present
        $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($existingTask) {
            Write-Host "🔄 Removing existing task..." -ForegroundColor Yellow
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        }

        Register-ScheduledTask `
            -TaskName $TaskName `
            -Description $Description `
            -Action $action `
            -Trigger $trigger `
            -Settings $settings `
            -Principal $principal

        Write-Host "✅ Scheduled task installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The daemon will start automatically when Windows boots." -ForegroundColor White
        Write-Host ""
        Write-Host "To start manually now, run:" -ForegroundColor White
        Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
        Write-Host ""

    } catch {
        Write-Host "❌ Failed to create scheduled task: $_" -ForegroundColor Red
        exit 1
    }
}

function Uninstall-ScheduledTask {
    Write-Host "🗑️  Uninstalling scheduled task..." -ForegroundColor Yellow

    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        # Stop if running
        if ($existingTask.State -eq "Running") {
            Stop-ScheduledTask -TaskName $TaskName
        }

        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "✅ Scheduled task removed successfully!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No scheduled task found to remove." -ForegroundColor Yellow
    }
}

function Get-TaskStatus {
    Write-Host "📊 Checking task status..." -ForegroundColor Yellow
    Write-Host ""

    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

    if ($task) {
        $taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName

        Write-Host "Task Name:    $TaskName" -ForegroundColor White
        Write-Host "State:        $($task.State)" -ForegroundColor $(if ($task.State -eq "Running") { "Green" } else { "Yellow" })
        Write-Host "Last Run:     $($taskInfo.LastRunTime)" -ForegroundColor White
        Write-Host "Last Result:  $($taskInfo.LastTaskResult)" -ForegroundColor $(if ($taskInfo.LastTaskResult -eq 0) { "Green" } else { "Red" })
        Write-Host "Next Run:     $($taskInfo.NextRunTime)" -ForegroundColor White
        Write-Host ""

        # Check if daemon is actually running
        $pidFile = Join-Path $ProjectPath ".cursor\autonomous-daemon.pid"
        if (Test-Path $pidFile) {
            $pid = Get-Content $pidFile
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "✅ Daemon process is running (PID: $pid)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Daemon PID file exists but process not found" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️  Daemon is not currently running" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Task not installed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Run with no parameters to install:" -ForegroundColor White
        Write-Host "  .\windows-autostart.ps1" -ForegroundColor Cyan
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

Write-Banner

# Check for admin rights if installing/uninstalling
if ((-not $Status) -and (-not (Test-Administrator))) {
    Write-Host "⚠️  This script requires Administrator privileges." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if ($Status) {
    Get-TaskStatus
} elseif ($Uninstall) {
    Uninstall-ScheduledTask
} else {
    Install-ScheduledTask
}

Write-Host ""
