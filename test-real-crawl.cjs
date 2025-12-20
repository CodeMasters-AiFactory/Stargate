// Test the actual multi-page crawler on example.com
const http = require('http');

// Trigger the crawl API
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/scraper/crawl-multipage/proof-1765558642134',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

console.log('Triggering crawl...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(JSON.stringify({ sourceUrl: 'https://example.com' }));
req.end();

