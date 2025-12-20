/**
 * Screenshot Evaluator v3.0
 * Captures and analyzes website screenshots at multiple viewport sizes
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface ScreenshotAnalysis {
  desktop: {
    path: string;
    width: number;
    height: number;
    dominantColors: string[];
    layoutRhythm: number;
    componentStructure: string[];
  };
  tablet: {
    path: string;
    width: number;
    height: number;
    dominantColors: string[];
  };
  mobile: {
    path: string;
    width: number;
    height: number;
    dominantColors: string[];
    navigationType: 'hamburger' | 'stacked' | 'none';
    readabilityScore: number;
  };
}

/**
 * Capture screenshots at multiple viewport sizes
 */
export async function captureScreenshots(
  url: string,
  outputDir: string
): Promise<ScreenshotAnalysis> {
  let browser: Browser | null = null;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const screenshotsDir = path.join(outputDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Desktop screenshot (1440px)
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });
    await desktopPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for animations
    
    const desktopPath = path.join(screenshotsDir, 'desktop.png');
    await desktopPage.screenshot({ path: desktopPath, fullPage: false });
    const desktopColors = await extractDominantColors(desktopPath);
    const desktopLayout = await analyzeLayoutRhythm(desktopPath);
    const desktopComponents = await detectComponents(desktopPage);
    
    await desktopPage.close();
    
    // Tablet screenshot (768px)
    const tabletPage = await browser.newPage();
    await tabletPage.setViewport({ width: 768, height: 1024 });
    await tabletPage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tabletPath = path.join(screenshotsDir, 'tablet.png');
    await tabletPage.screenshot({ path: tabletPath, fullPage: false });
    const tabletColors = await extractDominantColors(tabletPath);
    
    await tabletPage.close();
    
    // Mobile screenshot (390px)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844 });
    await mobilePage.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mobilePath = path.join(screenshotsDir, 'mobile.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });
    const mobileColors = await extractDominantColors(mobilePath);
    const mobileNav = await detectMobileNavigation(mobilePage);
    const mobileReadability = await assessMobileReadability(mobilePage);
    
    await mobilePage.close();
    
    // Get dimensions
    const desktopMeta = await sharp(desktopPath).metadata();
    const tabletMeta = await sharp(tabletPath).metadata();
    const mobileMeta = await sharp(mobilePath).metadata();
    
    return {
      desktop: {
        path: desktopPath,
        width: desktopMeta.width || 1440,
        height: desktopMeta.height || 900,
        dominantColors: desktopColors,
        layoutRhythm: desktopLayout,
        componentStructure: desktopComponents
      },
      tablet: {
        path: tabletPath,
        width: tabletMeta.width || 768,
        height: tabletMeta.height || 1024,
        dominantColors: tabletColors
      },
      mobile: {
        path: mobilePath,
        width: mobileMeta.width || 390,
        height: mobileMeta.height || 844,
        dominantColors: mobileColors,
        navigationType: mobileNav,
        readabilityScore: mobileReadability
      }
    };
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract dominant colors from screenshot using pixel sampling
 */
async function extractDominantColors(imagePath: string): Promise<string[]> {
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .resize(100, 100) // Downscale for faster processing
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample pixels and extract colors
    const colors = new Map<string, number>();
    const step = info.channels === 4 ? 4 : 3; // RGBA or RGB
    
    for (let i = 0; i < data.length; i += step * 10) { // Sample every 10th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Quantize to reduce color space
      const quantized = `#${Math.floor(r / 32) * 32}${Math.floor(g / 32) * 32}${Math.floor(b / 32) * 32}`;
      colors.set(quantized, (colors.get(quantized) || 0) + 1);
    }
    
    // Get top 5 most common colors
    return Array.from(colors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  } catch (error) {
    console.error('Color extraction failed:', error);
    return [];
  }
}

/**
 * Analyze layout rhythm (vertical spacing consistency)
 */
async function analyzeLayoutRhythm(imagePath: string): Promise<number> {
  // Simplified: analyze vertical spacing patterns
  // In full implementation, would use edge detection
  try {
    const image = sharp(imagePath);
    const { data, info } = await image
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Sample vertical lines to detect spacing
    const spacingPatterns: number[] = [];
    const sampleWidth = Math.floor(info.width / 10);
    
    for (let x = 0; x < info.width; x += sampleWidth) {
      let lastDarkY = 0;
      for (let y = 0; y < info.height; y++) {
        const idx = y * info.width + x;
        const brightness = data[idx];
        
        if (brightness < 200 && y - lastDarkY > 10) {
          spacingPatterns.push(y - lastDarkY);
          lastDarkY = y;
        }
      }
    }
    
    // Calculate consistency (lower variance = better rhythm)
    if (spacingPatterns.length < 2) return 5.0;
    
    const avg = spacingPatterns.reduce((a, b) => a + b, 0) / spacingPatterns.length;
    const variance = spacingPatterns.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / spacingPatterns.length;
    const consistency = Math.max(0, 10 - (variance / (avg * avg)) * 10);
    
    return Math.min(10, Math.max(0, consistency));
  } catch (error) {
    console.error('Layout rhythm analysis failed:', error);
    return 5.0;
  }
}

/**
 * Detect page components (hero, cards, CTA, footer)
 */
async function detectComponents(page: Page): Promise<string[]> {
  const components: string[] = [];
  
  try {
    // Check for common component patterns
    const hero = await page.$('section.hero, .hero-section, header h1');
    if (hero) components.push('hero');
    
    const cards = await page.$$('.card, [class*="card"], [class*="Card"]');
    if (cards.length >= 3) components.push('card-grid');
    
    const cta = await page.$('button, [class*="cta"], [class*="CTA"], a[class*="button"]');
    if (cta) components.push('cta');
    
    const footer = await page.$('footer, [class*="footer"]');
    if (footer) components.push('footer');
    
    const nav = await page.$('nav, [class*="nav"], [class*="Nav"]');
    if (nav) components.push('navigation');
  } catch (error) {
    console.error('Component detection failed:', error);
  }
  
  return components;
}

/**
 * Detect mobile navigation type
 */
async function detectMobileNavigation(page: Page): Promise<'hamburger' | 'stacked' | 'none'> {
  try {
    // Check for hamburger menu
    const hamburger = await page.$('[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu"]');
    if (hamburger) return 'hamburger';
    
    // Check for stacked navigation
    const navLinks = await page.$$('nav a, [class*="nav"] a');
    if (navLinks.length >= 3) return 'stacked';
    
    return 'none';
  } catch (error) {
    return 'none';
  }
}

/**
 * Assess mobile readability
 */
async function assessMobileReadability(page: Page): Promise<number> {
  let score = 5.0;
  
  try {
    // Check font sizes
    const bodyText = await page.evaluate(() => {
      const body = document.querySelector('body');
      if (!body) return null;
      const style = window.getComputedStyle(body);
      return {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight) / parseFloat(style.fontSize)
      };
    });
    
    if (bodyText) {
      // Font size check (min 16px)
      if (bodyText.fontSize >= 16) {
        score += 2.0;
      } else if (bodyText.fontSize >= 14) {
        score += 1.0;
      }
      
      // Line height check (1.5-1.8 ideal)
      if (bodyText.lineHeight >= 1.5 && bodyText.lineHeight <= 1.8) {
        score += 2.0;
      } else if (bodyText.lineHeight >= 1.3 && bodyText.lineHeight <= 2.0) {
        score += 1.0;
      }
    }
    
    // Check for overlapping elements
    const overlapping = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let overlapCount = 0;
      for (let i = 0; i < elements.length; i++) {
        const rect1 = elements[i].getBoundingClientRect();
        for (let j = i + 1; j < elements.length; j++) {
          const rect2 = elements[j].getBoundingClientRect();
          if (rect1.top < rect2.bottom && rect1.bottom > rect2.top &&
              rect1.left < rect2.right && rect1.right > rect2.left) {
            overlapCount++;
          }
        }
      }
      return overlapCount;
    });
    
    if (overlapping < 5) {
      score += 1.0;
    }
  } catch (error) {
    console.error('Readability assessment failed:', error);
  }
  
  return Math.min(10, Math.max(0, score));
}

