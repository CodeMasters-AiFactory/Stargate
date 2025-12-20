/**
 * Premium Section Library
 * Beautiful, conversion-optimized sections
 */

// ============================================
// FEATURES SECTION - Premium Styles
// ============================================
export const FEATURES_SECTIONS = {
  'bento-grid': {
    name: 'Bento Grid',
    description: 'Modern bento-style grid layout with varying sizes',
    html: `
<section class="section features-bento">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">{{eyebrow}}</span>
      <h2 class="section-title">{{title}}</h2>
      <p class="section-description">{{description}}</p>
    </div>
    <div class="bento-grid">
      {{#each features}}
      <div class="bento-card bento-{{size}}" style="--delay: {{@index}}">
        <div class="bento-icon">{{icon}}</div>
        <h3 class="bento-title">{{title}}</h3>
        <p class="bento-description">{{description}}</p>
        {{#if highlight}}
        <div class="bento-highlight">{{highlight}}</div>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </div>
</section>`,
    css: `
.features-bento {
  padding: 8rem 2rem;
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
}

.section-eyebrow {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text);
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.bento-card {
  padding: 2rem;
  background: var(--surface);
  border: 1px solid var(--text)10;
  border-radius: 24px;
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
  animation-delay: calc(var(--delay) * 0.1s);
}

.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--primary)30;
}

.bento-large {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-wide {
  grid-column: span 2;
}

.bento-tall {
  grid-row: span 2;
}

.bento-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient);
  border-radius: 16px;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.bento-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.bento-description {
  color: var(--text-muted);
  line-height: 1.6;
}

.bento-highlight {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--primary)10;
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 500;
}

@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-large { grid-column: span 2; grid-row: span 1; }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-large, .bento-wide { grid-column: span 1; }
}`,
  },

  'cards-hover': {
    name: 'Cards with Hover Effects',
    description: 'Clean cards with stunning hover animations',
    html: `
<section class="section features-cards">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">{{eyebrow}}</span>
      <h2 class="section-title">{{title}}</h2>
    </div>
    <div class="features-grid">
      {{#each features}}
      <div class="feature-card">
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="feature-icon">{{icon}}</div>
          <h3 class="feature-title">{{title}}</h3>
          <p class="feature-description">{{description}}</p>
          <a href="#" class="feature-link">
            Learn more
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</section>`,
    css: `
.features-cards {
  padding: 8rem 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  position: relative;
  padding: 2.5rem;
  background: var(--surface);
  border: 1px solid var(--text)10;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.feature-card:hover {
  transform: translateY(-8px);
  border-color: var(--primary)40;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, var(--primary)10 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover .card-glow {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.feature-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient);
  border-radius: 16px;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 30px var(--primary)30;
}

.feature-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.feature-description {
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: gap 0.3s ease;
}

.feature-link:hover {
  gap: 0.75rem;
}

.feature-link svg {
  width: 18px;
  height: 18px;
}`,
  },
};

