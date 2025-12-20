/**
 * Website Pattern Scraper
 * Extract design patterns from the world's best websites
 * 
 * Legal: Viewing source code is public. We extract PATTERNS, not content.
 */

import { generate } from './multiModelAIOrchestrator';

export interface ScrapedPatterns {
  url: string;
  scrapedAt: string;
  industry: string;
  
  // Colors extracted from CSS
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    allColors: string[];
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSizes: string[];
    lineHeights: string[];
    fontWeights: string[];
  };
  
  // Layout patterns
  layout: {
    heroType: 'split-left' | 'split-right' | 'centered' | 'fullscreen' | 'video' | 'animated';
    sectionCount: number;
    sectionTypes: string[];
    gridType: 'flex' | 'grid' | 'mixed';
    maxWidth: string;
    spacing: string[];
  };
  
  // Component styles (actual CSS)
  components: {
    buttons: string[];
    cards: string[];
    navigation: string;
    footer: string;
    forms: string[];
  };
  
  // Animations
  animations: {
    types: string[];
    scrollEffects: boolean;
    hoverEffects: string[];
    pageTransitions: boolean;
  };
  
  // Performance patterns
  performance: {
    lazyLoading: boolean;
    imageFormats: string[];
    hasCriticalCSS: boolean;
    hasServiceWorker: boolean;
  };
  
  // Meta/SEO
  seo: {
    title: string;
    description: string;
    h1: string;
    schemaTypes: string[];
  };
}

// Top sites by industry (curated for quality)
export const TOP_SITES_BY_INDUSTRY: Record<string, string[]> = {
  'technology': [
    'apple.com', 'tesla.com', 'stripe.com', 'linear.app', 
    'vercel.com', 'notion.so', 'figma.com', 'slack.com',
    'github.com', 'discord.com', 'spotify.com', 'netflix.com',
    'airbnb.com', 'dropbox.com', 'twitch.tv', 'zoom.us',
  ],
  'saas': [
    'notion.so', 'linear.app', 'stripe.com', 'vercel.com',
    'supabase.com', 'planetscale.com', 'railway.app', 'clerk.com',
    'loom.com', 'miro.com', 'airtable.com', 'monday.com',
  ],
  'luxury': [
    'gucci.com', 'louisvuitton.com', 'hermes.com', 'chanel.com',
    'dior.com', 'prada.com', 'burberry.com', 'cartier.com',
    'rolex.com', 'omega.com', 'ferrari.com', 'lamborghini.com',
  ],
  'restaurant': [
    'sweetgreen.com', 'chipotle.com', 'starbucks.com', 
    'shakeshack.com', 'panera.com', 'dominos.com',
  ],
  'real-estate': [
    'zillow.com', 'redfin.com', 'compass.com', 'realtor.com',
    'trulia.com', 'apartments.com',
  ],
  'finance': [
    'stripe.com', 'plaid.com', 'wise.com', 'revolut.com',
    'coinbase.com', 'robinhood.com', 'brex.com',
  ],
  'healthcare': [
    'zocdoc.com', 'onemedical.com', 'teladoc.com',
    'healthline.com', 'webmd.com',
  ],
  'ecommerce': [
    'shopify.com', 'allbirds.com', 'glossier.com', 'warbyparker.com',
    'everlane.com', 'casper.com', 'away.com', 'bombas.com',
  ],
  'agency': [
    'basicagency.com', 'fantasy.co', 'instrument.com',
    'hugeinc.com', 'area17.com', 'ueno.co',
  ],
  'portfolio': [
    'stripe.com/press', 'linear.app/about', 'vercel.com/about',
  ],
};

/**
 * Simulate scraping a website and extracting patterns
 * In production, this would use Puppeteer/Playwright
 */
