/**
 * Website Diagnostic Tool
 * Shows what's wrong and allows immediate reconstruction
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectSlug = 'blue-horizon-consulting';
const outputDir = path.join(__dirname, 'website_projects', projectSlug, 'generated-v5');

console.log('🔍 DIAGNOSING WEBSITE ISSUES...\n');
console.log('='.repeat(60));

// Check if files exist
const issues = [];

if (!fs.existsSync(outputDir)) {
  issues.push('❌ Output directory does not exist');
} else {
  console.log('✅ Output directory exists');

  // Check HTML files
  const htmlFiles = ['index.html', 'about.html', 'services.html', 'contact.html'];
  htmlFiles.forEach(file => {
    const filePath = path.join(outputDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for placeholder content
      if (content.includes('- hero') || content.includes('- services')) {
        issues.push(`⚠️  ${file}: Contains placeholder text (e.g., "- hero", "- services")`);
      }

      // Check for empty sections
      if (content.includes('<main class="main-content">') && content.split('<section').length < 3) {
        issues.push(`⚠️  ${file}: Very few sections (may be empty)`);
      }

      // Check for missing CSS link
      if (!content.includes('main.css')) {
        issues.push(`❌ ${file}: Missing CSS link`);
      }

      console.log(`✅ ${file}: Exists (${(content.length / 1024).toFixed(1)} KB)`);
    } else {
      issues.push(`❌ ${file}: Missing`);
    }
  });

  // Check CSS
  const cssPath = path.join(outputDir, 'assets', 'styles', 'main.css');
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Check for wrong background color
    if (css.includes('background-color: #6B7280')) {
      issues.push('❌ CSS: Wrong background color (#6B7280 instead of white)');
    }

    // Check for missing styles
    if (!css.includes('.hero')) {
      issues.push('⚠️  CSS: Missing hero styles');
    }

    console.log(`✅ main.css: Exists (${(css.length / 1024).toFixed(1)} KB)`);
  } else {
    issues.push('❌ main.css: Missing');
  }

  // Check JS
  const jsPath = path.join(outputDir, 'assets', 'scripts', 'main.js');
  if (fs.existsSync(jsPath)) {
    console.log(`✅ main.js: Exists`);
  } else {
    issues.push('❌ main.js: Missing');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📋 ISSUES FOUND:\n');

if (issues.length === 0) {
  console.log('✅ No issues found! Website looks good.');
} else {
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🔧 RECOMMENDED FIXES:\n');
  console.log('1. Regenerate with better copy (AI-generated, not placeholders)');
  console.log('2. Fix CSS background color');
  console.log('3. Ensure all sections have proper content');
  console.log('4. Add more sections per page');
  console.log('\nRun: npm run fix-website');
}

console.log('\n' + '='.repeat(60));
console.log(
  '🌐 View at: http://localhost:5000/website_projects/blue-horizon-consulting/generated-v5/index.html'
);
