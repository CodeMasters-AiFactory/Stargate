/**
 * Advanced Effects Library
 * Stunning visual effects including glassmorphism, neumorphism, animations, and more
 * Inspired by the transparent Merlin effect and modern design trends
 */

export interface EffectOptions {
  type: 'glassmorphism' | 'neumorphism' | 'gradient-mesh' | 'particles' | 'parallax' | 'glow' | 'shimmer' | 'morphing';
  intensity?: 'subtle' | 'moderate' | 'strong';
  colors?: string[];
  animated?: boolean;
}

/**
 * Generate glassmorphism effect (like transparent Merlin)
 */
export function generateGlassmorphismEffect(options: EffectOptions = {}): { css: string; className: string } {
  const intensity = options.intensity || 'moderate';
  const blurMap = {
    'subtle': '10px',
    'moderate': '20px',
    'strong': '40px',
  };
  const opacityMap = {
    'subtle': '0.1',
    'moderate': '0.2',
    'strong': '0.3',
  };

  const css = `
.glassmorphism {
  background: rgba(255, 255, 255, ${opacityMap[intensity]});
  backdrop-filter: blur(${blurMap[intensity]});
  -webkit-backdrop-filter: blur(${blurMap[intensity]});
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  border-radius: 16px;
}

.glassmorphism-strong {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
}

.glassmorphism-dark {
  background: rgba(0, 0, 0, ${opacityMap[intensity]});
  backdrop-filter: blur(${blurMap[intensity]});
  -webkit-backdrop-filter: blur(${blurMap[intensity]});
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

${options.animated ? `
.glassmorphism-animated {
  animation: glassPulse 3s ease-in-out infinite;
}

@keyframes glassPulse {
  0%, 100% {
    background: rgba(255, 255, 255, ${opacityMap[intensity]});
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  }
  50% {
    background: rgba(255, 255, 255, ${parseFloat(opacityMap[intensity]) + 0.1});
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  }
}
` : ''}
  `.trim();

  return { css, className: 'glassmorphism' };
}

/**
 * Generate neumorphism effect
 */
export function generateNeumorphismEffect(options: EffectOptions = {}): { css: string; className: string } {
  const intensity = options.intensity || 'moderate';
  const shadowMap = {
    'subtle': '8px',
    'moderate': '20px',
    'strong': '30px',
  };

  const css = `
.neumorphism {
  background: #f0f0f0;
  border-radius: 20px;
  box-shadow: 
    ${shadowMap[intensity]} ${shadowMap[intensity]} ${shadowMap[intensity]} #bebebe,
    -${shadowMap[intensity]} -${shadowMap[intensity]} ${shadowMap[intensity]} #ffffff;
}

.neumorphism-inset {
  background: #f0f0f0;
  border-radius: 20px;
  box-shadow: 
    inset ${shadowMap[intensity]} ${shadowMap[intensity]} ${shadowMap[intensity]} #bebebe,
    inset -${shadowMap[intensity]} -${shadowMap[intensity]} ${shadowMap[intensity]} #ffffff;
}

.neumorphism-colored {
  background: linear-gradient(135deg, #3b82f6, #10b981);
  border-radius: 20px;
  box-shadow: 
    ${shadowMap[intensity]} ${shadowMap[intensity]} ${shadowMap[intensity]} rgba(59, 130, 246, 0.3),
    -${shadowMap[intensity]} -${shadowMap[intensity]} ${shadowMap[intensity]} rgba(16, 185, 129, 0.3);
}
  `.trim();

  return { css, className: 'neumorphism' };
}

/**
 * Generate gradient mesh effect
 */
export function generateGradientMeshEffect(colors: string[] = ['#3B82F6', '#10B981', '#8B5CF6']): { css: string; className: string } {
  const css = `
.gradient-mesh {
  position: relative;
  background: linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%);
  background-size: 200% 200%;
  animation: gradientShift 10s ease infinite;
}

.gradient-mesh::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, ${colors[0]}40 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, ${colors[1]}40 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, ${colors[2]}30 0%, transparent 70%);
  mix-blend-mode: multiply;
  animation: meshMove 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes meshMove {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  33% { transform: translate(10%, -10%) scale(1.1); opacity: 0.8; }
  66% { transform: translate(-10%, 10%) scale(0.9); opacity: 0.9; }
}
  `.trim();

  return { css, className: 'gradient-mesh' };
}

/**
 * Generate particle effect
 */
export function generateParticleEffect(colors: string[] = ['#3B82F6', '#10B981', '#8B5CF6']): { css: string; html: string; className: string } {
  const html = `
<div class="particles-container">
  ${Array.from({ length: 50 }, (_, i) => `
    <div class="particle" style="
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      opacity: ${Math.random() * 0.5 + 0.2};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    "></div>
  `).join('')}
</div>
  `.trim();

  const css = `
.particles-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.2;
  }
  25% {
    transform: translate(20px, -30px) scale(1.2);
    opacity: 0.5;
  }
  50% {
    transform: translate(-20px, 20px) scale(0.8);
    opacity: 0.3;
  }
  75% {
    transform: translate(30px, 10px) scale(1.1);
    opacity: 0.4;
  }
}
  `.trim();

  return { css, html, className: 'particles-container' };
}

