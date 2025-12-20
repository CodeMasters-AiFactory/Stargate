/**
 * Auto-Apply Learned Styles Hook
 * Automatically applies learned design preferences to new components
 * Neural Design Learning - Phase 1A Week 2
 */

import { useCallback } from 'react';

export interface AutoApplyOptions {
  userId: string;
  projectId: string;
  componentType: string;
  baseStyles?: any;
}

export interface AutoApplyResult {
  styles: any;
  applied: string[];
  recommendations: Array<{
    id: string;
    type: string;
    suggestion: string;
    confidence: number;
    autoApplied: boolean;
  }>;
}

/**
 * Hook to auto-apply learned styles to components
 */
export function useAutoApplyStyles() {
  const autoApply = useCallback(async (options: AutoApplyOptions): Promise<AutoApplyResult> => {
    const { userId, projectId, componentType, baseStyles = {} } = options;

    try {
      // Fetch auto-applied styles from API
      const response = await fetch('/api/visual-editor/auto-apply-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          componentType,
          baseStyles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-apply styles');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Auto-apply failed');
      }

      // Also fetch recommendations to show what was applied
      const recsResponse = await fetch('/api/visual-editor/learned-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          context: { componentType },
        }),
      });

      let recommendations: any[] = [];
      if (recsResponse.ok) {
        const recsData = await recsResponse.json();
        if (recsData.success) {
          recommendations = recsData.recommendations.map((rec: any) => ({
            id: rec.id,
            type: rec.type,
            suggestion: rec.suggestion,
            confidence: rec.confidence,
            autoApplied: rec.autoApply,
          }));
        }
      }

      return {
        styles: data.styles,
        applied: data.applied || [],
        recommendations,
      };
    } catch (error) {
      console.error('Auto-apply styles error:', error);
      // Return base styles if auto-apply fails
      return {
        styles: baseStyles,
        applied: [],
        recommendations: [],
      };
    }
  }, []);

  const getLearnedRecommendations = useCallback(
    async (userId: string, projectId: string, componentType?: string) => {
      try {
        const response = await fetch('/api/visual-editor/learned-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            projectId,
            context: { componentType },
          }),
        });

        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        return data.success ? data.recommendations : [];
      } catch (error) {
        console.error('Get recommendations error:', error);
        return [];
      }
    },
    []
  );

  return {
    autoApply,
    getLearnedRecommendations,
  };
}

/**
 * Apply styles object to HTML element string
 */
export function applyStylesToHTML(html: string, styles: any): string {
  if (!styles || Object.keys(styles).length === 0) {
    return html;
  }

  // Convert styles object to inline style string
  const styleString = Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');

  // Add or update style attribute in HTML
  if (html.includes('style=')) {
    // Update existing style
    return html.replace(/style="([^"]*)"/, `style="$1; ${styleString}"`);
  } else {
    // Add new style attribute
    return html.replace(/<([a-z]+)/, `<$1 style="${styleString}"`);
  }
}

/**
 * Extract component type from HTML
 */
export function extractComponentType(html: string): string {
  // Try to extract from data-component-type attribute
  const typeMatch = html.match(/data-component-type="([^"]*)"/);
  if (typeMatch) {
    return typeMatch[1];
  }

  // Try to extract from class name
  const classMatch = html.match(/class="[^"]*component-([a-z-]+)/);
  if (classMatch) {
    return classMatch[1];
  }

  // Fallback to detecting element type
  if (html.includes('<button')) return 'button';
  if (html.includes('<nav')) return 'navigation';
  if (html.includes('<header')) return 'header';
  if (html.includes('<footer')) return 'footer';
  if (html.includes('<section')) return 'section';
  if (html.includes('<article')) return 'article';
  if (html.includes('<aside')) return 'aside';
  if (html.includes('<form')) return 'form';

  return 'unknown';
}
