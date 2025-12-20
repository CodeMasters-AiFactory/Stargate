/**
 * Wizard State Validation Schemas
 * Runtime validation for wizard state using Zod
 *
 * This ensures that loaded state from localStorage or API responses
 * is properly validated before use, preventing runtime errors.
 */

import { z } from 'zod';
import {
  WIZARD_EMAIL_PATTERN,
  WIZARD_URL_PATTERN,
  WIZARD_PHONE_PATTERN,
} from './wizard';

// ============================================================================
// BASIC TYPE SCHEMAS
// ============================================================================

/**
 * Email validation schema
 */
export const emailSchema = z.string().regex(WIZARD_EMAIL_PATTERN, 'Invalid email address');

/**
 * URL validation schema
 */
export const urlSchema = z.string().regex(WIZARD_URL_PATTERN, 'Invalid URL');

/**
 * Phone validation schema
 */
export const phoneSchema = z.string().regex(WIZARD_PHONE_PATTERN, 'Invalid phone number');

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z.string().min(1, 'This field is required');

// ============================================================================
// WIZARD STAGE SCHEMA
// ============================================================================

/**
 * Valid wizard stages
 */
export const wizardStageSchema = z.enum([
  // Legacy stages
  'mode-select',
  'discover',
  'define',
  'ecommerce',
  'confirm',
  'research',
  'commit',
  // New 3-phase workflow
  'package-select',
  'template-select',
  'final-website',
  // Deprecated but kept for compatibility
  'keywords-collection',
  'content-rewriting',
  'image-generation',
  'seo-assessment',
  'review-redo',
  'final-approval',
  'empty-preview',
  'content-select',
  'client-info',
  'merge-preview',
  'ai-generation',
  'review-redesign',
  'seo-evaluation',
  // Legacy investigation stages
  'requirements',
  'content-quality',
  'keywords-semantic-seo',
  'technical-seo',
  'user-experience',
  'authority-trust',
  'local-seo',
  'competitor-analysis',
]);

export type WizardStageType = z.infer<typeof wizardStageSchema>;

// ============================================================================
// PACKAGE SCHEMA
// ============================================================================

/**
 * Package ID schema
 */
export const packageIdSchema = z.enum(['starter', 'professional', 'enterprise']);

export type PackageIdType = z.infer<typeof packageIdSchema>;

/**
 * Package constraints schema
 */
export const packageConstraintsSchema = z.object({
  maxPages: z.number().int().positive(),
  features: z.array(z.string()),
  support: z.string(),
  price: z.string(),
});

// ============================================================================
// WEBSITE REQUIREMENTS SCHEMA
// ============================================================================

/**
 * Business contact schema
 */
export const businessContactSchema = z.object({
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  address: z.string().optional(),
});

/**
 * Website requirements schema
 */
export const websiteRequirementsSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  targetAudience: z.string().optional(),
  primaryGoal: z.string().optional(),
  secondaryGoals: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
  competitorUrls: z.array(urlSchema).optional(),
  existingWebsite: urlSchema.optional().or(z.literal('')),
  brandColors: z.array(z.string()).optional(),
  stylePreferences: z.array(z.string()).optional(),
  toneOfVoice: z.string().optional(),
  callToAction: z.string().optional(),
  contact: businessContactSchema.optional(),
  specialRequirements: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
}).passthrough(); // Allow additional properties for flexibility

// ============================================================================
// CHECKLIST STATE SCHEMA
// ============================================================================

/**
 * Checklist item schema
 */
export const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
  value: z.string().optional(),
  required: z.boolean().optional(),
});

/**
 * Checklist state schema
 */
export const checklistStateSchema = z.record(
  z.string(),
  z.union([z.boolean(), z.string(), z.array(z.string())])
);

// ============================================================================
// GENERATED WEBSITE SCHEMA
// ============================================================================

/**
 * Generated page schema
 */
export const generatedPageSchema = z.object({
  name: z.string(),
  slug: z.string(),
  html: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Generated website schema
 */
export const generatedWebsiteSchema = z.object({
  pages: z.array(generatedPageSchema),
  assets: z.record(z.string(), z.string()).optional(),
  metadata: z.object({
    generatedAt: z.string().optional(),
    version: z.string().optional(),
    packageId: packageIdSchema.optional(),
  }).optional(),
}).passthrough();

// ============================================================================
// WIZARD STATE SCHEMA
// ============================================================================

/**
 * Full wizard state schema
 */
export const wizardStateSchema = z.object({
  stage: wizardStageSchema,
  requirements: websiteRequirementsSchema.optional(),
  selectedPackage: packageIdSchema.optional().nullable(),
  selectedTemplate: z.string().optional().nullable(),
  generatedWebsite: generatedWebsiteSchema.optional().nullable(),
  checklistState: checklistStateSchema.optional(),
  lastUpdated: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
}).passthrough();

export type WizardStateType = z.infer<typeof wizardStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Safely parse wizard state from unknown data
 * Returns null if validation fails
 */
export function parseWizardState(data: unknown): WizardStateType | null {
  const result = wizardStateSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('[WizardValidation] Invalid wizard state:', result.error.errors);
  return null;
}

/**
 * Safely parse wizard state with default fallback
 */
export function parseWizardStateWithDefault(
  data: unknown,
  defaultState: WizardStateType
): WizardStateType {
  return parseWizardState(data) ?? defaultState;
}

/**
 * Validate a specific field
 */
export function validateField(
  schema: z.ZodSchema,
  value: unknown
): { valid: boolean; error?: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    error: result.error.errors[0]?.message || 'Invalid value',
  };
}

/**
 * Validate email
 */
export function validateEmail(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: true }; // Empty is valid (optional field)
  return validateField(emailSchema, value);
}

/**
 * Validate URL
 */
export function validateUrl(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: true }; // Empty is valid (optional field)
  return validateField(urlSchema, value);
}

/**
 * Validate phone
 */
export function validatePhone(value: string): { valid: boolean; error?: string } {
  if (!value) return { valid: true }; // Empty is valid (optional field)
  return validateField(phoneSchema, value);
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for wizard stage
 */
export function isValidWizardStage(stage: unknown): stage is WizardStageType {
  return wizardStageSchema.safeParse(stage).success;
}

/**
 * Type guard for package ID
 */
export function isValidPackageId(id: unknown): id is PackageIdType {
  return packageIdSchema.safeParse(id).success;
}

/**
 * Type guard for wizard state
 */
export function isValidWizardState(state: unknown): state is WizardStateType {
  return wizardStateSchema.safeParse(state).success;
}
