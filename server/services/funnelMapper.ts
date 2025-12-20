/**
 * Funnel Mapper Service
 * Maps and optimizes conversion funnels
 */

export interface FunnelStage {
  name: string;
  page: string;
  action: string;
  dropOffRate?: number;
  optimization?: string[];
}

export interface ConversionFunnel {
  name: string;
  stages: FunnelStage[];
  conversionRate?: number;
  businessType?: string;
}

/**
 * Generate default funnels by business type
 */
export function generateDefaultFunnels(businessType: string): ConversionFunnel[] {
  const funnels: ConversionFunnel[] = [];

  // Service-based business funnel
  if (businessType.toLowerCase().includes('service') || 
      businessType.toLowerCase().includes('consulting') ||
      businessType.toLowerCase().includes('agency')) {
    funnels.push({
      name: 'Service Inquiry Funnel',
      businessType: 'service',
      stages: [
        {
          name: 'Awareness',
          page: 'home',
          action: 'land',
          optimization: ['hero-cta', 'value-proposition', 'social-proof']
        },
        {
          name: 'Interest',
          page: 'services',
          action: 'view-services',
          optimization: ['service-details', 'benefits', 'pricing']
        },
        {
          name: 'Consideration',
          page: 'about',
          action: 'learn-more',
          optimization: ['trust-signals', 'testimonials', 'case-studies']
        },
        {
          name: 'Decision',
          page: 'contact',
          action: 'submit-inquiry',
          optimization: ['form-optimization', 'urgency', 'guarantee']
        },
        {
          name: 'Conversion',
          page: 'thank-you',
          action: 'complete',
          optimization: ['confirmation', 'next-steps', 'upsell']
        }
      ]
    });
  }

  // E-commerce funnel
  if (businessType.toLowerCase().includes('ecommerce') ||
      businessType.toLowerCase().includes('store') ||
      businessType.toLowerCase().includes('shop')) {
    funnels.push({
      name: 'E-commerce Purchase Funnel',
      businessType: 'ecommerce',
      stages: [
        {
          name: 'Discovery',
          page: 'home',
          action: 'browse',
          optimization: ['product-showcase', 'deals', 'reviews']
        },
        {
          name: 'Product View',
          page: 'products',
          action: 'view-product',
          optimization: ['product-images', 'specifications', 'reviews']
        },
        {
          name: 'Cart',
          page: 'cart',
          action: 'add-to-cart',
          optimization: ['cart-summary', 'shipping-info', 'trust-badges']
        },
        {
          name: 'Checkout',
          page: 'checkout',
          action: 'proceed-checkout',
          optimization: ['form-simplification', 'security', 'guarantee']
        },
        {
          name: 'Purchase',
          page: 'order-confirmation',
          action: 'complete-purchase',
          optimization: ['order-details', 'tracking', 'upsell']
        }
      ]
    });
  }

  // Lead generation funnel
  funnels.push({
    name: 'Lead Generation Funnel',
    businessType: 'lead-gen',
    stages: [
      {
        name: 'Landing',
        page: 'home',
        action: 'land',
        optimization: ['headline', 'benefits', 'cta']
      },
      {
        name: 'Engagement',
        page: 'home',
        action: 'scroll',
        optimization: ['content-value', 'social-proof', 'trust-signals']
      },
      {
        name: 'Interest',
        page: 'home',
        action: 'click-cta',
        optimization: ['cta-placement', 'urgency', 'value-proposition']
      },
      {
        name: 'Form Fill',
        page: 'contact',
        action: 'start-form',
        optimization: ['form-simplification', 'progress-indicator', 'benefits']
      },
      {
        name: 'Submission',
        page: 'contact',
        action: 'submit-form',
        optimization: ['validation', 'error-handling', 'success-message']
      }
    ]
  });

  return funnels;
}

/**
 * Generate funnel optimization recommendations
 */
