/**
 * Template-Based Website Generator
 * 
 * MANDATORY WORKFLOW:
 * 1. Load scraped template as base
 * 2. Replace ALL images with new industry-appropriate ones
 * 3. Rewrite ALL content for client's business
 * 4. Output final customized website
 * 
 * @version 1.0.0
 * @created December 3, 2025
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateStunningImage } from './advancedImageService';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { generate } from './multiModelAIOrchestrator';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ScrapedTemplate {
  id: string;
  name: string;
  brand: string;           // Original company name (to find/replace)
  industry: string;
  locationCountry?: string;
  locationState?: string;
  // Content can be at top level OR nested in contentData
  html?: string;           // Full HTML source (may be in contentData)
  css?: string;            // All CSS styles
  contentData?: {          // Nested content structure
    html?: string;
    images?: Array<{
      url: string;
      alt?: string;
      context?: string;
    }>;
    text?: {
      title: string;
      headings?: string[];
      paragraphs?: string[];
    };
  };
  images?: Array<{         // All images found (may be in contentData)
    url: string;
    alt?: string;
    context?: string;      // hero, team, service, etc.
  }>;
  sections?: Array<{       // Content sections
    type: string;
    content: string;
  }>;
  text?: {
    title: string;
    headings?: string[];
    paragraphs?: string[];
  };
}

export interface ClientInfo {
  businessName: string;
  industry: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  services: Array<{
    name: string;
    description: string;
  }>;
  phone: string;
  email: string;
  address: string;
  logo?: string;           // URL to client's logo
  brandColors?: {
    primary: string;
    secondary: string;
  };
  tagline?: string;
  testimonials?: Array<{
    name: string;
    quote: string;
    rating?: number;
  }>;
}

export interface GeneratedImage {
  originalUrl: string;
  newUrl: string;
  context: string;
  prompt: string;
  shouldRemove?: boolean;  // Phase 3: Mark images that should be REMOVED (not replaced)
}

export interface TemplateBasedResult {
  success: boolean;
  html: string;
  css: string;
  replacedImages: GeneratedImage[];
  contentChanges: number;
  errors?: string[];
}

// ============================================
// TEMPLATE LOADING
// ============================================

const TEMPLATES_DIR = path.join(process.cwd(), 'scraped_templates');

/**
 * Load a scraped template by ID
 * Tries DATABASE first, then falls back to files
 * Normalizes the structure whether content is at top level or in contentData
 */
export async function loadTemplate(templateId: string): Promise<ScrapedTemplate | null> {
  try {
    // ============================================
    // STEP 1: Try DATABASE first (preferred)
    // ============================================
    if (db) {
      try {
        const [dbTemplate] = await db
          .select()
          .from(brandTemplates)
          .where(eq(brandTemplates.id, templateId))
          .limit(1);

        if (dbTemplate) {
          console.log(`[TemplateGenerator] ✅ Loaded template from DATABASE: ${dbTemplate.name}`);
          
          // Extract from database structure
          const contentData = (dbTemplate.contentData as any) || {};
          const layout = (dbTemplate.layout as any) || {};
          
          const template: ScrapedTemplate = {
            id: dbTemplate.id,
            name: dbTemplate.name,
            brand: dbTemplate.brand,
            industry: dbTemplate.industry || '',
            locationCountry: dbTemplate.locationCountry || '',
            locationState: dbTemplate.locationState || '',
            // HTML: from contentData.html
            html: contentData.html || '',
            // CSS: from css field
            css: dbTemplate.css || '',
            // Images: from contentData.images
            images: contentData.images || [],
            // Text: from contentData.text
            text: contentData.text || {
              title: dbTemplate.name,
              headings: [],
              paragraphs: [],
            },
            sections: layout.sections || [],
          };
          
          console.log(`[TemplateGenerator]    HTML: ${template.html?.length || 0} chars`);
          console.log(`[TemplateGenerator]    CSS: ${template.css?.length || 0} chars`);
          console.log(`[TemplateGenerator]    Images: ${template.images?.length || 0}`);
          
          return template;
        }
      } catch (dbError) {
        console.warn(`[TemplateGenerator] ⚠️ Database load failed for ${templateId}, trying files:`, getErrorMessage(dbError));
      }
    }
    
    // ============================================
    // STEP 2: Fall back to FILES (if database unavailable)
    // ============================================
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`[TemplateGenerator] ❌ Template not found in database or files: ${templateId}`);
      return null;
    }
    
    console.log(`[TemplateGenerator] ⚠️ Loading template from FILE (database unavailable): ${templateId}`);
    const templateData = fs.readFileSync(templatePath, 'utf-8');
    const rawTemplate = JSON.parse(templateData);
    
    // Normalize the structure - extract from contentData if needed
    const template: ScrapedTemplate = {
      id: rawTemplate.id,
      name: rawTemplate.name,
      brand: rawTemplate.brand,
      industry: rawTemplate.industry,
      locationCountry: rawTemplate.locationCountry,
      locationState: rawTemplate.locationState,
      // HTML: check top level first, then contentData
      html: rawTemplate.html || rawTemplate.contentData?.html || '',
      // CSS: always at top level
      css: rawTemplate.css || '',
      // Images: check top level first, then contentData
      images: rawTemplate.images || rawTemplate.contentData?.images || [],
      // Text: check top level first, then contentData
      text: rawTemplate.text || rawTemplate.contentData?.text,
      sections: rawTemplate.sections || rawTemplate.layout?.sections,
    };
    
    console.log(`[TemplateGenerator] ✅ Loaded template from FILE: ${template.name}`);
    console.log(`[TemplateGenerator]    HTML: ${template.html?.length || 0} chars`);
    console.log(`[TemplateGenerator]    CSS: ${template.css?.length || 0} chars`);
    console.log(`[TemplateGenerator]    Images: ${template.images?.length || 0}`);
    
    return template;
  } catch (error) {
    logError(error, 'Load Template');
    return null;
  }
}

