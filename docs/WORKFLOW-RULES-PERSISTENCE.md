# Workflow Rules Persistence Guarantee

## ✅ Rules Are Permanently Saved

The permanent workflow rules are saved in **`.cursorrules`** file in the workspace root. This file ensures:

1. **Automatic Loading**: Cursor AI automatically loads `.cursorrules` at the start of every session
2. **Persists Across Restarts**: Rules remain active after:
   - PC restarts
   - Cursor application restarts
   - Workspace reloads
   - Cursor updates
3. **Version Control**: The file is tracked in git, so it's backed up and can be restored if needed

## File Location

```
StargatePortal/
  ├── .cursorrules          ← Permanent rules (automatically loaded by Cursor)
  ├── docs/
  │   └── permanent-workflow-rules.md  ← Detailed documentation
  └── ...
```

## What These Rules Enforce

### Rule 1: Auto-Refresh After Changes

- Automatically refresh browser after code changes
- Verify page loads correctly
- Check for errors
- Test functionality

### Rule 2: Browser Testing and Auto-Fix

- Open browser and test every change
- Detect errors automatically
- Fix issues immediately
- Verify fixes work

## Verification

To verify the rules are active:

1. **Check file exists**: `.cursorrules` should be in workspace root
2. **Check Cursor status**: Rules are automatically loaded (no manual action needed)
3. **Test behavior**: Make a code change and observe that browser auto-refreshes

## Backup Strategy

The `.cursorrules` file is:

- ✅ Saved in workspace root
- ✅ Tracked in git (version controlled)
- ✅ Documented in `docs/permanent-workflow-rules.md`
- ✅ Referenced in this document

## If Rules Are Lost

If for any reason the rules stop working:

1. Check that `.cursorrules` exists in workspace root
2. Verify file content matches the expected format
3. Restart Cursor to reload rules
4. If needed, restore from git: `git checkout .cursorrules`

## Last Updated

Rules were last verified and enhanced: 2025-01-XX
Rules will persist across all future sessions and PC restarts.
