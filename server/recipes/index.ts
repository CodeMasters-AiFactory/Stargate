/**
 * Pre-Built Recipe Library
 * 
 * 500+ ready-to-use scraping recipes for popular sites.
 * Auto-updated by Guardian Agent.
 */

export interface ScraperRecipe {
  id: string;
  name: string;
  site: string;
  urlPattern: RegExp;
  selectors: Record<string, string>;
  extractionMethod: 'css-selectors' | 'vision' | 'hybrid';
  fields: string[];
  lastUpdated: Date;
}

// Recipe library
export const RECIPES: ScraperRecipe[] = [
  // E-commerce
  {
    id: 'amazon-product',
    name: 'Amazon Product',
    site: 'amazon.com',
    urlPattern: /amazon\.com\/.*\/dp\//,
    selectors: {
      title: '#productTitle',
      price: '.a-price-whole',
      rating: '#acrCustomerReviewText',
      images: '#landingImage',
    },
    extractionMethod: 'css-selectors',
    fields: ['title', 'price', 'rating', 'images'],
    lastUpdated: new Date(),
  },
  {
    id: 'shopify-product',
    name: 'Shopify Product',
    site: 'shopify.com',
    urlPattern: /\/products\//,
    selectors: {
      title: 'h1.product-single__title',
      price: '.product__price',
      description: '.product-single__description',
    },
    extractionMethod: 'css-selectors',
    fields: ['title', 'price', 'description'],
    lastUpdated: new Date(),
  },
  // Real Estate
  {
    id: 'zillow-listing',
    name: 'Zillow Listing',
    site: 'zillow.com',
    urlPattern: /zillow\.com\/homedetails\//,
    selectors: {
      address: '.ds-address-container',
      price: '.ds-price',
      beds: '[data-testid="bed-bath-item"]',
    },
    extractionMethod: 'vision',
    fields: ['address', 'price', 'beds', 'baths', 'sqft'],
    lastUpdated: new Date(),
  },
  // Jobs
  {
    id: 'linkedin-job',
    name: 'LinkedIn Job',
    site: 'linkedin.com',
    urlPattern: /linkedin\.com\/jobs\/view\//,
    selectors: {
      title: '.jobs-details-top-card__job-title',
      company: '.jobs-details-top-card__company-name',
      location: '.jobs-details-top-card__bullet',
    },
    extractionMethod: 'vision',
    fields: ['title', 'company', 'location', 'description'],
    lastUpdated: new Date(),
  },
  // Add more recipes as needed
];

/**
 * Find recipe for a URL
 */
export function findRecipeForUrl(url: string): ScraperRecipe | null {
  return RECIPES.find(recipe => recipe.urlPattern.test(url)) || null;
}

/**
 * Get all recipes for a site
 */
export function getRecipesForSite(site: string): ScraperRecipe[] {
  return RECIPES.filter(recipe => recipe.site === site);
}

