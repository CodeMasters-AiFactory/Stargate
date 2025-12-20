# Analyze All World-Class Websites
# Uses the API to analyze 10 top-tier sites

$baseUrl = "http://localhost:5000/api/website-builder/analyze"
$sites = @(
    @{name="Apple"; url="https://www.apple.com/"},
    @{name="Stripe"; url="https://stripe.com/"},
    @{name="Airbnb"; url="https://www.airbnb.com/"},
    @{name="Shopify"; url="https://www.shopify.com/"},
    @{name="Notion"; url="https://www.notion.so/"},
    @{name="Tesla"; url="https://www.tesla.com/"},
    @{name="Slack"; url="https://slack.com/"},
    @{name="IBM Design"; url="https://www.ibm.com/design/"},
    @{name="Monday.com"; url="https://monday.com/"},
    @{name="Dropbox"; url="https://www.dropbox.com/"}
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ANALYZING WORLD-CLASS WEBSITES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()

for ($i = 0; $i -lt $sites.Count; $i++) {
    $site = $sites[$i]
    Write-Host "[$($i+1)/$($sites.Count)] Analyzing $($site.name)..." -ForegroundColor Yellow
    Write-Host "   URL: $($site.url)" -ForegroundColor Gray
    
    try {
        $body = @{ url = $site.url } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 60 -ErrorAction Stop
        $analysis = $response.Content | ConvertFrom-Json
        
        $results += [PSCustomObject]@{
            Name = $site.name
            URL = $site.url
            AverageScore = $analysis.averageScore
            Verdict = $analysis.finalVerdict
            VisualDesign = $analysis.categoryScores.visualDesign
            UXStructure = $analysis.categoryScores.uxStructure
            Content = $analysis.categoryScores.contentPositioning
            Conversion = $analysis.categoryScores.conversionTrust
            SEO = $analysis.categoryScores.seoFoundations
            Creativity = $analysis.categoryScores.creativityDifferentiation
        }
        
        Write-Host "   Score: $($analysis.averageScore)/10 - $($analysis.finalVerdict)" -ForegroundColor Green
        Write-Host ""
        
        # Rate limiting
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize Name, AverageScore, Verdict, VisualDesign, UXStructure, Content, Conversion, SEO, Creativity

Write-Host "`nDetailed reports saved to: website_analysis_reports/" -ForegroundColor Green
