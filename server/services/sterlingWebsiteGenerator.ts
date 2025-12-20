/**
 * DEPRECATED IN MERLIN 6.x – DO NOT USE FOR NEW GENERATION
 * 
 * Sterling Legal Partners Website Generator
 * Generates a high-quality 4-page website based on strict quality standards
 * Follows specifications in website_quality_standards/ folder
 * 
 * This legacy generator is kept for:
 * - Optional debug tools
 * - Reference implementation
 * - Backward compatibility (if needed)
 * 
 * ACTIVE PIPELINE: Use merlinDesignLLM.ts (v6.x AI pipeline) instead.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  WebsiteManifest,
  PageSpec,
  MultiPageWebsite,
  GenerationProgress,
  WebsiteFile
} from './types/multipage';
import { generateDesignTokens, generateDesignSystemCSS } from './designSystem';
import { generateSchemaMarkup } from './seoOptimization';
import { minifyCSS, minifyJS, optimizeHTML, extractCriticalCSS, inlineCriticalCSS } from './performanceOptimizer';
import { optimizeImagesInHTML } from './imageOptimization';
import { generateStunningImage } from './advancedImageService';
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

/**
 * Read quality manifesto to ensure we follow standards
 */
function readQualityManifesto(): string {
  try {
    const manifestoPath = path.join(process.cwd(), 'website_quality_standards', '00-website-quality-manifesto.md');
    return fs.readFileSync(manifestoPath, 'utf-8');
  } catch (error) {
    console.warn('Could not read quality manifesto, proceeding with standards in memory');
    return '';
  }
}

/**
 * Read Sterling page specifications
 */
function readSterlingSpec(pageName: string): string {
  try {
    const specMap: Record<string, string> = {
      'index': '01-sterling-legal-partners-homepage-spec.md',
      'home': '01-sterling-legal-partners-homepage-spec.md',
      'services': '02-sterling-services-spec.md',
      'about': '03-sterling-about-spec.md',
      'contact': '04-sterling-contact-spec.md'
    };
    
    const specPath = path.join(process.cwd(), 'website_quality_standards', specMap[pageName] || '');
    if (specPath && fs.existsSync(specPath)) {
      return fs.readFileSync(specPath, 'utf-8');
    }
  } catch (error) {
    console.warn(`Could not read spec for ${pageName}`);
  }
  return '';
}

/**
 * Read image prompts for Sterling
 */
function readImagePrompts(): string {
  try {
    const promptsPath = path.join(process.cwd(), 'website_quality_standards', '02-image-prompts-sterling-legal-partners.md');
    if (fs.existsSync(promptsPath)) {
      return fs.readFileSync(promptsPath, 'utf-8');
    }
  } catch (error) {
    console.warn('Could not read image prompts');
  }
  return '';
}

/**
 * Generate Sterling Legal Partners website manifest
 */
