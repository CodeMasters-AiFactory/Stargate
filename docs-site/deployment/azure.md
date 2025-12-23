# Azure Deployment

Deploy Stargate Portal to Microsoft Azure.

## Overview

Recommended Azure setup:
- **Azure App Service** - Web hosting
- **Azure PostgreSQL** - Database
- **Azure Blob Storage** - Static assets
- **Azure CDN** - Content delivery

Estimated cost: ~$26/month (Basic tier)

## Prerequisites

- Azure account with active subscription
- Azure CLI installed
- Node.js 18+ locally

## Quick Deploy

### Step 1: Create Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name stargate-rg --location westeurope

# Create App Service plan
az appservice plan create \
  --name stargate-plan \
  --resource-group stargate-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name stargate-app \
  --resource-group stargate-rg \
  --plan stargate-plan \
  --runtime "NODE:18-lts"
```

### Step 2: Create Database

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --name stargate-db \
  --resource-group stargate-rg \
  --admin-user stargateadmin \
  --admin-password <YourSecurePassword> \
  --tier Burstable \
  --sku-name Standard_B1ms
```

### Step 3: Configure Environment

```bash
# Set environment variables
az webapp config appsettings set \
  --name stargate-app \
  --resource-group stargate-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="postgresql://stargateadmin:<password>@stargate-db.postgres.database.azure.com:5432/stargate?sslmode=require" \
    ANTHROPIC_API_KEY="<your-key>" \
    LEONARDO_AI_API_KEY="<your-key>" \
    SESSION_SECRET="<random-64-char-string>"
```

### Step 4: Deploy Code

```bash
# Build locally
npm run build

# Deploy via ZIP
az webapp deploy \
  --name stargate-app \
  --resource-group stargate-rg \
  --src-path dist.zip \
  --type zip
```

## GitHub Actions Deployment

Create `.github/workflows/azure.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install & Build
        run: |
          npm ci
          npm run build
          
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: stargate-app
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: .
```

## Configuration Files

### web.config

Create `azure/web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeJS">
          <match url=".*" />
          <action type="Rewrite" url="dist/index.js" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Custom Domain

### Add Custom Domain

```bash
az webapp config hostname add \
  --webapp-name stargate-app \
  --resource-group stargate-rg \
  --hostname www.yourdomain.com
```

### Enable HTTPS

```bash
az webapp config ssl bind \
  --name stargate-app \
  --resource-group stargate-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

## Scaling

### Scale Up (Bigger VM)

```bash
az appservice plan update \
  --name stargate-plan \
  --sku P1V2
```

### Scale Out (More Instances)

```bash
az webapp scale \
  --name stargate-app \
  --resource-group stargate-rg \
  --instance-count 3
```

## Monitoring

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app stargate-insights \
  --location westeurope \
  --resource-group stargate-rg
```

### View Logs

```bash
az webapp log tail \
  --name stargate-app \
  --resource-group stargate-rg
```

## Costs (Estimated)

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service | B1 | $13 |
| PostgreSQL | B1ms | $12 |
| Storage | LRS | $1 |
| **Total** | | **~$26** |
