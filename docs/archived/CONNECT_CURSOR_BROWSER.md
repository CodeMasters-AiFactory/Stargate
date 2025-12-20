# 🌐 Connect Cursor Browser to Your Frontend

## ✅ Simple Steps

### Step 1: Start the Server

Run this in the terminal:

```powershell
.\start.ps1
```

Or use the VS Code task:

- Press `Ctrl+Shift+P`
- Type: "Tasks: Run Task"
- Select: "Start Server"

### Step 2: Wait for Server

Look for this message in the terminal:

```
✅ Server running on port 5000
```

### Step 3: Open Cursor Browser

1. **Make sure the Browser panel is open** in Cursor
2. **Click in the address bar** (where it says "Enter URL or search...")
3. **Type**: `http://localhost:5000`
4. **Press Enter**

That's it! Your frontend will load in Cursor's browser.

## 🎯 Quick Method

Once the server is running:

1. **Click the Browser panel** (the globe icon)
2. **Type in address bar**: `localhost:5000`
3. **Press Enter**

## ✅ What You'll See

When connected:

- ✅ Browser shows your Stargate Portal frontend
- ✅ URL bar displays: `http://localhost:5000`
- ✅ Frontend UI loads correctly
- ✅ All features work normally

## 🔄 Auto-Refresh

The browser will automatically refresh when:

- You make changes to your code (if hot reload is enabled)
- You click the refresh button (🔄)
- The server restarts

## 📝 Notes

- **Server must be running** before the browser can connect
- **URL is**: `http://localhost:5000`
- **Browser panel** must be open in Cursor
- You can keep it open while coding for live preview

## 🆘 If It Doesn't Work

1. **Check server is running**: Look for "Server running on port 5000" in terminal
2. **Wait a few seconds**: Server may need time to fully start
3. **Try refreshing**: Click the refresh button in browser
4. **Check URL**: Make sure it's exactly `http://localhost:5000`

Your Cursor browser is ready to connect! Just start the server and navigate to the URL. 🚀
