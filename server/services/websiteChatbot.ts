/**
 * Chat With Any Website Service
 * 
 * Natural language interface to query any website:
 * - "What products cost under $50?"
 * - "Summarize the about page"
 * - "Find the CEO's email"
 * - "What is their return policy?"
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';
import { scrapeWebsiteFull } from './websiteScraper';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{
    url: string;
    snippet: string;
    relevance: number;
  }>;
  confidence: number;
}

/**
 * Chat with a website using natural language
 */
export async function chatWithWebsite(
  url: string,
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`[Website Chatbot] Chatting with ${url}: "${question}"`);

    // Scrape the website
    const scrapedData = await scrapeWebsiteFull(url);

    if (scrapedData.error) {
      throw new Error(`Failed to scrape website: ${scrapedData.error}`);
    }

    // Extract text content
    const $ = cheerio.load(scrapedData.htmlContent);
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const headings = $('h1, h2, h3').map((_, el) => $(el).text().trim()).get();
    const links = $('a').map((_, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr('href'),
    })).get().slice(0, 20);

    // Extract structured data
    const metadata = {
      title: scrapedData.metadata?.title || '',
      description: scrapedData.metadata?.description || '',
    };

    // Build context for AI
    const context = `
Website: ${url}
Title: ${metadata.title}
Description: ${metadata.description}

Headings:
${headings.join('\n')}

Main Content (first 5000 chars):
${textContent.substring(0, 5000)}

Links:
${links.map(l => `${l.text} -> ${l.href}`).join('\n')}
`;

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `You are an AI assistant that can answer questions about any website.

Website Context:
${context}

${conversationContext ? `Previous Conversation:\n${conversationContext}\n` : ''}

User Question: ${question}

Answer the question based on the website content. Be specific and cite sources when possible.
If you cannot find the answer, say so clearly.

Return JSON:
{
  "answer": "your answer here",
  "sources": [
    {
      "url": "page url or section",
      "snippet": "relevant text snippet",
      "relevance": 0.9
    }
  ],
  "confidence": 0.95
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing website content and answering questions about it. Always provide accurate, specific answers with citations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{}';
    const chatResponse: ChatResponse = JSON.parse(content);

    // Ensure sources have full URLs
    chatResponse.sources = chatResponse.sources.map(source => ({
      ...source,
      url: source.url.startsWith('http') ? source.url : new URL(source.url, url).href,
    }));

    return chatResponse;
  } catch (error) {
    logError(error, 'Website Chatbot');
    throw new Error(`Chat failed: ${getErrorMessage(error)}`);
  }
}

