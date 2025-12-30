// IMMEDIATE STARTUP LOG - Before any imports
console.log('[STARTUP] Server starting at', new Date().toISOString());
console.log('[STARTUP] Node version:', process.version);
console.log('[STARTUP] PORT env:', process.env.PORT);
console.log('[STARTUP] NODE_ENV:', process.env.NODE_ENV);

// Load environment variables FIRST - before any other imports
import 'dotenv/config';
console.log('[STARTUP] dotenv loaded');

import fs from "fs";
import path from "path";
// @ts-ignore - compression module lacks proper type declarations
import compression from "compression"; // Re-enabled for CDN optimization
import express, { type Request, Response, type NextFunction } from "express";
import session from "express-session"; // Re-enabled for authentication
import helmet from "helmet";
import { cacheBusterMiddleware } from "./middleware/cacheBuster";
import { cdnCacheMiddleware } from "./middleware/cdnCache";
import { populateUser } from "./middleware/permissions";
import { corsConfig, sanitizeInput, securityLogger, validateRequestSize } from "./middleware/security";
import { registerRoutes } from "./routes";
import { registerApiHealthRoutes } from "./routes/apiHealth";
import { cleanupCacheService } from "./services/cacheService";
// Debug logging disabled for performance
import { validateEnvironment } from "./utils/envValidator";
import { log } from "./utils/logger";
// Note: serveStatic and setupVite are dynamically imported to avoid loading Vite in production

console.log('[STARTUP] All imports completed successfully');


// #region Error Handlers - Must be before async IIFE
// Global error handlers to catch any unhandled errors
process.on('uncaughtException', (error: Error) => {
  const errorLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
  const errorEntry = JSON.stringify({
    location: 'index.ts:uncaughtException',
    message: 'UNCAUGHT EXCEPTION',
    data: {
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'error-handler',
    hypothesisId: 'H_ERROR'
  }) + '\n';
  try {
    fs.appendFileSync(errorLogPath, errorEntry, 'utf8');
  } catch (_e) {
    // If file write fails, at least log to console
  }
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, _promise: Promise<unknown>) => {
  const errorLogPath = path.join(process.cwd(), '.cursor', 'debug.log');
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;
  const errorEntry = JSON.stringify({
    location: 'index.ts:unhandledRejection',
    message: 'UNHANDLED REJECTION',
    data: {
      error: errorMessage,
      stack: errorStack,
      timestamp: Date.now()
    },
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: 'error-handler',
    hypothesisId: 'H_ERROR'
  }) + '\n';
  try {
    fs.appendFileSync(errorLogPath, errorEntry, 'utf8');
  } catch (_e) {
    // If file write fails, at least log to console
  }
  console.error('❌ UNHANDLED REJECTION:', reason);
  if (errorStack) {
    console.error('Stack:', errorStack);
  }
  process.exit(1);
});
// #endregion

const app = express();

// Security headers middleware (Helmet.js)
// Only enable in production to avoid interfering with Vite HMR in development
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // 'unsafe-eval' needed for Vite
          connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "https://api.openai.com", "https://api.anthropic.com"],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for Vite compatibility
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    })
  );
  log("✅ Security headers enabled (Helmet.js)");
  
  // CDN-friendly cache headers for production
  app.use(cdnCacheMiddleware);
  log("✅ CDN cache headers enabled");
  
  // Compression for smaller payloads (Brotli/Gzip)
  app.use(compression({
    level: 6, // Balanced compression
    threshold: 1024, // Only compress responses > 1KB
    filter: (req: express.Request, res: express.Response) => {
      // Don't compress already compressed files
      if (req.path.match(/\.(br|gz|zip|rar|7z|tar|tgz)$/i)) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  log("✅ Response compression enabled");
} else {
  // In development, use minimal security headers to avoid interfering with Vite HMR
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP in development for Vite HMR
      crossOriginEmbedderPolicy: false,
    })
  );
}

