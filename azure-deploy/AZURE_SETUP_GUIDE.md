# Azure Deployment Guide - Stargate Portal

## Prerequisites

1. Azure Account with active subscription
2. Azure CLI installed (`az` command)
3. Node.js 20+ installed locally

## Step 1: Create Azure Resources

### Option A: Using Azure Portal (GUI)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a **Resource Group**: `stargate-portal-rg`
3. Create **Azure Database for PostgreSQL - Flexible Server**:
   - Server name: `stargate-portal-db`
   - Compute: Burstable B1ms (cheapest, ~$13/month)
   - Storage: 32GB
   - Create database: `stargate_portal`
4. Create **App Service**:
   - Name: `stargate-portal` (or your custom name)
   - Runtime: Node 20 LTS
   - Region: Same as database
   - Plan: B1 Basic (~$13/month) or F1 Free for testing

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="stargate-portal-rg"
LOCATION="eastus"
APP_NAME="stargate-portal"
DB_SERVER="stargate-portal-db"
DB_NAME="stargate_portal"
DB_ADMIN="stargateadmin"
DB_PASSWORD="YourSecurePassword123!"

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user $DB_ADMIN \
  --admin-password $DB_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15

# Create Database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $DB_SERVER \
  --database-name $DB_NAME

# Create App Service Plan
az appservice plan create \
  --name "${APP_NAME}-plan" \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan "${APP_NAME}-plan" \
  --name $APP_NAME \
  --runtime "NODE:20-lts"

# Enable WebSockets
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --web-sockets-enabled true
```

## Step 2: Configure Environment Variables

In Azure Portal → App Service → Configuration → Application settings:

### Required Variables

| Name | Value | Description |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `8080` | Azure default port |
| `DATABASE_URL` | `postgresql://user:pass@server.postgres.database.azure.com:5432/stargate_portal?sslmode=require` | Get from Azure DB |
| `SESSION_SECRET` | `[generate 64 char random string]` | For session encryption |
| `ENCRYPTION_KEY` | `[generate 32 char random string]` | For data encryption |

### AI API Keys (Add the ones you have)

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `GEMINI_API_KEY` | `...` |
| `LEONARDO_AI_API_KEY` | `...` |
| `REPLICATE_API_TOKEN` | `r8_...` |

### Optional Services

| Name | Value |
|------|-------|
| `UNSPLASH_ACCESS_KEY` | For stock images |
| `STRIPE_SECRET_KEY` | For payments |
| `SENDGRID_API_KEY` | For emails |

### Generate Secure Keys

```bash
# Generate SESSION_SECRET (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Step 3: Get Database Connection String

1. In Azure Portal → PostgreSQL Server → Connection strings
2. Copy the connection string
3. Replace `{your_password}` with actual password
4. Add `?sslmode=require` at the end

Format:
```
postgresql://stargateadmin:YourPassword@stargate-portal-db.postgres.database.azure.com:5432/stargate_portal?sslmode=require
```

## Step 4: Deploy the Application

### Option A: GitHub Actions (Recommended)

1. In Azure Portal → App Service → Deployment Center
2. Select GitHub as source
3. Authorize and select your repository
4. Azure will create a workflow file automatically

### Option B: Azure CLI Deployment

```bash
# Build locally first
npm run build

# Create deployment package
zip -r deploy.zip dist node_modules package.json server azure-deploy/web.config

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group stargate-portal-rg \
  --name stargate-portal \
  --src deploy.zip
```

### Option C: VS Code Azure Extension

1. Install "Azure App Service" extension
2. Sign in to Azure
3. Right-click your App Service → Deploy to Web App
4. Select the project folder

## Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# SSH into the App Service
az webapp ssh --resource-group stargate-portal-rg --name stargate-portal

# Run migrations
npm run db:push
```

Or set up automatic migration in your startup:

```json
// package.json
"scripts": {
  "start": "npm run db:push && node dist/index.js"
}
```

## Step 6: Configure Custom Domain (Optional)

1. Azure Portal → App Service → Custom domains
2. Add your domain (e.g., `portal.yourcompany.com`)
3. Configure DNS:
   - CNAME: `portal` → `stargate-portal.azurewebsites.net`
4. Add SSL certificate (free with Azure)

## Step 7: Enable Application Insights (Recommended)

1. Azure Portal → App Service → Application Insights
2. Enable and create new resource
3. This gives you:
   - Error tracking
   - Performance monitoring
   - Usage analytics

## Troubleshooting

### View Logs
```bash
az webapp log tail --resource-group stargate-portal-rg --name stargate-portal
```

### Restart App
```bash
az webapp restart --resource-group stargate-portal-rg --name stargate-portal
```

### Check App Status
```bash
az webapp show --resource-group stargate-portal-rg --name stargate-portal --query state
```

### Common Issues

1. **502 Bad Gateway**: Check NODE_ENV and PORT settings
2. **Database connection failed**: Verify DATABASE_URL and firewall rules
3. **WebSocket not working**: Ensure web-sockets-enabled is true
4. **Build fails**: Check Node version matches (20 LTS)

## Cost Estimation

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| App Service | B1 Basic | ~$13 |
| PostgreSQL | B1ms Burstable | ~$13 |
| Storage | 32GB | ~$2 |
| **Total** | | **~$28/month** |

Free tier alternatives:
- App Service F1: Free (limited)
- Azure for Students: $100 credit

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS only (Settings → TLS/SSL)
- [ ] Set up firewall rules for PostgreSQL
- [ ] Enable Azure AD authentication (optional)
- [ ] Set up backup for database
- [ ] Enable DDoS protection (optional)
