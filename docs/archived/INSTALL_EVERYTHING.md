# Complete Installation Guide - Extensions & Dependencies

## ✅ Current Status

### NPM Dependencies

- ✅ **589 packages installed** in `node_modules`
- ✅ All dependencies from `package.json` are installed
- ✅ Ready to use

### VS Code Extensions

- ⚠️ **Need to verify** - Run `.\check-extensions.ps1` to check

## 🚀 Quick Start

### Step 1: Check & Install VS Code Extensions

```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
.\check-extensions.ps1
```

This will:

- List all required extensions
- Show which are installed
- Offer to install missing ones automatically

### Step 2: Verify NPM Dependencies (Already Done ✅)

```powershell
# Dependencies are already installed (589 packages found)
# If you need to reinstall:
npm install
```

### Step 3: Start Development Server

```powershell
npm run dev
```

## 📋 Required VS Code Extensions (22 total)

### Essential (Must Have)

1. **ESLint** - `dbaeumer.vscode-eslint`
2. **Prettier** - `esbenp.prettier-vscode`
3. **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`
4. **TypeScript** - `ms-vscode.vscode-typescript-next`
5. **Error Lens** - `usernamehw.errorlens`

### React Development

6. **ES7+ React Snippets** - `dsznajder.es7-react-js-snippets`

### Code Quality

7. **Code Spell Checker** - `streetsidesoftware.code-spell-checker`

### Productivity

8. **GitLens** - `eamodio.gitlens`
9. **Auto Rename Tag** - `formulahendry.auto-rename-tag`
10. **Path Intellisense** - `christian-kohler.path-intellisense`

### Database & Docker

11. **SQLTools** - `mtxr.sqltools`
12. **Docker** - `ms-azuretools.vscode-docker`

### Documentation

13. **Markdown All in One** - `yzhang.markdown-all-in-one`
14. **Markdownlint** - `davidanson.vscode-markdownlint`

### Logging & Monitoring

15. **Log File Highlighter** - `emilast.logfile-highlighter`
16. **Output Colorizer** - `IBM.output-colorizer`
17. **Log Watcher** - `Automattic.vscode-logwatcher`
18. **Log Plus** - `a4nnw.log-plus`
19. **Code Log Plus** - `imgildev.vscode-code-log-plus`

### Tasks

20. **Tasks** - `actboy168.tasks`

### Utilities

21. **Trailing Spaces** - `shardulm94.trailing-spaces`
22. **GitHub Theme** - `github.github-vscode-theme` (optional)

## 🔧 Installation Methods

### Method 1: Automated Script (Easiest)

```powershell
.\check-extensions.ps1
```

Follow the prompts to install missing extensions.

### Method 2: VS Code UI

1. Open VS Code
2. Press `Ctrl+Shift+X`
3. Look for notification: "This workspace has extension recommendations"
4. Click "Install All"

### Method 3: Command Line (All at Once)

```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension eamodio.gitlens
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension mtxr.sqltools
code --install-extension ms-azuretools.vscode-docker
code --install-extension yzhang.markdown-all-in-one
code --install-extension actboy168.tasks
code --install-extension emilast.logfile-highlighter
code --install-extension IBM.output-colorizer
code --install-extension davidanson.vscode-markdownlint
code --install-extension Automattic.vscode-logwatcher
code --install-extension a4nnw.log-plus
code --install-extension imgildev.vscode-code-log-plus
code --install-extension shardulm94.trailing-spaces
code --install-extension github.github-vscode-theme
```

## ✅ Verification

### Check Extensions

```powershell
# List all installed extensions
code --list-extensions

# Check specific extension
code --list-extensions | Select-String "eslint"
```

### Check NPM Dependencies

```powershell
# Verify node_modules exists
Test-Path "node_modules"

# Count packages
(Get-ChildItem node_modules).Count
```

### Test Everything Works

1. **TypeScript**: Open a `.ts` file - should have IntelliSense
2. **ESLint**: Make a syntax error - should see red squiggles
3. **Prettier**: Format a file with `Shift+Alt+F`
4. **Tailwind**: Type `className="bg-` - should see suggestions
5. **Error Lens**: Errors should show inline

## 🐛 Troubleshooting

### "code command not found"

1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "Shell Command: Install code command in PATH"
4. Select it
5. Restart terminal

### Extensions Not Working

1. Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Check if extension is enabled (Extensions view)
3. Check VS Code Output panel for errors

### NPM Issues

```powershell
# Clear cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📝 What's Already Configured

### VS Code Settings

- ✅ Format on save (Prettier)
- ✅ ESLint auto-fix on save
- ✅ TypeScript workspace version
- ✅ Tailwind CSS IntelliSense
- ✅ Log file highlighting patterns
- ✅ File associations

### Project Structure

- ✅ TypeScript configuration
- ✅ ESLint configuration
- ✅ Prettier configuration
- ✅ Vite configuration
- ✅ Tailwind configuration

## 🎯 Next Steps After Installation

1. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Start Dev Server**: `npm run dev`
3. **Open Project**: Open `http://localhost:5000` in browser
4. **Test Features**:
   - Create a new file
   - Check IntelliSense works
   - Format code (Shift+Alt+F)
   - Check for linting errors

## 📚 Additional Resources

- **Extension Check Script**: `.\check-extensions.ps1`
- **Extension Guide**: `EXTENSIONS_GUIDE.md`
- **Extension Investigation**: `EXTENSIONS_INVESTIGATION.md`
- **Extension Check Doc**: `EXTENSIONS_CHECK.md`

## ✨ Summary

- ✅ **NPM Dependencies**: 589 packages installed
- ⚠️ **VS Code Extensions**: Run `.\check-extensions.ps1` to check/install
- ✅ **Configuration**: All settings files in place
- ✅ **Ready to Code**: Once extensions are installed!

Run `.\check-extensions.ps1` now to complete the setup! 🚀
