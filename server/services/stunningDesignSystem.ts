/**
 * Stunning Design System - The Secret Sauce
 * Premium visual effects that make websites truly beautiful
 * 
 * This is what separates "good" from "jaw-dropping"
 */

// ============================================
// PREMIUM COLOR PALETTES - Designer Curated
// ============================================
export const STUNNING_PALETTES = {
  // Dark & Luxurious
  'midnight-gold': {
    name: 'Midnight Gold',
    mood: 'luxury',
    primary: '#D4AF37',      // Gold
    secondary: '#1A1A2E',    // Deep navy
    accent: '#E8D5B7',       // Champagne
    background: '#0D0D1A',   // Near black
    surface: '#16162A',      // Elevated surface
    text: '#FAFAFA',
    textMuted: '#A0A0B0',
    gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #8B6914 100%)',
    glow: '0 0 40px rgba(212, 175, 55, 0.3)',
  },
  'aurora-borealis': {
    name: 'Aurora Borealis',
    mood: 'creative',
    primary: '#00D9FF',      // Cyan
    secondary: '#7B2FFF',    // Purple
    accent: '#FF2E97',       // Pink
    background: '#0A0A1A',   // Dark
    surface: '#12122A',
    text: '#FFFFFF',
    textMuted: '#8888AA',
    gradient: 'linear-gradient(135deg, #00D9FF 0%, #7B2FFF 50%, #FF2E97 100%)',
    glow: '0 0 60px rgba(123, 47, 255, 0.4)',
  },
  'forest-whisper': {
    name: 'Forest Whisper',
    mood: 'natural',
    primary: '#2D5A27',      // Forest green
    secondary: '#1A3A17',    // Deep forest
    accent: '#8FBC8F',       // Sage
    background: '#F5F7F4',   // Off white
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#5A5A5A',
    gradient: 'linear-gradient(135deg, #2D5A27 0%, #4A7C43 50%, #6B9B65 100%)',
    glow: '0 0 30px rgba(45, 90, 39, 0.2)',
  },
  'ocean-depth': {
    name: 'Ocean Depth',
    mood: 'professional',
    primary: '#0077B6',      // Ocean blue
    secondary: '#023E8A',    // Deep blue
    accent: '#00B4D8',       // Light blue
    background: '#03071E',   // Abyss
    surface: '#0A1128',
    text: '#FFFFFF',
    textMuted: '#90CAF9',
    gradient: 'linear-gradient(135deg, #0077B6 0%, #023E8A 50%, #03045E 100%)',
    glow: '0 0 50px rgba(0, 119, 182, 0.3)',
  },
  'sunset-ember': {
    name: 'Sunset Ember',
    mood: 'warm',
    primary: '#FF6B35',      // Coral
    secondary: '#F7931A',    // Orange
    accent: '#FFE66D',       // Yellow
    background: '#1A0A00',   // Deep brown
    surface: '#2A1A10',
    text: '#FFF5EB',
    textMuted: '#FFCC99',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931A 50%, #FFE66D 100%)',
    glow: '0 0 40px rgba(255, 107, 53, 0.4)',
  },
  'rose-quartz': {
    name: 'Rose Quartz',
    mood: 'elegant',
    primary: '#E91E63',      // Rose
    secondary: '#AD1457',    // Deep rose
    accent: '#F8BBD9',       // Light pink
    background: '#FFF5F8',   // Blush
    surface: '#FFFFFF',
    text: '#2D2D2D',
    textMuted: '#6D6D6D',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 50%, #AD1457 100%)',
    glow: '0 0 30px rgba(233, 30, 99, 0.2)',
  },
  'arctic-frost': {
    name: 'Arctic Frost',
    mood: 'clean',
    primary: '#4FC3F7',      // Ice blue
    secondary: '#0288D1',    // Deep blue
    accent: '#B3E5FC',       // Light ice
    background: '#FAFEFF',   // Snow
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textMuted: '#5C5C7A',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 50%, #0288D1 100%)',
    glow: '0 0 30px rgba(79, 195, 247, 0.25)',
  },
  'noir-crimson': {
    name: 'Noir Crimson',
    mood: 'bold',
    primary: '#DC143C',      // Crimson
    secondary: '#8B0000',    // Dark red
    accent: '#FFD700',       // Gold accent
    background: '#0A0A0A',   // Pure black
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#AAAAAA',
    gradient: 'linear-gradient(135deg, #DC143C 0%, #B22222 50%, #8B0000 100%)',
    glow: '0 0 50px rgba(220, 20, 60, 0.4)',
  },
};

// ============================================
// PREMIUM TYPOGRAPHY PAIRINGS
// ============================================
export const STUNNING_TYPOGRAPHY = {
  'editorial-luxury': {
    name: 'Editorial Luxury',
    heading: {
      family: '"Playfair Display", Georgia, serif',
      weight: '700',
      letterSpacing: '-0.03em',
      lineHeight: '1.1',
    },
    body: {
      family: '"Crimson Pro", Georgia, serif',
      weight: '400',
      letterSpacing: '0.01em',
      lineHeight: '1.7',
    },
    sizes: {
      hero: 'clamp(3rem, 8vw, 7rem)',
      h1: 'clamp(2.5rem, 5vw, 4.5rem)',
      h2: 'clamp(2rem, 4vw, 3rem)',
      h3: 'clamp(1.5rem, 3vw, 2rem)',
      body: '1.125rem',
      small: '0.875rem',
    },
  },
  'tech-modern': {
    name: 'Tech Modern',
    heading: {
      family: '"Space Grotesk", "Helvetica Neue", sans-serif',
      weight: '700',
      letterSpacing: '-0.04em',
      lineHeight: '1.05',
    },
    body: {
      family: '"Inter", -apple-system, sans-serif',
      weight: '400',
      letterSpacing: '-0.01em',
      lineHeight: '1.65',
    },
    sizes: {
      hero: 'clamp(3rem, 10vw, 8rem)',
      h1: 'clamp(2.5rem, 6vw, 5rem)',
      h2: 'clamp(1.75rem, 4vw, 3rem)',
      h3: 'clamp(1.25rem, 2.5vw, 1.75rem)',
      body: '1.0625rem',
      small: '0.875rem',
    },
  },
  'minimal-elegant': {
    name: 'Minimal Elegant',
    heading: {
      family: '"Outfit", "Helvetica Neue", sans-serif',
      weight: '600',
      letterSpacing: '-0.02em',
      lineHeight: '1.15',
    },
    body: {
      family: '"Plus Jakarta Sans", -apple-system, sans-serif',
      weight: '400',
      letterSpacing: '0',
      lineHeight: '1.7',
    },
    sizes: {
      hero: 'clamp(2.5rem, 7vw, 5.5rem)',
      h1: 'clamp(2rem, 5vw, 4rem)',
      h2: 'clamp(1.5rem, 3.5vw, 2.5rem)',
      h3: 'clamp(1.25rem, 2.5vw, 1.75rem)',
      body: '1rem',
      small: '0.875rem',
    },
  },
  'bold-impact': {
    name: 'Bold Impact',
    heading: {
      family: '"Bebas Neue", Impact, sans-serif',
      weight: '400',
      letterSpacing: '0.05em',
      lineHeight: '0.95',
    },
    body: {
      family: '"Roboto", "Helvetica Neue", sans-serif',
      weight: '400',
      letterSpacing: '0.02em',
      lineHeight: '1.6',
    },
    sizes: {
      hero: 'clamp(4rem, 12vw, 10rem)',
      h1: 'clamp(3rem, 8vw, 6rem)',
      h2: 'clamp(2rem, 5vw, 4rem)',
      h3: 'clamp(1.5rem, 3vw, 2rem)',
      body: '1.0625rem',
      small: '0.875rem',
    },
  },
};

// ============================================
// PREMIUM CSS EFFECTS
// ============================================
export const STUNNING_EFFECTS = {
  // Glassmorphism
  glass: {
    light: `
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    `,
    dark: `
      background: rgba(15, 15, 25, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `,
    colorful: `
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    `,
  },

  // Premium Shadows
  shadows: {
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    large: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: (color: string) => `0 0 40px ${color}40, 0 0 80px ${color}20`,
    inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    dreamy: '0 30px 60px -10px rgba(0, 0, 0, 0.22), 0 18px 36px -18px rgba(0, 0, 0, 0.25)',
  },

  // Text Effects
  text: {
    gradient: (gradient: string) => `
      background: ${gradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    `,
    glow: (color: string) => `text-shadow: 0 0 20px ${color}60, 0 0 40px ${color}40;`,
    outline: `
      -webkit-text-stroke: 1px currentColor;
      -webkit-text-fill-color: transparent;
    `,
  },

  // Borders
  borders: {
    gradient: (gradient: string) => `
      border: 2px solid transparent;
      background: linear-gradient(var(--background), var(--background)) padding-box, ${gradient} border-box;
    `,
    glow: (color: string) => `
      border: 1px solid ${color}40;
      box-shadow: 0 0 20px ${color}20, inset 0 0 20px ${color}10;
    `,
  },
};

