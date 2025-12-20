/**
 * Regenerate Blue Origin IT Solutions website
 * Using current Merlin v6.10 pipeline to rebuild from scratch
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const requirements = {
  businessName: "Blue Origin IT Solutions",
  businessType: "IT Services",
  location: {
    city: "San Francisco",
    region: "CA",
    country: "USA"
  },
  services: [
    {
      name: "Software Development",
      description: "Custom software solutions tailored to your business needs"
    },
    {
      name: "Managed IT Support",
      description: "24/7 IT support and infrastructure management"
    },
    {
      name: "Cloud Services",
      description: "Cloud migration, deployment, and optimization"
    },
    {
      name: "Cybersecurity",
      description: "Enterprise-grade security solutions and consulting"
    },
    {
      name: "IT Consulting",
      description: "Strategic IT planning and technology roadmaps"
    }
  ],
  targetAudience: "Business owners and managers",
  primaryGoal: "Generate leads and establish thought leadership",
  tone: "Professional, trustworthy, modern, confident",
  pages: ["Home", "Services", "About", "Contact"],
  brandColors: {
    primary: "#0A3D91",
    secondary: "#1E88E5",
    accent: "#1E88E5"
  },
  stylePreferences: {
    modern: true,
    professional: true,
    minimalist: true,
    highEnd: true
  },
  styleKeywords: ["modern", "professional", "corporate", "tech", "SaaS", "high-end"],
  contentTone: "professional"
};

async function generateWebsite() {
  console.log('🚀 Regenerating Blue Origin IT Solutions website...\n');
  console.log('📋 Requirements:');
  console.log(`   Business: ${requirements.businessName}`);
  console.log(`   Type: ${requirements.businessType}`);
  console.log(`   Pages: ${requirements.pages.join(', ')}`);
  console.log(`   Primary Color: ${requirements.brandColors.primary}`);
  console.log(`   Secondary Color: ${requirements.brandColors.secondary}\n`);

  try {
    // Check if server is running
    try {
      const healthCheck = await fetch('http://localhost:5000/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      
      if (!healthCheck.ok) {
        throw new Error('Server health check failed');
      }
    } catch (error) {
      console.error('❌ Server is not running on port 5000');
      console.error('Please start the server first with: npm run dev');
      process.exit(1);
    }

    console.log('📡 Calling API endpoint...\n');
    
    const response = await fetch('http://localhost:5000/api/website-builder/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        requirements,
        enableLivePreview: false 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Read SSE stream
    const text = await response.text();
    const lines = text.split('\n');
    let lastProgress = { phase: '', currentStep: '', progress: 0, message: '' };
    let result = null;

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          if (data.stage) {
            // Progress update
            if (data.stage !== 'complete' && data.stage !== 'error') {
              process.stdout.write(`\r[${data.stage}] ${data.message || ''} (${data.progress || 0}%)`);
            } else if (data.stage === 'complete') {
              console.log('\n');
              result = data.data;
            } else if (data.stage === 'error') {
              throw new Error(data.error || 'Unknown error');
            }
          } else if (data.phase && data.currentStep) {
            lastProgress = data;
            process.stdout.write(`\r[${data.phase}] ${data.currentStep}: ${data.message || ''} (${data.progress || 0}%)`);
          } else if (data.error) {
            throw new Error(data.error);
          }
        } catch (parseError) {
          // Skip invalid JSON lines
        }
      }
    }

    if (result) {
      console.log('\n✅ Generation complete!');
      
      // Extract project slug from result
      let projectSlug = 'blue-origin-it-solutions';
      if (result.manifest && result.manifest.projectSlug) {
        projectSlug = result.manifest.projectSlug;
      } else if (result.projectSlug) {
        projectSlug = result.projectSlug;
      }
      
      console.log(`\n📁 Project Slug: ${projectSlug}`);
      console.log(`\n🌐 View website at:`);
      console.log(`   http://localhost:5000/website_projects/${projectSlug}/generated-v5/index.html`);
      console.log(`\n📄 Pages generated:`);
      
      // List all pages
      const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
      if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.html'));
        files.forEach(file => {
          console.log(`   - ${file}`);
        });
      }
      
      console.log(`\n✅ Website regeneration complete!`);
      console.log(`\n📊 Next steps:`);
      console.log(`   1. Open the index.html in your browser`);
      console.log(`   2. Check navigation between pages`);
      console.log(`   3. Verify blue color scheme is applied`);
      console.log(`   4. Compare with previous version`);
      
    } else {
      console.log('\n⚠️  Generation completed but no result data received');
    }

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

generateWebsite();

