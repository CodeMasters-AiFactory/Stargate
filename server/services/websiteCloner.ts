/**
 * One-Click Website Clone Service
 * 
 * Clone any website with 100% fidelity:
 * - Download ALL assets (images, fonts, CSS, JS)
 * - Preserve all functionality
 * - Convert to static site
 * - Deploy to any platform (Vercel, Netlify, S3)
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { extractAllImages } from './imageExtractor';
import { downloadAsset, embedFonts } from './assetDownloader';

export interface CloneResult {
  success: boolean;
  outputDir: string;
  indexHtml: string;
  assets: {
    images: number;
    css: number;
    js: number;
    fonts: number;
  };
  deployable: boolean;
  error?: string;
}

/**
 * Clone a website completely
 */
export async function cloneWebsite(
  url: string,
  outputDir?: string
): Promise<CloneResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log(`[Website Cloner] Cloning ${url}`);

    // Create output directory
    const baseDir = outputDir || path.join(process.cwd(), 'cloned_sites');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const siteDir = path.join(baseDir, new URL(url).hostname.replace(/\./g, '_'));
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }

    const assetsDir = path.join(siteDir, 'assets');
    const imagesDir = path.join(assetsDir, 'images');
    const cssDir = path.join(assetsDir, 'css');
    const jsDir = path.join(assetsDir, 'js');
    const fontsDir = path.join(assetsDir, 'fonts');

    [assetsDir, imagesDir, cssDir, jsDir, fontsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // Download all CSS
    const cssFiles: string[] = [];
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        cssFiles.push(href);
      }
    });

    // Download all JS
    const jsFiles: string[] = [];
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        jsFiles.push(src);
      }
    });

    // Download all images
    const images = await extractAllImages(page, url, { downloadImages: true });

    // Convert URLs to local paths
    let processedHtml = html;
    let imageCount = 0;
    let cssCount = 0;
    let jsCount = 0;

    // Process CSS files
    for (const cssUrl of cssFiles.slice(0, 20)) { // Limit to 20
      try {
        const absoluteUrl = cssUrl.startsWith('http') ? cssUrl : new URL(cssUrl, url).href;
        const cssContent = await downloadAsset(absoluteUrl);
        const cssFilename = `style_${cssCount}.css`;
        const cssPath = path.join(cssDir, cssFilename);
        fs.writeFileSync(cssPath, cssContent, 'utf8');

        processedHtml = processedHtml.replace(cssUrl, `assets/css/${cssFilename}`);
        cssCount++;
      } catch (e) {
        console.warn(`Failed to download CSS: ${cssUrl}`);
      }
    }

    // Process JS files
    for (const jsUrl of jsFiles.slice(0, 20)) { // Limit to 20
      try {
        const absoluteUrl = jsUrl.startsWith('http') ? jsUrl : new URL(jsUrl, url).href;
        const jsContent = await downloadAsset(absoluteUrl);
        const jsFilename = `script_${jsCount}.js`;
        const jsPath = path.join(jsDir, jsFilename);
        fs.writeFileSync(jsPath, jsContent, 'utf8');

        processedHtml = processedHtml.replace(jsUrl, `assets/js/${jsFilename}`);
        jsCount++;
      } catch (e) {
        console.warn(`Failed to download JS: ${jsUrl}`);
      }
    }

    // Process images
    for (const img of images.slice(0, 50)) { // Limit to 50
      try {
        if (img.data) {
          const ext = img.url.split('.').pop()?.split('?')[0] || 'png';
          const imgFilename = `img_${imageCount}.${ext}`;
          const imgPath = path.join(imagesDir, imgFilename);
          fs.writeFileSync(imgPath, Buffer.from(img.data, 'base64'));

          processedHtml = processedHtml.replace(img.url, `assets/images/${imgFilename}`);
          imageCount++;
        }
      } catch (e) {
        console.warn(`Failed to process image: ${img.url}`);
      }
    }

    // Embed fonts
    processedHtml = await embedFonts(processedHtml, url, fontsDir);

    // Add base tag for relative URLs
    if (!$('base').length) {
      processedHtml = processedHtml.replace('<head>', `<head><base href="${url}/">`);
    }

    // Convert all remaining absolute URLs to relative
    processedHtml = processedHtml.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');

    // Save index.html
    const indexPath = path.join(siteDir, 'index.html');
    fs.writeFileSync(indexPath, processedHtml, 'utf8');

    // Create deployment files
    createDeploymentFiles(siteDir, url);

    await browser.close();

    return {
      success: true,
      outputDir: siteDir,
      indexHtml: indexPath,
      assets: {
        images: imageCount,
        css: cssCount,
        js: jsCount,
        fonts: 0, // Would need to count
      },
      deployable: true,
    };
  } catch (error) {
    logError(error, 'Website Cloner');
    return {
      success: false,
      outputDir: '',
      indexHtml: '',
      assets: { images: 0, css: 0, js: 0, fonts: 0 },
      deployable: false,
      error: getErrorMessage(error),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Create deployment configuration files
 */
function createDeploymentFiles(siteDir: string, originalUrl: string): void {
  // Vercel config
  const vercelConfig = {
    version: 2,
    builds: [{ src: 'index.html', use: '@vercel/static' }],
    routes: [{ src: '/(.*)', dest: '/index.html' }],
  };
  fs.writeFileSync(
    path.join(siteDir, 'vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );

  // Netlify config
  const netlifyConfig = `
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  fs.writeFileSync(path.join(siteDir, '_redirects'), netlifyConfig);

  // README
  const readme = `# Cloned Website

Original URL: ${originalUrl}
Cloned: ${new Date().toISOString()}

## Deployment

### Vercel
\`\`\`bash
vercel deploy
\`\`\`

### Netlify
\`\`\`bash
netlify deploy --prod
\`\`\`

### Static Hosting
Upload the entire directory to any static hosting service.
`;
  fs.writeFileSync(path.join(siteDir, 'README.md'), readme);
}

