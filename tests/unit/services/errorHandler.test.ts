/**
 * Unit Tests - Error Handler Utility
 */

import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  getErrorStack,
  getErrorCode,
  isError,
  hasErrorCode,
  logError,
} from '../../../server/utils/errorHandler';

describe('Error Handler', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should handle string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should handle objects with message', () => {
      expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
    });

    it('should return default for unknown', () => {
      expect(getErrorMessage(null)).toBe('Unknown error');
    });
  });

  describe('getErrorStack', () => {
    it('should extract stack from Error', () => {
      const error = new Error('Test');
      const stack = getErrorStack(error);
      expect(stack).toBeDefined();
      expect(typeof stack).toBe('string');
    });

    it('should return undefined for non-Error', () => {
      expect(getErrorStack('string')).toBeUndefined();
    });
  });

  describe('getErrorCode', () => {
    it('should extract code property', () => {
      const error = { code: 'ERR_TEST' };
      expect(getErrorCode(error)).toBe('ERR_TEST');
    });

    it('should extract status property', () => {
      const error = { status: 404 };
      expect(getErrorCode(error)).toBe('404');
    });

    it('should return undefined if no code', () => {
      expect(getErrorCode({})).toBeUndefined();
    });
  });

  describe('isError', () => {
    it('should identify Error instances', () => {
      expect(isError(new Error('Test'))).toBe(true);
      expect(isError('string')).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe('hasErrorCode', () => {
    it('should check for code property', () => {
      expect(hasErrorCode({ code: 'ERR_TEST' })).toBe(true);
      expect(hasErrorCode({ code: 404 })).toBe(true);
      expect(hasErrorCode({})).toBe(false);
      expect(hasErrorCode(null)).toBe(false);
    });
  });
});

