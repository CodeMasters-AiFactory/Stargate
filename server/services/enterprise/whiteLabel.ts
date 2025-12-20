/**
 * White-Labeling Service
 * Custom branding for enterprise clients
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../../utils/errorHandler';

export interface WhiteLabelConfig {
  organizationId: string;
  brandName: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  customEmailDomain?: string;
  removePoweredBy: boolean;
  customFooter?: string;
  customHeader?: string;
}

/**
 * Apply white-labeling to HTML
 */
export function applyWhiteLabeling(html: string, config: WhiteLabelConfig): string {
  try {
    const $ = cheerio.load(html);

    // Replace logo
    if (config.logoUrl) {
      $('img[alt*="logo"], img[alt*="Logo"], .logo img, #logo img').attr('src', config.logoUrl);
      $('img[alt*="logo"], img[alt*="Logo"], .logo img, #logo img').attr('alt', config.brandName);
    }

    // Replace favicon
    if (config.faviconUrl) {
      $('link[rel="icon"], link[rel="shortcut icon"]').remove();
      $('head').prepend(`<link rel="icon" href="${config.faviconUrl}" type="image/x-icon">`);
    }

    // Apply custom colors
    if (config.primaryColor || config.secondaryColor) {
      let customCSS = '<style data-white-label>';
      if (config.primaryColor) {
        customCSS += `:root { --primary-color: ${config.primaryColor}; }`;
      }
      if (config.secondaryColor) {
        customCSS += `:root { --secondary-color: ${config.secondaryColor}; }`;
      }
      customCSS += '</style>';
      $('head').append(customCSS);
    }

    // Remove "Powered by" text
    if (config.removePoweredBy) {
      $('*').each((_, el) => {
        const $el = $(el);
        const text = $el.text();
        if (text.includes('Powered by') || text.includes('powered by')) {
          $el.remove();
        }
      });
    }

    // Replace footer
    if (config.customFooter) {
      $('footer').html(config.customFooter);
    }

    // Replace header
    if (config.customHeader) {
      $('header').html(config.customHeader);
    }

    // Replace brand name
    $('body').html($('body').html()?.replace(/Stargate|StargatePortal/gi, config.brandName) || '');

    return $.html();
  } catch (error) {
    logError(error, 'WhiteLabel - ApplyWhiteLabeling');
    throw new Error(`Failed to apply white-labeling: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate white-label CSS
 */
export function generateWhiteLabelCSS(config: WhiteLabelConfig): string {
  return `
    :root {
      --brand-primary: ${config.primaryColor};
      --brand-secondary: ${config.secondaryColor};
    }
    
    .brand-logo {
      content: url('${config.logoUrl}');
    }
    
    .brand-name {
      font-family: inherit;
    }
  `;
}

console.log('[WhiteLabel] 🎨 Service loaded - White-labeling ready');