export function generateFunnelOptimizations(funnel: ConversionFunnel): string[] {
  const optimizations: string[] = [];

  funnel.stages.forEach((stage, index) => {
    if (stage.dropOffRate && stage.dropOffRate > 0.3) {
      optimizations.push(
        `High drop-off at ${stage.name} stage (${(stage.dropOffRate * 100).toFixed(1)}%) - ${stage.optimization?.join(', ') || 'needs optimization'}`
      );
    }

    // Stage-specific recommendations
    if (index === 0) {
      optimizations.push('Optimize landing page: Clear value proposition, strong hero CTA, social proof');
    } else if (index === funnel.stages.length - 1) {
      optimizations.push('Optimize conversion page: Remove friction, add urgency, clear next steps');
    } else {
      optimizations.push(`Optimize ${stage.name}: Reduce friction, add trust signals, clear CTA`);
    }
  });

  return optimizations;
}

/**
 * Generate funnel tracking script
 */
export function generateFunnelTrackingScript(funnel: ConversionFunnel, websiteId: string): string {
  const stages = funnel.stages.map((stage, index) => ({
    name: stage.name,
    page: stage.page,
    action: stage.action,
    order: index + 1
  }));

  return `
<script>
(function() {
  const funnel = ${JSON.stringify(stages)};
  const websiteId = '${websiteId}';
  const funnelName = '${funnel.name}';
  
  // Track funnel progression
  function trackFunnelStage(stageName, action, metadata = {}) {
    const stage = funnel.find(s => s.name === stageName);
    if (!stage) return;
    
    if (window.trackConversion) {
      window.trackConversion('funnel_stage', {
        websiteId: websiteId,
        funnelName: funnelName,
        stageName: stageName,
        stageOrder: stage.order,
        action: action,
        ...metadata
      });
    }
  }
  
  // Track page views as funnel stages
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
  const currentStage = funnel.find(s => s.page === currentPage || s.page.includes(currentPage));
  
  if (currentStage) {
    trackFunnelStage(currentStage.name, 'page_view', {
      page: currentPage,
      timestamp: Date.now()
    });
  }
  
  // Track CTA clicks
  document.addEventListener('click', function(e) {
    const cta = e.target.closest('a[data-conversion-event], button[data-conversion-event]');
    if (cta) {
      const eventName = cta.getAttribute('data-conversion-event');
      const nextStage = funnel.find(s => s.action === eventName);
      
      if (nextStage) {
        trackFunnelStage(nextStage.name, eventName, {
          source: currentStage?.name || 'unknown',
          ctaText: cta.textContent.trim()
        });
      }
    }
  });
  
  // Track form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
      const submitStage = funnel.find(s => s.action.includes('submit') || s.action.includes('form'));
      if (submitStage) {
        trackFunnelStage(submitStage.name, 'form_submit', {
          formId: form.id || 'unknown',
          timestamp: Date.now()
        });
      }
    }
  });
})();
</script>
  `.trim();
}

/**
 * Generate funnel visualization HTML (for admin/analytics)
 */
export function generateFunnelVisualization(funnel: ConversionFunnel): string {
  const stagesHTML = funnel.stages.map((stage, index) => {
    const dropOffPercent = stage.dropOffRate 
      ? (stage.dropOffRate * 100).toFixed(1) 
      : 'N/A';
    
    return `
    <div class="funnel-stage" data-stage="${index}">
      <div class="funnel-stage-header">
        <h4>${stage.name}</h4>
        <span class="funnel-dropoff">${dropOffPercent}% drop-off</span>
      </div>
      <div class="funnel-stage-content">
        <p><strong>Page:</strong> ${stage.page}</p>
        <p><strong>Action:</strong> ${stage.action}</p>
        ${stage.optimization && stage.optimization.length > 0 ? `
        <div class="funnel-optimizations">
          <strong>Optimizations:</strong>
          <ul>
            ${stage.optimization.map(opt => `<li>${opt}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </div>
    `;
  }).join('\n    ');

  return `
<div class="funnel-visualization">
  <h3>${funnel.name}</h3>
  <div class="funnel-stages">
    ${stagesHTML}
  </div>
  ${funnel.conversionRate ? `
  <div class="funnel-summary">
    <p><strong>Overall Conversion Rate:</strong> ${(funnel.conversionRate * 100).toFixed(2)}%</p>
  </div>
  ` : ''}
</div>
  `.trim();
}

