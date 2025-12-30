/**
 * MERLIN 8.0 STRESS TEST SCRIPT
 * Generates 100 websites and tests Merlin commands on each
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';

// Industries to test (10 each = 100 total)
const INDUSTRIES = [
  'racing', 'restaurant', 'legal', 'tech', 'realestate',
  'fitness', 'medical', 'photography', 'salon', 'construction'
];

// Business names per industry
const BUSINESS_NAMES = {
  racing: ['Thunder Racing', 'Speed Demons', 'Apex Motorsport', 'Velocity Racing', 'Turbo Track', 'Circuit Masters', 'Racing Edge', 'Pro Drift Academy', 'Fast Lane Racing', 'Championship Motors'],
  restaurant: ['Bella Italia', 'Golden Dragon', 'The Steakhouse', 'Sushi Paradise', 'Taco Fiesta', 'French Bistro', 'Mediterranean Grill', 'Thai Spice', 'BBQ Pit', 'Seafood Harbor'],
  legal: ['Smith and Associates', 'Justice Law Firm', 'Legal Eagles', 'Corporate Counsel', 'Family Law Partners', 'Criminal Defense Pro', 'Immigration Experts', 'Estate Planning LLC', 'Trademark Lawyers', 'Litigation Masters'],
  tech: ['CodeCraft', 'Digital Dynamics', 'CloudNine Systems', 'AI Solutions Inc', 'DataFlow Tech', 'CyberShield', 'AppForge', 'Tech Innovators', 'Smart Systems', 'Future Digital'],
  realestate: ['Dream Homes Realty', 'Prime Properties', 'Luxury Estates', 'Urban Living', 'Coastal Realty', 'Mountain View Homes', 'City Center Properties', 'Suburban Dreams', 'Investment Properties', 'Commercial Realty'],
  fitness: ['Iron Gym', 'FitLife Studio', 'CrossFit Central', 'Yoga Bliss', 'Power House Gym', 'Athletic Edge', 'Body Transformation', 'Cardio Kings', 'Strength Academy', 'Wellness Hub'],
  medical: ['City Medical Center', 'Family Health Clinic', 'Wellness Medical', 'Advanced Care', 'Premier Healthcare', 'Community Hospital', 'Urgent Care Plus', 'Specialty Doctors', 'Health First Clinic', 'Medical Associates'],
  photography: ['Lens Masters', 'Capture Studio', 'Light and Shadow', 'Portrait Pro', 'Wedding Moments', 'Event Photography', 'Commercial Shots', 'Nature Lens', 'Fashion Focus', 'Art Photography'],
  salon: ['Glamour Salon', 'Style Studio', 'Beauty Bar', 'Hair Haven', 'Nail Paradise', 'Spa Retreat', 'Cut and Color', 'The Beauty Spot', 'Luxe Hair', 'Glow Up Studio'],
  construction: ['BuildRight Construction', 'Premier Builders', 'Steel and Stone', 'Foundation Masters', 'Skyline Construction', 'Home Renovators', 'Commercial Builders', 'Quality Contractors', 'Dream Home Builders', 'Concrete Solutions']
};

// Merlin commands to test
const MERLIN_COMMANDS = [
  // Color changes
  'make the color blue',
  'make the color red',
  'make the color green',
  'change color to gold',
  'make primary color navy',
  'change color to #FF5500',
  'make the color purple',
  'change color to teal',
  'make the color coral',
  'change color to indigo',
  // Text changes
  'change "Contact Us" to "Get In Touch"',
  'change "About Us" to "Our Story"',
  'change "Services" to "What We Do"',
  'change "Ready to Get Started?" to "Take the Next Step"',
  // Size changes
  'make text bigger',
  'make text smaller',
  // Help/conversation
  'hello',
  'help',
  'what can you do',
  'thank you'
];

// Results storage
const results = {
  testName: 'Full Template Stress Test - 100 Websites',
  startTime: new Date().toISOString(),
  status: 'in_progress',
  totalWebsites: 100,
  completed: 0,
  failed: 0,
  totalBugsFound: 0,
  totalBugsFixed: 0,
  websites: [],
  bugLog: [],
  commandStats: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

async function generateWebsite(businessName, industry, index) {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

  const payload = {
    businessName,
    description: `${businessName} - A leading ${industry} business providing exceptional services to our community.`,
    industryId: industry,
    generateImages: false, // NO LEONARDO AI
    businessType: 'small',
    targetAudience: {
      audienceType: 'b2c',
      incomeLevel: 'mid'
    },
    designPreferences: {
      colorMood: 'professional'
    },
    features: ['contact-form', 'testimonials'],
    pages: ['home', 'services', 'about', 'contact']
  };

  try {
    const response = await fetch(`${BASE_URL}/api/merlin8/generate-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ [${index}/100] Generated: ${businessName} (${industry}) in ${result.duration}s`);
      return {
        success: true,
        projectSlug: result.projectSlug,
        duration: result.duration,
        outputPath: result.outputPath
      };
    } else {
      console.log(`❌ [${index}/100] FAILED: ${businessName} - ${result.error}`);
      results.bugLog.push({
        type: 'generation_error',
        website: businessName,
        industry,
        error: result.error,
        timestamp: new Date().toISOString()
      });
      results.totalBugsFound++;
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ [${index}/100] ERROR: ${businessName} - ${error.message}`);
    results.bugLog.push({
      type: 'generation_exception',
      website: businessName,
      industry,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    results.totalBugsFound++;
    return { success: false, error: error.message };
  }
}

async function testMerlinCommands(projectSlug, businessName) {
  const htmlPath = path.join(__dirname, 'website_projects', projectSlug, 'merlin8-output', 'index.html');

  if (!fs.existsSync(htmlPath)) {
    console.log(`   ⚠️ HTML not found for ${projectSlug}`);
    return { passed: 0, failed: 0, errors: ['HTML file not found'] };
  }

  let currentHtml = fs.readFileSync(htmlPath, 'utf8');
  const commandResults = { passed: 0, failed: 0, errors: [] };

  // Test 20 commands per website
  const commandsToTest = MERLIN_COMMANDS.slice(0, 20);

  for (const command of commandsToTest) {
    try {
      const response = await fetch(`${BASE_URL}/api/website-editor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: command,
          currentHtml,
          context: { businessName }
        })
      });

      const result = await response.json();
      results.commandStats.total++;

      if (result.success) {
        commandResults.passed++;
        results.commandStats.passed++;
        if (result.updatedHtml) {
          currentHtml = result.updatedHtml;
        }
      } else {
        commandResults.failed++;
        results.commandStats.failed++;
        commandResults.errors.push({ command, error: result.error || result.message });
      }
    } catch (error) {
      commandResults.failed++;
      results.commandStats.failed++;
      commandResults.errors.push({ command, error: error.message });
    }
  }

  // Save updated HTML
  if (currentHtml) {
    fs.writeFileSync(htmlPath, currentHtml);
  }

  return commandResults;
}

function rateWebsite(projectSlug) {
  const htmlPath = path.join(__dirname, 'website_projects', projectSlug, 'merlin8-output', 'index.html');

  if (!fs.existsSync(htmlPath)) {
    return { design: 0, layout: 0, responsiveness: 0, contentQuality: 0, overall: 0 };
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Simple automated rating based on presence of key elements
  let design = 5;
  let layout = 5;
  let responsiveness = 5;
  let contentQuality = 5;

  // Design checks
  if (html.includes('--color-primary')) design += 1;
  if (html.includes('font-family')) design += 1;
  if (html.includes('transition')) design += 1;
  if (html.includes('box-shadow') || html.includes('--shadow')) design += 1;
  if (html.includes('gradient')) design += 1;

  // Layout checks
  if (html.includes('display: grid') || html.includes('display: flex')) layout += 2;
  if (html.includes('max-width')) layout += 1;
  if (html.includes('.hero')) layout += 1;
  if (html.includes('.footer') || html.includes('footer')) layout += 1;

  // Responsiveness checks
  if (html.includes('@media')) responsiveness += 2;
  if (html.includes('clamp(')) responsiveness += 1;
  if (html.includes('min-height: 100vh') || html.includes('min-height:100vh')) responsiveness += 1;
  if (html.includes('object-fit')) responsiveness += 1;

  // Content quality checks
  if (html.includes('<h1>')) contentQuality += 1;
  if (html.includes('<h2>')) contentQuality += 1;
  if (html.includes('<nav>')) contentQuality += 1;
  if (html.includes('meta name="description"')) contentQuality += 1;
  if (html.includes('og:title')) contentQuality += 1;

  // Cap at 10
  design = Math.min(10, design);
  layout = Math.min(10, layout);
  responsiveness = Math.min(10, responsiveness);
  contentQuality = Math.min(10, contentQuality);

  const overall = ((design + layout + responsiveness + contentQuality) / 4).toFixed(2);

  return { design, layout, responsiveness, contentQuality, overall: parseFloat(overall) };
}

async function runStressTest() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🧪 MERLIN 8.0 STRESS TEST - 100 WEBSITES');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📋 Mode: TEMPLATES ONLY (no Leonardo AI)');
  console.log('📋 Industries:', INDUSTRIES.join(', '));
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let websiteIndex = 0;

  for (const industry of INDUSTRIES) {
    console.log(`\n🏭 Industry: ${industry.toUpperCase()}`);
    console.log('─'.repeat(50));

    for (let i = 0; i < 10; i++) {
      websiteIndex++;
      const businessName = BUSINESS_NAMES[industry][i];

      // Generate website
      const genResult = await generateWebsite(businessName, industry, websiteIndex);

      if (genResult.success) {
        // Test Merlin commands
        console.log(`   🔧 Testing Merlin commands on ${businessName}...`);
        const cmdResult = await testMerlinCommands(genResult.projectSlug, businessName);

        // Rate website
        const rating = rateWebsite(genResult.projectSlug);

        results.websites.push({
          websiteId: websiteIndex,
          businessName,
          industry,
          projectSlug: genResult.projectSlug,
          generationTime: `${genResult.duration}s`,
          commandsExecuted: cmdResult.passed + cmdResult.failed,
          commandsPassed: cmdResult.passed,
          commandsFailed: cmdResult.failed,
          errors: cmdResult.errors,
          rating
        });

        results.completed++;
        console.log(`   📊 Rating: ${rating.overall}/10 | Commands: ${cmdResult.passed}/${cmdResult.passed + cmdResult.failed} passed`);

        if (cmdResult.errors.length > 0) {
          results.totalBugsFound += cmdResult.errors.length;
          cmdResult.errors.forEach(err => {
            results.bugLog.push({
              type: 'command_error',
              website: businessName,
              command: err.command,
              error: err.error,
              timestamp: new Date().toISOString()
            });
          });
        }
      } else {
        results.failed++;
      }

      // Save progress every 10 websites
      if (websiteIndex % 10 === 0) {
        fs.writeFileSync(
          path.join(__dirname, 'test-results.json'),
          JSON.stringify(results, null, 2)
        );
        console.log(`\n💾 Progress saved (${websiteIndex}/100 websites)\n`);
      }
    }
  }

  // Final summary
  results.status = 'completed';
  results.endTime = new Date().toISOString();
  results.summary = {
    totalGenerated: results.completed,
    totalFailed: results.failed,
    totalBugsFound: results.totalBugsFound,
    avgRating: results.websites.length > 0
      ? (results.websites.reduce((sum, w) => sum + w.rating.overall, 0) / results.websites.length).toFixed(2)
      : 0,
    commandSuccessRate: results.commandStats.total > 0
      ? ((results.commandStats.passed / results.commandStats.total) * 100).toFixed(1) + '%'
      : '0%'
  };

  fs.writeFileSync(
    path.join(__dirname, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('✅ STRESS TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`📊 Websites Generated: ${results.completed}/100`);
  console.log(`❌ Websites Failed: ${results.failed}`);
  console.log(`🐛 Total Bugs Found: ${results.totalBugsFound}`);
  console.log(`⭐ Average Rating: ${results.summary.avgRating}/10`);
  console.log(`🔧 Command Success Rate: ${results.summary.commandSuccessRate}`);
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📄 Full results saved to: test-results.json');
}

// Run the test
runStressTest().catch(console.error);
