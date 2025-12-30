/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - LEONARDO AI INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Generates REAL images for websites using Leonardo AI.
 * No more placeholders!
 */

import { IndustryDNA } from './industryDNA';

// Configuration constants for retry and timeout behavior
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const TIMEOUT_CONFIG = {
  fetchTimeoutMs: 30000, // 30 second timeout for individual fetch calls
  pollingIntervalMs: 2000, // 2 seconds between polls
  maxPollingTimeMs: 120000, // 2 minutes max for generation
};

const RATE_LIMIT_CONFIG = {
  delayBetweenRequestsMs: 500, // Minimum delay between API calls
  rateLimitRetryDelayMs: 60000, // Wait 60 seconds on rate limit hit
};

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE CACHE
// ═══════════════════════════════════════════════════════════════════════════════

interface CachedImage {
  url: string;
  width: number;
  height: number;
  createdAt: number;
}

// In-memory cache for generated images (keyed by prompt hash)
const imageCache = new Map<string, CachedImage>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500; // Maximum number of cached images

/**
 * Generate a simple hash for cache key from prompt
 */
function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `img_${Math.abs(hash).toString(36)}`;
}

/**
 * Check if a cached image is still valid
 */
function isCacheValid(cached: CachedImage): boolean {
  return Date.now() - cached.createdAt < CACHE_TTL_MS;
}

/**
 * Clean up expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.createdAt >= CACHE_TTL_MS) {
      imageCache.delete(key);
    }
  }
  // If still over limit, remove oldest entries
  if (imageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(imageCache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);
    const toRemove = entries.slice(0, imageCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => imageCache.delete(key));
  }
}

/**
 * Get image from cache if available
 */
function getCachedImage(prompt: string): CachedImage | null {
  const key = hashPrompt(prompt);
  const cached = imageCache.get(key);
  if (cached && isCacheValid(cached)) {
    console.log(`[Leonardo] 🎯 Cache HIT for prompt: ${prompt.substring(0, 50)}...`);
    return cached;
  }
  if (cached) {
    // Expired - remove it
    imageCache.delete(key);
  }
  return null;
}

/**
 * Store image in cache
 */
