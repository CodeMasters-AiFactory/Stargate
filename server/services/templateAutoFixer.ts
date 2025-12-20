/**
 * Template Auto-Fixer Service
 * Automatically detects and fixes common template issues
 * Runs automatically on template load to ensure 100% working templates
 * Enhanced with comprehensive fixes based on inspection results
 */

import * as cheerio from 'cheerio';
import { InspectionResult } from './templateInspector';

export interface AutoFixResult {
  fixed: boolean;
  fixes: string[];
  errors: string[];
  warnings: string[];
  inspectionResult?: InspectionResult;
}

/**
 * Automatically fix all common template issues
 * Now includes comprehensive fixes based on deep inspection
 */
export function autoFixTemplate(html: string, template?: any): { html: string; result: AutoFixResult } {
  const result: AutoFixResult = {
    fixed: false,
    fixes: [],
    errors: [],
    warnings: [],
  };

  let fixedHtml = html;

  try {
    const $ = cheerio.load(html, { decodeEntities: false });

    // ============================================
    // FIX 1: Remove Cookie Consent Pop-ups (AGGRESSIVE)
    // ============================================
    const cookieSelectors = [
      '#cookie-consent',
      '.cookie-consent',
      '.cookie-banner',
      '#cookie-banner',
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[id*="Cookie"]',
      '[class*="Cookie"]',
      '.gdpr-banner',
      '#gdpr-banner',
      '.cookie-notice',
      '#cookie-notice',
      '#onetrust-consent-sdk',
      '.onetrust-pc-sdk',
      '#onetrust-banner-sdk',
      '.ot-sdk-container',
      '[id*="onetrust"]',
      '[class*="onetrust"]',
      '[id*="OneTrust"]',
      '[class*="OneTrust"]',
      '[id*="optanon"]',
      '[class*="optanon"]',
      '[id*="Optanon"]',
      '[class*="Optanon"]',
    ];

    let removedCookies = 0;
    cookieSelectors.forEach(selector => {
      try {
        const elements = $(selector);
        if (elements.length > 0) {
          elements.remove();
          removedCookies += elements.length;
        }
      } catch (e) {
        // Selector might be invalid, skip
      }
    });

    // Also remove any divs that contain cookie-related text
    $('div, section, aside').each((i, el) => {
      const $el = $(el);
      const text = $el.text().toLowerCase();
      const html = $el.html() || '';
      
      if (
        (text.includes('cookie') && (text.includes('accept') || text.includes('consent') || text.includes('reject'))) ||
        (text.includes('essential cookies') || text.includes('optional cookies')) ||
        (html.includes('Accept cookies') || html.includes('Reject optional cookies')) ||
        (html.includes('cookie policy') && html.includes('Accept'))
      ) {
        $el.remove();
        removedCookies++;
        result.fixed = true;
      }
    });

    if (removedCookies > 0) {
      result.fixes.push(`Removed ${removedCookies} cookie consent pop-up(s)`);
      result.fixed = true;
    }

    // ============================================
    // FIX 2: Remove Cookie Consent Scripts (AGGRESSIVE)
    // ============================================
    $('script').each((i, el) => {
      const scriptContent = $(el).html() || '';
      const scriptSrc = $(el).attr('src') || '';
      const scriptDataDomain = $(el).attr('data-domain-script') || '';
      const scriptDataLanguage = $(el).attr('data-language') || '';
      const scriptType = $(el).attr('type') || '';
      const scriptCharset = $(el).attr('charset') || '';
      
      // Remove OneTrust scripts (check ALL attributes and content)
      if (
        scriptSrc.includes('cookielaw.org') ||
        scriptSrc.includes('onetrust') ||
        scriptSrc.includes('OneTrust') ||
        scriptSrc.includes('optanon') ||
        scriptSrc.includes('Optanon') ||
        scriptSrc.includes('otBannerSdk') ||
        scriptSrc.includes('otSDKStub') ||
        scriptDataDomain ||
        scriptDataLanguage ||
        scriptContent.includes('OptanonWrapper') ||
        scriptContent.includes('OneTrust') ||
        scriptContent.includes('onetrust') ||
        scriptContent.includes('CookieV2TrackingTechnologies') ||
        scriptContent.includes('otBannerSdk') ||
        scriptContent.includes('otSDKStub') ||
        $(el).attr('data-domain-script') || // Any script with data-domain-script is OneTrust
        (scriptSrc && scriptSrc.toLowerCase().includes('cookie')) ||
        (scriptSrc && scriptSrc.toLowerCase().includes('consent'))
      ) {
        $(el).remove();
        result.fixes.push(`Removed cookie consent script: ${scriptSrc || scriptDataDomain || 'OneTrust/Optanon'}`);
        result.fixed = true;
        return;
      }
      
      // Remove any script that mentions cookies and consent/banner
      if (
        scriptContent.toLowerCase().includes('cookie') && 
        (scriptContent.toLowerCase().includes('consent') || 
         scriptContent.toLowerCase().includes('banner') ||
         scriptContent.toLowerCase().includes('accept') ||
         scriptContent.toLowerCase().includes('reject'))
      ) {
        $(el).remove();
        result.fixes.push('Removed cookie consent script');
        result.fixed = true;
        return;
      }
      
      // Remove scripts from cookie consent services
      if (
        scriptSrc.toLowerCase().includes('cookie') || 
        scriptSrc.toLowerCase().includes('consent') ||
        scriptSrc.toLowerCase().includes('gdpr') ||
        scriptSrc.toLowerCase().includes('cookielaw') ||
        scriptSrc.toLowerCase().includes('onetrust')
      ) {
        $(el).remove();
        result.fixes.push(`Removed cookie consent script: ${scriptSrc}`);
        result.fixed = true;
      }
    });

    // Remove cookie-related style tags
    $('style').each((i, el) => {
      const styleContent = $(el).html() || '';
      if (
        styleContent.toLowerCase().includes('cookie') &&
        (styleContent.toLowerCase().includes('consent') || styleContent.toLowerCase().includes('banner'))
      ) {
        $(el).remove();
        result.fixes.push('Removed cookie consent styles');
        result.fixed = true;
      }
    });

    // ============================================
    // FIX 3: Fix Broken Script Tags
    // ============================================
    $('script').each((i, el) => {
      const scriptContent = $(el).html() || '';
      
      // Fix common script errors
      if (scriptContent.includes('undefined') && scriptContent.includes('$')) {
        // jQuery might not be loaded yet - this will be handled by dependency injection
        result.warnings.push('Script uses jQuery - ensuring dependencies are injected');
      }
      
      // Remove scripts that reference non-existent elements
      if (scriptContent.includes('getElementById') || scriptContent.includes('querySelector')) {
        const matches = scriptContent.match(/getElementById\(['"]([^'"]+)['"]\)|querySelector\(['"]([^'"]+)['"]\)/g);
        if (matches) {
          matches.forEach(match => {
            const idMatch = match.match(/['"]([^'"]+)['"]/);
            if (idMatch) {
              const elementId = idMatch[1];
              const element = $(`#${elementId}`);
              if (element.length === 0 && !elementId.includes('cookie') && !elementId.includes('Cookie')) {
                result.warnings.push(`Script references missing element: ${elementId}`);
              }
            }
          });
        }
      }
    });

    // ============================================
    // FIX 4: Fix Broken Image Sources
    // ============================================
    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      
      // Fix relative URLs that might break
      if (src.startsWith('//')) {
        $(el).attr('src', 'https:' + src);
        result.fixes.push(`Fixed protocol-relative image URL: ${src}`);
        result.fixed = true;
      }
      
      // Remove broken image references
      if (src.includes('undefined') || src.includes('null')) {
        $(el).attr('src', 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E');
        result.fixes.push(`Replaced broken image with placeholder`);
        result.fixed = true;
      }
    });

    // ============================================
    // FIX 5: Fix Broken Links
    // ============================================
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      
      // Fix empty hrefs
      if (href === '' || href === '#') {
        $(el).attr('href', 'javascript:void(0)');
        result.fixes.push('Fixed empty link');
        result.fixed = true;
      }
      
      // Fix protocol-relative URLs
      if (href.startsWith('//')) {
        $(el).attr('href', 'https:' + href);
        result.fixes.push(`Fixed protocol-relative link: ${href}`);
        result.fixed = true;
      }
    });

    // ============================================
    // FIX 6: Remove Broken Event Listeners
    // ============================================
    $('[onclick], [onerror], [onload]').each((i, el) => {
      const onclick = $(el).attr('onclick') || '';
      
      // Remove broken onclick handlers
      if (onclick.includes('undefined') || onclick.includes('null')) {
        $(el).removeAttr('onclick');
        result.fixes.push('Removed broken onclick handler');
        result.fixed = true;
      }
    });

    // ============================================
    // FIX 7: Ensure Proper HTML Structure
    // ============================================
    if (!$('html').length) {
      fixedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${fixedHtml}</body></html>`;
      result.fixes.push('Added missing HTML structure');
      result.fixed = true;
    }

    if (!$('head').length && $('html').length) {
      $('html').prepend('<head><meta charset="UTF-8"></head>');
      result.fixes.push('Added missing head tag');
      result.fixed = true;
    }

    if (!$('body').length && $('html').length) {
      $('html').append('<body></body>');
      const bodyContent = $('html').contents().not('head').not('script[src]').not('link[rel="stylesheet"]');
      $('body').append(bodyContent);
      result.fixes.push('Added missing body tag');
      result.fixed = true;
    }

    // ============================================
    // FIX 8: Remove Tracking Scripts That Might Break
    // ============================================
    $('script').each((i, el) => {
      const scriptSrc = $(el).attr('src') || '';
      const scriptContent = $(el).html() || '';
      
      // Remove broken analytics scripts
      if (
        scriptSrc.includes('analytics') && 
        (scriptSrc.includes('undefined') || scriptSrc.includes('null'))
      ) {
        $(el).remove();
        result.fixes.push('Removed broken analytics script');
        result.fixed = true;
      }
      
      // Remove scripts that reference non-existent APIs
      if (
        scriptContent.includes('gtag') && 
        !scriptContent.includes('function gtag') &&
        !scriptContent.includes('window.gtag')
      ) {
        result.warnings.push('Script uses gtag but gtag might not be defined');
      }
    });

    // ============================================
    // FIX 9: Inject CSS to Hide Any Remaining Cookie Elements
    // ============================================
    const hideCookieCSS = `
<style id="auto-fix-hide-cookies">
  /* Hide any remaining cookie consent elements */
  [id*="cookie"], [class*="cookie"], [id*="Cookie"], [class*="Cookie"],
  [id*="onetrust"], [class*="onetrust"], [id*="OneTrust"], [class*="OneTrust"],
  [id*="optanon"], [class*="optanon"], [id*="Optanon"], [class*="Optanon"],
  .gdpr-banner, #gdpr-banner, .cookie-notice, #cookie-notice {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    position: absolute !important;
    left: -9999px !important;
  }
