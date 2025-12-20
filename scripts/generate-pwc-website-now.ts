/**
 * Generate a website using the PWC template with example business info
 * Usage: npx tsx scripts/generate-pwc-website-now.ts
 */

import { generateFromTemplate } from '../server/services/templateBasedGenerator';
import * as fs from 'fs';
import * as path from 'path';

const PWC_TEMPLATE_ID = 'pwc-audit-and-assurance-consulting-and-tax-service-accounting-4782024533';

async function main() {
  console.log('🚀 Generating Website from PWC Template...\n');
  
  // Example business information
  const clientInfo = {
    businessName: 'Premier Accounting Solutions',
    industry: 'Accounting',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'US',
    },
    email: 'contact@premieraccounting.com',
    phone: '+1-555-123-4567',
    tagline: 'Expert accounting services you can trust',
    services: [
      { name: 'Tax Preparation', description: 'Professional tax preparation and filing services' },
      { name: 'Financial Consulting', description: 'Comprehensive financial planning and consulting' },
      { name: 'Audit Services', description: 'Thorough audit and assurance services' },
      { name: 'Bookkeeping', description: 'Accurate bookkeeping and accounting services' },
    ],
  };
  
  console.log('📝 Client Information:');
  console.log(`   Business: ${clientInfo.businessName}`);
  console.log(`   Industry: ${clientInfo.industry}`);
  console.log(`   Location: ${clientInfo.location.city}, ${clientInfo.location.state}`);
  console.log(`   Email: ${clientInfo.email}`);
  console.log(`   Phone: ${clientInfo.phone}\n`);
  
  console.log('🔄 Starting generation...');
  console.log('   This will:');
  console.log('   - Replace all PWC content with your business info');
  console.log('   - Generate new images for accounting industry');
  console.log('   - Rewrite all text content');
  console.log('   - Update contact information\n');
  
  try {
    const result = await generateFromTemplate(
      PWC_TEMPLATE_ID,
      clientInfo,
      {
        onProgress: (phase, current, total) => {
          const percent = Math.round((current / total) * 100);
          process.stdout.write(`\r   ${phase}: ${percent}% (${current}/${total})`);
        }
      }
    );
    
    if (!result.success) {
      console.error('\n❌ Generation failed:', result.errors);
      process.exit(1);
    }
    
    console.log('\n\n✅ Website Generated Successfully!');
    console.log(`   HTML: ${result.html.length.toLocaleString()} characters`);
    console.log(`   CSS: ${result.css.length.toLocaleString()} characters`);
    console.log(`   Images Replaced: ${result.replacedImages.length}`);
    console.log(`   Content Changes: ${result.contentChanges}\n`);
    
    // Save to file
    const outputDir = path.join(process.cwd(), 'website_projects', 'premier-accounting-pwc');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outputDir, 'index.html'), result.html);
    fs.writeFileSync(path.join(outputDir, 'styles.css'), result.css);
    
    // Save image info
    const imageInfo = result.replacedImages.map(img => ({
      original: img.originalUrl,
      generated: img.generatedUrl,
      description: img.description,
    }));
    fs.writeFileSync(
      path.join(outputDir, 'images.json'),
      JSON.stringify(imageInfo, null, 2)
    );
    
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log(`   - index.html (${(result.html.length / 1024).toFixed(2)} KB)`);
    console.log(`   - styles.css (${(result.css.length / 1024).toFixed(2)} KB)`);
    console.log(`   - images.json (${result.replacedImages.length} images)\n`);
    
    console.log('🎉 Done! Your website is ready.');
    console.log(`\n💡 Open ${outputDir}/index.html in a browser to preview!`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();

