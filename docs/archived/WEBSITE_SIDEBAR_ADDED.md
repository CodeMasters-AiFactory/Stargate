# Website Added to Sidebar ✅

## Summary
Added "WEBSITE" menu item to the sidebar so users can navigate to the Website page (without sidebar).

## Changes Made

### 1. Updated `Sidebar.tsx`
- **Location**: `client/src/components/IDE/Sidebar.tsx`
- **Change**: Added `{ id: 'website-page', icon: Globe, title: 'Website' }` to the Core group items
- **Result**: "Website" now appears in the Core section of the sidebar, right below "Home"

### 2. Updated `MainLayout.tsx`
- **Panel Change Handler**: Added navigation logic for `'website-page'` panel
- **Active Panel Mapping**: Added mapping so `'website-page'` view shows as active in sidebar

## How It Works

1. **Sidebar Display**: "Website" appears in the Core section (top of sidebar)
2. **Click Behavior**: Clicking "Website" sets `currentView` to `'website-page'`
3. **Sidebar Hides**: When viewing `'website-page'`, the sidebar automatically hides
4. **Full Width**: Website page displays full-width without sidebar, just like the home screen

## Visual Location

The sidebar now shows:
- **Core** (always visible)
  - 🏠 Home
  - 🌐 Website ← **NEW**

## Testing

The "Website" button should now be visible in the sidebar. Clicking it will:
1. Navigate to the Website page
2. Hide the sidebar
3. Show the full-width Website page (same content as Home but without sidebar)