export async function generateSterlingManifest(
  city: string = '[CITY]',
  region: string = '[REGION]',
  phone: string = '[PHONE NUMBER]',
  onProgress?: (progress: GenerationProgress) => void
): Promise<WebsiteManifest> {
  // Reserved for future use: qualityManifesto
  readQualityManifesto();
  
  emitProgress({
    phase: 'planning',
    currentStep: 'Creating Sterling Legal Partners manifest',
    progress: 10,
    message: 'Building site structure based on quality standards...'
  }, onProgress);

  const manifest: WebsiteManifest = {
    siteName: 'Sterling Legal Partners',
    description: 'Full-service law firm providing corporate, family and criminal law services',
    version: '1.0',
    pages: [
      {
        slug: 'index',
        title: 'Home',
        description: 'Homepage for Sterling Legal Partners law firm',
        sections: [
          { id: 'hero', type: 'hero', title: 'Hero Section', content: 'Hero with H1, CTAs, trust line', order: 1 },
          { id: 'who-we-serve', type: 'features', title: 'Who We Serve', content: 'Two cards: Businesses & Individuals', order: 2 },
          { id: 'practice-areas', type: 'services', title: 'Key Practice Areas', content: '3 service cards', order: 3 },
          { id: 'why-choose', type: 'features', title: 'Why Clients Choose Us', content: '4 value points', order: 4 },
          { id: 'client-outcomes', type: 'testimonials', title: 'Client Outcomes', content: '3 case blurbs', order: 5 },
          { id: 'about-teaser', type: 'about', title: 'About Sterling', content: 'Story and values', order: 6 },
          { id: 'how-it-works', type: 'content', title: 'How We Work', content: '3 steps', order: 7 },
          { id: 'faq', type: 'content', title: 'FAQ', content: '4-6 Q&As', order: 8 },
          { id: 'final-cta', type: 'cta', title: 'Final CTA', content: 'Ready to talk', order: 9 }
        ],
        seo: {
          title: `Corporate, Family & Criminal Law Firm in ${city} | Sterling Legal Partners`,
          description: `Sterling Legal Partners is a full-service law firm in ${city} helping businesses and families with corporate, family and criminal law. Book a confidential consultation today.`,
          keywords: ['law firm', city, 'corporate law', 'family law', 'criminal defense', region]
        },
        order: 1
      },
      {
        slug: 'services',
        title: 'Services',
        description: 'Legal services for businesses and families',
        sections: [
          { id: 'intro', type: 'hero', title: 'Services Intro', content: 'H1 and overview', order: 1 },
          { id: 'overview', type: 'services', title: 'Practice Areas Overview', content: '3 service cards', order: 2 },
          { id: 'corporate', type: 'content', title: 'Corporate Law Services', content: 'Detailed corporate law section', order: 3 },
          { id: 'family', type: 'content', title: 'Family Law Services', content: 'Detailed family law section', order: 4 },
          { id: 'criminal', type: 'content', title: 'Criminal Defense Services', content: 'Detailed criminal defense section', order: 5 },
          { id: 'faq', type: 'content', title: 'Service FAQ', content: '4-6 FAQs', order: 6 },
          { id: 'cta', type: 'cta', title: 'Final CTA', content: 'Ready to discuss', order: 7 }
        ],
        seo: {
          title: `Legal Services for Businesses & Families in ${city} | Sterling Legal Partners`,
          description: `Comprehensive legal services in ${city}: corporate law for businesses, family law for individuals, and criminal defense. Experienced attorneys ready to help.`,
          keywords: ['legal services', city, 'corporate law', 'family law', 'criminal defense', region]
        },
        order: 2
      },
      {
        slug: 'about',
        title: 'About',
        description: 'About Sterling Legal Partners',
        sections: [
          { id: 'hero', type: 'hero', title: 'About Hero', content: 'H1 and subheading', order: 1 },
          { id: 'story', type: 'content', title: 'Our Story', content: '2-4 paragraphs', order: 2 },
          { id: 'values', type: 'features', title: 'Our Values', content: '3-5 value items', order: 3 },
          { id: 'team', type: 'content', title: 'The Team', content: '2-4 lawyer profiles', order: 4 },
          { id: 'standards', type: 'content', title: 'Professional Standards', content: 'Memberships and ethics', order: 5 },
          { id: 'highlights', type: 'content', title: 'Firm Highlights', content: '3-5 milestones', order: 6 },
          { id: 'cta', type: 'cta', title: 'CTA', content: 'Speak to team', order: 7 }
        ],
        seo: {
          title: `About Sterling Legal Partners | Law Firm in ${city}`,
          description: `Learn about Sterling Legal Partners, a trusted law firm in ${city} providing corporate, family and criminal law services with integrity, clarity and results-driven representation.`,
          keywords: ['about', 'law firm', city, 'attorneys', 'lawyers', region]
        },
        order: 3
      },
      {
        slug: 'contact',
        title: 'Contact',
        description: 'Contact Sterling Legal Partners',
        sections: [
          { id: 'intro', type: 'hero', title: 'Contact Intro', content: 'H1 and supporting text', order: 1 },
          { id: 'contact-options', type: 'content', title: 'Get in Touch', content: 'Phone, email, address, hours', order: 2 },
          { id: 'form', type: 'contact', title: 'Contact Form', content: 'Full contact form with validation', order: 3 },
          { id: 'map', type: 'content', title: 'Office Location', content: 'Map or location info', order: 4 },
          { id: 'faq', type: 'content', title: 'Quick Questions', content: '3-4 FAQs', order: 5 }
        ],
        seo: {
          title: `Contact Sterling Legal Partners | Book a Consultation in ${city}`,
          description: `Contact Sterling Legal Partners in ${city}. Book a confidential consultation for corporate, family or criminal law matters. Call, email or use our contact form.`,
          keywords: ['contact', 'consultation', city, 'law firm', phone, region]
        },
        order: 4
      }
    ],
    navigation: {
      type: 'header',
      sticky: true,
      pages: [
        { slug: 'index', label: 'Home', order: 1 },
        { slug: 'services', label: 'Services', order: 2 },
        { slug: 'about', label: 'About', order: 3 },
        { slug: 'contact', label: 'Contact', order: 4 }
      ]
    },
    sharedComponents: {
      header: '<header class="site-header"><div class="container"><div class="header-content"><div class="logo">Sterling Legal Partners</div><nav class="site-nav"></nav></div></div></header>',
      footer: `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-col"><h3>Sterling Legal Partners</h3><p>Trusted legal counsel for businesses and families</p></div><div class="footer-col"><h4>Quick Links</h4><ul><li><a href="./index.html">Home</a></li><li><a href="./services.html">Services</a></li><li><a href="./about.html">About</a></li><li><a href="./contact.html">Contact</a></li></ul></div><div class="footer-col"><h4>Contact</h4><p>${phone}</p><p>info@sterlinglegalpartners.co.za</p></div><div class="footer-col"><h4>Practice Areas</h4><ul><li><a href="./services.html#corporate">Corporate Law</a></li><li><a href="./services.html#family">Family Law</a></li><li><a href="./services.html#criminal">Criminal Defense</a></li></ul></div></div><div class="copyright">&copy; 2025 Sterling Legal Partners. All rights reserved.</div></div></footer>`,
      navigation: '<nav class="site-nav"><ul><li><a href="./index.html">Home</a></li><li><a href="./services.html">Services</a></li><li><a href="./about.html">About</a></li><li><a href="./contact.html">Contact</a></li></ul></nav>'
    },
    seoStrategy: {
      primaryKeywords: ['law firm', city, 'corporate law', 'family law', 'criminal defense'],
      secondaryKeywords: ['attorney', 'lawyer', region, 'legal services', 'consultation'],
      contentGaps: []
    },
    designSystem: {
      colors: {
        primary: '#1e3a8a', // Deep navy
        accent: '#d97706', // Warm amber/copper
        background: '#FFFFFF',
        text: '#1F2937'
      },
      typography: {
        headingFont: 'Inter, Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
        bodyFont: 'Inter, Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
        sizes: {
          h1: '3.5rem',
          h2: '2.5rem',
          h3: '1.75rem',
          body: '1.125rem'
        }
      },
      spacing: {
        section: '5rem',
        element: '2rem'
      },
      borderRadius: '0.5rem'
    }
  };

  return manifest;
}

