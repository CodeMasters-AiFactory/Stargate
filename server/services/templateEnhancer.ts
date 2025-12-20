/**
 * Template Enhancer Service
 * Enhances templates with high-quality, realistic design patterns
 * Extracted from actual brand websites to create pixel-perfect replicas
 */

import { BRAND_TEMPLATES, type BrandTemplate } from './brandTemplateLibrary';
import { generate } from './multiModelAIOrchestrator';

/**
 * Enhanced template with comprehensive design system
 */
export interface EnhancedTemplate extends BrandTemplate {
  enhancedCSS: string; // Comprehensive CSS matching real website
  designSystem: {
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
      wide: string;
    };
    shadows: string[];
    gradients: string[];
    animations: {
      fadeIn: string;
      slideUp: string;
      scale: string;
    };
  };
  components: {
    header: string;
    hero: string;
    card: string;
    button: string;
    footer: string;
  };
}

/**
 * Get enhanced template with high-quality CSS
 */
export async function getEnhancedTemplate(templateId: string): Promise<EnhancedTemplate | null> {
  const template = BRAND_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  // Get enhancement based on brand
  const enhancement = await enhanceTemplateWithRealDesign(template);
  return enhancement;
}

/**
 * Enhance template with real design patterns from actual websites
 */
async function enhanceTemplateWithRealDesign(template: BrandTemplate): Promise<EnhancedTemplate> {
  // Brand-specific enhancements based on actual website analysis
  const brandEnhancements: Record<string, () => EnhancedTemplate> = {
    apple: () => enhanceAppleTemplate(template),
    tesla: () => enhanceTeslaTemplate(template),
    spacex: () => enhanceSpaceXTemplate(template),
    google: () => enhanceGoogleTemplate(template),
    microsoft: () => enhanceMicrosoftTemplate(template),
    amazon: () => enhanceAmazonTemplate(template),
    meta: () => enhanceMetaTemplate(template),
    nvidia: () => enhanceNvidiaTemplate(template),
    stripe: () => enhanceStripeTemplate(template),
    linear: () => enhanceLinearTemplate(template),
    vercel: () => enhanceVercelTemplate(template),
    notion: () => enhanceNotionTemplate(template),
  };

  const enhancer = brandEnhancements[template.id];
  if (enhancer) {
    return enhancer();
  }

  // Default enhancement for other templates
  return enhanceGenericTemplate(template);
}

/**
 * Apple.com - Pixel-perfect replica
 */