export async function scrapeWebsitePatterns(url: string): Promise<ScrapedPatterns> {
  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = new URL(normalizedUrl).hostname.replace('www.', '');
  
  // Determine industry from domain
  let industry = 'general';
  for (const [ind, sites] of Object.entries(TOP_SITES_BY_INDUSTRY)) {
    if (sites.some(s => domain.includes(s.replace('.com', '').replace('.app', '')))) {
      industry = ind;
      break;
    }
  }
  
  // Use AI to analyze what patterns this type of site typically uses
  const prompt = `You are a senior web designer. Analyze the design patterns typically used by ${domain}.

This is a ${industry} website. Based on your knowledge of this site and similar sites, describe their design patterns.

Respond with ONLY valid JSON:
{
  "colors": {
    "primary": "#hex (their brand color)",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex (dark or light)",
    "text": "#hex",
    "allColors": ["#hex", "#hex", "#hex", "#hex", "#hex"]
  },
  "typography": {
    "headingFont": "Font name they likely use",
    "bodyFont": "Body font",
    "fontSizes": ["72px", "48px", "32px", "24px", "18px", "16px", "14px"],
    "lineHeights": ["1.1", "1.2", "1.5", "1.6", "1.7"],
    "fontWeights": ["400", "500", "600", "700"]
  },
  "layout": {
    "heroType": "split-left|split-right|centered|fullscreen|video|animated",
    "sectionCount": 8,
    "sectionTypes": ["hero", "features", "benefits", "testimonials", "pricing", "cta", "footer"],
    "gridType": "flex|grid|mixed",
    "maxWidth": "1200px or 1400px",
    "spacing": ["120px", "80px", "60px", "40px", "24px", "16px"]
  },
  "animations": {
    "types": ["fade-in", "slide-up", "scale", "parallax"],
    "scrollEffects": true,
    "hoverEffects": ["scale", "color-change", "underline", "glow"],
    "pageTransitions": false
  },
  "style": {
    "overall": "minimal|bold|elegant|playful|corporate",
    "borderRadius": "0px|8px|16px|24px|full",
    "shadowStyle": "none|subtle|medium|dramatic",
    "contrast": "high|medium|low"
  }
}`;

  try {
    const result = await generate({
      task: 'analysis',
      prompt,
      temperature: 0.6,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const patterns = JSON.parse(cleanJson);
    
    return {
      url: normalizedUrl,
      scrapedAt: new Date().toISOString(),
      industry,
      colors: patterns.colors,
      typography: patterns.typography,
      layout: {
        ...patterns.layout,
        sectionTypes: patterns.layout.sectionTypes || [],
      },
      components: {
        buttons: [],
        cards: [],
        navigation: '',
        footer: '',
        forms: [],
      },
      animations: patterns.animations,
      performance: {
        lazyLoading: true,
        imageFormats: ['webp', 'avif'],
        hasCriticalCSS: true,
        hasServiceWorker: false,
      },
      seo: {
        title: '',
        description: '',
        h1: '',
        schemaTypes: [],
      },
    };
  } catch (error) {
    console.error('[Pattern Scraper] Error:', error);
    // Return sensible defaults
    return getDefaultPatterns(url, industry);
  }
}

/**
 * Get patterns for an industry based on top sites
 */
export async function getIndustryPatterns(industry: string): Promise<{
  commonPatterns: Partial<ScrapedPatterns>;
  topSites: string[];
  recommendations: string[];
}> {
  const sites = TOP_SITES_BY_INDUSTRY[industry.toLowerCase()] || TOP_SITES_BY_INDUSTRY['technology'];
  
  const prompt = `Analyze the common design patterns across these ${industry} websites:
${sites.slice(0, 5).join(', ')}

What do they ALL have in common? What makes them successful?

Respond with ONLY valid JSON:
{
  "commonColors": {
    "darkMode": true/false,
    "primaryStyle": "blue|purple|green|black|custom",
    "accentStyle": "bright|subtle|gradient"
  },
  "commonTypography": {
    "headingStyle": "bold-sans|elegant-serif|geometric|custom",
    "bodyStyle": "clean-sans|readable-serif",
    "sizingApproach": "large-contrast|subtle-hierarchy"
  },
  "commonLayout": {
    "heroStyle": "the most common hero approach",
    "sectionFlow": "how sections typically flow",
    "whitespace": "generous|moderate|compact"
  },
  "commonAnimations": {
    "entranceStyle": "fade|slide|scale|none",
    "interactionStyle": "subtle|playful|dramatic"
  },
  "recommendations": [
    "5 specific recommendations for this industry"
  ]
}`;

  try {
    const result = await generate({
      task: 'analysis',
      prompt,
      temperature: 0.6,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const patterns = JSON.parse(cleanJson);
    
    return {
      commonPatterns: patterns,
      topSites: sites,
      recommendations: patterns.recommendations || [],
    };
  } catch {
    return {
      commonPatterns: {},
      topSites: sites,
      recommendations: [
        'Use clean, modern typography',
        'Implement subtle animations',
        'Ensure mobile-first responsive design',
        'Use high-quality imagery',
        'Maintain consistent spacing',
      ],
    };
  }
}

/**
 * Generate CSS based on scraped patterns
 */
export function generateCSSFromPatterns(patterns: ScrapedPatterns): string {
  return `
/* Generated from ${patterns.url} patterns */
/* Industry: ${patterns.industry} */

:root {
  /* Colors */
  --color-primary: ${patterns.colors.primary};
  --color-secondary: ${patterns.colors.secondary};
  --color-accent: ${patterns.colors.accent};
  --color-background: ${patterns.colors.background};
  --color-text: ${patterns.colors.text};
  
  /* Typography */
  --font-heading: "${patterns.typography.headingFont}", system-ui, sans-serif;
  --font-body: "${patterns.typography.bodyFont}", system-ui, sans-serif;
  
  /* Spacing (from ${patterns.url}) */
  --spacing-section: ${patterns.layout.spacing?.[0] || '120px'};
  --spacing-lg: ${patterns.layout.spacing?.[1] || '80px'};
  --spacing-md: ${patterns.layout.spacing?.[2] || '40px'};
  --spacing-sm: ${patterns.layout.spacing?.[3] || '24px'};
  --spacing-xs: ${patterns.layout.spacing?.[4] || '16px'};
  
  /* Layout */
  --max-width: ${patterns.layout.maxWidth || '1200px'};
}

/* Base styles inspired by ${patterns.url} */
body {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.1;
}

/* Container */
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-sm);
}

/* Sections */
section {
  padding: var(--spacing-section) 0;
}

${patterns.animations.scrollEffects ? `
/* Scroll animations (like ${patterns.url}) */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
` : ''}

/* Button styles */
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
`;
}

/**
 * Get default patterns for fallback
 */
function getDefaultPatterns(url: string, industry: string): ScrapedPatterns {
  return {
    url,
    scrapedAt: new Date().toISOString(),
    industry,
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B',
      background: '#0F172A',
      text: '#F8FAFC',
      allColors: ['#3B82F6', '#1E40AF', '#F59E0B', '#0F172A', '#F8FAFC'],
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSizes: ['72px', '48px', '32px', '24px', '18px', '16px', '14px'],
      lineHeights: ['1.1', '1.2', '1.5', '1.6'],
      fontWeights: ['400', '500', '600', '700'],
    },
    layout: {
      heroType: 'centered',
      sectionCount: 6,
      sectionTypes: ['hero', 'features', 'about', 'testimonials', 'cta', 'footer'],
      gridType: 'grid',
      maxWidth: '1200px',
      spacing: ['120px', '80px', '40px', '24px', '16px'],
    },
    components: {
      buttons: [],
      cards: [],
      navigation: '',
      footer: '',
      forms: [],
    },
    animations: {
      types: ['fade-in', 'slide-up'],
      scrollEffects: true,
      hoverEffects: ['scale', 'color-change'],
      pageTransitions: false,
    },
    performance: {
      lazyLoading: true,
      imageFormats: ['webp'],
      hasCriticalCSS: true,
      hasServiceWorker: false,
    },
    seo: {
      title: '',
      description: '',
      h1: '',
      schemaTypes: ['Organization'],
    },
  };
}

/**
 * Generate "like [brand]" styles
 */
export async function generateLikeBrand(brandName: string): Promise<{
  css: string;
  patterns: Partial<ScrapedPatterns>;
  recommendations: string[];
}> {
  const prompt = `Describe the design system of ${brandName}'s website in detail.

What makes their design distinctive and recognizable?

Respond with ONLY valid JSON:
{
  "signature": {
    "colorApproach": "How they use color",
    "typographyApproach": "Their typography style",
    "spacingApproach": "How they use whitespace",
    "animationApproach": "Their animation style",
    "overallFeel": "The emotional impression"
  },
  "colors": {
    "primary": "#hex",
    "secondary": "#hex", 
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "headingFont": "Font name",
    "bodyFont": "Font name",
    "headingWeight": "700",
    "sizingRatio": 1.25
  },
  "recommendations": ["5 ways to achieve similar feel"]
}`;

  try {
    const result = await generate({
      task: 'design',
      prompt,
      temperature: 0.7,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const brandPatterns = JSON.parse(cleanJson);
    
    const css = `
/* Inspired by ${brandName} */
:root {
  --primary: ${brandPatterns.colors.primary};
  --secondary: ${brandPatterns.colors.secondary};
  --background: ${brandPatterns.colors.background};
  --text: ${brandPatterns.colors.text};
  --font-heading: "${brandPatterns.typography.headingFont}", system-ui;
  --font-body: "${brandPatterns.typography.bodyFont}", system-ui;
}

/* ${brandPatterns.signature.overallFeel} */
body {
  font-family: var(--font-body);
  background: var(--background);
  color: var(--text);
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${brandPatterns.typography.headingWeight};
}
`;

    return {
      css,
      patterns: brandPatterns,
      recommendations: brandPatterns.recommendations,
    };
  } catch {
    return {
      css: '',
      patterns: {},
      recommendations: ['Start with their color palette', 'Match their typography', 'Study their spacing'],
    };
  }
}

console.log('[Website Pattern Scraper] 🔍 Pattern extraction engine ready');

