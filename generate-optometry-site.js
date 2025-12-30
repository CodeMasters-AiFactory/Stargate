/**
 * Generate Eugenie Coetzer Optometrists Website
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function generateOptometrySite() {
  console.log('\n🏥 GENERATING OPTOMETRY WEBSITE');
  console.log('Business: Eugenie Coetzer Optometrists\n');
  console.log('='.repeat(70));

  const payload = {
    industry: 'medical', // Medical/Healthcare industry
    businessName: 'Eugenie Coetzer Optometrists',
    description: 'Professional optometry practice in Montana Park, Pretoria, offering comprehensive eye care services with 11+ years of experience. We provide eye examinations, designer frames from brands like Oakley and Boss, contact lenses, and personalized eyewear solutions with impeccable service.',
    style: 'professional',
    colorScheme: 'medical',
    features: [
      'eye-examinations',
      'designer-frames',
      'contact-lenses',
      'comprehensive-care'
    ],
    additionalInfo: {
      location: 'Montana Park, Pretoria, South Africa',
      phone: '012 548 0131',
      email: 'admin@ecoptom.co.za',
      hours: 'Mon-Fri 8:30-17:00, Sat 8:30-12:00',
      experience: '11+ years',
      brands: ['Oakley', 'Boss', 'Adidas', 'Guess', 'Ray-Ban']
    }
  };

  console.log('\n📦 Generation Request:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n⏳ Generating... (this may take 25-35 seconds)\n');

  try {
    const startTime = Date.now();

    const response = await fetch(`${BASE_URL}/api/merlin8/generate-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    console.log(`\n✅ Website Generated Successfully in ${duration}s!`);
    console.log('\n📊 Generation Result:');
    console.log(`   Project Slug: ${result.projectSlug}`);
    console.log(`   Images Generated: ${result.imagesGenerated}`);
    console.log(`   Industry: ${result.industry.name}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`\n🌐 Preview URL:`);
    console.log(`   ${BASE_URL}${result.previewUrl}`);

    // Save result
    const resultFile = 'c:/CURSOR PROJECTS/StargatePortal/optometry-generation-result.json';
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Result saved to: ${resultFile}`);

    // Check files
    if (result.outputPath) {
      console.log(`\n📁 Files created at:`);
      console.log(`   ${result.outputPath}`);

      const files = fs.readdirSync(result.outputPath);
      console.log(`\n   Generated files (${files.length}):`);
      files.forEach(file => {
        const stats = fs.statSync(`${result.outputPath}/${file}`);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   - ${file} (${size} KB)`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ OPTOMETRY WEBSITE GENERATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n🎉 Your new website is ready!`);
    console.log(`   Open: ${BASE_URL}${result.previewUrl}`);
    console.log('\n');

    return result;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run
generateOptometrySite()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
