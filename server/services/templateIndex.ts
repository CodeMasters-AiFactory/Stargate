/**
 * Template Index Service
 * Provides fast search and filtering using in-memory indexes
 */

import type { Template } from './templateLibrary';

interface TemplateIndex {
  byCategory: Map<string, Template[]>;
  byIndustry: Map<string, Template[]>;
  byId: Map<string, Template>;
  searchIndex: Map<string, Set<string>>; // word -> template IDs
}

let globalIndex: TemplateIndex | null = null;

/**
 * Build search index from templates
 */
function buildSearchIndex(templates: Template[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  
  templates.forEach(template => {
    // Index by name words
    template.name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(template.id);
      }
    });
    
    // Index by description words
    template.description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) {
        if (!index.has(word)) index.set(word, new Set());
        index.get(word)!.add(template.id);
      }
    });
    
    // Index by category
    const categoryKey = template.category.toLowerCase();
    if (!index.has(categoryKey)) index.set(categoryKey, new Set());
    index.get(categoryKey)!.add(template.id);
    
    // Index by industry
    template.industry.forEach(ind => {
      const industryKey = ind.toLowerCase();
      if (!index.has(industryKey)) index.set(industryKey, new Set());
      index.get(industryKey)!.add(template.id);
    });
  });
  
  return index;
}

/**
 * Build complete index from templates
 */
export function buildTemplateIndex(templates: Template[]): TemplateIndex {
  const byCategory = new Map<string, Template[]>();
  const byIndustry = new Map<string, Template[]>();
  const byId = new Map<string, Template>();
  
  templates.forEach(template => {
    // Index by ID
    byId.set(template.id, template);
    
    // Index by category
    if (!byCategory.has(template.category)) {
      byCategory.set(template.category, []);
    }
    byCategory.get(template.category)!.push(template);
    
    // Index by industry
    template.industry.forEach(ind => {
      const industryKey = ind.toLowerCase();
      if (!byIndustry.has(industryKey)) {
        byIndustry.set(industryKey, []);
      }
      byIndustry.get(industryKey)!.push(template);
    });
  });
  
  const searchIndex = buildSearchIndex(templates);
  
  return {
    byCategory,
    byIndustry,
    byId,
    searchIndex,
  };
}

/**
 * Get or build global index
 */
export function getTemplateIndex(templates: Template[]): TemplateIndex {
  if (!globalIndex) {
    globalIndex = buildTemplateIndex(templates);
  }
  return globalIndex;
}

/**
 * Update global index
 */
export function updateTemplateIndex(templates: Template[]): void {
  globalIndex = buildTemplateIndex(templates);
}

/**
 * Fast search using index
 */
export function fastSearch(query: string, index: TemplateIndex, allTemplates: Template[]): Template[] {
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) {
    return [];
  }
  
  // Find matching template IDs
  const matchingIds = new Set<string>();
  
  queryWords.forEach(word => {
    // Direct word match
    if (index.searchIndex.has(word)) {
      index.searchIndex.get(word)!.forEach(id => matchingIds.add(id));
    }
    
    // Partial match
    index.searchIndex.forEach((ids, indexedWord) => {
      if (indexedWord.includes(word) || word.includes(indexedWord)) {
        ids.forEach(id => matchingIds.add(id));
      }
    });
  });
  
  // Return matching templates
  return Array.from(matchingIds)
    .map(id => index.byId.get(id))
    .filter((t): t is Template => t !== undefined);
}

/**
 * Fast category filter using index
 */
export function fastCategoryFilter(category: string, index: TemplateIndex): Template[] {
  return index.byCategory.get(category) || [];
}

/**
 * Fast industry filter using index
 */
export function fastIndustryFilter(industry: string, index: TemplateIndex): Template[] {
  const industryKey = industry.toLowerCase();
  return index.byIndustry.get(industryKey) || [];
}

/**
 * Clear global index (useful for testing)
 */
export function clearTemplateIndex(): void {
  globalIndex = null;
}