// ============================================
// STUNNING HERO SECTION TEMPLATES
// ============================================
export const STUNNING_HEROES = {
  'split-dramatic': {
    name: 'Split Dramatic',
    html: `
<section class="hero-split-dramatic">
  <div class="hero-content">
    <span class="hero-eyebrow">{{eyebrow}}</span>
    <h1 class="hero-title">{{title}}</h1>
    <p class="hero-description">{{description}}</p>
    <div class="hero-cta-group">
      <a href="#" class="cta-primary">{{cta_primary}}</a>
      <a href="#" class="cta-secondary">{{cta_secondary}}</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="hero-image-container">
      <img src="{{image}}" alt="{{image_alt}}" class="hero-image" />
      <div class="hero-image-glow"></div>
    </div>
  </div>
  <div class="hero-background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="grid-pattern"></div>
  </div>
</section>`,
    css: `
.hero-split-dramatic {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 6rem 4rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 10;
}

.hero-eyebrow {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary)15;
  border-radius: 100px;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 500px;
  margin-bottom: 2.5rem;
}

.hero-cta-group {
  display: flex;
  gap: 1rem;
}

.cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: var(--gradient);
  color: white;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: var(--glow);
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px var(--primary)40;
}

.cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  color: var(--text);
  border: 2px solid var(--text)30;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.hero-visual {
  position: relative;
  z-index: 10;
}

.hero-image-container {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 24px;
}

.hero-image-glow {
  position: absolute;
  inset: -50%;
  background: var(--gradient);
  opacity: 0.3;
  filter: blur(100px);
  z-index: -1;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--primary);
  opacity: 0.15;
  top: -200px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--accent);
  opacity: 0.1;
  bottom: -100px;
  left: -50px;
  animation: float 15s ease-in-out infinite reverse;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--text)05 1px, transparent 1px),
    linear-gradient(90deg, var(--text)05 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.5;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(5deg); }
  66% { transform: translate(-20px, 20px) rotate(-5deg); }
}

@media (max-width: 1024px) {
  .hero-split-dramatic {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .hero-description {
    margin-inline: auto;
  }
  
  .hero-cta-group {
    justify-content: center;
  }
}`,
  },

  'centered-impact': {
    name: 'Centered Impact',
    html: `
<section class="hero-centered-impact">
  <div class="hero-content">
    <div class="hero-badge">
      <span class="badge-icon">✨</span>
      <span class="badge-text">{{badge}}</span>
    </div>
    <h1 class="hero-title">
      <span class="title-line">{{title_line1}}</span>
      <span class="title-gradient">{{title_line2}}</span>
    </h1>
    <p class="hero-description">{{description}}</p>
    <div class="hero-cta">
      <a href="#" class="cta-main">
        <span>{{cta}}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
    <div class="hero-stats">
      <div class="stat">
        <span class="stat-value">{{stat1_value}}</span>
        <span class="stat-label">{{stat1_label}}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{stat2_value}}</span>
        <span class="stat-label">{{stat2_label}}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{stat3_value}}</span>
        <span class="stat-label">{{stat3_label}}</span>
      </div>
    </div>
  </div>
  <div class="hero-glow"></div>
</section>`,
    css: `
.hero-centered-impact {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 900px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--primary)30;
  border-radius: 100px;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.badge-icon {
  font-size: 1rem;
}

.hero-title {
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
}

.title-line {
  display: block;
  color: var(--text);
}

.title-gradient {
  display: block;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.cta-main {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.125rem 2.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
  background: var(--gradient);
  color: white;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 30px var(--primary)40;
}

.cta-main:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 40px var(--primary)50;
}

.cta-main svg {
  transition: transform 0.3s ease;
}

.cta-main:hover svg {
  transform: translateX(4px);
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid var(--text)10;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--text)15;
}

.hero-glow {
  position: absolute;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, var(--primary)20 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

@media (max-width: 768px) {
  .hero-stats {
    flex-wrap: wrap;
    gap: 1.5rem;
  }
  
  .stat-divider {
    display: none;
  }
}`,
  },
};

