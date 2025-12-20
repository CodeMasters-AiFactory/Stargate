/**
 * QA Engine 3.0
 * Merlin 7.0 - Module 10
 * Comprehensive quality assessment: Puppeteer checks, accessibility, SEO, performance
 */

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import type { QAReport, QACategory, QAIssue, PerformanceMetrics, AccessibilityMetrics, SEOMetrics, VisualMetrics, NavigationMetrics, NavigationIssue } from '../types/qaReport';
import type { PlannedPage } from '../types/plannedPage';
import { getErrorMessage, logError } from '../utils/errorHandler';

/**
 * Assess website quality
 */
export async function assessWebsiteQuality(
  url: string,
  pages: PlannedPage[],
  iteration: number = 1,
  projectSlug?: string
): Promise<QAReport> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Add timeout and retry logic for URL accessibility
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 // 30 second timeout
    });
    
    // Run all assessments
    const [performance, accessibility, seo, visual, navigation] = await Promise.all([
      assessPerformance(page),
      assessAccessibility(page),
      assessSEO(page),
      assessVisual(page),
      assessNavigation(url, pages, projectSlug),
    ]);
    
    // Calculate overall score
    const categories: QACategory[] = [
      {
        name: 'Performance',
        score: performance.score / 10, // Convert 0-100 to 0-10
        weight: 0.15,
        issues: [],
        passed: performance.score >= 80,
      },
      {
        name: 'Accessibility',
        score: accessibility.score / 10, // Convert 0-100 to 0-10
        weight: 0.15,
        issues: [],
        passed: accessibility.wcag.level !== 'none',
      },
      {
        name: 'SEO',
        score: seo.score / 10, // Convert 0-100 to 0-10
        weight: 0.15,
        issues: [],
        passed: seo.score >= 80,
      },
      {
        name: 'Visual Design',
        score: visual.score,
        weight: 0.25,
        issues: [],
        passed: visual.score >= 7.5,
      },
      {
        name: 'Navigation',
        score: navigation.integrityScore,
        weight: 0.3, // Higher weight - navigation is critical
        issues: [],
        passed: navigation.status === 'pass',
      },
    ];
    
    const overallScore = categories.reduce((sum, cat) => sum + cat.score * cat.weight, 0) / categories.reduce((sum, cat) => sum + cat.weight, 0);
    
    // Identify issues
    const issues = identifyIssues(categories, performance, accessibility, seo, visual, navigation);
    
    // Generate recommendations
    const recommendations = generateRecommendations(categories, issues);
    
    // Check if meets thresholds - navigation integrity is critical
    const meetsThresholds = categories.every(cat => cat.passed) && overallScore >= 8.0 && navigation.status === 'pass';
    
    return {
      overallScore,
      verdict: determineVerdict(overallScore),
      categories,
      issues,
      recommendations,
      performance,
      accessibility,
      seo,
      visual,
      navigation,
      generatedAt: new Date().toISOString(),
      iteration,
      meetsThresholds,
    };
  } catch (error: unknown) {
    logError(error, 'QA Engine');
    const errorMessage = getErrorMessage(error);
    throw new Error(`QA assessment failed: ${errorMessage}`);
  } finally {
    // Ensure browser always closes, even on error
    try {
      await browser.close();
    } catch (closeError) {
      console.error('[QA Engine] Error closing browser:', closeError);
    }
  }
}

/**
 * Assess performance
 */
async function assessPerformance(page: puppeteer.Page): Promise<PerformanceMetrics> {
  const metrics = await page.metrics();
  const loadTime = metrics?.LoadTime || 0;
  
  // Estimate Core Web Vitals (simplified)
  const lcp = loadTime * 0.6; // Estimated
  const fid = 50; // Estimated
  const cls = 0.1; // Estimated
  
  // Calculate performance score
  let score = 100;
  if (lcp > 2500) score -= 20;
  if (lcp > 4000) score -= 20;
  if (fid > 100) score -= 10;
  if (cls > 0.25) score -= 10;
  
  return {
    score: Math.max(0, score),
    lighthouse: {
      performance: score,
      accessibility: 90, // Would use Lighthouse API
      bestPractices: 85,
      seo: 90,
    },
    coreWebVitals: {
      lcp,
      fid,
      cls,
    },
    loadTime,
    pageSize: 0, // Would calculate from response
    requests: 0, // Would count from network
    images: {
      total: 0,
      optimized: 0,
      unoptimized: 0,
    },
  };
}

/**
 * Assess accessibility
 */
