# Extract Generated Website Files Script
# This script extracts all files (HTML, CSS, JS, images) from a generated website

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   EXTRACT WEBSITE FILES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$outputDir = "extracted-website"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fullOutputDir = "$outputDir-$timestamp"

# Create output directory
if (Test-Path $fullOutputDir) {
    Remove-Item $fullOutputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $fullOutputDir | Out-Null
Write-Host "Created output directory: $fullOutputDir" -ForegroundColor Green

Write-Host "`nThis script will help you extract all files from your generated website." -ForegroundColor Yellow
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host "1. Open your browser to http://localhost:5000" -ForegroundColor White
Write-Host "2. Navigate to the Merlin Website Wizard" -ForegroundColor White
Write-Host "3. Open the browser console (F12)" -ForegroundColor White
Write-Host "4. Run the JavaScript code below to extract files:`n" -ForegroundColor White

$extractScript = @"
// Extract Generated Website Files
// Run this in the browser console when viewing the generated website

(function() {
    console.log('🔍 Searching for generated website data...');
    
    // Try to find the website data in React DevTools or component state
    // Method 1: Check localStorage/sessionStorage
    let websiteData = null;
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            const value = JSON.parse(localStorage.getItem(key));
            if (value && (value.manifest || value.files || value.html)) {
                websiteData = value;
                console.log('✅ Found website data in localStorage:', key);
                break;
            }
        } catch (e) {
            // Not JSON, skip
        }
    }
    
    // Method 2: Try to access React component state (if React DevTools available)
    if (!websiteData && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('⚠️ React DevTools detected - trying to access component state...');
        // This would require React DevTools API access
    }
    
    // Method 3: Extract from iframe content
    const iframes = document.querySelectorAll('iframe');
    let extractedFiles = {};
    
    for (const iframe of iframes) {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
                const html = iframeDoc.documentElement.outerHTML;
                const title = iframeDoc.title || '';
                
                if (html.includes('Iron Temple') || title.includes('Iron Temple')) {
                    console.log('✅ Found Iron Temple website in iframe');
                    
                    // Extract HTML
                    extractedFiles['index.html'] = html;
                    
                    // Extract all images
                    const images = Array.from(iframeDoc.querySelectorAll('img'));
                    images.forEach((img, index) => {
                        const src = img.src;
                        if (src.startsWith('data:')) {
                            // Base64 image
                            const matches = src.match(/data:image\/(\w+);base64,(.+)/);
                            if (matches) {
                                const ext = matches[1];
                                const base64 = matches[2];
                                extractedFiles[`images/image-${index + 1}.${ext}`] = base64;
                                console.log(`📷 Extracted image: image-${index + 1}.${ext}`);
                            }
                        } else if (src.startsWith('http')) {
                            // External image URL
                            extractedFiles[`images/image-${index + 1}.url.txt`] = src;
                            console.log(`🔗 Found external image URL: ${src}`);
                        }
                    });
                    
                    // Extract all CSS
                    const styles = Array.from(iframeDoc.querySelectorAll('style'));
                    const css = styles.map(s => s.textContent).join('\n\n');
                    if (css) {
                        extractedFiles['styles.css'] = css;
                        console.log('✅ Extracted CSS');
                    }
                    
                    // Extract all JavaScript
                    const scripts = Array.from(iframeDoc.querySelectorAll('script'));
                    const js = scripts.map(s => s.textContent).join('\n\n');
                    if (js) {
                        extractedFiles['script.js'] = js;
                        console.log('✅ Extracted JavaScript');
                    }
                    
                    // Extract all links (for external resources)
                    const links = Array.from(iframeDoc.querySelectorAll('link[rel="stylesheet"], link[href]'));
                    links.forEach((link, index) => {
                        extractedFiles[`links/link-${index + 1}.txt`] = JSON.stringify({
                            rel: link.rel,
                            href: link.href,
                            type: link.type
                        }, null, 2);
                    });
                }
            }
        } catch (e) {
            // Cross-origin or not accessible
            console.log('⚠️ Cannot access iframe (cross-origin):', e.message);
        }
    }
    
    // Create download
    if (Object.keys(extractedFiles).length > 0) {
        console.log(`\n✅ Extracted ${Object.keys(extractedFiles).length} files`);
        console.log('📦 Creating download...');
        
        // Create a data structure for download
        const downloadData = {
            timestamp: new Date().toISOString(),
            files: extractedFiles,
            metadata: {
                title: iframeDoc?.title || 'Extracted Website',
                url: window.location.href
            }
        };
        
        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-website-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Download started! Check your downloads folder for extracted-website-data.json');
        console.log('📋 Files extracted:', Object.keys(extractedFiles).join(', '));
        
        return downloadData;
    } else {
        console.log('❌ No files found. Make sure you are viewing the generated website preview.');
        return null;
    }
})();
"@

Write-Host $extractScript -ForegroundColor Gray
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ALTERNATIVE: Use Download Button" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Alternatively, you can use the Download button in the wizard to get a ZIP file" -ForegroundColor Yellow
Write-Host "with all website files included.`n" -ForegroundColor Yellow

Write-Host "After extracting, run this script again to process the downloaded files:" -ForegroundColor Cyan
Write-Host "  .\process-extracted-files.ps1" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan

