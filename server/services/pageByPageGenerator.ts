/**
 * Page-by-Page Generator Service
 * Generates website page by page with visible progress
 * 
 * Phases per page:
 * 1. Keyword detection
 * 2. Content rewriting
 * 3. Image generation
 * 4. Quality testing
 */

import * as cheerio from 'cheerio';
import { detectKeywords } from './keywordDetector';
import { rewritePageContent } from './contentRewriter';
import { generateContextualImages } from './leonardoContextual';
import { runMandatoryQualityTests, type QualityCheck } from './templateVerifier';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { broadcastHTMLUpdate, broadcastProgress, broadcastPageComplete } from './realtimePreview';

export interface PagePhase {
  name: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
}

export interface PageGenerationResult {
  pageIndex: number;
  pageName: string;
  html: string;
  css: string;
  keywords: string[];
  images: Array<{ url: string; alt: string; context: string }>;
  qualityScore: number;
  phases: PagePhase[];
}

export interface PageByPageProgress {
  currentPage: number;
  totalPages: number;
  currentPhase: string;
  pageProgress: number; // 0-100 for current page
  overallProgress: number; // 0-100 for entire website
  message: string;
}

/**
 * Parse template HTML into individual pages
 * Intelligently extracts different pages from multi-page templates
 */
function parsePages(html: string, _baseUrl?: string): Array<{ name: string; html: string; slug: string }> {
  const $ = cheerio.load(html);
  const pages: Array<{ name: string; html: string; slug: string }> = [];

  // Try to detect pages from navigation links
  const navLinks = $('nav a[href], header a[href], footer a[href]').toArray();
  const pageMap = new Map<string, { name: string; url: string }>();

  navLinks.forEach((link): void => {
    const href = $(link).attr('href') || '';
    const linkText = $(link).text().trim();
    
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('javascript:')) {
      const normalizedUrl = href.replace(/^\//, '').replace(/\.html$/, '') || 'index';
      const pageName = linkText || normalizedUrl.charAt(0).toUpperCase() + normalizedUrl.slice(1).replace(/-/g, ' ');
      
      if (!pageMap.has(normalizedUrl)) {
        pageMap.set(normalizedUrl, { name: pageName, url: href });
      }
    }
  });

  // If no navigation found, treat entire HTML as single page
  if (pageMap.size === 0) {
    pages.push({
      name: 'Home',
      html: html,
      slug: 'index',
    });
    return pages;
  }

  // Extract page-specific content from main HTML
  // Strategy: Look for sections with IDs or classes matching page slugs
  const mainContent = $('main, #main, .main-content, .content, body').first();

  pageMap.forEach((pageInfo, slug): void => {
    let pageHtml = html; // Start with full HTML
    
    // Try to find page-specific content
    // Method 1: Look for section with matching ID
    const idSelector = `#${slug}, #${slug.replace(/-/g, '_')}`;
    const idSection = $(idSelector).first();
    
    // Method 2: Look for section with matching class
    const classSelector = `.${slug}, .page-${slug}, [class*="${slug}"]`;
    const classSection = $(classSelector).first();
    
    // Method 3: Look for data-page attribute
    const dataSection = $(`[data-page="${slug}"]`).first();
    
    // Use the first matching section found
    const pageSection = idSection.length > 0 ? idSection : 
                       classSection.length > 0 ? classSection :
                       dataSection.length > 0 ? dataSection : null;
    
    if (pageSection && pageSection.length > 0) {
      // Extract just this section's content
      const sectionHtml = pageSection.html() || '';
      if (sectionHtml.length > 500) { // Only use if substantial content
        // Create a new HTML document with just this section
        const $page = cheerio.load(html);
        // Keep header and footer, replace main content with this section
        $page('main, #main, .main-content, .content').html(sectionHtml);
        pageHtml = $page.html();
      }
    }
    
    // If slug is 'index' or 'home', use full HTML
    if (slug === 'index' || slug === 'home') {
      pageHtml = html;
    }
    
    pages.push({
      name: pageInfo.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      html: pageHtml,
      slug,
    });
  });

  // Ensure we have at least a home page
  if (!pages.find(p => p.slug === 'index' || p.slug === 'home')) {
    pages.unshift({
      name: 'Home',
      html: html,
      slug: 'index',
    });
  }

  console.log(`[PageByPageGenerator] 📄 Parsed ${pages.length} pages: ${pages.map(p => p.name).join(', ')}`);

  return pages;
}

