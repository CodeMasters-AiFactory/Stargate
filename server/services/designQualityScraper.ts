/**
 * Design Quality Website Scraper
 * 
 * Scrapes top design-quality websites from:
 * - Awwwards (awwwards.com)
 * - CSS Design Awards (cssdesignawards.com)
 * - FWA (thefwa.com)
 * - SiteInspire (siteinspire.com)
 * - Dribbble (dribbble.com) - design portfolios
 * 
 * Focus: Design quality, not SEO rankings
 * 
 * IMPROVEMENTS v2.0:
 * - Better URL filtering to skip gallery/listing pages
 * - Improved search queries to find actual websites
 * - Award page URL extraction
 * - Configurable timeouts
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

// URL patterns that indicate gallery/listing pages (should be skipped)
const GALLERY_PAGE_PATTERNS = [
  /\/websites\/?$/i,                           // awwwards.com/websites/
  /\/websites\/[a-z-]+\/?$/i,                  // awwwards.com/websites/technology/
  /\/website-gallery/i,                        // cssdesignawards.com/website-gallery
  /\/categories\//i,                           // category listing pages
  /\/tags\//i,                                 // tag listing pages
  /\/search\//i,                               // search result pages
  /\/profiles?\//i,                            // profile pages (not individual sites)
  /\/judges?(-interview)?\//i,                 // judge interview pages
  /\/blog\//i,                                 // blog posts
  /\/market\//i,                               // marketplace pages
  /\/conference\//i,                           // conference pages
  /\/dd\/design-stories/i,                     // design story pages
  /\?page=\d+/i,                               // pagination pages
  /\?feature=/i,                               // filter pages
  /\?industry=/i,                              // filter pages
  /dribbble\.com\/tags\//i,                    // dribbble tag pages
  /dribbble\.com\/shots\/\d+-/i,               // dribbble shot pages (not websites)
  /dribbble\.com\/[a-z0-9_-]+$/i,              // dribbble user profiles
];

// URL patterns that indicate individual project/site pages (should be kept)
const PROJECT_PAGE_PATTERNS = [
  /awwwards\.com\/sites\/[a-z0-9-]+$/i,        // awwwards.com/sites/company-name
  /cssdesignawards\.com\/sites\/[^\/]+\/\d+/i, // cssdesignawards.com/sites/name/123
  /thefwa\.com\/cases\/[a-z0-9-]+$/i,          // thefwa.com/cases/project-name
  /siteinspire\.com\/website\/\d+/i,           // siteinspire.com/website/1234
];

/**
 * Check if a URL is a gallery/listing page that should be skipped
 */
