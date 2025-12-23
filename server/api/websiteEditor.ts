/**
 * Website Editor API
 * AI-Powered chat interface for website editing
 * Uses Claude (Anthropic) when available, falls back to local processing
 */

import type { Express } from 'express';
import Anthropic from '@anthropic-ai/sdk';

interface WebsiteEditRequest {
  message: string;
  currentHtml: string;
  context: {
    businessName: string;
    industry?: string;
    location?: string;
  };
}

// Initialize Anthropic client if API key available
let anthropic: Anthropic | null = null;
try {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('[Website Editor] ✅ Claude AI enabled for Merlin chat');
  } else {
    console.log('[Website Editor] ⚠️ ANTHROPIC_API_KEY not set - using local processing');
  }
} catch (error) {
  console.error('[Website Editor] Failed to initialize Anthropic:', error);
}

/**
 * MERLIN SYSTEM PROMPT - The AI personality for website editing
 */
const MERLIN_SYSTEM_PROMPT = `You are Merlin, an AI Website Wizard assistant. You help users edit and improve their websites through natural conversation.

## Your Personality:
- Friendly, helpful, and enthusiastic about web design
- Clear and concise in your responses
- Proactive in suggesting improvements
- Patient when users aren't sure what they want

## Your Capabilities:
1. **Text Changes**: Update headings, paragraphs, buttons, links
2. **Color Changes**: Modify colors of any element (backgrounds, text, buttons)
3. **Style Changes**: Adjust fonts, sizes, spacing, borders
4. **Layout Changes**: Show/hide sections, reorder elements
5. **Image Guidance**: Suggest image changes (note: actual image replacement requires user upload)

## Response Format:
When the user asks for a change, you should:
1. Acknowledge what they want to change
2. If you can make the change, describe what you did
3. If you need more information, ask a clarifying question
4. Suggest related improvements if appropriate

## Important Rules:
- Be conversational, not robotic
- Don't overwhelm with technical jargon
- If you're unsure what they want, ask
- Always be encouraging and positive
- Keep responses concise (2-4 sentences usually)

## Current Context:
You're helping edit a website. The user can see a live preview of their website next to this chat.`;

/**
 * Generate Claude AI response for website editing
 */
async function generateClaudeResponse(
  message: string,
  currentHtml: string,
  context: { businessName: string; industry?: string; location?: string }
): Promise<{ message: string; updatedHtml: string }> {
  if (!anthropic) {
    throw new Error('Claude not available');
  }

  const contextPrompt = `
## Website Being Edited:
- Business: ${context.businessName}
- Industry: ${context.industry || 'Not specified'}
- Location: ${context.location || 'Not specified'}

## Current Website HTML (excerpt - first 2000 chars):
\`\`\`html
${currentHtml.substring(0, 2000)}
\`\`\`

## User Request:
${message}

## Your Task:
1. Understand what the user wants to change
2. If it's a simple edit request (text, color, style), provide the specific CSS or HTML change needed
3. If it's a question, answer helpfully
4. If it's unclear, ask for clarification

Respond naturally as Merlin. If you're suggesting code changes, wrap them in a JSON block like:
\`\`\`json
{"action": "replace", "find": "old text", "replace": "new text"}
\`\`\`
or
\`\`\`json
{"action": "style", "selector": "h1", "css": "color: blue;"}
\`\`\`
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: MERLIN_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: contextPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  let responseText = content.text;
  let updatedHtml = currentHtml;

  // Check for JSON action blocks in the response
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const action = JSON.parse(jsonMatch[1]);
      
      if (action.action === 'replace' && action.find && action.replace) {
        // Text replacement
        updatedHtml = currentHtml.replace(action.find, action.replace);
        responseText = responseText.replace(/```json[\s\S]*?```/, '').trim();
      } else if (action.action === 'style' && action.selector && action.css) {
        // Style change - inject into existing style block or create new one
        const styleTag = `<style>${action.selector} { ${action.css} }</style>`;
        if (updatedHtml.includes('</head>')) {
          updatedHtml = updatedHtml.replace('</head>', `${styleTag}\n</head>`);
        } else {
          updatedHtml = styleTag + updatedHtml;
        }
        responseText = responseText.replace(/```json[\s\S]*?```/, '').trim();
      }
    } catch (e) {
      console.error('[Website Editor] Failed to parse action JSON:', e);
    }
  }

  return {
    message: responseText || "I've made the changes! Check the preview to see the updates.",
    updatedHtml,
  };
}


/**
 * LOCAL FALLBACK - Used when Claude API is not available
 */

/**
 * Extract all text content from HTML for searching
 */
function extractTextContent(html: string): string[] {
  const textContent: string[] = [];
  const matches = html.match(/>([^<]+)</g);
  if (matches) {
    for (const match of matches) {
      const text = match.slice(1, -1).trim();
      if (text && text.length > 0) {
        textContent.push(text);
      }
    }
  }
  return textContent;
}

/**
 * Find the best matching text in HTML
 */
function findBestMatch(html: string, searchTerm: string): string | null {
  const searchLower = searchTerm.toLowerCase();
  const allText = extractTextContent(html);

  // Exact match
  for (const text of allText) {
    if (text.toLowerCase() === searchLower) return text;
  }
  // Partial match
  for (const text of allText) {
    if (text.toLowerCase().includes(searchLower)) return text;
  }
  return null;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process website edit locally (fallback when no AI)
 */
function processWebsiteEditLocal(
  message: string,
  currentHtml: string,
  context: { businessName: string; industry?: string; location?: string }
): { updatedHtml: string; responseMessage: string } {
  let updatedHtml = currentHtml;
  let responseMessage = "I've made the changes you requested! Check the preview to see the updates.";
  const messageLower = message.toLowerCase();
  let changesMade = false;

  // Color changes
  const colorMatch = message.match(/(?:make|change|set)?\s*(?:the)?\s*(?:color|colour)\s*(?:to)?\s*(#[a-fA-F0-9]{3,6}|\w+)/i);
  if (colorMatch) {
    const newColor = colorMatch[1];
    updatedHtml = updatedHtml.replace(/--color-primary:\s*[^;]+;/g, `--color-primary: ${newColor};`);
    responseMessage = `I've updated the primary color to ${newColor}!`;
    changesMade = true;
  }

  // Text replacement: "change X to Y"
  const changeMatch = message.match(/change\s+['"]?(.+?)['"]?\s+to\s+['"]?(.+?)['"]?$/i);
  if (changeMatch && !changesMade) {
    const [, oldText, newText] = changeMatch;
    const found = findBestMatch(updatedHtml, oldText.trim());
    if (found) {
      updatedHtml = updatedHtml.replace(found, newText.trim());
      responseMessage = `I've changed "${found}" to "${newText.trim()}"!`;
      changesMade = true;
    }
  }

  // Size changes
  if (!changesMade && (messageLower.includes('bigger') || messageLower.includes('larger'))) {
    updatedHtml = updatedHtml.replace(/font-size:\s*(\d+)px/g, (match, size) => {
      return `font-size: ${Math.round(parseInt(size) * 1.2)}px`;
    });
    responseMessage = "I've made the text bigger!";
    changesMade = true;
  }

  if (!changesMade && (messageLower.includes('smaller'))) {
    updatedHtml = updatedHtml.replace(/font-size:\s*(\d+)px/g, (match, size) => {
      return `font-size: ${Math.round(parseInt(size) * 0.8)}px`;
    });
    responseMessage = "I've made the text smaller!";
    changesMade = true;
  }

  // Help message if no changes made
  if (!changesMade) {
    responseMessage = "I can help you with:\n\n• **Change text**: 'change Hello to Welcome'\n• **Change colors**: 'make the color blue' or 'color #FF5500'\n• **Size changes**: 'make the text bigger/smaller'\n\nWhat would you like to do?";
  }

  return { updatedHtml, responseMessage };
}

/**
 * Handle general conversation (not website editing)
 */
async function handleGeneralConversation(
  message: string,
  context?: { businessName?: string; industry?: string; location?: string }
): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Try Claude first for natural conversation
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: MERLIN_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      });
      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
    } catch (error) {
      console.error('[Website Editor] Claude conversation error:', error);
    }
  }

  // Local fallback responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm Merlin, your Website Wizard. What would you like to do today?";
  }
  if (lowerMessage.includes('help')) {
    return "I can help you with:\n- Changing text, colors, and styles\n- Answering questions about your website\n- Suggesting improvements\n\nWhat would you like help with?";
  }
  if (lowerMessage.includes('what can you do')) {
    return "I'm Merlin! I can change colors, fonts, text content, and more. Just tell me what you'd like to modify!";
  }
  
  return "I'm Merlin, your website assistant! Tell me what you'd like to change - colors, text, styles, or ask me anything about your website!";
}