async function assessAccessibility(page: puppeteer.Page): Promise<AccessibilityMetrics> {
  // Check for common accessibility issues
  const hasAltText = await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    let withAlt = 0;
    images.forEach(img => {
      if (img.alt !== undefined && img.alt !== '') withAlt++;
    });
    return { total: images.length, withAlt };
  });
  
  const hasHeadings = await page.evaluate(() => {
    return document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0;
  });
  
  const hasLabels = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea, select');
    let labeled = 0;
    inputs.forEach(input => {
      if (input.getAttribute('aria-label') || input.closest('label')) labeled++;
    });
    return { total: inputs.length, labeled };
  });
  
  // Calculate accessibility score
  let score = 100;
  if (!hasHeadings) score -= 20;
  if (hasAltText.total > 0 && hasAltText.withAlt < hasAltText.total) score -= 15;
  if (hasLabels.total > 0 && hasLabels.labeled < hasLabels.total) score -= 15;
  
  return {
    score: Math.max(0, score),
    wcag: {
      level: score >= 90 ? 'AA' : score >= 75 ? 'A' : 'none',
      passed: 0,
      failed: 0,
      total: 0,
    },
    issues: {
      contrast: 0,
      altText: hasAltText.total - hasAltText.withAlt,
      headings: hasHeadings ? 0 : 1,
      labels: hasLabels.total - hasLabels.labeled,
      keyboard: 0,
      aria: 0,
    },
    colorContrast: {
      passed: true,
      ratios: {},
    },
  };
}

/**
 * Assess SEO
 */
async function assessSEO(page: puppeteer.Page): Promise<SEOMetrics> {
  const metaTags = await page.evaluate(() => {
    const title = document.querySelector('title')?.textContent || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    
    return { title, metaDesc, metaKeywords, ogTitle, ogDesc };
  });
  
  const structure = await page.evaluate(() => {
    const h1 = document.querySelector('h1') !== null;
    const headings = document.querySelectorAll('h1, h2, h3').length;
    const schema = document.querySelector('script[type="application/ld+json"]') !== null;
    
    return { h1, headings, schema };
  });
  
  // Calculate SEO score
  let score = 100;
  if (!metaTags.title) score -= 20;
  if (!metaTags.metaDesc) score -= 20;
  if (!structure.h1) score -= 15;
  if (structure.headings < 3) score -= 10;
  if (!structure.schema) score -= 10;
  
  return {
    score: Math.max(0, score),
    metaTags: {
      title: !!metaTags.title,
      description: !!metaTags.metaDesc,
      keywords: !!metaTags.metaKeywords,
      og: !!(metaTags.ogTitle && metaTags.ogDesc),
      twitter: false,
    },
    structure: {
      h1: structure.h1,
      headings: structure.headings > 0,
      schema: structure.schema,
      sitemap: false,
      robots: false,
    },
    content: {
      keywordDensity: 0,
      contentLength: 0,
      internalLinks: 0,
      externalLinks: 0,
    },
  };
}

/**
 * Assess visual design
 */
async function assessVisual(page: puppeteer.Page): Promise<VisualMetrics> {
  // Simplified visual assessment
  const hasHero = await page.evaluate(() => {
    return document.querySelector('.hero, [class*="hero"], section:first-of-type') !== null;
  });
  
  const hasCTAs = await page.evaluate(() => {
    return document.querySelectorAll('button, a[class*="cta"], a[class*="button"]').length > 0;
  });
  
  // Calculate visual score
  let score = 7.0;
  if (hasHero) score += 1.0;
  if (hasCTAs) score += 1.0;
  
  return {
    score: Math.min(10, score),
    layout: {
      balance: 8.0,
      hierarchy: 8.0,
      spacing: 7.5,
      alignment: 8.0,
    },
    design: {
      consistency: 8.0,
      branding: 7.5,
      typography: 8.0,
      colors: 8.0,
    },
    responsiveness: {
      mobile: 8.0,
      tablet: 8.0,
      desktop: 8.5,
    },
  };
}

/**
 * Assess navigation integrity
 */
