/**
 * Azure Blob Storage Service
 * Abstraction layer for file storage that works with Azure Blob Storage or local filesystem
 * Supports seamless migration from local files to Azure Blob Storage
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';

export interface StorageConfig {
  useAzure: boolean;
  connectionString?: string;
  accountName?: string;
  accountKey?: string;
  localBasePath?: string;
}

export interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
  contentType?: string;
}

class AzureStorageService {
  private config: StorageConfig;
  private blobServiceClient: BlobServiceClient | null = null;
  private containers: Map<string, ContainerClient> = new Map();

  constructor(config: StorageConfig) {
    this.config = config;
    
    if (config.useAzure && config.connectionString) {
      try {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
        console.log('[AzureStorage] ✅ Azure Blob Storage initialized');
      } catch (error) {
        console.warn('[AzureStorage] ⚠️ Failed to initialize Azure Blob Storage, falling back to local:', error);
        this.config.useAzure = false;
      }
    } else {
      this.config.useAzure = false;
      this.config.localBasePath = config.localBasePath || process.cwd();
      console.log('[AzureStorage] Using local file system storage');
    }
  }

  /**
   * Get container client (Azure) or ensure directory exists (local)
   */
  private async getContainer(containerName: string): Promise<ContainerClient | string> {
    if (this.config.useAzure && this.blobServiceClient) {
      if (!this.containers.has(containerName)) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        this.containers.set(containerName, containerClient);
      }
      return this.containers.get(containerName)!;
    } else {
      // Local: return directory path
      const dirPath = path.join(this.config.localBasePath!, containerName);
      await fs.mkdir(dirPath, { recursive: true });
      return dirPath;
    }
  }

  /**
   * Write file to storage
   */
  async writeFile(
    containerName: string,
    filePath: string,
    content: string | Buffer,
    contentType?: string
  ): Promise<void> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const blobClient = container.getBlockBlobClient(filePath);
      await blobClient.upload(content, content.length, {
        blobHTTPHeaders: contentType ? { blobContentType: contentType } : undefined,
      });
    } else {
      // Local file system
      const dirPath = await this.getContainer(containerName) as string;
      const fullPath = path.join(dirPath, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  }

  /**
   * Read file from storage
   */
  async readFile(containerName: string, filePath: string): Promise<Buffer> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const blobClient = container.getBlockBlobClient(filePath);
      const downloadResponse = await blobClient.download();
      const chunks: Uint8Array[] = [];
      for await (const chunk of downloadResponse.readableStreamBody!) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } else {
      // Local file system
      const dirPath = await this.getContainer(containerName) as string;
      const fullPath = path.join(dirPath, filePath);
      return await fs.readFile(fullPath);
    }
  }

  /**
   * Read file as string
   */
  async readFileAsString(containerName: string, filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    const buffer = await this.readFile(containerName, filePath);
    return buffer.toString(encoding);
  }

  /**
   * Check if file exists
   */
  async fileExists(containerName: string, filePath: string): Promise<boolean> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const blobClient = container.getBlockBlobClient(filePath);
      return await blobClient.exists();
    } else {
      // Local file system
      const dirPath = await this.getContainer(containerName) as string;
      const fullPath = path.join(dirPath, filePath);
      try {
        await fs.access(fullPath);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Delete file
   */
  async deleteFile(containerName: string, filePath: string): Promise<void> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const blobClient = container.getBlockBlobClient(filePath);
      await blobClient.deleteIfExists();
    } else {
      // Local file system
      const dirPath = await this.getContainer(containerName) as string;
      const fullPath = path.join(dirPath, filePath);
      try {
        await fs.unlink(fullPath);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
  }

  /**
   * List files in container/directory
   */
  async listFiles(containerName: string, prefix?: string): Promise<FileInfo[]> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const files: FileInfo[] = [];
      for await (const blob of container.listBlobsFlat({ prefix })) {
        files.push({
          path: blob.name,
          size: blob.properties.contentLength || 0,
          lastModified: blob.properties.lastModified || new Date(),
          contentType: blob.properties.contentType,
        });
      }
      return files;
    } else {
      // Local file system
      const dirPath = await this.getContainer(containerName) as string;
      const files: FileInfo[] = [];
      const fullPath = prefix ? path.join(dirPath, prefix) : dirPath;
      
      async function walkDir(currentPath: string, basePath: string): Promise<void> {
        try {
          const entries = await fs.readdir(currentPath, { withFileTypes: true });
          for (const entry of entries) {
            const fullEntryPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(basePath, fullEntryPath);
            
            if (entry.isDirectory()) {
              await walkDir(fullEntryPath, basePath);
            } else {
              const stats = await fs.stat(fullEntryPath);
              files.push({
                path: relativePath.replace(/\\/g, '/'),
                size: stats.size,
                lastModified: stats.mtime,
              });
            }
          }
        } catch (error) {
          // Directory doesn't exist or can't be read
        }
      }
      
      await walkDir(fullPath, dirPath);
      return files;
    }
  }

  /**
   * Get file URL (for Azure) or local path
   */
  async getFileUrl(containerName: string, filePath: string): Promise<string> {
    if (this.config.useAzure && this.blobServiceClient) {
      const container = await this.getContainer(containerName) as ContainerClient;
      const blobClient = container.getBlockBlobClient(filePath);
      return blobClient.url;
    } else {
      // Local: return relative path
      const dirPath = await this.getContainer(containerName) as string;
      return path.join(dirPath, filePath);
    }
  }

  /**
   * Copy file within storage
   */
  async copyFile(
    containerName: string,
    sourcePath: string,
    destPath: string
  ): Promise<void> {
    const content = await this.readFile(containerName, sourcePath);
    await this.writeFile(containerName, destPath, content);
  }

  /**
   * Create directory structure (for local) or ensure container exists (Azure)
   */
  async ensureDirectory(containerName: string, dirPath: string): Promise<void> {
    if (this.config.useAzure && this.blobServiceClient) {
      // Azure doesn't need directories, but ensure container exists
      await this.getContainer(containerName);
    } else {
      // Local: create directory
      const fullPath = path.join(this.config.localBasePath!, containerName, dirPath);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }
}

