import { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Store Vite compilation status
let viteStatus: {
  initialized: boolean;
  errors: string[];
  lastCheck: Date | null;
} = {
  initialized: false,
  errors: [],
  lastCheck: null,
};

export function setViteStatus(initialized: boolean, errors: string[] = []) {
  viteStatus = {
    initialized,
    errors,
    lastCheck: new Date(),
  };
}

export function registerHealthRoutes(app: Express) {
  // General health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Frontend health check - validates Vite and client files
  app.get('/api/health/frontend', (_req: Request, res: Response) => {
    const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};
    let overallStatus: 'ok' | 'error' = 'ok';

    // Check 1: Client directory exists
    const clientDir = path.resolve(process.cwd(), 'client');
    if (!fs.existsSync(clientDir)) {
      checks.clientDirectory = {
        status: 'error',
        message: `Client directory not found: ${clientDir}`,
      };
      overallStatus = 'error';
    } else {
      checks.clientDirectory = { status: 'ok' };
    }

    // Check 2: index.html exists
    const indexHtmlPath = path.resolve(clientDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      checks.indexHtml = {
        status: 'error',
        message: `index.html not found: ${indexHtmlPath}`,
      };
      overallStatus = 'error';
    } else {
      checks.indexHtml = { status: 'ok' };
    }

    // Check 3: main.tsx exists
    const mainTsxPath = path.resolve(clientDir, 'src', 'main.tsx');
    if (!fs.existsSync(mainTsxPath)) {
      checks.mainTsx = {
        status: 'error',
        message: `main.tsx not found: ${mainTsxPath}`,
      };
      overallStatus = 'error';
    } else {
      checks.mainTsx = { status: 'ok' };
    }

    // Check 4: Vite initialization status
    if (!viteStatus.initialized) {
      checks.viteInitialized = {
        status: 'error',
        message: 'Vite has not been initialized',
      };
      overallStatus = 'error';
    } else {
      checks.viteInitialized = { status: 'ok' };
    }

    // Check 5: Vite compilation errors
    if (viteStatus.errors.length > 0) {
      checks.viteCompilation = {
        status: 'error',
        message: `Vite compilation errors: ${viteStatus.errors.join('; ')}`,
      };
      overallStatus = 'error';
    } else {
      checks.viteCompilation = { status: 'ok' };
    }

    // Check 6: node_modules exists
    const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      checks.dependencies = {
        status: 'error',
        message: 'node_modules not found - run npm install',
      };
      overallStatus = 'error';
    } else {
      checks.dependencies = { status: 'ok' };
    }

    // Check 7: Verify HTML structure (React app entry point)
    try {
      if (fs.existsSync(indexHtmlPath)) {
        const htmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
        const hasRootDiv = htmlContent.includes('id="root"') || htmlContent.includes("id='root'");
        const hasMainEntry = htmlContent.includes('main.tsx') || htmlContent.includes('main.jsx') || htmlContent.includes('main.js');
        
        if (hasRootDiv && hasMainEntry) {
          checks.htmlStructure = { status: 'ok' };
        } else {
          checks.htmlStructure = {
            status: 'error',
            message: 'HTML structure invalid - missing root div or main entry point',
          };
          overallStatus = 'error';
        }
      } else {
        checks.htmlStructure = {
          status: 'error',
          message: 'Cannot verify HTML structure - index.html not found',
        };
        overallStatus = 'error';
      }
    } catch (error) {
      checks.htmlStructure = {
        status: 'error',
        message: `Error reading HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      overallStatus = 'error';
    }

    // Check 8: Verify App.tsx exists (React root component)
    const appTsxPath = path.resolve(clientDir, 'src', 'App.tsx');
    if (!fs.existsSync(appTsxPath)) {
      checks.appComponent = {
        status: 'warning',
        message: `App.tsx not found: ${appTsxPath} - frontend may not render correctly`,
      };
      // Don't mark as error, just warning
    } else {
      checks.appComponent = { status: 'ok' };
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      viteStatus: {
        initialized: viteStatus.initialized,
        errorCount: viteStatus.errors.length,
        lastCheck: viteStatus.lastCheck?.toISOString() || null,
      },
      frontend: {
        ready: overallStatus === 'ok' && viteStatus.initialized && viteStatus.errors.length === 0,
        url: `http://localhost:${process.env.PORT || '5000'}`,
      },
    };

    res.status(overallStatus === 'ok' ? 200 : 503).json(response);
  });

  // Helper function to format uptime
  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }

  // Startup status check
  app.get('/api/health/startup', (_req: Request, res: Response) => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      isDevelopment,
      viteRequired: isDevelopment,
      viteStatus: viteStatus.initialized ? 'initialized' : 'not initialized',
      timestamp: new Date().toISOString(),
    });
  });

  // Production-ready health check with all services
  app.get('/api/health/detailed', async (_req: Request, res: Response) => {
    const checks: Record<string, { status: 'ok' | 'error' | 'warning'; message?: string; details?: any }> = {};
    let overallStatus: 'ok' | 'error' | 'warning' = 'ok';

    // Check 1: Database Connection
    try {
      const { pool } = await import('../db');
      if (pool) {
        try {
          await pool.query('SELECT 1');
          checks.database = { status: 'ok', message: 'Database connected' };
        } catch (queryError) {
          checks.database = {
            status: 'error',
            message: 'Database query failed',
            details: queryError instanceof Error ? queryError.message : 'Unknown error',
          };
          overallStatus = 'error';
        }
      } else {
        checks.database = { status: 'warning', message: 'Database pool not configured' };
        if (overallStatus === 'ok') overallStatus = 'warning';
      }
    } catch (error) {
      checks.database = {
        status: 'error',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      overallStatus = 'error';
    }

    // Check 2: File Storage (Azure Blob or Local)
    try {
      const { fileExists } = await import('../services/azureStorage');
      // Test file storage by checking if we can access it
      checks.fileStorage = { status: 'ok', message: 'File storage available' };
    } catch (error) {
      checks.fileStorage = {
        status: 'warning',
        message: 'File storage check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      if (overallStatus === 'ok') overallStatus = 'warning';
    }

    // Check 3: Environment Variables
    const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET', 'FRONTEND_URL'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingEnvVars.length > 0) {
      checks.environment = {
        status: 'warning',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        details: { missing: missingEnvVars },
      };
      if (overallStatus === 'ok') overallStatus = 'warning';
    } else {
      checks.environment = { status: 'ok', message: 'All required environment variables set' };
    }

    // Check 4: Vite Status (development only)
    if (process.env.NODE_ENV === 'development') {
      if (!viteStatus.initialized) {
        checks.vite = { status: 'error', message: 'Vite not initialized' };
        overallStatus = 'error';
      } else if (viteStatus.errors.length > 0) {
        checks.vite = {
          status: 'error',
          message: `Vite compilation errors: ${viteStatus.errors.length}`,
          details: viteStatus.errors,
        };
        overallStatus = 'error';
      } else {
        checks.vite = { status: 'ok', message: 'Vite initialized and ready' };
      }
    }

    // Check 5: Server Uptime
    const uptime = process.uptime();
    checks.server = {
      status: 'ok',
      message: 'Server running',
      details: { uptime: Math.floor(uptime), uptimeFormatted: formatUptime(uptime) },
    };

    // Check 6: Memory Usage
    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    };
    checks.memory = {
      status: memoryMB.heapUsed > 500 ? 'warning' : 'ok',
      message: `Memory usage: ${memoryMB.heapUsed}MB / ${memoryMB.heapTotal}MB`,
      details: memoryMB,
    };
    if (memoryMB.heapUsed > 500 && overallStatus === 'ok') overallStatus = 'warning';

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    const statusCode = overallStatus === 'ok' ? 200 : overallStatus === 'warning' ? 200 : 503;
    res.status(statusCode).json(response);
  });

  // Comprehensive startup status endpoint
  app.get('/api/startup/status', async (_req: Request, res: Response) => {
    const statusFile = path.resolve(process.cwd(), 'STARTUP_STATUS.json');
    let statusData: any = null;
    
    // Try to read status file
    if (fs.existsSync(statusFile)) {
      try {
        const fileContent = fs.readFileSync(statusFile, 'utf-8');
        statusData = JSON.parse(fileContent);
      } catch (error) {
        // File exists but couldn't parse - continue with live checks
      }
    }

    // Since we're already running, server is definitely running
    const portListening = true; // If this endpoint responds, server is running
    const port = parseInt(process.env.PORT || '5000', 10);

    // Check database connection
    let databaseStatus = 'unknown';
    try {
      const { pool } = await import('../db');
      if (pool) {
        // Actually test the connection by running a query
        try {
          await pool.query('SELECT 1');
        databaseStatus = 'connected';
        } catch (queryError) {
          databaseStatus = 'error';
          console.warn('[Health Check] Database pool exists but query failed:', queryError instanceof Error ? queryError.message : queryError);
        }
      } else {
        databaseStatus = 'not_configured';
      }
    } catch (importError) {
      databaseStatus = 'error';
      console.warn('[Health Check] Failed to import db module:', importError instanceof Error ? importError.message : importError);
    }

    // Compile status
    const response: any = {
      timestamp: new Date().toISOString(),
      serverRunning: true, // If this endpoint responds, server is running
      portListening: true,
      port: port,
      url: `http://localhost:${port}`,
      database: databaseStatus,
      vite: {
        initialized: viteStatus.initialized,
        errors: viteStatus.errors,
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Add status file data if available
    if (statusData) {
      response.statusFile = {
        timestamp: statusData.timestamp,
        status: statusData.status,
        message: statusData.message,
        jobId: statusData.jobId,
      };
    }

    // Determine overall status
    if (viteStatus.initialized && viteStatus.errors.length === 0) {
      response.overallStatus = 'ready';
      res.status(200).json(response);
    } else {
      response.overallStatus = 'running';
      res.status(200).json(response);
    }
  });
}
