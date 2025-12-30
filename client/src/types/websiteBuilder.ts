import type { BrandTemplate } from './templates';

export type WizardStage =
  // Legacy stages (deprecated but kept for compatibility)
  | 'mode-select'
  | 'discover'
  | 'define'
  | 'ecommerce'
  | 'confirm'
  | 'research'
  | 'commit'
  // NEW 4-PHASE WORKFLOW (with Quick Business Form)
  | 'package-select'       // Phase 1: Choose Package
  | 'template-select'      // Phase 2: Design Template Selection (LOOK/Layout)
  | 'quick-form'           // Phase 3: Quick Business Form (4-5 questions)
  | 'final-website'        // Phase 4: Display final website with auto-build progress
  // Deprecated phases (removed from workflow, kept for compatibility)
  | 'keywords-collection'  // REMOVED: Old Phase 3
  | 'content-rewriting'    // REMOVED: Old Phase 3/4
  | 'image-generation'     // REMOVED: Old Phase 4/5
  | 'seo-assessment'       // REMOVED: Old Phase 5/6
  | 'review-redo'          // REMOVED: Old Phase 6/7
  | 'final-approval'       // REMOVED: Approval phase
  | 'empty-preview'        // DEPRECATED: Old empty preview
  | 'content-select'       // DEPRECATED: Old content template selection
  | 'client-info'          // DEPRECATED: Old client info collection
  | 'merge-preview'        // DEPRECATED: Old merge preview
  | 'ai-generation'        // DEPRECATED: Legacy AI Website Generation
  | 'review-redesign'      // DEPRECATED: Review & Redesign
  | 'seo-evaluation'       // DEPRECATED: SEO Expert Evaluation
  // Legacy investigation stages (deprecated)
  | 'requirements'
  | 'content-quality'
  | 'keywords-semantic-seo'
  | 'technical-seo'
  | 'core-web-vitals'
  | 'structure-navigation'
  | 'mobile-optimization'
  | 'visual-quality'
  | 'image-media-quality'
  | 'local-seo'
  | 'trust-signals'
  | 'schema-structured-data'
  | 'on-page-seo-structure'
  | 'security'
  | 'build'
  | 'review';

export type PackageId = 'basic' | 'advanced' | 'seo' | 'deluxe' | 'ultra' | 'custom';

export interface PackageConstraints {
  maxPages: number;
  maxServices: number;
  includesCompetitorResearch: boolean;
  includesAdvancedSEO: boolean;
  includesCustomDesign: boolean;
  includesAutomatedMaintenance: boolean;
}

export const PACKAGE_CONSTRAINTS: Record<PackageId, PackageConstraints> = {
  basic: {
    maxPages: 1,
    maxServices: 3,
    includesCompetitorResearch: false,
    includesAdvancedSEO: false,
    includesCustomDesign: false,
    includesAutomatedMaintenance: false,
  },
  advanced: {
    maxPages: 5,
    maxServices: 8,
    includesCompetitorResearch: true,
    includesAdvancedSEO: false,
    includesCustomDesign: true,
    includesAutomatedMaintenance: false,
  },
  seo: {
    maxPages: 10,
    maxServices: 15,
    includesCompetitorResearch: true,
    includesAdvancedSEO: true,
    includesCustomDesign: true,
    includesAutomatedMaintenance: false,
  },
  deluxe: {
    maxPages: 20,
    maxServices: 25,
    includesCompetitorResearch: true,
    includesAdvancedSEO: true,
    includesCustomDesign: true,
    includesAutomatedMaintenance: true,
  },
  ultra: {
    maxPages: 50,
    maxServices: 50,
    includesCompetitorResearch: true,
    includesAdvancedSEO: true,
    includesCustomDesign: true,
    includesAutomatedMaintenance: true,
  },
  custom: {
    maxPages: 100,
    maxServices: 100,
    includesCompetitorResearch: true,
    includesAdvancedSEO: true,
    includesCustomDesign: true,
    includesAutomatedMaintenance: true,
  },
};
export type DiscoveryPage =
  | 'project-overview'
  | 'business-details'
  | 'services'
  | 'branding'
  | 'content'
  | 'competitors'
  | 'visual-assets'
  | 'location-social'
  | 'preferences';

