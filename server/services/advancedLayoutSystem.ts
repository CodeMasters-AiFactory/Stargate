/**
 * Advanced Layout System
 * Generates stunning, professional layouts with modern design patterns
 * Includes grid systems, responsive layouts, and advanced composition
 */

export interface LayoutOptions {
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'gallery' | 'team' | 'contact' | 'blog' | 'services';
  style: 'modern' | 'minimalist' | 'bold' | 'elegant' | 'creative' | 'corporate';
  columns?: number;
  spacing?: 'tight' | 'normal' | 'spacious' | 'ultra-spacious';
  alignment?: 'left' | 'center' | 'right' | 'justified';
  cardStyle?: 'flat' | 'elevated' | 'outlined' | 'glassmorphism' | 'neumorphism';
}

export interface LayoutResult {
  html: string;
  css: string;
  gridSystem: string;
  responsiveBreakpoints: Record<string, string>;
}

/**
 * Generate advanced grid system
 */
export function generateAdvancedGridSystem(columns: number = 12): string {
  return `
/* Advanced 12-Column Grid System */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.grid-item-1 { grid-column: span 1; }
.grid-item-2 { grid-column: span 2; }
.grid-item-3 { grid-column: span 3; }
.grid-item-4 { grid-column: span 4; }
.grid-item-5 { grid-column: span 5; }
.grid-item-6 { grid-column: span 6; }
.grid-item-7 { grid-column: span 7; }
.grid-item-8 { grid-column: span 8; }
.grid-item-9 { grid-column: span 9; }
.grid-item-10 { grid-column: span 10; }
.grid-item-11 { grid-column: span 11; }
.grid-item-12 { grid-column: span 12; }

@media (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(6, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
  `.trim();
}

/**
 * Generate stunning hero layout
 */
export function generateStunningHeroLayout(options: LayoutOptions): LayoutResult {
  const spacing = options.spacing || 'spacious';
  const spacingMap = {
    'tight': '2rem',
    'normal': '4rem',
    'spacious': '6rem',
    'ultra-spacious': '8rem',
  };

  const html = `
<section class="hero-stunning" style="position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden;">
  <div class="hero-background" style="position: absolute; inset: 0; z-index: 0;">
    <div class="hero-gradient-overlay"></div>
    <div class="hero-pattern"></div>
  </div>
  <div class="hero-content" style="position: relative; z-index: 1; max-width: 1200px; padding: ${spacingMap[spacing]}; text-align: center;">
    <div class="hero-badge" style="display: inline-block; padding: 0.5rem 1.5rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 50px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2);">
      <span style="color: white; font-size: 0.875rem; font-weight: 600; letter-spacing: 0.05em;">Welcome</span>
    </div>
    <h1 class="hero-title" style="font-size: clamp(3rem, 10vw, 6rem); font-weight: 800; line-height: 1.1; margin-bottom: 2rem; background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      Your Stunning Headline
    </h1>
    <p class="hero-subtitle" style="font-size: clamp(1.25rem, 3vw, 1.75rem); line-height: 1.6; margin-bottom: 3rem; color: rgba(255,255,255,0.95); max-width: 800px; margin-left: auto; margin-right: auto;">
      Your compelling subtitle that captures attention and communicates value
    </p>
    <div class="hero-cta-group" style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
      <a href="#start" class="btn-primary-hero" style="padding: 1.25rem 3rem; background: white; color: #1f2937; border-radius: 12px; font-weight: 700; font-size: 1.125rem; text-decoration: none; transition: all 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        Get Started
      </a>
      <a href="#learn" class="btn-secondary-hero" style="padding: 1.25rem 3rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; font-weight: 700; font-size: 1.125rem; text-decoration: none; transition: all 0.3s;">
        Learn More
      </a>
    </div>
  </div>
  <div class="hero-scroll-indicator" style="position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 1; animation: bounce 2s infinite;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
    </svg>
  </div>
</section>
  `.trim();

  const css = `
.hero-stunning {
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(16, 185, 129, 0.9) 50%, rgba(139, 92, 246, 0.9) 100%);
  animation: gradientShift 10s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
  background-size: 100% 100%;
  animation: patternMove 20s ease infinite;
}

@keyframes patternMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-5%, -5%) scale(1.1); }
}

.hero-badge {
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  animation: fadeInUp 1s ease-out 0.2s both;
}

.hero-subtitle {
  animation: fadeInUp 1s ease-out 0.4s both;
}

.hero-cta-group {
  animation: fadeInUp 1s ease-out 0.6s both;
}

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

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

.btn-primary-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
}

.btn-secondary-hero:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}
  `.trim();

  return {
    html,
    css,
    gridSystem: generateAdvancedGridSystem(),
    responsiveBreakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px',
      wide: '1400px',
    },
  };
}

/**
 * Generate advanced card layout
 */
export function generateAdvancedCardLayout(
  items: Array<{ title: string; content: string; icon?: string }>,
  options: LayoutOptions
): LayoutResult {
  const cardStyle = options.cardStyle || 'elevated';
  
  const cardStyles: Record<string, string> = {
    'flat': 'background: white; border: 1px solid #e5e7eb;',
    'elevated': 'background: white; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);',
    'outlined': 'background: white; border: 2px solid #3b82f6;',
    'glassmorphism': 'background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2);',
    'neumorphism': 'background: #f0f0f0; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;',
  };

  const cardsHTML = items.map((item, index) => `
    <div class="advanced-card" style="${cardStyles[cardStyle]} padding: 2.5rem; border-radius: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); animation: fadeInUp 0.6s ease-out ${index * 0.1}s both;">
      ${item.icon ? `<div class="card-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #10b981); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; font-size: 1.5rem;">${item.icon}</div>` : ''}
      <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937;">${item.title}</h3>
      <p style="color: #6b7280; line-height: 1.7; font-size: 1.0625rem;">${item.content}</p>
    </div>
  `).join('\n    ');

  const html = `
<section class="advanced-cards-section" style="padding: 6rem 2rem; background: #f8f9fa;">
  <div class="container" style="max-width: 1400px; margin: 0 auto;">
    <div class="cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2.5rem;">
      ${cardsHTML}
    </div>
  </div>
</section>
  `.trim();

  const css = `
.advanced-card:hover {
  transform: translateY(-8px) scale(1.02);
  ${cardStyle === 'elevated' ? 'box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15), 0 8px 12px -4px rgba(0,0,0,0.08);' : ''}
}

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
  `.trim();

  return {
    html,
    css,
    gridSystem: generateAdvancedGridSystem(),
    responsiveBreakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1024px',
    },
  };
}

