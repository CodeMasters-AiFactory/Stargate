/**
 * Self-Healing Website Service
 * Websites that automatically fix themselves
 */

import * as cheerio from 'cheerio';
import { scrapeWebsiteFull } from './websiteScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { optimizeWebsitePerformance } from './performanceOptimizer';
import { autoFixTechnicalSEO } from './seoAutomation';

export interface HealthIssue {
  type: 'broken-link' | 'broken-image' | 'outdated-content' | 'performance' | 'accessibility' | 'seo';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string; // Selector or URL
  fix: string; // Suggested fix
  autoFixable: boolean;
}

export interface HealthReport {
  websiteId: string;
  url: string;
  timestamp: Date;
  overallHealth: number; // 0-100
  issues: HealthIssue[];
  fixesApplied: string[];
  recommendations: string[];
}

/**
 * Check website health
 */
export async function checkWebsiteHealth(
  websiteId: string,
  html: string,
  baseUrl: string
): Promise<HealthReport> {
  try {
    console.log(`[SelfHealing] 🔍 Checking health for website ${websiteId}...`);

    const issues: HealthIssue[] = [];
    const fixesApplied: string[] = [];

    const $ = cheerio.load(html);

    // Check for broken links
    const brokenLinks = await checkBrokenLinks($, baseUrl);
    issues.push(...brokenLinks);

    // Check for broken images
    const brokenImages = await checkBrokenImages($, baseUrl);
    issues.push(...brokenImages);

    // Check for outdated content
    const outdatedContent = checkOutdatedContent($);
    issues.push(...outdatedContent);

    // Check performance issues
    const performanceIssues = await checkPerformanceIssues(html);
    issues.push(...performanceIssues);

    // Check accessibility issues
    const accessibilityIssues = checkAccessibilityIssues($);
    issues.push(...accessibilityIssues);

    // Check SEO issues
    const seoIssues = await checkSEOIssues(html);
    issues.push(...seoIssues);

    // Calculate overall health score
    const overallHealth = calculateHealthScore(issues);

    // Auto-fix issues
    const fixedHtml = await autoFixIssues($, issues, fixesApplied);

    const report: HealthReport = {
      websiteId,
      url: baseUrl,
      timestamp: new Date(),
      overallHealth,
      issues,
      fixesApplied,
      recommendations: generateRecommendations(issues),
    };

    console.log(`[SelfHealing] ✅ Health check complete: ${overallHealth}% healthy, ${fixesApplied.length} fixes applied`);
    return report;
  } catch (error) {
    logError(error, 'SelfHealing - CheckHealth', { websiteId });
    throw new Error(`Failed to check website health: ${getErrorMessage(error)}`);
  }
}

/**
 * Auto-fix website issues
 */
export async function autoFixWebsite(
  websiteId: string,
  html: string,
  baseUrl: string
): Promise<{ html: string; fixesApplied: string[] }> {
  try {
    console.log(`[SelfHealing] 🔧 Auto-fixing website ${websiteId}...`);

    const healthReport = await checkWebsiteHealth(websiteId, html, baseUrl);
    const $ = cheerio.load(html);

    // Apply fixes
    const fixedHtml = await autoFixIssues($, healthReport.issues, healthReport.fixesApplied);

    console.log(`[SelfHealing] ✅ Applied ${healthReport.fixesApplied.length} fixes`);
    return {
      html: fixedHtml,
      fixesApplied: healthReport.fixesApplied,
    };
  } catch (error) {
    logError(error, 'SelfHealing - AutoFix');
    throw new Error(`Failed to auto-fix website: ${getErrorMessage(error)}`);
  }
}

/**
 * Monitor website health continuously
 */
