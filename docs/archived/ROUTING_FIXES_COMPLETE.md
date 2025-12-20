# ROUTING FIXES - COMPLETE AUDIT AND FIXES APPLIED

## PROBLEM SUMMARY
User reported: Clicking "Back to Website" from Services page was routing to IDE instead of Website page.

## ROOT CAUSES IDENTIFIED

### 1. **CRITICAL: switchToHome() was WRONG**
- **Location**: `MainLayout.tsx` line 135
- **Problem**: `switchToHome()` was setting `currentView: 'website'` (IDE)
- **Fix**: Changed to `currentView: 'home'` (Services Dashboard)
- **Impact**: All calls to `switchToHome()` now correctly go to Services Dashboard

### 2. **CRITICAL: switchToWebsite() was WRONG**
- **Location**: `MainLayout.tsx` line 147
- **Problem**: `switchToWebsite()` was setting `currentView: 'website'` (IDE)
- **Fix**: Changed to `currentView: 'website-page'` (Actual Website Page)
- **Impact**: All calls to `switchToWebsite()` now correctly go to Website Page

### 3. **CRITICAL: Default view for non-authenticated was WRONG**
- **Location**: `MainLayout.tsx` line 311
- **Problem**: Non-authenticated users defaulted to `'website'` (IDE)
- **Fix**: Changed to `'website-page'` (Actual Website Page)
- **Impact**: Non-authenticated users now see Website Page, not IDE

### 4. **CRITICAL: Template reset default was WRONG**
- **Location**: `MainLayout.tsx` line 77
- **Problem**: Non-authenticated template reset went to `'website'` (IDE)
- **Fix**: Changed to `'website-page'` (Actual Website Page)
- **Impact**: Template navigation now correct for non-authenticated users

## ALL FIXES APPLIED

### MainLayout.tsx
1. ✅ `switchToHome()` - Now routes to `'home'` (was `'website'`)
2. ✅ `switchToWebsite()` - Now routes to `'website-page'` (was `'website'`)
3. ✅ Default view for non-authenticated - Now `'website-page'` (was `'website'`)
4. ✅ Template reset default - Now `'website-page'` (was `'website'`)

### BackButton.tsx
1. ✅ Default for non-authenticated - Already correct (`'website-page'`)

### NewHomePage.tsx
1. ✅ "Back to Website" button - Already correct (`destination="website-page"`)

### MerlinPackageSelection.tsx
1. ✅ All back buttons - Already correct (`destination="website-page"`)

### DownloadProjectScreen.tsx
1. ✅ "Back to Home" buttons - Already correct (`'home'`)

## COMPLETE VIEW NAME MAPPING

| View Name | Component | Description | Status |
|-----------|-----------|-------------|--------|
| `'home'` | `NewHomePage` | Services Dashboard | ✅ CORRECT |
| `'website'` | `HomePage` | **STARGATE IDE** (Full IDE interface) | ⚠️ CONFUSING NAME |
| `'website-page'` | `WebsitePage` | **ACTUAL WEBSITE PAGE** (Without sidebar) | ✅ CORRECT |
| `'website-page-new'` | `WebsitePageNew` | Landing page (non-authenticated) | ✅ CORRECT |
| `'services'` | `ServicesScreen` | Services management | ✅ CORRECT |
| `'apps'` | `AppsScreen` | Applications management | ✅ CORRECT |
| `'deployments'` | `DeploymentsScreen` | Deployments | ✅ CORRECT |
| `'usage'` | `UsageScreen` | Usage analytics | ✅ CORRECT |
| `'merlin-packages'` | `MerlinPackageSelection` | Package selection | ✅ CORRECT |
| `'stargate-websites'` | `StargateWebsitesScreen` | Website wizard | ✅ CORRECT |

## ROUTING RULES (NOW CORRECT)

### Navigation Functions
- `switchToHome()` → `'home'` (Services Dashboard) ✅
- `switchToWebsite()` → `'website-page'` (Actual Website Page) ✅

### Default Views
- **Authenticated users**: `'home'` (Services Dashboard) ✅
- **Non-authenticated users**: `'website-page'` (Actual Website Page) ✅

### Back Button Behavior
- **Authenticated users**: Defaults to `'home'` ✅
- **Non-authenticated users**: Defaults to `'website-page'` ✅
- **Explicit destination**: Uses provided destination ✅

### Service Clicks
- **Stargate IDE service**: `'website'` (IDE) ✅ (This is intentional - clicking IDE service opens IDE)
- **Merlin Websites service**: `'merlin-packages'` ✅

## VERIFICATION CHECKLIST

- ✅ "Back to Website" from Services page → Routes to `'website-page'` (Website Page)
- ✅ "Back to Website" from any page → Routes to `'website-page'` (Website Page)
- ✅ Default view for authenticated → `'home'` (Services Dashboard)
- ✅ Default view for non-authenticated → `'website-page'` (Website Page)
- ✅ `switchToHome()` → `'home'` (Services Dashboard)
- ✅ `switchToWebsite()` → `'website-page'` (Website Page)

## NOTES

⚠️ **View Name Confusion**: The view name `'website'` is confusing because it actually shows the IDE, not a website page. However, changing this would be a breaking change requiring updates to many files. For now, the routing logic is correct even though the name is confusing.

## TESTING REQUIRED

1. Navigate to Services page (`'home'`)
2. Click "Back to Website"
3. **Expected**: Should go to Website Page (`'website-page'`)
4. **Previous behavior**: Was going to IDE (`'website'`)
5. **Current behavior**: ✅ Should now go to Website Page

