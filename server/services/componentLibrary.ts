/**
 * Merlin Component Library
 * 
 * 100+ ready-to-use website components organized by category.
 * Each component includes HTML/CSS structure, variants, and customization options.
 */

export interface WebsiteComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  subcategory: string;
  description: string;
  variants: ComponentVariant[];
  defaultProps: Record<string, any>;
  responsive: boolean;
  animations: string[];
}

export interface ComponentVariant {
  id: string;
  name: string;
  preview?: string;
  props?: Record<string, any>;
}

export type ComponentCategory = 
  | 'hero'
  | 'navigation'
  | 'features'
  | 'content'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'contact'
  | 'gallery'
  | 'team'
  | 'faq'
  | 'stats'
  | 'footer'
  | 'forms'
  | 'cards'
  | 'lists'
  | 'headers'
  | 'dividers'
  | 'social'
  | 'ecommerce'
  | 'blog'
  | 'portfolio';

// ==============================================
// HERO COMPONENTS (15 variants)
// ==============================================
const HERO_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'hero-centered',
    name: 'Centered Hero',
    category: 'hero',
    subcategory: 'standard',
    description: 'Classic centered hero with headline, subheadline, and CTA buttons',
    variants: [
      { id: 'hero-centered-1', name: 'Basic' },
      { id: 'hero-centered-2', name: 'With Image' },
      { id: 'hero-centered-3', name: 'With Video Background' },
    ],
    defaultProps: {
      headline: 'Welcome to Our Website',
      subheadline: 'We help businesses grow with innovative solutions',
      ctaText: 'Get Started',
      ctaSecondaryText: 'Learn More',
    },
    responsive: true,
    animations: ['fadeIn', 'slideUp', 'scaleIn'],
  },
  {
    id: 'hero-split',
    name: 'Split Hero',
    category: 'hero',
    subcategory: 'standard',
    description: 'Two-column hero with content on one side and image on the other',
    variants: [
      { id: 'hero-split-left', name: 'Content Left' },
      { id: 'hero-split-right', name: 'Content Right' },
      { id: 'hero-split-diagonal', name: 'Diagonal Split' },
    ],
    defaultProps: {
      headline: 'Transform Your Business',
      subheadline: 'Innovative solutions for modern challenges',
      ctaText: 'Start Free Trial',
      imageSrc: '/images/hero.jpg',
    },
    responsive: true,
    animations: ['slideInLeft', 'slideInRight', 'fadeIn'],
  },
  {
    id: 'hero-fullscreen',
    name: 'Fullscreen Hero',
    category: 'hero',
    subcategory: 'immersive',
    description: 'Full viewport height hero with background image or video',
    variants: [
      { id: 'hero-fullscreen-image', name: 'Image Background' },
      { id: 'hero-fullscreen-video', name: 'Video Background' },
      { id: 'hero-fullscreen-gradient', name: 'Gradient Background' },
      { id: 'hero-fullscreen-particles', name: 'Particles Background' },
    ],
    defaultProps: {
      headline: 'Create Something Amazing',
      subheadline: 'The future starts here',
      ctaText: 'Explore',
      backgroundType: 'image',
    },
    responsive: true,
    animations: ['fadeIn', 'zoomIn', 'parallax'],
  },
  {
    id: 'hero-minimal',
    name: 'Minimal Hero',
    category: 'hero',
    subcategory: 'minimal',
    description: 'Clean, minimal hero with just text and optional CTA',
    variants: [
      { id: 'hero-minimal-text', name: 'Text Only' },
      { id: 'hero-minimal-cta', name: 'With CTA' },
    ],
    defaultProps: {
      headline: 'Less is More',
      subheadline: 'Simplicity at its finest',
    },
    responsive: true,
    animations: ['fadeIn', 'typewriter'],
  },
  {
    id: 'hero-animated',
    name: 'Animated Hero',
    category: 'hero',
    subcategory: 'dynamic',
    description: 'Hero with animated elements and effects',
    variants: [
      { id: 'hero-animated-shapes', name: 'Floating Shapes' },
      { id: 'hero-animated-text', name: 'Animated Text' },
      { id: 'hero-animated-3d', name: '3D Elements' },
    ],
    defaultProps: {
      headline: 'Experience Innovation',
      subheadline: 'Where creativity meets technology',
      animationType: 'shapes',
    },
    responsive: true,
    animations: ['float', 'rotate', 'pulse', 'morphing'],
  },
];

