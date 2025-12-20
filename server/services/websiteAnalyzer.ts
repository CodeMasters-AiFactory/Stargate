/**
 * Website Analysis Service
 * Analyzes any website URL against the quality standards manifesto
 * Provides honest, critical feedback using the same rubric
 */

import OpenAI from 'openai';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { aiRouter } from '../ai/modelRouter';

// OpenAI client factory (fallback)
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

const openai = createOpenAIClient();

/**
 * Read quality manifesto for analysis standards
 */
function readQualityManifesto(): string {
  try {
    const manifestoPath = path.join(process.cwd(), 'website_quality_standards', '00-website-quality-manifesto.md');
    return fs.readFileSync(manifestoPath, 'utf-8');
  } catch (error) {
    return '';
  }
}

export interface WebsiteAnalysis {
  url: string;
  timestamp: string;
  overallSummary: string;
  categoryScores: {
    visualDesign: number; // 0-10
    uxStructure: number; // 0-10
    contentPositioning: number; // 0-10
    conversionTrust: number; // 0-10
    seoFoundations: number; // 0-10
    creativityDifferentiation: number; // 0-10
  };
  categoryDetails: {
    visualDesign: {
      strengths: string[];
      improvements: string[];
    };
    uxStructure: {
      strengths: string[];
      improvements: string[];
    };
    contentPositioning: {
      strengths: string[];
      improvements: string[];
    };
    conversionTrust: {
      strengths: string[];
      improvements: string[];
    };
    seoFoundations: {
      strengths: string[];
      improvements: string[];
    };
    creativityDifferentiation: {
      strengths: string[];
      improvements: string[];
    };
  };
  finalVerdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
  averageScore: number;
}

/**
 * Fetch and parse website HTML
 */
