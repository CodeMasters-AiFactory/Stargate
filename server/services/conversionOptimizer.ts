/**
 * Conversion Optimizer Service
 * Optimizes CTAs, copy, and conversion paths for maximum conversions
 */

export interface CTAVariation {
  text: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg' | 'xl';
  placement: 'above-fold' | 'mid-content' | 'below-content' | 'exit-intent';
  urgency?: boolean;
  scarcity?: boolean;
}

/**
 * Generate optimized CTA variations
 */
export function generateCTAVariations(
  baseText: string,
  context: 'hero' | 'content' | 'footer' | 'form'
): CTAVariation[] {
  const variations: CTAVariation[] = [];

  // Hero CTAs - bold and action-oriented
  if (context === 'hero') {
    variations.push({
      text: baseText || 'Get Started Today',
      style: 'primary',
      size: 'xl',
      placement: 'above-fold',
      urgency: true
    });
    variations.push({
      text: 'Start Your Free Trial',
      style: 'primary',
      size: 'lg',
      placement: 'above-fold'
    });
    variations.push({
      text: 'Join Thousands of Happy Customers',
      style: 'secondary',
      size: 'lg',
      placement: 'above-fold'
    });
  }

  // Content CTAs - contextual
  if (context === 'content') {
    variations.push({
      text: baseText || 'Learn More',
      style: 'primary',
      size: 'md',
      placement: 'mid-content'
    });
    variations.push({
      text: 'See How It Works',
      style: 'outline',
      size: 'md',
      placement: 'mid-content'
    });
    variations.push({
      text: 'Get Your Free Consultation',
      style: 'primary',
      size: 'lg',
      placement: 'below-content',
      urgency: true
    });
  }

  // Footer CTAs - less aggressive
  if (context === 'footer') {
    variations.push({
      text: 'Contact Us',
      style: 'secondary',
      size: 'md',
      placement: 'below-content'
    });
    variations.push({
      text: 'Schedule a Call',
      style: 'outline',
      size: 'md',
      placement: 'below-content'
    });
  }

  // Form CTAs - clear action
  if (context === 'form') {
    variations.push({
      text: 'Submit',
      style: 'primary',
      size: 'lg',
      placement: 'below-content'
    });
    variations.push({
      text: 'Send Message',
      style: 'primary',
      size: 'lg',
      placement: 'below-content'
    });
    variations.push({
      text: 'Get Started Now',
      style: 'primary',
      size: 'lg',
      placement: 'below-content',
      urgency: true
    });
  }

  return variations;
}

/**
 * Generate conversion-focused copy
 */
export function optimizeCopyForConversion(
  originalText: string,
  type: 'headline' | 'subheadline' | 'body' | 'cta'
): string {
  // Add urgency and emotional triggers
  if (type === 'headline') {
    return originalText.replace(
      /(today|now|free|start|get|join)/gi,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
    );
  }

  if (type === 'cta') {
    // Make CTAs more action-oriented
    const actionWords = ['Get', 'Start', 'Join', 'Discover', 'Try', 'Learn'];
    if (!actionWords.some(word => originalText.startsWith(word))) {
      return `Get ${originalText}`;
    }
    return originalText;
  }

  return originalText;
}

/**
 * Generate CTA HTML with optimization attributes
 */
export function generateOptimizedCTA(
  cta: CTAVariation,
  href: string = '#',
  onClick?: string
): string {
  const classes = [
    'btn',
    `btn-${cta.style}`,
    `btn-${cta.size}`,
    'cta-optimized'
  ];

  if (cta.urgency) {
    classes.push('cta-urgent');
  }

  if (cta.scarcity) {
    classes.push('cta-scarcity');
  }

  const dataAttributes = [
    `data-cta-placement="${cta.placement}"`,
    `data-cta-context="${cta.placement}"`
  ].join(' ');

  const onClickAttr = onClick ? `onclick="${onClick}"` : '';

  return `<a href="${href}" class="${classes.join(' ')}" ${dataAttributes} ${onClickAttr}>
  ${cta.text}
</a>`;
}

/**
 * Generate multiple CTA placements for A/B testing
 */
export function generateMultipleCTAs(
  primaryCTA: CTAVariation,
  secondaryCTA?: CTAVariation
): string {
  const ctas: string[] = [];

  // Primary CTA
  ctas.push(generateOptimizedCTA(primaryCTA));

  // Secondary CTA (if provided)
  if (secondaryCTA) {
    ctas.push(generateOptimizedCTA(secondaryCTA, '#', 'return false;'));
  }

  return `
<div class="cta-group" data-cta-variant="default">
  ${ctas.join('\n  ')}
</div>
  `.trim();
}

/**
 * Generate conversion tracking attributes
 */
export function addConversionTracking(element: string, eventName: string): string {
  return element.replace(
    /<a([^>]*?)>/i,
    `<a$1 data-conversion-event="${eventName}" data-track-conversion="true">`
  );
}

/**
 * Generate exit-intent popup CTA
 */
export function generateExitIntentCTA(cta: CTAVariation): string {
  return `
<div id="exit-intent-popup" class="exit-intent-popup" style="display: none;">
  <div class="exit-intent-content">
    <h3>Wait! Don't Miss Out</h3>
    <p>Get exclusive access to our best offers</p>
    ${generateOptimizedCTA(cta, '#contact', 'document.getElementById("exit-intent-popup").style.display="none";')}
    <button class="exit-intent-close" onclick="document.getElementById('exit-intent-popup').style.display='none'">×</button>
  </div>
</div>
  `.trim();
}

/**
 * Generate conversion-optimized CTA CSS
 */
export function generateCTACSS(): string {
  return `
/* Conversion-Optimized CTA Styles */
.cta-optimized {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.cta-optimized:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.cta-urgent {
  animation: pulse-urgent 2s infinite;
}

@keyframes pulse-urgent {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  50% {
    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.2);
  }
}

.cta-scarcity::after {
  content: 'Limited Time';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem 0;
}

/* Exit Intent Popup */
.exit-intent-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.exit-intent-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.exit-intent-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.exit-intent-close:hover {
  background: #f3f4f6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile CTA Optimization */
@media (max-width: 768px) {
  .cta-optimized {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    min-height: 48px; /* Touch target optimization */
  }
  
  .cta-group {
    flex-direction: column;
  }
  
  .exit-intent-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
  `.trim();
}

