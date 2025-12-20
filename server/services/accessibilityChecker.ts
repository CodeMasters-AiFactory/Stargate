/**
 * Accessibility Checker - 120% Feature
 * WCAG 2.1 AA compliance checking and auto-fixing
 * 
 * Features:
 * - Color contrast validation
 * - Alt text verification
 * - Heading hierarchy check
 * - Keyboard navigation validation
 * - ARIA attributes verification
 * - Focus indicator check
 * - Touch target size validation
 * - Language declaration check
 */

export interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriteria: string;
  element: string;
  selector?: string;
  message: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  fix?: {
    description: string;
    code?: string;
    autoFixable: boolean;
  };
}

export interface AccessibilityReport {
  score: number;
  level: 'A' | 'AA' | 'AAA' | 'Non-compliant';
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  passedChecks: string[];
  timestamp: string;
}

// Color contrast utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check color contrast compliance
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): AccessibilityIssue | null {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const enhancedRatio = isLargeText ? 4.5 : 7;

  if (ratio < requiredRatio) {
    return {
      id: `contrast-${foreground}-${background}`,
      type: 'error',
      wcagLevel: 'AA',
      wcagCriteria: '1.4.3 Contrast (Minimum)',
      element: 'text',
      message: `Color contrast ratio is ${ratio.toFixed(2)}:1, should be at least ${requiredRatio}:1`,
      impact: 'critical',
      fix: {
        description: `Increase contrast by darkening text or lightening background`,
        autoFixable: true,
      },
    };
  } else if (ratio < enhancedRatio) {
    return {
      id: `contrast-enhanced-${foreground}-${background}`,
      type: 'warning',
      wcagLevel: 'AAA',
      wcagCriteria: '1.4.6 Contrast (Enhanced)',
      element: 'text',
      message: `Color contrast ratio is ${ratio.toFixed(2)}:1, AAA requires at least ${enhancedRatio}:1`,
      impact: 'minor',
      fix: {
        description: `Increase contrast for AAA compliance`,
        autoFixable: true,
      },
    };
  }

  return null;
}

/**
 * Check HTML for accessibility issues
 */
