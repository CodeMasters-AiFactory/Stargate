/**
 * Quick Fix Script - Fixes website issues immediately
 * Run: node fix-website-issues.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectSlug = 'blue-horizon-consulting';
const outputDir = path.join(__dirname, 'website_projects', projectSlug, 'generated-v5');

console.log('🔧 FIXING WEBSITE ISSUES...\n');

// Fix 1: CSS Background Color
const cssPath = path.join(outputDir, 'assets', 'styles', 'main.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf-8');

  // Fix wrong background color
  css = css.replace(/background-color:\s*#6B7280;/g, 'background-color: #FFFFFF;');
  css = css.replace(/background-color:\s*#6B7280\s*;/g, 'background-color: #FFFFFF;');

  // Also ensure body has white background
  css = css.replace(/body\s*\{[^}]*background-color:[^;]*;[^}]*\}/, match => {
    if (!match.includes('background-color')) {
      return match.replace('}', '  background-color: #FFFFFF;\n}');
    }
    return match.replace(/background-color:[^;]*;/, 'background-color: #FFFFFF;');
  });

  fs.writeFileSync(cssPath, css, 'utf-8');
  console.log('✅ Fixed CSS background color');
}

// Fix 2: Replace placeholder text in HTML files
const htmlFiles = ['index.html', 'about.html', 'services.html', 'contact.html', 'faq.html'];

const copyReplacements = {
  'index.html': {
    'Blue Horizon Consulting - hero': 'Transform Your Business with Strategic Excellence',
    'Professional Consulting services':
      'Leading consulting firm specializing in strategy, leadership, and market intelligence',
    'We provide exceptional Consulting services in New York.':
      'We help corporate clients and SMEs achieve breakthrough results through proven methodologies and expert guidance.',
  },
  'about.html': {
    'Blue Horizon Consulting - hero': 'About Blue Horizon Consulting',
    'Professional Consulting services': 'Your trusted partner in business transformation',
  },
  'services.html': {
    'Blue Horizon Consulting - services': 'Our Services',
    'We provide exceptional Consulting services in New York.':
      'Comprehensive consulting solutions tailored to your business needs.',
  },
  'contact.html': {
    'Blue Horizon Consulting - hero': 'Get in Touch',
    'Professional Consulting services': "Ready to transform your business? Let's talk.",
  },
};

htmlFiles.forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    const replacements = copyReplacements[file] || {};

    // Apply specific replacements
    Object.entries(replacements).forEach(([old, newText]) => {
      if (html.includes(old)) {
        html = html.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
        changed = true;
      }
    });

    // Generic fixes
    html = html.replace(/Blue Horizon Consulting - (\w+)/g, (match, section) => {
      const sectionNames = {
        hero: 'Transform Your Business',
        services: 'Our Services',
        about: 'About Us',
        contact: 'Contact Us',
      };
      return sectionNames[section] || match;
    });

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`✅ Fixed placeholder text in ${file}`);
    }
  }
});

// Fix 3: Ensure CSS link is correct (relative path)
htmlFiles.forEach(file => {
  const filePath = path.join(outputDir, file);
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf-8');

    // Fix absolute paths to relative
    html = html.replace(/href="\/assets\//g, 'href="assets/');
    html = html.replace(/src="\/assets\//g, 'src="assets/');
    html = html.replace(/src="\/assets\//g, 'src="assets/');

    fs.writeFileSync(filePath, html, 'utf-8');
  }
});

console.log('\n✅ ALL FIXES APPLIED!');
console.log(
  '\n🌐 View at: http://localhost:5000/website_projects/blue-horizon-consulting/generated-v5/index.html'
);
console.log('\n💡 Tip: If issues persist, regenerate the website with:');
console.log('   node test-merlin7-generation.ts');
