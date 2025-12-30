/**
 * Template Downloader Service
 * Downloads free templates from various sources (TemplateMo, Tooplate, HTML5 UP, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';
import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { fetchWithAntiBlock } from './proxyManager';

const TEMPLATES_DOWNLOAD_DIR = path.join(process.cwd(), 'downloaded_templates');
const TEMPLATES_EXTRACT_DIR = path.join(process.cwd(), 'downloaded_templates', 'extracted');

// Ensure directories exist
if (!fs.existsSync(TEMPLATES_DOWNLOAD_DIR)) {
  fs.mkdirSync(TEMPLATES_DOWNLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(TEMPLATES_EXTRACT_DIR)) {
  fs.mkdirSync(TEMPLATES_EXTRACT_DIR, { recursive: true });
}

export interface TemplateInfo {
  name: string;
  url: string;
  downloadUrl?: string;
  category?: string;
  description?: string;
  thumbnail?: string;
  source: 'templatemo' | 'tooplate' | 'html5up' | 'startbootstrap' | 'other';
}

export interface DownloadProgress {
  total: number;
  downloaded: number;
  failed: number;
  current?: string;
  status: 'idle' | 'downloading' | 'extracting' | 'processing' | 'complete' | 'error';
}

let downloadProgress: DownloadProgress = {
  total: 0,
  downloaded: 0,
  failed: 0,
  status: 'idle',
};

/**
 * Get current download progress
 */
export function getDownloadProgress(): DownloadProgress {
  return { ...downloadProgress };
}

/**
 * Download a file from URL
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetchWithAntiBlock(url, { retries: 3 });
  
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  // Convert response to buffer for unzipper
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

/**
 * Extract ZIP file
 */
async function extractZip(zipPath: string, extractPath: string): Promise<string[]> {
  const extractedFiles: string[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on('entry', (entry: unzipper.Entry) => {
        extractedFiles.push(entry.path);
        entry.autodrain();
      })
      .on('finish', () => {
        resolve(extractedFiles);
      })
      .on('error', reject);
  });
}

/**
 * Find main HTML file in extracted template
 */
function findMainHtmlFile(extractPath: string): string | null {
  const files = fs.readdirSync(extractPath, { recursive: true });
  const htmlFiles = files.filter((f: string) => 
    typeof f === 'string' && f.toLowerCase().endsWith('.html') && 
    (f.toLowerCase().includes('index') || f.toLowerCase().includes('home'))
  );
  
  if (htmlFiles.length > 0) {
    return path.join(extractPath, htmlFiles[0] as string);
  }
  
  // If no index.html, get first HTML file
  const allHtml = files.filter((f: string) => 
    typeof f === 'string' && f.toLowerCase().endsWith('.html')
  );
  
  if (allHtml.length > 0) {
    return path.join(extractPath, allHtml[0] as string);
  }
  
  return null;
}

/**
 * Extract template data from downloaded files
 */
async function extractTemplateData(
  extractPath: string,
  templateInfo: TemplateInfo
): Promise<{
  html: string;
  css: string;
  images: string[];
  name: string;
  description?: string;
}> {
  const mainHtml = findMainHtmlFile(extractPath);
  
  if (!mainHtml) {
    throw new Error('No HTML file found in template');
  }

  const html = fs.readFileSync(mainHtml, 'utf-8');
  const $ = cheerio.load(html);
  
  // Extract CSS
  let css = '';
  $('style').each((_index: number, el: Element) => {
    css += $(el).html() || '';
  });
  
  // Extract external CSS links
  const cssLinks: string[] = [];
  $('link[rel="stylesheet"]').each((_index: number, el: Element) => {
    const href = $(el).attr('href');
    if (href) {
      cssLinks.push(href);
    }
  });
  
  // Try to read external CSS files
  const extractDir = path.dirname(mainHtml);
  for (const cssLink of cssLinks) {
    try {
      const cssPath = path.resolve(extractDir, cssLink);
      if (fs.existsSync(cssPath)) {
        css += '\n' + fs.readFileSync(cssPath, 'utf-8');
      }
    } catch (_error: unknown) {
      // Skip if can't read
    }
  }
  
  // Extract images
  const images: string[] = [];
  $('img').each((_index: number, el: Element) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('http')) {
      images.push(src);
    }
  });
  
  // Extract description from meta or first paragraph
  let description = templateInfo.description;
  if (!description) {
    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc) {
      description = metaDesc;
    } else {
      const firstP = $('p').first().text();
      if (firstP) {
        description = firstP.substring(0, 200);
      }
    }
  }
  
  return {
    html,
    css,
    images,
    name: templateInfo.name,
    description,
  };
}