</style>
`;
    
    // Inject CSS into head
    if ($('head').length > 0) {
      $('head').append(hideCookieCSS);
      result.fixes.push('Injected CSS to hide any remaining cookie elements');
      result.fixed = true;
    } else {
      // No head tag, add it
      fixedHtml = `<head>${hideCookieCSS}</head>` + fixedHtml;
      result.fixes.push('Added head tag with cookie-hiding CSS');
      result.fixed = true;
    }

    // ============================================
    // FIX 10: Inject JavaScript to Prevent Cookie Pop-ups
    // ============================================
    const preventCookieJS = `
<script id="auto-fix-prevent-cookies">
  // Prevent any cookie consent pop-ups from appearing
  (function() {
    // Override common cookie consent functions BEFORE they load
    window.OptanonWrapper = function() {};
    window.OneTrust = null;
    window.Optanon = null;
    window.otBannerSdk = null;
    
    // Prevent OneTrust from loading
    Object.defineProperty(window, 'OneTrust', {
      get: function() { return null; },
      set: function() { return null; },
      configurable: false
    });
    
    Object.defineProperty(window, 'OptanonWrapper', {
      get: function() { return function() {}; },
      set: function() { return function() {}; },
      configurable: false
    });
    
    // Remove any cookie elements that might be created dynamically
    setInterval(function() {
      const cookieElements = document.querySelectorAll(
        '[id*="cookie"], [class*="cookie"], [id*="Cookie"], [class*="Cookie"], ' +
        '[id*="onetrust"], [class*="onetrust"], [id*="OneTrust"], [class*="OneTrust"], ' +
        '[id*="optanon"], [class*="optanon"], [id*="Optanon"], [class*="Optanon"], ' +
        '[id*="ot-sdk"], [class*="ot-sdk"], [id*="ot-banner"], [class*="ot-banner"], ' +
        '#onetrust-consent-sdk, .onetrust-pc-sdk, #onetrust-banner-sdk, .ot-sdk-container'
      );
      cookieElements.forEach(function(el) {
        el.remove();
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    }, 50); // Check every 50ms for faster removal
    
    // Prevent localStorage from triggering cookie pop-ups
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key && (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('onetrust') || key.toLowerCase().includes('optanon'))) {
        return; // Don't set cookie-related localStorage
      }
      return originalSetItem.apply(this, arguments);
    };
    
    // Block OneTrust script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const el = originalCreateElement.call(document, tagName);
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = el.setAttribute;
        el.setAttribute = function(name, value) {
          if (name === 'src' && (value.includes('cookielaw.org') || value.includes('onetrust') || value.includes('optanon'))) {
            return; // Don't set src for cookie scripts
          }
          return originalSetAttribute.call(this, name, value);
        };
      }
      return el;
    };
  })();
