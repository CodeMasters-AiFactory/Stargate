/**
 * Brand Template Library
 * Templates named directly after world-famous brands
 * 
 * User sees: "Tesla Template", "Apple Template", "BMW Template"
 * User selects → Gets that exact style
 * 
 * CLEARED - Ready for new templates as instructed
 */

export interface BrandTemplate {
  id: string;
  name: string;           // "Tesla Template"
  brand: string;          // "Tesla"
  category: TemplateCategory;
  industry?: string;      // "Technology", "E-commerce", "Healthcare", etc.
  thumbnail: string;
  
  // Design System (extracted from real brand)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: string;
  };
  
  layout: {
    heroStyle: 'fullscreen' | 'split-left' | 'split-right' | 'centered' | 'video' | 'animated';
    maxWidth: string;
    borderRadius: string;
    sections: string[];
  };
  
  css: string;
  darkMode: boolean;
  tags: string[];
  contentData?: {
    html?: string;
    css?: string;
  };
}

export type TemplateCategory = 
  | 'corporate'
  | 'automotive' 
  | 'tech'
  | 'sports'
  | 'luxury'
  | 'startup'
  | 'fashion'
  | 'food';

export const INDUSTRIES = [
  'Accounting',
  'Agriculture',
  'Air Conditioning',
  'Animation',
  'Architecture',
  'Art & Design',
  'Art Gallery',
  'Automotive',
  'Aviation',
  'Bakery',
  'Banking',
  'Barbershop',
  'Beauty & Cosmetics',
  'Biotechnology',
  'Bookkeeping',
  'Broadcasting',
  'Building Maintenance',
  'Business Services',
  'Cafe',
  'Carpentry',
  'Catering',
  'Charity',
  'Cleaning Services',
  'Coaching',
  'Computer Repair',
  'Construction',
  'Consulting',
  'Content Creation',
  'Courier Services',
  'Craft & Hobby',
  'Dance Studio',
  'Data Analytics',
  'Dental',
  'Digital Marketing',
  'E-commerce',
  'Education',
  'Electrical Services',
  'Energy',
  'Engineering',
  'Entertainment',
  'Environmental Services',
  'Event Planning',
  'Fashion',
  'Financial Planning',
  'Finance',
  'Fire Safety',
  'Fitness & Gym',
  'Food & Beverage',
  'Food Truck',
  'Forensics',
  'Furniture',
  'Gaming',
  'Gardening',
  'Government',
  'Graphic Design',
  'Hardware Store',
  'Healthcare',
  'Home Improvement',
  'Home Services',
  'Hospitality',
  'Human Resources',
  'HVAC',
  'Information Technology',
  'Insurance',
  'Interior Design',
  'Internet Services',
  'Investment',
  'Jewelry',
  'Landscaping',
  'Language School',
  'Laundry Services',
  'Legal',
  'Locksmith',
  'Logistics',
  'Marine Services',
  'Marketing & Advertising',
  'Massage Therapy',
  'Manufacturing',
  'Media',
  'Medical',
  'Mental Health',
  'Mobile App Development',
  'Music',
  'Network Services',
  'Non-profit',
  'Nutrition',
  'Online Education',
  'Painting Services',
  'Pet Services',
  'Pharmaceutical',
  'Photography',
  'Plumbing',
  'Printing Services',
  'Property Management',
  'Public Relations',
  'Publishing',
  'Real Estate',
  'Recruitment',
  'Renewable Energy',
  'Restaurant',
  'Retail',
  'Roofing',
  'Salon & Spa',
  'Security',
  'Shipping',
  'Software',
  'Solar Energy',
  'Sports',
  'Tax Services',
  'Technology',
  'Telecommunications',
  'Tutoring',
  'Transportation',
  'Travel & Tourism',
  'Veterinary',
  'Video Production',
  'Web Design',
  'Wedding',
  'Wellness',
  'Waste Management',
  'Water Treatment',
] as const;

export type Industry = typeof INDUSTRIES[number];

// ==============================================
// ALL BRAND TEMPLATES
// CLEARED - Ready for new templates as instructed
// ==============================================
export const BRAND_TEMPLATES: BrandTemplate[] = [
  // All templates cleared - ready for new instructions
];

// Helper functions remain for compatibility
export function getBrandTemplatesByCategory(category: TemplateCategory): BrandTemplate[] {
  return BRAND_TEMPLATES.filter(t => t.category === category);
}

export function getBrandTemplatesByIndustry(industry: string): BrandTemplate[] {
  return BRAND_TEMPLATES.filter(t => 
    t.industry?.toLowerCase() === industry.toLowerCase()
  );
}

export function getBrandTemplateById(id: string): BrandTemplate | undefined {
  return BRAND_TEMPLATES.find(t => t.id === id);
}

export function searchBrandTemplates(query: string): BrandTemplate[] {
  const lowerQuery = query.toLowerCase();
  return BRAND_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.brand.toLowerCase().includes(lowerQuery) ||
    t.industry?.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getAllBrandTemplates(): BrandTemplate[] {
  return [...BRAND_TEMPLATES];
}

export function getTemplatesByIndustry(industry: string): BrandTemplate[] {
  return getBrandTemplatesByIndustry(industry);
}

export function getAllIndustries(): string[] {
  const industries = new Set<string>();
  BRAND_TEMPLATES.forEach(t => {
    if (t.industry) {
      industries.add(t.industry);
    }
  });
  return Array.from(industries).sort();
}