// Singleton instance
let storageService: AzureStorageService | null = null;

/**
 * Initialize storage service
 */
export function initStorageService(config: StorageConfig): AzureStorageService {
  storageService = new AzureStorageService(config);
  return storageService;
}

/**
 * Get storage service instance
 */
export function getStorageService(): AzureStorageService {
  if (!storageService) {
    // Default: use local file system
    storageService = new AzureStorageService({
      useAzure: false,
      localBasePath: process.cwd(),
    });
  }
  return storageService;
}

/**
 * Convenience functions for common operations
 */

export async function saveWebsiteFile(
  projectSlug: string,
  filePath: string,
  content: string | Buffer,
  contentType?: string
): Promise<void> {
  const storage = getStorageService();
  await storage.writeFile('website-projects', `${projectSlug}/${filePath}`, content, contentType);
}

export async function readWebsiteFile(projectSlug: string, filePath: string): Promise<string> {
  const storage = getStorageService();
  return await storage.readFileAsString('website-projects', `${projectSlug}/${filePath}`);
}

export async function websiteFileExists(projectSlug: string, filePath: string): Promise<boolean> {
  const storage = getStorageService();
  return await storage.fileExists('website-projects', `${projectSlug}/${filePath}`);
}

export async function listWebsiteFiles(projectSlug: string): Promise<FileInfo[]> {
  const storage = getStorageService();
  return await storage.listFiles('website-projects', projectSlug);
}

export async function saveTemplateFile(
  templateId: string,
  filePath: string,
  content: string | Buffer
): Promise<void> {
  const storage = getStorageService();
  await storage.writeFile('templates', `${templateId}/${filePath}`, content);
}

export async function readTemplateFile(templateId: string, filePath: string): Promise<string> {
  const storage = getStorageService();
  return await storage.readFileAsString('templates', `${templateId}/${filePath}`);
}

export async function saveImageFile(
  imageId: string,
  content: Buffer,
  contentType: string = 'image/png'
): Promise<string> {
  const storage = getStorageService();
  const filePath = `${imageId}.${contentType.split('/')[1] || 'png'}`;
  await storage.writeFile('images', filePath, content, contentType);
  return await storage.getFileUrl('images', filePath);
}

/**
 * Alias for writeFile - convenience function
 */
export async function writeFileContent(
  projectSlug: string,
  filePath: string,
  content: string | Buffer,
  contentType?: string
): Promise<void> {
  await saveWebsiteFile(projectSlug, filePath, content, contentType);
}

/**
 * Alias for readFile - convenience function
 */
export async function readFileContent(projectSlug: string, filePath: string): Promise<string> {
  return await readWebsiteFile(projectSlug, filePath);
}

