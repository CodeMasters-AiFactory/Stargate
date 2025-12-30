/**
 * SEO Research & Optimization Engine
 * Generates SEO meta, titles, headings, and schema markup per page
 */

import type { ProjectConfig } from './projectConfig';
import type { PageContent, HomePageContent, ServicesPageContent, AboutPageContent, ContactPageContent } from './contentEngine';
import * as fs from 'fs';
import * as path from 'path';
import { getProjectDir } from './projectConfig';
import { generateSchemaMarkup } from './seoOptimization';

export interface PageSEO {
  title: string; // 50-60 chars, includes location + service
  metaDescription: string; // 150-165 chars, includes CTA
  canonicalUrl: string;
  h1: string; // One per page, keyword-rich
  headings: Array<{
    level: 2 | 3;
    text: string;
    keywords: string[];
  }>;
  keywords: string[];
  schema: string; // JSON-LD schema markup
}

/**
 * Generate SEO data for a page
 */
export function generatePageSEO(
  config: ProjectConfig,
  pageType: 'home' | 'services' | 'about' | 'contact',
  content: PageContent
): PageSEO {
  const location = `${config.location.city}, ${config.location.region}`;
  const baseUrl = `https://${config.projectSlug}.com`; // Placeholder
  
  // Generate primary keywords
  const primaryKeywords = [
    config.industry.toLowerCase(),
    config.location.city.toLowerCase(),
    ...config.services.map(s => s.name.toLowerCase())
  ];
  
  let seo: PageSEO;
  
  switch (pageType) {
    case 'home':
      seo = generateHomePageSEO(config, content as HomePageContent, location, baseUrl, primaryKeywords);
      break;
    case 'services':
      seo = generateServicesPageSEO(config, content as ServicesPageContent, location, baseUrl, primaryKeywords);
      break;
    case 'about':
      seo = generateAboutPageSEO(config, content as AboutPageContent, location, baseUrl, primaryKeywords);
      break;
    case 'contact':
      seo = generateContactPageSEO(config, content as ContactPageContent, location, baseUrl, primaryKeywords);
      break;
    default:
      throw new Error(`Unknown page type: ${pageType}`);
  }
  
  return seo;
}

/**
 * Generate home page SEO
 */
function generateHomePageSEO(
  config: ProjectConfig,
  content: HomePageContent,
  location: string,
  baseUrl: string,
  keywords: string[]
): PageSEO {
  const title = `${config.industry} in ${config.location.city} | ${config.projectName}`;
  const metaDescription = `${config.projectName} is a ${config.industry.toLowerCase()} in ${location} helping ${config.targetAudiences.join(' and ')} with ${config.services.map(s => s.name.toLowerCase()).join(', ')}. Book a consultation today.`;
  
  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: metaDescription.length > 165 ? metaDescription.substring(0, 162) + '...' : metaDescription,
    canonicalUrl: baseUrl,
    h1: content.hero.h1,
    headings: extractHeadingsFromContent(content, keywords),
    keywords: keywords,
    schema: generateSchemaMarkup('LocalBusiness', {
      name: config.projectName,
      description: metaDescription,
      url: baseUrl,
      address: {
        street: '[STREET ADDRESS]',
        city: config.location.city,
        state: config.location.region,
        zip: '[POSTAL CODE]',
        country: config.location.country
      },
      phone: '[PHONE NUMBER]',
      priceRange: '$$'
    })
  };
}

/**
 * Generate services page SEO
 */
function generateServicesPageSEO(
  config: ProjectConfig,
  content: ServicesPageContent,
  location: string,
  baseUrl: string,
  keywords: string[]
): PageSEO {
  const title = `${config.industry} Services in ${config.location.city} | ${config.projectName}`;
  const metaDescription = `Comprehensive ${config.industry.toLowerCase()} services in ${location}: ${config.services.map(s => s.name.toLowerCase()).join(', ')}. Experienced professionals ready to help.`;
  
  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: metaDescription.length > 165 ? metaDescription.substring(0, 162) + '...' : metaDescription,
    canonicalUrl: `${baseUrl}/services`,
    h1: content.intro.h1,
    headings: extractHeadingsFromContent(content, keywords),
    keywords: keywords,
    schema: generateSchemaMarkup('LocalBusiness', {
      name: `${config.industry} Services`,
      description: metaDescription,
      url: `${baseUrl}/services`,
      address: {
        city: config.location.city,
        state: config.location.region
      }
    })
  };
}

/**
 * Generate about page SEO
 */