/**
 * Generate HTML for a Sterling page using the spec
 */
export async function generateSterlingPageHTML(
  pageSpec: PageSpec,
  manifest: WebsiteManifest,
  city: string = '[CITY]',
  region: string = '[REGION]',
  phone: string = '[PHONE NUMBER]',
  onProgress?: (progress: GenerationProgress) => void
): Promise<string> {
  const pageName = pageSpec.slug;
  const spec = readSterlingSpec(pageName);
  const qualityManifesto = readQualityManifesto();

  emitProgress({
    phase: 'pages',
    currentStep: `Generating ${pageSpec.title}`,
    progress: 30 + (pageSpec.order * 15),
    message: `Creating ${pageSpec.title} page following quality standards...`
  }, onProgress);

  if (!openai) {
    // Mock mode - generate basic HTML
    return generateMockSterlingHTML(pageSpec, manifest, city, region, phone);
  }

  const systemPrompt = `You are an elite web developer creating a world-class law firm website. You MUST follow these quality standards:

${qualityManifesto ? qualityManifesto.substring(0, 2000) : 'Create professional, high-quality websites that compete with top law firms.'}

CRITICAL REQUIREMENTS:
- Use the exact specifications provided
- Include location placeholders: ${city}, ${region}
- Professional, trustworthy design (navy blue #1e3a8a, amber #d97706)
- Deep, specific content (not generic filler)
- Strong CTAs ("Book a Consultation", not "Learn More")
- SEO-optimized with location keywords
- One H1 per page with primary keyword
- Schema markup for LocalBusiness/LegalService
- Accessible (WCAG 2.1 AA)
- Fast loading (< 3 seconds)

PAGE SPECIFICATION:
${spec || 'Follow the standard structure for this page type.'}

OUTPUT: Complete, production-ready HTML with semantic HTML5, proper SEO, and professional styling.`;

  const userPrompt = `Generate the ${pageSpec.title} page for Sterling Legal Partners law firm.

PAGE DETAILS:
- Slug: ${pageSpec.slug}
- Title: ${pageSpec.title}
- SEO Title: ${pageSpec.seo.title}
- SEO Description: ${pageSpec.seo.description}
- Sections: ${pageSpec.sections.map(s => s.title).join(', ')}

${pageSpec.slug === 'index' || pageSpec.slug === 'home' ? `
HOMEPAGE SPECIFIC REQUIREMENTS (FOLLOW EXACTLY):
${spec ? spec.substring(0, 4000) : ''}

CRITICAL: The homepage MUST include these exact sections in this order:
1. Hero Section with H1 "${pageSpec.seo.title.split('|')[0].trim()}", subheading, 3 bullet points, "Book a Consultation" CTA, "Call Our Office" CTA, trust line
2. "Who We Serve" section with two cards (Businesses & Organisations, Individuals & Families)
3. "Our Key Practice Areas" section with 3 service cards (Corporate Law, Family Law, Criminal Defense)
4. "Why Clients Choose Sterling Legal Partners" section with 4 value points
5. "Client Outcomes We're Proud Of" section with 3 anonymised case blurbs
6. "About Sterling Legal Partners" section with story paragraph, 3 values, "Meet the Firm" button
7. "How We Work With You" section with 3 numbered steps
8. FAQ section with 4-6 Q&As
9. Final CTA section "Ready to Talk to a Lawyer?"
10. Footer with firm info, links, contact, practice areas

CONTENT RULES FOR HOMEPAGE:
- DO use: "Corporate law for SMEs in ${city}" (specific)
- DON'T use: "We deliver exceptional quality" (generic)
- DO include: Location references, concrete examples, use cases
- DON'T include: Generic filler, placeholder text, vague statements
- CTAs must be: "Book a Consultation" (strong), not "Learn More" (weak)
` : ''}

DESIGN SYSTEM:
- Primary Color: ${manifest.designSystem.colors.primary} (navy blue #1e3a8a)
- Accent Color: ${manifest.designSystem.colors.accent} (amber/copper #d97706)
- Typography: ${manifest.designSystem.typography.headingFont}
- Spacing: Generous white space, professional layout
- NO confetti, NO playful elements, NO generic stock photos

CONTENT REQUIREMENTS:
- Replace [CITY] with: ${city}
- Replace [REGION] with: ${region}
- Replace [PHONE NUMBER] with: ${phone}
- Use SPECIFIC, detailed content (NOT generic filler)
- Include location-specific information
- Add trust signals and social proof
- Include clear, action-oriented CTAs

TECHNICAL:
- Complete <!DOCTYPE html> document
- Semantic HTML5 structure
- Link to ./assets/styles/main.css
- Link to ./assets/scripts/app.js
- Include schema markup
- Optimize for Core Web Vitals
- Mobile-responsive

Generate the complete HTML now.`;

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

    return completion.choices[0].message.content || generateMockSterlingHTML(pageSpec, manifest, city, region, phone);
  } catch (error) {
    console.error('Error generating Sterling page:', error);
    return generateMockSterlingHTML(pageSpec, manifest, city, region, phone);
  }
}

