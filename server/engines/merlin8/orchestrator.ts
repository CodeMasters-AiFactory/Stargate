/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - ORCHESTRATOR 🎯
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The main engine that orchestrates the entire website generation process.
 * 
 * Flow:
 * 1. Receive user input
 * 2. Detect or select industry
 * 3. Generate images with Leonardo AI
 * 4. Generate HTML/CSS
 * 5. Save and return website
 */

import * as fs from 'fs';
import * as path from 'path';
import { detectIndustry, getIndustryDNA, getAllIndustries, IndustryDNA } from './industryDNA';
import { generateWebsiteImages, GeneratedImage, downloadImage } from './leonardoIntegration';
import { generateWebsite, WebsiteContent, GeneratedWebsite } from './htmlGenerator';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Merlin8Input {
  // Required
  businessName: string;
  description: string;
  
  // Optional - will be auto-detected if not provided
  industryId?: string;
  
  // Optional details
  tagline?: string;
  services?: Array<{ name: string; description: string }>;
  location?: string;
  phone?: string;
  email?: string;
  
  // Options
  generateImages?: boolean; // Default true
  downloadImages?: boolean; // Save images locally, default true
}

export interface Merlin8Progress {
  phase: number;
  totalPhases: number;
  phaseName: string;
  message: string;
  progress: number; // 0-100
}

export interface Merlin8Result {
  success: boolean;
  projectSlug: string;
  outputPath: string;
  previewUrl?: string;
  website: GeneratedWebsite;
  images: GeneratedImage[];
  industry: IndustryDNA;
  duration: number;
  errors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete website with Merlin 8.0
 */
export async function generateWithMerlin8(
  input: Merlin8Input,
  onProgress?: (progress: Merlin8Progress) => void
): Promise<Merlin8Result> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🚀 MERLIN 8.0 - Starting Generation');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 1: INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 1, 8, 'Initialization', 'Setting up project...', 5);
  
  const projectSlug = generateSlug(input.businessName);
  const outputPath = path.join(process.cwd(), 'website_projects', projectSlug, 'merlin8-output');
  
  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  console.log(`📁 Project: ${projectSlug}`);
  console.log(`📂 Output: ${outputPath}\n`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 2: INDUSTRY DETECTION
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 2, 8, 'Industry Analysis', 'Detecting industry...', 15);
  
  let industry: IndustryDNA;
  
  if (input.industryId) {
    industry = getIndustryDNA(input.industryId);
    console.log(`🎯 Industry (selected): ${industry.name}`);
  } else {
    industry = detectIndustry(input.businessName, input.description);
    console.log(`🎯 Industry (detected): ${industry.name}`);
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 3: CONTENT PREPARATION
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 3, 8, 'Content Preparation', 'Preparing content...', 25);
  
  const content: WebsiteContent = {
    businessName: input.businessName,
    tagline: input.tagline || generateTagline(input.businessName, industry),
    description: input.description,
    services: input.services || generateDefaultServices(industry),
    location: input.location,
    phone: input.phone,
    email: input.email,
  };
  
