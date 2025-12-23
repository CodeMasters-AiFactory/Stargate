# Deployment Guide

Deploy Stargate Portal to production environments.

## Deployment Options

| Platform | Best For | Cost |
|----------|----------|------|
| [Azure](/deployment/azure) | Enterprise, Microsoft stack | ~$26/month |
| [Docker](/deployment/docker) | Self-hosted, flexibility | Your infrastructure |
| [Local Dev](/deployment/local) | Development, testing | Free |

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ for building
- PostgreSQL database (production)
- API keys for AI services
- Domain name (optional)

## Quick Production Build

```bash
# Build the application
npm run build

# The built files are in:
# - /dist (server bundle)
# - /dist/public (client assets)
```

## Environment Variables

Required for production:

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/stargate

# Security (generate random strings)
SESSION_SECRET=your-64-char-random-string
ENCRYPTION_KEY=your-32-char-random-string

# AI Services
ANTHROPIC_API_KEY=your-key
LEONARDO_AI_API_KEY=your-key

# CORS
FRONTEND_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

## Health Check

All deployments expose a health endpoint:

```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 12345
}
```

## Production Checklist

Before going live, verify:

- [ ] SSL certificate configured
- [ ] Database backups enabled
- [ ] Environment variables set
- [ ] API keys valid and funded
- [ ] CDN configured for assets
- [ ] Monitoring enabled
- [ ] Error tracking set up
- [ ] Rate limiting configured
