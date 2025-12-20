/**
 * Industry Selector Component
 * Dropdown to filter templates by industry
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

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
  // Design Quality Categories
  'Top 100',
  'Top 1000',
  'Top 10000',
] as const;

export type Industry = typeof INDUSTRIES[number];

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  onIndustryChange: (industry: string | null) => void;
  templateCounts?: Record<string, number>;
  className?: string;
}

// Map lowercase/slug industry names to standard industry names
const INDUSTRY_MAP: Record<string, string> = {
  'restaurant': 'Food & Beverage',
  'cafe': 'Food & Beverage',
  'bar': 'Food & Beverage',
  'food': 'Food & Beverage',
  'coffee': 'Food & Beverage',
  'bakery': 'Food & Beverage',
  'fitness': 'Healthcare',
  'yoga': 'Healthcare',
  'healthcare': 'Healthcare',
  'medical': 'Healthcare',
  'dental': 'Healthcare',
  'veterinary': 'Healthcare',
  'real-estate': 'Real Estate',
  'real estate': 'Real Estate',
  'tech': 'Technology',
  'it': 'Technology',
  'technology': 'Technology',
  'retail': 'E-commerce',
  'ecommerce': 'E-commerce',
  'e-commerce': 'E-commerce',
  'education': 'Education',
  'finance': 'Finance',
  'automotive': 'Automotive',
  'fashion': 'Fashion',
  'legal': 'Legal',
  'consulting': 'Consulting',
  'nonprofit': 'Non-profit',
  'non-profit': 'Non-profit',
  'entertainment': 'Entertainment',
  'music': 'Entertainment',
  'hospitality': 'Hospitality',
  'travel': 'Hospitality',
  'manufacturing': 'Manufacturing',
};

// Normalize industry name to match our standard list
function normalizeIndustry(industry: string): string {
  const normalized = industry.toLowerCase().trim();
  return INDUSTRY_MAP[normalized] || industry;
}

export function IndustrySelector({
  selectedIndustry,
  onIndustryChange,
  templateCounts = {},
  className = '',
}: IndustrySelectorProps) {
  // Get all unique industries from templateCounts, normalized to standard names
  const availableIndustries = new Set<string>();
  const industryCounts: Record<string, number> = {};
  
  Object.entries(templateCounts).forEach(([industry, count]) => {
    const normalized = normalizeIndustry(industry);
    availableIndustries.add(normalized);
    industryCounts[normalized] = (industryCounts[normalized] || 0) + count;
  });
  
  // Also include predefined industries that might not have templates yet
  INDUSTRIES.forEach(industry => {
    if (!availableIndustries.has(industry)) {
      availableIndustries.add(industry);
      industryCounts[industry] = industryCounts[industry] || 0;
    }
  });
  
  // Sort industries - Design Quality categories first, then alphabetically
  const designQualityCategories = ['Top 100', 'Top 1000', 'Top 10000'];
  const sortedIndustries = Array.from(availableIndustries).sort((a, b) => {
    const aIsDesignQuality = designQualityCategories.includes(a);
    const bIsDesignQuality = designQualityCategories.includes(b);
    
    // Design quality categories go first
    if (aIsDesignQuality && !bIsDesignQuality) return -1;
    if (!aIsDesignQuality && bIsDesignQuality) return 1;
    
    // Within design quality categories, sort by order: Top 100, Top 1000, Top 10000
    if (aIsDesignQuality && bIsDesignQuality) {
      const aIndex = designQualityCategories.indexOf(a);
      const bIndex = designQualityCategories.indexOf(b);
      return aIndex - bIndex;
    }
    
    // Regular industries sorted alphabetically
    return a.localeCompare(b);
  });
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Building2 className="w-5 h-5 text-slate-400" />
      <Select
        value={selectedIndustry || ''}
        onValueChange={(value) => onIndustryChange(value || null)}
      >
        <SelectTrigger className={`${className.includes('w-full') ? 'w-full' : 'w-[280px]'} bg-slate-800/50 border-slate-700 text-white`}>
          <SelectValue placeholder="Select Industry (Required)" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 max-h-[400px] overflow-y-auto">
          {sortedIndustries.map((industry) => {
            const count = industryCounts[industry] || 0;
            const isDesignQualityCategory = designQualityCategories.includes(industry);
            // Always enable design quality categories, even if count is 0
            const isDisabled = !isDesignQualityCategory && count === 0;
            return (
              <SelectItem
                key={industry}
                value={industry}
                className="text-white hover:bg-slate-700"
                disabled={isDisabled}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{industry}</span>
                  <span className={`text-xs ml-2 ${count === 0 ? 'text-slate-600' : 'text-slate-400'}`}>
                    ({count} {count === 1 ? 'template' : 'templates'})
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

