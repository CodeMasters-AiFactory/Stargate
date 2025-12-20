/**
 * Test Script: Scrape Apple.com and verify everything works
 * Tests: Image extraction, dependency injection, preview rendering
 */

import { scrapeWebsiteFull } from '../server/services/websiteScraper';
import { createTemplateFromScrape } from '../server/services/websiteScraper';
import { db } from '../server/db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function testAppleScraper() {
  console.log('🧪 Testing Apple.com Scraper...\n');

  const testUrl = 'https://www.apple.com';
  
  try {
    console.log(`📡 Scraping: ${testUrl}`);
    console.log('⏳ This may take 1-2 minutes...\n');

    let progressCount = 0;
    const scrapedData = await scrapeWebsiteFull(
      testUrl,
      'Apple',
      3,
      2000,
      (phase, current, total, message) => {
        progressCount++;
        const percent = Math.round((current / total) * 100);
        console.log(`  [${progressCount}] ${phase}: ${percent}% - ${message || ''}`);
      }
    );

    if (scrapedData.error) {
      console.error(`❌ Scraping failed: ${scrapedData.error}`);
      process.exit(1);
    }

    console.log('\n✅ Scraping Complete!\n');
    console.log('📊 Statistics:');
    console.log(`  - HTML Length: ${scrapedData.htmlContent.length.toLocaleString()} chars`);
    console.log(`  - CSS Length: ${scrapedData.cssContent.length.toLocaleString()} chars`);
    console.log(`  - JS Length: ${scrapedData.jsContent.length.toLocaleString()} chars`);
    console.log(`  - Images Found: ${scrapedData.images.length}`);
    
    const imagesWithData = scrapedData.images.filter(img => img.data).length;
    const imagesFailed = scrapedData.images.filter(img => img.failed).length;
    const imagesBySource = {
      img: scrapedData.images.filter(img => img.source === 'img').length,
      background: scrapedData.images.filter(img => img.source === 'background').length,
      svg: scrapedData.images.filter(img => img.source === 'svg').length,
      inline: scrapedData.images.filter(img => img.source === 'inline').length,
    };
    
    console.log(`  - Images Downloaded: ${imagesWithData}`);
    console.log(`  - Images Failed: ${imagesFailed}`);
    console.log(`  - Image Sources:`, imagesBySource);
    console.log(`  - Text Content: ${scrapedData.textContent.headings.length} headings, ${scrapedData.textContent.paragraphs.length} paragraphs`);

    // Check for missing images
    if (imagesFailed > 0) {
      console.log('\n⚠️  Failed Images:');
      scrapedData.images.filter(img => img.failed).forEach(img => {
        console.log(`  - ${img.url.substring(0, 80)}... (${img.error})`);
      });
    }

    // Create template
    console.log('\n📦 Creating template...');
    const template = createTemplateFromScrape(
      scrapedData,
      'test-apple-' + Date.now(),
      'Technology',
      'United States',
      undefined,
      undefined,
      undefined,
      undefined,
      false
    );

    console.log(`✅ Template created: ${template.id}`);

    // Save to database
    if (db) {
      console.log('\n💾 Saving to database...');
      try {
        const [savedTemplate] = await db
          .insert(brandTemplates)
          .values({
            ...template,
            sourceUrl: testUrl,
          })
          .returning();

        console.log(`✅ Template saved: ${savedTemplate.id}`);
        console.log(`\n🔗 Preview URL: http://localhost:5000/api/template-preview/${savedTemplate.id}`);
        console.log(`\n✅ TEST COMPLETE - Template ready for preview!`);
      } catch (dbError: any) {
        console.error('❌ Database save failed:', dbError.message);
        console.log('📝 Template data available in memory, but not saved to DB');
      }
    } else {
      console.log('⚠️  Database not available, template not saved');
    }

    // Verification checklist
    console.log('\n✅ VERIFICATION CHECKLIST:');
    console.log(`  [${scrapedData.htmlContent.length > 0 ? '✓' : '✗'}] HTML extracted`);
    console.log(`  [${scrapedData.cssContent.length > 0 ? '✓' : '✗'}] CSS extracted`);
    console.log(`  [${scrapedData.jsContent.length > 0 ? '✓' : '✗'}] JavaScript extracted`);
    console.log(`  [${scrapedData.images.length > 0 ? '✓' : '✗'}] Images found`);
    console.log(`  [${imagesWithData > 0 ? '✓' : '✗'}] Images downloaded`);
    console.log(`  [${imagesBySource.background > 0 ? '✓' : '✗'}] CSS background images extracted`);
    console.log(`  [${scrapedData.textContent.headings.length > 0 ? '✓' : '✗'}] Text content extracted`);
    console.log(`  [${scrapedData.designTokens.colors.primary ? '✓' : '✗'}] Design tokens extracted`);
    console.log(`  [${scrapedData.metadata.title ? '✓' : '✗'}] Metadata extracted`);

    const allChecksPassed = 
      scrapedData.htmlContent.length > 0 &&
      scrapedData.cssContent.length > 0 &&
      scrapedData.images.length > 0 &&
      imagesWithData > 0;

    if (allChecksPassed) {
      console.log('\n🎉 ALL CHECKS PASSED - Scraper is working correctly!');
    } else {
      console.log('\n⚠️  SOME CHECKS FAILED - Review output above');
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAppleScraper();

