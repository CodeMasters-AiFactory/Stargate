/**
 * Environment Variable Validator
 * Validates all required environment variables at startup
 */

import { z } from 'zod';

/**
 * Environment variable schema
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('5000'),
  DATABASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_INTEGRATIONS_OPENAI_API_KEY: z.string().optional(),
  AI_INTEGRATIONS_OPENAI_BASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  CDN_BASE_URL: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  config?: EnvConfig;
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const env = process.env;

  try {
    const config = envSchema.parse(env);
    return {
      valid: true,
      errors: [],
      config,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => {
        const path = e.path.join('.');
        return `${path}: ${e.message}`;
      });
      return {
        valid: false,
        errors: errorMessages,
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const result = validateEnvironment();
  
  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    console.warn('⚠️  Using default values for missing/invalid variables');
  }
  
  return result.config || {
    NODE_ENV: 'development',
    PORT: 5000,
  } as EnvConfig;
}

/**
 * Check if required environment variables are present
 */
export function checkRequiredEnvVars(required: string[]): { missing: string[] } {
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  return { missing };
}

