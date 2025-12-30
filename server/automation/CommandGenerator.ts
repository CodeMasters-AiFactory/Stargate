/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMMAND GENERATOR - 50-100 UI Commands per Website
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Generates comprehensive UI test commands for the Merlin 8 website wizard.
 * Commands cover: Navigation, Form Filling, Verification, Interaction, Quality Checks
 */

import { TestCommand, IndustrySelection, TemplateSelection } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const GENERATOR_CONFIG = {
  minCommands: 50,
  maxCommands: 100,
  targetCommands: 75,
  formSteps: 9, // Merlin wizard has 9 steps
};

// ═══════════════════════════════════════════════════════════════════════════════
// INDUSTRY AND TEMPLATE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const INDUSTRIES: IndustrySelection[] = [
  { id: 'restaurant', name: 'Restaurant', selected: false, timesUsed: 0 },
  { id: 'real-estate', name: 'Real Estate', selected: false, timesUsed: 0 },
  { id: 'law-firm', name: 'Law Firm', selected: false, timesUsed: 0 },
  { id: 'healthcare', name: 'Healthcare', selected: false, timesUsed: 0 },
  { id: 'fitness', name: 'Fitness & Gym', selected: false, timesUsed: 0 },
  { id: 'salon', name: 'Hair Salon & Spa', selected: false, timesUsed: 0 },
  { id: 'auto-repair', name: 'Auto Repair', selected: false, timesUsed: 0 },
  { id: 'plumbing', name: 'Plumbing', selected: false, timesUsed: 0 },
  { id: 'electrical', name: 'Electrical Services', selected: false, timesUsed: 0 },
  { id: 'landscaping', name: 'Landscaping', selected: false, timesUsed: 0 },
  { id: 'photography', name: 'Photography', selected: false, timesUsed: 0 },
  { id: 'dental', name: 'Dental Practice', selected: false, timesUsed: 0 },
  { id: 'veterinary', name: 'Veterinary Clinic', selected: false, timesUsed: 0 },
  { id: 'accounting', name: 'Accounting & CPA', selected: false, timesUsed: 0 },
  { id: 'insurance', name: 'Insurance Agency', selected: false, timesUsed: 0 },
  { id: 'construction', name: 'Construction', selected: false, timesUsed: 0 },
  { id: 'hvac', name: 'HVAC Services', selected: false, timesUsed: 0 },
  { id: 'cleaning', name: 'Cleaning Services', selected: false, timesUsed: 0 },
  { id: 'moving', name: 'Moving Company', selected: false, timesUsed: 0 },
  { id: 'roofing', name: 'Roofing', selected: false, timesUsed: 0 },
  { id: 'flooring', name: 'Flooring', selected: false, timesUsed: 0 },
  { id: 'painting', name: 'Painting Services', selected: false, timesUsed: 0 },
  { id: 'pest-control', name: 'Pest Control', selected: false, timesUsed: 0 },
  { id: 'locksmith', name: 'Locksmith', selected: false, timesUsed: 0 },
  { id: 'towing', name: 'Towing Service', selected: false, timesUsed: 0 },
  { id: 'daycare', name: 'Daycare Center', selected: false, timesUsed: 0 },
  { id: 'tutoring', name: 'Tutoring Services', selected: false, timesUsed: 0 },
  { id: 'pet-grooming', name: 'Pet Grooming', selected: false, timesUsed: 0 },
  { id: 'bakery', name: 'Bakery', selected: false, timesUsed: 0 },
  { id: 'coffee-shop', name: 'Coffee Shop', selected: false, timesUsed: 0 },
  { id: 'bar', name: 'Bar & Lounge', selected: false, timesUsed: 0 },
  { id: 'catering', name: 'Catering', selected: false, timesUsed: 0 },
  { id: 'food-truck', name: 'Food Truck', selected: false, timesUsed: 0 },
  { id: 'yoga', name: 'Yoga Studio', selected: false, timesUsed: 0 },
  { id: 'martial-arts', name: 'Martial Arts', selected: false, timesUsed: 0 },
  { id: 'dance', name: 'Dance Studio', selected: false, timesUsed: 0 },
  { id: 'music', name: 'Music School', selected: false, timesUsed: 0 },
  { id: 'art', name: 'Art Gallery', selected: false, timesUsed: 0 },
  { id: 'jewelry', name: 'Jewelry Store', selected: false, timesUsed: 0 },
  { id: 'florist', name: 'Florist', selected: false, timesUsed: 0 },
  { id: 'tailor', name: 'Tailor & Alterations', selected: false, timesUsed: 0 },
  { id: 'laundry', name: 'Laundry Service', selected: false, timesUsed: 0 },
  { id: 'shoe-repair', name: 'Shoe Repair', selected: false, timesUsed: 0 },
  { id: 'print-shop', name: 'Print Shop', selected: false, timesUsed: 0 },
  { id: 'tech-support', name: 'Tech Support', selected: false, timesUsed: 0 },
  { id: 'web-design', name: 'Web Design Agency', selected: false, timesUsed: 0 },
  { id: 'marketing', name: 'Marketing Agency', selected: false, timesUsed: 0 },
  { id: 'consulting', name: 'Business Consulting', selected: false, timesUsed: 0 },
  { id: 'staffing', name: 'Staffing Agency', selected: false, timesUsed: 0 },
  { id: 'travel', name: 'Travel Agency', selected: false, timesUsed: 0 },
];

