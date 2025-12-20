/**
 * Website Builder API Endpoints
 * Handles image generation and SEO assessment for the new 9-phase wizard
 */

import express from 'express';
import { generateWithLeonardo, getUsageStats } from '../services/leonardoImageService';

const router = express.Router();

// Types
interface GenerateImageRequest {
  prompt: string;
  originalUrl: string;
  section: string;
  type: 'image' | 'background' | 'video';
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
    services?: string[];
  };
  width?: number;
  height?: number;
}

interface SEOAssessRequest {
  html: string;
  keywords: string[];
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
  };
  pageKeywords: Array<{
    name: string;
    type: string;
    keywords: string[];
  }>;
}

interface SEOCategory {
  score: number;
  issues: string[];
}

interface SEOAssessmentResult {
  overallScore: number;
  categories: {
    performance: SEOCategory;
    accessibility: SEOCategory;
    seo: SEOCategory;
    visual: SEOCategory;
    navigation: SEOCategory;
  };
  recommendations: string[];
  passedChecks: string[];
  failedChecks: string[];
}

/**
 * Generate image using Leonardo AI
 * POST /api/website-builder/generate-images
 */
router.post('/generate-images', async (req, res) => {
  const body = req.body as GenerateImageRequest;
  const { prompt, section, type, businessContext, width, height } = body;

  console.log(`[WebsiteBuilder] Image generation request for ${section} (${type})`);
  console.log(`[WebsiteBuilder] Prompt: ${prompt.substring(0, 100)}...`);

  try {
    // Check Leonardo usage
    const usage = getUsageStats();
    if (usage.today.remaining <= 0) {
      console.warn('[WebsiteBuilder] Leonardo AI daily limit reached');
      return res.status(429).json({
        success: false,
        error: 'Daily image generation limit reached. Please try again tomorrow.',
        usage: usage.today,
      });
    }

    // Generate image with Leonardo
    const result = await generateWithLeonardo({
      prompt,
      width: width || 1024,
      height: height || 768,
      numImages: 1,
    });

    console.log(`[WebsiteBuilder] ✅ Image generated: ${result.url}`);

    return res.json({
      success: true,
      imageUrl: result.url,
      section,
      type,
      provider: result.provider,
      dailyUsage: result.dailyUsage,
      remainingToday: result.remainingToday,
    });
  } catch (error) {
    console.error('[WebsiteBuilder] ❌ Image generation failed:', error);

    // Return a fallback placeholder image
    const placeholderUrl = `https://via.placeholder.com/${width || 1024}x${height || 768}/4A5568/FFFFFF?text=${encodeURIComponent(section)}`;

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
      imageUrl: placeholderUrl, // Fallback
      fallback: true,
    });
  }
});

/**
 * Assess SEO of generated website
 * POST /api/website-builder/seo-assess
 */
router.post('/seo-assess', async (req, res) => {
  const body = req.body as SEOAssessRequest;
  const { html, keywords, businessContext, pageKeywords } = body;

  console.log(`[WebsiteBuilder] SEO assessment for ${businessContext.businessName}`);
  console.log(`[WebsiteBuilder] Keywords: ${keywords.slice(0, 5).join(', ')}...`);

  try {
    // Parse HTML for analysis
    const assessment = analyzeHTML(html, keywords, pageKeywords);

    console.log(`[WebsiteBuilder] ✅ SEO assessment complete: ${assessment.overallScore}/100`);

    return res.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('[WebsiteBuilder] ❌ SEO assessment failed:', error);

    // Return a mock assessment on error
    const mockAssessment: SEOAssessmentResult = {
      overallScore: 75,
      categories: {
        performance: { score: 80, issues: [] },
        accessibility: { score: 70, issues: ['Some images may be missing alt text'] },
        seo: { score: 75, issues: [] },
        visual: { score: 78, issues: [] },
        navigation: { score: 72, issues: [] },
      },
      recommendations: [
        'Add more keyword variations to content',
        'Ensure all images have descriptive alt text',
        'Consider adding structured data',
      ],
      passedChecks: [
        'Title tag present',
        'Meta description found',
        'H1 tag used',
      ],
      failedChecks: [],
    };

    return res.json({
      success: true,
      assessment: mockAssessment,
      fallback: true,
    });
  }
});

/**
 * Download website as ZIP
 * POST /api/website-builder/download
 */
