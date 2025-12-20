/**
 * DEPRECATED IN MERLIN 6.x – DO NOT USE FOR NEW GENERATION
 * 
 * Unified Website Generator
 * Integrates all modules to build complete websites
 * Uses: Project Config → Brand → Content → SEO → Images → Layout → Output
 * 
 * This legacy generator is kept for:
 * - Optional debug tools
 * - Reference implementation
 * - Backward compatibility (if needed)
 * 
 * ACTIVE PIPELINE: Use merlinDesignLLM.ts (v6.x AI pipeline) instead.
 */

import type { ProjectConfig } from './projectConfig';
import type { BrandKit } from './brandGenerator';
import type { PageContent } from './contentEngine';
import type { PageSEO } from './seoEngine';
import { loadProjectConfig } from './projectConfig';
import { loadBrandKit, generateBrandKit, saveBrandKit } from './brandGenerator';
import { generatePageContent, savePageContent, loadPageContent } from './contentEngine';
import { generatePageSEO, savePageSEO, loadPageSEO } from './seoEngine';
import { determineImageRequirements, generateProjectImages, saveImagePrompts } from './imageEngine';
import { generateDesignSystemCSS } from './designSystem';
import { minifyCSS, minifyJS, optimizeHTML } from './performanceOptimizer';
import { autoAnalyzeProject } from './learningSystem';
import fs from 'fs';
import path from 'path';
import { getProjectDir, ensureProjectDir } from './projectConfig';
import type { GenerationProgress } from './types/multipage';
import OpenAI from 'openai';

// OpenAI client factory
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

const openai = createOpenAIClient();

export interface GeneratedWebsite {
  projectSlug: string;
  pages: Array<{
    type: string;
    html: string;
    seo: PageSEO;
  }>;
  assets: {
    css: string;
    js: string;
  };
  images: Array<{
    type: string;
    url: string;
    alt: string;
  }>;
}

/**
 * Generate complete website using modular system
 */
