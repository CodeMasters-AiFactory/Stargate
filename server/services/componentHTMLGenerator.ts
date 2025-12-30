/**
 * Component HTML Generator
 * Generates HTML/CSS/JS for components from component definitions
 * Used by Visual Editor to add components to websites
 */

import { getComponentById, type WebsiteComponent } from './componentLibrary';

export interface ComponentInstance {
  id: string;
  componentId: string;
  variantId?: string;
  props: Record<string, any>;
  position?: { x: number; y: number };
  locked?: boolean;
  visible?: boolean;
}

/**
 * Generate HTML for a component instance
 */
export function generateComponentHTML(
  componentId: string,
  variantId?: string,
  props: Record<string, any> = {}
): { html: string; css: string; js: string } {
  const component = getComponentById(componentId);
  if (!component) {
    return { html: '', css: '', js: '' };
  }

  // Use variant if specified, otherwise use first variant
  const variant = variantId
    ? component.variants.find(v => v.id === variantId)
    : component.variants[0];

  // Merge default props with provided props
  const mergedProps = { ...component.defaultProps, ...props };

  // Generate HTML based on component type
  const html = generateHTMLForComponent(component, variant, mergedProps);
  const css = generateCSSForComponent(component, variant, mergedProps);
  const js = generateJSForComponent(component, variant, mergedProps);

  return { html, css, js };
}

/**
 * Generate HTML for a specific component
 */
function generateHTMLForComponent(
  component: WebsiteComponent,
  _variant: ComponentVariant | undefined,
  props: Record<string, any>
): string {
  const componentId = `comp-${component.id}-${Date.now()}`;
  
  // Basic HTML structure with data attributes for editor
  let html = `<div class="ve-component" data-component-id="${componentId}" data-component-type="${component.id}">\n`;

  // Generate component-specific HTML
  switch (component.category) {
    case 'hero':
      html += generateHeroHTML(component, props);
      break;
    case 'navigation':
      html += generateNavigationHTML(component, props);
      break;
    case 'features':
      html += generateFeaturesHTML(component, props);
      break;
    case 'testimonials':
      html += generateTestimonialsHTML(component, props);
      break;
    case 'pricing':
      html += generatePricingHTML(component, props);
      break;
    case 'cta':
      html += generateCTAHTML(component, props);
      break;
    case 'contact':
      html += generateContactHTML(component, props);
      break;
    case 'footer':
      html += generateFooterHTML(component, props);
      break;
    case 'gallery':
      html += generateGalleryHTML(component, props);
      break;
    case 'stats':
      html += generateStatsHTML(component, props);
      break;
    case 'team':
      html += generateTeamHTML(component, props);
      break;
    case 'faq':
      html += generateFAQHTML(component, props);
      break;
    case 'ecommerce':
      html += generateEcommerceHTML(component, props);
      break;
    default:
      html += generateGenericHTML(component, props);
  }

  html += '</div>';
  return html;
}

/**
 * Generate CSS for a component
 */
function generateCSSForComponent(
  component: WebsiteComponent,
  _variant: ComponentVariant | undefined,
  _props: Record<string, any>
): string {
  return `
/* Component: ${component.name} */
.ve-component[data-component-type="${component.id}"] {
  position: relative;
  margin: 1rem 0;
}
  `.trim();
}

/**
 * Generate JavaScript for a component
 */
function generateJSForComponent(
  component: WebsiteComponent,
  _variant: ComponentVariant | undefined,
  _props: Record<string, any>
): string {
  // Add animations if specified
  if (component.animations && component.animations.length > 0) {
    return `
// Component animations for ${component.id}
document.addEventListener('DOMContentLoaded', function() {
  const component = document.querySelector('[data-component-type="${component.id}"]');
  if (component) {
    component.classList.add('animate-${component.animations[0]}');
  }
});
    `.trim();
  }
  return '';
}

// Component-specific HTML generators
function generateHeroHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const headline = props.headline || 'Welcome to Our Website';
  const subheadline = props.subheadline || 'We help businesses grow';
  const ctaText = props.ctaText || 'Get Started';
  const ctaSecondaryText = props.ctaSecondaryText;

  return `
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-headline">${headline}</h1>
        <p class="hero-subheadline">${subheadline}</p>
        <div class="hero-cta">
          <button class="btn-primary">${ctaText}</button>
          ${ctaSecondaryText ? `<button class="btn-secondary">${ctaSecondaryText}</button>` : ''}
        </div>
      </div>
    </section>
  `.trim();
}

function generateNavigationHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const logo = props.logo || 'Logo';
  const links = props.links || ['Home', 'About', 'Services', 'Contact'];

  return `
    <nav class="navbar">
      <div class="navbar-brand">${logo}</div>
      <ul class="navbar-menu">
        ${links.map((link: string) => `<li><a href="#${link.toLowerCase()}">${link}</a></li>`).join('\n        ')}
      </ul>
    </nav>
  `.trim();
}

function generateFeaturesHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const title = props.title || 'Features';
  const features = props.features || [
    { title: 'Feature 1', description: 'Description 1' },
    { title: 'Feature 2', description: 'Description 2' },
    { title: 'Feature 3', description: 'Description 3' },
  ];

  return `
    <section class="features-section">
      <h2 class="section-title">${title}</h2>
      <div class="features-grid">
        ${features.map((feature: any) => `
          <div class="feature-card">
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateTestimonialsHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const testimonials = props.testimonials || [
    { name: 'John Doe', text: 'Great service!', rating: 5 },
    { name: 'Jane Smith', text: 'Highly recommended!', rating: 5 },
  ];

  return `
    <section class="testimonials-section">
      <h2 class="section-title">Testimonials</h2>
      <div class="testimonials-grid">
        ${testimonials.map((testimonial: any) => `
          <div class="testimonial-card">
            <p class="testimonial-text">"${testimonial.text}"</p>
            <p class="testimonial-author">- ${testimonial.name}</p>
            ${testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}</div>` : ''}
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generatePricingHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const plans = props.plans || [
    { name: 'Basic', price: '$9', features: ['Feature 1', 'Feature 2'] },
    { name: 'Pro', price: '$29', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
  ];

  return `
    <section class="pricing-section">
      <h2 class="section-title">Pricing</h2>
      <div class="pricing-grid">
        ${plans.map((plan: any) => `
          <div class="pricing-card">
            <h3>${plan.name}</h3>
            <div class="pricing-price">${plan.price}</div>
            <ul class="pricing-features">
              ${plan.features.map((feature: string) => `<li>${feature}</li>`).join('\n              ')}
            </ul>
            <button class="btn-primary">Choose Plan</button>
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateCTAHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const title = props.title || 'Ready to Get Started?';
  const description = props.description || 'Join thousands of satisfied customers';
  const ctaText = props.ctaText || 'Get Started';

  return `
    <section class="cta-section">
      <h2>${title}</h2>
      <p>${description}</p>
      <button class="btn-primary">${ctaText}</button>
    </section>
  `.trim();
}

function generateContactHTML(_component: WebsiteComponent, _props: Record<string, any>): string {
  return `
    <section class="contact-section">
      <h2 class="section-title">Contact Us</h2>
      <form class="contact-form">
        <input type="text" placeholder="Name" required>
        <input type="email" placeholder="Email" required>
        <textarea placeholder="Message" required></textarea>
        <button type="submit" class="btn-primary">Send Message</button>
      </form>
    </section>
  `.trim();
}

function generateFooterHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const copyright = props.copyright || `© ${new Date().getFullYear()} Company Name`;
  const links = props.links || ['Privacy', 'Terms', 'Contact'];

  return `
    <footer class="footer">
      <div class="footer-content">
        <p class="footer-copyright">${copyright}</p>
        <ul class="footer-links">
          ${links.map((link: string) => `<li><a href="#${link.toLowerCase()}">${link}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </footer>
  `.trim();
}

function generateGalleryHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const images = props.images || ['/image1.jpg', '/image2.jpg', '/image3.jpg'];

  return `
    <section class="gallery-section">
      <h2 class="section-title">Gallery</h2>
      <div class="gallery-grid">
        ${images.map((image: string) => `
          <div class="gallery-item">
            <img src="${image}" alt="Gallery image">
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateStatsHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const stats = props.stats || [
    { label: 'Customers', value: '10K+' },
    { label: 'Projects', value: '500+' },
    { label: 'Countries', value: '50+' },
  ];

  return `
    <section class="stats-section">
      <div class="stats-grid">
        ${stats.map((stat: any) => `
          <div class="stat-card">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateTeamHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const members = props.members || [
    { name: 'John Doe', role: 'CEO', image: '/team1.jpg' },
    { name: 'Jane Smith', role: 'CTO', image: '/team2.jpg' },
  ];

  return `
    <section class="team-section">
      <h2 class="section-title">Our Team</h2>
      <div class="team-grid">
        ${members.map((member: any) => `
          <div class="team-card">
            <img src="${member.image}" alt="${member.name}">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateFAQHTML(_component: WebsiteComponent, props: Record<string, any>): string {
  const questions = props.questions || [
    { question: 'Question 1?', answer: 'Answer 1' },
    { question: 'Question 2?', answer: 'Answer 2' },
  ];

  return `
    <section class="faq-section">
      <h2 class="section-title">Frequently Asked Questions</h2>
      <div class="faq-list">
        ${questions.map((item: any) => `
          <div class="faq-item">
            <h3 class="faq-question">${item.question}</h3>
            <p class="faq-answer">${item.answer}</p>
          </div>
        `).join('\n        ')}
      </div>
    </section>
  `.trim();
}

function generateEcommerceHTML(_component: WebsiteComponent, _props: Record<string, any>): string {
  return `
    <section class="ecommerce-section">
      <h2 class="section-title">Products</h2>
      <div class="products-grid">
        <!-- Products will be loaded dynamically -->
      </div>
    </section>
  `.trim();
}

function generateGenericHTML(component: WebsiteComponent, _props: Record<string, any>): string {
  return `
    <div class="generic-component">
      <h3>${component.name}</h3>
      <p>${component.description}</p>
    </div>
  `.trim();
}

// Type for component variant
interface ComponentVariant {
  id: string;
  name: string;
  preview?: string;
  props?: Record<string, any>;
}

