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

/**
 * Escape HTML special characters to prevent XSS and broken HTML
 */
function escapeHtml(text: string | undefined | null): string {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape for HTML attribute values (same as escapeHtml but explicit name)
 */
function escapeAttr(text: string | undefined | null): string {
  return escapeHtml(text);
}

export interface WebsiteContent {
  // Basic Info
  businessName: string;
  tagline: string;
  description: string;
  services: Array<{ name: string; description: string }>;
  location?: string;
  phone?: string;
  email?: string;

  // ═══════════════════════════════════════════════════════════════════════════════
  // USER PREFERENCES (from intake form)
  // ═══════════════════════════════════════════════════════════════════════════════

  // Business Type
  businessType?: string;

  // Website Goals
  goals?: string[];

  // Target Audience
  targetAudience?: {
    ageGroups?: string[];
    audienceType?: string;
    incomeLevel?: string;
  };

  // Design Preferences
  designPreferences?: {
    colorMood?: string;
    primaryColor?: string;
    secondaryColor?: string;
    designElements?: string[];
  };

  // Features
  features?: string[];

  // Pages/Sections
  pages?: string[];

  // Contact Info
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string;
    socialPlatforms?: string[];
  };

  // Tone & Messaging
  tone?: {
    brandVoice?: string;
    ctaStyle?: string;
    keyMessage?: string;
  };

  // Stats/Trust Indicators (optional - shown in stats bar if provided)
  stats?: Array<{ value: string; label: string }>;
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
  filter: brightness(0.9);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%);
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
   FOOTER (Enhanced with contact info & social)
   ═══════════════════════════════════════════════════════════════════════════════ */

