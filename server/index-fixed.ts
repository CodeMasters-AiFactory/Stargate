import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import { getErrorMessage, logError } from './utils/errorHandler';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
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

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = createServer(app);
  await registerRoutes(app, server);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logError(err, 'Index Fixed - Error handler');
    const status = (err && typeof err === 'object' && 'status' in err) ? (err.status as number) : 
                   (err && typeof err === 'object' && 'statusCode' in err) ? (err.statusCode as number) : 500;
    const message = getErrorMessage(err);
    res.status(status).json({ message });
    // Don't throw - error handler should not throw
  });

  // Setup Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

    // Serve index.html for any non-API route
    app.get('/', async (req, res, next) => {
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
        logError(e, 'Index Fixed - Vite transform');
        if (e instanceof Error && vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e instanceof Error ? e : new Error(getErrorMessage(e)));
      }
    });
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Stargate IDE server running on port ${port}`);
    console.log(`🔗 Visit: http://localhost:${port}`);
  });
})();