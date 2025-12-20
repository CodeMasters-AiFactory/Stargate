/**
 * Regenerate the most recently generated website
 * Uses the API endpoint to regenerate from project slug
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

async function findMostRecentWebsite() {
  const projectsDir = path.join(process.cwd(), 'website_projects');
  
  if (!fs.existsSync(projectsDir)) {
    throw new Error('website_projects directory not found');
  }

  const projects = fs.readdirSync(projectsDir).filter(item => {
    const itemPath = path.join(projectsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  let mostRecent = null;
  let mostRecentDate = null;

  for (const project of projects) {
    const metadataPath = path.join(projectsDir, project, 'generated-v5', 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const generatedAt = new Date(metadata.generatedAt);
        
        if (!mostRecentDate || generatedAt > mostRecentDate) {
          mostRecentDate = generatedAt;
          mostRecent = project;
        }
      } catch (error) {
        console.warn(`Warning: Could not read metadata for ${project}:`, error.message);
      }
    }
  }

  if (!mostRecent) {
    throw new Error('No generated websites found');
  }

  return { projectSlug: mostRecent, generatedAt: mostRecentDate };
}

async function reconstructRequirements(projectSlug) {
  const metadataPath = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5', 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata not found for ${projectSlug}`);
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  
  // Reconstruct requirements from metadata
  const projectName = metadata.projectSlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const industry = metadata.styleSystem?.industry || 'Business';
  const pages = metadata.pages?.map(p => p.title) || ['Home', 'Services', 'About', 'Contact'];
  
  return {
    businessName: projectName,
    businessType: industry,
    location: {
      city: 'New York',
      region: 'NY',
      country: 'USA'
    },
    services: [
      { name: 'Professional Services', description: 'Expert solutions for your business needs' }
    ],
    targetAudience: 'Business professionals',
    primaryGoal: 'Generate leads and establish brand presence',
    tone: 'Professional',
    pages: pages,
    stylePreferences: {
      modern: true,
      professional: true
    }
  };
}

async function regenerateWebsite(projectSlug) {
  console.log(`🚀 Regenerating website: ${projectSlug}\n`);

  try {
    // Reconstruct requirements from metadata
    console.log('📋 Reconstructing requirements from metadata...\n');
    const requirements = await reconstructRequirements(projectSlug);
    console.log('Requirements:', JSON.stringify(requirements, null, 2));
    console.log('\n📡 Calling API endpoint...\n');
    
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

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          
          if (data.phase && data.currentStep) {
            lastProgress = data;
            process.stdout.write(`\r[${data.phase}] ${data.currentStep}: ${data.message || ''} (${data.progress || 0}%)`);
          } else if (data.stage === 'complete') {
            console.log('\n');
            console.log('✅ Generation complete!');
            if (data.data && data.data.projectSlug) {
              console.log(`Project Slug: ${data.data.projectSlug}`);
              console.log(`\n🌐 View at: http://localhost:5000/website_projects/${data.data.projectSlug}/generated-v5/index.html`);
            }
          } else if (data.error) {
            throw new Error(data.error);
          }
        } catch (parseError) {
          // Skip invalid JSON lines
          if (line.trim() && !line.startsWith(':')) {
            // Silently skip parse errors for non-JSON lines
          }
        }
      }
    }

    console.log('\n✅ Website regeneration complete!');

  } catch (error) {
    console.error('\n❌ Regeneration failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

async function main() {
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

    // Find most recent website
    const { projectSlug, generatedAt } = await findMostRecentWebsite();
    
    console.log(`📅 Most recent website: ${projectSlug}`);
    console.log(`   Generated: ${generatedAt.toLocaleString()}\n`);

    // Regenerate
    await regenerateWebsite(projectSlug);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main();

