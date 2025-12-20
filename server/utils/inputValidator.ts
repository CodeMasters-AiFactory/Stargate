/**
 * Input Validation Utility
 * Provides Zod-based validation for API routes
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  projectSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  url: z.string().url(),
  email: z.string().email(),
  positiveInteger: z.number().int().positive(),
  nonEmptyString: z.string().min(1),
  optionalString: z.string().optional(),
  optionalUrl: z.string().url().optional().or(z.literal('')),
};

/**
 * Validate request body with Zod schema
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Validation failed: ${errorMessage}` };
    }
    return { success: false, error: 'Validation failed: Unknown error' };
  }
}

/**
 * Validate request params with Zod schema
 */
export function validateRequestParams<T>(schema: z.ZodSchema<T>, params: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Invalid parameters: ${errorMessage}` };
    }
    return { success: false, error: 'Invalid parameters: Unknown error' };
  }
}

/**
 * Validate request query with Zod schema
 */
export function validateRequestQuery<T>(schema: z.ZodSchema<T>, query: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Invalid query: ${errorMessage}` };
    }
    return { success: false, error: 'Invalid query: Unknown error' };
  }
}

