# MERLIN CHAT AGENT TEST SCRIPT
# Tests 30 commands and logs results

$projectSlug = "thunder-fitness-gym"
$htmlPath = "C:\CURSOR PROJECTS\StargatePortal\website_projects\$projectSlug\merlin8-output\index.html"
# Use -Encoding UTF8 to properly read HTML content
$html = Get-Content -Path $htmlPath -Raw -Encoding UTF8

# Test commands
$commands = @(
    # Text changes (15)
    'change "Stronger Every" to "UNLEASH YOUR"',
    'change "Day" to "POTENTIAL"',
    'change "Contact Us" to "START NOW"',
    'change "Get Quote" to "JOIN TODAY"',
    'change "What We Offer" to "OUR PROGRAMS"',
    'change "Personal Training" to "1-ON-1 COACHING"',
    'change "Group Classes" to "TEAM WORKOUTS"',
    'change "Nutrition Coaching" to "FUEL YOUR BODY"',
    'change "About Us" to "OUR STORY"',
    'change "Ready to Get Started?" to "BEGIN YOUR JOURNEY"',
    'change "Let''s Work Together" to "TRANSFORM TODAY"',
    'change "Privacy Policy" to "Your Privacy"',
    'change "Terms of Service" to "Our Terms"',
    'change "All rights reserved" to "All Rights Reserved"',
    'change "info@" to "contact@"',

    # Color changes (5)
    'change color to #10B981',
    'change color to orange',
    'change color to #3B82F6',
    'change color to red',
    'change color to #8B5CF6',

    # Size changes (3)
    'make text bigger',
    'make text smaller',
    'make text bigger',

    # Edge case tests (7)
    'change "Thunder Fitness Gym" to "THUNDER FITNESS"',
    'change "fitness and personal training" to "transforming lives through fitness"',
    'change "certified trainers" to "world-class coaches"',
    'change "" to ""',
    'change "test" to "test"',
    'hello',
    'what can you do?'
)

$results = @()
$successCount = 0
$failCount = 0

Write-Host "Testing $($commands.Count) Merlin commands..." -ForegroundColor Cyan
Write-Host ""

foreach ($i in 0..($commands.Count - 1)) {
    $cmd = $commands[$i]
    Write-Host "[$($i+1)/$($commands.Count)] Testing: $cmd" -ForegroundColor Yellow

    try {
        $body = @{
            message = $cmd
            currentHtml = $html
            context = @{
                businessName = "Thunder Fitness Gym"
            }
        } | ConvertTo-Json -Depth 3

        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/website-editor/chat" -Method Post -ContentType "application/json" -Body $body

        if ($response.success) {
            $successCount++
            $status = "SUCCESS"
            # Update HTML for next test
            if ($response.updatedHtml) {
                $html = $response.updatedHtml
            }
        } else {
            $failCount++
            $status = "FAIL"
        }

        $results += @{
            Command = $cmd
            Status = $status
            Response = $response.message.Substring(0, [Math]::Min(50, $response.message.Length))
        }

        Write-Host "  -> $status : $($response.message.Substring(0, [Math]::Min(60, $response.message.Length)))..." -ForegroundColor $(if ($status -eq "SUCCESS") { "Green" } else { "Red" })
    }
    catch {
        $failCount++
        $results += @{
            Command = $cmd
            Status = "ERROR"
            Response = $_.Exception.Message
        }
        Write-Host "  -> ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Commands: $($commands.Count)"
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Success Rate: $([Math]::Round(($successCount / $commands.Count) * 100, 1))%"

# Save updated HTML - use -NoNewline to prevent adding extra newlines
# and -Encoding UTF8 to preserve HTML formatting
[System.IO.File]::WriteAllText($htmlPath, $html)
Write-Host ""
Write-Host "Updated HTML saved to: $htmlPath" -ForegroundColor Green
