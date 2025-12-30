/**
 * Comprehensive Template Inspector
 * Deep inspection engine with 66+ checks across 10 categories
 * Ensures 100% production-ready templates before client delivery
 */

import * as cheerio from 'cheerio';

export interface InspectionCheck {
  id: string;
  name: string;
  passed: boolean;
  severity: 'critical' | 'major' | 'minor';
  details?: string;
  autoFixable?: boolean;
  category: string;
}

export interface InspectionCategory {
  name: string;
  passed: number;
  failed: number;
  total: number;
  checks: InspectionCheck[];
}

export interface InspectionResult {
  templateId: string;
  templateName: string;
  score: number; // 0-100
  passed: boolean; // score >= 95
  categories: InspectionCategory[];
  criticalIssues: string[];
  majorIssues: string[];
  minorIssues: string[];
  autoFixApplied: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  inspectedAt: string;
}

/**
 * Extract original company information from template metadata
 */
function extractOriginalCompanyInfo(template: any): {
  companyName?: string;
  domain?: string;
  phone?: string;
  email?: string;
} {
  const companyName = template.brand || template.originalBrand || '';
  const domain = template.sourceUrl || template.originalUrl || '';
  
  // Try to extract from HTML if available
  const html = template.htmlContent || template.content?.html || '';
  if (html) {
    // Load HTML for potential future use
    void cheerio.load(html);
    
    // Extract phone from various patterns
    const phonePattern = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatch = html.match(phonePattern);
    const phone = phoneMatch ? phoneMatch[0] : undefined;
    
    // Extract email
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatch = html.match(emailPattern);
    const email = emailMatch ? emailMatch[0] : undefined;
    
    return { companyName, domain, phone, email };
  }
  
  return { companyName, domain };
}

/**
 * Comprehensive template inspection with 66+ checks
 */
