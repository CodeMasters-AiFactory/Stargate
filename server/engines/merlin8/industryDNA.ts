/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - INDUSTRY DNA ENGINE 🧬
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The SECRET SAUCE that makes Merlin produce agency-quality websites.
 * Each industry has a unique "DNA profile" that defines:
 * - Color schemes
 * - Typography
 * - Design patterns
 * - Image prompts for Leonardo AI
 * - Copywriting tone and vocabulary
 * - Section recommendations
 */

export interface IndustryDNA {
  id: string;
  name: string;
  keywords: string[]; // For auto-detection
  
  design: {
    colorScheme: 'dark' | 'light' | 'warm' | 'cool' | 'luxury';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    
    fonts: {
      heading: string;
      body: string;
      accent?: string;
    };
    
    aesthetic: string; // Description for AI
    heroStyle: 'full-bleed' | 'split' | 'minimal' | 'video' | 'gradient';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    shadows: 'none' | 'subtle' | 'medium' | 'dramatic';
  };
  
  images: {
    hero: string;      // Leonardo prompt
    services: string;  // Leonardo prompt
    about: string;     // Leonardo prompt
    team: string;      // Leonardo prompt
    background?: string;
    style: string;     // Overall image style guidance
  };
  
  copy: {
    tone: string;
    powerWords: string[];
    avoidWords: string[];
    ctaText: string[];
    taglineStyle: string;
  };
  
  sections: string[]; // Recommended sections in order
  
