/**
 * TRULY MINIMAL SERVER - FOR TESTING ONLY
 * This server has ONLY what's needed to load the React app
 * No route registrations from server/routes.ts
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';

const app = express();
const port = 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'minimal' });
});

// Vite middleware
console.log('Setting up Vite...');
const { createServer: createViteServer } = await import('vite');
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
});
app.use(vite.middlewares);
console.log('✅ Vite ready');

// Start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server running at http://localhost:${port}`);
});
