/**
 * Test Script for Template-Based Website Generator
 * 
 * This tests the complete workflow:
 * 1. Load the Horizon Services template
 * 2. Replace images with AI-generated ones
 * 3. Rewrite content for a test client
 * 4. Save the output
 */

import { generateFromTemplate, listTemplates, loadTemplate, type ClientInfo } from '../services/templateBasedGenerator';
import * as fs from 'fs';
import * as path from 'path';

// Test client info - Using a fictional HVAC company to test
const testClient: ClientInfo = {
  businessName: "Premier Climate Solutions",
  industry: "HVAC",
  location: {
    city: "Atlanta",
    state: "Georgia",
    country: "United States"
  },
  services: [
    { name: "Air Conditioning Repair", description: "Fast, reliable AC repair for homes and businesses" },
    { name: "Heating System Installation", description: "Expert installation of furnaces and heat pumps" },
    { name: "HVAC Maintenance", description: "Preventive maintenance to keep your systems running efficiently" },
    { name: "Duct Cleaning", description: "Professional duct cleaning for better air quality" },
    { name: "Emergency Service", description: "24/7 emergency HVAC repair when you need it most" }
  ],
  phone: "(404) 555-COOL",
  email: "info@premierclimatesolutions.com",
  address: "1234 Peachtree Street NE, Atlanta, GA 30309",
  tagline: "Your Comfort, Our Priority - Serving Atlanta Since 2010",
  testimonials: [
    { name: "John M.", quote: "Premier Climate Solutions saved us during a heatwave. Fast, professional service!", rating: 5 },
    { name: "Sarah K.", quote: "Best HVAC company in Atlanta. Fair prices and excellent work.", rating: 5 },
    { name: "Mike R.", quote: "They installed our new furnace quickly and cleanly. Highly recommend!", rating: 5 }
  ]
};

async function runTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEMPLATE-BASED GENERATOR TEST');
  console.log('='.repeat(60) + '\n');

  // Step 1: List available templates
  console.log('📋 Step 1: Listing available templates...');
  const templates = await listTemplates();
  console.log(`   Found ${templates.length} template(s):`);
  templates.forEach(t => {
    console.log(`   - ${t.id}: ${t.name} (${t.industry})`);
  });

  if (templates.length === 0) {
    console.error('❌ No templates found! Please scrape a template first.');
    return;
  }

  // Step 2: Load the template
  const templateId = templates[0].id;
  console.log(`\n📦 Step 2: Loading template "${templateId}"...`);
  const template = await loadTemplate(templateId);
  
  if (!template) {
    console.error('❌ Failed to load template!');
    return;
  }
  
  console.log(`   ✅ Template loaded successfully`);
  console.log(`   - Original Brand: ${template.brand}`);
  console.log(`   - Industry: ${template.industry}`);
  console.log(`   - Images: ${template.images?.length || 0}`);
  console.log(`   - HTML Size: ${(template.html?.length || 0).toLocaleString()} chars`);
  console.log(`   - CSS Size: ${(template.css?.length || 0).toLocaleString()} chars`);

  // Step 3: Generate with content rewriting (skip images for faster test)
  console.log('\n✍️ Step 3: Generating website with content rewriting...');
  console.log(`   Client: ${testClient.businessName}`);
  console.log(`   Location: ${testClient.location.city}, ${testClient.location.state}`);
  
  // For faster testing, we'll skip actual image generation and just do content
  const result = await generateFromTemplate(templateId, testClient, {
    skipImages: true, // Skip for faster testing - we'll test images separately
    skipCleanup: false, // Re-enabled after fixing cleanup function
    onProgress: (phase, current, total) => {
      console.log(`   [${phase}] ${current}/${total}`);
    }
  });

  // Step 4: Analyze results
  console.log('\n📊 Step 4: Results Analysis:');
  console.log(`   Success: ${result.success ? '✅ YES' : '❌ NO'}`);
  console.log(`   Content Changes: ${result.contentChanges}`);
  console.log(`   Images Replaced: ${result.replacedImages.length}`);
  console.log(`   HTML Size: ${result.html.length.toLocaleString()} chars`);
  
  if (result.errors && result.errors.length > 0) {
    console.log(`   Errors: ${result.errors.join(', ')}`);
  }

  // Step 5: Verify brand replacement
  console.log('\n🔍 Step 5: Verifying brand replacement...');
  const originalBrand = template.brand;
  const newBrand = testClient.businessName;
  
  const originalBrandCount = (template.html.match(new RegExp(originalBrand, 'gi')) || []).length;
  const newBrandCount = (result.html.match(new RegExp(newBrand, 'gi')) || []).length;
  const remainingOriginal = (result.html.match(new RegExp(originalBrand, 'gi')) || []).length;
  
  console.log(`   Original brand "${originalBrand}" appeared: ${originalBrandCount} times`);
  console.log(`   New brand "${newBrand}" now appears: ${newBrandCount} times`);
  console.log(`   Original brand remaining: ${remainingOriginal} times`);
  
  if (remainingOriginal === 0) {
    console.log('   ✅ All brand references replaced successfully!');
  } else {
    console.log('   ⚠️ Some original brand references may remain');
  }

  // Step 6: Check for client info
  console.log('\n🔍 Step 6: Verifying client info insertion...');
  const hasPhone = result.html.includes(testClient.phone);
  const hasEmail = result.html.includes(testClient.email);
  const hasCity = result.html.includes(testClient.location.city);
  
  console.log(`   Phone (${testClient.phone}): ${hasPhone ? '✅' : '❌'}`);
  console.log(`   Email (${testClient.email}): ${hasEmail ? '✅' : '❌'}`);
  console.log(`   City (${testClient.location.city}): ${hasCity ? '✅' : '❌'}`);

  // Step 7: Save the output
  console.log('\n💾 Step 7: Saving generated website...');
  const outputDir = path.join(process.cwd(), 'website_projects', 'test-premier-climate');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save HTML
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, result.html);
  console.log(`   ✅ Saved HTML: ${htmlPath}`);
  
  // Save CSS
  const cssPath = path.join(outputDir, 'styles.css');
  fs.writeFileSync(cssPath, result.css);
  console.log(`   ✅ Saved CSS: ${cssPath}`);
  
  // Save generation report
  const reportPath = path.join(outputDir, 'generation-report.json');
  const report = {
    templateId,
    clientInfo: testClient,
    generatedAt: new Date().toISOString(),
    success: result.success,
    contentChanges: result.contentChanges,
    imagesReplaced: result.replacedImages.length,
    errors: result.errors || [],
    verification: {
      brandReplaced: remainingOriginal === 0,
      hasPhone,
      hasEmail,
      hasCity
    }
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`   ✅ Saved Report: ${reportPath}`);

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 TEST COMPLETE');
  console.log('='.repeat(60));
  console.log(`\n📁 Output saved to: ${outputDir}`);
  console.log(`🌐 View at: http://localhost:5000/website_projects/test-premier-climate/index.html`);
  console.log('\n');
}

// Run the test
runTest().catch(console.error);

