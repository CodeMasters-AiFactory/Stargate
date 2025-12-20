/**
 * Core Web Vitals Optimization Service
 * Implements LCP, CLS, and INP optimizations
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export interface CoreWebVitalsMetrics {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  fid?: number;
  ttfb?: number;
}

/**
 * Generate Core Web Vitals tracking script
 */
export function generateCoreWebVitalsScript(websiteId: string, apiEndpoint: string = '/api/analytics/web-vitals'): string {
  return `
<!-- Core Web Vitals Tracking -->
<script type="module">
  import {onCLS, onFCP, onLCP, onTTFB, onINP} from 'https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.js?module';

  function sendToAnalytics(metric) {
    fetch('${apiEndpoint}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: '${websiteId}',
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        url: window.location.href,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Silently fail if analytics unavailable
    });
  }

  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
</script>
  `.trim();
}

/**
 * Generate LCP optimization hints
 */
export function generateLCPOptimizations(heroImageUrl?: string, fontUrl?: string): string {
  const hints: string[] = [];
  
  // Preload hero image (LCP element)
  if (heroImageUrl) {
    hints.push(`<link rel="preload" href="${heroImageUrl}" as="image" fetchpriority="high">`);
  }
  
  // Preload critical fonts
  if (fontUrl) {
    hints.push(`<link rel="preload" href="${fontUrl}" as="font" type="font/woff2" crossorigin>`);
  }
  
  return hints.join('\n  ');
}

/**
 * Generate CLS prevention attributes and styles
 */
export function generateCLSPrevention(): string {
  return `
<style id="cls-prevention">
  /* Prevent layout shift with aspect ratios */
  img {
    aspect-ratio: attr(width) / attr(height);
    max-width: 100%;
    height: auto;
  }
  
  /* Reserve space for dynamic content */
  .dynamic-content {
    min-height: 200px;
  }
  
  /* Font loading optimization */
  @font-face {
    font-display: swap;
  }
</style>
  `.trim();
}

/**
 * Generate INP optimization script
 */
export function generateINPOptimization(): string {
  return `
<script>
  // Debounce function for scroll/resize handlers
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function for frequent events
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Event delegation for better performance
  document.addEventListener('click', function(e) {
    // Use event delegation instead of individual listeners
    const target = e.target.closest('[data-action]');
    if (target) {
      const action = target.dataset.action;
      // Handle action
    }
  }, { passive: true });

  // Optimize scroll handlers
  const optimizedScroll = debounce(function() {
    // Scroll handling code
  }, 16); // ~60fps

  window.addEventListener('scroll', optimizedScroll, { passive: true });

  // Optimize resize handlers
  const optimizedResize = debounce(function() {
    // Resize handling code
  }, 250);

  window.addEventListener('resize', optimizedResize, { passive: true });
</script>
  `.trim();
}

/**
 * Add font-display: swap to all @font-face declarations
 */
export function optimizeFontLoading(css: string): string {
  // Add font-display: swap to font-face rules that don't have it
  return css.replace(
    /@font-face\s*\{([^}]*)\}/gi,
    (match, content) => {
      if (content.includes('font-display')) {
        return match; // Already has font-display
      }
      return `@font-face {${content}\n  font-display: swap;}`;
    }
  );
}

/**
 * Add aspect-ratio to images to prevent CLS
 */
export function addAspectRatioToImages(html: string): string {
  // This complements the imageOptimization service
  // Add aspect-ratio style to images that have width/height
  return html.replace(
    /<img([^>]*?)width=["'](\d+)["']([^>]*?)height=["'](\d+)["']([^>]*?)>/gi,
    (match, before, width, middle, height, after) => {
      if (match.includes('aspect-ratio')) {
        return match; // Already has aspect-ratio
      }
      const ratio = (parseInt(height) / parseInt(width) * 100).toFixed(2);
      return `<img${before}width="${width}"${middle}height="${height}" style="aspect-ratio: ${width}/${height};"${after}>`;
    }
  );
}

/**
 * Comprehensive Core Web Vitals optimization
 */
export function optimizeCoreWebVitals(
  html: string,
  options: {
    websiteId?: string;
    heroImageUrl?: string;
    fontUrl?: string;
    trackMetrics?: boolean;
  } = {}
): string {
  let optimized = html;
  const { websiteId, heroImageUrl, fontUrl, trackMetrics = true } = options;
  
  // Add LCP optimizations
  if (heroImageUrl || fontUrl) {
    const lcpHints = generateLCPOptimizations(heroImageUrl, fontUrl);
    optimized = optimized.replace('</head>', `  ${lcpHints}\n</head>`);
  }
  
  // Add CLS prevention
  const clsPrevention = generateCLSPrevention();
  optimized = optimized.replace('</head>', `  ${clsPrevention}\n</head>`);
  
  // Add INP optimization
  const inpOptimization = generateINPOptimization();
  optimized = optimized.replace('</body>', `  ${inpOptimization}\n</body>`);
  
  // Add aspect-ratio to images
  optimized = addAspectRatioToImages(optimized);
  
  // Add Core Web Vitals tracking
  if (trackMetrics && websiteId) {
    const cwvScript = generateCoreWebVitalsScript(websiteId);
    optimized = optimized.replace('</body>', `  ${cwvScript}\n</body>`);
  }
  
  return optimized;
}

