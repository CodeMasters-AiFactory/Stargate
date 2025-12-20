# Check required VS Code/Cursor extensions for StargatePortal

$requiredExtensions = @(
    # TypeScript/JavaScript
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    
    # React/JSX
    "dsznajder.es7-react-js-snippets",
    
    # Tailwind CSS
    "bradlc.vscode-tailwindcss",
    
    # PostCSS
    "csstools.postcss",
    
    # Git
    "eamodio.gitlens",
    "mhutchie.git-graph",
    
    # Database
    "ms-ossdata.vscode-postgresql",
    
    # General
    "usernamehw.errorlens",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
)

$extPath = "$env:USERPROFILE\.cursor\extensions"
$installedExtensions = @()

if (Test-Path $extPath) {
    $installedDirs = Get-ChildItem -Path $extPath -Directory -ErrorAction SilentlyContinue
    foreach ($dir in $installedDirs) {
        $manifestPath = Join-Path $dir.FullName "package.json"
        if (Test-Path $manifestPath) {
            try {
                $manifest = Get-Content $manifestPath | ConvertFrom-Json
                if ($manifest.publisher -and $manifest.name) {
                    $installedExtensions += "$($manifest.publisher).$($manifest.name)"
                }
            } catch {
                # Skip invalid manifests
            }
        }
    }
}

Write-Host "=== EXTENSION AUDIT ===" -ForegroundColor Cyan
Write-Host "`nRequired Extensions:" -ForegroundColor Yellow
$requiredExtensions | ForEach-Object { Write-Host "  - $_" }

Write-Host "`nInstalled Extensions: $($installedExtensions.Count)" -ForegroundColor Yellow

Write-Host "`nMissing Extensions:" -ForegroundColor Red
$missing = @()
foreach ($req in $requiredExtensions) {
    $found = $installedExtensions | Where-Object { $_ -like "*$req*" }
    if (-not $found) {
        Write-Host "  - $req" -ForegroundColor Red
        $missing += $req
    }
}

if ($missing.Count -eq 0) {
    Write-Host "  None - All required extensions are installed!" -ForegroundColor Green
}

# Export results
$results = @{
    required = $requiredExtensions
    installed = $installedExtensions
    missing = $missing
    installedCount = $installedExtensions.Count
}

$results | ConvertTo-Json -Depth 2 | Out-File -FilePath "EXTENSION_AUDIT_REPORT.json" -Encoding utf8
Write-Host "`nReport saved to: EXTENSION_AUDIT_REPORT.json" -ForegroundColor Green

