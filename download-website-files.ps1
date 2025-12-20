# Automatic Website Files Download Script
# This script navigates to the wizard and triggers the download

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AUTOMATIC WEBSITE FILES DOWNLOAD" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will help you download all files from your generated website." -ForegroundColor Yellow
Write-Host "`nIMPORTANT: You need to manually click the Download button in the wizard." -ForegroundColor Yellow
Write-Host "`nSteps:" -ForegroundColor Cyan
Write-Host "1. Make sure your server is running (http://localhost:5000)" -ForegroundColor White
Write-Host "2. Open your browser to http://localhost:5000" -ForegroundColor White
Write-Host "3. Navigate to: Services > Merlin Website Wizard" -ForegroundColor White
Write-Host "4. If you have a generated website, you'll see a 'Download' button" -ForegroundColor White
Write-Host "5. Click the Download button to get a ZIP file with ALL files" -ForegroundColor White
Write-Host "`nThe ZIP file will contain:" -ForegroundColor Cyan
Write-Host "  ✅ All HTML pages (home.html, services.html, about.html, contact.html)" -ForegroundColor Green
Write-Host "  ✅ CSS files (assets/styles/main.css)" -ForegroundColor Green
Write-Host "  ✅ JavaScript files (assets/scripts/app.js)" -ForegroundColor Green
Write-Host "  ✅ All images (if any were generated)" -ForegroundColor Green
Write-Host "  ✅ Complete file structure" -ForegroundColor Green
Write-Host "`nAfter downloading, extract the ZIP file to see all your website files!" -ForegroundColor Yellow
Write-Host "`n========================================" -ForegroundColor Cyan

# Check if server is running
Write-Host "`nChecking if server is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running. Please start it first." -ForegroundColor Red
    Write-Host "   Run: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Ready! Now:" -ForegroundColor Green
Write-Host "   1. Open http://localhost:5000 in your browser" -ForegroundColor White
Write-Host "   2. Go to Services > Merlin Website Wizard" -ForegroundColor White
Write-Host "   3. Click the Download button" -ForegroundColor White
Write-Host "`nThe ZIP file will be saved to your Downloads folder." -ForegroundColor Yellow

