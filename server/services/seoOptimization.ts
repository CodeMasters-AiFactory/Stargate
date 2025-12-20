/**
 * SEO Optimization Service
 * Real-time SEO scoring and automated schema markup generation
 */

export interface SEOScore {
  overall: number; // 0-100
  categories: {
    content: number;
    technical: number;
    performance: number;
    accessibility: number;
    mobile: number;
  };
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SchemaMarkup {
  type: 'Organization' | 'LocalBusiness' | 'Product' | 'Article' | 'WebSite';
  data: Record<string, unknown>;
}

/**
 * Calculate SEO score for a website
 */
export function calculateSEOScore(website: {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  pages?: Array<{
    title?: string;
    description?: string;
    content?: string;
    images?: string[];
  }>;
  performance?: {
    loadTime?: number;
    size?: number;
  };
}): SEOScore {
  const issues: SEOIssue[] = [];
  let contentScore = 100;
  let technicalScore = 100;
  let performanceScore = 100;
  const accessibilityScore = 100;
  let mobileScore = 100;

  // Content checks
  if (!website.title || website.title.length < 30 || website.title.length > 60) {
    contentScore -= 20;
    issues.push({
      type: 'error',
      category: 'content',
      message: 'Title should be 30-60 characters',
      fix: 'Optimize your page title length',
      priority: 'high',
    });
  }

  if (!website.description || website.description.length < 120 || website.description.length > 160) {
    contentScore -= 15;
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Meta description should be 120-160 characters',
      fix: 'Optimize your meta description length',
      priority: 'medium',
    });
  }

  if (!website.keywords || website.keywords.length === 0) {
    contentScore -= 10;
    issues.push({
      type: 'info',
      category: 'content',
      message: 'No keywords specified',
      fix: 'Add relevant keywords for better SEO',
      priority: 'low',
    });
  }

  // Technical checks
  if (!website.url || !website.url.startsWith('https://')) {
    technicalScore -= 30;
    issues.push({
      type: 'error',
      category: 'technical',
      message: 'Website should use HTTPS',
      fix: 'Enable SSL certificate',
      priority: 'high',
    });
  }

  // Performance checks
  if (website.performance?.loadTime && website.performance.loadTime > 3000) {
    performanceScore -= 25;
    issues.push({
      type: 'warning',
      category: 'performance',
      message: 'Page load time is slow (>3s)',
      fix: 'Optimize images and reduce page size',
      priority: 'high',
    });
  }

  if (website.performance?.size && website.performance.size > 5000000) {
    performanceScore -= 20;
    issues.push({
      type: 'warning',
      category: 'performance',
      message: 'Page size is large (>5MB)',
      fix: 'Compress images and minify assets',
      priority: 'medium',
    });
  }

  // Mobile checks
  mobileScore = 100; // Assume responsive (would need actual check)

  // Calculate overall score (weighted average)
  const overall =
    contentScore * 0.3 +
    technicalScore * 0.25 +
    performanceScore * 0.25 +
    accessibilityScore * 0.1 +
    mobileScore * 0.1;

  // Generate recommendations
  const recommendations: string[] = [];
  if (contentScore < 80) {
    recommendations.push('Improve content optimization (title, description, keywords)');
  }
  if (technicalScore < 80) {
    recommendations.push('Fix technical SEO issues (HTTPS, structured data)');
  }
  if (performanceScore < 80) {
    recommendations.push('Optimize page performance (load time, size)');
  }

  return {
    overall: Math.round(overall),
    categories: {
      content: Math.round(contentScore),
      technical: Math.round(technicalScore),
      performance: Math.round(performanceScore),
      accessibility: Math.round(accessibilityScore),
      mobile: Math.round(mobileScore),
    },
    issues,
    recommendations,
  };
}

/**
 * Generate schema markup for a website
 */
export function generateSchemaMarkup(
  type: SchemaMarkup['type'],
  data: {
    name?: string;
    description?: string;
    url?: string;
    logo?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    [key: string]: unknown;
  }
): string {
  let schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
    case 'LocalBusiness':
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        url: data.url,
        logo: data.logo,
        ...(data.email && { email: data.email }),
        ...(data.phone && { telephone: data.phone }),
        ...(data.address && {
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.address.street,
            addressLocality: data.address.city,
            addressRegion: data.address.state,
            postalCode: data.address.zip,
            addressCountry: data.address.country,
          },
        }),
      };
      break;

    case 'WebSite':
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        url: data.url,
      };
      break;

    case 'Product':
      schema = {
        ...schema,
        name: data.name,
        description: data.description,
        ...(data.url && { url: data.url }),
        ...(data.logo && { image: data.logo }),
      };
      break;

    case 'Article':
      schema = {
        ...schema,
        headline: data.name,
        description: data.description,
        ...(data.url && { url: data.url }),
        ...(data.author && { author: { '@type': 'Person', name: data.author } }),
        ...(data.datePublished && { datePublished: data.datePublished }),
        ...(data.image && { image: data.image }),
      };
      break;
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate FAQ schema markup
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
  if (!faqs || faqs.length === 0) {
    return '';
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate HowTo schema markup
 */
export function generateHowToSchema(howTo: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string; url?: string }>;
  totalTime?: string;
  estimatedCost?: { currency: string; value: string };
}): string {
  if (!howTo.steps || howTo.steps.length === 0) {
    return '';
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url })
    }))
  };

  if (howTo.totalTime) {
    schema.totalTime = howTo.totalTime;
  }

  if (howTo.estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: howTo.estimatedCost.currency,
      value: howTo.estimatedCost.value
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate Product schema markup
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image?: string | string[];
  sku?: string;
  brand?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability?: string;
    url?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description
  };

  if (product.image) {
    schema.image = Array.isArray(product.image) ? product.image : [product.image];
  }

  if (product.sku) {
    schema.sku = product.sku;
  }

  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand
    };
  }

  if (product.offers) {
    schema.offers = {
      '@type': 'Offer',
      price: product.offers.price,
      priceCurrency: product.offers.priceCurrency,
      availability: product.offers.availability || 'https://schema.org/InStock',
      ...(product.offers.url && { url: product.offers.url })
    };
  }

  if (product.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate Review/Rating schema markup
 */
export function generateReviewSchema(review: {
  itemReviewed: string;
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: review.itemReviewed
    },
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.datePublished,
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating.ratingValue,
      bestRating: review.reviewRating.bestRating || 5,
      worstRating: review.reviewRating.worstRating || 1
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate comprehensive SEO meta tags
 */
export function generateSEOMetaTags(config: {
  title: string;
  description: string;
  keywords?: string[];
  url?: string;
  image?: string;
  type?: string;
  author?: string;
}): string {
  const { title, description, keywords, url, image, type = 'website', author } = config;

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${keywords && keywords.length > 0 ? `<meta name="keywords" content="${escapeHtml(keywords.join(', '))}" />` : ''}
    ${author ? `<meta name="author" content="${escapeHtml(author)}" />` : ''}
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    ${url ? `<meta property="og:url" content="${escapeHtml(url)}" />` : ''}
    ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
    
    <!-- Canonical URL -->
    ${url ? `<link rel="canonical" href="${escapeHtml(url)}" />` : ''}
  `.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

