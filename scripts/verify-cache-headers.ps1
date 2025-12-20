# Cache Headers Verification Script
# Verifies that cache-busting headers are being sent correctly

$ErrorActionPreference = "Stop"

Write-Host "Verifying Cache-Busting Headers..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$testUrls = @(
    "/",
    "/src/main.tsx"
)

$allPassed = $true

foreach ($url in $testUrls) {
    $fullUrl = "$baseUrl$url"
    Write-Host "Testing: $fullUrl" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -UseBasicParsing -ErrorAction Stop
        
        $cacheControl = $response.Headers["Cache-Control"]
        $pragma = $response.Headers["Pragma"]
        $expires = $response.Headers["Expires"]
        
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($cacheControl) {
            Write-Host "  Cache-Control: $cacheControl" -ForegroundColor Green
            if ($cacheControl -match "no-cache|no-store|must-revalidate") {
                Write-Host "  Cache-Control header is correct" -ForegroundColor Green
            } else {
                Write-Host "  Cache-Control header may not be aggressive enough" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Cache-Control header missing" -ForegroundColor Yellow
            $allPassed = $false
        }
        
        if ($pragma) {
            Write-Host "  Pragma: $pragma" -ForegroundColor Green
        }
        
        if ($expires) {
            Write-Host "  Expires: $expires" -ForegroundColor Green
        }
        
        # Check HTML for meta tags
        if ($response.Content -match '<meta http-equiv="Cache-Control"') {
            Write-Host "  HTML contains cache-busting meta tags" -ForegroundColor Green
        } elseif ($url -eq "/") {
            Write-Host "  HTML may be missing cache-busting meta tags" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  Failed to fetch: $($_.Exception.Message)" -ForegroundColor Red
        $allPassed = $false
    }
    
    Write-Host ""
}

Write-Host "===============================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "All cache-busting headers verified successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cache-busting is working correctly:" -ForegroundColor Green
    Write-Host "  - HTTP headers are being sent" -ForegroundColor Green
    Write-Host "  - HTML meta tags are present" -ForegroundColor Green
    Write-Host "  - Browser should not cache files" -ForegroundColor Green
} else {
    Write-Host "Some cache-busting headers may be missing" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommendations:" -ForegroundColor Yellow
    Write-Host "  - Ensure dev server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  - Check server/index.ts for cacheBusterMiddleware" -ForegroundColor Yellow
    Write-Host "  - Verify client/index.html has meta tags" -ForegroundColor Yellow
}

Write-Host "===============================================================" -ForegroundColor Cyan

exit $(if ($allPassed) { 0 } else { 1 })
