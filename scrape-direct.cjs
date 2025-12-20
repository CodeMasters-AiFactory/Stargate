// Direct scrape of Deloitte - bypasses API auth
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' });

const TARGET_URL = 'https://www.deloitte.com/za/en.html';
const MAX_PAGES = 50;
const MAX_DEPTH = 3;

async function scrapePage(url, browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    await page.close();
    return html;
  } catch (e) {
    await page.close();
    throw e;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DIRECT SCRAPE: DELOITTE SOUTH AFRICA');
  console.log('='.repeat(60));
  
  // Clear old data
  await pool.query('DELETE FROM template_pages');
  await pool.query('DELETE FROM brand_templates');
  console.log('✅ Cleared old data');
  
  // Create template
  const templateId = 'deloitte-' + Date.now();
  await pool.query(
    `INSERT INTO brand_templates (id, name, brand, category, industry, colors, typography, layout, css, is_active) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [templateId, 'Deloitte ZA', 'Deloitte', 'Corporate', 'Professional Services', '{}', '{}', '{}', '', true]
  );
  console.log('✅ Template created:', templateId);
  
  // Launch browser
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const visited = new Set();
  const toVisit = [{ url: TARGET_URL, depth: 0 }];
  let pagesScraped = 0;
  
  const baseOrigin = new URL(TARGET_URL).origin;
  
  while (toVisit.length > 0 && pagesScraped < MAX_PAGES) {
    const { url, depth } = toVisit.shift();
    
    if (visited.has(url) || depth > MAX_DEPTH) continue;
    visited.add(url);
    
    console.log(`\n📄 [${pagesScraped + 1}/${MAX_PAGES}] Scraping: ${url.substring(0, 60)}...`);
    
    try {
      const html = await scrapePage(url, browser);
      const $ = cheerio.load(html);
      const title = $('title').text() || 'Untitled';
      const path = new URL(url).pathname || '/';
      
      // Save to database
      await pool.query(
        `INSERT INTO template_pages (template_id, url, path, html_content, title, is_home_page) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [templateId, url, path, html, title, path === '/' || path === '/za/en.html']
      );
      
      pagesScraped++;
      console.log(`   ✅ SAVED: ${path} - "${title.substring(0, 40)}..."`);
      
      // Extract links
      if (depth < MAX_DEPTH) {
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;
          
          try {
            const absoluteUrl = new URL(href, url).href.split('#')[0];
            if (absoluteUrl.startsWith(baseOrigin) && !visited.has(absoluteUrl)) {
              // Skip non-HTML
              if (!/\.(pdf|jpg|png|gif|css|js|xml|zip)$/i.test(absoluteUrl)) {
                toVisit.push({ url: absoluteUrl, depth: depth + 1 });
              }
            }
          } catch (e) {}
        });
      }
      
      // Brief delay
      await new Promise(r => setTimeout(r, 500));
      
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  }
  
  await browser.close();
  
  // Final count
  const count = await pool.query('SELECT COUNT(*) as count FROM template_pages');
  
  console.log('\n' + '='.repeat(60));
  console.log('SCRAPE COMPLETE');
  console.log('Total pages saved:', count.rows[0].count);
  console.log('='.repeat(60));
  
  // Show saved pages
  const pages = await pool.query('SELECT path, title FROM template_pages ORDER BY is_home_page DESC, path LIMIT 20');
  console.log('\nPages saved:');
  pages.rows.forEach((p, i) => console.log(`  ${i+1}. ${p.path} - ${(p.title || '').substring(0, 40)}`));
  
  await pool.end();
}

main().catch(e => {
  console.error('Fatal error:', e);
  pool.end();
  process.exit(1);
});