function cacheImage(prompt: string, url: string, width: number, height: number): void {
  cleanupCache(); // Clean before adding
  const key = hashPrompt(prompt);
  imageCache.set(key, {
    url,
    width,
    height,
    createdAt: Date.now(),
  });
  console.log(`[Leonardo] 💾 Cached image for prompt: ${prompt.substring(0, 50)}...`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; maxSize: number; ttlHours: number } {
  return {
    size: imageCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlHours: CACHE_TTL_MS / (60 * 60 * 1000),
  };
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
  console.log('[Leonardo] 🗑️ Image cache cleared');
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GeneratedImage {
  section: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  usage: {
    generated: number;
    remaining: number;
  };
  errors: string[];
}

const LEONARDO_BASE_URL = 'https://cloud.leonardo.ai/api/rest/v1';

/**
 * Helper: Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = TIMEOUT_CONFIG.fetchTimeoutMs
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Helper: Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Helper: Check if error is retryable
 */
function isRetryableError(status: number): boolean {
  // Retry on server errors (5xx) or specific client errors
  return status >= 500 || status === 408 || status === 503;
}

/**
 * Helper: Check if rate limited
 */
function isRateLimited(status: number): boolean {
  return status === 429;
}

/**
 * Generate all images needed for a website
 */
export async function generateWebsiteImages(
  businessName: string,
  industry: IndustryDNA,
  onProgress?: (message: string, progress: number) => void
): Promise<ImageGenerationResult> {
  const apiKey = process.env.LEONARDO_AI_API_KEY;
  
  if (!apiKey) {
    console.error('[Merlin8] Leonardo API key not configured');
    return {
      success: false,
      images: [],
      usage: { generated: 0, remaining: 0 },
      errors: ['Leonardo API key not configured'],
    };
  }

  const images: GeneratedImage[] = [];
  const errors: string[] = [];
  
  // Define what images we need
  const imageRequests = [
    { section: 'hero', prompt: industry.images.hero, width: 1200, height: 800 },
    { section: 'services', prompt: industry.images.services, width: 800, height: 600 },
    { section: 'about', prompt: industry.images.about, width: 800, height: 600 },
    { section: 'team', prompt: industry.images.team, width: 800, height: 800 },
  ];

  // Add background if defined (max width 1536 for Leonardo)
  if (industry.images.background) {
    imageRequests.push({ 
      section: 'background', 
      prompt: industry.images.background, 
      width: 1536, 
      height: 864 
    });
  }

  let generated = 0;
  const total = imageRequests.length;

  for (let i = 0; i < imageRequests.length; i++) {
    const request = imageRequests[i];
    try {
      onProgress?.(`Generating ${request.section} image...`, (generated / total) * 100);

      // Enhance prompt with business name and style guidance
      const enhancedPrompt = `${request.prompt}, for ${businessName}, ${industry.images.style}, high quality, professional`;

      const result = await generateSingleImage(
        apiKey,
        enhancedPrompt,
        request.width,
        request.height
      );

      if (result.success && result.url) {
        images.push({
          section: request.section,
          url: result.url,
          prompt: enhancedPrompt,
          width: request.width,
          height: request.height,
        });
        generated++;
      } else {
        errors.push(`Failed to generate ${request.section}: ${result.error}`);
      }

      // Add delay between requests to avoid rate limiting (except for last request)
      if (i < imageRequests.length - 1) {
        await sleep(RATE_LIMIT_CONFIG.delayBetweenRequestsMs);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Error generating ${request.section}: ${errorMessage}`);
    }
  }

  onProgress?.('Image generation complete!', 100);

  return {
    success: errors.length === 0,
    images,
    usage: {
      generated,
      remaining: 150 - generated, // Approximate
    },
    errors,
  };
}

/**
 * Generate a single image with Leonardo AI
 * Includes retry logic, rate limiting, proper timeout handling, and caching
 */
async function generateSingleImage(
  apiKey: string,
  prompt: string,
  width: number,
  height: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Check cache first
  const cached = getCachedImage(prompt);
  if (cached) {
    return { success: true, url: cached.url };
  }

  let lastError = '';

  // Step 1: Create generation request with retries
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const generateResponse = await fetchWithTimeout(
        `${LEONARDO_BASE_URL}/generations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix
            width,
            height,
            num_images: 1,
            num_inference_steps: 30,
            guidance_scale: 7,
            presetStyle: 'PHOTOGRAPHY',
          }),
        }
      );

      // Handle rate limiting
      if (isRateLimited(generateResponse.status)) {
        console.warn('[Leonardo] Rate limited, waiting before retry...');
        await sleep(RATE_LIMIT_CONFIG.rateLimitRetryDelayMs);
        continue;
      }

      // Handle retryable errors
      if (isRetryableError(generateResponse.status)) {
        lastError = `Server error: ${generateResponse.status}`;
        console.warn(`[Leonardo] Retryable error (attempt ${attempt + 1}): ${lastError}`);
        await sleep(calculateBackoffDelay(attempt));
        continue;
      }

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        return { success: false, error: `API error: ${generateResponse.status} - ${errorText}` };
      }

      const generateData = await generateResponse.json();
      const generationId = generateData.sdGenerationJob?.generationId;

      if (!generationId) {
        return { success: false, error: 'No generation ID returned' };
      }

      // Step 2: Poll for completion with timeout and retry logic
      const pollResult = await pollForCompletion(apiKey, generationId);

      // Cache successful result
      if (pollResult.success && pollResult.url) {
        cacheImage(prompt, pollResult.url, width, height);
      }

      return pollResult;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = 'Request timed out';
        } else {
          lastError = error.message;
        }
      } else {
        lastError = 'Unknown error';
      }
      console.warn(`[Leonardo] Error (attempt ${attempt + 1}): ${lastError}`);

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        await sleep(calculateBackoffDelay(attempt));
      }
    }
  }

  return { success: false, error: `Failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError}` };
}

