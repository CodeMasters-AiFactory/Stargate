/**
 * Website Editor API - MERLIN CHAT
 * 
 * LOCAL MODE for testing (no API costs)
 * When selling: Add Claude API and build cost into package pricing
 */

import type { Express, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape special characters for JSON string values
 */
function escapeJsonString(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Extract text content from HTML
 * FIXED: Now handles inline tags like <br>, <span>, <strong> etc.
 */
function extractTextContent(html: string): string[] {
  const textContent: string[] = [];

  // First, get text with inline tags normalized (replace <br> with space for matching)
  const normalizedHtml = html.replace(/<br\s*\/?>/gi, ' ');

  const matches = normalizedHtml.match(/>([^<]+)</g);
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

  // Exact match (case insensitive)
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
 * Replace all occurrences of text in HTML (case-insensitive)
 * Only replaces text content, NOT HTML attributes or tag names
 * FIXED: Now handles multi-line text with <br> tags
 * FIXED: Added type safety to prevent "html.replace is not a function" errors
 */
function replaceAllOccurrences(html: string, searchText: string, replaceText: string): string {
  // Type safety check - ensure html is a string
  if (typeof html !== 'string') {
    console.error('[replaceAllOccurrences] Error: html is not a string, got:', typeof html);
    return String(html || '');
  }
  if (typeof searchText !== 'string' || !searchText) {
    console.error('[replaceAllOccurrences] Error: searchText is not a valid string');
    return html;
  }

  const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Strategy 1: Try replacing across <br> tags first
  // This handles cases like "Speed. Precision.<br>Victory." where we want to match the full text
  const brPattern = escapedSearch.replace(/\s+/g, '(?:\\s*<br\\s*\\/?>\\s*|\\s+)');
  const brRegex = new RegExp(brPattern, 'gi');
  let result = html.replace(brRegex, replaceText);

  // If that worked, return
  if (result !== html) {
    return result;
  }

  // Strategy 2: Split HTML into text nodes and non-text parts, replace in text only
  // This regex captures: (tag with attributes) or (text content between tags)
  const parts = html.split(/(<[^>]+>)/g);

  result = parts.map(part => {
    // If it's an HTML tag (starts with <), don't modify it
    if (part.startsWith('<')) {
      return part;
    }
    // Otherwise it's text content - do case-insensitive replacement
    const textRegex = new RegExp(escapedSearch, 'gi');
    return part.replace(textRegex, replaceText);
  }).join('');

  return result;
}

/**
 * Process website edits locally
 * FIXED: Added type safety for html parameter
 */
function processEdit(
  message: string,
  html: string
): { updatedHtml: string; response: string } {
  // Type safety check
  if (typeof html !== 'string') {
    console.error('[processEdit] Error: html is not a string, got:', typeof html);
    return {
      updatedHtml: '',
      response: 'Sorry, there was an error processing your request. The HTML content was invalid.'
    };
  }

  let updatedHtml = html;
  const msg = message.toLowerCase();
  
  // COLOR CHANGES
  // FIXED: Added more color names including navy, teal, cyan, maroon, gold, silver, etc.
  // FIXED: Hex color regex now only matches valid 3 or 6 digit hex codes (not 4 or 5)
  const colorMatch = message.match(/(?:make|change|set)?\s*(?:the)?\s*(?:color|colour)\s*(?:to)?\s*(#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b|blue|red|green|yellow|orange|purple|pink|black|white|gray|grey|navy|teal|cyan|maroon|gold|silver|brown|coral|salmon|lime|aqua|indigo|violet|magenta|crimson|olive|turquoise)/i);
  if (colorMatch) {
    const color = colorMatch[1];
    updatedHtml = html.replace(/--color-primary:\s*[^;]+;/g, `--color-primary: ${color};`);
    return { updatedHtml, response: `Done! I've updated the primary color to ${color}. Check your preview! 🎨` };
  }

  // TEXT REPLACEMENT: "change X to Y" - supports variations like:
  // change "Villa" to "My Brand"
  // change "Ready to Get Started?" to "JOIN US"
  // change "text" to "" (empty replacement supported)
  //
  // FIXED: Now requires quotes and properly handles special characters like ? ! & etc.
  // Uses named capturing groups for clarity
  // Pattern: change "old text" to "new text" (double or single quotes)
  let changeMatch = message.match(/change\s+(?:the\s+)?(?:name\s+)?"([^"]+)"\s+to\s+"([^"]*)"/i);
  if (!changeMatch) {
    // Try single quotes
    changeMatch = message.match(/change\s+(?:the\s+)?(?:name\s+)?'([^']+)'\s+to\s+'([^']*)'/i);
  }
  if (changeMatch) {
    const [, oldText, newText] = changeMatch;
    const searchTerm = oldText.trim();
    const replaceTerm = newText; // Don't trim - allow empty string replacement

    // Try direct replacement first (case-insensitive, all occurrences)
    const updatedResult = replaceAllOccurrences(html, searchTerm, replaceTerm);

    // Check if anything changed
    if (updatedResult !== html) {
      return { updatedHtml: updatedResult, response: `Done! Changed "${searchTerm}" to "${replaceTerm}". Looking good! ✨` };
    }

    // If direct replacement didn't work, try finding best match
    const found = findBestMatch(html, searchTerm);
    if (found) {
      updatedHtml = replaceAllOccurrences(html, found, replaceTerm);
      return { updatedHtml, response: `Done! Changed "${found}" to "${replaceTerm}". Looking good! ✨` };
    }

    return { updatedHtml: html, response: `I couldn't find "${searchTerm}" in your website. Can you check the exact text? Try looking at what's displayed and tell me the exact words.` };
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
  // FIXED: Made quote matching more specific and fixed the replacement string syntax
  if (msg.includes('heading') || msg.includes('title')) {
    const newTitle = message.match(/(?:heading|title)\s+(?:to\s+)?["']([^"']+)["']$/i);
    if (newTitle && newTitle[1]) {
      const titleText = newTitle[1];
      updatedHtml = html.replace(/<h1[^>]*>([^<]+)<\/h1>/i, `<h1>${titleText}</h1>`);
      return { updatedHtml, response: `Updated the main heading! 📝` };
    }
  }

  // DEFAULT HELP
  return {
    updatedHtml: html,
    response: `I can help you with:

🎨 **Colors**: "make the color blue" or "change color to #FF5500"
📝 **Text**: change "Old Text" to "New Text" (use quotes!)
📐 **Sizes**: "make text bigger" or "make text smaller"

**Tip**: Always put your text in quotes for best results!

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
  
  app.post('/api/website-editor/chat', async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, currentHtml, context } = req.body as WebsiteEditRequest;

      if (!message) {
        res.status(400).json({ success: false, error: 'Missing message' });
        return;
      }

      // FIXED: Ensure currentHtml is a string to prevent "html.replace is not a function" errors
      const htmlContent = typeof currentHtml === 'string' ? currentHtml : '';

      // Check if this is an edit request
      const editKeywords = ['change', 'make', 'update', 'color', 'bigger', 'smaller', 'font', 'size'];
      const isEdit = htmlContent && editKeywords.some(k => message.toLowerCase().includes(k));

      if (isEdit && htmlContent) {
        // Edit mode
        const result = processEdit(message, htmlContent);
        res.json({
          success: true,
          message: result.response,
          updatedHtml: result.updatedHtml,
        });
        return;
      } else {
        // Conversation mode
        const response = handleConversation(message, context?.businessName);
        res.json({
          success: true,
          message: response,
          updatedHtml: htmlContent || undefined,
        });
        return;
      }
    } catch (_error: unknown) {
      console.error('[Merlin Chat] Error:', _error);
      res.status(500).json({ success: false, error: 'Something went wrong' });
    }
  });

  app.get('/api/website-editor/status', (_req: Request, res: Response): void => {
    res.json({
      success: true,
      mode: 'Local (Testing)',
      note: 'Add ANTHROPIC_API_KEY for production AI chat'
    });
  });

  /**
   * Auto-Build Endpoint - Transforms template with business info
   * Uses Server-Sent Events (SSE) for real-time progress updates
   */
  app.post('/api/website-editor/auto-build', async (req: Request, res: Response): Promise<void> => {
    const { templateHtml, businessInfo } = req.body as {
      templateHtml: string;
      businessInfo: {
        name: string;
        industry: string;
        location: string;
        email: string;
        hasOwnPhotos: boolean;
      };
    };

    if (!templateHtml || !businessInfo) {
      res.status(400).json({
        success: false,
        error: 'Missing templateHtml or businessInfo'
      });
      return;
    }

    // Validate businessInfo fields - ensure required strings exist
    const requiredFields = ['name', 'industry', 'location', 'email'] as const;
    for (const field of requiredFields) {
      if (typeof businessInfo[field] !== 'string' || !businessInfo[field].trim()) {
        res.status(400).json({
          success: false,
          error: `Missing or invalid businessInfo.${field}`
        });
        return;
      }
    }

    // Sanitize input - trim whitespace
    businessInfo.name = businessInfo.name.trim();
    businessInfo.industry = businessInfo.industry.trim();
    businessInfo.location = businessInfo.location.trim();
    businessInfo.email = businessInfo.email.trim();

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendProgress = (step: string, progress: number, message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', step, progress, message })}\n\n`);
    };

    const sendComplete = (html: string) => {
      res.write(`data: ${JSON.stringify({ type: 'complete', html })}\n\n`);
      res.end();
    };

    const sendError = (error: string) => {
      res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
      res.end();
    };

    try {
      let updatedHtml = templateHtml;

      // Step 1: Setup
      sendProgress('setup', 5, 'Setting up your website...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Replace business name throughout the template
      sendProgress('business-name', 15, `Updating business name to ${businessInfo.name}...`);

      // Find common placeholder business names and replace them
      const placeholderNames = [
        'Villa Agency',
        'Your Business',
        'Business Name',
        'Company Name',
        'Our Company',
        'Starter Agency',
        'Demo Agency',
        'Sample Business',
      ];

      for (const placeholder of placeholderNames) {
        updatedHtml = replaceAllOccurrences(updatedHtml, placeholder, businessInfo.name);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Update hero section
      sendProgress('hero', 25, `Customizing hero section for ${businessInfo.name}...`);

      // Update page title - escape HTML entities to prevent XSS
      const escapedName = escapeHtml(businessInfo.name);
      const escapedIndustry = escapeHtml(businessInfo.industry);
      const escapedLocation = escapeHtml(businessInfo.location);
      const escapedEmail = escapeHtml(businessInfo.email);

      updatedHtml = updatedHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${escapedName} - ${escapedIndustry} | ${escapedLocation}</title>`
      );

      // Update meta description - escape for HTML attribute context
      const metaDescription = `${escapedName} - Premium ${escapedIndustry.toLowerCase()} services in ${escapedLocation}. Contact us at ${escapedEmail}.`;
      updatedHtml = updatedHtml.replace(
        /<meta name="description" content="[^"]*"/i,
        `<meta name="description" content="${metaDescription}"`
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Images (placeholder for now - will integrate with Leonardo later)
      if (!businessInfo.hasOwnPhotos) {
        sendProgress('images', 45, `Preparing ${businessInfo.industry.toLowerCase()} images...`);
        // In production, this would call Leonardo AI
        // For now, we keep the template images
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        sendProgress('images', 45, 'Keeping image placeholders for your photos...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 5: Update about section
      sendProgress('about', 60, 'Writing about section...');

      // For now, we don't modify the about section content - Merlin chat will handle that

      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 6: Services section
      sendProgress('services', 70, `Adding ${businessInfo.industry.toLowerCase()} services...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 7: Update contact information
      sendProgress('contact', 80, 'Setting up contact info...');

      // Replace placeholder emails
      updatedHtml = replaceAllOccurrences(updatedHtml, 'info@example.com', businessInfo.email);
      updatedHtml = replaceAllOccurrences(updatedHtml, 'contact@example.com', businessInfo.email);
      updatedHtml = replaceAllOccurrences(updatedHtml, 'hello@example.com', businessInfo.email);
      updatedHtml = replaceAllOccurrences(updatedHtml, 'email@example.com', businessInfo.email);

      // Replace placeholder locations
      const placeholderLocations = [
        'New York, NY',
        'Los Angeles, CA',
        'San Francisco',
        'Your City',
        'City, State',
        '123 Main Street',
      ];

      for (const placeholder of placeholderLocations) {
        updatedHtml = replaceAllOccurrences(updatedHtml, placeholder, businessInfo.location);
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 8: Brand colors (keeping template colors for now)
      sendProgress('colors', 90, 'Applying brand styling...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 9: Final touches
      sendProgress('final', 95, 'Final touches...');

      // Add structured data for local business - escape JSON strings to prevent injection
      const jsonName = escapeJsonString(businessInfo.name);
      const jsonDescription = escapeJsonString(metaDescription.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'"));
      const jsonEmail = escapeJsonString(businessInfo.email);
      const jsonLocation = escapeJsonString(businessInfo.location);
      const jsonIndustry = escapeJsonString(businessInfo.industry);

      const structuredData = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${jsonName}",
  "description": "${jsonDescription}",
  "email": "${jsonEmail}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${jsonLocation}"
  },
  "industry": "${jsonIndustry}"
}
</script>`;

      // Add structured data before closing </head>
      updatedHtml = updatedHtml.replace('</head>', `${structuredData}\n</head>`);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 10: Complete!
      sendProgress('complete', 100, `${businessInfo.name} website ready!`);
      await new Promise(resolve => setTimeout(resolve, 300));

      sendComplete(updatedHtml);

    } catch (_error: unknown) {
      console.error('[Auto-Build] Error:', _error);
      sendError(_error instanceof Error ? _error.message : 'Auto-build failed');
    }
  });

  /**
   * Auto-Build Sync Endpoint - Non-streaming version for simpler clients
   */
  app.post('/api/website-editor/auto-build-sync', async (req: Request, res: Response): Promise<void> => {
    const { templateHtml, businessInfo } = req.body as {
      templateHtml: string;
      businessInfo: {
        name: string;
        industry: string;
        location: string;
        email: string;
        hasOwnPhotos: boolean;
      };
    };

    if (!templateHtml || !businessInfo) {
      res.status(400).json({
        success: false,
        error: 'Missing templateHtml or businessInfo'
      });
      return;
    }

    // Validate businessInfo fields
    const requiredFields = ['name', 'industry', 'location', 'email'] as const;
    for (const field of requiredFields) {
      if (typeof businessInfo[field] !== 'string' || !businessInfo[field].trim()) {
        res.status(400).json({
          success: false,
          error: `Missing or invalid businessInfo.${field}`
        });
        return;
      }
    }

    // Sanitize input
    businessInfo.name = businessInfo.name.trim();
    businessInfo.industry = businessInfo.industry.trim();
    businessInfo.location = businessInfo.location.trim();
    businessInfo.email = businessInfo.email.trim();

    try {
      let updatedHtml = templateHtml;

      // Replace business names
      const placeholderNames = [
        'Villa Agency', 'Your Business', 'Business Name', 'Company Name',
        'Our Company', 'Starter Agency', 'Demo Agency', 'Sample Business',
      ];

      for (const placeholder of placeholderNames) {
        updatedHtml = replaceAllOccurrences(updatedHtml, placeholder, businessInfo.name);
      }

      // Update title
      updatedHtml = updatedHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${businessInfo.name} - ${businessInfo.industry} | ${businessInfo.location}</title>`
      );

      // Replace emails
      const placeholderEmails = ['info@example.com', 'contact@example.com', 'hello@example.com', 'email@example.com'];
      for (const email of placeholderEmails) {
        updatedHtml = replaceAllOccurrences(updatedHtml, email, businessInfo.email);
      }

      // Replace locations
      const placeholderLocations = ['New York, NY', 'Los Angeles, CA', 'San Francisco', 'Your City', 'City, State'];
      for (const loc of placeholderLocations) {
        updatedHtml = replaceAllOccurrences(updatedHtml, loc, businessInfo.location);
      }

      res.json({
        success: true,
        html: updatedHtml,
      });

    } catch (_error: unknown) {
      console.error('[Auto-Build Sync] Error:', _error);
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Auto-build failed',
      });
    }
  });

  /**
   * Save HTML to file system for file-based projects
   * Used by Merlin editor to persist changes
   */
  app.post('/api/website-editor/save', async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectSlug, html } = req.body as {
        projectSlug: string;
        html: string;
      };

      if (!projectSlug || !html) {
        res.status(400).json({
          success: false,
          error: 'Missing projectSlug or html'
        });
        return;
      }

      // Sanitize project slug to prevent path traversal
      const sanitizedSlug = projectSlug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

      // Validate sanitized slug is not empty
      if (!sanitizedSlug || sanitizedSlug === '-' || !/[a-z0-9]/.test(sanitizedSlug)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project slug after sanitization'
        });
        return;
      }

      // Build the file path
      const projectDir = path.join(process.cwd(), 'website_projects', sanitizedSlug, 'merlin8-output');
      const htmlFilePath = path.join(projectDir, 'index.html');

      // Check if directory exists
      if (!fs.existsSync(projectDir)) {
        res.status(404).json({
          success: false,
          error: `Project directory not found: ${sanitizedSlug}`
        });
        return;
      }

      // Write the HTML file
      fs.writeFileSync(htmlFilePath, html, 'utf-8');

      console.log(`[Website Editor] Saved HTML to: ${htmlFilePath}`);

      res.json({
        success: true,
        message: 'Website saved successfully',
        savedAt: new Date().toISOString(),
        path: htmlFilePath
      });

    } catch (_error: unknown) {
      console.error('[Website Editor] Save error:', _error);
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to save website'
      });
    }
  });
}
