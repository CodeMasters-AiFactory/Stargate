/**
 * Script to generate Sterling website and show results
 * Run with: npx tsx scripts/generate-sterling-demo.ts
 */

import { createSterlingProjectConfig } from '../server/services/sterlingReferenceImplementation';
import { generateUnifiedWebsite } from '../server/services/unifiedWebsiteGenerator';
import { autoAnalyzeProject, getProjectAnalyses } from '../server/services/learningSystem';
import { documentSterlingAnalysis } from '../server/services/sterlingReferenceImplementation';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Starting Sterling Legal Partners Generation...\n');

  try {
    // Step 1: Create project config
    console.log('📝 Step 1: Creating project configuration...');
    const config = createSterlingProjectConfig();
    console.log(`✅ Project created: ${config.projectSlug}\n`);

    // Step 2: Generate website
    console.log('🏗️  Step 2: Generating website using modular system...');
    const website = await generateUnifiedWebsite(config.projectSlug, (progress) => {
      console.log(`   ${progress.currentStep}: ${progress.progress}%`);
    });
    console.log(`✅ Website generated with ${website.pages.length} pages\n`);

    // Step 3: Show folder structure
    console.log('📁 Step 3: Folder Structure:');
    const projectDir = path.join(process.cwd(), 'website_projects', config.projectSlug);
    showFolderStructure(projectDir, '', true);
    console.log('');

    // Step 4: Show homepage HTML (first 100 lines)
    console.log('📄 Step 4: Homepage HTML (first 100 lines):');
    const homepage = website.pages.find(p => p.type === 'home');
    if (homepage) {
      const lines = homepage.html.split('\n').slice(0, 100);
      console.log(lines.join('\n'));
      console.log('\n... (truncated) ...\n');
    }

    // Step 5: Save full HTML to file for review
    if (homepage) {
      const outputPath = path.join(process.cwd(), 'STERLING_HOMEPAGE.html');
      fs.writeFileSync(outputPath, homepage.html, 'utf-8');
      console.log(`💾 Full homepage saved to: ${outputPath}\n`);
    }

    // Step 6: Note about analysis
    console.log('📊 Step 5: Analysis');
    console.log('   Note: To analyze the website, you need a live URL.');
    console.log('   The generated files are in: website_projects/sterling-legal-partners/output/');
    console.log('   You can:');
    console.log('   1. Serve the files locally');
    console.log('   2. Use the Website Analysis UI in the app');
    console.log('   3. Or run: POST /api/website-builder/analyze with the URL\n');

    console.log('✅ Generation Complete!');
    console.log(`\n📂 Project location: ${projectDir}`);
    console.log(`📄 Homepage saved to: STERLING_HOMEPAGE.html`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function showFolderStructure(dir: string, prefix: string, isRoot: boolean = false) {
  if (!fs.existsSync(dir)) {
    console.log('   (directory does not exist)');
    return;
  }

  const items = fs.readdirSync(dir).sort();
  items.forEach((item, index) => {
    const itemPath = path.join(dir, item);
    const isLast = index === items.length - 1;
    const currentPrefix = isRoot ? '' : (isLast ? '└── ' : '├── ');
    const nextPrefix = isRoot ? '' : (isLast ? '    ' : '│   ');

    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      console.log(`${prefix}${currentPrefix}${item}/`);
      showFolderStructure(itemPath, prefix + nextPrefix, false);
    } else {
      const size = stat.size;
      const sizeStr = size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;
      console.log(`${prefix}${currentPrefix}${item} (${sizeStr})`);
    }
  });
}

main();

