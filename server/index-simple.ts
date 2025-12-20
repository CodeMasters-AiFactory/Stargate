import type { Express } from "express";
import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getErrorMessage, logError } from './utils/errorHandler';

const app: Express = express();

(async () => {
  try {
    console.log("🚀 Starting Stargate IDE server...");
    
    const server = await registerRoutes(app);
    
    app.use((err: unknown, _req: any, res: any, _next: any) => {
      logError(err, 'Index Simple - Error handler');
      const status = (err && typeof err === 'object' && 'status' in err) ? (err.status as number) : 
                     (err && typeof err === 'object' && 'statusCode' in err) ? (err.statusCode as number) : 500;
      const message = getErrorMessage(err);
      res.status(status).json({ message });
    });
    
    // Setup Vite to serve React frontend
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          allowedHosts: true,
          host: true
        },
        appType: 'custom',
        root: path.resolve(process.cwd(), "client"),
        resolve: {
          alias: {
            "@": path.resolve(process.cwd(), "client", "src"),
            "@shared": path.resolve(process.cwd(), "shared"),
            "@assets": path.resolve(process.cwd(), "attached_assets"),
          },
        },
      });

      app.use(vite.middlewares);

      // Serve your beautiful Stargate IDE React frontend
      app.get("/", async (req, res, next) => {
        try {
          const template = await vite.transformIndexHtml(req.originalUrl, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stargate IDE</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
          `);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: unknown) {
          logError(e, 'Index Simple - Vite transform');
          if (e instanceof Error && vite) {
            vite.ssrFixStacktrace(e);
          }
          next(e instanceof Error ? e : new Error(getErrorMessage(e)));
        }
      });
    } else {
      // Fallback for production
      app.get("/", (_req, res) => {
        res.send(`
          <h1>Stargate IDE API Server</h1>
          <p>Server is running successfully!</p>
          <ul>
            <li><a href="/api/agent/memory/status">Memory Status</a></li>
            <li><a href="/api/agent/profiles">Agent Profiles</a></li>
          </ul>
        `);
      });
    }
    
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`✅ Stargate IDE server running on port ${port}`);
      console.log(`🔗 Visit: http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();