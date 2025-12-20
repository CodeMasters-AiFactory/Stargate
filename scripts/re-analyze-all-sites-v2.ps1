# Re-analyze all 10 world-class websites with Advanced Analyzer v2.0
# Saves reports to website_analysis_reports_v2/

$sites = @(
    "https://www.apple.com/",
    "https://stripe.com/",
    "https://www.airbnb.com/",
    "https://www.shopify.com/",
    "https://www.notion.so/",
    "https://www.tesla.com/",
    "https://slack.com/",
    "https://www.ibm.com/design/",
    "https://monday.com/",
    "https://www.dropbox.com/"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ADVANCED ANALYSIS v2.0" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Analyzing 10 sites with upgraded engine:" -ForegroundColor Yellow
Write-Host "  • CSS parsing & color detection" -ForegroundColor White
Write-Host "  • Typography analysis" -ForegroundColor White
Write-Host "  • Deep content analysis" -ForegroundColor White
Write-Host "  • Accessibility checks" -ForegroundColor White
Write-Host "  • Enhanced conversion scoring" -ForegroundColor White
Write-Host "  • Stricter Excellent rules`n" -ForegroundColor White

$results = @()

for ($i = 0; $i -lt $sites.Count; $i++) {
    $url = $sites[$i]
    $siteName = ($url -replace 'https?://(www\.)?', '' -replace '/$', '' -replace '/', '-').ToLower()
    
    Write-Host "[$($i+1)/10] Analyzing $siteName..." -ForegroundColor Yellow
    
    try {
        $body = @{ url = $url } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/analyze" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -TimeoutSec 60 `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        
        $results += [PSCustomObject]@{
            Name = $siteName
            AverageScore = [math]::Round($result.averageScore, 2)
            Verdict = $result.finalVerdict
            VisualDesign = [math]::Round($result.categoryScores.visualDesign, 1)
            UXStructure = [math]::Round($result.categoryScores.uxStructure, 1)
            Content = [math]::Round($result.categoryScores.contentPositioning, 1)
            Conversion = [math]::Round($result.categoryScores.conversionTrust, 1)
            SEO = [math]::Round($result.categoryScores.seoFoundations, 1)
            Creativity = [math]::Round($result.categoryScores.creativityDifferentiation, 1)
        }
        
        Write-Host "   Score: $([math]::Round($result.averageScore, 2))/10 - $($result.finalVerdict)" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

Write-Host "`nDetailed reports saved to: website_analysis_reports_v2/" -ForegroundColor Green
Write-Host "`n✅ Analysis complete!" -ForegroundColor Green

