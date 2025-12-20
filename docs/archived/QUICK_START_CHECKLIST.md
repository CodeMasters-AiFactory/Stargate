# ✅ Quick Start Checklist - Fix Everything in 10 Minutes

## 🎯 Your Goal

Remove extension errors and set up the perfect development environment.

---

## 📋 STEP-BY-STEP CHECKLIST

### Step 1: Remove Problematic Extensions (2 minutes)

1. Press `Ctrl+Shift+X` in Cursor
2. Search "Java" → Click "Uninstall" on ALL Java extensions
3. Search "R" → Click "Uninstall" on ALL R extensions
4. Search "Python" → Uninstall (unless you use Python)
5. Search "C++" → Uninstall (unless you use C++)

**✅ Check:** No more Java/R extensions in list

---

### Step 2: Install Essential Extensions (3 minutes)

Press `Ctrl+Shift+X` and search/install:

1. **ESLint** - Search "ESLint" → Install
2. **Prettier** - Search "Prettier" → Install
3. **Error Lens** - Search "Error Lens" → Install
4. **GitLens** - Search "GitLens" → Install
5. **Path Intellisense** - Search "Path Intellisense" → Install
6. **Auto Rename Tag** - Search "Auto Rename Tag" → Install
7. **Code Spell Checker** - Search "Code Spell Checker" → Install

**✅ Check:** All 7 extensions show as "Installed"

---

### Step 3: Restart Cursor (1 minute)

1. Close Cursor completely
2. Reopen Cursor
3. Wait for startup

**✅ Check:** No error popups on startup

---

### Step 4: Verify Everything Works (2 minutes)

1. Open any `.tsx` file
2. Make a syntax error (e.g., remove a semicolon)
3. **Check:** Error Lens shows error inline (red underline)
4. Save the file
5. **Check:** Prettier formats the file automatically

**✅ Check:** ESLint and Prettier working

---

### Step 5: Verify Node.js (1 minute)

Open terminal in Cursor and run:

```powershell
node -v
npm -v
```

**✅ Check:** Node.js 18.x or 20.x, NPM 9.x or 10.x

---

### Step 6: Security Check (1 minute)

```powershell
npm audit
```

**✅ Check:** No critical vulnerabilities (warnings are okay)

---

## 🎉 DONE!

After completing this checklist:

- ✅ No startup errors
- ✅ Essential extensions installed
- ✅ ESLint working
- ✅ Prettier working
- ✅ Error Lens showing errors inline
- ✅ Clean workspace

---

## 📚 Reference Documents

If you need more details, check:

- **FIX_EXTENSION_ERRORS_NOW.md** - Detailed extension guide
- **COMPLETE_RECOMMENDATIONS.md** - All recommendations
- **SYSTEM_ANALYSIS_REPORT.md** - Full system analysis

---

## ⚡ Quick Commands

### Install All Essential Extensions (Copy/Paste)

```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
code --install-extension eamodio.gitlens
code --install-extension christian-kohler.path-intellisense
code --install-extension formulahendry.auto-rename-tag
code --install-extension streetsidesoftware.code-spell-checker
```

### Remove Problematic Extensions (Copy/Paste)

```powershell
code --uninstall-extension vscjava.vscode-java-pack
code --uninstall-extension reditorsupport.r
```

---

**Total Time: ~10 minutes**
**Result: Perfect development environment! 🚀**