function generateAboutPageSEO(
  config: ProjectConfig,
  content: AboutPageContent,
  location: string,
  baseUrl: string,
  keywords: string[]
): PageSEO {
  const title = `About ${config.projectName} | ${config.industry} in ${config.location.city}`;
  const metaDescription = `Learn about ${config.projectName}, a trusted ${config.industry.toLowerCase()} in ${location} providing ${config.services.map(s => s.name.toLowerCase()).join(', ')} services.`;
  
  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: metaDescription.length > 165 ? metaDescription.substring(0, 162) + '...' : metaDescription,
    canonicalUrl: `${baseUrl}/about`,
    h1: content.hero.h1,
    headings: extractHeadingsFromContent(content, keywords),
    keywords: keywords,
    schema: generateSchemaMarkup('Organization', {
      name: config.projectName,
      description: metaDescription,
      url: baseUrl,
      address: {
        city: config.location.city,
        state: config.location.region
      }
    })
  };
}

/**
 * Generate contact page SEO
 */
function generateContactPageSEO(
  config: ProjectConfig,
  content: ContactPageContent,
  location: string,
  baseUrl: string,
  keywords: string[]
): PageSEO {
  const title = `Contact ${config.projectName} | Book a Consultation in ${config.location.city}`;
  const metaDescription = `Contact ${config.projectName} in ${location}. Book a confidential consultation for ${config.services.map(s => s.name.toLowerCase()).join(' or ')} matters. Call, email or use our contact form.`;
  
  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    metaDescription: metaDescription.length > 165 ? metaDescription.substring(0, 162) + '...' : metaDescription,
    canonicalUrl: `${baseUrl}/contact`,
    h1: content.intro.h1,
    headings: extractHeadingsFromContent(content, keywords),
    keywords: keywords,
    schema: generateSchemaMarkup('WebSite', {
      name: config.projectName,
      url: `${baseUrl}/contact`
    })
  };
}

/**
 * Extract headings from content structure
 */
function extractHeadingsFromContent(content: HomePageContent | ServicesPageContent | AboutPageContent | ContactPageContent, keywords: string[]): Array<{ level: 2 | 3; text: string; keywords: string[] }> {
  const headings: Array<{ level: 2 | 3; text: string; keywords: string[] }> = [];

  // Extract H2s from content structure based on page type
  if ('whoWeServe' in content && content.whoWeServe?.title) headings.push({ level: 2, text: content.whoWeServe.title, keywords });
  if ('keyServices' in content && content.keyServices?.title) headings.push({ level: 2, text: content.keyServices.title, keywords });
  if ('differentiators' in content && content.differentiators?.title) headings.push({ level: 2, text: content.differentiators.title, keywords });
  if ('outcomes' in content && content.outcomes?.title) headings.push({ level: 2, text: content.outcomes.title, keywords });
  if ('aboutTeaser' in content && content.aboutTeaser?.title) headings.push({ level: 2, text: content.aboutTeaser.title, keywords });
  if ('howItWorks' in content && content.howItWorks?.title) headings.push({ level: 2, text: content.howItWorks.title, keywords });
  if ('faq' in content && content.faq?.title) headings.push({ level: 2, text: content.faq.title, keywords });
  if ('finalCTA' in content && content.finalCTA?.heading) headings.push({ level: 2, text: content.finalCTA.heading, keywords });
  if ('cta' in content && content.cta?.heading) headings.push({ level: 2, text: content.cta.heading, keywords });
  if ('story' in content && content.story?.title) headings.push({ level: 2, text: content.story.title, keywords });
  if ('values' in content && content.values?.title) headings.push({ level: 2, text: content.values.title, keywords });
  if ('team' in content && content.team?.title) headings.push({ level: 2, text: content.team.title, keywords });
  if ('standards' in content && content.standards?.title) headings.push({ level: 2, text: content.standards.title, keywords });
  if ('highlights' in content && content.highlights?.title) headings.push({ level: 2, text: content.highlights.title, keywords });
  if ('overview' in content && content.overview?.title) headings.push({ level: 2, text: content.overview.title, keywords });
  if ('contactOptions' in content && content.contactOptions?.title) headings.push({ level: 2, text: content.contactOptions.title, keywords });
  if ('form' in content && content.form?.title) headings.push({ level: 2, text: content.form.title, keywords });

  return headings;
}

/**
 * Save SEO data to file
 */
export function savePageSEO(projectSlug: string, pageType: string, seo: PageSEO): void {
  const projectDir = getProjectDir(projectSlug);
  const seoDir = path.join(projectDir, 'seo');
  
  if (!fs.existsSync(seoDir)) {
    fs.mkdirSync(seoDir, { recursive: true });
  }
  
  const seoPath = path.join(seoDir, `${pageType}.json`);
  fs.writeFileSync(seoPath, JSON.stringify(seo, null, 2), 'utf-8');
}

/**
 * Load SEO data from file
 */
export function loadPageSEO(projectSlug: string, pageType: string): PageSEO | null {
  const seoPath = path.join(getProjectDir(projectSlug), 'seo', `${pageType}.json`);
  
  if (!fs.existsSync(seoPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(seoPath, 'utf-8');
    return JSON.parse(content) as PageSEO;
  } catch (_error) {
    console.error(`Error loading ${pageType} SEO for ${projectSlug}:`, _error);
    return null;
  }
}