function isGalleryPage(url: string): boolean {
  return GALLERY_PAGE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Extract actual website URL from award site project page
 * Uses Google Search API to find the actual website instead of scraping award pages
 */
export async function extractActualWebsiteUrl(awardPageUrl: string): Promise<string | null> {
  try {
    console.log(`[Design Scraper] 🔍 Extracting actual URL from: ${awardPageUrl}`);
    
    // Extract the project name from the award URL
    let projectName = '';
    
    if (awardPageUrl.includes('awwwards.com/sites/')) {
      projectName = awardPageUrl.split('/sites/')[1]?.split('/')[0]?.split('?')[0] || '';
    } else if (awardPageUrl.includes('cssdesignawards.com/sites/')) {
      projectName = awardPageUrl.split('/sites/')[1]?.split('/')[0]?.split('?')[0] || '';
    } else if (awardPageUrl.includes('thefwa.com/cases/')) {
      projectName = awardPageUrl.split('/cases/')[1]?.split('/')[0]?.split('?')[0] || '';
    } else if (awardPageUrl.includes('siteinspire.com/website/')) {
      // SiteInspire uses IDs, try to extract name from URL
      const parts = awardPageUrl.split('/website/')[1]?.split('-');
      if (parts && parts.length > 1) {
        projectName = parts.slice(1).join('-');
      }
    }
    
    if (!projectName) {
      console.log(`[Design Scraper] ⚠️ Could not extract project name from: ${awardPageUrl}`);
      return null;
    }
    
    // Clean up project name (remove hyphens, make readable)
    const searchName = projectName.replace(/-/g, ' ').trim();
    console.log(`[Design Scraper] 🔎 Searching for actual website of: "${searchName}"`);
    
    // Use Google Custom Search API to find the actual website
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      console.log(`[Design Scraper] ⚠️ Google API not configured for URL extraction`);
      return null;
    }
    
    // Search for the actual website (not the award page)
    const searchQuery = `"${searchName}" official website -awwwards -cssdesignawards -thefwa -siteinspire -behance -dribbble`;
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.log(`[Design Scraper] ⚠️ Google API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    
    if (data.items && data.items.length > 0) {
      // Filter out award sites and social media
      const validUrls = data.items
        .map((item: any) => item.link)
        .filter((url: string) => 
          url &&
          !url.includes('awwwards') &&
          !url.includes('cssdesignawards') &&
          !url.includes('thefwa') &&
          !url.includes('siteinspire') &&
          !url.includes('behance') &&
          !url.includes('dribbble') &&
          !url.includes('facebook') &&
          !url.includes('twitter') &&
          !url.includes('linkedin') &&
          !url.includes('instagram') &&
          !url.includes('youtube') &&
          !url.includes('pinterest') &&
          !url.includes('wikipedia')
        );
      
      if (validUrls.length > 0) {
        const actualUrl = validUrls[0];
        console.log(`[Design Scraper] ✅ Found actual website via Google: ${actualUrl}`);
        return actualUrl;
      }
    }
    
    console.log(`[Design Scraper] ⚠️ Could not find actual website for: ${searchName}`);
    return null;
    
  } catch (error) {
    console.error(`[Design Scraper] ❌ Error extracting URL from ${awardPageUrl}:`, getErrorMessage(error));
    return null;
  }
}

/**
 * Check if a URL is an individual project page that we want to scrape
 */
function isProjectPage(url: string): boolean {
  return PROJECT_PAGE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Filter and prioritize URLs - prefer project pages, skip gallery pages
 */
function filterAndPrioritizeUrls(urls: string[]): string[] {
  const projectPages: string[] = [];
  const otherPages: string[] = [];
  
  for (const url of urls) {
    if (isGalleryPage(url)) {
      console.log(`[Design Scraper] ⏭️ Skipping gallery page: ${url}`);
      continue;
    }
    
    if (isProjectPage(url)) {
      projectPages.push(url);
    } else if (!url.includes('awwwards.com') && 
               !url.includes('cssdesignawards.com') && 
               !url.includes('thefwa.com') && 
               !url.includes('siteinspire.com') &&
               !url.includes('dribbble.com')) {
      // External website URL - these are the actual websites we want!
      projectPages.unshift(url); // Add to front - highest priority
    } else {
      otherPages.push(url);
    }
  }
  
  // Return project pages first, then other pages
  return [...projectPages, ...otherPages];
}

export type DesignCategory = 
  | 'Personal'
  | 'Business'
  | 'Corporate'
  | 'E-commerce'
  | 'Portfolio'
  | 'Agency'
  | 'Creative'
  | 'Technology'
  | 'Fashion'
  | 'Food & Beverage'
  | 'Entertainment'
  | 'Education'
  | 'Healthcare'
  | 'Real Estate'
  | 'Travel'
  | 'Non-profit'
  | 'Music'
  | 'Sports'
  | 'Art & Design'
  | 'Luxury'
  | 'Startup'
  | 'Enterprise'
  | 'Top 100'
  | 'Top 1000'
  | 'Top 10000'
  | 'Top Sites 2025'
  | 'Top Sites 2024'
  | 'Top Sites 2023'
  | 'Top Sites 2022'
  | 'Top Sites 2021'
  | 'Top Sites 2020'
  | 'Top Sites 2019'
  | 'Top Sites 2018'
  | 'Top Sites 2017';

export const DESIGN_CATEGORIES: DesignCategory[] = [
  'Personal',
  'Business',
  'Corporate',
  'E-commerce',
  'Portfolio',
  'Agency',
  'Creative',
  'Technology',
  'Fashion',
  'Food & Beverage',
  'Entertainment',
  'Education',
  'Healthcare',
  'Real Estate',
  'Travel',
  'Non-profit',
  'Music',
  'Sports',
  'Art & Design',
  'Luxury',
  'Startup',
  'Enterprise',
  'Top 100',
  'Top 1000',
  'Top 10000',
  'Top Sites 2025',
  'Top Sites 2024',
  'Top Sites 2023',
  'Top Sites 2022',
  'Top Sites 2021',
  'Top Sites 2020',
  'Top Sites 2019',
  'Top Sites 2018',
  'Top Sites 2017',
];

export interface DesignQualityWebsite {
  url: string;
  title: string;
  description?: string;
  category: DesignCategory;
  awardSource: 'Awwwards' | 'CSS Design Awards' | 'FWA' | 'SiteInspire' | 'Dribbble' | 'Manual';
  designScore?: number; // 0-100
  thumbnail?: string;
  tags?: string[];
}

/**
 * Scrape Awwwards for top design websites
 * Awwwards has categories and award winners
 */
export async function scrapeAwwwards(category: DesignCategory, limit: number = 100): Promise<DesignQualityWebsite[]> {
  const results: DesignQualityWebsite[] = [];
  
  try {
    // Awwwards API or scraping approach
    // Note: Awwwards may require authentication or have rate limits
    // For now, we'll use a search-based approach
    
    const searchQueries = [
      `site:awwwards.com ${category.toLowerCase()} award`,
      `site:awwwards.com ${category.toLowerCase()} winner`,
      `site:awwwards.com ${category.toLowerCase()} site of the day`,
    ];

    // In a real implementation, you would:
    // 1. Use Awwwards API if available
    // 2. Scrape their website (with proper rate limiting)
    // 3. Use Google Custom Search to find Awwwards winners
    
    console.log(`[Design Scraper] Scraping Awwwards for ${category} (limit: ${limit})`);
    
    // Placeholder - would need actual scraping implementation
    // This would require:
    // - Puppeteer to handle JavaScript-rendered content
    // - Proper rate limiting
    // - Respecting robots.txt
    
  } catch (error) {
    logError(error, `Design Scraper - Awwwards (${category})`);
  }
  
  return results;
}

/**
 * Scrape CSS Design Awards for top design websites
 */
export async function scrapeCSSDesignAwards(category: DesignCategory, limit: number = 100): Promise<DesignQualityWebsite[]> {
  const results: DesignQualityWebsite[] = [];
  
  try {
    console.log(`[Design Scraper] Scraping CSS Design Awards for ${category} (limit: ${limit})`);
    
    // Similar approach to Awwwards
    // Would need actual scraping implementation
    
  } catch (error) {
    logError(error, `Design Scraper - CSS Design Awards (${category})`);
  }
  
  return results;
}

/**
 * Search Google for design award winners
 * Uses Google Custom Search to find websites featured on design award sites
 * 
 * IMPROVED v2.0:
 * - Better search queries to find individual project pages
 * - URL filtering to skip gallery pages
 * - Multiple query strategies per award site
 */
export async function searchDesignAwardWinners(
  category: DesignCategory,
  limit: number = 100,
  country?: string
): Promise<DesignQualityWebsite[]> {
  const results: DesignQualityWebsite[] = [];
  
  try {
    // Import Google search function
    const { searchGoogleRankings } = await import('./websiteScraper');
    
    // Handle special "Top X" categories
    let searchCategory = category;
    if (category === 'Top 100') {
      searchCategory = 'site of the day winner';
    } else if (category === 'Top 1000') {
      searchCategory = 'site of the day honorable mention';
    } else if (category === 'Top 10000') {
      searchCategory = 'featured website';
    }
    
    // Define award sites with specific search strategies
    // Focus on finding individual project pages, not galleries
    // Add country to queries if provided
    const countrySuffix = country && country !== 'All' ? ` ${country}` : '';
    const awardSiteQueries: Array<{ site: string; queries: string[] }> = [
      {
        site: 'awwwards.com',
        queries: [
          // Search for individual site pages (awwwards.com/sites/xxx)
          `"site of the day" ${searchCategory.toLowerCase()}${countrySuffix} site:awwwards.com/sites/`,
          `${searchCategory.toLowerCase()} winner${countrySuffix} site:awwwards.com/sites/`,
        ]
      },
      {
        site: 'cssdesignawards.com',
        queries: [
          `${searchCategory.toLowerCase()}${countrySuffix} site:cssdesignawards.com/sites/`,
          `WOTD ${searchCategory.toLowerCase()}${countrySuffix} site:cssdesignawards.com`,
        ]
      },
      {
        site: 'thefwa.com',
        queries: [
          `${searchCategory.toLowerCase()}${countrySuffix} site:thefwa.com/cases/`,
        ]
      },
      {
        site: 'siteinspire.com',
        queries: [
          `${searchCategory.toLowerCase()}${countrySuffix} site:siteinspire.com/website/`,
        ]
      },
    ];
    
    const allResults: DesignQualityWebsite[] = [];
    
    for (const awardSite of awardSiteQueries) {
      try {
        // Try each query for this award site
        for (const query of awardSite.queries) {
          console.log(`[Design Scraper] Searching: ${query}`);
        
          // Use Google Custom Search API directly if available
          const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
          const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
          
          let searchResults: any[] = [];
          
          if (apiKey && searchEngineId) {
            console.log(`[Design Scraper] ✅ Using Google Custom Search API`);
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
            
            try {
              const response = await fetch(searchUrl);
              if (response.ok) {
                const data = await response.json() as any;
                if (data.items && data.items.length > 0) {
                  searchResults = data.items.map((item: any, index: number) => ({
                    companyName: item.title || 'Unknown',
                    websiteUrl: item.link,
                    ranking: index + 1,
                    snippet: item.snippet || '',
                    originalTitle: item.title,
                  }));
                  console.log(`[Design Scraper] ✅ Google API returned ${searchResults.length} results`);
                } else {
                  console.log(`[Design Scraper] ⚠️ Google API returned no results for: ${query}`);
                }
              } else {
                throw new Error(`Google API error: ${response.status}`);
              }
            } catch (apiError) {
              console.error(`[Design Scraper] ❌ Google API error:`, apiError);
              // Continue to next query instead of failing completely
              continue;
            }
          } else {
            console.warn(`[Design Scraper] ⚠️ Google Custom Search API not configured`);
            break; // No point trying other queries without API
          }
          
          // Extract website URLs from award site results
          for (const result of searchResults) {
            const awardSourceName = awardSite.site.includes('awwwards') ? 'Awwwards' :
                               awardSite.site.includes('cssdesignawards') ? 'CSS Design Awards' :
                               awardSite.site.includes('fwa') ? 'FWA' :
                               awardSite.site.includes('siteinspire') ? 'SiteInspire' :
                               awardSite.site.includes('dribbble') ? 'Dribbble' : 'Manual';
            
            let actualUrl = result.websiteUrl;
            
            // IMPROVED: Skip gallery pages immediately
            if (isGalleryPage(actualUrl)) {
              console.log(`[Design Scraper] ⏭️ Skipping gallery page: ${actualUrl}`);
              continue;
            }
            
            // Try to extract URL from snippet if it contains a website URL
            if (result.snippet) {
              const urlMatch = result.snippet.match(/https?:\/\/[^\s\)\"\']+/i);
              if (urlMatch && !urlMatch[0].includes(awardSite.site)) {
                actualUrl = urlMatch[0].replace(/[.,;!?]+$/, '');
                console.log(`[Design Scraper] ✅ Extracted external URL from snippet: ${actualUrl}`);
              }
            }
            
            // If it's still an award site project page, mark it for URL extraction during scraping
            if (actualUrl.includes(awardSite.site)) {
              if (isProjectPage(actualUrl)) {
                console.log(`[Design Scraper] ✅ Project page found: ${actualUrl} - will extract actual website URL during scraping`);
              } else {
                console.log(`[Design Scraper] ℹ️ Award site page: ${actualUrl} - will try to extract website URL`);
              }
            }
            
            allResults.push({
              url: actualUrl,
              title: result.companyName,
              description: result.snippet,
              category: category,
              awardSource: awardSourceName as any,
              designScore: undefined,
            });
          }
          
          // Rate limiting between queries
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Rate limiting between sites
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`[Design Scraper] Failed to search ${awardSite.site}:`, error);
      }
    }
    
    // Filter and prioritize URLs, then deduplicate
    const filteredUrls = filterAndPrioritizeUrls(allResults.map(r => r.url));
    const urlSet = new Set<string>();
    
    for (const url of filteredUrls) {
      if (!urlSet.has(url)) {
        urlSet.add(url);
        const result = allResults.find(r => r.url === url);
        if (result) {
          results.push(result);
          if (results.length >= limit) break;
        }
      }
    }
    
    console.log(`[Design Scraper] Found ${results.length} unique design websites for ${category}`);
    console.log(`[Design Scraper] Filtered out ${allResults.length - results.length} gallery/listing pages`);
    if (results.length > 0) {
      console.log(`[Design Scraper] Sample URLs:`, results.slice(0, 3).map(r => r.url));
    } else {
      console.log(`[Design Scraper] ⚠️ NO RESULTS FOUND - Check Google API configuration and quota`);
    }
    
  } catch (error) {
    logError(error, `Design Scraper - Search Award Winners (${category})`);
  }
  
  return results;
}

/**
 * Scrape top design websites by category
 * Combines results from multiple design award sources
 */
export async function scrapeTopDesignWebsites(
  category: DesignCategory,
  limit: number = 100,
  country?: string
): Promise<DesignQualityWebsite[]> {
  const allResults: DesignQualityWebsite[] = [];
  
  try {
    console.log(`[Design Scraper] Starting scrape for ${category} (target: ${limit} websites)`);
    
    // For "Top X" categories, use a different approach
    if (category === 'Top 100' || category === 'Top 1000' || category === 'Top 10000') {
      // Search for overall best design websites, not category-specific
      const searchResults = await searchDesignAwardWinners(category, limit, country);
      // Extract actual URLs from award pages
      const resolvedResults = await resolveAwardPageUrls(searchResults);
      return resolvedResults.slice(0, limit);
    }
    
    // For regular categories, scrape from multiple sources
    const [awwwardsResults, cssResults, searchResults] = await Promise.all([
      scrapeAwwwards(category, limit),
      scrapeCSSDesignAwards(category, limit),
      searchDesignAwardWinners(category, limit, country),
    ]);
    
    // Combine and deduplicate
    const urlSet = new Set<string>();
    
    for (const result of [...awwwardsResults, ...cssResults, ...searchResults]) {
      if (!urlSet.has(result.url)) {
        urlSet.add(result.url);
        allResults.push(result);
      }
    }
    
    // Sort by design score if available, otherwise by source priority
    allResults.sort((a, b) => {
      if (a.designScore && b.designScore) {
        return b.designScore - a.designScore;
      }
      // Priority: Awwwards > CSS Design Awards > FWA > SiteInspire > Others
      const priority: Record<string, number> = {
        'Awwwards': 5,
        'CSS Design Awards': 4,
        'FWA': 3,
        'SiteInspire': 2,
        'Dribbble': 1,
        'Manual': 0,
      };
      return (priority[b.awardSource] || 0) - (priority[a.awardSource] || 0);
    });
    
    // CRITICAL: Extract actual website URLs from award site pages
    console.log(`[Design Scraper] 🔄 Resolving ${allResults.length} URLs to actual websites...`);
    const resolvedResults = await resolveAwardPageUrls(allResults);
    
    // Limit results
    return resolvedResults.slice(0, limit);
    
  } catch (error) {
    logError(error, `Design Scraper - Top Design Websites (${category})`);
    return [];
  }
}

/**
 * Resolve award page URLs to actual website URLs
 * Takes URLs like awwwards.com/sites/xxx and extracts the actual website URLs
 */
async function resolveAwardPageUrls(results: DesignQualityWebsite[]): Promise<DesignQualityWebsite[]> {
  const resolvedResults: DesignQualityWebsite[] = [];
  const seenUrls = new Set<string>();
  
  console.log(`[Design Scraper] 🔍 Extracting actual URLs from ${results.length} award pages...`);
  
  for (const result of results) {
    // Check if URL is an award site page that needs resolution
    const isAwardPage = 
      result.url.includes('awwwards.com/sites/') ||
      result.url.includes('cssdesignawards.com/sites/') ||
      result.url.includes('thefwa.com/cases/') ||
      result.url.includes('siteinspire.com/website/');
    
    if (isAwardPage) {
      // Extract the actual website URL
      const actualUrl = await extractActualWebsiteUrl(result.url);
      
      if (actualUrl && !seenUrls.has(actualUrl)) {
        seenUrls.add(actualUrl);
        resolvedResults.push({
          ...result,
          url: actualUrl,
          // Keep original award page as reference
          description: `${result.description || ''} (via ${result.awardSource})`.trim(),
        });
        console.log(`[Design Scraper] ✅ Resolved: ${result.url} → ${actualUrl}`);
      } else if (!actualUrl) {
        console.log(`[Design Scraper] ⚠️ Could not resolve: ${result.url}`);
      }
      
      // Rate limiting between extractions
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      // Not an award page, keep as-is
      if (!seenUrls.has(result.url)) {
        seenUrls.add(result.url);
        resolvedResults.push(result);
      }
    }
  }
  
  console.log(`[Design Scraper] ✅ Resolved ${resolvedResults.length} actual website URLs`);
  return resolvedResults;
}

/**
 * Scrape top design websites for ALL categories
 */
export async function scrapeAllDesignCategories(limitPerCategory: number = 100): Promise<Record<DesignCategory, DesignQualityWebsite[]>> {
  const results: Record<DesignCategory, DesignQualityWebsite[]> = {} as any;
  
  console.log(`[Design Scraper] Starting bulk scrape for all ${DESIGN_CATEGORIES.length} categories`);
  
  for (const category of DESIGN_CATEGORIES) {
    try {
      console.log(`[Design Scraper] Processing category: ${category}`);
      results[category] = await scrapeTopDesignWebsites(category, limitPerCategory);
      console.log(`[Design Scraper] ✅ ${category}: ${results[category].length} websites found`);
      
      // Rate limiting between categories
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      logError(error, `Design Scraper - Category ${category}`);
      results[category] = [];
    }
  }
  
  return results;
}

