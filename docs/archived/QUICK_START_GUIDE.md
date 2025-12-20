# 🚀 Quick Start Guide - Browser Auto-Open

## ✅ What's Configured

Your project is set up to:

1. **Automatically start the server** when you open the project
2. **Automatically open your browser** to `http://localhost:5000` when the server is ready

## 🎯 How to Start

### Option 1: Automatic (Recommended)

1. **Close and reopen the project folder** in Cursor
2. **Click "Allow"** when Cursor asks about automatic tasks
3. **Wait 5-10 seconds** for the server to start
4. **Browser opens automatically** to your project!

### Option 2: Manual Start

1. **Press `Ctrl+Shift+P`** (or `Cmd+Shift+P` on Mac)
2. **Type**: "Tasks: Run Task"
3. **Select**: "Start Server"
4. **Wait for server to start**
5. **Browser opens automatically**

### Option 3: Direct Script

Open terminal and run:

```powershell
.\start.ps1
```

## 🌐 Browser Behavior

### External Browser (Default)

- Opens your **default system browser** (Chrome, Edge, Firefox, etc.)
- Navigates to `http://localhost:5000`
- Opens automatically when server is ready

### Cursor Embedded Browser

- The **Browser panel** in Cursor can also be used
- Manually navigate to: `http://localhost:5000`
- Or use the browser panel's URL bar

## 📋 What You'll See

When everything works:

```
🚀 Starting server...
🌐 Browser will open automatically when server is ready

[Server logs...]
✅ Server running on port 5000
✅ Browser opened: http://localhost:5000
```

## 🔍 Troubleshooting

### Browser Doesn't Open?

1. **Check if server is running**: Look for "✅ Server running on port 5000" in terminal
2. **Wait a few more seconds**: It may take 5-10 seconds after server starts
3. **Open manually**: Go to `http://localhost:5000` in your browser

### Server Doesn't Start?

1. **Check Node.js**: Make sure Node.js is installed
2. **Check port 5000**: Make sure nothing else is using port 5000
3. **Check terminal**: Look for error messages

### Port 5000 Already in Use?

The script automatically stops existing Node processes, but if that doesn't work:

```powershell
Get-Process -Name node | Stop-Process -Force
```

## ✅ Success Indicators

You'll know it's working when:

- ✅ Terminal shows "Server running on port 5000"
- ✅ Browser opens automatically (or you see the message)
- ✅ Frontend loads in the browser
- ✅ No errors in the terminal

## 🎉 That's It!

Your project will now automatically:

- Start the server
- Open your browser
- Show your frontend

Just open the project and wait! 🚀