export async function generateUnifiedWebsite(
  projectSlug: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GeneratedWebsite> {
  emitProgress({
    phase: 'planning',
    currentStep: 'Loading project configuration',
    progress: 5,
    message: 'Initializing website generation...'
  }, onProgress);

  // Step 1: Load project config
  const config = loadProjectConfig(projectSlug);
  if (!config) {
    throw new Error(`Project ${projectSlug} not found`);
  }

  ensureProjectDir(projectSlug);

  // Step 2: Generate or load brand kit
  emitProgress({
    phase: 'assets',
    currentStep: 'Generating brand kit',
    progress: 10,
    message: 'Creating brand identity...'
  }, onProgress);

  let brandKit = loadBrandKit(projectSlug);
  if (!brandKit) {
    brandKit = await generateBrandKit(config);
    saveBrandKit(projectSlug, brandKit);
  }

  // Step 3: Generate content for all pages
  emitProgress({
    phase: 'pages',
    currentStep: 'Generating content',
    progress: 20,
    message: 'Creating page content...'
  }, onProgress);

  const pageContents: Map<string, PageContent> = new Map();
  for (const pageType of config.pagesToGenerate) {
    const normalizedType = pageType.toLowerCase().replace(/\s+/g, '') as 'home' | 'services' | 'about' | 'contact';
    
    let content = loadPageContent(projectSlug, normalizedType);
    if (!content) {
      content = await generatePageContent(config, brandKit, normalizedType);
      savePageContent(projectSlug, normalizedType, content);
    }
    pageContents.set(normalizedType, content);
  }

  // Step 4: Generate SEO for all pages
  emitProgress({
    phase: 'pages',
    currentStep: 'Generating SEO',
    progress: 40,
    message: 'Optimizing SEO...'
  }, onProgress);

  const pageSEO: Map<string, PageSEO> = new Map();
  for (const [pageType, content] of pageContents.entries()) {
    let seo = loadPageSEO(projectSlug, pageType);
    if (!seo) {
      seo = generatePageSEO(config, pageType as any, content);
      savePageSEO(projectSlug, pageType, seo);
    }
    pageSEO.set(pageType, seo);
  }

  // Step 5: Generate images
  emitProgress({
    phase: 'assets',
    currentStep: 'Generating images',
    progress: 50,
    message: 'Creating custom images with DALL·E...'
  }, onProgress);

  const imageRequirements = determineImageRequirements(config, brandKit, config.pagesToGenerate);
  const generatedImages = await generateProjectImages(config, brandKit, imageRequirements);
  saveImagePrompts(projectSlug, imageRequirements);

  // Step 6: Generate design system CSS
  emitProgress({
    phase: 'assets',
    currentStep: 'Generating styles',
    progress: 60,
    message: 'Creating design system...'
  }, onProgress);

  const { generateDesignTokens } = await import('./designSystem');
  const designTokens = generateDesignTokens(
    brandKit.colorPalette.primary,
    brandKit.colorPalette.accent,
    brandKit.typography.headingFont
  );
  
  const css = generateDesignSystemCSS(designTokens, {
    siteName: config.projectName,
    description: `${config.industry} services`,
    pages: [],
    navigation: { type: 'header', sticky: true, pages: [] },
    sharedComponents: { header: '', footer: '', navigation: '' },
    seoStrategy: { primaryKeywords: [], secondaryKeywords: [], contentGaps: [] },
    designSystem: {
      colors: brandKit.colorPalette,
      typography: brandKit.typography,
      spacing: brandKit.spacing,
      borderRadius: brandKit.borderRadius
    },
    version: '1.0'
  });
  const minifiedCSS = minifyCSS(css);

  // Step 7: Generate JavaScript
  const js = `// ${config.projectName} Website
console.log('${config.projectName} website loaded');
// Form validation, smooth scrolling, etc.`;
  const minifiedJS = minifyJS(js);

  // Step 8: Generate HTML pages
  emitProgress({
    phase: 'pages',
    currentStep: 'Generating pages',
    progress: 70,
    message: 'Building HTML pages...'
  }, onProgress);

  const pages: Array<{ type: string; html: string; seo: PageSEO }> = [];
  
  for (const [pageType, content] of pageContents.entries()) {
    const seo = pageSEO.get(pageType)!;
    const html = await generatePageHTML(config, brandKit, content, seo, pageType, generatedImages);
    pages.push({ type: pageType, html, seo });
  }

  // Step 9: Save output files
  emitProgress({
    phase: 'assembly',
    currentStep: 'Saving files',
    progress: 90,
    message: 'Writing website files...'
  }, onProgress);

  const outputDir = path.join(getProjectDir(projectSlug), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save HTML files
  for (const page of pages) {
    const filename = page.type === 'home' ? 'index.html' : `${page.type}.html`;
    fs.writeFileSync(path.join(outputDir, filename), page.html, 'utf-8');
  }

  // Save assets
  const assetsDir = path.join(outputDir, 'assets');
  const stylesDir = path.join(assetsDir, 'styles');
  const scriptsDir = path.join(assetsDir, 'scripts');
  
  [assetsDir, stylesDir, scriptsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  fs.writeFileSync(path.join(stylesDir, 'main.css'), minifiedCSS, 'utf-8');
  fs.writeFileSync(path.join(scriptsDir, 'app.js'), minifiedJS, 'utf-8');

  // Step 10: Auto-analyze (if possible)
  emitProgress({
    phase: 'assembly',
    currentStep: 'Analyzing website',
    progress: 95,
    message: 'Running quality analysis...'
  }, onProgress);

  // Note: Auto-analysis would need a URL - skip for now or analyze HTML directly

  emitProgress({
    phase: 'assembly',
    currentStep: 'Complete',
    progress: 100,
    message: 'Website generation complete!'
  }, onProgress);

  return {
    projectSlug,
    pages,
    assets: {
      css: minifiedCSS,
      js: minifiedJS
    },
    images: generatedImages
  };
}

/**
 * Generate HTML for a page
 */
async function generatePageHTML(
  config: ProjectConfig,
  brandKit: BrandKit,
  content: PageContent,
  seo: PageSEO,
  pageType: string,
  images: Array<{ type: string; url: string; alt: string }>
): Promise<string> {
  // Find relevant images
  const heroImage = images.find(img => img.type === 'hero');
  const serviceImages = images.filter(img => img.type === 'service');
  
  if (!openai) {
    return generatePageHTMLFallback(config, brandKit, content, seo, pageType, heroImage);
  }

  const systemPrompt = `You are an elite web developer creating a world-class ${config.industry.toLowerCase()} website. 

CRITICAL REQUIREMENTS:
- Use the EXACT content provided
- Apply brand colors: ${brandKit.colorPalette.primary} (primary), ${brandKit.colorPalette.accent} (accent)
- Use typography: ${brandKit.typography.headingFont}
- Professional, trustworthy design
- NO generic stock photos - use provided images or placeholders
- NO confetti or playful elements
- Strong CTAs, clear user journeys
- Mobile-responsive
- Semantic HTML5

OUTPUT: Complete, production-ready HTML with proper SEO meta tags, schema markup, and professional styling.`;

  const contentJSON = JSON.stringify(content, null, 2);
  const userPrompt = `Generate the ${pageType} page HTML for ${config.projectName}.

CONTENT STRUCTURE:
${contentJSON}

SEO DATA:
- Title: ${seo.title}
- Meta Description: ${seo.metaDescription}
- H1: ${seo.h1}
- Headings: ${seo.headings.map(h => `H${h.level}: ${h.text}`).join(', ')}

BRAND:
- Primary Color: ${brandKit.colorPalette.primary}
- Accent Color: ${brandKit.colorPalette.accent}
- Heading Font: ${brandKit.typography.headingFont}
- Body Font: ${brandKit.typography.bodyFont}

IMAGES:
${heroImage ? `- Hero: ${heroImage.url} (${heroImage.alt})` : '- No hero image'}
${serviceImages.length > 0 ? `- Services: ${serviceImages.map(img => img.url).join(', ')}` : ''}

Generate complete HTML with:
- Proper DOCTYPE and meta tags
- SEO title and description
- Schema markup
- Semantic HTML5 structure
- Link to ./assets/styles/main.css
- Link to ./assets/scripts/app.js
- Professional styling using brand colors
- All content from the content structure
- Responsive design`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 12000,
      temperature: 0.7
    });

    let html = completion.choices[0].message.content || '';
    
    // Inject schema markup
    if (seo.schema) {
      const schemaScript = `<script type="application/ld+json">${JSON.stringify(seo.schema)}</script>`;
      html = html.replace('</head>', `${schemaScript}\n</head>`);
    }
    
    // Optimize HTML
    html = optimizeHTML(html);
    
    return html;
  } catch (error) {
    console.error(`[Unified Generator] Error generating ${pageType} HTML:`, error);
    return generatePageHTMLFallback(config, brandKit, content, seo, pageType, heroImage);
  }
}

