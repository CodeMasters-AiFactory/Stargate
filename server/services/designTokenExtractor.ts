/**
 * Design Token Extractor Service
 * 
 * Extract design tokens (colors, typography, spacing) from a webpage
 */

import { Page } from 'puppeteer';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface DesignTokens {
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    [key: string]: string | undefined;
  };
  typography: {
    headingFont?: string;
    bodyFont?: string;
    headingWeight?: string;
    bodySize?: string;
  };
  spacing: {
    sectionPadding?: string;
    containerMaxWidth?: string;
  };
}

/**
 * Extract design tokens from a page
 */
export async function extractDesignTokens(page: Page): Promise<DesignTokens> {
  try {
    const tokens = await page.evaluate(() => {
      const colors: Record<string, string> = {};
      const typography: Record<string, string> = {};
      const spacing: Record<string, string> = {};

      // Extract colors from computed styles
      const body = document.body;
      if (body) {
        const computedStyle = window.getComputedStyle(body);
        colors.background = computedStyle.backgroundColor;
        colors.text = computedStyle.color;
      }

      // Extract typography
      const h1 = document.querySelector('h1');
      if (h1) {
        const style = window.getComputedStyle(h1);
        typography.headingFont = style.fontFamily;
        typography.headingWeight = style.fontWeight;
      }

      const p = document.querySelector('p');
      if (p) {
        const style = window.getComputedStyle(p);
        typography.bodyFont = style.fontFamily;
        typography.bodySize = style.fontSize;
      }

      // Extract spacing
      const main = document.querySelector('main') || document.body;
      if (main) {
        const style = window.getComputedStyle(main);
        spacing.sectionPadding = style.padding;
        spacing.containerMaxWidth = style.maxWidth;
      }

      // Try to find primary color from common elements
      const buttons = Array.from(document.querySelectorAll('button, a.button, .btn'));
      if (buttons.length > 0) {
        const btnStyle = window.getComputedStyle(buttons[0] as Element);
        colors.primary = btnStyle.backgroundColor;
      }

      // Try to find secondary color from links
      const links = Array.from(document.querySelectorAll('a'));
      if (links.length > 0) {
        const linkStyle = window.getComputedStyle(links[0] as Element);
        colors.secondary = linkStyle.color;
      }

      return { colors, typography, spacing };
    });

    return tokens;
  } catch (error) {
    logError(error, 'Design Token Extractor');
    return {
      colors: {},
      typography: {},
      spacing: {},
    };
  }
}

