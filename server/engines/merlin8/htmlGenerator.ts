/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - HTML GENERATOR 🏗️
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Generates agency-quality HTML/CSS websites.
 * No more basic output - this is the REAL deal.
 */

import { IndustryDNA, generateCSSVariables } from './industryDNA';
import { GeneratedImage } from './leonardoIntegration';

export interface WebsiteContent {
  businessName: string;
  tagline: string;
  description: string;
  services: Array<{ name: string; description: string }>;
  location?: string;
  phone?: string;
  email?: string;
}

export interface GeneratedWebsite {
  html: string;
  css: string;
  pages: Array<{ name: string; html: string }>;
}

/**
 * Generate complete website HTML
 */
export function generateWebsite(
  content: WebsiteContent,
  industry: IndustryDNA,
  images: GeneratedImage[]
): GeneratedWebsite {
  const css = generateCSS(industry);
  const html = generateHTML(content, industry, images);
  
  return {
    html,
    css,
    pages: [{ name: 'index', html }],
  };
}

/**
 * Generate the main CSS
 */
function generateCSS(industry: IndustryDNA): string {
  const variables = generateCSSVariables(industry);
  
  return `
${variables}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════════════════════ */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: clamp(1.25rem, 2vw, 1.5rem); }

p {
  margin-bottom: 1rem;
  max-width: 65ch;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

a:hover {
  opacity: 0.8;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════════ */

nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 900;
  color: #FFFFFF;
  text-decoration: none;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  color: #FFFFFF;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 1px;
  padding: 0.5rem 0;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

/* Mobile menu */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: block; }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.3);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 100%);
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.hero h1 {
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  color: #FFFFFF;
  text-shadow: 3px 3px 6px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8);
  font-weight: 900;
}

.hero h1 .highlight {
  color: var(--color-primary);
  text-shadow: 3px 3px 6px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8);
}

.hero .subtitle {
  font-size: 1.25rem;
  color: #FFFFFF;
  text-shadow: 2px 2px 6px rgba(0,0,0,1);
  max-width: 500px;
  margin-bottom: 2rem;
  color: rgba(255,255,255,0.9);
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════════════════════════ */

.btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.875rem;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: transparent;
  color: var(--color-primary);
}

.btn-outline {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-text);
  margin-left: 1rem;
}

.btn-outline:hover {
  background: var(--color-text);
  color: var(--color-background);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════════════════════════════════════ */

.stats-bar {
  background: var(--color-secondary);
  padding: 3rem 0;
  border-top: 3px solid var(--color-primary);
}

.stats-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
}

.stat-item h3 {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-item p {
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 2px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SECTIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

section {
  padding: 6rem 0;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  text-transform: uppercase;
}

.section-header p {
  color: var(--color-text);
  opacity: 0.7;
  max-width: 600px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CARDS GRID
   ═══════════════════════════════════════════════════════════════════════════════ */

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.card {
  background: ${industry.design.colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow);
}

.card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.card p {
  opacity: 0.8;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TWO COLUMN SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.two-column img {
  width: 100%;
  border-radius: var(--border-radius);
  border: 3px solid var(--color-primary);
}

.two-column-content h2 {
  text-transform: uppercase;
}

.two-column-content p {
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */

.cta-section {
  background: var(--color-primary);
  text-align: center;
  padding: 5rem 0;
}

.cta-section h2,
.cta-section p {
  color: white;
}

.cta-section .btn {
  background: white;
  color: var(--color-primary);
  border-color: white;
}

.cta-section .btn:hover {
  background: transparent;
  color: white;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════════════ */

footer {
  background: ${industry.design.colorScheme === 'dark' ? '#0A0A0A' : '#F8F9FA'};
  padding: 3rem 0;
  border-top: 1px solid ${industry.design.colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-logo {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-primary);
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.footer-links a:hover {
  opacity: 1;
  color: var(--color-primary);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

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
  animation: fadeInUp 0.6s ease forwards;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero .subtitle {
    font-size: 1rem;
  }
  
  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.8rem;
  }
  
  .btn-outline {
    margin-left: 0;
    margin-top: 1rem;
    display: block;
    text-align: center;
  }
  
  section {
    padding: 4rem 0;
  }
}
  `.trim();
}

