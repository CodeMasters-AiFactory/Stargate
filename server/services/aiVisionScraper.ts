/**
 * AI Vision Scraper Service
 * 
 * Uses GPT-4 Vision to "see" websites like a human - no CSS selectors needed.
 * Screenshot page, send to GPT-4V, get structured data.
 * Works even when sites change layout.
 */

import OpenAI from 'openai';
import puppeteer, { Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as fs from 'fs';
import * as path from 'path';

// Initialize OpenAI client
const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface VisionExtractionRequest {
  url: string;
  extractionPrompt: string; // e.g., "Extract all product names, prices, and images"
  includeScreenshot?: boolean;
  fullPage?: boolean;
}

export interface ExtractedData {
  fields: Record<string, any>;
  confidence: number;
  rawResponse: string;
  screenshotPath?: string;
}

/**
 * Take a screenshot of the page
 */
async function takeScreenshot(page: Page, fullPage: boolean = false): Promise<string> {
  const screenshotDir = path.join(process.cwd(), 'temp_screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotDir, `vision-${timestamp}.png`);

  await page.screenshot({
    path: screenshotPath,
    fullPage,
    type: 'png',
  });

  return screenshotPath;
}

/**
 * Convert image to base64 for API
 */
function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Extract data from website using AI Vision
 * No CSS selectors needed - AI understands the visual layout
 */
export async function extractWithVision(
  request: VisionExtractionRequest
): Promise<ExtractedData> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. GPT-4 Vision requires OPENAI_API_KEY.');
  }

  try {
    console.log(`[AI Vision Scraper] Extracting data from ${request.url}`);
    console.log(`[AI Vision Scraper] Prompt: ${request.extractionPrompt}`);

    // Launch browser and navigate
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to page
    await page.goto(request.url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = await takeScreenshot(page, request.fullPage || false);
    const base64Image = imageToBase64(screenshotPath);

    await browser.close();

    // Prepare prompt for GPT-4 Vision
    const systemPrompt = `You are an expert web data extraction assistant. Analyze the screenshot of a webpage and extract the requested data. Return ONLY valid JSON with the extracted fields. Be precise and accurate. If a field is not found, use null.`;

    const userPrompt = `${request.extractionPrompt}

Please extract the data and return it as a JSON object with the following structure:
{
  "fields": {
    // Your extracted fields here
  },
  "confidence": 0.95, // Your confidence level (0-1)
  "notes": "Any relevant notes about the extraction"
}`;

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o supports vision
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for accuracy
    });

    const content = response.choices[0]?.message?.content || '{}';
    console.log(`[AI Vision Scraper] Raw response: ${content.substring(0, 200)}...`);

    // Parse JSON response
    let parsed: any;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      // Try to extract JSON object from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse AI response as JSON: ${content}`);
      }
    }

    // Clean up screenshot if not requested to keep
    if (!request.includeScreenshot && fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    }

    return {
      fields: parsed.fields || {},
      confidence: parsed.confidence || 0.5,
      rawResponse: content,
      screenshotPath: request.includeScreenshot ? screenshotPath : undefined,
    };
  } catch (error) {
    logError(error, 'AI Vision Scraper');
    throw new Error(`AI Vision extraction failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract common data types from a page
 */
export async function extractCommonData(url: string): Promise<ExtractedData> {
  return extractWithVision({
    url,
    extractionPrompt: `Extract the following data from this webpage:
- Page title
- Main heading (H1)
- All product/service names (if any)
- All prices (if any)
- Contact information (email, phone, address)
- Social media links
- Call-to-action buttons/text
- Navigation menu items
- Footer links
- Any forms (form fields and submit buttons)

Return all extracted data in a structured format.`,
    fullPage: true,
  });
}

/**
 * Extract e-commerce product data
 */
export async function extractProductData(url: string): Promise<ExtractedData> {
  return extractWithVision({
    url,
    extractionPrompt: `This appears to be an e-commerce product page. Extract:
- Product name
- Product price
- Product images (URLs or descriptions)
- Product description
- Add to cart button
- Product specifications/features
- Reviews/ratings (if visible)
- Related products

Return as structured JSON.`,
    fullPage: true,
  });
}

/**
 * Extract contact information
 */
export async function extractContactInfo(url: string): Promise<ExtractedData> {
  return extractWithVision({
    url,
    extractionPrompt: `Extract all contact information from this page:
- Email addresses
- Phone numbers
- Physical addresses
- Contact form fields
- Social media links
- Business hours (if visible)

Return as structured JSON.`,
  });
}

