/**
 * Template Library Service
 * Manages pre-built website templates for different industries
 * 
 * CLEARED - Ready for new templates as instructed
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string[];
  previewImage: string;
  thumbnail: string;
  pages: string[];
  features: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  price: 'free' | 'premium';
  popularity: number;
  createdAt: Date;
}

/**
 * Pre-built templates for different industries
 * CLEARED - Ready for new templates as instructed
 */
export const TEMPLATE_LIBRARY: Template[] = [
  // All templates cleared - ready for new instructions
];

// Helper functions remain for compatibility
export function getTemplatesByCategory(category: string, includeGenerated: boolean = false): Template[] {
  return TEMPLATE_LIBRARY.filter(t => t.category === category);
}

export function getTemplatesByIndustry(industry: string, includeGenerated: boolean = false): Template[] {
  return TEMPLATE_LIBRARY.filter(t => 
    t.industry.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  );
}

export function getPopularTemplates(limit: number = 10): Template[] {
  return [...TEMPLATE_LIBRARY]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATE_LIBRARY.find(t => t.id === id);
}

export function searchTemplates(query: string, includeGenerated: boolean = false): Template[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATE_LIBRARY.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery) ||
    t.industry.some(ind => ind.toLowerCase().includes(lowerQuery))
  );
}

export function getAllTemplates(includeGenerated: boolean = false, generatedCount: number = 100): Template[] {
  // DISABLED: All templates cleared per user request
  return []; // Return empty array - no generated templates
}