</script>
`;
    
    // Inject JS before </body>
    if ($('body').length > 0) {
      $('body').append(preventCookieJS);
      result.fixes.push('Injected JavaScript to prevent cookie pop-ups');
      result.fixed = true;
    } else {
      // No body tag, append to end
      fixedHtml = fixedHtml + preventCookieJS;
      result.fixes.push('Added JavaScript to prevent cookie pop-ups');
      result.fixed = true;
    }

    // Get the fixed HTML
    fixedHtml = $.html();

  } catch (error) {
    result.errors.push(`Auto-fix error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { html: fixedHtml, result };
}

/**
 * Run comprehensive smoke test on template HTML
 */
export function smokeTestTemplate(html: string): {
  passed: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    const $ = cheerio.load(html);

    // Test 1: Check for cookie consent (should be removed)
    const cookieElements = $('[id*="cookie"], [class*="cookie"], [id*="Cookie"], [class*="Cookie"]').length;
    if (cookieElements > 0) {
      issues.push(`Cookie consent pop-ups still present (${cookieElements} elements)`);
    }

    // Test 2: Check for broken images
    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (!src || src === 'undefined' || src === 'null') {
        issues.push(`Broken image found (missing src)`);
      }
    });

    // Test 3: Check for broken links
    $('a[href="#"], a[href=""]').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href === '' || href === '#') {
        warnings.push(`Empty link found`);
      }
    });

    // Test 4: Check for missing dependencies (jQuery, Bootstrap)
    const hasJQuery = html.includes('jquery') || html.includes('jQuery');
    const hasBootstrap = html.includes('bootstrap') || html.includes('Bootstrap');
    
    if (!hasJQuery && html.includes('$(')) {
      warnings.push('Template uses jQuery but jQuery not found');
    }
    
    if (!hasBootstrap && html.includes('bootstrap')) {
      warnings.push('Template uses Bootstrap but Bootstrap not found');
    }

    // Test 5: Check for broken scripts
    $('script').each((i, el) => {
      const scriptContent = $(el).html() || '';
      if (scriptContent.includes('undefined') && scriptContent.includes('is not defined')) {
        issues.push('Script contains undefined variable errors');
      }
    });

    // Test 6: Check HTML structure
    if (!$('html').length) {
      issues.push('Missing HTML tag');
    }
    if (!$('head').length) {
      issues.push('Missing head tag');
    }
    if (!$('body').length) {
      issues.push('Missing body tag');
    }

  } catch (error) {
    issues.push(`Smoke test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}

