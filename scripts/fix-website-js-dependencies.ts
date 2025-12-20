/**
 * Fix website to include all JavaScript dependencies for buttons to work
 * Adds jQuery, stub functions, and ensures all interactive elements work
 */

import * as fs from 'fs';
import * as path from 'path';

const websiteDir = path.join(process.cwd(), 'website_projects', 'premier-accounting-pwc');
const htmlFile = path.join(websiteDir, 'index-standalone.html');

async function fixJavaScriptDependencies() {
  console.log('🔧 Fixing JavaScript Dependencies...\n');
  
  // Read the HTML
  console.log('📖 Reading HTML file...');
  let html = fs.readFileSync(htmlFile, 'utf-8');
  console.log(`   File size: ${(html.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Find the </head> tag
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    console.error('❌ Could not find </head> tag');
    return;
  }
  
  // Create JavaScript dependencies to inject
  const jsDependencies = `
<!-- JavaScript Dependencies for Interactive Elements -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

<script>
// Stub functions for missing dependencies
window.createObject = function(key, value) {
  if (!window.digitalData) window.digitalData = {};
  const keys = key.split('.');
  let obj = window.digitalData;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  console.log('createObject:', key, '=', value);
};

window.getCookieByName = function(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Stub for Adobe Analytics
window._satellite = window._satellite || {};
window._satellite.getVar = function(key) { return null; };
window._satellite.logger = { info: function() {}, error: function() {}, warn: function() {} };

// Stub for digitalData
window.digitalData = window.digitalData || {
  page: { pageInfo: {}, content: {} },
  site: {}
};

// Make jQuery available globally
if (typeof jQuery !== 'undefined') {
  window.$ = window.jQuery = jQuery;
}

console.log('✅ JavaScript dependencies loaded');
</script>
`;
  
  // Insert before </head>
  html = html.slice(0, headEndIndex) + jsDependencies + html.slice(headEndIndex);
  
  console.log('✅ JavaScript dependencies added');
  console.log('   - jQuery 3.7.1 (from CDN)');
  console.log('   - createObject() stub function');
  console.log('   - getCookieByName() stub function');
  console.log('   - Adobe Analytics stubs\n');
  
  // Save fixed HTML
  console.log('💾 Saving fixed HTML...');
  const outputFile = path.join(websiteDir, 'index-fully-functional.html');
  fs.writeFileSync(outputFile, html);
  
  console.log(`\n✅ Website fixed!`);
  console.log(`   Original: ${htmlFile}`);
  console.log(`   Fixed: ${outputFile}`);
  console.log(`   Size: ${(html.length / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('🎉 Done! Buttons and interactive elements should now work!');
}

fixJavaScriptDependencies();

























