// Client Checklist System Types
export type ChecklistCategory =
  | 'business-essentials'
  | 'services-products'
  | 'branding'
  | 'content'
  | 'features'
  | 'seo-marketing'
  | 'visual-assets'
  | 'location-social'
  | 'goals-preferences';

export interface ChecklistItem {
  id: string;
  label: string;
  category: ChecklistCategory;
  mapsTo: keyof WebsiteRequirements | (keyof WebsiteRequirements)[];
  required: boolean;
  packageRequired?: PackageId[];
  hint?: string;
  autoFillValue?: unknown;
}

export interface ChecklistState {
  [category: string]: {
    [itemId: string]: boolean;
  };
}

export interface InvestigationResults {
  keywords: string[];
  competitorInsights: Array<{
    url: string;
    strengths: string[];
    weaknesses: string[];
    keywords: string[];
  }>;
  contentStrategy: {
    hero: string;
    sections: Array<{
      title: string;
      content: string;
      seoKeywords: string[];
    }>;
  };
  designRecommendations: {
    colorScheme: { primary: string; accent: string; reasoning: string };
    typography: { heading: string; body: string; reasoning: string };
    layout: string;
  };
  seoStrategy: {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    contentGaps: string[];
    recommendations: string[];
  };
}

export interface BuildBlock {
  id: string;
  type:
    | 'skeleton'
    | 'css'
    | 'header'
    | 'hero'
    | 'features'
    | 'about'
    | 'gallery'
    | 'contact'
    | 'footer';
  name: string;
  target: string; // comment anchor like <!-- HEADER_INSERT -->
  content: string; // HTML/CSS to inject
  placeholder?: string; // skeleton HTML shown while building
  estimatedTime?: number; // milliseconds to simulate
}

// E-Commerce Product
export interface EcommerceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  sku?: string;
  inventory?: {
    quantity: number;
    trackQuantity: boolean;
  };
  variants?: Array<{
    id: string;
    name: string;
    price: number;
    sku?: string;
  }>;
}

// Comprehensive Requirements (based on specification document)
export interface ComprehensiveRequirements {
  // Build Mode
  buildMode?: 'auto' | 'manual';

  // E-Commerce
  enableEcommerce?: boolean;
  products?: EcommerceProduct[];
  paymentMethods?: ('stripe' | 'paypal')[];

  // Project Overview
  projectOverview?: string;
  expandedBrief?: string; // AI-refined version

  // Business Information
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  domainStatus?: 'have_domain' | 'need_domain' | 'undecided';
  domainName?: string;

  // Services (ranked by importance)
  services?: Array<{
    name: string;
    description: string;
    rank: number;
  }>;

  // Competitors (3-5 URLs)
  competitors?: Array<{
    url: string;
    analysis?: object;
  }>;
  competitorReport?: object;

  // Uploads
  businessPhotos?: Array<{
    url: string;
    filename: string;
  }>;
  colorPreferenceImages?: Array<{
    url: string;
    filename: string;
  }>;
  extractedColorPalette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };

  // Inspirational Sites (3 URLs)
  inspirationalSites?: Array<{
    url: string;
    screenshot?: string;
  }>;

  // Location & SEO
  country?: string;
  region?: string;

  // Social Media
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Content & Theme Preferences
  contentMode?: 'ai_generated' | 'user_provided';
  themeMode?: 'light' | 'dark';

  // Page Structure
  pageNames?: Array<{
    name: string;
    suggested: boolean;
  }>;
  websiteBlueprint?: object;

  // Scoring
  designScore?: {
    design: number; // 0-100, weight 25%
    seo: number; // 0-100, weight 25%
    performance: number; // 0-100, weight 20%
    ux: number; // 0-100, weight 20%
    conversion: number; // 0-100, weight 10%
    total: number; // 0-100
  };

  // Investigation Results
  investigationResults?: InvestigationResults;

  // Legacy fields (for backward compatibility)
  industry?: string;
  businessType?: string;
  targetAudience?: string;
  pages?: string[];
  features?: string[];
  colorSchemePreset?: string;
  primaryColor?: string;
  accentColor?: string;
  designStyle?: string;
  fontStyle?: string;
  styleAdjectives?: string;
  logoUrl?: string;
  colorScheme?: string;
  primaryCTA?: string;
  mobilePriority?: string;
  contentTone?: string;
  successMetric?: string;
  seoKeywords?: string;
  competitorWebsites?: string;
  inspirationWebsites?: string;
  timeline?: string;
  budgetRange?: string;
  additionalNotes?: string;
}

