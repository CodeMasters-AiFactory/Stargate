/**
 * Template Preview Image Generator
 * Generates SVG-based preview images for templates
 */

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface TemplatePreviewOptions {
  name: string;
  colorScheme: ColorScheme;
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  category: string;
}

/**
 * Generate SVG preview image for a template
 */
export function generateTemplatePreviewSVG(options: TemplatePreviewOptions): string {
  const { name, colorScheme, layout, category } = options;
  const { primary, secondary, accent, background, text } = colorScheme;

  // Layout-specific designs
  const layoutDesigns = {
    modern: generateModernLayout(primary, secondary, accent, background, text, name),
    classic: generateClassicLayout(primary, secondary, accent, background, text, name),
    minimal: generateMinimalLayout(primary, secondary, accent, background, text, name),
    bold: generateBoldLayout(primary, secondary, accent, background, text, name),
    elegant: generateElegantLayout(primary, secondary, accent, background, text, name),
  };

  return layoutDesigns[layout] || layoutDesigns.modern;
}

/**
 * Generate modern layout preview
 */
function generateModernLayout(
  primary: string,
  secondary: string,
  accent: string,
  background: string,
  text: string,
  name: string
): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="${background}"/>
    <!-- Header -->
    <rect width="400" height="60" fill="url(#grad1)"/>
    <text x="20" y="38" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">${name}</text>
    <!-- Hero Section -->
    <rect x="20" y="80" width="360" height="120" fill="${accent}" opacity="0.1"/>
    <rect x="20" y="80" width="360" height="8" fill="${primary}"/>
    <text x="30" y="110" font-family="Arial, sans-serif" font-size="14" fill="${text}">Hero Section</text>
    <!-- Content Blocks -->
    <rect x="20" y="220" width="110" height="60" fill="${primary}" opacity="0.2"/>
    <rect x="145" y="220" width="110" height="60" fill="${secondary}" opacity="0.2"/>
    <rect x="270" y="220" width="110" height="60" fill="${accent}" opacity="0.2"/>
  </svg>`;
}

/**
 * Generate classic layout preview
 */
function generateClassicLayout(
  primary: string,
  secondary: string,
  _accent: string,
  background: string,
  text: string,
  name: string
): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${background}"/>
    <!-- Header -->
    <rect width="400" height="50" fill="${primary}"/>
    <text x="20" y="32" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">${name}</text>
    <!-- Sidebar -->
    <rect x="0" y="50" width="100" height="250" fill="${secondary}" opacity="0.3"/>
    <!-- Main Content -->
    <rect x="120" y="70" width="260" height="200" fill="${background}"/>
    <line x1="120" y1="70" x2="380" y2="70" stroke="${primary}" stroke-width="2"/>
    <text x="130" y="95" font-family="Arial, sans-serif" font-size="12" fill="${text}">Content Area</text>
  </svg>`;
}

/**
 * Generate minimal layout preview
 */
function generateMinimalLayout(
  primary: string,
  _secondary: string,
  accent: string,
  background: string,
  text: string,
  name: string
): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${background}"/>
    <!-- Minimal Header -->
    <line x1="20" y1="40" x2="380" y2="40" stroke="${primary}" stroke-width="2"/>
    <text x="20" y="30" font-family="Arial, sans-serif" font-size="14" fill="${text}">${name}</text>
    <!-- Clean Content -->
    <rect x="20" y="60" width="360" height="200" fill="${background}"/>
    <text x="30" y="90" font-family="Arial, sans-serif" font-size="12" fill="${text}" opacity="0.7">Minimal Design</text>
    <line x1="20" y1="150" x2="380" y2="150" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  </svg>`;
}

/**
 * Generate bold layout preview
 */
function generateBoldLayout(
  primary: string,
  secondary: string,
  accent: string,
  background: string,
  _text: string,
  name: string
): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${secondary};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="${background}"/>
    <!-- Bold Header -->
    <rect width="400" height="80" fill="url(#boldGrad)"/>
    <text x="20" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">${name}</text>
    <!-- Bold Sections -->
    <rect x="20" y="100" width="360" height="80" fill="${accent}"/>
    <rect x="20" y="200" width="170" height="80" fill="${primary}"/>
    <rect x="210" y="200" width="170" height="80" fill="${secondary}"/>
  </svg>`;
}

/**
 * Generate elegant layout preview
 */
function generateElegantLayout(
  primary: string,
  _secondary: string,
  accent: string,
  background: string,
  text: string,
  name: string
): string {
  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${background}"/>
    <!-- Elegant Header -->
    <rect width="400" height="70" fill="${primary}" opacity="0.9"/>
    <text x="20" y="45" font-family="Arial, sans-serif" font-size="20" font-weight="300" fill="white" font-style="italic">${name}</text>
    <!-- Elegant Content -->
    <rect x="40" y="90" width="320" height="180" fill="${background}" stroke="${accent}" stroke-width="1" opacity="0.3"/>
    <text x="50" y="120" font-family="Arial, sans-serif" font-size="12" fill="${text}" opacity="0.8">Elegant Design</text>
    <circle cx="200" cy="200" r="40" fill="${accent}" opacity="0.2"/>
  </svg>`;
}

/**
 * Generate data URI for preview image
 */
export function generateTemplatePreviewDataURI(options: TemplatePreviewOptions): string {
  const svg = generateTemplatePreviewSVG(options);
  const encoded = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

/**
 * Generate preview image URL (for API use)
 */
export function generateTemplatePreviewURL(templateId: string): string {
  return `/api/templates/${templateId}/preview`;
}

