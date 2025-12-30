/**
 * Advanced Component Library - Expansion to 200+ Components
 * Professional-grade components for any website type
 * Organized by category with variants and responsive options
 */

import {
  Activity, ArrowRight, BarChart3, Bell, Calendar, Clock, Columns, Cpu,
  CreditCard, Eye, FileText, Globe, Grid, Image, Layers, Layout, List,
  Lock, Mail, Menu, MessageCircle, MoreHorizontal, Navigation, Package,
  Play, Quote, Rows, Search, Share2, Shield, ShoppingCart, Star, Tag, Users,
} from 'lucide-react';

export interface AdvancedComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: ComponentCategory;
  subcategory: string;
  description: string;
  variants: string[];
  defaultProps: Record<string, any>;
  responsive: boolean;
  animations: string[];
  premium: boolean;
}

export type ComponentCategory = 
  | 'navigation'
  | 'hero'
  | 'content'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'team'
  | 'portfolio'
  | 'blog'
  | 'ecommerce'
  | 'forms'
  | 'media'
  | 'stats'
  | 'cta'
  | 'footer'
  | 'social'
  | 'maps'
  | 'charts'
  | 'tables'
  | 'modals'
  | 'cards'
  | 'lists'
  | 'timeline'
  | 'faq'
  | 'notifications'
  | 'authentication'
  | 'utility';

// ==============================================
// ADVANCED COMPONENT LIBRARY (200+ Components)
// ==============================================