/**
 * Generate mock HTML for Sterling (fallback)
 */
function generateMockSterlingHTML(
  pageSpec: PageSpec,
  manifest: WebsiteManifest,
  city: string,
  region: string,
  _phone: string
): string {
  // Basic HTML structure - would be expanded with full content
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageSpec.seo.title}</title>
  <meta name="description" content="${pageSpec.seo.description}">
  <link rel="stylesheet" href="./assets/styles/main.css">
</head>
<body>
  ${manifest.sharedComponents.header}
  <main>
    <h1>${pageSpec.title}</h1>
    <p>Content for ${pageSpec.title} page - ${city}, ${region}</p>
  </main>
  ${manifest.sharedComponents.footer}
  <script src="./assets/scripts/app.js"></script>
</body>
</html>`;
}

/**
 * Generate complete Sterling Legal Partners website
 */
export async function generateSterlingWebsite(
  city: string = '[CITY]',
  region: string = '[REGION]',
  phone: string = '[PHONE NUMBER]',
  onProgress?: (progress: GenerationProgress) => void
): Promise<MultiPageWebsite> {
  // Read quality manifesto first (reserved for future use)
  readQualityManifesto();
  
  emitProgress({
    phase: 'planning',
    currentStep: 'Initializing Sterling website generation',
    progress: 5,
    message: 'Reading quality standards...'
  }, onProgress);

  // Generate manifest
  const manifest = await generateSterlingManifest(city, region, phone, onProgress);

  // Generate shared assets
  const designTokens = generateDesignTokens(
    manifest.designSystem.colors.primary,
    manifest.designSystem.colors.accent,
    manifest.designSystem.typography.headingFont
  );

  emitProgress({
    phase: 'assets',
    currentStep: 'Generating design system',
    progress: 60,
    message: 'Creating professional CSS and JavaScript...'
  }, onProgress);

  const css = generateDesignSystemCSS(designTokens, manifest);
  const minifiedCSS = minifyCSS(css);
  
  // Generate JavaScript
  const js = `// Sterling Legal Partners Website
