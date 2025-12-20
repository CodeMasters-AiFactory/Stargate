# Critical Flickering Fixes Applied

## 🚨 Issues Found and Fixed

### 1. InvestigationContext NOT Memoized ✅ FIXED

**Problem**: Context value recreated on every render → ALL consumers re-render → FLICKERING
**Fix**: Added `useMemo` to context value
**File**: `client/src/contexts/InvestigationContext.tsx`

### 2. ResearchStatusContext NOT Memoized ✅ FIXED

**Problem**: Context value recreated on every render → ALL consumers re-render → FLICKERING
**Fix**: Added `useMemo` to context value
**File**: `client/src/contexts/ResearchStatusContext.tsx`

### 3. TopNavbar Updates Every Second ✅ FIXED

**Problem**: `setInterval` updates state every 1 second → component re-renders every second
**Fix**: Changed to use `ref` and update DOM directly instead of state
**File**: `client/src/components/IDE/TopNavbar.tsx`

### 4. MainLayout Not Memoized ✅ FIXED

**Problem**: Large component re-renders on every parent update
**Fix**: Wrapped with `React.memo`
**File**: `client/src/components/IDE/MainLayout.tsx`

## 📊 Impact

These fixes should **significantly reduce** flickering by:

- Preventing context-triggered re-renders (InvestigationContext, ResearchStatusContext)
- Eliminating unnecessary TopNavbar re-renders (every second)
- Reducing MainLayout re-renders

## ⚠️ Remaining Issues (Lower Priority)

1. **WebsiteBuilderWizard** - 40+ state variables (consider splitting)
2. **No React.memo on other large components** (can add incrementally)
3. **Vite HMR** - May cause flickering during development (normal behavior)

## 🧪 Testing

After these fixes, the frontend should:

- ✅ Not flicker on every progress update
- ✅ Not flicker every second (TopNavbar)
- ✅ Have smoother rendering overall

If flickering persists, check:

1. Vite HMR in development mode (normal)
2. Browser DevTools → Performance tab for re-render frequency
3. React DevTools → Profiler for component re-renders
