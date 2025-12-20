# 🚀 Quick Start - Fix Frontend Issues

## Immediate Fix

If the frontend is down, run this command in PowerShell:

```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
npm run dev
```

Or double-click: `start-services.ps1`

## Check Server Status

1. **Check if server is running:**

   ```powershell
   netstat -ano | Select-String ":5000"
   ```

2. **Check Node processes:**

   ```powershell
   Get-Process -Name node
   ```

3. **Stop all Node processes (if needed):**
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

## Common Issues

### Port 5000 Already in Use

```powershell
# Find what's using port 5000
netstat -ano | Select-String ":5000"

# Kill the process (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### Dependencies Missing

```powershell
npm install
```

### Server Not Starting

1. Check for errors in the terminal
2. Verify Node.js is installed: `node --version`
3. Verify npm is installed: `npm --version`
4. Check environment variables in `.env` file

## Access the Application

Once the server is running:

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/\*

## Server Output

You should see:

```
serving on port 5000
```

If you see errors, check:

1. TypeScript compilation errors
2. Missing dependencies
3. Port conflicts
4. Environment variable issues
