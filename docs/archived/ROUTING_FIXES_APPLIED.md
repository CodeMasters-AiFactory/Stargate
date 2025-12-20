# Routing Fixes Applied

## Problem
"Back to Website" was routing to `'website'` which shows the IDE (`HomePage`), not the actual website page.

## Root Cause
- `'website'` = Shows IDE (`HomePage`) 
- `'website-page'` = Shows actual website page (`WebsitePage`)
- Routing was using wrong view name

## Fixes Applied

### 1. BackButton Component
- **File**: `client/src/components/IDE/BackButton.tsx`
- **Change**: Default destination for non-authenticated users changed from `'website'` to `'website-page'`
- **Impact**: All BackButton instances now route correctly

### 2. NewHomePage
- **File**: `client/src/components/IDE/NewHomePage.tsx`
- **Change**: "Back to Website" button destination changed from `'website'` to `'website-page'`
- **Line**: 224

### 3. MerlinPackageSelection
- **File**: `client/src/components/IDE/MerlinPackageSelection.tsx`
- **Changes**:
  - BackButton destination changed from `'website'` to `'website-page'` (line 1470)
  - `handleBack()` function changed from `'website'` to `'website-page'` (line 416)
  - Hidden "Back to Home" button changed to "Back to Website" and routes to `'website-page'` (line 1473)

### 4. DownloadProjectScreen
- **File**: `client/src/components/IDE/DownloadProjectScreen.tsx`
- **Changes**:
  - "Back to Home" button changed from `'website'` to `'home'` (line 148)
  - "Cancel" button changed from `'website'` to `'home'` (line 329)

## Correct Routing Map

| View Name | Component | When to Use |
|-----------|-----------|-------------|
| `'home'` | `NewHomePage` | Services Dashboard - main authenticated home |
| `'website'` | `HomePage` | **Stargate IDE** - Full IDE interface |
| `'website-page'` | `WebsitePage` | **Actual Website Page** - Use for "Back to Website" |
| `'website-page-new'` | `WebsitePageNew` | Landing page for non-authenticated users |

## Verification Checklist
- ✅ "Back to Website" now routes to `'website-page'` (actual website page)
- ✅ "Back to Home" routes to `'home'` (services dashboard)
- ✅ Stargate IDE service click routes to `'website'` (IDE) - correct
- ✅ Default BackButton for non-authenticated routes to `'website-page'`

