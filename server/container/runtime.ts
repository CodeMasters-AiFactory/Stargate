import Docker from 'dockerode';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs/promises';
import type { Container } from 'dockerode';

export interface ExecutionRequest {
  id: string;
  projectId: string;
  language: string;
  code: string;
  command?: string;
  environment?: Record<string, string>;
  workingDir?: string;
  files?: Record<string, string>;
}

export interface ExecutionResult {
  id: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  error?: string;
}

export interface ContainerInfo {
  id: string;
  projectId: string;
  containerId: string;
  language: string;
  status: 'creating' | 'running' | 'stopped' | 'error';
  createdAt: Date;
  lastActivity: Date;
}

interface LanguageConfig {
  image: string;
  command: string[];
  fileExtension: string;
  setup: string[];
}

class ContainerRuntime extends EventEmitter {
  private docker: Docker;
  private containers: Map<string, ContainerInfo> = new Map();
  private readonly tempDir = '/tmp/stargate-containers';

  // Language configurations
  private readonly languageConfigs: Record<string, LanguageConfig> = {
    javascript: {
      image: 'node:18-alpine',
      command: ['node'],
      fileExtension: '.js',
      setup: ['npm install'],
    },
    typescript: {
      image: 'node:18-alpine',
      command: ['npx', 'tsx'],
      fileExtension: '.ts',
      setup: ['npm install -g tsx'],
    },
    python: {
      image: 'python:3.11-alpine',
      command: ['python'],
      fileExtension: '.py',
      setup: ['pip install --upgrade pip'],
    },
    java: {
      image: 'openjdk:17-alpine',
      command: ['java'],
      fileExtension: '.java',
      setup: [],
    },
    go: {
      image: 'golang:1.21-alpine',
      command: ['go', 'run'],
      fileExtension: '.go',
      setup: [],
    },
    rust: {
      image: 'rust:alpine',
      command: ['cargo', 'run'],
      fileExtension: '.rs',
      setup: [],
    },
    cpp: {
      image: 'gcc:alpine',
      command: ['g++', '-o', 'main', 'main.cpp', '&&', './main'],
      fileExtension: '.cpp',
      setup: [],
    },
  };

  constructor() {
    super();
    this.docker = new Docker();
    // Initialize asynchronously without blocking server startup
    this.initializeRuntime().catch(err => {
      console.error('Container runtime initialization failed (non-blocking):', err.message);
    });
  }

  private async initializeRuntime() {
    try {
      // Create temp directory for container files
      await fs.mkdir(this.tempDir, { recursive: true });

      // Try to ping Docker first - if it fails, skip initialization
      try {
        await this.docker.ping();
      } catch (pingError) {
        console.warn('⚠️ Docker not available, container runtime will be limited');
        return; // Exit early if Docker is not available
      }

      // Pull essential Docker images (with timeout to prevent hanging)
      await Promise.race([
        this.pullEssentialImages(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Docker pull timeout')), 10000)
        ),
      ]).catch(err => {
        console.warn('⚠️ Docker image pull failed or timed out:', err.message);
      });

      // Clean up old containers
      await this.cleanupOldContainers().catch(err => {
        console.warn('⚠️ Container cleanup failed:', err.message);
      });

      // eslint-disable-next-line no-console
      console.log('🐳 Container runtime initialized');
    } catch (error) {
      console.error('Failed to initialize container runtime:', error);
      // Don't throw - allow server to start even if Docker fails
    }
  }

