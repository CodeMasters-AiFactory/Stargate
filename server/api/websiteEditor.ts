/**
 * Website Editor API
 * Handles website editing via chat interface (NO AI - Local only)
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

/**
 * Extract all text content from HTML for searching
 */
function extractTextContent(html: string): string[] {
  const textContent: string[] = [];
  // Match text between > and < (visible content)
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
 * Extract email addresses from HTML
 */
function extractEmails(html: string): string[] {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailPattern) || [];
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Find the best matching text in HTML based on user input
 * Uses fuzzy matching and intelligent extraction
 */
function findBestMatch(html: string, searchTerm: string): string | null {
  const searchLower = searchTerm.toLowerCase();
  const allText = extractTextContent(html);

  // 1. Check for email-related requests
  if (searchLower.includes('mail') || searchLower.includes('email') || searchLower.includes('@')) {
    const emails = extractEmails(html);
    if (emails.length > 0) {
      // If user mentioned a partial email, find the matching one
      const partialEmail = searchTerm.match(/[a-zA-Z0-9._%+-]*@?[a-zA-Z0-9.-]*/)?.[0];
      if (partialEmail) {
        const matchingEmail = emails.find(email =>
          email.toLowerCase().includes(partialEmail.toLowerCase().replace(/^the\s+/, '').replace(/\s+mail\s*/, ''))
        );
        if (matchingEmail) return matchingEmail;
      }
      // Return first email if no specific match
      return emails[0];
    }
  }

  // 2. Check for phone-related requests
  if (searchLower.includes('phone') || searchLower.includes('call') || searchLower.includes('number')) {
    const phonePattern = /[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g;
    const phones = html.match(phonePattern) || [];
    if (phones.length > 0) return phones[0];
  }

  // 3. Exact match (case insensitive)
  for (const text of allText) {
    if (text.toLowerCase() === searchLower) {
      return text;
    }
  }

  // 4. Partial/Contains match
  for (const text of allText) {
    if (text.toLowerCase().includes(searchLower)) {
      return text;
    }
  }

  // 5. Check if search term is in any text (reversed - search is contained in text)
  const cleanSearch = searchLower.replace(/^(the|a|an)\s+/, '').replace(/\s+(please|now|thanks)$/, '');
  for (const text of allText) {
    if (text.toLowerCase().includes(cleanSearch)) {
      return text;
    }
  }

  return null;
}

/**
 * Clean up user input to extract the actual search term
 */
function cleanSearchTerm(input: string): string {
  let cleaned = input.trim();
  // Remove common prefixes
  cleaned = cleaned.replace(/^(the|a|an)\s+/i, '');
  // Remove "mail" or "email" prefix if followed by actual address
  cleaned = cleaned.replace(/^(mail|email)\s+/i, '');
  // Remove trailing words
  cleaned = cleaned.replace(/\s+(please|now|thanks|thank you)$/i, '');
  return cleaned.trim();
}

/**
 * Parse user intent and generate HTML modifications
 */
async function processWebsiteEdit(
  userMessage: string,
  currentHtml: string,
  context: WebsiteEditRequest['context']
): Promise<{ updatedHtml: string; responseMessage: string }> {
  // Local HTML manipulation (NO AI)
  const messageLower = userMessage.toLowerCase();
  let updatedHtml = currentHtml;
  let responseMessage = "I've made the changes you requested! Check the preview to see the updates.";
  let changesMade = false;

  try {
    // 1. TEXT REPLACEMENT: "change X to Y", "replace X with Y", "X to Y please"
    // Handle natural language variations and multi-word phrases
    // Patterns support: single words OR quoted phrases OR unquoted multi-word phrases
    const changePatterns = [
      // Quoted phrases: "change 'Get Started' to 'Learn More'" or 'change "old text" to "new text"'
      /change\s+["']([^"']+)["']\s+to\s+["']([^"']+)["']/i,
      // Handle "the mail/email X to Y" pattern - strip descriptor
      /change\s+(?:the\s+)?(?:mail|email|address|phone|number)\s+(.+?)\s+to\s+(.+?)(?:\s*$|\s+(?:please|now|thanks|for))/i,
      // "change the name/word/text VILLA to VILLAS" - extract single word after descriptor
      /change\s+(?:the\s+)?(?:name|word|text)\s+["']?(\S+?)["']?\s+to\s+["']?(.+?)["']?(?:\s*$|\s+(?:please|now|thanks|for))/i,
      // Simple: "change villa to villas"
      /change\s+(\w+)\s+to\s+(\w+)/i,
      // Unquoted multi-word: "change Get Started to Learn More" (greedy match before " to ")
      /change\s+(.+?)\s+to\s+(.+?)(?:\s*$|\s+(?:please|now|thanks|for))/i,
      // "replace X with Y"
      /replace\s+["']?(.+?)["']?\s+(?:with|by)\s+["']?(.+?)["']?(?:\s*$)/i,
      // "please change X to Y"
      /please\s+change\s+["']?(.+?)["']?\s+to\s+["']?(.+?)["']?(?:\s*$)/i,
      // "make X say Y"
      /make\s+["']?(.+?)["']?\s+say\s+["']?(.+?)["']?(?:\s*$)/i,
    ];

    for (const pattern of changePatterns) {
      const match = userMessage.match(pattern);
      if (match) {
        let [, oldText, newText] = match;
        let oldTextClean = oldText.trim();
        const newTextClean = newText.trim();

        // SMART MATCHING: Try to find the actual content the user is referring to
        const actualMatch = findBestMatch(currentHtml, oldTextClean);
        if (actualMatch && actualMatch !== oldTextClean) {
          console.log(`[Website Editor] Smart match: "${oldTextClean}" -> "${actualMatch}"`);
          oldTextClean = actualMatch;
        }

        // Only replace text content, NOT URLs, attributes, or code
        // Use a smarter replacement that avoids href, src, class, id, and other attributes
        const safeReplace = (html: string, find: string, replace: string): { html: string; count: number } => {
          let count = 0;

          // Replace text between > and < (actual visible content)
          const result = html.replace(/>([^<]*)</g, (match, textContent) => {
            const regex = new RegExp(escapeRegExp(find), 'gi');
            const matches = textContent.match(regex);
            if (matches) {
              count += matches.length;
              return '>' + textContent.replace(regex, replace) + '<';
            }
            return match;
          });

          // Also replace in href="mailto:" links
          let finalResult = result;
          if (find.includes('@')) {
            const mailtoRegex = new RegExp(`(href=["']mailto:)${escapeRegExp(find)}`, 'gi');
            finalResult = finalResult.replace(mailtoRegex, `$1${replace}`);
          }

          return { html: finalResult, count };
        };

        const { html: newHtml, count: matchCount } = safeReplace(currentHtml, oldTextClean, newTextClean);

        if (matchCount > 0) {
          updatedHtml = newHtml;
          responseMessage = `Done! I changed "${oldTextClean}" to "${newTextClean}" (${matchCount} occurrence${matchCount > 1 ? 's' : ''}).`;
          changesMade = true;
        } else {
          // Provide helpful feedback about what IS in the website
          const emails = extractEmails(currentHtml);
          const textSamples = extractTextContent(currentHtml).slice(0, 5);

          let suggestion = `I couldn't find "${oldTextClean}" in your website.`;
          if (emails.length > 0 && (messageLower.includes('mail') || messageLower.includes('@'))) {
            suggestion += `\n\nI found these email addresses: ${emails.join(', ')}`;
          }
          responseMessage = suggestion;
        }
        break;
      }
    }

    // 2. COLOR CHANGES
    if (!changesMade && (messageLower.includes('color') || messageLower.includes('colour'))) {
      const colorMatch = messageLower.match(/(?:make|change|set)?\s*(?:the\s+)?(?:color|colour)\s*(?:to\s+)?(\w+)/i) ||
                        messageLower.match(/(?:make|change)\s+(?:it\s+)?(\w+)/i);

      const colorKeywords = ['blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gold', 'silver', 'navy', 'teal', 'cyan', 'magenta'];

      let targetColor = null;
      if (colorMatch && colorKeywords.includes(colorMatch[1].toLowerCase())) {
        targetColor = colorMatch[1].toLowerCase();
      } else {
        for (const color of colorKeywords) {
          if (messageLower.includes(color)) {
            targetColor = color;
            break;
          }
        }
      }

      if (targetColor) {
        updatedHtml = updatedHtml.replace(/color:\s*[^;]+/gi, `color: ${targetColor}`);
        responseMessage = `Done! I changed the text color to ${targetColor}.`;
        changesMade = true;
      } else {
        responseMessage = "I can change colors! Try saying 'make it blue' or 'change color to red'.";
      }
    }

    // 3. BACKGROUND COLOR
    if (!changesMade && messageLower.includes('background')) {
      const colorKeywords = ['blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gold', 'navy', 'teal', 'gray', 'grey'];
      let targetColor = null;
      for (const color of colorKeywords) {
        if (messageLower.includes(color)) {
          targetColor = color;
          break;
        }
      }

      if (targetColor) {
        updatedHtml = updatedHtml.replace(/background(?:-color)?:\s*[^;]+/gi, `background-color: ${targetColor}`);
        responseMessage = `Done! I changed the background color to ${targetColor}.`;
        changesMade = true;
      }
    }

    // 4. FONT SIZE
    if (!changesMade && (messageLower.includes('bigger') || messageLower.includes('larger') || messageLower.includes('increase size'))) {
      updatedHtml = updatedHtml.replace(/font-size:\s*(\d+)(px|em|rem)/gi, (match, size, unit) => {
        return `font-size: ${Math.round(parseInt(size) * 1.2)}${unit}`;
      });
      responseMessage = "Done! I made the text bigger.";
      changesMade = true;
    }

    if (!changesMade && (messageLower.includes('smaller') || messageLower.includes('decrease size'))) {
      updatedHtml = updatedHtml.replace(/font-size:\s*(\d+)(px|em|rem)/gi, (match, size, unit) => {
        return `font-size: ${Math.round(parseInt(size) * 0.8)}${unit}`;
      });
      responseMessage = "Done! I made the text smaller.";
      changesMade = true;
    }

    // 5. REMOVE ELEMENTS
    if (!changesMade && (messageLower.includes('remove') || messageLower.includes('delete'))) {
      if (messageLower.includes('footer')) {
        updatedHtml = updatedHtml.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
        responseMessage = "Done! I removed the footer.";
        changesMade = true;
      } else if (messageLower.includes('header')) {
        updatedHtml = updatedHtml.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
        responseMessage = "Done! I removed the header.";
        changesMade = true;
      } else if (messageLower.includes('nav')) {
        updatedHtml = updatedHtml.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
        responseMessage = "Done! I removed the navigation.";
        changesMade = true;
      } else {
        responseMessage = "I can remove elements! Try saying 'remove the footer', 'delete the header', or 'remove the navigation'.";
      }
    }

    // 6. ADD PAGE (not supported)
    if (!changesMade && messageLower.includes('add') && messageLower.includes('page')) {
      responseMessage = "Adding new pages requires going back to the website builder wizard. I can help you edit the content on your current pages. Would you like to:\n\n• Change text (e.g., 'change Hello to Welcome')\n• Update colors (e.g., 'make the color blue')\n• Remove elements (e.g., 'remove the footer')\n\nWhat would you like to do?";
    }

    // 7. GENERIC ADD (helpful guidance)
    if (!changesMade && messageLower.includes('add') && !messageLower.includes('page')) {
      responseMessage = "I can help you with text changes! Try:\n\n• 'Change [text] to [new text]'\n• 'Make the color blue'\n• 'Make the text bigger'\n\nWhat would you like to change?";
    }

    // 8. If no changes made and no specific help given, provide guidance
    if (!changesMade && responseMessage === "I've made the changes you requested! Check the preview to see the updates.") {
      responseMessage = "I'm not sure what you'd like to change. Try:\n\n• **Change text**: 'change Villa to Villas'\n• **Change colors**: 'make the color blue'\n• **Make text bigger/smaller**: 'make the text bigger'\n• **Remove elements**: 'remove the footer'\n\nWhat would you like to do?";
    }

    return {
      updatedHtml,
      responseMessage,
    };
  } catch (error) {
    console.error('[Website Editor] Processing error:', error);
    return {
      updatedHtml: currentHtml,
      responseMessage: 'I encountered an error processing your request. Please try rephrasing it.',
    };
  }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Handle general conversation (not website editing)
 */
async function handleGeneralConversation(
  message: string,
  context?: { businessName?: string; industry?: string; location?: string }
): Promise<string> {
  // Local responses only (NO AI)
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm Merlin, your Website Wizard. I'm here to help you with your website. What would you like to do today?";
  }
  if (lowerMessage.includes('how are you')) {
    return "I'm doing great! I'm here to help you with your website. What would you like to work on today?";
  }
  if (lowerMessage.includes('see') && (lowerMessage.includes('website') || lowerMessage.includes('site'))) {
    return "Yes! I can see your website. I can help you make changes to it. What would you like to modify?";
  }
  if (lowerMessage.includes('help')) {
    return "I can help you with:\n- Making changes to your website (colors, text, images, etc.)\n- Answering questions about your website\n- Providing suggestions for improvements\n\nWhat would you like help with?";
  }
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('what do you do')) {
    return "I'm Merlin, your Website Wizard! I can:\n- Change colors, fonts, and styles\n- Update text content\n- Modify images\n- Add or remove sections\n- Answer questions about your website\n\nJust tell me what you'd like to change!";
  }
  
  // More helpful fallback
  return "I'm Merlin, your website assistant! I can help you with:\n\n📝 **Text & Content** - Change headings, paragraphs, or add new text\n🎨 **Colors & Styles** - Update colors, fonts, or visual elements\n🖼️ **Images** - Replace or adjust images\n❌ **Remove** - Delete sections or elements\n\nJust tell me what you'd like to change!";
}

/**
 * Generate a friendly response message based on user request
 */
function generateResponseMessage(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('color') || lowerMessage.includes('colour')) {
    return "I've updated the colors as requested! The changes should be visible in the preview.";
  }
  if (lowerMessage.includes('text') || lowerMessage.includes('title') || lowerMessage.includes('heading')) {
    return "I've updated the text content as requested! Check the preview to see the changes.";
  }
  if (lowerMessage.includes('image') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
    return "I've updated the images as requested! The changes should be visible now.";
  }
  if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
    return "I've removed the requested elements from your website.";
  }
  if (lowerMessage.includes('add') || lowerMessage.includes('insert')) {
    return "I've added the requested content to your website!";
  }
  if (lowerMessage.includes('size') || lowerMessage.includes('bigger') || lowerMessage.includes('smaller')) {
    return "I've adjusted the sizes as requested!";
  }
  if (lowerMessage.includes('font') || lowerMessage.includes('text size')) {
    return "I've updated the typography as requested!";
  }

  return "I've made the changes you requested! Check the preview to see the updates.";
}

export function registerWebsiteEditorRoutes(app: Express) {
  /**
   * POST /api/website-editor/chat
   * General conversation OR website editing
   * If message is about editing website, process it. Otherwise, just chat.
   */
  app.post('/api/website-editor/chat', async (req, res) => {
    try {
      const { message, currentHtml, context } = req.body as WebsiteEditRequest;

      console.log('[Website Editor] Received request:', {
        messageLength: message?.length || 0,
        hasHtml: !!currentHtml,
        hasContext: !!context,
        businessName: context?.businessName,
      });

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: message',
        });
      }

      // Check if this is a website editing request or just general conversation
      const isEditRequest = currentHtml && context && context.businessName;
      const editKeywords = ['change', 'make', 'update', 'modify', 'add', 'remove', 'delete', 'color', 'text', 'image', 'font', 'size', 'style', 'edit', 'adjust', 'replace'];
      const messageLower = message.toLowerCase();
      const looksLikeEdit = editKeywords.some(keyword => messageLower.includes(keyword));

      // If it's clearly a general conversation (no HTML/context or doesn't look like edit), just chat
      if (!isEditRequest || !looksLikeEdit) {
        // General conversation mode - local responses only
        const conversationResponse = await handleGeneralConversation(message, context);
        console.log('[Website Editor] General conversation response:', conversationResponse.substring(0, 50));
        return res.json({
          success: true,
          message: conversationResponse,
          updatedHtml: currentHtml || undefined, // Return original HTML if provided, undefined if not
        });
      }

      // Website editing mode
      if (!currentHtml || !context || !context.businessName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields for website editing: currentHtml, context.businessName',
        });
      }

      console.log('[Website Editor] Processing edit request (LOCAL):', {
        messageLength: message.length,
        htmlLength: currentHtml.length,
        businessName: context.businessName,
      });

      const result = await processWebsiteEdit(message, currentHtml, context);
      
      console.log('[Website Editor] Edit response:', result.responseMessage.substring(0, 50));

      res.json({
        success: true,
        updatedHtml: result.updatedHtml,
        message: result.responseMessage,
      });
    } catch (error) {
      console.error('[Website Editor] Error processing request:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      });
    }
  });
}

