/**
 * Direct script to build a website using the PWC template
 * Usage: npx tsx scripts/build-website-with-pwc-template.ts
 */

import { loadTemplate, generateFromTemplate } from '../server/services/templateBasedGenerator';
import * as fs from 'fs';
import * as path from 'path';

const PWC_TEMPLATE_ID = 'pwc-audit-and-assurance-consulting-and-tax-service-accounting-4782024533';

async function main() {
  console.log('🚀 Building Website with PWC Template...\n');
  
  try {
    // Load the PWC template
    console.log('📂 Step 1: Loading PWC template...');
    const template = await loadTemplate(PWC_TEMPLATE_ID);
    
    if (!template) {
      console.error('❌ PWC template not found!');
      process.exit(1);
    }
    
    console.log(`✅ Template loaded: ${template.name}`);
    console.log(`   Industry: ${template.industry}`);
    console.log(`   Original Brand: ${template.brand}\n`);
    
    // Example client info - USER SHOULD CUSTOMIZE THIS
    const clientInfo = {
      businessName: 'Your Business Name',
      industry: template.industry || 'Accounting',
      location: {
        city: 'New York',
        state: 'NY',
        country: 'US',
      },
      email: 'contact@yourbusiness.com',
      phone: '+1-555-0123',
      tagline: 'Professional accounting services',
      services: [
        { name: 'Tax Preparation', description: 'Expert tax preparation services' },
        { name: 'Financial Consulting', description: 'Comprehensive financial consulting' },
        { name: 'Audit Services', description: 'Professional audit and assurance' },
      ],
    };
    
    console.log('📝 Step 2: Customizing template for client...');
    console.log(`   Business: ${clientInfo.businessName}`);
    console.log(`   Location: ${clientInfo.location.city}, ${clientInfo.location.state}\n`);
    
    console.log('🔄 Step 3: Generating website...');
    console.log('   This will:');
    console.log('   - Replace all PWC content with your business info');
    console.log('   - Generate new images for your industry');
    console.log('   - Rewrite all text content\n');
    
    const result = await generateFromTemplate(
      PWC_TEMPLATE_ID,
      clientInfo,
      {
        onProgress: (phase, current, total) => {
          const percent = Math.round((current / total) * 100);
          console.log(`   ${phase}: ${percent}% (${current}/${total})`);
        }
      }
    );
    
    if (!result.success) {
      console.error('❌ Generation failed:', result.errors);
      process.exit(1);
    }
    
    console.log('\n✅ Website Generated Successfully!');
    console.log(`   HTML: ${result.html.length} characters`);
    console.log(`   CSS: ${result.css.length} characters`);
    console.log(`   Images Replaced: ${result.replacedImages.length}`);
    console.log(`   Content Changes: ${result.contentChanges}\n`);
    
    // Save to file
    const outputDir = path.join(process.cwd(), 'website_projects', 'pwc-customized');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outputDir, 'index.html'), result.html);
    fs.writeFileSync(path.join(outputDir, 'styles.css'), result.css);
    
    console.log(`📁 Files saved to: ${outputDir}`);
    console.log('\n🎉 Done! Your website is ready.');
    console.log('\n💡 Next steps:');
    console.log('   1. Open index.html in a browser to preview');
    console.log('   2. Customize clientInfo in this script for your business');
    console.log('   3. Re-run to regenerate with your information');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