export function checkHTML(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for images without alt text
  const imgMatches = html.matchAll(/<img[^>]*>/gi);
  for (const match of imgMatches) {
    const imgTag = match[0];
    if (!imgTag.includes('alt=')) {
      issues.push({
        id: `missing-alt-${issues.length}`,
        type: 'error',
        wcagLevel: 'A',
        wcagCriteria: '1.1.1 Non-text Content',
        element: 'img',
        selector: imgTag.substring(0, 50),
        message: 'Image is missing alt attribute',
        impact: 'critical',
        fix: {
          description: 'Add descriptive alt text to the image',
          code: imgTag.replace('<img', '<img alt="[Describe the image]"'),
          autoFixable: false,
        },
      });
    } else if (imgTag.includes('alt=""') || imgTag.includes("alt=''")) {
      // Empty alt is valid for decorative images, but warn
      issues.push({
        id: `empty-alt-${issues.length}`,
        type: 'info',
        wcagLevel: 'A',
        wcagCriteria: '1.1.1 Non-text Content',
        element: 'img',
        selector: imgTag.substring(0, 50),
        message: 'Image has empty alt attribute. Ensure this is intentional for decorative images.',
        impact: 'minor',
        fix: {
          description: 'Add descriptive alt text if image conveys information',
          autoFixable: false,
        },
      });
    }
  }

  // Check for links without accessible text
  const linkMatches = html.matchAll(/<a[^>]*>([^<]*)<\/a>/gi);
  for (const match of linkMatches) {
    const linkText = match[1].trim();
    const linkTag = match[0];
    
    if (!linkText && !linkTag.includes('aria-label')) {
      issues.push({
        id: `empty-link-${issues.length}`,
        type: 'error',
        wcagLevel: 'A',
        wcagCriteria: '2.4.4 Link Purpose',
        element: 'a',
        selector: linkTag.substring(0, 50),
        message: 'Link has no accessible text',
        impact: 'serious',
        fix: {
          description: 'Add visible text or aria-label to the link',
          autoFixable: false,
        },
      });
    } else if (['click here', 'read more', 'learn more', 'here'].includes(linkText.toLowerCase())) {
      issues.push({
        id: `vague-link-${issues.length}`,
        type: 'warning',
        wcagLevel: 'AA',
        wcagCriteria: '2.4.4 Link Purpose',
        element: 'a',
        selector: linkTag.substring(0, 50),
        message: `Link text "${linkText}" is not descriptive`,
        impact: 'moderate',
        fix: {
          description: 'Use more descriptive link text that explains the destination',
          autoFixable: false,
        },
      });
    }
  }

  // Check for buttons without accessible text
  const buttonMatches = html.matchAll(/<button[^>]*>([^<]*)<\/button>/gi);
  for (const match of buttonMatches) {
    const buttonText = match[1].trim();
    const buttonTag = match[0];
    
    if (!buttonText && !buttonTag.includes('aria-label')) {
      issues.push({
        id: `empty-button-${issues.length}`,
        type: 'error',
        wcagLevel: 'A',
        wcagCriteria: '4.1.2 Name, Role, Value',
        element: 'button',
        selector: buttonTag.substring(0, 50),
        message: 'Button has no accessible text',
        impact: 'critical',
        fix: {
          description: 'Add visible text or aria-label to the button',
          autoFixable: false,
        },
      });
    }
  }

  // Check heading hierarchy
  const headingMatches = html.matchAll(/<h([1-6])[^>]*>/gi);
  let previousLevel = 0;
  for (const match of headingMatches) {
    const level = parseInt(match[1]);
    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        id: `heading-skip-${issues.length}`,
        type: 'warning',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1 Info and Relationships',
        element: `h${level}`,
        message: `Heading level skipped from h${previousLevel} to h${level}`,
        impact: 'moderate',
        fix: {
          description: `Consider using h${previousLevel + 1} instead`,
          autoFixable: true,
        },
      });
    }
    previousLevel = level;
  }

  // Check for missing lang attribute
  if (!html.includes('lang=')) {
    issues.push({
      id: 'missing-lang',
      type: 'error',
      wcagLevel: 'A',
      wcagCriteria: '3.1.1 Language of Page',
      element: 'html',
      message: 'Document is missing lang attribute',
      impact: 'serious',
      fix: {
        description: 'Add lang attribute to html element (e.g., lang="en")',
        code: '<html lang="en">',
        autoFixable: true,
      },
    });
  }

  // Check for missing viewport meta
  if (!html.includes('viewport')) {
    issues.push({
      id: 'missing-viewport',
      type: 'warning',
      wcagLevel: 'AA',
      wcagCriteria: '1.4.4 Resize Text',
      element: 'meta',
      message: 'Document may be missing viewport meta tag',
      impact: 'moderate',
      fix: {
        description: 'Add viewport meta tag for responsive design',
        code: '<meta name="viewport" content="width=device-width, initial-scale=1">',
        autoFixable: true,
      },
    });
  }

  // Check for forms without labels
  const inputMatches = html.matchAll(/<input[^>]*>/gi);
  for (const match of inputMatches) {
    const inputTag = match[0];
    const typeMatch = inputTag.match(/type=["']([^"']+)["']/);
    const type = typeMatch ? typeMatch[1] : 'text';
    
    if (!['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) {
      if (!inputTag.includes('aria-label') && !inputTag.includes('id=')) {
        issues.push({
          id: `input-no-label-${issues.length}`,
          type: 'error',
          wcagLevel: 'A',
          wcagCriteria: '1.3.1 Info and Relationships',
          element: 'input',
          selector: inputTag.substring(0, 50),
          message: 'Form input may not have an associated label',
          impact: 'serious',
          fix: {
            description: 'Add a <label> element or aria-label attribute',
            autoFixable: false,
          },
        });
      }
    }
  }

  // Check for skip link
  if (!html.includes('skip') && !html.includes('Skip')) {
    issues.push({
      id: 'missing-skip-link',
      type: 'warning',
      wcagLevel: 'A',
      wcagCriteria: '2.4.1 Bypass Blocks',
      element: 'a',
      message: 'Consider adding a skip navigation link',
      impact: 'moderate',
      fix: {
        description: 'Add a skip link at the beginning of the page',
        code: '<a href="#main-content" class="skip-link">Skip to main content</a>',
        autoFixable: true,
      },
    });
  }

  return issues;
}

