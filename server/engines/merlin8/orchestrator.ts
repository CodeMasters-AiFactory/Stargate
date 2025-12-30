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
import { generateFromTemplate, ClientInfo } from '../../services/templateBasedGenerator';
import { autoFixTemplate } from '../../services/templateAutoFixer';

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

  // ═══════════════════════════════════════════════════════════════════════════════
  // NEW EXPANDED INTAKE FIELDS (User Preference Form)
  // ═══════════════════════════════════════════════════════════════════════════════

  // Business Basics
  businessType?: 'startup' | 'small' | 'medium' | 'enterprise' | 'personal' | 'nonprofit';

  // Website Goals
  goals?: string[]; // e.g., ['leads', 'sell', 'brand', 'info', 'portfolio', 'bookings', 'community', 'donations']

  // Target Audience
  targetAudience?: {
    ageGroups?: string[]; // e.g., ['18-25', '26-35', '36-45', '46-55', '55+', 'all']
    audienceType?: 'b2b' | 'b2c' | 'both';
    incomeLevel?: 'budget' | 'mid' | 'premium' | 'na';
  };

  // Design Preferences
  designPreferences?: {
    colorMood?: string; // e.g., 'professional', 'modern', 'bold', 'elegant', 'friendly', 'natural', 'dark', 'classic'
    primaryColor?: string; // hex color
    secondaryColor?: string; // hex color
    designElements?: string[]; // e.g., ['hero', 'video', 'animations', 'testimonials', 'team', 'faq', 'blog', 'portfolio', 'pricing', 'stats', 'logos', 'social-proof']
  };

  // Features
  features?: string[]; // e.g., ['contact-form', 'live-chat', 'newsletter', 'social-links', 'google-maps', 'booking', 'ecommerce', 'search', 'multilang', 'member-portal', 'reviews', 'downloads']

  // Pages/Sections
  pages?: string[]; // e.g., ['home', 'about', 'services', 'products', 'portfolio', 'team', 'testimonials', 'blog', 'faq', 'contact', 'pricing', 'careers']

  // Contact Info
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
    socialPlatforms?: string[]; // e.g., ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'whatsapp']
  };

  // Tone & Messaging
  tone?: {
    brandVoice?: string; // e.g., 'professional', 'friendly', 'casual', 'authoritative', 'inspirational', 'playful', 'luxury'
    ctaStyle?: string; // e.g., 'urgent', 'soft', 'direct', 'consultative'
    keyMessage?: string;
  };

  // Template (if using a template)
  templateId?: string;
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

  // ═══════════════════════════════════════════════════════════════════════════════
  // TEMPLATE-BASED GENERATION (if templateId is provided)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (input.templateId) {
    console.log(`\n🎨 TEMPLATE MODE: Using template ${input.templateId}`);
    sendProgress(onProgress, 3, 8, 'Template Mode', 'Loading template...', 25);

    // Convert Merlin8Input to ClientInfo format for template generator
    const clientInfo: ClientInfo = {
      businessName: input.businessName,
      industry: industry.name,
      location: {
        city: '',
        state: '',
        country: '',
      },
      services: (input.services || generateDefaultServices(industry)).map(s => ({
        name: s.name,
        description: s.description,
      })),
      phone: input.contactInfo?.phone || input.phone || '',
      email: input.contactInfo?.email || input.email || '',
      address: input.contactInfo?.address || input.location || '',
      tagline: input.tagline || input.tone?.keyMessage || generateTagline(input.businessName, industry),
      brandColors: input.designPreferences ? {
        primary: input.designPreferences.primaryColor || '#3b82f6',
        secondary: input.designPreferences.secondaryColor || '#8b5cf6',
      } : undefined,
    };

    sendProgress(onProgress, 4, 8, 'Template Mode', 'Generating from template...', 40);

    try {
      const templateResult = await generateFromTemplate(
        input.templateId,
        clientInfo,
        {
          skipImages: input.generateImages === false,
          onProgress: (phase, current, total) => {
            const pct = 40 + (current / total) * 30;
            sendProgress(onProgress, 5, 8, 'Template Mode', `${phase}: ${current}/${total}`, pct);
          },
        }
      );

      if (!templateResult.success) {
        console.log(`⚠️ Template generation failed, falling back to scratch generation`);
        errors.push(...(templateResult.errors || ['Template generation failed']));
        // Fall through to scratch generation below
      } else {
        // Template generation succeeded - save and return
        sendProgress(onProgress, 6, 8, 'Saving Files', 'Writing files to disk...', 80);

        const images: GeneratedImage[] = [];

        try {
          // Save HTML - apply auto-fixes first (hide preloaders, cookies, etc.)
          const htmlPath = path.join(outputPath, 'index.html');
          const { html: fixedHtml, result: fixResult } = autoFixTemplate(templateResult.html);
          fs.writeFileSync(htmlPath, fixedHtml, 'utf-8');
          console.log(`📄 Saved: index.html (from template, ${fixResult.fixes.length} auto-fixes applied)`);

          // Save CSS
          const cssPath = path.join(outputPath, 'styles.css');
          fs.writeFileSync(cssPath, templateResult.css || '', 'utf-8');
          console.log(`🎨 Saved: styles.css`);

          // Save images if template replaced any
          const imagesDir = path.join(outputPath, 'images');
          if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
          }

          // Download replaced images
          for (const img of templateResult.replacedImages) {
            if (img.newUrl && !img.newUrl.startsWith('data:')) {
              const filename = `${img.context || 'image'}-${images.length}.jpg`;
              const filepath = path.join(imagesDir, filename);
              try {
                const downloadResult = await downloadImage(img.newUrl, filepath);
                if (downloadResult.success) {
                  images.push({
                    section: img.context || 'image',
                    url: `images/${filename}`,
                    prompt: img.prompt || '',
                    width: 800,  // Default width for template images
                    height: 600, // Default height for template images
                  });
                  console.log(`💾 Saved: ${filename}`);
                }
              } catch (downloadError) {
                console.error(`❌ Failed to download image ${filename}:`, downloadError instanceof Error ? downloadError.message : 'Unknown error');
                errors.push(`Failed to download image: ${filename}`);
              }
            }
          }

          // Save metadata
          const metadataPath = path.join(outputPath, 'metadata.json');
          fs.writeFileSync(metadataPath, JSON.stringify({
            businessName: input.businessName,
            industry: industry.id,
            industryName: industry.name,
            generatedAt: new Date().toISOString(),
            version: '8.0-template',
            templateId: input.templateId,
            images: images.map(img => ({ section: img.section, url: img.url })),
            userPreferences: {
              businessType: input.businessType,
              tagline: input.tagline,
              goals: input.goals,
              targetAudience: input.targetAudience,
              designPreferences: input.designPreferences,
              features: input.features,
              pages: input.pages,
              contactInfo: input.contactInfo,
              tone: input.tone,
              templateId: input.templateId,
            },
          }, null, 2), 'utf-8');
          console.log(`📋 Saved: metadata.json\n`);
        } catch (fileWriteError) {
          const errorMessage = fileWriteError instanceof Error ? fileWriteError.message : 'Unknown error';
          console.error('❌ Failed to save template files:', errorMessage);
          errors.push(`Failed to save template files: ${errorMessage}`);
        }

        sendProgress(onProgress, 8, 8, 'Complete', 'Website generated from template!', 100);

        const duration = Date.now() - startTime;

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('✅ MERLIN 8.0 - Template Generation Complete!');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`🎨 Template: ${input.templateId}`);
        console.log(`🖼️  Images: ${images.length}`);
        console.log('═══════════════════════════════════════════════════════════════════\n');

        return {
          success: true,
          projectSlug,
          outputPath,
          previewUrl: `/website_projects/${projectSlug}/merlin8-output/index.html`,
          website: {
            html: templateResult.html,
            css: templateResult.css || '',
          },
          images,
          industry,
          duration,
          errors: templateResult.errors || [],
        };
      }
    } catch (templateError) {
      console.error('❌ Template generation error:', templateError);
      errors.push(`Template error: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`);
      console.log(`⚠️ Falling back to scratch generation...`);
      // Fall through to scratch generation below
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 3: CONTENT PREPARATION (Scratch Generation)
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 3, 8, 'Content Preparation', 'Preparing content...', 25);
  
  const content: WebsiteContent = {
    // Basic info
    businessName: input.businessName,
    tagline: input.tagline || input.tone?.keyMessage || generateTagline(input.businessName, industry),
    description: input.description,
    services: input.services || generateDefaultServices(industry),
    location: input.contactInfo?.address || input.location,
    phone: input.contactInfo?.phone || input.phone,
    email: input.contactInfo?.email || input.email,

    // ═══════════════════════════════════════════════════════════════════════════════
    // USER PREFERENCES (from intake form) - THE BIBLE
    // ═══════════════════════════════════════════════════════════════════════════════
    businessType: input.businessType,
    goals: input.goals,
    targetAudience: input.targetAudience,
    designPreferences: input.designPreferences,
    features: input.features,
    pages: input.pages,
    contactInfo: input.contactInfo,
    tone: input.tone,
  };
  
  console.log(`✏️  Tagline: "${content.tagline}"`);
  console.log(`📋 Services: ${content.services.length} defined\n`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 4: IMAGE GENERATION (Leonardo AI)
  // ─────────────────────────────────────────────────────────────────────────────
  let images: GeneratedImage[] = [];

  // Check if Leonardo is disabled via environment variable (for testing)
  const leonardoDisabled = process.env.DISABLE_LEONARDO === 'true';

  if (input.generateImages !== false && !leonardoDisabled) {
    sendProgress(onProgress, 4, 8, 'Image Generation', 'Generating images with Leonardo AI...', 35);

    console.log('🎨 Starting Leonardo AI image generation...\n');

    try {
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
    } catch (imageGenError) {
      const errorMessage = imageGenError instanceof Error ? imageGenError.message : 'Unknown error';
      console.error('❌ Image generation failed:', errorMessage);
      errors.push(`Image generation failed: ${errorMessage}`);
      // Continue with empty images array - website will use placeholders
    }
    
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
        
        const downloadResult = await downloadImage(img.url, filepath);
        if (downloadResult.success) {
          // Update image URL to local path
          img.url = `images/${filename}`;
          console.log(`💾 Saved: ${filename}`);
        } else {
          console.warn(`⚠️ Failed to download ${filename}: ${downloadResult.error || 'Unknown error'}`);
        }
      }
      console.log('');
    }
  } else {
    sendProgress(onProgress, 5, 8, 'Skipping Images', 'Using placeholders...', 65);
    if (leonardoDisabled) {
      console.log('⚠️  Leonardo AI disabled via DISABLE_LEONARDO env var, using placeholders\n');
    } else {
      console.log('⚠️  Image generation disabled, using placeholders\n');
    }
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 6: HTML/CSS GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 6, 8, 'Building Website', 'Generating HTML/CSS...', 75);

  console.log('🏗️  Generating HTML/CSS...');

  let website: GeneratedWebsite;
  try {
    website = generateWebsite(content, industry, images);
    console.log('✅ HTML/CSS generated\n');
  } catch (websiteGenError) {
    const errorMessage = websiteGenError instanceof Error ? websiteGenError.message : 'Unknown error';
    console.error('❌ Website generation failed:', errorMessage);
    errors.push(`Website generation failed: ${errorMessage}`);

    // Return early with error result
    return {
      success: false,
      projectSlug,
      outputPath,
      previewUrl: undefined,
      website: { html: '', css: '', pages: [] },
      images,
      industry,
      duration: Date.now() - startTime,
      errors,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PHASE 7: SAVE FILES
  // ─────────────────────────────────────────────────────────────────────────────
  sendProgress(onProgress, 7, 8, 'Saving Files', 'Writing files to disk...', 85);

  try {
    // Save HTML - apply auto-fixes first (hide preloaders, cookies, etc.)
    const htmlPath = path.join(outputPath, 'index.html');
    const { html: fixedHtml, result: fixResult } = autoFixTemplate(website.html);
    fs.writeFileSync(htmlPath, fixedHtml, 'utf-8');
    console.log(`📄 Saved: index.html (${fixResult.fixes.length} auto-fixes applied)`);

    // Save CSS separately (optional, it's also inline)
    const cssPath = path.join(outputPath, 'styles.css');
    fs.writeFileSync(cssPath, website.css, 'utf-8');
    console.log(`🎨 Saved: styles.css`);

    // Save metadata with ALL user preferences (this is the "bible" for the website)
    const metadataPath = path.join(outputPath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      // Basic info
      businessName: input.businessName,
      industry: industry.id,
      industryName: industry.name,
      generatedAt: new Date().toISOString(),
      version: '8.0',
      images: images.map(img => ({ section: img.section, url: img.url })),

      // ═══════════════════════════════════════════════════════════════════════════════
      // USER PREFERENCES (from intake form) - THE BIBLE FOR THIS WEBSITE
      // ═══════════════════════════════════════════════════════════════════════════════
      userPreferences: {
        // Business Basics
        businessType: input.businessType,
        tagline: input.tagline,

        // Website Goals
        goals: input.goals,

        // Target Audience
        targetAudience: input.targetAudience,

        // Design Preferences
        designPreferences: input.designPreferences,

        // Features & Functionality
        features: input.features,

        // Pages/Sections
        pages: input.pages,

        // Contact Info
        contactInfo: input.contactInfo,

        // Tone & Messaging
        tone: input.tone,

        // Template (if using one)
        templateId: input.templateId,
      },
    }, null, 2), 'utf-8');
    console.log(`📋 Saved: metadata.json (with full user preferences)\n`);
  } catch (fileWriteError) {
    const errorMessage = fileWriteError instanceof Error ? fileWriteError.message : 'Unknown error';
    console.error('❌ Failed to save files:', errorMessage);
    errors.push(`Failed to save files: ${errorMessage}`);
  }
  
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