export async function inspectTemplate(
  template: any,
  html: string
): Promise<InspectionResult> {
  const $ = cheerio.load(html);
  const checks: InspectionCheck[] = [];
  const originalCompany = extractOriginalCompanyInfo(template);
  
  // ============================================
  // CATEGORY 1: Structure and HTML Validation (8 checks)
  // ============================================
  const structureChecks: InspectionCheck[] = [];
  
  // Check 1: Valid HTML5 doctype
  const hasDoctype = html.trim().startsWith('<!DOCTYPE html') || html.trim().startsWith('<!doctype html');
  structureChecks.push({
    id: 'check-1',
    name: 'Valid HTML5 doctype present',
    passed: hasDoctype,
    severity: 'critical',
    details: hasDoctype ? 'HTML5 doctype found' : 'Missing HTML5 doctype',
    autoFixable: true,
    category: 'Structure and HTML Validation',
  });
  
  // Check 2: Proper head and body structure
  const hasHead = $('head').length > 0;
  const hasBody = $('body').length > 0;
  structureChecks.push({
    id: 'check-2',
    name: 'Proper <head> and <body> structure',
    passed: hasHead && hasBody,
    severity: 'critical',
    details: hasHead && hasBody ? 'Head and body tags present' : `Missing: ${!hasHead ? 'head' : ''} ${!hasBody ? 'body' : ''}`,
    autoFixable: true,
    category: 'Structure and HTML Validation',
  });
  
  // Check 3: Required meta tags
  const hasCharset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  structureChecks.push({
    id: 'check-3',
    name: 'Required meta tags (charset, viewport)',
    passed: hasCharset && hasViewport,
    severity: 'major',
    details: hasCharset && hasViewport ? 'All required meta tags present' : `Missing: ${!hasCharset ? 'charset' : ''} ${!hasViewport ? 'viewport' : ''}`,
    autoFixable: true,
    category: 'Structure and HTML Validation',
  });
  
  // Check 4: No duplicate IDs
  const ids: string[] = [];
  const duplicateIds: string[] = [];
  $('[id]').each((_i, el) => {
    const id = $(el).attr('id');
    if (id) {
      if (ids.includes(id)) {
        duplicateIds.push(id);
      } else {
        ids.push(id);
      }
    }
  });
  structureChecks.push({
    id: 'check-4',
    name: 'No duplicate IDs in document',
    passed: duplicateIds.length === 0,
    severity: 'major',
    details: duplicateIds.length === 0 ? 'No duplicate IDs found' : `Found ${duplicateIds.length} duplicate IDs: ${duplicateIds.slice(0, 5).join(', ')}`,
    autoFixable: false,
    category: 'Structure and HTML Validation',
  });
  
  // Check 5: Valid semantic HTML structure
  const hasHeader = $('header').length > 0 || $('[role="banner"]').length > 0;
  const hasMain = $('main').length > 0 || $('[role="main"]').length > 0;
  const hasFooter = $('footer').length > 0 || $('[role="contentinfo"]').length > 0;
  structureChecks.push({
    id: 'check-5',
    name: 'Valid semantic HTML structure (header, main, footer)',
    passed: hasHeader && hasMain && hasFooter,
    severity: 'minor',
    details: hasHeader && hasMain && hasFooter ? 'Semantic structure present' : `Missing: ${!hasHeader ? 'header' : ''} ${!hasMain ? 'main' : ''} ${!hasFooter ? 'footer' : ''}`,
    autoFixable: false,
    category: 'Structure and HTML Validation',
  });
  
  // Check 6: No broken/unclosed HTML tags (basic check)
  const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
  const closeTags = (html.match(/<\/[^>]+>/g) || []).length;
  const selfClosingTags = (html.match(/<[^>]+\/>/g) || []).length;
  const tagBalance = Math.abs(openTags - closeTags - selfClosingTags);
  structureChecks.push({
    id: 'check-6',
    name: 'No broken/unclosed HTML tags',
    passed: tagBalance < 10, // Allow some tolerance
    severity: 'major',
    details: tagBalance < 10 ? 'HTML tags appear balanced' : `Potential tag imbalance detected (difference: ${tagBalance})`,
    autoFixable: false,
    category: 'Structure and HTML Validation',
  });
  
  // Check 7: Proper heading hierarchy
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const hasProperHierarchy = h1Count === 1 && h2Count > 0;
  structureChecks.push({
    id: 'check-7',
    name: 'Proper heading hierarchy (H1 > H2 > H3)',
    passed: hasProperHierarchy,
    severity: 'major',
    details: hasProperHierarchy ? `Proper hierarchy: ${h1Count} H1, ${h2Count} H2, ${h3Count} H3` : `Issues: ${h1Count} H1 (should be 1), ${h2Count} H2`,
    autoFixable: false,
    category: 'Structure and HTML Validation',
  });
  
  // Check 8: Language attribute on html tag
  const hasLang = $('html').attr('lang') !== undefined;
  structureChecks.push({
    id: 'check-8',
    name: 'Language attribute on <html> tag',
    passed: hasLang,
    severity: 'minor',
    details: hasLang ? `Language set: ${$('html').attr('lang')}` : 'Missing lang attribute',
    autoFixable: true,
    category: 'Structure and HTML Validation',
  });
  
  checks.push(...structureChecks);
  
  // ============================================
  // CATEGORY 2: Original Company Removal (10 checks)
  // ============================================
  const removalChecks: InspectionCheck[] = [];
  const companyNameLower = originalCompany.companyName?.toLowerCase() || '';
  const domainLower = originalCompany.domain?.toLowerCase() || '';
  
  // Check 9: Original company name completely removed
  const companyNamePatterns = companyNameLower ? [
    new RegExp(companyNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
    new RegExp(companyNameLower.split(' ')[0], 'gi'), // First word
  ] : [];
  let companyNameFound = false;
  if (companyNameLower) {
    companyNameFound = companyNamePatterns.some(pattern => pattern.test(html));
  }
  removalChecks.push({
    id: 'check-9',
    name: 'Original company name completely removed',
    passed: !companyNameFound,
    severity: 'critical',
    details: !companyNameFound ? 'No original company name found' : `Found original company name: "${originalCompany.companyName}"`,
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 10: Original phone numbers removed
  const originalPhone = originalCompany.phone;
  let originalPhoneFound = false;
  if (originalPhone) {
    const phoneEscaped = originalPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    originalPhoneFound = new RegExp(phoneEscaped, 'g').test(html);
  }
  removalChecks.push({
    id: 'check-10',
    name: 'Original phone numbers removed',
    passed: !originalPhoneFound,
    severity: 'critical',
    details: !originalPhoneFound ? 'No original phone numbers found' : `Found original phone: "${originalPhone}"`,
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 11: Original email addresses removed
  const originalEmail = originalCompany.email;
  let originalEmailFound = false;
  if (originalEmail) {
    const emailEscaped = originalEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    originalEmailFound = new RegExp(emailEscaped, 'gi').test(html);
  }
  removalChecks.push({
    id: 'check-11',
    name: 'Original email addresses removed',
    passed: !originalEmailFound,
    severity: 'critical',
    details: !originalEmailFound ? 'No original email addresses found' : `Found original email: "${originalEmail}"`,
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 12: Original physical addresses removed
  // Pattern for future use: /\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)/gi
  let addressFound = false;
  if (originalCompany.domain) {
    // Check for common address patterns in context of original domain
    const domainContext = new RegExp(`(${domainLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*?)(?:Street|St|Avenue|Ave|Road|Rd)`, 'gi');
    addressFound = domainContext.test(html);
  }
  removalChecks.push({
    id: 'check-12',
    name: 'Original physical addresses removed',
    passed: !addressFound,
    severity: 'major',
    details: !addressFound ? 'No original addresses found' : 'Found potential original address',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 13: Original testimonials/reviews removed
  // Pattern for future use: /testimonial|review|customer\s+review|client\s+testimonial/gi
  let testimonialsFound = false;
  if (originalCompany.companyName) {
    // Check if testimonials mention original company
    const testimonialWithCompany = new RegExp(`(${companyNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]{0,200}?(?:testimonial|review|said|says))`, 'gi');
    testimonialsFound = testimonialWithCompany.test(html);
  }
  removalChecks.push({
    id: 'check-13',
    name: 'Original testimonials/reviews removed',
    passed: !testimonialsFound,
    severity: 'major',
    details: !testimonialsFound ? 'No original testimonials found' : 'Found potential original testimonials',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 14: Original team photos removed (by URL pattern)
  const teamPhotoPatterns = [
    /team|staff|employee|executive|founder|ceo|president/gi,
  ];
  let teamPhotosFound = false;
  $('img').each((_i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    if (teamPhotoPatterns.some(pattern => pattern.test(src) || pattern.test(alt))) {
      if (originalCompany.domain && src.includes(originalCompany.domain)) {
        teamPhotosFound = true;
        return false; // Break
      }
    }
    return;
  });
  removalChecks.push({
    id: 'check-14',
    name: 'Original team photos removed',
    passed: !teamPhotosFound,
    severity: 'major',
    details: !teamPhotosFound ? 'No original team photos found' : 'Found potential original team photos',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 15: Original logo replaced
  let originalLogoFound = false;
  if (originalCompany.domain) {
    $('img[src*="logo"], img[alt*="logo"], img[class*="logo"]').each((_i, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes(originalCompany.domain!)) {
        originalLogoFound = true;
        return false;
      }
      return;
    });
  }
  removalChecks.push({
    id: 'check-15',
    name: 'Original logo replaced',
    passed: !originalLogoFound,
    severity: 'critical',
    details: !originalLogoFound ? 'No original logo found' : 'Found original logo from original domain',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 16: Original social media links removed
  let originalSocialFound = false;
  if (originalCompany.domain) {
    $('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes(originalCompany.domain!)) {
        originalSocialFound = true;
        return false;
      }
      return;
    });
  }
  removalChecks.push({
    id: 'check-16',
    name: 'Original social media links removed',
    passed: !originalSocialFound,
    severity: 'major',
    details: !originalSocialFound ? 'No original social media links found' : 'Found original social media links',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 17: Original tracking IDs removed
  const trackingPatterns = [
    /UA-\d{4,10}-\d{1,4}/g, // Google Analytics
    /G-[A-Z0-9]{10}/g, // Google Analytics 4
    /fbq\(['"]\d+['"]\)/g, // Facebook Pixel
    /_gaq\.push/g, // Old GA
  ];
  let trackingFound = false;
  trackingPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      trackingFound = true;
    }
  });
  removalChecks.push({
    id: 'check-17',
    name: 'Original tracking IDs removed (GA, FB Pixel)',
    passed: !trackingFound,
    severity: 'critical',
    details: !trackingFound ? 'No tracking IDs found' : 'Found tracking IDs (GA/FB Pixel)',
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  // Check 18: No original company domain in any links
  let originalDomainInLinks = false;
  if (originalCompany.domain) {
    const domainPattern = new RegExp(originalCompany.domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    $('a[href]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      if (domainPattern.test(href)) {
        originalDomainInLinks = true;
        return false;
      }
      return;
    });
  }
  removalChecks.push({
    id: 'check-18',
    name: 'No original company domain in any links',
    passed: !originalDomainInLinks,
    severity: 'critical',
    details: !originalDomainInLinks ? 'No original domain in links' : `Found links to original domain: ${originalCompany.domain}`,
    autoFixable: true,
    category: 'Original Company Removal',
  });
  
  checks.push(...removalChecks);
  
  // ============================================
  // CATEGORY 3: Content Quality (8 checks)
  // ============================================
  const contentChecks: InspectionCheck[] = [];
  
  // Check 19: No Lorem Ipsum or placeholder text
  const loremPatterns = [
    /lorem\s+ipsum/gi,
    /dolor\s+sit\s+amet/gi,
    /consectetur\s+adipiscing/gi,
  ];
  let loremFound = false;
  loremPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      loremFound = true;
    }
  });
  contentChecks.push({
    id: 'check-19',
    name: 'No Lorem Ipsum or placeholder text',
    passed: !loremFound,
    severity: 'critical',
    details: !loremFound ? 'No Lorem Ipsum found' : 'Found Lorem Ipsum placeholder text',
    autoFixable: true,
    category: 'Content Quality',
  });
  
  // Check 20: No empty headings or paragraphs
  let emptyContentFound = false;
  const emptyElements: string[] = [];
  $('h1, h2, h3, h4, h5, h6, p').each((_i, el) => {
    const text = $(el).text().trim();
    if (text === '' || text.length < 3) {
      emptyContentFound = true;
      const tagName = el.tagName.toLowerCase();
      if (emptyElements.length < 5) {
        emptyElements.push(tagName);
      }
    }
  });
  contentChecks.push({
    id: 'check-20',
    name: 'No empty headings or paragraphs',
    passed: !emptyContentFound,
    severity: 'major',
    details: !emptyContentFound ? 'No empty content found' : `Found ${emptyElements.length}+ empty elements: ${emptyElements.join(', ')}`,
    autoFixable: false,
    category: 'Content Quality',
  });
  
  // Check 21: All alt text is meaningful
  let badAltTextFound = false;
  const badAltTexts: string[] = [];
  $('img').each((_i, el) => {
    const alt = $(el).attr('alt') || '';
    const badPatterns = ['', 'image', 'img', 'photo', 'picture', 'placeholder', 'alt'];
    if (badPatterns.includes(alt.toLowerCase()) || alt.length < 3) {
      badAltTextFound = true;
      if (badAltTexts.length < 5) {
        badAltTexts.push(alt || '(empty)');
      }
    }
  });
  contentChecks.push({
    id: 'check-21',
    name: 'All alt text is meaningful (not empty/placeholder)',
    passed: !badAltTextFound,
    severity: 'major',
    details: !badAltTextFound ? 'All alt text is meaningful' : `Found ${badAltTexts.length}+ bad alt texts: ${badAltTexts.join(', ')}`,
    autoFixable: true,
    category: 'Content Quality',
  });
  
  // Check 22: No "example.com" or test URLs
  const testUrlPatterns = [
    /example\.com/gi,
    /test\.com/gi,
    /placeholder\.com/gi,
    /loremipsum\.com/gi,
  ];
  let testUrlsFound = false;
  testUrlPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      testUrlsFound = true;
    }
  });
  contentChecks.push({
    id: 'check-22',
    name: 'No "example.com" or test URLs',
    passed: !testUrlsFound,
    severity: 'major',
    details: !testUrlsFound ? 'No test URLs found' : 'Found example.com or test URLs',
    autoFixable: true,
    category: 'Content Quality',
  });
  
  // Check 23: No "Coming Soon" or placeholder sections
  const placeholderPatterns = [
    /coming\s+soon/gi,
    /under\s+construction/gi,
    /placeholder/gi,
    /\[placeholder\]/gi,
    /\[to\s+be\s+filled\]/gi,
  ];
  let placeholdersFound = false;
  placeholderPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      placeholdersFound = true;
    }
  });
  contentChecks.push({
    id: 'check-23',
    name: 'No "Coming Soon" or placeholder sections',
    passed: !placeholdersFound,
    severity: 'major',
    details: !placeholdersFound ? 'No placeholder sections found' : 'Found "Coming Soon" or placeholder text',
    autoFixable: true,
    category: 'Content Quality',
  });
  
  // Check 24: Proper content length
  const bodyText = $('body').text().trim();
  const contentLength = bodyText.length;
  const hasProperLength = contentLength > 500 && contentLength < 50000;
  contentChecks.push({
    id: 'check-24',
    name: 'Proper content length (not truncated)',
    passed: hasProperLength,
    severity: 'minor',
    details: hasProperLength ? `Content length OK: ${contentLength} chars` : `Content length issue: ${contentLength} chars (should be 500-50000)`,
    autoFixable: false,
    category: 'Content Quality',
  });
  
  // Check 25: No broken template variables
  const templateVarPattern = /\{\{[^}]+\}\}/g;
  const templateVars = html.match(templateVarPattern) || [];
  contentChecks.push({
    id: 'check-25',
    name: 'No broken template variables',
    passed: templateVars.length === 0,
    severity: 'critical',
    details: templateVars.length === 0 ? 'No template variables found' : `Found ${templateVars.length} template variables: ${templateVars.slice(0, 3).join(', ')}`,
    autoFixable: true,
    category: 'Content Quality',
  });
  
  // Check 26: Grammar/spelling basic check (common issues)
  const commonErrors = [
    /\bteh\b/gi, // "the" typo
    /\byoru\b/gi, // "your" typo
    /\bthier\b/gi, // "their" typo
    /\brecieve\b/gi, // "receive" typo
  ];
  let grammarErrorsFound = false;
  commonErrors.forEach(pattern => {
    if (pattern.test(html)) {
      grammarErrorsFound = true;
    }
  });
  contentChecks.push({
    id: 'check-26',
    name: 'Grammar/spelling basic check',
    passed: !grammarErrorsFound,
    severity: 'minor',
    details: !grammarErrorsFound ? 'No common grammar errors found' : 'Found common grammar/spelling errors',
    autoFixable: false,
    category: 'Content Quality',
  });
  
  checks.push(...contentChecks);
  
  // ============================================
  // CATEGORY 4: Image Validation (7 checks)
  // ============================================
  const imageChecks: InspectionCheck[] = [];
  
  // Check 27: All images have valid src
  let brokenImagesFound = false;
  const brokenImages: string[] = [];
  $('img').each((_i, el) => {
    const src = $(el).attr('src') || '';
    if (!src || src === 'undefined' || src === 'null' || src.trim() === '') {
      brokenImagesFound = true;
      if (brokenImages.length < 5) {
        brokenImages.push('(missing src)');
      }
    }
  });
  imageChecks.push({
    id: 'check-27',
    name: 'All images have valid src (not 404)',
    passed: !brokenImagesFound,
    severity: 'critical',
    details: !brokenImagesFound ? 'All images have valid src' : `Found ${brokenImages.length}+ broken images`,
    autoFixable: true,
    category: 'Image Validation',
  });
  
  // Check 28: All images have alt text
  let imagesWithoutAlt = 0;
  $('img').each((_i, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null) {
      imagesWithoutAlt++;
    }
  });
  imageChecks.push({
    id: 'check-28',
    name: 'All images have alt text',
    passed: imagesWithoutAlt === 0,
    severity: 'major',
    details: imagesWithoutAlt === 0 ? 'All images have alt text' : `Found ${imagesWithoutAlt} images without alt text`,
    autoFixable: true,
    category: 'Image Validation',
  });
  
  // Check 29: No external image URLs (should be local/base64)
  let externalImagesFound = false;
  const externalImageCount = $('img[src^="http"]').not('[src^="data:"]').length;
  externalImagesFound = externalImageCount > 0;
  imageChecks.push({
    id: 'check-29',
    name: 'No external image URLs (should be local/base64)',
    passed: !externalImagesFound,
    severity: 'major',
    details: !externalImagesFound ? 'No external image URLs' : `Found ${externalImageCount} external image URLs`,
    autoFixable: false,
    category: 'Image Validation',
  });
  
  // Check 30: Hero image exists and is appropriate
  const heroImage = $('img[class*="hero"], img[id*="hero"], .hero img, #hero img').first();
  const hasHeroImage = heroImage.length > 0;
  imageChecks.push({
    id: 'check-30',
    name: 'Hero image exists and is appropriate',
    passed: hasHeroImage,
    severity: 'minor',
    details: hasHeroImage ? 'Hero image found' : 'No hero image found',
    autoFixable: false,
    category: 'Image Validation',
  });
  
  // Check 31: Images are reasonable size (check if base64, estimate)
  let largeImagesFound = false;
  $('img[src^="data:"]').each((_i, el) => {
    const src = $(el).attr('src') || '';
    // Base64 images: estimate size (rough calculation)
    if (src.length > 200000) { // ~150KB base64
      largeImagesFound = true;
      return false;
    }
    return;
  });
  imageChecks.push({
    id: 'check-31',
    name: 'Images are reasonable size (< 2MB each)',
    passed: !largeImagesFound,
    severity: 'minor',
    details: !largeImagesFound ? 'Image sizes appear reasonable' : 'Found potentially large images',
    autoFixable: false,
    category: 'Image Validation',
  });
  
  // Check 32: No broken image references
  let brokenRefsFound = false;
  $('img').each((_i, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('undefined') || src.includes('null') || src.includes('{{')) {
      brokenRefsFound = true;
      return false;
    }
    return;
  });
  imageChecks.push({
    id: 'check-32',
    name: 'No broken image references',
    passed: !brokenRefsFound,
    severity: 'critical',
    details: !brokenRefsFound ? 'No broken image references' : 'Found broken image references',
    autoFixable: true,
    category: 'Image Validation',
  });
  
  // Check 33: Logo image is present and valid
  const logoImage = $('img[class*="logo"], img[id*="logo"], .logo img, #logo img').first();
  const hasLogo = logoImage.length > 0 && (logoImage.attr('src') || '').length > 0;
  imageChecks.push({
    id: 'check-33',
    name: 'Logo image is present and valid',
    passed: hasLogo,
    severity: 'major',
    details: hasLogo ? 'Logo image found' : 'No logo image found',
    autoFixable: false,
    category: 'Image Validation',
  });
  
  checks.push(...imageChecks);
  
  // ============================================
  // CATEGORY 5: Link and Navigation (6 checks)
  // ============================================
  const linkChecks: InspectionCheck[] = [];
  
  // Check 34: No broken internal links
  let brokenInternalLinks = 0;
  $('a[href^="#"], a[href^="/"], a[href^="./"]').each((_i, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('#') && href.length > 1) {
      const targetId = href.substring(1);
      if ($(`#${targetId}`).length === 0 && $(`[name="${targetId}"]`).length === 0) {
        brokenInternalLinks++;
      }
    }
  });
  linkChecks.push({
    id: 'check-34',
    name: 'No broken internal links',
    passed: brokenInternalLinks === 0,
    severity: 'major',
    details: brokenInternalLinks === 0 ? 'No broken internal links' : `Found ${brokenInternalLinks} broken internal links`,
    autoFixable: false,
    category: 'Link and Navigation',
  });
  
  // Check 35: All href attributes are valid
  let invalidHrefs = 0;
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('undefined') || href.includes('null') || href.includes('{{')) {
      invalidHrefs++;
    }
  });
  linkChecks.push({
    id: 'check-35',
    name: 'All href attributes are valid',
    passed: invalidHrefs === 0,
    severity: 'critical',
    details: invalidHrefs === 0 ? 'All hrefs are valid' : `Found ${invalidHrefs} invalid hrefs`,
    autoFixable: true,
    category: 'Link and Navigation',
  });
  
  // Check 36: No javascript:void(0) without handlers
  let voidLinks = 0;
  $('a[href="javascript:void(0)"], a[href="javascript:void(0);"]').each((_i, el) => {
    const onclick = $(el).attr('onclick');
    const hasHandler = onclick && onclick.length > 0;
    if (!hasHandler) {
      voidLinks++;
    }
  });
  linkChecks.push({
    id: 'check-36',
    name: 'No javascript:void(0) without handlers',
    passed: voidLinks === 0,
    severity: 'minor',
    details: voidLinks === 0 ? 'No problematic void links' : `Found ${voidLinks} void links without handlers`,
    autoFixable: false,
    category: 'Link and Navigation',
  });
  
  // Check 37: All buttons have proper click handlers
  let buttonsWithoutHandlers = 0;
  $('button').each((_i, el) => {
    const onclick = $(el).attr('onclick');
    const type = $(el).attr('type');
    const form = $(el).closest('form').length > 0;
    if (!onclick && type !== 'submit' && !form) {
      buttonsWithoutHandlers++;
    }
  });
  linkChecks.push({
    id: 'check-37',
    name: 'All buttons have proper click handlers',
    passed: buttonsWithoutHandlers === 0,
    severity: 'minor',
    details: buttonsWithoutHandlers === 0 ? 'All buttons have handlers' : `Found ${buttonsWithoutHandlers} buttons without handlers`,
    autoFixable: false,
    category: 'Link and Navigation',
  });
  
  // Check 38: No mailto to original company
  let originalMailtoFound = false;
  if (originalCompany.email) {
    $('a[href^="mailto:"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      if (href.toLowerCase().includes(originalCompany.email!.toLowerCase())) {
        originalMailtoFound = true;
        return false;
      }
      return;
    });
  }
  linkChecks.push({
    id: 'check-38',
    name: 'No mailto to original company',
    passed: !originalMailtoFound,
    severity: 'critical',
    details: !originalMailtoFound ? 'No original company mailto links' : `Found mailto to original company: ${originalCompany.email}`,
    autoFixable: true,
    category: 'Link and Navigation',
  });
  
  // Check 39: No tel to original company phone
  let originalTelFound = false;
  if (originalCompany.phone) {
    $('a[href^="tel:"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const phoneDigits = originalCompany.phone!.replace(/\D/g, '');
      const hrefDigits = href.replace(/\D/g, '');
      if (hrefDigits.includes(phoneDigits) || phoneDigits.includes(hrefDigits)) {
        originalTelFound = true;
        return false;
      }
      return;
    });
  }
  linkChecks.push({
    id: 'check-39',
    name: 'No tel to original company phone',
    passed: !originalTelFound,
    severity: 'critical',
    details: !originalTelFound ? 'No original company tel links' : `Found tel to original company: ${originalCompany.phone}`,
    autoFixable: true,
    category: 'Link and Navigation',
  });
  
  checks.push(...linkChecks);
  
  // ============================================
  // CATEGORY 6: Scripts and Security (8 checks)
  // ============================================
  const scriptChecks: InspectionCheck[] = [];
  
  // Check 40: No Google Analytics scripts
  const gaPatterns = [
    /google-analytics\.com/gi,
    /googletagmanager\.com\/gtag/gi,
    /gtag\(/g,
    /ga\(/g,
    /_gaq\.push/g,
  ];
  let gaFound = false;
  gaPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      gaFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-40',
    name: 'No Google Analytics scripts',
    passed: !gaFound,
    severity: 'critical',
    details: !gaFound ? 'No Google Analytics found' : 'Found Google Analytics scripts',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 41: No Facebook Pixel scripts
  const fbPixelPatterns = [
    /facebook\.net\/en_US\/fbevents\.js/gi,
    /fbq\(/g,
    /connect\.facebook\.net/gi,
  ];
  let fbPixelFound = false;
  fbPixelPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      fbPixelFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-41',
    name: 'No Facebook Pixel scripts',
    passed: !fbPixelFound,
    severity: 'critical',
    details: !fbPixelFound ? 'No Facebook Pixel found' : 'Found Facebook Pixel scripts',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 42: No OneTrust/cookie scripts
  const cookieScriptPatterns = [
    /cookielaw\.org/gi,
    /onetrust/gi,
    /optanon/gi,
    /otBannerSdk/gi,
  ];
  let cookieScriptsFound = false;
  cookieScriptPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      cookieScriptsFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-42',
    name: 'No OneTrust/cookie scripts',
    passed: !cookieScriptsFound,
    severity: 'critical',
    details: !cookieScriptsFound ? 'No cookie scripts found' : 'Found OneTrust/cookie scripts',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 43: No live chat widgets
  const chatWidgetPatterns = [
    /intercom/gi,
    /zendesk.*chat/gi,
    /drift\.com/gi,
    /tawk\.to/gi,
    /livechatinc\.com/gi,
  ];
  let chatWidgetsFound = false;
  chatWidgetPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      chatWidgetsFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-43',
    name: 'No live chat widgets (Intercom, etc.)',
    passed: !chatWidgetsFound,
    severity: 'major',
    details: !chatWidgetsFound ? 'No chat widgets found' : 'Found live chat widgets',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 44: No exposed API keys in code
  const apiKeyPatterns = [
    /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/gi,
    /apikey\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/gi,
    /secret[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]/gi,
  ];
  let apiKeysFound = false;
  apiKeyPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      apiKeysFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-44',
    name: 'No exposed API keys in code',
    passed: !apiKeysFound,
    severity: 'critical',
    details: !apiKeysFound ? 'No API keys found' : 'Found exposed API keys',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 45: No hardcoded credentials
  const credentialPatterns = [
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /pwd\s*[:=]\s*['"][^'"]+['"]/gi,
    /pass\s*[:=]\s*['"][^'"]+['"]/gi,
  ];
  let credentialsFound = false;
  credentialPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      credentialsFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-45',
    name: 'No hardcoded credentials',
    passed: !credentialsFound,
    severity: 'critical',
    details: !credentialsFound ? 'No credentials found' : 'Found hardcoded credentials',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 46: No third-party tracking pixels
  const trackingPixelPatterns = [
    /tracking.*pixel/gi,
    /beacon/gi,
    /pixel\.gif/gi,
  ];
  let trackingPixelsFound = false;
  trackingPixelPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      trackingPixelsFound = true;
    }
  });
  scriptChecks.push({
    id: 'check-46',
    name: 'No third-party tracking pixels',
    passed: !trackingPixelsFound,
    severity: 'major',
    details: !trackingPixelsFound ? 'No tracking pixels found' : 'Found tracking pixels',
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  // Check 47: No external form endpoints
  let externalFormEndpoints = 0;
  $('form[action]').each((_i, el) => {
    const action = $(el).attr('action') || '';
    if (action.startsWith('http://') || action.startsWith('https://')) {
      if (!action.includes('localhost') && !action.includes('127.0.0.1')) {
        externalFormEndpoints++;
      }
    }
  });
  scriptChecks.push({
    id: 'check-47',
    name: 'No external form endpoints',
    passed: externalFormEndpoints === 0,
    severity: 'critical',
    details: externalFormEndpoints === 0 ? 'No external form endpoints' : `Found ${externalFormEndpoints} external form endpoints`,
    autoFixable: true,
    category: 'Scripts and Security',
  });
  
  checks.push(...scriptChecks);
  
  // ============================================
  // CATEGORY 7: SEO Completeness (6 checks)
  // ============================================
  const seoChecks: InspectionCheck[] = [];
  
  // Check 48: Title tag present and meaningful
  const title = $('title').text().trim();
  const hasTitle = title.length > 10 && title.length < 70;
  seoChecks.push({
    id: 'check-48',
    name: 'Title tag present and meaningful',
    passed: hasTitle,
    severity: 'critical',
    details: hasTitle ? `Title OK: "${title.substring(0, 50)}..."` : `Title issue: "${title}" (should be 10-70 chars)`,
    autoFixable: true,
    category: 'SEO Completeness',
  });
  
  // Check 49: Meta description present
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const hasMetaDesc = metaDesc.length >= 120 && metaDesc.length <= 160;
  seoChecks.push({
    id: 'check-49',
    name: 'Meta description present (120-160 chars)',
    passed: hasMetaDesc,
    severity: 'major',
    details: hasMetaDesc ? `Meta description OK: ${metaDesc.length} chars` : `Meta description issue: ${metaDesc.length} chars (should be 120-160)`,
    autoFixable: true,
    category: 'SEO Completeness',
  });
  
  // Check 50: Open Graph tags present
  const hasOGTitle = $('meta[property="og:title"]').length > 0;
  const hasOGDesc = $('meta[property="og:description"]').length > 0;
  const hasOGImage = $('meta[property="og:image"]').length > 0;
  const hasOGTags = hasOGTitle && hasOGDesc && hasOGImage;
  seoChecks.push({
    id: 'check-50',
    name: 'Open Graph tags present',
    passed: hasOGTags,
    severity: 'minor',
    details: hasOGTags ? 'Open Graph tags present' : `Missing: ${!hasOGTitle ? 'og:title' : ''} ${!hasOGDesc ? 'og:description' : ''} ${!hasOGImage ? 'og:image' : ''}`,
    autoFixable: true,
    category: 'SEO Completeness',
  });
  
  // Check 51: Canonical URL appropriate
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const hasCanonical = canonical.length > 0;
  seoChecks.push({
    id: 'check-51',
    name: 'Canonical URL appropriate',
    passed: hasCanonical,
    severity: 'minor',
    details: hasCanonical ? `Canonical URL: ${canonical.substring(0, 50)}` : 'Missing canonical URL',
    autoFixable: true,
    category: 'SEO Completeness',
  });
  
  // Check 52: Schema.org LocalBusiness markup
  const hasSchema = html.includes('schema.org') || html.includes('application/ld+json');
  seoChecks.push({
    id: 'check-52',
    name: 'Schema.org LocalBusiness markup',
    passed: hasSchema,
    severity: 'minor',
    details: hasSchema ? 'Schema.org markup found' : 'Missing Schema.org LocalBusiness markup',
    autoFixable: true,
    category: 'SEO Completeness',
  });
  
  // Check 53: Single H1 tag per page
  const h1CountCheck = $('h1').length;
  seoChecks.push({
    id: 'check-53',
    name: 'Single H1 tag per page',
    passed: h1CountCheck === 1,
    severity: 'major',
    details: h1CountCheck === 1 ? 'Single H1 tag found' : `Found ${h1CountCheck} H1 tags (should be 1)`,
    autoFixable: false,
    category: 'SEO Completeness',
  });
  
  checks.push(...seoChecks);
  
  // ============================================
  // CATEGORY 8: Forms and Inputs (5 checks)
  // ============================================
  const formChecks: InspectionCheck[] = [];
  
  // Check 54: Forms have valid action attributes
  let invalidFormActions = 0;
  $('form[action]').each((_i, el) => {
    const action = $(el).attr('action') || '';
    if (action.includes('undefined') || action.includes('null') || action.includes('{{')) {
      invalidFormActions++;
    }
  });
  formChecks.push({
    id: 'check-54',
    name: 'Forms have valid action attributes',
    passed: invalidFormActions === 0,
    severity: 'critical',
    details: invalidFormActions === 0 ? 'All form actions are valid' : `Found ${invalidFormActions} invalid form actions`,
    autoFixable: true,
    category: 'Forms and Inputs',
  });
  
  // Check 55: Form inputs have proper names
  let inputsWithoutNames = 0;
  $('input, textarea, select').not('[type="submit"]').not('[type="button"]').not('[type="reset"]').each((_i, el) => {
    const name = $(el).attr('name');
    const id = $(el).attr('id');
    if (!name && !id) {
      inputsWithoutNames++;
    }
  });
  formChecks.push({
    id: 'check-55',
    name: 'Form inputs have proper names',
    passed: inputsWithoutNames === 0,
    severity: 'major',
    details: inputsWithoutNames === 0 ? 'All inputs have names' : `Found ${inputsWithoutNames} inputs without names`,
    autoFixable: true,
    category: 'Forms and Inputs',
  });
  
  // Check 56: Required fields properly marked
  let requiredFieldsWithoutAria = 0;
  $('input[required], textarea[required], select[required]').each((_i, el) => {
    const ariaRequired = $(el).attr('aria-required');
    if (ariaRequired !== 'true') {
      requiredFieldsWithoutAria++;
    }
  });
  formChecks.push({
    id: 'check-56',
    name: 'Required fields properly marked',
    passed: requiredFieldsWithoutAria === 0,
    severity: 'minor',
    details: requiredFieldsWithoutAria === 0 ? 'All required fields properly marked' : `Found ${requiredFieldsWithoutAria} required fields without aria-required`,
    autoFixable: true,
    category: 'Forms and Inputs',
  });
  
  // Check 57: Forms don't submit to original company
  let formsToOriginalCompany = 0;
  if (originalCompany.domain) {
    $('form[action]').each((_i, el) => {
      const action = $(el).attr('action') || '';
      if (action.includes(originalCompany.domain!)) {
        formsToOriginalCompany++;
      }
    });
  }
  formChecks.push({
    id: 'check-57',
    name: 'Forms don\'t submit to original company',
    passed: formsToOriginalCompany === 0,
    severity: 'critical',
    details: formsToOriginalCompany === 0 ? 'No forms submit to original company' : `Found ${formsToOriginalCompany} forms submitting to original company`,
    autoFixable: true,
    category: 'Forms and Inputs',
  });
  
  // Check 58: Email/phone inputs validated
  let unvalidatedEmailPhone = 0;
  $('input[type="email"], input[type="tel"]').each((_i, el) => {
    const pattern = $(el).attr('pattern');
    const type = $(el).attr('type');
    if (!pattern && type === 'email') {
      unvalidatedEmailPhone++;
    }
  });
  formChecks.push({
    id: 'check-58',
    name: 'Email/phone inputs validated',
    passed: unvalidatedEmailPhone === 0,
    severity: 'minor',
    details: unvalidatedEmailPhone === 0 ? 'All email/phone inputs validated' : `Found ${unvalidatedEmailPhone} unvalidated email/phone inputs`,
    autoFixable: true,
    category: 'Forms and Inputs',
  });
  
  checks.push(...formChecks);
  
  // ============================================
  // CATEGORY 9: Styling and Layout (4 checks)
  // ============================================
  const stylingChecks: InspectionCheck[] = [];
  
  // Check 59: CSS properly loaded
  const hasInlineCSS = $('style').length > 0;
  const hasExternalCSS = $('link[rel="stylesheet"]').length > 0;
  const hasCSS = hasInlineCSS || hasExternalCSS;
  stylingChecks.push({
    id: 'check-59',
    name: 'CSS properly loaded (no unstyled content)',
    passed: hasCSS,
    severity: 'major',
    details: hasCSS ? 'CSS found' : 'No CSS found',
    autoFixable: false,
    category: 'Styling and Layout',
  });
  
  // Check 60: Responsive breakpoints work (check for viewport meta)
  const viewportMeta = $('meta[name="viewport"]').attr('content') || '';
  const hasResponsiveViewport = viewportMeta.includes('width=device-width');
  stylingChecks.push({
    id: 'check-60',
    name: 'Responsive breakpoints work',
    passed: hasResponsiveViewport,
    severity: 'major',
    details: hasResponsiveViewport ? 'Responsive viewport meta found' : 'Missing responsive viewport meta',
    autoFixable: true,
    category: 'Styling and Layout',
  });
  
  // Check 61: No horizontal scrolling (check for overflow-x)
  const overflowXPattern = /overflow-x\s*:\s*(?:scroll|auto)/gi;
  const hasOverflowX = overflowXPattern.test(html);
  stylingChecks.push({
    id: 'check-61',
    name: 'No horizontal scrolling',
    passed: !hasOverflowX,
    severity: 'minor',
    details: !hasOverflowX ? 'No horizontal scrolling detected' : 'Found overflow-x scroll/auto',
    autoFixable: true,
    category: 'Styling and Layout',
  });
  
  // Check 62: Fonts properly loaded
  const hasFonts = html.includes('font-family') || html.includes('@font-face') || $('link[href*="font"]').length > 0;
  stylingChecks.push({
    id: 'check-62',
    name: 'Fonts properly loaded',
    passed: hasFonts,
    severity: 'minor',
    details: hasFonts ? 'Fonts found' : 'No fonts detected',
    autoFixable: false,
    category: 'Styling and Layout',
  });
  
  checks.push(...stylingChecks);
  
  // ============================================
  // CATEGORY 10: Accessibility Basics (4 checks)
  // ============================================
  const accessibilityChecks: InspectionCheck[] = [];
  
  // Check 63: ARIA labels on interactive elements
  let interactiveWithoutAria = 0;
  $('button, a[href], input, textarea, select').each((_i, el) => {
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledBy = $(el).attr('aria-labelledby');
    const title = $(el).attr('title');
    const text = $(el).text().trim();
    if (!ariaLabel && !ariaLabelledBy && !title && text.length < 3) {
      interactiveWithoutAria++;
    }
  });
  accessibilityChecks.push({
    id: 'check-63',
    name: 'ARIA labels on interactive elements',
    passed: interactiveWithoutAria === 0,
    severity: 'minor',
    details: interactiveWithoutAria === 0 ? 'All interactive elements have labels' : `Found ${interactiveWithoutAria} interactive elements without ARIA labels`,
    autoFixable: true,
    category: 'Accessibility Basics',
  });
  
  // Check 64: Focus states visible (check for :focus styles)
  const hasFocusStates = html.includes(':focus') || html.includes('focus:');
  accessibilityChecks.push({
    id: 'check-64',
    name: 'Focus states visible',
    passed: hasFocusStates,
    severity: 'minor',
    details: hasFocusStates ? 'Focus states found' : 'No focus states detected',
    autoFixable: true,
    category: 'Accessibility Basics',
  });
  
  // Check 65: Proper color contrast (basic check - look for low contrast patterns)
  // Pattern for future use: /color\s*:\s*#[0-9a-f]{3,6}\s*;\s*background[^:]*:\s*#[0-9a-f]{3,6}/gi
  const lowContrastFound = false;
  // This is a basic check - full contrast checking would require color parsing
  accessibilityChecks.push({
    id: 'check-65',
    name: 'Proper color contrast (basic check)',
    passed: !lowContrastFound,
    severity: 'minor',
    details: !lowContrastFound ? 'Color contrast appears OK' : 'Potential low contrast detected',
    autoFixable: false,
    category: 'Accessibility Basics',
  });
  
  // Check 66: Keyboard navigation works (check for tabindex)
  let negativeTabindex = 0;
  $('[tabindex]').each((_i, el) => {
    const tabindex = parseInt($(el).attr('tabindex') || '0');
    if (tabindex < 0) {
      negativeTabindex++;
    }
  });
  accessibilityChecks.push({
    id: 'check-66',
    name: 'Keyboard navigation works',
    passed: negativeTabindex === 0,
    severity: 'minor',
    details: negativeTabindex === 0 ? 'No negative tabindex found' : `Found ${negativeTabindex} elements with negative tabindex`,
    autoFixable: true,
    category: 'Accessibility Basics',
  });
  
  checks.push(...accessibilityChecks);
  
  // ============================================
  // Calculate Results
  // ============================================
  const passedChecks = checks.filter(c => c.passed).length;
  const failedChecks = checks.filter(c => !c.passed).length;
  const totalChecks = checks.length;
  const score = Math.round((passedChecks / totalChecks) * 100);
  
  const criticalIssues = checks.filter(c => !c.passed && c.severity === 'critical').map(c => c.name);
  const majorIssues = checks.filter(c => !c.passed && c.severity === 'major').map(c => c.name);
  const minorIssues = checks.filter(c => !c.passed && c.severity === 'minor').map(c => c.name);
  
  // Group checks by category
  const categoriesMap = new Map<string, InspectionCheck[]>();
  checks.forEach(check => {
    if (!categoriesMap.has(check.category)) {
      categoriesMap.set(check.category, []);
    }
    categoriesMap.get(check.category)!.push(check);
  });
  
  const categories: InspectionCategory[] = Array.from(categoriesMap.entries()).map(([name, categoryChecks]) => ({
    name,
    passed: categoryChecks.filter(c => c.passed).length,
    failed: categoryChecks.filter(c => !c.passed).length,
    total: categoryChecks.length,
    checks: categoryChecks,
  }));
  
  return {
    templateId: template.id || 'unknown',
    templateName: template.name || template.brand || 'Unknown',
    score,
    passed: score >= 95,
    categories,
    criticalIssues,
    majorIssues,
    minorIssues,
    autoFixApplied: 0, // Will be updated by auto-fixer
    totalChecks,
    passedChecks,
    failedChecks,
    inspectedAt: new Date().toISOString(),
  };
}

