/**
 * Image & Media Engine
 * Creates brand-consistent, non-generic imagery using DALL·E
 */

import type { ProjectConfig } from './projectConfig';
import type { BrandKit } from './brandGenerator';
import fs from 'fs';
import path from 'path';
import { getProjectDir } from './projectConfig';
import { generateStunningImage } from './advancedImageService';

export interface ImageRequirement {
  type: 'hero' | 'service' | 'team' | 'abstract' | 'background';
  page: 'home' | 'services' | 'about' | 'contact';
  prompt: string;
  alt: string;
}

export interface GeneratedImage {
  type: string;
  url: string;
  alt: string;
  prompt: string;
  savedPath?: string;
}

/**
 * Determine required images for a project
 */
export function determineImageRequirements(
  config: ProjectConfig,
  brandKit: BrandKit,
  pagesToGenerate: string[]
): ImageRequirement[] {
  const requirements: ImageRequirement[] = [];
  const location = `${config.location.city}, ${config.location.region}`;
  const industry = config.industry.toLowerCase();
  
  // Home page hero
  if (pagesToGenerate.includes('Home')) {
    requirements.push({
      type: 'hero',
      page: 'home',
      prompt: `Professional ${industry} business, ${location} context, warm natural light, subtle ${brandKit.colorPalette.primary} and ${brandKit.colorPalette.accent} brand colours, confident but approachable atmosphere, no visible text`,
      alt: `${config.projectName} - Professional ${industry} in ${location}`
    });
  }
  
  // Service illustrations
  if (pagesToGenerate.includes('Services')) {
    config.services.forEach(service => {
      requirements.push({
        type: 'service',
        page: 'services',
        prompt: `Abstract ${service.name.toLowerCase()} concept illustration, ${industry} context, ${brandKit.colorPalette.primary} and ${brandKit.colorPalette.accent} brand colours, minimal professional style, no text`,
        alt: `${service.name} - ${config.projectName}`
      });
    });
  }
  
  // Team/office image
  if (pagesToGenerate.includes('About')) {
    requirements.push({
      type: 'team',
      page: 'about',
      prompt: `Diverse professional team in modern office meeting, ${location} context, business attire, professional but approachable, natural light, ${brandKit.colorPalette.primary} and ${brandKit.colorPalette.accent} brand colours, confident expressions`,
      alt: `${config.projectName} team`
    });
  }
  
  return requirements;
}

/**
 * Generate all required images for a project
 */
export async function generateProjectImages(
  config: ProjectConfig,
  brandKit: BrandKit,
  requirements: ImageRequirement[]
): Promise<GeneratedImage[]> {
  const projectDir = getProjectDir(config.projectSlug);
  const imagesDir = path.join(projectDir, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const generatedImages: GeneratedImage[] = [];
  const prompts: string[] = [];
  
  for (const requirement of requirements) {
    try {
      const image = await generateStunningImage({
        style: requirement.type === 'hero' ? 'hero' : 
               requirement.type === 'service' ? 'illustration' :
               requirement.type === 'team' ? 'testimonial' : 'background',
        businessContext: {
          name: config.projectName,
          industry: config.industry,
          colorScheme: [
            brandKit.colorPalette.primary,
            brandKit.colorPalette.accent
          ],
          styleKeywords: config.toneOfVoice.split(',').map(s => s.trim())
        },
        prompt: requirement.prompt,
        quality: requirement.type === 'hero' ? 'hd' : 'standard'
      });
      
      generatedImages.push({
        type: requirement.type,
        url: image.url,
        alt: requirement.alt,
        prompt: requirement.prompt
      });
      
      prompts.push(`**${requirement.type} (${requirement.page}):** ${requirement.prompt}`);
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[Image Engine] Error generating ${requirement.type} image:`, error);
      // Continue with other images
    }
  }
  
  // Save prompts to file
  const promptsPath = path.join(projectDir, 'image-prompts.md');
  const promptsContent = `# Image Generation Prompts\n\n**Project:** ${config.projectName}\n**Generated:** ${new Date().toISOString()}\n\n## Prompts Used\n\n${prompts.join('\n\n')}\n`;
  fs.writeFileSync(promptsPath, promptsContent, 'utf-8');
  
  return generatedImages;
}

/**
 * Save image prompts to file
 */
export function saveImagePrompts(projectSlug: string, prompts: ImageRequirement[]): void {
  const projectDir = getProjectDir(projectSlug);
  const promptsPath = path.join(projectDir, 'image-prompts.md');
  
  const content = `# Image Generation Prompts\n\n**Project:** ${projectSlug}\n**Generated:** ${new Date().toISOString()}\n\n## Prompts\n\n${prompts.map(p => `### ${p.type} (${p.page})\n\n**Prompt:** ${p.prompt}\n\n**Alt Text:** ${p.alt}\n`).join('\n')}\n`;
  
  fs.writeFileSync(promptsPath, content, 'utf-8');
}

