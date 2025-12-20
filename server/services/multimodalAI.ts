/**
 * Multi-Modal AI Interface Service
 * Screenshot-to-website, sketch-to-website, brand book upload
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from './multiModelAIOrchestrator';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Lazy-load OpenAI client to avoid startup crash when API key is missing
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface ScreenshotAnalysis {
  layout: {
    sections: Array<{ type: string; description: string; position: { top: number; left: number; width: number; height: number } }>;
    colors: string[];
    fonts: string[];
    spacing: string;
  };
  content: {
    headlines: string[];
    paragraphs: string[];
    ctas: string[];
  };
  recommendations: string[];
}

export interface BrandBookExtraction {
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo?: string;
  guidelines: string[];
}

/**
 * Analyze screenshot and extract design structure
 */
export async function analyzeScreenshot(imageBuffer: Buffer, mimeType: string = 'image/png'): Promise<ScreenshotAnalysis> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:48',message:'analyzeScreenshot entry',data:{bufferSize:imageBuffer.length,mimeType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion agent log
  try {
    console.log('[MultiModalAI] 🔍 Analyzing screenshot...');

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:55',message:'before GPT-4 Vision API call',data:{dataUrlLength:dataUrl.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion agent log

    // Use GPT-4 Vision to analyze
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o', // Updated to latest vision-capable model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this website screenshot and extract:
1. Layout structure (sections, positions, sizes)
2. Color palette (primary, secondary, accent colors)
3. Typography (heading fonts, body fonts)
4. Content (headlines, paragraphs, CTAs)
5. Design recommendations

Return JSON:
{
  "layout": {
    "sections": [{"type": "hero|services|testimonials|footer", "description": "...", "position": {"top": 0, "left": 0, "width": 1200, "height": 600}}],
    "colors": ["#hex1", "#hex2"],
    "fonts": ["Font Name"],
    "spacing": "tight|normal|spacious"
  },
  "content": {
    "headlines": ["..."],
    "paragraphs": ["..."],
    "ctas": ["..."]
  },
  "recommendations": ["..."]
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:75',message:'after GPT-4 Vision API call',data:{hasResponse:!!response,hasChoices:!!response.choices,choicesLength:response.choices?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion agent log

    const content = response.choices[0]?.message?.content;
    if (!content) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:78',message:'no content in response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion agent log
      throw new Error('No response from GPT-4 Vision');
    }

    // Extract JSON from response
    const { extractJsonFromText, safeJsonParse, isScreenshotAnalysis } = await import('../utils/jsonValidator');
    const jsonString = extractJsonFromText(content);
    if (!jsonString) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:84',message:'no JSON found in response',data:{contentLength:content.length,contentPreview:content.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion agent log
      throw new Error('No JSON found in response');
    }

    const analysis = safeJsonParse<ScreenshotAnalysis>(jsonString, isScreenshotAnalysis, 'screenshot analysis');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:88',message:'screenshot analysis success',data:{hasLayout:!!analysis.layout,hasContent:!!analysis.content},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion agent log
    
    console.log('[MultiModalAI] ✅ Screenshot analyzed');

    return analysis;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'multimodalAI.ts:95',message:'analyzeScreenshot error',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion agent log
    logError(error, 'MultiModalAI - AnalyzeScreenshot');
    throw error;
  }
}

/**
 * Generate website from screenshot analysis
 */
export async function generateWebsiteFromScreenshot(
  analysis: ScreenshotAnalysis,
  clientInfo: {
    businessName: string;
    industry: string;
    services: Array<{ name: string; description: string }>;
  }
): Promise<{ html: string; css: string }> {
  try {
    const prompt = `Create a website HTML and CSS based on this design analysis:

Layout: ${JSON.stringify(analysis.layout)}
Content: ${JSON.stringify(analysis.content)}

Client Info:
- Business: ${clientInfo.businessName}
- Industry: ${clientInfo.industry}
- Services: ${clientInfo.services.map(s => s.name).join(', ')}

Generate:
1. Complete HTML structure matching the layout
2. CSS with the extracted colors and fonts
3. Responsive design
4. Modern, clean code

Return JSON:
{
  "html": "<!DOCTYPE html>...",
  "css": "/* CSS */"
}`;

    const response = await generate({
      task: 'code',
      prompt,
    });

    const { extractJsonFromText, safeJsonParse } = await import('../utils/jsonValidator');
    const jsonString = extractJsonFromText(response.content);
    if (!jsonString) {
      throw new Error('No JSON found in response');
    }

    const result = safeJsonParse<{ html?: string; css?: string }>(jsonString, undefined, 'website generation');
    
    return {
      html: result.html || '',
      css: result.css || '',
    };
  } catch (error) {
    logError(error, 'MultiModalAI - GenerateWebsiteFromScreenshot');
    throw error;
  }
}

/**
 * Extract brand book from PDF/image
 */
export async function extractBrandBook(imageBuffer: Buffer, mimeType: string = 'image/png'): Promise<BrandBookExtraction> {
  try {
    console.log('[MultiModalAI] 📖 Extracting brand book...');

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o', // Updated to latest vision-capable model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract brand guidelines from this brand book image:

1. Color palette (primary, secondary, accent colors with hex codes)
2. Typography (heading font, body font)
3. Logo (if visible, describe it)
4. Design guidelines (spacing, style rules)

Return JSON:
{
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": ["#hex1", "#hex2"]
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name"
  },
  "logo": "description or null",
  "guidelines": ["guideline1", "guideline2"]
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4 Vision');
    }

    const { extractJsonFromText, safeJsonParse } = await import('../utils/jsonValidator');
    const jsonString = extractJsonFromText(content);
    if (!jsonString) {
      throw new Error('No JSON found in response');
    }

    const brandBook = safeJsonParse<BrandBookExtraction>(jsonString, undefined, 'brand book extraction');
    
    console.log('[MultiModalAI] ✅ Brand book extracted');

    return brandBook;
  } catch (error) {
    logError(error, 'MultiModalAI - ExtractBrandBook');
    throw error;
  }
}

/**
 * Process sketch/wireframe to website
 */
export async function processSketch(imageBuffer: Buffer, mimeType: string = 'image/png'): Promise<{
  analysis: ScreenshotAnalysis;
  html: string;
  css: string;
}> {
  try {
    // Analyze sketch (same as screenshot)
    const analysis = await analyzeScreenshot(imageBuffer, mimeType);
    
    // Generate website from sketch
    const prompt = `Convert this wireframe/sketch into a functional website. The design is rough, so interpret it professionally:

Layout: ${JSON.stringify(analysis.layout)}

Generate clean, modern HTML and CSS that brings this sketch to life.
Make it production-ready with proper structure and styling.

Return JSON:
{
  "html": "<!DOCTYPE html>...",
  "css": "/* CSS */"
}`;

    const response = await generate({
      task: 'code',
      prompt,
    });

    const { extractJsonFromText, safeJsonParse } = await import('../utils/jsonValidator');
    const jsonString = extractJsonFromText(response.content);
    if (!jsonString) {
      throw new Error('No JSON found in response');
    }

    const result = safeJsonParse<{ html?: string; css?: string }>(jsonString, undefined, 'sketch processing');

    return {
      analysis,
      html: result.html || '',
      css: result.css || '',
    };
  } catch (error) {
    logError(error, 'MultiModalAI - ProcessSketch');
    throw error;
  }
}

