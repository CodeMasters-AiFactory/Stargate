/**
 * ABSOLUTE MINIMAL AZURE SERVER - CommonJS Format
 *
 * This is the most basic possible server to verify Azure can run Node.js
 * If this doesn't work, the issue is with Azure configuration, not our code.
 */

console.log('='.repeat(50));
console.log('AZURE MINIMAL SERVER STARTING');
console.log('Time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('PORT:', process.env.PORT);
console.log('='.repeat(50));

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

console.log('Creating HTTP server...');
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        server: 'azure-minimal-cjs',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        node: process.version,
        port: PORT,
      })
    );
    return;
  }

  // Test endpoint
  if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('AZURE MINIMAL CJS SERVER OK - ' + new Date().toISOString());
    return;
  }

  // Root - try to serve index.html or simple HTML
  if (req.url === '/' || req.url === '') {
    // Try to find and serve index.html
    const indexPaths = [
      path.join(process.cwd(), 'public', 'index.html'),
      path.join(__dirname, 'public', 'index.html'),
      path.join(process.cwd(), 'dist', 'public', 'index.html'),
      path.join(__dirname, '..', 'dist', 'public', 'index.html'),
      path.join(process.cwd(), 'dist', 'index.html'),
    ];

    for (const indexPath of indexPaths) {
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(indexPath, 'utf8'));
        return;
      }
    }

    // Fallback HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head><title>Stargate Portal</title></head>
<body>
<h1>Stargate Portal</h1>
<p>Azure Minimal Server Running!</p>
<p>Time: ${new Date().toISOString()}</p>
<p>Node: ${process.version}</p>
<ul>
  <li><a href="/api/health">Health Check</a></li>
  <li><a href="/test">Test Endpoint</a></li>
</ul>
</body>
</html>`);
    return;
  }

  // Static file serving for assets
  const publicDirs = [
    path.join(process.cwd(), 'public'),
    path.join(__dirname, 'public'),
    path.join(process.cwd(), 'dist', 'public'),
  ];

  // Try to serve static file
  for (const publicDir of publicDirs) {
    const filePath = path.join(publicDir, req.url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  // SPA fallback - serve index.html for client-side routing
  if (!req.url.startsWith('/api')) {
    for (const publicDir of publicDirs) {
      const indexPath = path.join(publicDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(indexPath, 'utf8'));
        return;
      }
    }
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: req.url }));
});

console.log('Starting server on port', PORT);

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('SERVER STARTED SUCCESSFULLY');
  console.log('Port:', PORT);
  console.log('URL: http://0.0.0.0:' + PORT);
  console.log('Time:', new Date().toISOString());
  console.log('='.repeat(50));
});

server.on('error', err => {
  console.error('SERVER ERROR:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', reason => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});
