/**
 * Final Product - Ultimate Website Editor
 * Full screen preview with AI chat sidebar and click-to-edit functionality
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// Removed unused imports - chat sidebar removed
import { useToast } from '@/hooks/use-toast';
import { 
    ArrowLeft,
    CheckCircle2,
    Download,
    Eye,
  Maximize2,
  Minimize2,
  RefreshCw,
    Save,
    Sparkles
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  industry?: string;
  htmlContent?: string;
  content?: { html?: string; css?: string };
}

// Chat removed - admin doesn't need chat sidebar

export function FinalProduct() {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateLoadError, setTemplateLoadError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [crawlStatus, setCrawlStatus] = useState<{
    status: 'idle' | 'running' | 'completed' | 'error';
    pagesScraped: number;
    totalPages: number;
    currentUrl?: string;
    templateName?: string;
  } | null>(null);

  // Fetch verified templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Poll crawl status for Template 1 - CHECK EVERY 2 SECONDS
  useEffect(() => {
    if (templates.length === 0) return;
    
    const template1 = templates[0];
    if (!template1) return;
    
    const checkCrawlStatus = async () => {
      try {
        const res = await fetch(`/api/admin/scraper/crawl-status/${template1.id}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status) {
            setCrawlStatus({
              status: data.status.status,
              pagesScraped: data.status.pagesScraped,
              totalPages: data.status.totalPages,
              currentUrl: data.status.currentUrl,
              templateName: data.status.templateName,
            });
          }
        }
      } catch (error) {
        // Silent fail - status endpoint might not be available
      }
    };
    
    // Check immediately
    checkCrawlStatus();
    
    // Poll every 2 seconds
    const interval = setInterval(checkCrawlStatus, 2000);
    
    return () => clearInterval(interval);
  }, [templates]);

  // Note: Auto-load removed - users should click a template to preview it
  // This prevents the Back button from re-triggering fullscreen mode

  // Listen for messages from iframe (external links, internal navigation, test results)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from same origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'external-link') {
        toast({
          title: 'External Link',
          description: `Opening ${event.data.href} in new tab`,
          duration: 3000,
        });
      } else if (event.data?.type === 'internal-navigation') {
        // Handle internal navigation - load page from database
        if (selectedTemplate) {
          handleInternalNavigation(event.data.href, selectedTemplate.id);
        } else {
          toast({
            title: 'Navigation Error',
            description: 'No template selected',
            variant: 'destructive',
          });
        }
      } else if (event.data?.type === 'form-submission') {
        toast({
          title: 'Form Submission',
          description: `Form would submit to ${event.data.action}`,
          duration: 3000,
        });
      } else if (event.data?.type === 'external-link-blocked') {
        toast({
          title: 'External Link Blocked',
          description: event.data.message || `External links are disabled in preview mode. Staying within scraped content.`,
          variant: 'default',
          duration: 4000,
        });
        console.log('[FinalProduct] External link blocked:', event.data.href);
      } else if (event.data?.type === 'button-test-results') {
        const results = event.data.results;
        const passRate = results.tested > 0 ? ((results.passed / results.tested) * 100).toFixed(1) : 0;

        toast({
          title: `Button Test Complete: ${results.passed}/${results.tested} Passed (${passRate}%)`,
          description: `Total: ${results.total} | Tested: ${results.tested} | Failed: ${results.failed}`,
          duration: 5000,
        });

        // Log detailed results
        console.log('[ButtonTest] Results:', results);
        if (results.failed > 0) {
          console.warn('[ButtonTest] Failed buttons:', results.details.filter(d => d.status === 'FAILED' || d.status === 'ERROR'));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  // Chat removed - admin doesn't need chat sidebar

  // Cookie removal script to inject into iframe
  const getCookieRemovalScript = () => {
    return `
(function() {
  // Override BEFORE anything loads - use try/catch to avoid redefinition errors
  try {
    window.OptanonWrapper = function() {};
  } catch(e) {}

  try {
    window.OneTrust = null;
  } catch(e) {}

  try {
    window.Optanon = null;
  } catch(e) {}

  try {
    window.Onetrust = null;
  } catch(e) {}

  try {
    window.otBannerSdk = null;
  } catch(e) {}

  // Prevent OneTrust from loading - only define if not already defined
  if (!window.hasOwnProperty('OneTrust')) {
    try {
      Object.defineProperty(window, 'OneTrust', {
        get: function() { return null; },
        set: function() { return null; },
        configurable: true
      });
    } catch(e) {}
  }

  if (!window.hasOwnProperty('OptanonWrapper')) {
    try {
      Object.defineProperty(window, 'OptanonWrapper', {
        get: function() { return function() {}; },
        set: function() { return function() {}; },
        configurable: true
      });
    } catch(e) {}
  }

  // Remove cookie elements continuously
  function removeCookieElements() {
    const selectors = [
      '[id*="cookie"], [class*="cookie"], [id*="Cookie"], [class*="Cookie"]',
      '[id*="onetrust"], [class*="onetrust"], [id*="OneTrust"], [class*="OneTrust"]',
      '[id*="optanon"], [class*="optanon"], [id*="Optanon"], [class*="Optanon"]',
      '[id*="ot-sdk"], [class*="ot-sdk"], [id*="ot-banner"], [class*="ot-banner"]',
      '#onetrust-consent-sdk, .onetrust-pc-sdk, #onetrust-banner-sdk, .ot-sdk-container'
    ];

    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.remove();
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        });
      } catch(e) {}
    });
  }

  // Run immediately and continuously
  removeCookieElements();
  setInterval(removeCookieElements, 50);

  // Use MutationObserver to catch dynamically created elements
  const observer = new MutationObserver(function(mutations) {
    removeCookieElements();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });

  // Block cookie script creation
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
`;
  };

  // Link interception script to handle navigation within iframe
  const getLinkInterceptionScript = () => {
    return `
(function() {
  console.log('[LinkInterceptor] ✅ Script loaded and running');

  // Expose test function for debugging
  window.testButtonClick = function(selector) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('[LinkInterceptor] Testing click on:', selector, element);
      element.click();
    } else {
      console.warn('[LinkInterceptor] Element not found:', selector);
    }
  };

  // Expose function to list all buttons
  window.listAllButtons = function() {
    const buttons = Array.from(document.querySelectorAll('button, a[href], [onclick]'));
    console.log('[LinkInterceptor] Found buttons/links:', buttons.length);
    buttons.forEach((btn, idx) => {
      console.log(\`[\${idx}] \${btn.tagName} - \${btn.textContent?.substring(0, 50)} - href=\${btn.href || 'none'} - onclick=\${btn.onclick ? 'yes' : 'none'}\`);
    });
    return buttons;
  };
  // Helper function to check if link is external
  function isExternalLink(href) {
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    try {
      const url = new URL(href, window.location.href);
      return url.origin !== window.location.origin;
    } catch(e) {
      // Relative URL or invalid URL
      return false;
    }
  }

  // Helper function to handle hash navigation
  function handleHashNavigation(href) {
    const hash = href.substring(1);
    const target = document.getElementById(hash) || document.querySelector('[name="' + hash + '"]');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Helper function to handle internal navigation
  function handleInternalNavigation(href) {
    // Notify parent window to handle internal navigation
    window.parent.postMessage({
      type: 'internal-navigation',
      href: href,
      currentUrl: window.location.href
    }, '*');
  }

  // Helper function to handle form submission
  function handleFormSubmission(form) {
    const action = form.getAttribute('action') || window.location.href;
    const method = (form.getAttribute('method') || 'get').toLowerCase();

    if (isExternalLink(action)) {
      // BLOCK external form submissions
      console.log('[LinkInterceptor] ❌ BLOCKED External form submission:', action);
      window.parent.postMessage({
        type: 'external-link-blocked',
        href: action,
        message: 'External form submissions are disabled in preview mode.'
      }, '*');
    } else {
      // Internal form - notify parent
      window.parent.postMessage({
        type: 'form-submission',
        action: action,
        method: method,
        formData: new FormData(form).toString()
      }, '*');
    }
  }

  // Intercept all link clicks
  document.addEventListener('click', function(e) {
    console.log('[LinkInterceptor] Click detected on:', e.target);

    // Find the closest link element
    let link = e.target;
    while (link && link.tagName !== 'A') {
      link = link.parentElement;
    }

    // Also check if clicked element is a button
    const button = e.target.closest('button');
    if (button && !link) {
      console.log('[LinkInterceptor] Button clicked:', button);
      // Check if button has onclick or data-href
      const onclick = button.getAttribute('onclick');
      const dataHref = button.getAttribute('data-href');
      const buttonType = button.getAttribute('type');

      // If button has onclick that navigates, handle it
        if (onclick && (onclick.includes('window.location') || onclick.includes('location.href') || onclick.includes('location.replace'))) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[LinkInterceptor] Button onclick intercepted:', onclick);
        // Try to extract URL and handle it
        const urlMatch = onclick.match(/(?:window\\.location|location\\.href|location\\.replace)\\s*[=:]\\s*['"]([^'"]+)['"]/);
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1];
          console.log('[LinkInterceptor] Extracted URL from button:', url);
          if (isExternalLink(url)) {
            // BLOCK external navigation
            console.log('[LinkInterceptor] ❌ BLOCKED External onclick navigation:', url);
            window.parent.postMessage({
              type: 'external-link-blocked',
              href: url,
              message: 'External navigation is disabled in preview mode.'
            }, '*');
          } else {
            handleInternalNavigation(url);
          }
        }
        return;
      }
      
      // If button has data-href, treat it as a link
      if (dataHref) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[LinkInterceptor] Button data-href clicked:', dataHref);
        if (isExternalLink(dataHref)) {
          // BLOCK external links
          console.log('[LinkInterceptor] ❌ BLOCKED External button link:', dataHref);
          window.parent.postMessage({
            type: 'external-link-blocked',
            href: dataHref,
            message: 'External links are disabled in preview mode.'
          }, '*');
        } else {
          handleInternalNavigation(dataHref);
        }
        return;
      }

      // If button is type="submit" in a form, let form handler deal with it
      if (buttonType === 'submit') {
        return; // Let form handler deal with it
      }
    }

    if (!link || !link.href) {
      console.log('[LinkInterceptor] No link found, allowing default behavior');
      return;
    }

    const href = link.getAttribute('href');
    if (!href) {
      console.log('[LinkInterceptor] Link has no href');
      return;
    }

    console.log('[LinkInterceptor] Link clicked:', href);

    // Skip if link has target="_blank" - let it open normally
    if (link.getAttribute('target') === '_blank') {
      console.log('[LinkInterceptor] Link has target="_blank", allowing normal behavior');
      return; // Allow normal behavior
    }

    // Prevent default navigation
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    console.log('[LinkInterceptor] Preventing default navigation, handling:', href);

    // Handle different link types
    if (href.startsWith('#')) {
      // Hash link - scroll within iframe
      console.log('[LinkInterceptor] Hash link, scrolling');
      handleHashNavigation(href);
    } else if (href.startsWith('javascript:')) {
      // JavaScript link - execute it
      console.log('[LinkInterceptor] JavaScript link, executing');
      try {
        const script = href.substring(11);
        eval(script);
      } catch(err) {
        console.warn('[LinkInterceptor] Failed to execute JavaScript link:', err);
      }
    } else if (isExternalLink(href)) {
      // BLOCK ALL EXTERNAL LINKS - Don't navigate to actual websites
      console.log('[LinkInterceptor] ❌ BLOCKED External link (staying in preview):', href);
      // Show message to user that link is blocked
      window.parent.postMessage({
        type: 'external-link-blocked',
        href: href,
        message: 'External links are disabled in preview mode. All navigation stays within scraped content.'
      }, '*');
      // DO NOT navigate - stay in preview
    } else {
      // Internal link - update iframe content
      console.log('[LinkInterceptor] Internal link, handling navigation:', href);
      handleInternalNavigation(href);
    }
  }, true); // Use capture phase to intercept early

  // Intercept form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    // Prevent default submission
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Handle form submission
    handleFormSubmission(form);
  }, true); // Use capture phase

  // Intercept ALL button clicks (comprehensive handler)
  document.addEventListener('click', function(e) {
    const button = e.target.closest('button');
    if (!button) return;

    console.log('[LinkInterceptor] Button clicked:', button, button.textContent);

    // Check if button is inside a link - if so, let link handler deal with it
    const parentLink = button.closest('a');
    if (parentLink) {
      console.log('[LinkInterceptor] Button is inside a link, letting link handler deal with it');
      return; // Let link handler deal with it
    }

    // Check if button has onclick that navigates
    const onclick = button.getAttribute('onclick');
    if (onclick && (onclick.includes('window.location') || onclick.includes('location.href') || onclick.includes('location.replace'))) {
      // Prevent navigation
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      console.log('[LinkInterceptor] Button onclick intercepted:', onclick);

      // Try to extract URL and handle it
      const urlMatch = onclick.match(/(?:window\\.location|location\\.href|location\\.replace)\\s*[=:]\\s*['"]([^'"]+)['"]/);
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1];
        console.log('[LinkInterceptor] Extracted URL from button onclick:', url);
        if (isExternalLink(url)) {
          // BLOCK external navigation
          console.log('[LinkInterceptor] ❌ BLOCKED External onclick navigation:', url);
          window.parent.postMessage({
            type: 'external-link-blocked',
            href: url,
            message: 'External navigation is disabled in preview mode.'
          }, '*');
        } else {
          handleInternalNavigation(url);
        }
      }
      return;
    }

    // Check if button has data-href attribute
    const dataHref = button.getAttribute('data-href');
    if (dataHref) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('[LinkInterceptor] Button data-href clicked:', dataHref);
      if (isExternalLink(dataHref)) {
        // BLOCK external navigation
        console.log('[LinkInterceptor] ❌ BLOCKED External button link:', dataHref);
        window.parent.postMessage({
          type: 'external-link-blocked',
          href: dataHref,
          message: 'External links are disabled in preview mode.'
        }, '*');
      } else {
        handleInternalNavigation(dataHref);
      }
      return;
    }

    // Check if button has type="submit" - let form handler deal with it
    if (button.getAttribute('type') === 'submit') {
      console.log('[LinkInterceptor] Submit button, letting form handler deal with it');
      return; // Let form handler deal with it
    }

    // For other buttons, check if they have any navigation-related classes or attributes
    // Some buttons might trigger navigation via JavaScript that we can't intercept
    // In this case, we'll just log it
    console.log('[LinkInterceptor] Button clicked but no navigation detected, allowing default behavior');
  }, true);

  // Override window.location methods to prevent navigation (if possible)
  try {
    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;

    // Override assign
    if (originalAssign) {
      window.location.assign = function(url) {
        if (isExternalLink(url)) {
          // BLOCK external navigation
          console.log('[LinkInterceptor] ❌ BLOCKED window.location.assign to external URL:', url);
          window.parent.postMessage({
            type: 'external-link-blocked',
            href: url,
            message: 'External navigation is disabled in preview mode.'
          }, '*');
        } else {
          handleInternalNavigation(url);
        }
      };
    }

    // Override replace
    if (originalReplace) {
      window.location.replace = function(url) {
        if (isExternalLink(url)) {
          // BLOCK external navigation
          console.log('[LinkInterceptor] ❌ BLOCKED window.location.replace to external URL:', url);
          window.parent.postMessage({
            type: 'external-link-blocked',
            href: url,
            message: 'External navigation is disabled in preview mode.'
          }, '*');
        } else {
          handleInternalNavigation(url);
        }
      };
    }
  } catch(e) {
    // Can't override location methods, that's okay - link interception will still work
    console.warn('Could not override window.location methods:', e);
  }

  // Override window.location.href setter
  try {
    const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location') || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'location');
    if (locationDescriptor && locationDescriptor.set) {
      const originalSetter = locationDescriptor.set;
      Object.defineProperty(window, 'location', {
        set: function(url) {
          console.log('[LinkInterceptor] window.location.href set to:', url);
          if (isExternalLink(url)) {
            // BLOCK external navigation
            console.log('[LinkInterceptor] ❌ BLOCKED window.location.href set to external URL:', url);
            window.parent.postMessage({
              type: 'external-link-blocked',
              href: url,
              message: 'External navigation is disabled in preview mode.'
            }, '*');
          } else {
            originalSetter.call(window, url);
          }
        },
        get: locationDescriptor.get,
        configurable: true
      });
    }
  } catch(e) {
    console.warn('Could not override window.location.href setter:', e);
  }
})();
`;
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // CRITICAL: Only load templates that passed QA verification
      // QA verification runs AFTER Fine-Tuning and ensures ALL checks pass
      const res = await fetch('/api/admin/templates/qa/verified-list', { credentials: 'include' });
      const data = await res.json();

      if (data.success && data.templates?.length > 0) {
        // Double-check: Only include templates that actually passed QA
        const qaPassedTemplates = data.templates.filter((t: any) => {
          // Check if template has passed all QA checks
          return t.contentRewritten && t.imagesRegenerated && t.seoEvaluated && t.hasHtml !== false;
        });

        if (qaPassedTemplates.length > 0) {
          setTemplates(qaPassedTemplates);
          toast({ 
          title: 'Success',
          description: `Loaded ${qaPassedTemplates.length} QA-verified templates ready for Final Product`,
        });
          return;
        }
      }

      // If no QA-passed templates, show warning
      toast({
        title: '⚠️ No QA-Verified Templates',
        description: `No templates have passed QA verification. Go to the QA tab to verify templates.`,
        variant: 'destructive',
        duration: 10000,
      });

      setTemplates([]);
      // Warning already shown via toast
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load templates. Check server connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runQAVerification = async () => {
    try {
      toast({
        title: 'QA Verification Started',
        description: 'Running comprehensive QA verification on all templates...',
      });

      const res = await fetch('/api/admin/templates/qa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateIds: [] }), // Empty array = all templates
      });

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress) {
                const { total, completed, passed, failed, current } = data.progress;
                if (data.progress.status === 'completed') {
                  toast({
                    title: 'QA Verification Complete',
                    description: `${passed} templates passed, ${failed} failed. Refreshing template list...`,
                  });
                  await fetchTemplates();
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('QA Verification failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to run QA verification',
        variant: 'destructive',
      });
    }
  };

  // Handle internal navigation - load page from database
  const handleInternalNavigation = async (href: string, templateId: string) => {
    try {
      if (!selectedTemplate) return;
      
      // Extract path from href
      let path = '/';
      try {
        const url = new URL(href, window.location.origin);
        path = url.pathname || '/';
      } catch (e) {
        // Relative URL
        if (href.startsWith('/')) {
          path = href.split('#')[0]; // Remove hash
        } else if (href.startsWith('./') || !href.startsWith('http')) {
          // Relative path
          path = '/' + href.split('#')[0];
        }
      }
      
      // Normalize path
      if (path === '') path = '/';
      
      console.log(`[FinalProduct] Loading page: ${path} for template ${templateId}`);
      
      // Fetch page from database
      const res = await fetch(`/api/admin/templates/${templateId}/page/${encodeURIComponent(path)}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`Page not found: ${path}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.page) {
        let htmlContent = data.page.htmlContent;
        
        // Inject scripts
        const cookieRemovalScript = `<script id="cookie-killer" type="text/javascript">${getCookieRemovalScript()}</script>`;
        const linkInterceptionScript = `<script id="link-interceptor" type="text/javascript">${getLinkInterceptionScript()}</script>`;
        
        if (htmlContent.includes('<head>')) {
          htmlContent = htmlContent.replace('<head>', `<head>${cookieRemovalScript}${linkInterceptionScript}`);
        } else if (htmlContent.includes('<html>')) {
          htmlContent = htmlContent.replace('<html>', `<html><head>${cookieRemovalScript}${linkInterceptionScript}</head>`);
        } else {
          htmlContent = `<head>${cookieRemovalScript}${linkInterceptionScript}</head>${htmlContent}`;
        }
        
        // Update iframe content
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.srcdoc = htmlContent;
          setIframeLoaded(false); // Trigger reload
        }
        
        toast({
          title: 'Page Loaded',
          description: `Loaded ${path}`,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[FinalProduct] Failed to load page:', error);
      toast({
        title: 'Navigation Error',
        description: error instanceof Error ? error.message : 'Failed to load page',
        variant: 'destructive',
      });
    }
  };

  const loadTemplate = async (template: Template) => {
    try {
      setLoadingTemplate(true);
      setTemplateLoadError(null);
      setIframeLoaded(false);

      // Step 1: Load template details
      const res = await fetch(`/api/admin/templates/qa/details/${template.id}`, { credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        // HTML is returned in data.template.htmlContent (not data.htmlContent)
        let htmlContent = data.template?.htmlContent || data.htmlContent || data.content?.html;

        if (!htmlContent || htmlContent.trim() === '') {
          throw new Error('Template HTML content is empty');
        }

        // Step 2: Auto-fix and smoke test (CRITICAL - ensures 100% working template)
        const fixRes = await fetch('/api/admin/templates/auto-fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ html: htmlContent }),
        });

        if (fixRes.ok) {
          const fixData = await fixRes.json();
          if (fixData.success) {
            htmlContent = fixData.fixedHtml;

            // Log fixes applied
            if (fixData.result.fixes.length > 0) {
              console.log(`[AutoFix] ✅ Applied ${fixData.result.fixes.length} fixes:`, fixData.result.fixes);
              toast({
                title: 'Auto-Fixed Template',
                description: `Applied ${fixData.result.fixes.length} automatic fixes`,
                duration: 3000,
              });
            }

            // Log warnings
            if (fixData.result.warnings.length > 0) {
              console.warn(`[AutoFix] ⚠️ Warnings:`, fixData.result.warnings);
            }

            // If there are errors, still use the fixed HTML but log them
            if (fixData.result.errors.length > 0) {
              console.error(`[AutoFix] ❌ Errors:`, fixData.result.errors);
              toast({
                title: 'Auto-Fix Errors',
                description: `Some issues couldn't be auto-fixed: ${fixData.result.errors.join(', ')}`,
                variant: 'destructive',
                duration: 5000,
              });
            }
          }
        }

        // Step 3: Inject cookie removal script at the VERY START of <head>
        const cookieRemovalScript = `<script id="cookie-killer" type="text/javascript">${getCookieRemovalScript()}</script>`;

        // Step 4: Inject link interception script for navigation handling
        const linkInterceptionScript = `<script id="link-interceptor" type="text/javascript">${getLinkInterceptionScript()}</script>`;

        // Inject both scripts at start of head tag
        if (htmlContent.includes('<head>')) {
          htmlContent = htmlContent.replace('<head>', `<head>${cookieRemovalScript}${linkInterceptionScript}`);
        } else if (htmlContent.includes('<html>')) {
          htmlContent = htmlContent.replace('<html>', `<html><head>${cookieRemovalScript}${linkInterceptionScript}</head>`);
        } else {
          // No head tag, prepend it
          htmlContent = `<head>${cookieRemovalScript}${linkInterceptionScript}</head>${htmlContent}`;
        }

        setSelectedTemplate({
          ...template,
          htmlContent,
        });

        // Enter fullscreen mode automatically
        setIsFullscreen(true);
        
        // Add welcome message
        toast({
          title: 'Template Loaded & Verified',
          description: `"${template.name}" is ready for editing - All issues auto-fixed`,
        });
      } else {
        throw new Error(data.error || 'Failed to load template');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load template';
      setTemplateLoadError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setSelectedTemplate(null);
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setTemplateLoadError(null);

    // Inject scripts into iframe after load (backup injection - scripts already in HTML)
    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      const iframeDocument = iframeRef.current?.contentDocument;

      if (iframeWindow && iframeDocument) {
        // Check if scripts already exist
        const hasCookieScript = iframeDocument.getElementById('cookie-killer') || iframeDocument.getElementById('cookie-killer-postload');
        const hasLinkScript = iframeDocument.getElementById('link-interceptor');

        // Inject cookie removal script if not present
        if (!hasCookieScript) {
          const cookieScript = iframeDocument.createElement('script');
          cookieScript.id = 'cookie-killer-postload';
          cookieScript.textContent = getCookieRemovalScript();
          iframeDocument.head.insertBefore(cookieScript, iframeDocument.head.firstChild);
        }

        // Inject link interception script if not present
        if (!hasLinkScript) {
          const linkScript = iframeDocument.createElement('script');
          linkScript.id = 'link-interceptor';
          linkScript.textContent = getLinkInterceptionScript();
          iframeDocument.head.appendChild(linkScript);
        }

        // Also use MutationObserver to catch dynamically created elements
        const observerScript = iframeDocument.createElement('script');
        observerScript.textContent = `
          (function() {
            const observer = new MutationObserver(function(mutations) {
              const cookieSelectors = [
                '[id*="cookie"], [class*="cookie"]',
                '[id*="onetrust"], [class*="onetrust"]',
                '[id*="optanon"], [class*="optanon"]',
                '#onetrust-consent-sdk, .onetrust-pc-sdk'
              ];
              cookieSelectors.forEach(selector => {
                try {
                  document.querySelectorAll(selector).forEach(el => el.remove());
                } catch(e) {}
              });
            });
            if (document.body) {
              observer.observe(document.body, { childList: true, subtree: true });
            } else {
              document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
              });
            }
          })();
        `;
        iframeDocument.head.appendChild(observerScript);

        // Inject link interception script if not present
        if (!hasLinkScript) {
          const linkScript = iframeDocument.createElement('script');
          linkScript.id = 'link-interceptor';
          linkScript.textContent = getLinkInterceptionScript();
          iframeDocument.head.appendChild(linkScript);
        }

        console.log('[FinalProduct] ✅ Injected cookie removal and link interception scripts into iframe');

        // AUTO-RUN BUTTON TEST after 2 seconds (give scripts time to load)
        setTimeout(() => {
          testAllButtons();
        }, 2000);
      }
    } catch (e) {
      console.error('[FinalProduct] ⚠️ Failed to inject cookie removal script:', e);
    }
  };

  // Test all buttons and links in iframe
  const testAllButtons = () => {
    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      const iframeDocument = iframeRef.current?.contentDocument;

      if (!iframeWindow || !iframeDocument) {
        toast({
          title: 'Error',
          description: 'Iframe not loaded. Please wait for template to load.',
          variant: 'destructive',
        });
        return;
      }

      // Execute test script in iframe - improved version
      const testScript = `
        (function() {
          const results = {
            total: 0,
            tested: 0,
            passed: 0,
            failed: 0,
            details: []
          };

          console.log('[ButtonTest] 🚀 Starting comprehensive button test...');

          // Find all clickable elements
          const elements = Array.from(document.querySelectorAll('a[href], button, [onclick], [data-href], input[type="submit"], input[type="button"]'));
          results.total = elements.length;

          console.log('[ButtonTest] Found ' + elements.length + ' clickable elements');

          let processed = 0;

          elements.forEach((el, idx) => {
    setTimeout(() => {
              try {
                const tagName = el.tagName.toLowerCase();
                const text = el.textContent?.trim().substring(0, 50) || '';
                const href = el.href || el.getAttribute('href') || '';
                const onclick = el.getAttribute('onclick') || '';
                const dataHref = el.getAttribute('data-href') || '';

                // Skip hidden elements
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                  processed++;
                  if (processed === elements.length) {
                    sendResults();
                  }
                  return;
                }

                // Skip disabled buttons
                if (el.disabled || el.getAttribute('aria-disabled') === 'true') {
                  processed++;
                  if (processed === elements.length) {
                    sendResults();
                  }
                  return;
                }

                results.tested++;

                // Create a test click event
                let intercepted = false;
                const testHandler = function(e) {
                  intercepted = true;
                  console.log('[ButtonTest] ✅ Click intercepted for:', text || href || tagName);
                };

                // Add listener in capture phase (before our interceptor)
                el.addEventListener('click', testHandler, { once: true, capture: false });

                // Create and dispatch click event
                const clickEvent = new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window
                });

                el.dispatchEvent(clickEvent);

                // Check result after a short delay
                setTimeout(() => {
                  if (intercepted) {
                    results.passed++;
                    results.details.push({
                      index: idx,
                      tag: tagName,
                      text: text,
                      href: href,
                      status: 'PASSED',
                      message: 'Click intercepted successfully'
                    });
      } else {
                    results.failed++;
                    results.details.push({
                      index: idx,
                      tag: tagName,
                      text: text,
                      href: href,
                      status: 'FAILED',
                      message: 'Click not intercepted - may navigate away'
                    });
                    console.warn('[ButtonTest] ❌ Click NOT intercepted for:', text || href || tagName);
                  }

                  processed++;
                  if (processed === elements.length) {
                    sendResults();
                  }
                }, 50);

              } catch(err) {
                results.failed++;
                results.details.push({
                  index: idx,
                  tag: el.tagName.toLowerCase(),
                  text: el.textContent?.trim().substring(0, 50) || '',
                  status: 'ERROR',
                  message: err.message
                });
                console.error('[ButtonTest] Error testing element:', err);

                processed++;
                if (processed === elements.length) {
                  sendResults();
                }
              }
            }, idx * 10); // Stagger clicks slightly
          });

          function sendResults() {
            console.log('[ButtonTest] 📊 Test complete:', results);
            window.parent.postMessage({
              type: 'button-test-results',
              results: results
            }, '*');
          }

          // If no elements, send results immediately
          if (elements.length === 0) {
            sendResults();
          }
        })();
      `;

      // Execute script in iframe
      try {
        iframeWindow.eval(testScript);
      } catch (err) {
        console.error('[FinalProduct] Failed to execute test script:', err);
        toast({
          title: 'Test Error',
          description: 'Failed to execute test: ' + (err instanceof Error ? err.message : 'Unknown error'),
          variant: 'destructive',
        });
      }

      toast({
        title: 'Testing Started',
        description: 'Testing all buttons and links in template...',
        duration: 2000,
      });

    } catch (error) {
      console.error('Failed to test buttons:', error);
      toast({
        title: 'Error',
        description: 'Failed to test buttons: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const handleIframeError = () => {
    setIframeLoaded(false);
    setTemplateLoadError('Failed to render template preview');
  };

  // Handle back button click - explicitly prevent event propagation
  const handleBackClick = (e: React.MouseEvent) => {
      e.preventDefault();
    e.stopPropagation();
    console.log('[FinalProduct] Back button clicked - exiting fullscreen');
    setIsFullscreen(false);
    setSelectedTemplate(null);
  };

  // Handle test buttons click
  const handleTestButtonsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    testAllButtons();
  };

  // Fullscreen overlay content - rendered via portal to escape parent container
  const fullscreenOverlay = isFullscreen && selectedTemplate ? (
    <div 
      className="fixed inset-0 z-[99999] bg-gray-900"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}
    >
      {/* Floating Back Button - Higher z-index and pointer events */}
                <Button
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-[100001] bg-gray-800 hover:bg-gray-700 text-white shadow-xl border-2 border-white/50"
        size="lg"
        style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 100001, pointerEvents: 'auto' }}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Final Product
                </Button>

      {/* Test All Buttons Button */}
      {iframeLoaded && (
                <Button
          onClick={handleTestButtonsClick}
          className="fixed top-4 right-4 z-[100001] bg-green-600 hover:bg-green-700 text-white shadow-xl"
          size="lg"
          style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100001, pointerEvents: 'auto' }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Test All Buttons
                </Button>
      )}

      {/* Fullscreen Iframe Container */}
      <div className="absolute inset-0 bg-white" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Loading Overlay */}
        {(loadingTemplate || !iframeLoaded) && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
              <div className="text-center">
                <p className="text-gray-700 font-medium text-lg">Loading website...</p>
                          </div>
                      </div>
                </div>
              )}
              
        {/* Fullscreen Iframe */}
        {selectedTemplate.htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={selectedTemplate.htmlContent}
            className="w-full h-full border-0"
            title="Website Preview"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
                  )}
                </div>
                </div>
  ) : null;

  return (
    <>
      {/* Fullscreen Preview Mode - Rendered via Portal to document.body */}
      {fullscreenOverlay && createPortal(fullscreenOverlay, document.body)}

      {/* Normal View (Template List) */}
      {!isFullscreen && (
        <div className="h-[70vh] min-h-[500px] flex rounded-lg overflow-hidden border border-cyan-500/30 bg-gray-950">
          {/* Main Content - Full Width (No Chat Sidebar for Admin) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        {/* Toolbar */}
        <div className="h-12 bg-gray-900 border-b border-cyan-500/30 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            {selectedTemplate ? (
              <>
                <Badge className="bg-green-600">{selectedTemplate.name}</Badge>
                <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                  {selectedTemplate.industry || 'Unknown Industry'}
                </Badge>
              </>
            ) : (
              <span className="text-gray-400">Select a template to preview</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-300">
              <Eye className="w-4 h-4 mr-1" /> Preview
            </Button>
            <Button size="sm" variant="outline" className="border-green-500/30 text-green-300">
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                if (selectedTemplate) {
                  setIsFullscreen(!isFullscreen);
                }
              }}
              className="text-cyan-400"
              disabled={!selectedTemplate}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Preview Area - Template Selection or Website Preview */}
        <div className="flex-1 min-h-0 bg-gradient-to-br from-gray-900 via-blue-950/30 to-gray-900 overflow-y-auto">
          {/* Template Selection View (when no template selected) */}
          {!selectedTemplate && (
            <div className="p-4 space-y-4">
              {/* Status Bar - Always visible */}
              <div className="bg-cyan-900/50 border-2 border-cyan-500 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                <p className="text-cyan-400 font-bold text-xl" role="status">
                    🎯 Final Product Editor - {loading ? '⏳ Loading...' : `✅ ${templates.length} verified templates ready`}
                </p>
              </div>
              
                {/* Crawl Progress Indicator - VISIBLE ON PAGE */}
                {crawlStatus && crawlStatus.status === 'running' && (
                  <div className="mt-4 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-green-300 font-bold text-lg">
                        🚀 CRAWLING ENTIRE WEBSITE: {crawlStatus.templateName || 'Template 1'}
                      </p>
                      <p className="text-green-400 text-sm font-mono">
                        {crawlStatus.pagesScraped} / {crawlStatus.totalPages} pages
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (crawlStatus.pagesScraped / Math.max(1, crawlStatus.totalPages)) * 100)}%` }}
                      />
                    </div>
                    {crawlStatus.currentUrl && (
                      <p className="text-green-400 text-xs truncate">
                        Currently scraping: {crawlStatus.currentUrl}
                      </p>
                    )}
                    <p className="text-green-300 text-xs mt-2">
                      ⏳ This will take time - watching progress...
                    </p>
                  </div>
                )}
                
                {crawlStatus && crawlStatus.status === 'completed' && (
                  <div className="mt-4 p-4 bg-green-900/50 border-2 border-green-500 rounded-lg">
                    <p className="text-green-300 font-bold text-lg">
                      ✅ CRAWL COMPLETE! {crawlStatus.pagesScraped} pages scraped
                    </p>
                    <p className="text-green-400 text-sm mt-1">
                      🎯 Template 1 is now an EXACT CLONE of the entire website!
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  {!loading && (
                    <div className="flex gap-2">
                      <Button
                        onClick={runQAVerification}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        title="Run comprehensive QA verification on all templates"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Run QA Verification
                      </Button>
                      {templates.length > 0 && (
                        <Button
                          onClick={async () => {
                            try {
                              // Set status to running immediately for visual feedback
                              if (templates.length > 0) {
                                setCrawlStatus({
                                  status: 'running',
                                  pagesScraped: 0,
                                  totalPages: 1000,
                                  templateName: templates[0].name,
                                });
                              }
                              
                              const res = await fetch('/api/admin/scraper/crawl-template1', {
                                method: 'POST',
                                credentials: 'include',
                              });
                              const data = await res.json();
                              if (data.success) {
                                toast({
                                  title: '✅ Multi-Page Crawl Started',
                                  description: `Crawling ${data.templateName} from ${data.sourceUrl}. Watch the progress bar below!`,
                                  duration: 10000,
                                });
                              } else {
                                throw new Error(data.error || 'Failed to start crawl');
                              }
                            } catch (error) {
                              setCrawlStatus(null);
                              toast({
                                title: '❌ Crawl Failed',
                                description: error instanceof Error ? error.message : 'Failed to start multi-page crawl',
                                variant: 'destructive',
                              });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          title="Scrape ALL pages of Template 1 (not just homepage)"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Crawl Template 1 (All Pages)
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {!loading && templates.length === 0 && (
                  <p className="text-yellow-300 text-sm mt-2">
                    ⚠️ No verified templates found. Click "Run QA Verification" to process templates through the QA pipeline.
                  </p>
                )}
                {!loading && templates.length > 0 && (
                  <p className="text-cyan-300 text-sm mt-2">
                    💡 Click "Run QA Verification" to re-verify all templates and ensure they meet all QA requirements.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-300 flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Select a Template to Edit
              </h2>

                {/* Category Filter Dropdown */}
                {!loading && templates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-cyan-400">Filter by Category:</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48 bg-gray-800 border-cyan-500/30 text-cyan-300">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Array.from(new Set(templates.map(t => t.industry).filter(Boolean)))
                          .sort()
                          .map((category) => (
                            <SelectItem key={category} value={category || ''}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-800/30 rounded-lg border border-cyan-500/20">
                  <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                  <p className="mt-4 text-cyan-300 font-medium">Loading Templates...</p>
                </div>
              )}
              
              {/* Empty State */}
              {!loading && templates.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-800/30 rounded-lg border border-yellow-500/20">
                  <RefreshCw className="w-12 h-12 text-yellow-400/50 mb-4" />
                  <p className="text-yellow-300 font-medium">No templates found</p>
                  <Button onClick={fetchTemplates} className="mt-4 bg-cyan-600 hover:bg-cyan-700">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                </div>
              )}
              
              {/* Template List - Compact List Format */}
              {!loading && templates.length > 0 && (() => {
                // Filter by category
                const filteredTemplates = templates.filter(t =>
                  selectedCategory === 'all' || t.industry === selectedCategory
                );

                return (
                  <div className="space-y-2" role="list" aria-label="Available templates">
                    {filteredTemplates
                      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order
                      .map((template) => (
                        <Card
                      key={template.id}
                          className="p-2 border border-green-500/50 bg-green-900/10 hover:border-green-400 hover:bg-green-900/20 cursor-pointer transition-all"
                      onDoubleClick={() => loadTemplate(template)}
                      onClick={() => loadTemplate(template)}
                      role="listitem"
                          tabIndex={0}
                          aria-label={`Template: ${template.name}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Icon and Name */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                              <h3 className="text-sm font-semibold text-cyan-300 truncate">{template.name}</h3>
                              {template.industry && (
                                <Badge variant="outline" className="text-xs border-cyan-400/50 text-cyan-400 shrink-0">
                                  {template.industry}
                                </Badge>
                              )}
                      </div>

                            {/* Right: Template Passed Badge */}
                            <div className="flex flex-col items-end shrink-0">
                              <Badge className="bg-green-600 text-white text-xs">
                                ✅ Template Passed
                              </Badge>
                            </div>
                          </div>
                        </Card>
                  ))}
                </div>
                );
              })()}
            </div>
          )}
          
          {/* Website Preview (when template selected) */}
          {selectedTemplate && (
            <div className="h-full w-full bg-white relative" style={{ minHeight: '500px' }}>
              {/* Loading Overlay with Progress Indicator */}
              {(loadingTemplate || !iframeLoaded) && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-medium text-lg">Loading website...</p>
                      {loadingTemplate && (
                        <p className="text-gray-500 text-sm mt-1">Fetching template content</p>
                      )}
                      {!loadingTemplate && !iframeLoaded && (
                        <p className="text-gray-500 text-sm mt-1">Rendering preview</p>
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{
                          width: loadingTemplate ? '60%' : iframeLoaded ? '100%' : '80%',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {templateLoadError && (
                <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-20">
                  <div className="text-center p-6">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-700 font-medium text-lg mb-2">Failed to load template</p>
                    <p className="text-red-600 text-sm mb-4">{templateLoadError}</p>
                    <Button
                      onClick={() => {
                        setTemplateLoadError(null);
                        setSelectedTemplate(null);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Go Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Iframe */}
              {selectedTemplate.htmlContent && (
              <iframe
                ref={iframeRef}
                  srcDoc={selectedTemplate.htmlContent}
                className="w-full h-full border-0"
                style={{ minHeight: '500px' }}
                title="Website Preview"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-scripts allow-same-origin allow-forms"
              />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
      )}
    </>
  );
}

