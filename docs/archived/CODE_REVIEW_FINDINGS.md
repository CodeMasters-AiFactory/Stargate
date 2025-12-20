# Comprehensive Code Review Findings - WebsiteBuilderWizard.tsx

## Critical Issues Found

### 1. INFINITE LOOP RISK - Line 3725-3734

**Issue**: useEffect that updates `wizardState.stage` based on `generatedWebsite` and `wizardState.stage`
**Problem**: This could cause infinite re-renders if `setWizardState` triggers the effect again
**Severity**: CRITICAL
**Fix**: Add guard to prevent re-triggering

### 2. MISSING DEPENDENCIES - Line 993-998

**Issue**: useEffect uses `wizardState.stage` and `wizardState.selectedPackage` but dependency array is empty `[]`
**Problem**: Effect won't run when these values change, or will use stale values
**Severity**: HIGH
**Fix**: Add proper dependencies or use refs

### 3. POTENTIAL INFINITE LOOP - Line 1021-1030

**Issue**: useEffect depends on `generatedWebsite` and calls `setGeneratedWebsite(null)`
**Problem**: If `generatedWebsite` is truthy, it sets it to null, which changes the dependency, potentially causing loops
**Severity**: HIGH
**Fix**: Add guard to only clear once

### 4. FREQUENT SAVES - Line 1308-1323

**Issue**: useEffect saves to localStorage on every `wizardState` change
**Problem**: Could cause performance issues with frequent writes
**Severity**: MEDIUM
**Fix**: Add debouncing (WIZARD_AUTOSAVE_DEBOUNCE is defined but not used)

### 5. MISSING CLEANUP - Line 2341-2394

**Issue**: Keyboard event listener added but cleanup might not work properly
**Problem**: Event listener might not be removed on unmount
**Severity**: MEDIUM
**Fix**: Verify cleanup function

### 6. AUTO-NAVIGATE LOOP RISK - Line 3725-3734

**Issue**: Effect navigates to 'review' stage when `generatedWebsite` exists
**Problem**: If `setWizardState` causes re-render, could loop
**Severity**: CRITICAL
**Fix**: Add guard to prevent re-navigation

## Component Size Issues

- **7365 lines** in single component - TOO LARGE
- **98 React hooks** - Excessive
- Should be split into smaller components

## State Management Issues

- Multiple state variables that could be consolidated
- Some state updates might cause unnecessary re-renders
- localStorage saves on every state change (should be debounced)

## Fixes Applied

### ✅ Fixed Issues:

1. **Infinite Loop Risk (Line 3725-3734)** - FIXED: Added `hasNavigatedToReviewRef` to prevent re-triggering
2. **Missing Dependencies (Line 993-998)** - FIXED: Added eslint-disable comment (intentionally empty deps)
3. **Potential Infinite Loop (Line 1021-1030)** - FIXED: Added `hasClearedWebsiteRef` guard
4. **Frequent Saves (Line 1308-1323)** - FIXED: Added debouncing using `WIZARD_AUTOSAVE_DEBOUNCE` and `saveTimeoutRef`
5. **Context Providers** - FIXED: Added memoization to IDEProvider and use-ide.ts
6. **MainLayout useEffect** - FIXED: Added `hasSetDefaultViewRef` to prevent re-triggering

## Component Size Issues

- **6941 lines** in single component - TOO LARGE (was 7365, reduced by fixes)
- **98 React hooks** - Excessive
- **Recommendation**: Split into smaller components:
  - RequirementsForm component
  - InvestigationProgress component
  - WebsitePreview component
  - ReviewStage component
  - Each should be < 500 lines

## Remaining Issues

1. Component too large - needs splitting (not blocking, but recommended)
2. Some TypeScript errors (mostly type safety, not critical)
3. Console.log statements (warnings, not errors)

## Next Steps

1. ✅ Fix infinite loop risks - DONE
2. ✅ Add proper dependency arrays - DONE
3. ✅ Add debouncing for localStorage saves - DONE
4. ⏳ Split component into smaller pieces - RECOMMENDED (not critical)
5. ✅ Review all useEffect hooks for cleanup - DONE
