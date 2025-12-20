/**
 * Sub-Category Selector Component
 * Filters templates by sub-category (Private, Business, Corporate, etc.)
 * Appears after industry is selected
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

export const SUB_CATEGORIES = [
  'All Types',
  'Private',
  'Business',
  'Corporate',
  'Startup',
  'Enterprise',
  'Luxury',
  'Minimal',
  'Modern',
  'Classic',
  'Creative',
] as const;

export type SubCategory = typeof SUB_CATEGORIES[number];

interface SubCategorySelectorProps {
  selectedSubCategory: string | null;
  onSubCategoryChange: (subCategory: string | null) => void;
  templateCounts?: Record<string, number>;
  className?: string;
}

export function SubCategorySelector({
  selectedSubCategory,
  onSubCategoryChange,
  templateCounts = {},
  className = '',
}: SubCategorySelectorProps) {
  // Map template categories/tags to sub-categories
  const categoryMap: Record<string, string> = {
    'corporate': 'Corporate',
    'startup': 'Startup',
    'luxury': 'Luxury',
    'minimal': 'Minimal',
    'modern': 'Modern',
    'classic': 'Classic',
    'creative': 'Creative',
    'business': 'Business',
    'private': 'Private',
    'enterprise': 'Enterprise',
  };

  // Calculate counts for each sub-category
  const subCategoryCounts: Record<string, number> = {};
  
  // Initialize all sub-categories with 0
  SUB_CATEGORIES.forEach(cat => {
    if (cat !== 'All Types') {
      subCategoryCounts[cat] = 0;
    }
  });

  // Count templates by sub-category
  Object.entries(templateCounts).forEach(([key, count]) => {
    const normalizedKey = key.toLowerCase();
    for (const [pattern, category] of Object.entries(categoryMap)) {
      if (normalizedKey.includes(pattern)) {
        subCategoryCounts[category] = (subCategoryCounts[category] || 0) + count;
      }
    }
  });

  // Calculate total for "All Types"
  const allTypesCount = Object.values(templateCounts).reduce((a, b) => a + b, 0);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Filter className="w-5 h-5 text-slate-400" />
      <Select
        value={selectedSubCategory || 'All Types'}
        onValueChange={(value) => onSubCategoryChange(value === 'All Types' ? null : value)}
      >
        <SelectTrigger className={`${className.includes('w-full') ? 'w-full' : 'w-[200px]'} bg-slate-800/50 border-slate-700 text-white`}>
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem
            value="All Types"
            className="text-white hover:bg-slate-700"
          >
            <div className="flex items-center justify-between w-full">
              <span>All Types</span>
              <span className="text-slate-400 text-xs ml-2">
                ({allTypesCount} templates)
              </span>
            </div>
          </SelectItem>
          {SUB_CATEGORIES.filter(cat => cat !== 'All Types').map((subCategory) => {
            const count = subCategoryCounts[subCategory] || 0;
            return (
              <SelectItem
                key={subCategory}
                value={subCategory}
                className="text-white hover:bg-slate-700"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{subCategory}</span>
                  {count > 0 && (
                    <span className="text-slate-400 text-xs ml-2">
                      ({count} {count === 1 ? 'template' : 'templates'})
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

