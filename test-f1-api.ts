/**
 * COD-19: F1 Racing Website - API-Based E2E Test
 * Using correct API format for website generation
 */

const BASE_URL = 'http://localhost:5000';

async function generateF1Website() {
  console.log('\n🏎️  F1 RACING WEBSITE - E2E GENERATION TEST\n');
  console.log('='.repeat(60));
  
  // Correct format based on routes.ts
  const requestBody = {
    requirements: {
      businessName: 'Velocity F1 Racing',
      businessType: 'Sports & Racing',
      industry: 'motorsport',
      projectOverview: 'Elite Formula 1 racing team competing at the highest level of motorsport. Home of world champions, cutting-edge technology, and racing excellence.',
      city: 'Monaco',
      region: 'Monaco',
      country: 'Monaco',
      services: [
        { name: 'F1 Racing', description: 'Competing in the FIA Formula 1 World Championship' },
        { name: 'Driver Academy', description: 'Developing the next generation of racing champions' },
        { name: 'Engineering', description: 'Cutting-edge aerodynamics and powertrain development' },
        { name: 'Hospitality', description: 'VIP experiences at Grand Prix events worldwide' }
      ],
      pages: ['Home', 'Team', 'Drivers', 'News', 'Calendar', 'Gallery', 'Contact'],
      businessPhone: '+377 99 99 9999',
      businessEmail: 'info@velocityf1.com',
      businessAddress: 'Circuit de Monaco, Monte Carlo',
      projectSlug: 'velocity-f1-racing',
    },
    investigation: {
      targetAudience: 'F1 enthusiasts, sponsors, media, potential team members',
      competitorAnalysis: ['McLaren', 'Ferrari', 'Red Bull Racing', 'Mercedes AMG'],
      uniqueSellingPoints: ['Championship-winning legacy', 'State-of-the-art facilities', 'World-class drivers'],
      brandVoice: 'Bold, dynamic, professional, passionate about racing',
      colorPreferences: ['#E10600', '#15151E', '#FFFFFF'], // F1 Red, Dark, White
    },
    enableLivePreview: false,
  };
  
  console.log('📋 Business Details:');
  console.log(`   Name: ${requestBody.requirements.businessName}`);
  console.log(`   Type: ${requestBody.requirements.businessType}`);
  console.log(`   Location: ${requestBody.requirements.city}, ${requestBody.requirements.country}`);
  console.log(`   Pages: ${requestBody.requirements.pages.join(', ')}`);
  
  console.log('\n📡 Sending generation request to /api/website-builder/generate...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/website-builder/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log(`📬 Response Status: ${response.status}`);
    console.log(`📬 Content-Type: ${response.headers.get('content-type')}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status);
      console.error('   Response:', errorText.substring(0, 500));
      return { success: false, error: `API returned ${response.status}` };
    }
    
    // Handle SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let projectId: string | undefined;
    let website: any = null;
    let lastProgress = 0;
    
    if (reader) {
      console.log('📊 Generation Progress:\n');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());
              
              // Show progress
              if (data.progress !== undefined && data.progress !== lastProgress) {
                const bar = '█'.repeat(Math.floor(data.progress / 5)) + '░'.repeat(20 - Math.floor(data.progress / 5));
                const stage = data.stage || data.message || 'Processing';
                console.log(`   [${bar}] ${data.progress}% - ${stage}`);
                lastProgress = data.progress;
              }
              
              // Capture project/website data
              if (data.projectId) projectId = data.projectId;
              if (data.website) website = data.website;
              if (data.generationId) console.log(`   Generation ID: ${data.generationId}`);
              
              // Check completion
              if (data.stage === 'complete' || data.progress === 100) {
                console.log('\n✅ Generation Complete!');
              }
              
              // Check for errors
              if (data.error) {
                console.error('\n❌ Generation Error:', data.error);
                return { success: false, error: data.error };
              }
              
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 GENERATION RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Status: SUCCESS`);
    console.log(`⏱️  Duration: ${duration}s`);
    
    if (website) {
      console.log(`\n📄 Generated Website:`);
      console.log(`   Project: ${website.projectSlug || 'velocity-f1-racing'}`);
      console.log(`   Pages: ${website.pages?.length || 1}`);
      
      if (website.pages) {
        website.pages.forEach((page: any, i: number) => {
          console.log(`   ${i + 1}. ${page.title || page.slug}`);
        });
      }
      
      // Save the generated website
      const fs = await import('fs');
      const outputDir = 'C:/CURSOR PROJECTS/StargatePortal/website_projects/velocity-f1-racing';
      
      try {
        fs.mkdirSync(outputDir, { recursive: true });
        
        if (website.pages && website.pages[0]) {
          const htmlPath = `${outputDir}/index.html`;
          fs.writeFileSync(htmlPath, website.pages[0].html || '<!-- No HTML generated -->');
          console.log(`\n💾 Saved to: ${htmlPath}`);
        }
        
        // Save full response
        fs.writeFileSync(`${outputDir}/generation-data.json`, JSON.stringify(website, null, 2));
        console.log(`💾 Full data: ${outputDir}/generation-data.json`);
        
      } catch (saveErr: any) {
        console.log(`⚠️  Could not save files: ${saveErr.message}`);
      }
    }
    
    console.log(`\n🌐 Preview URL: ${BASE_URL}/preview/${website?.projectSlug || 'velocity-f1-racing'}`);
    
    return { success: true, website, duration };
    
  } catch (error: any) {
    console.error('\n❌ Request Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
generateF1Website().then(result => {
  console.log('\n🏁 Test Complete!\n');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
