/**
 * Page Planner Engine
 * Merlin 7.0 - Module 3
 * Plans 5-12 pages depending on business type
 * Creates PlannedPage[] hierarchy with internal linking map
 */

import OpenAI from 'openai';
import type { ProjectConfig } from '../services/projectConfig';
import type { PlannedPage, PageType, InternalLink } from '../types/plannedPage';
import type { IndustryProfile } from './industryEngine';
import { getErrorMessage, logError } from '../utils/errorHandler';

export interface PagePlan {
  pages: PlannedPage[];
  hierarchy: PageHierarchy;
  internalLinks: InternalLink[];
  navigation: NavigationStructure;
}

export interface PageHierarchy {
  root: PlannedPage;
  children: PlannedPage[];
  depth: number;
  breadcrumbs: string[];
}

export interface NavigationStructure {
  primary: NavigationItem[];
  footer: NavigationItem[];
  sidebar?: NavigationItem[];
}

export interface NavigationItem {
  slug: string;
  label: string;
  order: number;
  children?: NavigationItem[];
}

/**
 * Create OpenAI client
 */
function createOpenAIClient(): OpenAI | null {
  if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Generate complete page plan
 */
export async function generatePagePlan(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): Promise<PagePlan> {
  const openai = createOpenAIClient();
  
  if (!openai) {
    return generateFallbackPagePlan(projectConfig, industryProfile);
  }
  
  try {
    const prompt = buildPagePlanPrompt(projectConfig, industryProfile);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a website architecture expert. Plan complete multi-page website structures with proper hierarchy, internal linking, and navigation. Return structured JSON.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const plan = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Convert to PlannedPage[]
    const pages = plan.pages || [];
    const plannedPages: PlannedPage[] = pages.map((p: any, index: number) => ({
      id: p.id || `page-${index}`,
      slug: p.slug || p.id || `page-${index}`,
      title: p.title || 'Page',
      type: (p.type || 'home') as PageType,
      order: p.order || index + 1,
      required: p.required !== false,
      sections: p.sections || [],
      seo: p.seo || generateDefaultSEO(p),
      internalLinks: p.internalLinks || [],
      parent: p.parent,
      children: p.children,
    }));
    
    // Build hierarchy
    const hierarchy = buildPageHierarchy(plannedPages);
    
    // Generate internal links
    const internalLinks = generateInternalLinks(plannedPages);
    
    // Build navigation
    const navigation = buildNavigation(plannedPages);
    
    return {
      pages: plannedPages,
      hierarchy,
      internalLinks,
      navigation,
    };
  } catch (error: unknown) {
    logError(error, 'Page Planner');
    return generateFallbackPagePlan(projectConfig, industryProfile);
  }
}

/**
 * Build page plan prompt
 */
function buildPagePlanPrompt(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): string {
  return `Plan a complete multi-page website structure:

BUSINESS:
- Name: ${projectConfig.projectName}
- Industry: ${projectConfig.industry}
- Archetype: ${industryProfile.archetype}
- Services: ${projectConfig.services.map(s => s.name).join(', ')}
- Location: ${projectConfig.location.city}, ${projectConfig.location.region}
- Target Audience: ${projectConfig.targetAudiences.join(', ')}
- Tone: ${projectConfig.toneOfVoice}

TASK:
1. Plan 5-12 pages based on business type and archetype
2. Include: Home, About, Services, Contact (always required)
3. Add industry-specific pages (Portfolio, Blog, Pricing, Bookings, FAQ, Legal)
4. Create proper page hierarchy
5. Plan internal linking strategy
6. Design navigation structure (primary, footer, optional sidebar)

OUTPUT JSON:
{
  "pages": [
    {
      "id": "home",
      "slug": "home",
      "title": "Home",
      "type": "home",
      "order": 1,
      "required": true,
      "sections": [
        {"id": "hero", "type": "hero", "order": 1, "required": true},
        {"id": "features", "type": "features", "order": 2, "required": false}
      ],
      "seo": {
        "title": "Page Title",
        "description": "Page description",
        "keywords": ["keyword1", "keyword2"],
        "h1": "Main Heading",
        "headings": [],
        "canonical": "/page-slug",
        "og": {...},
        "twitter": {...},
        "schema": {...}
      },
      "internalLinks": [],
      "parent": null,
      "children": []
    }
  ],
  "hierarchy": {
    "root": {...},
    "children": [...],
    "depth": 1,
    "breadcrumbs": []
  },
  "internalLinks": [
    {
      "from": "home",
      "to": "services",
      "anchor": null,
      "text": "Our Services",
      "type": "navigation"
    }
  ],
  "navigation": {
    "primary": [...],
    "footer": [...]
  }
}`;
}

/**
 * Generate fallback page plan
 */
function generateFallbackPagePlan(
  projectConfig: ProjectConfig,
  industryProfile: IndustryProfile
): PagePlan {
  const pages: PlannedPage[] = [];
  
  // Always include these
  pages.push(createPage('home', 'Home', 'home', 1, true));
  pages.push(createPage('about', 'About Us', 'about', 2, true));
  if (projectConfig.services.length > 0) {
    pages.push(createPage('services', 'Our Services', 'services', 3, true));
  }
  pages.push(createPage('contact', 'Contact', 'contact', 4, true));
  
  // Industry-specific pages
  const archetype = industryProfile.archetype;
  if (archetype === 'portfolio' || archetype === 'saas') {
    pages.push(createPage('portfolio', 'Portfolio', 'portfolio', 5, false));
  }
  if (archetype === 'blog' || archetype === 'saas') {
    pages.push(createPage('blog', 'Blog', 'blog', 6, false));
  }
  if (archetype === 'saas' || archetype === 'e-commerce') {
    pages.push(createPage('pricing', 'Pricing', 'pricing', 7, false));
  }
  
  // Legal pages
  pages.push(createPage('privacy', 'Privacy Policy', 'legal', 8, false));
  pages.push(createPage('terms', 'Terms of Service', 'legal', 9, false));
  
  // FAQ
  pages.push(createPage('faq', 'FAQ', 'faq', 10, false));
  
  // Build hierarchy
  const hierarchy = buildPageHierarchy(pages);
  
  // Generate internal links
  const internalLinks = generateInternalLinks(pages);
  
  // Build navigation
  const navigation = buildNavigation(pages);
  
  return {
    pages,
    hierarchy,
    internalLinks,
    navigation,
  };
}

/**
 * Create a planned page with appropriate sections based on page type
 */
function createPage(
  id: string,
  title: string,
  type: PageType,
  order: number,
  required: boolean
): PlannedPage {
  // Generate sections based on page type
  const sections: PlannedSection[] = [];
  
  if (type === 'home') {
    sections.push(
      { id: 'hero', type: 'hero', order: 1, required: true, content: {} },
      { id: 'services', type: 'services', order: 2, required: false, content: {} },
      { id: 'features', type: 'features', order: 3, required: false, content: {} }
    );
  } else if (type === 'about') {
    sections.push(
      { id: 'hero', type: 'hero', order: 1, required: true, content: {} },
      { id: 'about', type: 'about', order: 2, required: true, content: {} },
      { id: 'values', type: 'features', order: 3, required: false, content: {} }
    );
  } else if (type === 'services') {
    sections.push(
      { id: 'hero', type: 'hero', order: 1, required: true, content: {} },
      { id: 'services', type: 'services', order: 2, required: true, content: {} }
    );
  } else if (type === 'contact') {
    sections.push(
      { id: 'hero', type: 'hero', order: 1, required: true, content: {} },
      { id: 'contact', type: 'contact', order: 2, required: true, content: {} }
    );
  } else {
    // Default: just a hero section
    sections.push({ id: 'hero', type: 'hero', order: 1, required: true, content: {} });
  }
  
  return {
    id,
    slug: id,
    title,
    type,
    order,
    required,
    sections, // Return the generated sections
    seo: generateDefaultSEO({ id, title, type }),
    internalLinks: [],
  };
}

/**
 * Build page hierarchy
 */
function buildPageHierarchy(pages: PlannedPage[]): PageHierarchy {
  const root = pages.find(p => p.type === 'home') || pages[0];
  const children = pages.filter(p => p.id !== root.id);
  
  return {
    root,
    children,
    depth: 1,
    breadcrumbs: [],
  };
}

/**
 * Generate internal links
 */
function generateInternalLinks(pages: PlannedPage[]): InternalLink[] {
  const links: InternalLink[] = [];
  const home = pages.find(p => p.type === 'home');
  
  if (home) {
    // Link from home to all other pages
    pages
      .filter(p => p.id !== home.id && p.required)
      .forEach(page => {
        links.push({
          from: home.id,
          to: page.id,
          text: page.title,
          type: 'navigation',
        });
      });
  }
  
  // Link from services to contact
  const services = pages.find(p => p.type === 'services');
  const contact = pages.find(p => p.type === 'contact');
  if (services && contact) {
    links.push({
      from: services.id,
      to: contact.id,
      text: 'Get in Touch',
      type: 'cta',
    });
  }
  
  return links;
}

/**
 * Build navigation structure
 */
function buildNavigation(pages: PlannedPage[]): NavigationStructure {
  const requiredPages = pages.filter(p => p.required).sort((a, b) => a.order - b.order);
  
  const primary: NavigationItem[] = requiredPages.map(p => ({
    slug: p.slug,
    label: p.title,
    order: p.order,
  }));
  
  const footer: NavigationItem[] = pages
    .filter(p => !p.required || p.type === 'legal')
    .sort((a, b) => a.order - b.order)
    .map(p => ({
      slug: p.slug,
      label: p.title,
      order: p.order,
    }));
  
  return {
    primary,
    footer,
  };
}

/**
 * Generate default SEO for a page
 */
function generateDefaultSEO(page: { id: string; title: string; type: PageType }): PlannedPage['seo'] {
  return {
    title: `${page.title} | ${page.id}`,
    description: `${page.title} page`,
    keywords: [],
    h1: page.title,
    headings: [],
    canonical: `/${page.id}`,
    og: {
      title: page.title,
      description: `${page.title} page`,
      image: '',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: `${page.title} page`,
      image: '',
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
    },
  };
}