// Legacy type alias for backward compatibility
export type WebsiteRequirements = ComprehensiveRequirements;

export interface WizardMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Page with keywords for the new wizard workflow
export interface PageKeywords {
  name: string;          // Page name (e.g., "Home", "About Us", "Services")
  type: PageType;        // Page type for structure
  keywords: string[];    // SEO keywords for this page
}

export type PageType = 
  | 'home'
  | 'about'
  | 'services'
  | 'contact'
  | 'blog'
  | 'portfolio'
  | 'pricing'
  | 'faq'
  | 'team'
  | 'testimonials'
  | 'gallery'
  | 'custom';

// Generated image tracking
export interface GeneratedImage {
  originalUrl: string;   // Original image URL from template
  newUrl: string;        // Leonardo-generated image URL
  alt: string;           // Alt text for SEO
  section: string;       // Which section (hero, about, etc.)
  prompt: string;        // Prompt used for generation
}

// SEO Assessment result
export interface SEOAssessmentResult {
  overallScore: number;  // 0-100
  categories: {
    performance: { score: number; issues: string[]; };
    accessibility: { score: number; issues: string[]; };
    seo: { score: number; issues: string[]; };
    visual: { score: number; issues: string[]; };
    navigation: { score: number; issues: string[]; };
  };
  recommendations: string[];
  passedChecks: string[];
  failedChecks: string[];
}

// Redo request from review stage
export interface RedoRequest {
  type: 'content' | 'images';
  pages: string[];       // Which pages to redo (empty = all)
  sections?: string[];   // Optional: specific sections
  feedback?: string;     // Optional: user feedback
}

export interface WizardState {
  // Legacy single template selection (deprecated)
  selectedTemplate?: BrandTemplate | null;
  
  // NEW: Multi-select design templates (Phase 2)
  selectedDesignTemplates: BrandTemplate[];
  
  // NEW: Multi-select content/SEO templates (Phase 3) - DEPRECATED
  selectedContentTemplates: BrandTemplate[];
  
  // NEW: Keywords per page (Phase 3 - replaces content templates)
  pageKeywords: PageKeywords[];
  
  // NEW: Image source preference
  imageSource: 'own' | 'leonardo';
  
  // NEW: Redesign counter (max 5)
  redesignCount: number;
  
  // NEW: Merged template (after content rewriting)
  mergedTemplate?: {
    html: string;
    css: string;
    images?: Array<{
      src: string;
      alt: string;
      section: string;
      prompt?: string;
    }>;
  };
  
  // NEW: Generated images from Leonardo
  generatedImages: GeneratedImage[];
  
  // NEW: SEO assessment result
  seoAssessment?: SEOAssessmentResult;
  
  // NEW: Redo requests history
  redoRequests: RedoRequest[];
  
  // NEW: Generated website data
  generatedWebsite?: {
    html: string;
    css: string;
    js?: string;
    pages?: Array<{ slug: string; html: string; }>;
  };
  
  // NEW: SEO evaluation score (0-100)
  seoScore?: number;
  seoRecommendations?: string[];
  
  stage: WizardStage;
  currentPage: DiscoveryPage;
  currentQuestion: number;
  requirements: WebsiteRequirements;
  messages: WizardMessage[];
  investigationResults?: InvestigationResults;
  researchData?: {
    steps: unknown[];
    activities: unknown[];
    completedAt: Date;
  };
  sessionId?: string;
  draftId?: string;
  stageHistory: WizardStage[]; // Navigation history for back buttons
  selectedPackage?: PackageId; // Phase 1: Selected package
  packageConstraints?: PackageConstraints; // Package limits (max pages, etc.)

