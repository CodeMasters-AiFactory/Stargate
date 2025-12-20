/**
 * Unit Tests - Multi-Language Generator
 */

import { describe, it, expect } from 'vitest';
import {
  generateMultiLanguageWebsite,
  SUPPORTED_LANGUAGES,
  getLanguageSEOMetadata,
  type SupportedLanguage,
} from '../../../server/services/multiLanguageGenerator';

describe('Multi-Language Generator', () => {
  const sampleHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Test Website</title>
      <meta name="description" content="A test website">
    </head>
    <body>
      <h1>Welcome</h1>
      <p>This is a test website.</p>
      <button>Get Started</button>
    </body>
    </html>
  `;

  describe('generateMultiLanguageWebsite', () => {
    it('should generate website in Spanish', async () => {
      const result = await generateMultiLanguageWebsite(sampleHTML, 'es', 'en');
      
      expect(result).toBeDefined();
      expect(result.language.code).toBe('es');
      expect(result.html).toContain('lang="es"');
      expect(result.rtl).toBe(false);
    });

    it('should generate website in Arabic (RTL)', async () => {
      const result = await generateMultiLanguageWebsite(sampleHTML, 'ar', 'en');
      
      expect(result).toBeDefined();
      expect(result.language.code).toBe('ar');
      expect(result.html).toContain('dir="rtl"');
      expect(result.rtl).toBe(true);
    });

    it('should include language switcher', async () => {
      const result = await generateMultiLanguageWebsite(sampleHTML, 'fr', 'en');
      
      expect(result.html).toContain('language-switcher');
      expect(result.html).toContain('language-selector');
    });

    it('should throw error for unsupported language', async () => {
      await expect(
        generateMultiLanguageWebsite(sampleHTML, 'xx' as SupportedLanguage, 'en')
      ).rejects.toThrow();
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have 15 supported languages', () => {
      expect(SUPPORTED_LANGUAGES.length).toBe(15);
    });

    it('should include major languages', () => {
      const codes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('es');
      expect(codes).toContain('fr');
      expect(codes).toContain('ar');
      expect(codes).toContain('zh');
    });

    it('should have RTL languages marked correctly', () => {
      const rtlLanguages = SUPPORTED_LANGUAGES.filter(l => l.rtl);
      expect(rtlLanguages.length).toBeGreaterThan(0);
      expect(rtlLanguages.map(l => l.code)).toContain('ar');
      expect(rtlLanguages.map(l => l.code)).toContain('he');
    });
  });

  describe('getLanguageSEOMetadata', () => {
    it('should return SEO metadata for language', () => {
      const metadata = getLanguageSEOMetadata('en', {
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Test Title');
      expect(metadata.description).toBe('Test Description');
      expect(metadata.hreflang).toBe('en-US');
    });

    it('should return correct locale for different languages', () => {
      const esMetadata = getLanguageSEOMetadata('es', {});
      expect(esMetadata.hreflang).toBe('es-ES');

      const arMetadata = getLanguageSEOMetadata('ar', {});
      expect(arMetadata.hreflang).toBe('ar-SA');
    });
  });
});

