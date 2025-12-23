/**
 * Website Editor API - MERLIN CHAT
 * 
 * LOCAL MODE for testing (no API costs)
 * When selling: Add Claude API and build cost into package pricing
 */

import type { Express } from 'express';

interface WebsiteEditRequest {
  message: string;
  currentHtml: string;
  context: {
    businessName: string;
    industry?: string;
    location?: string;
  };
}

console.log('[Merlin Chat] 🧙 Local mode active (for testing)');
console.log('[Merlin Chat] 💡 For production: Add ANTHROPIC_API_KEY and build cost into pricing');

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string): string[] {
  const textContent: string[] = [];
  const matches = html.match(/>([^<]+)</g);
  if (matches) {
    for (const match of matches) {
      const text = match.slice(1, -1).trim();
      if (text && text.length > 0) textContent.push(text);
    }
  }
  return textContent;
}

/**
 * Find best matching text in HTML
 */
function findBestMatch(html: string, searchTerm: string): string | null {
  const searchLower = searchTerm.toLowerCase();
  const allText = extractTextContent(html);
  
  // Exact match
  for (const text of allText) {
    if (text.toLowerCase() === searchLower) return text;
  }
  // Contains match
  for (const text of allText) {
    if (text.toLowerCase().includes(searchLower)) return text;
  }
  // Reverse contains
  for (const text of allText) {
    if (searchLower.includes(text.toLowerCase())) return text;
  }
  return null;
}

/**
 * Process website edits locally
 */
function processEdit(
  message: string,
  html: string
): { updatedHtml: string; response: string } {
  let updatedHtml = html;
  const msg = message.toLowerCase();
  
  // COLOR CHANGES
  const colorMatch = message.match(/(?:make|change|set)?\s*(?:the)?\s*(?:color|colour)\s*(?:to)?\s*(#[a-fA-F0-9]{3,6}|blue|red|green|yellow|orange|purple|pink|black|white|gray|grey)/i);
  if (colorMatch) {
    const color = colorMatch[1];
    updatedHtml = html.replace(/--color-primary:\s*[^;]+;/g, `--color-primary: ${color};`);
    return { updatedHtml, response: `Done! I've updated the primary color to ${color}. Check your preview! 🎨` };
  }

  // TEXT REPLACEMENT: "change X to Y"
  const changeMatch = message.match(/change\s+['"]?(.+?)['"]?\s+to\s+['"]?(.+?)['"]?$/i);
  if (changeMatch) {
    const [, oldText, newText] = changeMatch;
    const found = findBestMatch(html, oldText.trim());
    if (found) {
      updatedHtml = html.replace(found, newText.trim());
      return { updatedHtml, response: `Done! Changed "${found}" to "${newText.trim()}". Looking good! ✨` };
    }
    return { updatedHtml: html, response: `I couldn't find "${oldText}" in your website. Can you check the exact text?` };
  }

  // SIZE CHANGES
  if (msg.includes('bigger') || msg.includes('larger')) {
    updatedHtml = html.replace(/font-size:\s*(\d+)px/g, (_, size) => 
      `font-size: ${Math.round(parseInt(size) * 1.25)}px`);
    return { updatedHtml, response: `Done! Made the text bigger. How does that look? 📐` };
  }
  
  if (msg.includes('smaller')) {
    updatedHtml = html.replace(/font-size:\s*(\d+)px/g, (_, size) => 
      `font-size: ${Math.round(parseInt(size) * 0.8)}px`);
    return { updatedHtml, response: `Done! Made the text smaller. Better? 📐` };
  }

  // HEADING CHANGES
  if (msg.includes('heading') || msg.includes('title')) {
    const newTitle = message.match(/(?:heading|title)\s+(?:to\s+)?['"]?(.+?)['"]?$/i);
    if (newTitle) {
      updatedHtml = html.replace(/<h1[^>]*>([^<]+)<\/h1>/i, `<h1>$${newTitle[1]}</h1>`);
      return { updatedHtml, response: `Updated the main heading! 📝` };
    }
  }

  // DEFAULT HELP
  return { 
    updatedHtml: html, 
    response: `I can help you with:

🎨 **Colors**: "make the color blue" or "change color to #FF5500"
📝 **Text**: "change Welcome to Hello World"  
📐 **Sizes**: "make text bigger" or "make text smaller"

What would you like to change?` 
  };
}

/**
 * Handle conversation (not editing)
 */
function handleConversation(message: string, businessName?: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    const name = businessName ? ` for ${businessName}` : '';
    return `Hello! 👋 I'm Merlin, your Website Wizard. I'm here to help you build an amazing website${name}. What would you like to do?`;
  }
  
  if (msg.includes('help') || msg.includes('what can you')) {
    return `I'm Merlin, your Website Wizard! 🧙‍♂️ I can help you:

✨ **Edit your website** - Change text, colors, fonts, and more
🎨 **Customize the design** - Make it match your brand
💡 **Give suggestions** - Help you make it look professional

Just tell me what you'd like to change!`;
  }
  
  if (msg.includes('thank')) {
    return `You're welcome! 😊 Let me know if you need anything else. I'm here to make your website awesome!`;
  }
  
  if (msg.includes('bye') || msg.includes('goodbye')) {
    return `Goodbye! 👋 Your website is looking great. Come back anytime you want to make changes!`;
  }

  if (msg.includes('who are you') || msg.includes('your name')) {
    return `I'm Merlin 🧙‍♂️ - your AI Website Wizard! I help you build and customize beautiful websites. Just tell me what you want to change, and I'll make it happen!`;
  }

  return `I'm Merlin, your Website Wizard! 🧙‍♂️ 

Tell me what you'd like to do:
• Edit your website (text, colors, fonts)
• Ask me questions about your site
• Get design suggestions

What's on your mind?`;
}

/**
 * Register routes
 */
export function registerWebsiteEditorRoutes(app: Express) {
  
  app.post('/api/website-editor/chat', async (req, res) => {
    try {
      const { message, currentHtml, context } = req.body as WebsiteEditRequest;

      if (!message) {
        return res.status(400).json({ success: false, error: 'Missing message' });
      }

      // Check if this is an edit request
      const editKeywords = ['change', 'make', 'update', 'color', 'bigger', 'smaller', 'font', 'size'];
      const isEdit = currentHtml && editKeywords.some(k => message.toLowerCase().includes(k));

      if (isEdit && currentHtml) {
        // Edit mode
        const result = processEdit(message, currentHtml);
        return res.json({
          success: true,
          message: result.response,
          updatedHtml: result.updatedHtml,
        });
      } else {
        // Conversation mode
        const response = handleConversation(message, context?.businessName);
        return res.json({
          success: true,
          message: response,
          updatedHtml: currentHtml || undefined,
        });
      }
    } catch (error) {
      console.error('[Merlin Chat] Error:', error);
      res.status(500).json({ success: false, error: 'Something went wrong' });
    }
  });

  app.get('/api/website-editor/status', (_req, res) => {
    res.json({ 
      success: true, 
      mode: 'Local (Testing)', 
      note: 'Add ANTHROPIC_API_KEY for production AI chat'
    });
  });
}
