/**
 * Test Script: Generate a beautiful website using Merlin v6.10
 * This script tests the complete v6.10 pipeline with all latest features
 */

import { generateWebsiteWithLLM } from './server/services/merlinDesignLLM';
import { createProjectConfig } from './server/services/projectConfig';
import * as fs from 'fs';
import * as path from 'path';

// Beautiful modern SaaS website configuration
const beautifulWebsite = {
  name: 'Aurora Design Studio',
  config: {
    projectName: 'Aurora Design Studio',
    industry: 'Creative Agency / Design',
    location: {
      city: 'San Francisco',
      region: 'CA',
      country: 'USA'
    },
    targetAudiences: ['Creative businesses, startups, brands seeking premium design'],
    toneOfVoice: 'Creative, modern, elegant, inspiring',
    services: [
      { name: 'Brand Identity Design', shortDescription: 'Complete brand identity systems' },
      { name: 'Web Design & Development', shortDescription: 'Modern, responsive websites' },
      { name: 'UI/UX Design', shortDescription: 'User-centered interface design' },
      { name: 'Creative Strategy', shortDescription: 'Strategic creative direction' }
    ],
    pagesToGenerate: ['Home'],
    brandPreferences: {
      colorPalette: {
        primary: '#6366F1', // Indigo
        secondary: '#8B5CF6', // Purple
        accent: '#EC4899' // Pink
      }
    },
    specialNotes: 'Premium creative design studio specializing in modern, elegant brand identities and digital experiences. Focus on luxury brands and innovative startups.'
  }
};

async function generateBeautifulWebsite() {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 MERLIN v6.10 - GENERATING BEAUTIFUL WEBSITE');
  console.log('='.repeat(80) + '\n');

  try {
    // Create project config
    console.log('📝 Creating project configuration...');
    const projectConfig = createProjectConfig(
      beautifulWebsite.config.projectName,
      beautifulWebsite.config.industry,
      beautifulWebsite.config.location,
      beautifulWebsite.config.targetAudiences,
      beautifulWebsite.config.toneOfVoice,
      beautifulWebsite.config.services,
      beautifulWebsite.config.pagesToGenerate,
      beautifulWebsite.config.brandPreferences,
      beautifulWebsite.config.specialNotes
    );

    console.log(`✅ Project created: ${projectConfig.projectName}`);
    console.log(`   Slug: ${projectConfig.projectSlug}`);
    console.log(`   Industry: ${projectConfig.industry}`);
    console.log(`   Services: ${projectConfig.services.length}\n`);

    // Generate website using v6.10 pipeline
    console.log('🚀 Starting v6.10 generation pipeline...');
    console.log('   This includes:');
    console.log('   - AI Section Planning (v6.1)');
    console.log('   - AI Style Designer (v6.2)');
    console.log('   - Component Variants (v6.3)');
    console.log('   - Responsive Engine (v6.4)');
    console.log('   - AI Image Planner (v6.5)');
    console.log('   - AI Copywriting (v6.6)');
    console.log('   - AI SEO Engine (v6.7)');
    console.log('   - Multi-Page Architecture (v6.8)');
    console.log('   - Global Theme Engine (v6.9)');
    console.log('   - Cleanup & Hardening (v6.10)\n');

    const startTime = Date.now();
    const website = await generateWebsiteWithLLM(projectConfig, 'html', 1);
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`\n✅ Website generated in ${duration} seconds!\n`);

    // Show results
    console.log('📊 Generation Results:');
    console.log(`   - Layout sections: ${website.layout.sections.length}`);
    console.log(`   - Style system: ${website.styleSystem ? '✅' : '❌'}`);
    console.log(`   - Copy content: ${website.copy ? '✅' : '❌'}`);
    console.log(`   - HTML generated: ${website.code.html.length > 0 ? '✅' : '❌'}`);
    console.log(`   - CSS generated: ${website.code.css.length > 0 ? '✅' : '❌'}`);
    if (website.qualityScore) {
      console.log(`   - Quality score: ${website.qualityScore.visualDesign}/10`);
    }

    // Find output directory
    const outputDir = path.join(process.cwd(), 'website_projects', projectConfig.projectSlug, 'generated-v5');
    
    if (fs.existsSync(outputDir)) {
      console.log(`\n📁 Output directory: ${outputDir}`);
      
      // List generated files
      const files = fs.readdirSync(outputDir);
      console.log(`\n📄 Generated files (${files.length}):`);
      files.forEach(file => {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          const size = (stats.size / 1024).toFixed(2);
          console.log(`   - ${file} (${size} KB)`);
        }
      });

      // Check for multi-page files
      const htmlFiles = files.filter(f => f.endsWith('.html'));
      if (htmlFiles.length > 1) {
        console.log(`\n🌐 Multi-page website generated:`);
        htmlFiles.forEach(file => {
          console.log(`   - ${file}`);
        });
      }

      // Check for theme file
      if (files.includes('global-theme.json')) {
        const themePath = path.join(outputDir, 'global-theme.json');
        const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
        console.log(`\n🎨 Global Theme:`);
        console.log(`   - Mood: ${theme.mood}`);
        console.log(`   - Primary: ${theme.palette.primary}`);
        console.log(`   - Display Font: ${theme.typography.fontDisplay}`);
        console.log(`   - Heading Font: ${theme.typography.fontHeading}`);
        console.log(`   - Body Font: ${theme.typography.fontBody}`);
      }

      // Check for metadata
      if (files.includes('metadata.json')) {
        const metadataPath = path.join(outputDir, 'metadata.json');
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        console.log(`\n📋 Pipeline Metadata:`);
        console.log(`   - Pipeline Version: ${metadata.pipelineVersion}`);
        console.log(`   - Modules: ${Object.keys(metadata.modules || {}).length} modules`);
        if (metadata.pages) {
          console.log(`   - Pages: ${metadata.pages.length}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✨ WEBSITE GENERATION COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n🌐 View your website at:`);
    console.log(`   ${outputDir}/index.html`);
    if (htmlFiles && htmlFiles.length > 1) {
      htmlFiles.forEach(file => {
        console.log(`   ${outputDir}/${file}`);
      });
    }
    console.log('\n');

  } catch (error: any) {
    console.error('\n❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the generation
generateBeautifulWebsite().catch(console.error);










