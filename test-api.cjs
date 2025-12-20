// Quick API test
const http = require('http');

const data = JSON.stringify({
  message: 'change villa to villas please',
  currentHtml: '<h1>VILLA</h1><p>Best VILLA for you</p>',
  context: { businessName: 'Test' }
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/website-editor/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
    const result = JSON.parse(body);
    console.log('\nUpdated HTML:', result.updatedHtml);
    console.log('\nMessage:', result.message);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
