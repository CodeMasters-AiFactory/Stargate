/**
 * Parallel Image Generator
 * AI Farm: Generates multiple images simultaneously for 90% faster execution
 */

import * as path from 'path';
import * as fs from 'fs';
import { generateStunningImage } from './advancedImageService';
import type { ProjectConfig } from './projectConfig';
import type { DesignContext } from '../generator/designThinking';
import type { StyleSystem } from '../generator/styleSystem';
import type { LayoutStructure } from '../generator/layoutLLM';
import type { PlannedImage } from '../ai/imagePlannerLLM';
import { getErrorMessage, logError } from '../utils/errorHandler';

/**
 * Download and save image locally
 */
async function downloadAndSaveImage(
  imageUrl: string,
  projectSlug: string,
  sectionKey: string,
  purpose: string
): Promise<string> {
  const imagesDir = path.join(process.cwd(), 'website_projects', projectSlug, 'generated-v5', 'assets', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const timestamp = Date.now();
    const filename = `${sectionKey}-${purpose}-${timestamp}.png`;
    const filepath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    // Return relative path for use in HTML
    return `/assets/images/${filename}`;
  } catch (_error: unknown) {
    console.error(`[AI Farm Image Download] Failed to download image from ${imageUrl.substring(0, 50)}:`, _error);
    // Return original URL as fallback
    return imageUrl;
  }
}

export interface ImageGenerationTask {
  sectionKey: string;
  sectionType: string;
  plan: PlannedImage;
  priority: 'hero' | 'primary' | 'supporting';
  imageIndex: number;
  totalImages: number;
}

export interface ImageGenerationResult {
  sectionKey: string;
  url: string;
  alt: string;
  purpose: string;
  localPath: string;
  success: boolean;
  error?: string;
}

/**
 * Generate images in parallel batches
 * This is the KEY optimization - generates all images simultaneously
 */
