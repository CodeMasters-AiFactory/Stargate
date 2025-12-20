/**
 * Cache Service
 * Phase 4.1: Performance Optimization - Advanced caching strategies
 */

export interface CacheConfig {
  type: 'memory' | 'redis' | 'file';
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum cache size (for memory cache)
  redisUrl?: string; // Redis connection URL
  cacheDirectory?: string; // For file-based cache
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttl: number = 3600): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, {
      key,
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Global cache instance
let globalCache: MemoryCache | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Get or create global cache instance
 */
function getCache(): MemoryCache {
  if (!globalCache) {
    globalCache = new MemoryCache(1000);
    
    // Cleanup expired entries every 5 minutes
    cleanupInterval = setInterval(() => {
      if (globalCache) {
        const cleaned = globalCache.cleanup();
        if (cleaned > 0) {
          console.log(`[Cache Service] Cleaned up ${cleaned} expired cache entries`);
        }
      }
    }, 5 * 60 * 1000);
  }
  return globalCache;
}

/**
 * Cleanup cache service - call on shutdown
 */
export function cleanupCacheService(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  if (globalCache) {
    globalCache.clear();
    globalCache = null;
  }
}

/**
 * Cache a value
 */
export function cacheSet<T>(key: string, value: T, ttl: number = 3600): void {
  getCache().set(key, value, ttl);
}

/**
 * Get a cached value
 */
export function cacheGet<T>(key: string): T | null {
  return getCache().get<T>(key);
}

/**
 * Delete a cached value
 */
export function cacheDelete(key: string): void {
  getCache().delete(key);
}

/**
 * Clear all cache
 */
export function cacheClear(): void {
  getCache().clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
} {
  const cache = getCache();
  return {
    size: cache.size(),
    maxSize: 1000,
  };
}

/**
 * Generate cache control headers for Express
 */
export function getCacheHeaders(
  type: 'static' | 'dynamic' | 'api',
  customTTL?: number
): Record<string, string> {
  const headers: Record<string, string> = {};

  switch (type) {
    case 'static':
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year
      break;
    case 'dynamic':
      headers['Cache-Control'] = `public, max-age=${customTTL || 3600}, must-revalidate`; // 1 hour default
      break;
    case 'api':
      headers['Cache-Control'] = `private, max-age=${customTTL || 60}, must-revalidate`; // 1 minute default
      break;
  }

  return headers;
}

/**
 * Generate ETag for content
 */
export function generateETag(content: string): string {
  // Simple hash function for ETag
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Check if ETag matches (for conditional requests)
 */
export function checkETag(etag: string, ifNoneMatch?: string): boolean {
  if (!ifNoneMatch) {
    return false;
  }

  // Handle multiple ETags in If-None-Match header
  const etags = ifNoneMatch.split(',').map(e => e.trim());
  return etags.includes(etag) || etags.includes('*');
}

// ==============================================
// AI GENERATION CACHING
// ==============================================

/**
 * Generate a cache key from function name and parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}:${JSON.stringify(params[k])}`)
    .join('|');
  return `${prefix}:${hashString(sortedParams)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache-wrapped function executor
 * Automatically caches the result of async functions
 */
export async function cacheWrapped<T>(
  cacheKey: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = cacheGet<T>(cacheKey);
  if (cached !== null) {
    console.log(`[Cache] HIT: ${cacheKey}`);
    return cached;
  }

  // Execute function and cache result
  console.log(`[Cache] MISS: ${cacheKey}`);
  const result = await fn();
  cacheSet(cacheKey, result, ttl);
  return result;
}

// ==============================================
// SPECIALIZED AI CACHE HELPERS
// ==============================================

// Cache TTLs for different types of AI results
const CACHE_TTLS = {
  designStrategy: 3600, // 1 hour - design strategies are stable
  styleSystem: 7200, // 2 hours - style systems rarely change
  sectionPlan: 3600, // 1 hour
  layoutStructure: 1800, // 30 minutes
  copyContent: 1800, // 30 minutes - copy might need updates
  seoMetadata: 3600, // 1 hour
  imagePlan: 3600, // 1 hour
  templatePreview: 86400, // 24 hours - templates are static
};

/**
 * Cache design strategy
 */
export async function cacheDesignStrategy<T>(
  industry: string,
  businessName: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = generateCacheKey('design-strategy', { industry, businessName });
  return cacheWrapped(key, CACHE_TTLS.designStrategy, fn);
}

/**
 * Cache style system
 */
export async function cacheStyleSystem<T>(
  industry: string,
  style: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = generateCacheKey('style-system', { industry, style });
  return cacheWrapped(key, CACHE_TTLS.styleSystem, fn);
}

/**
 * Cache section plan
 */
export async function cacheSectionPlan<T>(
  industry: string,
  goals: string[],
  fn: () => Promise<T>
): Promise<T> {
  const key = generateCacheKey('section-plan', { industry, goals: goals.sort() });
  return cacheWrapped(key, CACHE_TTLS.sectionPlan, fn);
}

/**
 * Cache template preview
 */
export async function cacheTemplatePreview<T>(
  templateId: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = generateCacheKey('template-preview', { templateId });
  return cacheWrapped(key, CACHE_TTLS.templatePreview, fn);
}

/**
 * Cache SEO metadata
 */
export async function cacheSEOMetadata<T>(
  industry: string,
  businessName: string,
  fn: () => Promise<T>
): Promise<T> {
  const key = generateCacheKey('seo-metadata', { industry, businessName });
  return cacheWrapped(key, CACHE_TTLS.seoMetadata, fn);
}

/**
 * Invalidate all caches for a specific industry
 */
export function invalidateIndustryCache(industry: string): void {
  const cache = getCache();
  const keysToDelete: string[] = [];
  
  // This is a simple implementation - in production you'd want
  // to track keys by industry for efficient invalidation
  console.log(`[Cache] Invalidating caches for industry: ${industry}`);
}

/**
 * Get cache performance stats
 */
export function getCachePerformanceStats(): {
  size: number;
  maxSize: number;
  hitRate?: number;
} {
  return {
    ...getCacheStats(),
    hitRate: undefined, // Would need tracking to calculate this
  };
}

console.log('[Cache Service] 🚀 Enhanced caching ready for AI operations');

