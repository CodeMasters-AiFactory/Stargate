/**
 * Validation Schemas for API Routes
 * Centralized Zod schemas for input validation
 */

import { z } from 'zod';

/**
 * Authentication schemas
 */
export const authSchemas = {
  signup: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_@.-]+$/),
    email: z.string().email().optional(),
    password: z.string().min(6).max(128),
  }),
  
  login: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
};

/**
 * Project config schemas
 */
export const projectConfigSchemas = {
  createProject: z.object({
    projectName: z.string().min(1).max(100),
    projectSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
    industry: z.string().min(1).max(100),
    pagesToGenerate: z.array(z.string()).optional(),
    location: z.object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    services: z.array(z.string()).optional(),
    toneOfVoice: z.string().optional(),
    brandPreferences: z.object({
      colors: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional(),
      style: z.string().optional(),
    }).optional(),
    specialNotes: z.string().max(5000).optional(),
  }),
  
  projectSlug: z.object({
    projectSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  }),
};

/**
 * Website generation schemas
 */
export const generationSchemas = {
  generateV5: z.object({
    projectConfig: projectConfigSchemas.createProject,
    format: z.enum(['html', 'react']).default('html'),
  }),
  
  investigate: z.object({
    projectConfig: projectConfigSchemas.createProject,
    enablePhaseTracking: z.boolean().default(true),
  }),
};

/**
 * Session schemas
 */
export const sessionSchemas = {
  createSession: z.object({
    userId: z.string().min(1).optional(),
    mode: z.enum(['create', 'edit']).default('create'),
  }),
  
  sessionId: z.object({
    id: z.string().min(1),
  }),
};

/**
 * Draft schemas
 */
export const draftSchemas = {
  createDraft: z.object({
    sessionId: z.string().min(1),
    userId: z.string().min(1).optional(),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    template: z.string().optional(),
    requirements: z.record(z.unknown()).optional(),
    code: z.record(z.unknown()).optional(),
  }),
  
  draftId: z.object({
    id: z.string().min(1),
  }),
};

/**
 * Phase report schemas
 */
export const phaseReportSchemas = {
  getReport: z.object({
    projectSlug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    format: z.enum(['markdown', 'json']).optional(),
  }),
};

/**
 * Quick start schemas
 */
export const quickStartSchemas = {
  generate: z.object({
    businessName: z.string().min(1).max(100),
    businessType: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    targetAudience: z.string().min(1).max(500).optional(),
    goals: z.string().min(1).max(500).optional(),
  }),
};

