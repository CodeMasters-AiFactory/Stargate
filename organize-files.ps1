# File Organization Script
# Moves markdown files from root to organized docs/ structure

Write-Host "Starting file organization..." -ForegroundColor Green

# Move Phase files
Write-Host "`nMoving Phase documentation..." -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "PHASE*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/phases/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move Competitive analysis files
Write-Host "`nMoving Competitive analysis files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "*ANALYSIS*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/competitive/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*POSITIONING*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/competitive/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*COMPETITIVE*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/competitive/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*PRICING*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/competitive/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move Testing files
Write-Host "`nMoving Testing files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "*TEST*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/testing/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*REPORT*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/testing/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*SMOKE*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/testing/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*QA*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/testing/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move Deployment files
Write-Host "`nMoving Deployment files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "*DEPLOYMENT*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/deployment/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*INFRASTRUCTURE*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/deployment/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*PRODUCTION*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/deployment/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move Architecture files
Write-Host "`nMoving Architecture files..." -ForegroundColor Cyan
Get-ChildItem -Path . -Filter "*SYSTEM*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/architecture/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*ARCHITECTURE*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/architecture/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}
Get-ChildItem -Path . -Filter "*API*.md" -File | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/architecture/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

# Move remaining miscellaneous markdown files to archived
Write-Host "`nMoving remaining files to archived..." -ForegroundColor Cyan
$keepFiles = @("README.md", "CHANGELOG.md", "QUICK_START.md")
Get-ChildItem -Path . -Filter "*.md" -File | Where-Object {
    $keepFiles -notcontains $_.Name
} | ForEach-Object {
    Move-Item $_.FullName -Destination "docs/archived/" -Force
    Write-Host "  Moved: $($_.Name)" -ForegroundColor Gray
}

Write-Host "`nFile organization complete!" -ForegroundColor Green
Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "  Phase docs:        $(Get-ChildItem 'docs/phases/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Competitive docs:  $(Get-ChildItem 'docs/competitive/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Testing docs:      $(Get-ChildItem 'docs/testing/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Deployment docs:   $(Get-ChildItem 'docs/deployment/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Architecture docs: $(Get-ChildItem 'docs/architecture/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Archived docs:     $(Get-ChildItem 'docs/archived/' | Measure-Object | Select-Object -ExpandProperty Count) files" -ForegroundColor White
Write-Host "  Root directory:    $(Get-ChildItem -Path . -Filter '*.md' -File | Measure-Object | Select-Object -ExpandProperty Count) files remaining" -ForegroundColor White