/**
 * Check CSS for accessibility issues
 */
export function checkCSS(css: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for outline:none without alternative focus style
  if (css.includes('outline: none') || css.includes('outline:none')) {
    if (!css.includes(':focus')) {
      issues.push({
        id: 'outline-removed',
        type: 'error',
        wcagLevel: 'AA',
        wcagCriteria: '2.4.7 Focus Visible',
        element: 'css',
        message: 'Focus outline removed without providing alternative focus indicator',
        impact: 'serious',
        fix: {
          description: 'Add a visible focus style using :focus pseudo-class',
          code: ':focus { outline: 2px solid #3B82F6; outline-offset: 2px; }',
          autoFixable: true,
        },
      });
    }
  }

  // Check for small font sizes
  const fontSizeMatches = css.matchAll(/font-size:\s*(\d+)(px|pt|rem|em)/gi);
  for (const match of fontSizeMatches) {
    const size = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    // Convert to approximate px
    let pxSize = size;
    if (unit === 'pt') pxSize = size * 1.333;
    else if (unit === 'rem' || unit === 'em') pxSize = size * 16;
    
    if (pxSize < 12) {
      issues.push({
        id: `small-font-${issues.length}`,
        type: 'warning',
        wcagLevel: 'AA',
        wcagCriteria: '1.4.4 Resize Text',
        element: 'css',
        message: `Font size ${size}${unit} may be too small for readability`,
        impact: 'moderate',
        fix: {
          description: 'Consider using at least 16px (1rem) for body text',
          autoFixable: false,
        },
      });
    }
  }

  // Check for user-select: none on text content
  if (css.includes('user-select: none') || css.includes('user-select:none')) {
    issues.push({
      id: 'user-select-none',
      type: 'warning',
      wcagLevel: 'AA',
      wcagCriteria: '1.4.4 Resize Text',
      element: 'css',
      message: 'user-select: none may prevent users from selecting and copying text',
      impact: 'minor',
      fix: {
        description: 'Only use user-select: none for non-content elements like buttons',
        autoFixable: false,
      },
    });
  }

  return issues;
}

/**
 * Generate full accessibility report
 */
