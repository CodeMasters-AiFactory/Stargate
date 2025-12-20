# 🚨 EMERGENCY FIXES - Quick Solutions

## Problem: "node: command not found"

**Solution:**

1. Download Node.js from https://nodejs.org
2. Install the LTS version
3. Restart terminal/PowerShell
4. Run `node --version` to verify

---

## Problem: "npm install" fails or hangs

**Solution:**

```powershell
# Clear cache
npm cache clean --force

# Delete node_modules if exists
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Delete package-lock.json
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Try again
npm install
```

---

## Problem: Port 5000 already in use

**Solution:**

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number from above)
taskkill /PID <PID_NUMBER> /F

# OR change port in .env file
# Add: PORT=5001
```

---

## Problem: "Cannot find module" errors

**Solution:**

```powershell
# Delete and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

---

## Problem: Server starts but browser shows error

**Solution:**

1. Check terminal for error messages
2. Verify server is actually running (check terminal output)
3. Try different browser
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try incognito/private mode

---

## Problem: "Database connection failed"

**Solution:**

- The project should work without database for basic demo
- Check if `.env` file exists
- If missing, create it with:

```
PORT=5000
NODE_ENV=development
```

---

## Problem: Auto-startup script doesn't work

**Solution:**

```powershell
# Run manually
npm run dev

# OR in Cursor/VSCode:
# 1. Press Ctrl+Shift+P
# 2. Type "Tasks: Run Task"
# 3. Select "Auto-Startup"
```

---

## Problem: "Permission denied" or PowerShell execution policy

**Solution:**

```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run script again
```

---

## Problem: Website generation fails

**Solution:**

1. Check if OpenAI API key is configured (if needed)
2. Check terminal for specific error
3. Try generating a simpler website (fewer pages)
4. The project should work in "mock mode" without API keys

---

## Problem: Nothing works - Complete Reset

**Solution:**

```powershell
# 1. Delete everything
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall
npm install

# 4. Start
npm run dev
```

---

## Quick Health Check

Run these commands to verify everything:

```powershell
# Check Node.js
node --version
# Should show: v18.x.x or v20.x.x

# Check npm
npm --version
# Should show: 9.x.x or 10.x.x

# Check if dependencies installed
Test-Path node_modules
# Should return: True

# Check if server can start (test)
npm run dev
# Should start server (press Ctrl+C to stop)
```

---

## Last Resort: Show Code Quality

If server won't start, show the client:

1. Project structure (well-organized)
2. Code quality (TypeScript, modern patterns)
3. Documentation files
4. Feature list (what it does)
5. Explain the architecture

**Remember: Even if it doesn't run, the code quality speaks for itself!**
