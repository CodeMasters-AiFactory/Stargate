/**
 * Smoke Test: Top 100 Design Quality Scraper
 * Tests the entire flow: search → scrape → create templates
 */

import { scrapeTopDesignWebsites } from '../services/designQualityScraper';
import { scrapeWebsiteFull } from '../services/websiteScraper';
import { createTemplateFromScrape } from '../services/websiteScraper';
import { db } from '../db';
import { templateSources, scrapedContent, brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function smokeTestTop100Design() {
  console.log('🧪 SMOKE TEST: Top 100 Design Quality Scraper');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Search for top 100 design websites
    console.log('\n📊 Step 1: Searching for top 100 design websites...');
    const designWebsites = await scrapeTopDesignWebsites('Top 100', 10); // Small limit for smoke test
    
    console.log(`✅ Found ${designWebsites.length} design-quality websites`);
    
    if (designWebsites.length === 0) {
      console.log('⚠️  No websites found. This may be due to:');
      console.log('   - Google Custom Search API not configured');
      console.log('   - Rate limiting');
      console.log('   - No results for the search query');
      return;
    }
    
    // Step 2: Scrape first 3 websites (smoke test - small sample)
    console.log(`\n🔍 Step 2: Scraping first 3 websites (smoke test)...`);
    const testLimit = Math.min(3, designWebsites.length);
    const results: Array<{
      url: string;
      success: boolean;
      templateId?: string;
      error?: string;
    }> = [];
    
    for (let i = 0; i < testLimit; i++) {
      const website = designWebsites[i];
      console.log(`\n[${i + 1}/${testLimit}] Scraping: ${website.url}`);
      
      try {
        // Scrape website
        const scrapedData = await scrapeWebsiteFull(website.url);
        
        if (scrapedData.error) {
          console.log(`   ❌ Scraping failed: ${scrapedData.error}`);
          results.push({
            url: website.url,
            success: false,
            error: scrapedData.error,
          });
          continue;
        }
        
        console.log(`   ✅ Scraped successfully`);
        
        // Create source
        let sourceId: string | undefined;
        if (db) {
          const existingSource = await db
            .select()
            .from(templateSources)
            .where(eq(templateSources.websiteUrl, website.url))
            .limit(1);
          
          if (existingSource.length > 0) {
            sourceId = existingSource[0].id;
          } else {
            const [newSource] = await db
              .insert(templateSources)
              .values({
                companyName: website.title || scrapedData.companyName,
                websiteUrl: website.url,
                industry: 'Top 100',
                country: 'United States',
                state: null,
                city: null,
                currentRanking: null,
                isActive: true,
              })
              .returning();
            
            sourceId = newSource.id;
          }
          
          // Save scraped content
          if (sourceId) {
            await db
              .insert(scrapedContent)
              .values({
                sourceId,
                htmlContent: scrapedData.htmlContent,
                cssContent: scrapedData.cssContent,
                images: scrapedData.images as any,
                textContent: scrapedData.textContent as any,
                designTokens: scrapedData.designTokens as any,
                version: '1',
              })
              .onConflictDoNothing();
          }
        }
        
        // Create template
        if (sourceId) {
          const template = createTemplateFromScrape(
            scrapedData,
            sourceId,
            'Top 100',
            'United States',
            undefined,
            undefined,
            undefined,
            'Top 100',
            true,
            website.designScore,
            website.awardSource
          );
          
          // Save template to database
          if (db) {
            await db
              .insert(brandTemplates)
              .values({
                id: template.id,
                name: template.name,
                brand: template.brand,
                category: template.category,
                industry: 'Top 100',
                thumbnail: template.thumbnail,
                colors: template.colors as any,
                typography: template.typography as any,
                layout: template.layout as any,
                css: template.css,
                darkMode: template.darkMode || false,
                tags: template.tags as any,
                sourceId: template.sourceId,
                locationCountry: template.locationCountry,
                locationState: template.locationState,
                locationCity: template.locationCity,
                rankingPosition: null,
                contentData: template.contentData as any,
                isDesignQuality: true,
                designCategory: 'Top 100',
                designScore: website.designScore ? String(website.designScore) : null,
                designAwardSource: website.awardSource || null,
                isActive: true,
              })
              .onConflictDoUpdate({
                target: brandTemplates.id,
                set: {
                  name: template.name,
                  brand: template.brand,
                  industry: 'Top 100',
                  designCategory: 'Top 100',
                  isDesignQuality: true,
                  updatedAt: new Date(),
                },
              });
            
            console.log(`   ✅ Template created: ${template.id}`);
            results.push({
              url: website.url,
              success: true,
              templateId: template.id,
            });
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({
          url: website.url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    // Step 3: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SMOKE TEST RESULTS:');
    console.log('='.repeat(60));
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📦 Total websites found: ${designWebsites.length}`);
    console.log(`🧪 Tested: ${testLimit}`);
    
    if (successful > 0) {
      console.log('\n✅ SMOKE TEST PASSED! Templates created successfully.');
      console.log('   Templates are now available in Phase 2 under "Top 100" category.');
    } else {
      console.log('\n⚠️  SMOKE TEST: No templates created. Check errors above.');
    }
    
    return {
      success: successful > 0,
      results,
      summary: {
        totalFound: designWebsites.length,
        tested: testLimit,
        successful,
        failed,
      },
    };
  } catch (error) {
    console.error('❌ SMOKE TEST FAILED:', error);
    throw error;
  }
}

// Run smoke test
if (require.main === module) {
  smokeTestTop100Design()
    .then(() => {
      console.log('\n✅ Smoke test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Smoke test failed:', error);
      process.exit(1);
    });
}

export { smokeTestTop100Design };

