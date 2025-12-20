const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' });

(async () => {
  const r = await pool.query(`
    SELECT path, 
           LENGTH(html_content) as html_len, 
           LENGTH(css_content) as css_len,
           title,
           url
    FROM template_pages 
    WHERE template_id LIKE 'deloitte%' 
    ORDER BY is_home_page DESC 
    LIMIT 10
  `);
  
  console.log('Deloitte Pages Saved:');
  console.log('='.repeat(80));
  r.rows.forEach((p, i) => {
    console.log(`${i+1}. ${p.path}`);
    console.log(`   URL: ${p.url.substring(0, 60)}...`);
    console.log(`   HTML: ${p.html_len} bytes | CSS: ${p.css_len || 0} bytes`);
    console.log(`   Title: ${(p.title || 'No title').substring(0, 60)}`);
    console.log('');
  });
  
  // Check if CSS is missing
  const noCss = await pool.query(`
    SELECT COUNT(*) as count 
    FROM template_pages 
    WHERE template_id LIKE 'deloitte%' 
    AND (css_content IS NULL OR css_content = '')
  `);
  
  console.log(`Pages without CSS: ${noCss.rows[0].count} / ${r.rows.length}`);
  
  await pool.end();
})();

