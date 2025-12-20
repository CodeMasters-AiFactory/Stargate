/**
 * Premium Hero Section Generator
 * Creates truly stunning, agency-quality hero sections
 */

import { generate } from './multiModelAIOrchestrator';

export interface HeroContent {
  eyebrow?: string;
  badge?: string;
  headline: string;
  headlineGradient?: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  stats?: Array<{ value: string; label: string }>;
  imagePrompt?: string;
}

export interface HeroStyle {
  layout: 'split-left' | 'split-right' | 'centered' | 'fullscreen' | 'asymmetric';
  colorScheme: 'dark' | 'light' | 'gradient';
  animation: 'fade-in' | 'slide-up' | 'scale' | 'parallax' | 'none';
  visualStyle: 'image' | 'video' | 'abstract' | '3d' | 'illustration';
}

// Premium hero HTML templates
const HERO_TEMPLATES: Record<string, string> = {
  'split-left': `
<section class="hero hero-split" data-animation="{{animation}}">
  <div class="hero-container">
    <div class="hero-content">
      {{#if eyebrow}}
      <span class="hero-eyebrow animate-fade-in">{{eyebrow}}</span>
      {{/if}}
      <h1 class="hero-headline animate-fade-in" style="--delay: 0.1s">
        {{headline}}
        {{#if headlineGradient}}
        <span class="gradient-text">{{headlineGradient}}</span>
        {{/if}}
      </h1>
      <p class="hero-subheadline animate-fade-in" style="--delay: 0.2s">{{subheadline}}</p>
      <div class="hero-cta-group animate-fade-in" style="--delay: 0.3s">
        <a href="#contact" class="btn btn-primary btn-glow">
          {{ctaPrimary}}
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </a>
        {{#if ctaSecondary}}
        <a href="#learn-more" class="btn btn-secondary">{{ctaSecondary}}</a>
        {{/if}}
      </div>
      {{#if stats}}
      <div class="hero-stats animate-fade-in" style="--delay: 0.4s">
        {{#each stats}}
        <div class="stat">
          <span class="stat-value">{{value}}</span>
          <span class="stat-label">{{label}}</span>
        </div>
        {{/each}}
      </div>
      {{/if}}
    </div>
    <div class="hero-visual animate-scale-in">
      <div class="visual-container">
        <div class="visual-glow"></div>
        <img src="{{heroImage}}" alt="{{headline}}" class="hero-image" loading="eager" />
        <div class="visual-overlay"></div>
      </div>
      <div class="floating-elements">
        <div class="floating-card card-1"></div>
        <div class="floating-card card-2"></div>
      </div>
    </div>
  </div>
  <div class="hero-background">
    <div class="bg-gradient"></div>
    <div class="bg-grid"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
  </div>
</section>`,

  'centered': `
<section class="hero hero-centered" data-animation="{{animation}}">
  <div class="hero-container">
    <div class="hero-content">
      {{#if badge}}
      <div class="hero-badge animate-fade-in">
        <span class="badge-icon">✨</span>
        <span class="badge-text">{{badge}}</span>
      </div>
      {{/if}}
      <h1 class="hero-headline animate-fade-in" style="--delay: 0.1s">
        {{headline}}
        {{#if headlineGradient}}
        <span class="gradient-text">{{headlineGradient}}</span>
        {{/if}}
      </h1>
      <p class="hero-subheadline animate-fade-in" style="--delay: 0.2s">{{subheadline}}</p>
      <div class="hero-cta-group animate-fade-in" style="--delay: 0.3s">
        <a href="#contact" class="btn btn-primary btn-glow btn-large">
          {{ctaPrimary}}
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </a>
      </div>
      {{#if stats}}
      <div class="hero-stats animate-fade-in" style="--delay: 0.4s">
        {{#each stats}}
        <div class="stat">
          <span class="stat-value">{{value}}</span>
          <span class="stat-label">{{label}}</span>
        </div>
        {{/each}}
      </div>
      {{/if}}
    </div>
  </div>
  <div class="hero-background">
    <div class="bg-gradient-radial"></div>
    <div class="bg-particles"></div>
  </div>
</section>`,

  'fullscreen': `
<section class="hero hero-fullscreen" data-animation="{{animation}}">
  <div class="hero-media">
    <img src="{{heroImage}}" alt="{{headline}}" class="hero-bg-image" />
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-container">
    <div class="hero-content">
      {{#if eyebrow}}
      <span class="hero-eyebrow animate-fade-in">{{eyebrow}}</span>
      {{/if}}
      <h1 class="hero-headline hero-headline-xl animate-fade-in" style="--delay: 0.1s">
        {{headline}}
      </h1>
      <p class="hero-subheadline animate-fade-in" style="--delay: 0.2s">{{subheadline}}</p>
      <div class="hero-cta-group animate-fade-in" style="--delay: 0.3s">
        <a href="#contact" class="btn btn-primary btn-glow btn-large">{{ctaPrimary}}</a>
        {{#if ctaSecondary}}
        <a href="#learn-more" class="btn btn-outline-light btn-large">{{ctaSecondary}}</a>
        {{/if}}
      </div>
    </div>
  </div>
  <div class="scroll-indicator animate-bounce">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 5v14m-7-7 7 7 7-7"/>
    </svg>
  </div>
</section>`,
};

