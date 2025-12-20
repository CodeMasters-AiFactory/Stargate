/**
 * Merlin v6.8 - Multi-Page Planner
 * Plans which sections belong to which pages based on industry and section types
 */

import type { LayoutPlan, SectionPlan } from '../ai/layoutPlannerLLM';
import type { DesignContext } from './designThinking';

export interface PlannedPage {
  id: string;              // "home", "about", "services", "contact"
  slug: string;            // "/", "/about", "/services", "/contact"
  title: string;           // Display in nav
  sectionKeys: string[];  // Which sections belong to this page
  seoTitle?: string;       // Page-specific SEO title
  seoDescription?: string; // Page-specific SEO description
}

/**
 * Plan pages based on industry and section plan
 */
export function planPages(
  sectionPlan: LayoutPlan,
  designContext: DesignContext
): PlannedPage[] {
  const industry = designContext.industry?.toLowerCase() || 'business';
  const pages: PlannedPage[] = [];
  
  // HOME page always exists with hero section
  const homeSections: string[] = [];
  const aboutSections: string[] = [];
  const servicesSections: string[] = [];
  const contactSections: string[] = [];
  const featuresSections: string[] = [];
  const pricingSections: string[] = [];
  const missionSections: string[] = [];
  const projectsSections: string[] = [];
  
  // Categorize sections by type
  for (const section of sectionPlan.sections) {
    const sectionKey = section.key;
    const sectionType = section.type.toLowerCase();
    
    // Hero always goes to home
    if (sectionType === 'hero') {
      homeSections.push(sectionKey);
    }
    // About sections go to about page
    else if (sectionType === 'about' || sectionType.includes('about')) {
      aboutSections.push(sectionKey);
    }
    // Features/services go to services or features page
    else if (sectionType === 'features' || sectionType === 'services' || sectionType.includes('service') || sectionType.includes('feature')) {
      if (industry.includes('saas') || industry.includes('software') || industry.includes('app')) {
        featuresSections.push(sectionKey);
      } else {
        servicesSections.push(sectionKey);
      }
    }
    // Pricing goes to pricing page (SaaS) or services page
    else if (sectionType === 'pricing') {
      if (industry.includes('saas') || industry.includes('software')) {
        pricingSections.push(sectionKey);
      } else {
        servicesSections.push(sectionKey);
      }
    }
    // Contact/CTA go to contact page
    else if (sectionType === 'contact' || sectionType === 'cta' || sectionType.includes('contact')) {
      contactSections.push(sectionKey);
    }
    // Testimonials, FAQ, value prop go to home
    else if (sectionType === 'testimonials' || sectionType === 'faq' || sectionType === 'value-proposition') {
      homeSections.push(sectionKey);
    }
    // Mission sections (nonprofits)
    else if (sectionType.includes('mission') || sectionType.includes('vision')) {
      missionSections.push(sectionKey);
    }
    // Projects sections (nonprofits)
    else if (sectionType.includes('project') || sectionType.includes('program')) {
      projectsSections.push(sectionKey);
    }
    // Default: add to home
    else {
      homeSections.push(sectionKey);
    }
  }
  
  // Always create HOME page
  pages.push({
    id: 'home',
    slug: '/',
    title: 'Home',
    sectionKeys: homeSections.length > 0 ? homeSections : [sectionPlan.sections[0]?.key || 'hero-1']
  });
  
  // Industry-specific pages
  if (industry.includes('saas') || industry.includes('software') || industry.includes('app') || industry.includes('platform')) {
    // SaaS: home, features, pricing, contact
    if (featuresSections.length > 0) {
      pages.push({
        id: 'features',
        slug: '/features',
        title: 'Features',
        sectionKeys: featuresSections
      });
    }
    if (pricingSections.length > 0) {
      pages.push({
        id: 'pricing',
        slug: '/pricing',
        title: 'Pricing',
        sectionKeys: pricingSections
      });
    }
  } else if (industry.includes('law') || industry.includes('legal') || industry.includes('attorney') || industry.includes('consulting')) {
    // Law/Consulting: home, services, about, contact
    if (servicesSections.length > 0) {
      pages.push({
        id: 'services',
        slug: '/services',
        title: 'Services',
        sectionKeys: servicesSections
      });
    }
    if (aboutSections.length > 0) {
      pages.push({
        id: 'about',
        slug: '/about',
        title: 'About',
        sectionKeys: aboutSections
      });
    }
  } else if (industry.includes('nonprofit') || industry.includes('ngo') || industry.includes('foundation') || industry.includes('institute') || industry.includes('research')) {
    // Nonprofit: home, mission, projects, contact
    if (missionSections.length > 0) {
      pages.push({
        id: 'mission',
        slug: '/mission',
        title: 'Mission',
        sectionKeys: missionSections
      });
    }
    if (projectsSections.length > 0) {
      pages.push({
        id: 'projects',
        slug: '/projects',
        title: 'Projects',
        sectionKeys: projectsSections
      });
    }
    if (aboutSections.length > 0) {
      pages.push({
        id: 'about',
        slug: '/about',
        title: 'About',
        sectionKeys: aboutSections
      });
    }
  } else {
    // Default business: home, services, about, contact
    if (servicesSections.length > 0) {
      pages.push({
        id: 'services',
        slug: '/services',
        title: 'Services',
        sectionKeys: servicesSections
      });
    }
    if (aboutSections.length > 0) {
      pages.push({
        id: 'about',
        slug: '/about',
        title: 'About',
        sectionKeys: aboutSections
      });
    }
  }
  
  // Contact page (always add if we have contact sections or if it's a standard business)
  if (contactSections.length > 0 || (!industry.includes('saas') && !industry.includes('nonprofit'))) {
    pages.push({
      id: 'contact',
      slug: '/contact',
      title: 'Contact',
      sectionKeys: contactSections.length > 0 ? contactSections : []
    });
  }
  
  // Ensure each page has at least one section (fallback to first section if empty)
  for (const page of pages) {
    if (page.sectionKeys.length === 0 && sectionPlan.sections.length > 0) {
      page.sectionKeys = [sectionPlan.sections[0].key];
    }
  }
  
  // Limit sections per page (max 5)
  for (const page of pages) {
    if (page.sectionKeys.length > 5) {
      page.sectionKeys = page.sectionKeys.slice(0, 5);
    }
  }
  
  console.log(`[Merlin 6.8] Planned ${pages.length} pages: ${pages.map(p => p.id).join(', ')}`);
  return pages;
}











