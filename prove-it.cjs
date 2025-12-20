const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' });

(async () => {
  try {
    // Create template
    const tid = 'proof-' + Date.now();
    await pool.query(
      `INSERT INTO brand_templates (id, name, brand, category, colors, typography, layout, css, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
      [tid, 'Proof Template', 'Proof', 'Demo', '{}', '{}', '{}', '', true]
    );
    console.log('1. Template created:', tid);
    
    // Insert page
    await pool.query(
      `INSERT INTO template_pages (template_id, url, path, html_content, is_home_page) 
       VALUES ($1, $2, $3, $4, $5)`,
      [tid, 'https://example.com', '/', '<html><body>THIS IS PROOF IT WORKS</body></html>', true]
    );
    console.log('2. Page inserted');
    
    // Verify
    const r = await pool.query('SELECT * FROM template_pages WHERE template_id = $1', [tid]);
    console.log('3. Page verified - path:', r.rows[0].path, '- content:', r.rows[0].html_content.substring(0, 50));
    
    // Count
    const c = await pool.query('SELECT COUNT(*) as count FROM template_pages');
    console.log('4. Total pages in database:', c.rows[0].count);
    
    const t = await pool.query('SELECT COUNT(*) as count FROM brand_templates');
    console.log('5. Total templates in database:', t.rows[0].count);
    
    console.log('\n=== DATABASE IS WORKING ===');
    
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await pool.end();
  }
})();

