/**
 * AI Website Navigator Service
 * 
 * Fully autonomous AI agent that can navigate websites like a human:
 * - Navigate multi-step checkout flows
 * - Fill out forms intelligently
 * - Click through pagination automatically
 * - Handle login-protected content
 * - Complete complex workflows
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface NavigationAction {
  type: 'click' | 'type' | 'select' | 'scroll' | 'wait' | 'navigate';
  selector?: string;
  text?: string;
  value?: string;
  description: string;
}

export interface NavigationResult {
  success: boolean;
  currentUrl: string;
  pageTitle: string;
  screenshot?: string;
  actions: NavigationAction[];
  error?: string;
}

/**
 * Navigate website autonomously using AI vision
 */
export async function navigateWebsite(
  startUrl: string,
  goal: string,
  maxSteps: number = 20
): Promise<NavigationResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const actions: NavigationAction[] = [];

  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    browser = await puppeteer.launch({
      headless: false, // Need to see for debugging
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(startUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    let currentStep = 0;
    let currentUrl = startUrl;

    while (currentStep < maxSteps) {
      // Take screenshot
      const screenshot = await page.screenshot({ encoding: 'base64' });

      // Get page HTML for context
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract interactive elements
      const interactiveElements = await page.evaluate(() => {
        const elements: Array<{
          tag: string;
          text: string;
          type: string;
          selector: string;
          visible: boolean;
        }> = [];

        document.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]').forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           window.getComputedStyle(el).visibility !== 'hidden';

          if (isVisible) {
            const tag = el.tagName.toLowerCase();
            const text = el.textContent?.trim() || (el as HTMLInputElement).placeholder || '';
            const type = (el as HTMLInputElement).type || '';
            const selector = `[data-index="${index}"]`;

            // Add data attribute for selection
            el.setAttribute('data-index', index.toString());

            elements.push({
              tag,
              text: text.substring(0, 100),
              type,
              selector: `[data-index="${index}"]`,
              visible: isVisible,
            });
          }
        });

        return elements;
      });

      // Ask AI what to do next
      const prompt = `You are an AI agent navigating a website. Your goal is: "${goal}"

Current URL: ${currentUrl}
Page Title: ${await page.title()}

Available interactive elements:
${JSON.stringify(interactiveElements.slice(0, 20), null, 2)}

What should I do next? Return JSON:
{
  "action": "click" | "type" | "select" | "scroll" | "wait" | "navigate" | "complete",
  "selector": "CSS selector or data-index",
  "text": "text to type (if action is type)",
  "value": "value to select (if action is select)",
  "description": "what you're doing"
}

If goal is achieved, return action: "complete"`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web navigator. Analyze screenshots and HTML to navigate websites autonomously.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');

      if (aiResponse.action === 'complete') {
        return {
          success: true,
          currentUrl: await page.url(),
          pageTitle: await page.title(),
          actions,
        };
      }

      // Execute action
      try {
        switch (aiResponse.action) {
          case 'click':
            if (aiResponse.selector) {
              await page.click(aiResponse.selector);
              actions.push({
                type: 'click',
                selector: aiResponse.selector,
                description: aiResponse.description || 'Clicked element',
              });
            }
            break;

          case 'type':
            if (aiResponse.selector && aiResponse.text) {
              await page.type(aiResponse.selector, aiResponse.text);
              actions.push({
                type: 'type',
                selector: aiResponse.selector,
                text: aiResponse.text,
                description: aiResponse.description || 'Typed text',
              });
            }
            break;

          case 'select':
            if (aiResponse.selector && aiResponse.value) {
              await page.select(aiResponse.selector, aiResponse.value);
              actions.push({
                type: 'select',
                selector: aiResponse.selector,
                value: aiResponse.value,
                description: aiResponse.description || 'Selected option',
              });
            }
            break;

          case 'scroll':
            await page.evaluate(() => window.scrollBy(0, 500));
            actions.push({
              type: 'scroll',
              description: aiResponse.description || 'Scrolled down',
            });
            break;

          case 'wait':
            await new Promise(resolve => setTimeout(resolve, 2000));
            actions.push({
              type: 'wait',
              description: aiResponse.description || 'Waited',
            });
            break;

          case 'navigate':
            if (aiResponse.url) {
              await page.goto(aiResponse.url, { waitUntil: 'networkidle2' });
              actions.push({
                type: 'navigate',
                description: aiResponse.description || `Navigated to ${aiResponse.url}`,
              });
            }
            break;
        }

        // Wait for page to settle
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentUrl = await page.url();
        currentStep++;
      } catch (actionError) {
        console.warn(`[AI Navigator] Action failed: ${getErrorMessage(actionError)}`);
        // Try to continue
        currentStep++;
      }
    }

    return {
      success: false,
      currentUrl: await page.url(),
      pageTitle: await page.title(),
      actions,
      error: 'Max steps reached without completing goal',
    };
  } catch (error) {
    logError(error, 'AI Website Navigator');
    return {
      success: false,
      currentUrl: startUrl,
      pageTitle: '',
      actions,
      error: getErrorMessage(error),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

