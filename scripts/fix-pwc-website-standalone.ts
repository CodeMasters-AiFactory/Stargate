/**
 * Fix the generated PWC website to be standalone
 * - Embed CSS inline
 * - Remove broken external references
 * - Make it work without external dependencies
 */

import * as fs from 'fs';
import * as path from 'path';

const websiteDir = path.join(process.cwd(), 'website_projects', 'premier-accounting-pwc');
const htmlFile = path.join(websiteDir, 'index.html');
const cssFile = path.join(websiteDir, 'styles.css');

async function fixWebsite() {
  console.log('🔧 Fixing website to be standalone...\n');
  
  // Read files
  console.log('📖 Reading files...');
  let html = fs.readFileSync(htmlFile, 'utf-8');
  let css = fs.readFileSync(cssFile, 'utf-8');
  
  console.log(`   HTML: ${html.length.toLocaleString()} characters`);
  console.log(`   CSS: ${css.length.toLocaleString()} characters\n`);
  
  // Step 1: Find the </head> tag and inject CSS before it
  console.log('💉 Injecting CSS inline...');
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    console.error('❌ Could not find </head> tag');
    return;
  }
  
  // Create style tag with embedded CSS
  const styleTag = `\n<style>\n${css}\n</style>\n`;
  
  // Insert before </head>
  html = html.slice(0, headEndIndex) + styleTag + html.slice(headEndIndex);
  
  console.log('✅ CSS embedded inline\n');
  
  // Step 2: Remove broken external CSS links
  console.log('🗑️  Removing broken external CSS references...');
  const externalCssPattern = /<link[^>]*href=["'][^"']*\.css[^"']*["'][^>]*>/gi;
  const cssMatches = html.match(externalCssPattern);
  if (cssMatches) {
    console.log(`   Found ${cssMatches.length} external CSS links`);
    html = html.replace(externalCssPattern, '<!-- External CSS removed -->');
  }
  console.log('✅ External CSS links removed\n');
  
  // Step 3: Remove broken external script references (keep inline scripts)
  console.log('🗑️  Removing broken external script references...');
  const externalScriptPattern = /<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi;
  const scriptMatches = html.match(externalScriptPattern);
  if (scriptMatches) {
    console.log(`   Found ${scriptMatches.length} external script tags`);
    // Keep scripts from CDNs that might work, remove local broken ones
    html = html.replace(/<script[^>]*src=["']\/[^"']*["'][^>]*><\/script>/gi, '<!-- External script removed -->');
  }
  console.log('✅ Broken external scripts removed\n');
  
  // Step 4: Add a link to our CSS file as backup (in case inline is too large)
  console.log('🔗 Adding backup CSS link...');
  const backupCssLink = '<link rel="stylesheet" href="styles.css" type="text/css">\n';
  html = html.replace('</head>', backupCssLink + '</head>');
  console.log('✅ Backup CSS link added\n');
  
  // Step 5: Save fixed HTML
  console.log('💾 Saving fixed HTML...');
  const outputFile = path.join(websiteDir, 'index-standalone.html');
  fs.writeFileSync(outputFile, html);
  
  console.log(`\n✅ Website fixed!`);
  console.log(`   Original: ${htmlFile}`);
  console.log(`   Fixed: ${outputFile}`);
  console.log(`   Size: ${(html.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('🎉 Done! Open index-standalone.html to view the fixed website.');
}

fixWebsite();

