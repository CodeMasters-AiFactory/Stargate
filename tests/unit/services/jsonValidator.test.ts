/**
 * Unit Tests - JSON Validator Utility
 */

import { describe, it, expect } from 'vitest';
import {
  safeJsonParse,
  extractJsonFromText,
  isScreenshotAnalysis,
  isVoiceIntent,
} from '../../../server/utils/jsonValidator';

describe('JSON Validator', () => {
  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"test": "value"}');
      expect(result).toEqual({ test: 'value' });
    });

    it('should throw on invalid JSON', () => {
      expect(() => safeJsonParse('invalid json')).toThrow();
    });

    it('should validate with type guard', () => {
      const validIntent = { industry: 'Technology' };
      const result = safeJsonParse(JSON.stringify(validIntent), isVoiceIntent);
      expect(result.industry).toBe('Technology');
    });

    it('should throw on validation failure', () => {
      const invalidIntent = { name: 'Test' };
      expect(() =>
        safeJsonParse(JSON.stringify(invalidIntent), isVoiceIntent)
      ).toThrow();
    });
  });

  describe('extractJsonFromText', () => {
    it('should extract JSON from markdown code block', () => {
      const text = '```json\n{"test": "value"}\n```';
      const result = extractJsonFromText(text);
      expect(result).toBe('{"test": "value"}');
    });

    it('should extract JSON object from text', () => {
      const text = 'Some text {"test": "value"} more text';
      const result = extractJsonFromText(text);
      expect(result).toBe('{"test": "value"}');
    });

    it('should return null if no JSON found', () => {
      const text = 'No JSON here';
      const result = extractJsonFromText(text);
      expect(result).toBeNull();
    });
  });

  describe('isScreenshotAnalysis', () => {
    it('should validate screenshot analysis', () => {
      const valid = {
        layout: { sections: [], colors: [], fonts: [], spacing: 'normal' },
        content: { headlines: [], paragraphs: [], ctas: [] },
        recommendations: [],
      };
      expect(isScreenshotAnalysis(valid)).toBe(true);
    });

    it('should reject invalid structure', () => {
      expect(isScreenshotAnalysis({})).toBe(false);
      expect(isScreenshotAnalysis(null)).toBe(false);
      expect(isScreenshotAnalysis({ layout: {} })).toBe(false);
    });
  });

  describe('isVoiceIntent', () => {
    it('should validate voice intent', () => {
      const valid = { industry: 'Technology' };
      expect(isVoiceIntent(valid)).toBe(true);
    });

    it('should reject invalid structure', () => {
      expect(isVoiceIntent({})).toBe(false);
      expect(isVoiceIntent(null)).toBe(false);
      expect(isVoiceIntent({ name: 'Test' })).toBe(false);
    });
  });
});