  // Project ID - links to user's saved project in database
  projectId?: string;
  projectName?: string;

  // NEW: Business info from QuickBusinessForm (Phase 3)
  businessInfo?: {
    businessName: string;
    industry: string;
    location: string;
    email: string;
    hasOwnPhotos: boolean;
  };

  // NEW: Auto-build flag (triggers progress bar on final-website)
  autoBuildPending?: boolean;

  // Legacy fields - deprecated
  selectedContentTemplate?: BrandTemplate | null; // DEPRECATED: Use pageKeywords
}

export interface Question {
  id: string;
  question: string;
  key: keyof WebsiteRequirements;
  type:
    | 'text'
    | 'select'
    | 'multiselect'
    | 'textarea'
    | 'color'
    | 'email'
    | 'phone'
    | 'url'
    | 'file'
    | 'radio'
    | 'service-list'
    | 'url-list'
    | 'social-links';
  options?: string[];
  placeholder?: string;
  example?: string;
  defaultValue?: string;
  optional?: boolean;
  page: DiscoveryPage;
  conditional?: {
    dependsOn: keyof WebsiteRequirements;
    showWhen: string | string[];
  };
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
}

export const discoveryQuestions: Question[] = [
  // PAGE 1: PROJECT OVERVIEW
  {
    id: 'project-overview',
    question: 'Describe your website project in a few sentences',
    key: 'projectOverview',
    type: 'textarea',
    page: 'project-overview',
    placeholder:
      'e.g., I need a professional website for my Italian restaurant that showcases our menu, allows online reservations, and highlights our authentic cuisine and cozy atmosphere.',
    example:
      'Tell us about your business, what you do, and what you want to achieve with this website. Our AI will expand this into a detailed brief.',
  },

  // PAGE 2: BUSINESS DETAILS
  {
    id: 'business-name',
    question: "What's the name of your business or project?",
    key: 'businessName',
    type: 'text',
    page: 'business-details',
    placeholder: 'e.g., Ocean View Restaurant',
    example: 'This will be used as your website title',
  },
  {
    id: 'business-email',
    question: 'Business email address',
    key: 'businessEmail',
    type: 'email',
    page: 'business-details',
    placeholder: 'contact@yourbusiness.com',
    example: 'This will be displayed on your contact page',
  },
  {
    id: 'business-phone',
    question: 'Business phone number',
    key: 'businessPhone',
    type: 'phone',
    page: 'business-details',
    placeholder: '+1 (555) 123-4567',
    example: 'Include country code for international businesses',
    optional: true,
  },
  {
    id: 'business-address',
    question: 'Physical business address',
    key: 'businessAddress',
    type: 'textarea',
    page: 'business-details',
    placeholder: '123 Main Street\nSuite 100\nCity, State 12345',
    example: 'Full address helps with local SEO and Google Maps integration',
    optional: true,
  },
  {
    id: 'domain-status',
    question: 'Do you have a domain name?',
    key: 'domainStatus',
    type: 'select',
    page: 'business-details',
    options: ['have_domain', 'need_domain', 'undecided'],
    placeholder: 'Select domain status',
    example: 'We can help you register a domain if you need one',
  },
  {
    id: 'domain-name',
    question: 'What is your domain name?',
    key: 'domainName',
    type: 'text',
    page: 'business-details',
    placeholder: 'www.yourbusiness.com',
    example: 'Enter your existing domain or your preferred domain name',
    conditional: {
      dependsOn: 'domainStatus',
      showWhen: 'have_domain',
    },
  },
  {
    id: 'industry',
    question: 'What industry are you in?',
    key: 'industry',
    type: 'select',
    page: 'business-details',
    options: [
      'Food & Dining',
      'Retail & E-commerce',
      'Professional Services',
      'Health & Wellness',
      'Technology & Software',
      'Creative & Arts',
      'Education & Training',
      'Real Estate',
      'Finance & Consulting',
      'Travel & Hospitality',
      'Non-Profit',
      'Other',
    ],
    placeholder: 'Select your industry',
    example: 'This helps us apply industry-specific best practices and design patterns',
  },
  {
    id: 'business-type',
    question: 'What type of website would you like to create?',
    key: 'businessType',
    type: 'select',
    page: 'business-details',
    options: [
      'Restaurant or Cafe',
      'E-commerce Store',
      'Portfolio',
      'Blog',
      'Landing Page',
      'SaaS Product',
      'Business Website',
      'Other',
    ],
    placeholder: 'Select a website type',
  },
  {
    id: 'target-audience',
    question: 'Who is your target audience?',
    key: 'targetAudience',
    type: 'textarea',
    page: 'business-details',
    placeholder: 'e.g., Young professionals looking for upscale dining experiences',
    example: 'Describe who will visit your website',
  },

  // PAGE 3: SERVICES
  {
    id: 'services',
    question: 'What services or products do you offer? (Rank by importance)',
    key: 'services',
    type: 'service-list',
    page: 'services',
    placeholder: 'Add your top 10 services or products',
    example:
      "List your main offerings and rank them. We'll showcase them prominently on your website.",
  },

  // PAGE 2: BRANDING
  {
    id: 'color-scheme-preset',
    question: 'Choose a color scheme or create custom:',
    key: 'colorSchemePreset',
    type: 'select',
    page: 'branding',
    options: [
      'Ocean Blue & Coral (#3b82f6 + #f97316)',
      'Forest Green & Gold (#10b981 + #f59e0b)',
      'Royal Purple & Silver (#a855f7 + #94a3b8)',
      'Sunset Orange & Navy (#f97316 + #1e40af)',
      'Rose & Charcoal (#ec4899 + #374151)',
      'Teal & Amber (#14b8a6 + #f59e0b)',
      "Custom (I'll choose my own)",
    ],
    placeholder: 'Select a color scheme',
    example: 'Selecting a preset will auto-fill your primary and accent colors below',
  },
  {
    id: 'primary-color',
    question: 'Primary brand color:',
    key: 'primaryColor',
    type: 'color',
    page: 'branding',
    defaultValue: '#3b82f6',
    example: 'This will be used for main elements, buttons, and headers',
  },
  {
    id: 'accent-color',
    question: 'Accent color:',
    key: 'accentColor',
    type: 'color',
    page: 'branding',
    defaultValue: '#a855f7',
    example: 'This will be used for highlights, links, and accents',
  },
  {
    id: 'design-style',
    question: 'Which design style do you prefer?',
    key: 'designStyle',
    type: 'select',
    page: 'branding',
    options: [
      'Minimalist (Clean & Simple)',
      'Bold & Vibrant',
      'Classic & Timeless',
      'Modern & Edgy',
      'Playful & Quirky',
      'Elegant & Sophisticated',
    ],
    placeholder: 'Select design style',
    example: 'This affects layout, spacing, and visual hierarchy',
  },
  {
    id: 'font-style',
    question: 'What font style do you prefer?',
    key: 'fontStyle',
    type: 'select',
    page: 'branding',
    options: [
      'Sans-serif (Modern)',
      'Serif (Classic)',
      'Monospace (Technical)',
      'Display (Creative)',
    ],
    placeholder: 'Select font style',
  },
  {
    id: 'style-adjectives',
    question: 'How would you describe your brand style?',
    key: 'styleAdjectives',
    type: 'text',
    page: 'branding',
    placeholder: 'e.g., modern, clean, trustworthy, innovative',
    example: 'Enter 2-4 words that describe your brand personality',
  },
  {
    id: 'logo-url',
    question: 'Do you have a logo URL? (Optional)',
    key: 'logoUrl',
    type: 'text',
    page: 'branding',
    placeholder: 'https://example.com/logo.png',
    example: "Leave blank if you don't have a logo yet",
    optional: true,
  },

  // PAGE 3: CONTENT & FEATURES
  {
    id: 'primary-cta',
    question: "What's the main action you want visitors to take?",
    key: 'primaryCTA',
    type: 'select',
    page: 'content',
    options: [
      'Contact Us',
      'Buy Now / Shop',
      'Book Appointment',
      'Sign Up / Register',
      'Download',
      'Learn More',
      'Get Quote',
      'Call Now',
    ],
    placeholder: 'Select primary call-to-action',
    example: "We'll make this action prominent throughout your site",
  },
  {
    id: 'pages',
    question: 'Which pages do you need on your website?',
    key: 'pages',
    type: 'multiselect',
    page: 'content',
    options: [
      'Home',
      'About',
      'Services/Products',
      'Portfolio/Gallery',
      'Pricing',
      'Blog',
      'Contact',
      'FAQ',
      'Testimonials',
      'Team',
    ],
    placeholder: 'Select all pages you need',
  },
  {
    id: 'features',
    question: 'What features do you need?',
    key: 'features',
    type: 'multiselect',
    page: 'content',
    options: [
      'Contact Form',
      'Newsletter Signup',
      'Online Booking/Reservations',
      'Photo Gallery',
      'Video Integration',
      'Social Media Links',
      'Google Maps',
      'Search Functionality',
      'Live Chat',
      'Shopping Cart',
    ],
    placeholder: 'Select features',
  },
  {
    id: 'content-tone',
    question: 'What tone should your website have?',
    key: 'contentTone',
    type: 'select',
    page: 'content',
    options: [
      'Professional',
      'Friendly & Casual',
      'Luxurious & Elegant',
      'Modern & Innovative',
      'Traditional & Classic',
      'Fun & Playful',
      'Minimalist & Clean',
    ],
    placeholder: 'Select content tone',
  },
  {
    id: 'mobile-priority',
    question: 'How important is mobile experience?',
    key: 'mobilePriority',
    type: 'select',
    page: 'content',
    options: [
      'Critical - Most traffic is mobile',
      'Important - About 50/50 split',
      'Standard - Mostly desktop users',
    ],
    placeholder: 'Select mobile priority',
    example: 'This affects how we prioritize responsive design and mobile optimization',
  },

  // PAGE 6: COMPETITORS & ANALYSIS
  {
    id: 'competitors',
    question: 'Competitor websites to analyze (3-5 URLs)',
    key: 'competitors',
    type: 'url-list',
    page: 'competitors',
    placeholder: 'https://competitor-example.com',
    example: "We'll analyze these to understand their strengths, weaknesses, and keywords",
    optional: true,
  },
  {
    id: 'competitor-websites-legacy',
    question: 'Any competitor websites we should analyze? (Optional)',
    key: 'competitorWebsites',
    type: 'textarea',
    page: 'competitors',
    placeholder:
      'Enter 2-3 competitor website URLs, one per line\ne.g., https://example-competitor1.com\nhttps://example-competitor2.com',
    example: 'Legacy field - use the list above for better analysis',
    optional: true,
  },

  // PAGE 7: VISUAL ASSETS
  {
    id: 'business-photos',
    question: 'Upload business photos (products, team, location)',
    key: 'businessPhotos',
    type: 'file',
    page: 'visual-assets',
    placeholder: 'Upload photos',
    example: 'Upload high-quality photos that showcase your business',
    optional: true,
    multiple: true,
    accept: 'image/*',
  },
  {
    id: 'color-preference-images',
    question: 'Upload images with colors you like (1-5 images)',
    key: 'colorPreferenceImages',
    type: 'file',
    page: 'visual-assets',
    placeholder: 'Upload color inspiration',
    example: "We'll extract color palettes from these images to match your brand",
    optional: true,
    multiple: true,
    maxFiles: 5,
    accept: 'image/*',
  },
  {
    id: 'inspirational-sites',
    question: 'Websites with designs you love (up to 3 URLs)',
    key: 'inspirationalSites',
    type: 'url-list',
    page: 'visual-assets',
    placeholder: 'https://inspiration-example.com',
    example: 'Share websites whose design aesthetic you admire',
    optional: true,
  },
  {
    id: 'inspiration-websites-legacy',
    question: 'Any stunning websites that inspire you? (Optional)',
    key: 'inspirationWebsites',
    type: 'textarea',
    page: 'visual-assets',
    placeholder: 'Enter 2-3 website URLs that have designs you love, one per line',
    example: 'Legacy field - use the list above for better tracking',
    optional: true,
  },

  // PAGE 8: LOCATION & SOCIAL
  {
    id: 'country',
    question: 'What country is your business located in?',
    key: 'country',
    type: 'select',
    page: 'location-social',
    options: [
      'United States',
      'Canada',
      'United Kingdom',
      'Australia',
      'Germany',
      'France',
      'Spain',
      'Italy',
      'Netherlands',
      'Belgium',
      'Switzerland',
      'Austria',
      'Sweden',
      'Norway',
      'Denmark',
      'Finland',
      'Ireland',
      'Portugal',
      'Greece',
      'Poland',
      'Czech Republic',
      'Hungary',
      'Romania',
      'Bulgaria',
      'Croatia',
      'Slovenia',
      'Slovakia',
      'Lithuania',
      'Latvia',
      'Estonia',
      'Japan',
      'South Korea',
      'China',
      'India',
      'Singapore',
      'Malaysia',
      'Thailand',
      'Vietnam',
      'Philippines',
      'Indonesia',
      'New Zealand',
      'South Africa',
      'Brazil',
      'Mexico',
      'Argentina',
      'Chile',
      'Colombia',
      'Peru',
      'United Arab Emirates',
      'Saudi Arabia',
      'Israel',
      'Turkey',
      'Egypt',
      'Kenya',
      'Nigeria',
      'Other',
    ],
    placeholder: 'Select country',
    example: 'Helps with local SEO and regional customization',
  },
  {
    id: 'region',
    question: 'State/Region/City',
    key: 'region',
    type: 'text',
    page: 'location-social',
    placeholder: 'e.g., California, London, Ontario',
    example: 'Your local area for better SEO targeting',
    optional: true,
  },
  {
    id: 'social-media',
    question: 'Social media profiles',
    key: 'socialMedia',
    type: 'social-links',
    page: 'location-social',
    example: 'Add your social media links to connect with your audience',
    optional: true,
  },

  // PAGE 9: PREFERENCES
  {
    id: 'content-mode',
    question: 'How do you want to handle website content?',
    key: 'contentMode',
    type: 'radio',
    page: 'preferences',
    options: ['ai_generated', 'user_provided'],
    example: 'AI can generate professional content, or you can provide your own',
  },
  {
    id: 'theme-mode',
    question: 'Preferred theme mode',
    key: 'themeMode',
    type: 'radio',
    page: 'preferences',
    options: ['light', 'dark'],
    example: 'Choose the default theme for your website',
  },
  {
    id: 'page-names',
    question: 'Page names for your website',
    key: 'pageNames',
    type: 'textarea',
    page: 'preferences',
    placeholder: 'Home\nAbout\nServices\nContact',
    example: "One page per line. We'll suggest pages based on your business type.",
    optional: true,
  },
];

