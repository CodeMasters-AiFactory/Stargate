/**
 * Content Rewriter Service
 * Rewrites content page by page using AI with keyword optimization
 */

import * as cheerio from 'cheerio';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface RewriteResult {
  html: string;
  changesCount: number;
  rewrittenSections: string[];
}

/**
 * Rewrite content for a single page
 */
export async function rewritePageContent(
  html: string,
  clientInfo: {
    businessName: string;
    industry: string;
    location: { city: string; state: string; country: string };
    services: Array<{ name: string; description: string }>;
    phone: string;
    email: string;
    address: string;
  },
  keywords: string[]
): Promise<RewriteResult> {
  const $ = cheerio.load(html);
  let changesCount = 0;
  const rewrittenSections: string[] = [];

  try {
    // Rewrite headlines (H1-H6) - Process sequentially
    const headlines = $('h1, h2, h3, h4, h5, h6').toArray();
    for (let index = 0; index < Math.min(headlines.length, 5); index++) {
      const el = headlines[index];
      const originalText = $(el).text().trim();
      if (!originalText || originalText.length < 5) continue;

      try {
        const rewritePrompt = `Rewrite this headline for "${clientInfo.businessName}", a ${clientInfo.industry} business in ${clientInfo.location.city}, ${clientInfo.location.state}.

Original: "${originalText}"
Keywords to include: ${keywords.slice(0, 3).join(', ')}
Industry: ${clientInfo.industry}
Location: ${clientInfo.location.city}, ${clientInfo.location.state}

Keep it professional, SEO-optimized, and under 80 characters. Return only the rewritten headline, no explanations.`;

        const aiResult = await generate({
          task: 'content',
          prompt: rewritePrompt,
          temperature: 0.7,
          maxTokens: 100,
        });

        const rewritten = aiResult.content.trim().replace(/^["']|["']$/g, '').substring(0, 80);
        if (rewritten && rewritten !== originalText) {
          $(el).text(rewritten);
          changesCount++;
          rewrittenSections.push(`headline-${index}`);
        }
      } catch (_error: unknown) {
        console.warn(`[ContentRewriter] Failed to rewrite headline "${originalText}":`, getErrorMessage(_error));
      }
    }

    // Rewrite paragraphs - Process sequentially
    const paragraphs = $('p').toArray();
    for (let index = 0; index < Math.min(paragraphs.length, 3); index++) {
      const el = paragraphs[index];
      const originalText = $(el).text().trim();
      if (!originalText || originalText.length < 20) continue;

      try {
        const rewritePrompt = `Rewrite this paragraph for "${clientInfo.businessName}", a ${clientInfo.industry} business in ${clientInfo.location.city}, ${clientInfo.location.state}.

Original: "${originalText}"
Keywords to include: ${keywords.slice(0, 5).join(', ')}
Services: ${clientInfo.services.map(s => s.name).join(', ')}
Industry: ${clientInfo.industry}

Keep it professional, SEO-optimized, and 2-4 sentences. Return only the rewritten paragraph, no explanations.`;

        const aiResult = await generate({
          task: 'content',
          prompt: rewritePrompt,
          temperature: 0.7,
          maxTokens: 200,
        });

        const rewritten = aiResult.content.trim().replace(/^["']|["']$/g, '').replace(/\n+/g, ' ');
        if (rewritten && rewritten !== originalText && rewritten.length > 20) {
          $(el).text(rewritten);
          changesCount++;
          rewrittenSections.push(`paragraph-${index}`);
        }
      } catch (_error: unknown) {
        console.warn(`[ContentRewriter] Failed to rewrite paragraph:`, getErrorMessage(_error));
      }
    }

    // Rewrite CTAs/buttons - Process sequentially
    const ctas = $('button, .btn, a[class*="button"], a[class*="cta"]').toArray();
    for (let index = 0; index < Math.min(ctas.length, 2); index++) {
      const el = ctas[index];
      const originalText = $(el).text().trim();
      if (!originalText) continue;

      try {
        const rewritePrompt = `Rewrite this call-to-action button for "${clientInfo.businessName}", a ${clientInfo.industry} business in ${clientInfo.location.city}.

Original: "${originalText}"
Industry: ${clientInfo.industry}

Keep it action-oriented, under 5 words, and compelling. Return only the rewritten CTA, no explanations.`;

        const aiResult = await generate({
          task: 'content',
          prompt: rewritePrompt,
          temperature: 0.7,
          maxTokens: 50,
        });

        const rewritten = aiResult.content.trim().replace(/^["']|["']$/g, '').substring(0, 30);
        if (rewritten && rewritten !== originalText) {
          $(el).text(rewritten);
          changesCount++;
          rewrittenSections.push(`cta-${index}`);
        }
      } catch (_error: unknown) {
        console.warn(`[ContentRewriter] Failed to rewrite CTA:`, getErrorMessage(_error));
      }
    }

    // Replace contact information
    const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    $('body').html((_: number, html: string) => {
      return html
        ?.replace(phoneRegex, clientInfo.phone) || '';
    });

    $('body').html((_: number, html: string) => {
      return html
        ?.replace(emailRegex, clientInfo.email) || '';
    });

    // Replace business name mentions
    const _businessNameRegex = new RegExp(clientInfo.businessName, 'gi');
    $('body').html((_: number, html: string) => {
      return html || '';
    });

    console.log(`[ContentRewriter] ✅ Rewrote ${changesCount} content elements`);

    return {
      html: $.html(),
      changesCount,
      rewrittenSections,
    };
  } catch (error: unknown) {
    logError(error, 'ContentRewriter');
    return {
      html,
      changesCount: 0,
      rewrittenSections: [],
    };
  }
}

