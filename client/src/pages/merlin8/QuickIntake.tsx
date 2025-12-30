/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - COMPREHENSIVE USER PREFERENCE FORM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Multi-step intake form that collects ALL business info to generate unique websites.
 * Mostly click/select options - minimal typing required.
 *
 * Steps:
 * 1. Business Basics (Name, Industry, Type)
 * 2. Website Goals (Multi-select)
 * 3. Target Audience
 * 4. Design Preferences (Colors, Mood, Elements)
 * 5. Features & Functionality (Multi-select)
 * 6. Content Sections/Pages (Multi-select)
 * 7. Contact & Social Media
 * 8. Tone & Messaging
 * 9. Review & Generate
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, ArrowRight, Building2, Target, Users, Palette,
  Settings, Layout, Phone, MessageSquare, CheckCircle, Sparkles, Loader2,
  Check, Zap
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  if (!email) return true; // Empty is valid (field is optional)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone format (flexible - allows various formats)
 */
function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Empty is valid (field is optional)
  // Allow digits, spaces, dashes, parentheses, plus sign
  // Must have at least 7 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}


// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a professional description based on business info
 * FIXED: No longer produces "A small in the X industry" placeholder text
 */
function generateDescription(businessName: string, businessType?: string, industryName?: string): string {
  const industry = industryName || 'professional services';

  // Map business types to descriptive phrases
  const typeDescriptions: Record<string, string> = {
    startup: 'an innovative startup',
    small: 'a dedicated small business',
    medium: 'an established company',
    enterprise: 'a leading enterprise',
    freelancer: 'a professional freelancer',
    nonprofit: 'a passionate non-profit organization',
  };

  const typeDesc = typeDescriptions[businessType || ''] || 'a professional business';

  return `${businessName} is ${typeDesc} specializing in ${industry.toLowerCase()}. We are committed to delivering exceptional quality and outstanding customer service.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION CONFIGURATIONS - All selectable options
// ═══════════════════════════════════════════════════════════════════════════════

const BUSINESS_TYPES = [
  { id: 'startup', label: 'Startup', icon: '🚀' },
  { id: 'small', label: 'Small Business', icon: '🏪' },
  { id: 'medium', label: 'Medium Business', icon: '🏢' },
  { id: 'enterprise', label: 'Enterprise', icon: '🏛️' },
  { id: 'freelancer', label: 'Personal/Freelancer', icon: '👤' },
  { id: 'nonprofit', label: 'Non-Profit', icon: '💚' },
];

const WEBSITE_GOALS = [
  { id: 'leads', label: 'Generate Leads', icon: '📩' },
  { id: 'sell', label: 'Sell Products/Services', icon: '🛒' },
  { id: 'brand', label: 'Build Brand Awareness', icon: '🎯' },
  { id: 'info', label: 'Provide Information', icon: 'ℹ️' },
  { id: 'portfolio', label: 'Showcase Portfolio', icon: '🖼️' },
  { id: 'bookings', label: 'Accept Bookings', icon: '📅' },
  { id: 'community', label: 'Build Community', icon: '👥' },
  { id: 'donations', label: 'Collect Donations', icon: '💝' },
];

const AGE_GROUPS = [
  { id: '18-25', label: '18-25' },
  { id: '26-35', label: '26-35' },
  { id: '36-45', label: '36-45' },
  { id: '46-55', label: '46-55' },
  { id: '55+', label: '55+' },
  { id: 'all', label: 'All Ages' },
];

const AUDIENCE_TYPES = [
  { id: 'b2b', label: 'B2B (Business)', icon: '🏢' },
  { id: 'b2c', label: 'B2C (Consumer)', icon: '👤' },
  { id: 'both', label: 'Both', icon: '🤝' },
];

const INCOME_LEVELS = [
  { id: 'budget', label: 'Budget-conscious', icon: '💰' },
  { id: 'mid', label: 'Mid-range', icon: '💵' },
  { id: 'premium', label: 'Premium/Luxury', icon: '💎' },
  { id: 'na', label: 'Not relevant', icon: '➖' },
];

const COLOR_MOODS = [
  { id: 'professional', label: 'Professional/Corporate', color: '#1e40af', icon: '💼' },
  { id: 'modern', label: 'Modern/Minimalist', color: '#374151', icon: '✨' },
  { id: 'bold', label: 'Bold/Vibrant', color: '#dc2626', icon: '🔥' },
  { id: 'elegant', label: 'Elegant/Luxury', color: '#7c3aed', icon: '👑' },
  { id: 'friendly', label: 'Friendly/Playful', color: '#f59e0b', icon: '😊' },
  { id: 'natural', label: 'Natural/Organic', color: '#059669', icon: '🌿' },
  { id: 'dark', label: 'Dark/Edgy', color: '#111827', icon: '🖤' },
  { id: 'classic', label: 'Classic/Traditional', color: '#78350f', icon: '📜' },
];

const DESIGN_ELEMENTS = [
  { id: 'hero-image', label: 'Hero Section with Image', icon: '🖼️' },
  { id: 'video-bg', label: 'Video Background', icon: '🎬' },
  { id: 'animations', label: 'Animations/Transitions', icon: '✨' },
  { id: 'testimonials', label: 'Testimonials Section', icon: '💬' },
  { id: 'team', label: 'Team Section', icon: '👥' },
  { id: 'faq', label: 'FAQ Section', icon: '❓' },
  { id: 'blog', label: 'Blog/News Section', icon: '📝' },
  { id: 'gallery', label: 'Portfolio/Gallery', icon: '🎨' },
  { id: 'pricing', label: 'Pricing Table', icon: '💲' },
  { id: 'stats', label: 'Statistics/Counters', icon: '📊' },
  { id: 'logos', label: 'Client Logos', icon: '🏆' },
  { id: 'social-proof', label: 'Social Proof', icon: '⭐' },
];

const FEATURES = [
  { id: 'contact-form', label: 'Contact Form', icon: '📧' },
  { id: 'live-chat', label: 'Live Chat Widget', icon: '💬' },
  { id: 'newsletter', label: 'Newsletter Signup', icon: '📰' },
  { id: 'social-links', label: 'Social Media Links', icon: '🔗' },
  { id: 'google-maps', label: 'Google Maps', icon: '🗺️' },
  { id: 'booking', label: 'Online Booking/Calendar', icon: '📅' },
  { id: 'ecommerce', label: 'E-commerce/Shop', icon: '🛒' },
  { id: 'search', label: 'Search Functionality', icon: '🔍' },
  { id: 'multilang', label: 'Multi-language Support', icon: '🌐' },
  { id: 'member-portal', label: 'Member Login/Portal', icon: '🔐' },
  { id: 'reviews', label: 'Reviews/Ratings', icon: '⭐' },
  { id: 'downloads', label: 'Download Section', icon: '📥' },
];

const PAGE_SECTIONS = [
  { id: 'home', label: 'Home', icon: '🏠', required: true },
  { id: 'about', label: 'About Us', icon: '👋' },
  { id: 'services', label: 'Services', icon: '⚙️' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'portfolio', label: 'Portfolio/Gallery', icon: '🖼️' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'testimonials', label: 'Testimonials', icon: '💬' },
  { id: 'blog', label: 'Blog', icon: '📝' },
  { id: 'faq', label: 'FAQ', icon: '❓' },
  { id: 'contact', label: 'Contact', icon: '📞' },
  { id: 'pricing', label: 'Pricing', icon: '💲' },
  { id: 'careers', label: 'Careers', icon: '💼' },
];

const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'youtube', label: 'YouTube', icon: '📺' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'pinterest', label: 'Pinterest', icon: '📌' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

const BRAND_VOICES = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'casual', label: 'Casual', icon: '👋' },
  { id: 'authoritative', label: 'Authoritative', icon: '📢' },
  { id: 'inspirational', label: 'Inspirational', icon: '✨' },
  { id: 'playful', label: 'Playful', icon: '🎉' },
  { id: 'luxury', label: 'Luxury', icon: '💎' },
];

const CTA_STYLES = [
  { id: 'urgent', label: 'Urgent', description: '"Act Now!", "Limited Time!"' },
  { id: 'soft', label: 'Soft Sell', description: '"Learn More", "Discover"' },
  { id: 'direct', label: 'Direct', description: '"Buy Now", "Get Started"' },
  { id: 'consultative', label: 'Consultative', description: '"Let\'s Talk", "Book a Call"' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DATA INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

interface IntakeData {
  // Step 1: Business Basics
  businessName: string;
  industryId: string;
  businessType: string;

  // Step 2: Website Goals
  websiteGoals: string[];

  // Step 3: Target Audience
  ageGroups: string[];
  audienceType: string;
  incomeLevel: string;

  // Step 4: Design Preferences
  colorMood: string;
  primaryColor: string;
  secondaryColor: string;
  designElements: string[];

  // Step 5: Features
  features: string[];

  // Step 6: Pages
  pages: string[];

  // Step 7: Contact & Social
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  socialPlatforms: string[];

  // Step 8: Tone & Messaging
  brandVoice: string;
  ctaStyle: string;
  tagline: string;
  keyMessage: string;
}

const STEPS = [
  { id: 1, title: 'Business', icon: Building2 },
  { id: 2, title: 'Goals', icon: Target },
  { id: 3, title: 'Audience', icon: Users },
  { id: 4, title: 'Design', icon: Palette },
  { id: 5, title: 'Features', icon: Settings },
  { id: 6, title: 'Pages', icon: Layout },
  { id: 7, title: 'Contact', icon: Phone },
  { id: 8, title: 'Tone', icon: MessageSquare },
  { id: 9, title: 'Review', icon: CheckCircle },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface SelectableCardProps {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
  description?: string;
  color?: string;
}

function SelectableCard({ selected, onClick, icon, label, description, color }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="flex items-center gap-3">
        {color && (
          <div
            className="w-8 h-8 rounded-lg border-2 border-white/20"
            style={{ backgroundColor: color }}
          />
        )}
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <span className="text-white font-medium">{label}</span>
          {description && <p className="text-slate-400 text-sm mt-0.5">{description}</p>}
        </div>
      </div>
    </button>
  );
}

interface MultiSelectGridProps {
  options: Array<{ id: string; label: string; icon?: string; required?: boolean }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: number;
}

function MultiSelectGrid({ options, selected, onChange, columns = 2 }: MultiSelectGridProps) {
  const toggleOption = (id: string) => {
    const option = options.find(o => o.id === id);
    if (option?.required) return; // Can't deselect required options

    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={`grid grid-cols-${columns} md:grid-cols-${columns} gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map(option => (
        <SelectableCard
          key={option.id}
          selected={selected.includes(option.id)}
          onClick={() => toggleOption(option.id)}
          icon={option.icon}
          label={option.label}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

// Interface for selected template from Templates page
interface SelectedTemplate {
  id: string;
  name: string;
  category?: string;
  html?: string;
}

export default function QuickIntake() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [industriesError, setIndustriesError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null);

  const [data, setData] = useState<IntakeData>({
    // Step 1
    businessName: '',
    industryId: '',
    businessType: '',
    // Step 2
    websiteGoals: [],
    // Step 3
    ageGroups: [],
    audienceType: '',
    incomeLevel: '',
    // Step 4
    colorMood: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    designElements: [],
    // Step 5
    features: ['contact-form', 'social-links'], // Default features
    // Step 6
    pages: ['home', 'about', 'services', 'contact'], // Default pages
    // Step 7
    phone: '',
    email: '',
    address: '',
    businessHours: '',
    socialPlatforms: [],
    // Step 8
    brandVoice: '',
    ctaStyle: '',
    tagline: '',
    keyMessage: '',
  });

  // Fetch industries on mount
  useEffect(() => {
    setIndustriesError(null);
    fetch('/api/merlin8/industries')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to load industries`);
        }
        return res.json();
      })
      .then(result => {
        if (result.success) {
          setIndustries(result.industries);
        } else {
          throw new Error(result.error || 'Failed to load industries');
        }
      })
      .catch(err => {
        console.error('Failed to load industries:', err);
        setIndustriesError('Failed to load industries. Please refresh the page.');
      });
  }, []);

  // Load selected template from sessionStorage (set by Templates page)
  useEffect(() => {
    try {
      const storedTemplate = sessionStorage.getItem('selectedTemplate');
      if (storedTemplate) {
        const template = JSON.parse(storedTemplate) as SelectedTemplate;
        console.log('[QuickIntake] Loaded template from sessionStorage:', template.name);
        setSelectedTemplate(template);
        // Clear sessionStorage after loading to prevent stale template data on future visits
        sessionStorage.removeItem('selectedTemplate');
      }
    } catch (err) {
      console.error('[QuickIntake] Failed to load/parse stored template:', err);
      // Clear corrupted data to prevent future errors
      try {
        sessionStorage.removeItem('selectedTemplate');
      } catch {
        // Ignore if sessionStorage is completely inaccessible
      }
    }
  }, []);

  const updateData = <K extends keyof IntakeData>(field: K, value: IntakeData[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof IntakeData, item: string) => {
    const current = data[field] as string[];
    if (current.includes(item)) {
      updateData(field, current.filter(i => i !== item) as any);
    } else {
      updateData(field, [...current, item] as any);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // BYPASS FUNCTION - For quick testing
  // ═══════════════════════════════════════════════════════════════════════════════
  const handleBypass = () => {
    // Fill in all required fields with test data
    const testData: IntakeData = {
      // Step 1
      businessName: 'Test Company ' + Date.now().toString().slice(-4),
      industryId: industries.length > 0 ? industries[0].id : 'business',
      businessType: 'small',
      // Step 2
      websiteGoals: ['leads', 'brand'],
      // Step 3
      ageGroups: ['26-35', '36-45'],
      audienceType: 'b2b',
      incomeLevel: 'mid',
      // Step 4
      colorMood: 'professional',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      designElements: ['hero-image', 'testimonials', 'stats'],
      // Step 5
      features: ['contact-form', 'social-links', 'newsletter'],
      // Step 6
      pages: ['home', 'about', 'services', 'contact'],
      // Step 7
      phone: '0825000058',
      email: 'test@test.com',
      address: '123 Test Street',
      businessHours: 'Mon-Fri 9am-5pm',
      socialPlatforms: ['facebook', 'linkedin'],
      // Step 8
      brandVoice: 'professional',
      ctaStyle: 'direct',
      tagline: 'Excellence in Testing',
      keyMessage: 'We deliver quality results.',
    };

    setData(testData);
    setCurrentStep(9); // Jump to Review step
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Also check that industries loaded successfully (no error and at least one industry available)
        return data.businessName.trim().length >= 2 &&
               data.industryId &&
               data.businessType &&
               !industriesError &&
               industries.length > 0;
      case 2: return data.websiteGoals.length >= 1;
      case 3: return data.ageGroups.length >= 1 && data.audienceType && data.incomeLevel;
      case 4: return data.colorMood && data.designElements.length >= 1;
      case 5: return data.features.length >= 1;
      case 6: return data.pages.length >= 1;
      case 7:
        // Contact is optional, but if provided, must be valid
        return isValidEmail(data.email) && isValidPhone(data.phone);
      case 8: return data.brandVoice && data.ctaStyle;
      case 9: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      // Confirm before leaving if user has entered data
      const hasData = data.businessName.trim() !== '' ||
                      data.industryId !== '' ||
                      data.businessType !== '';
      if (hasData) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmed) return;
      }
      setLocation('/merlin8');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      // Transform flat data into the format expected by the backend
      const transformedData: Record<string, any> = {
        // Required fields
        businessName: data.businessName,
        description: generateDescription(data.businessName, data.businessType, industries.find(i => i.id === data.industryId)?.name),
        industryId: data.industryId,

        // Business basics
        businessType: data.businessType,

        // Website goals
        goals: data.websiteGoals,

        // Target audience (nested object)
        targetAudience: {
          ageGroups: data.ageGroups,
          audienceType: data.audienceType,
          incomeLevel: data.incomeLevel,
        },

        // Design preferences (nested object)
        designPreferences: {
          colorMood: data.colorMood,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          designElements: data.designElements,
        },

        // Features & pages
        features: data.features,
        pages: data.pages,

        // Contact info (nested object)
        contactInfo: {
          phone: data.phone,
          email: data.email,
          address: data.address,
          hours: data.businessHours,
          socialPlatforms: data.socialPlatforms,
        },

        // Tone & messaging (nested object)
        tone: {
          brandVoice: data.brandVoice,
          ctaStyle: data.ctaStyle,
          keyMessage: data.keyMessage,
        },

        // Tagline (top level for backward compatibility)
        tagline: data.tagline,

        // Generate images by default
        generateImages: true,
      };

      // Include template ID if a template was selected from Templates page
      if (selectedTemplate) {
        transformedData.templateId = selectedTemplate.id;
        transformedData.templateName = selectedTemplate.name;
        console.log('[QuickIntake] Using template:', selectedTemplate.name, 'ID:', selectedTemplate.id);
      }

      // Store transformed data in sessionStorage for the generating page
      sessionStorage.setItem('merlin8-intake', JSON.stringify(transformedData));

      // Navigate to generating page
      setLocation('/merlin8/generating');
    } catch (err) {
      console.error('[QuickIntake] Failed to save intake data:', err);
      alert('Failed to save your data. Please try again. If the problem persists, your browser storage may be full.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Progress Steps - Scrollable on mobile */}
            <div className="hidden lg:flex items-center gap-1">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all text-sm ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : isComplete
                            ? 'bg-green-500/20 text-green-300'
                            : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-medium hidden xl:inline">{step.title}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-4 h-0.5 ${isComplete ? 'bg-green-500/50' : 'bg-slate-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              {/* Bypass Button - For Testing */}
              <button
                onClick={handleBypass}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-all"
                title="Skip all questions with test data"
              >
                <Zap className="w-4 h-4" />
                <span>Bypass</span>
              </button>

              <div className="text-slate-400 text-sm">
                Step {currentStep} of 9
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1: BUSINESS BASICS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Tell us about your business</h2>
              <p className="text-slate-400">Basic information to get started</p>
            </div>

            <div className="space-y-6">
              {/* Business Name - Text Input */}
              <div>
                <label className="block text-white font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => updateData('businessName', e.target.value)}
                  placeholder="e.g., Phoenix Racing Team"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Industry - Dropdown */}
              <div>
                <label className="block text-white font-medium mb-2">Industry *</label>
                {industriesError ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{industriesError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-red-300 underline text-sm hover:text-red-200"
                    >
                      Refresh Page
                    </button>
                  </div>
                ) : (
                  <select
                    value={data.industryId}
                    onChange={(e) => updateData('industryId', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your industry...</option>
                    {industries.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Business Type - Card Selection */}
              <div>
                <label className="block text-white font-medium mb-3">Business Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BUSINESS_TYPES.map(type => (
                    <SelectableCard
                      key={type.id}
                      selected={data.businessType === type.id}
                      onClick={() => updateData('businessType', type.id)}
                      icon={type.icon}
                      label={type.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 2: WEBSITE GOALS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">What are your website goals?</h2>
              <p className="text-slate-400">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {WEBSITE_GOALS.map(goal => (
                <SelectableCard
                  key={goal.id}
                  selected={data.websiteGoals.includes(goal.id)}
                  onClick={() => toggleArrayItem('websiteGoals', goal.id)}
                  icon={goal.icon}
                  label={goal.label}
                />
              ))}
            </div>

            <p className="text-slate-500 text-sm text-center">
              Selected: {data.websiteGoals.length} goal{data.websiteGoals.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3: TARGET AUDIENCE */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Who is your target audience?</h2>
              <p className="text-slate-400">Help us understand who you're trying to reach</p>
            </div>

            {/* Age Groups - Multi-select */}
            <div>
              <label className="block text-white font-medium mb-3">Age Group(s) *</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {AGE_GROUPS.map(age => (
                  <SelectableCard
                    key={age.id}
                    selected={data.ageGroups.includes(age.id)}
                    onClick={() => toggleArrayItem('ageGroups', age.id)}
                    label={age.label}
                  />
                ))}
              </div>
            </div>

            {/* Audience Type - Single select */}
            <div>
              <label className="block text-white font-medium mb-3">Audience Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {AUDIENCE_TYPES.map(type => (
                  <SelectableCard
                    key={type.id}
                    selected={data.audienceType === type.id}
                    onClick={() => updateData('audienceType', type.id)}
                    icon={type.icon}
                    label={type.label}
                  />
                ))}
              </div>
            </div>

            {/* Income Level - Single select */}
            <div>
              <label className="block text-white font-medium mb-3">Income Level *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INCOME_LEVELS.map(level => (
                  <SelectableCard
                    key={level.id}
                    selected={data.incomeLevel === level.id}
                    onClick={() => updateData('incomeLevel', level.id)}
                    icon={level.icon}
                    label={level.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 4: DESIGN PREFERENCES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Design Preferences</h2>
              <p className="text-slate-400">Choose your visual style</p>
            </div>

            {/* Color Mood */}
            <div>
              <label className="block text-white font-medium mb-3">Color Mood *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COLOR_MOODS.map(mood => (
                  <SelectableCard
                    key={mood.id}
                    selected={data.colorMood === mood.id}
                    onClick={() => updateData('colorMood', mood.id)}
                    icon={mood.icon}
                    label={mood.label}
                    color={mood.color}
                  />
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => updateData('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700"
                  />
                  <span className="text-slate-400 font-mono">{data.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.secondaryColor}
                    onChange={(e) => updateData('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700"
                  />
                  <span className="text-slate-400 font-mono">{data.secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Design Elements - Multi-select */}
            <div>
              <label className="block text-white font-medium mb-3">Design Elements *</label>
              <p className="text-slate-500 text-sm mb-3">Select elements you want on your website</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DESIGN_ELEMENTS.map(element => (
                  <SelectableCard
                    key={element.id}
                    selected={data.designElements.includes(element.id)}
                    onClick={() => toggleArrayItem('designElements', element.id)}
                    icon={element.icon}
                    label={element.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 5: FEATURES & FUNCTIONALITY */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Features & Functionality</h2>
              <p className="text-slate-400">What functionality do you need?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES.map(feature => (
                <SelectableCard
                  key={feature.id}
                  selected={data.features.includes(feature.id)}
                  onClick={() => toggleArrayItem('features', feature.id)}
                  icon={feature.icon}
                  label={feature.label}
                />
              ))}
            </div>

            <p className="text-slate-500 text-sm text-center">
              Selected: {data.features.length} feature{data.features.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 6: CONTENT SECTIONS / PAGES */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Content Sections</h2>
              <p className="text-slate-400">Which pages do you need?</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PAGE_SECTIONS.map(page => (
                <SelectableCard
                  key={page.id}
                  selected={data.pages.includes(page.id)}
                  onClick={() => {
                    if (!page.required) toggleArrayItem('pages', page.id);
                  }}
                  icon={page.icon}
                  label={page.label + (page.required ? ' *' : '')}
                />
              ))}
            </div>

            <p className="text-slate-500 text-sm text-center">
              Selected: {data.pages.length} page{data.pages.length !== 1 ? 's' : ''} • Home is required
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 7: CONTACT & SOCIAL MEDIA */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Contact Information</h2>
              <p className="text-slate-400">Optional - will be displayed on your website</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  placeholder="e.g., +27 11 123 4567"
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    data.phone && !isValidPhone(data.phone)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {data.phone && !isValidPhone(data.phone) && (
                  <p className="text-red-400 text-sm mt-1">Please enter a valid phone number (7-15 digits)</p>
                )}
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  placeholder="e.g., info@business.com"
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    data.email && !isValidEmail(data.email)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:ring-blue-500'
                  }`}
                />
                {data.email && !isValidEmail(data.email) && (
                  <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
                )}
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Physical Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => updateData('address', e.target.value)}
                  placeholder="e.g., 123 Main St, Johannesburg"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Business Hours</label>
                <input
                  type="text"
                  value={data.businessHours}
                  onChange={(e) => updateData('businessHours', e.target.value)}
                  placeholder="e.g., Mon-Fri 9am-5pm"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Social Media Platforms */}
            <div>
              <label className="block text-white font-medium mb-3">Social Media Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SOCIAL_PLATFORMS.map(platform => (
                  <SelectableCard
                    key={platform.id}
                    selected={data.socialPlatforms.includes(platform.id)}
                    onClick={() => toggleArrayItem('socialPlatforms', platform.id)}
                    icon={platform.icon}
                    label={platform.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 8: TONE & MESSAGING */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 8 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Tone & Messaging</h2>
              <p className="text-slate-400">How should your website communicate?</p>
            </div>

            {/* Brand Voice */}
            <div>
              <label className="block text-white font-medium mb-3">Brand Voice *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BRAND_VOICES.map(voice => (
                  <SelectableCard
                    key={voice.id}
                    selected={data.brandVoice === voice.id}
                    onClick={() => updateData('brandVoice', voice.id)}
                    icon={voice.icon}
                    label={voice.label}
                  />
                ))}
              </div>
            </div>

            {/* CTA Style */}
            <div>
              <label className="block text-white font-medium mb-3">Call-to-Action Style *</label>
              <div className="grid grid-cols-2 gap-3">
                {CTA_STYLES.map(style => (
                  <SelectableCard
                    key={style.id}
                    selected={data.ctaStyle === style.id}
                    onClick={() => updateData('ctaStyle', style.id)}
                    label={style.label}
                    description={style.description}
                  />
                ))}
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-white font-medium mb-2">Tagline / Slogan (optional)</label>
              <input
                type="text"
                value={data.tagline}
                onChange={(e) => updateData('tagline', e.target.value)}
                placeholder="e.g., 'Innovation meets excellence'"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Key Message */}
            <div>
              <label className="block text-white font-medium mb-2">Key Message (optional)</label>
              <textarea
                value={data.keyMessage}
                onChange={(e) => updateData('keyMessage', e.target.value)}
                placeholder="What's the main thing you want visitors to remember?"
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 9: REVIEW */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentStep === 9 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Ready to Generate!</h2>
              <p className="text-slate-400">Review your preferences</p>
            </div>

            {/* Template Badge - Shows when a template is selected */}
            {selectedTemplate && (
              <div className="bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-fuchsia-400" />
                  <div>
                    <p className="text-fuchsia-300 font-medium">Using Template: {selectedTemplate.name}</p>
                    <p className="text-slate-400 text-sm">Your preferences will be applied to this template</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
              {/* Business Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Business Name</span>
                  <p className="text-white font-medium">{data.businessName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Industry</span>
                  <p className="text-white font-medium">
                    {industries.find(i => i.id === data.industryId)?.name || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Business Type</span>
                  <p className="text-white font-medium">
                    {BUSINESS_TYPES.find(t => t.id === data.businessType)?.label || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Color Mood</span>
                  <p className="text-white font-medium">
                    {COLOR_MOODS.find(m => m.id === data.colorMood)?.label || '-'}
                  </p>
                </div>
              </div>

              {/* Goals */}
              <div>
                <span className="text-slate-400 text-sm">Website Goals</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.websiteGoals.map(g => (
                    <span key={g} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {WEBSITE_GOALS.find(wg => wg.id === g)?.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div>
                <span className="text-slate-400 text-sm">Pages ({data.pages.length})</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.pages.map(p => (
                    <span key={p} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {PAGE_SECTIONS.find(ps => ps.id === p)?.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <span className="text-slate-400 text-sm">Features ({data.features.length})</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.features.map(f => (
                    <span key={f} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {FEATURES.find(fe => fe.id === f)?.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Brand Voice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Brand Voice</span>
                  <p className="text-white font-medium">
                    {BRAND_VOICES.find(v => v.id === data.brandVoice)?.label || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">CTA Style</span>
                  <p className="text-white font-medium">
                    {CTA_STYLES.find(s => s.id === data.ctaStyle)?.label || '-'}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              {data.tagline && (
                <div>
                  <span className="text-slate-400 text-sm">Tagline</span>
                  <p className="text-white italic">"{data.tagline}"</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">What happens next?</p>
                  <p className="text-slate-400 text-sm">
                    Merlin will use ALL your preferences to generate a unique website
                    perfectly tailored to your business. This takes about 30-60 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* NAVIGATION BUTTONS */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>

          {currentStep < 9 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate My Website</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
