/**
 * Blueprint Screenshot Service
 * Generates preview screenshots for blueprint templates
 * Part of Focus 1: Template System Enhancement
 */

import fs from 'fs';
import path from 'path';

export interface BlueprintScreenshotOptions {
  blueprintId: string;
  blueprintName: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  sections: Array<{
    order: number;
    type: string;
    name: string;
  }>;
}

/**
 * Generate enhanced SVG screenshot for blueprint
 * Creates a realistic preview of the blueprint layout
 */
export function generateBlueprintScreenshot(options: BlueprintScreenshotOptions): string {
  const { blueprintName, colorScheme, layout, sections } = options;

  // Generate layout-specific preview
  const layouts = {
    modern: generateModernBlueprintPreview(blueprintName, colorScheme, sections),
    classic: generateClassicBlueprintPreview(blueprintName, colorScheme, sections),
    minimal: generateMinimalBlueprintPreview(blueprintName, colorScheme, sections),
    bold: generateBoldBlueprintPreview(blueprintName, colorScheme, sections),
    elegant: generateElegantBlueprintPreview(blueprintName, colorScheme, sections),
  };

  return layouts[layout] || layouts.modern;
}

/**
 * Generate modern blueprint preview with all sections visible
 */
function generateModernBlueprintPreview(
  name: string,
  colors: BlueprintScreenshotOptions['colorScheme'],
  sections: BlueprintScreenshotOptions['sections']
): string {
  const { primary, secondary, accent, background, text } = colors;
  
  // Build section previews
  const sectionPreviews = sections.slice(0, 6).map((section, _idx) => {
    const y = 70 + (_idx * 120);
    const height = 100;

    return `
      <!-- ${section.name} -->
      <rect x="20" y="${y}" width="360" height="${height}" fill="${_idx % 2 === 0 ? primary : secondary}" opacity="0.1" rx="8"/>
      <rect x="20" y="${y}" width="360" height="4" fill="${primary}"/>
      <text x="30" y="${y + 25}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="${text}">${section.name}</text>
      <rect x="30" y="${y + 35}" width="340" height="2" fill="${accent}" opacity="0.3"/>
      <rect x="30" y="${y + 45}" width="200" height="2" fill="${accent}" opacity="0.2"/>
      ${_idx === 0 ? `<circle cx="350" cy="${y + 20}" r="8" fill="${primary}"/>` : ''}
    `;
  }).join('');

  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="${background}"/>
    
    <!-- Header/Navbar -->
    <rect width="800" height="60" fill="url(#heroGrad)"/>
    <text x="40" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="white">${name}</text>
    <circle cx="720" cy="30" r="4" fill="white" opacity="0.8"/>
    <circle cx="740" cy="30" r="4" fill="white" opacity="0.8"/>
    <circle cx="760" cy="30" r="4" fill="white" opacity="0.8"/>
    
    ${sectionPreviews}

    <!-- Footer -->
    <rect x="0" y="550" width="800" height="50" fill="${secondary}" opacity="0.1"/>
    <rect x="40" y="565" width="720" height="2" fill="${text}" opacity="0.2"/>
  </svg>`;
}

/**
 * Generate classic blueprint preview
 */
function generateClassicBlueprintPreview(
  name: string,
  colors: BlueprintScreenshotOptions['colorScheme'],
  sections: BlueprintScreenshotOptions['sections']
): string {
  const { primary, secondary, accent, background, text } = colors;
  
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${background}"/>
    
    <!-- Header -->
    <rect width="800" height="50" fill="${primary}"/>
    <text x="40" y="32" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="white">${name}</text>
    
    <!-- Sidebar -->
    <rect x="0" y="50" width="150" height="550" fill="${secondary}" opacity="0.15"/>
    
    <!-- Main Content -->
    <rect x="170" y="70" width="600" height="480" fill="${background}"/>
    <rect x="170" y="70" width="600" height="3" fill="${primary}"/>
    
    ${sections.slice(0, 4).map((section, _idx) => {
      const y = 90 + (_idx * 100);
      return `
        <text x="180" y="${y}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="${text}">${section.name}</text>
        <rect x="180" y="${y + 15}" width="580" height="2" fill="${text}" opacity="0.3"/>
        <rect x="180" y="${y + 25}" width="400" height="2" fill="${text}" opacity="0.2"/>
      `;
    }).join('')}
  </svg>`;
}

/**
 * Generate minimal blueprint preview
 */
