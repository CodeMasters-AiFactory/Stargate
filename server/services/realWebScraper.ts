/**
 * Real Web Scraper - Uses Puppeteer to ACTUALLY scrape websites
 * 
 * This fetches REAL code from any website:
 * - HTML structure
 * - CSS styles (computed)
 * - Colors, fonts, spacing
 * - Layout patterns
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface RealScrapedData {
  url: string;
  scrapedAt: string;
  
  // Raw HTML
  html: string;
  
  // Extracted CSS variables
  cssVariables: Record<string, string>;
  
  // Computed styles
  colors: {
    background: string;
    text: string;
    primary: string;
    all: string[];
  };
  
  fonts: {
    heading: string;
    body: string;
    all: string[];
  };
  
  // Layout info
  layout: {
    maxWidth: string;
    sections: string[];
    heroType: string;
  };
  
  // Meta
  meta: {
    title: string;
    description: string;
    ogImage: string;
  };
  
  // Performance
  loadTime: number;
}

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Scrape a website and extract design patterns
 */
export async function scrapeWebsite(url: string): Promise<RealScrapedData> {
  const startTime = Date.now();
  
  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to page
    await page.goto(normalizedUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // Extract data from page
    const data = await page.evaluate(() => {
      // Helper: Get computed style
      const getStyle = (el: Element, prop: string) => 
        window.getComputedStyle(el).getPropertyValue(prop);
      
      // Get all colors used on the page
      const getAllColors = (): string[] => {
        const colors = new Set<string>();
        document.querySelectorAll('*').forEach(el => {
          const bg = getStyle(el, 'background-color');
          const color = getStyle(el, 'color');
          if (bg && bg !== 'rgba(0, 0, 0, 0)') colors.add(bg);
          if (color) colors.add(color);
        });
        return Array.from(colors).slice(0, 20);
      };
      
      // Get all fonts used
      const getAllFonts = (): string[] => {
        const fonts = new Set<string>();
        document.querySelectorAll('*').forEach(el => {
          const font = getStyle(el, 'font-family');
          if (font) fonts.add(font.split(',')[0].trim().replace(/['"]/g, ''));
        });
        return Array.from(fonts).slice(0, 10);
      };
      
      // Get CSS variables from :root
      const getCSSVariables = (): Record<string, string> => {
        const vars: Record<string, string> = {};
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        
        // Common CSS variable names
        const varNames = [
          '--primary', '--secondary', '--accent', '--background', '--foreground',
          '--text', '--muted', '--border', '--radius', '--font-sans', '--font-mono',
          '--color-primary', '--color-secondary', '--color-background',
        ];
        
        varNames.forEach(name => {
          const value = styles.getPropertyValue(name).trim();
          if (value) vars[name] = value;
        });
        
        return vars;
      };
      
      // Detect hero type
      const detectHeroType = (): string => {
        const hero = document.querySelector('section, header, [class*="hero"], [class*="banner"]');
        if (!hero) return 'unknown';
        
        const hasVideo = hero.querySelector('video') !== null;
        const hasImage = hero.querySelector('img') !== null;
        const text = hero.textContent || '';
        const style = getStyle(hero, 'display');
        
        if (hasVideo) return 'video';
        if (style === 'grid') return 'split';
        if (style === 'flex') {
          const justify = getStyle(hero, 'justify-content');
          if (justify === 'center') return 'centered';
          return 'split';
        }
        return 'fullscreen';
      };
      
      // Get section types
      const getSections = (): string[] => {
        const sections: string[] = [];
        document.querySelectorAll('section, [class*="section"]').forEach(el => {
          const className = el.className || '';
          const id = el.id || '';
          const text = (className + ' ' + id).toLowerCase();
          
          if (text.includes('hero') || text.includes('banner')) sections.push('hero');
          else if (text.includes('feature')) sections.push('features');
          else if (text.includes('about')) sections.push('about');
          else if (text.includes('testimonial') || text.includes('review')) sections.push('testimonials');
          else if (text.includes('pricing') || text.includes('plan')) sections.push('pricing');
          else if (text.includes('contact')) sections.push('contact');
          else if (text.includes('faq')) sections.push('faq');
          else if (text.includes('cta') || text.includes('call')) sections.push('cta');
          else if (text.includes('footer')) sections.push('footer');
          else sections.push('section');
        });
        return [...new Set(sections)];
      };
      
      // Get body styles
      const body = document.body;
      const h1 = document.querySelector('h1');
      
      return {
        html: document.documentElement.outerHTML.substring(0, 50000), // First 50KB
        cssVariables: getCSSVariables(),
        colors: {
          background: getStyle(body, 'background-color'),
          text: getStyle(body, 'color'),
          primary: '', // Will be detected from buttons/links
          all: getAllColors(),
        },
        fonts: {
          heading: h1 ? getStyle(h1, 'font-family').split(',')[0].trim().replace(/['"]/g, '') : '',
          body: getStyle(body, 'font-family').split(',')[0].trim().replace(/['"]/g, ''),
          all: getAllFonts(),
        },
        layout: {
          maxWidth: getStyle(document.querySelector('main, .container, .wrapper') || body, 'max-width'),
          sections: getSections(),
          heroType: detectHeroType(),
        },
        meta: {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
        },
      };
    });
    
    // Detect primary color from buttons/links
    const primaryColor = await page.evaluate(() => {
      const btn = document.querySelector('button, .btn, [class*="button"], a[class*="cta"]');
      if (btn) {
        const bg = window.getComputedStyle(btn).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
      }
      // Fallback: find most common non-gray color
      return '';
    });
    
    if (primaryColor) {
      data.colors.primary = primaryColor;
    }
    
    const loadTime = Date.now() - startTime;
    
    await page.close();
    
    return {
      url: normalizedUrl,
      scrapedAt: new Date().toISOString(),
      ...data,
      loadTime,
    };
    
  } catch (error) {
    await page.close();
    console.error('[Real Scraper] Error scraping', url, ':', error);
    throw error;
  }
}

/**
 * Scrape multiple websites
 */
export async function scrapeMultiple(urls: string[]): Promise<RealScrapedData[]> {
  const results: RealScrapedData[] = [];
  
  for (const url of urls) {
    try {
      console.log(`[Real Scraper] Scraping ${url}...`);
      const data = await scrapeWebsite(url);
      results.push(data);
      // Small delay between requests to be polite
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`[Real Scraper] Failed to scrape ${url}`);
    }
  }
  
  return results;
}

/**
 * Extract design system from scraped data
 */
export function extractDesignSystem(data: RealScrapedData): {
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: string[];
  css: string;
} {
  // Convert RGB to HEX
  const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };
  
  const colors = {
    primary: rgbToHex(data.colors.primary || data.colors.all[0] || '#3B82F6'),
    background: rgbToHex(data.colors.background),
    text: rgbToHex(data.colors.text),
  };
  
  const typography = {
    heading: data.fonts.heading || 'Inter',
    body: data.fonts.body || 'Inter',
  };
  
  // Generate CSS from extracted data
  const css = `
/* Extracted from ${data.url} */
:root {
  --primary: ${colors.primary};
  --background: ${colors.background};
  --text: ${colors.text};
  --font-heading: "${typography.heading}", system-ui, sans-serif;
  --font-body: "${typography.body}", system-ui, sans-serif;
  --max-width: ${data.layout.maxWidth || '1200px'};
}

body {
  font-family: var(--font-body);
  background-color: var(--background);
  color: var(--text);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
}
`;
  
  return {
    colors,
    typography,
    spacing: ['120px', '80px', '40px', '24px', '16px'],
    css,
  };
}

/**
 * Compare multiple scraped sites and find common patterns
 */
export function findCommonPatterns(sites: RealScrapedData[]): {
  commonSections: string[];
  commonFonts: string[];
  commonColors: string[];
  recommendations: string[];
} {
  // Find sections that appear in most sites
  const sectionCounts: Record<string, number> = {};
  sites.forEach(site => {
    site.layout.sections.forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
  });
  
  const commonSections = Object.entries(sectionCounts)
    .filter(([, count]) => count >= sites.length / 2)
    .map(([section]) => section);
  
  // Find common fonts
  const fontCounts: Record<string, number> = {};
  sites.forEach(site => {
    site.fonts.all.forEach(font => {
      fontCounts[font] = (fontCounts[font] || 0) + 1;
    });
  });
  
  const commonFonts = Object.entries(fontCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([font]) => font);
  
  return {
    commonSections,
    commonFonts,
    commonColors: [],
    recommendations: [
      `Include these sections: ${commonSections.join(', ')}`,
      `Consider fonts: ${commonFonts.join(', ')}`,
      'Match the layout patterns of top sites in this industry',
    ],
  };
}

console.log('[Real Web Scraper] 🕷️ Puppeteer scraper ready');