// ============================================
// MICRO-INTERACTIONS
// ============================================
export const MICRO_INTERACTIONS = {
  buttonHover: `
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `,
  
  cardHover: `
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 30px 60px -10px rgba(0, 0, 0, 0.2);
    }
  `,
  
  linkUnderline: `
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: currentColor;
      transition: width 0.3s ease;
    }
    
    &:hover::after {
      width: 100%;
    }
  `,
  
  fadeInUp: `
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.6s ease forwards;
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  scaleIn: `
    opacity: 0;
    transform: scale(0.9);
    animation: scaleIn 0.5s ease forwards;
    
    @keyframes scaleIn {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  
  shimmer: `
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      100% {
        left: 100%;
      }
    }
  `,
};

// ============================================
// SCROLL ANIMATIONS (CSS-only)
// ============================================
export const SCROLL_ANIMATIONS = `
/* Scroll-triggered animations using CSS */
@supports (animation-timeline: scroll()) {
  .scroll-fade-in {
    animation: scrollFadeIn linear;
    animation-timeline: view();
    animation-range: entry 0% cover 40%;
  }
  
  @keyframes scrollFadeIn {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .scroll-scale {
    animation: scrollScale linear;
    animation-timeline: view();
    animation-range: entry 0% cover 50%;
  }
  
  @keyframes scrollScale {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}

/* Fallback for browsers without scroll-timeline */
@supports not (animation-timeline: scroll()) {
  .scroll-fade-in,
  .scroll-scale {
    opacity: 1;
    transform: none;
  }
}
`;

// ============================================
// EXPORT COMBINED CSS
// ============================================
export function generateStunningCSS(paletteKey: string, typographyKey: string): string {
  const palette = STUNNING_PALETTES[paletteKey] || STUNNING_PALETTES['midnight-gold'];
  const typography = STUNNING_TYPOGRAPHY[typographyKey] || STUNNING_TYPOGRAPHY['tech-modern'];
  
  return `
/* Stunning Design System - Auto-Generated */
:root {
  /* Colors */
  --primary: ${palette.primary};
  --secondary: ${palette.secondary};
  --accent: ${palette.accent};
  --background: ${palette.background};
  --surface: ${palette.surface};
  --text: ${palette.text};
  --text-muted: ${palette.textMuted};
  --gradient: ${palette.gradient};
  --glow: ${palette.glow};
  
  /* Typography */
  --font-heading: ${typography.heading.family};
  --font-body: ${typography.body.family};
  --font-weight-heading: ${typography.heading.weight};
  --font-weight-body: ${typography.body.weight};
  --letter-spacing-heading: ${typography.heading.letterSpacing};
  --letter-spacing-body: ${typography.body.letterSpacing};
  --line-height-heading: ${typography.heading.lineHeight};
  --line-height-body: ${typography.body.lineHeight};
  
  /* Font Sizes */
  --size-hero: ${typography.sizes.hero};
  --size-h1: ${typography.sizes.h1};
  --size-h2: ${typography.sizes.h2};
  --size-h3: ${typography.sizes.h3};
  --size-body: ${typography.sizes.body};
  --size-small: ${typography.sizes.small};
}

/* Base Styles */
body {
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
  letter-spacing: var(--letter-spacing-body);
  line-height: var(--line-height-body);
  font-size: var(--size-body);
  color: var(--text);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  letter-spacing: var(--letter-spacing-heading);
  line-height: var(--line-height-heading);
}

h1 { font-size: var(--size-h1); }
h2 { font-size: var(--size-h2); }
h3 { font-size: var(--size-h3); }

/* Selection */
::selection {
  background: var(--primary);
  color: white;
}

/* Focus Styles */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Smooth Scroll */
html {
  scroll-behavior: smooth;
}

${SCROLL_ANIMATIONS}
`;
}

console.log('[Stunning Design System] ✨ Premium visual effects loaded');