/**
 * Generate the main HTML
 */
function generateHTML(
  content: WebsiteContent,
  industry: IndustryDNA,
  images: GeneratedImage[]
): string {
  const heroImage = images.find(img => img.section === 'hero')?.url || '';
  const servicesImage = images.find(img => img.section === 'services')?.url || '';
  const aboutImage = images.find(img => img.section === 'about')?.url || '';
  const teamImage = images.find(img => img.section === 'team')?.url || '';
  
  const ctaText = industry.copy.ctaText[0];
  const secondaryCta = industry.copy.ctaText[1] || 'Learn More';
  
  // Generate services cards
  const servicesHTML = content.services.slice(0, 3).map((service, index) => `
      <div class="card">
        <img src="${index === 0 ? servicesImage : (index === 1 ? aboutImage : teamImage)}" alt="${service.name}">
        <div class="card-content">
          <h3>${service.name}</h3>
          <p>${service.description}</p>
        </div>
      </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.businessName} | ${content.tagline}</title>
  <meta name="description" content="${content.description}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${content.businessName}">
  <meta property="og:description" content="${content.description}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:type" content="website">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(industry.design.fonts.heading.split(',')[0].replace(/'/g, '').trim())}:wght@400;700;900&family=${encodeURIComponent(industry.design.fonts.body.split(',')[0].replace(/'/g, '').trim())}:wght@300;400;600&display=swap" rel="stylesheet">
  
  <style>
${generateCSS(industry)}
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <div class="nav-container">
      <a href="#" class="logo">${content.businessName.toUpperCase()}</a>
      <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button class="mobile-menu-btn">☰</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero" id="home">
    <div class="hero-background">
      <img src="${heroImage}" alt="${content.businessName}">
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <h1>${content.tagline.split(' ').slice(0, Math.ceil(content.tagline.split(' ').length / 2)).join(' ')}<br>
        <span class="highlight">${content.tagline.split(' ').slice(Math.ceil(content.tagline.split(' ').length / 2)).join(' ')}</span>
      </h1>
      <p class="subtitle">${content.description}</p>
      <a href="#contact" class="btn btn-primary">${ctaText}</a>
      <a href="#services" class="btn btn-outline">${secondaryCta}</a>
    </div>
  </section>

  ${industry.sections.includes('stats') ? `
  <!-- Stats Bar -->
  <section class="stats-bar">
    <div class="stats-container">
      <div class="stat-item">
        <h3>10+</h3>
        <p>Years Experience</p>
      </div>
      <div class="stat-item">
        <h3>500+</h3>
        <p>Happy Clients</p>
      </div>
      <div class="stat-item">
        <h3>100%</h3>
        <p>Satisfaction</p>
      </div>
      <div class="stat-item">
        <h3>24/7</h3>
        <p>Support</p>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Services Section -->
  <section id="services">
    <div class="section-container">
      <div class="section-header">
        <h2>What We Offer</h2>
        <p>${content.description}</p>
      </div>
      <div class="cards-grid">
${servicesHTML}
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about">
    <div class="section-container">
      <div class="two-column">
        <div class="two-column-image">
          <img src="${teamImage}" alt="About ${content.businessName}">
        </div>
        <div class="two-column-content">
          <h2>About Us</h2>
          <p>${content.description}</p>
          <p>We are committed to delivering exceptional results and exceeding expectations with every project we undertake.</p>
          <a href="#contact" class="btn btn-primary">${ctaText}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="section-container">
      <h2>Ready to Get Started?</h2>
      <p>Contact us today and let's discuss how we can help you achieve your goals.</p>
      <a href="#contact" class="btn">${ctaText}</a>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact">
    <div class="footer-container">
      <div class="footer-logo">${content.businessName.toUpperCase()}</div>
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        ${content.email ? `<a href="mailto:${content.email}">Contact</a>` : ''}
      </div>
    </div>
  </footer>

  <script>
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`;
}

export default {
  generateWebsite,
  generateCSS,
};
