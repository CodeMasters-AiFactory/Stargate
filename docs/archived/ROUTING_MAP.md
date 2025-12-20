# Routing Map - View Names to Pages

## CRITICAL ROUTING MAPPING

| View Name | Component | Description |
|-----------|-----------|-------------|
| `'home'` | `NewHomePage` | Services Dashboard (main authenticated home) |
| `'website'` | `HomePage` | **Stargate IDE** (Full IDE interface with project creation) |
| `'website-page'` | `WebsitePage` | **Actual Website Page** (Similar to Home but without sidebar) |
| `'website-page-new'` | `WebsitePageNew` | Landing page for non-authenticated users |
| `'services'` | `ServicesScreen` | Services management screen |
| `'apps'` | `AppsScreen` | Applications management |
| `'deployments'` | `DeploymentsScreen` | Deployments screen |
| `'usage'` | `UsageScreen` | Usage analytics |
| `'merlin-packages'` | `MerlinPackageSelection` | Package selection for Merlin wizard |
| `'stargate-websites'` | `StargateWebsitesScreen` | Website wizard |
| `'website-analysis'` | `WebsiteAnalysis` | Website analysis |
| `'website-debugger'` | `WebsiteGenerationDebugger` | Website generation debugger |

## IMPORTANT NOTES

- **`'website'` = IDE** (NOT the website page!)
- **`'website-page'` = Actual Website Page** (what users expect when clicking "Back to Website")
- When routing to "website", use `'website-page'` NOT `'website'`
- When routing to IDE, use `'website'` NOT `'website-page'`