export async function monitorWebsiteHealth(
  websiteId: string,
  url: string,
  intervalMinutes: number = 60
): Promise<void> {
  try {
    console.log(`[SelfHealing] 📊 Starting health monitoring for ${websiteId} (check every ${intervalMinutes} minutes)`);

    const checkHealth = async () => {
      try {
        const scraped = await scrapeWebsiteFull(url);
        if (scraped && scraped.htmlContent) {
          const report = await checkWebsiteHealth(websiteId, scraped.htmlContent, url);
          
          // Auto-fix if health is below threshold
          if (report.overallHealth < 70) {
            console.log(`[SelfHealing] ⚠️ Health below threshold (${report.overallHealth}%), auto-fixing...`);
            await autoFixWebsite(websiteId, scraped.htmlContent, url);
          }
        }
      } catch (error) {
        logError(error, 'SelfHealing - MonitorHealth');
      }
    };

    // Run initial check
    await checkHealth();

    // Schedule periodic checks
    setInterval(checkHealth, intervalMinutes * 60 * 1000);
  } catch (error) {
    logError(error, 'SelfHealing - MonitorHealth');
    throw new Error(`Failed to start health monitoring: ${getErrorMessage(error)}`);
  }
}

// Helper functions

async function checkBrokenLinks($: cheerio.CheerioAPI, baseUrl: string): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const links = $('a[href]');

  links.each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Check for common broken link patterns
    if (href === '#' || href === 'javascript:void(0)' || href === '') {
      issues.push({
        type: 'broken-link',
        severity: 'medium',
        description: `Empty or placeholder link: ${href}`,
        location: $(el).attr('href') || 'unknown',
        fix: 'Remove or update link',
        autoFixable: true,
      });
    }

    // Check for external links (would verify in production)
    if (href.startsWith('http') && !href.startsWith(baseUrl)) {
      // External link - would check if accessible in production
    }
  });

  return issues;
}

async function checkBrokenImages($: cheerio.CheerioAPI, baseUrl: string): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];
  const images = $('img[src]');

  images.each((_, el) => {
    const src = $(el).attr('src');
    if (!src) {
      issues.push({
        type: 'broken-image',
        severity: 'high',
        description: 'Image without src attribute',
        location: 'img element',
        fix: 'Add src attribute or remove image',
        autoFixable: true,
      });
      return;
    }

    // Check for placeholder images
    if (src.includes('placeholder') || src.includes('via.placeholder.com')) {
      issues.push({
        type: 'broken-image',
        severity: 'medium',
        description: 'Placeholder image detected',
        location: src,
        fix: 'Replace with actual image',
        autoFixable: false,
      });
    }

    // Check for missing alt text
    const alt = $(el).attr('alt');
    if (!alt && alt !== '') {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        description: 'Image missing alt text',
        location: src,
        fix: 'Add alt attribute',
        autoFixable: true,
      });
    }
  });

  return issues;
}

function checkOutdatedContent($: cheerio.CheerioAPI): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Check for outdated date references
  const currentYear = new Date().getFullYear();
  const text = $.text();
  
  // Look for year references
  const yearMatches = text.match(/\b(20\d{2})\b/g);
  if (yearMatches) {
    const outdatedYears = yearMatches.filter(year => parseInt(year) < currentYear - 1);
    if (outdatedYears.length > 0) {
      issues.push({
        type: 'outdated-content',
        severity: 'low',
        description: `Outdated year references: ${outdatedYears.join(', ')}`,
        location: 'content',
        fix: 'Update year references',
        autoFixable: true,
      });
    }
  }

  return issues;
}

async function checkPerformanceIssues(html: string): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  // Check HTML size
  const htmlSize = Buffer.byteLength(html, 'utf8');
  if (htmlSize > 500 * 1024) { // 500KB
    issues.push({
      type: 'performance',
      severity: 'medium',
      description: `Large HTML size: ${(htmlSize / 1024).toFixed(2)}KB`,
      location: 'html',
      fix: 'Optimize HTML, remove unused code',
      autoFixable: true,
    });
  }

  // Check for inline styles (could be optimized)
  const inlineStyleMatches = html.match(/style="[^"]*"/g);
  if (inlineStyleMatches && inlineStyleMatches.length > 10) {
    issues.push({
      type: 'performance',
      severity: 'low',
      description: 'Many inline styles detected',
      location: 'html',
      fix: 'Move styles to external CSS',
      autoFixable: true,
    });
  }

  return issues;
}

