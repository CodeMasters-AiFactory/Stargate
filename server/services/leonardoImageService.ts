/**
 * Leonardo AI Image Service
 * Free tier: 150 images/day
 * Tracks usage and notifies when limit reached
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LeonardoImageOptions {
  prompt: string;
  modelId?: string;
  width?: number;
  height?: number;
  numImages?: number;
}

export interface LeonardoImageResult {
  url: string;
  provider: 'leonardo';
  model: string;
  prompt: string;
  cost: number; // 0 for free tier
  dailyUsage: number;
  remainingToday: number;
}

// Usage tracking file
const USAGE_FILE = path.join(process.cwd(), 'data', 'leonardo-usage.json');
const FREE_TIER_LIMIT = 150; // Images per day

interface DailyUsage {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * Load usage data
 */
function loadUsageData(): DailyUsage[] {
  try {
    if (!fs.existsSync(USAGE_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('[Leonardo] Failed to load usage data:', error);
    return [];
  }
}

/**
 * Save usage data
 */
function saveUsageData(usage: DailyUsage[]): void {
  try {
    const dir = path.dirname(USAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (error) {
    console.error('[Leonardo] Failed to save usage data:', error);
  }
}

/**
 * Get today's date string
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get today's usage count
 */
export function getTodayUsage(): number {
  const usage = loadUsageData();
  const today = getTodayDateString();
  const todayRecord = usage.find(u => u.date === today);
  return todayRecord?.count || 0;
}

/**
 * Get remaining images for today
 */
export function getRemainingToday(): number {
  const used = getTodayUsage();
  return Math.max(0, FREE_TIER_LIMIT - used);
}

/**
 * Check if we can generate more images today
 */
export function canGenerateToday(needed: number = 1): boolean {
  return getRemainingToday() >= needed;
}

/**
 * Increment usage counter
 */
function incrementUsage(count: number = 1): { used: number; remaining: number } {
  const usage = loadUsageData();
  const today = getTodayDateString();
  
  // Remove old records (keep last 30 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const filtered = usage.filter(u => {
    const recordDate = new Date(u.date);
    return recordDate >= cutoff;
  });
  
  // Update today's count
  let todayRecord = filtered.find(u => u.date === today);
  if (!todayRecord) {
    todayRecord = { date: today, count: 0 };
    filtered.push(todayRecord);
  }
  
  todayRecord.count += count;
  
  saveUsageData(filtered);
  
  const remaining = Math.max(0, FREE_TIER_LIMIT - todayRecord.count);
  
  // Notify if approaching or at limit
  if (remaining <= 10 && remaining > 0) {
    console.warn(`⚠️ [Leonardo] Warning: Only ${remaining} images remaining today!`);
  } else if (remaining === 0) {
    console.error(`❌ [Leonardo] FREE TIER LIMIT REACHED: ${FREE_TIER_LIMIT} images used today!`);
    console.error(`❌ [Leonardo] Please upgrade subscription or wait until tomorrow.`);
  }
  
  return {
    used: todayRecord.count,
    remaining,
  };
}

/**
 * Create Leonardo AI client
 */
function createLeonardoClient(): any | null {
  const apiKey = process.env.LEONARDO_AI_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  // Leonardo API base URL
  const baseURL = 'https://cloud.leonardo.ai/api/rest/v1';
  
  return {
    apiKey,
    baseURL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };
}

/**
 * Generate image using Leonardo AI
 */
export async function generateWithLeonardo(
  options: LeonardoImageOptions
): Promise<LeonardoImageResult> {
  const client = createLeonardoClient();
  if (!client) {
    throw new Error('Leonardo AI API key not configured. Set LEONARDO_AI_API_KEY environment variable.');
  }
  
  // Check if we can generate
  const needed = options.numImages || 1;
  if (!canGenerateToday(needed)) {
    throw new Error(
      `Leonardo free tier limit reached (${FREE_TIER_LIMIT}/day). ` +
      `Used: ${getTodayUsage()}, Needed: ${needed}. ` +
      `Please upgrade subscription or wait until tomorrow.`
    );
  }
  
  try {
    // Leonardo API endpoint - Using Leonardo Phoenix (latest model)
    const modelId = options.modelId || '6b645e3a-d64f-4341-a6d8-7a3690fbf042'; // Leonardo Phoenix 1.0
    
    // Step 1: Initiate generation
    const generateResponse = await fetch(`${client.baseURL}/generations`, {
      method: 'POST',
      headers: client.headers,
      body: JSON.stringify({
        prompt: options.prompt,
        modelId: modelId,
        width: options.width || 1024,
        height: options.height || 1024,
        num_images: options.numImages || 1,
        num_inference_steps: 30,
        guidance_scale: 7,
        scheduler: 'LEONARDO',
        presetStyle: 'PHOTOGRAPHY',
      }),
    });
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Leonardo API error: ${generateResponse.status} - ${errorText}`);
    }
    
    const generateData = await generateResponse.json();
    const generationId = generateData.sdGenerationJob?.generationId;
    
    if (!generationId) {
      throw new Error('Failed to get generation ID from Leonardo');
    }
    
    // Step 2: Poll for completion (max 60 seconds)
    let attempts = 0;
    const maxAttempts = 60;
    let imageUrl: string | null = null;
    
    while (attempts < maxAttempts && !imageUrl) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(
        `${client.baseURL}/generations/${generationId}`,
        {
          headers: client.headers,
        }
      );
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to check generation status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      const generations = statusData.generations_by_pk?.generated_images;
      
      if (generations && generations.length > 0 && generations[0].url) {
        imageUrl = generations[0].url;
        break;
      }
      
      attempts++;
    }
    
    if (!imageUrl) {
      throw new Error('Image generation timed out after 60 seconds');
    }
    
    // Increment usage
    const usage = incrementUsage(options.numImages || 1);
    
    return {
      url: imageUrl,
      provider: 'leonardo',
      model: modelId,
      prompt: options.prompt,
      cost: 0, // Free tier
      dailyUsage: usage.used,
      remainingToday: usage.remaining,
    };
  } catch (error: any) {
    console.error('[Leonardo] Image generation failed:', error);
    throw error;
  }
}

/**
 * Get usage statistics
 */
export function getUsageStats(): {
  today: {
    used: number;
    remaining: number;
    limit: number;
    percentage: number;
  };
  recent: DailyUsage[];
} {
  const used = getTodayUsage();
  const remaining = getRemainingToday();
  
  return {
    today: {
      used,
      remaining,
      limit: FREE_TIER_LIMIT,
      percentage: Math.round((used / FREE_TIER_LIMIT) * 100),
    },
    recent: loadUsageData().slice(-7), // Last 7 days
  };
}

/**
 * Log usage status (for notifications)
 */
export function logUsageStatus(): void {
  const stats = getUsageStats();
  const { today } = stats;
  
  if (today.percentage >= 100) {
    console.error(`\n❌ ============================================`);
    console.error(`❌ LEONARDO FREE TIER LIMIT REACHED!`);
    console.error(`❌ ============================================`);
    console.error(`❌ Used: ${today.used}/${today.limit} images today`);
    console.error(`❌ Remaining: ${today.remaining}`);
    console.error(`❌ Action Required: Upgrade subscription or wait until tomorrow`);
    console.error(`❌ ============================================\n`);
  } else if (today.percentage >= 90) {
    console.warn(`\n⚠️ ============================================`);
    console.warn(`⚠️ LEONARDO FREE TIER NEARING LIMIT!`);
    console.warn(`⚠️ ============================================`);
    console.warn(`⚠️ Used: ${today.used}/${today.limit} images (${today.percentage}%)`);
    console.warn(`⚠️ Remaining: ${today.remaining} images`);
    console.warn(`⚠️ Consider upgrading subscription soon`);
    console.warn(`⚠️ ============================================\n`);
  } else if (today.percentage >= 75) {
    console.log(`\nℹ️ [Leonardo] Usage: ${today.used}/${today.limit} images (${today.percentage}%)`);
    console.log(`ℹ️ [Leonardo] Remaining: ${today.remaining} images today\n`);
  }
}

