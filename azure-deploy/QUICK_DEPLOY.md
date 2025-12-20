# Quick Azure Deployment Guide

Since the dev server is running and locking files, follow these steps:

## Option 1: Deploy via Azure Portal (Recommended)

### Step 1: Go to Azure Portal
1. Open: https://portal.azure.com
2. Sign in with your Azure account

### Step 2: Create App Service
1. Click "+ Create a resource"
2. Search "Web App"
3. Click "Create"

Fill in:
- **Subscription**: Your subscription
- **Resource Group**: Create new → `stargate-portal-rg`
- **Name**: `stargate-portal` (must be unique)
- **Publish**: Code
- **Runtime stack**: Node 20 LTS
- **Operating System**: Linux
- **Region**: East US (or closest to you)
- **Pricing plan**: B1 Basic (~$13/month)

Click "Review + create" → "Create"

### Step 3: Create PostgreSQL Database
1. Click "+ Create a resource"
2. Search "Azure Database for PostgreSQL"
3. Select "Flexible server" → "Create"

Fill in:
- **Resource Group**: `stargate-portal-rg`
- **Server name**: `stargate-portal-db`
- **Region**: Same as App Service
- **PostgreSQL version**: 15
- **Workload type**: Development (cheapest)
- **Compute + storage**: Click "Configure server"
  - Select: Burstable, B1ms (~$13/month)
- **Admin username**: `stargateadmin`
- **Password**: Create strong password (save it!)

Click "Review + create" → "Create"

### Step 4: Configure Database Firewall
1. Go to your PostgreSQL server
2. Settings → Networking
3. Check "Allow public access from any Azure service"
4. Click "Save"

### Step 5: Get Database Connection String
1. Go to PostgreSQL server → Connect
2. Copy connection string, it looks like:
```
postgresql://stargateadmin:PASSWORD@stargate-portal-db.postgres.database.azure.com:5432/postgres?sslmode=require
```
3. Change `postgres` at the end to `stargate_portal`

### Step 6: Set App Service Environment Variables
1. Go to App Service → Configuration
2. Click "+ New application setting" for each:

| Name | Value |
|------|-------|
| NODE_ENV | production |
| PORT | 8080 |
| DATABASE_URL | [your connection string from step 5] |
| SESSION_SECRET | [generate random 64 chars] |
| ENCRYPTION_KEY | [generate random 32 chars] |
| OPENAI_API_KEY | [your key] |
| ANTHROPIC_API_KEY | [your key] |
| LEONARDO_AI_API_KEY | [your key] |
| FRONTEND_URL | https://stargate-portal.azurewebsites.net |
| ALLOWED_ORIGINS | https://stargate-portal.azurewebsites.net |

3. Click "Save" at the top

### Step 7: Deploy Code via GitHub
1. Push your code to GitHub (if not already)
2. Go to App Service → Deployment Center
3. Source: GitHub
4. Authorize GitHub access
5. Select your repository
6. Branch: main (or master)
7. Click "Save"

Azure will automatically build and deploy!

### Step 8: Verify Deployment
1. Go to App Service → Overview
2. Click the URL (https://stargate-portal.azurewebsites.net)
3. Wait 2-3 minutes for first startup
4. Test: Sign in, create a project

---

## Generate Secure Keys

Open PowerShell and run:

```powershell
# Generate SESSION_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## Troubleshooting

### View Logs
App Service → Log stream

### Restart App
App Service → Overview → Restart

### Check Health
Visit: https://your-app.azurewebsites.net/api/health

---

## Monthly Cost
- App Service B1: ~$13
- PostgreSQL B1ms: ~$13
- **Total: ~$26/month**