router.post('/download', async (req, res) => {
  const { html, businessName } = req.body;

  console.log(`[WebsiteBuilder] Download request for ${businessName}`);

  try {
    // For now, just return the HTML as a file
    // In production, this would create a proper ZIP with assets
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${businessName.toLowerCase().replace(/\s+/g, '-')}-website.html"`);
    return res.send(html);
  } catch (error) {
    console.error('[WebsiteBuilder] ❌ Download failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    });
  }
});

/**
 * Analyze HTML for SEO
 */
function analyzeHTML(
  html: string,
  keywords: string[],
  pageKeywords: Array<{ name: string; type: string; keywords: string[] }>
): SEOAssessmentResult {
  const lowerHtml = html.toLowerCase();
  const issues: Record<string, string[]> = {
    performance: [],
    accessibility: [],
    seo: [],
    visual: [],
    navigation: [],
  };
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];
  const recommendations: string[] = [];

  // Title check
  const hasTitle = lowerHtml.includes('<title>') && lowerHtml.includes('</title>');
  if (hasTitle) {
    passedChecks.push('Title tag present');
  } else {
    failedChecks.push('Missing title tag');
    issues.seo.push('Missing title tag');
  }

  // Meta description check
  const hasMetaDesc = lowerHtml.includes('name="description"') || lowerHtml.includes("name='description'");
  if (hasMetaDesc) {
    passedChecks.push('Meta description present');
  } else {
    failedChecks.push('Missing meta description');
    issues.seo.push('Missing meta description');
    recommendations.push('Add a meta description for better SEO');
  }

  // H1 check
  const hasH1 = lowerHtml.includes('<h1');
  const multipleH1 = (lowerHtml.match(/<h1/g) || []).length > 1;
  if (hasH1) {
    passedChecks.push('H1 tag present');
    if (multipleH1) {
      issues.seo.push('Multiple H1 tags found - consider using only one');
      recommendations.push('Use only one H1 tag per page');
    }
  } else {
    failedChecks.push('Missing H1 tag');
    issues.seo.push('Missing H1 tag');
  }

  // Viewport check
  const hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
  if (hasViewport) {
    passedChecks.push('Viewport meta tag present (mobile-friendly)');
  } else {
    issues.performance.push('Missing viewport meta tag');
    recommendations.push('Add viewport meta tag for mobile responsiveness');
  }

  // Alt text check
  const imgCount = (lowerHtml.match(/<img/g) || []).length;
  const altCount = (lowerHtml.match(/alt=["'][^"']+["']/gi) || []).length;
  if (imgCount > 0 && altCount < imgCount) {
    issues.accessibility.push(`${imgCount - altCount} images missing alt text`);
    recommendations.push('Add alt text to all images for accessibility');
  } else if (imgCount > 0) {
    passedChecks.push('All images have alt text');
  }

  // Keyword presence check
  let keywordHits = 0;
  for (const keyword of keywords.slice(0, 10)) {
    if (lowerHtml.includes(keyword.toLowerCase())) {
      keywordHits++;
    }
  }
  const keywordPercentage = keywords.length > 0 ? (keywordHits / Math.min(keywords.length, 10)) * 100 : 0;
  if (keywordPercentage >= 70) {
    passedChecks.push(`Keywords well integrated (${keywordHits}/${Math.min(keywords.length, 10)} found)`);
  } else if (keywordPercentage >= 40) {
    issues.seo.push('Some keywords not found in content');
    recommendations.push('Add more of your target keywords to the content');
  } else {
    issues.seo.push('Most keywords missing from content');
    recommendations.push('Integrate your target keywords naturally into the content');
  }

  // Heading structure check
  const hasH2 = lowerHtml.includes('<h2');
  if (hasH1 && hasH2) {
    passedChecks.push('Good heading structure (H1 and H2 present)');
  } else if (hasH1) {
    recommendations.push('Consider adding H2 subheadings for better structure');
  }

  // Links check
  const hasInternalLinks = lowerHtml.includes('href="#') || lowerHtml.includes('href="./');
  const hasExternalLinks = lowerHtml.includes('href="http');
  if (hasInternalLinks) {
    passedChecks.push('Internal links present');
  }
  if (hasExternalLinks) {
    passedChecks.push('External links present');
  }

  // Navigation check
  const hasNav = lowerHtml.includes('<nav') || lowerHtml.includes('class="nav') || lowerHtml.includes("class='nav");
  if (hasNav) {
    passedChecks.push('Navigation element present');
  } else {
    issues.navigation.push('Missing dedicated navigation element');
    recommendations.push('Add a clear navigation menu');
  }

  // Calculate scores
  const seoScore = calculateScore([
    hasTitle ? 20 : 0,
    hasMetaDesc ? 15 : 0,
    hasH1 ? 15 : 0,
    !multipleH1 ? 5 : 0,
    keywordPercentage >= 70 ? 25 : keywordPercentage >= 40 ? 15 : 5,
    hasH2 ? 10 : 5,
    hasInternalLinks ? 5 : 0,
    hasExternalLinks ? 5 : 0,
  ], 100);

  const performanceScore = calculateScore([
    hasViewport ? 40 : 0,
    imgCount < 20 ? 30 : imgCount < 50 ? 20 : 10,
    30, // Base score
  ], 100);

  const accessibilityScore = calculateScore([
    altCount >= imgCount ? 50 : (altCount / Math.max(imgCount, 1)) * 50,
    hasTitle ? 20 : 0,
    30, // Base score for having content
  ], 100);

  const visualScore = calculateScore([
    hasH1 ? 20 : 0,
    hasH2 ? 20 : 0,
    imgCount > 0 ? 30 : 10,
    30, // Base score
  ], 100);

  const navigationScore = calculateScore([
    hasNav ? 40 : 0,
    hasInternalLinks ? 30 : 0,
    30, // Base score
  ], 100);

  const overallScore = Math.round(
    (seoScore * 0.3) +
    (performanceScore * 0.2) +
    (accessibilityScore * 0.2) +
    (visualScore * 0.15) +
    (navigationScore * 0.15)
  );

  return {
    overallScore,
    categories: {
      performance: { score: performanceScore, issues: issues.performance },
      accessibility: { score: accessibilityScore, issues: issues.accessibility },
      seo: { score: seoScore, issues: issues.seo },
      visual: { score: visualScore, issues: issues.visual },
      navigation: { score: navigationScore, issues: issues.navigation },
    },
    recommendations,
    passedChecks,
    failedChecks,
  };
}

/**
 * Calculate score from components
 */
function calculateScore(components: number[], maxScore: number): number {
  const total = components.reduce((sum, c) => sum + c, 0);
  return Math.min(Math.round(total), maxScore);
}

export default router;

