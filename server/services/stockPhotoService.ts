/**
 * Stock Photo Service
 * Integrates Unsplash + Pexels for high-quality real photos
 * 
 * AI images are good, but REAL photos often look better
 */

export interface StockPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  source: 'unsplash' | 'pexels';
  downloadUrl: string;
}

export interface PhotoSearchOptions {
  query: string;
  count?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  color?: string;
}

// Unsplash API
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = 'https://api.unsplash.com';

// Pexels API
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API = 'https://api.pexels.com/v1';

/**
 * Search Unsplash for photos
 */
async function searchUnsplash(options: PhotoSearchOptions): Promise<StockPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('[Stock Photos] Unsplash API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: options.query,
      per_page: String(options.count || 5),
      orientation: options.orientation || 'landscape',
    });

    const response = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('[Unsplash] API error:', response.status);
      return [];
    }

    const data = await response.json();

    return data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description || options.query,
      photographer: photo.user.name,
      source: 'unsplash' as const,
      downloadUrl: photo.links.download,
    }));
  } catch (error) {
    console.error('[Unsplash] Error:', error);
    return [];
  }
}

/**
 * Search Pexels for photos
 */
async function searchPexels(options: PhotoSearchOptions): Promise<StockPhoto[]> {
  if (!PEXELS_API_KEY) {
    console.log('[Stock Photos] Pexels API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      query: options.query,
      per_page: String(options.count || 5),
      orientation: options.orientation || 'landscape',
    });

    const response = await fetch(`${PEXELS_API}/search?${params}`, {
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('[Pexels] API error:', response.status);
      return [];
    }

    const data = await response.json();

    return data.photos.map((photo: any) => ({
      id: String(photo.id),
      url: photo.src.large,
      thumbUrl: photo.src.tiny,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || options.query,
      photographer: photo.photographer,
      source: 'pexels' as const,
      downloadUrl: photo.src.original,
    }));
  } catch (error) {
    console.error('[Pexels] Error:', error);
    return [];
  }
}

/**
 * Search both Unsplash and Pexels
 */
export async function searchStockPhotos(options: PhotoSearchOptions): Promise<StockPhoto[]> {
  const [unsplashPhotos, pexelsPhotos] = await Promise.all([
    searchUnsplash(options),
    searchPexels(options),
  ]);

  // Interleave results from both sources
  const combined: StockPhoto[] = [];
  const maxLen = Math.max(unsplashPhotos.length, pexelsPhotos.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (unsplashPhotos[i]) combined.push(unsplashPhotos[i]);
    if (pexelsPhotos[i]) combined.push(pexelsPhotos[i]);
  }

  return combined.slice(0, options.count || 10);
}

/**
 * Get industry-specific photo queries
 */
export function getIndustryPhotoQueries(industry: string): Record<string, string> {
  const queries: Record<string, Record<string, string>> = {
    technology: {
      hero: 'modern office technology workspace',
      team: 'diverse tech team collaboration',
      product: 'digital product interface mockup',
      abstract: 'abstract technology gradient',
    },
    restaurant: {
      hero: 'gourmet food plating restaurant',
      interior: 'modern restaurant interior design',
      chef: 'professional chef cooking kitchen',
      dishes: 'delicious food presentation',
    },
    'real-estate': {
      hero: 'luxury modern home interior',
      exterior: 'beautiful house exterior architecture',
      living: 'stylish living room design',
      kitchen: 'modern kitchen renovation',
    },
    healthcare: {
      hero: 'modern medical healthcare clinic',
      doctor: 'friendly doctor patient care',
      facility: 'clean medical facility interior',
      wellness: 'health wellness lifestyle',
    },
    finance: {
      hero: 'professional business finance',
      team: 'financial advisors meeting',
      growth: 'business growth success chart',
      security: 'financial security trust',
    },
    fitness: {
      hero: 'gym fitness workout training',
      equipment: 'modern gym equipment',
      training: 'personal training session',
      wellness: 'healthy lifestyle fitness',
    },
    legal: {
      hero: 'professional law office',
      team: 'lawyers legal team meeting',
      library: 'law library books',
      courthouse: 'justice courthouse building',
    },
    education: {
      hero: 'modern classroom education',
      students: 'students learning collaboration',
      campus: 'university campus building',
      technology: 'educational technology learning',
    },
    ecommerce: {
      hero: 'online shopping ecommerce',
      product: 'product photography minimalist',
      packaging: 'premium packaging unboxing',
      lifestyle: 'lifestyle product photography',
    },
    beauty: {
      hero: 'beauty spa wellness',
      products: 'cosmetics beauty products',
      treatment: 'spa treatment relaxation',
      portrait: 'natural beauty portrait',
    },
  };

  return queries[industry.toLowerCase()] || queries.technology;
}

/**
 * Get photos for a website section
 */
export async function getPhotosForSection(
  section: 'hero' | 'about' | 'team' | 'services' | 'testimonials' | 'gallery',
  industry: string,
  count: number = 3
): Promise<StockPhoto[]> {
  const industryQueries = getIndustryPhotoQueries(industry);
  
  const sectionQueryMap: Record<string, string> = {
    hero: industryQueries.hero,
    about: industryQueries.team || industryQueries.hero,
    team: 'professional business team portrait',
    services: industryQueries.product || industryQueries.hero,
    testimonials: 'happy customer professional portrait',
    gallery: industryQueries.hero,
  };

  const query = sectionQueryMap[section] || industryQueries.hero;

  return searchStockPhotos({
    query,
    count,
    orientation: section === 'hero' ? 'landscape' : undefined,
  });
}

/**
 * Get curated hero image for industry
 */
export async function getHeroImage(industry: string): Promise<StockPhoto | null> {
  const photos = await getPhotosForSection('hero', industry, 1);
  return photos[0] || null;
}

/**
 * Check if stock photo APIs are configured
 */
export function isStockPhotoConfigured(): boolean {
  return Boolean(UNSPLASH_ACCESS_KEY || PEXELS_API_KEY);
}

/**
 * Get API status
 */
export function getStockPhotoStatus(): {
  unsplash: boolean;
  pexels: boolean;
} {
  return {
    unsplash: Boolean(UNSPLASH_ACCESS_KEY),
    pexels: Boolean(PEXELS_API_KEY),
  };
}

console.log('[Stock Photo Service] 📷 Real photos ready');

