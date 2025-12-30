/**
 * Project Configuration Service
 * Manages project setup and configuration for Merlin Website Wizard
 */

import fs from 'fs';
import path from 'path';

export interface ProjectConfig {
  projectName: string;
  projectSlug: string;
  industry: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  targetAudiences: string[];
  toneOfVoice: string;
  brandPreferences?: {
    colorPalette?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fontPreferences?: {
      heading?: string;
      body?: string;
    };
    colorPreset?: string;
    font?: string;
    style?: string;
    tone?: string;
  };
  services: Array<{
    name: string;
    shortDescription: string;
  }>;
  pagesToGenerate: string[];
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Extended properties for phase tracking
  packageType?: string;
  projectOverview?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  address?: string;
  contentTone?: string;
  contentStyle?: string;
  competitors?: string[];
  inspirationalSites?: string[];
  visualAssets?: string[];
  logo?: string;
  seoData?: {
    keywords?: string[];
    metaDescription?: string;
  };
  contentData?: {
    heroHeadline?: string;
    heroSubheadline?: string;
    aboutContent?: string;
  };
}

/**
 * Generate project slug from project name
 */
export function generateProjectSlug(projectName: string): string {
  return projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get project directory path
 */
export function getProjectDir(projectSlug: string): string {
  return path.join(process.cwd(), 'website_projects', projectSlug);
}

/**
 * Ensure project directory exists
 */
export function ensureProjectDir(projectSlug: string): string {
  const projectDir = getProjectDir(projectSlug);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
  
  // Create subdirectories
  const subdirs = ['content', 'seo', 'images', 'analysis', 'output'];
  for (const subdir of subdirs) {
    const subdirPath = path.join(projectDir, subdir);
    if (!fs.existsSync(subdirPath)) {
      fs.mkdirSync(subdirPath, { recursive: true });
    }
  }
  
  return projectDir;
}

/**
 * Save project configuration
 */
export function saveProjectConfig(config: ProjectConfig): void {
  const projectDir = ensureProjectDir(config.projectSlug);
  const configPath = path.join(projectDir, 'project-config.json');
  
  const configWithTimestamps = {
    ...config,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configWithTimestamps, null, 2), 'utf-8');
}

/**
 * Load project configuration
 */
export function loadProjectConfig(projectSlug: string): ProjectConfig | null {
  const configPath = path.join(getProjectDir(projectSlug), 'project-config.json');
  
  if (!fs.existsSync(configPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as ProjectConfig;
  } catch (error) {
    console.error(`Error loading project config for ${projectSlug}:`, error);
    return null;
  }
}

/**
 * Create new project configuration
 */
export function createProjectConfig(
  projectName: string,
  industry: string,
  location: { city: string; region: string; country: string },
  targetAudiences: string[],
  toneOfVoice: string,
  services: Array<{ name: string; shortDescription: string }>,
  pagesToGenerate: string[],
  brandPreferences?: ProjectConfig['brandPreferences'],
  specialNotes?: string
): ProjectConfig {
  const projectSlug = generateProjectSlug(projectName);
  const now = new Date().toISOString();
  
  const config: ProjectConfig = {
    projectName,
    projectSlug,
    industry,
    location,
    targetAudiences,
    toneOfVoice,
    brandPreferences,
    services,
    pagesToGenerate,
    specialNotes,
    createdAt: now,
    updatedAt: now
  };
  
  ensureProjectDir(projectSlug);
  saveProjectConfig(config);
  
  return config;
}

/**
 * List all projects
 */
export function listProjects(): string[] {
  const projectsDir = path.join(process.cwd(), 'website_projects');
  
  if (!fs.existsSync(projectsDir)) {
    return [];
  }
  
  return fs.readdirSync(projectsDir).filter(item => {
    const itemPath = path.join(projectsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
}