export const pageOrder: DiscoveryPage[] = [
  'project-overview',
  'business-details',
  'services',
  'branding',
  'content',
  'competitors',
  'visual-assets',
  'location-social',
  'preferences',
];

export const pageLabels: Record<DiscoveryPage, string> = {
  'project-overview': 'Project Overview',
  'business-details': 'Business Details',
  services: 'Services & Products',
  branding: 'Branding & Design',
  content: 'Content & Features',
  competitors: 'Competitor Analysis',
  'visual-assets': 'Visual Assets',
  'location-social': 'Location & Social',
  preferences: 'Preferences',
};

// Multi-Page Website Types (aligned with server-side types)
export interface WebsiteManifest {
  siteName: string;
  description: string;
  pages: PageSpec[];
  navigation: NavigationConfig;
  sharedComponents: SharedComponents;
  seoStrategy: SEOStrategy;
  designSystem: DesignSystem;
  version: string;
}

export interface PageSpec {
  slug: string;
  title: string;
  description: string;
  sections: SectionSpec[];
  seo: PageSEO;
  order: number;
}

export interface SectionSpec {
  id: string;
  type:
    | 'hero'
    | 'features'
    | 'testimonials'
    | 'pricing'
    | 'contact'
    | 'cta'
    | 'gallery'
    | 'team'
    | 'stats'
    | 'faq';
  title: string;
  content: string;
  order: number;
}