footer {
  background: ${industry.design.colorScheme === 'dark' ? '#0A0A0A' : '#F8F9FA'};
  padding: 4rem 0 2rem;
  border-top: 1px solid ${industry.design.colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid ${industry.design.colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
}

@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.footer-tagline {
  opacity: 0.7;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
  font-size: 1.5rem;
}

.social-link {
  opacity: 0.7;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  opacity: 1;
  transform: scale(1.2);
}

.footer-contact h4,
.footer-links h4 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.footer-contact p {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  opacity: 0.8;
}

.footer-contact a {
  color: inherit;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.95rem;
}

.footer-links a:hover {
  opacity: 1;
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-bottom p {
  opacity: 0.6;
  font-size: 0.875rem;
  margin: 0;
}

.footer-legal {
  display: flex;
  gap: 2rem;
}

.footer-legal a {
  color: var(--color-text);
  opacity: 0.6;
  font-size: 0.875rem;
}

.footer-legal a:hover {
  opacity: 1;
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
  .hero {
    min-height: 80vh;
  }

  .hero h1 {
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .hero .subtitle {
    font-size: 1rem;
    line-height: 1.5;
  }

  .hero-content {
    padding: 0 1rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.8rem;
    width: 100%;
    text-align: center;
  }

  .btn-outline {
    margin-left: 0;
    margin-top: 1rem;
    display: block;
    text-align: center;
  }

  section {
    padding: 3rem 0;
  }

  .section-container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .card img {
    height: 200px;
  }

  .stat-value {
    font-size: 2rem;
  }
}

/* Extra small devices (phones, 480px and down) */
@media (max-width: 480px) {
  .hero h1 {
    font-size: 1.75rem;
  }

  .hero .subtitle {
    font-size: 0.9rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .footer-main {
    text-align: center;
  }

  .footer-brand {
    max-width: 100%;
    margin: 0 auto;
  }
}
  `.trim();
}

/**
 * Generate CTA text based on user's tone preferences
 */
function generateCTAText(content: WebsiteContent, industry: IndustryDNA): { primary: string; secondary: string } {
  const ctaStyle = content.tone?.ctaStyle || 'direct';
  const brandVoice = content.tone?.brandVoice || 'professional';

  // CTA text based on style
  const ctaOptions: Record<string, { primary: string; secondary: string }> = {
    urgent: { primary: 'Get Started Now', secondary: 'Don\'t Wait' },
    soft: { primary: 'Learn More', secondary: 'Discover How' },
    direct: { primary: 'Contact Us', secondary: 'Get Quote' },
    consultative: { primary: 'Schedule Consultation', secondary: 'Explore Options' },
  };

  // If user has specific goals, customize CTA
  const goals = content.goals || [];
  if (goals.includes('leads')) {
    return { primary: 'Get Free Quote', secondary: 'Request Info' };
  }
  if (goals.includes('bookings')) {
    return { primary: 'Book Now', secondary: 'Check Availability' };
  }
  if (goals.includes('sell')) {
    return { primary: 'Shop Now', secondary: 'View Products' };
  }
  if (goals.includes('donations')) {
    return { primary: 'Donate Now', secondary: 'Support Us' };
  }

  return ctaOptions[ctaStyle] || { primary: industry.copy.ctaText[0], secondary: industry.copy.ctaText[1] || 'Learn More' };
}

/**
 * Generate navigation links based on user's selected pages
 */
function generateNavLinks(content: WebsiteContent): string {
  const selectedPages = content.pages || ['home', 'services', 'about', 'contact'];

  const pageLabels: Record<string, string> = {
    home: 'Home',
    about: 'About',
    services: 'Services',
    products: 'Products',
    portfolio: 'Portfolio',
    team: 'Team',
    testimonials: 'Testimonials',
    blog: 'Blog',
    faq: 'FAQ',
    contact: 'Contact',
    pricing: 'Pricing',
    careers: 'Careers',
  };

  return selectedPages
    .filter(page => pageLabels[page])
    .map(page => `<li><a href="#${escapeAttr(page)}">${escapeHtml(pageLabels[page])}</a></li>`)
    .join('\n        ');
}

/**
 * Generate social media links based on user's selected platforms
 */
function generateSocialLinks(content: WebsiteContent): string {
  const platforms = content.contactInfo?.socialPlatforms || [];

  if (platforms.length === 0) return '';

  const socialIcons: Record<string, string> = {
    facebook: '📘',
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    youtube: '▶️',
    tiktok: '🎵',
    pinterest: '📌',
    whatsapp: '💬',
  };

  const links = platforms
    .filter(p => socialIcons[p])
    .map(p => `<a href="#" class="social-link" title="${escapeAttr(p)}">${socialIcons[p]}</a>`)
    .join(' ');

  return links ? `<div class="social-links">${links}</div>` : '';
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

  // Use user preferences for CTA text
  const ctas = generateCTAText(content, industry);
  const ctaText = ctas.primary;
  const secondaryCta = ctas.secondary;

  // Get user's selected pages
  const selectedPages = content.pages || ['home', 'services', 'about', 'contact'];

  // Get brand voice for copy tone
  const brandVoice = content.tone?.brandVoice || 'professional';

  // Get contact info
  const phone = content.contactInfo?.phone || content.phone;
  const email = content.contactInfo?.email || content.email;
  const address = content.contactInfo?.address || content.location;
  const hours = content.contactInfo?.hours;
  
  // Generate services cards
  const servicesHTML = content.services.slice(0, 3).map((service, index) => `
      <div class="card">
        <img src="${escapeAttr(index === 0 ? servicesImage : (index === 1 ? aboutImage : teamImage))}" alt="${escapeAttr(service.name)}">
        <div class="card-content">
          <h3>${escapeHtml(service.name)}</h3>
          <p>${escapeHtml(service.description)}</p>
        </div>
      </div>`).join('\n');

  // Generate navigation based on user's selected pages
  const navLinksHTML = generateNavLinks(content);

  // Generate social links if user selected social platforms
  const socialLinksHTML = generateSocialLinks(content);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.businessName)} | ${escapeHtml(content.tagline)}</title>
  <meta name="description" content="${escapeAttr(content.description)}">

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeAttr(content.businessName)}">
  <meta property="og:description" content="${escapeAttr(content.description)}">
  <meta property="og:image" content="${escapeAttr(heroImage)}">
  <meta property="og:type" content="website">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent((industry.design?.fonts?.heading || 'Inter').split(',')[0].replace(/'/g, '').trim())}:wght@400;700;900&family=${encodeURIComponent((industry.design?.fonts?.body || 'Inter').split(',')[0].replace(/'/g, '').trim())}:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
${generateCSS(industry)}
  </style>
</head>
<body>
  <!-- Navigation - Based on user's selected pages -->
  <nav>
    <div class="nav-container">
      <a href="#" class="logo">${escapeHtml(content.businessName.toUpperCase())}</a>
      <ul class="nav-links">
        ${navLinksHTML}
      </ul>
      <button class="mobile-menu-btn">☰</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero" id="home">
    <div class="hero-background">
      <img src="${escapeAttr(heroImage)}" alt="${escapeAttr(content.businessName)}">
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <h1>${escapeHtml(content.tagline.split(' ').slice(0, Math.ceil(content.tagline.split(' ').length / 2)).join(' '))}<br>
        <span class="highlight">${escapeHtml(content.tagline.split(' ').slice(Math.ceil(content.tagline.split(' ').length / 2)).join(' '))}</span>
      </h1>
      <p class="subtitle">${escapeHtml(content.description)}</p>
      <a href="#contact" class="btn btn-primary">${escapeHtml(ctaText)}</a>
      <a href="#services" class="btn btn-outline">${escapeHtml(secondaryCta)}</a>
    </div>
  </section>

  ${industry.sections.includes('stats') && content.stats && content.stats.length > 0 ? `
  <!-- Stats Bar -->
  <section class="stats-bar">
    <div class="stats-container">
      ${content.stats.slice(0, 4).map(stat => `
      <div class="stat-item">
        <h3>${escapeHtml(stat.value)}</h3>
        <p>${escapeHtml(stat.label)}</p>
      </div>`).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Services Section -->
  <section id="services">
    <div class="section-container">
      <div class="section-header">
        <h2>What We Offer</h2>
        <p>${escapeHtml(content.description)}</p>
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
          <img src="${escapeAttr(teamImage)}" alt="About ${escapeAttr(content.businessName)}">
        </div>
        <div class="two-column-content">
          <h2>About Us</h2>
          <p>${escapeHtml(content.description)}</p>
          <p>${escapeHtml(content.tone?.keyMessage || `${content.businessName} is dedicated to providing outstanding service and quality results for every client.`)}</p>
          <a href="#contact" class="btn btn-primary">${escapeHtml(ctaText)}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="section-container">
      <h2>Ready to Get Started?</h2>
      <p>Contact ${escapeHtml(content.businessName)} today and let us help you achieve your goals.</p>
      <a href="#contact" class="btn">${escapeHtml(ctaText)}</a>
    </div>
  </section>

  <!-- Footer / Contact Section -->
  <footer id="contact">
    <div class="footer-container">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">${escapeHtml(content.businessName.toUpperCase())}</div>
          <p class="footer-tagline">${escapeHtml(content.tagline)}</p>
          ${socialLinksHTML}
        </div>

        ${selectedPages.includes('contact') ? `
        <div class="footer-contact">
          <h4>Contact Us</h4>
          ${phone ? `<p>📞 ${escapeHtml(phone)}</p>` : ''}
          ${email ? `<p>✉️ <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a></p>` : ''}
          ${address ? `<p>📍 ${escapeHtml(address)}</p>` : ''}
          ${hours ? `<p>🕐 ${escapeHtml(hours)}</p>` : ''}
        </div>
        ` : ''}

        <div class="footer-links">
          <h4>Quick Links</h4>
          ${selectedPages.slice(0, 5).map(page => `<a href="#${escapeAttr(page)}">${escapeHtml(page.charAt(0).toUpperCase() + page.slice(1))}</a>`).join('\n          ')}
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${escapeHtml(content.businessName)}. All rights reserved.</p>
        <div class="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
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