/**
 * Save template to database
 */
async function saveTemplateToDatabase(
  templateData: {
    html: string;
    css: string;
    images: string[];
    name: string;
    description?: string;
  },
  templateInfo: TemplateInfo
): Promise<void> {
  try {
    const templateId = `downloaded-${templateInfo.source}-${templateInfo.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    await db.insert(brandTemplates).values({
      id: templateId,
      name: templateData.name,
      brand: templateInfo.source,
      category: templateInfo.category || 'Web Design',
      css: templateData.css,
      contentData: {
        html: templateData.html,
        images: templateData.images,
        text: templateData.description || '',
      },
      isPremium: false,
      isApproved: false,
      isActive: false,
      sourceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: brandTemplates.id,
      set: {
        name: templateData.name,
        css: templateData.css,
        contentData: {
          html: templateData.html,
          images: templateData.images,
          text: templateData.description || '',
        },
        updatedAt: new Date(),
      },
    });
    
    console.log(`✅ Saved template to database: ${templateData.name}`);
  } catch (error) {
    logError(error, `TemplateDownloader - saveTemplateToDatabase(${templateInfo.name})`);
    throw error;
  }
}

/**
 * Download and process a single template
 */
async function downloadTemplate(templateInfo: TemplateInfo): Promise<boolean> {
  try {
    downloadProgress.current = templateInfo.name;
    downloadProgress.status = 'downloading';
    
    // Get download URL if not provided
    let downloadUrl = templateInfo.downloadUrl;
    if (!downloadUrl && templateInfo.source === 'templatemo') {
      downloadUrl = await getTemplateMoDownloadUrl(templateInfo.url);
      if (!downloadUrl) {
        throw new Error('Could not find download URL');
      }
    }
    
    if (!downloadUrl) {
      throw new Error('No download URL provided');
    }
    
    // Download ZIP
    const zipFileName = `${templateInfo.source}-${templateInfo.name.replace(/\s+/g, '-')}.zip`;
    const zipPath = path.join(TEMPLATES_DOWNLOAD_DIR, zipFileName);
    
    console.log(`📥 Downloading: ${templateInfo.name} from ${downloadUrl}...`);
    await downloadFile(downloadUrl, zipPath);
    
    // Extract ZIP
    downloadProgress.status = 'extracting';
    const extractPath = path.join(TEMPLATES_EXTRACT_DIR, templateInfo.name.replace(/\s+/g, '-'));
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });
    
    await extractZip(zipPath, extractPath);
    
    // Extract template data
    downloadProgress.status = 'processing';
    const templateData = await extractTemplateData(extractPath, templateInfo);
    
    // Save to database
    await saveTemplateToDatabase(templateData, templateInfo);
    
    // Clean up ZIP file (keep extracted for now)
    // fs.unlinkSync(zipPath);
    
    downloadProgress.downloaded++;
    console.log(`✅ Downloaded and processed: ${templateInfo.name}`);
    
    return true;
  } catch (error) {
    downloadProgress.failed++;
    logError(error, `TemplateDownloader - downloadTemplate(${templateInfo.name})`);
    console.error(`❌ Failed to download ${templateInfo.name}:`, getErrorMessage(error));
    return false;
  }
}

/**
 * Get download URL from template page
 */
async function getTemplateMoDownloadUrl(templateUrl: string): Promise<string | null> {
  try {
    const response = await fetchWithAntiBlock(templateUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find download link
    const downloadLink = $('a:contains("Download"), a[href*="download"]').first();
    const href = downloadLink.attr('href');
    
    if (href) {
      return href.startsWith('http') ? href : `https://templatemo.com${href}`;
    }
    
    // Fallback: try to construct download URL from template URL
    const match = templateUrl.match(/tm-(\d+)-(.+)/);
    if (match) {
      return `https://templatemo.com/downloads/tm-${match[1]}-${match[2]}.zip`;
    }
    
    return null;
  } catch (error) {
    logError(error, `TemplateDownloader - getTemplateMoDownloadUrl(${templateUrl})`);
    return null;
  }
}