/**
 * Generate glow effect
 */
export function generateGlowEffect(color: string = '#3B82F6', intensity: 'subtle' | 'moderate' | 'strong' = 'moderate'): { css: string; className: string } {
  const glowMap = {
    'subtle': '0 0 20px',
    'moderate': '0 0 40px',
    'strong': '0 0 60px',
  };

  const css = `
.glow-effect {
  box-shadow: ${glowMap[intensity]} ${color}40;
  transition: box-shadow 0.3s ease;
}

.glow-effect:hover {
  box-shadow: ${glowMap[intensity]} ${color}60;
}

.glow-text {
  text-shadow: 0 0 20px ${color}60, 0 0 40px ${color}40;
}

.glow-animated {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: ${glowMap[intensity]} ${color}40;
  }
  50% {
    box-shadow: ${glowMap[intensity]} ${color}80;
  }
}
  `.trim();

  return { css, className: 'glow-effect' };
}

/**
 * Generate shimmer effect
 */
export function generateShimmerEffect(): { css: string; className: string } {
  const css = `
.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.shimmer-text {
  background: linear-gradient(
    90deg,
    #1f2937 0%,
    #3b82f6 50%,
    #1f2937 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerText 3s linear infinite;
}

@keyframes shimmerText {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
  `.trim();

  return { css, className: 'shimmer' };
}

/**
 * Generate morphing blob effect
 */
export function generateMorphingBlobEffect(colors: string[] = ['#3B82F6', '#10B981', '#8B5CF6']): { css: string; html: string; className: string } {
  const html = `
<div class="morphing-blob">
  <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="blobGradient">
        <stop offset="0%" stop-color="${colors[0]}" />
        <stop offset="50%" stop-color="${colors[1]}" />
        <stop offset="100%" stop-color="${colors[2]}" />
      </linearGradient>
    </defs>
    <path class="blob-path" fill="url(#blobGradient)" opacity="0.3">
      <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
        M 250,250 Q 200,200 150,250 T 250,350 T 350,250 T 250,150 Z;
        M 250,250 Q 300,200 350,250 T 250,350 T 150,250 T 250,150 Z;
        M 250,250 Q 200,300 150,250 T 250,150 T 350,250 T 250,350 Z;
        M 250,250 Q 200,200 150,250 T 250,350 T 350,250 T 250,150 Z
      " />
    </path>
  </svg>
</div>
  `.trim();

  const css = `
.morphing-blob {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  filter: blur(60px);
}

.blob-path {
  animation: blobMorph 10s ease-in-out infinite;
}

@keyframes blobMorph {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}
  `.trim();

  return { css, html, className: 'morphing-blob' };
}

/**
 * Generate parallax effect
 */
export function generateParallaxEffect(): { css: string; className: string } {
  const css = `
.parallax-container {
  position: relative;
  overflow: hidden;
  height: 100vh;
}

.parallax-element {
  position: absolute;
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.parallax-slow {
  transform: translateZ(0) scale(1);
}

.parallax-medium {
  transform: translateZ(0) scale(1.1);
}

.parallax-fast {
  transform: translateZ(0) scale(1.2);
}
  `.trim();

  return { css, className: 'parallax-container' };
}

/**
 * Generate comprehensive effects library CSS
 */
export function generateEffectsLibraryCSS(): string {
  const glassmorphism = generateGlassmorphismEffect({ intensity: 'moderate', animated: true });
  const neumorphism = generateNeumorphismEffect({ intensity: 'moderate' });
  const gradientMesh = generateGradientMeshEffect();
  const particles = generateParticleEffect();
  const glow = generateGlowEffect();
  const shimmer = generateShimmerEffect();
  const morphingBlob = generateMorphingBlobEffect();
  const parallax = generateParallaxEffect();

  return `
/* Advanced Effects Library */
${glassmorphism.css}
${neumorphism.css}
${gradientMesh.css}
${particles.css}
${glow.css}
${shimmer.css}
${morphingBlob.css}
${parallax.css}

/* Additional advanced effects */
.floating {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.scale-on-hover {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scale-on-hover:hover {
  transform: scale(1.05);
}

.rotate-on-hover {
  transition: transform 0.3s ease;
}

.rotate-on-hover:hover {
  transform: rotate(5deg);
}

.fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slideInRight 0.8s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.zoom-in {
  animation: zoomIn 0.8s ease-out;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Advanced hover effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

/* Text effects */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-shadow-strong {
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Border effects */
.border-gradient {
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #3b82f6, #10b981) border-box;
}
  `.trim();
}

