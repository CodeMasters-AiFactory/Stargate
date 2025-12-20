/**
 * Template Ranking Monitor Service
 * 
 * Monitors Google rankings for companies by industry and location,
 * updates rankings weekly, and automatically creates/updates templates
 * for top-ranked companies.
 */

import { db } from '../db';
import { templateSources, rankingHistory, brandTemplates } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { searchGoogleRankings, scrapeWebsiteFull, createTemplateFromScrape } from './websiteScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface MonitoringConfig {
  industries: string[];
  locations: Array<{
    country: string;
    state?: string;
    city?: string;
  }>;
  topN: number; // Number of top companies to monitor (default: 50)
  updateInterval: 'weekly' | 'daily' | 'monthly'; // How often to check rankings
}

/**
 * Check rankings for a specific industry and location
 */
export async function checkRankingsForIndustry(
  industry: string,
  country: string,
  state?: string,
  city?: string,
  limit: number = 50
): Promise<void> {
  console.log(`[RankingMonitor] Checking rankings for ${industry} in ${city || state || country}`);

  try {
    // Search Google for current rankings
    const results = await searchGoogleRankings(industry, country, state, city, limit);

    if (!db) {
      console.error('[RankingMonitor] Database not available');
      return;
    }

    // Update or create template sources
    for (const result of results) {
      try {
        // Check if source already exists
        const existing = await db
          .select()
          .from(templateSources)
          .where(eq(templateSources.websiteUrl, result.websiteUrl))
          .limit(1);

        if (existing.length > 0) {
          // Update existing source
          const source = existing[0];
          const oldRanking = source.currentRanking;
          const newRanking = result.ranking.toString();

          await db
            .update(templateSources)
            .set({
              currentRanking: newRanking,
              lastChecked: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(templateSources.id, source.id));

          // Log ranking change
          if (oldRanking !== newRanking) {
            await db.insert(rankingHistory).values({
              sourceId: source.id,
              ranking: newRanking,
              notes: `Ranking changed from ${oldRanking || 'unknown'} to ${newRanking}`,
            });

            console.log(`[RankingMonitor] Updated ranking for ${source.companyName}: ${oldRanking || 'unknown'} → ${newRanking}`);
          }
        } else {
          // Create new source
          const [newSource] = await db
            .insert(templateSources)
            .values({
              companyName: result.companyName,
              websiteUrl: result.websiteUrl,
              industry: industry,
              country: country,
              state: state || null,
              city: city || null,
              currentRanking: result.ranking.toString(),
              lastChecked: sql`now()`,
              isActive: true,
            })
            .returning();

          // Log initial ranking
          await db.insert(rankingHistory).values({
            sourceId: newSource.id,
            ranking: result.ranking.toString(),
            notes: 'Initial ranking from Google search',
          });

          console.log(`[RankingMonitor] Created new source: ${result.companyName} (Rank #${result.ranking})`);
        }
      } catch (error) {
        logError(error, `RankingMonitor - Update source ${result.websiteUrl}`);
        // Continue with next result
      }
    }

    console.log(`[RankingMonitor] ✅ Completed ranking check for ${industry} in ${city || state || country}`);
  } catch (error) {
    logError(error, `RankingMonitor - Check rankings ${industry}`);
    throw error;
  }
}

/**
 * Update templates for top-ranked companies
 * Scrapes websites and creates/updates templates for companies in top N
 */
export async function updateTemplatesForTopRanked(
  industry: string,
  country: string,
  state?: string,
  city?: string,
  topN: number = 50
): Promise<void> {
  console.log(`[RankingMonitor] Updating templates for top ${topN} in ${industry} (${city || state || country})`);

  if (!db) {
    console.error('[RankingMonitor] Database not available');
    return;
  }

  try {
    // Get top-ranked sources
    const conditions = [
      eq(templateSources.industry, industry),
      eq(templateSources.country, country),
      eq(templateSources.isActive, true),
    ];

    if (state) {
      conditions.push(eq(templateSources.state, state));
    }
    if (city) {
      conditions.push(eq(templateSources.city, city));
    }

    const sources = await db
      .select()
      .from(templateSources)
      .where(and(...conditions))
      .orderBy(sql`CAST(${templateSources.currentRanking} AS INTEGER)`)
      .limit(topN);

    console.log(`[RankingMonitor] Found ${sources.length} sources to update`);

    // Scrape and create templates for each source
    for (const source of sources) {
      try {
        console.log(`[RankingMonitor] Scraping ${source.companyName} (${source.websiteUrl})`);

        // Scrape website
        const scrapedData = await scrapeWebsiteFull(source.websiteUrl, source.companyName);

        if (scrapedData.error) {
          console.error(`[RankingMonitor] Failed to scrape ${source.websiteUrl}: ${scrapedData.error}`);
          continue;
        }

        // Create template from scraped data
        const template = createTemplateFromScrape(
          scrapedData,
          source.id,
          source.industry,
          source.country,
          source.state || undefined,
          source.city || undefined,
          source.currentRanking || undefined
        );

        // Check if template already exists
        const existingTemplate = await db
          .select()
          .from(brandTemplates)
          .where(eq(brandTemplates.sourceId, source.id))
          .limit(1);

        if (existingTemplate.length > 0) {
          // Update existing template
          await db
            .update(brandTemplates)
            .set({
              name: template.name,
              css: template.css,
              contentData: template.contentData as any,
              rankingPosition: template.rankingPosition,
              updatedAt: sql`now()`,
            })
            .where(eq(brandTemplates.id, existingTemplate[0].id));

          console.log(`[RankingMonitor] ✅ Updated template for ${source.companyName}`);
        } else {
          // Create new template
          await db.insert(brandTemplates).values({
            id: template.id,
            name: template.name,
            brand: template.brand,
            category: template.category,
            industry: template.industry,
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
            rankingPosition: template.rankingPosition,
            contentData: template.contentData as any,
            isActive: true,
          });

          console.log(`[RankingMonitor] ✅ Created new template for ${source.companyName}`);
        }

        // Add delay between scrapes to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        logError(error, `RankingMonitor - Update template ${source.websiteUrl}`);
        // Continue with next source
      }
    }

    console.log(`[RankingMonitor] ✅ Completed template updates for ${industry} (${city || state || country})`);
  } catch (error) {
    logError(error, `RankingMonitor - Update templates ${industry}`);
    throw error;
  }
}

/**
 * Schedule weekly ranking checks
 * This should be called by a cron job
 */
export async function scheduleWeeklyChecks(config: MonitoringConfig): Promise<void> {
  console.log('[RankingMonitor] Starting weekly ranking checks...');

  const startTime = Date.now();

  try {
    for (const industry of config.industries) {
      for (const location of config.locations) {
        try {
          // Check rankings
          await checkRankingsForIndustry(
            industry,
            location.country,
            location.state,
            location.city,
            config.topN
          );

          // Update templates for top-ranked
          await updateTemplatesForTopRanked(
            industry,
            location.country,
            location.state,
            location.city,
            config.topN
          );

          // Add delay between industries/locations
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          logError(error, `RankingMonitor - Weekly check ${industry} ${location.country}`);
          // Continue with next industry/location
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[RankingMonitor] ✅ Weekly ranking checks completed in ${(duration / 1000).toFixed(2)}s`);
  } catch (error) {
    logError(error, 'RankingMonitor - Weekly checks');
    throw error;
  }
}

/**
 * Get monitoring statistics
 */
export async function getMonitoringStats(): Promise<{
  totalSources: number;
  activeSources: number;
  industries: string[];
  locations: Array<{ country: string; state?: string; city?: string }>;
  lastChecked: Date | null;
}> {
  if (!db) {
    return {
      totalSources: 0,
      activeSources: 0,
      industries: [],
      locations: [],
      lastChecked: null,
    };
  }

  try {
    const sources = await db.select().from(templateSources);
    const activeSources = sources.filter(s => s.isActive);

    const industries = [...new Set(sources.map(s => s.industry))];
    const locations = sources.map(s => ({
      country: s.country,
      state: s.state || undefined,
      city: s.city || undefined,
    }));

    const lastChecked = sources.length > 0
      ? new Date(Math.max(...sources.map(s => s.lastChecked ? new Date(s.lastChecked).getTime() : 0)))
      : null;

    return {
      totalSources: sources.length,
      activeSources: activeSources.length,
      industries,
      locations: [...new Map(locations.map(l => [JSON.stringify(l), l])).values()], // Deduplicate
      lastChecked,
    };
  } catch (error) {
    logError(error, 'RankingMonitor - Get stats');
    return {
      totalSources: 0,
      activeSources: 0,
      industries: [],
      locations: [],
      lastChecked: null,
    };
  }
}

