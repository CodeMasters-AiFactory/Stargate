# 🚨 Server Not Starting? Follow These Steps

## Immediate Action Required

The server is not starting automatically. Please do this:

### Step 1: Open a PowerShell Terminal in VS Code/Cursor
1. Press `` Ctrl+` `` (backtick) to open terminal
2. Or go to: Terminal → New Terminal

### Step 2: Run This Command
```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
npm run dev
```

### Step 3: Check for Errors
Look for error messages in the terminal. Common issues:

#### Error: "Cannot find module"
**Fix:** Run `npm install`

#### Error: "Port 5000 already in use"
**Fix:** 
```powershell
# Find what's using port 5000
netstat -ano | Select-String ":5000"
# Kill the process (replace PID)
Stop-Process -Id <PID> -Force
```

#### Error: TypeScript compilation errors
**Fix:** Run `npm run check` to see TypeScript errors

#### Error: "NODE_ENV is not recognized"
**Fix:** The script now uses `cross-env` - make sure it's installed:
```powershell
npm install --save-dev cross-env
```

## Alternative: Use the PowerShell Script

Double-click or run:
```powershell
.\start-dev.ps1
```

This script will:
- ✅ Check Node.js installation
- ✅ Install dependencies if needed
- ✅ Show all error messages
- ✅ Start the server with proper environment variables

## What Should Happen

When the server starts successfully, you'll see:
```
serving on port 5000
```

Then open: **http://localhost:5000**

## Still Not Working?

1. **Check Node.js version:**
   ```powershell
   node --version
   ```
   Should be 18 or higher

2. **Check npm version:**
   ```powershell
   npm --version
   ```

3. **Reinstall dependencies:**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

4. **Check for TypeScript errors:**
   ```powershell
   npm run check
   ```

## Need Help?

Check the terminal output for specific error messages and share them for troubleshooting.