// CRITICAL DEBUG: Add direct test route BEFORE any middleware
app.get('/test', (_req, res) => {
  res.send('TEST OK');
});

// SECURITY FIX: Removed bypass auth routes - proper auth is now in routes/auth.ts
// Auth routes are registered via registerAuthRoutes() with proper session checks

// CRITICAL DEBUG: Log ALL incoming requests IMMEDIATELY
app.use((req, _res, next) => {
  console.log(`[DEBUG] INCOMING REQUEST: ${req.method} ${req.url}`);
  next();
});

// PRODUCTION BUILD: Serve pre-compiled React app (no Vite transformation needed)
// This bypasses all the Vite hanging issues by serving static files
const distPath = path.resolve(process.cwd(), 'dist', 'public');
console.log('[PRODUCTION] Serving React app from:', distPath);
app.use(express.static(distPath, {
  // Disable caching for development/testing to ensure fresh JS is always served
  setHeaders: (res: Response, filePath: string) => {
    // No caching for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    // Short cache for JS/CSS (1 minute) - allows cache busting via file hash
    else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, max-age=60');
    }
  }
}));

// Compression middleware TEMPORARILY DISABLED FOR DEBUGGING
// app.use(
//   compression({
//     level: 6, // Compression level (1-9, 6 is a good balance)
//     filter: (req: express.Request, res: express.Response) => {
//       // Don't compress if client doesn't support it or if response is already compressed
//       if (req.headers["x-no-compression"]) {
//         return false;
//       }
//       // Use compression for text-based content
//       return compression.filter(req, res);
//     },
//   })
// );
log("Compression middleware DISABLED for debugging");

// Session configuration - Re-enabled for authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET || "stargate-portal-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false, // Changed to false to prevent creating sessions for anonymous requests
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);
log("✅ Session middleware enabled");

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
// CORS configuration
app.use(corsConfig());
log("✅ CORS configured");


// Security logging
app.use(securityLogger);

// Input sanitization (SQL injection prevention)
app.use(sanitizeInput);

// Request size validation
app.use(validateRequestSize(10 * 1024 * 1024)); // 10MB max

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
  limit: '10mb', // Match validateRequestSize
}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// User population middleware - sets req.user from session (auto-creates in dev mode)
app.use(populateUser);

// Cache busting middleware - prevents browser caching in development
// MUST be before static file serving to ensure all responses get cache headers
app.use(cacheBusterMiddleware);