function generateMinimalBlueprintPreview(
  name: string,
  colors: BlueprintScreenshotOptions['colorScheme'],
  sections: BlueprintScreenshotOptions['sections']
): string {
  const { primary, secondary, accent, background, text } = colors;
  
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${background}"/>
    
    <!-- Minimal Header -->
    <line x1="40" y1="40" x2="760" y2="40" stroke="${primary}" stroke-width="2"/>
    <text x="40" y="30" font-family="system-ui, sans-serif" font-size="14" fill="${text}">${name}</text>
    
    <!-- Clean Sections -->
    ${sections.slice(0, 5).map((section, _idx) => {
      const y = 80 + (_idx * 90);
      return `
        <text x="40" y="${y}" font-family="system-ui, sans-serif" font-size="13" fill="${text}" opacity="0.9">${section.name}</text>
        <line x1="40" y1="${y + 40}" x2="760" y2="${y + 40}" stroke="${accent}" stroke-width="1" opacity="0.2"/>
      `;
    }).join('')}
  </svg>`;
}

/**
 * Generate bold blueprint preview
 */
function generateBoldBlueprintPreview(
  name: string,
  colors: BlueprintScreenshotOptions['colorScheme'],
  sections: BlueprintScreenshotOptions['sections']
): string {
  const { primary, secondary, accent, background, text } = colors;
  
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="${background}"/>
    
    <!-- Bold Header -->
    <rect width="800" height="80" fill="url(#boldGrad)"/>
    <text x="40" y="50" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="white">${name}</text>
    
    <!-- Bold Sections -->
    ${sections.slice(0, 4).map((section, _idx) => {
      const y = 100 + (_idx * 120);
      const isFullWidth = _idx === 0;
      if (isFullWidth) {
        return `
          <rect x="20" y="${y}" width="760" height="100" fill="${accent}"/>
          <text x="30" y="${y + 35}" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="white">${section.name}</text>
        `;
      }
      return `
        <rect x="${20 + (_idx % 2) * 390}" y="${y}" width="370" height="100" fill="${_idx % 2 === 0 ? primary : secondary}"/>
        <text x="${30 + (_idx % 2) * 390}" y="${y + 35}" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="white">${section.name}</text>
      `;
    }).join('')}
  </svg>`;
}

/**
 * Generate elegant blueprint preview
 */
function generateElegantBlueprintPreview(
  name: string,
  colors: BlueprintScreenshotOptions['colorScheme'],
  sections: BlueprintScreenshotOptions['sections']
): string {
  const { primary, secondary, accent, background, text } = colors;
  
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${background}"/>
    
    <!-- Elegant Header -->
    <rect width="800" height="70" fill="${primary}" opacity="0.95"/>
    <text x="40" y="45" font-family="serif" font-size="20" font-weight="600" fill="white" font-style="italic">${name}</text>
    
    <!-- Elegant Sections -->
    ${sections.slice(0, 5).map((section, _idx) => {
      const y = 90 + (_idx * 95);
      return `
        <rect x="40" y="${y}" width="720" height="75" fill="${background}" stroke="${accent}" stroke-width="1" opacity="0.3" rx="4"/>
        <text x="50" y="${y + 28}" font-family="serif" font-size="14" fill="${text}">${section.name}</text>
        <line x1="50" y1="${y + 40}" x2="750" y2="${y + 40}" stroke="${accent}" stroke-width="1" opacity="0.2"/>
      `;
    }).join('')}
  </svg>`;
}

/**
 * Save blueprint screenshot to file
 */
export function saveBlueprintScreenshot(
  blueprintId: string,
  svgContent: string,
  outputDir: string
): string {
  const screenshotsDir = path.join(outputDir, 'blueprint-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const filePath = path.join(screenshotsDir, `${blueprintId}.svg`);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  
  return `/blueprint-screenshots/${blueprintId}.svg`;
}

/**
 * Generate screenshot for all blueprints
 */
export async function generateAllBlueprintScreenshots(
  blueprints: Array<{
    id: string;
    name: string;
    structure: Array<{ order: number; type: string; name: string }>;
  }>,
  outputDir: string
): Promise<Record<string, string>> {
  const screenshots: Record<string, string> = {};

  for (const blueprint of blueprints) {
    // Default color scheme
    const colorScheme = {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#1f2937',
    };

      // Determine layout based on blueprint ID
      const layoutMap: Record<string, 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'> = {
        'premium-corporate': 'modern',
        'brand-storytelling': 'elegant',
        'trust-first-service': 'classic',
        'local-service-business': 'minimal',
        'creative-agency': 'elegant',
        'saas-product': 'modern',
        'content-education': 'classic',
        'real-estate-property': 'modern',
        'personal-brand': 'minimal',
        'hyper-minimalist': 'minimal',
        'restaurant-food-service': 'bold',
        'healthcare-medical': 'classic',
        'fitness-wellness': 'bold',
        'event-wedding': 'elegant',
        'nonprofit-charity': 'modern',
        'blog-content-news': 'classic',
        'technology-startup': 'modern',
        'music-entertainment': 'bold',
        'fashion-apparel': 'elegant',
        'consulting-professional': 'classic',
      };

    const layout = layoutMap[blueprint.id] || 'modern';

    const screenshot = generateBlueprintScreenshot({
      blueprintId: blueprint.id,
      blueprintName: blueprint.name,
      colorScheme,
      layout,
      sections: blueprint.structure || [],
    });

    const screenshotPath = saveBlueprintScreenshot(blueprint.id, screenshot, outputDir);
    screenshots[blueprint.id] = screenshotPath;
  }

  return screenshots;
}

