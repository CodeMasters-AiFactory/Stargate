/**
 * Script to use PWC template to build a website
 * Usage: npx tsx scripts/use-pwc-template.ts
 */

import { loadTemplate, generateFromTemplate } from '../server/services/templateBasedGenerator';
import * as path from 'path';

const PWC_TEMPLATE_ID = 'pwc-audit-and-assurance-consulting-and-tax-service-accounting-4782024533';

async function main() {
  console.log('🚀 Loading PWC Template...\n');
  
  try {
    // Load the PWC template
    const template = await loadTemplate(PWC_TEMPLATE_ID);
    
    if (!template) {
      console.error('❌ PWC template not found!');
      console.log(`Looking for template ID: ${PWC_TEMPLATE_ID}`);
      console.log('Make sure the template exists in scraped_templates/ or database.');
      process.exit(1);
    }
    
    console.log('✅ PWC Template Loaded Successfully!');
    console.log(`   Name: ${template.name}`);
    console.log(`   Brand: ${template.brand}`);
    console.log(`   Industry: ${template.industry}`);
    console.log(`   HTML Size: ${template.html?.length || 0} characters`);
    console.log(`   CSS Size: ${template.css?.length || 0} characters`);
    console.log(`   Images: ${template.images?.length || 0}`);
    console.log('');
    
    // Example client info - user should customize this
    const clientInfo = {
      businessName: 'Your Business Name',
      industry: 'Accounting',
      location: {
        city: 'New York',
        state: 'NY',
        country: 'US',
      },
      email: 'contact@yourbusiness.com',
      phone: '+1-555-0123',
      tagline: 'Professional accounting services',
    };
    
    console.log('📝 Template Details:');
    console.log(`   Original Brand: ${template.brand}`);
    console.log(`   Template will be customized for: ${clientInfo.businessName}`);
    console.log('');
    console.log('💡 To use this template in the wizard:');
    console.log(`   1. Go to http://localhost:5000/stargate-websites`);
    console.log(`   2. Select industry: ${template.industry || 'Accounting'}`);
    console.log(`   3. Search for template ID: ${PWC_TEMPLATE_ID}`);
    console.log(`   4. Or search for brand: ${template.brand}`);
    console.log('');
    console.log('📋 Template is ready to use!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

