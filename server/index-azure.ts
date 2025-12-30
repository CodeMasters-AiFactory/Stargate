/**
 * AZURE MINIMAL PRODUCTION SERVER
 *
 * Ultra-minimal server for Azure App Service deployment debugging.
 * This server does NOT connect to the database, does NOT load complex routes.
 * It ONLY serves static files and provides health checks.
 *
 * Once this works on Azure, we can gradually add features back.
 */

// Immediate startup logging
console.log('=====================================');
console.log('[AZURE] Server starting...');
console.log('[AZURE] Time:', new Date().toISOString());
console.log('[AZURE] Node:', process.version);
console.log('[AZURE] PORT:', process.env.PORT);
console.log('[AZURE] NODE_ENV:', process.env.NODE_ENV);
console.log('[AZURE] CWD:', process.cwd());
console.log('=====================================');

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

console.log('[AZURE] Imports completed');

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[AZURE] __dirname:', __dirname);

// Initialize Express
const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

console.log('[AZURE] Express initialized, target port:', port);

// Error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('[AZURE] UNCAUGHT EXCEPTION:', error.message);
  console.error('[AZURE] Stack:', error.stack);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[AZURE] UNHANDLED REJECTION:', reason);
});

// Minimal middleware
app.use(express.json({ limit: '10mb' }));

// CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request logging
app.use((req: Request, _res: Response, next: NextFunction): void => {
  console.log(`[AZURE] ${req.method} ${req.url}`);
  next();
});

// ============================================
// HEALTH CHECK ROUTES (Critical for Azure)
// ============================================

app.get('/api/health', (_req: Request, res: Response): void => {
  console.log('[AZURE] Health check hit');
  res.json({
    status: 'ok',
    server: 'azure-minimal',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    node_version: process.version,
    port: port,
  });
});

app.get('/test', (_req: Request, res: Response): void => {
  console.log('[AZURE] Test route hit');
  res.send('AZURE MINIMAL SERVER OK - ' + new Date().toISOString());
});

app.get('/', (_req: Request, res: Response): void => {
  console.log('[AZURE] Root route hit');
  // Try to serve index.html if it exists
  const distPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
  if (fs.existsSync(distPath)) {
    res.sendFile(distPath);
    return;
  }
  // Otherwise send a simple response
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Stargate Portal</title></head>
    <body>
      <h1>Stargate Portal - Azure</h1>
      <p>Server is running!</p>
      <p>Time: ${new Date().toISOString()}</p>
      <p><a href="/api/health">Health Check</a></p>
      <p><a href="/test">Test Endpoint</a></p>
    </body>
    </html>
  `);
});

// ============================================
// STATIC FILE SERVING
// ============================================

const distPublicPath = path.join(process.cwd(), 'dist', 'public');
console.log('[AZURE] Looking for static files at:', distPublicPath);

if (fs.existsSync(distPublicPath)) {
  console.log('[AZURE] Found dist/public, serving static files');
  app.use(express.static(distPublicPath));

  // List files in dist/public
  try {
    const files = fs.readdirSync(distPublicPath);
    console.log('[AZURE] Files in dist/public:', files.slice(0, 10).join(', '));
  } catch (_error: unknown) {
    console.log('[AZURE] Could not list dist/public contents');
  }
} else {
  console.log('[AZURE] dist/public not found, will serve minimal HTML');
}

// SPA fallback
app.get('*', (req: Request, res: Response): void => {
  // Skip API routes
  if (req.url.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }

  const indexPath = path.join(distPublicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
    return;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Stargate Portal</title></head>
    <body>
      <h1>Stargate Portal</h1>
      <p>Page: ${req.url}</p>
      <p>Static files not built. Run npm run build first.</p>
    </body>
    </html>
  `);
});

// ============================================
// START SERVER
// ============================================

const server = createServer(app);

console.log('[AZURE] About to call server.listen on port', port);

server.listen(port, '0.0.0.0', () => {
  console.log('=====================================');
  console.log('[AZURE] SERVER STARTED SUCCESSFULLY');
  console.log('=====================================');
  console.log(`[AZURE] Port: ${port}`);
  console.log(`[AZURE] URL: http://0.0.0.0:${port}`);
  console.log(`[AZURE] Time: ${new Date().toISOString()}`);
  console.log('=====================================');
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('[AZURE] Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`[AZURE] Port ${port} already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[AZURE] SIGTERM - shutting down');
  server.close(() => {
    console.log('[AZURE] Server closed');
    process.exit(0);
  });
});
