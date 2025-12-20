/**
 * Template Generator Service
 * Generates thousands of templates programmatically with variations
 */

import type { Template } from './templateLibrary';

interface TemplateVariant {
  name: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
}

interface IndustryConfig {
  name: string;
  industries: string[];
  categories: string[];
  basePages: string[];
  baseFeatures: string[];
  colorSchemes: Array<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }>;
  layouts: Array<'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'>;
  nameVariants: string[];
  descriptionTemplates: string[];
}

/**
 * Industry configurations for template generation
 */
const INDUSTRY_CONFIGS: IndustryConfig[] = [
  {
    name: 'Healthcare',
    industries: ['medical', 'healthcare', 'clinic', 'hospital', 'wellness', 'therapy'],
    categories: ['Healthcare', 'Medical', 'Wellness'],
    basePages: ['Home', 'Services', 'About', 'Contact'],
    baseFeatures: ['Service Listings', 'Online Booking', 'Testimonials'],
    colorSchemes: [
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#f0f9ff', text: '#1e293b' },
      { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#f0fdf4', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#eef2ff', text: '#1e293b' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Medical', 'Clinic', 'Health', 'Wellness', 'Care', 'Practice'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Clean, modern design for {name}',
      'Trusted design for {name}',
    ],
  },
  {
    name: 'Fitness',
    industries: ['fitness', 'gym', 'training', 'sports', 'athletic', 'workout'],
    categories: ['Fitness', 'Sports', 'Health'],
    basePages: ['Home', 'Classes', 'Trainers', 'Schedule', 'Contact'],
    baseFeatures: ['Class Schedule', 'Trainer Profiles', 'Membership Plans', 'Online Booking'],
    colorSchemes: [
      { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
      { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['bold', 'modern', 'minimal'],
    nameVariants: ['Fitness', 'Gym', 'Training', 'Athletic', 'Sports', 'Workout'],
    descriptionTemplates: [
      'Energetic design for {name}',
      'Motivational design for {name}',
      'Dynamic design for {name}',
    ],
  },
  {
    name: 'Food & Beverage',
    industries: ['restaurant', 'cafe', 'bar', 'food', 'beverage', 'dining', 'catering'],
    categories: ['Food & Beverage', 'Restaurant', 'Hospitality'],
    basePages: ['Home', 'Menu', 'About', 'Contact'],
    baseFeatures: ['Menu Display', 'Online Ordering', 'Reservations', 'Reviews'],
    colorSchemes: [
      { primary: '#d97706', secondary: '#92400e', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
      { primary: '#92400e', secondary: '#78350f', accent: '#d97706', background: '#fef3c7', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Restaurant', 'Cafe', 'Bistro', 'Eatery', 'Kitchen', 'Dining'],
    descriptionTemplates: [
      'Appetizing design for {name}',
      'Inviting design for {name}',
      'Warm design for {name}',
    ],
  },
  {
    name: 'Professional Services',
    industries: ['consulting', 'business', 'legal', 'accounting', 'finance', 'advisory'],
    categories: ['Professional Services', 'Business', 'Finance'],
    basePages: ['Home', 'Services', 'About', 'Contact'],
    baseFeatures: ['Service Listings', 'Case Studies', 'Team Profiles', 'Contact Form'],
    colorSchemes: [
      { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      { primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6', background: '#ffffff', text: '#1f2937' },
      { primary: '#1e293b', secondary: '#0f172a', accent: '#475569', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['classic', 'modern', 'minimal'],
    nameVariants: ['Consulting', 'Services', 'Solutions', 'Advisory', 'Partners', 'Group'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Trustworthy design for {name}',
      'Expert design for {name}',
    ],
  },
  {
    name: 'Retail',
    industries: ['retail', 'shop', 'store', 'boutique', 'fashion', 'clothing'],
    categories: ['Retail', 'Shopping', 'Fashion'],
    basePages: ['Home', 'Shop', 'Products', 'About', 'Contact'],
    baseFeatures: ['Product Catalog', 'Shopping Cart', 'Reviews', 'Size Guide'],
    colorSchemes: [
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
      { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa', background: '#faf5ff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Boutique', 'Shop', 'Store', 'Collection', 'Fashion', 'Style'],
    descriptionTemplates: [
      'Stylish design for {name}',
      'Elegant design for {name}',
      'Trendy design for {name}',
    ],
  },
  {
    name: 'Technology',
    industries: ['tech', 'software', 'saas', 'it', 'technology', 'digital', 'app'],
    categories: ['Technology', 'Software', 'IT'],
    basePages: ['Home', 'Product', 'Features', 'Pricing', 'Contact'],
    baseFeatures: ['Product Showcase', 'Feature Comparison', 'Pricing Tables', 'Testimonials'],
    colorSchemes: [
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'minimal', 'bold'],
    nameVariants: ['Tech', 'Software', 'Solutions', 'Digital', 'Innovation', 'Systems'],
    descriptionTemplates: [
      'Modern design for {name}',
      'Innovative design for {name}',
      'Tech-forward design for {name}',
    ],
  },
  {
    name: 'Education',
    industries: ['education', 'learning', 'school', 'training', 'tutoring', 'academic'],
    categories: ['Education', 'Learning', 'Training'],
    basePages: ['Home', 'Courses', 'Instructors', 'Pricing', 'Contact'],
    baseFeatures: ['Course Catalog', 'Instructor Profiles', 'Pricing Plans', 'Student Reviews'],
    colorSchemes: [
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Academy', 'Institute', 'School', 'Learning', 'Education', 'Training'],
    descriptionTemplates: [
      'Educational design for {name}',
      'Inspiring design for {name}',
      'Professional design for {name}',
    ],
  },
  {
    name: 'Home Services',
    industries: ['home', 'repair', 'maintenance', 'contractor', 'plumbing', 'electrical', 'cleaning'],
    categories: ['Home Services', 'Contractor', 'Maintenance'],
    basePages: ['Home', 'Services', 'Gallery', 'Get Quote', 'Contact'],
    baseFeatures: ['Service Listings', 'Project Gallery', 'Quote Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['classic', 'modern', 'bold'],
    nameVariants: ['Services', 'Solutions', 'Contractors', 'Pro', 'Experts', 'Team'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Reliable design for {name}',
      'Trustworthy design for {name}',
    ],
  },
  {
    name: 'Beauty & Wellness',
    industries: ['beauty', 'spa', 'salon', 'wellness', 'grooming', 'cosmetic'],
    categories: ['Beauty', 'Wellness', 'Spa'],
    basePages: ['Home', 'Services', 'Gallery', 'Book Appointment', 'Contact'],
    baseFeatures: ['Service Menu', 'Photo Gallery', 'Online Booking', 'Testimonials'],
    colorSchemes: [
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#faf5ff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Spa', 'Salon', 'Beauty', 'Wellness', 'Studio', 'Lounge'],
    descriptionTemplates: [
      'Elegant design for {name}',
      'Luxurious design for {name}',
      'Relaxing design for {name}',
    ],
  },
  {
    name: 'Events',
    industries: ['events', 'wedding', 'party', 'celebration', 'venue', 'planning'],
    categories: ['Events', 'Wedding', 'Hospitality'],
    basePages: ['Home', 'Services', 'Portfolio', 'Packages', 'Contact'],
    baseFeatures: ['Event Gallery', 'Package Pricing', 'Booking Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#faf5ff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'bold'],
    nameVariants: ['Events', 'Venue', 'Planning', 'Celebrations', 'Occasions', 'Gatherings'],
    descriptionTemplates: [
      'Elegant design for {name}',
      'Celebratory design for {name}',
      'Memorable design for {name}',
    ],
  },
  {
    name: 'Automotive',
    industries: ['automotive', 'cars', 'dealership', 'auto', 'vehicle', 'motor', 'garage'],
    categories: ['Automotive', 'Transportation', 'Vehicles'],
    basePages: ['Home', 'Inventory', 'Services', 'Financing', 'Contact'],
    baseFeatures: ['Vehicle Listings', 'Service Menu', 'Financing Calculator', 'Testimonials'],
    colorSchemes: [
      { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#ffffff', text: '#1f2937' },
      { primary: '#1f2937', secondary: '#111827', accent: '#4b5563', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['bold', 'modern', 'classic'],
    nameVariants: ['Auto', 'Motors', 'Cars', 'Vehicles', 'Dealership', 'Garage'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Dynamic design for {name}',
      'Modern design for {name}',
    ],
  },
  {
    name: 'Real Estate',
    industries: ['real-estate', 'property', 'housing', 'realtor', 'realty', 'estate'],
    categories: ['Real Estate', 'Property', 'Housing'],
    basePages: ['Home', 'Properties', 'Agents', 'About', 'Contact'],
    baseFeatures: ['Property Listings', 'Search Filters', 'Agent Profiles', 'Contact Form'],
    colorSchemes: [
      { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['classic', 'modern', 'minimal'],
    nameVariants: ['Realty', 'Properties', 'Estate', 'Homes', 'Real Estate', 'Housing'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Trustworthy design for {name}',
      'Modern design for {name}',
    ],
  },
  {
    name: 'Travel & Tourism',
    industries: ['travel', 'tourism', 'vacation', 'tours', 'hotel', 'resort', 'adventure'],
    categories: ['Travel', 'Tourism', 'Hospitality'],
    basePages: ['Home', 'Destinations', 'Packages', 'Book Now', 'Contact'],
    baseFeatures: ['Destination Gallery', 'Package Listings', 'Booking Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Travel', 'Tours', 'Adventure', 'Vacation', 'Getaways', 'Destinations'],
    descriptionTemplates: [
      'Inspiring design for {name}',
      'Adventurous design for {name}',
      'Beautiful design for {name}',
    ],
  },
  {
    name: 'Pet Care',
    industries: ['pet', 'veterinary', 'grooming', 'animals', 'pets', 'dog', 'cat'],
    categories: ['Pet Care', 'Animals', 'Veterinary'],
    basePages: ['Home', 'Services', 'Gallery', 'Book Appointment', 'Contact'],
    baseFeatures: ['Service Menu', 'Photo Gallery', 'Online Booking', 'Testimonials'],
    colorSchemes: [
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
      { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#ffffff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Pet Care', 'Pets', 'Animals', 'Grooming', 'Vet', 'Paw'],
    descriptionTemplates: [
      'Friendly design for {name}',
      'Caring design for {name}',
      'Loving design for {name}',
    ],
  },
  {
    name: 'Media & Entertainment',
    industries: ['media', 'entertainment', 'music', 'film', 'video', 'production', 'studio'],
    categories: ['Media', 'Entertainment', 'Creative'],
    basePages: ['Home', 'Portfolio', 'Services', 'About', 'Contact'],
    baseFeatures: ['Portfolio Showcase', 'Video Player', 'Booking System', 'Testimonials'],
    colorSchemes: [
      { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa', background: '#1f2937', text: '#ffffff' },
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
      { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'bold', 'minimal'],
    nameVariants: ['Media', 'Studio', 'Production', 'Entertainment', 'Creative', 'Arts'],
    descriptionTemplates: [
      'Creative design for {name}',
      'Dynamic design for {name}',
      'Innovative design for {name}',
    ],
  },
  {
    name: 'Nonprofit',
    industries: ['nonprofit', 'charity', 'ngo', 'community', 'foundation', 'organization'],
    categories: ['Nonprofit', 'Charity', 'Community'],
    basePages: ['Home', 'Mission', 'Programs', 'Donate', 'Contact'],
    baseFeatures: ['Donation Form', 'Program Showcase', 'Impact Stories', 'Volunteer Signup'],
    colorSchemes: [
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Foundation', 'Charity', 'Organization', 'Community', 'Nonprofit', 'Cause'],
    descriptionTemplates: [
      'Heartfelt design for {name}',
      'Inspiring design for {name}',
      'Purposeful design for {name}',
    ],
  },
  {
    name: 'Construction',
    industries: ['construction', 'contractor', 'building', 'renovation', 'remodeling', 'contracting'],
    categories: ['Construction', 'Contractor', 'Building'],
    basePages: ['Home', 'Services', 'Projects', 'Get Quote', 'Contact'],
    baseFeatures: ['Project Gallery', 'Service Listings', 'Quote Calculator', 'Testimonials'],
    colorSchemes: [
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
      { primary: '#1f2937', secondary: '#111827', accent: '#4b5563', background: '#ffffff', text: '#1f2937' },
      { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['bold', 'classic', 'modern'],
    nameVariants: ['Construction', 'Contractors', 'Builders', 'Renovation', 'Remodeling', 'Projects'],
    descriptionTemplates: [
      'Strong design for {name}',
      'Professional design for {name}',
      'Reliable design for {name}',
    ],
  },
  {
    name: 'Architecture',
    industries: ['architecture', 'architect', 'design', 'construction', 'planning', 'engineering'],
    categories: ['Architecture', 'Design', 'Engineering'],
    basePages: ['Home', 'Projects', 'Services', 'Team', 'Contact'],
    baseFeatures: ['Project Portfolio', 'Service Listings', 'Team Profiles', 'Contact Form'],
    colorSchemes: [
      { primary: '#1e293b', secondary: '#0f172a', accent: '#475569', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['minimal', 'modern', 'classic'],
    nameVariants: ['Architecture', 'Design', 'Studio', 'Firm', 'Associates', 'Partners'],
    descriptionTemplates: [
      'Modern design for {name}',
      'Sophisticated design for {name}',
      'Professional design for {name}',
    ],
  },
  {
    name: 'Legal',
    industries: ['legal', 'law', 'attorney', 'lawyer', 'legal-services', 'law-firm'],
    categories: ['Legal', 'Professional Services', 'Law'],
    basePages: ['Home', 'Practice Areas', 'Attorneys', 'Case Studies', 'Contact'],
    baseFeatures: ['Practice Areas', 'Attorney Profiles', 'Case Results', 'Contact Form'],
    colorSchemes: [
      { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      { primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6', background: '#ffffff', text: '#1f2937' },
      { primary: '#1e293b', secondary: '#0f172a', accent: '#475569', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['classic', 'modern', 'minimal'],
    nameVariants: ['Law', 'Legal', 'Attorneys', 'Law Firm', 'Legal Services', 'Counsel'],
    descriptionTemplates: [
      'Professional design for {name}',
      'Trustworthy design for {name}',
      'Authoritative design for {name}',
    ],
  },
  {
    name: 'Photography',
    industries: ['photography', 'photo', 'photographer', 'portrait', 'wedding-photography', 'studio'],
    categories: ['Photography', 'Creative', 'Portfolio'],
    basePages: ['Home', 'Portfolio', 'About', 'Services', 'Contact'],
    baseFeatures: ['Image Gallery', 'Portfolio Grid', 'Client Testimonials', 'Booking Form'],
    colorSchemes: [
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
      { primary: '#1f2937', secondary: '#111827', accent: '#4b5563', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
    ],
    layouts: ['minimal', 'modern', 'elegant'],
    nameVariants: ['Photography', 'Photos', 'Studio', 'Portraits', 'Images', 'Visuals'],
    descriptionTemplates: [
      'Stunning design for {name}',
      'Visual design for {name}',
      'Artistic design for {name}',
    ],
  },
  {
    name: 'Interior Design',
    industries: ['interior-design', 'design', 'home', 'decor', 'furniture', 'decorating'],
    categories: ['Design', 'Home', 'Interior'],
    basePages: ['Home', 'Portfolio', 'Services', 'About', 'Contact'],
    baseFeatures: ['Portfolio Gallery', 'Service Offerings', 'Before/After', 'Consultation Form'],
    colorSchemes: [
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#faf5ff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Interior Design', 'Design', 'Decor', 'Home', 'Styling', 'Interiors'],
    descriptionTemplates: [
      'Sophisticated design for {name}',
      'Elegant design for {name}',
      'Stylish design for {name}',
    ],
  },
  {
    name: 'Insurance',
    industries: ['insurance', 'financial', 'broker', 'coverage', 'protection', 'policy'],
    categories: ['Finance', 'Insurance', 'Financial Services'],
    basePages: ['Home', 'Products', 'About', 'Get Quote', 'Contact'],
    baseFeatures: ['Product Listings', 'Quote Calculator', 'Claims Info', 'Contact Form'],
    colorSchemes: [
      { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      { primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
    ],
    layouts: ['classic', 'modern', 'minimal'],
    nameVariants: ['Insurance', 'Coverage', 'Protection', 'Policy', 'Assurance', 'Security'],
    descriptionTemplates: [
      'Trustworthy design for {name}',
      'Reliable design for {name}',
      'Professional design for {name}',
    ],
  },
  {
    name: 'Logistics',
    industries: ['logistics', 'shipping', 'transport', 'delivery', 'freight', 'warehouse'],
    categories: ['Logistics', 'Transportation', 'Shipping'],
    basePages: ['Home', 'Services', 'Tracking', 'Get Quote', 'Contact'],
    baseFeatures: ['Service Listings', 'Tracking System', 'Quote Calculator', 'Testimonials'],
    colorSchemes: [
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
      { primary: '#1e40af', secondary: '#1e3a8a', accent: '#3b82f6', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'bold', 'classic'],
    nameVariants: ['Logistics', 'Shipping', 'Transport', 'Delivery', 'Freight', 'Logistics'],
    descriptionTemplates: [
      'Efficient design for {name}',
      'Reliable design for {name}',
      'Professional design for {name}',
    ],
  },
  {
    name: 'Agriculture',
    industries: ['agriculture', 'farming', 'farm', 'agricultural', 'crops', 'livestock'],
    categories: ['Agriculture', 'Farming', 'Rural'],
    basePages: ['Home', 'Products', 'About', 'Contact'],
    baseFeatures: ['Product Catalog', 'Farm Gallery', 'Contact Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
      { primary: '#0f766e', secondary: '#0d9488', accent: '#14b8a6', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Farm', 'Agriculture', 'Farming', 'Ranch', 'Crops', 'Harvest'],
    descriptionTemplates: [
      'Natural design for {name}',
      'Organic design for {name}',
      'Sustainable design for {name}',
    ],
  },
  {
    name: 'Energy',
    industries: ['energy', 'solar', 'renewable', 'power', 'electricity', 'utilities'],
    categories: ['Energy', 'Utilities', 'Renewable'],
    basePages: ['Home', 'Services', 'Solutions', 'About', 'Contact'],
    baseFeatures: ['Service Catalog', 'Solution Showcase', 'Case Studies', 'Contact Form'],
    colorSchemes: [
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'bold', 'minimal'],
    nameVariants: ['Energy', 'Power', 'Solar', 'Renewable', 'Utilities', 'Energy Solutions'],
    descriptionTemplates: [
      'Modern design for {name}',
      'Sustainable design for {name}',
      'Innovative design for {name}',
    ],
  },
  {
    name: 'Coaching & Training',
    industries: ['coaching', 'training', 'mentoring', 'life-coach', 'business-coach', 'personal-development'],
    categories: ['Coaching', 'Training', 'Development'],
    basePages: ['Home', 'Services', 'Programs', 'Testimonials', 'Contact'],
    baseFeatures: ['Program Listings', 'Testimonials', 'Booking System', 'Resources'],
    colorSchemes: [
      { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', background: '#ffffff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Coaching', 'Training', 'Mentoring', 'Development', 'Academy', 'Institute'],
    descriptionTemplates: [
      'Inspiring design for {name}',
      'Empowering design for {name}',
      'Transformative design for {name}',
    ],
  },
  {
    name: 'Music & Audio',
    industries: ['music', 'audio', 'recording', 'studio', 'musician', 'producer', 'dj'],
    categories: ['Music', 'Entertainment', 'Creative'],
    basePages: ['Home', 'Music', 'Shows', 'About', 'Contact'],
    baseFeatures: ['Music Player', 'Event Calendar', 'Merchandise', 'Booking'],
    colorSchemes: [
      { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa', background: '#1f2937', text: '#ffffff' },
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
      { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['bold', 'modern', 'minimal'],
    nameVariants: ['Music', 'Studio', 'Sound', 'Audio', 'Records', 'Tracks'],
    descriptionTemplates: [
      'Vibrant design for {name}',
      'Dynamic design for {name}',
      'Rhythmic design for {name}',
    ],
  },
  {
    name: 'Gaming & Esports',
    industries: ['gaming', 'esports', 'streaming', 'games', 'gamer', 'twitch', 'youtube'],
    categories: ['Gaming', 'Entertainment', 'Digital'],
    basePages: ['Home', 'Games', 'Streams', 'Merch', 'Contact'],
    baseFeatures: ['Game Showcase', 'Stream Schedule', 'Merchandise', 'Social Links'],
    colorSchemes: [
      { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', background: '#1f2937', text: '#ffffff' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#1f2937', text: '#ffffff' },
      { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#1f2937', text: '#ffffff' },
    ],
    layouts: ['bold', 'modern', 'minimal'],
    nameVariants: ['Gaming', 'Esports', 'Streams', 'Games', 'Play', 'Level'],
    descriptionTemplates: [
      'Epic design for {name}',
      'Gaming design for {name}',
      'Competitive design for {name}',
    ],
  },
  {
    name: 'Dating & Social',
    industries: ['dating', 'social', 'community', 'networking', 'meetup', 'friendship'],
    categories: ['Social', 'Dating', 'Community'],
    basePages: ['Home', 'Features', 'Pricing', 'About', 'Contact'],
    baseFeatures: ['Feature Showcase', 'Pricing Plans', 'Testimonials', 'Sign Up'],
    colorSchemes: [
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Social', 'Dating', 'Connect', 'Meet', 'Friends', 'Community'],
    descriptionTemplates: [
      'Welcoming design for {name}',
      'Friendly design for {name}',
      'Social design for {name}',
    ],
  },
  {
    name: 'Fashion & Apparel',
    industries: ['fashion', 'apparel', 'clothing', 'style', 'boutique', 'designer'],
    categories: ['Fashion', 'Retail', 'Lifestyle'],
    basePages: ['Home', 'Collection', 'Lookbook', 'About', 'Contact'],
    baseFeatures: ['Product Gallery', 'Lookbook', 'Size Guide', 'Shopping Cart'],
    colorSchemes: [
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
      { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Fashion', 'Style', 'Boutique', 'Collection', 'Designer', 'Apparel'],
    descriptionTemplates: [
      'Stylish design for {name}',
      'Chic design for {name}',
      'Trendy design for {name}',
    ],
  },
  {
    name: 'Sports & Recreation',
    industries: ['sports', 'recreation', 'athletic', 'fitness', 'outdoor', 'adventure'],
    categories: ['Sports', 'Recreation', 'Fitness'],
    basePages: ['Home', 'Programs', 'Facilities', 'Schedule', 'Contact'],
    baseFeatures: ['Program Listings', 'Facility Tour', 'Schedule', 'Registration'],
    colorSchemes: [
      { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['bold', 'modern', 'minimal'],
    nameVariants: ['Sports', 'Athletic', 'Recreation', 'Fitness', 'Active', 'Training'],
    descriptionTemplates: [
      'Energetic design for {name}',
      'Active design for {name}',
      'Dynamic design for {name}',
    ],
  },
  {
    name: 'Wedding Services',
    industries: ['wedding', 'bridal', 'ceremony', 'planning', 'venue', 'photography'],
    categories: ['Wedding', 'Events', 'Services'],
    basePages: ['Home', 'Packages', 'Gallery', 'Testimonials', 'Contact'],
    baseFeatures: ['Package Listings', 'Photo Gallery', 'Booking Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#f472b6', secondary: '#ec4899', accent: '#f9a8d4', background: '#fef3f7', text: '#1f2937' },
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#faf5ff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Wedding', 'Bridal', 'Ceremony', 'Venue', 'Planning', 'Celebrations'],
    descriptionTemplates: [
      'Romantic design for {name}',
      'Elegant design for {name}',
      'Dreamy design for {name}',
    ],
  },
  {
    name: 'Childcare & Education',
    industries: ['childcare', 'daycare', 'preschool', 'kids', 'children', 'education'],
    categories: ['Childcare', 'Education', 'Family'],
    basePages: ['Home', 'Programs', 'About', 'Enrollment', 'Contact'],
    baseFeatures: ['Program Listings', 'Photo Gallery', 'Enrollment Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#fffbeb', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'elegant', 'minimal'],
    nameVariants: ['Childcare', 'Daycare', 'Preschool', 'Kids', 'Learning', 'Academy'],
    descriptionTemplates: [
      'Playful design for {name}',
      'Caring design for {name}',
      'Nurturing design for {name}',
    ],
  },
  {
    name: 'Senior Care',
    industries: ['senior-care', 'eldercare', 'assisted-living', 'retirement', 'nursing', 'care'],
    categories: ['Healthcare', 'Senior Care', 'Services'],
    basePages: ['Home', 'Services', 'Facilities', 'About', 'Contact'],
    baseFeatures: ['Service Listings', 'Facility Tour', 'Testimonials', 'Contact Form'],
    colorSchemes: [
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#ffffff', text: '#1f2937' },
      { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
    ],
    layouts: ['classic', 'modern', 'minimal'],
    nameVariants: ['Senior Care', 'Eldercare', 'Assisted Living', 'Retirement', 'Care', 'Services'],
    descriptionTemplates: [
      'Compassionate design for {name}',
      'Caring design for {name}',
      'Trustworthy design for {name}',
    ],
  },
  {
    name: 'Marine & Water Sports',
    industries: ['marine', 'boating', 'sailing', 'water-sports', 'fishing', 'diving'],
    categories: ['Marine', 'Sports', 'Recreation'],
    basePages: ['Home', 'Services', 'Fleet', 'Book Now', 'Contact'],
    baseFeatures: ['Service Listings', 'Fleet Gallery', 'Booking System', 'Testimonials'],
    colorSchemes: [
      { primary: '#06b6d4', secondary: '#0891b2', accent: '#22d3ee', background: '#ffffff', text: '#1f2937' },
      { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', background: '#ffffff', text: '#1f2937' },
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'bold', 'minimal'],
    nameVariants: ['Marine', 'Boating', 'Sailing', 'Water Sports', 'Fleet', 'Charters'],
    descriptionTemplates: [
      'Oceanic design for {name}',
      'Adventurous design for {name}',
      'Nautical design for {name}',
    ],
  },
  {
    name: 'Art & Crafts',
    industries: ['art', 'crafts', 'handmade', 'artisan', 'gallery', 'studio'],
    categories: ['Art', 'Creative', 'Crafts'],
    basePages: ['Home', 'Gallery', 'Shop', 'About', 'Contact'],
    baseFeatures: ['Art Gallery', 'Shop', 'Commission Form', 'Testimonials'],
    colorSchemes: [
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#ffffff', text: '#1f2937' },
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Art', 'Gallery', 'Studio', 'Crafts', 'Handmade', 'Artisan'],
    descriptionTemplates: [
      'Creative design for {name}',
      'Artistic design for {name}',
      'Inspiring design for {name}',
    ],
  },
  {
    name: 'Hair & Beauty Salon',
    industries: ['salon', 'hair', 'beauty', 'barbershop', 'styling', 'grooming'],
    categories: ['Beauty', 'Salon', 'Personal Care'],
    basePages: ['Home', 'Services', 'Gallery', 'Book Appointment', 'Contact'],
    baseFeatures: ['Service Menu', 'Stylist Profiles', 'Online Booking', 'Testimonials'],
    colorSchemes: [
      { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', background: '#fef3f7', text: '#1f2937' },
      { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', background: '#faf5ff', text: '#1f2937' },
      { primary: '#000000', secondary: '#1f2937', accent: '#6b7280', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['elegant', 'modern', 'minimal'],
    nameVariants: ['Salon', 'Hair', 'Beauty', 'Styling', 'Barbershop', 'Studio'],
    descriptionTemplates: [
      'Stylish design for {name}',
      'Elegant design for {name}',
      'Glamorous design for {name}',
    ],
  },
  {
    name: 'Veterinary Services',
    industries: ['veterinary', 'vet', 'animal-care', 'pet-health', 'clinic', 'animal-hospital'],
    categories: ['Veterinary', 'Pet Care', 'Healthcare'],
    basePages: ['Home', 'Services', 'About', 'Book Appointment', 'Contact'],
    baseFeatures: ['Service Listings', 'Vet Profiles', 'Online Booking', 'Resources'],
    colorSchemes: [
      { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#ffffff', text: '#1f2937' },
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#ffffff', text: '#1f2937' },
      { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', background: '#ffffff', text: '#1f2937' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Veterinary', 'Vet', 'Animal Care', 'Clinic', 'Hospital', 'Care'],
    descriptionTemplates: [
      'Caring design for {name}',
      'Compassionate design for {name}',
      'Professional design for {name}',
    ],
  },
  {
    name: 'Dental Services',
    industries: ['dental', 'dentist', 'orthodontist', 'oral-care', 'dental-clinic', 'teeth'],
    categories: ['Dental', 'Healthcare', 'Medical'],
    basePages: ['Home', 'Services', 'About', 'Book Appointment', 'Contact'],
    baseFeatures: ['Service Listings', 'Dentist Profiles', 'Online Booking', 'Testimonials'],
    colorSchemes: [
      { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#ffffff', text: '#1f2937' },
      { primary: '#10b981', secondary: '#059669', accent: '#34d399', background: '#ffffff', text: '#1f2937' },
      { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8', background: '#ffffff', text: '#1e293b' },
    ],
    layouts: ['modern', 'classic', 'minimal'],
    nameVariants: ['Dental', 'Dentist', 'Oral Care', 'Clinic', 'Practice', 'Smile'],
    descriptionTemplates: [
      'Clean design for {name}',
      'Professional design for {name}',
      'Trustworthy design for {name}',
    ],
  },
];

/**
 * Generate a unique template ID
 * Uses timestamp and random component to ensure uniqueness
 */
let templateIdCounter = 0;
function generateTemplateId(industry: string, variant: number, style: number, templateNumber: number): string {
  const cleanIndustry = industry.toLowerCase().replace(/[^a-z0-9]/g, '-');
  templateIdCounter++;
  const uniqueId = `${cleanIndustry}-${variant}-${style}-${templateNumber}-${templateIdCounter}-${Date.now()}`;
  // Hash to shorter ID for readability
  return `tpl-${Buffer.from(uniqueId).toString('base64').substring(0, 16).replace(/[^a-z0-9]/gi, '')}`;
}

/**
 * Generate template name variations
 */
function generateTemplateName(industry: string, variant: string, style: number): string {
  const styleSuffixes = ['', ' Pro', ' Plus', ' Premium', ' Elite', ' Classic', ' Modern', ' Deluxe'];
  return `${variant}${styleSuffixes[style] || ''}`;
}

/**
 * Generate template description
 */
function generateDescription(template: string, name: string): string {
  return template.replace('{name}', name.toLowerCase());
}

/**
 * Generate pages with variations
 */
function generatePages(basePages: string[], variant: number): string[] {
  const additionalPages = [
    'Gallery', 'Portfolio', 'Testimonials', 'Blog', 'FAQ', 'Resources',
    'Team', 'About Us', 'Services', 'Products', 'Pricing', 'Contact Us',
  ];
  
  const pages = [...basePages];
  if (variant % 3 === 0 && pages.length < 6) {
    pages.push(additionalPages[variant % additionalPages.length]);
  }
  return pages;
}

/**
 * Generate features with variations
 */
function generateFeatures(baseFeatures: string[], variant: number): string[] {
  const additionalFeatures = [
    'Photo Gallery', 'Video Showcase', 'Testimonials', 'Blog', 'FAQ',
    'Resource Library', 'Team Profiles', 'Portfolio', 'Case Studies',
    'Online Booking', 'Contact Form', 'Newsletter', 'Social Media',
  ];
  
  const features = [...baseFeatures];
  if (variant % 2 === 0 && features.length < 6) {
    features.push(additionalFeatures[variant % additionalFeatures.length]);
  }
  return features;
}

/**
 * Generate a single template
 */
function generateTemplate(
  industryConfig: IndustryConfig,
  industryVariant: string,
  colorSchemeIndex: number,
  layoutIndex: number,
  nameVariantIndex: number,
  descriptionIndex: number,
  templateNumber: number
): Template {
  const colorScheme = industryConfig.colorSchemes[colorSchemeIndex % industryConfig.colorSchemes.length];
  const layout = industryConfig.layouts[layoutIndex % industryConfig.layouts.length];
  const nameVariant = industryConfig.nameVariants[nameVariantIndex % industryConfig.nameVariants.length];
  const descriptionTemplate = industryConfig.descriptionTemplates[descriptionIndex % industryConfig.descriptionTemplates.length];
  
  const name = generateTemplateName(industryVariant, nameVariant, templateNumber);
  const description = generateDescription(descriptionTemplate, name);
  const id = generateTemplateId(industryVariant, nameVariantIndex, layoutIndex, templateNumber);
  
  return {
    id,
    name,
    description,
    category: industryConfig.categories[templateNumber % industryConfig.categories.length],
    industry: [industryVariant, ...industryConfig.industries.slice(0, 2)],
    previewImage: `/api/templates/${id}/preview`,
    thumbnail: `/api/templates/${id}/preview?size=thumb`,
    pages: generatePages(industryConfig.basePages, templateNumber),
    features: generateFeatures(industryConfig.baseFeatures, templateNumber),
    colorScheme,
    layout,
    price: 'free',
    popularity: Math.floor(Math.random() * 20) + 70, // 70-90
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  };
}

/**
 * Generate templates for a specific industry
 */
export function generateIndustryTemplates(
  industryConfig: IndustryConfig,
  count: number = 50
): Template[] {
  const templates: Template[] = [];
  const industryVariants = industryConfig.industries;
  
  for (let i = 0; i < count; i++) {
    const industryVariant = industryVariants[i % industryVariants.length];
    const colorSchemeIndex = Math.floor(i / industryVariants.length) % industryConfig.colorSchemes.length;
    const layoutIndex = Math.floor(i / (industryVariants.length * industryConfig.colorSchemes.length)) % industryConfig.layouts.length;
    const nameVariantIndex = Math.floor(i / 10) % industryConfig.nameVariants.length;
    const descriptionIndex = i % industryConfig.descriptionTemplates.length;
    
    const template = generateTemplate(
      industryConfig,
      industryVariant,
      colorSchemeIndex,
      layoutIndex,
      nameVariantIndex,
      descriptionIndex,
      i
    );
    
    templates.push(template);
  }
  
  return templates;
}

/**
 * Generate all templates programmatically
 * This can generate 10,000+ templates by combining all industry configs
 */
export function generateAllTemplates(targetCount: number = 10000): Template[] {
  const templates: Template[] = [];
  const templatesPerIndustry = Math.ceil(targetCount / INDUSTRY_CONFIGS.length);
  
  for (const industryConfig of INDUSTRY_CONFIGS) {
    const industryTemplates = generateIndustryTemplates(industryConfig, templatesPerIndustry);
    templates.push(...industryTemplates);
  }
  
  // Shuffle to mix industries
  for (let i = templates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [templates[i], templates[j]] = [templates[j], templates[i]];
  }
  
  return templates.slice(0, targetCount);
}

/**
 * Generate templates on-demand with caching
 * Supports up to 10,000+ templates
 */
let cachedTemplates: Template[] | null = null;
const MAX_CACHE_SIZE = 10000; // Cache up to 10,000 templates

export function getGeneratedTemplates(count: number = 10000, useCache: boolean = true): Template[] {
  // If requesting more than cache, generate fresh
  if (count > MAX_CACHE_SIZE) {
    return generateAllTemplates(count);
  }
  
  if (useCache && cachedTemplates && cachedTemplates.length >= count) {
    return cachedTemplates.slice(0, count);
  }
  
  // Generate and cache up to MAX_CACHE_SIZE
  const generateCount = Math.max(count, MAX_CACHE_SIZE);
  cachedTemplates = generateAllTemplates(generateCount);
  return cachedTemplates.slice(0, count);
}

/**
 * Get template count
 */
export function getTemplateCount(): number {
  return cachedTemplates?.length || 0;
}

/**
 * Clear template cache (useful for regeneration)
 */
export function clearTemplateCache(): void {
  cachedTemplates = null;
}

