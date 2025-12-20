# 🚀 Auto-Start Services Guide

This project is configured to automatically start all services when you open it in VS Code/Cursor.

## ✨ Automatic Startup (VS Code/Cursor)

When you open this project folder, VS Code/Cursor will automatically:

1. ✅ Start the development server (`npm run dev`)
2. ✅ Open the server in a dedicated terminal panel
3. ✅ Make the server available at `http://localhost:5000`

**The server will start automatically - no manual action needed!**

## 🖱️ Manual Startup Options

If automatic startup doesn't work, you can manually start services:

### Option 1: VS Code Tasks

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select "🚀 Start All Services"

### Option 2: Command Line (PowerShell)

```powershell
.\start-services.ps1
```

### Option 3: Command Line (Command Prompt)

```cmd
start-services.bat
```

### Option 4: Direct npm command

```bash
npm run dev
```

## 📝 Services Running

When started, you'll have:

- **Frontend + Backend**: Running on `http://localhost:5000`
- **Hot Reload**: Enabled for both client and server
- **API Endpoints**: Available at `http://localhost:5000/api/*`

## 🔧 Troubleshooting

### Services don't auto-start?

1. Check VS Code settings: `task.autoDetect` should be `"on"`
2. Check `.vscode/tasks.json` exists
3. Manually run the task: `Ctrl+Shift+P` → "Tasks: Run Task"

### Port 5000 already in use?

1. Stop any other services on port 5000
2. Or change the port in `.env`: `PORT=5001`

### Node.js not found?

1. Install Node.js 18+ from https://nodejs.org/
2. Restart VS Code/Cursor after installation

## 🛑 Stopping Services

- **VS Code**: Click the trash icon in the terminal panel
- **Command Line**: Press `Ctrl+C` in the terminal
- **PowerShell/Batch**: Close the terminal window

## 📚 More Information

- See `README.md` for full project documentation
- See `DEPLOYMENT.md` for production deployment
- See `STABILITY_REPORT.md` for codebase status