  console.log(`✏️  Tagline: "${content.tagline}"`);
  console.log(`📋 Services: ${content.services.length} defined\n`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 4: IMAGE GENERATION (Leonardo AI)
  // ─────────────────────────────────────────────────────────────────────────────
  let images: GeneratedImage[] = [];
  
  if (input.generateImages !== false) {
    sendProgress(onProgress, 4, 8, 'Image Generation', 'Generating images with Leonardo AI...', 35);
    
    console.log('🎨 Starting Leonardo AI image generation...\n');
    
    const imageResult = await generateWebsiteImages(
      input.businessName,
      industry,
      (msg, pct) => {
        sendProgress(onProgress, 4, 8, 'Image Generation', msg, 35 + (pct * 0.3));
      }
    );
    
    images = imageResult.images;
    
    if (imageResult.errors.length > 0) {
      errors.push(...imageResult.errors);
    }
    
    console.log(`\n✅ Generated ${images.length} images`);
    console.log(`📊 Leonardo usage: ${imageResult.usage.generated} today, ${imageResult.usage.remaining} remaining\n`);
    
    // ─────────────────────────────────────────────────────────────────────────────
    // PHASE 5: DOWNLOAD IMAGES (Optional)
    // ─────────────────────────────────────────────────────────────────────────────
    if (input.downloadImages !== false && images.length > 0) {
      sendProgress(onProgress, 5, 8, 'Downloading Images', 'Saving images locally...', 65);
      
      const imagesDir = path.join(outputPath, 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      for (const img of images) {
        const filename = `${img.section}.jpg`;
        const filepath = path.join(imagesDir, filename);
        
        const downloaded = await downloadImage(img.url, filepath);
        if (downloaded) {
          // Update image URL to local path
          img.url = `images/${filename}`;
          console.log(`💾 Saved: ${filename}`);
        }
      }
      console.log('');
    }
  } else {
    sendProgress(onProgress, 5, 8, 'Skipping Images', 'Using placeholders...', 65);
    console.log('⚠️  Image generation disabled, using placeholders\n');
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 6: HTML/CSS GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 6, 8, 'Building Website', 'Generating HTML/CSS...', 75);
  
  console.log('🏗️  Generating HTML/CSS...');
  
  const website = generateWebsite(content, industry, images);
  
  console.log('✅ HTML/CSS generated\n');
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 7: SAVE FILES
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 7, 8, 'Saving Files', 'Writing files to disk...', 85);
  
  // Save HTML
  const htmlPath = path.join(outputPath, 'index.html');
  fs.writeFileSync(htmlPath, website.html, 'utf-8');
  console.log(`📄 Saved: index.html`);
  
  // Save CSS separately (optional, it's also inline)
  const cssPath = path.join(outputPath, 'styles.css');
  fs.writeFileSync(cssPath, website.css, 'utf-8');
  console.log(`🎨 Saved: styles.css`);
  
  // Save metadata
  const metadataPath = path.join(outputPath, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify({
    businessName: input.businessName,
    industry: industry.id,
    industryName: industry.name,
    generatedAt: new Date().toISOString(),
    version: '8.0',
    images: images.map(img => ({ section: img.section, url: img.url })),
  }, null, 2), 'utf-8');
  console.log(`📋 Saved: metadata.json\n`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 8: COMPLETE
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 8, 8, 'Complete', 'Website generated successfully!', 100);
  
  const duration = Date.now() - startTime;
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('✅ MERLIN 8.0 - Generation Complete!');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`🖼️  Images: ${images.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  return {
    success: errors.length === 0,
    projectSlug,
    outputPath,
    previewUrl: `/website_projects/${projectSlug}/merlin8-output/index.html`,
    website,
    images,
    industry,
    duration,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send progress update
 */
function sendProgress(
  onProgress: ((progress: Merlin8Progress) => void) | undefined,
  phase: number,
  totalPhases: number,
  phaseName: string,
  message: string,
  progress: number
): void {
  if (onProgress) {
    onProgress({ phase, totalPhases, phaseName, message, progress });
  }
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate tagline based on industry
 */
function generateTagline(businessName: string, industry: IndustryDNA): string {
  const templates: Record<string, string[]> = {
    racing: [
      'Racing at the Speed of Light',
      'Born to Win',
      'Engineered for Victory',
    ],
    restaurant: [
      'Where Every Meal is a Masterpiece',
      'Taste the Difference',
      'Crafted with Passion',
    ],
    legal: [
      'Your Trusted Legal Partner',
      'Fighting for Your Rights',
      'Excellence in Law',
    ],
    tech: [
      'Innovating the Future',
      'Technology That Transforms',
      'Building Tomorrow Today',
    ],
    realestate: [
      'Your Dream Home Awaits',
      'Where Life Begins',
      'Opening Doors to Your Future',
    ],
    fitness: [
      'Transform Your Body, Transform Your Life',
      'Unleash Your Potential',
      'Stronger Every Day',
    ],
    medical: [
      'Caring for You',
      'Health is Our Priority',
      'Compassionate Care Excellence',
    ],
    photography: [
      'Capturing Moments That Last Forever',
      'Your Story Through Our Lens',
      'Timeless Images',
    ],
    salon: [
      'Your Beauty, Our Passion',
      'Relax, Rejuvenate, Refresh',
      'Where Beauty Meets Wellness',
    ],
    construction: [
      'Building Dreams Into Reality',
      'Quality Construction, Trusted Results',
      'Built to Last',
    ],
  };
  
  const industryTemplates = templates[industry.id] || ['Excellence in Everything We Do'];
  return industryTemplates[Math.floor(Math.random() * industryTemplates.length)];
}

/**
 * Generate default services based on industry
 */
function generateDefaultServices(industry: IndustryDNA): Array<{ name: string; description: string }> {
  const services: Record<string, Array<{ name: string; description: string }>> = {
    racing: [
      { name: 'Racing Excellence', description: 'Competing at the highest level of motorsport with cutting-edge technology and world-class drivers.' },
      { name: 'Engineering Innovation', description: 'Pushing the boundaries of aerodynamics and powertrain technology for maximum performance.' },
      { name: 'Driver Development', description: 'Nurturing the next generation of champions through our elite driver academy.' },
    ],
    restaurant: [
      { name: 'Fine Dining', description: 'Experience exquisite cuisine crafted by our award-winning chefs using the finest ingredients.' },
      { name: 'Private Events', description: 'Host your special occasions in our elegant private dining spaces with customized menus.' },
      { name: 'Catering Services', description: 'Bring our culinary excellence to your event with our professional catering services.' },
    ],
    legal: [
      { name: 'Legal Consultation', description: 'Expert legal advice tailored to your specific situation from experienced attorneys.' },
      { name: 'Litigation', description: 'Strong courtroom representation to protect your rights and achieve favorable outcomes.' },
      { name: 'Business Law', description: 'Comprehensive legal services for businesses of all sizes, from startups to corporations.' },
    ],
    tech: [
      { name: 'Custom Development', description: 'Tailored software solutions designed to meet your unique business requirements.' },
      { name: 'Cloud Services', description: 'Scalable cloud infrastructure and migration services for modern businesses.' },
      { name: 'AI Integration', description: 'Harness the power of artificial intelligence to transform your operations.' },
    ],
    realestate: [
      { name: 'Property Sales', description: 'Expert guidance through every step of buying or selling your property.' },
      { name: 'Property Management', description: 'Comprehensive management services to maximize your investment returns.' },
      { name: 'Market Analysis', description: 'In-depth market insights to help you make informed real estate decisions.' },
    ],
    fitness: [
      { name: 'Personal Training', description: 'One-on-one sessions with certified trainers to help you reach your fitness goals.' },
      { name: 'Group Classes', description: 'High-energy group workouts that motivate and challenge you to push your limits.' },
      { name: 'Nutrition Coaching', description: 'Expert nutritional guidance to fuel your body and optimize results.' },
    ],
    medical: [
      { name: 'Primary Care', description: 'Comprehensive healthcare services for patients of all ages in a caring environment.' },
      { name: 'Specialized Treatment', description: 'Advanced medical care from experienced specialists in various fields.' },
      { name: 'Preventive Care', description: 'Proactive health screenings and wellness programs to keep you healthy.' },
    ],
    photography: [
      { name: 'Portrait Photography', description: 'Stunning portraits that capture your personality and essence.' },
      { name: 'Event Coverage', description: 'Professional documentation of your special moments and celebrations.' },
      { name: 'Commercial Photography', description: 'High-quality images that elevate your brand and marketing materials.' },
    ],
    salon: [
      { name: 'Hair Services', description: 'Expert styling, cuts, and color by our talented team of stylists.' },
      { name: 'Spa Treatments', description: 'Relaxing spa experiences to rejuvenate your body and mind.' },
      { name: 'Beauty Services', description: 'Complete beauty services from makeup to skincare treatments.' },
    ],
    construction: [
      { name: 'New Construction', description: 'Building quality homes and commercial spaces from the ground up.' },
      { name: 'Renovations', description: 'Transform your existing space with our expert renovation services.' },
      { name: 'Project Management', description: 'End-to-end project oversight ensuring quality, timeline, and budget adherence.' },
    ],
  };
  
  return services[industry.id] || [
    { name: 'Our Services', description: 'Professional services tailored to meet your needs.' },
    { name: 'Quality Work', description: 'Commitment to excellence in everything we do.' },
    { name: 'Customer Focus', description: 'Your satisfaction is our top priority.' },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { getAllIndustries, getIndustryDNA } from './industryDNA';

export default {
  generateWithMerlin8,
  getAllIndustries,
  getIndustryDNA,
};
