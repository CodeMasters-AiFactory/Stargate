# ===========================================
# Build Script for Azure Deployment
# Stargate Portal
# ===========================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Stargate Portal - Azure Build" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Step 1: Clean previous builds
Write-Host "`nStep 1: Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "azure-package") { Remove-Item -Recurse -Force "azure-package" }

# Step 2: Install dependencies
Write-Host "`nStep 2: Installing dependencies..." -ForegroundColor Yellow
npm ci

# Step 3: Build the application
Write-Host "`nStep 3: Building application..." -ForegroundColor Yellow
npm run build

# Step 4: Create deployment package
Write-Host "`nStep 4: Creating deployment package..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "azure-package" | Out-Null

# Copy built files
Copy-Item -Recurse "dist" "azure-package/"
Copy-Item -Recurse "server" "azure-package/"
Copy-Item "package.json" "azure-package/"
Copy-Item "package-lock.json" "azure-package/"

# Copy web.config if exists
if (Test-Path "azure-deploy/web.config") {
    Copy-Item "azure-deploy/web.config" "azure-package/"
}

# Step 5: Install production dependencies only
Write-Host "`nStep 5: Installing production dependencies..." -ForegroundColor Yellow
Push-Location "azure-package"
npm ci --production
Pop-Location

# Step 6: Create ZIP file for deployment
Write-Host "`nStep 6: Creating deployment ZIP..." -ForegroundColor Yellow
$zipPath = "stargate-portal-azure.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }
Compress-Archive -Path "azure-package/*" -DestinationPath $zipPath

# Summary
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment package: $zipPath" -ForegroundColor Cyan
Write-Host "Package size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Azure Portal" -ForegroundColor White
Write-Host "2. Navigate to your App Service" -ForegroundColor White
Write-Host "3. Go to Deployment Center" -ForegroundColor White
Write-Host "4. Upload $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "Or use Azure CLI:" -ForegroundColor Yellow
Write-Host "az webapp deployment source config-zip --resource-group YOUR_RG --name YOUR_APP --src $zipPath" -ForegroundColor White
