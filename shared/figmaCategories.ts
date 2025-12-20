/**
 * Figma-Style Template Categories
 * 
 * These categories match Figma's community template organization
 * Focus on design quality, not rankings
 */

export type FigmaCategory = 
  | 'web-design'
  | 'mobile'
  | 'presentation'
  | 'social-media'
  | 'print'
  | 'wireframe'
  | 'ui-kit'
  | 'icon'
  | 'illustration'
  | 'branding'
  | 'dashboard'
  | 'landing-page'
  | 'ecommerce'
  | 'portfolio'
  | 'blog'
  | 'saas'
  | 'agency'
  | 'restaurant'
  | 'healthcare'
  | 'education'
  | 'real-estate'
  | 'fitness'
  | 'travel'
  | 'music'
  | 'photography'
  | 'wedding'
  | 'nonprofit'
  | 'personal'
  | 'corporate'
  | 'startup';

export const FIGMA_CATEGORIES: { id: FigmaCategory; name: string; description: string }[] = [
  { id: 'web-design', name: 'Web Design', description: 'Complete website designs and layouts' },
  { id: 'mobile', name: 'Mobile', description: 'Mobile app designs and interfaces' },
  { id: 'presentation', name: 'Presentation', description: 'Presentation templates and slides' },
  { id: 'social-media', name: 'Social Media', description: 'Social media posts and graphics' },
  { id: 'print', name: 'Print', description: 'Print-ready designs and layouts' },
  { id: 'wireframe', name: 'Wireframe', description: 'Low-fidelity wireframes and prototypes' },
  { id: 'ui-kit', name: 'UI Kit', description: 'Component libraries and design systems' },
  { id: 'icon', name: 'Icon', description: 'Icon sets and iconography' },
  { id: 'illustration', name: 'Illustration', description: 'Illustrations and graphics' },
  { id: 'branding', name: 'Branding', description: 'Brand identity and logo designs' },
  { id: 'dashboard', name: 'Dashboard', description: 'Admin dashboards and data visualization' },
  { id: 'landing-page', name: 'Landing Page', description: 'Landing page designs' },
  { id: 'ecommerce', name: 'E-commerce', description: 'Online store designs' },
  { id: 'portfolio', name: 'Portfolio', description: 'Portfolio and showcase websites' },
  { id: 'blog', name: 'Blog', description: 'Blog and content website designs' },
  { id: 'saas', name: 'SaaS', description: 'Software as a service website designs' },
  { id: 'agency', name: 'Agency', description: 'Agency and creative studio websites' },
  { id: 'restaurant', name: 'Restaurant', description: 'Restaurant and food service websites' },
  { id: 'healthcare', name: 'Healthcare', description: 'Healthcare and medical websites' },
  { id: 'education', name: 'Education', description: 'Educational institution websites' },
  { id: 'real-estate', name: 'Real Estate', description: 'Real estate and property websites' },
  { id: 'fitness', name: 'Fitness', description: 'Fitness and gym websites' },
  { id: 'travel', name: 'Travel', description: 'Travel and tourism websites' },
  { id: 'music', name: 'Music', description: 'Music and entertainment websites' },
  { id: 'photography', name: 'Photography', description: 'Photography portfolio websites' },
  { id: 'wedding', name: 'Wedding', description: 'Wedding and event websites' },
  { id: 'nonprofit', name: 'Nonprofit', description: 'Nonprofit and charity websites' },
  { id: 'personal', name: 'Personal', description: 'Personal and portfolio websites' },
  { id: 'corporate', name: 'Corporate', description: 'Corporate business websites' },
  { id: 'startup', name: 'Startup', description: 'Startup and tech company websites' },
];

export function getCategoryName(categoryId: FigmaCategory): string {
  return FIGMA_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
}

export function getCategoryDescription(categoryId: FigmaCategory): string {
  return FIGMA_CATEGORIES.find(c => c.id === categoryId)?.description || '';
}