/**
 * List all available templates
 * Returns templates from DATABASE first, then files
 */
export async function listTemplates(): Promise<Array<{ id: string; name: string; industry: string; brand: string }>> {
  try {
    const templates: Array<{ id: string; name: string; industry: string; brand: string }> = [];
    
    // ============================================
    // STEP 1: Load from DATABASE (preferred)
    // ============================================
    if (db) {
      try {
        const dbTemplates = await db
          .select({
            id: brandTemplates.id,
            name: brandTemplates.name,
            industry: brandTemplates.industry,
            brand: brandTemplates.brand,
          })
          .from(brandTemplates)
          .where(eq(brandTemplates.isActive, true))
          .limit(1000);
        
        templates.push(...dbTemplates.map(t => ({
          id: t.id,
          name: t.name,
          industry: t.industry || '',
          brand: t.brand,
        })));
        
        console.log(`[TemplateGenerator] ✅ Loaded ${dbTemplates.length} templates from DATABASE`);
      } catch (dbError) {
        console.warn(`[TemplateGenerator] ⚠️ Database query failed, trying files:`, getErrorMessage(dbError));
        console.warn(`[TemplateGenerator] Database may not be connected. Check DATABASE_URL environment variable.`);
      }
    } else {
      console.warn(`[TemplateGenerator] ⚠️ Database not available. Loading templates from files only.`);
      console.warn(`[TemplateGenerator] Set DATABASE_URL environment variable to enable database storage.`);
    }
    
    // ============================================
    // STEP 2: Also load from FILES (add missing ones)
    // ============================================
    try {
      const indexPath = path.join(TEMPLATES_DIR, 'index.json');
      
      if (fs.existsSync(indexPath)) {
        const indexData = fs.readFileSync(indexPath, 'utf-8');
        const fileTemplates = JSON.parse(indexData);
        
        // Only add templates that aren't already in the database list
        for (const fileTemplate of fileTemplates) {
          if (!templates.find(t => t.id === fileTemplate.id)) {
            templates.push({
              id: fileTemplate.id,
              name: fileTemplate.name,
              industry: fileTemplate.industry || '',
              brand: fileTemplate.brand,
            });
          }
        }
        
        if (fileTemplates.length > 0) {
          console.log(`[TemplateGenerator] ✅ Added ${fileTemplates.length} templates from FILES`);
        }
      }
    } catch (fileError) {
      console.warn(`[TemplateGenerator] ⚠️ File index load failed:`, getErrorMessage(fileError));
    }
    
    return templates;
  } catch (error) {
    logError(error, 'List Templates');
    return [];
  }
}

// ============================================
// IMAGE REPLACEMENT
// ============================================

/**
 * Analyze an image URL to determine its context (hero, team, service, etc.)
 * Phase 3: Enhanced detection for images that should be REMOVED
 */
function analyzeImageContext(url: string, alt?: string): string {
  const urlLower = url.toLowerCase();
  const altLower = (alt || '').toLowerCase();
  const combined = `${urlLower} ${altLower}`;
  
  // Phase 3: Images to REMOVE (not replace)
  if (urlLower.includes('testimonial') || altLower.includes('testimonial') || 
      altLower.includes('customer photo') || altLower.includes('client photo') ||
      combined.includes('satisfied customer') || combined.includes('happy customer')) {
    return 'testimonial'; // REMOVE - never use fake customer photos
  }
  
  if (urlLower.includes('before') && urlLower.includes('after') ||
      altLower.includes('before') && altLower.includes('after') ||
      urlLower.includes('beforeafter') || urlLower.includes('before-after') ||
      combined.includes('before and after')) {
    return 'before-after'; // REMOVE - can't show other company's work
  }
  
  if (urlLower.includes('certification') || urlLower.includes('certificate') ||
      urlLower.includes('badge') || urlLower.includes('award') ||
      altLower.includes('certified') || altLower.includes('certification') ||
      combined.includes('bbb') || combined.includes('angies list')) {
    return 'certification'; // REMOVE - replace with client's actual certs
  }
  
  if (urlLower.includes('partner') || urlLower.includes('trusted by') ||
      altLower.includes('partner') || altLower.includes('client logo') ||
      combined.includes('trusted partner') || combined.includes('our partners')) {
    return 'partner-logo'; // REMOVE - add client's actual partners OR remove section
  }
  
  // Images to REPLACE (not remove)
  if (urlLower.includes('hero') || urlLower.includes('banner') || altLower.includes('hero')) {
    return 'hero';
  }
  if (urlLower.includes('team') || altLower.includes('team') || altLower.includes('staff')) {
    return 'team'; // REMOVE or replace with stock/AI photos
  }
  if (urlLower.includes('service') || altLower.includes('service')) {
    return 'service';
  }
  if (urlLower.includes('logo')) {
    return 'logo';
  }
  if (urlLower.includes('icon')) {
    return 'icon';
  }
  if (urlLower.includes('about') || altLower.includes('about')) {
    return 'about';
  }
  if (urlLower.includes('gallery') || urlLower.includes('portfolio')) {
    return 'gallery'; // REMOVE - can't show other company's portfolio
  }
  
  return 'general';
}

/**
 * Generate a replacement image based on context and client info
 * Phase 3: Properly REMOVE images that shouldn't be used
 */
