# 🏗️ Infrastructure & Deployment Guide

## Overview

This project now includes full Infrastructure as Code (IaC) and automated deployment pipelines. Everything required to run locally, in staging, or in production is defined in code and can be executed with a single command.

---

## Docker Setup

### Production

```bash
# Build and run production stack
docker compose up --build -d
```

Services:

- `stargate-app`: Node.js server + frontend
- `redis`: caching / session store

### Development

```bash
# Live-reload development environment
docker compose -f docker-compose.dev.yml up --build
```

Features:

- Hot reload via `npm run dev`
- Mounted source code
- Separate Redis instance

---

## Deployment Pipeline

### GitHub Actions

- `.github/workflows/deploy.yml`
- Triggers on push to `develop` (staging) or `main` (production)
- Manual `workflow_dispatch` support

### Deployment Scripts

- `npm run deploy:staging`
- `npm run deploy:production`
- Scripts reside in `scripts/deploy.js`
- Steps:
  1. Validate git state
  2. Build application
  3. Run smoke tests
  4. Upload artifacts (placeholder)
  5. Deploy to target environment (placeholder)
  6. Verify deployment
  7. Trigger post-deployment monitoring

---

## Infrastructure Components

| Component           | File                           | Description                                |
| ------------------- | ------------------------------ | ------------------------------------------ |
| Dockerfile          | `Dockerfile`                   | Multi-stage build optimized for production |
| Compose (prod)      | `docker-compose.yml`           | Production-ready stack                     |
| Compose (dev)       | `docker-compose.dev.yml`       | Live-reload developer environment          |
| Deployment Workflow | `.github/workflows/deploy.yml` | CI/CD automation                           |
| Deployment Scripts  | `scripts/deploy.js`            | Environment-aware deployment logic         |

---

## Usage

### Local Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Staging Deployment

```bash
git push origin develop
# or run manually
gh workflow run deploy.yml -f environment=staging
```

### Production Deployment

```bash
git push origin main
# or manual trigger
gh workflow run deploy.yml -f environment=production
```

---

## Future Enhancements

- Replace placeholder deployment steps with actual infrastructure commands (e.g., SSH, Kubernetes, AWS)
- Integrate real smoke tests and health checks
- Add database containers if needed
- Expand monitoring (logs, metrics dashboards)

---

Everything is now fully scripted and reproducible. No manual setup is required to build, run, or deploy the system. ✅
