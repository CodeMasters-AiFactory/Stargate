# 🚀 QUICK SETUP INSTRUCTIONS FOR BOARDROOM PC

**IMPORTANT: Read this entire document before starting. The client/investor is arriving soon!**

## 📋 What This Project Is

This is **StargatePortal** - A complete AI-powered development platform with:

- **Merlin Website Wizard** - AI website builder that generates professional, multi-page websites
- **PANDORA** - Multi-AI collaboration platform
- **Full IDE** - Code editor, terminal, file management
- **Auto-startup system** - Servers start automatically when project opens

## 🎯 YOUR MISSION

Get this project running on the boardroom PC **AS FAST AS POSSIBLE** so the client/investor can see:

1. The website builder in action
2. Professional website generation
3. The full platform capabilities

## ⚡ QUICK START (5 MINUTES)

### Step 1: Check Prerequisites

```powershell
# Check if Node.js is installed
node --version
# Should show v18+ or v20+

# Check if npm is installed
npm --version

# If NOT installed, download from: https://nodejs.org (LTS version)
```

### Step 2: Install Dependencies

```powershell
# Navigate to project folder (on USB stick or copied location)
cd "PATH_TO_PROJECT_FOLDER"

# Install all dependencies
npm install

# This may take 2-3 minutes. Wait for completion.
```

### Step 3: Start the Server

```powershell
# Start the development server
npm run dev

# OR use the auto-startup script (recommended)
powershell -ExecutionPolicy Bypass -File auto-startup-complete.ps1
```

### Step 4: Verify It's Running

- Open browser to: `http://localhost:5000`
- You should see the Stargate IDE homepage
- Click "Merlin Website Wizard" in the sidebar
- Test generating a website

## 🔧 IF SOMETHING GOES WRONG

### Problem: "node: command not found"

**Solution:** Install Node.js from https://nodejs.org (download LTS version)

### Problem: "npm install" fails

**Solution:**

```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Problem: Port 5000 already in use

**Solution:**

```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
# Note the PID, then:
taskkill /PID <PID_NUMBER> /F

# Or change port in .env file
PORT=5001
```

### Problem: "Cannot find module" errors

**Solution:**

```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Problem: Auto-startup doesn't work

**Solution:**

1. Open Cursor/VSCode
2. Open the project folder
3. Press `Ctrl+Shift+P`
4. Type "Tasks: Run Task"
5. Select "🚀 Auto-Startup: Complete System"
6. OR manually run: `npm run dev`

## 📁 Project Structure

```
StargatePortal/
├── client/          # React frontend
├── server/          # Express backend
├── auto-startup-complete.ps1  # Auto-start script
├── package.json     # Dependencies
└── BOARDROOM_SETUP/  # This folder (setup instructions)
```

## 🎨 What to Show the Client

1. **Homepage** (`http://localhost:5000`)
   - Shows Stargate IDE platform
   - Professional landing page

2. **Merlin Website Wizard**
   - Click "Merlin Website Wizard" in sidebar
   - Fill out the wizard form
   - Generate a website
   - Show the professional preview

3. **Key Features to Highlight:**
   - ✅ Auto-startup (servers start automatically)
   - ✅ Professional website generation
   - ✅ Multi-page websites
   - ✅ Advanced effects (glassmorphism, gradients, animations)
   - ✅ SEO optimization
   - ✅ Responsive design

## 🔑 Important Files

- `auto-startup-complete.ps1` - Auto-starts everything
- `package.json` - All dependencies listed here
- `.vscode/tasks.json` - VS Code tasks for auto-start
- `server/index.ts` - Main server entry point
- `client/src/main.tsx` - Frontend entry point

## ⚠️ CRITICAL NOTES

1. **First Time Setup:**
   - `npm install` MUST complete successfully
   - This downloads all dependencies (may take 2-5 minutes)

2. **Port Conflicts:**
   - Default port is 5000
   - If occupied, change in `.env` or `server/index.ts`

3. **Node.js Version:**
   - Requires Node.js 18+ or 20+
   - Check with: `node --version`

4. **Extensions (Optional but Helpful):**
   - ESLint
   - Prettier
   - TypeScript
   - (But project should work without them)

5. **Database:**
   - Uses PostgreSQL (Neon serverless)
   - Connection string in `.env` file
   - If missing, check `server/db/config.ts`

## 🚨 EMERGENCY FALLBACK

If nothing works, show the client:

1. The project structure
2. The code quality
3. The documentation
4. Explain the features (even if not running)

## 📞 Quick Commands Reference

```powershell
# Start server
npm run dev

# Check if server is running
curl http://localhost:5000
# OR open browser to http://localhost:5000

# Stop server
Ctrl+C in terminal

# View logs
# Check terminal output for errors
```

## ✅ SUCCESS CHECKLIST

Before client arrives, verify:

- [ ] Node.js installed (`node --version` works)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Server starts (`npm run dev` works)
- [ ] Browser shows homepage (`http://localhost:5000` loads)
- [ ] Merlin Website Wizard accessible (click in sidebar)
- [ ] Can generate a test website

## 🎯 YOUR PRIORITY ORDER

1. **FIRST:** Get server running (`npm run dev`)
2. **SECOND:** Verify homepage loads in browser
3. **THIRD:** Test website generation
4. **FOURTH:** Prepare demo data/examples

## 💡 PRO TIPS

- Keep terminal open to see server logs
- Have browser ready at `http://localhost:5000`
- Test website generation BEFORE client arrives
- If something breaks, check terminal for error messages
- The auto-startup script handles most issues automatically

## 📝 What Was Recently Fixed

- ✅ Professional website quality (glassmorphism, gradients, animations)
- ✅ Auto-startup system (servers start automatically)
- ✅ Frontend monitoring (keeps frontend running)
- ✅ Error detection and auto-recovery

## 🎬 DEMO SCRIPT (For You to Follow)

1. Open browser to `http://localhost:5000`
2. Show the Stargate IDE homepage
3. Click "Merlin Website Wizard" in sidebar
4. Fill out form:
   - Business Name: "TechCorp Solutions"
   - Business Type: "Technology Services"
   - Target Audience: "Small Businesses"
5. Click "Generate Website"
6. Show the professional preview with:
   - Glassmorphism effects
   - Gradient backgrounds
   - Smooth animations
   - Professional layout

---

**Remember: You are the same AI. You know this codebase. Trust your knowledge. If something doesn't work, check the error messages and fix it. The project is well-structured and should work if dependencies are installed correctly.**

**GOOD LUCK! The client is counting on you! 🚀**
