# How Cursor Loads Rules at Startup

## 🔍 The Mechanism

### Built-In Cursor Feature

**Cursor automatically loads `.cursorrules` file - NO CONFIGURATION NEEDED**

This is a **built-in feature** of Cursor AI. Here's how it works:

---

## 📁 File Location

```
StargatePortal/
  └── .cursorrules    ← Cursor automatically detects this file
```

**Requirements:**
- ✅ File must be named exactly `.cursorrules` (with the dot)
- ✅ File must be in workspace root (not in subdirectories)
- ✅ File can be any size (but token limits apply)
- ✅ File format: Plain text/markdown

---

## ⚙️ How Cursor Loads It

### Automatic Detection

1. **When Cursor Starts:**
   - Cursor scans workspace root for `.cursorrules`
   - If found → automatically loads it into AI context
   - If not found → no rules loaded

2. **When Workspace Opens:**
   - Cursor detects workspace folder
   - Scans for `.cursorrules` in root
   - Loads rules into AI context
   - Rules become active immediately

3. **When Session Begins:**
   - Every new chat session
   - Every new AI interaction
   - Rules are included in context automatically

### No Configuration Required

**You DON'T need to:**
- ❌ Configure anything in Cursor settings
- ❌ Add anything to `.vscode/settings.json`
- ❌ Create any startup scripts
- ❌ Manually load the file
- ❌ Set any environment variables

**Cursor does it automatically** - it's a built-in feature.

---

## 🔬 Technical Details

### How It Works Internally

1. **File Detection:**
   ```
   Cursor Startup → Scan Workspace Root → Find .cursorrules → Load into Context
   ```

2. **Context Injection:**
   - Rules are prepended to AI context
   - Included in every AI request
   - Persist throughout the session

3. **Token Management:**
   - Rules consume tokens from context window
   - Very large files might get truncated
   - Current file (~30KB) is well within limits

### Token Limits

- **Cursor Context Window:** ~128K-200K tokens (varies by model)
- **Current `.cursorrules`:** ~30KB ≈ ~7,500 tokens
- **Status:** ✅ Well within limits
- **Risk:** Low - file won't be truncated

---

## ✅ Verification

### Check 1: File Exists

```powershell
Test-Path ".cursorrules"
# Should return: True
```

### Check 2: File Size

```powershell
(Get-Content ".cursorrules" | Measure-Object -Line).Lines
# Current: 874 lines

(Get-Item ".cursorrules").Length
# Current: ~30KB
```

### Check 3: Rules Are Active

**Test Behavior:**
1. Open new Cursor session
2. AI should greet and summarize (Session Startup Ritual)
3. AI should propose next steps
4. AI should start dev server automatically (Rule 0)

**If rules aren't followed:**
- Check file exists
- Check file isn't corrupted
- Restart Cursor
- Check for syntax errors

---

## 🚨 Troubleshooting

### Rules Not Loading?

**Symptoms:**
- AI doesn't follow Session Startup Ritual
- AI doesn't start dev server automatically
- AI doesn't follow Plan → Execute → Verify workflow

**Solutions:**

1. **Verify File Exists:**
   ```powershell
   Test-Path ".cursorrules"
   ```

2. **Check File Location:**
   - Must be in workspace root
   - Not in `.cursor/` folder
   - Not in `docs/` folder
   - Must be exactly `.cursorrules`

3. **Check File Format:**
   - Should be plain text/markdown
   - No special encoding required
   - UTF-8 is fine

4. **Restart Cursor:**
   - Close Cursor completely
   - Reopen workspace
   - Rules should load automatically

5. **Check File Size:**
   - If file is too large (>100KB), might get truncated
   - Current file is fine (~30KB)

---

## 📊 Current Status

### ✅ What's Working

- ✅ `.cursorrules` file exists (874 lines, ~30KB)
- ✅ File is in correct location (workspace root)
- ✅ File format is correct (markdown)
- ✅ All critical rules included
- ✅ File size is reasonable
- ✅ Rules should load automatically

### ⚠️ Potential Issues

- ⚠️ Token limits (if file grows too large)
- ⚠️ Cursor updates might change behavior
- ⚠️ File corruption might prevent loading

### 🔧 Recommendations

1. **Keep file size reasonable** (<50KB)
2. **Prioritize critical rules at top**
3. **Test rules are followed** after Cursor updates
4. **Backup `.cursorrules`** in git
5. **Monitor rule enforcement**

---

## 🎯 Summary

### How It Works

1. **Cursor automatically detects `.cursorrules`** in workspace root
2. **No configuration needed** - it's built into Cursor
3. **Rules load at startup** - every session, every workspace open
4. **Rules persist** - across restarts, updates, workspace reloads
5. **Rules are active** - included in every AI interaction

### What You Need to Do

**NOTHING** - Cursor handles it automatically!

Just ensure:
- ✅ `.cursorrules` file exists in workspace root
- ✅ File contains your rules
- ✅ File format is correct
- ✅ File size is reasonable

### Verification

Test by opening a new Cursor session - AI should:
- ✅ Greet and summarize (Session Startup Ritual)
- ✅ Propose next steps
- ✅ Start dev server automatically (Rule 0)
- ✅ Follow Plan → Execute → Verify workflow

---

**Last Updated:** 2025-01-20  
**Status:** ✅ Rules are automatically loaded by Cursor  
**Mechanism:** Built-in Cursor feature - no configuration needed


