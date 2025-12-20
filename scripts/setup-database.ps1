# Database Setup Script for StargatePortal
# This script helps you set up the database connection

Write-Host "🗄️  StargatePortal Database Setup" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is already set
if ($env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL is already set!" -ForegroundColor Green
    Write-Host "   Current value: $($env:DATABASE_URL.Substring(0, [Math]::Min(50, $env:DATABASE_URL.Length)))..." -ForegroundColor Gray
    Write-Host ""
    $useExisting = Read-Host "Do you want to use this connection? (Y/n)"
    if ($useExisting -eq 'n' -or $useExisting -eq 'N') {
        $env:DATABASE_URL = $null
    } else {
        Write-Host ""
        Write-Host "✅ Using existing DATABASE_URL" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Run migrations: npm run db:push" -ForegroundColor White
        Write-Host "2. Create admin user: npx tsx server/scripts/create-admin.ts" -ForegroundColor White
        exit 0
    }
}

Write-Host "Choose your database option:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Neon PostgreSQL (Cloud - Recommended)" -ForegroundColor Cyan
Write-Host "2. Local PostgreSQL" -ForegroundColor Cyan
Write-Host "3. Skip setup (use in-memory storage)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📝 Neon PostgreSQL Setup" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Go to https://neon.tech and sign up (free tier available)" -ForegroundColor White
        Write-Host "2. Create a new project" -ForegroundColor White
        Write-Host "3. Copy your connection string" -ForegroundColor White
        Write-Host ""
        $connectionString = Read-Host "Paste your Neon connection string here"
        
        if ($connectionString) {
            $env:DATABASE_URL = $connectionString
            Write-Host ""
            Write-Host "✅ DATABASE_URL set!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. Run migrations: npm run db:push" -ForegroundColor White
            Write-Host "2. Create admin user: npx tsx server/scripts/create-admin.ts" -ForegroundColor White
            Write-Host ""
            Write-Host "💡 To make this permanent, add to .env file:" -ForegroundColor Cyan
            Write-Host "   DATABASE_URL=$connectionString" -ForegroundColor Gray
        }
    }
    "2" {
        Write-Host ""
        Write-Host "📝 Local PostgreSQL Setup" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Make sure PostgreSQL is installed and running!" -ForegroundColor Yellow
        Write-Host ""
        $dbUser = Read-Host "PostgreSQL username (default: postgres)" 
        if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
        
        $dbPassword = Read-Host "PostgreSQL password" -AsSecureString
        $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
        )
        
        $dbName = Read-Host "Database name (default: stargate)"
        if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "stargate" }
        
        $dbHost = Read-Host "Host (default: localhost)"
        if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
        
        $dbPort = Read-Host "Port (default: 5432)"
        if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
        
        $connectionString = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}"
        $env:DATABASE_URL = $connectionString
        
        Write-Host ""
        Write-Host "✅ DATABASE_URL set!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Make sure the database '$dbName' exists!" -ForegroundColor Yellow
        Write-Host "   Run this in psql: CREATE DATABASE $dbName;" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Create database (if not exists): CREATE DATABASE $dbName;" -ForegroundColor White
        Write-Host "2. Run migrations: npm run db:push" -ForegroundColor White
        Write-Host "3. Create admin user: npx tsx server/scripts/create-admin.ts" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 To make this permanent, add to .env file:" -ForegroundColor Cyan
        Write-Host "   DATABASE_URL=$connectionString" -ForegroundColor Gray
    }
    "3" {
        Write-Host ""
        Write-Host "ℹ️  Skipping database setup - will use in-memory storage" -ForegroundColor Yellow
        Write-Host "   (Data will be lost on server restart)" -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

