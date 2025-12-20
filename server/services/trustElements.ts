/**
 * Trust Elements Service
 * Generates testimonials, trust badges, legal pages, and credibility features
 */

/**
 * Generate testimonial section with schema markup
 */
export function generateTestimonialsSection(testimonials: Array<{
  name: string;
  role: string;
  company?: string;
  quote: string;
  rating?: number;
  image?: string;
}>): { html: string; schema: string } {
  if (!testimonials || testimonials.length === 0) {
    return { html: '', schema: '' };
  }

  const testimonialsHTML = testimonials.map((testimonial, index) => {
    const initials = testimonial.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const stars = testimonial.rating
      ? '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating)
      : '';

    return `
    <div class="testimonial-card" itemscope itemtype="https://schema.org/Review">
      <div class="testimonial-rating">${stars}</div>
      <blockquote class="testimonial-quote" itemprop="reviewBody">
        "${testimonial.quote}"
      </blockquote>
      <div class="testimonial-author">
        ${testimonial.image 
          ? `<img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-avatar" itemprop="image">`
          : `<div class="testimonial-avatar-initials">${initials}</div>`
        }
        <div class="testimonial-author-info">
          <div class="testimonial-author-name" itemprop="author" itemscope itemtype="https://schema.org/Person">
            <span itemprop="name">${testimonial.name}</span>
          </div>
          <div class="testimonial-author-role">
            ${testimonial.role}${testimonial.company ? ` at ${testimonial.company}` : ''}
          </div>
        </div>
      </div>
      ${testimonial.rating ? `
      <meta itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
      <meta itemprop="ratingValue" content="${testimonial.rating}">
      <meta itemprop="bestRating" content="5">
      ` : ''}
    </div>
    `;
  }).join('\n    ');

  const html = `
<section class="testimonials-section">
  <div class="container">
    <h2 class="section-title">What Our Clients Say</h2>
    <div class="testimonials-grid">
      ${testimonialsHTML}
    </div>
  </div>
</section>
  `.trim();

  // Generate aggregate rating schema
  const avgRating = testimonials
    .filter(t => t.rating)
    .reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.filter(t => t.rating).length;

  const schema = avgRating > 0 ? `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${avgRating.toFixed(1)}",
    "reviewCount": "${testimonials.length}",
    "bestRating": "5",
    "worstRating": "1"
  }
}
</script>
  `.trim() : '';

  return { html, schema };
}

/**
 * Generate trust badges section
 */
export function generateTrustBadges(badges: Array<{
  type: 'ssl' | 'secure' | 'guarantee' | 'award' | 'certification' | 'custom';
  text: string;
  icon?: string;
}>): string {
  const defaultBadges: Array<{ type: string; text: string; icon: string }> = [
    { type: 'ssl', text: 'SSL Secured', icon: '🔒' },
    { type: 'secure', text: '100% Secure', icon: '🛡️' },
    { type: 'guarantee', text: 'Money-Back Guarantee', icon: '✓' }
  ];

  const badgesToShow = badges.length > 0 ? badges : defaultBadges;

  const badgesHTML = badgesToShow.map(badge => `
    <div class="trust-badge" data-badge-type="${badge.type}">
      <span class="trust-badge-icon">${badge.icon || '✓'}</span>
      <span class="trust-badge-text">${badge.text}</span>
    </div>
  `).join('\n    ');

  return `
<section class="trust-badges-section">
  <div class="container">
    <div class="trust-badges-grid">
      ${badgesHTML}
    </div>
  </div>
</section>
  `.trim();
}

/**
 * Generate Privacy Policy page
 */
export function generatePrivacyPolicy(businessName: string, contactEmail?: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy | ${businessName}</title>
  <link rel="stylesheet" href="./assets/styles/main.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1>${businessName}</h1>
    </div>
  </header>
  
  <main class="legal-page">
    <div class="container-narrow">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated:</strong> ${currentDate}</p>
      
      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul>
          <li>Name and contact information (email, phone number)</li>
          <li>Business information</li>
          <li>Any other information you choose to provide</li>
        </ul>
      </section>
      
      <section>
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Respond to your inquiries and requests</li>
          <li>Send you technical notices and support messages</li>
          <li>Communicate with you about products and services</li>
        </ul>
      </section>
      
      <section>
        <h2>3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
        <ul>
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
        </ul>
      </section>
      
      <section>
        <h2>4. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
      </section>
      
      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of communications</li>
        </ul>
      </section>
      
      <section>
        <h2>6. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at:</p>
        <p>${contactEmail || 'contact@example.com'}</p>
      </section>
    </div>
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
  `.trim();
}

