/**
 * SEO Validator Service
 * Validates SEO tags, structured data, and Open Graph tags
 * Tests with Google's Rich Results Test API
 */

import puppeteer from 'puppeteer';

export interface SEOValidationResult {
  score: number; // 0-100
  passed: boolean;
  metaTags: {
    title: { present: boolean; length: number; optimal: boolean; value?: string };
    description: { present: boolean; length: number; optimal: boolean; value?: string };
    keywords: { present: boolean; value?: string };
  };
  openGraph: {
    title: { present: boolean; value?: string };
    description: { present: boolean; value?: string };
    image: { present: boolean; value?: string };
    url: { present: boolean; value?: string };
  };
  structuredData: {
    present: boolean;
    valid: boolean;
    types: string[];
    errors: string[];
  };
  headings: {
    h1: { present: boolean; count: number; value?: string };
    h2: { present: boolean; count: number };
    h3: { present: boolean; count: number };
    hierarchy: boolean;
  };
  recommendations: string[];
  issues: Array<{
    category: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }>;
}

/**
 * Validate SEO tags and structure
 */
export async function validateSEO(url: string): Promise<SEOValidationResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Extract meta tags
    const metaTags = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent || '';
      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      
      return { title, metaDesc, metaKeywords };
    });

    // Extract Open Graph tags
    const openGraph = await page.evaluate(() => {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
      
      return { ogTitle, ogDesc, ogImage, ogUrl };
    });

    // Extract structured data
    const structuredData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const schemas: any[] = [];
      const errors: string[] = [];
      
      scripts.forEach(script => {
        try {
          const json = JSON.parse(script.textContent || '{}');
          schemas.push(json);
          
          if (!json['@type']) {
            errors.push('Schema missing @type property');
          }
        } catch (e) {
          errors.push(`Invalid JSON-LD: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      });
      
      const types = schemas.map(s => s['@type']).filter(Boolean);
      
      return { schemas, types, errors };
    });

    // Extract headings
    const headings = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1'));
      const h2s = Array.from(document.querySelectorAll('h2'));
      const h3s = Array.from(document.querySelectorAll('h3'));
      
      return {
        h1: {
          count: h1s.length,
          value: h1s[0]?.textContent || '',
        },
        h2: {
          count: h2s.length,
        },
        h3: {
          count: h3s.length,
        },
      };
    });

    await browser.close();

    // Validate and score
    const recommendations: string[] = [];
    const issues: SEOValidationResult['issues'] = [];
    let score = 100;

    // Meta title validation
    const titleLength = metaTags.title.length;
    const titleOptimal = titleLength >= 50 && titleLength <= 60;
    if (!metaTags.title) {
      score -= 20;
      issues.push({
        category: 'Meta Tags',
        severity: 'error',
        message: 'Missing title tag',
        suggestion: 'Add a title tag between 50-60 characters',
      });
      recommendations.push('Add a descriptive title tag (50-60 characters)');
    } else if (!titleOptimal) {
      score -= 10;
      issues.push({
        category: 'Meta Tags',
        severity: 'warning',
        message: `Title length is ${titleLength} characters (optimal: 50-60)`,
        suggestion: 'Optimize title tag length for better SEO',
      });
      recommendations.push(`Optimize title tag length (currently ${titleLength} chars, target: 50-60)`);
    }

    // Meta description validation
    const descLength = metaTags.metaDesc.length;
    const descOptimal = descLength >= 150 && descLength <= 165;
    if (!metaTags.metaDesc) {
      score -= 20;
      issues.push({
        category: 'Meta Tags',
        severity: 'error',
        message: 'Missing meta description',
        suggestion: 'Add a meta description between 150-165 characters',
      });
      recommendations.push('Add a compelling meta description (150-165 characters)');
    } else if (!descOptimal) {
      score -= 5;
      issues.push({
        category: 'Meta Tags',
        severity: 'warning',
        message: `Meta description length is ${descLength} characters (optimal: 150-165)`,
        suggestion: 'Optimize meta description length for better click-through rates',
      });
    }

    // H1 validation
    if (headings.h1.count === 0) {
      score -= 15;
      issues.push({
        category: 'Structure',
        severity: 'error',
        message: 'Missing H1 heading',
        suggestion: 'Add exactly one H1 heading per page',
      });
      recommendations.push('Add an H1 heading to your page');
    } else if (headings.h1.count > 1) {
      score -= 10;
      issues.push({
        category: 'Structure',
        severity: 'warning',
        message: `Multiple H1 headings found (${headings.h1.count})`,
        suggestion: 'Use only one H1 per page for better SEO',
      });
      recommendations.push('Use only one H1 heading per page');
    }

    // Heading hierarchy validation
    if (headings.h1.count === 1 && headings.h2.count === 0 && headings.h3.count > 0) {
      score -= 5;
      issues.push({
        category: 'Structure',
        severity: 'warning',
        message: 'H3 found without H2 (heading hierarchy issue)',
        suggestion: 'Follow proper heading hierarchy: H1 → H2 → H3',
      });
      recommendations.push('Follow proper heading hierarchy (H1 → H2 → H3)');
    }

    // Structured data validation
    if (structuredData.schemas.length === 0) {
      score -= 15;
      issues.push({
        category: 'Structured Data',
        severity: 'error',
        message: 'No structured data (JSON-LD) found',
        suggestion: 'Add JSON-LD structured data for better search engine understanding',
      });
      recommendations.push('Add JSON-LD structured data (Organization, WebPage, LocalBusiness, etc.)');
    } else if (structuredData.errors.length > 0) {
      score -= 10;
      issues.push({
        category: 'Structured Data',
        severity: 'error',
        message: `Structured data errors: ${structuredData.errors.join(', ')}`,
        suggestion: 'Fix JSON-LD schema errors',
      });
      recommendations.push('Fix structured data JSON-LD errors');
    } else {
      // Validate schema types
      const hasOrganization = structuredData.types.some(t => 
        t === 'Organization' || t === 'LocalBusiness' || t === 'ProfessionalService'
      );
      if (!hasOrganization) {
        score -= 5;
        recommendations.push('Add Organization or LocalBusiness schema for better local SEO');
      }
    }

    // Open Graph validation
    if (!openGraph.ogTitle || !openGraph.ogDesc || !openGraph.ogImage) {
      score -= 10;
      issues.push({
        category: 'Open Graph',
        severity: 'warning',
        message: 'Missing Open Graph tags',
        suggestion: 'Add Open Graph tags for better social media sharing',
      });
      recommendations.push('Add Open Graph tags (og:title, og:description, og:image) for social sharing');
    }

    return {
      score: Math.max(0, score),
      passed: score >= 80,
      metaTags: {
        title: {
          present: !!metaTags.title,
          length: titleLength,
          optimal: titleOptimal,
          value: metaTags.title || undefined,
        },
        description: {
          present: !!metaTags.metaDesc,
          length: descLength,
          optimal: descOptimal,
          value: metaTags.metaDesc || undefined,
        },
        keywords: {
          present: !!metaTags.metaKeywords,
          value: metaTags.metaKeywords || undefined,
        },
      },
      openGraph: {
        title: {
          present: !!openGraph.ogTitle,
          value: openGraph.ogTitle || undefined,
        },
        description: {
          present: !!openGraph.ogDesc,
          value: openGraph.ogDesc || undefined,
        },
        image: {
          present: !!openGraph.ogImage,
          value: openGraph.ogImage || undefined,
        },
        url: {
          present: !!openGraph.ogUrl,
          value: openGraph.ogUrl || undefined,
        },
      },
      structuredData: {
        present: structuredData.schemas.length > 0,
        valid: structuredData.errors.length === 0,
        types: structuredData.types,
        errors: structuredData.errors,
      },
      headings: {
        h1: {
          present: headings.h1.count > 0,
          count: headings.h1.count,
          value: headings.h1.value || undefined,
        },
        h2: {
          present: headings.h2.count > 0,
          count: headings.h2.count,
        },
        h3: {
          present: headings.h3.count > 0,
          count: headings.h3.count,
        },
        hierarchy: headings.h1.count === 1 && (headings.h2.count > 0 || headings.h3.count === 0),
      },
      recommendations,
      issues,
    };
  } catch (error) {
    console.error('[SEO Validator] Error validating SEO:', error);
    await browser.close();
    
    return {
      score: 0,
      passed: false,
      metaTags: {
        title: { present: false, length: 0, optimal: false },
        description: { present: false, length: 0, optimal: false },
        keywords: { present: false },
      },
      openGraph: {
        title: { present: false },
        description: { present: false },
        image: { present: false },
        url: { present: false },
      },
      structuredData: {
        present: false,
        valid: false,
        types: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      headings: {
        h1: { present: false, count: 0 },
        h2: { present: false, count: 0 },
        h3: { present: false, count: 0 },
        hierarchy: false,
      },
      recommendations: ['Failed to validate SEO - check URL accessibility'],
      issues: [{
        category: 'Validation',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Ensure the URL is accessible and try again',
      }],
    };
  }
}

/**
 * Test structured data with Google Rich Results Test
 * (Note: This is a simplified version - in production, use Google's API)
 */
export async function testStructuredData(url: string): Promise<{
  valid: boolean;
  types: string[];
  errors: string[];
}> {
  // In production, this would call Google's Rich Results Test API
  // For now, we validate locally
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    const result = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const schemas: any[] = [];
      const errors: string[] = [];
      
      scripts.forEach(script => {
        try {
          const json = JSON.parse(script.textContent || '{}');
          if (!json['@context'] || !json['@context'].includes('schema.org')) {
            errors.push('Missing or invalid @context');
          }
          if (!json['@type']) {
            errors.push('Missing @type');
          }
          schemas.push(json);
        } catch (e) {
          errors.push(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      });
      
      return {
        valid: errors.length === 0 && schemas.length > 0,
        types: schemas.map(s => s['@type']).filter(Boolean),
        errors,
      };
    });

    await browser.close();
    return result;
  } catch (error) {
    await browser.close();
    return {
      valid: false,
      types: [],
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