/**
 * Generate fallback HTML (when AI unavailable)
 */
function generatePageHTMLFallback(
  config: ProjectConfig,
  brandKit: BrandKit,
  content: PageContent,
  seo: PageSEO,
  pageType: string,
  heroImage?: { url: string; alt: string }
): string {
  const location = `${config.location.city}, ${config.location.region}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.metaDescription}">
  <link rel="stylesheet" href="./assets/styles/main.css">
  <style>
    :root {
      --primary: ${brandKit.colorPalette.primary};
      --accent: ${brandKit.colorPalette.accent};
    }
    body {
      font-family: ${brandKit.typography.bodyFont};
      color: ${brandKit.colorPalette.neutrals.text};
    }
    h1, h2, h3 {
      font-family: ${brandKit.typography.headingFont};
      color: ${brandKit.colorPalette.primary};
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="./index.html">Home</a>
      <a href="./services.html">Services</a>
      <a href="./about.html">About</a>
      <a href="./contact.html">Contact</a>
    </nav>
  </header>
  <main>
    <h1>${seo.h1}</h1>
    ${heroImage ? `<img src="${heroImage.url}" alt="${heroImage.alt}" />` : ''}
    <p>Content for ${config.projectName} - ${location}</p>
  </main>
  <footer>
    <p>&copy; 2025 ${config.projectName}. All rights reserved.</p>
  </footer>
  <script src="./assets/scripts/app.js"></script>
</body>
</html>`;
}

function emitProgress(progress: GenerationProgress, onProgress?: (progress: GenerationProgress) => void) {
  if (onProgress) {
    onProgress(progress);
  }
}