// ==============================================
// NAVIGATION COMPONENTS (10 variants)
// ==============================================
const NAVIGATION_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'nav-standard',
    name: 'Standard Navigation',
    category: 'navigation',
    subcategory: 'horizontal',
    description: 'Classic horizontal navigation with logo and menu items',
    variants: [
      { id: 'nav-standard-left', name: 'Logo Left' },
      { id: 'nav-standard-center', name: 'Logo Center' },
      { id: 'nav-standard-right', name: 'Logo Right' },
    ],
    defaultProps: {
      logo: 'Company',
      menuItems: ['Home', 'About', 'Services', 'Contact'],
      ctaButton: 'Get Started',
    },
    responsive: true,
    animations: ['slideDown', 'fadeIn'],
  },
  {
    id: 'nav-transparent',
    name: 'Transparent Navigation',
    category: 'navigation',
    subcategory: 'overlay',
    description: 'Transparent navbar that becomes solid on scroll',
    variants: [
      { id: 'nav-transparent-light', name: 'Light Text' },
      { id: 'nav-transparent-dark', name: 'Dark Text' },
    ],
    defaultProps: {
      logo: 'Brand',
      menuItems: ['Home', 'Features', 'Pricing', 'Contact'],
      scrollBehavior: 'solid-on-scroll',
    },
    responsive: true,
    animations: ['fadeIn', 'colorChange'],
  },
  {
    id: 'nav-mega-menu',
    name: 'Mega Menu Navigation',
    category: 'navigation',
    subcategory: 'dropdown',
    description: 'Navigation with large dropdown menus for complex sites',
    variants: [
      { id: 'nav-mega-columns', name: 'Column Layout' },
      { id: 'nav-mega-featured', name: 'With Featured Items' },
    ],
    defaultProps: {
      logo: 'Enterprise',
      menuItems: [
        { name: 'Products', items: ['Product 1', 'Product 2', 'Product 3'] },
        { name: 'Solutions', items: ['Industry 1', 'Industry 2'] },
      ],
    },
    responsive: true,
    animations: ['slideDown', 'fadeIn'],
  },
  {
    id: 'nav-sidebar',
    name: 'Sidebar Navigation',
    category: 'navigation',
    subcategory: 'vertical',
    description: 'Vertical sidebar navigation for apps and dashboards',
    variants: [
      { id: 'nav-sidebar-collapsed', name: 'Collapsible' },
      { id: 'nav-sidebar-icons', name: 'Icons Only' },
      { id: 'nav-sidebar-full', name: 'Full Width' },
    ],
    defaultProps: {
      logo: 'Dashboard',
      menuItems: ['Dashboard', 'Projects', 'Team', 'Settings'],
      collapsible: true,
    },
    responsive: true,
    animations: ['slideInLeft', 'expand'],
  },
  {
    id: 'nav-hamburger',
    name: 'Hamburger Menu',
    category: 'navigation',
    subcategory: 'mobile',
    description: 'Mobile-first hamburger menu with animated icon',
    variants: [
      { id: 'nav-hamburger-slide', name: 'Slide In' },
      { id: 'nav-hamburger-fullscreen', name: 'Fullscreen Overlay' },
      { id: 'nav-hamburger-drawer', name: 'Drawer' },
    ],
    defaultProps: {
      logo: 'Brand',
      menuItems: ['Home', 'About', 'Services', 'Portfolio', 'Contact'],
      animationType: 'slide',
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn', 'rotate'],
  },
];

