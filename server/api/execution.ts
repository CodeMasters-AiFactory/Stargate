import type { Express, Request, Response } from "express";
import { containerRuntime, type ExecutionRequest } from '../container/runtime';
import { packageManager } from '../container/package-manager';
import { randomUUID } from 'crypto';

export function registerExecutionRoutes(app: Express) {
  // Execute code endpoint
  app.post("/api/execute", async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, language, code, files, command } = req.body;
      
      if (!projectId || !language || !code) {
        res.status(400).json({
          error: "Missing required fields: projectId, language, code"
        });
        return;
      }

      const request: ExecutionRequest = {
        id: randomUUID(),
        projectId,
        language,
        code,
        command,
        files: files || {},
        environment: {
          NODE_ENV: 'development',
          STARGATE_MODE: 'container'
        }
      };

      const result = await containerRuntime.executeCode(request);
      
      res.json({
        success: result.exitCode === 0,
        output: result.stdout,
        errors: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration,
        executionId: result.id
      });

    } catch (_error: unknown) {
      res.status(500).json({
        error: "Execution failed",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  // Terminal command endpoint
  app.post("/api/terminal", async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, command, workingDir } = req.body;

      if (!projectId || !command) {
        res.status(400).json({
          error: "Missing required fields: projectId, command"
        });
        return;
      }

      // Map common terminal commands to appropriate languages/containers
      const languageMap: Record<string, string> = {
        'npm': 'javascript',
        'node': 'javascript',
        'python': 'python',
        'pip': 'python',
        'java': 'java',
        'javac': 'java',
        'go': 'go',
        'cargo': 'rust',
        'rustc': 'rust',
        'g++': 'cpp',
        'gcc': 'cpp'
      };

      const commandParts = command.trim().split(' ');
      const baseCommand = commandParts[0];
      const language = languageMap[baseCommand] || 'javascript'; // Default to Node.js

      const request: ExecutionRequest = {
        id: randomUUID(),
        projectId,
        language,
        code: '', // No code for terminal commands
        command,
        workingDir: workingDir || '/workspace'
      };

      const result = await containerRuntime.executeCode(request);
      
      res.json({
        success: result.exitCode === 0,
        output: result.stdout,
        errors: result.stderr,
        exitCode: result.exitCode,
        duration: result.duration,
        command: command
      });

    } catch (_error: unknown) {
      res.status(500).json({
        error: "Terminal command failed",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  // Package management endpoints
  app.post("/api/packages/install", async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, language, packages } = req.body;

      if (!projectId || !language || !packages || !Array.isArray(packages)) {
        res.status(400).json({
          error: "Missing or invalid fields: projectId, language, packages (array)"
        });
        return;
      }

      const result = await packageManager.installPackages({
        projectId,
        language,
        packages
      });

      res.json({
        success: result.success,
        output: result.stdout,
        errors: result.stderr,
        duration: result.duration,
        installedPackages: result.installedPackages
      });

    } catch (_error: unknown) {
      res.status(500).json({
        error: "Package installation failed",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  app.get("/api/packages/:projectId/:language", async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, language } = req.params;
      
      const packages = await packageManager.getInstalledPackages(projectId, language);
      
      res.json({
        projectId,
        language,
        packages
      });

    } catch (_error: unknown) {
      res.status(500).json({
        error: "Failed to get packages",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  // Container management endpoints
  app.get("/api/containers/active", async (req: Request, res: Response): Promise<void> => {
    try {
      const containers = await containerRuntime.getActiveContainers();
      res.json(containers);
    } catch (_error: unknown) {
      res.status(500).json({
        error: "Failed to get active containers",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  app.post("/api/containers/:requestId/stop", async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const success = await containerRuntime.stopContainer(requestId);
      
      res.json({
        success,
        message: success ? "Container stopped" : "Container not found or already stopped"
      });

    } catch (_error: unknown) {
      res.status(500).json({
        error: "Failed to stop container",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  // Language support endpoint
  app.get("/api/languages", async (req: Request, res: Response): Promise<void> => {
    try {
      const supportedLanguages = await containerRuntime.getLanguageSupport();
      res.json({
        languages: supportedLanguages,
        total: supportedLanguages.length
      });
    } catch (_error: unknown) {
      res.status(500).json({
        error: "Failed to get supported languages",
        message: _error instanceof Error ? _error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/execution/health", async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await containerRuntime.healthCheck();
      res.json(health);
    } catch (_error: unknown) {
      res.status(500).json({
        status: 'error',
        details: {
          error: _error instanceof Error ? _error.message : "Unknown error"
        }
      });
    }
  });
}