/**
 * Register the website editor routes
 */
export function registerWebsiteEditorRoutes(app: Express) {
  /**
   * POST /api/website-editor/chat
   * AI-powered website editing and conversation
   */
  app.post('/api/website-editor/chat', async (req, res) => {
    try {
      const { message, currentHtml, context } = req.body as WebsiteEditRequest;

      console.log('[Website Editor] Request:', {
        messageLength: message?.length || 0,
        hasHtml: !!currentHtml,
        hasContext: !!context,
        usingClaude: !!anthropic,
      });

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: message',
        });
      }

      // Check if this is an edit request or general conversation
      const isEditRequest = currentHtml && context && context.businessName;
      const editKeywords = ['change', 'make', 'update', 'modify', 'add', 'remove', 'delete', 'color', 'text', 'image', 'font', 'size', 'style', 'edit', 'adjust', 'replace'];
      const messageLower = message.toLowerCase();
      const looksLikeEdit = editKeywords.some(keyword => messageLower.includes(keyword));

      // General conversation mode
      if (!isEditRequest || !looksLikeEdit) {
        const conversationResponse = await handleGeneralConversation(message, context);
        return res.json({
          success: true,
          message: conversationResponse,
          updatedHtml: currentHtml || undefined,
        });
      }

      // Website editing mode
      if (!currentHtml || !context || !context.businessName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields for website editing',
        });
      }

      let result: { message: string; updatedHtml: string };

      // Try Claude first, fallback to local
      if (anthropic) {
        try {
          result = await generateClaudeResponse(message, currentHtml, context);
          console.log('[Website Editor] Claude response generated');
        } catch (error) {
          console.error('[Website Editor] Claude error, falling back to local:', error);
          const localResult = processWebsiteEditLocal(message, currentHtml, context);
          result = { message: localResult.responseMessage, updatedHtml: localResult.updatedHtml };
        }
      } else {
        const localResult = processWebsiteEditLocal(message, currentHtml, context);
        result = { message: localResult.responseMessage, updatedHtml: localResult.updatedHtml };
      }

      res.json({
        success: true,
        updatedHtml: result.updatedHtml,
        message: result.message,
      });
    } catch (error) {
      console.error('[Website Editor] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      });
    }
  });

  /**
   * GET /api/website-editor/status
   * Check if Claude AI is available for the chat
   */
  app.get('/api/website-editor/status', (_req, res) => {
    res.json({
      success: true,
      claudeEnabled: !!anthropic,
      mode: anthropic ? 'AI-Powered' : 'Local Processing',
    });
  });
}
