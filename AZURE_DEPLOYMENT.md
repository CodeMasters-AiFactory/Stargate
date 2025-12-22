# Azure Deployment Status & Instructions

## Current Problem

Azure deployment fails with `HRESULT: 0x2` (file not found) - **iisnode cannot find node.exe** on the Windows App Service.

The app `stargate-portal` in resource group `stargate-rg` returns 500 errors.

## What's Been Tried

1. Multiple web.config configurations (iisnode, httpPlatformHandler)
2. Setting `WEBSITE_NODE_DEFAULT_VERSION` to `~20`
3. Various node.exe paths (`D:\Program Files\nodejs\`, `D:\Program Files (x86)\nodejs\20.18.0\`, etc.)
4. Both iisnode and httpPlatformHandler approaches
5. Minimal CommonJS server with no external dependencies

## Root Cause (Likely)

The App Service may not have Node.js runtime properly configured in Azure Portal, or it was created without a Node.js stack selected.

## What To Do

### Option 1: Fix in Azure Portal
1. Go to Azure Portal → App Services → `stargate-portal`
2. Go to Configuration → General Settings
3. Verify "Stack" is set to **Node.js 20**
4. If not, change it and save
5. Restart the app

### Option 2: Delete and Recreate App Service
```bash
# Delete existing app
az webapp delete --name stargate-portal --resource-group stargate-rg

# Create new app with Node.js stack
az webapp create \
  --name stargate-portal \
  --resource-group stargate-rg \
  --plan stargate-plan \
  --runtime "NODE:20-lts"
```

### Option 3: Switch to Linux App Service (Simpler)
Linux App Service has simpler Node.js deployment:
```bash
# Create Linux app service plan
az appservice plan create \
  --name stargate-linux-plan \
  --resource-group stargate-rg \
  --is-linux \
  --sku B1

# Create Linux web app
az webapp create \
  --name stargate-portal-linux \
  --resource-group stargate-rg \
  --plan stargate-linux-plan \
  --runtime "NODE:20-lts"
```

Then update `.github/workflows/azure-deploy.yml` to target the Linux app.

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/azure-deploy.yml` | GitHub Actions deployment workflow |
| `server/azure-minimal.js` | Minimal CommonJS server (no dependencies) |
| `azure/web.config` | IIS/iisnode configuration |

## Azure Resources

| Resource | Details |
|----------|---------|
| Resource Group | `stargate-rg` |
| App Service | `stargate-portal` (Windows, currently broken) |
| PostgreSQL | `stargateportaldb.postgres.database.azure.com` (working) |
| GitHub Secret | `AZURE_CREDENTIALS` (configured) |

## Database Connection

```
postgresql://stargateadmin:Diamond2024Star!@stargateportaldb.postgres.database.azure.com:5432/postgres?sslmode=require
```

## Deployment Workflow Summary

The current workflow (`.github/workflows/azure-deploy.yml`):
1. Builds frontend with Vite
2. Copies `server/azure-minimal.js` as `server.js`
3. Copies `azure/web.config`
4. Creates minimal `package.json`
5. Zips everything (no node_modules needed)
6. Deploys to Azure via `azure/webapps-deploy@v3`

## Error Details

When visiting https://stargate-portal.azurewebsites.net/:

```
iisnode encountered an error when processing the request.

HRESULT: 0x2
HTTP status: 500
HTTP subStatus: 1001
HTTP reason: Internal Server Error

The node.exe process has not written any information to stderr...
```

This means IIS is running, iisnode is installed, but **node.exe is not found**.

## Security Scan Workflow

The security scan workflow (`.github/workflows/security-scan.yml`) was also fixed:
- Changed `npm ci` to `npm install` (no package-lock.json in repo)
- Added `if-no-files-found: warn` for artifact upload

## Next Steps

1. **Verify Node.js is configured** in Azure Portal for the App Service
2. If not configurable, **recreate the App Service** with Node.js runtime
3. Or **switch to Linux** for simpler deployment
4. Once working, can upgrade from minimal server to full Express server