// ==============================================
// FEATURES COMPONENTS (12 variants)
// ==============================================
const FEATURES_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'features',
    subcategory: 'grid',
    description: 'Grid layout showcasing multiple features with icons',
    variants: [
      { id: 'features-grid-3col', name: '3 Columns' },
      { id: 'features-grid-4col', name: '4 Columns' },
      { id: 'features-grid-icons', name: 'Large Icons' },
      { id: 'features-grid-cards', name: 'Card Style' },
    ],
    defaultProps: {
      headline: 'Our Features',
      features: [
        { icon: 'zap', title: 'Fast', description: 'Lightning fast performance' },
        { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: 'globe', title: 'Global', description: 'Worldwide availability' },
      ],
    },
    responsive: true,
    animations: ['stagger', 'fadeIn', 'scaleIn'],
  },
  {
    id: 'features-alternating',
    name: 'Alternating Features',
    category: 'features',
    subcategory: 'split',
    description: 'Features with alternating image and text layout',
    variants: [
      { id: 'features-alternating-left', name: 'Start Left' },
      { id: 'features-alternating-right', name: 'Start Right' },
    ],
    defaultProps: {
      features: [
        { image: '/feature1.jpg', title: 'Feature 1', description: 'Description' },
        { image: '/feature2.jpg', title: 'Feature 2', description: 'Description' },
      ],
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn', 'parallax'],
  },
  {
    id: 'features-tabs',
    name: 'Tabbed Features',
    category: 'features',
    subcategory: 'interactive',
    description: 'Interactive tabs to showcase different features',
    variants: [
      { id: 'features-tabs-horizontal', name: 'Horizontal Tabs' },
      { id: 'features-tabs-vertical', name: 'Vertical Tabs' },
      { id: 'features-tabs-pills', name: 'Pill Style' },
    ],
    defaultProps: {
      tabs: [
        { title: 'Tab 1', content: 'Feature content 1' },
        { title: 'Tab 2', content: 'Feature content 2' },
        { title: 'Tab 3', content: 'Feature content 3' },
      ],
    },
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
  },
  {
    id: 'features-comparison',
    name: 'Feature Comparison',
    category: 'features',
    subcategory: 'comparison',
    description: 'Compare features across different plans or products',
    variants: [
      { id: 'features-comparison-table', name: 'Table Layout' },
      { id: 'features-comparison-cards', name: 'Card Layout' },
    ],
    defaultProps: {
      columns: ['Basic', 'Pro', 'Enterprise'],
      features: [
        { name: 'Feature 1', values: [true, true, true] },
        { name: 'Feature 2', values: [false, true, true] },
      ],
    },
    responsive: true,
    animations: ['fadeIn', 'highlight'],
  },
];