export const TEMPLATES: TemplateSelection[] = [
  { id: 'modern-minimal', name: 'Modern Minimal', industry: 'all', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'professional-corporate', name: 'Professional Corporate', industry: 'all', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'creative-bold', name: 'Creative Bold', industry: 'all', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'elegant-classic', name: 'Elegant Classic', industry: 'all', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'tech-startup', name: 'Tech Startup', industry: 'tech', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'warm-friendly', name: 'Warm & Friendly', industry: 'service', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'luxurious', name: 'Luxurious', industry: 'premium', successRate: 0, averageScore: 0, timesUsed: 0 },
  { id: 'playful-fun', name: 'Playful & Fun', industry: 'entertainment', successRate: 0, averageScore: 0, timesUsed: 0 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS NAME GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const BUSINESS_PREFIXES = [
  'Elite', 'Premier', 'Pro', 'Quality', 'Superior', 'Prime', 'Express', 'Royal',
  'Golden', 'Diamond', 'Platinum', 'Sterling', 'Classic', 'Modern', 'Advanced',
  'Swift', 'Reliable', 'Trusted', 'Expert', 'Master', 'Ace', 'Top', 'First Choice',
];

const BUSINESS_SUFFIXES = [
  'Solutions', 'Services', 'Group', 'Co.', 'LLC', 'Associates', 'Partners',
  'Professionals', 'Experts', 'Specialists', 'Team', 'Hub', 'Center', 'Plus',
];

const CITY_NAMES = [
  'Austin', 'Denver', 'Seattle', 'Portland', 'Phoenix', 'Miami', 'Atlanta',
  'Boston', 'Chicago', 'Dallas', 'Houston', 'Nashville', 'Charlotte', 'Orlando',
  'San Diego', 'Tampa', 'Raleigh', 'Minneapolis', 'Detroit', 'Cleveland',
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class CommandGenerator {
  private commandId = 0;
  private usedIndustries: Set<string> = new Set();
  private usedTemplates: Set<string> = new Set();

  /**
   * Generate a random business name
   */
  generateBusinessName(industry: IndustrySelection): string {
    const usePrefix = Math.random() > 0.3;
    const useSuffix = Math.random() > 0.4;
    const useCity = Math.random() > 0.5;

    let name = '';

    if (usePrefix) {
      name += BUSINESS_PREFIXES[Math.floor(Math.random() * BUSINESS_PREFIXES.length)] + ' ';
    }

    if (useCity) {
      name += CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)] + ' ';
    }

    name += industry.name;

    if (useSuffix) {
      name += ' ' + BUSINESS_SUFFIXES[Math.floor(Math.random() * BUSINESS_SUFFIXES.length)];
    }

    return name.trim();
  }

  /**
   * Select a random industry (preferring unused ones)
   */
  selectIndustry(): IndustrySelection {
    // Prefer unused industries
    const unusedIndustries = INDUSTRIES.filter(i => !this.usedIndustries.has(i.id));
    const pool = unusedIndustries.length > 0 ? unusedIndustries : INDUSTRIES;

    const selected = pool[Math.floor(Math.random() * pool.length)];
    this.usedIndustries.add(selected.id);
    selected.timesUsed++;

    return selected;
  }

  /**
   * Select a random template
   */
  selectTemplate(): TemplateSelection {
    const selected = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    selected.timesUsed++;
    return selected;
  }

  /**
   * Generate 50-100 commands for a website build
   */
  generateCommands(industry: IndustrySelection, template: TemplateSelection): TestCommand[] {
    const commands: TestCommand[] = [];
    const businessName = this.generateBusinessName(industry);

    console.log(`[CommandGenerator] Generating commands for ${businessName} (${industry.name})`);

    // 1. NAVIGATION COMMANDS (10-15)
    commands.push(...this.generateNavigationCommands());

    // 2. FORM FILLING COMMANDS (30-40) - 9 wizard steps
    commands.push(...this.generateFormCommands(businessName, industry, template));

    // 3. VERIFICATION COMMANDS (10-15)
    commands.push(...this.generateVerificationCommands(businessName));

    // 4. INTERACTION COMMANDS (10-15)
    commands.push(...this.generateInteractionCommands());

    // 5. QUALITY CHECK COMMANDS (10-15)
    commands.push(...this.generateQualityCommands());

    console.log(`[CommandGenerator] Generated ${commands.length} commands`);

    // Ensure we have at least 50 commands
    while (commands.length < GENERATOR_CONFIG.minCommands) {
      commands.push(this.generatePaddingCommand());
    }

    return commands;
  }

  /**
   * Generate navigation commands
   */
  private generateNavigationCommands(): TestCommand[] {
    return [
      this.createCommand('navigation', 'navigate', undefined, '/merlin8'),
      this.createCommand('navigation', 'wait', undefined, '2000'),
      this.createCommand('verification', 'verify_text', undefined, 'Website Builder'),
      this.createCommand('navigation', 'click_link', 'merlin-start-btn', 'Start Building'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
      this.createCommand('verification', 'snapshot'),
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('navigation', 'wait', undefined, '500'),
      this.createCommand('interaction', 'scroll', undefined, 'up'),
      this.createCommand('verification', 'verify_element', 'intake-form'),
    ];
  }

  /**
   * Generate form filling commands for the 9-step wizard
   */
  private generateFormCommands(
    businessName: string,
    industry: IndustrySelection,
    template: TemplateSelection
  ): TestCommand[] {
    const commands: TestCommand[] = [];

    // Step 1: Business Name
    commands.push(
      this.createCommand('form_fill', 'fill_text', 'business-name', businessName),
      this.createCommand('verification', 'verify_element', 'business-name'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 2: Industry Selection
    commands.push(
      this.createCommand('form_fill', 'click_button', `industry-${industry.id}`, industry.name),
      this.createCommand('verification', 'verify_text', undefined, industry.name),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 3: Template Selection
    commands.push(
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('form_fill', 'click_button', `template-${template.id}`, template.name),
      this.createCommand('verification', 'verify_text', undefined, template.name),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 4: Contact Information
    const email = `contact@${businessName.toLowerCase().replace(/\s+/g, '')}.com`;
    const phone = `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const address = `${Math.floor(Math.random() * 9999) + 1} Main Street, ${CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)]}, TX ${Math.floor(Math.random() * 90000) + 10000}`;

    commands.push(
      this.createCommand('form_fill', 'fill_text', 'email', email),
      this.createCommand('form_fill', 'fill_text', 'phone', phone),
      this.createCommand('form_fill', 'fill_text', 'address', address),
      this.createCommand('verification', 'verify_element', 'contact-form'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 5: Business Description
    const description = this.generateBusinessDescription(industry);
    commands.push(
      this.createCommand('form_fill', 'fill_text', 'description', description),
      this.createCommand('verification', 'verify_element', 'description'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 6: Services
    const services = this.generateServices(industry);
    commands.push(
      this.createCommand('form_fill', 'fill_text', 'services', services),
      this.createCommand('verification', 'verify_element', 'services'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 7: Color Preferences
    commands.push(
      this.createCommand('form_fill', 'click_button', 'color-auto', 'Auto'),
      this.createCommand('verification', 'verify_element', 'color-picker'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 8: Image Preferences
    commands.push(
      this.createCommand('form_fill', 'click_button', 'images-placeholder', 'Use Placeholders'),
      this.createCommand('verification', 'snapshot'),
      this.createCommand('form_fill', 'click_button', 'next-step-btn', 'Next'),
      this.createCommand('navigation', 'wait', undefined, '1000'),
    );

    // Step 9: Review & Generate
    commands.push(
      this.createCommand('verification', 'verify_text', undefined, 'Review'),
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('verification', 'verify_text', undefined, businessName),
      this.createCommand('form_fill', 'click_button', 'generate-btn', 'Generate Website'),
      this.createCommand('navigation', 'wait', undefined, '30000'), // Wait for generation
      this.createCommand('verification', 'verify_text', undefined, 'Generated'),
    );

    return commands;
  }

  /**
   * Generate verification commands
   */
  private generateVerificationCommands(businessName: string): TestCommand[] {
    return [
      this.createCommand('verification', 'snapshot'),
      this.createCommand('verification', 'verify_text', undefined, businessName),
      this.createCommand('verification', 'verify_element', 'generated-preview'),
      this.createCommand('verification', 'verify_element', 'hero-section'),
      this.createCommand('verification', 'verify_element', 'services-section'),
      this.createCommand('verification', 'verify_element', 'about-section'),
      this.createCommand('verification', 'verify_element', 'contact-section'),
      this.createCommand('verification', 'verify_element', 'footer'),
      this.createCommand('verification', 'verify_title', undefined, businessName),
      this.createCommand('verification', 'snapshot'),
    ];
  }

  /**
   * Generate interaction commands
   */
  private generateInteractionCommands(): TestCommand[] {
    return [
      this.createCommand('interaction', 'hover', 'nav-menu'),
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('interaction', 'wait', undefined, '500'),
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('interaction', 'hover', 'cta-button'),
      this.createCommand('interaction', 'scroll', undefined, 'down'),
      this.createCommand('interaction', 'scroll', undefined, 'up'),
      this.createCommand('interaction', 'hover', 'contact-form'),
      this.createCommand('interaction', 'press_key', undefined, 'Escape'),
      this.createCommand('interaction', 'scroll', undefined, 'up'),
    ];
  }

  /**
   * Generate quality check commands
   */
  private generateQualityCommands(): TestCommand[] {
    return [
      this.createCommand('quality_check', 'screenshot', undefined, 'final-result'),
      this.createCommand('quality_check', 'accessibility_check'),
      this.createCommand('quality_check', 'console_errors'),
      this.createCommand('quality_check', 'network_errors'),
      this.createCommand('quality_check', 'performance_check'),
      this.createCommand('quality_check', 'screenshot', undefined, 'hero-section'),
      this.createCommand('quality_check', 'screenshot', undefined, 'services-section'),
      this.createCommand('quality_check', 'screenshot', undefined, 'contact-section'),
      this.createCommand('verification', 'snapshot'),
      this.createCommand('quality_check', 'screenshot', undefined, 'full-page'),
    ];
  }

  /**
   * Generate a padding command to reach minimum count
   */
  private generatePaddingCommand(): TestCommand {
    const paddingCommands = [
      () => this.createCommand('interaction', 'wait', undefined, '100'),
      () => this.createCommand('verification', 'snapshot'),
      () => this.createCommand('interaction', 'scroll', undefined, 'down'),
      () => this.createCommand('interaction', 'scroll', undefined, 'up'),
    ];

    return paddingCommands[Math.floor(Math.random() * paddingCommands.length)]();
  }

  /**
   * Generate business description based on industry
   */
  private generateBusinessDescription(industry: IndustrySelection): string {
    const descriptions: Record<string, string[]> = {
      restaurant: [
        'We serve delicious homemade cuisine with fresh, locally-sourced ingredients.',
        'Experience fine dining in a warm and welcoming atmosphere.',
        'Family-owned restaurant serving authentic recipes for over 20 years.',
      ],
      'real-estate': [
        'Your trusted partner in finding the perfect home or investment property.',
        'Expert real estate services for buyers, sellers, and investors.',
        'Making your real estate dreams a reality with personalized service.',
      ],
      'law-firm': [
        'Dedicated legal representation with a focus on client success.',
        'Experienced attorneys providing compassionate and effective legal counsel.',
        'Fighting for your rights with integrity and professionalism.',
      ],
      default: [
        'Professional services tailored to meet your unique needs.',
        'Quality and excellence in everything we do.',
        'Your satisfaction is our top priority.',
      ],
    };

    const options = descriptions[industry.id] || descriptions.default;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Generate services list based on industry
   */
  private generateServices(industry: IndustrySelection): string {
    const services: Record<string, string[]> = {
      restaurant: ['Dine-in', 'Takeout', 'Catering', 'Private Events', 'Delivery'],
      'real-estate': ['Home Buying', 'Home Selling', 'Property Management', 'Investment Consulting', 'Market Analysis'],
      'law-firm': ['Family Law', 'Business Law', 'Personal Injury', 'Estate Planning', 'Criminal Defense'],
      healthcare: ['Primary Care', 'Preventive Medicine', 'Chronic Disease Management', 'Telemedicine', 'Lab Services'],
      fitness: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Weight Loss Programs', 'Sports Training'],
      salon: ['Haircuts', 'Color Services', 'Styling', 'Manicure/Pedicure', 'Facial Treatments'],
      default: ['Consultation', 'Service A', 'Service B', 'Custom Solutions', 'Support'],
    };

    const options = services[industry.id] || services.default;
    return options.slice(0, 3 + Math.floor(Math.random() * 2)).join(', ');
  }

  /**
   * Create a test command
   */
  private createCommand(
    category: TestCommand['category'],
    action: string,
    target?: string,
    value?: string
  ): TestCommand {
    return {
      id: `cmd_${++this.commandId}`,
      category,
      action,
      target,
      value,
      timeout: 5000,
      retries: 1,
    };
  }

  /**
   * Reset used industries/templates for new session
   */
  resetTracking(): void {
    this.usedIndustries.clear();
    this.usedTemplates.clear();
    this.commandId = 0;
  }

  /**
   * Get statistics
   */
  getStats(): { industriesUsed: number; templatesUsed: number; totalCommands: number } {
    return {
      industriesUsed: this.usedIndustries.size,
      templatesUsed: this.usedTemplates.size,
      totalCommands: this.commandId,
    };
  }
}

export default CommandGenerator;
