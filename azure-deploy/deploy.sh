#!/bin/bash

# ===========================================
# Azure App Service Deployment Script
# Stargate Portal
# ===========================================

echo "=========================================="
echo "Stargate Portal - Azure Deployment"
echo "=========================================="

# Exit on error
set -e

# Navigate to deployment source
cd "$DEPLOYMENT_SOURCE"

echo "Step 1: Installing dependencies..."
npm ci --production=false

echo "Step 2: Building application..."
npm run build

echo "Step 3: Copying files to deployment target..."
mkdir -p "$DEPLOYMENT_TARGET"

# Copy built files
cp -r dist "$DEPLOYMENT_TARGET/"
cp -r node_modules "$DEPLOYMENT_TARGET/"
cp package.json "$DEPLOYMENT_TARGET/"
cp package-lock.json "$DEPLOYMENT_TARGET/"

# Copy server files (needed for runtime)
cp -r server "$DEPLOYMENT_TARGET/"

# Copy web.config for IIS
if [ -f "azure-deploy/web.config" ]; then
  cp azure-deploy/web.config "$DEPLOYMENT_TARGET/"
fi

echo "Step 4: Deployment complete!"
echo "=========================================="