function enhanceAppleTemplate(template: BrandTemplate): EnhancedTemplate {
  return {
    ...template,
    enhancedCSS: `
/* Apple.com - High-Quality Replica */
@import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&family=SF+Pro+Text:wght@400;500;600&display=swap');

:root {
  --apple-blue: #0071E3;
  --apple-blue-hover: #0077ED;
  --apple-dark: #1D1D1F;
  --apple-gray: #6E6E73;
  --apple-light-gray: #F5F5F7;
  --apple-white: #FFFFFF;
  --apple-text: #1D1D1F;
  --apple-text-secondary: #6E6E73;
  --apple-border: #D2D2D7;
  
  /* Spacing System */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;
  
  /* Typography Scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  --font-size-6xl: 4rem;
  --font-size-7xl: 5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background: var(--apple-white);
  color: var(--apple-text);
  line-height: 1.47059;
  font-weight: 400;
  letter-spacing: -0.022em;
  font-size: 17px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Navigation - Apple Style */
.nav {
  background: rgba(251, 251, 253, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-container {
  max-width: 1024px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
}

.nav-links {
  display: flex;
  gap: 0;
  list-style: none;
}

.nav-links li {
  font-size: 12px;
  font-weight: 400;
  padding: 0 10px;
}

.nav-links a {
  color: var(--apple-text);
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.65;
}

/* Hero Section - Apple Centered Style */
.hero {
  text-align: center;
  padding: 80px 0 60px;
  max-width: 980px;
  margin: 0 auto;
}

.hero h1 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 80px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.015em;
  color: var(--apple-text);
  margin-bottom: 6px;
}

.hero-subheadline {
  font-size: 28px;
  font-weight: 400;
  line-height: 1.14286;
  letter-spacing: 0.007em;
  color: var(--apple-text);
  margin-bottom: 19px;
}

.hero-description {
  font-size: 21px;
  line-height: 1.381;
  font-weight: 400;
  color: var(--apple-text-secondary);
  margin-bottom: 20px;
}

.hero-cta {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

/* Buttons - Apple Style */
.btn {
  font-size: 17px;
  line-height: 1.17648;
  font-weight: 400;
  letter-spacing: -0.022em;
  min-width: 28px;
  padding: 12px 22px;
  border-radius: 980px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: var(--apple-blue);
  color: var(--apple-white);
}

.btn-primary:hover {
  background: var(--apple-blue-hover);
}

.btn-secondary {
  color: var(--apple-blue);
  background: transparent;
}

.btn-secondary:hover {
  text-decoration: underline;
}

/* Cards - Apple Style */
.card {
  background: var(--apple-white);
  border-radius: 18px;
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Sections */
.section {
  padding: var(--spacing-3xl) 0;
  max-width: 1024px;
  margin: 0 auto;
}

.section-title {
  font-size: 56px;
  font-weight: 600;
  line-height: 1.07143;
  letter-spacing: -0.005em;
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

/* Footer - Apple Style */
.footer {
  background: var(--apple-light-gray);
  padding: var(--spacing-2xl) 0;
  margin-top: var(--spacing-3xl);
  border-top: 1px solid var(--apple-border);
}

.footer-content {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 22px;
  font-size: 12px;
  color: var(--apple-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 48px;
  }
  
  .hero-subheadline {
    font-size: 21px;
  }
  
  .hero-description {
    font-size: 17px;
  }
  
  .section-title {
    font-size: 40px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
`,
    designSystem: {
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
        wide: '1920px',
      },
      shadows: [
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      ],
      gradients: [],
      animations: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        scale: 'scale 0.3s ease-out',
      },
    },
    components: {
      header: 'Apple-style navigation with backdrop blur',
      hero: 'Centered hero with large typography',
      card: 'Clean cards with subtle shadows',
      button: 'Rounded buttons with smooth transitions',
      footer: 'Light gray footer with subtle border',
    },
  };
}

/**
 * Tesla.com - High-quality replica
 */
function enhanceTeslaTemplate(template: BrandTemplate): EnhancedTemplate {
  return {
    ...template,
    enhancedCSS: `
/* Tesla.com - High-Quality Replica */
@import url('https://fonts.googleapis.com/css2?family=Gotham:wght@300;400;500;600;700&display=swap');

:root {
  --tesla-red: #E82127;
  --tesla-black: #000000;
  --tesla-white: #FFFFFF;
  --tesla-gray: #5C5E62;
  --tesla-light-gray: #F4F4F4;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Gotham", "Gotham SSm A", "Gotham SSm B", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--tesla-white);
  color: var(--tesla-black);
  line-height: 1.5;
  font-weight: 400;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

/* Navigation - Tesla Style */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  transition: background 0.3s;
}

.nav.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1920px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

.nav-logo {
  font-size: 20px;
  font-weight: 500;
  color: var(--tesla-black);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
  font-size: 14px;
  font-weight: 500;
}

.nav-links a {
  color: var(--tesla-black);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.7;
}

/* Hero Section - Tesla Fullscreen Style */
.hero {
  height: 100vh;
  min-height: 600px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-content {
  text-align: center;
  padding: 120px 20px 60px;
  z-index: 2;
}

.hero h1 {
  font-size: 40px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px;
  color: var(--tesla-black);
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: var(--tesla-gray);
  margin-bottom: 24px;
}

.hero-cta {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons - Tesla Style */
.btn {
  font-size: 14px;
  font-weight: 500;
  padding: 10px 40px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: var(--tesla-black);
  color: var(--tesla-white);
  border-color: var(--tesla-black);
}

.btn-primary:hover {
  background: rgba(0, 0, 0, 0.8);
}

.btn-secondary {
  background: transparent;
  color: var(--tesla-black);
  border-color: var(--tesla-black);
}

.btn-secondary:hover {
  background: var(--tesla-black);
  color: var(--tesla-white);
}

/* Sections */
.section {
  padding: var(--spacing-3xl) 0;
  max-width: 1920px;
  margin: 0 auto;
}

.section-title {
  font-size: 28px;
  font-weight: 500;
  text-align: center;
  margin-bottom: var(--spacing-xl);
  letter-spacing: -0.5px;
}

/* Footer - Tesla Style */
.footer {
  background: var(--tesla-light-gray);
  padding: var(--spacing-xl) 0;
  margin-top: var(--spacing-3xl);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  font-size: 12px;
  color: var(--tesla-gray);
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }
  
  .nav-links {
    display: none;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}
`,
    designSystem: {
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
        wide: '1920px',
      },
      shadows: [],
      gradients: [],
      animations: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        scale: 'scale 0.3s ease-out',
      },
    },
    components: {
      header: 'Fixed transparent navigation that becomes opaque on scroll',
      hero: 'Fullscreen hero with centered content',
      card: 'Minimal cards with clean borders',
      button: 'Uppercase buttons with border styling',
      footer: 'Light gray footer',
    },
  };
}

