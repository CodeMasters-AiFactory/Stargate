/**
 * Responsive Engine
 * Merlin 7.0 - Module 6
 * Generates mobile, tablet, and desktop layouts with readability checks
 */

import type { GeneratedLayout, ResponsiveLayout, SectionResponsiveRules } from './layoutEngine';
import type { DesignTokens } from '../types/designTokens';

export interface ResponsiveRules {
  mobile: ResponsiveBreakpoint;
  tablet: ResponsiveBreakpoint;
  desktop: ResponsiveBreakpoint;
}

export interface ResponsiveBreakpoint {
  breakpoint: string;
  layout: 'stack' | 'single-column' | 'condensed' | 'two-column' | 'grid' | 'adaptive' | 'full' | 'max-width' | 'wide';
  typography: 'reduced' | 'normal' | 'enhanced' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable' | 'spacious';
  sections: SectionBreakpointRules[];
}

export interface SectionBreakpointRules {
  sectionId: string;
  visible: boolean;
  order: number;
  layout: 'stack' | 'single' | 'hidden' | 'two-column' | 'grid' | 'full' | 'split';
  columns?: number;
}

/**
 * Generate responsive rules for a layout
 */
export function generateResponsiveRules(
  layout: GeneratedLayout,
  designTokens: DesignTokens
): ResponsiveRules {
  return {
    mobile: generateMobileBreakpoint(layout, designTokens),
    tablet: generateTabletBreakpoint(layout, designTokens),
    desktop: generateDesktopBreakpoint(layout, designTokens),
  };
}

/**
 * Generate mobile breakpoint rules
 */
function generateMobileBreakpoint(
  layout: GeneratedLayout,
  designTokens: DesignTokens
): ResponsiveBreakpoint {
  return {
    breakpoint: '768px',
    layout: 'stack',
    typography: 'normal',
    spacing: 'compact',
    sections: layout.sections.map(section => ({
      sectionId: section.id,
      visible: section.responsive.mobile.visible,
      order: section.responsive.mobile.order,
      layout: section.responsive.mobile.layout === 'stack' ? 'stack' : 'single',
      columns: 1,
    })),
  };
}

/**
 * Generate tablet breakpoint rules
 */
function generateTabletBreakpoint(
  layout: GeneratedLayout,
  designTokens: DesignTokens
): ResponsiveBreakpoint {
  return {
    breakpoint: '1024px',
    layout: 'two-column',
    typography: 'normal',
    spacing: 'normal',
    sections: layout.sections.map(section => ({
      sectionId: section.id,
      visible: section.responsive.tablet.visible,
      order: section.responsive.tablet.order,
      layout: section.responsive.tablet.layout === 'two-column' ? 'two-column' : 'grid',
      columns: section.variant.columns > 2 ? 2 : section.variant.columns,
    })),
  };
}

/**
 * Generate desktop breakpoint rules
 */
function generateDesktopBreakpoint(
  layout: GeneratedLayout,
  designTokens: DesignTokens
): ResponsiveBreakpoint {
  return {
    breakpoint: '1280px',
    layout: 'full',
    typography: 'enhanced',
    spacing: 'comfortable',
    sections: layout.sections.map(section => ({
      sectionId: section.id,
      visible: section.responsive.desktop.visible,
      order: section.responsive.desktop.order,
      layout: section.responsive.desktop.layout === 'full' ? 'full' : section.responsive.desktop.layout,
      columns: section.variant.columns,
    })),
  };
}

/**
 * Check readability for responsive layout
 */
export function checkReadability(
  responsiveRules: ResponsiveRules,
  designTokens: DesignTokens
): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check mobile font sizes
  if (responsiveRules.mobile.typography === 'reduced') {
    const baseSize = parseFloat(designTokens.typography.fontSizes.base);
    if (baseSize < 14) {
      issues.push('Mobile base font size too small for readability');
    }
  }
  
  // Check line heights
  const lineHeight = designTokens.typography.lineHeights.normal;
  if (lineHeight < 1.4) {
    issues.push('Line height too tight for mobile readability');
  }
  
  // Check spacing
  if (responsiveRules.mobile.spacing === 'compact') {
    const spacing = parseFloat(designTokens.spacing[4] || '1rem');
    if (spacing < 0.75) {
      issues.push('Mobile spacing too compact');
    }
  }
  
  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Generate CSS media queries for responsive layout
 */
export function generateResponsiveCSS(
  responsiveRules: ResponsiveRules,
  designTokens: DesignTokens
): string {
  const mobile = responsiveRules.mobile;
  const tablet = responsiveRules.tablet;
  const desktop = responsiveRules.desktop;
  
  return `
/* Mobile First - Base Styles */
@media (max-width: ${mobile.breakpoint}) {
  body {
    font-size: ${designTokens.typography.fontSizes.base};
    line-height: ${designTokens.typography.lineHeights.normal};
  }
  
  .container {
    padding: ${designTokens.spacing[4]};
  }
  
  ${mobile.sections
    .filter(s => !s.visible)
    .map(s => `.section-${s.sectionId} { display: none; }`)
    .join('\n  ')}
  
  ${mobile.sections
    .filter(s => s.visible && s.columns === 1)
    .map(s => `.section-${s.sectionId} .grid { grid-template-columns: 1fr; }`)
    .join('\n  ')}
}

/* Tablet */
@media (min-width: ${mobile.breakpoint}) and (max-width: ${tablet.breakpoint}) {
  body {
    font-size: ${designTokens.typography.fontSizes.lg};
  }
  
  .container {
    padding: ${designTokens.spacing[6]};
  }
  
  ${tablet.sections
    .filter(s => s.visible && s.columns === 2)
    .map(s => `.section-${s.sectionId} .grid { grid-template-columns: repeat(2, 1fr); }`)
    .join('\n  ')}
}

/* Desktop */
@media (min-width: ${desktop.breakpoint}) {
  body {
    font-size: ${designTokens.typography.fontSizes.xl};
  }
  
  .container {
    padding: ${designTokens.spacing[8]};
    max-width: 1280px;
    margin: 0 auto;
  }
  
  ${desktop.sections
    .filter(s => s.visible && s.columns && s.columns > 2)
    .map(s => `.section-${s.sectionId} .grid { grid-template-columns: repeat(${s.columns}, 1fr); }`)
    .join('\n  ')}
}
`;
}

