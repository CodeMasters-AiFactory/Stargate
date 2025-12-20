# Extension Verification Script
# Run this after cleaning up extensions to verify everything is working

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "EXTENSION VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if code command is available
$codeCmd = Get-Command code -ErrorAction SilentlyContinue
if (-not $codeCmd) {
    Write-Host "⚠️  'code' command not found in PATH" -ForegroundColor Yellow
    Write-Host "   This is okay - we'll check manually" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Step 1: Checking installed extensions..." -ForegroundColor Yellow
Write-Host ""

if ($codeCmd) {
    $installed = code --list-extensions 2>&1
    
    Write-Host "Installed Extensions:" -ForegroundColor Cyan
    $installed | ForEach-Object {
        if ($_ -match "java|r\.|reditorsupport|vscjava") {
            Write-Host "  ❌ $_" -ForegroundColor Red
        } elseif ($_ -match "eslint|prettier|errorlens|gitlens|path-intellisense|auto-rename|spell") {
            Write-Host "  ✅ $_" -ForegroundColor Green
        } else {
            Write-Host "  • $_" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    
    # Check for problematic extensions
    $javaExtensions = $installed | Where-Object { $_ -match "java|vscjava" }
    $rExtensions = $installed | Where-Object { $_ -match "r\.|reditorsupport" }
    
    if ($javaExtensions) {
        Write-Host "⚠️  WARNING: Java extensions still installed:" -ForegroundColor Red
        $javaExtensions | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        Write-Host ""
    } else {
        Write-Host "✅ No Java extensions found" -ForegroundColor Green
    }
    
    if ($rExtensions) {
        Write-Host "⚠️  WARNING: R extensions still installed:" -ForegroundColor Red
        $rExtensions | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        Write-Host ""
    } else {
        Write-Host "✅ No R extensions found" -ForegroundColor Green
    }
    
    # Check for essential extensions
    Write-Host ""
    Write-Host "Step 2: Checking essential extensions..." -ForegroundColor Yellow
    Write-Host ""
    
    $essential = @(
        @{id="dbaeumer.vscode-eslint"; name="ESLint"},
        @{id="esbenp.prettier-vscode"; name="Prettier"},
        @{id="usernamehw.errorlens"; name="Error Lens"},
        @{id="eamodio.gitlens"; name="GitLens"},
        @{id="christian-kohler.path-intellisense"; name="Path Intellisense"},
        @{id="formulahendry.auto-rename-tag"; name="Auto Rename Tag"},
        @{id="streetsidesoftware.code-spell-checker"; name="Code Spell Checker"}
    )
    
    $missing = @()
    foreach ($ext in $essential) {
        if ($installed -contains $ext.id) {
            Write-Host "  ✅ $($ext.name)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($ext.name) - NOT INSTALLED" -ForegroundColor Red
            $missing += $ext
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "Missing extensions:" -ForegroundColor Yellow
        $missing | ForEach-Object {
            Write-Host "  Install: code --install-extension $($_.id)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "⚠️  Cannot check extensions automatically" -ForegroundColor Yellow
    Write-Host "   Please check manually in Cursor (Ctrl+Shift+X)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 3: Checking project configuration..." -ForegroundColor Yellow
Write-Host ""

# Check for settings.json
if (Test-Path ".vscode/settings.json") {
    Write-Host "✅ .vscode/settings.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ .vscode/settings.json missing" -ForegroundColor Red
}

# Check for extensions.json
if (Test-Path ".vscode/extensions.json") {
    Write-Host "✅ .vscode/extensions.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ .vscode/extensions.json missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Checking development tools..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

# Check NPM
try {
    $npmVersion = npm -v 2>&1
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM not found" -ForegroundColor Red
}

# Check Git
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found" -ForegroundColor Red
}

# Check TypeScript
try {
    $tsVersion = npx tsc --version 2>&1
    Write-Host "✅ TypeScript: $tsVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript: Check if installed in node_modules" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If Java/R extensions still show, uninstall them manually" -ForegroundColor White
Write-Host "2. Install any missing essential extensions" -ForegroundColor White
Write-Host "3. Restart Cursor completely" -ForegroundColor White
Write-Host "4. Check if startup errors are gone" -ForegroundColor White
Write-Host ""