/**
 * Generate Terms of Service page
 */
export function generateTermsOfService(businessName: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service | ${businessName}</title>
  <link rel="stylesheet" href="./assets/styles/main.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1>${businessName}</h1>
    </div>
  </header>
  
  <main class="legal-page">
    <div class="container-narrow">
      <h1>Terms of Service</h1>
      <p><strong>Last Updated:</strong> ${currentDate}</p>
      
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
      </section>
      
      <section>
        <h2>2. Use License</h2>
        <p>Permission is granted to temporarily access the materials on our website for personal, non-commercial transitory viewing only.</p>
      </section>
      
      <section>
        <h2>3. Disclaimer</h2>
        <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties.</p>
      </section>
      
      <section>
        <h2>4. Limitations</h2>
        <p>In no event shall ${businessName} or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website.</p>
      </section>
      
      <section>
        <h2>5. Revisions</h2>
        <p>We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms.</p>
      </section>
    </div>
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
  `.trim();
}

/**
 * Generate Cookie Consent banner
 */
export function generateCookieConsent(): string {
  return `
<div id="cookie-consent" class="cookie-consent" style="display: none;">
  <div class="cookie-consent-content">
    <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
    <div class="cookie-consent-actions">
      <button class="btn btn-primary btn-sm" onclick="acceptCookies()">Accept All</button>
      <button class="btn btn-secondary btn-sm" onclick="declineCookies()">Decline</button>
      <a href="./privacy-policy.html" class="cookie-consent-link">Learn More</a>
    </div>
  </div>
</div>

<script>
(function() {
  // Check if consent already given
  if (localStorage.getItem('cookieConsent') === 'accepted') {
    return;
  }
  
  // Show banner after 2 seconds
  setTimeout(function() {
    const banner = document.getElementById('cookie-consent');
    if (banner) {
      banner.style.display = 'block';
    }
  }, 2000);
  
  window.acceptCookies = function() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookie-consent').style.display = 'none';
    // Enable analytics/tracking
  };
  
  window.declineCookies = function() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookie-consent').style.display = 'none';
  };
})();
</script>

<style>
.cookie-consent {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1f2937;
  color: white;
  padding: 1.5rem;
  z-index: 10000;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.cookie-consent-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.cookie-consent-content p {
  margin: 0;
  flex: 1;
  min-width: 300px;
}

.cookie-consent-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.cookie-consent-link {
  color: #60a5fa;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .cookie-consent-content {
    flex-direction: column;
    text-align: center;
  }
  
  .cookie-consent-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
  `.trim();
}

/**
 * Generate trust elements CSS
 */
export function generateTrustElementsCSS(): string {
  return `
/* Trust Elements Styles */
.testimonials-section {
  padding: 4rem 2rem;
  background: #f8f9fa;
}

.testimonial-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.testimonial-rating {
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.testimonial-quote {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-avatar,
.testimonial-avatar-initials {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.testimonial-avatar {
  object-fit: cover;
}

.testimonial-avatar-initials {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.testimonial-author-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.testimonial-author-role {
  font-size: 0.875rem;
  color: #6b7280;
}

.trust-badges-section {
  padding: 3rem 2rem;
  background: white;
}

.trust-badges-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s, transform 0.2s;
}

.trust-badge:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.trust-badge-icon {
  font-size: 1.5rem;
}

.trust-badge-text {
  font-weight: 500;
  color: #1f2937;
}

.legal-page {
  padding: 4rem 2rem;
  line-height: 1.8;
}

.legal-page h1 {
  margin-bottom: 1rem;
}

.legal-page h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.legal-page ul {
  margin: 1rem 0;
  padding-left: 2rem;
}

.legal-page li {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .trust-badges-grid {
    flex-direction: column;
    align-items: stretch;
  }
  
  .trust-badge {
    justify-content: center;
  }
}
  `.trim();
}

