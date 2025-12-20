import type { Express } from "express";
import { containerRuntime, type ExecutionRequest } from '../container/runtime';
import { packageManager } from '../container/package-manager';
import { randomUUID } from 'crypto';

export function registerExecutionRoutes(app: Express) {
  // Execute code endpoint
  app.post("/api/execute", async (req, res) => {
    try {
      const { projectId, language, code, files, command } = req.body;
      
      if (!projectId || !language || !code) {
        return res.status(400).json({ 
          error: "Missing required fields: projectId, language, code" 
        });
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

    } catch (error) {
      res.status(500).json({
        error: "Execution failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Terminal command endpoint
  app.post("/api/terminal", async (req, res) => {
    try {
      const { projectId, command, workingDir } = req.body;

      if (!projectId || !command) {
        return res.status(400).json({
          error: "Missing required fields: projectId, command"
        });
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

    } catch (error) {
      res.status(500).json({
        error: "Terminal command failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Package management endpoints
  app.post("/api/packages/install", async (req, res) => {
    try {
      const { projectId, language, packages } = req.body;

      if (!projectId || !language || !packages || !Array.isArray(packages)) {
        return res.status(400).json({
          error: "Missing or invalid fields: projectId, language, packages (array)"
        });
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

    } catch (error) {
      res.status(500).json({
        error: "Package installation failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/packages/:projectId/:language", async (req, res) => {
    try {
      const { projectId, language } = req.params;
      
      const packages = await packageManager.getInstalledPackages(projectId, language);
      
      res.json({
        projectId,
        language,
        packages
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to get packages",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Container management endpoints
  app.get("/api/containers/active", async (req, res) => {
    try {
      const containers = await containerRuntime.getActiveContainers();
      res.json(containers);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get active containers",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/containers/:requestId/stop", async (req, res) => {
    try {
      const { requestId } = req.params;
      const success = await containerRuntime.stopContainer(requestId);
      
      res.json({
        success,
        message: success ? "Container stopped" : "Container not found or already stopped"
      });

    } catch (error) {
      res.status(500).json({
        error: "Failed to stop container",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Language support endpoint
  app.get("/api/languages", async (req, res) => {
    try {
      const supportedLanguages = await containerRuntime.getLanguageSupport();
      res.json({
        languages: supportedLanguages,
        total: supportedLanguages.length
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get supported languages",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/execution/health", async (req, res) => {
    try {
      const health = await containerRuntime.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  });
}