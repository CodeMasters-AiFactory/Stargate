# Page Naming Scheme - No Confusion Allowed!

## Component Names (Files)

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `HomePage` | `StargateIDEPage` | Full IDE interface with code editor, file explorer, etc. |
| `NewHomePage` | `ServicesDashboard` | Services dashboard for authenticated users |
| `WebsitePage` | `ProjectCreationPage` | Project creation interface (similar to IDE but simpler) |
| `WebsitePageNew` | `MarketingLandingPage` | Marketing/landing page with hero, services, pricing |

## View Names (currentView state)

| Old View Name | New View Name | Component Rendered |
|---------------|---------------|-------------------|
| `'website'` | `'ide'` | `StargateIDEPage` - Full IDE |
| `'home'` | `'dashboard'` | `ServicesDashboard` - Services Dashboard |
| `'website-page'` | `'landing'` | `MarketingLandingPage` - Marketing Website |
| N/A | `'project-creation'` | `ProjectCreationPage` - Create Projects |

## Navigation Functions

| Old Function | New Function | Navigates To |
|-------------|--------------|--------------|
| `switchToHome()` | `switchToDashboard()` | `'dashboard'` |
| `switchToWebsite()` | `switchToLanding()` | `'landing'` |
| N/A | `switchToIDE()` | `'ide'` |

## Default Views

- **Authenticated users**: Default to `'dashboard'` (Services Dashboard)
- **Non-authenticated users**: Default to `'landing'` (Marketing Landing Page)

## BackButton Defaults

- **Authenticated users**: Default destination is `'dashboard'`
- **Non-authenticated users**: Default destination is `'landing'`

## Key Rules

1. **NO MORE CONFUSION**: Each name is unique and descriptive
2. **'ide'** = Stargate IDE (code editor, file explorer, full IDE)
3. **'dashboard'** = Services Dashboard (main dashboard)
4. **'landing'** = Marketing Landing Page (public website)
5. **'project-creation'** = Project Creation Page (create projects)

## Legacy Support

For backward compatibility, the following legacy view names are still supported but map to new names:
- `'home'` → `'dashboard'`
- `'website'` → `'landing'`
- `'website-page'` → `'landing'`

These are handled in `MainLayout.tsx` `onPanelChange` handler.