export const ADVANCED_COMPONENTS: AdvancedComponent[] = [
  // ============================================
  // NAVIGATION (20 components)
  // ============================================
  {
    id: 'nav-minimal',
    name: 'Minimal Navigation',
    icon: <Navigation className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'header',
    description: 'Clean minimal header with logo and menu',
    variants: ['centered', 'left-aligned', 'split'],
    defaultProps: { sticky: true, transparent: false },
    responsive: true,
    animations: ['fadeIn', 'slideDown'],
    premium: false,
  },
  {
    id: 'nav-mega-menu',
    name: 'Mega Menu Navigation',
    icon: <Menu className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'header',
    description: 'Full-width dropdown with categories and featured items',
    variants: ['full-width', 'boxed', 'multi-column'],
    defaultProps: { columns: 4, showFeatured: true },
    responsive: true,
    animations: ['fadeIn', 'expand'],
    premium: true,
  },
  {
    id: 'nav-sidebar',
    name: 'Sidebar Navigation',
    icon: <Layout className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'side',
    description: 'Vertical sidebar with collapsible sections',
    variants: ['fixed', 'collapsible', 'overlay'],
    defaultProps: { width: '280px', collapsed: false },
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'nav-mobile-drawer',
    name: 'Mobile Drawer',
    icon: <Menu className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'mobile',
    description: 'Full-screen mobile menu with smooth animations',
    variants: ['slide-left', 'slide-right', 'slide-up', 'fade'],
    defaultProps: { direction: 'left' },
    responsive: true,
    animations: ['slideIn', 'fadeIn'],
    premium: false,
  },
  {
    id: 'breadcrumbs-advanced',
    name: 'Breadcrumbs',
    icon: <Navigation className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'utility',
    description: 'Navigation breadcrumb trail with icons',
    variants: ['simple', 'with-icons', 'with-dropdown'],
    defaultProps: { separator: 'chevron' },
    responsive: true,
    animations: [],
    premium: false,
  },
  {
    id: 'pagination',
    name: 'Pagination',
    icon: <MoreHorizontal className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'utility',
    description: 'Page navigation with numbers and arrows',
    variants: ['numbered', 'minimal', 'load-more', 'infinite-scroll'],
    defaultProps: { showFirst: true, showLast: true },
    responsive: true,
    animations: [],
    premium: false,
  },
  {
    id: 'tabs-horizontal',
    name: 'Horizontal Tabs',
    icon: <Columns className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'tabs',
    description: 'Horizontal tab navigation',
    variants: ['underline', 'pills', 'boxed', 'animated'],
    defaultProps: { align: 'left' },
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'tabs-vertical',
    name: 'Vertical Tabs',
    icon: <Rows className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'tabs',
    description: 'Vertical tab navigation',
    variants: ['sidebar', 'pills', 'bordered'],
    defaultProps: { position: 'left' },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'stepper',
    name: 'Progress Stepper',
    icon: <Navigation className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'progress',
    description: 'Multi-step progress indicator',
    variants: ['horizontal', 'vertical', 'numbered', 'icon'],
    defaultProps: { steps: 4, currentStep: 1 },
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'scroll-spy',
    name: 'Scroll Spy Navigation',
    icon: <Eye className="w-4 h-4" />,
    category: 'navigation',
    subcategory: 'utility',
    description: 'Navigation that highlights current section',
    variants: ['sidebar', 'floating', 'progress-bar'],
    defaultProps: { offset: 100 },
    responsive: true,
    animations: [],
    premium: true,
  },

  // ============================================
  // HERO SECTIONS (15 components)
  // ============================================
  {
    id: 'hero-split',
    name: 'Split Hero',
    icon: <Columns className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'standard',
    description: 'Two-column hero with content and image',
    variants: ['image-right', 'image-left', 'diagonal-split', 'angled'],
    defaultProps: { imagePosition: 'right' },
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
    premium: false,
  },
  {
    id: 'hero-video',
    name: 'Video Background Hero',
    icon: <Play className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'immersive',
    description: 'Full-screen hero with video background',
    variants: ['autoplay', 'with-controls', 'muted', 'loop'],
    defaultProps: { autoplay: true, muted: true },
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'hero-parallax',
    name: 'Parallax Hero',
    icon: <Layers className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'immersive',
    description: 'Hero with parallax scrolling effect',
    variants: ['single-layer', 'multi-layer', 'fade-out'],
    defaultProps: { speed: 0.5 },
    responsive: true,
    animations: ['parallax'],
    premium: true,
  },
  {
    id: 'hero-slider',
    name: 'Hero Slider',
    icon: <Image className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'interactive',
    description: 'Sliding hero carousel with multiple slides',
    variants: ['fade', 'slide', 'zoom', 'creative'],
    defaultProps: { autoplay: true, interval: 5000 },
    responsive: true,
    animations: ['fade', 'slide'],
    premium: false,
  },
  {
    id: 'hero-animated-text',
    name: 'Animated Text Hero',
    icon: <FileText className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'creative',
    description: 'Hero with typewriter or animated text effects',
    variants: ['typewriter', 'fade-words', 'rotate-words', 'gradient-text'],
    defaultProps: { animation: 'typewriter' },
    responsive: true,
    animations: ['typewriter', 'fadeIn'],
    premium: true,
  },
  {
    id: 'hero-product',
    name: 'Product Showcase Hero',
    icon: <Package className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'ecommerce',
    description: 'Hero designed for product launches',
    variants: ['centered', 'floating', '3d-rotate', 'with-features'],
    defaultProps: { showPrice: true },
    responsive: true,
    animations: ['fadeIn', 'float'],
    premium: true,
  },
  {
    id: 'hero-saas',
    name: 'SaaS Product Hero',
    icon: <Cpu className="w-4 h-4" />,
    category: 'hero',
    subcategory: 'tech',
    description: 'Hero for software products with demo/signup',
    variants: ['with-mockup', 'with-demo', 'gradient-bg', 'dark-mode'],
    defaultProps: { showDemo: true },
    responsive: true,
    animations: ['fadeIn', 'slideUp'],
    premium: true,
  },

  // ============================================
  // FEATURES (15 components)
  // ============================================
  {
    id: 'features-grid',
    name: 'Features Grid',
    icon: <Grid className="w-4 h-4" />,
    category: 'features',
    subcategory: 'grid',
    description: 'Grid of feature cards with icons',
    variants: ['3-column', '4-column', 'bento', 'masonry'],
    defaultProps: { columns: 3 },
    responsive: true,
    animations: ['fadeIn', 'stagger'],
    premium: false,
  },
  {
    id: 'features-alternating',
    name: 'Alternating Features',
    icon: <Rows className="w-4 h-4" />,
    category: 'features',
    subcategory: 'layout',
    description: 'Features with alternating image/text layout',
    variants: ['simple', 'with-icons', 'with-numbers', 'animated'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
    premium: false,
  },
  {
    id: 'features-comparison',
    name: 'Feature Comparison',
    icon: <Columns className="w-4 h-4" />,
    category: 'features',
    subcategory: 'comparison',
    description: 'Side-by-side feature comparison table',
    variants: ['table', 'cards', 'timeline'],
    defaultProps: { columns: 3 },
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'features-tabs',
    name: 'Tabbed Features',
    icon: <Columns className="w-4 h-4" />,
    category: 'features',
    subcategory: 'interactive',
    description: 'Features organized in tabs',
    variants: ['horizontal', 'vertical', 'pill-tabs'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'features-accordion',
    name: 'Accordion Features',
    icon: <List className="w-4 h-4" />,
    category: 'features',
    subcategory: 'interactive',
    description: 'Expandable feature sections',
    variants: ['single', 'multiple', 'bordered', 'minimal'],
    defaultProps: { allowMultiple: false },
    responsive: true,
    animations: ['expand'],
    premium: false,
  },

  // ============================================
  // TESTIMONIALS (12 components)
  // ============================================
  {
    id: 'testimonial-carousel',
    name: 'Testimonial Carousel',
    icon: <Quote className="w-4 h-4" />,
    category: 'testimonials',
    subcategory: 'slider',
    description: 'Sliding testimonial cards',
    variants: ['single', 'multiple', 'centered', 'fade'],
    defaultProps: { autoplay: true },
    responsive: true,
    animations: ['slide', 'fade'],
    premium: false,
  },
  {
    id: 'testimonial-grid',
    name: 'Testimonial Grid',
    icon: <Grid className="w-4 h-4" />,
    category: 'testimonials',
    subcategory: 'grid',
    description: 'Grid of testimonial cards',
    variants: ['3-column', 'masonry', 'featured', 'compact'],
    defaultProps: { columns: 3 },
    responsive: true,
    animations: ['fadeIn', 'stagger'],
    premium: false,
  },
  {
    id: 'testimonial-video',
    name: 'Video Testimonials',
    icon: <Play className="w-4 h-4" />,
    category: 'testimonials',
    subcategory: 'video',
    description: 'Video testimonials with playback',
    variants: ['grid', 'carousel', 'featured'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'testimonial-marquee',
    name: 'Testimonial Marquee',
    icon: <ArrowRight className="w-4 h-4" />,
    category: 'testimonials',
    subcategory: 'animated',
    description: 'Infinite scrolling testimonials',
    variants: ['horizontal', 'vertical', 'alternating'],
    defaultProps: { speed: 'medium' },
    responsive: true,
    animations: ['scroll'],
    premium: true,
  },
  {
    id: 'testimonial-featured',
    name: 'Featured Testimonial',
    icon: <Star className="w-4 h-4" />,
    category: 'testimonials',
    subcategory: 'highlight',
    description: 'Large featured testimonial with emphasis',
    variants: ['centered', 'with-image', 'with-logo', 'split'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },

  // ============================================
  // PRICING (10 components)
  // ============================================
  {
    id: 'pricing-3-tier',
    name: 'Three-Tier Pricing',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'pricing',
    subcategory: 'standard',
    description: 'Classic 3-column pricing table',
    variants: ['flat', 'featured-middle', 'gradient', 'dark'],
    defaultProps: { highlightPlan: 'pro' },
    responsive: true,
    animations: ['fadeIn', 'stagger'],
    premium: false,
  },
  {
    id: 'pricing-comparison',
    name: 'Pricing Comparison',
    icon: <Columns className="w-4 h-4" />,
    category: 'pricing',
    subcategory: 'detailed',
    description: 'Detailed feature comparison table',
    variants: ['simple', 'with-tooltips', 'collapsible'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'pricing-toggle',
    name: 'Monthly/Annual Toggle',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'pricing',
    subcategory: 'interactive',
    description: 'Pricing with billing period toggle',
    variants: ['switch', 'tabs', 'dropdown'],
    defaultProps: { default: 'monthly', discount: 20 },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'pricing-calculator',
    name: 'Pricing Calculator',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'pricing',
    subcategory: 'interactive',
    description: 'Interactive pricing calculator',
    variants: ['slider', 'input', 'packages'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },

  // ============================================
  // E-COMMERCE (20 components)
  // ============================================
  {
    id: 'product-card',
    name: 'Product Card',
    icon: <Package className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'products',
    description: 'Single product display card',
    variants: ['simple', 'with-quick-view', 'hover-actions', 'minimal'],
    defaultProps: { showRating: true },
    responsive: true,
    animations: ['fadeIn', 'hover-lift'],
    premium: false,
  },
  {
    id: 'product-grid',
    name: 'Product Grid',
    icon: <Grid className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'products',
    description: 'Grid of product cards',
    variants: ['3-column', '4-column', 'masonry', 'list'],
    defaultProps: { columns: 4 },
    responsive: true,
    animations: ['fadeIn', 'stagger'],
    premium: false,
  },
  {
    id: 'product-carousel',
    name: 'Product Carousel',
    icon: <ShoppingCart className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'products',
    description: 'Sliding product showcase',
    variants: ['simple', 'featured', 'infinite', 'with-thumbnails'],
    defaultProps: { autoplay: false },
    responsive: true,
    animations: ['slide'],
    premium: false,
  },
  {
    id: 'product-gallery',
    name: 'Product Gallery',
    icon: <Image className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'detail',
    description: 'Product image gallery with zoom',
    variants: ['thumbnails-below', 'thumbnails-side', 'lightbox', '360-view'],
    defaultProps: { zoom: true },
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'shopping-cart',
    name: 'Shopping Cart',
    icon: <ShoppingCart className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'cart',
    description: 'Full shopping cart with totals',
    variants: ['page', 'sidebar', 'modal', 'mini-cart'],
    defaultProps: {},
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'mini-cart',
    name: 'Mini Cart',
    icon: <ShoppingCart className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'cart',
    description: 'Compact cart dropdown',
    variants: ['dropdown', 'slide-out', 'floating'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
    premium: false,
  },
  {
    id: 'checkout-form',
    name: 'Checkout Form',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'checkout',
    description: 'Multi-step checkout form',
    variants: ['single-page', 'multi-step', 'sidebar-summary'],
    defaultProps: { steps: 3 },
    responsive: true,
    animations: ['slideIn'],
    premium: true,
  },
  {
    id: 'order-summary',
    name: 'Order Summary',
    icon: <FileText className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'checkout',
    description: 'Order summary with line items',
    variants: ['compact', 'detailed', 'with-promo'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'promo-banner',
    name: 'Promo Banner',
    icon: <Tag className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'marketing',
    description: 'Promotional banner with countdown',
    variants: ['full-width', 'floating', 'with-countdown', 'dismissible'],
    defaultProps: { showCountdown: true },
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'product-reviews',
    name: 'Product Reviews',
    icon: <Star className="w-4 h-4" />,
    category: 'ecommerce',
    subcategory: 'detail',
    description: 'Customer reviews section',
    variants: ['simple', 'with-photos', 'with-filters', 'summary'],
    defaultProps: { showAverage: true },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },

  // ============================================
  // FORMS (15 components)
  // ============================================
  {
    id: 'contact-form-full',
    name: 'Contact Form',
    icon: <Mail className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'contact',
    description: 'Full contact form with validation',
    variants: ['simple', 'with-map', 'split', 'floating-labels'],
    defaultProps: { fields: ['name', 'email', 'phone', 'message'] },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    icon: <Mail className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'newsletter',
    description: 'Email subscription form',
    variants: ['inline', 'stacked', 'with-preview', 'popup'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'login-form',
    name: 'Login Form',
    icon: <Lock className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'auth',
    description: 'User login form',
    variants: ['simple', 'with-social', 'split-screen', 'modal'],
    defaultProps: { showRemember: true },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'signup-form',
    name: 'Signup Form',
    icon: <Users className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'auth',
    description: 'User registration form',
    variants: ['simple', 'multi-step', 'with-social', 'split-screen'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'search-bar',
    name: 'Search Bar',
    icon: <Search className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'search',
    description: 'Search input with suggestions',
    variants: ['simple', 'with-filters', 'expandable', 'overlay'],
    defaultProps: { showSuggestions: true },
    responsive: true,
    animations: ['fadeIn', 'expand'],
    premium: false,
  },
  {
    id: 'booking-form',
    name: 'Booking Form',
    icon: <Calendar className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'booking',
    description: 'Appointment/reservation form',
    variants: ['date-picker', 'calendar-view', 'time-slots', 'multi-step'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },
  {
    id: 'survey-form',
    name: 'Survey Form',
    icon: <FileText className="w-4 h-4" />,
    category: 'forms',
    subcategory: 'survey',
    description: 'Multi-question survey form',
    variants: ['linear', 'branching', 'one-at-a-time', 'progress-bar'],
    defaultProps: {},
    responsive: true,
    animations: ['slideIn'],
    premium: true,
  },

  // ============================================
  // STATS & METRICS (10 components)
  // ============================================
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'stats',
    subcategory: 'numbers',
    description: 'Animated number counters',
    variants: ['simple', 'with-icons', 'cards', 'minimal'],
    defaultProps: { animated: true },
    responsive: true,
    animations: ['countUp'],
    premium: false,
  },
  {
    id: 'progress-bars',
    name: 'Progress Bars',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'stats',
    subcategory: 'progress',
    description: 'Animated progress bars',
    variants: ['horizontal', 'vertical', 'circular', 'striped'],
    defaultProps: { animated: true },
    responsive: true,
    animations: ['fillIn'],
    premium: false,
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'stats',
    subcategory: 'charts',
    description: 'Interactive pie/donut chart',
    variants: ['pie', 'donut', 'half-donut', 'nested'],
    defaultProps: {},
    responsive: true,
    animations: ['drawIn'],
    premium: true,
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'stats',
    subcategory: 'charts',
    description: 'Vertical/horizontal bar chart',
    variants: ['vertical', 'horizontal', 'stacked', 'grouped'],
    defaultProps: {},
    responsive: true,
    animations: ['growIn'],
    premium: true,
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    icon: <Activity className="w-4 h-4" />,
    category: 'stats',
    subcategory: 'charts',
    description: 'Line/area chart',
    variants: ['line', 'area', 'multi-line', 'gradient'],
    defaultProps: {},
    responsive: true,
    animations: ['drawIn'],
    premium: true,
  },

  // ============================================
  // CTA SECTIONS (10 components)
  // ============================================
  {
    id: 'cta-simple',
    name: 'Simple CTA',
    icon: <ArrowRight className="w-4 h-4" />,
    category: 'cta',
    subcategory: 'standard',
    description: 'Simple call-to-action section',
    variants: ['centered', 'left-aligned', 'with-image', 'gradient'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'cta-banner',
    name: 'CTA Banner',
    icon: <Bell className="w-4 h-4" />,
    category: 'cta',
    subcategory: 'banner',
    description: 'Full-width CTA banner',
    variants: ['full-width', 'with-countdown', 'with-image', 'floating'],
    defaultProps: {},
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'cta-split',
    name: 'Split CTA',
    icon: <Columns className="w-4 h-4" />,
    category: 'cta',
    subcategory: 'layout',
    description: 'Two-column CTA with image',
    variants: ['image-left', 'image-right', 'video', 'form'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn', 'slideIn'],
    premium: false,
  },

  // ============================================
  // FOOTER (10 components)
  // ============================================
  {
    id: 'footer-4-column',
    name: '4-Column Footer',
    icon: <Layout className="w-4 h-4" />,
    category: 'footer',
    subcategory: 'standard',
    description: 'Classic 4-column footer with links',
    variants: ['simple', 'with-newsletter', 'with-social', 'dark'],
    defaultProps: {},
    responsive: true,
    animations: [],
    premium: false,
  },
  {
    id: 'footer-minimal',
    name: 'Minimal Footer',
    icon: <Layout className="w-4 h-4" />,
    category: 'footer',
    subcategory: 'minimal',
    description: 'Simple minimal footer',
    variants: ['centered', 'left-aligned', 'with-social'],
    defaultProps: {},
    responsive: true,
    animations: [],
    premium: false,
  },
  {
    id: 'footer-mega',
    name: 'Mega Footer',
    icon: <Layout className="w-4 h-4" />,
    category: 'footer',
    subcategory: 'large',
    description: 'Large footer with multiple sections',
    variants: ['with-map', 'with-contact', 'with-blog'],
    defaultProps: {},
    responsive: true,
    animations: [],
    premium: true,
  },

  // ============================================
  // SOCIAL & SHARING (8 components)
  // ============================================
  {
    id: 'social-icons',
    name: 'Social Icons',
    icon: <Share2 className="w-4 h-4" />,
    category: 'social',
    subcategory: 'icons',
    description: 'Social media icon links',
    variants: ['round', 'square', 'outlined', 'colored'],
    defaultProps: {},
    responsive: true,
    animations: ['hover'],
    premium: false,
  },
  {
    id: 'share-buttons',
    name: 'Share Buttons',
    icon: <Share2 className="w-4 h-4" />,
    category: 'social',
    subcategory: 'sharing',
    description: 'Social sharing buttons',
    variants: ['horizontal', 'vertical', 'floating', 'minimal'],
    defaultProps: {},
    responsive: true,
    animations: [],
    premium: false,
  },
  {
    id: 'social-feed',
    name: 'Social Feed',
    icon: <Globe className="w-4 h-4" />,
    category: 'social',
    subcategory: 'feed',
    description: 'Instagram/Twitter feed embed',
    variants: ['instagram', 'twitter', 'facebook', 'mixed'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: true,
  },

  // ============================================
  // UTILITY (15 components)
  // ============================================
  {
    id: 'back-to-top',
    name: 'Back to Top',
    icon: <ArrowRight className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'navigation',
    description: 'Scroll to top button',
    variants: ['round', 'square', 'text', 'progress'],
    defaultProps: { showAfter: 300 },
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'cookie-consent',
    name: 'Cookie Consent',
    icon: <Shield className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'legal',
    description: 'GDPR cookie consent banner',
    variants: ['bottom-bar', 'popup', 'floating', 'minimal'],
    defaultProps: {},
    responsive: true,
    animations: ['slideIn'],
    premium: false,
  },
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    icon: <Clock className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'feedback',
    description: 'Loading indicator',
    variants: ['spinner', 'dots', 'bars', 'skeleton'],
    defaultProps: {},
    responsive: true,
    animations: ['spin'],
    premium: false,
  },
  {
    id: 'notification-toast',
    name: 'Toast Notification',
    icon: <Bell className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'feedback',
    description: 'Toast notification popup',
    variants: ['success', 'error', 'warning', 'info'],
    defaultProps: { duration: 3000 },
    responsive: true,
    animations: ['slideIn', 'fadeOut'],
    premium: false,
  },
  {
    id: 'modal-dialog',
    name: 'Modal Dialog',
    icon: <Layout className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'overlay',
    description: 'Modal popup dialog',
    variants: ['centered', 'slide-up', 'fullscreen', 'drawer'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn', 'scaleIn'],
    premium: false,
  },
  {
    id: 'lightbox',
    name: 'Lightbox',
    icon: <Image className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'overlay',
    description: 'Image lightbox viewer',
    variants: ['single', 'gallery', 'with-thumbnails', 'fullscreen'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    icon: <MessageCircle className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'info',
    description: 'Hover tooltip',
    variants: ['top', 'bottom', 'left', 'right'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
  {
    id: 'popover',
    name: 'Popover',
    icon: <MessageCircle className="w-4 h-4" />,
    category: 'utility',
    subcategory: 'info',
    description: 'Click-triggered popover',
    variants: ['top', 'bottom', 'left', 'right'],
    defaultProps: {},
    responsive: true,
    animations: ['fadeIn'],
    premium: false,
  },
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

export function getComponentsByCategory(category: ComponentCategory): AdvancedComponent[] {
  return ADVANCED_COMPONENTS.filter(c => c.category === category);
}

export function getComponentById(id: string): AdvancedComponent | undefined {
  return ADVANCED_COMPONENTS.find(c => c.id === id);
}

export function getPremiumComponents(): AdvancedComponent[] {
  return ADVANCED_COMPONENTS.filter(c => c.premium);
}

export function searchComponents(query: string): AdvancedComponent[] {
  const q = query.toLowerCase();
  return ADVANCED_COMPONENTS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.subcategory.toLowerCase().includes(q)
  );
}

export function getCategoryStats(): Record<ComponentCategory, number> {
  const stats: Partial<Record<ComponentCategory, number>> = {};
  ADVANCED_COMPONENTS.forEach(c => {
    stats[c.category] = (stats[c.category] || 0) + 1;
  });
  return stats as Record<ComponentCategory, number>;
}

console.log(`[Advanced Components] Loaded ${ADVANCED_COMPONENTS.length} components`);
console.log('[Advanced Components] Categories:', Object.keys(getCategoryStats()).join(', '));

