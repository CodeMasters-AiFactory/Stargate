# Process Extracted Website Files
# Converts extracted JSON data into actual files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PROCESS EXTRACTED WEBSITE FILES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Look for extracted JSON file
$jsonFile = Get-ChildItem -Path "$env:USERPROFILE\Downloads" -Filter "extracted-website-data.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $jsonFile) {
    Write-Host "❌ No extracted-website-data.json found in Downloads folder" -ForegroundColor Red
    Write-Host "Please run the browser extraction script first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found extracted file: $($jsonFile.FullName)" -ForegroundColor Green

# Read JSON
try {
    $data = Get-Content $jsonFile.FullName | ConvertFrom-Json
} catch {
    Write-Host "❌ Failed to parse JSON file: $_" -ForegroundColor Red
    exit 1
}

$outputDir = "extracted-website-files"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fullOutputDir = "$outputDir-$timestamp"

# Create output directory structure
if (Test-Path $fullOutputDir) {
    Remove-Item $fullOutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $fullOutputDir | Out-Null
New-Item -ItemType Directory -Path "$fullOutputDir\images" | Out-Null
New-Item -ItemType Directory -Path "$fullOutputDir\links" | Out-Null
Write-Host "Created output directory: $fullOutputDir" -ForegroundColor Green

$fileCount = 0
$imageCount = 0

# Process each file
foreach ($filePath in $data.files.PSObject.Properties.Name) {
    $content = $data.files.$filePath
    $fullPath = Join-Path $fullOutputDir $filePath
    
    # Create directory if needed
    $dir = Split-Path $fullPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Check if it's a base64 image
    if ($filePath -like "images\*" -and $content -notlike "http*") {
        # Base64 image - decode it
        try {
            $bytes = [Convert]::FromBase64String($content)
            [System.IO.File]::WriteAllBytes($fullPath, $bytes)
            $imageCount++
            Write-Host "📷 Saved image: $filePath" -ForegroundColor Green
        } catch {
            # Not base64, save as text
            Set-Content -Path $fullPath -Value $content
            Write-Host "📄 Saved file: $filePath" -ForegroundColor Cyan
        }
    } else {
        # Regular file - save as text
        Set-Content -Path $fullPath -Value $content -Encoding UTF8
        Write-Host "📄 Saved file: $filePath" -ForegroundColor Cyan
    }
    $fileCount++
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   EXTRACTION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Processed $fileCount files" -ForegroundColor Green
Write-Host "📷 Extracted $imageCount images" -ForegroundColor Green
Write-Host "📁 Output directory: $fullOutputDir" -ForegroundColor Green
Write-Host "`nYou can now review all the extracted files!" -ForegroundColor Yellow

