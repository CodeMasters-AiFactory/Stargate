# Re-analyze all 10 test sites with v3.0 analyzer
# Saves reports to website_analysis_reports_v3/benchmark/

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
Write-Host "   MERLIN ANALYZER v3.0 BENCHMARK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Analyzing 10 sites with v3.0:" -ForegroundColor Yellow
Write-Host "  • Screenshot-based analysis" -ForegroundColor White
Write-Host "  • Mobile rendering (390px, 768px, 1440px)" -ForegroundColor White
Write-Host "  • Advanced visual design detection" -ForegroundColor White
Write-Host "  • Brand personality recognition" -ForegroundColor White
Write-Host "  • Stricter Excellent criteria`n" -ForegroundColor White

$results = @()
$benchmarkDir = "website_analysis_reports_v3\benchmark"

if (!(Test-Path $benchmarkDir)) {
    New-Item -ItemType Directory -Path $benchmarkDir -Force | Out-Null
}

for ($i = 0; $i -lt $sites.Count; $i++) {
    $url = $sites[$i]
    $siteName = ($url -replace 'https?://(www\.)?', '' -replace '/$', '' -replace '/', '-').ToLower()
    
    Write-Host "[$($i+1)/10] Analyzing $siteName..." -ForegroundColor Yellow
    Write-Host "   (This may take 30-60 seconds per site)" -ForegroundColor Gray
    
    try {
        $body = @{ url = $url } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/website-builder/analyze" `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -UseBasicParsing `
            -TimeoutSec 120 `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        
        $results += [PSCustomObject]@{
            Name = $siteName
            WeightedScore = [math]::Round($result.averageScore * 10, 1)
            Verdict = $result.finalVerdict
            VisualDesign = [math]::Round($result.categoryScores.visualDesign, 1)
            UXStructure = [math]::Round($result.categoryScores.uxStructure, 1)
            Content = [math]::Round($result.categoryScores.contentPositioning, 1)
            Conversion = [math]::Round($result.categoryScores.conversionTrust, 1)
            SEO = [math]::Round($result.categoryScores.seoFoundations, 1)
            Creativity = [math]::Round($result.categoryScores.creativityDifferentiation, 1)
        }
        
        Write-Host "   ✅ Score: $([math]::Round($result.averageScore * 10, 1))/100 - $($result.finalVerdict)" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 1000
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   BENCHMARK RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

Write-Host "`nDetailed reports saved to: website_analysis_reports_v3/benchmark/" -ForegroundColor Green
Write-Host "Each site has:" -ForegroundColor Cyan
Write-Host "  • visual.json, content.json, ux.json, mobile.json" -ForegroundColor White
Write-Host "  • seo.json, creativity.json, conversion.json" -ForegroundColor White
Write-Host "  • accessibility.json, final-score.json" -ForegroundColor White
Write-Host "  • summary.md" -ForegroundColor White
Write-Host "  • screenshots/ (desktop.png, tablet.png, mobile.png)" -ForegroundColor White
Write-Host "`n✅ Benchmark complete!" -ForegroundColor Green