/**
 * Generate website page by page
 */
export async function generatePageByPage(
  mergedTemplate: { html: string; css: string; images?: Array<{ src: string; alt: string; section: string }> },
  clientInfo: {
    businessName: string;
    industry: string;
    location: { city: string; state: string; country: string };
    services: Array<{ name: string; description: string }>;
    phone: string;
    email: string;
    address: string;
  },
  onPageProgress?: (progress: PageByPageProgress) => void,
  websiteId?: string
): Promise<PageGenerationResult[]> {
  const results: PageGenerationResult[] = [];

  // Parse template into pages
  const pages = parsePages(mergedTemplate.html);

  console.log(`[PageByPageGenerator] 📄 Found ${pages.length} pages to generate`);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const page = pages[pageIndex];
    
    console.log(`\n[PageByPageGenerator] ═══════════════════════════════════════`);
    console.log(`[PageByPageGenerator] 📄 Processing Page ${pageIndex + 1}/${pages.length}: ${page.name}`);
    console.log(`[PageByPageGenerator] ═══════════════════════════════════════\n`);

    const phases: PagePhase[] = [
      { name: 'keyword-detection', status: 'pending', progress: 0 },
      { name: 'content-rewrite', status: 'pending', progress: 0 },
      { name: 'image-generation', status: 'pending', progress: 0 },
      { name: 'quality-test', status: 'pending', progress: 0 },
    ];

    let pageHtml = page.html;
    let pageKeywords: string[] = [];
    let pageImages: Array<{ url: string; alt: string; context: string }> = [];
    let qualityScore = 100;

    try {
      // Phase 1: Keyword Detection
      phases[0].status = 'in-progress';
      phases[0].progress = 0;
      const progressUpdate = {
        currentPage: pageIndex + 1,
        totalPages: pages.length,
        currentPhase: 'keyword-detection',
        pageProgress: 0,
        overallProgress: Math.floor((pageIndex / pages.length) * 100),
        message: `Detecting keywords for ${page.name}...`,
      };
      onPageProgress?.(progressUpdate);
      if (websiteId) broadcastProgress(websiteId, progressUpdate);

      const detectedKeywords = await detectKeywords(pageHtml, page.name, clientInfo.industry);
      pageKeywords = detectedKeywords.primary.concat(detectedKeywords.secondary);
      
      phases[0].status = 'complete';
      phases[0].progress = 100;
      console.log(`[PageByPageGenerator] ✅ Keywords detected: ${pageKeywords.length} keywords`);

      // Phase 2: Content Rewriting
      phases[1].status = 'in-progress';
      phases[1].progress = 0;
      const contentProgress = {
        currentPage: pageIndex + 1,
        totalPages: pages.length,
        currentPhase: 'content-rewrite',
        pageProgress: 25,
        overallProgress: Math.floor(((pageIndex + 0.25) / pages.length) * 100),
        message: `Rewriting content for ${page.name}...`,
      };
      onPageProgress?.(contentProgress);
      if (websiteId) broadcastProgress(websiteId, contentProgress);

      const rewrittenResult = await rewritePageContent(
        pageHtml,
        clientInfo,
        pageKeywords
      );
      pageHtml = rewrittenResult.html;
      
      phases[1].status = 'complete';
      phases[1].progress = 100;
      console.log(`[PageByPageGenerator] ✅ Content rewritten: ${rewrittenResult.changesCount} changes`);
      
      // Broadcast content update
      if (websiteId) broadcastHTMLUpdate(websiteId, pageHtml, page.slug);

      // Phase 3: Image Generation
      phases[2].status = 'in-progress';
      phases[2].progress = 0;
      const imageProgress = {
        currentPage: pageIndex + 1,
        totalPages: pages.length,
        currentPhase: 'image-generation',
        pageProgress: 50,
        overallProgress: Math.floor(((pageIndex + 0.5) / pages.length) * 100),
        message: `Generating images for ${page.name} with Leonardo AI...`,
      };
      onPageProgress?.(imageProgress);
      if (websiteId) broadcastProgress(websiteId, imageProgress);

      const imageResults = await generateContextualImages(
        pageHtml,
        {
          content: pageHtml,
          keywords: pageKeywords,
          industry: clientInfo.industry,
        },
        mergedTemplate.css, // Design colors from merged template
        clientInfo
      );
      pageImages = imageResults.images;
      pageHtml = imageResults.html;
      
      phases[2].status = 'complete';
      phases[2].progress = 100;
      console.log(`[PageByPageGenerator] ✅ Images generated: ${pageImages.length} images`);
      
      // Broadcast image update
      if (websiteId) broadcastHTMLUpdate(websiteId, pageHtml, page.slug);

      // Phase 4: Quality Testing
      phases[3].status = 'in-progress';
      phases[3].progress = 0;
      onPageProgress?.({
        currentPage: pageIndex + 1,
        totalPages: pages.length,
        currentPhase: 'quality-test',
        pageProgress: 75,
        overallProgress: Math.floor(((pageIndex + 0.75) / pages.length) * 100),
        message: `Quality testing ${page.name}...`,
      });

      let checkCount = 0;
      const qualityResult = await runMandatoryQualityTests(
        pageHtml,
        mergedTemplate.css,
        (_check: QualityCheck, _passed: boolean): void => {
          checkCount++;
          phases[3].progress = Math.floor((checkCount / 7) * 100); // 7 total checks
        }
      );
      qualityScore = qualityResult.score;
      
      phases[3].status = 'complete';
      phases[3].progress = 100;
      console.log(`[PageByPageGenerator] ✅ Quality test complete: ${qualityScore}%`);

      // Page complete
      const completeProgress = {
        currentPage: pageIndex + 1,
        totalPages: pages.length,
        currentPhase: 'complete',
        pageProgress: 100,
        overallProgress: Math.floor(((pageIndex + 1) / pages.length) * 100),
        message: `${page.name} complete!`,
      };
      onPageProgress?.(completeProgress);
      if (websiteId) broadcastProgress(websiteId, completeProgress);

      const pageResult = {
        pageIndex,
        pageName: page.name,
        html: pageHtml,
        css: mergedTemplate.css,
        keywords: pageKeywords,
        images: pageImages,
        qualityScore,
        phases,
      };
      
      results.push(pageResult);
      
      // Broadcast page completion
      if (websiteId) {
        broadcastPageComplete(websiteId, {
          pageIndex,
          pageName: page.name,
          html: pageHtml,
          keywords: pageKeywords,
          images: pageImages,
          qualityScore,
        });
      }

      console.log(`[PageByPageGenerator] ✅ Page ${pageIndex + 1}/${pages.length} complete: ${page.name}`);

    } catch (_error: unknown) {
      logError(_error, `PageByPageGenerator - Page ${pageIndex + 1}`);
      
      // Mark failed phase
      const failedPhase = phases.find(p => p.status === 'in-progress');
      if (failedPhase) {
        failedPhase.status = 'error';
        failedPhase.message = getErrorMessage(_error);
      }

      // Still add result with error
      results.push({
        pageIndex,
        pageName: page.name,
        html: pageHtml,
        css: mergedTemplate.css,
        keywords: pageKeywords,
        images: pageImages,
        qualityScore: 0,
        phases,
      });
    }
  }

  console.log(`\n[PageByPageGenerator] ═══════════════════════════════════════`);
  console.log(`[PageByPageGenerator] ✅ All pages generated: ${results.length}/${pages.length}`);
  console.log(`[PageByPageGenerator] ═══════════════════════════════════════\n`);

  return results;
}

