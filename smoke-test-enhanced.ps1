# Enhanced Smoke Test - With Quality Standards Enforcement
# Tests website generation AND quality standards learned from Sterling analysis

param(
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$CheckQuality = $true
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ENHANCED SMOKE TEST" -ForegroundColor Cyan
Write-Host "   (With Quality Standards Check)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Function to check if server is running
function Wait-ForServer {
    Write-Host "Checking if server is running..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "Server is responding! (HTTP $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Server not responding. Please start the server first." -ForegroundColor Red
        return $false
    }
}

# Function to check for generic filler content
function Test-NoGenericFiller {
    param([string]$Content)
    
    $genericPatterns = @(
        "we deliver exceptional quality",
        "quality, integrity, and customer satisfaction",
        "we are the best",
        "we provide excellent service",
        "we deliver outstanding results"
    )
    
    $contentLower = $Content.ToLower()
    foreach ($pattern in $genericPatterns) {
        if ($contentLower -like "*$pattern*") {
            return $false, "Found generic filler: '$pattern'"
        }
    }
    
    return $true, "No generic filler detected"
}

# Function to check for location references
function Test-LocationReferences {
    param([string]$Content)
    
    if ($Content -match "\[CITY\]|\[REGION\]|Pretoria|Johannesburg|Cape Town|Durban") {
        return $true, "Location references found"
    }
    
    return $false, "No location references found (should include [CITY] or actual city name)"
}

# Function to check for strong CTAs
function Test-StrongCTAs {
    param([string]$Content)
    
    $strongCTAs = @("Book a Consultation", "Book a Free Consultation", "Schedule a Consultation", "Get Started")
    $weakCTAs = @("Contact Us", "Learn More", "Read More")
    
    $contentLower = $Content.ToLower()
    $hasStrong = $false
    $hasWeak = $false
    
    foreach ($cta in $strongCTAs) {
        if ($contentLower -like "*$($cta.ToLower())*") {
            $hasStrong = $true
            break
        }
    }
    
    foreach ($cta in $weakCTAs) {
        if ($contentLower -like "*$($cta.ToLower())*") {
            $hasWeak = $true
            break
        }
    }
    
    if ($hasStrong) {
        return $true, "Strong CTAs found (good)"
    } elseif ($hasWeak -and -not $hasStrong) {
        return $false, "Only weak CTAs found (should use 'Book a Consultation' not 'Contact Us')"
    } else {
        return $false, "No CTAs found"
    }
}

# Function to check for keyword-rich SEO
function Test-KeywordRichSEO {
    param([string]$Title, [string]$H1)
    
    $hasKeywords = $false
    $issues = @()
    
    # Check if title is generic
    if ($Title -match "^Home\s*\||^Services\s*\||^About\s*\||^Contact\s*\|") {
        $issues += "Generic title format (should include location/service keywords)"
    }
    
    # Check for location keywords
    if ($Title -match "\[CITY\]|Pretoria|Johannesburg|Cape Town|Law Firm|Corporate Law|Family Law") {
        $hasKeywords = $true
    }
    
    # Check H1
    if ($H1 -match "Our Services|What We Offer|Our Story|Our Values") {
        $issues += "Generic H1 (should include keywords like 'Law Firm in [CITY]')"
    }
    
    if ($hasKeywords -and $issues.Count -eq 0) {
        return $true, "Keyword-rich SEO found"
    } else {
        return $false, "SEO issues: $($issues -join ', ')"
    }
}

# Function to check for brand colors (law firm)
function Test-BrandColors {
    param([string]$CSS)
    
    $hasNavy = $CSS -match "#1e3a8a|#1e40af|navy|rgb\(30,\s*58,\s*138\)"
    $hasAmber = $CSS -match "#d97706|#f59e0b|amber|copper|rgb\(217,\s*119,\s*6\)"
    $hasConfetti = $CSS -match "confetti|dots|playful|fun"
    
    if ($hasConfetti) {
        return $false, "Confetti/playful elements found (should be professional for law firm)"
    }
    
    if ($hasNavy -and $hasAmber) {
        return $true, "Proper brand colors found (navy + amber)"
    } elseif ($hasNavy -or $hasAmber) {
        return $false, "Partial brand colors (should have both navy and amber)"
    } else {
        return $false, "Brand colors not found (should use navy #1e3a8a and amber #d97706)"
    }
}

# Main test function
function Test-WebsiteQuality {
    param([string]$ProjectSlug = "sterling-legal-partners")
    
    Write-Host "`nTesting Website Quality Standards..." -ForegroundColor Yellow
    Write-Host "Project: $ProjectSlug`n" -ForegroundColor White
    
    $projectDir = Join-Path (Get-Location) "website_projects\$ProjectSlug"
    
    if (-not (Test-Path $projectDir)) {
        Write-Host "Project not found: $projectDir" -ForegroundColor Red
        Write-Host "Generate the website first using the API" -ForegroundColor Yellow
        return $false
    }
    
    $issues = @()
    $passed = 0
    $total = 0
    
    # Test 1: Check content for generic filler
    Write-Host "Test 1: Checking for generic filler content..." -ForegroundColor Cyan
    $contentFiles = Get-ChildItem -Path "$projectDir\content" -Filter "*.json" -ErrorAction SilentlyContinue
    if ($contentFiles) {
        foreach ($file in $contentFiles) {
            $content = Get-Content $file.FullName -Raw
            $total++
            $result, $message = Test-NoGenericFiller -Content $content
            if ($result) {
                Write-Host "  ✓ $($file.Name): $message" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "  ✗ $($file.Name): $message" -ForegroundColor Red
                $issues += "$($file.Name): $message"
            }
        }
    } else {
        Write-Host "  ⚠ No content files found" -ForegroundColor Yellow
    }
    
    # Test 2: Check for location references
    Write-Host "`nTest 2: Checking for location references..." -ForegroundColor Cyan
    if ($contentFiles) {
        foreach ($file in $contentFiles) {
            $content = Get-Content $file.FullName -Raw
            $total++
            $result, $message = Test-LocationReferences -Content $content
            if ($result) {
                Write-Host "  ✓ $($file.Name): $message" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "  ✗ $($file.Name): $message" -ForegroundColor Red
                $issues += "$($file.Name): $message"
            }
        }
    }
    
    # Test 3: Check for strong CTAs
    Write-Host "`nTest 3: Checking for strong CTAs..." -ForegroundColor Cyan
    if ($contentFiles) {
        foreach ($file in $contentFiles) {
            $content = Get-Content $file.FullName -Raw
            $total++
            $result, $message = Test-StrongCTAs -Content $content
            if ($result) {
                Write-Host "  ✓ $($file.Name): $message" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "  ✗ $($file.Name): $message" -ForegroundColor Red
                $issues += "$($file.Name): $message"
            }
        }
    }
    
    # Test 4: Check SEO
    Write-Host "`nTest 4: Checking SEO (keyword-rich titles/headings)..." -ForegroundColor Cyan
    $seoFiles = Get-ChildItem -Path "$projectDir\seo" -Filter "*.json" -ErrorAction SilentlyContinue
    if ($seoFiles) {
        foreach ($file in $seoFiles) {
            $seoData = Get-Content $file.FullName -Raw | ConvertFrom-Json
            $total++
            $result, $message = Test-KeywordRichSEO -Title $seoData.title -H1 $seoData.h1
            if ($result) {
                Write-Host "  ✓ $($file.Name): $message" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "  ✗ $($file.Name): $message" -ForegroundColor Red
                $issues += "$($file.Name): $message"
            }
        }
    } else {
        Write-Host "  ⚠ No SEO files found" -ForegroundColor Yellow
    }
    
    # Test 5: Check brand colors in CSS
    Write-Host "`nTest 5: Checking brand colors..." -ForegroundColor Cyan
    $cssFile = Join-Path $projectDir "output\assets\styles\main.css"
    if (Test-Path $cssFile) {
        $css = Get-Content $cssFile -Raw
        $total++
        $result, $message = Test-BrandColors -CSS $css
        if ($result) {
            Write-Host "  ✓ CSS: $message" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ✗ CSS: $message" -ForegroundColor Red
            $issues += "CSS: $message"
        }
    } else {
        Write-Host "  ⚠ CSS file not found" -ForegroundColor Yellow
    }
    
    # Summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   QUALITY TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Passed: $passed / $total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
    
    if ($issues.Count -gt 0) {
        Write-Host "`nIssues Found:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
        Write-Host "`nThese issues would result in a score < 7.5/10" -ForegroundColor Yellow
        Write-Host "Site would NOT be rated as 'Excellent'" -ForegroundColor Yellow
        return $false
    } else {
        Write-Host "`nAll quality checks passed!" -ForegroundColor Green
        Write-Host "Site meets minimum standards for 'Good' rating" -ForegroundColor Green
        return $true
    }
}

# Run basic smoke test
Write-Host "Step 1: Basic Connectivity Test" -ForegroundColor Yellow
if (-not (Wait-ForServer)) {
    Write-Host "`nCannot proceed without server. Exiting." -ForegroundColor Red
    exit 1
}

# Test API endpoint
Write-Host "`nStep 2: Testing API Endpoints" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/website-builder/projects" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Projects API: Working" -ForegroundColor Green
} catch {
    Write-Host "✗ Projects API: Failed" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/website-builder/analyze" -Method POST -Body (@{url="https://example.com"} | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Analysis API: Working" -ForegroundColor Green
} catch {
    Write-Host "✗ Analysis API: Failed or requires valid URL" -ForegroundColor Yellow
}

# Quality standards test
if ($CheckQuality) {
    Write-Host "`nStep 3: Quality Standards Test" -ForegroundColor Yellow
    Test-WebsiteQuality -ProjectSlug "sterling-legal-partners"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SMOKE TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Lessons Learned Applied:" -ForegroundColor Green
Write-Host "  ✓ Checking for generic filler" -ForegroundColor White
Write-Host "  ✓ Checking for location references" -ForegroundColor White
Write-Host "  ✓ Checking for strong CTAs" -ForegroundColor White
Write-Host "  ✓ Checking for keyword-rich SEO" -ForegroundColor White
Write-Host "  ✓ Checking for brand colors" -ForegroundColor White
Write-Host "`nSee docs/lessons-learned-sterling.md for details" -ForegroundColor Cyan

