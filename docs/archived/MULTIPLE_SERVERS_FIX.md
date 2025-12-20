# Multiple Dev Servers Problem - Root Cause & Fix

## 🔍 Problem Identified

**7 Node.js processes running simultaneously** - all started around 08:32 AM

### Why This Happened

1. **Multiple Startup Scripts**
   - `auto-start.ps1`
   - `ensure-services-running.ps1`
   - `start-and-verify.ps1`
   - `frontend-monitor.ps1`
   - `start-and-connect.ps1`
   - Multiple scripts creating background jobs

2. **Background Jobs Not Cleaned Up**
   - Each script uses `Start-Job` to run `npm run dev`
   - Jobs aren't properly stopped before starting new ones
   - Processes accumulate over time

3. **No Process Cleanup Before Start**
   - Scripts don't always kill existing processes first
   - Multiple restarts = multiple processes

4. **VS Code/Cursor Tasks**
   - Multiple tasks configured with `runOn: "folderOpen"`
   - Each task starts a new process
   - Tasks don't coordinate with each other

---

## ✅ Fix Applied

### Immediate Cleanup

1. ✅ Killed all 7 Node.js processes
2. ✅ Stopped all background jobs
3. ✅ Freed port 5000
4. ✅ Verified cleanup

### Prevention Strategy

**Use ONE startup method only:**

1. **Preferred:** `npm run start:verified` (if configured)
2. **Alternative:** Single PowerShell script that:
   - Kills all existing Node processes FIRST
   - Kills processes on port 5000 FIRST
   - Starts ONE process
   - Monitors that ONE process

---

## 🔧 Recommended Solution

### Create Single Startup Script

**File:** `scripts/start-dev-server.ps1`

```powershell
# Single source of truth for starting dev server
# ALWAYS kills existing processes first

Write-Host "🛑 Stopping all existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "🛑 Freeing port 5000..." -ForegroundColor Yellow
$port5000 = netstat -ano | findstr ":5000" | findstr "LISTENING"
if ($port5000) {
    $pid = ($port5000 -split '\s+')[-1]
    if ($pid) {
        taskkill /PID $pid /F 2>$null
        Start-Sleep -Seconds 1
    }
}

Write-Host "🚀 Starting dev server..." -ForegroundColor Green
Set-Location "C:\CURSOR PROJECTS\StargatePortal"
$env:NODE_ENV = "development"
$env:PORT = "5000"
npm run dev
```

### Disable Multiple Startup Methods

1. **Remove or disable:**
   - Multiple `auto-start*.ps1` scripts
   - Multiple VS Code tasks with `runOn: "folderOpen"`
   - Background job creation in scripts

2. **Keep only:**
   - ONE startup script
   - ONE VS Code task (if needed)
   - Manual `npm run dev` command

---

## 📊 Current Status

- ✅ All duplicate processes killed
- ✅ Port 5000 freed
- ✅ Ready for clean restart

---

## 🎯 Next Steps

1. **Start server cleanly:**
   ```powershell
   npm run dev
   ```

2. **Monitor for duplicates:**
   - Check `Get-Process -Name "node"` periodically
   - Should only see 1-2 processes (main + maybe Vite child)

3. **If duplicates appear again:**
   - Check which script/task started them
   - Disable that startup method
   - Use only ONE startup method

---

**Last Updated:** 2025-12-01  
**Status:** ✅ Fixed - All duplicate processes killed


