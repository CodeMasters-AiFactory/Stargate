/**
 * Professional Design System for Merlin Website Wizard
 * Inspired by Apple, Stripe, Linear - The best on planet Earth
 */

export interface DesignTokens {
  colors: {
    light: {
      background: string;
      foreground: string;
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      accent: string;
      accentForeground: string;
      muted: string;
      mutedForeground: string;
      border: string;
    };
    dark: {
      background: string;
      foreground: string;
      primary: string;
      primaryForeground: string;
      secondary: string;
      secondaryForeground: string;
      accent: string;
      accentForeground: string;
      muted: string;
      mutedForeground: string;
      border: string;
    };
  };
  typography: {
    fonts: {
      sans: string;
      serif: string;
      mono: string;
    };
    scale: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
    };
  };
  spacing: {
    section: string;
    container: string;
    card: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * Generate professional design tokens from user preferences
 */
export function generateDesignTokens(
  primaryColor: string,
  accentColor: string,
  fontStyle: string
): DesignTokens {
  // Extract font family
  const fontFamily = fontStyle.includes('(') 
    ? fontStyle.split('(')[0].trim() 
    : 'Inter';

  return {
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#0a0a0a',
        primary: primaryColor,
        primaryForeground: '#ffffff',
        secondary: '#f5f5f5',
        secondaryForeground: '#171717',
        accent: accentColor,
        accentForeground: '#ffffff',
        muted: '#f5f5f5',
        mutedForeground: '#737373',
        border: '#e5e5e5',
      },
      dark: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        primary: primaryColor,
        primaryForeground: '#ffffff',
        secondary: '#1a1a1a',
        secondaryForeground: '#e5e5e5',
        accent: accentColor,
        accentForeground: '#ffffff',
        muted: '#262626',
        mutedForeground: '#a3a3a3',
        border: '#262626',
      },
    },
    typography: {
      fonts: {
        sans: `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        serif: `'Georgia', 'Times New Roman', serif`,
        mono: `'Menlo', 'Monaco', 'Courier New', monospace`,
      },
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      },
    },
    spacing: {
      section: '5rem',
      container: '1280px',
      card: '1.5rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  };
}

/**
 * Professional template blocks catalog
 */
export const TEMPLATE_BLOCKS = {
  hero: {
    // Full-screen hero with gradient background
    modern: `
      <section class="hero-modern">
        <div class="hero-gradient"></div>
        <div class="hero-content">
          <h1 class="hero-title">{{title}}</h1>
          <p class="hero-subtitle">{{subtitle}}</p>
          <div class="hero-cta">
            <a href="{{ctaLink}}" class="btn-primary">{{ctaText}}</a>
            <a href="{{secondaryLink}}" class="btn-secondary">{{secondaryText}}</a>
          </div>
        </div>
      </section>`,
    
    // Minimal centered hero
    minimal: `
      <section class="hero-minimal">
        <div class="container-narrow">
          <h1 class="hero-title-minimal">{{title}}</h1>
          <p class="hero-description">{{subtitle}}</p>
          <a href="{{ctaLink}}" class="btn-primary-large">{{ctaText}}</a>
        </div>
      </section>`,
    
    // Hero with image/video background
    visual: `
      <section class="hero-visual">
        <div class="hero-media">
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-visual-content">
          <h1 class="hero-visual-title">{{title}}</h1>
          <p class="hero-visual-subtitle">{{subtitle}}</p>
          <a href="{{ctaLink}}" class="btn-glass">{{ctaText}}</a>
        </div>
      </section>`,
  },

  features: {
    // Feature grid with icons
    grid: `
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">{{title}}</h2>
          <p class="section-description">{{description}}</p>
          <div class="features-grid">
            {{#each features}}
            <div class="feature-card">
              <div class="feature-icon">{{icon}}</div>
              <h3 class="feature-title">{{title}}</h3>
              <p class="feature-description">{{description}}</p>
            </div>
            {{/each}}
          </div>
        </div>
      </section>`,
    
    // Bento box layout
    bento: `
      <section class="features-bento">
        <div class="container">
          <h2 class="section-title">{{title}}</h2>
          <div class="bento-grid">
            <div class="bento-large">
              <h3>{{feature1Title}}</h3>
              <p>{{feature1Description}}</p>
            </div>
            <div class="bento-small">
              <h3>{{feature2Title}}</h3>
              <p>{{feature2Description}}</p>
            </div>
            <div class="bento-small">
              <h3>{{feature3Title}}</h3>
              <p>{{feature3Description}}</p>
            </div>
            <div class="bento-medium">
              <h3>{{feature4Title}}</h3>
              <p>{{feature4Description}}</p>
            </div>
          </div>
        </div>
      </section>`,
  },

  services: {
    // Service cards with hover effects
    cards: `
      <section class="services-section">
        <div class="container">
          <h2 class="section-title">{{title}}</h2>
          <div class="services-grid">
            {{#each services}}
            <article class="service-card">
              <div class="service-number">{{number}}</div>
              <h3 class="service-title">{{title}}</h3>
              <p class="service-description">{{description}}</p>
              <a href="{{link}}" class="service-link">Learn more →</a>
            </article>
            {{/each}}
          </div>
        </div>
      </section>`,
    
    // Alternating layout
    alternating: `
      <section class="services-alternating">
        <div class="container">
          {{#each services}}
          <div class="service-row {{#if @index}}reverse{{/if}}">
            <div class="service-content">
              <h3 class="service-title-large">{{title}}</h3>
              <p class="service-description-large">{{description}}</p>
              <ul class="service-features">
                {{#each features}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            <div class="service-visual">
              <div class="service-placeholder"></div>
            </div>
          </div>
          {{/each}}
        </div>
      </section>`,
  },

  testimonials: {
    // Card grid layout
    grid: `
      <section class="testimonials-section">
        <div class="container">
          <h2 class="section-title">{{title}}</h2>
          <div class="testimonials-grid">
            {{#each testimonials}}
            <div class="testimonial-card">
              <p class="testimonial-quote">"{{quote}}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">{{initials}}</div>
                <div class="author-info">
                  <div class="author-name">{{name}}</div>
                  <div class="author-role">{{role}}</div>
                </div>
              </div>
            </div>
            {{/each}}
          </div>
        </div>
      </section>`,
  },

  pricing: {
    // Pricing table
    table: `
      <section class="pricing-section">
        <div class="container">
          <h2 class="section-title">{{title}}</h2>
          <p class="section-description">{{description}}</p>
          <div class="pricing-grid">
            {{#each plans}}
            <div class="pricing-card {{#if featured}}featured{{/if}}">
              <h3 class="plan-name">{{name}}</h3>
              <div class="plan-price">
                <span class="price-amount">{{price}}</span>
                <span class="price-period">{{period}}</span>
              </div>
              <ul class="plan-features">
                {{#each features}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              <a href="{{ctaLink}}" class="{{#if featured}}btn-primary{{else}}btn-secondary{{/if}}">{{ctaText}}</a>
            </div>
            {{/each}}
          </div>
        </div>
      </section>`,
  },

  about: {
    // About section with stats
    stats: `
      <section class="about-section">
        <div class="container">
          <div class="about-content">
            <h2 class="section-title">{{title}}</h2>
            <p class="about-description">{{description}}</p>
          </div>
          <div class="stats-grid">
            {{#each stats}}
            <div class="stat">
              <div class="stat-number">{{number}}</div>
              <div class="stat-label">{{label}}</div>
            </div>
            {{/each}}
          </div>
        </div>
      </section>`,
  },

  contact: {
    // Contact form
    form: `
      <section class="contact-section">
        <div class="container-narrow">
          <h2 class="section-title">{{title}}</h2>
          <p class="section-description">{{description}}</p>
          <form class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
              </div>
            </div>
            <div class="form-group">
              <label for="message">Message</label>
              <textarea id="message" name="message" rows="6" required></textarea>
            </div>
            <button type="submit" class="btn-primary">{{ctaText}}</button>
          </form>
        </div>
      </section>`,
  },

  footer: {
    // Multi-column footer
    columns: `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3>{{businessName}}</h3>
              <p>{{tagline}}</p>
            </div>
            {{#each columns}}
            <div class="footer-column">
              <h4>{{title}}</h4>
              <ul>
                {{#each links}}
                <li><a href="{{url}}">{{label}}</a></li>
                {{/each}}
              </ul>
            </div>
            {{/each}}
          </div>
          <div class="footer-bottom">
            <p>&copy; {{year}} {{businessName}}. All rights reserved.</p>
          </div>
        </div>
      </footer>`,
  },
};

/**
 * Generate complete CSS for the design system
 */
export function generateDesignSystemCSS(tokens: DesignTokens): string {
  return `/* Professional Design System - Generated for Merlin Website Wizard */

/* CSS Variables */
:root {
  /* Colors - Light Mode */
  --background: ${tokens.colors.light.background};
  --foreground: ${tokens.colors.light.foreground};
  --primary: ${tokens.colors.light.primary};
  --primary-foreground: ${tokens.colors.light.primaryForeground};
  --secondary: ${tokens.colors.light.secondary};
  --secondary-foreground: ${tokens.colors.light.secondaryForeground};
  --accent: ${tokens.colors.light.accent};
  --accent-foreground: ${tokens.colors.light.accentForeground};
  --muted: ${tokens.colors.light.muted};
  --muted-foreground: ${tokens.colors.light.mutedForeground};
  --border: ${tokens.colors.light.border};
  
  /* Typography */
  --font-sans: ${tokens.typography.fonts.sans};
  --font-serif: ${tokens.typography.fonts.serif};
  --font-mono: ${tokens.typography.fonts.mono};
  
  /* Spacing */
  --section-spacing: ${tokens.spacing.section};
  --container-width: ${tokens.spacing.container};
  --card-padding: ${tokens.spacing.card};
  
  /* Radius */
  --radius-sm: ${tokens.radius.sm};
  --radius-md: ${tokens.radius.md};
  --radius-lg: ${tokens.radius.lg};
  --radius-xl: ${tokens.radius.xl};
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: ${tokens.colors.dark.background};
    --foreground: ${tokens.colors.dark.foreground};
    --primary: ${tokens.colors.dark.primary};
    --primary-foreground: ${tokens.colors.dark.primaryForeground};
    --secondary: ${tokens.colors.dark.secondary};
    --secondary-foreground: ${tokens.colors.dark.secondaryForeground};
    --accent: ${tokens.colors.dark.accent};
    --accent-foreground: ${tokens.colors.dark.accentForeground};
    --muted: ${tokens.colors.dark.muted};
    --muted-foreground: ${tokens.colors.dark.mutedForeground};
    --border: ${tokens.colors.dark.border};
  }
}

/* Reset & Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--foreground);
  background-color: var(--background);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

h1 { font-size: ${tokens.typography.scale['6xl']}; }
h2 { font-size: ${tokens.typography.scale['4xl']}; }
h3 { font-size: ${tokens.typography.scale['3xl']}; }
h4 { font-size: ${tokens.typography.scale['2xl']}; }
h5 { font-size: ${tokens.typography.scale.xl}; }
h6 { font-size: ${tokens.typography.scale.lg}; }

p {
  margin-bottom: 1rem;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: opacity 0.2s;
}

a:hover {
  opacity: 0.8;
}

/* Container */
.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 2rem;
}

.container-narrow {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--primary-foreground);
  background-color: var(--primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.btn-primary-large {
  padding: 1.125rem 2.5rem;
  font-size: 1.125rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--foreground);
  background-color: transparent;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: var(--muted);
  border-color: var(--foreground);
}

.btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Section Spacing */
section {
  padding: var(--section-spacing) 0;
}

.section-title {
  font-size: ${tokens.typography.scale['4xl']};
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
}

.section-description {
  font-size: ${tokens.typography.scale.lg};
  color: var(--muted-foreground);
  text-align: center;
  max-width: 640px;
  margin: 0 auto 3rem;
}

/* Hero Sections */
.hero-modern {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  opacity: 0.95;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 900px;
  padding: 0 2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  margin-bottom: 2.5rem;
  opacity: 0.95;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-minimal {
  padding: 8rem 0;
  text-align: center;
}

.hero-title-minimal {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.hero-description {
  font-size: ${tokens.typography.scale.xl};
  color: var(--muted-foreground);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-visual {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.hero-media {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.hero-visual-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
}

.hero-visual-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.hero-visual-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  margin-bottom: 2.5rem;
}

/* Features Section */
.features-section {
  background-color: var(--muted);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  padding: 2rem;
  background-color: var(--background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-md);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: ${tokens.typography.scale.xl};
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--muted-foreground);
}

/* Bento Grid */
.features-bento {
  background-color: var(--background);
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 3rem;
}

.bento-large {
  grid-column: span 2;
  grid-row: span 2;
  padding: 3rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: white;
  border-radius: var(--radius-xl);
}

.bento-small {
  padding: 2rem;
  background-color: var(--muted);
  border-radius: var(--radius-lg);
}

.bento-medium {
  grid-column: span 2;
  padding: 2rem;
  background-color: var(--secondary);
  border-radius: var(--radius-lg);
}

/* Services Section */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.service-card {
  padding: 2.5rem;
  background-color: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s;
}

.service-card:hover {
  border-color: var(--primary);
}

.service-number {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  line-height: 3rem;
  text-align: center;
  background-color: var(--primary);
  color: var(--primary-foreground);
  border-radius: 50%;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.service-title {
  font-size: ${tokens.typography.scale['2xl']};
  font-weight: 600;
  margin-bottom: 1rem;
}

.service-description {
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
}

.service-link {
  color: var(--primary);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Alternating Services */
.services-alternating .service-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 6rem;
}

.services-alternating .service-row.reverse {
  direction: rtl;
}

.services-alternating .service-row.reverse > * {
  direction: ltr;
}

.service-title-large {
  font-size: ${tokens.typography.scale['3xl']};
  margin-bottom: 1rem;
}

.service-description-large {
  font-size: ${tokens.typography.scale.lg};
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
}

.service-features {
  list-style: none;
  padding: 0;
}

.service-features li {
  padding-left: 1.5rem;
  position: relative;
  margin-bottom: 0.75rem;
}

.service-features li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.service-visual {
  aspect-ratio: 4/3;
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.service-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

/* Testimonials */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  padding: 2rem;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.testimonial-quote {
  font-size: ${tokens.typography.scale.lg};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: var(--foreground);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: ${tokens.typography.scale.lg};
}

.author-name {
  font-weight: 600;
  font-size: ${tokens.typography.scale.base};
}

.author-role {
  font-size: ${tokens.typography.scale.sm};
  color: var(--muted-foreground);
}

/* Pricing */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.pricing-card {
  padding: 2.5rem;
  background-color: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured {
  border-color: var(--primary);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.plan-name {
  font-size: ${tokens.typography.scale['2xl']};
  font-weight: 600;
  margin-bottom: 1rem;
}

.plan-price {
  margin-bottom: 2rem;
}

.price-amount {
  font-size: ${tokens.typography.scale['5xl']};
  font-weight: 700;
}

.price-period {
  font-size: ${tokens.typography.scale.lg};
  color: var(--muted-foreground);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  text-align: left;
}

.plan-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

/* About Section */
.about-content {
  max-width: 800px;
  margin: 0 auto 4rem;
  text-align: center;
}

.about-description {
  font-size: ${tokens.typography.scale.lg};
  color: var(--muted-foreground);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-top: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: ${tokens.typography.scale['5xl']};
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: ${tokens.typography.scale.lg};
  color: var(--muted-foreground);
}

/* Contact Form */
.contact-form {
  margin-top: 3rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: ${tokens.typography.scale.sm};
  color: var(--foreground);
}

.form-group input,
.form-group textarea {
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--foreground);
  background-color: var(--background);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

/* Footer */
.site-footer {
  background-color: var(--muted);
  padding: 4rem 0 2rem;
  margin-top: var(--section-spacing);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand h3 {
  font-size: ${tokens.typography.scale['2xl']};
  margin-bottom: 1rem;
}

.footer-brand p {
  color: var(--muted-foreground);
}

.footer-column h4 {
  font-size: ${tokens.typography.scale.lg};
  margin-bottom: 1rem;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 0.75rem;
}

.footer-column a {
  color: var(--muted-foreground);
  transition: color 0.2s;
}

.footer-column a:hover {
  color: var(--foreground);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  text-align: center;
  color: var(--muted-foreground);
  font-size: ${tokens.typography.scale.sm};
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-cta {
    flex-direction: column;
  }
  
  .features-grid,
  .services-grid,
  .testimonials-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .bento-large,
  .bento-small,
  .bento-medium {
    grid-column: span 1;
    grid-row: span 1;
  }
  
  .services-alternating .service-row {
    grid-template-columns: 1fr;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
`;
}
