/**
 * Merlin v6.3 - Section Variant Resolver
 * Selects the best layout variant for each section based on context
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DesignContext } from './designThinking';
import type { SectionPlan } from '../ai/layoutPlannerLLM';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface VariantCatalog {
  [sectionType: string]: Array<{
    id: string;
    description: string;
    bestForGoals?: string[];
    bestForIndustries?: string[];
    layoutHints?: any;
  }>;
}

export interface VariantSelection {
  variantId: string;
  variantMeta: any;
}

/**
 * Load section variants catalog
 */
function loadVariantCatalog(): VariantCatalog {
  const catalogPath = path.join(process.cwd(), 'config', 'section-variants.json');
  
  if (!fs.existsSync(catalogPath)) {
    console.warn('[Variant Resolver] section-variants.json not found, using empty catalog');
    return {};
  }

  try {
    const content = fs.readFileSync(catalogPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: unknown) {
    logError(error, 'Variant Resolver - Load catalog');
    return {};
  }
}

/**
 * Choose the best variant for a section based on context
 */
export function chooseVariantForSection(
  sectionType: string,
  designContext: DesignContext,
  plannedSection: SectionPlan | null,
  industry: string
): VariantSelection {
  const catalog = loadVariantCatalog();
  const variants = catalog[sectionType] || [];

  if (variants.length === 0) {
    console.warn(`[Variant Resolver] No variants found for section type: ${sectionType}`);
    return {
      variantId: `${sectionType}-default`,
      variantMeta: {}
    };
  }

  const industryLower = industry.toLowerCase();
  const primaryGoal = designContext.pageObjective?.primaryGoal || 'conversion';
  const goalLower = primaryGoal.toLowerCase();

  // Score each variant
  const scoredVariants = variants.map(variant => {
    let score = 0;

    // Industry match (highest priority)
    if (variant.bestForIndustries) {
      for (const bestIndustry of variant.bestForIndustries) {
        if (industryLower.includes(bestIndustry.toLowerCase()) || 
            bestIndustry.toLowerCase().includes(industryLower)) {
          score += 10;
          break;
        }
      }
    }

    // Goal match
    if (variant.bestForGoals) {
      for (const bestGoal of variant.bestForGoals) {
        if (goalLower.includes(bestGoal.toLowerCase()) || 
            bestGoal.toLowerCase().includes(goalLower)) {
          score += 5;
          break;
        }
      }
    }

    // Planned section notes match
    if (plannedSection?.notes) {
      const notesLower = plannedSection.notes.toLowerCase();
      if (variant.description && notesLower.includes(variant.description.toLowerCase())) {
        score += 3;
      }
    }

    // Importance boost
    if (plannedSection?.importance === 'high') {
      score += 2;
    }

    return { variant, score };
  });

  // Sort by score (highest first)
  scoredVariants.sort((a, b) => b.score - a.score);

  // Select best variant (or first if all scores are 0)
  const selected = scoredVariants[0].score > 0 
    ? scoredVariants[0].variant 
    : variants[0]; // Fallback to first variant

  console.log(`[Merlin v6.3] Chose variant ${selected.id} for section type ${sectionType} (industry: ${industry}, goal: ${primaryGoal}, score: ${scoredVariants[0].score})`);

  return {
    variantId: selected.id,
    variantMeta: {
      description: selected.description,
      layoutHints: selected.layoutHints || {},
      score: scoredVariants[0].score
    }
  };
}

