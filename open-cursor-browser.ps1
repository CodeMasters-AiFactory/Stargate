# Script to help connect Cursor's embedded browser to the frontend
# This provides instructions and can be used with Cursor's browser MCP tools

$url = "http://localhost:5000"

Write-Host "🌐 Connecting Cursor Browser to Frontend" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend URL: $url" -ForegroundColor White
Write-Host ""
Write-Host "To connect Cursor's embedded browser:" -ForegroundColor Yellow
Write-Host "1. Open the Browser panel in Cursor (if not already open)" -ForegroundColor White
Write-Host "2. Enter this URL in the browser's address bar:" -ForegroundColor White
Write-Host "   $url" -ForegroundColor Green
Write-Host "3. Press Enter to navigate" -ForegroundColor White
Write-Host ""
Write-Host "Or use Cursor's command palette:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+Shift+P → Type 'Browser: Navigate' → Enter URL" -ForegroundColor White
Write-Host ""

# Check if server is running
$portCheck = netstat -ano | Select-String ":5000.*LISTENING"
if ($portCheck) {
    Write-Host "✅ Server is running on port 5000" -ForegroundColor Green
    Write-Host "   Frontend should be available at: $url" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server is not running on port 5000" -ForegroundColor Yellow
    Write-Host "   Please start the server first using: .\start.ps1" -ForegroundColor Yellow
}

Write-Host ""

