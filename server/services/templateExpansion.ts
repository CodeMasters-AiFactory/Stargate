/**
 * Template Expansion Service
 * Automated weekly scraping pipeline to expand template library
 */

import * as fs from 'fs';
import * as path from 'path';
import { scrapeWebsiteFull } from './websiteScraper';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { getErrorMessage, logError } from '../utils/errorHandler';

const TEMPLATES_DIR = path.join(process.cwd(), 'data', 'templates');

// Ensure templates directory exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

/**
 * Top-ranked sites by industry to scrape weekly
 */
const INDUSTRY_TARGETS: Record<string, Array<{ name: string; url: string; location?: string }>> = {
  'Technology': [
    { name: 'Apple', url: 'https://www.apple.com' },
    { name: 'Microsoft', url: 'https://www.microsoft.com' },
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Tesla', url: 'https://www.tesla.com' },
    { name: 'Adobe', url: 'https://www.adobe.com' },
  ],
  'Healthcare': [
    { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
    { name: 'Cleveland Clinic', url: 'https://www.clevelandclinic.org' },
    { name: 'Johns Hopkins', url: 'https://www.hopkinsmedicine.org' },
  ],
  'Legal': [
    { name: 'LegalZoom', url: 'https://www.legalzoom.com' },
    { name: 'Rocket Lawyer', url: 'https://www.rocketlawyer.com' },
  ],
  'Restaurant': [
    { name: 'McDonald\'s', url: 'https://www.mcdonalds.com' },
    { name: 'Starbucks', url: 'https://www.starbucks.com' },
    { name: 'Chipotle', url: 'https://www.chipotle.com' },
  ],
  'Real Estate': [
    { name: 'Zillow', url: 'https://www.zillow.com' },
    { name: 'Realtor.com', url: 'https://www.realtor.com' },
  ],
  'E-commerce': [
    { name: 'Amazon', url: 'https://www.amazon.com' },
    { name: 'Shopify', url: 'https://www.shopify.com' },
  ],
};

/**
 * Scrape and save template
 */
async function scrapeAndSaveTemplate(
  name: string,
  url: string,
  industry: string,
  location?: string
): Promise<boolean> {
  try {
    console.log(`[TemplateExpansion] 🔍 Scraping ${name} (${url})...`);
    
    const scraped = await scrapeWebsiteFull(url);

    if (!scraped || !scraped.htmlContent) {
      console.warn(`[TemplateExpansion] ⚠️ Failed to scrape ${name}`);
      return false;
    }

    // Generate template ID
    const templateId = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Save to file
    const templateFile = path.join(TEMPLATES_DIR, `${templateId}.json`);
    const templateData = {
      id: templateId,
      name: `${name} Template`,
      brand: name,
      industry,
      locationCountry: location || 'United States',
      html: scraped.htmlContent,
      css: scraped.cssContent || '',
      images: scraped.images || [],
      contentData: {
        html: scraped.htmlContent,
        css: scraped.cssContent || '',
        images: scraped.images || [],
        text: scraped.textContent || {},
      },
      scrapedAt: new Date().toISOString(),
    };

    fs.writeFileSync(templateFile, JSON.stringify(templateData, null, 2));

    // Save to database if available
    if (db) {
      try {
        await db.insert(brandTemplates).values({
          id: templateId,
          name: `${name} Template`,
          brand: name,
          category: industry.toLowerCase(),
          industry,
          css: scraped.cssContent || '',
          contentData: templateData.contentData as any,
          isDesignQuality: false,
          designScore: '85',
        }).onConflictDoNothing();
        console.log(`[TemplateExpansion] ✅ Saved ${name} to database`);
      } catch (dbError) {
        console.warn(`[TemplateExpansion] ⚠️ Database save failed for ${name}, saved to file only`);
      }
    }

    console.log(`[TemplateExpansion] ✅ Successfully scraped and saved ${name}`);
    return true;
  } catch (error) {
    logError(error, `TemplateExpansion - Scrape ${name}`);
    return false;
  }
}

/**
 * Expand template library by scraping top-ranked sites
 */
export async function expandTemplateLibrary(): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  console.log('\n[TemplateExpansion] 🚀 Starting template library expansion...\n');

  let success = 0;
  let failed = 0;
  const total = Object.values(INDUSTRY_TARGETS).reduce((sum, targets) => sum + targets.length, 0);

  for (const [industry, targets] of Object.entries(INDUSTRY_TARGETS)) {
    console.log(`\n[TemplateExpansion] 📦 Processing ${industry} industry...`);
    
    for (const target of targets) {
      const result = await scrapeAndSaveTemplate(
        target.name,
        target.url,
        industry,
        target.location
      );
      
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Rate limiting: wait 3 seconds between scrapes
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n[TemplateExpansion] ✅ Expansion complete: ${success}/${total} successful, ${failed} failed\n`);

  return { success, failed, total };
}

/**
 * Schedule weekly template expansion
 */
export function scheduleWeeklyExpansion(): void {
  // Run every Monday at 2 AM
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(2, 0, 0, 0);

  const msUntilMonday = nextMonday.getTime() - now.getTime();

  setTimeout(() => {
    expandTemplateLibrary().catch(error => {
      logError(error, 'TemplateExpansion - Weekly Schedule');
    });
    
    // Schedule next week
    setInterval(() => {
      expandTemplateLibrary().catch(error => {
        logError(error, 'TemplateExpansion - Weekly Schedule');
      });
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }, msUntilMonday);

  console.log(`[TemplateExpansion] 📅 Scheduled weekly expansion (next run: ${nextMonday.toISOString()})`);
}