// Premium CSS for heroes
export const HERO_CSS = `
/* Premium Hero Styles */
.hero {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}

/* Split Layout */
.hero-split .hero-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Centered Layout */
.hero-centered {
  text-align: center;
}

.hero-centered .hero-content {
  max-width: 900px;
  margin: 0 auto;
}

/* Fullscreen Layout */
.hero-fullscreen {
  text-align: center;
}

.hero-fullscreen .hero-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* Content Styles */
.hero-eyebrow {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--primary)15;
  border-radius: 100px;
  border: 1px solid var(--primary)30;
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

.hero-headline {
  font-size: var(--size-hero, clamp(3rem, 7vw, 5.5rem));
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 1.5rem;
  color: var(--text);
}

.hero-headline-xl {
  font-size: clamp(3.5rem, 10vw, 8rem);
}

.gradient-text {
  display: block;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subheadline {
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 600px;
  margin-bottom: 2.5rem;
}

.hero-split .hero-subheadline {
  max-width: 500px;
}

.hero-centered .hero-subheadline,
.hero-fullscreen .hero-subheadline {
  margin-inline: auto;
}

/* CTA Buttons */
.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-centered .hero-cta-group,
.hero-fullscreen .hero-cta-group {
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 100px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
  border: none;
}

.btn-large {
  padding: 1.25rem 2.75rem;
  font-size: 1.0625rem;
}

.btn-primary {
  background: var(--gradient);
  color: white;
}

.btn-glow {
  box-shadow: 0 4px 30px var(--primary)40;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 40px var(--primary)50;
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 2px solid var(--text)30;
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-outline-light {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.btn:hover .btn-icon {
  transform: translateX(4px);
}

/* Stats */
.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--text)10;
}

.hero-centered .hero-stats,
.hero-fullscreen .hero-stats {
  justify-content: center;
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

/* Visual */
.hero-visual {
  position: relative;
}

.visual-container {
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

.visual-glow {
  position: absolute;
  inset: -50%;
  background: var(--gradient);
  opacity: 0.3;
  filter: blur(100px);
  z-index: -1;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, var(--background)80 100%);
  pointer-events: none;
}

/* Background Elements */
.hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 50% -20%, var(--primary)15 0%, transparent 70%);
}

.bg-gradient-radial {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, var(--primary)20 0%, transparent 50%);
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(var(--text)05 1px, transparent 1px),
    linear-gradient(90deg, var(--text)05 1px, transparent 1px);
  background-size: 60px 60px;
}

.bg-orbs .orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--primary);
  opacity: 0.1;
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--accent);
  opacity: 0.08;
  bottom: -100px;
  left: -100px;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: var(--secondary);
  opacity: 0.1;
  top: 50%;
  left: 30%;
  animation-delay: -10s;
}

/* Fullscreen Hero */
.hero-media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--background)80 0%, var(--background)95 100%);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  opacity: 0.6;
}

.scroll-indicator svg {
  width: 32px;
  height: 32px;
}

/* Animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease forwards;
  animation-delay: var(--delay, 0s);
}

.animate-scale-in {
  opacity: 0;
  transform: scale(0.95);
  animation: scaleIn 0.8s ease forwards;
  animation-delay: 0.3s;
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(3deg); }
  66% { transform: translate(-20px, 20px) rotate(-3deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-split .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero-split .hero-subheadline {
    max-width: 600px;
    margin-inline: auto;
  }
  
  .hero-split .hero-cta-group {
    justify-content: center;
  }
  
  .hero-split .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hero {
    min-height: auto;
    padding: 6rem 0;
  }
  
  .hero-fullscreen {
    min-height: 100vh;
    padding: 0;
  }
  
  .hero-cta-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-stats {
    gap: 1.5rem;
  }
}
`;