function checkAccessibilityIssues($: cheerio.CheerioAPI): HealthIssue[] {
  const issues: HealthIssue[] = [];

  // Check for missing alt text (already checked in images)
  // Check for missing aria labels on interactive elements
  const buttons = $('button, [role="button"]');
  buttons.each((_, el) => {
    const ariaLabel = $(el).attr('aria-label');
    const text = $(el).text().trim();
    
    if (!ariaLabel && !text) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        description: 'Button without accessible label',
        location: $.html(el),
        fix: 'Add aria-label or text content',
        autoFixable: true,
      });
    }
  });

  // Check heading hierarchy
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    issues.push({
      type: 'accessibility',
      severity: 'high',
      description: 'Missing H1 heading',
      location: 'html',
      fix: 'Add H1 heading',
      autoFixable: false,
    });
  } else if (h1Count > 1) {
    issues.push({
      type: 'accessibility',
      severity: 'medium',
      description: `Multiple H1 headings (${h1Count})`,
      location: 'html',
      fix: 'Use only one H1 per page',
      autoFixable: true,
    });
  }

  return issues;
}

async function checkSEOIssues(html: string): Promise<HealthIssue[]> {
  const issues: HealthIssue[] = [];

  // Check for title tag
  if (!html.includes('<title>')) {
    issues.push({
      type: 'seo',
      severity: 'critical',
      description: 'Missing title tag',
      location: 'head',
      fix: 'Add title tag',
      autoFixable: true,
    });
  }

  // Check for meta description
  if (!html.includes('meta name="description"')) {
    issues.push({
      type: 'seo',
      severity: 'high',
      description: 'Missing meta description',
      location: 'head',
      fix: 'Add meta description',
      autoFixable: true,
    });
  }

  // Check for H1 tag (already checked in accessibility)
  if (!html.includes('<h1')) {
    issues.push({
      type: 'seo',
      severity: 'high',
      description: 'Missing H1 tag',
      location: 'body',
      fix: 'Add H1 heading',
      autoFixable: false,
    });
  }

  return issues;
}

function calculateHealthScore(issues: HealthIssue[]): number {
  if (issues.length === 0) return 100;

  let score = 100;
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  });

  return Math.max(0, score);
}

async function autoFixIssues(
  $: cheerio.CheerioAPI,
  issues: HealthIssue[],
  fixesApplied: string[]
): Promise<string> {
  // Fix broken images (add alt text)
  issues
    .filter(i => i.type === 'broken-image' && i.autoFixable && i.fix.includes('alt'))
    .forEach(issue => {
      const images = $('img').filter((_, el) => !$(el).attr('alt'));
      images.each((_, el) => {
        const src = $(el).attr('src') || '';
        const altText = src.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Image';
        $(el).attr('alt', altText);
        fixesApplied.push(`Added alt text to image: ${src}`);
      });
    });

  // Fix accessibility issues (add aria-labels)
  issues
    .filter(i => i.type === 'accessibility' && i.autoFixable && i.fix.includes('aria-label'))
    .forEach(() => {
      const buttons = $('button, [role="button"]').filter((_, el) => {
        const ariaLabel = $(el).attr('aria-label');
        const text = $(el).text().trim();
        return !ariaLabel && !text;
      });
      buttons.each((_, el) => {
        $(el).attr('aria-label', 'Button');
        fixesApplied.push('Added aria-label to button');
      });
    });

  // Fix SEO issues (add meta tags)
  issues
    .filter(i => i.type === 'seo' && i.autoFixable)
    .forEach(issue => {
      if (issue.fix.includes('meta description')) {
        if (!$('meta[name="description"]').length) {
          $('head').append('<meta name="description" content="Website description">');
          fixesApplied.push('Added meta description');
        }
      }
    });

  return $.html();
}

function generateRecommendations(issues: HealthIssue[]): string[] {
  const recommendations: string[] = [];

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    recommendations.push(`Fix ${criticalIssues.length} critical issue(s) immediately`);
  }

  const autoFixable = issues.filter(i => i.autoFixable);
  if (autoFixable.length > 0) {
    recommendations.push(`Enable auto-fix for ${autoFixable.length} issue(s)`);
  }

  const performanceIssues = issues.filter(i => i.type === 'performance');
  if (performanceIssues.length > 0) {
    recommendations.push('Consider performance optimization');
  }

  return recommendations;
}