async function fetchWebsiteHTML(url: string): Promise<{ html: string; title: string; description: string }> {
  try {
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    
    return {
      html,
      title,
      description
    };
  } catch (error) {
    throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract key information from HTML
 */
function extractWebsiteInfo(html: string): {
  title: string;
  description: string;
  h1Count: number;
  h1Text: string;
  h2Count: number;
  metaDescription: string;
  hasSchema: boolean;
  imageCount: number;
  formCount: number;
  ctaCount: number;
  linkCount: number;
  hasNavigation: boolean;
  colorScheme: string[];
} {
  const $ = cheerio.load(html);
  
  const h1s = $('h1');
  const h2s = $('h2');
  const images = $('img');
  const forms = $('form');
  const links = $('a');
  const ctas = $('button, a.btn, input[type="submit"]');
  const nav = $('nav, header nav, .navigation, .nav');
  
  // Extract colors from inline styles and CSS
  const styles = $('style').text();
  const colorMatches = styles.match(/#[0-9a-fA-F]{6}|rgb\([^)]+\)/g) || [];
  const uniqueColors = [...new Set(colorMatches)].slice(0, 5);
  
  return {
    title: $('title').text() || '',
    description: $('meta[name="description"]').attr('content') || '',
    h1Count: h1s.length,
    h1Text: h1s.first().text() || '',
    h2Count: h2s.length,
    metaDescription: $('meta[name="description"]').attr('content') || '',
    hasSchema: html.includes('application/ld+json') || html.includes('schema.org'),
    imageCount: images.length,
    formCount: forms.length,
    ctaCount: ctas.length,
    linkCount: links.length,
    hasNavigation: nav.length > 0,
    colorScheme: uniqueColors
  };
}

/**
 * Analyze website using AI
 */
export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const qualityManifesto = readQualityManifesto();
  
  // Fetch website
  const { html, title, description } = await fetchWebsiteHTML(url);
  const websiteInfo = extractWebsiteInfo(html);
  
  // Try v4.0 analysis first (multi-expert panel, most advanced)
  try {
    const { analyzeWebsiteV4 } = await import('./analyzerV4');
    console.log('[Website Analyzer] ✅ Using v4.0 analysis (multi-expert panel, human perception, consensus engine)');
    const v4Result = await analyzeWebsiteV4(url);
    
    // Convert v4 result to v2 format for compatibility
    const expertScores = {
      visualDesign: v4Result.expertPanel.productDesigner.score,
      uxStructure: v4Result.expertPanel.uxDesigner.score,
      contentPositioning: v4Result.expertPanel.seoSpecialist.score, // Content from SEO agent
      conversionTrust: v4Result.expertPanel.conversionStrategist.score,
      seoFoundations: v4Result.expertPanel.seoSpecialist.score,
      creativityDifferentiation: v4Result.expertPanel.brandAnalyst.score
    };
    
    const averageScore = Object.values(expertScores).reduce((a: number, b: number) => a + b, 0) / 6;
    
    return {
      url: v4Result.url,
      timestamp: v4Result.timestamp,
      overallSummary: `This website scores ${v4Result.finalScore.weightedScore}/100 (${averageScore.toFixed(1)}/10 average), rated as "${v4Result.finalScore.verdict}". ${v4Result.finalScore.meetsExcellentCriteria ? 'Meets all Excellent criteria.' : 'Does not meet all Excellent criteria.'} Expert panel agreement: ${v4Result.consensus.expertAgreement}%. Human perception: ${v4Result.perception.totalScore}/100.`,
      categoryScores: expertScores,
      categoryDetails: {
        visualDesign: {
          strengths: v4Result.expertPanel.productDesigner.strengths,
          improvements: v4Result.expertPanel.productDesigner.weaknesses
        },
        uxStructure: {
          strengths: v4Result.expertPanel.uxDesigner.strengths,
          improvements: v4Result.expertPanel.uxDesigner.weaknesses
        },
        contentPositioning: {
          strengths: v4Result.expertPanel.seoSpecialist.strengths,
          improvements: v4Result.expertPanel.seoSpecialist.weaknesses
        },
        conversionTrust: {
          strengths: v4Result.expertPanel.conversionStrategist.strengths,
          improvements: v4Result.expertPanel.conversionStrategist.weaknesses
        },
        seoFoundations: {
          strengths: v4Result.expertPanel.seoSpecialist.strengths,
          improvements: v4Result.expertPanel.seoSpecialist.weaknesses
        },
        creativityDifferentiation: {
          strengths: v4Result.expertPanel.brandAnalyst.strengths,
          improvements: v4Result.expertPanel.brandAnalyst.weaknesses
        }
      },
      finalVerdict: v4Result.finalScore.verdict,
      averageScore
    };
  } catch (error) {
    console.error('[Website Analyzer] ❌ v4.0 analysis failed:', error);
    console.warn('[Website Analyzer] Falling back to v3.0 analysis...');
  }
  
  // Fallback to v3.0 analysis
  try {
    const { analyzeWebsiteV3 } = await import('./analyzerV3');
    console.log('[Website Analyzer] ✅ Using v3.0 analysis (screenshot-based, mobile rendering, advanced detection)');
    const v3Result = await analyzeWebsiteV3(url);
    
    // Convert v3 result to v2 format for compatibility
    const averageScore = Object.values(v3Result.categoryScores).reduce((a: number, b: number) => a + b, 0) / 7;
    
    return {
      url: v3Result.url,
      timestamp: v3Result.timestamp,
      overallSummary: `This website scores ${v3Result.weightedScore}/100 (${averageScore.toFixed(1)}/10 average), rated as "${v3Result.verdict}". ${v3Result.meetsExcellentCriteria ? 'Meets all Excellent criteria.' : 'Does not meet all Excellent criteria.'}`,
      categoryScores: {
        visualDesign: v3Result.categoryScores.visualDesign,
        uxStructure: v3Result.categoryScores.uxStructure,
        contentPositioning: v3Result.categoryScores.contentQuality,
        conversionTrust: v3Result.categoryScores.conversionTrust,
        seoFoundations: v3Result.categoryScores.seoFoundations,
        creativityDifferentiation: v3Result.categoryScores.creativity
      },
      categoryDetails: {
        visualDesign: { strengths: [], improvements: [] },
        uxStructure: { strengths: [], improvements: [] },
        contentPositioning: { strengths: [], improvements: [] },
        conversionTrust: { strengths: [], improvements: [] },
        seoFoundations: { strengths: [], improvements: [] },
        creativityDifferentiation: { strengths: [], improvements: [] }
      },
      finalVerdict: v3Result.verdict,
      averageScore
    };
  } catch (error) {
    console.error('[Website Analyzer] ❌ v3.0 analysis failed:', error);
    console.warn('[Website Analyzer] Falling back to v2.0 analysis...');
  }
  
  // Fallback to v2.0 analysis
  try {
    const { analyzeWebsiteAdvanced } = await import('./advancedWebsiteAnalyzer');
    console.log('[Website Analyzer] ✅ Using ADVANCED analysis v2.0 (CSS parsing, enhanced detection)');
    const advancedResult = await analyzeWebsiteAdvanced(url, html);
    console.log(`[Website Analyzer] Advanced analysis complete: ${advancedResult.averageScore}/10 - ${advancedResult.finalVerdict}`);
    return advancedResult;
  } catch (error) {
    console.error('[Website Analyzer] ❌ Advanced analysis failed:', error);
    console.warn('[Website Analyzer] Falling back to basic local analysis...');
  }
  
  // Fallback to basic local analysis
  try {
    const { analyzeWebsiteLocally } = await import('./localWebsiteAnalyzer');
    console.log('[Website Analyzer] ✅ Using LOCAL analysis (no API required)');
    const localResult = analyzeWebsiteLocally(url, html, websiteInfo);
    console.log(`[Website Analyzer] Local analysis complete: ${localResult.averageScore}/10 - ${localResult.finalVerdict}`);
    return localResult;
  } catch (error) {
    console.error('[Website Analyzer] ❌ Local analysis failed:', error);
    console.warn('[Website Analyzer] Falling back to OpenAI or mock...');
  }
  
  // Fallback to OpenAI if available
  if (!openai) {
    console.log('[Website Analyzer] ⚠️ Using mock analysis (no OpenAI API key)');
    // Final fallback: mock analysis
    return generateMockAnalysis(url, websiteInfo);
  }
  
  const systemPrompt = `You are a strict, honest website quality analyst. You analyze websites against world-class standards.

QUALITY STANDARDS (from manifesto):
${qualityManifesto.substring(0, 3000)}

CRITICAL RULES:
1. Be HONEST and CRITICAL - don't flatter
2. If ANY category is below 7.5/10, the site is NOT "Excellent"
3. Compare against top-tier websites in that industry
4. Provide SPECIFIC, ACTIONABLE feedback
5. Use concrete examples ("add location keywords to H1") not vague praise
6. Score 0-10 for each category based on the rubric

RATING SCALE:
- 0-3: Poor (fundamental issues)
- 4-5: OK (basic functionality, needs improvement)
- 6-7: Good (professional but not exceptional)
- 7.5-8.5: Excellent (high quality, competes well)
- 8.5-10: World-Class (exceptional, sets standards)

VERDICT RULES:
- Poor: average < 4.0
- OK: average 4.0-5.9
- Good: average 6.0-7.4
- Excellent: average 7.5-8.4 AND no category below 7.5
- World-Class: average > 8.5 AND all categories ≥ 8.5

Output JSON with this structure:
{
  "overallSummary": "1-2 paragraph honest assessment",
  "categoryScores": {
    "visualDesign": 0-10,
    "uxStructure": 0-10,
    "contentPositioning": 0-10,
    "conversionTrust": 0-10,
    "seoFoundations": 0-10,
    "creativityDifferentiation": 0-10
  },
  "categoryDetails": {
    "visualDesign": {
      "strengths": ["2-4 specific strengths"],
      "improvements": ["2-4 specific improvements"]
    },
    ... (same for all 6 categories)
  },
  "finalVerdict": "Poor" | "OK" | "Good" | "Excellent" | "World-Class",
  "averageScore": number
}`;

  const userPrompt = `Analyze this website: ${url}

WEBSITE INFORMATION:
- Title: ${websiteInfo.title}
- Meta Description: ${websiteInfo.description}
- H1 Count: ${websiteInfo.h1Count} (Text: "${websiteInfo.h1Text}")
- H2 Count: ${websiteInfo.h2Count}
- Images: ${websiteInfo.imageCount}
- Forms: ${websiteInfo.formCount}
- CTAs: ${websiteInfo.ctaCount}
- Links: ${websiteInfo.linkCount}
- Has Navigation: ${websiteInfo.hasNavigation}
- Has Schema: ${websiteInfo.hasSchema}
- Color Scheme: ${websiteInfo.colorScheme.join(', ')}

HTML EXCERPT (first 5000 chars):
${html.substring(0, 5000)}

Analyze this website honestly and critically. Rate each category 0-10. Provide specific, actionable feedback. Be strict - only call it "Excellent" if ALL categories are ≥ 7.5/10.

Output valid JSON only.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.3 // Lower temperature for more consistent scoring
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      url,
      timestamp: new Date().toISOString(),
      overallSummary: analysis.overallSummary || 'Analysis completed',
      categoryScores: {
        visualDesign: analysis.categoryScores?.visualDesign || 0,
        uxStructure: analysis.categoryScores?.uxStructure || 0,
        contentPositioning: analysis.categoryScores?.contentPositioning || 0,
        conversionTrust: analysis.categoryScores?.conversionTrust || 0,
        seoFoundations: analysis.categoryScores?.seoFoundations || 0,
        creativityDifferentiation: analysis.categoryScores?.creativityDifferentiation || 0
      },
      categoryDetails: analysis.categoryDetails || {
        visualDesign: { strengths: [], improvements: [] },
        uxStructure: { strengths: [], improvements: [] },
        contentPositioning: { strengths: [], improvements: [] },
        conversionTrust: { strengths: [], improvements: [] },
        seoFoundations: { strengths: [], improvements: [] },
        creativityDifferentiation: { strengths: [], improvements: [] }
      },
      finalVerdict: analysis.finalVerdict || 'OK',
      averageScore: analysis.averageScore || 0
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    return generateMockAnalysis(url, websiteInfo);
  }
}

/**
 * Generate mock analysis (fallback)
 */
function generateMockAnalysis(url: string, info: any): WebsiteAnalysis {
  const scores = {
    visualDesign: 5,
    uxStructure: 5,
    contentPositioning: 5,
    conversionTrust: 5,
    seoFoundations: 5,
    creativityDifferentiation: 5
  };
  
  const average = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
  
  return {
    url,
    timestamp: new Date().toISOString(),
    overallSummary: 'Mock analysis - OpenAI not available. Please configure API key for full analysis.',
    categoryScores: scores,
    categoryDetails: {
      visualDesign: { strengths: [], improvements: ['Full analysis requires OpenAI API'] },
      uxStructure: { strengths: [], improvements: ['Full analysis requires OpenAI API'] },
      contentPositioning: { strengths: [], improvements: ['Full analysis requires OpenAI API'] },
      conversionTrust: { strengths: [], improvements: ['Full analysis requires OpenAI API'] },
      seoFoundations: { strengths: [], improvements: ['Full analysis requires OpenAI API'] },
      creativityDifferentiation: { strengths: [], improvements: ['Full analysis requires OpenAI API'] }
    },
    finalVerdict: average < 4 ? 'Poor' : average < 6 ? 'OK' : average < 7.5 ? 'Good' : 'Excellent',
    averageScore: average
  };
}

/**
 * Save analysis report to file
 */
export function saveAnalysisReport(analysis: WebsiteAnalysis): string {
  // Use v2 folder for advanced analysis
  const reportsDir = path.join(process.cwd(), 'website_analysis_reports_v2');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const domain = new URL(analysis.url).hostname.replace(/\./g, '-');
  const timestamp = analysis.timestamp.replace(/[:.]/g, '-');
  const filename = `${domain}-${timestamp}.md`;
  const filepath = path.join(reportsDir, filename);
  
  const markdown = `# Website Analysis Report

**URL:** ${analysis.url}  
**Date:** ${new Date(analysis.timestamp).toLocaleString()}  
**Overall Rating:** ${analysis.finalVerdict} (${analysis.averageScore.toFixed(1)}/10)

---

## Overall Summary

${analysis.overallSummary}

---

## Category Scores

| Category | Score | Status |
|----------|-------|--------|
| Visual Design & Layout | ${analysis.categoryScores.visualDesign}/10 | ${getStatus(analysis.categoryScores.visualDesign)} |
| UX & Structure | ${analysis.categoryScores.uxStructure}/10 | ${getStatus(analysis.categoryScores.uxStructure)} |
| Content & Positioning | ${analysis.categoryScores.contentPositioning}/10 | ${getStatus(analysis.categoryScores.contentPositioning)} |
| Conversion & Trust | ${analysis.categoryScores.conversionTrust}/10 | ${getStatus(analysis.categoryScores.conversionTrust)} |
| SEO Foundations | ${analysis.categoryScores.seoFoundations}/10 | ${getStatus(analysis.categoryScores.seoFoundations)} |
| Creativity & Differentiation | ${analysis.categoryScores.creativityDifferentiation}/10 | ${getStatus(analysis.categoryScores.creativityDifferentiation)} |

**Average Score:** ${analysis.averageScore.toFixed(1)}/10

---

## Detailed Analysis

### Visual Design & Layout (${analysis.categoryScores.visualDesign}/10)

**Strengths:**
${analysis.categoryDetails.visualDesign.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.visualDesign.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

### UX & Structure (${analysis.categoryScores.uxStructure}/10)

**Strengths:**
${analysis.categoryDetails.uxStructure.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.uxStructure.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

### Content & Positioning (${analysis.categoryScores.contentPositioning}/10)

**Strengths:**
${analysis.categoryDetails.contentPositioning.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.contentPositioning.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

### Conversion & Trust (${analysis.categoryScores.conversionTrust}/10)

**Strengths:**
${analysis.categoryDetails.conversionTrust.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.conversionTrust.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

### SEO Foundations (${analysis.categoryScores.seoFoundations}/10)

**Strengths:**
${analysis.categoryDetails.seoFoundations.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.seoFoundations.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

### Creativity & Differentiation (${analysis.categoryScores.creativityDifferentiation}/10)

**Strengths:**
${analysis.categoryDetails.creativityDifferentiation.strengths.map(s => `- ${s}`).join('\n') || '- None identified'}

**Improvements:**
${analysis.categoryDetails.creativityDifferentiation.improvements.map(i => `- ${i}`).join('\n') || '- None identified'}

---

## Final Verdict

**${analysis.finalVerdict}** - ${getVerdictDescription(analysis.finalVerdict)}

${analysis.averageScore < 7.5 ? '⚠️ **This website is NOT excellent.** At least one category is below 7.5/10, or the average score is below 7.5.' : '✅ This website meets the "Excellent" threshold.'}

---

*Generated by Merlin Website Wizard Quality Analyzer*
`;

  fs.writeFileSync(filepath, markdown, 'utf-8');
  return filepath;
}

function getStatus(score: number): string {
  if (score < 4) return '❌ Poor';
  if (score < 6) return '⚠️ OK';
  if (score < 7.5) return '✅ Good';
  if (score < 8.5) return '⭐ Excellent';
  return '🏆 World-Class';
}

function getVerdictDescription(verdict: string): string {
  const descriptions: Record<string, string> = {
    'Poor': 'The website has fundamental issues and is not production-ready.',
    'OK': 'Basic functionality works, but significant improvements are needed.',
    'Good': 'Professional quality, but not exceptional. Some areas need work.',
    'Excellent': 'High-quality site that competes well in its industry.',
    'World-Class': 'Exceptional quality that sets industry standards.'
  };
  return descriptions[verdict] || 'Analysis completed.';
}

