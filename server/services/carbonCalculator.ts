/**
 * Website Carbon Calculator Service
 * 
 * Calculate environmental impact: page weight, server energy, data transfer carbon,
 * green hosting detection, sustainability score (A-F).
 */

import puppeteer, { Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as cheerio from 'cheerio';

export interface CarbonFootprint {
  url: string;
  timestamp: Date;
  
  // Page metrics
  pageWeight: number; // KB
  totalRequests: number;
  
  // Carbon calculations
  dataTransferCarbon: number; // grams CO2
  serverEnergy: number; // kWh
  totalCarbon: number; // grams CO2
  
  // Hosting info
  hosting: {
    provider?: string;
    location?: string;
    isGreen?: boolean;
  };
  
  // Score
  sustainabilityScore: 'A' | 'B' | 'C' | 'D' | 'F';
  grade: number; // 0-100
}

// Carbon intensity factors (grams CO2 per kWh)
const CARBON_INTENSITY: Record<string, number> = {
  'US': 0.4, // US average
  'EU': 0.3, // EU average (greener)
  'ASIA': 0.6, // Asia average
  'DEFAULT': 0.4,
};

// Green hosting providers
const GREEN_HOSTING_PROVIDERS = [
  'greenhost', 'greengeeks', 'hostgator', 'siteground',
  'krystal', 'dreamhost', 'a2hosting', 'inmotion',
];

/**
 * Calculate website carbon footprint
 */
export async function calculateCarbonFootprint(url: string): Promise<CarbonFootprint> {
  try {
    console.log(`[Carbon Calculator] Calculating footprint for ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Track network requests
    const requests: Array<{ url: string; size: number }> = [];
    page.on('response', async (response) => {
      try {
        const headers = response.headers();
        const contentLength = headers['content-length'];
        if (contentLength) {
          requests.push({
            url: response.url(),
            size: parseInt(contentLength) || 0,
          });
        }
      } catch (e) {
        // Ignore
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get page size
    const html = await page.content();
    const pageWeight = Buffer.byteLength(html, 'utf8') / 1024; // KB

    // Calculate total transfer size
    const totalSize = requests.reduce((sum, req) => sum + req.size, 0) / 1024; // KB
    const totalPageWeight = pageWeight + totalSize;

    // Detect hosting provider
    const hosting = await detectHosting(page, url);

    // Calculate carbon footprint
    // 1 KB transferred = ~0.0003 kWh (simplified)
    const dataTransferEnergy = totalPageWeight * 0.0003; // kWh
    
    // Server energy (simplified - assumes 0.1 kWh per page load)
    const serverEnergy = 0.1; // kWh
    
    // Total energy
    const totalEnergy = dataTransferEnergy + serverEnergy;
    
    // Carbon intensity based on location
    const intensity = CARBON_INTENSITY[hosting.location || 'DEFAULT'];
    const totalCarbon = totalEnergy * intensity * 1000; // Convert to grams

    // Calculate sustainability score
    const grade = calculateSustainabilityGrade(totalPageWeight, totalCarbon, hosting.isGreen || false);
    const sustainabilityScore = gradeToLetter(grade);

    await browser.close();

    return {
      url,
      timestamp: new Date(),
      pageWeight: Math.round(totalPageWeight),
      totalRequests: requests.length,
      dataTransferCarbon: Math.round(dataTransferEnergy * intensity * 1000),
      serverEnergy,
      totalCarbon: Math.round(totalCarbon),
      hosting,
      sustainabilityScore,
      grade,
    };
  } catch (error) {
    logError(error, 'Carbon Calculator');
    throw new Error(`Carbon calculation failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Detect hosting provider and location
 */
async function detectHosting(page: Page, url: string): Promise<CarbonFootprint['hosting']> {
  try {
    const html = await page.content();
    const $ = cheerio.load(html);

    // Check server headers
    const serverHeader = page.url(); // Would need actual response headers
    
    // Check for green hosting indicators
    let isGreen = false;
    const hostname = new URL(url).hostname.toLowerCase();
    for (const provider of GREEN_HOSTING_PROVIDERS) {
      if (hostname.includes(provider)) {
        isGreen = true;
        break;
      }
    }

    // Try to detect location from CDN/headers (simplified)
    let location = 'DEFAULT';
    if (hostname.includes('.eu')) {
      location = 'EU';
    } else if (hostname.includes('.asia') || hostname.includes('.jp') || hostname.includes('.cn')) {
      location = 'ASIA';
    } else {
      location = 'US';
    }

    return {
      provider: hostname.split('.')[hostname.split('.').length - 2],
      location,
      isGreen,
    };
  } catch (e) {
    return {
      location: 'DEFAULT',
      isGreen: false,
    };
  }
}

/**
 * Calculate sustainability grade (0-100)
 */
function calculateSustainabilityGrade(pageWeight: number, carbon: number, isGreen: boolean): number {
  let grade = 100;

  // Page weight penalty
  if (pageWeight > 3000) grade -= 30; // > 3MB
  else if (pageWeight > 2000) grade -= 20; // > 2MB
  else if (pageWeight > 1000) grade -= 10; // > 1MB

  // Carbon penalty
  if (carbon > 3) grade -= 20; // > 3g CO2
  else if (carbon > 2) grade -= 10; // > 2g CO2
  else if (carbon > 1) grade -= 5; // > 1g CO2

  // Green hosting bonus
  if (isGreen) grade += 10;

  return Math.max(0, Math.min(100, grade));
}

/**
 * Convert grade to letter
 */
function gradeToLetter(grade: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
}

