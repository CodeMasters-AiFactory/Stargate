// Re-scrape Deloitte using the ACTUAL scraper service we built
const { Pool } = require('pg');

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' });

async function rescrape() {
  console.log('='.repeat(60));
  console.log('RE-SCRAPING DELOITTE WITH CSS EXTRACTION FIX');
  console.log('='.repeat(60));
  
  // Delete old Deloitte data
  await pool.query("DELETE FROM template_pages WHERE template_id LIKE 'deloitte%'");
  await pool.query("DELETE FROM brand_templates WHERE id LIKE 'deloitte%'");
  console.log('✅ Deleted old Deloitte data');
  
  // Create new template
  const templateId = 'deloitte-za-' + Date.now();
  await pool.query(
    `INSERT INTO brand_templates (id, name, brand, category, industry, colors, typography, layout, css, is_active, content_data) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      templateId,
      'Deloitte South Africa',
      'Deloitte',
      'Corporate',
      'Professional Services',
      '{}',
      '{}',
      '{}',
      '',
      true,
      JSON.stringify({ url: 'https://www.deloitte.com/za/en.html', sourceUrl: 'https://www.deloitte.com/za/en.html' })
    ]
  );
  console.log('✅ Template created:', templateId);
  console.log('\nNow use the API to trigger crawl:');
  console.log(`POST http://localhost:5000/api/admin/scraper/crawl-multipage/${templateId}`);
  console.log('Body: { "maxPages": 50, "maxDepth": 3 }');
  console.log('\nOR wait for server to start and I will trigger it...');
  
  await pool.end();
}

rescape();

