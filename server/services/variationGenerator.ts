/**
 * Variation Generator Service
 * Generates multiple A/B test variations of each page
 */

import * as cheerio from 'cheerio';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface PageVariation {
  id: string;
  name: string;
  html: string;
  changes: string[]; // What changed
  score?: number; // Optional quality score
}

export interface VariationOptions {
  numVariations?: number; // Default 3
  varyHeadlines?: boolean;
  varyCTAs?: boolean;
  varyHero?: boolean;
  varyLayout?: boolean;
}

/**
 * Generate multiple variations of a page
 */
export async function generatePageVariations(
  pageHtml: string,
  clientInfo: {
    businessName: string;
    industry: string;
    services: Array<{ name: string; description: string }>;
  },
  options: VariationOptions = {}
): Promise<PageVariation[]> {
  const {
    numVariations = 3,
    varyHeadlines = true,
    varyCTAs = true,
    varyHero = true,
    varyLayout = false,
  } = options;

  const variations: PageVariation[] = [];

  try {
    for (let i = 0; i < numVariations; i++) {
      const $ = cheerio.load(pageHtml);
      const changes: string[] = [];

      // Variation 1: Headlines
      if (varyHeadlines) {
        const headlines = $('h1, h2, h3').toArray();
        for (const headline of headlines.slice(0, 3)) {
          const $headline = $(headline);
          const original = $headline.text().trim();
          
          if (original) {
            try {
              const variationPrompt = `Create a variation ${i + 1} of this headline for "${clientInfo.businessName}", a ${clientInfo.industry} business.

Original: "${original}"
Services: ${clientInfo.services.map(s => s.name).join(', ')}

Make it different but equally compelling. Keep it under 80 characters. Return only the headline, no explanations.`;

              const aiResult = await generate({
                task: 'content',
                prompt: variationPrompt,
                temperature: 0.8,
                maxTokens: 100,
              });

              const variation = aiResult.content.trim().replace(/^["']|["']$/g, '').substring(0, 80);
              if (variation && variation !== original) {
                $headline.text(variation);
                changes.push(`Headline: "${original}" → "${variation}"`);
              }
            } catch (error) {
              console.warn(`[VariationGenerator] Failed to vary headline:`, getErrorMessage(error));
            }
          }
        }
      }

      // Variation 2: CTAs
      if (varyCTAs) {
        const ctas = $('button, .btn, a[class*="button"], a[class*="cta"]').toArray();
        for (const cta of ctas.slice(0, 2)) {
          const $cta = $(cta);
          const original = $cta.text().trim();
          
          if (original) {
            try {
              const variationPrompt = `Create variation ${i + 1} of this call-to-action button for "${clientInfo.businessName}".

Original: "${original}"
Industry: ${clientInfo.industry}

Make it different but equally compelling. Keep it under 5 words. Return only the CTA text, no explanations.`;

              const aiResult = await generate({
                task: 'content',
                prompt: variationPrompt,
                temperature: 0.8,
                maxTokens: 50,
              });

              const variation = aiResult.content.trim().replace(/^["']|["']$/g, '').substring(0, 30);
              if (variation && variation !== original) {
                $cta.text(variation);
                changes.push(`CTA: "${original}" → "${variation}"`);
              }
            } catch (error) {
              console.warn(`[VariationGenerator] Failed to vary CTA:`, getErrorMessage(error));
            }
          }
        }
      }

      // Variation 3: Hero section
      if (varyHero) {
        const $hero = $('section[class*="hero"], div[class*="hero"], header').first();
        if ($hero.length > 0) {
          const originalHtml = $hero.html() || '';
          
          // Vary hero by changing background color or layout class
          if (i === 1) {
            $hero.addClass('variation-center');
            changes.push('Hero layout: centered');
          } else if (i === 2) {
            $hero.addClass('variation-full-width');
            changes.push('Hero layout: full-width');
          }
        }
      }

      variations.push({
        id: `variation-${i + 1}`,
        name: `Variation ${i + 1}`,
        html: $.html(),
        changes,
      });

      console.log(`[VariationGenerator] ✅ Generated variation ${i + 1}/${numVariations}`);
    }

    return variations;
  } catch (error) {
    logError(error, 'VariationGenerator');
    return variations; // Return partial results
  }
}

