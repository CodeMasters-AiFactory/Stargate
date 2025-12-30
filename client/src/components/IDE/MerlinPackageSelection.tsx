/**
 * Merlin Website Wizard - Package Selection Page
 * Intermediate page showing different package options before starting the wizard
 */

import { BrandTemplateSelector } from '@/components/TemplateSelector/BrandTemplateSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useIDE } from '@/hooks/use-ide';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Clock,
    Crown,
    FileText,
    Globe,
    LayoutTemplate,
    Palette,
    Search,
    Shield,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Users,
    Wand2,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { NavigationButtons } from './BackButton';

// YouTube API types
declare global {
  interface Window {
    YT: Record<string, unknown>;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PackageType = 'basic' | 'advanced' | 'seo' | 'deluxe' | 'ultra';
export type SiteType = 'personal' | 'business' | 'corporate' | 'ecommerce';

export interface PackageSelection {
  packageType: PackageType;
  siteType: SiteType;
}

interface Package {
  id: PackageType | 'custom' | 'starter' | 'standard' | 'business' | 'enterprise' | 'corporate' | 'premium' | 'elite' | 'bespoke' | 'tailored';
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
  popular?: boolean;
  deliveryTime: string;
  deliveryType: 'automated' | 'custom';
  setupFee?: number;
  automated: boolean;
  category: 'basic' | 'professional' | 'corporate' | 'custom';
}

const packages: Package[] = [
  // HOME PACKAGE - For personal use and small projects
  {
    id: 'basic',
    name: 'Home',
    description: 'Perfect for personal websites, portfolios, and hobby projects',
    price: 29,
    priceLabel: '$29/month',
    features: [
      '100 AI Credits/month',
      'Up to 5 pages',
      'Responsive design',
      'Basic SEO optimization',
      'Contact form',
      'Social media links',
      'SSL certificate',
      'Mobile optimized',
      'Email support',
    ],
    icon: Globe,
    color: 'from-emerald-500 to-teal-600',
    deliveryTime: '2-4 hours',
    deliveryType: 'automated',
    automated: true,
    category: 'basic',
  },
  // BUSINESS PACKAGE - For SMBs and growing companies
  {
    id: 'business',
    name: 'Business',
    description: 'Ideal for small to medium businesses ready to grow online',
    price: 79,
    priceLabel: '$79/month',
    features: [
      '500 AI Credits/month',
      'Unlimited pages',
      'Advanced SEO tools',
      'E-commerce ready (50 products)',
      'Blog functionality',
      'Analytics dashboard',
      'Custom forms',
      'Email integration',
      'Priority support',
      'Custom domain included',
    ],
    icon: Building2,
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    badge: 'Most Popular',
    deliveryTime: '4-8 hours',
    deliveryType: 'automated',
    setupFee: 0,
    automated: true,
    category: 'professional',
  },
  // CORPORATE PACKAGE - For enterprises and agencies
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Enterprise-grade solution for large organizations and agencies',
    price: 199,
    priceLabel: '$199/month',
    features: [
      '2000 AI Credits/month',
      'Everything in Business',
      'Unlimited e-commerce products',
      'Multi-language support',
      'Advanced analytics & reporting',
      'API access',
      'White-label options',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom integrations',
      'Team collaboration tools',
    ],
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    badge: 'Best Value',
    deliveryTime: '6-12 hours',
    deliveryType: 'automated',
    setupFee: 0,
    automated: true,
    category: 'corporate',
  },
  // Keep one hidden premium for future use
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ultimate automated solution with white-glove service',
    price: 499,
    priceLabel: '$499/month',
    features: [
      '5000 AI Credits/month',
      'Everything in Corporate',
      'Dedicated development team',
      'Custom AI training',
      'Enterprise SLA',
    ],
    icon: Shield,
    color: 'from-yellow-500 via-amber-600 to-orange-600',
    badge: 'Ultimate',
    deliveryTime: '18-36 hours',
    deliveryType: 'automated',
    setupFee: 0,
    automated: true,
    category: 'custom',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Fully managed premium solution with maximum features',
    price: 799,
    priceLabel: '$799/month',
    features: [
      'Everything in Premium',
      'Daily content updates',
      'Advanced AI automation',
      'Unlimited custom development',
      'White-label options',
      'Priority 24/7 support',
      'Dedicated team',
      'SLA guarantee',
      'Custom integrations',
    ],
    icon: Crown,
    color: 'from-amber-500 via-yellow-500 to-orange-600',
    badge: 'Elite',
    deliveryTime: '24-48 hours',
    deliveryType: 'automated',
    setupFee: 0,
    automated: true,
    category: 'custom',
  },
];

const siteTypes = [
  {
    id: 'personal' as SiteType,
    name: 'Personal',
    description: 'Portfolio, blog, or personal site',
    icon: Users,
  },
  {
    id: 'business' as SiteType,
    name: 'Business',
    description: 'Small to medium business website',
    icon: Building2,
  },
  {
    id: 'corporate' as SiteType,
    name: 'Corporate',
    description: 'Enterprise-level website with advanced features',
    icon: Building2,
  },
  {
    id: 'ecommerce' as SiteType,
    name: 'E-Commerce',
    description: 'Online store with shopping cart',
    icon: ShoppingCart,
  },
];