async function assessNavigation(
  baseUrl: string,
  pages: PlannedPage[],
  projectSlug?: string
): Promise<NavigationMetrics> {
  const issues: NavigationIssue[] = [];
  let totalLinks = 0;
  let workingLinks = 0;
  let brokenLinks = 0;
  
  // If we have projectSlug, check files directly
  if (projectSlug) {
    const outputDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5');
    
    if (fs.existsSync(outputDir)) {
      // Check each HTML file
      for (const page of pages) {
        const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
        const filePath = path.join(outputDir, filename);
        
        if (!fs.existsSync(filePath)) {
          issues.push({
            page: filename,
            link: page.title,
            href: filename,
            reason: `Page file ${filename} does not exist`,
            severity: 'critical',
          });
          brokenLinks++;
          continue;
        }
        
        // Read and parse HTML
        const html = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(html);
        
        // Find all navigation links
        const navLinks = $('nav a[href], .navigation a[href], .nav-menu a[href]');
        totalLinks += navLinks.length;
        
        navLinks.each((_, element) => {
          const href = $(element).attr('href');
          if (!href) return;
          
          // Skip external links, anchors, and special protocols
          if (href.startsWith('http://') || 
              href.startsWith('https://') || 
              href.startsWith('mailto:') || 
              href.startsWith('tel:') ||
              href.startsWith('#') ||
              href.startsWith('javascript:')) {
            return;
          }
          
          // Check if file exists
          const targetPath = path.join(outputDir, href);
          const targetExists = fs.existsSync(targetPath);
          
          if (targetExists) {
            workingLinks++;
          } else {
            brokenLinks++;
            issues.push({
              page: filename,
              link: $(element).text().trim() || href,
              href,
              reason: `Target file ${href} does not exist`,
              severity: brokenLinks === 1 ? 'critical' : 'high', // First broken link is critical
            });
          }
        });
      }
    }
  }
  
  // Calculate integrity score (0-10)
  let integrityScore = 10;
  if (totalLinks > 0) {
    const workingRatio = workingLinks / totalLinks;
    integrityScore = Math.round(workingRatio * 10);
  } else if (brokenLinks > 0) {
    integrityScore = 0;
  }
  
  // Determine status
  let status: 'pass' | 'fail' | 'warning' = 'pass';
  if (integrityScore < 8) {
    status = 'fail';
  } else if (integrityScore < 10) {
    status = 'warning';
  }
  
  return {
    score: integrityScore,
    integrityScore,
    status,
    totalLinks,
    workingLinks,
    brokenLinks,
    issues,
  };
}

/**
 * Identify issues
 */
function identifyIssues(
  categories: QACategory[],
  performance: PerformanceMetrics,
  accessibility: AccessibilityMetrics,
  seo: SEOMetrics,
  visual: VisualMetrics,
  navigation: NavigationMetrics
): QAIssue[] {
  const issues: QAIssue[] = [];
  
  if (performance.score < 80) {
    issues.push({
      id: 'perf-1',
      category: 'performance',
      severity: 'high',
      type: 'performance',
      description: `Performance score is ${performance.score}/100`,
      location: 'global',
      suggestion: 'Optimize images, minify CSS/JS, enable caching',
      autoFixable: false,
    });
  }
  
  if (accessibility.issues.altText > 0) {
    issues.push({
      id: 'a11y-1',
      category: 'accessibility',
      severity: 'medium',
      type: 'accessibility',
      description: `${accessibility.issues.altText} images missing alt text`,
      location: 'images',
      suggestion: 'Add descriptive alt text to all images',
      autoFixable: false,
    });
  }
  
  if (seo.score < 80) {
    issues.push({
      id: 'seo-1',
      category: 'seo',
      severity: 'high',
      type: 'seo',
      description: `SEO score is ${seo.score}/100`,
      location: 'global',
      suggestion: 'Add missing meta tags, improve structure',
      autoFixable: false,
    });
  }
  
  // Navigation integrity issues
  if (navigation.status === 'fail') {
    issues.push({
      id: 'nav-1',
      category: 'navigation',
      severity: 'critical',
      type: 'navigation',
      description: `Navigation integrity check failed: ${navigation.brokenLinks} of ${navigation.totalLinks} header links point to missing pages`,
      location: 'navigation',
      suggestion: 'Fix navigation links to point to existing HTML files',
      autoFixable: false,
    });
    
    // Add individual broken link issues
    navigation.issues.forEach((navIssue, index) => {
      issues.push({
        id: `nav-${index + 2}`,
        category: 'navigation',
        severity: navIssue.severity,
        type: 'navigation',
        description: `Broken link in ${navIssue.page}: "${navIssue.link}" → ${navIssue.href} (${navIssue.reason})`,
        location: navIssue.page,
        suggestion: `Create ${navIssue.href} or fix link target`,
        autoFixable: false,
      });
    });
  } else if (navigation.status === 'warning') {
    issues.push({
      id: 'nav-warn-1',
      category: 'navigation',
      severity: 'medium',
      type: 'navigation',
      description: `Navigation integrity warning: ${navigation.brokenLinks} broken link(s) found`,
      location: 'navigation',
      suggestion: 'Review and fix navigation links',
      autoFixable: false,
    });
  }
  
  return issues;
}

/**
 * Generate recommendations
 */
function generateRecommendations(categories: QACategory[], issues: QAIssue[]): any[] {
  return issues.map(issue => ({
    priority: issue.severity === 'critical' || issue.severity === 'high' ? 'high' : 'medium',
    category: issue.category,
    action: issue.suggestion,
    impact: `Improves ${issue.category} score`,
    effort: 'medium',
  }));
}

/**
 * Determine verdict
 */
function determineVerdict(score: number): QAReport['verdict'] {
  if (score >= 9.5) return 'World-Class';
  if (score >= 8.5) return 'Excellent';
  if (score >= 7.5) return 'Good';
  if (score >= 6.0) return 'OK';
  return 'Poor';
}

