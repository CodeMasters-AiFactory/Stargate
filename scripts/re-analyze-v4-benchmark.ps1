# Re-analyze all 10 test sites with v4.0 analyzer
# Multi-Expert Panel + Human Perception Scoring

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
Write-Host "   MERLIN ANALYZER v4.0 BENCHMARK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Analyzing 10 sites with v4.0:" -ForegroundColor Yellow
Write-Host "  • 5 Expert Evaluators (parallel)" -ForegroundColor White
Write-Host "  • Consensus Engine (industry-weighted)" -ForegroundColor White
Write-Host "  • Human Perception Scoring" -ForegroundColor White
Write-Host "  • UX Heuristics (Nielsen, Fitts, etc.)" -ForegroundColor White
Write-Host "  • Industry Benchmarking`n" -ForegroundColor White

$results = @()
$benchmarkDir = "website_analysis_reports_v4\benchmark"

if (!(Test-Path $benchmarkDir)) {
    New-Item -ItemType Directory -Path $benchmarkDir -Force | Out-Null
}

for ($i = 0; $i -lt $sites.Count; $i++) {
    $url = $sites[$i]
    $siteName = ($url -replace 'https?://(www\.)?', '' -replace '/$', '' -replace '/', '-').ToLower()
    
    Write-Host "[$($i+1)/10] Analyzing $siteName..." -ForegroundColor Yellow
    Write-Host "   (v4.0 takes 45-90 seconds per site)" -ForegroundColor Gray
    
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
Write-Host "   v4.0 BENCHMARK RESULTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

Write-Host "`nDetailed reports saved to: website_analysis_reports_v4/benchmark/" -ForegroundColor Green
Write-Host "Each site has:" -ForegroundColor Cyan
Write-Host "  • expert-panel/ (5 expert evaluations)" -ForegroundColor White
Write-Host "  • consensus.json" -ForegroundColor White
Write-Host "  • perception.json" -ForegroundColor White
Write-Host "  • final-score.json" -ForegroundColor White
Write-Host "  • summary.md" -ForegroundColor White
Write-Host "  • screenshots/ (desktop/tablet/mobile)`n" -ForegroundColor White
Write-Host "✅ v4.0 Benchmark complete!" -ForegroundColor Green