// ============================================
// TESTIMONIALS SECTION - Premium Styles
// ============================================
export const TESTIMONIALS_SECTIONS = {
  'carousel-premium': {
    name: 'Premium Carousel',
    description: 'Elegant testimonial carousel with large quotes',
    html: `
<section class="section testimonials-premium">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">{{eyebrow}}</span>
      <h2 class="section-title">{{title}}</h2>
    </div>
    <div class="testimonial-carousel">
      <div class="testimonial-track">
        {{#each testimonials}}
        <div class="testimonial-slide">
          <div class="testimonial-card">
            <div class="quote-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
              </svg>
            </div>
            <blockquote class="testimonial-quote">{{quote}}</blockquote>
            <div class="testimonial-author">
              <img src="{{avatar}}" alt="{{name}}" class="author-avatar" />
              <div class="author-info">
                <div class="author-name">{{name}}</div>
                <div class="author-role">{{role}} at {{company}}</div>
              </div>
              <div class="author-rating">
                ★★★★★
              </div>
            </div>
          </div>
        </div>
        {{/each}}
      </div>
    </div>
  </div>
  <div class="testimonial-bg">
    <div class="bg-gradient"></div>
  </div>
</section>`,
    css: `
.testimonials-premium {
  padding: 8rem 2rem;
  position: relative;
  overflow: hidden;
}

.testimonial-carousel {
  max-width: 900px;
  margin: 0 auto;
}

.testimonial-card {
  padding: 3rem;
  background: var(--surface);
  border: 1px solid var(--text)10;
  border-radius: 24px;
  text-align: center;
}

.quote-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 2rem;
  color: var(--primary);
  opacity: 0.3;
}

.quote-icon svg {
  width: 100%;
  height: 100%;
}

.testimonial-quote {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 500;
  line-height: 1.6;
  color: var(--text);
  margin-bottom: 2rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary);
}

.author-info {
  text-align: left;
}

.author-name {
  font-weight: 600;
  color: var(--text);
}

.author-role {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.author-rating {
  color: #FFD700;
  font-size: 1.125rem;
  letter-spacing: 2px;
}

.testimonial-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.testimonial-bg .bg-gradient {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, var(--primary)10 0%, transparent 60%);
}`,
  },

  'wall-of-love': {
    name: 'Wall of Love',
    description: 'Masonry-style testimonial wall',
    html: `
<section class="section testimonials-wall">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">{{eyebrow}}</span>
      <h2 class="section-title">{{title}}</h2>
    </div>
    <div class="testimonials-masonry">
      {{#each testimonials}}
      <div class="testimonial-brick">
        <div class="brick-content">
          <div class="brick-header">
            <img src="{{avatar}}" alt="{{name}}" class="brick-avatar" />
            <div class="brick-author">
              <div class="brick-name">{{name}}</div>
              <div class="brick-role">{{role}}</div>
            </div>
            <div class="brick-rating">★★★★★</div>
          </div>
          <p class="brick-quote">{{quote}}</p>
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</section>`,
    css: `
.testimonials-wall {
  padding: 8rem 2rem;
}

.testimonials-masonry {
  columns: 3;
  column-gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-brick {
  break-inside: avoid;
  margin-bottom: 1.5rem;
}

.brick-content {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--text)10;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.brick-content:hover {
  border-color: var(--primary)30;
  transform: translateY(-4px);
}

.brick-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.brick-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.brick-author {
  flex: 1;
}

.brick-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text);
}

.brick-role {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.brick-rating {
  color: #FFD700;
  font-size: 0.875rem;
}

.brick-quote {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.9375rem;
}

@media (max-width: 1024px) {
  .testimonials-masonry { columns: 2; }
}

@media (max-width: 640px) {
  .testimonials-masonry { columns: 1; }
}`,
  },
};

// ============================================
// PRICING SECTION - Premium Styles
// ============================================
export const PRICING_SECTIONS = {
  'cards-glow': {
    name: 'Glowing Cards',
    description: 'Premium pricing cards with glow effects',
    html: `
<section class="section pricing-glow">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">{{eyebrow}}</span>
      <h2 class="section-title">{{title}}</h2>
      <p class="section-description">{{description}}</p>
    </div>
    <div class="pricing-grid">
      {{#each plans}}
      <div class="pricing-card {{#if featured}}pricing-featured{{/if}}">
        {{#if featured}}
        <div class="featured-badge">Most Popular</div>
        {{/if}}
        <div class="pricing-header">
          <h3 class="plan-name">{{name}}</h3>
          <p class="plan-description">{{description}}</p>
        </div>
        <div class="pricing-amount">
          <span class="currency">$</span>
          <span class="price">{{price}}</span>
          <span class="period">/{{period}}</span>
        </div>
        <ul class="pricing-features">
          {{#each features}}
          <li class="{{#if included}}included{{else}}excluded{{/if}}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              {{#if included}}
              <path d="M5 13l4 4L19 7"/>
              {{else}}
              <path d="M18 6L6 18M6 6l12 12"/>
              {{/if}}
            </svg>
            {{text}}
          </li>
          {{/each}}
        </ul>
        <a href="#" class="pricing-cta {{#if featured}}cta-primary{{else}}cta-secondary{{/if}}">
          {{cta}}
        </a>
      </div>
      {{/each}}
    </div>
  </div>
</section>`,
    css: `
.pricing-glow {
  padding: 8rem 2rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

.pricing-card {
  position: relative;
  padding: 2.5rem;
  background: var(--surface);
  border: 1px solid var(--text)10;
  border-radius: 24px;
  transition: all 0.4s ease;
}

.pricing-card:hover {
  transform: translateY(-8px);
}

.pricing-featured {
  border-color: var(--primary);
  background: linear-gradient(180deg, var(--primary)08 0%, var(--surface) 50%);
  box-shadow: 0 0 60px var(--primary)20;
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.375rem 1rem;
  background: var(--gradient);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 100px;
  letter-spacing: 0.05em;
}

.pricing-header {
  margin-bottom: 1.5rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.plan-description {
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.pricing-amount {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--text)10;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-muted);
}

.price {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.period {
  color: var(--text-muted);
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text);
  font-size: 0.9375rem;
}

.pricing-features li.excluded {
  color: var(--text-muted);
  text-decoration: line-through;
}

.pricing-features svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.pricing-features .included svg {
  color: var(--primary);
}

.pricing-features .excluded svg {
  color: var(--text-muted);
  opacity: 0.5;
}

.pricing-cta {
  display: block;
  width: 100%;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.pricing-cta.cta-primary {
  background: var(--gradient);
  color: white;
  box-shadow: 0 4px 20px var(--primary)40;
}

.pricing-cta.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px var(--primary)50;
}

.pricing-cta.cta-secondary {
  background: var(--text)10;
  color: var(--text);
}

.pricing-cta.cta-secondary:hover {
  background: var(--text)20;
}`,
  },
};