export interface NavigationConfig {
  type: 'header' | 'sidebar' | 'both';
  sticky: boolean;
  pages: Array<{
    slug: string;
    label: string;
    order: number;
  }>;
}

export interface SharedComponents {
  header: string;
  footer: string;
  navigation: string;
}

export interface SEOStrategy {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  contentGaps: string[];
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface DesignSystem {
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      body: string;
    };
  };
  spacing: {
    section: string;
    element: string;
  };
  borderRadius: string;
}

export interface WebsiteFile {
  path: string;
  type: 'html' | 'css' | 'js' | 'json';
  content: string;
  checksum: string;
}

export interface MultiPageWebsite {
  manifest: WebsiteManifest;
  files: Record<string, WebsiteFile>;
  assets: {
    css: string;
    js: string;
  };
}

// Legacy single-page format
export interface LegacyWebsiteContent {
  html: string;
  css: string;
  js: string;
  meta?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// Normalized format that supports both old and new
export interface GeneratedWebsitePackage {
  manifest: WebsiteManifest;
  files: Record<string, WebsiteFile>;
  activePageId: string;
  pages: PageSpec[];
  sharedAssets: {
    css: string;
    js: string;
  };
}

// Normalizer utility to convert any format to GeneratedWebsitePackage
export function normalizeGeneratedWebsite(
  data: MultiPageWebsite | LegacyWebsiteContent
): GeneratedWebsitePackage {
  // Check if it's multi-page format
  if ('manifest' in data && 'files' in data) {
    const multiPage = data as MultiPageWebsite;
    const firstPage = multiPage.manifest.pages?.[0];
    return {
      manifest: multiPage.manifest,
      files: multiPage.files,
      activePageId: firstPage?.slug || 'home',
      pages: multiPage.manifest.pages || [],
      sharedAssets: multiPage.assets || { css: '', js: '' },
    };
  }

  // Legacy single-page format - convert to normalized structure
  const legacy = data as LegacyWebsiteContent;
  const manifest: WebsiteManifest = {
    siteName: legacy.meta?.title || 'Website',
    description: legacy.meta?.description || '',
    pages: [
      {
        slug: 'home',
        title: legacy.meta?.title || 'Home',
        description: legacy.meta?.description || '',
        sections: [],
        seo: {
          title: legacy.meta?.title || 'Home',
          description: legacy.meta?.description || '',
          keywords: legacy.meta?.keywords || [],
        },
        order: 1,
      },
    ],
    navigation: {
      type: 'header',
      sticky: true,
      pages: [{ slug: 'home', label: 'Home', order: 1 }],
    },
    sharedComponents: {
      header: '',
      footer: '',
      navigation: '',
    },
    seoStrategy: {
      primaryKeywords: legacy.meta?.keywords || [],
      secondaryKeywords: [],
      contentGaps: [],
    },
    designSystem: {
      colors: {
        primary: '#3b82f6',
        accent: '#10b981',
        background: '#ffffff',
        text: '#1f2937',
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif',
        sizes: {
          h1: '60px',
          h2: '40px',
          body: '16px',
        },
      },
      spacing: {
        section: '80px',
        element: '20px',
      },
      borderRadius: '8px',
    },
    version: '1.0',
  };

  const files: Record<string, WebsiteFile> = {
    'pages/home.html': {
      path: 'pages/home.html',
      type: 'html',
      content: legacy.html,
      checksum: '',
    },
  };

  return {
    manifest,
    files,
    activePageId: 'home',
    pages: manifest.pages,
    sharedAssets: {
      css: legacy.css,
      js: legacy.js,
    },
  };
}