async function generateReplacementImage(
  originalImage: { url: string; alt?: string; context?: string },
  clientInfo: ClientInfo
): Promise<GeneratedImage> {
  const context = originalImage.context || analyzeImageContext(originalImage.url, originalImage.alt);
  
  // Phase 3: REMOVE these image types (don't replace)
  if (context === 'testimonial') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING testimonial photo (Phase 3 rule: never use fake customer photos)`);
    return {
      originalUrl: originalImage.url,
      newUrl: '', // Empty URL signals removal
      context: 'testimonial',
      prompt: 'REMOVED - Testimonial photos should not be used',
      shouldRemove: true
    };
  }
  
  if (context === 'before-after') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING before/after image (Phase 3 rule: can't show other company's work)`);
    return {
      originalUrl: originalImage.url,
      newUrl: '',
      context: 'before-after',
      prompt: 'REMOVED - Before/after images belong to original company',
      shouldRemove: true
    };
  }
  
  if (context === 'certification') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING certification badge (Phase 3 rule: replace with client's actual certs)`);
    return {
      originalUrl: originalImage.url,
      newUrl: '',
      context: 'certification',
      prompt: 'REMOVED - Replace with client\'s actual certifications',
      shouldRemove: true
    };
  }
  
  if (context === 'partner-logo') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING partner logo (Phase 3 rule: add client's actual partners OR remove section)`);
    return {
      originalUrl: originalImage.url,
      newUrl: '',
      context: 'partner-logo',
      prompt: 'REMOVED - Replace with client\'s actual partners or remove section',
      shouldRemove: true
    };
  }
  
  // Phase 3: Team photos - REMOVE or replace with stock/AI
  if (context === 'team') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING team photo (Phase 3 rule: remove or replace with stock/AI photos)`);
    // Option: Generate replacement OR remove
    // For now, removing to be safe (can be changed to generate replacement)
    return {
      originalUrl: originalImage.url,
      newUrl: '',
      context: 'team',
      prompt: 'REMOVED - Team photos should be removed or replaced with stock/AI',
      shouldRemove: true
    };
  }
  
  // Phase 3: Gallery/Portfolio - REMOVE (can't show other company's work)
  if (context === 'gallery') {
    console.log(`[TemplateGenerator] 🗑️ REMOVING gallery/portfolio image (Phase 3 rule: can't show other company's work)`);
    return {
      originalUrl: originalImage.url,
      newUrl: '',
      context: 'gallery',
      prompt: 'REMOVED - Portfolio images belong to original company',
      shouldRemove: true
    };
  }
  
  // Images to REPLACE (not remove)
  let prompt: string;
  
  switch (context) {
    case 'hero':
      // Phase 3: AI-generate new hero for client's city + industry
      prompt = `Professional ${clientInfo.industry} business in ${clientInfo.location.city}, ${clientInfo.location.state}. Modern commercial photography style. Showing ${clientInfo.services[0]?.name || 'professional services'} in action. Clean, bright, trustworthy atmosphere. 16:9 aspect ratio, high quality.`;
      break;
      
    case 'service':
      // Phase 3: AI-generate for client's specific services
      const serviceIndex = Math.floor(Math.random() * clientInfo.services.length);
      const service = clientInfo.services[serviceIndex];
      prompt = `${service?.name || clientInfo.industry} being performed by professional technician. ${clientInfo.industry} setting, clean and organized workspace. Commercial photography, square format. Emphasizes quality and expertise.`;
      break;
      
    case 'about':
      prompt = `Professional ${clientInfo.industry} business office or facility. Modern, clean, welcoming environment. Suggests established, trustworthy company. Wide shot, commercial style.`;
      break;
      
    case 'logo':
      // Phase 3: MUST be replaced with client's logo (or placeholder)
      if (clientInfo.logo) {
        return {
          originalUrl: originalImage.url,
          newUrl: clientInfo.logo,
          context: 'logo',
          prompt: 'Client logo (user provided)'
        };
      }
      // No logo provided - use placeholder
      return {
        originalUrl: originalImage.url,
        newUrl: `https://placehold.co/200x60/0066cc/fff?text=${encodeURIComponent(clientInfo.businessName)}`,
        context: 'logo',
        prompt: 'Logo placeholder (client should provide logo)'
      };
      
    case 'icon':
      // Skip icon replacement - usually universal
      return {
        originalUrl: originalImage.url,
        newUrl: originalImage.url,
        context: 'icon',
        prompt: 'Icon preserved (universal)'
      };
      
    default:
      prompt = `Professional ${clientInfo.industry} business image, modern and clean, high quality commercial photography`;
  }
  
  try {
    console.log(`[TemplateGenerator] 🎨 Generating image for context: ${context}`);
    
    // Use the advanced image service to generate
    const result = await generateStunningImage({
      prompt,
      style: 'photorealistic',
      aspectRatio: context === 'hero' ? '16:9' : '1:1',
      quality: 'high'
    });
    
    if (result.success && result.imageUrl) {
      return {
        originalUrl: originalImage.url,
        newUrl: result.imageUrl,
        context,
        prompt
      };
    }
  } catch (error) {
    console.error(`[TemplateGenerator] Image generation failed for ${context}:`, getErrorMessage(error));
  }
  
  // Fallback: use placeholder
  const placeholderUrl = `https://placehold.co/800x600/333/fff?text=${encodeURIComponent(clientInfo.businessName + ' - ' + context)}`;
  
  return {
    originalUrl: originalImage.url,
    newUrl: placeholderUrl,
    context,
    prompt
  };
}

/**
 * Replace all images in the template HTML
 * Phase 3: Properly REMOVE images that shouldn't be used
 */