/**
 * Generate hero content using AI
 */
export async function generateHeroContent(config: {
  businessName: string;
  industry: string;
  targetAudience: string;
  tone: string;
  uniqueValue?: string;
}): Promise<HeroContent> {
  const prompt = `You are an expert copywriter. Create compelling hero section content for:

Business: ${config.businessName}
Industry: ${config.industry}
Target Audience: ${config.targetAudience}
Tone: ${config.tone}
${config.uniqueValue ? `Unique Value: ${config.uniqueValue}` : ''}

Create PUNCHY, MEMORABLE content. Be bold. Avoid generic phrases.

Response in JSON only:
{
  "eyebrow": "Short attention-grabbing phrase (3-5 words)",
  "headline": "Powerful main headline (4-8 words, NO period)",
  "headlineGradient": "Optional gradient word/phrase to emphasize",
  "subheadline": "Compelling subheadline expanding the value proposition (15-25 words)",
  "ctaPrimary": "Action-oriented CTA (2-4 words)",
  "ctaSecondary": "Secondary CTA (2-4 words)",
  "stats": [
    { "value": "100+", "label": "Something impressive" },
    { "value": "98%", "label": "Another impressive stat" },
    { "value": "24/7", "label": "Third stat" }
  ]
}`;

  try {
    const result = await generate({
      task: 'content',
      prompt,
      temperature: 0.8,
    });

    const cleanJson = result.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    // Fallback content
    return {
      eyebrow: `Welcome to ${config.businessName}`,
      headline: 'Transform Your Vision',
      headlineGradient: 'Into Reality',
      subheadline: `We help ${config.targetAudience} achieve their goals with innovative ${config.industry} solutions tailored to your needs.`,
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Learn More',
      stats: [
        { value: '500+', label: 'Happy Clients' },
        { value: '98%', label: 'Satisfaction' },
        { value: '10+', label: 'Years Experience' },
      ],
    };
  }
}

/**
 * Generate complete hero section HTML
 */
export function generateHeroHTML(
  content: HeroContent,
  style: HeroStyle,
  heroImageUrl: string = '/api/placeholder/1200/800'
): string {
  const template = HERO_TEMPLATES[style.layout] || HERO_TEMPLATES['split-left'];
  
  // Simple template replacement
  let html = template
    .replace(/\{\{headline\}\}/g, content.headline)
    .replace(/\{\{subheadline\}\}/g, content.subheadline)
    .replace(/\{\{ctaPrimary\}\}/g, content.ctaPrimary)
    .replace(/\{\{animation\}\}/g, style.animation)
    .replace(/\{\{heroImage\}\}/g, heroImageUrl);

  if (content.eyebrow) {
    html = html.replace(/\{\{eyebrow\}\}/g, content.eyebrow);
    html = html.replace(/\{\{#if eyebrow\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if eyebrow\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (content.badge) {
    html = html.replace(/\{\{badge\}\}/g, content.badge);
    html = html.replace(/\{\{#if badge\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if badge\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (content.headlineGradient) {
    html = html.replace(/\{\{headlineGradient\}\}/g, content.headlineGradient);
    html = html.replace(/\{\{#if headlineGradient\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if headlineGradient\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (content.ctaSecondary) {
    html = html.replace(/\{\{ctaSecondary\}\}/g, content.ctaSecondary);
    html = html.replace(/\{\{#if ctaSecondary\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if ctaSecondary\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (content.stats && content.stats.length > 0) {
    const statsHtml = content.stats.map(stat => 
      `<div class="stat"><span class="stat-value">${stat.value}</span><span class="stat-label">${stat.label}</span></div>`
    ).join('');
    html = html.replace(/\{\{#each stats\}\}[\s\S]*?\{\{\/each\}\}/g, statsHtml);
    html = html.replace(/\{\{#if stats\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#if stats\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return html;
}

console.log('[Premium Hero Generator] 🦸 Agency-quality hero sections ready');

