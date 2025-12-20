/**
 * Planned Page Types
 * Merlin 7.0 - Multi-Page Planner Engine
 */

export interface PlannedPage {
  id: string;
  slug: string;
  title: string;
  type: PageType;
  order: number;
  required: boolean;
  sections: PlannedSection[];
  seo: PageSEO;
  internalLinks: InternalLink[];
  parent?: string; // For hierarchical pages
  children?: string[]; // For hierarchical pages
}

export type PageType =
  | 'home'
  | 'about'
  | 'services'
  | 'contact'
  | 'legal'
  | 'faq'
  | 'portfolio'
  | 'blog'
  | 'pricing'
  | 'bookings'
  | 'testimonials'
  | 'careers';

export interface PlannedSection {
  id: string;
  type: string;
  order: number;
  required: boolean;
  content: {
    headline?: string;
    subheadline?: string;
    description?: string;
    items?: SectionItem[];
  };
  cta?: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
}

export interface SectionItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  headings: SEOHeading[];
  canonical: string;
  og: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schema: SchemaMarkup;
}

export interface SEOHeading {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface InternalLink {
  from: string; // Page slug
  to: string; // Page slug
  anchor?: string; // Section ID
  text: string; // Link text
  type: 'navigation' | 'cta' | 'content' | 'footer';
}

export interface PageHierarchy {
  root: PlannedPage;
  children: PlannedPage[];
  depth: number;
  breadcrumbs: string[];
}