async function replaceAllImages(
  html: string,
  images: Array<{ url: string; alt?: string; context?: string }>,
  clientInfo: ClientInfo,
  onProgress?: (current: number, total: number) => void
): Promise<{ html: string; replacedImages: GeneratedImage[] }> {
  const replacedImages: GeneratedImage[] = [];
  let updatedHtml = html;
  
  console.log(`[TemplateGenerator] 🖼️ Processing ${images.length} images (Phase 3: Image Strategy)...`);
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    if (onProgress) {
      onProgress(i + 1, images.length);
    }
    
    try {
      const replacement = await generateReplacementImage(image, clientInfo);
      replacedImages.push(replacement);
      
      // Phase 3: Handle REMOVAL vs REPLACEMENT
      if (replacement.shouldRemove) {
        // REMOVE the image completely
        // Find and remove the img tag or image reference
        const escapedUrl = image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Pattern 1: Remove <img> tags
        const imgTagRegex = new RegExp(`<img[^>]*src=["']${escapedUrl}["'][^>]*>`, 'gi');
        updatedHtml = updatedHtml.replace(imgTagRegex, '');
        
        // Pattern 2: Remove background-image CSS references
        const bgImageRegex = new RegExp(`background-image:\\s*url\\(["']?${escapedUrl}["']?\\)`, 'gi');
        updatedHtml = updatedHtml.replace(bgImageRegex, '');
        
        // Pattern 3: Remove in style attributes
        updatedHtml = updatedHtml.replace(/style=["']([^"']*)["']/gi, (match, styleContent) => {
          if (styleContent.includes(image.url)) {
            const cleaned = styleContent.replace(new RegExp(`background-image:\\s*url\\(["']?${escapedUrl}["']?\\);?`, 'gi'), '');
            return cleaned.trim() ? `style="${cleaned}"` : '';
          }
          return match;
        });
        
        console.log(`[TemplateGenerator] 🗑️ Removed image ${i + 1}/${images.length}: ${replacement.context}`);
      } else {
        // REPLACE the image URL
        const escapedUrl = image.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const urlRegex = new RegExp(escapedUrl, 'g');
        updatedHtml = updatedHtml.replace(urlRegex, replacement.newUrl);
        
        // Phase 3: Update alt text with client keywords
        if (replacement.newUrl && image.alt) {
          const altText = `${clientInfo.businessName} ${replacement.context} - ${clientInfo.industry} in ${clientInfo.location.city}`;
          const imgTagRegex = new RegExp(`(<img[^>]*src=["']${replacement.newUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*)alt=["'][^"']*["']`, 'gi');
          updatedHtml = updatedHtml.replace(imgTagRegex, `$1alt="${altText}"`);
          
          // If no alt attribute exists, add one
          const imgTagNoAltRegex = new RegExp(`(<img[^>]*src=["']${replacement.newUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*)(>)`, 'gi');
          updatedHtml = updatedHtml.replace(imgTagNoAltRegex, `$1 alt="${altText}"$2`);
        }
        
        console.log(`[TemplateGenerator] ✅ Replaced image ${i + 1}/${images.length}: ${replacement.context}`);
      }
    } catch (error) {
      console.error(`[TemplateGenerator] ❌ Failed to process image ${i + 1}:`, getErrorMessage(error));
    }
  }
  
  const removedCount = replacedImages.filter(r => r.shouldRemove).length;
  const replacedCount = replacedImages.filter(r => !r.shouldRemove).length;
  console.log(`[TemplateGenerator] ✅ Phase 3 Complete: ${replacedCount} replaced, ${removedCount} removed`);
  
  return { html: updatedHtml, replacedImages };
}

// ============================================
// CONTENT REWRITING
// ============================================

/**
 * Rewrite all content in the HTML for the client's business
 */
