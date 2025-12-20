/**
 * Analytics Tracking Service
 * Generates tracking scripts for generated websites
 */

export interface TrackingConfig {
  websiteId: string;
  enablePageViews?: boolean;
  enableClicks?: boolean;
  enableConversions?: boolean;
  enableHeatmaps?: boolean;
  customEvents?: string[];
}

/**
 * Generate analytics tracking script for a website
 */
export function generateAnalyticsScript(config: TrackingConfig): string {
  const { websiteId, enablePageViews = true, enableClicks = true, enableConversions = true } = config;

  return `
<!-- Stargate Analytics Tracking Script -->
<script>
(function() {
  'use strict';
  
  const WEBSITE_ID = '${websiteId}';
  const API_ENDPOINT = '/api/analytics/track';
  
  // Track page view
  ${enablePageViews ? `
  function trackPageView() {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: WEBSITE_ID,
        eventType: 'pageview',
        path: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail if tracking is unavailable
    });
  }
  
  // Track initial page view
  trackPageView();
  
  // Track page views on navigation (for SPAs)
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(window.history, arguments);
      setTimeout(trackPageView, 0);
    };
    
    window.addEventListener('popstate', trackPageView);
  }
  ` : ''}
  
  // Track clicks
  ${enableClicks ? `
  document.addEventListener('click', function(e) {
    const target = e.target;
    const link = target.closest('a');
    const button = target.closest('button');
    
    if (link || button) {
      const element = link || button;
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          eventType: 'click',
          path: window.location.pathname,
          element: element.tagName.toLowerCase(),
          text: element.textContent?.trim().substring(0, 50),
          href: link ? link.href : null,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  });
  ` : ''}
  
  // Track conversions
  ${enableConversions ? `
  function trackConversion(eventName, metadata) {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteId: WEBSITE_ID,
        eventType: 'conversion',
        path: window.location.pathname,
        metadata: {
          event: eventName,
          ...metadata,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }
  
  // Auto-track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
      trackConversion('form_submit', {
        formId: form.id || 'unnamed',
        formAction: form.action,
      });
    }
  });
  
  // Auto-track purchases (if e-commerce)
  if (window.location.pathname.includes('/checkout/success')) {
    trackConversion('purchase', {
      orderId: new URLSearchParams(window.location.search).get('session_id'),
    });
  }
  
  // Expose trackConversion globally for custom events
  window.trackConversion = trackConversion;
  ` : ''}
  
  // Track scroll depth
  let maxScroll = 0;
  window.addEventListener('scroll', function() {
    const scrollPercent = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
      maxScroll = scrollPercent;
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          eventType: 'scroll',
          path: window.location.pathname,
          metadata: { depth: scrollPercent },
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  });
  
  // Track time on page
  let timeOnPage = 0;
  setInterval(function() {
    timeOnPage += 5;
    if (timeOnPage % 30 === 0) { // Every 30 seconds
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          eventType: 'time_on_page',
          path: window.location.pathname,
          metadata: { seconds: timeOnPage },
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  }, 5000);
  
  // Track exit intent (desktop only)
  document.addEventListener('mouseout', function(e) {
    if (!e.toElement && !e.relatedTarget && e.clientY < 10) {
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          eventType: 'exit_intent',
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  });
})();
</script>
<!-- End Stargate Analytics -->
  `.trim();
}

/**
 * Generate analytics dashboard link HTML
 */
export function generateAnalyticsDashboardLink(websiteId: string, dashboardUrl: string): string {
  return `
<!-- Analytics Dashboard Link (visible to site owner only) -->
<script>
(function() {
  if (window.location.search.includes('admin=true')) {
    const link = document.createElement('a');
    link.href = '${dashboardUrl}?websiteId=${websiteId}';
    link.textContent = 'View Analytics';
    link.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
    link.target = '_blank';
    document.body.appendChild(link);
  }
})();
</script>
  `.trim();
}