/**
 * Poll for generation completion with proper error handling
 */
async function pollForCompletion(
  apiKey: string,
  generationId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const startTime = Date.now();
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;

  while (Date.now() - startTime < TIMEOUT_CONFIG.maxPollingTimeMs) {
    await sleep(TIMEOUT_CONFIG.pollingIntervalMs);

    try {
      const statusResponse = await fetchWithTimeout(
        `${LEONARDO_BASE_URL}/generations/${generationId}`,
        {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        }
      );

      // Handle rate limiting during polling
      if (isRateLimited(statusResponse.status)) {
        console.warn('[Leonardo] Rate limited during polling, waiting...');
        await sleep(RATE_LIMIT_CONFIG.rateLimitRetryDelayMs);
        continue;
      }

      // Handle transient errors during polling (don't fail immediately)
      if (!statusResponse.ok) {
        consecutiveErrors++;
        console.warn(`[Leonardo] Status check failed (${consecutiveErrors}/${maxConsecutiveErrors}): ${statusResponse.status}`);

        if (consecutiveErrors >= maxConsecutiveErrors) {
          return { success: false, error: `Status check failed after ${maxConsecutiveErrors} consecutive errors` };
        }
        continue;
      }

      // Reset error counter on success
      consecutiveErrors = 0;

      const statusData = await statusResponse.json();
      const generation = statusData.generations_by_pk;

      // Check for generation failure status
      if (generation?.status === 'FAILED') {
        return { success: false, error: 'Image generation failed on Leonardo servers' };
      }

      const images = generation?.generated_images;
      if (images && images.length > 0 && images[0].url) {
        return { success: true, url: images[0].url };
      }

    } catch (error) {
      consecutiveErrors++;
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[Leonardo] Polling error (${consecutiveErrors}/${maxConsecutiveErrors}): ${message}`);

      if (consecutiveErrors >= maxConsecutiveErrors) {
        return { success: false, error: `Polling failed: ${message}` };
      }
    }
  }

  return { success: false, error: `Generation timed out after ${TIMEOUT_CONFIG.maxPollingTimeMs / 1000} seconds` };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Download image and save locally (for deployment)
 * Includes retry logic, timeout handling, and detailed error reporting
 */
export async function downloadImage(
  url: string,
  savePath: string
): Promise<{ success: boolean; error?: string }> {
  let lastError = '';

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {}, TIMEOUT_CONFIG.fetchTimeoutMs);

      // Handle rate limiting
      if (isRateLimited(response.status)) {
        console.warn('[Leonardo] Rate limited during image download, waiting...');
        await sleep(RATE_LIMIT_CONFIG.rateLimitRetryDelayMs);
        continue;
      }

      // Handle retryable server errors
      if (isRetryableError(response.status)) {
        lastError = `Server error: ${response.status}`;
        console.warn(`[Leonardo] Download retry (attempt ${attempt + 1}): ${lastError}`);
        await sleep(calculateBackoffDelay(attempt));
        continue;
      }

      if (!response.ok) {
        return { success: false, error: `Download failed with status: ${response.status}` };
      }

      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return { success: false, error: `Invalid content type: ${contentType}` };
      }

      const fs = await import('fs');
      const path = await import('path');

      // Ensure directory exists
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // Validate buffer is not empty
      if (buffer.length === 0) {
        lastError = 'Downloaded image is empty';
        console.warn(`[Leonardo] ${lastError}, retrying...`);
        await sleep(calculateBackoffDelay(attempt));
        continue;
      }

      fs.writeFileSync(savePath, buffer);
      return { success: true };

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = 'Download timed out';
        } else {
          lastError = error.message;
        }
      } else {
        lastError = 'Unknown error';
      }
      console.warn(`[Leonardo] Download error (attempt ${attempt + 1}): ${lastError}`);

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        await sleep(calculateBackoffDelay(attempt));
      }
    }
  }

  return { success: false, error: `Download failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError}` };
}

export default {
  generateWebsiteImages,
  downloadImage,
};