export async function generateImagesInParallel(
  projectConfig: ProjectConfig,
  designContext: DesignContext,
  styleSystem: StyleSystem,
  sections: LayoutStructure['sections'],
  plannedImages: PlannedImage[],
  onProgress?: (progress: {
    stage: string;
    progress: number;
    message: string;
    currentSection?: number;
    totalSections?: number;
  }) => void,
  maxConcurrent: number = 10 // Limit concurrent API calls to avoid rate limits
): Promise<ImageGenerationResult[]> {
  
  const colorScheme = [
    styleSystem.colors.primary,
    styleSystem.colors.secondary,
    styleSystem.colors.accent,
    styleSystem.colors.neutrals?.[0]
  ].filter(Boolean) as string[];

  const styleKeywords = [
    designContext.emotionalTone,
    designContext.brandVoice?.modernity,
    designContext.brandVoice?.boldness
  ].filter(Boolean) as string[];

  const businessContext = {
    name: projectConfig.projectName,
    industry: projectConfig.industry,
    colorScheme,
    styleKeywords
  };

  // Map planned images to sections
  const imagePlanMap = new Map<string, PlannedImage[]>();
  for (const img of plannedImages) {
    if (!imagePlanMap.has(img.sectionKey)) {
      imagePlanMap.set(img.sectionKey, []);
    }
    imagePlanMap.get(img.sectionKey)!.push(img);
  }

  // Build all image generation tasks
  const tasks: ImageGenerationTask[] = [];
  let taskIndex = 0;

  for (const section of sections) {
    if (!section.key) continue;
    
    const plans = imagePlanMap.get(section.key) || [];
    if (plans.length === 0) continue;

    // Priority 1: Hero images
    const heroPlan = plans.find(p => p.purpose === 'hero');
    if (heroPlan && section.type === 'hero') {
      tasks.push({
        sectionKey: section.key,
        sectionType: section.type,
        plan: heroPlan,
        priority: 'hero',
        imageIndex: taskIndex++,
        totalImages: plannedImages.length
      });
    }

    // Priority 2: Supporting images
    const supportingPlans = plans.filter(p => 
      p.purpose === 'supporting' || p.purpose === 'icon' || p.purpose === 'background'
    );
    
    for (let i = 0; i < supportingPlans.length; i++) {
      tasks.push({
        sectionKey: section.key,
        sectionType: section.type,
        plan: supportingPlans[i],
        priority: i === 0 ? 'primary' : 'supporting',
        imageIndex: taskIndex++,
        totalImages: plannedImages.length
      });
    }
  }

  console.log(`[AI Farm] Starting parallel image generation for ${tasks.length} images with max ${maxConcurrent} concurrent...`);

  // Generate images in batches to respect rate limits
  const results: ImageGenerationResult[] = [];
  const batches: ImageGenerationTask[][] = [];
  
  // Split tasks into batches
  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    batches.push(tasks.slice(i, i + maxConcurrent));
  }

  console.log(`[AI Farm] Split ${tasks.length} images into ${batches.length} batches of up to ${maxConcurrent} concurrent`);

  // Process batches sequentially, but images within each batch in parallel
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    onProgress?.({
      stage: 'image-generation',
      progress: 55 + Math.floor((batchIndex / batches.length) * 40),
      message: `Generating batch ${batchIndex + 1}/${batches.length} (${batch.length} images in parallel)...`,
      currentSection: batchIndex * maxConcurrent,
      totalSections: tasks.length
    });

    console.log(`[AI Farm] Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} images in parallel...`);

    // Generate all images in this batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (task, taskIndexInBatch) => {
        const retries = 3;
        let attempt = 0;
        
        while (attempt < retries) {
          try {
            const imageStyle = task.plan.purpose === 'icon' ? 'illustration' :
                              task.plan.purpose === 'background' ? 'background' :
                              task.plan.purpose === 'hero' ? 'hero' :
                              task.sectionType === 'about' ? 'illustration' : 'product';
            
            console.log(`[AI Farm] Generating ${task.plan.purpose} image for ${task.sectionKey}... (attempt ${attempt + 1}/${retries})`);
            
            // Generate image
            const image = await generateStunningImage({
              style: imageStyle as 'illustration' | 'background' | 'hero' | 'product',
              businessContext,
              prompt: task.plan.prompt,
              quality: (task.plan.purpose === 'icon' || task.plan.purpose === 'background') ? 'standard' : 'hd',
              artisticStyle: task.plan.styleHint?.includes('modern') ? 'minimalist' : 'photorealistic'
            });

            // Download and save image locally
            const localPath = await downloadAndSaveImage(
              image.url,
              projectConfig.projectSlug,
              task.priority === 'supporting' ? `${task.sectionKey}-${taskIndexInBatch}` : task.sectionKey,
              task.plan.purpose
            );

            console.log(`[AI Farm] ✅ Generated ${task.plan.purpose} image: ${localPath}`);

            return {
              sectionKey: task.sectionKey,
              url: image.url,
              alt: task.plan.alt || image.alt || `Visual for ${task.sectionType} section`,
              purpose: task.plan.purpose,
              localPath,
              success: true
            } as ImageGenerationResult;

          } catch (error: unknown) {
            attempt++;
            logError(error, `AI Farm - Image generation ${task.sectionKey}`);
            if (attempt >= retries) {
              const errorMessage = getErrorMessage(error);
              console.error(`[AI Farm] ❌ Image generation failed for ${task.sectionKey} after ${retries} attempts:`, errorMessage);
              return {
                sectionKey: task.sectionKey,
                url: '',
                alt: '',
                purpose: task.plan.purpose,
                localPath: '',
                success: false,
                error: errorMessage
              } as ImageGenerationResult;
            } else {
              console.warn(`[AI Farm] ⚠️ Image generation failed, retrying... (${retries - attempt} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            }
          }
        }

        // Should never reach here, but TypeScript needs it
        return {
          sectionKey: task.sectionKey,
          url: '',
          alt: '',
          purpose: task.plan.purpose,
          localPath: '',
          success: false,
          error: 'Max retries exceeded'
        } as ImageGenerationResult;
      })
    );

    results.push(...batchResults);

    // Small delay between batches to respect rate limits
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`[AI Farm] ✅ Parallel image generation complete: ${successful} successful, ${failed} failed`);

  return results;
}

/**
 * Apply generated images to sections
 */
export function applyImagesToSections(
  sections: LayoutStructure['sections'],
  imageResults: ImageGenerationResult[]
): void {
  // Group results by section
  const resultsBySection = new Map<string, ImageGenerationResult[]>();
  for (const result of imageResults) {
    if (!result.success) continue;
    if (!resultsBySection.has(result.sectionKey)) {
      resultsBySection.set(result.sectionKey, []);
    }
    resultsBySection.get(result.sectionKey)!.push(result);
  }

  // Apply images to sections
  for (const section of sections) {
    if (!section.key) continue;
    
    const sectionResults = resultsBySection.get(section.key) || [];
    if (sectionResults.length === 0) continue;

    // Hero image (priority)
    const heroResult = sectionResults.find(r => r.purpose === 'hero');
    if (heroResult && section.type === 'hero') {
      section.imageUrl = heroResult.localPath;
      section.imageAlt = heroResult.alt;
    }

    // Primary image (first supporting)
    const primaryResult = sectionResults.find(r => 
      r.purpose !== 'hero' && 
      !section.imageUrl // Only if no hero image
    ) || sectionResults.find(r => r.purpose === 'supporting' || r.purpose === 'icon');
    
    if (primaryResult && !section.imageUrl) {
      section.imageUrl = primaryResult.localPath;
      section.imageAlt = primaryResult.alt;
    }

    // Supporting images array
    const supportingResults = sectionResults.filter(r => 
      r.purpose !== 'hero' && 
      r.localPath !== section.imageUrl
    );

    if (supportingResults.length > 0) {
      section.supportImages = supportingResults.map(r => ({
        url: r.localPath,
        alt: r.alt
      }));
    }
  }
}