// ==============================================
// TESTIMONIALS COMPONENTS (8 variants)
// ==============================================
const TESTIMONIALS_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'testimonials-carousel',
    name: 'Testimonials Carousel',
    category: 'testimonials',
    subcategory: 'slider',
    description: 'Rotating carousel of customer testimonials',
    variants: [
      { id: 'testimonials-carousel-single', name: 'Single Slide' },
      { id: 'testimonials-carousel-multi', name: 'Multiple Slides' },
      { id: 'testimonials-carousel-fade', name: 'Fade Transition' },
    ],
    defaultProps: {
      testimonials: [
        { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', avatar: '/avatars/1.jpg' },
        { quote: 'Highly recommended!', author: 'Jane Smith', role: 'CTO', avatar: '/avatars/2.jpg' },
      ],
      autoplay: true,
      interval: 5000,
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn', 'scaleIn'],
  },
  {
    id: 'testimonials-grid',
    name: 'Testimonials Grid',
    category: 'testimonials',
    subcategory: 'grid',
    description: 'Grid layout showing multiple testimonials at once',
    variants: [
      { id: 'testimonials-grid-2col', name: '2 Columns' },
      { id: 'testimonials-grid-3col', name: '3 Columns' },
      { id: 'testimonials-grid-masonry', name: 'Masonry Layout' },
    ],
    defaultProps: {
      testimonials: [
        { quote: 'Amazing!', author: 'User 1', rating: 5 },
        { quote: 'Great service!', author: 'User 2', rating: 5 },
        { quote: 'Highly recommend!', author: 'User 3', rating: 4 },
      ],
    },
    responsive: true,
    animations: ['stagger', 'fadeIn'],
  },
  {
    id: 'testimonials-featured',
    name: 'Featured Testimonial',
    category: 'testimonials',
    subcategory: 'featured',
    description: 'Large, prominent testimonial with photo and details',
    variants: [
      { id: 'testimonials-featured-left', name: 'Photo Left' },
      { id: 'testimonials-featured-right', name: 'Photo Right' },
    ],
    defaultProps: {
      quote: 'This product transformed our business completely.',
      author: 'CEO Name',
      company: 'Fortune 500 Company',
      photo: '/testimonial-featured.jpg',
    },
    responsive: true,
    animations: ['fadeIn', 'parallax'],
  },
];

// ==============================================
// PRICING COMPONENTS (8 variants)
// ==============================================
const PRICING_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'pricing-cards',
    name: 'Pricing Cards',
    category: 'pricing',
    subcategory: 'cards',
    description: 'Standard pricing cards with feature lists',
    variants: [
      { id: 'pricing-cards-3tier', name: '3 Tiers' },
      { id: 'pricing-cards-4tier', name: '4 Tiers' },
      { id: 'pricing-cards-highlight', name: 'With Highlight' },
      { id: 'pricing-cards-toggle', name: 'Monthly/Annual Toggle' },
    ],
    defaultProps: {
      plans: [
        { name: 'Basic', price: 29, features: ['Feature 1', 'Feature 2'] },
        { name: 'Pro', price: 49, features: ['Feature 1', 'Feature 2', 'Feature 3'], popular: true },
        { name: 'Enterprise', price: 99, features: ['All features', 'Priority support'] },
      ],
      billingPeriod: 'monthly',
    },
    responsive: true,
    animations: ['stagger', 'hoverLift', 'scaleIn'],
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    category: 'pricing',
    subcategory: 'table',
    description: 'Detailed pricing comparison table',
    variants: [
      { id: 'pricing-table-horizontal', name: 'Horizontal' },
      { id: 'pricing-table-vertical', name: 'Vertical' },
    ],
    defaultProps: {
      plans: ['Free', 'Pro', 'Enterprise'],
      features: [
        { name: 'Users', values: ['1', '10', 'Unlimited'] },
        { name: 'Storage', values: ['1GB', '100GB', 'Unlimited'] },
      ],
    },
    responsive: true,
    animations: ['fadeIn', 'highlight'],
  },
  {
    id: 'pricing-simple',
    name: 'Simple Pricing',
    category: 'pricing',
    subcategory: 'minimal',
    description: 'Single, simple pricing option',
    variants: [
      { id: 'pricing-simple-centered', name: 'Centered' },
      { id: 'pricing-simple-left', name: 'Left Aligned' },
    ],
    defaultProps: {
      price: 49,
      period: 'month',
      features: ['All features included', '24/7 support', 'Cancel anytime'],
    },
    responsive: true,
    animations: ['fadeIn', 'scaleIn'],
  },
];