  specialFeatures?: string[]; // Industry-specific features
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDUSTRY DNA PROFILES
// ═══════════════════════════════════════════════════════════════════════════════

export const INDUSTRY_DNA: Record<string, IndustryDNA> = {
  
  // ─────────────────────────────────────────────────────────────────────────────
  // RACING / MOTORSPORT
  // ─────────────────────────────────────────────────────────────────────────────
  'racing': {
    id: 'racing',
    name: 'Racing & Motorsport',
    keywords: ['f1', 'formula 1', 'racing', 'motorsport', 'race team', 'karting', 'nascar', 'rally'],
    
    design: {
      colorScheme: 'dark',
      primaryColor: '#E10600',
      secondaryColor: '#1E1E1E',
      accentColor: '#FFFFFF',
      backgroundColor: '#0D0D0D',
      textColor: '#FFFFFF',
      
      fonts: {
        heading: "'Orbitron', 'Rajdhani', sans-serif",
        body: "'Inter', 'Roboto', sans-serif",
      },
      
      aesthetic: 'Aggressive, fast, dramatic, high-tech, adrenaline',
      heroStyle: 'full-bleed',
      borderRadius: 'small',
      shadows: 'dramatic',
    },
    
    images: {
      hero: 'Formula 1 race car speeding on track at night, dramatic lighting, motion blur, professional motorsport photography, sparks flying, red and black car',
      services: 'F1 pit crew in action changing tires, professional motorsport photography, dramatic lighting, synchronized team work, red uniforms',
      about: 'Racing team garage with engineers working on car, high-tech equipment, dramatic lighting, professional motorsport',
      team: 'Racing driver portrait with helmet visor up, confident intense expression, professional motorsport photography, red racing suit',
      background: 'Aerial view of racing circuit at night with lights, dramatic atmosphere',
      style: 'High contrast, dramatic lighting, motion blur, professional motorsport photography',
    },
    
    copy: {
      tone: 'Powerful, confident, technical, championship-focused',
      powerWords: ['championship', 'podium', 'velocity', 'precision', 'engineering excellence', 'victory', 'pole position', 'apex', 'fastest lap', 'glory'],
      avoidWords: ['nice', 'good', 'services', 'solutions', 'helping', 'affordable'],
      ctaText: ['Join the Team', 'Race with Us', 'Become a Partner', 'Enter the Grid'],
      taglineStyle: 'Short, punchy, speed-focused',
    },
    
    sections: ['hero', 'stats', 'services', 'team', 'calendar', 'sponsors', 'cta', 'footer'],
    specialFeatures: ['race-calendar', 'live-timing', 'driver-stats'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RESTAURANT / FOOD
  // ─────────────────────────────────────────────────────────────────────────────
  'restaurant': {
    id: 'restaurant',
    name: 'Restaurant & Dining',
    keywords: ['restaurant', 'cafe', 'bistro', 'dining', 'food', 'cuisine', 'eatery', 'kitchen', 'chef'],
    
    design: {
      colorScheme: 'warm',
      primaryColor: '#8B4513',
      secondaryColor: '#2F4F4F',
      accentColor: '#D4AF37',
      backgroundColor: '#FFF8F0',
      textColor: '#2D2D2D',
      
      fonts: {
        heading: "'Playfair Display', 'Cormorant', serif",
        body: "'Lato', 'Open Sans', sans-serif",
        accent: "'Great Vibes', cursive",
      },
      
      aesthetic: 'Warm, appetizing, inviting, elegant, sensory',
      heroStyle: 'full-bleed',
      borderRadius: 'medium',
      shadows: 'subtle',
    },
    
    images: {
      hero: 'Elegant restaurant interior with warm ambient lighting, fine dining table setting, romantic atmosphere, candles, wine glasses',
      services: 'Gourmet dish beautifully plated, professional food photography, appetizing colors, fresh ingredients visible, steam rising',
      about: 'Professional chef cooking in kitchen, flames from pan, action shot, passionate cooking, clean modern kitchen',
      team: 'Restaurant team portrait, chef and staff, warm smiles, professional uniforms, welcoming atmosphere',
      background: 'Close-up of fresh ingredients, herbs, vegetables, rustic wooden surface',
      style: 'Warm lighting, appetizing colors, shallow depth of field, food photography style',
    },
    
    copy: {
      tone: 'Warm, inviting, sensory, passionate about food',
      powerWords: ['savor', 'crafted', 'fresh', 'seasonal', 'artisan', 'locally-sourced', 'handmade', 'signature', 'indulge', 'exquisite'],
      avoidWords: ['cheap', 'fast', 'deal', 'discount', 'budget'],
      ctaText: ['Reserve a Table', 'View Our Menu', 'Book Now', 'Experience the Taste'],
      taglineStyle: 'Evocative, sensory, appetite-inducing',
    },
    
    sections: ['hero', 'about', 'menu-preview', 'chef', 'gallery', 'testimonials', 'reservation', 'location', 'footer'],
    specialFeatures: ['menu-display', 'reservation-widget', 'hours-display'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // LAW FIRM / LEGAL
  // ─────────────────────────────────────────────────────────────────────────────
  'legal': {
    id: 'legal',
    name: 'Law Firm & Legal Services',
    keywords: ['law firm', 'attorney', 'lawyer', 'legal', 'litigation', 'counsel', 'advocate', 'solicitor'],

    design: {
      colorScheme: 'light', // Fixed: was 'dark' but has white background
      primaryColor: '#1B365D',
      secondaryColor: '#8B7355',
      accentColor: '#C9A962',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      
      fonts: {
        heading: "'Libre Baskerville', 'Georgia', serif",
        body: "'Source Sans Pro', 'Arial', sans-serif",
      },
      
      aesthetic: 'Professional, trustworthy, authoritative, established, dignified',
      heroStyle: 'split',
      borderRadius: 'none',
      shadows: 'subtle',
    },
    
    images: {
      hero: 'Modern law office interior, conference room with city view, professional atmosphere, dark wood furniture, law books',
      services: 'Lawyer reviewing documents at desk, professional setting, focused concentration, legal papers, laptop',
      about: 'Law firm partners in professional meeting, business attire, confident expressions, modern office',
      team: 'Professional attorney portrait, business suit, confident pose, neutral background, trustworthy expression',
      background: 'Scales of justice close-up, dramatic lighting, symbolic legal imagery',
      style: 'Professional, corporate, clean lighting, business photography style',
    },
    
    copy: {
      tone: 'Professional, authoritative, reassuring, experienced',
      powerWords: ['justice', 'advocate', 'protect', 'expertise', 'proven track record', 'dedicated', 'strategic', 'results-driven', 'trusted'],
      avoidWords: ['cheap', 'discount', 'deal', 'fast', 'easy'],
      ctaText: ['Schedule a Consultation', 'Get Legal Help', 'Speak with an Attorney', 'Protect Your Rights'],
      taglineStyle: 'Authoritative, trustworthy, results-focused',
    },
    
    sections: ['hero', 'practice-areas', 'about', 'attorneys', 'results', 'testimonials', 'consultation-cta', 'footer'],
    specialFeatures: ['practice-areas', 'case-results', 'free-consultation'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TECH STARTUP
  // ─────────────────────────────────────────────────────────────────────────────
  'tech': {
    id: 'tech',
    name: 'Tech Startup & SaaS',
    keywords: ['tech', 'startup', 'saas', 'software', 'application', 'platform', 'digital', 'innovation', 'artificial intelligence', 'cloud', 'machine learning', 'api'],
    
    design: {
      colorScheme: 'cool',
      primaryColor: '#6366F1',
      secondaryColor: '#0F172A',
      accentColor: '#22D3EE',
      backgroundColor: '#FFFFFF',
      textColor: '#1E293B',
      
      fonts: {
        heading: "'Inter', 'SF Pro Display', sans-serif",
        body: "'Inter', 'Roboto', sans-serif",
      },
      
      aesthetic: 'Modern, innovative, clean, futuristic, minimal',
      heroStyle: 'gradient',
      borderRadius: 'large',
      shadows: 'medium',
    },
    
    images: {
      hero: 'Abstract 3D geometric shapes floating in gradient background, modern tech aesthetic, purple and blue tones, futuristic',
      services: 'Modern laptop showing dashboard interface, clean desk setup, minimal workspace, tech aesthetic',
      about: 'Diverse startup team collaborating in modern office, standing meeting, whiteboard, energetic atmosphere',
      team: 'Professional headshot, casual business attire, friendly smile, modern office background, approachable tech leader',
      background: 'Abstract gradient mesh, purple blue teal colors, smooth flowing shapes',
      style: 'Clean, modern, gradient backgrounds, minimal, tech-forward',
    },
    
    copy: {
      tone: 'Innovative, confident, forward-thinking, benefit-focused',
      powerWords: ['transform', 'revolutionize', 'seamless', 'powerful', 'intelligent', 'scale', 'automate', 'streamline', 'next-generation'],
      avoidWords: ['old', 'traditional', 'legacy', 'basic', 'simple'],
      ctaText: ['Start Free Trial', 'Get Started', 'See Demo', 'Try for Free'],
      taglineStyle: 'Benefit-driven, innovative, concise',
    },
    
    sections: ['hero', 'features', 'how-it-works', 'benefits', 'pricing', 'testimonials', 'integrations', 'cta', 'footer'],
    specialFeatures: ['pricing-table', 'feature-comparison', 'integration-logos'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REAL ESTATE
  // ─────────────────────────────────────────────────────────────────────────────
  'realestate': {
    id: 'realestate',
    name: 'Real Estate & Property',
    keywords: ['real estate', 'realtor', 'property', 'homes', 'houses', 'apartments', 'broker', 'listings'],
    
    design: {
      colorScheme: 'luxury',
      primaryColor: '#1A1A2E',
      secondaryColor: '#C9A962',
      accentColor: '#FFFFFF',
      backgroundColor: '#FAFAFA',
      textColor: '#1A1A1A',
      
      fonts: {
        heading: "'Cormorant Garamond', 'Playfair Display', serif",
        body: "'Raleway', 'Montserrat', sans-serif",
      },
      
      aesthetic: 'Luxury, aspirational, elegant, spacious, premium',
      heroStyle: 'full-bleed',
      borderRadius: 'small',
      shadows: 'subtle',
    },
    
    images: {
      hero: 'Luxury modern home exterior at twilight, warm interior lights glowing, beautiful landscaping, aspirational real estate photography',
      services: 'Stunning living room interior, high ceilings, natural light, modern luxury furniture, real estate photography',
      about: 'Professional real estate agent showing property to happy couple, luxury home interior, friendly interaction',
      team: 'Professional realtor portrait, business attire, confident friendly smile, luxury home background',
      background: 'Aerial view of luxury neighborhood, beautiful homes, tree-lined streets',
      style: 'Bright, aspirational, magazine-quality, luxury real estate photography',
    },
    
    copy: {
      tone: 'Aspirational, trustworthy, local expertise, lifestyle-focused',
      powerWords: ['dream home', 'luxury', 'exclusive', 'prime location', 'stunning', 'move-in ready', 'investment', 'lifestyle', 'community'],
      avoidWords: ['cheap', 'fixer-upper', 'basic', 'small'],
      ctaText: ['Find Your Home', 'View Listings', 'Schedule a Showing', 'Get Market Report'],
      taglineStyle: 'Aspirational, lifestyle-focused, local',
    },
    
    sections: ['hero', 'featured-listings', 'services', 'about', 'neighborhoods', 'testimonials', 'market-stats', 'contact', 'footer'],
    specialFeatures: ['property-search', 'mortgage-calculator', 'neighborhood-guide'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FITNESS / GYM
  // ─────────────────────────────────────────────────────────────────────────────
  'fitness': {
    id: 'fitness',
    name: 'Fitness & Gym',
    keywords: ['gym', 'fitness', 'workout', 'training', 'crossfit', 'personal trainer', 'health club', 'exercise'],
    
    design: {
      colorScheme: 'dark',
      primaryColor: '#FF4500',
      secondaryColor: '#1A1A1A',
      accentColor: '#00FF88',
      backgroundColor: '#0A0A0A',
      textColor: '#FFFFFF',
      
      fonts: {
        heading: "'Bebas Neue', 'Oswald', sans-serif",
        body: "'Roboto', 'Open Sans', sans-serif",
      },
      
      aesthetic: 'Energetic, powerful, motivational, intense, transformative',
      heroStyle: 'full-bleed',
      borderRadius: 'none',
      shadows: 'dramatic',
    },
    
    images: {
      hero: 'Intense gym workout scene, athlete lifting weights, dramatic lighting, sweat and determination, powerful atmosphere',
      services: 'Modern gym interior with equipment, moody lighting, professional fitness facility, motivational atmosphere',
      about: 'Personal trainer coaching client, supportive interaction, gym setting, focused training session',
      team: 'Fit personal trainer portrait, athletic wear, confident powerful pose, gym background, motivational presence',
      background: 'Abstract fitness texture, gym equipment silhouettes, dramatic red and black',
      style: 'High contrast, dramatic lighting, powerful poses, fitness photography',
    },
    
    copy: {
      tone: 'Motivational, powerful, transformative, no-excuses',
      powerWords: ['transform', 'unleash', 'power', 'strength', 'results', 'elite', 'breakthrough', 'dominate', 'conquer'],
      avoidWords: ['easy', 'gentle', 'slow', 'comfortable', 'relaxed'],
      ctaText: ['Start Your Transformation', 'Join Now', 'Get Fit Today', 'Claim Free Trial'],
      taglineStyle: 'Motivational, action-oriented, transformative',
    },
    
    sections: ['hero', 'programs', 'trainers', 'facilities', 'transformations', 'membership', 'schedule', 'cta', 'footer'],
    specialFeatures: ['class-schedule', 'membership-plans', 'transformation-gallery'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MEDICAL / HEALTHCARE
  // ─────────────────────────────────────────────────────────────────────────────
  'medical': {
    id: 'medical',
    name: 'Medical & Healthcare',
    keywords: ['medical', 'healthcare', 'doctor', 'clinic', 'hospital', 'physician', 'health', 'care', 'wellness'],
    
    design: {
      colorScheme: 'light',
      primaryColor: '#0077B6',
      secondaryColor: '#00B4D8',
      accentColor: '#48CAE4',
      backgroundColor: '#FFFFFF',
      textColor: '#1D3557',
      
      fonts: {
        heading: "'Poppins', 'Nunito', sans-serif",
        body: "'Open Sans', 'Lato', sans-serif",
      },
      
      aesthetic: 'Clean, trustworthy, caring, professional, modern',
      heroStyle: 'split',
      borderRadius: 'large',
      shadows: 'subtle',
    },
    
    images: {
      hero: 'Friendly doctor consulting with patient, modern clinic, warm caring interaction, professional medical setting',
      services: 'Modern medical facility interior, clean bright space, advanced equipment, welcoming healthcare environment',
      about: 'Medical team group photo, diverse healthcare professionals, friendly smiles, scrubs and white coats',
      team: 'Doctor portrait with stethoscope, warm friendly smile, white coat, professional medical photography',
      background: 'Abstract medical pattern, soft blue tones, clean healthcare aesthetic',
      style: 'Bright, clean, friendly, professional healthcare photography',
    },
    
    copy: {
      tone: 'Caring, professional, reassuring, patient-focused',
      powerWords: ['care', 'trusted', 'compassionate', 'experienced', 'state-of-the-art', 'personalized', 'healing', 'wellness', 'dedicated'],
      avoidWords: ['cheap', 'discount', 'fast', 'quick fix'],
      ctaText: ['Book Appointment', 'Schedule Visit', 'Contact Us', 'Get Care Today'],
      taglineStyle: 'Caring, professional, patient-centered',
    },
    
    sections: ['hero', 'services', 'about', 'doctors', 'facilities', 'testimonials', 'insurance', 'appointment', 'footer'],
    specialFeatures: ['appointment-booking', 'doctor-profiles', 'insurance-list'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PHOTOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────────
  'photography': {
    id: 'photography',
    name: 'Photography & Creative',
    keywords: ['photography', 'photographer', 'photo', 'portrait', 'wedding photography', 'studio', 'creative'],
    
    design: {
      colorScheme: 'dark',
      primaryColor: '#FFFFFF',
      secondaryColor: '#1A1A1A',
      accentColor: '#C9A962',
      backgroundColor: '#0A0A0A',
      textColor: '#FFFFFF',
      
      fonts: {
        heading: "'Cormorant Garamond', 'Playfair Display', serif",
        body: "'Montserrat', 'Raleway', sans-serif",
      },
      
      aesthetic: 'Artistic, minimal, gallery-like, sophisticated, visual-first',
      heroStyle: 'full-bleed',
      borderRadius: 'none',
      shadows: 'none',
    },
    
    images: {
      hero: 'Stunning portrait photograph, dramatic lighting, artistic composition, professional photography example',
      services: 'Behind the scenes photography shoot, photographer with camera, creative studio setting',
      about: 'Professional photographer portrait, holding camera, artistic lighting, creative personality',
      team: 'Photographer in action at shoot, capturing moment, professional equipment, passionate artist',
      background: 'Abstract dark texture, subtle photography equipment silhouettes, moody artistic atmosphere',
      style: 'Artistic, dramatic lighting, portfolio-quality, minimal',
    },
    
    copy: {
      tone: 'Artistic, passionate, personal, story-focused',
      powerWords: ['capture', 'moments', 'timeless', 'artistic', 'vision', 'story', 'emotion', 'authentic', 'beautiful'],
      avoidWords: ['cheap', 'budget', 'quick', 'basic'],
      ctaText: ['View Portfolio', 'Book a Session', 'Let\'s Create', 'Tell Your Story'],
      taglineStyle: 'Artistic, emotional, personal',
    },
    
    sections: ['hero', 'portfolio-grid', 'about', 'services', 'process', 'testimonials', 'contact', 'footer'],
    specialFeatures: ['portfolio-gallery', 'lightbox', 'booking-calendar'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SALON / SPA
  // ─────────────────────────────────────────────────────────────────────────────
  'salon': {
    id: 'salon',
    name: 'Salon & Spa',
    keywords: ['salon', 'spa', 'beauty', 'hair', 'nails', 'massage', 'wellness', 'skincare', 'barber'],
    
    design: {
      colorScheme: 'warm',
      primaryColor: '#D4A373',
      secondaryColor: '#CCD5AE',
      accentColor: '#E9EDC9',
      backgroundColor: '#FEFAE0',
      textColor: '#3D405B',
      
      fonts: {
        heading: "'Cormorant Garamond', 'Playfair Display', serif",
        body: "'Quicksand', 'Nunito', sans-serif",
      },
      
      aesthetic: 'Relaxing, elegant, feminine, luxurious, serene',
      heroStyle: 'split',
      borderRadius: 'large',
      shadows: 'subtle',
    },
    
    images: {
      hero: 'Luxurious spa interior, calm atmosphere, soft lighting, elegant wellness space, relaxation ambiance',
      services: 'Professional spa treatment in progress, massage or facial, peaceful setting, skilled therapist',
      about: 'Beautiful salon interior, styling stations, modern elegant design, welcoming atmosphere',
      team: 'Spa therapist or stylist portrait, professional uniform, warm smile, calming presence',
      background: 'Spa elements arrangement, candles, flowers, stones, serene composition',
      style: 'Soft lighting, calming tones, elegant, wellness photography',
    },
    
    copy: {
      tone: 'Relaxing, pampering, luxurious, rejuvenating',
      powerWords: ['rejuvenate', 'pamper', 'indulge', 'transform', 'luxurious', 'serene', 'radiant', 'refresh', 'escape'],
      avoidWords: ['cheap', 'basic', 'quick', 'discount'],
      ctaText: ['Book Your Escape', 'Treat Yourself', 'Schedule Appointment', 'Begin Your Journey'],
      taglineStyle: 'Relaxing, indulgent, transformative',
    },
    
    sections: ['hero', 'services', 'about', 'team', 'gallery', 'testimonials', 'booking', 'footer'],
    specialFeatures: ['service-menu', 'online-booking', 'gift-cards'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONSTRUCTION
  // ─────────────────────────────────────────────────────────────────────────────
  'construction': {
    id: 'construction',
    name: 'Construction & Contracting',
    keywords: ['construction', 'contractor', 'builder', 'renovation', 'remodeling', 'roofing', 'plumbing', 'electrical'],
    
    design: {
      colorScheme: 'dark',
      primaryColor: '#F59E0B',
      secondaryColor: '#1F2937',
      accentColor: '#FFFFFF',
      backgroundColor: '#111827',
      textColor: '#F9FAFB',
      
      fonts: {
        heading: "'Oswald', 'Barlow Condensed', sans-serif",
        body: "'Roboto', 'Open Sans', sans-serif",
      },
      
      aesthetic: 'Strong, reliable, professional, industrial, trustworthy',
      heroStyle: 'full-bleed',
      borderRadius: 'small',
      shadows: 'medium',
    },
    
    images: {
      hero: 'Construction team on job site, professional workers, building in progress, hardhat and safety gear, teamwork',
      services: 'Beautiful completed home renovation, before/after quality, professional craftsmanship result',
      about: 'Construction crew working together, professional coordination, skilled tradesmen, job site',
      team: 'Construction company owner portrait, professional attire, confident trustworthy expression, job site background',
      background: 'Construction texture, concrete, steel, industrial materials, strong foundation',
      style: 'Professional, documentary style, showing quality work, trustworthy',
    },
    
    copy: {
      tone: 'Reliable, experienced, quality-focused, straightforward',
      powerWords: ['built to last', 'quality', 'trusted', 'experienced', 'licensed', 'insured', 'professional', 'craftsmanship', 'guaranteed'],
      avoidWords: ['cheap', 'fast', 'discount', 'budget'],
      ctaText: ['Get Free Quote', 'Request Estimate', 'Start Your Project', 'Call Now'],
      taglineStyle: 'Trustworthy, quality-focused, experienced',
    },
    
    sections: ['hero', 'services', 'projects', 'about', 'process', 'testimonials', 'certifications', 'quote-form', 'footer'],
    specialFeatures: ['project-gallery', 'quote-calculator', 'service-areas'],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERIC BUSINESS (Default fallback)
  // ─────────────────────────────────────────────────────────────────────────────
  'business': {
    id: 'business',
    name: 'General Business',
    keywords: ['business', 'company', 'services', 'solutions', 'enterprise', 'consulting', 'professional'],

    design: {
      colorScheme: 'light',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      accentColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',

      fonts: {
        heading: "'Inter', 'Helvetica Neue', sans-serif",
        body: "'Inter', 'Arial', sans-serif",
      },

      aesthetic: 'Professional, clean, trustworthy, modern, versatile',
      heroStyle: 'split',
      borderRadius: 'medium',
      shadows: 'subtle',
    },

    images: {
      hero: 'Modern professional office environment, clean workspace, natural light, contemporary business setting',
      services: 'Team collaboration in meeting room, diverse professionals working together, modern office',
      about: 'Professional team portrait, business attire, friendly confident expressions, office background',
      team: 'Professional headshot, business casual attire, approachable smile, neutral background',
      background: 'Abstract business pattern, subtle blue tones, professional atmosphere',
      style: 'Professional, clean, corporate photography, natural lighting',
    },

    copy: {
      tone: 'Professional, approachable, confident, solution-focused',
      powerWords: ['trusted', 'professional', 'dedicated', 'experienced', 'reliable', 'quality', 'excellence', 'commitment', 'results'],
      avoidWords: ['cheap', 'discount', 'budget', 'basic'],
      ctaText: ['Get Started', 'Contact Us', 'Learn More', 'Request a Quote'],
      taglineStyle: 'Professional, benefit-focused, clear',
    },

    sections: ['hero', 'services', 'about', 'team', 'testimonials', 'contact', 'footer'],
    specialFeatures: ['contact-form', 'service-list'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect industry from business description
 * Uses word boundary matching to avoid false positives with short keywords
 */
export function detectIndustry(businessName: string, description: string): IndustryDNA {
  const searchText = `${businessName} ${description}`.toLowerCase();

  // Score each industry based on keyword matches
  let bestMatch: IndustryDNA | null = null;
  let bestScore = 0;

  for (const dna of Object.values(INDUSTRY_DNA)) {
    let score = 0;
    for (const keyword of dna.keywords) {
      const keywordLower = keyword.toLowerCase();
      // Use word boundary regex to prevent false positives
      // e.g., 'tech' should not match 'technology' unless 'technology' is the keyword
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(searchText)) {
        score += keyword.split(' ').length; // Multi-word matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = dna;
    }
  }

  // Default to generic business if no match found
  return bestMatch || INDUSTRY_DNA['business'];
}

/**
 * Get industry DNA by ID
 */
export function getIndustryDNA(industryId: string): IndustryDNA {
  return INDUSTRY_DNA[industryId] || INDUSTRY_DNA['business'];
}

/**
 * Get all industries for selection UI
 */
export function getAllIndustries(): Array<{ id: string; name: string }> {
  return Object.values(INDUSTRY_DNA).map(dna => ({
    id: dna.id,
    name: dna.name,
  }));
}

/**
 * Generate CSS variables from industry DNA
 */
export function generateCSSVariables(dna: IndustryDNA): string {
  return `
:root {
  --color-primary: ${dna.design.primaryColor};
  --color-secondary: ${dna.design.secondaryColor};
  --color-accent: ${dna.design.accentColor};
  --color-background: ${dna.design.backgroundColor};
  --color-text: ${dna.design.textColor};
  
  --font-heading: ${dna.design.fonts.heading};
  --font-body: ${dna.design.fonts.body};
  
  --border-radius: ${dna.design.borderRadius === 'none' ? '0' : 
                     dna.design.borderRadius === 'small' ? '4px' : 
                     dna.design.borderRadius === 'medium' ? '8px' : '16px'};
  
  --shadow: ${dna.design.shadows === 'none' ? 'none' : 
              dna.design.shadows === 'subtle' ? '0 2px 8px rgba(0,0,0,0.1)' : 
              dna.design.shadows === 'medium' ? '0 4px 16px rgba(0,0,0,0.15)' : 
              '0 8px 32px rgba(0,0,0,0.25)'};
}
  `.trim();
}

export default INDUSTRY_DNA;
