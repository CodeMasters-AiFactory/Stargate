const { Pool } = require('pg');
const http = require('http');

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' });

async function scrapeDeloitte() {
  console.log('='.repeat(60));
  console.log('SCRAPING DELOITTE SOUTH AFRICA');
  console.log('URL: https://www.deloitte.com/za/en.html');
  console.log('='.repeat(60));
  
  try {
    // Delete any existing templates first
    await pool.query('DELETE FROM template_pages');
    await pool.query('DELETE FROM brand_templates');
    console.log('✅ Cleared old data');
    
    // Create template for Deloitte
    const templateId = 'deloitte-za-' + Date.now();
    await pool.query(
      `INSERT INTO brand_templates (id, name, brand, category, industry, colors, typography, layout, css, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        templateId,
        'Deloitte South Africa',
        'Deloitte',
        'Corporate',
        'Professional Services',
        JSON.stringify({primary: '#86BC25', secondary: '#000000'}),
        JSON.stringify({headingFont: 'Open Sans', bodyFont: 'Open Sans'}),
        JSON.stringify({heroStyle: 'full-width', maxWidth: '1440px'}),
        '',
        true
      ]
    );
    console.log('✅ Template created:', templateId);
    
    // Now trigger the multi-page crawl via API
    console.log('\\n🚀 Starting multi-page crawl...');
    console.log('This will scrape ALL pages from the Deloitte site.');
    console.log('Watch the server console for progress.\\n');
    
    const postData = JSON.stringify({ sourceUrl: 'https://www.deloitte.com/za/en.html' });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/scraper/crawl-multipage/${templateId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          console.log('API Response:', data);
          
          // Poll for status
          console.log('\\n📊 Checking crawl status every 5 seconds...');
          
          let checks = 0;
          const statusInterval = setInterval(async () => {
            checks++;
            try {
              const statusRes = await new Promise((res, rej) => {
                http.get(`http://localhost:5000/api/admin/scraper/crawl-status/${templateId}`, (response) => {
                  let d = '';
                  response.on('data', (c) => d += c);
                  response.on('end', () => res(JSON.parse(d)));
                }).on('error', rej);
              });
              
              if (statusRes.status) {
                const s = statusRes.status;
                console.log(`[${checks * 5}s] Status: ${s.status} | Pages: ${s.pagesScraped} | Current: ${(s.currentUrl || '').substring(0, 50)}...`);
                
                if (s.status === 'completed' || s.status === 'error') {
                  clearInterval(statusInterval);
                  
                  // Get final count from DB
                  const count = await pool.query('SELECT COUNT(*) as count FROM template_pages WHERE template_id = $1', [templateId]);
                  console.log('\\n' + '='.repeat(60));
                  console.log('CRAWL COMPLETE');
                  console.log('Total pages saved to database:', count.rows[0].count);
                  console.log('='.repeat(60));
                  
                  await pool.end();
                  resolve();
                }
              }
            } catch (e) {
              console.log('Status check error:', e.message);
            }
            
            // Timeout after 10 minutes
            if (checks > 120) {
              clearInterval(statusInterval);
              const count = await pool.query('SELECT COUNT(*) as count FROM template_pages WHERE template_id = $1', [templateId]);
              console.log('\\nTimeout - Pages saved so far:', count.rows[0].count);
              await pool.end();
              resolve();
            }
          }, 5000);
        });
      });
      
      req.on('error', (e) => {
        console.error('Request error:', e.message);
        reject(e);
      });
      
      req.write(postData);
      req.end();
    });
    
  } catch (e) {
    console.error('ERROR:', e.message);
    await pool.end();
  }
}

scrapeDeloitte();