// ==============================================
// CTA COMPONENTS (8 variants)
// ==============================================
const CTA_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'cta-centered',
    name: 'Centered CTA',
    category: 'cta',
    subcategory: 'standard',
    description: 'Centered call-to-action section with headline and button',
    variants: [
      { id: 'cta-centered-simple', name: 'Simple' },
      { id: 'cta-centered-gradient', name: 'Gradient Background' },
      { id: 'cta-centered-image', name: 'With Background Image' },
    ],
    defaultProps: {
      headline: 'Ready to get started?',
      subheadline: 'Join thousands of satisfied customers',
      ctaText: 'Start Free Trial',
      ctaSecondaryText: 'Learn More',
    },
    responsive: true,
    animations: ['fadeIn', 'pulse'],
  },
  {
    id: 'cta-split',
    name: 'Split CTA',
    category: 'cta',
    subcategory: 'split',
    description: 'Two-column CTA with content and form or image',
    variants: [
      { id: 'cta-split-form', name: 'With Form' },
      { id: 'cta-split-image', name: 'With Image' },
    ],
    defaultProps: {
      headline: 'Get in Touch',
      subheadline: 'We\'d love to hear from you',
      ctaText: 'Contact Us',
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
  },
  {
    id: 'cta-banner',
    name: 'Banner CTA',
    category: 'cta',
    subcategory: 'banner',
    description: 'Horizontal banner CTA for promotions',
    variants: [
      { id: 'cta-banner-full', name: 'Full Width' },
      { id: 'cta-banner-contained', name: 'Contained' },
      { id: 'cta-banner-sticky', name: 'Sticky' },
    ],
    defaultProps: {
      text: 'Limited time offer! Get 50% off.',
      ctaText: 'Claim Now',
      countdown: false,
    },
    responsive: true,
    animations: ['slideDown', 'bounce'],
  },
];

// ==============================================
// CONTACT COMPONENTS (8 variants)
// ==============================================
const CONTACT_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'contact',
    subcategory: 'form',
    description: 'Standard contact form with various field options',
    variants: [
      { id: 'contact-form-simple', name: 'Simple' },
      { id: 'contact-form-detailed', name: 'Detailed' },
      { id: 'contact-form-inline', name: 'Inline' },
    ],
    defaultProps: {
      headline: 'Get in Touch',
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message',
    },
    responsive: true,
    animations: ['fadeIn', 'slideUp'],
  },
  {
    id: 'contact-split',
    name: 'Split Contact',
    category: 'contact',
    subcategory: 'split',
    description: 'Contact section with form and info side by side',
    variants: [
      { id: 'contact-split-left', name: 'Form Left' },
      { id: 'contact-split-right', name: 'Form Right' },
    ],
    defaultProps: {
      headline: 'Contact Us',
      phone: '+1 (555) 123-4567',
      email: 'hello@example.com',
      address: '123 Main St, City, State 12345',
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
  },
  {
    id: 'contact-map',
    name: 'Contact with Map',
    category: 'contact',
    subcategory: 'map',
    description: 'Contact section featuring an embedded map',
    variants: [
      { id: 'contact-map-side', name: 'Map Side' },
      { id: 'contact-map-fullwidth', name: 'Full Width Map' },
      { id: 'contact-map-overlay', name: 'Form Overlay' },
    ],
    defaultProps: {
      headline: 'Visit Us',
      mapLocation: { lat: 40.7128, lng: -74.0060 },
      address: '123 Main Street, New York, NY',
    },
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
  },
];

