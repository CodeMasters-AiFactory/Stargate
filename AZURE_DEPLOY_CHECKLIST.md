# Azure Deployment Checklist - Stargate Portal

## Pre-Deployment

- [ ] All API keys ready (OpenAI, Anthropic, Leonardo, etc.)
- [ ] Azure account with active subscription
- [ ] Domain name (optional, can use .azurewebsites.net)

## Step 1: Create Azure Resources (5 minutes)

### Via Azure Portal:

1. **Create Resource Group**
   - Name: `stargate-portal-rg`
   - Region: `East US` (or closest to your users)

2. **Create PostgreSQL Database**
   - Go to: Azure Database for PostgreSQL - Flexible Server
   - Name: `stargate-portal-db`
   - Compute: `Burstable B1ms` (~$13/month)
   - PostgreSQL version: `15`
   - Admin username: `stargateadmin`
   - Create database: `stargate_portal`

3. **Create App Service**
   - Name: `stargate-portal` (your-unique-name)
   - Runtime: `Node 20 LTS`
   - OS: `Linux`
   - Plan: `B1 Basic` (~$13/month) or `F1 Free` for testing

## Step 2: Configure Database Connection (2 minutes)

1. Go to PostgreSQL server → Connection strings
2. Copy the connection string
3. Format: `postgresql://stargateadmin:PASSWORD@stargate-portal-db.postgres.database.azure.com:5432/stargate_portal?sslmode=require`

## Step 3: Set Environment Variables (5 minutes)

Go to App Service → Configuration → Application settings

### Required (copy these):

```
NODE_ENV = production
PORT = 8080
DATABASE_URL = [your postgresql connection string]
SESSION_SECRET = [generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
ENCRYPTION_KEY = [generate: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"]
FRONTEND_URL = https://your-app-name.azurewebsites.net
ALLOWED_ORIGINS = https://your-app-name.azurewebsites.net
```

### AI Keys (add the ones you have):

```
OPENAI_API_KEY = sk-...
ANTHROPIC_API_KEY = sk-ant-...
GEMINI_API_KEY = ...
LEONARDO_AI_API_KEY = ...
UNSPLASH_ACCESS_KEY = ...
```

## Step 4: Deploy the Application (5 minutes)

### Option A: ZIP Deploy (Easiest)

1. Run in PowerShell:
   ```powershell
   cd "c:\CURSOR PROJECTS\StargatePortal"
   .\azure-deploy\build-for-azure.ps1
   ```

2. In Azure Portal:
   - App Service → Deployment Center → FTPS Credentials
   - Or use: `az webapp deployment source config-zip`

### Option B: GitHub Actions (Recommended for ongoing)

1. Push code to GitHub
2. In Azure Portal → App Service → Deployment Center
3. Select GitHub → Authorize → Select repo
4. Azure creates workflow automatically

## Step 5: Verify Deployment (2 minutes)

1. Go to: `https://your-app-name.azurewebsites.net`
2. Check: Homepage loads
3. Check: Can sign in
4. Check: API works: `https://your-app-name.azurewebsites.net/api/health`

## Troubleshooting

### View Logs
```bash
az webapp log tail --resource-group stargate-portal-rg --name stargate-portal
```

### Restart App
```bash
az webapp restart --resource-group stargate-portal-rg --name stargate-portal
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check NODE_ENV=production, PORT=8080 |
| Database error | Verify DATABASE_URL, check firewall rules |
| WebSocket fails | Enable: App Service → Configuration → Web sockets = On |
| Build fails | Check Node version is 20 |

## Cost Summary

| Resource | Monthly Cost |
|----------|-------------|
| App Service B1 | ~$13 |
| PostgreSQL B1ms | ~$13 |
| Storage 32GB | ~$2 |
| **Total** | **~$28/month** |

---

## Quick Start Commands

```bash
# Login to Azure
az login

# Deploy ZIP
az webapp deployment source config-zip \
  --resource-group stargate-portal-rg \
  --name stargate-portal \
  --src stargate-portal-azure.zip

# View logs
az webapp log tail -g stargate-portal-rg -n stargate-portal

# Restart
az webapp restart -g stargate-portal-rg -n stargate-portal
```

## Files Created for Deployment

- `azure-deploy/AZURE_SETUP_GUIDE.md` - Detailed setup guide
- `azure-deploy/web.config` - IIS configuration
- `azure-deploy/deploy.sh` - Deployment script
- `azure-deploy/build-for-azure.ps1` - Build script (Windows)
- `azure-deploy/.env.azure.template` - Environment variables template
- `.github/workflows/azure-deploy.yml` - GitHub Actions workflow
