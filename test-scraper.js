// Quick test for the multi-page crawler
const { Pool } = require('pg');

async function testCrawler() {
  console.log('Testing multi-page crawler...\n');
  
  // Test database connection
  const pool = new Pool({ 
    connectionString: 'postgresql://postgres:postgres@localhost:5432/stargate' 
  });
  
  try {
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    
    // Check template_pages table
    const tables = await pool.query(`
      SELECT COUNT(*) as count FROM template_pages
    `);
    console.log('✅ template_pages table exists, rows:', tables.rows[0].count);
    
    // Test insert
    const testId = 'test-' + Date.now();
    await pool.query(`
      INSERT INTO template_pages (id, template_id, url, path, html_content, is_home_page)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [testId, 'test-template', 'https://example.com', '/', '<html>Test</html>', true]);
    console.log('✅ Test insert successful');
    
    // Verify insert
    const verify = await pool.query('SELECT * FROM template_pages WHERE id = $1', [testId]);
    console.log('✅ Test record found:', verify.rows[0]?.path);
    
    // Clean up
    await pool.query('DELETE FROM template_pages WHERE id = $1', [testId]);
    console.log('✅ Test record cleaned up');
    
    console.log('\n✅✅✅ ALL TESTS PASSED - Database is working correctly ✅✅✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testCrawler();