// ============================================
// CTA SECTION - Premium Styles
// ============================================
export const CTA_SECTIONS = {
  'gradient-dramatic': {
    name: 'Dramatic Gradient',
    description: 'Eye-catching gradient CTA section',
    html: `
<section class="section cta-dramatic">
  <div class="cta-container">
    <div class="cta-content">
      <h2 class="cta-title">{{title}}</h2>
      <p class="cta-description">{{description}}</p>
      <div class="cta-buttons">
        <a href="#" class="btn btn-white btn-large">
          {{ctaPrimary}}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14m-7-7 7 7-7 7"/>
          </svg>
        </a>
        {{#if ctaSecondary}}
        <a href="#" class="btn btn-outline-white btn-large">{{ctaSecondary}}</a>
        {{/if}}
      </div>
    </div>
    <div class="cta-decorations">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</section>`,
    css: `
.cta-dramatic {
  padding: 0 2rem;
}

.cta-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 4rem;
  background: var(--gradient);
  border-radius: 32px;
  overflow: hidden;
  text-align: center;
}

.cta-content {
  position: relative;
  z-index: 10;
}

.cta-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.btn-white {
  background: white;
  color: var(--primary);
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-outline-white {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-outline-white:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.cta-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -50px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 20%;
  transform: translateY(-50%);
}

@media (max-width: 640px) {
  .cta-container {
    padding: 4rem 2rem;
    border-radius: 24px;
  }
}`,
  },
};

// ============================================
// FOOTER SECTION - Premium Styles  
// ============================================
export const FOOTER_SECTIONS = {
  'modern-dark': {
    name: 'Modern Dark',
    description: 'Sleek dark footer with gradients',
    html: `
<footer class="footer-modern">
  <div class="footer-container">
    <div class="footer-main">
      <div class="footer-brand">
        <div class="footer-logo">{{logo}}</div>
        <p class="footer-tagline">{{tagline}}</p>
        <div class="footer-social">
          {{#each social}}
          <a href="{{url}}" class="social-link" aria-label="{{name}}">
            {{{icon}}}
          </a>
          {{/each}}
        </div>
      </div>
      <div class="footer-links">
        {{#each columns}}
        <div class="footer-column">
          <h4 class="column-title">{{title}}</h4>
          <ul class="column-links">
            {{#each links}}
            <li><a href="{{url}}">{{text}}</a></li>
            {{/each}}
          </ul>
        </div>
        {{/each}}
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright">{{copyright}}</p>
      <div class="footer-legal">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </div>
  <div class="footer-glow"></div>
</footer>`,
    css: `
.footer-modern {
  position: relative;
  padding: 6rem 2rem 2rem;
  background: var(--background);
  overflow: hidden;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.footer-main {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: 4rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--text)10;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
}

.footer-tagline {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.footer-social {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text)10;
  border-radius: 10px;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.social-link svg {
  width: 20px;
  height: 20px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.column-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text);
  margin-bottom: 1.25rem;
}

.column-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.column-links li {
  margin-bottom: 0.75rem;
}

.column-links a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.column-links a:hover {
  color: var(--primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
}

.copyright {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.footer-legal {
  display: flex;
  gap: 2rem;
}

.footer-legal a {
  color: var(--text-muted);
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: var(--text);
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 400px;
  background: radial-gradient(ellipse, var(--primary)10 0%, transparent 70%);
  pointer-events: none;
}

@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}`,
  },
};

console.log('[Premium Section Library] 📦 Beautiful sections loaded');

