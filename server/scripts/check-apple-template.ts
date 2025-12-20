/**
 * Diagnostic script to check Apple template in database
 */

import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq, or, like } from 'drizzle-orm';

async function checkAppleTemplate() {
  console.log('\n🔍 Checking Apple template in database...\n');

  if (!db) {
    console.error('❌ Database connection not available!');
    console.error('   Check DATABASE_URL environment variable');
    process.exit(1);
  }

  console.log('✅ Database connection available\n');

  try {
    // Check all templates with "apple" in name or brand
    const appleTemplates = await db
      .select()
      .from(brandTemplates)
      .where(
        or(
          like(brandTemplates.name, '%apple%'),
          like(brandTemplates.brand, '%apple%'),
          eq(brandTemplates.id, 'apple-com')
        )
      );

    console.log(`📊 Found ${appleTemplates.length} Apple-related templates:\n`);

    if (appleTemplates.length === 0) {
      console.log('❌ NO APPLE TEMPLATES FOUND IN DATABASE!');
      console.log('\nPossible issues:');
      console.log('1. Template was never saved to database');
      console.log('2. Template was deleted');
      console.log('3. Database connection issue during save');
      console.log('\nChecking all templates...\n');

      // Check total templates
      const allTemplates = await db
        .select({
          id: brandTemplates.id,
          name: brandTemplates.name,
          brand: brandTemplates.brand,
          isActive: brandTemplates.isActive,
        })
        .from(brandTemplates)
        .limit(20);

      console.log(`Total templates in database: ${allTemplates.length}`);
      console.log('\nFirst 20 templates:');
      allTemplates.forEach(t => {
        console.log(`  - ${t.id}: ${t.name} (${t.brand}) - Active: ${t.isActive}`);
      });
    } else {
      appleTemplates.forEach(template => {
        console.log(`✅ Template Found:`);
        console.log(`   ID: ${template.id}`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Brand: ${template.brand}`);
        console.log(`   Industry: ${template.industry || 'N/A'}`);
        console.log(`   Is Active: ${template.isActive}`);
        console.log(`   Is Design Quality: ${template.isDesignQuality || false}`);
        console.log(`   Design Category: ${template.designCategory || 'N/A'}`);
        console.log(`   Created: ${template.createdAt}`);
        console.log(`   Updated: ${template.updatedAt}`);
        
        const contentData = template.contentData as any;
        const hasHtml = contentData?.html ? '✅' : '❌';
        const htmlLength = contentData?.html?.length || 0;
        console.log(`   HTML Content: ${hasHtml} (${htmlLength.toLocaleString()} chars)`);
        console.log(`   CSS Length: ${template.css?.length || 0} chars`);
        console.log('');
      });

      // Check if any are inactive
      const inactive = appleTemplates.filter(t => !t.isActive);
      if (inactive.length > 0) {
        console.log(`⚠️  WARNING: ${inactive.length} Apple template(s) are INACTIVE!`);
        console.log('   They will not show in template selection.');
        console.log('   Fix: Update isActive to true in database.\n');
      }
    }

    // Check total active templates
    const activeCount = await db
      .select()
      .from(brandTemplates)
      .where(eq(brandTemplates.isActive, true));

    console.log(`\n📈 Total active templates: ${activeCount.length}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkAppleTemplate();

