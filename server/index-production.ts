/**
 * MINIMAL PRODUCTION SERVER
 *
 * This is a streamlined server for production deployment (Azure).
 * It includes only essential features for reliable operation.
 *
 * For full-featured development, use server/index.ts
 */

import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Error handler for uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
  console.error('UNHANDLED REJECTION');
  console.error('Reason:', reason);
});

// ESSENTIAL MIDDLEWARE ONLY
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS - Allow requests from frontend
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Request logging
app.use((req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// CORE ROUTES

// Health check
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'production',
    node_version: process.version,
  });
});

// Test endpoint
app.get('/test', (_req: Request, res: Response): void => {
  res.send('PRODUCTION SERVER OK');
});

// Import all route registration from routes.ts
import { registerRoutes } from './routes.js';

// Register all routes (this includes website builder, health, Merlin 7, and all others)
await registerRoutes(app);

// Frontend serving - use Vite in development, static files in production
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // Development: Use Vite middleware
  console.log('Using Vite dev server for frontend');
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production: Serve static files
  const distPath = path.join(__dirname, '..', 'dist');
  console.log('Serving static files from:', distPath);

  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  }));

  // Fallback to index.html for client-side routing
  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
      next();
      return;
    }

    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err: Error | null) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Error handler (must be last)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('ERROR:', err);
  console.error('Stack:', err.stack);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log('========================================');
  console.log('PRODUCTION SERVER STARTED');
  console.log('========================================');
  console.log(`Port: ${port}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Node: ${process.version}`);
  console.log(`Environment: production`);
  console.log('========================================');
  console.log(`Server ready at: http://localhost:${port}`);
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
