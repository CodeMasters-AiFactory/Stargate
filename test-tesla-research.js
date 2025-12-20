/**
 * Test Script: Tesla Research for 15-Page Website
 * This script triggers the investigation/research API for Tesla
 */

// Use dynamic import for node-fetch (ESM module)
const fetch = (await import('node-fetch')).default;

const TESLA_REQUIREMENTS = {
  businessType: 'Electric Vehicle Manufacturer',
  businessName: 'Tesla',
  targetAudience: 'Electric vehicle enthusiasts, tech-savvy consumers, environmentally conscious buyers',
  pages: [
    'Home',
    'About',
    'Models',
    'Technology',
    'Charging',
    'Energy',
    'Supercharger Network',
    'Autopilot',
    'Sustainability',
    'Investor Relations',
    'Careers',
    'Support',
    'Store',
    'Blog',
    'Contact'
  ],
  features: [
    'Electric Vehicles',
    'Energy Products',
    'Autopilot Technology',
    'Supercharger Network',
    'Solar Energy',
    'Battery Storage'
  ],
  description: 'Tesla is accelerating the world\'s transition to sustainable energy with electric vehicles, solar panels, and integrated renewable energy solutions.',
};

async function startTeslaResearch() {
  // Import fetch at runtime
  const { default: fetch } = await import('node-fetch');
  console.log('🚀 Starting Tesla Research for 15-Page Website...\n');
  console.log('Business:', TESLA_REQUIREMENTS.businessName);
  console.log('Pages:', TESLA_REQUIREMENTS.pages.length);
  console.log('Pages:', TESLA_REQUIREMENTS.pages.join(', '));
  console.log('\n📡 Connecting to investigation API...\n');

  try {
    const response = await fetch('http://localhost:5000/api/website-builder/investigate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TESLA_REQUIREMENTS),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Connected! Streaming research progress...\n');
    console.log('=' .repeat(60));
    console.log('LIVE RESEARCH ACTIVITIES:');
    console.log('=' .repeat(60) + '\n');

    // Handle SSE stream - node-fetch v2 uses body as a stream
    const decoder = new TextDecoder();
    let buffer = '';

    // Read stream chunk by chunk
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            // Display activity
            if (data.stage && data.message) {
              const timestamp = new Date().toLocaleTimeString();
              const activityType = data.stage.includes('keyword') || data.stage.includes('research') ? '🔍 SEARCH' :
                                  data.stage.includes('analysis') || data.stage.includes('competitor') ? '📊 ANALYSIS' :
                                  data.stage.includes('strategy') || data.stage.includes('planning') ? '💡 FINDING' : '✓ CHECK';
              
              console.log(`[${timestamp}] ${activityType} - ${data.message}`);
              if (data.progress !== undefined) {
                console.log(`   Progress: ${data.progress}%`);
              }
            }
            
            // Show progress updates
            if (data.progress !== undefined && data.stage) {
              const progressBar = '█'.repeat(Math.floor(data.progress / 5)) + '░'.repeat(20 - Math.floor(data.progress / 5));
              console.log(`   [${progressBar}] ${data.progress}%`);
            }
            
            // Show completion
            if (data.stage === 'complete' && data.data) {
              console.log('\n🎉 Investigation Complete!');
              console.log('Results:', JSON.stringify(data.data, null, 2));
            }
          } catch (e) {
            // Skip invalid JSON
          }
        } else if (line.startsWith(': ')) {
          // SSE comment
          if (line.includes('connected')) {
            console.log('✅ SSE connection established\n');
          }
        }
      }
    }
    
    console.log('\n✅ Research complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the research
startTeslaResearch().catch(console.error);