console.log('Sterling Legal Partners website loaded');
// Add form validation, smooth scrolling, etc.`;
  const minifiedJS = minifyJS(js);

  // Generate all pages
  const files: Record<string, WebsiteFile> = {};

  // Generate images for the website (especially homepage hero) - reserved for future use
  readImagePrompts();
  const generatedImages: Map<string, string> = new Map();
  
  // Generate hero image for homepage
  if (manifest.pages.some(p => p.slug === 'index' || p.slug === 'home')) {
    emitProgress({
      phase: 'assets',
      currentStep: 'Generating custom images',
      progress: 70,
      message: 'Creating professional hero image with DALL·E...'
    }, onProgress);
    
    try {
      const heroImage = await generateStunningImage({
        style: 'hero',
        businessContext: {
          name: 'Sterling Legal Partners',
          industry: 'Law Firm',
          colorScheme: [manifest.designSystem.colors.primary, manifest.designSystem.colors.accent],
          styleKeywords: ['professional', 'trustworthy', 'confident']
        },
        prompt: 'Professional South African law firm office, warm natural light, subtle blue and copper brand colours, confident but approachable atmosphere, no visible text',
        quality: 'hd'
      });
      generatedImages.set('hero', heroImage.url);
      console.log('[Sterling Generator] Generated hero image:', heroImage.url);
    } catch (error) {
      console.error('[Sterling Generator] Error generating hero image:', error);
    }
  }

  for (const pageSpec of manifest.pages) {
    let html = await generateSterlingPageHTML(pageSpec, manifest, city, region, phone, onProgress);
    
    // Replace placeholder images with generated ones
    if (pageSpec.slug === 'index' || pageSpec.slug === 'home') {
      const heroImageUrl = generatedImages.get('hero');
      if (heroImageUrl) {
        // Replace any placeholder hero image URLs with the generated one
        html = html.replace(
          /https:\/\/images\.unsplash\.com\/[^"']*/g,
          heroImageUrl
        );
        // Also replace any generic placeholder image references
        html = html.replace(
          /src=["']([^"']*placeholder[^"']*|hero[^"']*\.(jpg|png|webp))["']/gi,
          `src="${heroImageUrl}"`
        );
      }
    }
    
    // Optimize HTML
    html = optimizeHTML(html);
    html = optimizeImagesInHTML(html, { addLazyLoading: true, addDimensions: true });
    
    // Add critical CSS
    const criticalCSS = extractCriticalCSS(minifiedCSS);
    if (criticalCSS) {
      html = inlineCriticalCSS(html, criticalCSS);
    }

    // Add schema markup
    const schema = generateSchemaMarkup({
      type: 'LegalService',
      name: 'Sterling Legal Partners',
      description: manifest.description,
      url: `https://sterlinglegalpartners.co.za/${pageSpec.slug === 'index' ? '' : pageSpec.slug}.html`,
      address: {
        streetAddress: '[STREET ADDRESS]',
        addressLocality: city,
        addressRegion: region,
        postalCode: '[POSTAL CODE]',
        addressCountry: 'ZA'
      },
      telephone: phone,
      priceRange: '$$'
    });
    html = html.replace('</head>', `${schema}\n</head>`);

    const htmlContent = html;
    files[`${pageSpec.slug === 'index' ? 'index' : pageSpec.slug}.html`] = {
      path: `${pageSpec.slug === 'index' ? 'index' : pageSpec.slug}.html`,
      type: 'html' as const,
      content: htmlContent,
      checksum: createChecksum(htmlContent)
    };
  }

  // Add assets
  files['assets/styles/main.css'] = {
    path: 'assets/styles/main.css',
    type: 'css' as const,
    content: minifiedCSS,
    checksum: createChecksum(minifiedCSS)
  };

  files['assets/scripts/app.js'] = {
    path: 'assets/scripts/app.js',
    type: 'js' as const,
    content: minifiedJS,
    checksum: createChecksum(minifiedJS)
  };

  return {
    manifest,
    files,
    assets: {
      css: minifiedCSS,
      js: minifiedJS
    }
  };
}

function emitProgress(progress: GenerationProgress, onProgress?: (progress: GenerationProgress) => void) {
  if (onProgress) {
    onProgress(progress);
  }
}

function createChecksum(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

