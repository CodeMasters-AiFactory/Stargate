# 🚨 ENFORCED AUTO-STARTUP RULES

## CRITICAL RULE: Everything MUST Start Automatically

**When you open this project, ALL of the following MUST start automatically:**

1. ✅ **Dependencies** - `npm install` (if node_modules missing)
2. ✅ **Backend Server** - `npm run dev` (starts on port 5000)
3. ✅ **Frontend** - Automatically served by Vite
4. ✅ **Agent Farm** - Auto-initializes when server starts
5. ✅ **Startup Agent** - Auto-verifies all services after 3 seconds
6. ✅ **All Services** - Database, APIs, WebSockets, etc.

## Configuration Files

### 1. `.vscode/tasks.json` ✅

- Task configured with `"runOn": "folderOpen"`
- This is the PRIMARY auto-startup mechanism

### 2. `StargatePortal.code-workspace` ✅

- Workspace task with `"runOn": "folderOpen"`
- Settings: `"task.allowAutomaticTasks": "on"`
- Settings: `"task.autoDetect": "on"`

### 3. `auto-startup-complete.ps1` ✅

- Comprehensive startup script
- Checks dependencies
- Starts server
- Verifies frontend
- Auto-fixes issues

## How It Works

1. **When you open the project:**
   - VS Code/Cursor detects the workspace
   - Reads `.vscode/tasks.json` or workspace tasks
   - Sees `"runOn": "folderOpen"`
   - Automatically runs the startup task

2. **The startup script:**
   - Checks Node.js is available
   - Installs dependencies if missing
   - Checks if server is already running
   - Starts server if not running
   - Verifies frontend is accessible
   - Opens browser
   - Starts monitoring

3. **Server startup:**
   - Runs `npm run dev`
   - Server starts on port 5000
   - Agent Farm auto-initializes
   - Startup Agent verifies everything after 3 seconds

## If Auto-Startup Doesn't Work

### Check 1: Workspace Trust

- VS Code/Cursor may ask to "Trust Workspace"
- Click "Yes, I trust the authors"
- This is required for auto-tasks to run

### Check 2: Task Settings

Verify these settings in workspace:

```json
{
  "task.allowAutomaticTasks": "on",
  "task.autoDetect": "on"
}
```

### Check 3: Task Configuration

Verify task has:

```json
{
  "runOptions": {
    "runOn": "folderOpen"
  }
}
```

### Check 4: Manual Trigger

If auto-start doesn't work:

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "🚀 AUTO-START: All Services"
4. Or run: `.\auto-startup-complete.ps1`

## Verification

After opening the project, you should see:

1. ✅ Terminal opens automatically
2. ✅ Script runs automatically
3. ✅ Server starts
4. ✅ Browser opens to http://localhost:5000
5. ✅ Agent Farm initializes
6. ✅ Startup Agent verifies services

## Troubleshooting

### Problem: Task doesn't run automatically

**Solution**:

- Check workspace trust settings
- Verify `task.allowAutomaticTasks` is `"on"`
- Restart VS Code/Cursor

### Problem: Dependencies not installed

**Solution**:

- Script now auto-installs if node_modules missing
- Check npm is in PATH

### Problem: Server doesn't start

**Solution**:

- Check port 5000 is available
- Check Node.js is installed
- Check for errors in terminal

### Problem: Agent Farm not initializing

**Solution**:

- Server must be running first
- Check server logs for Agent Farm initialization
- Agent Farm starts automatically when server starts

## This Rule is MANDATORY

**Every time you open this project, everything MUST start automatically.**
**No exceptions. No manual steps required.**
**If it doesn't work, fix the configuration until it does.**
