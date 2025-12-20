/**
 * Import Templates from Downloads Folder
 * Scans Downloads folder for template ZIP files and imports them into the database
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';
import * as cheerio from 'cheerio';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import database and schema
const { db } = await import('../server/db.ts');
const { brandTemplates } = await import('../shared/schema.ts');
const { eq } = await import('drizzle-orm');
const { nanoid } = await import('nanoid');

const DOWNLOADS_DIR = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads');
const TEMP_EXTRACT_DIR = path.join(process.cwd(), 'temp_extracted_templates');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_EXTRACT_DIR)) {
  fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });
}

/**
 * Find main HTML file in extracted template
 */
function findMainHtmlFile(extractPath) {
  const files = [];
  
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(extractPath);
  
  // Prefer index.html or home.html
  const preferred = files.find(f => 
    f.toLowerCase().includes('index') || 
    f.toLowerCase().includes('home')
  );
  
  return preferred || files[0] || null;
}

/**
 * Extract CSS from HTML and linked CSS files
 */
function extractCSS(htmlPath, htmlContent) {
  const $ = cheerio.load(htmlContent);
  let css = '';
  
  // Extract inline styles
  $('style').each((_, el) => {
    css += $(el).html() || '';
  });
  
  // Extract external CSS files
  const extractDir = path.dirname(htmlPath);
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('http')) {
      try {
        const cssPath = path.resolve(extractDir, href);
        if (fs.existsSync(cssPath)) {
          css += '\n' + fs.readFileSync(cssPath, 'utf-8');
        }
      } catch (error) {
        // Skip if can't read
      }
    }
  });
  
  return css;
}

/**
 * Extract images from HTML
 */
function extractImages(htmlPath, htmlContent) {
  const $ = cheerio.load(htmlContent);
  const images = [];
  const extractDir = path.dirname(htmlPath);
  
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      const imagePath = path.resolve(extractDir, src);
      if (fs.existsSync(imagePath)) {
        images.push(src);
      }
    }
  });
  
  // Also check background images in CSS
  $('*').each((_, el) => {
    const style = $(el).attr('style');
    if (style && style.includes('background')) {
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && !match[1].startsWith('http') && !match[1].startsWith('data:')) {
        const imagePath = path.resolve(extractDir, match[1]);
        if (fs.existsSync(imagePath)) {
          images.push(match[1]);
        }
      }
    }
  });
  
  return [...new Set(images)]; // Remove duplicates
}

/**
 * Extract template metadata
 */
function extractMetadata(htmlContent, zipName) {
  const $ = cheerio.load(htmlContent);
  
  // Extract title
  const title = $('title').text().trim() || 
                $('h1').first().text().trim() || 
                zipName.replace(/\.zip$/i, '').replace(/templatemo_/gi, '').replace(/_/g, ' ');
  
  // Extract description
  const description = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content') ||
                     $('p').first().text().trim().substring(0, 200);
  
  // Try to detect category from template name
  let category = 'Web Design';
  const nameLower = title.toLowerCase();
  if (nameLower.includes('restaurant') || nameLower.includes('food') || nameLower.includes('cafe')) {
    category = 'Restaurant';
  } else if (nameLower.includes('startup') || nameLower.includes('tech')) {
    category = 'Startup';
  } else if (nameLower.includes('corporate') || nameLower.includes('business')) {
    category = 'Corporate';
  } else if (nameLower.includes('ecommerce') || nameLower.includes('shop') || nameLower.includes('store')) {
    category = 'E-commerce';
  } else if (nameLower.includes('portfolio')) {
    category = 'Portfolio';
  } else if (nameLower.includes('health') || nameLower.includes('medical')) {
    category = 'Healthcare';
  } else if (nameLower.includes('real') || nameLower.includes('estate') || nameLower.includes('property')) {
    category = 'Real Estate';
  }
  
  return { title, description, category };
}

/**
 * Process a single ZIP file
 */
async function processZipFile(zipPath) {
  const zipName = path.basename(zipPath);
  console.log(`\n📦 Processing: ${zipName}`);
  
  try {
    // Extract ZIP
    const extractPath = path.join(TEMP_EXTRACT_DIR, path.basename(zipPath, '.zip'));
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true });
    }
    fs.mkdirSync(extractPath, { recursive: true });
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractPath }))
        .on('finish', resolve)
        .on('error', reject);
    });
    
    // Find main HTML file
    const htmlPath = findMainHtmlFile(extractPath);
    if (!htmlPath) {
      throw new Error('No HTML file found in template');
    }
    
    console.log(`   Found HTML: ${path.relative(extractPath, htmlPath)}`);
    
    // Read and process HTML
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    const css = extractCSS(htmlPath, htmlContent);
    const images = extractImages(htmlPath, htmlContent);
    const { title, description, category } = extractMetadata(htmlContent, zipName);
    
    // Generate template ID
    const templateId = `downloaded-${nanoid(8)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`;
    
    // Check if template already exists
    const existing = await db.select()
      .from(brandTemplates)
      .where(eq(brandTemplates.id, templateId))
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`   ⚠️  Template already exists: ${title}`);
      return { skipped: true, name: title };
    }
    
    // Save to database
    await db.insert(brandTemplates).values({
      id: templateId,
      name: title,
      brand: 'Downloaded Template',
      category: category,
      industry: category,
      css: css,
      contentData: {
        html: htmlContent,
        images: images,
        text: description || '',
        source: 'downloads',
        zipName: zipName,
      },
      thumbnail: images.length > 0 ? images[0] : null,
      colors: {},
      typography: {},
      layout: {},
      darkMode: false,
      tags: [category.toLowerCase()],
      isApproved: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`   ✅ Imported: ${title} (${category})`);
    return { success: true, name: title, category };
    
  } catch (error) {
    console.error(`   ❌ Error processing ${zipName}:`, error.message);
    return { error: true, name: zipName, message: error.message };
  }
}

/**
 * Main import function
 */
async function importTemplates() {
  console.log('🔍 Scanning Downloads folder for template ZIP files...');
  console.log(`   Path: ${DOWNLOADS_DIR}`);
  
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    console.error(`❌ Downloads folder not found: ${DOWNLOADS_DIR}`);
    process.exit(1);
  }
  
  // Find all ZIP files
  const files = fs.readdirSync(DOWNLOADS_DIR);
  const zipFiles = files.filter(f => 
    f.toLowerCase().endsWith('.zip') && 
    (f.toLowerCase().includes('template') || f.toLowerCase().includes('templatemo'))
  );
  
  if (zipFiles.length === 0) {
    console.log('❌ No template ZIP files found in Downloads folder');
    console.log('   Looking for files containing "template" or "templatemo" in the name');
    process.exit(0);
  }
  
  console.log(`\n📦 Found ${zipFiles.length} template ZIP files:`);
  zipFiles.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  
  console.log(`\n🚀 Starting import...\n`);
  
  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
  };
  
  for (const zipFile of zipFiles) {
    const zipPath = path.join(DOWNLOADS_DIR, zipFile);
    const result = await processZipFile(zipPath);
    
    if (result.success) {
      results.success++;
    } else if (result.skipped) {
      results.skipped++;
    } else {
      results.failed++;
    }
    
    // Small delay between imports
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   ✅ Successfully imported: ${results.success}`);
  console.log(`   ⏭️  Skipped (already exists): ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
    // Keep extracted templates for image serving (don't delete)
    console.log(`\n📁 Extracted templates kept in: ${TEMP_EXTRACT_DIR}`);
    console.log(`   Images can be served from extracted template directories`);
}

// Run import
importTemplates()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