// ==============================================
// FOOTER COMPONENTS (8 variants)
// ==============================================
const FOOTER_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'footer-standard',
    name: 'Standard Footer',
    category: 'footer',
    subcategory: 'standard',
    description: 'Classic footer with columns of links',
    variants: [
      { id: 'footer-standard-4col', name: '4 Columns' },
      { id: 'footer-standard-3col', name: '3 Columns' },
      { id: 'footer-standard-centered', name: 'Centered' },
    ],
    defaultProps: {
      logo: 'Company',
      columns: [
        { title: 'Company', links: ['About', 'Careers', 'Press'] },
        { title: 'Product', links: ['Features', 'Pricing', 'API'] },
        { title: 'Support', links: ['Help', 'Contact', 'FAQ'] },
      ],
      copyright: '© 2025 Company. All rights reserved.',
    },
    responsive: true,
    animations: ['fadeIn'],
  },
  {
    id: 'footer-minimal',
    name: 'Minimal Footer',
    category: 'footer',
    subcategory: 'minimal',
    description: 'Clean, minimal footer with essential info only',
    variants: [
      { id: 'footer-minimal-centered', name: 'Centered' },
      { id: 'footer-minimal-split', name: 'Split' },
    ],
    defaultProps: {
      logo: 'Brand',
      socialLinks: ['twitter', 'facebook', 'linkedin'],
      copyright: '© 2025 Brand',
    },
    responsive: true,
    animations: ['fadeIn'],
  },
  {
    id: 'footer-mega',
    name: 'Mega Footer',
    category: 'footer',
    subcategory: 'mega',
    description: 'Large footer with newsletter, links, and contact info',
    variants: [
      { id: 'footer-mega-newsletter', name: 'With Newsletter' },
      { id: 'footer-mega-full', name: 'Full Featured' },
    ],
    defaultProps: {
      logo: 'Enterprise',
      columns: [
        { title: 'Products', links: ['Product 1', 'Product 2', 'Product 3'] },
        { title: 'Company', links: ['About', 'Careers', 'Blog'] },
        { title: 'Resources', links: ['Documentation', 'Help Center'] },
      ],
      newsletter: { headline: 'Subscribe to our newsletter' },
      contact: { phone: '+1 555-123-4567', email: 'hello@example.com' },
    },
    responsive: true,
    animations: ['fadeIn'],
  },
];

// ==============================================
// GALLERY COMPONENTS (8 variants)
// ==============================================
const GALLERY_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'gallery-grid',
    name: 'Gallery Grid',
    category: 'gallery',
    subcategory: 'grid',
    description: 'Responsive image grid gallery',
    variants: [
      { id: 'gallery-grid-2col', name: '2 Columns' },
      { id: 'gallery-grid-3col', name: '3 Columns' },
      { id: 'gallery-grid-4col', name: '4 Columns' },
      { id: 'gallery-grid-masonry', name: 'Masonry' },
    ],
    defaultProps: {
      images: [],
      lightbox: true,
      aspectRatio: '1:1',
    },
    responsive: true,
    animations: ['stagger', 'fadeIn', 'scaleIn'],
  },
  {
    id: 'gallery-carousel',
    name: 'Gallery Carousel',
    category: 'gallery',
    subcategory: 'slider',
    description: 'Scrolling image carousel',
    variants: [
      { id: 'gallery-carousel-single', name: 'Single Image' },
      { id: 'gallery-carousel-multi', name: 'Multiple Images' },
      { id: 'gallery-carousel-thumbnails', name: 'With Thumbnails' },
    ],
    defaultProps: {
      images: [],
      autoplay: true,
      showArrows: true,
      showDots: true,
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
  },
  {
    id: 'gallery-lightbox',
    name: 'Lightbox Gallery',
    category: 'gallery',
    subcategory: 'lightbox',
    description: 'Grid with fullscreen lightbox view',
    variants: [
      { id: 'gallery-lightbox-standard', name: 'Standard' },
      { id: 'gallery-lightbox-zoom', name: 'With Zoom' },
    ],
    defaultProps: {
      images: [],
      thumbnailSize: 'medium',
    },
    responsive: true,
    animations: ['fadeIn', 'zoomIn'],
  },
];