/**
 * Fetch template list from TemplateMo
 * Scrapes all pages to get all 602+ templates
 */
export async function fetchTemplateMoTemplates(): Promise<TemplateInfo[]> {
  try {
    const templates: TemplateInfo[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore && page <= 60) { // Max 60 pages (safety limit - TemplateMo has 52 pages, extra buffer for future templates)
      const url = `https://templatemo.com/page/${page}`;
      console.log(`🔍 Fetching TemplateMo page ${page}...`);
      
      const response = await fetchWithAntiBlock(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      let foundOnPage = 0;
      
      // Find all template links - they have format like "605 Xmas Countdown" with href="/tm-605-xmas-countdown"
      $('a[href*="/tm-"]').each((_index: number, el: Element) => {
        const href = $(el).attr('href');
        const heading = $(el).closest('div').find('h2, h3, h4').first();
        const name = heading.text().trim() || $(el).text().trim() || $(el).find('img').attr('alt') || '';

        if (href && name) {
          // Extract template number from URL (e.g., /tm-605-xmas-countdown -> 605)
          const match = href.match(/tm-(\d+)-/);
          if (match) {
            const fullUrl = href.startsWith('http') ? href : `https://templatemo.com${href}`;

            // Clean name (remove number prefix)
            const cleanName = name.replace(/^\d+\s+/, '').trim();

            // Check if we already have this template
            if (!templates.find(t => t.url === fullUrl) && cleanName) {
              templates.push({
                name: cleanName,
                url: fullUrl,
                // Download URL will be fetched when downloading
                source: 'templatemo',
              });
              foundOnPage++;
            }
          }
        }
      });
      
      // Check if there's a next page
      const nextPage = $('a').filter((_index: number, el: Element) => {
        const text = $(el).text().toLowerCase().trim();
        return text === 'next' || text === String(page + 1);
      });
      
      if (foundOnPage === 0 || nextPage.length === 0) {
        hasMore = false;
      } else {
        page++;
        // Rate limit between pages
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`✅ Found ${templates.length} templates from TemplateMo`);
    return templates;
  } catch (error) {
    logError(error, 'TemplateDownloader - fetchTemplateMoTemplates');
    return [];
  }
}

/**
 * Download templates from TemplateMo
 */
export async function downloadTemplateMoTemplates(limit?: number): Promise<void> {
  downloadProgress = {
    total: 0,
    downloaded: 0,
    failed: 0,
    status: 'downloading',
  };
  
  try {
    console.log('🔍 Fetching TemplateMo template list...');
    const templates = await fetchTemplateMoTemplates();
    
    if (templates.length === 0) {
      throw new Error('No templates found');
    }
    
    const templatesToDownload = limit ? templates.slice(0, limit) : templates;
    downloadProgress.total = templatesToDownload.length;
    
    console.log(`📦 Found ${templates.length} templates. Downloading ${templatesToDownload.length}...`);
    
    // Download with rate limiting
    for (const template of templatesToDownload) {
      await downloadTemplate(template);

      // Rate limit: 2 seconds between downloads
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    }
    
    downloadProgress.status = 'complete';
    console.log(`✅ Download complete! ${downloadProgress.downloaded} succeeded, ${downloadProgress.failed} failed`);
  } catch (error) {
    downloadProgress.status = 'error';
    logError(error, 'TemplateDownloader - downloadTemplateMoTemplates');
    throw error;
  }
}

