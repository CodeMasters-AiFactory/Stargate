/**
 * ProjectQuestionnaire - Step 2 of Professional Design flow
 * Comprehensive form to gather all project information before the consultation
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Target,
  Palette,
  FileText,
  Settings,
  DollarSign,
  Upload,
  Plus,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export interface QuestionnaireData {
  // Business Information
  businessName: string;
  industry: string;
  yearsInBusiness: string;
  targetAudience: string;
  competitors: string[];

  // Contact Info
  contactName: string;
  email: string;
  phone: string;

  // Website Goals
  primaryPurpose: string;
  keyActions: string;
  problemsToSolve: string;

  // Design Preferences
  brandColors: string;
  hasLogo: boolean;
  logoFile?: File;
  stylePreference: string;
  websitesLoved: string[];
  websitesDisliked: string[];
  mustHaveFeatures: string;

  // Content & Pages
  pageCount: string;
  hasContentReady: string;
  needsOngoingUpdates: boolean;
  needsBlog: boolean;

  // Technical Requirements
  needsEcommerce: boolean;
  productCount?: string;
  needsBooking: boolean;
  needsMultilingual: boolean;
  languages?: string;
  existingDomain: string;
  currentHosting: string;

  // Budget & Timeline
  budgetRange: string;
  idealLaunchDate: string;
  isDateFlexible: boolean;

  // Additional Notes
  additionalNotes: string;
}

interface ProjectQuestionnaireProps {
  initialData: QuestionnaireData | null;
  onComplete: (data: QuestionnaireData) => void;
  onBack: () => void;
}

const INDUSTRIES = [
  'Technology / Software',
  'Healthcare / Medical',
  'Finance / Banking',
  'E-commerce / Retail',
  'Real Estate',
  'Professional Services',
  'Education',
  'Restaurant / Food Service',
  'Travel / Hospitality',
  'Creative / Design Agency',
  'Manufacturing',
  'Non-Profit',
  'Legal Services',
  'Fitness / Wellness',
  'Other'
];

const STYLE_PREFERENCES = [
  { value: 'modern', label: 'Modern & Clean', description: 'Sleek, contemporary design with plenty of whitespace' },
  { value: 'classic', label: 'Classic & Timeless', description: 'Traditional, elegant design that never goes out of style' },
  { value: 'bold', label: 'Bold & Vibrant', description: 'Eye-catching colors and striking visual elements' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, focused design with essential elements only' },
  { value: 'luxury', label: 'Luxury & Premium', description: 'High-end, sophisticated design with premium feel' },
  { value: 'playful', label: 'Playful & Creative', description: 'Fun, engaging design with creative elements' }
];

const BUDGET_RANGES = [
  { value: '3k-5k', label: '$3,000 - $5,000', description: 'Basic professional website' },
  { value: '5k-10k', label: '$5,000 - $10,000', description: 'Custom design with advanced features' },
  { value: '10k-20k', label: '$10,000 - $20,000', description: 'Premium website with full customization' },
  { value: '20k-50k', label: '$20,000 - $50,000', description: 'Enterprise-level solution' },
  { value: '50k+', label: '$50,000+', description: 'Large-scale project with ongoing support' }
];

const PRIMARY_PURPOSES = [
  'Lead Generation',
  'E-commerce / Online Sales',
  'Portfolio / Showcase',
  'Information / Brochure',
  'Blog / Content Platform',
  'Community / Forum',
  'Booking / Appointments',
  'SaaS / Web Application'
];

export function ProjectQuestionnaire({
  initialData,
  onComplete,
  onBack
}: ProjectQuestionnaireProps) {
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>(
    initialData || {
      competitors: ['', '', ''],
      websitesLoved: ['', ''],
      websitesDisliked: [''],
      hasLogo: false,
      needsOngoingUpdates: false,
      needsBlog: false,
      needsEcommerce: false,
      needsBooking: false,
      needsMultilingual: false,
      isDateFlexible: true
    }
  );
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections = [
    { id: 'business', title: 'Business Information', icon: Building2 },
    { id: 'goals', title: 'Website Goals', icon: Target },
    { id: 'design', title: 'Design Preferences', icon: Palette },
    { id: 'content', title: 'Content & Pages', icon: FileText },
    { id: 'technical', title: 'Technical Requirements', icon: Settings },
    { id: 'budget', title: 'Budget & Timeline', icon: DollarSign }
  ];

  const updateField = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateArrayField = (field: keyof QuestionnaireData, index: number, value: string) => {
    const array = [...(formData[field] as string[] || [])];
    array[index] = value;
    updateField(field, array);
  };

  const addArrayItem = (field: keyof QuestionnaireData) => {
    const array = [...(formData[field] as string[] || []), ''];
    updateField(field, array);
  };

  const removeArrayItem = (field: keyof QuestionnaireData, index: number) => {
    const array = (formData[field] as string[] || []).filter((_, i) => i !== index);
    updateField(field, array);
  };

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (sectionIndex) {
      case 0: // Business Info
        if (!formData.businessName?.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.industry) newErrors.industry = 'Please select an industry';
        if (!formData.contactName?.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 1: // Goals
        if (!formData.primaryPurpose) newErrors.primaryPurpose = 'Please select a primary purpose';
        if (!formData.keyActions?.trim()) newErrors.keyActions = 'Please describe key actions';
        break;
      case 2: // Design
        if (!formData.stylePreference) newErrors.stylePreference = 'Please select a style preference';
        break;
      case 3: // Content
        if (!formData.pageCount) newErrors.pageCount = 'Please select estimated page count';
        if (!formData.hasContentReady) newErrors.hasContentReady = 'Please indicate content readiness';
        break;
      case 5: // Budget
        if (!formData.budgetRange) newErrors.budgetRange = 'Please select a budget range';
        if (!formData.idealLaunchDate?.trim()) newErrors.idealLaunchDate = 'Please provide target launch date';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      } else {
        // Submit the form
        onComplete(formData as QuestionnaireData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const renderInput = (
    field: keyof QuestionnaireData,
    label: string,
    placeholder: string,
    type: 'text' | 'email' | 'tel' | 'textarea' = 'text'
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={(formData[field] as string) || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-4 py-3 bg-slate-800/80 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
            errors[field] ? 'border-red-500' : 'border-slate-700'
          }`}
        />
      ) : (
        <input
          type={type}
          value={(formData[field] as string) || ''}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-slate-800/80 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
            errors[field] ? 'border-red-500' : 'border-slate-700'
          }`}
        />
      )}
      {errors[field] && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const renderSelect = (
    field: keyof QuestionnaireData,
    label: string,
    options: string[]
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <select
        value={(formData[field] as string) || ''}
        onChange={(e) => updateField(field, e.target.value)}
        className={`w-full px-4 py-3 bg-slate-800/80 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
          errors[field] ? 'border-red-500' : 'border-slate-700'
        }`}
      >
        <option value="">Select an option...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errors[field] && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const renderCheckbox = (
    field: keyof QuestionnaireData,
    label: string,
    description?: string
  ) => (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${
        formData[field]
          ? 'bg-amber-500 border-amber-500'
          : 'border-slate-600 group-hover:border-amber-500/50'
      }`}>
        {formData[field] && <Check className="w-4 h-4 text-white" />}
      </div>
      <input
        type="checkbox"
        checked={!!formData[field]}
        onChange={(e) => updateField(field, e.target.checked)}
        className="sr-only"
      />
      <div>
        <span className="text-white font-medium">{label}</span>
        {description && <p className="text-slate-400 text-sm">{description}</p>}
      </div>
    </label>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Business Information
        return (
          <div className="space-y-6">
            {renderInput('businessName', 'Business Name *', 'Enter your business name')}
            {renderSelect('industry', 'Industry / Sector *', INDUSTRIES)}
            {renderSelect('yearsInBusiness', 'Years in Business', ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'])}

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput('contactName', 'Your Name *', 'John Smith')}
                {renderInput('email', 'Email Address *', 'john@company.com', 'email')}
              </div>
              {renderInput('phone', 'Phone Number *', '+1 (555) 123-4567', 'tel')}
            </div>

            {renderInput('targetAudience', 'Target Audience', 'Who are your ideal customers?', 'textarea')}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Competitors (list 2-3 competitor websites)
              </label>
              {(formData.competitors || []).map((comp, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={comp}
                    onChange={(e) => updateArrayField('competitors', idx, e.target.value)}
                    placeholder="https://competitor.com"
                    className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('competitors', idx)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {(formData.competitors?.length || 0) < 5 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('competitors')}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add another competitor
                </button>
              )}
            </div>
          </div>
        );

      case 1: // Website Goals
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Primary Purpose *</label>
              <div className="grid md:grid-cols-2 gap-3">
                {PRIMARY_PURPOSES.map(purpose => (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => updateField('primaryPurpose', purpose)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.primaryPurpose === purpose
                        ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    {purpose}
                  </button>
                ))}
              </div>
              {errors.primaryPurpose && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.primaryPurpose}
                </p>
              )}
            </div>

            {renderInput('keyActions', 'Key Actions *', 'What should visitors do on your website? (e.g., submit a form, make a purchase, book a call)', 'textarea')}
            {renderInput('problemsToSolve', 'Problems to Solve', 'What problems should this website solve for your business?', 'textarea')}
          </div>
        );

      case 2: // Design Preferences
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Style Preference *</label>
              <div className="grid md:grid-cols-2 gap-3">
                {STYLE_PREFERENCES.map(style => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField('stylePreference', style.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.stylePreference === style.value
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className={`font-medium ${formData.stylePreference === style.value ? 'text-amber-300' : 'text-white'}`}>
                      {style.label}
                    </span>
                    <p className="text-slate-400 text-sm mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
              {errors.stylePreference && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.stylePreference}
                </p>
              )}
            </div>

            {renderInput('brandColors', 'Brand Colors', 'List your brand colors (e.g., Navy Blue #1a365d, Gold #d69e2e)')}

            <div className="space-y-3">
              {renderCheckbox('hasLogo', 'I have a logo ready', 'If yes, please bring it to the consultation')}
            </div>

            {renderInput('mustHaveFeatures', 'Must-Have Features', 'Any specific features you need? (e.g., live chat, video backgrounds, animations)', 'textarea')}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Websites You Love (for inspiration)
              </label>
              {(formData.websitesLoved || []).map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateArrayField('websitesLoved', idx, e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('websitesLoved', idx)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {(formData.websitesLoved?.length || 0) < 5 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('websitesLoved')}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add another website
                </button>
              )}
            </div>
          </div>
        );

      case 3: // Content & Pages
        return (
          <div className="space-y-6">
            {renderSelect('pageCount', 'Estimated Number of Pages *', [
              '1-5 pages (Simple)',
              '6-10 pages (Standard)',
              '11-20 pages (Comprehensive)',
              '20+ pages (Large)',
              'Not sure yet'
            ])}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Content Readiness *</label>
              <div className="space-y-3">
                {[
                  { value: 'ready', label: 'Content is ready', description: 'I have all text and images prepared' },
                  { value: 'partial', label: 'Partially ready', description: 'Some content ready, need help with the rest' },
                  { value: 'need-help', label: 'Need content creation', description: 'I need help writing copy and sourcing images' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField('hasContentReady', option.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      formData.hasContentReady === option.value
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className={`font-medium ${formData.hasContentReady === option.value ? 'text-amber-300' : 'text-white'}`}>
                      {option.label}
                    </span>
                    <p className="text-slate-400 text-sm">{option.description}</p>
                  </button>
                ))}
              </div>
              {errors.hasContentReady && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.hasContentReady}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {renderCheckbox('needsOngoingUpdates', 'Will need ongoing content updates', 'You plan to regularly update the website yourself')}
              {renderCheckbox('needsBlog', 'Need a blog section', 'For articles, news, or content marketing')}
            </div>
          </div>
        );

      case 4: // Technical Requirements
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {renderCheckbox('needsEcommerce', 'E-commerce / Online Store', 'Sell products or services online')}
              {formData.needsEcommerce && (
                <div className="ml-9">
                  {renderSelect('productCount', 'How many products?', [
                    '1-10 products',
                    '11-50 products',
                    '51-200 products',
                    '200+ products'
                  ])}
                </div>
              )}

              {renderCheckbox('needsBooking', 'Booking / Scheduling System', 'Allow customers to book appointments or services')}

              {renderCheckbox('needsMultilingual', 'Multilingual Support', 'Website in multiple languages')}
              {formData.needsMultilingual && (
                <div className="ml-9">
                  {renderInput('languages', 'Which languages?', 'e.g., English, Spanish, French')}
                </div>
              )}
            </div>

            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Current Setup</h3>
              {renderInput('existingDomain', 'Existing Domain Name', 'e.g., yourbusiness.com (or leave blank if you need one)')}
              {renderInput('currentHosting', 'Current Hosting Provider', 'e.g., GoDaddy, Bluehost, or "None"')}
            </div>
          </div>
        );

      case 5: // Budget & Timeline
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Budget Range *</label>
              <div className="space-y-3">
                {BUDGET_RANGES.map(range => (
                  <button
                    key={range.value}
                    type="button"
                    onClick={() => updateField('budgetRange', range.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      formData.budgetRange === range.value
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className={`font-medium ${formData.budgetRange === range.value ? 'text-amber-300' : 'text-white'}`}>
                      {range.label}
                    </span>
                    <p className="text-slate-400 text-sm">{range.description}</p>
                  </button>
                ))}
              </div>
              {errors.budgetRange && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.budgetRange}
                </p>
              )}
            </div>

            {renderInput('idealLaunchDate', 'Ideal Launch Date *', 'e.g., March 2025, Q2 2025, ASAP')}
            {renderCheckbox('isDateFlexible', 'This date is flexible', 'We can adjust based on project scope')}

            <div className="border-t border-slate-700 pt-6">
              {renderInput('additionalNotes', 'Additional Notes', 'Anything else you\'d like us to know before the consultation?', 'textarea')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm mb-4">
          <Building2 className="w-4 h-4" />
          <span>Step 2: Project Details</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Tell us about{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            your project
          </span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          This information helps us prepare for your consultation and ensures we can give you accurate recommendations.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {sections.map((section, idx) => {
          const SectionIcon = section.icon;
          const isActive = currentSection === idx;
          const isCompleted = currentSection > idx;

          return (
            <button
              key={section.id}
              onClick={() => {
                if (idx < currentSection || validateSection(currentSection)) {
                  setCurrentSection(idx);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <SectionIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden md:inline">{section.title}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          {React.createElement(sections[currentSection].icon, { className: 'w-6 h-6 text-amber-400' })}
          <h2 className="text-xl font-semibold text-white">{sections[currentSection].title}</h2>
        </div>

        {renderSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-semibold transition-all shadow-[0_4px_20px_rgba(251,146,60,0.4)] flex items-center gap-2"
        >
          {currentSection === sections.length - 1 ? 'Continue to Scheduling' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
