/**
 * AI Generation Speed Optimization Service
 * Implements parallel processing, caching, and streaming for faster generation
 */

import type { ProjectConfig } from './projectConfig';

export interface GenerationJob {
  id: string;
  type: 'design' | 'content' | 'image' | 'seo' | 'code';
  config: ProjectConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
}

class AIGenerationOptimizer {
  private jobQueue: Map<string, GenerationJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private maxConcurrentJobs = 5; // Maximum parallel jobs
  private cache: Map<string, { result: unknown; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate with parallel processing
   */
  async generateParallel<T>(
    tasks: Array<{ key: string; generator: () => Promise<T> }>,
    maxConcurrent: number = this.maxConcurrentJobs
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const executing = new Set<Promise<void>>();

    for (const task of tasks) {
      // Wait if we've hit the concurrency limit
      if (executing.size >= maxConcurrent) {
        await Promise.race(executing);
      }

      const promise = (async () => {
        try {
          // Check cache first
          const cached = this.getCached<T>(task.key);
          if (cached) {
            results.set(task.key, cached);
            return;
          }

          // Execute task
          const result = await task.generator();
          results.set(task.key, result);

          // Cache result
          this.setCached(task.key, result);
        } catch (_error: unknown) {
          console.error(`[AIOptimizer] Task ${task.key} failed:`, _error);
          throw _error;
        } finally {
          executing.delete(promise);
        }
      })();

      executing.add(promise);
    }

    // Wait for all remaining tasks
    await Promise.all(executing);

    return results;
  }

  /**
   * Generate with request batching
   */
  async generateBatched<T>(
    items: Array<{ id: string; data: unknown }>,
    batchSize: number = 10,
    generator: (batch: Array<{ id: string; data: unknown }>) => Promise<Map<string, T>>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await generator(batch);
      batchResults.forEach((value, key) => results.set(key, value));
    }

    return results;
  }

  /**
   * Generate with streaming (for long-running tasks)
   */
  async* generateStreaming<T>(
    generator: () => AsyncGenerator<{ progress: number; data?: T; error?: string }>
  ): AsyncGenerator<{ progress: number; data?: T; error?: string }> {
    for await (const chunk of generator()) {
      yield chunk;
    }
  }

  /**
   * Create a generation job
   */
  createJob(type: GenerationJob['type'], config: ProjectConfig): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: GenerationJob = {
      id: jobId,
      type,
      config,
      status: 'pending',
      progress: 0,
    };

    this.jobQueue.set(jobId, job);
    return jobId;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): GenerationJob | null {
    return this.jobQueue.get(jobId) || null;
  }

  /**
   * Update job progress
   */
  updateJobProgress(jobId: string, progress: number, result?: unknown, error?: string): void {
    const job = this.jobQueue.get(jobId);
    if (job) {
      job.progress = progress;
      if (result) {
        job.result = result;
        job.status = 'completed';
        job.completedAt = new Date();
      }
      if (error) {
        job.error = error;
        job.status = 'failed';
        job.completedAt = new Date();
      }
    }
  }

  /**
   * Cache management
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.result as T;
  }

  private setCached<T>(key: string, result: T): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): number {
    if (!pattern) {
      const count = this.cache.size;
      this.cache.clear();
      return count;
    }

    let count = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would track hits/misses in production
    };
  }

  /**
   * Optimize prompt for faster generation
   */
  optimizePrompt(prompt: string, maxLength: number = 500): string {
    // Truncate if too long
    if (prompt.length > maxLength) {
      return prompt.substring(0, maxLength) + '...';
    }
    return prompt;
  }

  /**
   * Pre-generate common patterns
   */
  async pregenerateCommonPatterns(): Promise<void> {
    // Pre-generate common component patterns, styles, etc.
    // This would run on server startup to warm the cache
    console.log('[AIOptimizer] Pre-generating common patterns...');
  }
}

export const aiGenerationOptimizer = new AIGenerationOptimizer();

/**
 * Parallel image generation
 */
export async function generateImagesParallel(
  prompts: Array<{
    id: string;
    prompt: string;
    style: 'hero' | 'product' | 'icon' | 'illustration' | 'background' | 'testimonial' | 'feature' | 'gallery';
    businessContext: {
      name: string;
      industry: string;
      colorScheme: string[];
      styleKeywords?: string[];
      mood?: 'professional' | 'modern' | 'elegant' | 'bold' | 'minimalist' | 'luxury';
    };
    quality: 'standard' | 'hd' | 'ultra-hd';
  }>,
  maxConcurrent: number = 3
): Promise<Map<string, { url: string; alt: string; style: string; dimensions: { width: number; height: number } }>> {
  const { generateStunningImage } = await import('./advancedImageService');

  const tasks = prompts.map((p: {
    id: string;
    prompt: string;
    style: 'hero' | 'product' | 'icon' | 'illustration' | 'background' | 'testimonial' | 'feature' | 'gallery';
    businessContext: {
      name: string;
      industry: string;
      colorScheme: string[];
      styleKeywords?: string[];
      mood?: 'professional' | 'modern' | 'elegant' | 'bold' | 'minimalist' | 'luxury';
    };
    quality: 'standard' | 'hd' | 'ultra-hd';
  }) => ({
    key: p.id,
    generator: async () => {
      return await generateStunningImage({
        prompt: p.prompt,
        style: p.style,
        businessContext: p.businessContext,
        quality: p.quality,
      });
    },
  }));

  return await aiGenerationOptimizer.generateParallel(tasks, maxConcurrent);
}

/**
 * Batch content generation
 */
export async function generateContentBatched(
  sections: Array<{ id: string; context: unknown }>,
  generator: (context: unknown) => Promise<string>
): Promise<Map<string, string>> {
  return await aiGenerationOptimizer.generateBatched(
    sections.map((s: { id: string; context: unknown }) => ({ id: s.id, data: s.context })),
    5, // Batch size
    async (batch: Array<{ id: string; data: unknown }>) => {
      const results = new Map<string, string>();
      await Promise.all(
        batch.map(async (item: { id: string; data: unknown }) => {
          const content = await generator(item.data);
          results.set(item.id, content);
        })
      );
      return results;
    }
  );
}