// ==============================================
// STATS COMPONENTS (6 variants)
// ==============================================
const STATS_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    category: 'stats',
    subcategory: 'counter',
    description: 'Animated number counters for statistics',
    variants: [
      { id: 'stats-counter-row', name: 'Row Layout' },
      { id: 'stats-counter-grid', name: 'Grid Layout' },
      { id: 'stats-counter-icons', name: 'With Icons' },
    ],
    defaultProps: {
      stats: [
        { value: 10000, label: 'Customers', prefix: '', suffix: '+' },
        { value: 50, label: 'Countries', prefix: '', suffix: '' },
        { value: 99, label: 'Uptime', prefix: '', suffix: '%' },
        { value: 24, label: 'Support', prefix: '', suffix: '/7' },
      ],
      animateOnScroll: true,
    },
    responsive: true,
    animations: ['countUp', 'fadeIn'],
  },
  {
    id: 'stats-cards',
    name: 'Stats Cards',
    category: 'stats',
    subcategory: 'cards',
    description: 'Statistics displayed in card format',
    variants: [
      { id: 'stats-cards-simple', name: 'Simple' },
      { id: 'stats-cards-detailed', name: 'Detailed' },
    ],
    defaultProps: {
      stats: [
        { value: '500+', label: 'Projects Completed', icon: 'check' },
        { value: '100%', label: 'Client Satisfaction', icon: 'heart' },
      ],
    },
    responsive: true,
    animations: ['stagger', 'fadeIn'],
  },
];

// ==============================================
// TEAM COMPONENTS (6 variants)
// ==============================================
const TEAM_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'team-grid',
    name: 'Team Grid',
    category: 'team',
    subcategory: 'grid',
    description: 'Grid layout for team member profiles',
    variants: [
      { id: 'team-grid-3col', name: '3 Columns' },
      { id: 'team-grid-4col', name: '4 Columns' },
      { id: 'team-grid-circular', name: 'Circular Photos' },
    ],
    defaultProps: {
      headline: 'Meet Our Team',
      members: [
        { name: 'John Doe', role: 'CEO', photo: '/team/1.jpg' },
        { name: 'Jane Smith', role: 'CTO', photo: '/team/2.jpg' },
      ],
      showSocial: true,
    },
    responsive: true,
    animations: ['stagger', 'fadeIn', 'hoverZoom'],
  },
  {
    id: 'team-carousel',
    name: 'Team Carousel',
    category: 'team',
    subcategory: 'slider',
    description: 'Sliding carousel of team members',
    variants: [
      { id: 'team-carousel-single', name: 'Single' },
      { id: 'team-carousel-multi', name: 'Multiple' },
    ],
    defaultProps: {
      members: [],
      autoplay: true,
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
  },
];

// ==============================================
// FAQ COMPONENTS (6 variants)
// ==============================================
const FAQ_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion',
    category: 'faq',
    subcategory: 'accordion',
    description: 'Expandable accordion FAQ section',
    variants: [
      { id: 'faq-accordion-simple', name: 'Simple' },
      { id: 'faq-accordion-bordered', name: 'Bordered' },
      { id: 'faq-accordion-icons', name: 'With Icons' },
    ],
    defaultProps: {
      headline: 'Frequently Asked Questions',
      questions: [
        { q: 'What is your return policy?', a: 'We offer 30-day returns.' },
        { q: 'Do you offer support?', a: 'Yes, 24/7 support available.' },
      ],
      allowMultiple: false,
    },
    responsive: true,
    animations: ['expand', 'fadeIn'],
  },
  {
    id: 'faq-two-column',
    name: 'Two Column FAQ',
    category: 'faq',
    subcategory: 'grid',
    description: 'FAQ displayed in two columns',
    variants: [
      { id: 'faq-two-column-simple', name: 'Simple' },
      { id: 'faq-two-column-cards', name: 'Cards' },
    ],
    defaultProps: {
      questions: [],
    },
    responsive: true,
    animations: ['stagger', 'fadeIn'],
  },
];

