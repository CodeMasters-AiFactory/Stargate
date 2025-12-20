# Permanent Workflow Rules

## Rule 1: Auto-Refresh and Verification After Changes

**CRITICAL RULE - MUST BE FOLLOWED ALWAYS**

After making ANY code changes, you MUST:

1. **Refresh the browser/application**
   - Navigate to the application in the browser
   - Perform a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Clear any cached state if necessary

2. **Verify the page/system is functioning**
   - Check that the page loads without errors
   - Verify navigation still works
   - Confirm UI elements render correctly
   - Test core functionality (buttons, forms, interactions)

3. **Verify changes took effect**
   - Inspect the specific feature/component that was changed
   - Confirm the new behavior matches the intended change
   - Check browser console for errors
   - Verify no regressions in related features

4. **Document verification results**
   - Note what was tested
   - Record any issues found
   - Confirm successful implementation

**Failure to follow this rule is considered a critical error.**

---

## Rule 2: Browser Testing and Auto-Fix

**CRITICAL RULE - MUST BE FOLLOWED ALWAYS**

Before considering any task complete, you MUST:

1. **Open the browser and navigate to the application**
   - Use the browser automation tools (MCP browser extension)
   - Navigate to `http://localhost:5000` (or the appropriate URL)
   - Wait for the page to fully load

2. **Perform comprehensive testing**
   - Test the specific feature that was changed
   - Test related features for regressions
   - Check browser console for JavaScript errors
   - Verify network requests complete successfully
   - Test on the actual page where the feature is used

3. **Detect and fix errors automatically**
   - If errors are found in the console, investigate immediately
   - If UI elements are broken, fix the code
   - If functionality is broken, restore it
   - If performance issues are detected, optimize
   - Never leave errors unfixed

4. **Verify the fix**
   - Re-test after fixing
   - Confirm errors are resolved
   - Ensure no new errors were introduced

**This rule applies to:**

- All code changes
- All feature implementations
- All bug fixes
- All UI updates
- All configuration changes

**Failure to follow this rule is considered a critical error.**

---

## Implementation Checklist

After every code change, verify:

- [ ] Browser opened and navigated to the application
- [ ] Page loads without errors
- [ ] Console shows no JavaScript errors
- [ ] Changed feature works as intended
- [ ] Related features still work (no regressions)
- [ ] UI renders correctly
- [ ] Network requests complete successfully
- [ ] Any detected errors have been fixed
- [ ] Fixes have been verified

---

## Error Detection Patterns

Watch for these common issues:

1. **JavaScript Errors**
   - `ReferenceError`, `TypeError`, `SyntaxError`
   - Uncaught exceptions
   - Failed imports/modules

2. **React Errors**
   - Component rendering errors
   - Hook violations
   - State update errors

3. **Network Errors**
   - Failed API requests
   - 404/500 errors
   - CORS issues

4. **UI Issues**
   - Missing elements
   - Broken layouts
   - Non-functional buttons/forms

5. **Performance Issues**
   - Slow page loads
   - Memory leaks
   - Infinite loops

---

## Auto-Fix Priority

When errors are detected, fix in this order:

1. **Critical Errors** (app won't load/function)
   - Fix immediately
   - Test thoroughly
   - Verify fix works

2. **Functional Errors** (feature broken)
   - Fix before moving on
   - Test the specific feature
   - Check for side effects

3. **Warning/Non-Critical Issues**
   - Fix if time permits
   - Document if deferred
   - Add to TODO if needed

---

## Verification Commands

Use these commands for verification:

```bash
# Check if server is running
curl http://localhost:5000

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Run tests (if available)
npm test
```

---

## Browser Testing Workflow

1. Open browser using MCP browser extension
2. Navigate to application URL
3. Take snapshot to see current state
4. Check console messages for errors
5. Test the changed feature
6. If errors found:
   - Read error details
   - Fix the code
   - Refresh browser
   - Re-test
7. Document results

---

**These rules are PERMANENT and must be followed for EVERY change.**