async function rewriteAllContent(
  html: string,
  template: ScrapedTemplate,
  clientInfo: ClientInfo
): Promise<{ html: string; changesCount: number }> {
  if (!html) {
    console.warn('[TemplateGenerator] ⚠️ No HTML to rewrite');
    return { html: '', changesCount: 0 };
  }
  
  let updatedHtml = html;
  let changesCount = 0;
  
  console.log(`[TemplateGenerator] ✍️ Rewriting content for ${clientInfo.businessName}...`);
  
  // 1. Replace original company name with client's name
  if (template.brand) {
    const brandRegex = new RegExp(template.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = updatedHtml.match(brandRegex);
    if (matches) {
      changesCount += matches.length;
      updatedHtml = updatedHtml.replace(brandRegex, clientInfo.businessName);
      console.log(`[TemplateGenerator] ✅ Replaced "${template.brand}" → "${clientInfo.businessName}" (${matches.length} occurrences)`);
    }
  }
  
  // 2. Replace phone numbers COMPREHENSIVELY
  if (clientInfo.phone) {
    const cleanPhone = clientInfo.phone.replace(/[^0-9+]/g, '');
    const formattedPhone = clientInfo.phone;
    
    // Pattern 1: Replace tel: links
    const telRegex = /href=["']tel:([^"']+)["']/gi;
    const telMatches = updatedHtml.match(telRegex);
    if (telMatches) {
      updatedHtml = updatedHtml.replace(telRegex, `href="tel:${cleanPhone}"`);
      changesCount += telMatches.length;
      console.log(`[TemplateGenerator] ✅ Replaced tel: links (${telMatches.length})`);
    }
    
    // Pattern 2: Replace phone numbers in visible text (between tags)
    // Match phone patterns: (404) 555-1234, 404-555-1234, 404.555.1234, etc.
    const phonePattern = /(\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;
    let phoneReplaceCount = 0;
    
    updatedHtml = updatedHtml.replace(phonePattern, (match, fullMatch) => {
      // Skip if it's inside a script tag, style tag, or data attribute
      const beforeMatch = updatedHtml.substring(0, updatedHtml.indexOf(match));
      const openScripts = (beforeMatch.match(/<script[^>]*>/gi) || []).length;
      const closeScripts = (beforeMatch.match(/<\/script>/gi) || []).length;
      const openStyles = (beforeMatch.match(/<style[^>]*>/gi) || []).length;
      const closeStyles = (beforeMatch.match(/<\/style>/gi) || []).length;
      
      // If we're inside a script or style, skip
      if (openScripts > closeScripts || openStyles > closeStyles) {
        return match;
      }
      
      // Skip if it's in a data attribute, id, or class
      const recentContext = beforeMatch.substring(Math.max(0, beforeMatch.length - 100));
      if (recentContext.includes('id=') || recentContext.includes('class=') || recentContext.includes('data-')) {
        return match;
      }
      
      phoneReplaceCount++;
      return formattedPhone;
    });
    
    if (phoneReplaceCount > 0) {
      changesCount += phoneReplaceCount;
      console.log(`[TemplateGenerator] ✅ Replaced visible phone numbers (${phoneReplaceCount})`);
    }
    
    // Pattern 3: Replace in JSON-LD schema
    const schemaPhoneRegex = /"telephone":\s*"([^"]+)"/gi;
    updatedHtml = updatedHtml.replace(schemaPhoneRegex, `"telephone": "${cleanPhone}"`);
    
    // Pattern 4: Replace in meta tags
    const metaPhoneRegex = /<meta[^>]*content=["']([^"']*)(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})([^"']*)["'][^>]*>/gi;
    updatedHtml = updatedHtml.replace(metaPhoneRegex, (match, before, phone, after) => {
      const newContent = `${before}${formattedPhone}${after}`;
      return match.replace(/content=["'][^"']*["']/, `content="${newContent}"`);
    });
  }
  
  // 3. Replace email addresses SAFELY (only in visible text and href="mailto:")
  if (clientInfo.email) {
    // Replace mailto: links
    const mailtoRegex = /href=["']mailto:([^"']+)["']/gi;
    const mailtoMatches = updatedHtml.match(mailtoRegex);
    if (mailtoMatches) {
      updatedHtml = updatedHtml.replace(mailtoRegex, `href="mailto:${clientInfo.email}"`);
      changesCount += mailtoMatches.length;
      console.log(`[TemplateGenerator] ✅ Replaced mailto links (${mailtoMatches.length})`);
    }
    
    // For visible text emails, we need to be careful
    // Only replace emails that appear in text nodes, not in script src, data attributes, etc.
    // Simple approach: look for emails followed by </a> or </span> or </p> or whitespace
    const visibleEmailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s*<\/|[\s,.<])/g;
    const visibleEmails = updatedHtml.match(visibleEmailRegex);
    if (visibleEmails) {
      const trackingDomains = ['google', 'facebook', 'analytics', 'pixel', 'tracking', 'callrail', 'bing'];
      visibleEmails.forEach(email => {
        if (!trackingDomains.some(d => email.toLowerCase().includes(d))) {
          updatedHtml = updatedHtml.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), clientInfo.email);
          changesCount++;
        }
      });
      console.log(`[TemplateGenerator] ✅ Replaced visible email addresses`);
    }
  }
  
  // 4. Update page title
  if (template.text?.title && clientInfo.businessName) {
    const titleRegex = /<title>[\s\S]*?<\/title>/i;
    const newTitle = `<title>${clientInfo.businessName} | ${clientInfo.industry} Services in ${clientInfo.location.city}, ${clientInfo.location.state}</title>`;
    updatedHtml = updatedHtml.replace(titleRegex, newTitle);
    changesCount++;
    console.log(`[TemplateGenerator] ✅ Updated page title`);
  }
  
  // 5. Update meta description with AI-powered rewrite
  const metaDescRegex = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/i;
  const metaDescMatch = updatedHtml.match(metaDescRegex);
  if (metaDescMatch) {
    try {
      const originalDesc = metaDescMatch[1];
      // Use AI to rewrite the description if it contains location/company info
      if (originalDesc.length > 20 && (originalDesc.toLowerCase().includes('new jersey') || originalDesc.toLowerCase().includes('pennsylvania') || originalDesc.toLowerCase().includes('horizon'))) {
        const rewritePrompt = `Rewrite this website meta description for "${clientInfo.businessName}", an ${clientInfo.industry} business in ${clientInfo.location.city}, ${clientInfo.location.state}. Keep it SEO-optimized and under 160 characters. Original: "${originalDesc}"`;
        
        const aiResult = await generate({
          task: 'content',
          prompt: rewritePrompt,
          temperature: 0.7,
          maxTokens: 200,
        });
        
        const rewrittenDesc = aiResult.content.trim().replace(/^["']|["']$/g, '').substring(0, 160);
        updatedHtml = updatedHtml.replace(metaDescRegex, `<meta name="description" content="${rewrittenDesc}">`);
        changesCount++;
        console.log(`[TemplateGenerator] ✅ AI-rewrote meta description`);
      } else {
        // Simple replacement
        const newMetaDesc = `${clientInfo.businessName} offers professional ${clientInfo.industry.toLowerCase()} services in ${clientInfo.location.city}, ${clientInfo.location.state}. ${clientInfo.tagline || 'Contact us today!'}`;
        updatedHtml = updatedHtml.replace(metaDescRegex, `<meta name="description" content="${newMetaDesc}">`);
        changesCount++;
        console.log(`[TemplateGenerator] ✅ Updated meta description`);
      }
    } catch (error) {
      console.error(`[TemplateGenerator] ⚠️ AI rewrite failed, using simple replacement:`, getErrorMessage(error));
      const newMetaDesc = `${clientInfo.businessName} offers professional ${clientInfo.industry.toLowerCase()} services in ${clientInfo.location.city}, ${clientInfo.location.state}. ${clientInfo.tagline || 'Contact us today!'}`;
      updatedHtml = updatedHtml.replace(metaDescRegex, `<meta name="description" content="${newMetaDesc}">`);
      changesCount++;
    }
  }
  
  // 5b. Rewrite OG description if it contains original location
  const ogDescRegex = /<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']\s*\/?>/i;
  const ogDescMatch = updatedHtml.match(ogDescRegex);
  if (ogDescMatch) {
    const ogDesc = ogDescMatch[1];
    if (ogDesc.toLowerCase().includes('new jersey') || ogDesc.toLowerCase().includes('pennsylvania')) {
      const newOgDesc = `${clientInfo.businessName} offers professional ${clientInfo.industry.toLowerCase()} services in ${clientInfo.location.city}, ${clientInfo.location.state}. ${clientInfo.tagline || 'Contact us today!'}`;
      updatedHtml = updatedHtml.replace(ogDescRegex, `<meta property="og:description" content="${newOgDesc}">`);
      changesCount++;
      console.log(`[TemplateGenerator] ✅ Updated OG description`);
    }
  }
  
  // 6. Replace location mentions in safe contexts only
  // Only replace complete words in content attributes and visible text
  const originalLocations = [
    { pattern: /\bNew Jersey\b/gi, replace: clientInfo.location.state },
    { pattern: /\bPennsylvania\b/gi, replace: clientInfo.location.state },
    { pattern: /\bNJ\b/gi, replace: clientInfo.location.state },
    { pattern: /\bPA\b/gi, replace: clientInfo.location.state },
  ];
  
  // Replace in content attributes (meta tags, schema, etc.) - safe context
  originalLocations.forEach(({ pattern, replace }) => {
    updatedHtml = updatedHtml.replace(/(content=["'])([^"']*?)(["'])/gi, (match, start, content, end) => {
      if (pattern.test(content)) {
        changesCount++;
        return `${start}${content.replace(pattern, replace)}${end}`;
      }
      return match;
    });
  });
  
  // Replace in title tags - safe context
  originalLocations.forEach(({ pattern, replace }) => {
    updatedHtml = updatedHtml.replace(/(<title>)([^<]*?)(<\/title>)/gi, (match, start, title, end) => {
      if (pattern.test(title)) {
        changesCount++;
        return `${start}${title.replace(pattern, replace)}${end}`;
      }
      return match;
    });
  });
  
  // Replace in visible text content (between >text<) - careful with word boundaries
  originalLocations.forEach(({ pattern, replace }) => {
    updatedHtml = updatedHtml.replace(/(>)([^<]+?)(<)/g, (match, open, text, close) => {
      // Skip if inside script/style tags
      const beforeMatch = updatedHtml.substring(0, updatedHtml.indexOf(match));
      const inScript = (beforeMatch.match(/<script[^>]*>/gi) || []).length > (beforeMatch.match(/<\/script>/gi) || []).length;
      const inStyle = (beforeMatch.match(/<style[^>]*>/gi) || []).length > (beforeMatch.match(/<\/style>/gi) || []).length;
      
      if (inScript || inStyle) {
        return match;
      }
      
      // Only replace complete words, not parts of words
      if (pattern.test(text)) {
        changesCount++;
        return `${open}${text.replace(pattern, replace)}${close}`;
      }
      return match;
    });
  });
  
  // Also replace template's location state if provided
  if (template.locationState && clientInfo.location.state) {
    const stateRegex = new RegExp(template.locationState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const stateMatches = updatedHtml.match(stateRegex);
    if (stateMatches) {
      updatedHtml = updatedHtml.replace(stateRegex, clientInfo.location.state);
      changesCount += stateMatches.length;
      console.log(`[TemplateGenerator] ✅ Replaced "${template.locationState}" → "${clientInfo.location.state}"`);
    }
  }
  
  // Add client's city where appropriate
  const cityPlaceholderRegex = /\[CITY\]|your city|our area/gi;
  if (cityPlaceholderRegex.test(updatedHtml)) {
    updatedHtml = updatedHtml.replace(cityPlaceholderRegex, clientInfo.location.city);
    changesCount++;
  }
  
  // 7. Add client's address where original address appears
  if (clientInfo.address) {
    // Look for common address patterns and replace with client's address
    const addressDivRegex = /<address[^>]*>[\s\S]*?<\/address>/gi;
    const addressMatches = updatedHtml.match(addressDivRegex);
    if (addressMatches && addressMatches.length > 0) {
      updatedHtml = updatedHtml.replace(addressDivRegex, `<address>${clientInfo.address}</address>`);
      changesCount++;
    }
  }
  
  // 8. Rewrite service descriptions using client's services
  if (clientInfo.services && clientInfo.services.length > 0) {
    try {
      // Find common service section patterns
      // Look for headings followed by descriptions that mention services
      const serviceSectionRegex = /<h[2-4][^>]*>([^<]*?(?:service|hvac|plumbing|heating|cooling|repair|maintenance|installation)[^<]*)<\/h[2-4]>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
      
      let serviceMatch;
      let serviceRewrites = 0;
      
      while ((serviceMatch = serviceSectionRegex.exec(updatedHtml)) !== null) {
        const serviceHeading = serviceMatch[1];
        const serviceDesc = serviceMatch[2];
        
        // Skip if already mentions client's city or business
        if (serviceDesc.toLowerCase().includes(clientInfo.location.city.toLowerCase()) || 
            serviceDesc.toLowerCase().includes(clientInfo.businessName.toLowerCase())) {
          continue;
        }
        
        // Match to a client service
        const matchingService = clientInfo.services.find(s => 
          serviceHeading.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
          serviceDesc.toLowerCase().includes(s.name.toLowerCase().split(' ')[0])
        );
        
        if (matchingService) {
          try {
            // Use AI to rewrite the service description
            const rewritePrompt = `Rewrite this service description for "${matchingService.name}" provided by "${clientInfo.businessName}" in ${clientInfo.location.city}, ${clientInfo.location.state}. Keep it professional and SEO-friendly. Original: "${serviceDesc}"`;
            
            const aiResult = await generate({
              task: 'content',
              prompt: rewritePrompt,
              temperature: 0.7,
              maxTokens: 300,
            });
            
            const rewrittenDesc = aiResult.content.trim().replace(/^["']|["']$/g, '').replace(/\n+/g, ' ');
            
            // Replace the paragraph content
            updatedHtml = updatedHtml.replace(serviceMatch[0], serviceMatch[0].replace(serviceDesc, rewrittenDesc));
            serviceRewrites++;
            changesCount++;
          } catch (error) {
            console.error(`[TemplateGenerator] ⚠️ Failed to rewrite service "${serviceHeading}":`, getErrorMessage(error));
            // Fallback: simple replacement
            updatedHtml = updatedHtml.replace(serviceMatch[0], serviceMatch[0].replace(serviceDesc, matchingService.description));
            serviceRewrites++;
            changesCount++;
          }
        }
      }
      
      if (serviceRewrites > 0) {
        console.log(`[TemplateGenerator] ✅ Rewrote ${serviceRewrites} service descriptions`);
      }
    } catch (error) {
      console.error(`[TemplateGenerator] ⚠️ Service rewriting error:`, getErrorMessage(error));
    }
  }
  
  console.log(`[TemplateGenerator] ✅ Total content changes: ${changesCount}`);
  
  return { html: updatedHtml, changesCount };
}

// ============================================
// COLOR REPLACEMENT - BLUE ONLY
// ============================================

/**
 * Replace all colors with blue shades only
 */
function replaceAllColorsWithBlue(html: string, css: string): { html: string; css: string } {
  // Blue color palette - various shades
  const blueShades = [
    '#0066cc', // Primary blue
    '#003d7a', // Dark blue
    '#0080ff', // Bright blue
    '#0052a3', // Medium blue
    '#001f3d', // Very dark blue
    '#4da6ff', // Light blue
    '#0066ff', // Standard blue
    '#003366', // Navy blue
    '#1a75ff', // Sky blue
    '#004080', // Deep blue
  ];
  
  // Function to convert any color to a blue shade
  const getBlueReplacement = (originalColor: string): string => {
    // If already blue-ish, keep similar shade
    if (originalColor.match(/#[0-9a-f]{6}/i)) {
      const hex = originalColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // If it's already blue-dominant, adjust to pure blue
      if (b > r && b > g) {
        // Already blue-ish, make it a nice blue
        return blueShades[0];
      }
    }
    
    // Map to blue based on brightness/darkness
    // Dark colors -> dark blue, light colors -> light blue
    if (originalColor.toLowerCase().includes('dark') || 
        originalColor.toLowerCase().includes('black') ||
        originalColor.match(/#[0-3][0-9a-f][0-3][0-9a-f][0-3][0-9a-f]/i)) {
      return blueShades[1]; // Dark blue
    }
    
    if (originalColor.toLowerCase().includes('light') ||
        originalColor.toLowerCase().includes('white') ||
        originalColor.match(/#[c-f][0-9a-f][c-f][0-9a-f][c-f][0-9a-f]/i)) {
      return blueShades[5]; // Light blue
    }
    
    // Default to primary blue
    return blueShades[0];
  };
  
  let updatedHtml = html;
  let updatedCss = css;
  
  // Replace hex colors in CSS
  const hexColorRegex = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
  updatedCss = updatedCss.replace(hexColorRegex, (match) => {
    if (match.toLowerCase() === '#fff' || match.toLowerCase() === '#ffffff' ||
        match.toLowerCase() === '#000' || match.toLowerCase() === '#000000') {
      return match; // Keep pure white and black
    }
    return getBlueReplacement(match);
  });
  
  // Replace hex colors in inline styles
  updatedHtml = updatedHtml.replace(/style=["']([^"']*)["']/gi, (match, styleContent) => {
    const updatedStyle = styleContent.replace(hexColorRegex, (colorMatch) => {
      if (colorMatch.toLowerCase() === '#fff' || colorMatch.toLowerCase() === '#ffffff' ||
          colorMatch.toLowerCase() === '#000' || colorMatch.toLowerCase() === '#000000') {
        return colorMatch; // Keep pure white and black
      }
      return getBlueReplacement(colorMatch);
    });
    return `style="${updatedStyle}"`;
  });
  
  // Replace rgb/rgba colors
  const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/gi;
  updatedCss = updatedCss.replace(rgbRegex, (match, r, g, b) => {
    const brightness = (parseInt(r) + parseInt(g) + parseInt(b)) / 3;
    if (brightness < 50) {
      return 'rgb(0, 61, 122)'; // Dark blue
    } else if (brightness > 200) {
      return 'rgb(77, 166, 255)'; // Light blue
    }
    return 'rgb(0, 102, 204)'; // Primary blue
  });
  
  updatedHtml = updatedHtml.replace(/style=["']([^"']*)["']/gi, (match, styleContent) => {
    const updatedStyle = styleContent.replace(rgbRegex, (colorMatch, r, g, b) => {
      const brightness = (parseInt(r) + parseInt(g) + parseInt(b)) / 3;
      if (brightness < 50) {
        return 'rgb(0, 61, 122)';
      } else if (brightness > 200) {
        return 'rgb(77, 166, 255)';
      }
      return 'rgb(0, 102, 204)';
    });
    return `style="${updatedStyle}"`;
  });
  
  // Replace common color names with blue
  const colorNameMap: Record<string, string> = {
    'red': blueShades[0],
    'green': blueShades[0],
    'yellow': blueShades[5],
    'orange': blueShades[2],
    'purple': blueShades[1],
    'pink': blueShades[5],
    'brown': blueShades[1],
    'gray': blueShades[4],
    'grey': blueShades[4],
  };
  
  Object.entries(colorNameMap).forEach(([colorName, blueColor]) => {
    const colorRegex = new RegExp(`\\b${colorName}\\b`, 'gi');
    updatedCss = updatedCss.replace(colorRegex, () => blueColor);
  });
  
  console.log(`[TemplateGenerator] 🎨 Replaced all colors with blue shades`);
  
  return { html: updatedHtml, css: updatedCss };
}

// ============================================
// CLEANUP & FINALIZATION
// ============================================

/**
 * Remove tracking scripts and clean up the HTML
 * IMPORTANT: Uses very conservative patterns to avoid destroying content
 */
function cleanupHtml(html: string): string {
  if (!html) {
    console.warn('[TemplateGenerator] ⚠️ No HTML to clean up');
    return '';
  }
  
  let cleanHtml = html;
  let removedCount = 0;
  
  // ONLY remove script tags that DIRECTLY reference tracking services in src attribute
  // This is much safer than trying to match script content
  const safeTrackingPatterns = [
    // Google Tag Manager - only match if in src attribute
    /<script[^>]*src=["'][^"']*googletagmanager\.com[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
    
    // Google Analytics - only match if in src attribute
    /<script[^>]*src=["'][^"']*google-analytics\.com[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
    
    // Facebook - only match if in src attribute
    /<script[^>]*src=["'][^"']*connect\.facebook\.net[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
    
    // CallRail - only match if in src attribute  
    /<script[^>]*src=["'][^"']*callrail\.com[^"']*["'][^>]*>[\s\S]*?<\/script>/gi,
  ];
  
  safeTrackingPatterns.forEach(pattern => {
    const matches = cleanHtml.match(pattern);
    if (matches) {
      removedCount += matches.length;
      cleanHtml = cleanHtml.replace(pattern, '<!-- Tracking script removed -->');
    }
  });
  
  // Remove GTM noscript iframes (these are safe to remove)
  const gtmNoscript = /<noscript><iframe[^>]*googletagmanager[^>]*><\/iframe><\/noscript>/gi;
  const gtmMatches = cleanHtml.match(gtmNoscript);
  if (gtmMatches) {
    removedCount += gtmMatches.length;
    cleanHtml = cleanHtml.replace(gtmNoscript, '');
  }
  
  console.log(`[TemplateGenerator] 🧹 Cleaned up ${removedCount} tracking scripts (safe mode)`);
  
  return cleanHtml;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

/**
 * Generate a website from a template with all images replaced and content rewritten
 */
export async function generateFromTemplate(
  templateId: string,
  clientInfo: ClientInfo,
  options?: {
    skipImages?: boolean;
    skipContent?: boolean;
    skipCleanup?: boolean;
    onProgress?: (phase: string, current: number, total: number) => void;
  }
): Promise<TemplateBasedResult> {
  const errors: string[] = [];
  
  console.log(`\n[TemplateGenerator] ═══════════════════════════════════════`);
  console.log(`[TemplateGenerator] 🚀 Starting Template-Based Generation`);
  console.log(`[TemplateGenerator] Template: ${templateId}`);
  console.log(`[TemplateGenerator] Client: ${clientInfo.businessName}`);
  console.log(`[TemplateGenerator] ═══════════════════════════════════════\n`);
  
  // Step 1: Load template
  const template = await loadTemplate(templateId);
  if (!template) {
    return {
      success: false,
      html: '',
      css: '',
      replacedImages: [],
      contentChanges: 0,
      errors: [`Template not found: ${templateId}`]
    };
  }
  
  let html = template.html;
  let css = template.css;
  let replacedImages: GeneratedImage[] = [];
  let contentChanges = 0;
  
  // Step 2: Replace all images
  if (!options?.skipImages && template.images && template.images.length > 0) {
    try {
      const imageResult = await replaceAllImages(
        html,
        template.images,
        clientInfo,
        options?.onProgress ? (current, total) => options.onProgress!('images', current, total) : undefined
      );
      html = imageResult.html;
      replacedImages = imageResult.replacedImages;
    } catch (error) {
      errors.push(`Image replacement error: ${getErrorMessage(error)}`);
    }
  }
  
  // Step 3: Rewrite all content
  if (!options?.skipContent) {
    try {
      const contentResult = await rewriteAllContent(html, template, clientInfo);
      html = contentResult.html;
      contentChanges = contentResult.changesCount;
    } catch (error) {
      errors.push(`Content rewriting error: ${getErrorMessage(error)}`);
    }
  }
  
  // Step 3.5: Replace all colors with blue only
  const colorResult = replaceAllColorsWithBlue(html, css);
  html = colorResult.html;
  css = colorResult.css;
  
  // Step 4: Cleanup tracking scripts
  if (!options?.skipCleanup) {
    html = cleanupHtml(html);
  }
  
  console.log(`\n[TemplateGenerator] ═══════════════════════════════════════`);
  console.log(`[TemplateGenerator] ✅ Generation Complete!`);
  console.log(`[TemplateGenerator] Images Replaced: ${replacedImages.length}`);
  console.log(`[TemplateGenerator] Content Changes: ${contentChanges}`);
  console.log(`[TemplateGenerator] Errors: ${errors.length}`);
  console.log(`[TemplateGenerator] ═══════════════════════════════════════\n`);
  
  return {
    success: errors.length === 0,
    html,
    css,
    replacedImages,
    contentChanges,
    errors: errors.length > 0 ? errors : undefined
  };
}

// ============================================
// API HELPERS
// ============================================

/**
 * Quick test function to verify the generator works
 */
export async function testTemplateGenerator(): Promise<void> {
  console.log('[TemplateGenerator] Running test...');
  
  const templates = await listTemplates();
  console.log(`[TemplateGenerator] Found ${templates.length} templates`);
  
  if (templates.length > 0) {
    console.log('[TemplateGenerator] First template:', templates[0]);
  }
}