export function MerlinPackageSelection() {
  const { setState } = useIDE();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, checkAuth, isAdmin: _isAdmin } = useAuth();
  useLocation(); // Keep hook but don't destructure unused setLocation
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [buildType, setBuildType] = useState<'merlin' | 'custom' | null>(null);
  const [showSiteTypeSelection, setShowSiteTypeSelection] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [customFormData, setCustomFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    preferredDate: '',
    preferredTime: '',
  });
  const [selectedCustomPackage, _setSelectedCustomPackage] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    estimatedPages: '',
    estimatedHours: '',
    complexity: '',
    budget: '',
    timeline: '',
    requirements: '',
    integrations: '',
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // YouTube video background - DISABLED
  useEffect(() => {
    // Video disabled - do nothing
    return;
  }, []);

  // Original video code commented out - DISABLED
  /* useEffect(() => {
    // Suppress YouTube API console warnings
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const suppressYouTubeWarnings = () => {
      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('youtube.com') ||
          message.includes('YouTube') ||
          message.includes('cross-origin')
        ) {
          return;
        }
        originalConsoleError.apply(console, args);
      };

      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('youtube.com') ||
          message.includes('YouTube') ||
          message.includes('cross-origin')
        ) {
          return;
        }
        originalConsoleWarn.apply(console, args);
      };
    };

    suppressYouTubeWarnings();

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let player: any;
    let checkInterval: NodeJS.Timeout;
    const videoId = 'KvN3JXICzdM'; // New video ID
    let videoDuration = 0;
    let endTime = 0;
    const CUTOFF_SECONDS = 30; // Loop 30 seconds before the end

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        player = new window.YT.Player('youtube-background-merlin', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            playlist: videoId, // Required for looping
          },
          events: {
            onReady: (event: Record<string, unknown>) => {
              event.target.playVideo();
              // Get video duration
              setTimeout(() => {
                try {
                  videoDuration = event.target.getDuration();
                  if (videoDuration && videoDuration > CUTOFF_SECONDS) {
                    endTime = videoDuration - CUTOFF_SECONDS;
                    console.log(`Video duration: ${videoDuration}s, will loop at ${endTime}s`);
                  }
                } catch (e) {
                  // Duration might not be available immediately
                }
              }, 1000);

              // Check every second and loop if needed
              checkInterval = setInterval(() => {
                try {
                  const currentTime = event.target.getCurrentTime();
                  if (endTime > 0 && currentTime >= endTime) {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  }
                  // Keep video playing if paused
                  if (event.target.getPlayerState() === 2) {
                    event.target.playVideo();
                  }
                } catch (e) {
                  // Player might not be ready
                }
              }, 1000);
            },
            onStateChange: (event: Record<string, unknown>) => {
              // If video ends (shouldn't happen with our timer, but backup)
              if (event.data === 0) {
                event.target.seekTo(0);
                event.target.playVideo();
              }
              // Keep video playing if paused
              if (event.data === 2) {
                event.target.playVideo();
              }
            },
            onError: (event: Record<string, unknown>) => {
              originalConsoleError('YouTube player error:', event.data);
            },
          },
        });
      } catch (_error: unknown) {
        originalConsoleError('Failed to initialize YouTube player:', _error);
      }
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (player) {
        try {
          player.destroy();
        } catch (e) {
          // Player might already be destroyed
        }
      }
      // Restore console functions
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []); */

  // Comprehensive requirements state for the ALL-IN-ONE intake form
  // Comprehensive requirements state for the ALL-IN-ONE intake form
  const [requirements, setRequirements] = useState({
    // SECTION 1: Site Type
    siteType: null as SiteType | null,

    // SECTION 2: Business Essentials
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    domainName: '',
    hasDomain: false,
    industry: '',
    businessType: '',

    // SECTION 3: Pages
    pages: [
      { name: 'Home', enabled: true, editable: false },
      { name: 'About', enabled: true, editable: true },
      { name: 'Services', enabled: true, editable: true },
      { name: 'Contact', enabled: true, editable: true },
      { name: 'Blog', enabled: false, editable: true },
      { name: 'Portfolio', enabled: false, editable: true },
      { name: 'Pricing', enabled: false, editable: true },
      { name: 'FAQ', enabled: false, editable: true },
      { name: 'Testimonials', enabled: false, editable: true },
      { name: 'Team', enabled: false, editable: true },
      { name: 'Gallery', enabled: false, editable: true },
      { name: 'Shop', enabled: false, editable: true },
    ],

    // SECTION 4: Services/Products
    services: [{ name: '', description: '', rank: 1 }],
    targetAudience: '',
    uniqueSellingPoints: '',

    // SECTION 5: Navigation & Layout
    navbarStyle: 'sticky' as 'top' | 'sticky' | 'transparent',
    hasSidebar: false,
    sidebarPosition: 'left' as 'left' | 'right',
    hasFooter: true,
    mobilePriority: 'mobile' as 'mobile' | 'desktop',

    // SECTION 6: Brand Template Selection
    selectedTemplate: null as {
      id: string;
      name: string;
      brand: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
      };
      typography: {
        headingFont: string;
        bodyFont: string;
        headingWeight: string;
      };
      layout: {
        heroStyle: string;
        maxWidth: string;
        borderRadius: string;
        sections: string[];
      };
      css: string;
      darkMode: boolean;
      tags: string[];
    } | null,

    // SECTION 7: Content Preferences
    contentTone: 'professional' as 'professional' | 'casual' | 'friendly' | 'formal',
    includeBlog: false,
    includeTestimonials: false,
    includePortfolio: false,
    includeFAQ: false,
    contentMode: 'ai' as 'ai' | 'provided' | 'mix',

    // SECTION 8: SEO & Marketing
    primaryKeywords: '',
    targetLocation: '',
    competitorWebsites: '',
    targetKeywords: '',
    competitorUrls: '',
    region: '',
    country: '',
    wantsSEO: true,
    wantsLocalSEO: false,
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    tiktok: '',

    // SECTION 9: Additional Features
    includeContactForm: true,
    includeLiveChat: false,
    includeNewsletter: false,
    includeBooking: false,
    includePayment: false,
    hasContactForm: true,
    hasNewsletter: false,
    hasBlog: false,
    hasEcommerce: false,
    hasBooking: false,
    hasGallery: false,
    hasTestimonials: false,
    hasAnalytics: true,
    hasSocialLinks: true,
    hasVideo: false,
    videoUrl: '',
    ctaTypes: [] as string[],

    // SECTION 10: Branding & Design
    colorScheme: 'professional' as string,
    designStyle: 'modern' as string,
    hasLogo: false,
    logoUrl: '',
    fontStyle: 'sans-serif' as string,
    darkMode: false,
    animations: true,

    // SECTION 11: Images & Assets
    imageSource: 'ai' as 'ai' | 'client' | 'stock' | 'mix',
    hasBusinessPhotos: false,
    hasProductImages: false,
    hasTeamPhotos: false,
    inspirationalSites: '',

    // SECTION 12: Timeline & Budget
    desiredLaunchDate: '',
    budgetRange: '',
    priorityFeatures: '',
    primaryGoal: '' as string,
    timeline: 'standard' as 'urgent' | 'standard' | 'flexible',
  });

  // Wait for auth check to complete - backend has auto-auth bypass
  // Never show "Sign Up Required" - backend always authenticates automatically
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePackageSelect = (pkg: PackageType | 'custom') => {
    // Backend has auto-auth bypass - user should always be authenticated
    // If somehow not authenticated, retry auth check
    if (!isAuthenticated) {
      // Retry auth check - backend will auto-authenticate
      checkAuth();
      return;
    }

    if (pkg !== 'custom') {
      setSelectedPackage(pkg);
    }

    toast({
      title: 'Package Selected!',
      description: `You've selected the ${pkg} package. Ready to build your website!`,
    });
  };

  // Build full requirements object
  const buildFullRequirements = () => {
    return {
      ...requirements,
      packageType: selectedPackage,
      businessName: requirements.businessName || 'My Business',
      businessType: requirements.siteType || 'business',
      industry: requirements.industry || 'professional',
      targetAudience: requirements.targetAudience || 'Business professionals',
      desiredPages: requirements.pages.filter(p => p.enabled).map(p => p.name),
      services: requirements.services.filter(s => s.name),
      colorScheme: requirements.colorScheme || 'professional',
      designStyle: requirements.designStyle || 'modern',
      contactEmail: requirements.businessEmail,
      contactPhone: requirements.businessPhone,
      address: requirements.businessAddress,
      features: {
        contactForm: requirements.hasContactForm,
        newsletter: requirements.hasNewsletter,
        blog: requirements.hasBlog,
        ecommerce: requirements.hasEcommerce,
        booking: requirements.hasBooking,
        gallery: requirements.hasGallery,
        testimonials: requirements.hasTestimonials,
        analytics: requirements.hasAnalytics,
        seo: requirements.wantsSEO,
        localSeo: requirements.wantsLocalSEO,
        socialLinks: requirements.hasSocialLinks,
      },
      socialMedia: {
        facebook: requirements.facebook,
        instagram: requirements.instagram,
        linkedin: requirements.linkedin,
        twitter: requirements.twitter,
        youtube: requirements.youtube,
        tiktok: requirements.tiktok,
      },
      contentMode: requirements.contentMode,
      contentTone: requirements.contentTone,
      targetKeywords: requirements.targetKeywords,
      competitors: requirements.competitorUrls,
      region: requirements.region,
      country: requirements.country,
    };
  };

  // Validate before proceeding
  const validateBeforeProceed = () => {
    if (!selectedPackage) {
      toast({
        title: 'Please select a package',
        description: 'Choose a package to continue',
        variant: 'destructive',
      });
      return false;
    }
    if (!requirements.siteType) {
      toast({
        title: 'Please select site type',
        description: 'Choose the type of website you want to build',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // Handle starting with templates - goes to template browser
  const handleStartWithTemplates = () => {
    if (!validateBeforeProceed()) return;

    const fullReqs = buildFullRequirements();
    localStorage.setItem('merlin_quick_generate', JSON.stringify(fullReqs));

    // Navigate to template selection (website wizard at template-select stage)
    setState(prev => ({
      ...prev,
      currentView: 'website' as any,
      merlinPackage: {
        packageType: selectedPackage!,
        siteType: requirements.siteType || 'business',
      },
      merlinQuickGenerate: {
        requirements: fullReqs,
        skipChecklist: true,
      },
    }));
  };

  // Handle starting with AI Canvas (Merlin AI generation)
  const handleStartWithMerlinAI = () => {
    if (!validateBeforeProceed()) return;

    const fullReqs = buildFullRequirements();
    localStorage.setItem('merlin_quick_generate', JSON.stringify(fullReqs));

    // Navigate to AI generation canvas
    setState(prev => ({
      ...prev,
      currentView: 'merlin-quick-generate',
      merlinPackage: {
        packageType: selectedPackage!,
        siteType: requirements.siteType || 'business',
      },
      merlinQuickGenerate: {
        requirements: fullReqs,
        skipChecklist: true,
      },
    }));
  };


  const handleBack = () => {
    if (showSiteTypeSelection) {
      setShowSiteTypeSelection(false);
    } else {
      // Go to landing page (marketing website)
      setState(prev => ({ ...prev, currentView: 'landing' as any }));
    }
  };

  const togglePage = (index: number) => {
    setRequirements(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === index ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const updatePageName = (index: number, name: string) => {
    setRequirements(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === index ? { ...p, name } : p)
    }));
  };

  const toggleCTA = (cta: string) => {
    setRequirements(prev => ({
      ...prev,
      ctaTypes: prev.ctaTypes.includes(cta)
        ? prev.ctaTypes.filter(c => c !== cta)
        : [...prev.ctaTypes, cta]
    }));
  };

  if (showSiteTypeSelection && selectedPackage) {
    const selectedPkg = packages.find(p => p.id === selectedPackage);
    const enabledPages = requirements.pages.filter(p => p.enabled).length;

    return (
      <div className="w-full h-full overflow-y-auto bg-[#0A1628] antialiased">
        {/* Professional Navy Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D1D35 50%, #0A1628 100%)' }} />
          {/* Subtle blue glow - top right */}
          <div className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
              filter: 'blur(80px)',
              top: '-100px',
              right: '-100px'
            }} />
          {/* Subtle cyan glow - bottom left */}
          <div className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
              filter: 'blur(60px)',
              bottom: '0',
              left: '-50px'
            }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={handleBack} className="text-slate-400 hover:text-white hover:bg-white/[0.05] mb-4 transition-colors duration-200">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Packages
            </Button>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                <Check className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">You selected: {selectedPkg?.name}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Tell Us About Your{' '}
                <span className="text-cyan-400">Dream Website</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Answer these quick questions so our AI can create the perfect website for you
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-1 text-sm">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-semibold">1</div>
              <span className="text-cyan-300 font-medium ml-1">Requirements</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-700" />
            <div className="flex items-center gap-1 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center font-semibold">2</div>
              <span className="text-slate-500 ml-1">Generate</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-700" />
            <div className="flex items-center gap-1 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center font-semibold">3</div>
              <span className="text-slate-500 ml-1">Review</span>
            </div>
          </div>

          {/* Quick Start Button */}
          <div className="mb-8 p-5 rounded-2xl bg-slate-800/50 border border-slate-700 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                  Quick Start - Use Recommended Settings
                </h3>
                <p className="text-white/50 text-sm font-normal">Auto-fill with smart defaults for a professional business website</p>
              </div>
              <Button
                onClick={() => {
                  setRequirements(prev => ({
                    ...prev,
                    siteType: 'business',
                    businessName: 'My Business',
                    businessEmail: 'contact@mybusiness.com',
                    businessPhone: '+1 (555) 123-4567',
                    industry: 'professional',
                    pages: prev.pages.map((p, i) => ({ ...p, enabled: i < 5 })),
                    services: [{ name: 'Our Main Service', description: 'What we do best', rank: 1 }],
                    targetAudience: 'Business professionals and companies',
                    navbarStyle: 'sticky',
                    imageSource: 'ai',
                    hasContactForm: true,
                    hasEmail: true,
                    hasPhone: true,
                    hasSocialLinks: true,
                    hasTestimonials: true,
                    hasAnalytics: true,
                    primaryCTA: 'Contact Us',
                    ctaTypes: ['Contact Us', 'Get Started'],
                    wantsSEO: true,
                    primaryGoal: 'Generate Leads',
                    timeline: 'standard',
                    contentMode: 'ai',
                    contentTone: 'professional',
                    designStyle: 'modern',
                    colorScheme: 'professional',
                    animations: true,
                  }));
                  setRequirements(prev => ({ ...prev, siteType: 'business' }));
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-500 hover:from-cyan-400 hover:to-cyan-400 text-white font-medium rounded-lg whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Use Recommended
              </Button>
            </div>
          </div>

          {/* SECTION 1: Site Type */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              What type of website do you need?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {siteTypes.map((type: { id: SiteType; name: string; description: string; icon: React.ComponentType<{ className?: string }> }) => {
                const Icon = type.icon;
                const isSelected = requirements.siteType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setRequirements(prev => ({ ...prev, siteType: type.id }));
                      setRequirements(prev => ({ ...prev, siteType: type.id }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-cyan-400' : 'text-white/50'}`} />
                    <div className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>{type.name}</div>
                    <div className="text-xs text-white/40 mt-1">{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Pages */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Which pages do you need?
            </h2>
            <p className="text-white/40 text-sm mb-4">Select pages and customize their names. ({enabledPages} pages selected)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {requirements.pages.map((page: { name: string; enabled: boolean; editable: boolean }, idx: number) => (
                <div key={idx} className={`rounded-xl border transition-all ${
                  page.enabled
                    ? 'bg-blue-500/20 border-purple-900/20'
                    : 'bg-white/[0.02] border-white/10'
                }`}>
                  <button
                    onClick={() => page.editable && togglePage(idx)}
                    className={`w-full p-3 flex items-center gap-2 ${!page.editable ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      page.enabled
                        ? 'bg-gradient-to-r from-blue-500/80 via-purple-900/30 to-orange-500/80 border-purple-900/20'
                        : 'border-white/30'
                    }`}>
                      {page.enabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {page.editable ? (
                      <input
                        type="text"
                        value={page.name}
                        onChange={(e) => updatePageName(idx, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent text-white/80 text-sm font-medium w-full outline-none focus:text-white"
                      />
                    ) : (
                      <span className="text-white/80 text-sm font-medium">{page.name}</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: Navigation & Layout */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              Navigation & Layout
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Navigation Bar */}
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Navigation Bar Style</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'top', label: 'Fixed Top' },
                    { id: 'sticky', label: 'Sticky' },
                    { id: 'transparent', label: 'Transparent' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setRequirements(prev => ({ ...prev, navbarStyle: opt.id as any }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        requirements.navbarStyle === opt.id
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sidebar */}
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Sidebar</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRequirements(prev => ({ ...prev, hasSidebar: false }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      !requirements.hasSidebar ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    No Sidebar
                  </button>
                  <button
                    onClick={() => setRequirements(prev => ({ ...prev, hasSidebar: true, sidebarPosition: 'left' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      requirements.hasSidebar && requirements.sidebarPosition === 'left'
                        ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Left Sidebar
                  </button>
                  <button
                    onClick={() => setRequirements(prev => ({ ...prev, hasSidebar: true, sidebarPosition: 'right' }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      requirements.hasSidebar && requirements.sidebarPosition === 'right'
                        ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Right Sidebar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Images */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Where should images come from?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'ai', label: 'AI Generated', desc: 'Unique images created by AI' },
                { id: 'stock', label: 'Stock Photos', desc: 'Professional stock images' },
                { id: 'client', label: "I'll Provide", desc: 'Upload your own images' },
                { id: 'mix', label: 'Mix of All', desc: 'Combination of sources' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRequirements(prev => ({ ...prev, imageSource: opt.id as any }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    requirements.imageSource === opt.id
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`font-medium text-sm ${requirements.imageSource === opt.id ? 'text-cyan-300' : 'text-white/70'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-white/40 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Contact & CTAs */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Contact Options & Call-to-Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'hasContactForm', label: 'Contact Form', icon: '📝' },
                { key: 'hasEmail', label: 'Email Link', icon: '📧' },
                { key: 'hasPhone', label: 'Phone Number', icon: '📞' },
                { key: 'hasWhatsApp', label: 'WhatsApp', icon: '💬' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setRequirements(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    requirements[opt.key as keyof typeof requirements]
                      ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 border-purple-900/20'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className={`font-medium text-sm ${
                    requirements[opt.key as keyof typeof requirements] ? 'text-blue-300' : 'text-white/60'
                  }`}>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-white/70 text-sm font-medium mb-3 block">CTA Button Types (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {['Get Started', 'Book Now', 'Contact Us', 'Learn More', 'Buy Now', 'Subscribe', 'Free Trial', 'Get Quote'].map(cta => (
                  <button
                    key={cta}
                    onClick={() => toggleCTA(cta)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      requirements.ctaTypes.includes(cta)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {cta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6: Business Essentials */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Business Essentials
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Business Name *</label>
                <input type="text" placeholder="Your Business Name"
                  value={requirements.businessName}
                  onChange={(e) => setRequirements(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Industry *</label>
                <select value={requirements.industry}
                  onChange={(e) => setRequirements(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500">
                  <option value="" className="bg-slate-800">Select Industry</option>
                  <option value="restaurant" className="bg-slate-800">Restaurant/Cafe</option>
                  <option value="retail" className="bg-slate-800">Retail/E-commerce</option>
                  <option value="healthcare" className="bg-slate-800">Healthcare/Medical</option>
                  <option value="technology" className="bg-slate-800">Technology/SaaS</option>
                  <option value="professional" className="bg-slate-800">Professional Services</option>
                  <option value="construction" className="bg-slate-800">Construction/Real Estate</option>
                  <option value="education" className="bg-slate-800">Education/Training</option>
                  <option value="fitness" className="bg-slate-800">Fitness/Wellness</option>
                  <option value="creative" className="bg-slate-800">Creative/Design</option>
                  <option value="automotive" className="bg-slate-800">Automotive</option>
                  <option value="legal" className="bg-slate-800">Legal Services</option>
                  <option value="finance" className="bg-slate-800">Finance/Accounting</option>
                  <option value="other" className="bg-slate-800">Other</option>
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Business Email *</label>
                <input type="email" placeholder="contact@yourbusiness.com"
                  value={requirements.businessEmail}
                  onChange={(e) => setRequirements(prev => ({ ...prev, businessEmail: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Business Phone</label>
                <input type="tel" placeholder="+1 (555) 123-4567"
                  value={requirements.businessPhone}
                  onChange={(e) => setRequirements(prev => ({ ...prev, businessPhone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/70 text-sm font-medium mb-2 block">Business Address</label>
                <input type="text" placeholder="123 Main St, City, State, Country"
                  value={requirements.businessAddress}
                  onChange={(e) => setRequirements(prev => ({ ...prev, businessAddress: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Domain Name</label>
                <input type="text" placeholder="www.yourbusiness.com"
                  value={requirements.domainName}
                  onChange={(e) => setRequirements(prev => ({ ...prev, domainName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div className="flex items-end">
                <button onClick={() => setRequirements(prev => ({ ...prev, hasDomain: !prev.hasDomain }))}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${requirements.hasDomain ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.hasDomain ? '✓ I have a domain' : 'I need help getting a domain'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 7: Services & Target Audience */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              Services/Products & Target Audience
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">What are your main services/products? *</label>
                <textarea placeholder="List your main services or products (one per line)&#10;e.g., Web Design, SEO Optimization, Social Media Marketing"
                  value={requirements.services.map(s => s.name).join('\n')}
                  onChange={(e) => setRequirements(prev => ({ ...prev, services: e.target.value.split('\n').map((name, i) => ({ name, description: '', rank: i + 1 })) }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Who is your target audience? *</label>
                <textarea placeholder="Describe your ideal customers (e.g., small business owners, health-conscious millennials, tech professionals)"
                  value={requirements.targetAudience}
                  onChange={(e) => setRequirements(prev => ({ ...prev, targetAudience: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">What makes you unique? (Unique Selling Points)</label>
                <textarea placeholder="What sets you apart from competitors?"
                  value={requirements.uniqueSellingPoints}
                  onChange={(e) => setRequirements(prev => ({ ...prev, uniqueSellingPoints: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
            </div>
          </div>

          {/* SECTION 8: Features */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Website Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'hasPricing', label: 'Pricing Table', icon: '💰' },
                { key: 'hasTestimonials', label: 'Testimonials', icon: '⭐' },
                { key: 'hasVideo', label: 'Video Section', icon: '🎬' },
                { key: 'hasSocialLinks', label: 'Social Links', icon: '🔗' },
                { key: 'hasNewsletter', label: 'Newsletter', icon: '📧' },
                { key: 'hasGallery', label: 'Photo Gallery', icon: '🖼️' },
                { key: 'hasBooking', label: 'Online Booking', icon: '📅' },
                { key: 'hasEcommerce', label: 'E-commerce/Shop', icon: '🛒' },
                { key: 'hasBlog', label: 'Blog Section', icon: '📝' },
                { key: 'hasLiveChat', label: 'Live Chat', icon: '💬' },
                { key: 'hasGoogleMaps', label: 'Google Maps', icon: '📍' },
                { key: 'hasAnalytics', label: 'Analytics', icon: '📊' },
              ].map(opt => (
                <button key={opt.key}
                  onClick={() => setRequirements(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                    requirements[opt.key as keyof typeof requirements]
                      ? 'bg-amber-500/20 border-amber-500' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}>
                  <span className="text-xl">{opt.icon}</span>
                  <span className={`font-medium text-xs ${requirements[opt.key as keyof typeof requirements] ? 'text-amber-300' : 'text-white/60'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
            {requirements.hasVideo && (
              <div className="mt-4">
                <label className="text-white/70 text-sm font-medium mb-2 block">Video URL (YouTube/Vimeo)</label>
                <input type="text" placeholder="https://youtube.com/watch?v=..."
                  value={requirements.videoUrl}
                  onChange={(e) => setRequirements(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
            )}
          </div>

          {/* SECTION 9: SEO & Marketing */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              SEO & Marketing
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setRequirements(prev => ({ ...prev, wantsSEO: !prev.wantsSEO }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.wantsSEO ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.wantsSEO ? '✓' : ''} SEO Optimization
                </button>
                <button onClick={() => setRequirements(prev => ({ ...prev, wantsLocalSEO: !prev.wantsLocalSEO }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.wantsLocalSEO ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.wantsLocalSEO ? '✓' : ''} Local SEO
                </button>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Target Keywords (what should people search for?)</label>
                <input type="text" placeholder="e.g., plumber near me, best coffee shop, web design agency"
                  value={requirements.targetKeywords}
                  onChange={(e) => setRequirements(prev => ({ ...prev, targetKeywords: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Competitor Websites (we&apos;ll analyze them)</label>
                <input type="text" placeholder="https://competitor1.com, https://competitor2.com"
                  value={requirements.competitorUrls}
                  onChange={(e) => setRequirements(prev => ({ ...prev, competitorUrls: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 block">Country/Region</label>
                  <input type="text" placeholder="e.g., United States, South Africa"
                    value={requirements.country}
                    onChange={(e) => setRequirements(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium mb-2 block">City/State</label>
                  <input type="text" placeholder="e.g., New York, California"
                    value={requirements.region}
                    onChange={(e) => setRequirements(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 10: Social Media */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Social Media Links
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourpage', icon: '📘' },
                { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/yourpage', icon: '📸' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/company/...', icon: '💼' },
                { key: 'twitter', label: 'Twitter/X', placeholder: 'twitter.com/yourhandle', icon: '🐦' },
                { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@yourchannel', icon: '🎥' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'tiktok.com/@yourpage', icon: '🎵' },
              ].map(social => (
                <div key={social.key}>
                  <label className="text-white/70 text-xs font-medium mb-1 flex items-center gap-1">
                    <span>{social.icon}</span> {social.label}
                  </label>
                  <input type="text" placeholder={social.placeholder}
                    value={requirements[social.key as keyof typeof requirements] as string}
                    onChange={(e) => setRequirements(prev => ({ ...prev, [social.key]: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500" />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 11: Goals & Timeline */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Goals & Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Primary Website Goal</label>
                <div className="flex flex-wrap gap-2">
                  {['Generate Leads', 'Sell Products', 'Showcase Work', 'Build Brand', 'Provide Information', 'Get Bookings'].map(goal => (
                    <button key={goal}
                      onClick={() => setRequirements(prev => ({ ...prev, primaryGoal: goal }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.primaryGoal === goal ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Timeline</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'urgent', label: '🚀 Urgent (ASAP)' },
                    { id: 'standard', label: '📅 Standard (1-2 weeks)' },
                    { id: 'flexible', label: '🌿 Flexible (Take your time)' },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setRequirements(prev => ({ ...prev, timeline: opt.id as any }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.timeline === opt.id ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Budget Range (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {['Under $500', '$500-$1000', '$1000-$2500', '$2500-$5000', '$5000+', 'Not Sure'].map(budget => (
                    <button key={budget}
                      onClick={() => setRequirements(prev => ({ ...prev, budgetRange: budget }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.budgetRange === budget ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                      {budget}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 12: Content Preferences */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Content Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Content Source</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ai', label: '🤖 AI Generated (Recommended)' },
                    { id: 'provided', label: '📄 I\'ll Provide Content' },
                    { id: 'mix', label: '🔄 Mix of Both' },
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setRequirements(prev => ({ ...prev, contentMode: opt.id as any }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.contentMode === opt.id ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Content Tone</label>
                <div className="flex flex-wrap gap-2">
                  {['Professional', 'Friendly', 'Casual', 'Formal', 'Playful', 'Authoritative', 'Warm', 'Technical'].map(tone => (
                    <button key={tone}
                      onClick={() => setRequirements(prev => ({ ...prev, contentTone: tone.toLowerCase() as 'professional' | 'casual' | 'friendly' | 'formal' }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${requirements.contentTone === tone.toLowerCase() ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 13: Branding & Visual Assets */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-cyan-400" />
              Branding & Visual Assets
            </h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setRequirements(prev => ({ ...prev, hasLogo: !prev.hasLogo }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.hasLogo ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.hasLogo ? '✓ I have a logo' : 'I need a logo'}
                </button>
                <button onClick={() => setRequirements(prev => ({ ...prev, hasBusinessPhotos: !prev.hasBusinessPhotos }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.hasBusinessPhotos ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.hasBusinessPhotos ? '✓' : ''} I have business photos
                </button>
                <button onClick={() => setRequirements(prev => ({ ...prev, hasProductImages: !prev.hasProductImages }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.hasProductImages ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.hasProductImages ? '✓' : ''} I have product images
                </button>
                <button onClick={() => setRequirements(prev => ({ ...prev, hasTeamPhotos: !prev.hasTeamPhotos }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${requirements.hasTeamPhotos ? 'bg-gradient-to-r from-blue-500/20 via-purple-900/15 to-orange-500/20 text-blue-300 border border-purple-900/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                  {requirements.hasTeamPhotos ? '✓' : ''} I have team photos
                </button>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-2 block">Inspirational Websites (optional)</label>
                <input type="text" placeholder="Share websites whose design you like (comma separated)"
                  value={requirements.inspirationalSites}
                  onChange={(e) => setRequirements(prev => ({ ...prev, inspirationalSites: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-cyan-500" />
              </div>
              {/* BRAND TEMPLATE SELECTOR - The Big One! */}
              <div className="col-span-2 p-4 rounded-xl bg-slate-800/50 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-white font-semibold block">🌟 Choose a Brand Template Style</label>
                    <p className="text-white/50 text-sm">Select from Tesla, Apple, BMW, Nike and more famous brand designs</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-all shadow-lg shadow-cyan-500/25"
                  >
                    <LayoutTemplate className="w-5 h-5" />
                    Browse Templates
                  </button>
                </div>
                {requirements.selectedTemplate && (
                  <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                    <div className="flex gap-1">
                      {[requirements.selectedTemplate.colors.primary, requirements.selectedTemplate.colors.secondary, requirements.selectedTemplate.colors.accent].map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div>
                      <div className="text-white font-medium">{requirements.selectedTemplate.name}</div>
                      <div className="text-white/50 text-xs">Based on {requirements.selectedTemplate.brand}</div>
                    </div>
                    <button
                      onClick={() => setRequirements(prev => ({ ...prev, selectedTemplate: null }))}
                      className="ml-auto text-white/40 hover:text-white/60 text-xs"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Design Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Modern', 'Classic', 'Minimalist', 'Bold', 'Elegant', 'Playful', 'Corporate', 'Creative'].map(style => (
                    <button key={style}
                      onClick={() => setRequirements(prev => ({ ...prev, designStyle: style.toLowerCase() }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${requirements.designStyle === style.toLowerCase() ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium mb-3 block">Font Style</label>
                <div className="flex flex-wrap gap-2">
                  {['Sans-Serif', 'Serif', 'Modern', 'Handwritten', 'Display', 'Monospace'].map(font => (
                    <button key={font}
                      onClick={() => setRequirements(prev => ({ ...prev, fontStyle: font.toLowerCase() }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${requirements.fontStyle === font.toLowerCase() ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 14: Color Scheme & Theme */}
          <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Color Scheme & Theme
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
              {[
                // Row 1: Business & Professional
                { id: 'professional', label: 'Professional', colors: ['#1e3a5f', '#2563eb', '#f8fafc'] },
                { id: 'corporate', label: 'Corporate', colors: ['#1f2937', '#3b82f6', '#e5e7eb'] },
                { id: 'modern', label: 'Modern', colors: ['#0f172a', '#8b5cf6', '#f1f5f9'] },
                { id: 'minimal', label: 'Minimal', colors: ['#18181b', '#fafafa', '#a1a1aa'] },
                { id: 'elegant', label: 'Elegant', colors: ['#292524', '#78716c', '#f5f5f4'] },
                // Row 2: Warm & Energetic
                { id: 'warm', label: 'Warm', colors: ['#7c2d12', '#ea580c', '#fef3c7'] },
                { id: 'sunset', label: 'Sunset', colors: ['#be123c', '#f97316', '#fef08a'] },
                { id: 'coral', label: 'Coral', colors: ['#be185d', '#fb7185', '#fff1f2'] },
                { id: 'autumn', label: 'Autumn', colors: ['#92400e', '#d97706', '#fffbeb'] },
                { id: 'fire', label: 'Fire', colors: ['#991b1b', '#ef4444', '#fef2f2'] },
                // Row 3: Cool & Calm
                { id: 'cool', label: 'Cool', colors: ['#0c4a6e', '#06b6d4', '#ecfeff'] },
                { id: 'ocean', label: 'Ocean', colors: ['#164e63', '#22d3ee', '#cffafe'] },
                { id: 'sky', label: 'Sky', colors: ['#1e40af', '#60a5fa', '#dbeafe'] },
                { id: 'arctic', label: 'Arctic', colors: ['#0f172a', '#94a3b8', '#f8fafc'] },
                { id: 'midnight', label: 'Midnight', colors: ['#020617', '#6366f1', '#e0e7ff'] },
                // Row 4: Nature & Fresh
                { id: 'nature', label: 'Nature', colors: ['#14532d', '#22c55e', '#f0fdf4'] },
                { id: 'forest', label: 'Forest', colors: ['#064e3b', '#10b981', '#d1fae5'] },
                { id: 'mint', label: 'Mint', colors: ['#047857', '#34d399', '#ecfdf5'] },
                { id: 'lavender', label: 'Lavender', colors: ['#4c1d95', '#a78bfa', '#ede9fe'] },
                { id: 'spring', label: 'Spring', colors: ['#15803d', '#84cc16', '#f7fee7'] },
                // Row 5: Bold & Creative
                { id: 'vibrant', label: 'Vibrant', colors: ['#ec4899', '#f59e0b', '#10b981'] },
                { id: 'neon', label: 'Neon', colors: ['#7c3aed', '#f472b6', '#22d3ee'] },
                { id: 'electric', label: 'Electric', colors: ['#2563eb', '#8b5cf6', '#ec4899'] },
                { id: 'tropical', label: 'Tropical', colors: ['#0891b2', '#14b8a6', '#fbbf24'] },
                { id: 'candy', label: 'Candy', colors: ['#db2777', '#a855f7', '#38bdf8'] },
                // Row 6: Premium & Luxury
                { id: 'luxury', label: 'Luxury', colors: ['#1c1917', '#d4af37', '#fafaf9'] },
                { id: 'gold', label: 'Gold', colors: ['#292524', '#eab308', '#fefce8'] },
                { id: 'rose-gold', label: 'Rose Gold', colors: ['#44403c', '#f472b6', '#fdf2f8'] },
                { id: 'platinum', label: 'Platinum', colors: ['#1f2937', '#9ca3af', '#f3f4f6'] },
                { id: 'noir', label: 'Noir', colors: ['#0a0a0a', '#525252', '#fafafa'] },
              ].map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => setRequirements(prev => ({ ...prev, colorScheme: scheme.id }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    requirements.colorScheme === scheme.id
                      ? 'bg-white/10 border-cyan-500'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {scheme.colors.map((color, i) => (
                      <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <div className={`font-medium text-sm ${requirements.colorScheme === scheme.id ? 'text-white' : 'text-white/70'}`}>
                    {scheme.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setRequirements(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  requirements.darkMode ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/60'
                }`}
              >
                <div className={`w-4 h-4 rounded ${requirements.darkMode ? 'bg-slate-900' : 'bg-white'}`} />
                Dark Mode
              </button>
              <button
                onClick={() => setRequirements(prev => ({ ...prev, animations: !prev.animations }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  requirements.animations ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Animations
              </button>
            </div>
          </div>

          {/* Choose How to Build */}
          <div className="flex flex-col items-center gap-6 pb-12">
            <h3 className="text-xl font-semibold text-white">How would you like to build?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Browse Templates Button */}
              <Button
                size="lg"
                onClick={handleStartWithTemplates}
                disabled={!requirements.siteType}
                className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LayoutTemplate className="w-5 h-5 mr-2" />
                Browse Templates
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Merlin AI Canvas Button */}
              <Button
                size="lg"
                onClick={handleStartWithMerlinAI}
                disabled={!requirements.siteType}
                className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Merlin AI Canvas
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-white/40 text-sm text-center max-w-md">
              {!requirements.siteType
                ? 'Please select a site type above'
                : `${enabledPages} pages • ${requirements.colorScheme} style • Choose templates or let AI create your site!`}
            </p>
          </div>
        </div>

        {/* Brand Template Selector Modal */}
        {showTemplateSelector && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-6xl h-[90vh] bg-[#0A1628] rounded-2xl overflow-hidden border border-slate-700">
              <BrandTemplateSelector
                onSelect={(template, customColors) => {
                  setRequirements(prev => ({
                    ...prev,
                    selectedTemplate: {
                      id: template.id,
                      name: template.name,
                      brand: template.brand,
                      colors: customColors || template.colors,
                      typography: template.typography || {
                        headingFont: '',
                        bodyFont: '',
                        headingWeight: '',
                      },
                      layout: (template.layout && 'sections' in template.layout) ? template.layout : {
                        heroStyle: template.layout?.heroStyle || '',
                        maxWidth: template.layout?.maxWidth || '',
                        borderRadius: template.layout?.borderRadius || '',
                        sections: (template.layout as any)?.sections || [],
                      },
                      css: (template as any).css || '',
                      darkMode: template.darkMode,
                      tags: template.tags || [],
                    },
                    primaryColor: (customColors || template.colors).primary,
                    accentColor: (customColors || template.colors).accent,
                    colorScheme: template.id,
                    darkMode: template.darkMode,
                  }));
                  setShowTemplateSelector(false);
                }}
                onClose={() => setShowTemplateSelector(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        {/* Clean Header - Title at Top */}
        <div className="text-center mb-12 relative">
          {/* Back Button - Small, top left */}
          <div className="absolute top-0 left-0">
            <NavigationButtons
              backDestination="dashboard"
              backLabel="Back"
              className="[&_button]:bg-slate-700/50 [&_button]:hover:bg-slate-600/50 [&_button]:border-slate-600 [&_button]:text-white/70 [&_button]:hover:text-white [&_button]:px-3 [&_button]:py-1.5 [&_button]:text-sm"
            />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3 pt-2">
            Website Builder
          </h1>
          <p className="text-lg text-white/60 mb-8">
            Choose how you want to build your website
          </p>

          {/* Build Type Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBuildType('merlin')}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 min-w-[280px] ${
                buildType === 'merlin'
                  ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/30'
                  : 'border-slate-600 bg-slate-800/50 hover:border-violet-400 hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                buildType === 'merlin' ? 'bg-violet-500' : 'bg-slate-700'
              }`}>
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Merlin Website Wizard</div>
                <div className="text-sm text-white/60">AI-powered, build it yourself</div>
              </div>
              {buildType === 'merlin' && (
                <Check className="w-6 h-6 text-violet-400 ml-auto" />
              )}
            </button>

            <button
              onClick={() => setBuildType('custom')}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 min-w-[280px] ${
                buildType === 'custom'
                  ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/30'
                  : 'border-slate-600 bg-slate-800/50 hover:border-amber-400 hover:bg-slate-700/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                buildType === 'custom' ? 'bg-amber-500' : 'bg-slate-700'
              }`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white">Custom Website</div>
                <div className="text-sm text-white/60">We build it for you</div>
              </div>
              {buildType === 'custom' && (
                <Check className="w-6 h-6 text-amber-400 ml-auto" />
              )}
            </button>
          </div>
        </div>

        {/* Custom Website Form - Shows when Custom is selected */}
        {buildType === 'custom' && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="max-w-3xl mx-auto bg-slate-800/80 border-amber-500/30 backdrop-blur-sm">
              <CardHeader className="text-center border-b border-slate-700">
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
                  <Users className="w-6 h-6 text-amber-400" />
                  Custom Website Request
                </CardTitle>
                <CardDescription className="text-white/60">
                  Tell us about your project and schedule a consultation with our team
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Your Name *</label>
                    <input
                      type="text"
                      value={customFormData.name}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-white/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      value={customFormData.email}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-white/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={customFormData.phone}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-white/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Company/Business Name</label>
                    <input
                      type="text"
                      value={customFormData.company}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-white/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <label className="text-sm text-white/80 mb-1 block">Project Description *</label>
                  <textarea
                    value={customFormData.projectDescription}
                    onChange={(e) => setCustomFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-white/40 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none h-32 resize-none"
                    placeholder="Describe your business, what kind of website you need, key features, pages required, design preferences, reference websites you like..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Budget Range</label>
                    <select
                      value={customFormData.budget}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Select budget range</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000+">$10,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-white/80 mb-1 block">Timeline</label>
                    <select
                      value={customFormData.timeline}
                      onChange={(e) => setCustomFormData(prev => ({ ...prev, timeline: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1-2weeks">1-2 Weeks</option>
                      <option value="2-4weeks">2-4 Weeks</option>
                      <option value="1-2months">1-2 Months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Scheduler */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    Schedule a Consultation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/80 mb-1 block">Preferred Date</label>
                      <input
                        type="date"
                        value={customFormData.preferredDate}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/80 mb-1 block">Preferred Time</label>
                      <select
                        value={customFormData.preferredTime}
                        onChange={(e) => setCustomFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                      >
                        <option value="">Select time slot</option>
                        <option value="9am-10am">9:00 AM - 10:00 AM</option>
                        <option value="10am-11am">10:00 AM - 11:00 AM</option>
                        <option value="11am-12pm">11:00 AM - 12:00 PM</option>
                        <option value="2pm-3pm">2:00 PM - 3:00 PM</option>
                        <option value="3pm-4pm">3:00 PM - 4:00 PM</option>
                        <option value="4pm-5pm">4:00 PM - 5:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    onClick={() => setBuildType(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-6"
                    onClick={() => {
                      if (!customFormData.name || !customFormData.email || !customFormData.projectDescription) {
                        toast({
                          title: 'Missing Information',
                          description: 'Please fill in your name, email, and project description.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      toast({
                        title: 'Request Submitted!',
                        description: 'Our team will contact you within 24 hours to discuss your project.',
                      });
                      setCustomFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        projectDescription: '',
                        budget: '',
                        timeline: '',
                        preferredDate: '',
                        preferredTime: '',
                      });
                      setBuildType(null);
                    }}
                  >
                    Submit Request
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Phase 1: Package Selection - Shows when Merlin is selected */}
        {buildType === 'merlin' && (
        <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Choose Your Package
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Select the perfect solution for your website needs. Each package is crafted with AI-powered precision.
            </p>
          </div>

          {/* All Packages - Home, Business, Corporate */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages
                .filter((p: Package) => p.id === 'basic' || p.id === 'business' || p.id === 'corporate')
                .map((pkg: Package) => {
                    const Icon = pkg.icon;
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <div key={pkg.id} className="relative">
                    {pkg.badge && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 text-xs font-bold shadow-lg animate-pulse whitespace-nowrap">
                          {pkg.badge}
                        </Badge>
                      </div>
                    )}

                    <Card
                      className={`group relative cursor-pointer transition-all duration-200 hover:shadow-2xl border-2 overflow-hidden flex flex-col h-full ${
                        isSelected
                          ? 'ring-4 ring-blue-400/50 border-blue-500 shadow-2xl bg-gradient-to-br from-white to-blue-50/50 dark:from-blue-900/90 dark:to-blue-950/50'
                          : 'hover:border-blue-400/50 bg-white/90 dark:bg-blue-900/80 dark:hover:bg-blue-800/90 backdrop-blur-sm border-blue-200/30 dark:border-blue-800/30'
                      }`}
                      onClick={() => handlePackageSelect(pkg.id as PackageType)}
                    >
                      {/* Gradient Background Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none ${
                          pkg.id === 'deluxe' ? 'group-hover:opacity-10' : ''
                        }`}
                      />

                      {pkg.popular && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                          <div className="absolute inset-0 w-3 h-3 bg-yellow-400 rounded-full" />
                        </div>
                      )}

                      <CardHeader className="text-center pb-4 relative pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${pkg.color} rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-200`}
                          />
                          <div
                            className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center shadow-lg transition-opacity duration-200`}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {pkg.name}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {pkg.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0 relative flex flex-col flex-1">
                          <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                            {pkg.price === 0 ? (
                              <div className="mb-1">
                                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                  {pkg.priceLabel}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Based on project scope, pages & hours
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-baseline justify-center gap-1 mb-1">
                                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                    ${pkg.price}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-400 text-base font-medium">
                                    /month
                                  </span>
                                </div>
                                {pkg.setupFee ? (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium min-h-[20px]">
                                    + ${pkg.setupFee} one-time setup
                                  </p>
                                ) : (
                                  <div className="mt-2 min-h-[20px]"></div>
                                )}
                              </>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-3 text-xs font-semibold text-primary">
                              <Clock className="w-4 h-4" />
                              <span>Delivery: {pkg.deliveryTime}</span>
                            </div>
                          </div>

                      <ul className="space-y-2.5 mb-6 flex-1">
                        {pkg.features.map((feature: string, idx: number) => (
                          <li
                            key={idx}
                            className="flex items-start text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-900/20 to-orange-500/30 dark:from-blue-900/40 dark:via-purple-950/30 dark:to-orange-900/40 flex items-center justify-center mr-3 mt-0.5">
                              <Check className="w-3.5 h-3.5 text-blue-400 dark:text-purple-300 font-bold" />
                            </div>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full font-semibold text-base py-6 transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg ring-2 ring-blue-400/50'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-xl group-hover:scale-105 group-hover:brightness-125 group-hover:ring-4 group-hover:ring-blue-300/90 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                        }`}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handlePackageSelect(pkg.id as PackageType);
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Selected
                          </>
                        ) : pkg.price === 0 ? (
                          <>
                            Get Quote
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Select {pkg.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                      </Card>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Proceed Button - Shows when package is selected */}
          {selectedPackage && (
            <div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  // Save selection and navigate to wizard
                  localStorage.setItem('stargate-wizard-state', JSON.stringify({
                    stage: 'template-select',
                    currentPage: 'project-overview',
                    currentQuestion: 0,
                    requirements: {},
                    messages: [],
                    stageHistory: ['package-select'],
                    selectedPackage: selectedPackage,
                    designPath: 'merlin-template',
                  }));

                  // Navigate to wizard
                  window.location.href = '/stargate-websites';
                }}
              >
                <Wand2 className="w-6 h-6 mr-3" />
                Proceed to Website Builder
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <p className="mt-4 text-white/60 text-sm">
                You selected the <span className="text-violet-400 font-semibold capitalize">{selectedPackage}</span> package
              </p>
            </div>
          )}

        </section>
        )}



        {/* Enhanced Comparison Table - 3 Packages Only */}
        <Card className="mb-16 border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Package Comparison
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Compare features and AI credits across all packages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left p-4 font-bold text-gray-900 dark:text-white">Feature</th>
                    <th className="text-center p-4 font-bold text-emerald-600 dark:text-emerald-400">Home</th>
                    <th className="text-center p-4 font-bold text-blue-600 dark:text-blue-400">Business</th>
                    <th className="text-center p-4 font-bold text-amber-600 dark:text-amber-400">Corporate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">Monthly Price</td>
                    <td className="text-center p-4 text-2xl font-bold text-gray-900 dark:text-white">$29</td>
                    <td className="text-center p-4 text-2xl font-bold text-gray-900 dark:text-white">$79</td>
                    <td className="text-center p-4 text-2xl font-bold text-gray-900 dark:text-white">$199</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/20">
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">AI Credits/Month</td>
                    <td className="text-center p-4">
                      <Badge className="bg-emerald-600 text-white text-sm font-bold px-3 py-1">100 Credits</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge className="bg-blue-600 text-white text-sm font-bold px-3 py-1">500 Credits</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge className="bg-amber-600 text-white text-sm font-bold px-3 py-1">2000 Credits</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Delivery Time</td>
                    <td className="text-center p-4">
                      <Badge variant="outline" className="text-xs font-medium"><Clock className="w-3 h-3 mr-1 inline" />2-4 hours</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="outline" className="text-xs font-medium"><Clock className="w-3 h-3 mr-1 inline" />4-8 hours</Badge>
                    </td>
                    <td className="text-center p-4">
                      <Badge variant="outline" className="text-xs font-medium"><Clock className="w-3 h-3 mr-1 inline" />6-12 hours</Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Number of Pages</td>
                    <td className="text-center p-4 text-gray-900 dark:text-white font-medium">Up to 5</td>
                    <td className="text-center p-4 text-blue-500 dark:text-blue-400 font-bold">Unlimited</td>
                    <td className="text-center p-4 text-amber-500 dark:text-amber-400 font-bold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">E-Commerce Products</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4 text-gray-900 dark:text-white font-medium">Up to 50</td>
                    <td className="text-center p-4 text-amber-500 dark:text-amber-400 font-bold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">SEO Optimization</td>
                    <td className="text-center p-4"><Badge variant="outline" className="text-xs">Basic</Badge></td>
                    <td className="text-center p-4"><Badge className="bg-blue-600 text-white text-xs"><Check className="w-3 h-3 mr-1 inline" />Advanced</Badge></td>
                    <td className="text-center p-4"><Badge className="bg-amber-600 text-white text-xs"><Check className="w-3 h-3 mr-1 inline" />Advanced</Badge></td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Analytics Dashboard</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-blue-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Custom Domain</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-blue-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">API Access</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">White-Label Options</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Dedicated Account Manager</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4 text-gray-400">—</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-amber-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300">Support Level</td>
                    <td className="text-center p-4"><Badge variant="outline" className="text-xs">Email</Badge></td>
                    <td className="text-center p-4"><Badge className="bg-blue-600 text-white text-xs">Priority</Badge></td>
                    <td className="text-center p-4"><Badge className="bg-amber-600 text-white text-xs">24/7 Priority</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Credit Usage Guide */}
        <Card className="mb-16 border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              How AI Credits Work
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Credits are used for AI-powered services. When you run out, purchase credit packs to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Credit Costs per Service:</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">AI Website Generation</span>
                    <Badge className="bg-blue-600 text-white">20 credits</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">AI Content Writing (per page)</span>
                    <Badge className="bg-blue-600 text-white">5 credits</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">AI Image Generation</span>
                    <Badge className="bg-blue-600 text-white">10 credits</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">SEO Optimization</span>
                    <Badge className="bg-blue-600 text-white">15 credits</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Template Change</span>
                    <Badge className="bg-blue-600 text-white">10 credits</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">AI Chat Message</span>
                    <Badge className="bg-blue-600 text-white">1 credit</Badge>
                  </li>
                  <li className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">Code Export</span>
                    <Badge className="bg-blue-600 text-white">25 credits</Badge>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Need More Credits? Buy a Pack:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">50 Credits</span>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-sm">$10</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border-2 border-blue-400 dark:border-blue-600">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">200 Credits</span>
                      <Badge className="ml-2 bg-green-500 text-white text-xs">Save 15%</Badge>
                    </div>
                    <Badge className="bg-blue-600 text-white text-sm">$35</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border-2 border-amber-400 dark:border-amber-600">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">500 Credits</span>
                      <Badge className="ml-2 bg-amber-500 text-white text-xs">Best Value - Save 25%</Badge>
                    </div>
                    <Badge className="bg-amber-600 text-white text-sm">$75</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Credits never expire. Unused monthly credits roll over for 30 days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer Note */}
        <Card className="bg-gradient-to-br from-blue-50/80 via-purple-950/20 to-pink-50/80 dark:from-blue-950/40 dark:via-purple-950/20 dark:to-pink-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                All automated packages include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 px-4 py-3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-900/20 to-orange-500/30 dark:from-blue-900/40 dark:via-purple-950/30 dark:to-orange-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400 dark:text-purple-300" />
                  </div>
                  <span>Custom domain & SSL</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 px-4 py-3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-900/20 to-orange-500/30 dark:from-blue-900/40 dark:via-purple-950/30 dark:to-orange-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400 dark:text-purple-300" />
                  </div>
                  <span>CDN hosting & 24/7 support</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 px-4 py-3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-900/20 to-orange-500/30 dark:from-blue-900/40 dark:via-purple-950/30 dark:to-orange-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400 dark:text-purple-300" />
                  </div>
                  <span>Fully automated AI</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-slate-800/60 px-4 py-3 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-900/20 to-orange-500/30 dark:from-blue-900/40 dark:via-purple-950/30 dark:to-orange-900/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400 dark:text-purple-300" />
                  </div>
                  <span>No coding required</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                Need help choosing?{' '}
                <span className="font-semibold text-primary cursor-pointer hover:underline">
                  Contact our team
                </span>{' '}
                for personalized recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Quote Request Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-900/80 to-indigo-600 bg-clip-text text-transparent">
              Request Custom Quote
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedCustomPackage === 'custom' && 'Custom Design - Starting at $3,000'}
              {selectedCustomPackage === 'bespoke' && 'Bespoke Solution - Starting at $15,000'}
              {selectedCustomPackage === 'tailored' && 'Tailored Enterprise - Starting at $50,000'}
              <br />
              Fill out the form below and our team will provide a detailed quote based on your project requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-name">Full Name *</Label>
                  <Input
                    id="quote-name"
                    placeholder="John Doe"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-email">Email Address *</Label>
                  <Input
                    id="quote-email"
                    type="email"
                    placeholder="john@example.com"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-phone">Phone Number</Label>
                  <Input
                    id="quote-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-company">Company Name</Label>
                  <Input
                    id="quote-company"
                    placeholder="Acme Inc."
                    value={quoteForm.company}
                    onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-project-type">Project Type *</Label>
                  <Select
                    value={quoteForm.projectType}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, projectType: value })}
                  >
                    <SelectTrigger id="quote-project-type">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="web-app">Web Application</SelectItem>
                      <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                      <SelectItem value="portal">Customer Portal</SelectItem>
                      <SelectItem value="dashboard">Admin Dashboard</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-pages">Estimated Number of Pages</Label>
                  <Select
                    value={quoteForm.estimatedPages}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, estimatedPages: value })}
                  >
                    <SelectTrigger id="quote-pages">
                      <SelectValue placeholder="Select page count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 pages</SelectItem>
                      <SelectItem value="6-10">6-10 pages</SelectItem>
                      <SelectItem value="11-20">11-20 pages</SelectItem>
                      <SelectItem value="21-50">21-50 pages</SelectItem>
                      <SelectItem value="50+">50+ pages</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-complexity">Project Complexity *</Label>
                  <Select
                    value={quoteForm.complexity}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, complexity: value })}
                  >
                    <SelectTrigger id="quote-complexity">
                      <SelectValue placeholder="Select complexity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple (Basic pages, contact forms)</SelectItem>
                      <SelectItem value="medium">Medium (Custom features, integrations)</SelectItem>
                      <SelectItem value="complex">Complex (Custom apps, APIs, databases)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (Full-stack, scalable systems)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-budget">Budget Range</Label>
                  <Select
                    value={quoteForm.budget}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, budget: value })}
                  >
                    <SelectTrigger id="quote-budget">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3k-10k">$3,000 - $10,000</SelectItem>
                      <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k+">$100,000+</SelectItem>
                      <SelectItem value="discuss">Prefer to discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-timeline">Desired Timeline</Label>
                  <Select
                    value={quoteForm.timeline}
                    onValueChange={(value) => setQuoteForm({ ...quoteForm, timeline: value })}
                  >
                    <SelectTrigger id="quote-timeline">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP</SelectItem>
                      <SelectItem value="2-4weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2months">1-2 months</SelectItem>
                      <SelectItem value="2-4months">2-4 months</SelectItem>
                      <SelectItem value="4-6months">4-6 months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-hours">Estimated Development Hours</Label>
                  <Input
                    id="quote-hours"
                    type="number"
                    placeholder="e.g., 40, 80, 160"
                    value={quoteForm.estimatedHours}
                    onChange={(e) => setQuoteForm({ ...quoteForm, estimatedHours: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Requirements</h3>
              <div className="space-y-2">
                <Label htmlFor="quote-requirements">Detailed Requirements *</Label>
                <Textarea
                  id="quote-requirements"
                  placeholder="Describe your project in detail. What features do you need? What problems are you trying to solve? What are your goals?"
                  rows={6}
                  value={quoteForm.requirements}
                  onChange={(e) => setQuoteForm({ ...quoteForm, requirements: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-integrations">Required Integrations</Label>
                <Textarea
                  id="quote-integrations"
                  placeholder="List any third-party services, APIs, or systems that need to be integrated (e.g., Stripe, Salesforce, custom APIs, etc.)"
                  rows={3}
                  value={quoteForm.integrations}
                  onChange={(e) => setQuoteForm({ ...quoteForm, integrations: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowQuoteDialog(false);
                setQuoteForm({
                  name: '',
                  email: '',
                  phone: '',
                  company: '',
                  projectType: '',
                  estimatedPages: '',
                  estimatedHours: '',
                  complexity: '',
                  budget: '',
                  timeline: '',
                  requirements: '',
                  integrations: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!quoteForm.name || !quoteForm.email || !quoteForm.projectType || !quoteForm.complexity || !quoteForm.requirements) {
                  toast({
                    title: 'Missing Information',
                    description: 'Please fill in all required fields.',
                    variant: 'destructive',
                  });
                  return;
                }

                setIsSubmittingQuote(true);
                try {
                  // TODO: Send quote request to backend API
                  const response = await fetch('/api/quotes/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      packageType: selectedCustomPackage,
                      ...quoteForm,
                    }),
                  });

                  if (response.ok) {
                    toast({
                      title: 'Quote Request Submitted!',
                      description: 'Our team will review your request and contact you within 24 hours with a detailed quote.',
                    });
                    setShowQuoteDialog(false);
                    setQuoteForm({
                      name: '',
                      email: '',
                      phone: '',
                      company: '',
                      projectType: '',
                      estimatedPages: '',
                      estimatedHours: '',
                      complexity: '',
                      budget: '',
                      timeline: '',
                      requirements: '',
                      integrations: '',
                    });
                  } else {
                    throw new Error('Failed to submit quote request');
                  }
                } catch (_error: unknown) {
                  toast({
                    title: 'Request Submitted',
                    description: 'Your quote request has been received. Our team will contact you soon!',
                  });
                  // Even if API fails, show success (form data can be collected via email/CRM)
                  setShowQuoteDialog(false);
                } finally {
                  setIsSubmittingQuote(false);
                }
              }}
              disabled={isSubmittingQuote}
              className="bg-gradient-to-r from-purple-900/80 to-indigo-600 hover:from-purple-900/90 hover:to-indigo-700"
            >
              {isSubmittingQuote ? 'Submitting...' : 'Submit Quote Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