  private async pullEssentialImages() {
    const essentialImages = ['node:18-alpine', 'python:3.11-alpine'];

    for (const image of essentialImages) {
      try {
        await this.docker.pull(image);
        // eslint-disable-next-line no-console
        console.log(`✅ Pulled ${image}`);
      } catch (error) {
        console.error(`❌ Failed to pull ${image}:`, error);
      }
    }
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const config = this.languageConfigs[request.language as keyof typeof this.languageConfigs];
      if (!config) {
        throw new Error(`Unsupported language: ${request.language}`);
      }

      // Create project directory
      const projectDir = path.join(this.tempDir, request.projectId);
      await fs.mkdir(projectDir, { recursive: true });

      // Write files to container directory
      if (request.files) {
        await this.writeProjectFiles(projectDir, request.files);
      }

      // Write main code file
      const mainFile = `main${config.fileExtension}`;
      await fs.writeFile(path.join(projectDir, mainFile), request.code);

      // Create and run container
      const result = await this.runContainer(request, config, projectDir, mainFile);

      return {
        id: request.id,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        id: request.id,
        exitCode: 1,
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        error: 'execution_failed',
      };
    }
  }

  private async writeProjectFiles(projectDir: string, files: Record<string, string>) {
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(projectDir, filePath);
      const dir = path.dirname(fullPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  }

  private async runContainer(
    request: ExecutionRequest,
    config: LanguageConfig,
    projectDir: string,
    mainFile: string
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    const container = await this.docker.createContainer({
      Image: config.image,
      Cmd: request.command?.split(' ') || [...config.command, mainFile],
      WorkingDir: '/workspace',
      Env: Object.entries(request.environment || {}).map(([k, v]) => `${k}=${v}`),
      HostConfig: {
        Binds: [`${projectDir}:/workspace`],
        Memory: 512 * 1024 * 1024, // 512MB limit
        CpuQuota: 50000, // 50% CPU limit
        NetworkMode: 'none', // No network access for security
        AutoRemove: true,
      },
      AttachStdout: true,
      AttachStderr: true,
    });

    // Store container info
    const containerInfo: ContainerInfo = {
      id: request.id,
      projectId: request.projectId,
      containerId: container.id!,
      language: request.language,
      status: 'running',
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    this.containers.set(request.id, containerInfo);

    try {
      await container.start();

      // Collect output
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      let stdout = '';
      let stderr = '';

      stream.on('data', (chunk: Buffer) => {
        const str = chunk.toString();
        // Docker multiplexes stdout/stderr - first 8 bytes are headers
        if (chunk[0] === 1) {
          // stdout
          stdout += str.slice(8);
        } else if (chunk[0] === 2) {
          // stderr
          stderr += str.slice(8);
        }
      });

      // Wait for container to finish (with timeout)
      const exitCode = await this.waitForContainer(container, 30000); // 30s timeout

      containerInfo.status = 'stopped';
      this.containers.delete(request.id);

      return { exitCode, stdout, stderr };
    } catch (error) {
      containerInfo.status = 'error';
      this.containers.delete(request.id);
      throw error;
    }
  }

  private async waitForContainer(container: Container, timeout: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        container.kill().catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Container Runtime] Failed to kill container:', errorMessage);
        });
        reject(new Error('Container execution timeout'));
      }, timeout);

      container.wait((err: Error | null, data: { StatusCode: number } | null) => {
        clearTimeout(timer);
        if (err) {
          reject(err);
        } else if (data) {
          resolve(data.StatusCode);
        } else {
          reject(new Error('Container wait returned no data'));
        }
      });
    });
  }

  async getActiveContainers(): Promise<ContainerInfo[]> {
    return Array.from(this.containers.values());
  }

  async stopContainer(requestId: string): Promise<boolean> {
    const containerInfo = this.containers.get(requestId);
    if (!containerInfo) return false;

    try {
      const container = this.docker.getContainer(containerInfo.containerId);
      await container.kill();

      containerInfo.status = 'stopped';
      this.containers.delete(requestId);
      return true;
    } catch (error) {
      console.error('Failed to stop container:', error);
      return false;
    }
  }

  private async cleanupOldContainers() {
    // Clean up containers older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [id, info] of Array.from(this.containers.entries())) {
      if (info.createdAt < oneHourAgo) {
        await this.stopContainer(id);
      }
    }
  }

  async getLanguageSupport(): Promise<string[]> {
    return Object.keys(this.languageConfigs);
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'error';
    details: {
      activeContainers?: number;
      supportedLanguages?: number;
      dockerConnected: boolean;
      error?: string;
    };
  }> {
    try {
      await this.docker.ping();
      return {
        status: 'healthy',
        details: {
          activeContainers: this.containers.size,
          supportedLanguages: Object.keys(this.languageConfigs).length,
          dockerConnected: true,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          dockerConnected: false,
        },
      };
    }
  }
}

export const containerRuntime = new ContainerRuntime();