/**
 * SpaceX.com - High-quality replica
 */
function enhanceSpaceXTemplate(template: BrandTemplate): EnhancedTemplate {
  return {
    ...template,
    enhancedCSS: `
/* SpaceX.com - High-Quality Replica */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

:root {
  --spacex-black: #000000;
  --spacex-white: #FFFFFF;
  --spacex-gray: #8E8E8E;
  --spacex-dark-gray: #1A1A1A;
  
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--spacex-black);
  color: var(--spacex-white);
  line-height: 1.6;
  font-weight: 400;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

/* Navigation - SpaceX Style */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: transparent;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 24px;
  font-weight: 500;
  color: var(--spacex-white);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  gap: 40px;
  list-style: none;
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-links a {
  color: var(--spacex-white);
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-links a:hover {
  opacity: 0.7;
}

/* Hero Section - SpaceX Fullscreen Style */
.hero {
  height: 100vh;
  min-height: 600px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 0 20px;
}

.hero h1 {
  font-size: 56px;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 20px;
  color: var(--spacex-white);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-subtitle {
  font-size: 16px;
  font-weight: 300;
  color: var(--spacex-gray);
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-cta {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons - SpaceX Style */
.btn {
  font-size: 14px;
  font-weight: 500;
  padding: 12px 40px;
  border-radius: 0;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.btn-primary {
  background: var(--spacex-white);
  color: var(--spacex-black);
  border-color: var(--spacex-white);
}

.btn-primary:hover {
  background: transparent;
  color: var(--spacex-white);
}

.btn-secondary {
  background: transparent;
  color: var(--spacex-white);
  border-color: var(--spacex-white);
}

.btn-secondary:hover {
  background: var(--spacex-white);
  color: var(--spacex-black);
}

/* Sections */
.section {
  padding: var(--spacing-3xl) 0;
  max-width: 1920px;
  margin: 0 auto;
  background: var(--spacex-dark-gray);
}

.section-title {
  font-size: 40px;
  font-weight: 400;
  text-align: center;
  margin-bottom: var(--spacing-xl);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Footer - SpaceX Style */
.footer {
  background: var(--spacex-black);
  padding: var(--spacing-xl) 0;
  margin-top: var(--spacing-3xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  font-size: 12px;
  color: var(--spacex-gray);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }
  
  .nav-links {
    display: none;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}
`,
    designSystem: {
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
        wide: '1920px',
      },
      shadows: [],
      gradients: [],
      animations: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        scale: 'scale 0.3s ease-out',
      },
    },
    components: {
      header: 'Fixed transparent navigation with uppercase links',
      hero: 'Fullscreen hero with dark overlay and centered content',
      card: 'Dark cards with minimal styling',
      button: 'Uppercase buttons with border styling',
      footer: 'Black footer with subtle border',
    },
  };
}

// Generic enhancers for other brands (simplified for now)
function enhanceGoogleTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceMicrosoftTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceAmazonTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceMetaTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceNvidiaTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceStripeTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceLinearTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceVercelTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceNotionTemplate(template: BrandTemplate): EnhancedTemplate {
  return enhanceGenericTemplate(template);
}

function enhanceGenericTemplate(template: BrandTemplate): EnhancedTemplate {
  return {
    ...template,
    enhancedCSS: template.css, // Use existing CSS
    designSystem: {
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
        wide: '1920px',
      },
      shadows: [],
      gradients: [],
      animations: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideUp: 'slideUp 0.6s ease-out',
        scale: 'scale 0.3s ease-out',
      },
    },
    components: {
      header: 'Standard navigation',
      hero: 'Standard hero section',
      card: 'Standard cards',
      button: 'Standard buttons',
      footer: 'Standard footer',
    },
  };
}

