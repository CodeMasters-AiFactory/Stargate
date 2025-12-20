# 🚀 Start Frontend Monitoring

## Quick Start

To start continuous frontend monitoring and auto-recovery:

```powershell
.\frontend-monitor.ps1
```

## What It Does

1. **Checks frontend health every 10 seconds**
2. **Automatically restarts server if it crashes**
3. **Logs all health checks and errors**
4. **Provides real-time status updates**

## Features

- ✅ Continuous health monitoring
- ✅ Automatic recovery from failures
- ✅ Real-time status reporting
- ✅ Error detection and logging
- ✅ Auto-restart on crashes

## Configuration

Edit `frontend-monitor.ps1` to change:
- `$CheckInterval = 10` - Health check frequency (seconds)
- `$MaxRestartAttempts = 3` - Maximum auto-restart attempts

## Integration

The monitoring system will be automatically started by the auto-startup script in future versions.

For now, run it manually after the server starts, or add it to your startup sequence.

