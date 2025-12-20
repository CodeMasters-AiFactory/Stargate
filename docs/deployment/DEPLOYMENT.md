# Deployment Guide - Stargate Portal

## Overview

This project has TWO server configurations:

1. **Development Server** (`server/index.ts`) - Full-featured with all services
2. **Production Server** (`server/index-production.ts`) - Minimal, reliable, fast startup

## Why Two Servers?

The full-featured development server loads 61 route modules, 10+ middleware layers, schedulers, and WebSocket servers. This complexity causes daily startup failures.

The production server includes ONLY core functionality needed for Azure deployment:
- Health checks
- Website builder core
- Essential middleware (CORS, JSON parsing)
- Static file serving
- No Vite, no schedulers, no WebSocket servers

## Local Development

Use the full-featured server with all capabilities:

```bash
npm run dev
```

This starts `server/index.ts` with:
- Vite HMR (Hot Module Replacement)
- All route modules
- WebSocket servers (collaboration, live preview)
- Debug logging
- All advanced features

## Production Deployment (Azure)

### Option 1: Quick Test (Development Mode)

Test the production server locally without building:

```bash
npm run start:production
```

This runs `server/index-production.ts` directly with tsx. Good for testing before Azure deployment.

### Option 2: Full Build (Production Mode)

Build and deploy to Azure:

```bash
# Build frontend and production server
npm run build:production

# On Azure, start with:
node dist/index-production.js
```

## Required Environment Variables

### Core (Required for both Dev and Production)

```env
NODE_ENV=production
PORT=5000

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Image Generation (Unsplash)
UNSPLASH_ACCESS_KEY=your_key_here
UNSPLASH_SECRET_KEY=your_key_here

# Leonardo AI (for image generation)
LEONARDO_AI_API_KEY=your_key_here

# Google Search (for research)
GOOGLE_SEARCH_API_KEY=your_key_here
GOOGLE_SEARCH_ENGINE_ID=your_id_here
```

### Optional (Development Only)

These are NOT needed for production server:

- Session secrets (session middleware disabled in production)
- WebSocket configuration (not used in production)
- Analytics keys (not included in minimal server)

## Azure App Service Setup

### 1. Create App Service

```bash
# Using Azure CLI
az webapp create \
  --resource-group YourResourceGroup \
  --plan YourAppServicePlan \
  --name stargate-portal \
  --runtime "NODE:20-lts"
```

### 2. Configure Environment Variables

In Azure Portal → App Service → Configuration → Application Settings, add all required environment variables listed above.

### 3. Set Startup Command

In Azure Portal → App Service → Configuration → General Settings:

**Startup Command:**
```
node dist/index-production.js
```

### 4. Deploy

#### Option A: GitHub Actions (Recommended)

Create `.github/workflows/azure-deploy.yml`:

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
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build production
        run: npm run build:production

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: stargate-portal
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

#### Option B: Manual Deployment

```bash
# Build locally
npm run build:production

# Deploy via Azure CLI
az webapp deployment source config-zip \
  --resource-group YourResourceGroup \
  --name stargate-portal \
  --src ./deploy.zip
```

### 5. Verify Deployment

After deployment, check:

1. **Health Endpoint:**
   ```bash
   curl https://stargate-portal.azurewebsites.net/api/health
   ```

2. **Test Endpoint:**
   ```bash
   curl https://stargate-portal.azurewebsites.net/test
   ```

3. **Frontend:**
   ```
   https://stargate-portal.azurewebsites.net
   ```

## Startup Performance

### Development Server (`npm run dev`)
- Loads: 61 route modules
- Startup time: 10-30 seconds
- Memory: ~200MB+
- Issues: Daily startup failures due to complexity

### Production Server (`npm run start:production`)
- Loads: 3 core route modules
- Startup time: <5 seconds
- Memory: ~100MB
- Issues: None - minimal and reliable

## Troubleshooting

### Server Won't Start

1. Check environment variables are set
2. Verify Node.js version (20+)
3. Check logs: `az webapp log tail --name stargate-portal --resource-group YourResourceGroup`

### Frontend Not Loading

1. Verify build completed: Check `dist/` folder exists
2. Check static file serving: `curl https://your-app.azurewebsites.net/`
3. Check browser console for errors

### API Routes Not Working

1. Test health endpoint: `/api/health`
2. Check environment variables (API keys)
3. Review application logs in Azure Portal

### Database Connection Errors

1. Verify `DATABASE_URL` is set correctly
2. Check Azure PostgreSQL firewall allows Azure services
3. Test connection: Use health endpoint's detailed mode

## Files Overview

### Production Server Files
- `server/index-production.ts` - Minimal production server
- `dist/index-production.js` - Built production server (after build)
- `dist/` - Built frontend static files

### Development Server Files (NOT deployed)
- `server/index.ts` - Full-featured development server
- `server/routes.ts` - All route registrations (61 modules)
- All service files - Kept for development use only

## Maintenance

### Adding New Core Routes

If you need to add routes to production:

1. Edit `server/index-production.ts`
2. Import and register the route
3. Rebuild: `npm run build:production`
4. Redeploy to Azure

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update
npm update

# Rebuild production
npm run build:production
```

### Monitoring

Set up Azure Monitor alerts for:
- HTTP 5xx errors
- Response time > 5s
- Memory usage > 80%
- CPU usage > 80%

## Costs (Azure)

Recommended App Service Plan:
- **Basic B1**: ~$13/month (good for testing)
- **Standard S1**: ~$70/month (production ready)
- **Premium P1v2**: ~$150/month (high traffic)

## Rollback Plan

If production server has issues:

1. Switch back to full server:
   ```bash
   # Change startup command to:
   node dist/index.js

   # And rebuild with:
   npm run build
   ```

2. Or revert to previous deployment in Azure Portal → Deployment Center → Deployment History

## Support

For issues:
1. Check Azure Application Insights logs
2. Review server logs: `az webapp log tail`
3. Test locally first: `npm run start:production`
4. Compare with dev server: `npm run dev`