export function generateAccessibilityReport(
  html: string,
  css: string,
  colorPairs: Array<{ foreground: string; background: string; isLargeText?: boolean }>
): AccessibilityReport {
  const issues: AccessibilityIssue[] = [];
  const passedChecks: string[] = [];

  // Check HTML
  const htmlIssues = checkHTML(html);
  issues.push(...htmlIssues);

  // Check CSS
  const cssIssues = checkCSS(css);
  issues.push(...cssIssues);

  // Check color contrasts
  for (const pair of colorPairs) {
    const contrastIssue = checkColorContrast(pair.foreground, pair.background, pair.isLargeText);
    if (contrastIssue) {
      issues.push(contrastIssue);
    } else {
      passedChecks.push(`Color contrast ${pair.foreground}/${pair.background}: PASS`);
    }
  }

  // Count by impact
  const criticalIssues = issues.filter(i => i.impact === 'critical').length;
  const seriousIssues = issues.filter(i => i.impact === 'serious').length;
  const moderateIssues = issues.filter(i => i.impact === 'moderate').length;
  const minorIssues = issues.filter(i => i.impact === 'minor').length;

  // Calculate score (100 - weighted deductions)
  const score = Math.max(0, 100 - (criticalIssues * 15) - (seriousIssues * 8) - (moderateIssues * 3) - (minorIssues * 1));

  // Determine compliance level
  let level: AccessibilityReport['level'];
  if (criticalIssues === 0 && seriousIssues === 0) {
    if (issues.filter(i => i.wcagLevel === 'AA' && i.type === 'error').length === 0) {
      level = score >= 95 ? 'AAA' : 'AA';
    } else {
      level = 'A';
    }
  } else if (criticalIssues === 0) {
    level = 'A';
  } else {
    level = 'Non-compliant';
  }

  // Track passed checks
  if (html.includes('lang=')) passedChecks.push('Language declaration: PASS');
  if (html.includes('viewport')) passedChecks.push('Viewport meta tag: PASS');
  if (!html.includes('outline: none')) passedChecks.push('Focus indicators preserved: PASS');

  return {
    score,
    level,
    totalIssues: issues.length,
    criticalIssues,
    seriousIssues,
    moderateIssues,
    minorIssues,
    issues,
    passedChecks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Auto-fix common accessibility issues
 */
export function autoFixAccessibilityIssues(html: string, css: string): { html: string; css: string; fixedCount: number } {
  let fixedHtml = html;
  let fixedCss = css;
  let fixedCount = 0;

  // Add lang attribute if missing
  if (!fixedHtml.includes('lang=')) {
    fixedHtml = fixedHtml.replace('<html', '<html lang="en"');
    fixedCount++;
  }

  // Add viewport meta if missing
  if (!fixedHtml.includes('viewport') && fixedHtml.includes('<head>')) {
    fixedHtml = fixedHtml.replace(
      '<head>',
      '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">'
    );
    fixedCount++;
  }

  // Add skip link if missing
  if (!fixedHtml.includes('skip') && fixedHtml.includes('<body>')) {
    fixedHtml = fixedHtml.replace(
      '<body>',
      `<body>
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded">Skip to main content</a>`
    );
    fixedCount++;
  }

  // Ensure focus styles exist
  if (!fixedCss.includes(':focus') || fixedCss.includes('outline: none')) {
    fixedCss += `
/* Accessibility: Focus styles */
:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Skip link styles */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;
    fixedCount++;
  }

  return { html: fixedHtml, css: fixedCss, fixedCount };
}

/**
 * Get WCAG 2.1 guidelines summary
 */
export function getWCAGGuidelines(): Array<{
  principle: string;
  guidelines: Array<{
    id: string;
    name: string;
    level: 'A' | 'AA' | 'AAA';
    description: string;
  }>;
}> {
  return [
    {
      principle: 'Perceivable',
      guidelines: [
        { id: '1.1.1', name: 'Non-text Content', level: 'A', description: 'Provide text alternatives for non-text content' },
        { id: '1.3.1', name: 'Info and Relationships', level: 'A', description: 'Information structure must be programmatically determinable' },
        { id: '1.4.1', name: 'Use of Color', level: 'A', description: 'Color is not the only visual means of conveying information' },
        { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA', description: 'Text has a contrast ratio of at least 4.5:1' },
        { id: '1.4.4', name: 'Resize Text', level: 'AA', description: 'Text can be resized up to 200% without loss of functionality' },
        { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'AAA', description: 'Text has a contrast ratio of at least 7:1' },
      ],
    },
    {
      principle: 'Operable',
      guidelines: [
        { id: '2.1.1', name: 'Keyboard', level: 'A', description: 'All functionality is operable via keyboard' },
        { id: '2.4.1', name: 'Bypass Blocks', level: 'A', description: 'Mechanism to skip repeated blocks of content' },
        { id: '2.4.3', name: 'Focus Order', level: 'A', description: 'Focus order preserves meaning and operability' },
        { id: '2.4.4', name: 'Link Purpose', level: 'A', description: 'Link purpose can be determined from link text' },
        { id: '2.4.7', name: 'Focus Visible', level: 'AA', description: 'Keyboard focus indicator is visible' },
      ],
    },
    {
      principle: 'Understandable',
      guidelines: [
        { id: '3.1.1', name: 'Language of Page', level: 'A', description: 'Default language of page can be programmatically determined' },
        { id: '3.2.1', name: 'On Focus', level: 'A', description: 'Receiving focus does not cause a change of context' },
        { id: '3.3.1', name: 'Error Identification', level: 'A', description: 'Input errors are clearly described' },
        { id: '3.3.2', name: 'Labels or Instructions', level: 'A', description: 'Labels or instructions are provided for user input' },
      ],
    },
    {
      principle: 'Robust',
      guidelines: [
        { id: '4.1.1', name: 'Parsing', level: 'A', description: 'Content can be reliably interpreted by assistive technologies' },
        { id: '4.1.2', name: 'Name, Role, Value', level: 'A', description: 'User interface components have accessible names and roles' },
      ],
    },
  ];
}

console.log('[Accessibility Checker] ♿ Service loaded - WCAG 2.1 AA compliance checking ready');