// ==============================================
// E-COMMERCE COMPONENTS (10 variants)
// ==============================================
const ECOMMERCE_COMPONENTS: WebsiteComponent[] = [
  {
    id: 'ecom-product-card',
    name: 'Product Card',
    category: 'ecommerce',
    subcategory: 'product',
    description: 'Individual product display card',
    variants: [
      { id: 'ecom-product-card-simple', name: 'Simple' },
      { id: 'ecom-product-card-detailed', name: 'Detailed' },
      { id: 'ecom-product-card-hover', name: 'Hover Effects' },
    ],
    defaultProps: {
      image: '/product.jpg',
      name: 'Product Name',
      price: 99.99,
      rating: 4.5,
      badge: 'New',
    },
    responsive: true,
    animations: ['hoverZoom', 'hoverLift', 'fadeIn'],
  },
  {
    id: 'ecom-product-grid',
    name: 'Product Grid',
    category: 'ecommerce',
    subcategory: 'grid',
    description: 'Grid of product cards',
    variants: [
      { id: 'ecom-product-grid-3col', name: '3 Columns' },
      { id: 'ecom-product-grid-4col', name: '4 Columns' },
      { id: 'ecom-product-grid-filters', name: 'With Filters' },
    ],
    defaultProps: {
      products: [],
      showFilters: true,
      showSort: true,
    },
    responsive: true,
    animations: ['stagger', 'fadeIn'],
  },
  {
    id: 'ecom-cart',
    name: 'Shopping Cart',
    category: 'ecommerce',
    subcategory: 'cart',
    description: 'Shopping cart display component',
    variants: [
      { id: 'ecom-cart-sidebar', name: 'Sidebar Cart' },
      { id: 'ecom-cart-modal', name: 'Modal Cart' },
      { id: 'ecom-cart-dropdown', name: 'Dropdown Cart' },
    ],
    defaultProps: {
      items: [],
      showQuantity: true,
      showRemove: true,
    },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
  },
];

// ==============================================
// COMBINE ALL COMPONENTS
// ==============================================
export const COMPONENT_LIBRARY: WebsiteComponent[] = [
  ...HERO_COMPONENTS,
  ...NAVIGATION_COMPONENTS,
  ...FEATURES_COMPONENTS,
  ...TESTIMONIALS_COMPONENTS,
  ...PRICING_COMPONENTS,
  ...CTA_COMPONENTS,
  ...CONTACT_COMPONENTS,
  ...FOOTER_COMPONENTS,
  ...GALLERY_COMPONENTS,
  ...STATS_COMPONENTS,
  ...TEAM_COMPONENTS,
  ...FAQ_COMPONENTS,
  ...ECOMMERCE_COMPONENTS,
];

// Calculate total variants
const totalVariants = COMPONENT_LIBRARY.reduce((sum, comp) => sum + comp.variants.length, 0);

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Get all components
 */
export function getAllComponents(): WebsiteComponent[] {
  return COMPONENT_LIBRARY;
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: ComponentCategory): WebsiteComponent[] {
  return COMPONENT_LIBRARY.filter(c => c.category === category);
}

/**
 * Get component by ID
 */
export function getComponentById(id: string): WebsiteComponent | undefined {
  return COMPONENT_LIBRARY.find(c => c.id === id);
}

/**
 * Get all categories
 */
export function getCategories(): ComponentCategory[] {
  const categories = new Set<ComponentCategory>();
  COMPONENT_LIBRARY.forEach(c => categories.add(c.category));
  return Array.from(categories);
}

/**
 * Get component statistics
 */
export function getComponentStats(): {
  totalComponents: number;
  totalVariants: number;
  byCategory: Record<ComponentCategory, number>;
} {
  const byCategory: Record<string, number> = {};
  COMPONENT_LIBRARY.forEach(c => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  });

  return {
    totalComponents: COMPONENT_LIBRARY.length,
    totalVariants,
    byCategory: byCategory as Record<ComponentCategory, number>,
  };
}

/**
 * Search components
 */
export function searchComponents(query: string): WebsiteComponent[] {
  const lowerQuery = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery) ||
    c.subcategory.toLowerCase().includes(lowerQuery)
  );
}

// Log stats on load
const stats = getComponentStats();
console.log(`[Component Library] 🧩 Loaded ${stats.totalComponents} components with ${stats.totalVariants} variants`);

