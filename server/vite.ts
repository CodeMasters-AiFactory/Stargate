import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { createLogger, createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";
// nanoid import removed - was causing constant reloads
import { setViteStatus } from "./routes/health";

const viteLogger = createLogger();
const compilationErrors: string[] = [];

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, _server: Server) {
  compilationErrors.length = 0; // Clear previous errors

  try {
    log('🔍 Running pre-flight checks...');

    // Pre-flight validation checks
    const clientDir = path.resolve(import.meta.dirname, "..", "client");
    const indexHtmlPath = path.resolve(clientDir, "index.html");
    const mainTsxPath = path.resolve(clientDir, "src", "main.tsx");
    const appTsxPath = path.resolve(clientDir, "src", "App.tsx");
    const nodeModulesPath = path.resolve(import.meta.dirname, "..", "node_modules");

    // Check 1: Client directory
    if (!fs.existsSync(clientDir)) {
      const error = `Client directory not found: ${clientDir}`;
      log(`❌ ${error}`);
      compilationErrors.push(error);
      setViteStatus(false, compilationErrors);
      throw new Error(error);
    }
    log(`✅ Client directory found: ${clientDir}`);

    // Check 2: index.html
    if (!fs.existsSync(indexHtmlPath)) {
      const error = `index.html not found: ${indexHtmlPath}`;
      log(`❌ ${error}`);
      compilationErrors.push(error);
      setViteStatus(false, compilationErrors);
      throw new Error(error);
    }
    log(`✅ index.html found: ${indexHtmlPath}`);

    // Check 3: main.tsx
    if (!fs.existsSync(mainTsxPath)) {
      const error = `main.tsx not found: ${mainTsxPath}`;
      log(`❌ ${error}`);
      compilationErrors.push(error);
      setViteStatus(false, compilationErrors);
      throw new Error(error);
    }
    log(`✅ main.tsx found: ${mainTsxPath}`);

    // Check 4: App.tsx
    if (!fs.existsSync(appTsxPath)) {
      const error = `App.tsx not found: ${appTsxPath}`;
      log(`❌ ${error}`);
      compilationErrors.push(error);
      setViteStatus(false, compilationErrors);
      throw new Error(error);
    }
    log(`✅ App.tsx found: ${appTsxPath}`);

    // Check 5: node_modules
    if (!fs.existsSync(nodeModulesPath)) {
      const error = `node_modules not found: ${nodeModulesPath} - Run 'npm install'`;
      log(`❌ ${error}`);
      compilationErrors.push(error);
      setViteStatus(false, compilationErrors);
      throw new Error(error);
    }
    log(`✅ node_modules found`);

    log('✅ All pre-flight checks passed');
    log('⚡ Initializing Vite server...');

    // Get the port from environment variable (server.listen hasn't been called yet)
    // Default to 5000 if not specified
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = process.env.HOST || 'localhost';

    log(`🔌 Configuring Vite HMR on ${host}:${port}`);

    const serverOptions = {
      middlewareMode: true,
      // Enable HMR for development hot reloading
      hmr: true as const,
      allowedHosts: true as const,
    };

    log('Creating Vite server instance...');
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      logLevel: 'warn', // Reduce verbosity - only show warnings and errors
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          const errorMsg = typeof msg === 'string' ? msg : String(msg);
          log(`❌ Vite compilation error: ${errorMsg}`);
          compilationErrors.push(errorMsg);
          setViteStatus(false, compilationErrors);
        },
        warn: (msg, options) => {
          // Only log critical warnings, suppress HMR and file change warnings
          const msgStr = typeof msg === 'string' ? msg : String(msg);
          if (!msgStr.includes('HMR') && !msgStr.includes('file changed') &&
              !msgStr.includes('reload') && !msgStr.includes('transforming')) {
            viteLogger.warn(msg, options);
          }
        },
        info: () => {
          // Suppress all info logs to reduce console spam
        },
        clearScreen: () => {
          // Suppress clear screen to reduce console spam
        },
      },
      server: {
        ...serverOptions,
        // CRITICAL: Enable HMR - Vite automatically handles cache-busting
        hmr: serverOptions.hmr,
        watch: {
          // Ignore patterns to prevent excessive file watching
          ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/*.log', '**/website_projects/**', '**/.cursor/**', '**/logs/**'],
          usePolling: false, // Use native file events
        },
      },
      appType: "custom",
    });

    // Listen for Vite error events
    vite.ws.on('error', (error: Error) => {
      const errorMsg = `Vite WebSocket error: ${error.message}`;
      log(`❌ ${errorMsg}`);
      compilationErrors.push(errorMsg);
      setViteStatus(false, compilationErrors);
    });

    log('✅ Vite server created, setting up middleware...');

    // CRITICAL FIX: Vite middleware ONLY handles Vite-specific requests
    // API routes and HTML requests must go through Express routes first
    app.use((req, res, next) => {
      const url = req.url || req.originalUrl || '';

      // NEVER let Vite handle API routes
      if (url.startsWith('/api')) {
        return next();
      }

      // Check if file exists in public folder FIRST - before any route checks
      // This prevents /merlin.jpg from matching /merlin route
      if (url.match(/\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
        const publicPath = path.resolve(process.cwd(), "client", "public", url.slice(1));
        if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
          return next(); // Let Express static middleware handle it
        }
      }

      // Let Express handle all frontend routes (SPA routing)
      // These will be caught by the catch-all route that serves index.html
      // NOTE: Must check exact paths, not startsWith, to avoid matching /merlin.jpg
      if (url === '/' || 
          url.startsWith('/#') ||
          (url.startsWith('/merlin') && !url.match(/\.(jpg|jpeg|png|gif|svg|ico)$/i)) ||
          url.startsWith('/admin') ||
          url.startsWith('/stargate-websites') ||
          url.startsWith('/website-builder')) {
        return next();
      }

      // ONLY let Vite handle:
      // - Vite client requests (@vite/client, /@vite/*)
      // - Source files (/src/*)
      // - Module requests (WebSocket upgrades for HMR)
      // - Asset files that Vite serves
      if (url.startsWith('/@') ||
          url.startsWith('/src/') ||
          url.startsWith('/node_modules/') ||
          url.match(/\.(tsx?|jsx?|css|json|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|map)$/i)) {
        return vite.middlewares(req, res, next);
      }

      // Everything else goes to Express routes
      next();
    });

    log('Setting up catch-all route for frontend...');
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      console.log(`[VITE CATCH-ALL] Received request: ${url}`);

      // Skip API routes
      if (url.startsWith("/api")) {
        console.log(`[VITE CATCH-ALL] Skipping API route: ${url}`);
        return next();
      }

      // Get the path without query params for checking
      const urlPath = url.split('?')[0];

      // Skip module requests - let Vite middleware handle them
      // This includes .tsx, .ts, .jsx, .js, .css, and other asset files
      // Also skip Vite HMR requests and node_modules
      if (urlPath.match(/\.(tsx?|jsx?|css|json|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|map)$/i) ||
          url.startsWith("/@") ||
          url.startsWith("/node_modules/") ||
          url.startsWith("/src/")) {
        return next(); // Let Vite middleware handle this
      }

      try {
        console.log(`[VITE CATCH-ALL] Starting HTML transformation for: ${url}`);
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        // Read index.html from disk (Vite will handle cache busting via HMR)
        console.log(`[VITE CATCH-ALL] Reading template from: ${clientTemplate}`);
        const template = await fs.promises.readFile(clientTemplate, "utf-8");
        console.log(`[VITE CATCH-ALL] Template read successfully, length: ${template.length}`);
        // Don't add random query params - Vite HMR handles cache busting
        // This was causing constant reloads and flickering

        // FIX: Add timeout to prevent Vite transformIndexHtml from hanging on Windows
        const transformWithTimeout = Promise.race([
          vite.transformIndexHtml(url, template),
          new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Vite transform timeout')), 5000)
          )
        ]);

        let page: string;
        try {
          page = await transformWithTimeout;
        } catch (timeoutError) {
          // Fallback: If Vite hangs, serve the template directly with manual script injection
          log('⚠️  Vite transform timed out, serving template directly');
          page = template.replace('</head>', `
            <script type="module">
              import RefreshRuntime from '/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
            </script>
            </head>`);
        }

        // Add cache-busting headers for HTML responses in development
        const headers: Record<string, string> = { "Content-Type": "text/html" };
        if (process.env.NODE_ENV === 'development') {
          headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0';
          headers['Pragma'] = 'no-cache';
          headers['Expires'] = '0';
        }

        res.status(200).set(headers).end(page);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        log(`❌ Error serving ${url}: ${errorMsg}`);
        compilationErrors.push(`Route serving error: ${errorMsg}`);
        setViteStatus(false, compilationErrors);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    // Test compilation by attempting to transform a simple file
    try {
      log('🧪 Testing Vite compilation...');
      await vite.transformRequest('/src/main.tsx', { ssr: false });
      log('✅ Vite compilation test passed');
      setViteStatus(true, []);
    } catch (compileError: unknown) {
      const errorMsg = `Compilation test failed: ${compileError instanceof Error ? compileError.message : String(compileError)}`;
      log(`❌ ${errorMsg}`);
      compilationErrors.push(errorMsg);
      setViteStatus(false, compilationErrors);
      // Don't throw - allow server to start but mark as unhealthy
      log('⚠️ Vite initialized but compilation has errors - check /api/health/frontend');
    }

    log('✅ Vite setup complete');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    log(`❌ Vite setup failed: ${errorMessage}`);
    console.error('Vite setup error details:', error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