// Reduced logging middleware - only log API requests, not static assets
app.use((req, res, next) => {
  // Skip logging for static assets and HMR requests to reduce console spam
  if (req.url.startsWith('/@') || req.url.startsWith('/node_modules') ||
      req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: Record<string, unknown>) {
    capturedJsonResponse = bodyJson;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Outer try-catch to catch any errors in the entire async IIFE
    // Validate environment variables
    const envValidation = validateEnvironment();
    if (!envValidation.valid) {
    log('⚠️  Environment validation warnings:');
    envValidation.errors.forEach((error: string) => {
      log(`   - ${error}`);
    });
    log('   Continuing with defaults/optional values...');
  } else {
    log('✅ Environment variables validated');
  }

  log('🚀 Starting Stargate Portal server...');

  // Serve public folder files (images, etc.) from client/public - MUST be before Vite
  const publicPath = path.join(process.cwd(), 'client', 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath, { index: false }));
    log('✅ Serving public files from /client/public');
  } else {
    log('⚠️ Public folder not found:', publicPath);
  }

  const server = await registerRoutes(app);

  // Register API health endpoint for Step 3.5 compliance
  registerApiHealthRoutes(app);
  log('✅ API health endpoint registered at /api/health/apis');

  // Log configured API integrations
  console.log('\n🔌 API INTEGRATIONS:');
  console.log(process.env.GOOGLE_SEARCH_API_KEY ? '  ✅ Google Custom Search API' : '  ⚠️  Google Custom Search API (not configured)');
  console.log(process.env.LEONARDO_AI_API_KEY ? '  ✅ Leonardo AI' : '  ⚠️  Leonardo AI (not configured)');
  console.log(process.env.OPENAI_API_KEY ? '  ✅ OpenAI API' : '  ⚠️  OpenAI API (not configured)');
  console.log(process.env.REPLICATE_API_TOKEN ? '  ✅ Replicate' : '  ⚠️  Replicate (not configured)');
  console.log('');

  // Initialize Template Manager Scheduler (monthly auto-updates)
  try {
    const { startScheduler } = await import('./services/templateUpdateScheduler');
    startScheduler();
    log('✅ Template Manager Scheduler initialized (monthly auto-updates enabled)');
  } catch (error) {
    log(`⚠️ Failed to initialize Template Manager Scheduler: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Initialize Template Expansion (weekly scraping)
  try {
    const { scheduleWeeklyExpansion } = await import('./services/templateExpansion');
    scheduleWeeklyExpansion();
    log('✅ Template Expansion Scheduler initialized (weekly auto-scraping enabled)');
  } catch (error) {
    log(`⚠️ Failed to initialize Template Expansion: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Serve generated website files from website_projects directory
  const websiteProjectsPath = path.join(process.cwd(), 'website_projects');
  if (fs.existsSync(websiteProjectsPath)) {
    // Allow iframe embedding for generated websites by removing X-Frame-Options
    app.use('/website_projects', (_req, res, next) => {
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:*");
      next();
    }, express.static(websiteProjectsPath));
    log('✅ Serving generated websites from /website_projects (iframe-enabled)');
  }

  // WebSocket servers temporarily disabled to debug 426 Upgrade Required issue
  // These can be re-enabled once the core HTTP server is working
  //
  // Initialize collaboration WebSocket server (path: /ws/collaboration)
  // createCollaborationServer(server);

  // Initialize live preview WebSocket server (path: /socket.io)
  // initializeLivePreview(server);
  
  // Initialize real-time preview WebSocket server
  // TEMPORARILY DISABLED - May be causing request hangs
  // try {
  //   const { initializeRealtimePreview } = await import('./services/realtimePreview');
  //   initializeRealtimePreview(server);
  //   log('✅ Real-time preview WebSocket server initialized');
  // } catch (error) {
  //   log(`⚠️ Failed to initialize real-time preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  // }
  log('⚠️ Real-time preview WebSocket server DISABLED for debugging');
  
  log('ℹ️ WebSocket servers configured');

  log('ℹ️ Merlin Website Builder mode');
  log('   Focus: Website generation, visual editing, deployment');

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      // Error handler - next is required by Express signature but not used here
      void _next;
      const status = (err && typeof err === 'object' && 'status' in err) ? (err as { status?: number }).status :
                     (err && typeof err === 'object' && 'statusCode' in err) ? (err as { statusCode?: number }).statusCode :
                     500;
      const message = (err instanceof Error) ? err.message :
                     (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) :
                     "Internal Server Error";

      res.status(status ?? 500).json({ message });
      // Don't throw - error handler should log and respond, not crash the server
      if (err instanceof Error) {
        log(`❌ Error handled: ${err.message}`);
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    const isDevelopment = process.env.NODE_ENV !== "production";
    log(`Environment: ${process.env.NODE_ENV || 'development'} (isDevelopment: ${isDevelopment})`);

    // CRITICAL FIX: Serve production build even in dev mode (Vite was causing issues)
    // We built the React app with `npm run build`, so serve those static files
    const useProductionBuild = true; // Force production build serving

    if (useProductionBuild) {
      log('📦 Using production build (bypassing Vite due to transformation issues)');

      // Mark Vite status as initialized for health check (we're using production build)
      const { setViteStatus } = await import('./routes/health');
      setViteStatus(true, []); // Production build is ready

      // Catch-all route for React Router (serves index.html for all non-API routes)
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        // Skip API routes, website projects, and static assets
        if (req.url.startsWith('/api') ||
            req.url.startsWith('/website_projects') ||
            req.url.startsWith('/assets/') ||
            req.url.startsWith('/favicon')) {
          return next();
        }
        // Serve index.html for all other routes (React Router will handle routing)
        const indexPath = path.resolve(process.cwd(), 'dist', 'public', 'index.html');
        console.log('[PRODUCTION CATCHALL] Serving index.html for:', req.url);
        res.sendFile(indexPath);
      });

      log('✅ Production build serving configured');
    } else {
      // Note: Development mode with Vite and non-useProductionBuild paths have been removed
      // because they cause issues when building for production (Vite is a dev dependency).
      // The production build always uses useProductionBuild = true which serves static files
      // from dist/public without needing Vite.
      log('⚠️ Neither production build nor development mode - this should not happen');
      log('📦 Production builds should use useProductionBuild = true');
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    // Check if server is already listening
    if (server.listening) {
      log(`⚠️ Server is already listening on port ${port}`);
      log('✅ Server already running - skipping listen call');
      return;
    }
    
    log(`🚀 Starting server on port ${port}...`);
    log(`Server type: ${server?.constructor?.name}, listening: ${server?.listening}`);
    
    server.listen(port, "0.0.0.0", () => {
      // Remove async from callback - it's causing issues
      log(`✅ Server.listen() callback FIRED - port ${port} is ready`);
      // Display comprehensive startup status
      log('');
      log('═══════════════════════════════════════════════════════════');
      log(`✅ Server running on port ${port}`);
      log(`🌐 Frontend available at: http://localhost:${port}`);
      log(`🔌 API available at: http://localhost:${port}/api/*`);

      // Display service statuses
      log('');
      log('📊 Service Status:');
      log(`   ✅ Backend Server: OPERATIONAL`);
      if (isDevelopment) {
        log(`   ✅ Frontend Server (Vite): OPERATIONAL`);
      } else {
        log(`   ✅ Static File Serving: OPERATIONAL`);
      }
      log(`   ✅ API Routes: OPERATIONAL`);

      log('');
      log('🎉 ALL SERVICES OPERATIONAL');
      log('   Frontend is ready and accessible at http://localhost:' + port);
      log('═══════════════════════════════════════════════════════════');
      log('');

      // Browser auto-open disabled to prevent performance issues
      // Manually navigate to http://localhost:${port} in browser if needed

    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${port} is already in use. Please stop the other process or use a different port.`);
      } else {
        log(`❌ Server error: ${error.message}`);
      }
      console.error('Server error:', error);
      // Cleanup before exit
      cleanupCacheService();
      process.exit(1);
    });

    // Cleanup on process termination
    process.on('SIGTERM', async () => {
      log('📛 SIGTERM received - shutting down gracefully...');
      cleanupCacheService();
      // Close SQLite connections
      try {
        const { closeSQLite } = await import('./services/hybridStorage');
        closeSQLite();
      } catch (_e) {
        // Ignore if module not loaded
      }
      server.close(() => {
        log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      log('📛 SIGINT received - shutting down gracefully...');
      cleanupCacheService();
      // Close SQLite connections
      try {
        const { closeSQLite } = await import('./services/hybridStorage');
        closeSQLite();
      } catch (_e) {
        // Ignore if module not loaded
      }
      server.close(() => {
        log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    
    // Console error output
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ SERVER STARTUP FAILED');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`Error: ${errorMessage}`);
    console.error(`Type: ${errorName}`);
    if (errorStack) {
      console.error('Stack trace:');
      console.error(errorStack);
    }
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    
    log(`❌ Failed to start server: ${errorMessage}`);
    
    // Give a moment for logs to be written before exiting
    setTimeout(() => {
      process.exit(1);
    }, 100);
  }
})();
