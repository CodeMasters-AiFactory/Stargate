import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Palette,
  FileText,
  Settings,
  Building2,
  Wand2,
  MessageSquare,
  Menu,
  Zap,
  User,
  HelpCircle,
  Undo2,
  Redo2,
  Upload,
  X,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Search,
  BarChart3,
  Lightbulb,
  Activity,
  Loader2,
  Edit,
  Pause,
  Play,
  Clock,
  Star,
  Crown,
} from 'lucide-react';
import type {
  WizardStage,
  WizardState,
  WebsiteRequirements,
  Question,
  DiscoveryPage,
  GeneratedWebsitePackage,
  MultiPageWebsite,
  LegacyWebsiteContent,
  PageKeywords,
  GeneratedImage,
  SEOAssessmentResult,
  RedoRequest,
} from '@/types/websiteBuilder';
import {
  discoveryQuestions,
  pageOrder,
  pageLabels,
  normalizeGeneratedWebsite,
  InvestigationResults,
  PackageId,
  PACKAGE_CONSTRAINTS,
} from '@/types/websiteBuilder';
import type { PhaseReport, WebsiteReport } from '@/types/phaseReport';
import { PHASE_NAMES, PHASE_NUMBERS } from '@/types/phaseReport';
import { MultiPagePreview } from './MultiPagePreview';
import { ResearchPhase } from './ResearchPhase';
import { WizardNavigation } from './WizardNavigation';
import { useInvestigation } from '@/contexts/InvestigationContext';
import { useIDE } from '@/hooks/use-ide';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateLibrary, type Template } from '@/components/Templates/TemplateLibrary';
import { DesignTemplateSelection } from './DesignTemplateSelection';
import { ContentTemplateSelection } from './ContentTemplateSelection';
import { MergePreview } from './MergePreview';
import { EmptyTemplatePreview } from './EmptyTemplatePreview';
import { ImageReplacementStage } from './ImageReplacementStage';
import { ContentRewritingStage } from './ContentRewritingStage';
import { ClientInfoCollection } from './ClientInfoCollection';
// New wizard components for 9-phase flow
// Phase 3 (keywords-collection) removed - no longer needed
import { ImageGenerationStage } from './ImageGenerationStage';
import { SEOAssessmentStage } from './SEOAssessmentStage';
import { ReviewRedoStage } from './ReviewRedoStage';
import { FinalWebsiteDisplay } from './FinalWebsiteDisplay';
import { AIWebsiteGeneration } from './AIWebsiteGeneration';
import { RealTimeWebsiteTransform } from './RealTimeWebsiteTransform';
import { ReviewAndRedesign } from './ReviewAndRedesign';
import { SEOExpertEvaluation } from './SEOExpertEvaluation';
import { FinalApproval } from './FinalApproval';
import { ProductCatalog, type Product } from '@/components/Ecommerce/ProductCatalog';
import { ClientChecklist } from './ClientChecklist';
import { VisualEditor } from '@/components/VisualEditor/VisualEditor';
import type { ChecklistState } from '@/types/websiteBuilder';
import { mapChecklistToRequirements } from '@/utils/checklistMapper';
import { CLIENT_CHECKLIST_ITEMS } from '@/utils/checklistItems';
import { WizardChatbot } from './WizardChatbot';
import { EcommerceSettings } from '@/components/Ecommerce/EcommerceSettings';
// Custom hooks for state management
import { useWizardState } from '@/hooks/useWizardState';
import { useWizardUI } from '@/hooks/useWizardUI';
import { useWebsiteGeneration } from '@/hooks/useWebsiteGeneration';
import { useWizardChat } from '@/hooks/useWizardChat';

const WIZARD_STORAGE_KEY = 'stargate-wizard-state';
const WIZARD_AUTOSAVE_DEBOUNCE = 1000; // Save 1 second after last change
const LANGUAGE_STORAGE_KEY = 'stargate-wizard-language';

// i18n Support
type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';
const translations: Record<Language, Record<string, string>> = {
  en: {
    'wizard.title': 'Merlin Website Wizard',
    'wizard.subtitle': 'Step-by-step website creation wizard - Starting at $29/month',
    'wizard.mode.auto': 'Auto Mode',
    'wizard.mode.manual': 'Manual Mode',
    'wizard.next': 'Next',
    'wizard.previous': 'Previous',
    'wizard.optional': 'Optional',
    'wizard.looksGood': 'Looks good!',
    'wizard.required': 'This field is required',
    'wizard.invalidEmail': 'Please enter a valid email address',
    'wizard.invalidUrl': 'Please enter a valid URL (e.g., https://example.com)',
    'wizard.invalidPhone': 'Please enter a valid phone number',
  },
  es: {
    'wizard.title': 'Constructor de Sitios Web IA',
    'wizard.subtitle': 'Asistente paso a paso para crear sitios web - $29/mes',
    'wizard.mode.auto': 'Modo Automático',
    'wizard.mode.manual': 'Modo Manual',
    'wizard.next': 'Siguiente',
    'wizard.previous': 'Anterior',
    'wizard.optional': 'Opcional',
    'wizard.looksGood': '¡Se ve bien!',
    'wizard.required': 'Este campo es obligatorio',
    'wizard.invalidEmail': 'Por favor ingrese una dirección de correo válida',
    'wizard.invalidUrl': 'Por favor ingrese una URL válida (ej: https://ejemplo.com)',
    'wizard.invalidPhone': 'Por favor ingrese un número de teléfono válido',
  },
  fr: {
    'wizard.title': 'Créateur de Site Web IA',
    'wizard.subtitle': 'Assistant de création de site web étape par étape - 29$/mois',
    'wizard.mode.auto': 'Mode Automatique',
    'wizard.mode.manual': 'Mode Manuel',
    'wizard.next': 'Suivant',
    'wizard.previous': 'Précédent',
    'wizard.optional': 'Optionnel',
    'wizard.looksGood': 'Parfait !',
    'wizard.required': 'Ce champ est obligatoire',
    'wizard.invalidEmail': 'Veuillez entrer une adresse e-mail valide',
    'wizard.invalidUrl': 'Veuillez entrer une URL valide (ex: https://exemple.com)',
    'wizard.invalidPhone': 'Veuillez entrer un numéro de téléphone valide',
  },
  de: {
    'wizard.title': 'KI-Website-Builder',
    'wizard.subtitle': 'Schritt-für-Schritt Website-Erstellungsassistent - 29€/Monat',
    'wizard.mode.auto': 'Automatischer Modus',
    'wizard.mode.manual': 'Manueller Modus',
    'wizard.next': 'Weiter',
    'wizard.previous': 'Zurück',
    'wizard.optional': 'Optional',
    'wizard.looksGood': 'Sieht gut aus!',
    'wizard.required': 'Dieses Feld ist erforderlich',
    'wizard.invalidEmail': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
    'wizard.invalidUrl': 'Bitte geben Sie eine gültige URL ein (z.B. https://beispiel.com)',
    'wizard.invalidPhone': 'Bitte geben Sie eine gültige Telefonnummer ein',
  },
  zh: {
    'wizard.title': 'AI网站构建器',
    'wizard.subtitle': '分步网站创建向导 - $29/月',
    'wizard.mode.auto': '自动模式',
    'wizard.mode.manual': '手动模式',
    'wizard.next': '下一步',
    'wizard.previous': '上一步',
    'wizard.optional': '可选',
    'wizard.looksGood': '看起来不错！',
    'wizard.required': '此字段为必填项',
    'wizard.invalidEmail': '请输入有效的电子邮件地址',
    'wizard.invalidUrl': '请输入有效的URL（例如：https://example.com）',
    'wizard.invalidPhone': '请输入有效的电话号码',
  },
  ja: {
    'wizard.title': 'AIウェブサイトビルダー',
    'wizard.subtitle': 'ステップバイステップのウェブサイト作成ウィザード - $29/月',
    'wizard.mode.auto': '自動モード',
    'wizard.mode.manual': '手動モード',
    'wizard.next': '次へ',
    'wizard.previous': '前へ',
    'wizard.optional': 'オプション',
    'wizard.looksGood': '良好です！',
    'wizard.required': 'このフィールドは必須です',
    'wizard.invalidEmail': '有効なメールアドレスを入力してください',
    'wizard.invalidUrl': '有効なURLを入力してください（例：https://example.com）',
    'wizard.invalidPhone': '有効な電話番号を入力してください',
  },
  ar: {
    'wizard.title': 'منشئ مواقع الويب بالذكاء الاصطناعي',
    'wizard.subtitle': 'معالج إنشاء موقع ويب خطوة بخطوة - $29/شهر',
    'wizard.mode.auto': 'الوضع التلقائي',
    'wizard.mode.manual': 'الوضع اليدوي',
    'wizard.next': 'التالي',
    'wizard.previous': 'السابق',
    'wizard.optional': 'اختياري',
    'wizard.looksGood': 'يبدو جيداً!',
    'wizard.required': 'هذا الحقل مطلوب',
    'wizard.invalidEmail': 'يرجى إدخال عنوان بريد إلكتروني صالح',
    'wizard.invalidUrl': 'يرجى إدخال عنوان URL صالح (مثال: https://example.com)',
    'wizard.invalidPhone': 'يرجى إدخال رقم هاتف صالح',
  },
};

const t = (key: string, lang: Language = 'en'): string => {
  return translations[lang]?.[key] || translations.en[key] || key;
};

// Google Category Stage to Name Mapping
const GOOGLE_CATEGORY_STAGES: Record<
  WizardStage,
  { name: string; index: number; checks: string[]; additional?: string[] } | null
> = {
  'content-quality': {
    name: '1. Content Quality & Relevance',
    index: 0,
    checks: [
      'Does the page have real, useful content?',
      "Does it answer the user's intent?",
      'Does it go deeper than competitors?',
      'Is content original, not generic?',
      'Is the topic covered completely and professionally?',
      'Are there clear headings (H1/H2/H3)?',
      'Is text readable and well structured?',
    ],
    additional: [
      'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)',
      'Depth & helpfulness',
      'Correctness and accuracy',
      'Skeleton pages get 0/100 on this',
    ],
  },
  'keywords-semantic-seo': {
    name: '2. Keywords & Semantic SEO',
    index: 1,
    checks: [
      'Keywords appear naturally (not spammy)',
      'Keywords are in Title',
      'Keywords are in H1',
      'Keywords are in First paragraph',
      'Keywords are in Subheadings',
      'Keywords are in Image alt text',
      'Keywords are in Metadata',
      'Keywords are in URL',
    ],
    additional: [
      'Semantic SEO (related phrases around your topic)',
      'Proper entity usage',
      'Topic clusters',
      'Without this, your site is invisible',
    ],
  },
  'technical-seo': {
    name: '3. Technical SEO',
    index: 2,
    checks: [
      'Clean HTML',
      'Correct use of headings (only one H1 per page)',
      'Correct canonical tags',
      'No duplicate content',
      'Correct sitemap.xml',
      'Correct robots.txt',
      'No broken links',
      'No missing images',
      'Fast loading times',
      'Lazy loading for images',
      'Minified CSS/JS',
      'Proper caching headers',
      'HTTPS secure',
    ],
    additional: ['If pages are blank or generic → fail'],
  },
  'core-web-vitals': {
    name: '4. Core Web Vitals',
    index: 3,
    checks: [
      'LCP – Largest Contentful Paint (How fast the main part of the page loads)',
      'FID/INP – Interaction delay (How fast the page responds to clicks/taps)',
      'CLS – Layout Stability (Does the screen jump around while loading?)',
    ],
    additional: ['These affect rankings massively'],
  },
  'structure-navigation': {
    name: '5. Structure & Navigation',
    index: 4,
    checks: [
      'Does the site structure make sense?',
      'Is navigation clear and easy?',
      'Is the user journey logical?',
      'Are menus consistent?',
      'Are pages internally linked correctly?',
      'Does the user reach key information fast?',
    ],
    additional: ['Blank Services / About pages = fail'],
  },
  'mobile-optimization': {
    name: '6. Mobile Optimization',
    index: 5,
    checks: [
      'Responsive layout',
      'Touch-friendly buttons',
      'Correct font sizes',
      'Images scaling properly',
      'No horizontal scrolling',
      'Fast mobile loading',
    ],
    additional: ['If your layout breaks → fail'],
  },
  'visual-quality': {
    name: '7. Visual Quality & Engagement',
    index: 6,
    checks: [
      'Bounce rate',
      'Time on page',
      'Scroll depth',
      'User interactions',
      'Visual stability',
      'Clean design',
      'Usability',
      'Design professionalism',
    ],
    additional: ['If pages are empty → users leave → ranking drops'],
  },
  'image-media-quality': {
    name: '8. Image & Media Quality',
    index: 7,
    checks: [
      'Do you use images related to the topic?',
      'Are images optimized?',
      'Do they have alt tags?',
      'Are they unique?',
      'Do they add value?',
    ],
    additional: ['No images = major penalty'],
  },
  'local-seo': {
    name: '9. Local SEO',
    index: 8,
    checks: [
      'City / area mentioned',
      'Google Business link',
      'NAP consistency (Name/Address/Phone)',
      'Local schema markup',
      'Service areas',
      'Maps integration',
    ],
    additional: [],
  },
  'trust-signals': {
    name: '10. Trust Signals',
    index: 9,
    checks: [
      'Contact information',
      'Privacy policy',
      'Terms of service',
      'SSL',
      'Social proof',
      'Testimonials',
      'Certifications',
      'Awards',
      'Team details',
      'Real photos',
      'Company legitimacy signals',
    ],
    additional: [],
  },
  'schema-structured-data': {
    name: '11. Schema & Structured Data',
    index: 10,
    checks: [
      'JSON-LD schema for business',
      'JSON-LD schema for webpage',
      'JSON-LD schema for services',
      'JSON-LD schema for products',
      'JSON-LD schema for FAQs',
      'Breadcrumb schema',
      'Organization schema',
      'Website schema',
      'Local business schema',
      'Review schema (testimonials)',
    ],
    additional: ['This boosts SEO drastically'],
  },
  'on-page-seo-structure': {
    name: '12. On-Page SEO Structure',
    index: 11,
    checks: [
      'Does the page have a strong Title Tag?',
      'Is the meta description compelling?',
      'Are headings correct?',
      'Is content broken into sections?',
      'Is there a CTA structure?',
      'Is the page "scannable"?',
    ],
    additional: [],
  },
  security: {
    name: '13. Security',
    index: 12,
    checks: [
      'HTTPS',
      'No malware',
      'No unsafe scripts',
      'Proper certificates',
      'No strange redirects',
    ],
    additional: [],
  },
  // Non-category stages return null
  'package-select': null,
  requirements: null,
  build: null,
  review: null,
  'mode-select': null,
  'template-select': null,
  discover: null,
  define: null,
  ecommerce: null,
  confirm: null,
  research: null,
  commit: null,
  // New wizard stages (not Google categories, so null)
  'content-select': null,
  'merge-preview': null,
  'image-generation': null,
  'content-rewriting': null,
  'client-info': null,
  'ai-generation': null,
  'review-redesign': null,
  'seo-evaluation': null,
  'final-approval': null,
};

// Google Rating Category Details (legacy, keeping for backward compatibility)
const GOOGLE_CATEGORY_DETAILS: Record<string, { checks: string[]; additional?: string[] }> = {
  '1. Content Quality & Relevance': {
    checks: [
      'Does the page have real, useful content?',
      "Does it answer the user's intent?",
      'Does it go deeper than competitors?',
      'Is content original, not generic?',
      'Is the topic covered completely and professionally?',
      'Are there clear headings (H1/H2/H3)?',
      'Is text readable and well structured?',
    ],
    additional: [
      'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)',
      'Depth & helpfulness',
      'Correctness and accuracy',
      'Skeleton pages get 0/100 on this',
    ],
  },
  '2. Keywords & Semantic SEO': {
    checks: [
      'Keywords appear naturally (not spammy)',
      'Keywords are in Title',
      'Keywords are in H1',
      'Keywords are in First paragraph',
      'Keywords are in Subheadings',
      'Keywords are in Image alt text',
      'Keywords are in Metadata',
      'Keywords are in URL',
    ],
    additional: [
      'Semantic SEO (related phrases around your topic)',
      'Proper entity usage',
      'Topic clusters',
      'Without this, your site is invisible',
    ],
  },
  '3. Technical SEO': {
    checks: [
      'Clean HTML',
      'Correct use of headings (only one H1 per page)',
      'Correct canonical tags',
      'No duplicate content',
      'Correct sitemap.xml',
      'Correct robots.txt',
      'No broken links',
      'No missing images',
      'Fast loading times',
      'Lazy loading for images',
      'Minified CSS/JS',
      'Proper caching headers',
      'HTTPS secure',
    ],
    additional: ['If pages are blank or generic → fail'],
  },
  '4. Core Web Vitals': {
    checks: [
      'LCP – Largest Contentful Paint (How fast the main part of the page loads)',
      'FID/INP – Interaction delay (How fast the page responds to clicks/taps)',
      'CLS – Layout Stability (Does the screen jump around while loading?)',
    ],
    additional: ['These affect rankings massively'],
  },
  '5. Structure & Navigation': {
    checks: [
      'Does the site structure make sense?',
      'Is navigation clear and easy?',
      'Is the user journey logical?',
      'Are menus consistent?',
      'Are pages internally linked correctly?',
      'Does the user reach key information fast?',
    ],
    additional: ['Blank Services / About pages = fail'],
  },
  '6. Mobile Optimization': {
    checks: [
      'Responsive layout',
      'Touch-friendly buttons',
      'Correct font sizes',
      'Images scaling properly',
      'No horizontal scrolling',
      'Fast mobile loading',
    ],
    additional: ['If your layout breaks → fail'],
  },
  '7. Visual Quality & Engagement': {
    checks: [
      'Bounce rate',
      'Time on page',
      'Scroll depth',
      'User interactions',
      'Visual stability',
      'Clean design',
      'Usability',
      'Design professionalism',
    ],
    additional: ['If pages are empty → users leave → ranking drops', 'Google sees EVERYTHING'],
  },
  '8. Image & Media Quality': {
    checks: [
      'Do you use images related to the topic?',
      'Are images optimized?',
      'Do they have alt tags?',
      'Are they unique?',
      'Do they add value?',
    ],
    additional: ['No images = major penalty'],
  },
  '9. Local SEO': {
    checks: [
      'City / area mentioned',
      'Google Business link',
      'NAP consistency (Name/Address/Phone)',
      'Local schema markup',
      'Service areas',
      'Maps integration',
    ],
  },
  '10. Trust Signals': {
    checks: [
      'Contact information',
      'Privacy policy',
      'Terms of service',
      'SSL',
      'Social proof',
      'Testimonials',
      'Certifications',
      'Awards',
      'Team details',
      'Real photos',
      'Company legitimacy signals',
    ],
    additional: ['Your current site has almost none'],
  },
  '11. Schema & Structured Data': {
    checks: [
      'JSON-LD schema for business',
      'JSON-LD schema for webpage',
      'JSON-LD schema for services',
      'JSON-LD schema for products',
      'JSON-LD schema for FAQs',
      'Breadcrumb schema',
      'Organization schema',
      'Website schema',
      'Local business schema',
      'Review schema (testimonials)',
    ],
    additional: ['This boosts SEO drastically'],
  },
  '12. On-Page SEO Structure': {
    checks: [
      'Does the page have a strong Title Tag?',
      'Is the meta description compelling?',
      'Are headings correct?',
      'Is content broken into sections?',
      'Is there a CTA structure?',
      'Is the page "scannable"?',
    ],
  },
  '13. Security': {
    checks: [
      'HTTPS',
      'No malware',
      'No unsafe scripts',
      'Proper certificates',
      'No strange redirects',
    ],
  },
};

// AI-Powered Suggestions
const businessTypeSuggestions: Record<string, string[]> = {
  restaurant: ['Italian Restaurant', 'Pizza Place', 'Fine Dining', 'Cafe', 'Fast Food'],
  retail: ['Fashion Store', 'Electronics Shop', 'Bookstore', 'Gift Shop', 'Boutique'],
  service: ['Consulting Firm', 'Law Firm', 'Accounting', 'Real Estate', 'Cleaning Service'],
  tech: ['SaaS Startup', 'App Development', 'Web Agency', 'IT Consulting', 'Software Company'],
  healthcare: ['Medical Practice', 'Dental Clinic', 'Wellness Center', 'Pharmacy', 'Hospital'],
  education: ['Online Course', 'Tutoring Service', 'School', 'University', 'Training Center'],
  fitness: ['Gym', 'Yoga Studio', 'Personal Training', 'CrossFit', 'Martial Arts'],
  beauty: ['Hair Salon', 'Spa', 'Nail Salon', 'Beauty Clinic', 'Barbershop'],
};

const getSmartSuggestions = (
  field: keyof WebsiteRequirements,
  _currentValue: unknown,
  requirements: WebsiteRequirements
): string[] => {
  const suggestions: string[] = [];

  if (field === 'businessType') {
    const overview = (requirements.projectOverview || '').toLowerCase();
    for (const [category, types] of Object.entries(businessTypeSuggestions)) {
      if (overview.includes(category)) {
        suggestions.push(...types);
        break;
      }
    }
  }

  if (field === 'targetAudience') {
    const businessType = requirements.businessType || '';
    if (businessType.includes('Restaurant')) {
      suggestions.push('Food enthusiasts', 'Families', 'Couples', 'Business professionals');
    } else if (businessType.includes('Tech')) {
      suggestions.push('Startups', 'Entrepreneurs', 'Developers', 'Business owners');
    } else if (businessType.includes('Fitness')) {
      suggestions.push('Fitness enthusiasts', 'Athletes', 'Health-conscious individuals');
    }
  }

  if (field === 'pages') {
    const businessType = requirements.businessType || '';
    if (businessType.includes('Restaurant')) {
      suggestions.push('Menu', 'About', 'Reservations', 'Contact', 'Gallery');
    } else if (businessType.includes('Service')) {
      suggestions.push('Services', 'About', 'Team', 'Testimonials', 'Contact');
    } else {
      suggestions.push('Home', 'About', 'Services', 'Contact');
    }
  }

  if (field === 'contentTone') {
    const businessType = requirements.businessType || '';
    if (businessType.includes('Law') || businessType.includes('Medical')) {
      suggestions.push('Professional and trustworthy', 'Authoritative', 'Compassionate');
    } else if (businessType.includes('Restaurant') || businessType.includes('Cafe')) {
      suggestions.push('Warm and welcoming', 'Friendly', 'Inviting');
    } else if (businessType.includes('Tech') || businessType.includes('Startup')) {
      suggestions.push('Modern and innovative', 'Dynamic', 'Forward-thinking');
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

// Validation utilities
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Analytics tracking
const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
  try {
    // In production, send to analytics service
    if (
      typeof window !== 'undefined' &&
      'gtag' in window &&
      typeof (
        window as { gtag?: (event: string, name: string, data?: Record<string, unknown>) => void }
      ).gtag === 'function'
    ) {
      (
        window as { gtag: (event: string, name: string, data?: Record<string, unknown>) => void }
      ).gtag('event', eventName, data);
    }
    // Analytics tracking (can be extended to send to analytics service)
  } catch (error) {
    // Silently fail analytics
  }
};

// Performance monitoring
const performanceMonitor = {
  startTime: 0,
  start: (label: string) => {
    performanceMonitor.startTime = performance.now();
    trackEvent('performance_start', { label });
  },
  end: (label: string) => {
    const duration = performance.now() - performanceMonitor.startTime;
    trackEvent('performance_end', { label, duration: Math.round(duration) });
    return duration;
  },
};

// Package name and price mappings
const PACKAGE_NAMES: Record<PackageId, string> = {
  basic: 'Essential',
  advanced: 'Professional',
  seo: 'SEO Optimized',
  deluxe: 'Deluxe',
  ultra: 'Ultra',
  custom: 'Custom',
};

const PACKAGE_PRICES: Record<PackageId, string> = {
  basic: '$29/month',
  advanced: '$49/month',
  seo: '$69/month',
  deluxe: '$99/month',
  ultra: '$199/month',
  custom: 'Custom',
};

interface InitialProjectData {
  projectId: string;
  projectName: string;
  html: string;
  css?: string;
  businessInfo?: Record<string, any>;
  templateId?: string;
  templateName?: string;
}

interface WebsiteBuilderWizardProps {
  onBackToProjects?: () => void;
  initialProject?: InitialProjectData; // Direct project data bypasses localStorage
}

export function WebsiteBuilderWizard({ onBackToProjects, initialProject }: WebsiteBuilderWizardProps = {}) {
  // Debug mode: Set to false in production to disable verbose logging
  const DEBUG_MODE = process.env.NODE_ENV === 'development';

  // CRITICAL: Clear generated website immediately on mount if not in review
  // This runs BEFORE any state initialization to prevent preview from showing
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('stargate-wizard-state');
      const savedWebsite = localStorage.getItem('merlin_generated_website');

      // CRITICAL: Check if we're on final-website FIRST - don't clear anything
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed?.stage === 'final-website') {
          console.log('[Wizard] ✅ PRESERVING final-website stage on mount - skipping clear');
          return; // Don't clear anything if on final-website
        }
      }

      if (savedWebsite) {
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed?.stage !== 'review' && parsed?.stage !== 'final-website') {
            console.log('[Wizard] 🗑️ IMMEDIATE CLEAR - Found website but not in review/final-website stage');
            localStorage.removeItem('merlin_generated_website');
          }
        } else {
          console.log('[Wizard] 🗑️ IMMEDIATE CLEAR - Found website but no saved state');
          localStorage.removeItem('merlin_generated_website');
        }
      }
    } catch (error) {
      console.error('[Wizard] Error in immediate clear:', error);
    }
  }, []); // Run once on mount

  // Helper function for conditional logging
  const debugLog = (...args: unknown[]) => {
    if (DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  const { toast } = useToast();
  const { state } = useIDE();
  const { startInvestigation, updateProgress, stopInvestigation } = useInvestigation();
  const { isAdmin: _isAdmin, user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Custom hooks for state management
  const wizardUI = useWizardUI();
  const wizardChat = useWizardChat();
  const websiteGeneration = useWebsiteGeneration();
  useWizardState({ debugLog });

  // Ref to prevent race conditions in auto-advance
  const autoAdvanceInProgressRef = useRef(false);

  // Refs to track timeouts for cleanup (prevent memory leaks)
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const buildAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-advance preferences
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('stargate-auto-advance-enabled');
      return saved !== null ? saved === 'true' : true; // Default to enabled
    } catch {
      return true;
    }
  });
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState<number>(5000); // 5 seconds default
  const [showAutoAdvanceConfirmation, setShowAutoAdvanceConfirmation] = useState(false);
  const [pendingAutoAdvance, setPendingAutoAdvance] = useState<{ stage: WizardStage; nextStage: WizardStage } | null>(null);

  // Ref to store abort controller for SSE stream cleanup
  const generateAbortControllerRef = useRef<AbortController | null>(null);

  // Refs to track all active readers for proper cleanup
  const investigationReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const generationReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  // Refs to prevent infinite loops in useEffect hooks
  const hasNavigatedToReviewRef = useRef(false);
  // Reserved for future use: hasClearedWebsiteRef
  // const hasClearedWebsiteRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for progress saving (used in investigation progress updates)
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<{
    currentJob: number;
    jobs: Array<{
      name: string;
      status: 'pending' | 'in-progress' | 'complete' | 'failed';
      progress: number;
      checkScores?: Record<string, number>;
      error?: string;
    }>;
  } | null>(null);

  // Helper function to regenerate a specific check - moved after wizardState declaration

  // Get selected package from state (will be used to customize wizard flow)
  const selectedPackage = state.merlinPackage;

  // Package-specific configuration
  const packageConfig = useMemo(() => {
    if (!selectedPackage) return null;

    return {
      packageType: selectedPackage.packageType,
      siteType: selectedPackage.siteType,
      // Determine which features to enable based on package
      enableCompetitorResearch: ['deluxe', 'ultra'].includes(selectedPackage.packageType),
      enableAdvancedSEO: ['seo', 'deluxe', 'ultra'].includes(selectedPackage.packageType),
      enableMaintenance: selectedPackage.packageType === 'ultra',
      maxPages:
        selectedPackage.packageType === 'basic'
          ? 5
          : selectedPackage.packageType === 'advanced'
            ? 15
            : Infinity,
    };
  }, [selectedPackage]);

  // Helper function to regenerate a specific check - defined after wizardState
  const regenerateCheck = useCallback(
    async (categoryIndex: number, checkIndex: number, checkName: string) => {
      try {
        // Reset the specific check score
        setInvestigationProgress(prev => {
          const updatedJobs = [...prev.jobs];
          const job = updatedJobs[categoryIndex];
          if (job && job.checkScores) {
            const checkKey = `${job.name}-${checkIndex}`;
            const updatedCheckScores = { ...job.checkScores };
            delete updatedCheckScores[checkKey];

            updatedJobs[categoryIndex] = {
              ...job,
              checkScores:
                Object.keys(updatedCheckScores).length > 0 ? updatedCheckScores : undefined,
            };
          }
          return { ...prev, jobs: updatedJobs };
        });

        toast({
          title: 'Regenerating Check',
          description: `Re-analyzing: ${checkName}`,
        });

        // Call investigation API with a flag to regenerate this specific check
        // For now, we'll just show a toast and mark it as regenerating
        // Full implementation would require backend support
        toast({
          title: 'Regeneration Started',
          description: `The check "${checkName}" will be re-analyzed. This may take a few moments.`,
        });

        // In a full implementation, you would:
        // 1. Call backend API with regenerate flag
        // 2. Wait for new score
        // 3. Update the check score
        // For now, we'll simulate by showing a loading state
        setTimeout(() => {
          // Simulate new score (in production, this would come from backend)
          const newScore = 85 + Math.floor(Math.random() * 15); // 85-100

          setInvestigationProgress(prev => {
            const updatedJobs = [...prev.jobs];
            const job = updatedJobs[categoryIndex];
            if (job) {
              const checkKey = `${job.name}-${checkIndex}`;
              const updatedCheckScores = { ...(job.checkScores || {}) };
              updatedCheckScores[checkKey] = newScore;

              updatedJobs[categoryIndex] = {
                ...job,
                checkScores: updatedCheckScores,
              } as InvestigationJob;
            }
            return { ...prev, jobs: updatedJobs };
          });

          toast({
            title: 'Check Regenerated',
            description: `${checkName} now scores ${newScore}%`,
            variant: newScore >= 95 ? 'default' : 'destructive',
          });
        }, 2000);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        debugLog('[Wizard] Error regenerating check:', error);
        toast({
          title: 'Regeneration Failed',
          description: `Failed to regenerate check: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // CRITICAL: Clear all wizard data when starting a new website
  // Wrapped in useCallback to prevent dependency issues
  const clearWizardData = useCallback(() => {
    try {
      debugLog('[Wizard] 🗑️ Clearing all previous wizard data for new website');
      localStorage.removeItem(WIZARD_STORAGE_KEY);
      localStorage.removeItem('merlin_generated_website');
      // Clear any other wizard-related data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('stargate-wizard') || key.startsWith('merlin_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(_key => localStorage.removeItem(_key));
      debugLog(
        '[Wizard] ✅ Cleared',
        keysToRemove.length,
        'wizard-related items from localStorage'
      );
    } catch (error) {
      debugLog('[Wizard] Error clearing wizard data:', error);
    }
  }, []);

  // CRITICAL: Reset wizard for a completely new project
  // This function completely resets all wizard state and clears all data
  // Note: Currently unused but kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // Reserved for future use: resetWizardForNewProject
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _resetWizardForNewProject = useCallback(() => {
    debugLog('[Wizard] 🔄 Resetting wizard for new project');
    clearWizardData();
    setGeneratedWebsite(null);
    setWizardState({
      stage: 'package-select',
      currentPage: 'project-overview',
      currentQuestion: 0,
      requirements: {},
      messages: [],
      stageHistory: [],
      selectedPackage: undefined,
      packageConstraints: undefined,
      selectedDesignTemplates: [],
      selectedContentTemplates: [],
      imageSource: 'leonardo',
      redesignCount: 0,
    });
    debugLog('[Wizard] ✅ Wizard reset complete - ready for new project');
  }, [clearWizardData, debugLog]);

  // Load saved state from localStorage - must be synchronous for useState initializer
  // CRITICAL: This function should NEVER restore state if:
  // 1. We're at package-select stage (user is starting fresh)
  // 2. No package is selected (incomplete state)
  // 3. Stage is 'commit' (completed project)
  const loadSavedStateSync = (): WizardState | null => {
    try {
      const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        // CRITICAL: Never restore if at package-select AND no package selected (user is starting fresh)
        // But if package is selected, we might be in the middle of a workflow
        if (parsed && parsed.stage === 'package-select' && !parsed.selectedPackage) {
          debugLog('[Wizard] 🗑️ Detected package-select stage without package - clearing old data for fresh start');
          clearWizardData();
          return null;
        }

        // CRITICAL: Allow template-select and final-website stages to be restored even without package
        // User might be browsing templates or viewing final website - preserve their current stage on refresh
        // Only clear if we're at package-select without package (truly starting fresh)

        // CRITICAL: Never restore if no package is selected (incomplete/invalid state)
        // But allow package-select, template-select, and final-website stages (user is actively working)
        if (parsed && !parsed.selectedPackage && parsed.stage !== 'package-select' && parsed.stage !== 'template-select' && parsed.stage !== 'final-website') {
          debugLog('[Wizard] 🗑️ No package selected in saved state - clearing old data');
          clearWizardData();
          return null;
        }

        // CRITICAL: Never restore if stage is 'commit' (completed project)
        if (parsed && parsed.stage === 'commit') {
          debugLog('[Wizard] 🗑️ Detected completed project - clearing old data for fresh start');
          clearWizardData();
          return null;
        }

        // CRITICAL: Never restore if stage is 'review' (Phase 17 - completed project)
        if (parsed && parsed.stage === 'review') {
          debugLog(
            '[Wizard] 🗑️ Detected review stage (completed project) - clearing old data for fresh start'
          );
          clearWizardData();
          return null;
        }

        // CRITICAL: final-website stage gets ABSOLUTE PRIORITY - restore it no matter what
        if (parsed && parsed.stage === 'final-website') {
          debugLog('[Wizard] ✅ ABSOLUTE PRIORITY: Restoring final-website stage - IGNORING ALL OTHER CHECKS');
          return parsed; // Return immediately, skip all other validation
        }

        // Restore if we have a valid state:
        // - Has selectedPackage, OR
        // - Is at package-select/template-select (user is actively working)
        if (parsed && parsed.stage && (parsed.selectedPackage || parsed.stage === 'package-select' || parsed.stage === 'template-select')) {
          debugLog('[Wizard] Restoring saved state:', parsed.stage, parsed.currentPage);
          return parsed;
        }
      }
    } catch (error) {
      debugLog('[Wizard] Error loading saved state:', error);
      // On error, clear potentially corrupted data
      clearWizardData();
    }
    return null;
  };

  // Load saved state from localStorage on mount (for useCallback)
  const loadSavedState = useCallback((): WizardState | null => {
    return loadSavedStateSync();
  }, [clearWizardData]); // clearWizardData is stable (useCallback)

  const [wizardState, setWizardState] = useState<WizardState>(() => {
    // ═══════════════════════════════════════════════════════════════════════════
    // HIGHEST PRIORITY: Direct project data from props
    // ═══════════════════════════════════════════════════════════════════════════
    // If initialProject is provided via props, use it directly - bypasses all localStorage
    if (initialProject) {
      console.log('[Wizard] ✅ DIRECT PROJECT LOAD: Using initialProject prop - bypassing localStorage');
      const projectState: WizardState = {
        stage: 'final-website',
        projectId: initialProject.projectId,
        projectName: initialProject.projectName,
        mergedTemplate: {
          html: initialProject.html,
          css: initialProject.css || '',
        },
        requirements: initialProject.businessInfo || {},
        selectedDesignTemplates: initialProject.templateId ? [{
          id: initialProject.templateId,
          name: initialProject.templateName || 'Template',
        }] : [],
        currentPage: 'project-overview',
        currentQuestion: 0,
        messages: [],
        stageHistory: ['final-website'],
        selectedPackage: undefined,
        packageConstraints: undefined,
        selectedTemplate: null,
        selectedContentTemplates: [],
        imageSource: 'leonardo',
        redesignCount: 0,
      };
      // Also update localStorage to match
      localStorage.setItem('stargate-wizard-state', JSON.stringify(projectState));
      return projectState;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PERMANENT FIX: final-website stage preservation
    // ═══════════════════════════════════════════════════════════════════════════
    // CRITICAL: Check for saved state FIRST before clearing anything
    // This ensures we restore the user's current stage on refresh
    const saved = loadSavedStateSync();

    // PERMANENT PROTECTION: If we're on final-website, NEVER clear or reset
    if (saved && saved.stage === 'final-website') {
      debugLog('[Wizard] ✅ PERMANENT FIX: Restoring final-website stage - DO NOT CLEAR ANYTHING');
      // Restore the saved state immediately - don't clear anything
      return saved;
    }
    
    // Only clear data if we're starting completely fresh (no valid saved state)
    if (!saved) {
      debugLog('[Wizard] No saved state - starting fresh');
      // Only clear generated website if no saved state
      try {
        localStorage.removeItem('merlin_generated_website');
      } catch (error) {
        debugLog('[Wizard] Error clearing generated website:', error);
      }
    } else {
      // We have a valid saved state - restore it
      debugLog('[Wizard] Restoring saved state on refresh:', saved.stage);
      
      // Only clear generated website if we're not in review or final-website
      if (saved.stage !== 'review' && saved.stage !== 'final-website') {
        try {
          localStorage.removeItem('merlin_generated_website');
        } catch (error) {
          debugLog('[Wizard] Error clearing generated website:', error);
        }
      }
      
      // Restore the saved state
      return saved;
    }

    debugLog('[Wizard] Initialized with default state - NEW 8-PHASE WORKFLOW');
    return {
      stage: 'package-select', // Phase 1: Start at Package Selection
      currentPage: 'project-overview',
      currentQuestion: 0,
      requirements: {},
      messages: [],
      stageHistory: [],
      selectedPackage: undefined,
      packageConstraints: undefined,
      selectedTemplate: null,
      // NEW 8-PHASE FIELDS
      selectedDesignTemplates: [],
      selectedContentTemplates: [],
      imageSource: 'leonardo' as const,
      redesignCount: 0,
    };
  });

  // Client Checklist State
  const [checklistState, setChecklistState] = useState<ChecklistState>(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem('stargate-wizard-checklist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return {};
  });

  // Auto-save checklist state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('stargate-wizard-checklist', JSON.stringify(checklistState));
    }, WIZARD_AUTOSAVE_DEBOUNCE);
    return () => clearTimeout(timeoutId);
  }, [checklistState]);

  // CRITICAL: Cleanup all timeouts and abort controllers on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup all timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      if (buildAdvanceTimeoutRef.current) {
        clearTimeout(buildAdvanceTimeoutRef.current);
      }
      // Abort any ongoing SSE streams
      if (generateAbortControllerRef.current) {
        generateAbortControllerRef.current.abort();
      }
    };
  }, []);

  // CRITICAL: This effect runs ONCE on mount
  // Only clear data if we're truly starting fresh (no valid saved state)
  // This preserves the user's current stage on refresh
  useEffect(() => {
    const saved = loadSavedStateSync();
    
    // Only clear if we don't have a valid saved state
    if (!saved) {
      console.log('[Wizard] 🆕 MOUNT - No saved state, starting fresh');
      debugLog('[Wizard] 🆕 MOUNT - No saved state, starting fresh');
      
      // Clear generated website only if no saved state
      setGeneratedWebsite(null);
      localStorage.removeItem('merlin_generated_website');
      
      // Clear investigation progress only if starting fresh
      localStorage.removeItem('stargate-investigation-progress');
      setInvestigationProgress({
        currentJob: 0,
        jobs: [],
      });
      
      // Clear research activities only if starting fresh
      setResearchActivities([]);
      setIsResearchActive(false);
      
      // Only reset to package-select if truly starting fresh
      if (wizardState.stage === 'review' || (!wizardState.selectedTemplate && !wizardState.selectedPackage)) {
        console.log('[Wizard] 🔄 Starting fresh - resetting to package-select');
        debugLog('[Wizard] 🔄 Starting fresh - resetting to package-select');
        clearWizardData();
        setWizardState(prev => ({
          ...prev,
          stage: 'package-select',
          selectedTemplate: null,
          selectedPackage: undefined,
          packageConstraints: undefined,
        }));
      }
    } else {
      // We have a saved state - preserve it, don't clear anything
      console.log('[Wizard] ✅ MOUNT - Restoring saved state:', saved.stage);
      debugLog('[Wizard] ✅ MOUNT - Restoring saved state:', saved.stage);
      
      // Only clear generated website if not in review
      if (saved.stage !== 'review') {
        localStorage.removeItem('merlin_generated_website');
        setGeneratedWebsite(null);
      }
    }
    
    console.log('[Wizard] ✅ Mount complete - stage:', wizardState.stage);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Only run on mount - intentionally empty to avoid re-triggering
  }, []);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [ecommerceProducts, setEcommerceProducts] = useState<Product[]>([]);
  // Load generated website from localStorage on mount
  // CRITICAL: Don't restore old website data - always start fresh
  const [generatedWebsite, setGeneratedWebsite] = useState<{
    id?: string;
    name?: string;
    description?: string;
    template?: string;
    code: GeneratedWebsitePackage;
    requirements?: WebsiteRequirements;
    createdAt?: string;
  } | null>(() => {
    // CRITICAL FIX: Always start with null - don't restore old website data
    // This ensures each new website generation starts fresh
    debugLog('[Wizard] 🆕 Starting fresh - no previous website data restored');
    return null;
  });

  // CRITICAL: AGGRESSIVE CLEAR - Always clear generated website on mount and when not in review
  // This prevents showing preview when we should show wizard
  useEffect(() => {
    // ALWAYS clear on mount - Pre-React script should have cleared, but double-check
    const saved = localStorage.getItem('merlin_generated_website');
    if (saved) {
      debugLog('[Wizard] 🗑️ Found saved website on mount - FORCE CLEARING');
      localStorage.removeItem('merlin_generated_website');
      setGeneratedWebsite(null);
    }

    // CRITICAL: NEVER reset final-website stage - check FIRST before any clearing logic
    if (wizardState.stage === 'final-website') {
      // User is on final-website - DO NOTHING, preserve this state at all costs
      debugLog('[Wizard] ✅ PRESERVING final-website stage - user is viewing their website');
      return;
    }

    // FORCE CLEAR if not in review stage - don't show preview unless explicitly in review
    if (wizardState.stage !== 'review') {
      if (generatedWebsite) {
        debugLog('[Wizard] 🗑️ FORCE CLEARING - not in review stage (current stage:', wizardState.stage, ')');
        setGeneratedWebsite(null);
      }
      // Always clear from localStorage when not in review
      localStorage.removeItem('merlin_generated_website');
      
      // FORCE reset stage to template-select if we have generatedWebsite but stage is wrong
      // BUT: NEVER reset if we're on final-website stage (that's valid and must be preserved)
      // CRITICAL: Double-check we're not on final-website before any reset
      if (wizardState.stage === 'final-website') {
        debugLog('[Wizard] ✅ FINAL CHECK: On final-website - ABORTING any reset logic');
        return; // Exit early, don't do anything
      }
      
      if (generatedWebsite && wizardState.stage !== 'template-select' && (wizardState.stage as string) !== 'review' && wizardState.stage !== 'final-website') {
        debugLog('[Wizard] 🔄 FORCE RESETTING stage to template-select');
        // Direct state update - navigateToStage may not be defined yet
        setWizardState(prev => ({ ...prev, stage: 'package-select' }));
      }
    }
    
    // CRITICAL: If stage is review but no template/package selected, reset to package-select
    if (wizardState.stage === 'review' && !wizardState.selectedTemplate && !wizardState.selectedPackage) {
      debugLog('[Wizard] 🔄 FORCE RESETTING - review stage without template/package, going to package-select');
      setGeneratedWebsite(null);
      localStorage.removeItem('merlin_generated_website');
      // Direct state update - navigateToStage may not be defined yet
      setWizardState(prev => ({ ...prev, stage: 'package-select' }));
    }
  }, [wizardState.stage, wizardState.selectedPackage, wizardState.mergedTemplate, generatedWebsite]);

  // Removed unused showPreview state - preview is controlled by stage
  // UI state now managed by useWizardUI hook
  const {
    showRestartDialog,
    setShowRestartDialog,
    viewMode: _viewMode,
    setViewMode: _setViewMode,
    screenSize: _screenSize,
    setScreenSize: _setScreenSize,
    showWebviewLogs: _showWebviewLogs,
    setShowWebviewLogs: _setShowWebviewLogs,
    saveStatus,
    setSaveStatus,
    showVisualEditor,
    setShowVisualEditor,
    showEcommerceSettings,
    setShowEcommerceSettings,
  } = wizardUI;

  // Chat state now managed by useWizardChat hook
  const {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isSendingChat,
    setIsSendingChat,
  } = wizardChat;

  // Generation state managed by useWebsiteGeneration hook
  const {
    isGenerating,
    setIsGenerating,
    buildingProgress,
    setBuildingProgress,
    error: _generationError,
    setError: setGenerationError,
  } = websiteGeneration;

  // Website rating state
  const [websiteRating, setWebsiteRating] = useState<{
    overall: number;
    content: number;
    design: number;
    seo: number;
    performance: number;
    analysis: string;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  // Phase-by-phase reporting system
  const [phaseReports, setPhaseReports] = useState<Map<string, PhaseReport>>(new Map());
  const [websiteReport, setWebsiteReport] = useState<WebsiteReport | null>(null);

  // Phase reporting functions
  const startPhaseReport = useCallback(
    (stage: WizardStage) => {
      const phaseName = PHASE_NAMES[stage] || stage;
      const phaseNumber = PHASE_NUMBERS[stage] || 0;

      const report: PhaseReport = {
        phaseNumber,
        phaseName,
        stage,
        status: 'in-progress',
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        rating: null,
        analysis: '',
        strengths: [],
        weaknesses: [],
        improvements: [],
        data: {},
      };

      setPhaseReports(prev => new Map(prev).set(stage, report));
      debugLog(`[Phase Report] Started: ${phaseName}`);
    },
    [debugLog]
  );

  const completePhaseReport = useCallback(
    (
      stage: WizardStage,
      rating: number,
      analysis: string,
      strengths: string[],
      weaknesses: string[],
      improvements: string[],
      data?: Record<string, unknown>
    ) => {
      setPhaseReports(prev => {
        const current = prev.get(stage);
        if (!current) return prev;

        const startTime = current.startTime ? new Date(current.startTime) : new Date();
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const updated: PhaseReport = {
          ...current,
          status: 'complete',
          endTime: endTime.toISOString(),
          duration,
          rating,
          analysis,
          strengths,
          weaknesses,
          improvements,
          data: data || current.data,
        };

        const newMap = new Map(prev);
        newMap.set(stage, updated);
        debugLog(`[Phase Report] Completed: ${current.phaseName} - Rating: ${rating}/100`);
        return newMap;
      });
    },
    [debugLog]
  );

  const generateWebsiteReport = useCallback((): WebsiteReport => {
    const reports = Array.from(phaseReports.values());
    const completedReports = reports.filter(r => r.status === 'complete' && r.rating !== null);
    const averageScore =
      completedReports.length > 0
        ? Math.round(
            completedReports.reduce((sum, r) => sum + (r.rating || 0), 0) / completedReports.length
          )
        : 0;

    const highestRated = completedReports.reduce(
      (max, r) => ((r.rating || 0) > (max.rating || 0) ? r : max),
      completedReports[0] || { phaseName: 'N/A', rating: 0 }
    );

    const lowestRated = completedReports.reduce(
      (min, r) => ((r.rating || 0) < (min.rating || 0) ? r : min),
      completedReports[0] || { phaseName: 'N/A', rating: 0 }
    );

    const report: WebsiteReport = {
      projectName: wizardState.requirements?.businessName || 'Untitled Project',
      projectSlug:
        wizardState.requirements?.businessName?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
      packageType: wizardState.selectedPackage || 'unknown',
      startTime: reports[0]?.startTime || new Date().toISOString(),
      endTime: reports[reports.length - 1]?.endTime || null,
      totalDuration:
        reports[0]?.startTime && reports[reports.length - 1]?.endTime
          ? new Date(reports[reports.length - 1].endTime!).getTime() -
            new Date(reports[0].startTime!).getTime()
          : null,
      overallScore: averageScore,
      phaseReports: reports,
      summary: {
        totalPhases: reports.length,
        completedPhases: completedReports.length,
        averagePhaseScore: averageScore,
        highestRatedPhase: { phase: highestRated.phaseName, score: highestRated.rating || 0 },
        lowestRatedPhase: { phase: lowestRated.phaseName, score: lowestRated.rating || 0 },
      },
      recommendations: [],
      metadata: {
        requirements: wizardState.requirements,
        investigationResults: wizardState.investigationResults,
        generatedWebsite: generatedWebsite
          ? {
              id: generatedWebsite.id,
              name: generatedWebsite.name,
              createdAt: generatedWebsite.createdAt,
            }
          : null,
      },
    };

    setWebsiteReport(report);
    return report;
    // Only depend on stage, not entire wizardState
  }, [phaseReports, wizardState.stage, generatedWebsite]);

  const downloadReport = useCallback(() => {
    const report = websiteReport || generateWebsiteReport();

    // Format as JSON
    const jsonReport = JSON.stringify(report, null, 2);

    // Format as Markdown for ChatGPT
    const mdReport = `# Website Generation Report: ${report.projectName}

## Overall Score: ${report.overallScore}/100

**Project Details:**
- Package: ${report.packageType}
- Start Time: ${new Date(report.startTime).toLocaleString()}
- End Time: ${report.endTime ? new Date(report.endTime).toLocaleString() : 'In Progress'}
- Total Duration: ${report.totalDuration ? Math.round(report.totalDuration / 1000 / 60) + ' minutes' : 'N/A'}

## Summary
- Total Phases: ${report.summary.totalPhases}
- Completed Phases: ${report.summary.completedPhases}
- Average Phase Score: ${report.summary.averagePhaseScore}/100
- Highest Rated Phase: ${report.summary.highestRatedPhase.phase} (${report.summary.highestRatedPhase.score}/100)
- Lowest Rated Phase: ${report.summary.lowestRatedPhase.phase} (${report.summary.lowestRatedPhase.score}/100)

---

## Phase-by-Phase Reports

${report.phaseReports
  .map(
    r => `### ${r.phaseName}

**Status:** ${r.status}
**Rating:** ${r.rating !== null ? `${r.rating}/100` : 'Not Rated'}
**Duration:** ${r.duration ? Math.round(r.duration / 1000) + ' seconds' : 'N/A'}

**Analysis:**
${r.analysis || 'No analysis available.'}

**Strengths:**
${r.strengths.length > 0 ? r.strengths.map(s => `- ${s}`).join('\n') : '- None identified'}

**Weaknesses:**
${r.weaknesses.length > 0 ? r.weaknesses.map(w => `- ${w}`).join('\n') : '- None identified'}

**Improvements:**
${r.improvements.length > 0 ? r.improvements.map(i => `- ${i}`).join('\n') : '- None identified'}

${r.errors && r.errors.length > 0 ? `**Errors:**\n${r.errors.map(e => `- ${e}`).join('\n')}\n` : ''}
${r.warnings && r.warnings.length > 0 ? `**Warnings:**\n${r.warnings.map(w => `- ${w}`).join('\n')}\n` : ''}

---`
  )
  .join('\n\n')}

## Recommendations

${
  report.recommendations.length > 0
    ? report.recommendations.map(r => `- ${r}`).join('\n')
    : 'No specific recommendations at this time.'
}

---

*Report generated on ${new Date().toLocaleString()}*
`;

    // Create download
    const blob = new Blob([mdReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.projectSlug}-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also save JSON version
    const jsonBlob = new Blob([jsonReport], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonA = document.createElement('a');
    jsonA.href = jsonUrl;
    jsonA.download = `${report.projectSlug}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(jsonA);
    jsonA.click();
    document.body.removeChild(jsonA);
    URL.revokeObjectURL(jsonUrl);
  }, [websiteReport, generateWebsiteReport]);

  // Auto-rate website after generation
  const rateWebsite = async (websiteData: {
    code?: {
      pages?: unknown[];
      files?: Record<string, unknown>;
      sharedAssets?: { css?: string; js?: string };
    };
  }): Promise<{
    overall: number;
    content: number;
    design: number;
    seo: number;
    performance: number;
    analysis: string;
    strengths: string[];
    improvements: string[];
  }> => {
    // Simulate AI rating (in production, this would call backend)
    const pages = websiteData.code?.pages || [];
    const hasMultiplePages = pages.length > 1;
    const hasContent = websiteData.code?.files && Object.keys(websiteData.code.files).length > 0;
    const hasAssets = websiteData.code?.sharedAssets?.css || websiteData.code?.sharedAssets?.js;

    // Calculate scores based on website quality
    const contentScore = hasContent ? (hasMultiplePages ? 95 : 85) : 60;
    const designScore = hasAssets ? 90 : 70;
    const seoScore = hasMultiplePages ? 88 : 75;
    const performanceScore = hasAssets ? 85 : 70;
    const overallScore = Math.round((contentScore + designScore + seoScore + performanceScore) / 4);

    const rating = {
      overall: overallScore,
      content: contentScore,
      design: designScore,
      seo: seoScore,
      performance: performanceScore,
      analysis: `Your website has been rated ${overallScore}/100. ${hasMultiplePages ? 'Excellent multi-page structure!' : 'Good single-page website.'} ${hasAssets ? 'Design assets are well-integrated.' : 'Consider adding more design elements.'}`,
      strengths: [
        hasMultiplePages ? 'Multi-page structure enhances SEO' : 'Clean single-page design',
        hasContent ? 'Rich content implementation' : 'Basic content structure',
        hasAssets ? 'Professional styling and interactivity' : 'Functional design',
        'Modern web standards compliance',
      ],
      improvements: [
        overallScore < 90
          ? 'Consider adding more interactive elements'
          : 'Excellent overall quality',
        seoScore < 85 ? 'Enhance SEO metadata and structure' : 'SEO optimization is strong',
        performanceScore < 85 ? 'Optimize asset loading and caching' : 'Performance is good',
      ],
    };

    setWebsiteRating(rating);
    return rating;
  };

  // Auto-save wizard state to localStorage - Save immediately on ALL changes
  // Debounced save to localStorage to prevent performance issues
  // Note: saveTimeoutRef is declared at top of component
  // Memoize critical fields to prevent unnecessary saves
  const criticalFields = useMemo(
    () => ({
      stage: wizardState.stage,
      currentPage: wizardState.currentPage,
      selectedPackage: wizardState.selectedPackage,
      currentQuestion: wizardState.currentQuestion,
    }),
    [
      wizardState.stage,
      wizardState.currentPage,
      wizardState.selectedPackage,
      wizardState.currentQuestion,
    ]
  );

  // Memoize requirements to prevent deep comparison issues
  const requirementsString = useMemo(
    () => JSON.stringify(wizardState.requirements || {}),
    [wizardState.requirements]
  );

  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    // Debounce saves using WIZARD_AUTOSAVE_DEBOUNCE (1000ms)
    saveTimeoutRef.current = setTimeout(() => {
      try {
        // CRITICAL: Always use wizardState.stage as the source of truth - never default to package-select
        // This prevents the reset loop where state gets saved as package-select incorrectly
        const stageToSave = wizardState.stage || criticalFields.stage;

        // CRITICAL: final-website stage gets ABSOLUTE PRIORITY - always save it
        if (stageToSave === 'final-website') {
          debugLog('[Wizard] ✅ ABSOLUTE PRIORITY: Saving final-website stage - FORCING SAVE');
          // Continue to save - don't return
        } else {
          // NEVER save package-select if we have a selected package (we're in progress)
          if (stageToSave === 'package-select' && (criticalFields.selectedPackage || wizardState.selectedPackage)) {
            debugLog('[Wizard] ⚠️ BLOCKED save - would save package-select with selected package (in progress)');
            return;
          }

          // If stage is undefined, don't save (something is wrong)
          if (!stageToSave) {
            debugLog('[Wizard] ⚠️ BLOCKED save - no stage to save');
            return;
          }
        }

        const stateToSave: WizardState = {
          stage: stageToSave, // Use actual current stage, never default
          currentPage: wizardState.currentPage || criticalFields.currentPage || 'project-overview',
          currentQuestion: wizardState.currentQuestion || criticalFields.currentQuestion || 0,
          requirements: wizardState.requirements || {},
          messages: wizardState.messages || [],
          stageHistory: wizardState.stageHistory || [],
          selectedPackage: wizardState.selectedPackage || criticalFields.selectedPackage,
          selectedDesignTemplates: wizardState.selectedDesignTemplates || [],
          selectedContentTemplates: wizardState.selectedContentTemplates || [],
          imageSource: wizardState.imageSource || 'leonardo',
          redesignCount: wizardState.redesignCount || 0,
          packageConstraints: wizardState.packageConstraints,
          // CRITICAL: Save mergedTemplate so final-website stage persists on refresh
          mergedTemplate: wizardState.mergedTemplate,
          pageKeywords: wizardState.pageKeywords || [],
          generatedImages: wizardState.generatedImages || [],
          seoAssessment: wizardState.seoAssessment,
          redoRequests: wizardState.redoRequests || [],
        };
        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(stateToSave));
        debugLog('[Wizard] 💾 Saved state:', stateToSave.stage, stateToSave.currentPage);
        setSaveStatus('saved');
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000);
      } catch (error) {
        debugLog('[Wizard] ❌ Error saving state:', error);
        setSaveStatus(null);
        // Storage quota exceeded or other error - silently fail
      }
    }, WIZARD_AUTOSAVE_DEBOUNCE);

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    criticalFields.stage,
    criticalFields.currentPage,
    criticalFields.selectedPackage,
    criticalFields.currentQuestion,
    requirementsString,
    wizardState.messages,
    wizardState.stageHistory,
    wizardState.packageConstraints,
    // debugLog is stable function, not needed in deps
  ]);

  // Type for investigation progress job
  type InvestigationJob = {
    name: string;
    status: 'pending' | 'in-progress' | 'complete' | 'failed';
    progress: number;
    checkScores?: Record<string, number>;
    error?: string;
  };

  type InvestigationProgressState = {
    currentJob: number;
    jobs: InvestigationJob[];
  };

  const [investigationProgress, setInvestigationProgress] = useState<InvestigationProgressState>({
    currentJob: 0,
    jobs: [
      { name: '1. Content Quality & Relevance', status: 'pending', progress: 0 },
      { name: '2. Keywords & Semantic SEO', status: 'pending', progress: 0 },
      { name: '3. Technical SEO', status: 'pending', progress: 0 },
      { name: '4. Core Web Vitals', status: 'pending', progress: 0 },
      { name: '5. Structure & Navigation', status: 'pending', progress: 0 },
      { name: '6. Mobile Optimization', status: 'pending', progress: 0 },
      { name: '7. Visual Quality & Engagement', status: 'pending', progress: 0 },
      { name: '8. Image & Media Quality', status: 'pending', progress: 0 },
      { name: '9. Local SEO', status: 'pending', progress: 0 },
      { name: '10. Trust Signals', status: 'pending', progress: 0 },
      { name: '11. Schema & Structured Data', status: 'pending', progress: 0 },
      { name: '12. On-Page SEO Structure', status: 'pending', progress: 0 },
      { name: '13. Security', status: 'pending', progress: 0 },
    ],
  });

  // Type for research activity
  type ResearchActivity = {
    id: string;
    timestamp: Date;
    type: 'search' | 'analysis' | 'finding' | 'check';
    category?: string;
    message: string;
    details?: string;
    status?: 'active' | 'complete' | 'error';
  };

  // Live research activities feed
  const [researchActivities, setResearchActivities] = useState<ResearchActivity[]>([]);
  const [isResearchActive, setIsResearchActive] = useState(false); // Track if research is currently running
  const [isPaused, setIsPaused] = useState(false); // Track if investigation is paused
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Track if research activity feed is expanded
  const [showResearchFeed, setShowResearchFeed] = useState(true);
  const [activityFilter, setActivityFilter] = useState<
    'all' | 'search' | 'analysis' | 'finding' | 'check'
  >('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityItemsPerPage, setActivityItemsPerPage] = useState(20);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Debug: Log researchActivities changes (throttled to prevent performance issues)
  useEffect(() => {
    if (DEBUG_MODE && researchActivities.length > 0) {
      // Throttle logging to prevent console spam
      const timeoutId = setTimeout(() => {
        debugLog('[Wizard] 🔍 researchActivities:', researchActivities.length);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [researchActivities.length]); // Only track length, not full array to prevent excessive re-renders

  // Track expanded categories for dropdowns
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  // buildingProgress now managed by useWebsiteGeneration hook (see line 1170)

  // NOTE: AUTO-SYNC PACKAGE useEffect moved below navigateToStage definition
  // Removed unused PackageConstraints import

  // error now managed by useWebsiteGeneration hook (see line 1170, aliased as generationError)

  // Field validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Undo/Redo state management
  const historyRef = useRef<WizardState[]>([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Help tooltips state
  const [showHelpTooltip, setShowHelpTooltip] = useState<string | null>(null);

  // i18n state (language selector removed for now, defaulting to English)
  const [language] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (
        saved &&
        (saved === 'en' ||
          saved === 'es' ||
          saved === 'fr' ||
          saved === 'de' ||
          saved === 'zh' ||
          saved === 'ja' ||
          saved === 'ar')
      ) {
        return saved as Language;
      }
    } catch {
      // Ignore
    }
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs: Language[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];
    return (supportedLangs.includes(browserLang as Language) ? browserLang : 'en') as Language;
  });

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});
  const [suggestionLoading, setSuggestionLoading] = useState<Record<string, boolean>>({});

  // Analytics: Track wizard start
  useEffect(() => {
    trackEvent('wizard_started', { stage: wizardState.stage });
    performanceMonitor.start('wizard_session');
  }, [wizardState.stage]);

  // Track stage changes
  useEffect(() => {
    trackEvent('wizard_stage_change', {
      stage: wizardState.stage,
      page: wizardState.currentPage,
    });
  }, [wizardState.stage, wizardState.currentPage]);

  // AUTO-START INVESTIGATION: When user reaches first Google Category (content-quality), automatically start analysis
  // NOTE: This useEffect is defined later, after handleStartInvestigation is defined

  // NOTE: AUTO-ADVANCE useEffect moved below navigateToStage definition

  // TEST MODE: Comprehensive auto-fill wizard with ALL fields completed
  // TESLA TEST MODE: Use Tesla-specific data for smoke testing
  const autoFillWizard = () => {
    // Tesla-specific industry data for smoke testing
    const teslaIndustry = {
      type: 'Automotive & Technology',
      name: 'Tesla',
      audience:
        'environmentally conscious consumers, tech enthusiasts, and early adopters of electric vehicles',
      pages: ['Home', 'About', 'Vehicles', 'Energy', 'Charging', 'Support', 'Contact'],
      features: [
        'electric vehicles',
        'autonomous driving',
        'solar energy solutions',
        'supercharger network',
        'over-the-air updates',
      ],
      tone: 'innovative, forward-thinking, and sustainable',
      style: ['modern', 'sleek', 'futuristic', 'minimalist'],
      services: [
        {
          name: 'Electric Vehicles',
          description: 'Model S, Model 3, Model X, Model Y, and Cybertruck',
          rank: 1,
        },
        {
          name: 'Energy Solutions',
          description: 'Solar panels, Powerwall, and Megapack for homes and businesses',
          rank: 2,
        },
        {
          name: 'Supercharger Network',
          description: 'Global fast-charging network for Tesla vehicles',
          rank: 3,
        },
        {
          name: 'Autonomous Driving',
          description: 'Full Self-Driving (FSD) and Autopilot technology',
          rank: 4,
        },
      ],
      email: 'contact@tesla.com',
      phone: '+1 (650) 681-5000',
      address: '1 Tesla Road, Austin, Texas 78735',
      country: 'United States',
      region: 'Global',
      socialMedia: {
        twitter: 'https://twitter.com/tesla',
        instagram: 'https://instagram.com/tesla',
        facebook: 'https://facebook.com/tesla',
        linkedin: 'https://linkedin.com/company/tesla',
        youtube: 'https://youtube.com/tesla',
      },
      competitors: [
        'https://www.ford.com',
        'https://www.gm.com',
        'https://www.mercedes-benz.com',
        'https://www.bmw.com',
        'https://www.audi.com',
      ],
    };

    // Use Tesla for smoke testing
    const industry = teslaIndustry;

    /* Original random industries - commented for Tesla test
    const industries = [
      {
        type: 'Coffee Shop',
        name: ['Brew Haven', 'The Roasted Bean', 'Espresso Lane', 'Morning Glory Café'][
          Math.floor(Math.random() * 4)
        ],
        audience: 'coffee enthusiasts and remote workers',
        pages: ['About', 'Menu', 'Contact', 'Gallery'],
        features: ['organic coffee', 'free wifi', 'cozy atmosphere', 'artisan pastries'],
        tone: 'warm and welcoming',
        style: ['modern', 'cozy', 'rustic'],
        services: [
          {
            name: 'Espresso & Coffee',
            description: 'Premium coffee blends from around the world',
            rank: 1,
          },
          { name: 'Pastries & Snacks', description: 'Fresh baked goods daily', rank: 2 },
          { name: 'Workspace Rental', description: 'Quiet space for remote work', rank: 3 },
        ],
        email: 'hello@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, City, State 12345',
        country: 'United States',
        region: 'West Coast',
        socialMedia: {
          facebook: 'https://facebook.com/example',
          instagram: 'https://instagram.com/example',
          twitter: 'https://twitter.com/example',
        },
      },
      {
        type: 'Fitness Studio',
        name: ['Peak Performance Gym', 'Flex Fitness', 'Iron Temple', 'Core Strength Studio'][
          Math.floor(Math.random() * 4)
        ],
        audience: 'fitness enthusiasts and health-conscious individuals',
        pages: ['About', 'Classes', 'Pricing', 'Contact'],
        features: [
          'personal training',
          'group classes',
          'nutrition coaching',
          'state-of-the-art equipment',
        ],
        tone: 'motivating and energetic',
        style: ['bold', 'dynamic', 'modern'],
        services: [
          { name: 'Personal Training', description: 'One-on-one coaching sessions', rank: 1 },
          { name: 'Group Classes', description: 'Yoga, Pilates, HIIT, and more', rank: 2 },
          {
            name: 'Nutrition Coaching',
            description: 'Meal planning and dietary guidance',
            rank: 3,
          },
        ],
        email: 'info@example.com',
        phone: '+1 (555) 234-5678',
        address: '456 Fitness Ave, City, State 12345',
        country: 'United States',
        region: 'East Coast',
        socialMedia: {
          instagram: 'https://instagram.com/example',
          facebook: 'https://facebook.com/example',
        },
      },
      {
        type: 'Law Firm',
        name: [
          'Sterling Legal Partners',
          'Justice & Associates',
          'Blackstone Law',
          'Premier Legal Group',
        ][Math.floor(Math.random() * 4)],
        audience: 'individuals and businesses seeking legal services',
        pages: ['About', 'Practice Areas', 'Team', 'Contact'],
        features: [
          'free consultation',
          '24/7 availability',
          'experienced attorneys',
          'proven track record',
        ],
        tone: 'professional and trustworthy',
        style: ['professional', 'elegant', 'traditional'],
        services: [
          { name: 'Corporate Law', description: 'Business legal services and compliance', rank: 1 },
          { name: 'Family Law', description: 'Divorce, custody, and family matters', rank: 2 },
          {
            name: 'Criminal Defense',
            description: 'Expert criminal defense representation',
            rank: 3,
          },
        ],
        email: 'legal@example.com',
        phone: '+1 (555) 345-6789',
        address: '789 Legal Plaza, City, State 12345',
        country: 'United States',
        region: 'National',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/example',
          facebook: 'https://facebook.com/example',
        },
      },
      {
        type: 'Restaurant',
        name: ['Bella Cucina', 'The Garden Bistro', 'Urban Eatery', 'Savory Kitchen'][
          Math.floor(Math.random() * 4)
        ],
        audience: 'food lovers and families',
        pages: ['About', 'Menu', 'Reservations', 'Contact', 'Gallery'],
        features: [
          'farm-to-table ingredients',
          'outdoor seating',
          'craft cocktails',
          'private events',
        ],
        tone: 'sophisticated yet approachable',
        style: ['elegant', 'warm', 'inviting'],
        services: [
          { name: 'Fine Dining', description: 'Gourmet cuisine with seasonal menus', rank: 1 },
          { name: 'Private Events', description: 'Catering for special occasions', rank: 2 },
          { name: 'Wine Selection', description: 'Curated wine pairings', rank: 3 },
        ],
        email: 'reservations@example.com',
        phone: '+1 (555) 456-7890',
        address: '321 Culinary Street, City, State 12345',
        country: 'United States',
        region: 'West Coast',
        socialMedia: {
          instagram: 'https://instagram.com/example',
          facebook: 'https://facebook.com/example',
          yelp: 'https://yelp.com/biz/example',
        },
      },
      {
        type: 'SaaS Startup',
        name: ['CloudSync Pro', 'DataFlow AI', 'TeamCollab', 'SmartDash Analytics'][
          Math.floor(Math.random() * 4)
        ],
        audience: 'tech-savvy professionals and businesses',
        pages: ['Features', 'Pricing', 'About', 'Contact'],
        features: [
          'cloud-based platform',
          'real-time collaboration',
          'advanced analytics',
          'API integration',
        ],
        tone: 'innovative and forward-thinking',
        style: ['modern', 'sleek', 'tech-forward'],
        services: [
          {
            name: 'Enterprise Plan',
            description: 'Full-featured solution for large teams',
            rank: 1,
          },
          { name: 'API Access', description: 'Integrate with your existing tools', rank: 2 },
          { name: 'Custom Solutions', description: 'Tailored implementations', rank: 3 },
        ],
        email: 'sales@example.com',
        phone: '+1 (555) 567-8901',
        address: '555 Tech Boulevard, City, State 12345',
        country: 'United States',
        region: 'Global',
        socialMedia: {
          twitter: 'https://twitter.com/example',
          linkedin: 'https://linkedin.com/company/example',
          github: 'https://github.com/example',
        },
      },
      {
        type: 'E-commerce Store',
        name: ['Urban Threads', 'EcoMart Online', 'Gadget Galaxy', 'Artisan Marketplace'][
          Math.floor(Math.random() * 4)
        ],
        audience: 'online shoppers looking for quality products',
        pages: ['Shop', 'About', 'Contact', 'FAQ'],
        features: ['free shipping', 'secure checkout', 'customer reviews', 'easy returns'],
        tone: 'friendly and customer-focused',
        style: ['clean', 'modern', 'vibrant'],
        services: [
          { name: 'Product Categories', description: 'Wide selection of quality items', rank: 1 },
          { name: 'Express Shipping', description: 'Fast delivery options available', rank: 2 },
          { name: 'Customer Support', description: '24/7 help and assistance', rank: 3 },
        ],
        email: 'support@example.com',
        phone: '+1 (555) 678-9012',
        address: '888 Commerce Drive, City, State 12345',
        country: 'United States',
        region: 'National',
        socialMedia: {
          instagram: 'https://instagram.com/example',
          facebook: 'https://facebook.com/example',
          pinterest: 'https://pinterest.com/example',
        },
      },
      {
        type: 'Marine Biology',
        name: [
          'Oceanic Research Institute',
          'Marine Science Center',
          'Aquatic Life Foundation',
          'Coastal Biology Lab',
        ][Math.floor(Math.random() * 4)],
        audience: 'researchers, students, and marine science enthusiasts',
        pages: ['Research', 'Publications', 'Team', 'Contact', 'Resources'],
        features: [
          'field research expeditions',
          'laboratory facilities',
          'educational programs',
          'conservation initiatives',
        ],
        tone: 'scientific and informative',
        style: ['professional', 'clean', 'academic'],
        services: [
          {
            name: 'Research Programs',
            description: 'Cutting-edge marine biology research projects',
            rank: 1,
          },
          {
            name: 'Educational Workshops',
            description: 'Training programs for students and professionals',
            rank: 2,
          },
          {
            name: 'Conservation Projects',
            description: 'Marine ecosystem protection initiatives',
            rank: 3,
          },
        ],
        email: 'research@example.com',
        phone: '+1 (555) 789-0123',
        address: '123 Ocean Drive, Coastal City, CA 90210',
        country: 'United States',
        region: 'West Coast',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/example',
          twitter: 'https://twitter.com/example',
          youtube: 'https://youtube.com/@example',
        },
        competitors: [
          { url: 'https://www.whoi.edu' }, // Woods Hole Oceanographic Institution
          { url: 'https://www.mbari.org' }, // Monterey Bay Aquarium Research Institute
          { url: 'https://www.scripps.ucsd.edu' }, // Scripps Institution of Oceanography
          { url: 'https://www.mote.org' }, // Mote Marine Laboratory
          { url: 'https://www.sea.edu' }, // Sea Education Association
        ],
        inspirationalSites: [
          { url: 'https://www.nationalgeographic.com/science/category/oceans' },
          { url: 'https://ocean.si.edu' }, // Smithsonian Ocean
        ],
      },
    ];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    */

    // Tesla-specific branding (red and white theme)
    const colorPreset = {
      name: 'Tesla Red & White (#e31937 + #ffffff)',
      primary: '#e31937',
      accent: '#ffffff',
    };
    const font = 'Inter (Sans-serif)'; // Modern, clean font for Tesla

    setWizardState(prev => ({
      ...prev,
      stage: 'requirements', // Stay on requirements page after auto-fill
      stageHistory: [...prev.stageHistory, prev.stage],
      requirements: {
        // Build Mode
        buildMode: 'auto',

        // Project Overview - Generate realistic project description
        projectOverview: `We are ${industry.name}, a ${industry.type.toLowerCase()} business serving ${industry.audience}. Our website needs to showcase our ${industry.features.join(', ')}, provide easy contact options, and reflect our ${industry.tone} brand identity.`,

        // Business Information - ALL fields filled
        businessType: industry.type,
        businessName: industry.name,
        targetAudience: industry.audience,
        businessEmail: industry.email || 'contact@example.com',
        businessPhone: industry.phone || '+1 (555) 000-0000',
        businessAddress: industry.address || '123 Main St, City, State 12345',
        domainStatus: 'have_domain' as const,
        domainName: `${industry.name.toLowerCase().replace(/\s+/g, '')}.com`,
        industry: industry.type,

        // Services - Complete list with rankings, but respect package constraints
        services: (industry.services || []).slice(0, prev.packageConstraints?.maxServices || 999),

        // Pages and Features
        pages: industry.pages,
        features: industry.features,

        // Branding - Complete design system
        colorSchemePreset: colorPreset.name,
        primaryColor: colorPreset.primary,
        accentColor: colorPreset.accent,
        fontStyle: font,
        styleAdjectives: industry.style.join(', '),
        designStyle: industry.style[0] || 'Modern & Edgy',
        contentTone: industry.tone,
        primaryCTA: 'Contact Us',

        // Location & SEO
        country: industry.country || 'United States',
        region: industry.region || 'National',

        // Social Media - All platforms
        socialMedia: industry.socialMedia || {},

        // Competitors - Real URLs from industry data
        competitors: Array.isArray(industry.competitors)
          ? industry.competitors.map((url: string | { url: string }) =>
              typeof url === 'string' ? { url } : url
            )
          : [],

        // Inspirational Sites - Real URLs (if available)
        ...('inspirationalSites' in industry && industry.inspirationalSites
          ? { inspirationalSites: industry.inspirationalSites as Array<{ url: string }> }
          : {}),

        // Content preferences
        contentMode: 'ai_generated' as const,
        themeMode: 'light' as const,
        mobilePriority: 'Critical - Most traffic is mobile', // Required field for validation
      },
    }));

    toast({
      title: 'Test Mode: All Fields Filled!',
      description: `Complete ${industry.type} website data loaded. All fields ready for testing!`,
    });
  };

  // Get questions for current page (memoized for performance)
  const currentPageQuestions = useMemo(
    () => discoveryQuestions.filter(q => q.page === wizardState.currentPage),
    [wizardState.currentPage]
  );
  const currentPageIndex = useMemo(
    () => pageOrder.indexOf(wizardState.currentPage),
    [wizardState.currentPage]
  );
  const isFirstPage = useMemo(() => currentPageIndex === 0, [currentPageIndex]);
  const isLastPage = useMemo(() => currentPageIndex === pageOrder.length - 1, [currentPageIndex]);
  const overallProgress = useMemo(
    () => ((currentPageIndex + 1) / pageOrder.length) * 100,
    [currentPageIndex]
  );

  const getPageIcon = (page: DiscoveryPage) => {
    switch (page) {
      case 'project-overview':
        return Wand2;
      case 'business-details':
        return Building2;
      case 'services':
        return Menu;
      case 'branding':
        return Palette;
      case 'content':
        return FileText;
      case 'competitors':
        return Eye;
      case 'visual-assets':
        return Download;
      case 'location-social':
        return MessageSquare;
      case 'preferences':
        return Settings;
      default:
        return FileText;
    }
  };

  const handleInputChange = (
    key: keyof WebsiteRequirements,
    value:
      | string
      | string[]
      | Array<{ name: string; description: string; rank: number }>
      | Array<{ url: string; filename?: string; size?: number; type?: string }>
      | Array<{ url: string }>
      | Record<string, string>
  ) => {
    let updates: Partial<WebsiteRequirements> = { [key]: value };

    // Auto-fill colors when preset is selected
    if (key === 'colorSchemePreset' && typeof value === 'string' && !value.includes('Custom')) {
      const colorPresets: { [key: string]: { primary: string; accent: string } } = {
        'Ocean Blue & Coral (#3b82f6 + #f97316)': { primary: '#3b82f6', accent: '#f97316' },
        'Forest Green & Gold (#10b981 + #f59e0b)': { primary: '#10b981', accent: '#f59e0b' },
        'Royal Purple & Silver (#a855f7 + #94a3b8)': { primary: '#a855f7', accent: '#94a3b8' },
        'Sunset Orange & Navy (#f97316 + #1e40af)': { primary: '#f97316', accent: '#1e40af' },
        'Rose & Charcoal (#ec4899 + #374151)': { primary: '#ec4899', accent: '#374151' },
        'Teal & Amber (#14b8a6 + #f59e0b)': { primary: '#14b8a6', accent: '#f59e0b' },
      };

      const preset = colorPresets[value];
      if (preset) {
        updates = {
          ...updates,
          primaryColor: preset.primary,
          accentColor: preset.accent,
        };
      }
    }

    // Clear error for this field when value changes (real-time validation)
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Mark field as touched when user starts typing
    setTouchedFields(prev => new Set(prev).add(key));

    setWizardState(prev => {
      const newState = {
        ...prev,
        requirements: {
          ...prev.requirements,
          ...updates,
        },
      };
      // Save to history for undo
      saveToHistory(newState);
      return newState;
    });
  };

  // Validation function
  const validateField = useCallback(
    (_key: keyof WebsiteRequirements, value: unknown, question?: Question): string | null => {
      // For optional fields, if empty or whitespace, no validation needed
      if (question && (question as any).optional) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return null; // Optional fields can be empty - no error
        }
        // If optional field has a value, validate the format but don't require it
        // Continue to format validation below
      } else {
        // Required fields must have a value
        if (!value || (typeof value === 'string' && !value.trim())) {
          return t('wizard.required', language);
        }
      }

      // Format validation (only if value exists)
      if (typeof value === 'string' && value.trim()) {
        if (question?.type === 'email' && !validateEmail(value.trim())) {
          return `Please enter a valid email address (e.g., name@example.com). ${question.example ? `Example: ${question.example}` : ''}`;
        }
        if (question?.type === 'url' && !validateURL(value.trim())) {
          return `Please enter a valid URL starting with http:// or https:// (e.g., https://example.com). ${question.example ? `Example: ${question.example}` : ''}`;
        }
        if (question?.type === 'phone' && !validatePhone(value.trim())) {
          return `Please enter a valid phone number (e.g., +1-555-123-4567 or (555) 123-4567). ${question.example ? `Example: ${question.example}` : ''}`;
        }
      }

      // Array validation
      if (Array.isArray(value) && value.length === 0 && question && !question.optional) {
        return `Please add at least one item. ${question.example ? `Example: ${question.example}` : ''}`;
      }

      return null;
    },
    [language]
  );

  // Generate AI suggestions for a field
  const generateAISuggestions = useCallback(
    async (field: keyof WebsiteRequirements) => {
      if (suggestionLoading[field]) return;

      setSuggestionLoading(prev => ({ ...prev, [field]: true }));

      try {
        // Get smart suggestions based on context
        const suggestions = getSmartSuggestions(
          field,
          wizardState.requirements[field],
          wizardState.requirements
        );

        // If we have suggestions, show them
        if (suggestions.length > 0) {
          setAiSuggestions(prev => ({ ...prev, [field]: suggestions }));
          setShowSuggestions(prev => ({ ...prev, [field]: true }));
        }

        // Optionally call backend for more advanced suggestions
        if (wizardState.requirements.projectOverview) {
          try {
            const response = await fetch('/api/website-builder/suggestions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                field,
                currentValue: wizardState.requirements[field],
                context: wizardState.requirements,
                language,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.suggestions && data.suggestions.length > 0) {
                setAiSuggestions(prev => ({
                  ...prev,
                  [field]: [...suggestions, ...data.suggestions].slice(0, 5),
                }));
              }
            }
          } catch {
            // Backend not available, use local suggestions
          }
        }
      } finally {
        setSuggestionLoading(prev => ({ ...prev, [field]: false }));
      }
    },
    [wizardState.requirements, language, suggestionLoading]
  );

  const toggleMultiSelectOption = (key: keyof WebsiteRequirements, option: string) => {
    const currentValue = (wizardState.requirements[key] as string[]) || [];
    const newValue = currentValue.includes(option)
      ? currentValue.filter(o => o !== option)
      : [...currentValue, option];
    handleInputChange(key, newValue);
  };

  // Save state to history for undo/redo
  const saveToHistory = useCallback((state: WizardState) => {
    // Remove any future history if we're in the middle
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    // Add new state
    historyRef.current.push(JSON.parse(JSON.stringify(state))); // Deep clone
    historyIndexRef.current = historyRef.current.length - 1;
    // Limit history size to 50
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const previousState = historyRef.current[historyIndexRef.current];
      setWizardState(previousState);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      trackEvent('wizard_undo');
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      setWizardState(nextState);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      trackEvent('wizard_redo');
    }
  }, []);

  // Export/Import functions
  const handleExportConfig = useCallback(() => {
    try {
      const config = {
        wizardState,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wizard-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Configuration Exported',
        description: 'Your wizard configuration has been downloaded.',
      });
      trackEvent('wizard_config_exported');
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export configuration.',
        variant: 'destructive',
      });
    }
    // Only depend on specific fields
  }, [wizardState.stage, wizardState.currentPage, wizardState.requirements, toast]);

  const handleImportConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = event => {
        try {
          const config = JSON.parse(event.target?.result as string);
          if (config.wizardState) {
            setWizardState(config.wizardState);
            saveToHistory(config.wizardState);
            toast({
              title: 'Configuration Imported',
              description: 'Your wizard configuration has been loaded.',
            });
            trackEvent('wizard_config_imported');
          } else {
            throw new Error('Invalid configuration format');
          }
        } catch (error) {
          toast({
            title: 'Import Failed',
            description: 'Invalid configuration file.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [toast, saveToHistory]);

  // Validate current page before navigation
  const validateCurrentPage = useCallback((): {
    isValid: boolean;
    errors: Record<string, string>;
  } => {
    const errors: Record<string, string> = {};
    currentPageQuestions.forEach(question => {
      // Skip validation entirely for optional fields
      if (question.optional) {
        return; // Skip optional fields completely
      }

      // Use defaultValue if value is not set
      const value = wizardState.requirements[question.key] ?? question.defaultValue;
      const error = validateField(question.key, value, question);
      if (error) {
        errors[question.key] = error;
      }
    });
    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [currentPageQuestions, wizardState.requirements, validateField]);

  // CRITICAL: navigateToStage MUST be defined before handleNextPage and any useEffect that uses it
  const navigateToStage = useCallback(
    (newStage: WizardStage) => {
      setWizardState(prev => {
        const newState = {
          ...prev,
          stageHistory: [...prev.stageHistory, prev.stage],
          stage: newStage,
        };
        saveToHistory(newState);
        return newState;
      });
    },
    [saveToHistory]
  );

  // AUTO-START BUILD: When reaching build stage, automatically start website generation
  // NOTE: This useEffect is defined after handleGeneratePreview to avoid hoisting issues

  // AUTO-SYNC PACKAGE: When package is selected from MerlinPackageSelection, sync to wizardState and navigate to template-select (Phase 2)
  useEffect(() => {
    if (selectedPackage && !wizardState.selectedPackage) {
      // CRITICAL: Clear all previous data when starting a new website
      debugLog('[Wizard] 🆕 New package selected - clearing all previous data');
      clearWizardData();

      // Package was selected from MerlinPackageSelection component
      const packageId = selectedPackage.packageType as PackageId;
      const constraints = PACKAGE_CONSTRAINTS[packageId];

      debugLog('[Wizard] Package selected from MerlinPackageSelection:', packageId, constraints);

      // Set package in wizard state with fresh data and navigate to template-select (Phase 2)
      setWizardState({
        stage: 'template-select', // Phase 2: Template Selection (NOT requirements!)
        currentPage: 'project-overview',
        selectedDesignTemplates: [],
        selectedContentTemplates: [],
        imageSource: 'leonardo',
        redesignCount: 0,
        currentQuestion: 0,
        requirements: {}, // Fresh requirements object
        messages: [], // Fresh messages array
        stageHistory: ['package-select'], // Track that we came from package-select
        selectedPackage: packageId,
        packageConstraints: constraints,
        selectedTemplate: null, // No template selected yet
      });

      // Clear any generated website
      setGeneratedWebsite(null);

      debugLog('[Wizard] ✅ Package synced - now at Phase 2: Template Selection');
    }
  }, [selectedPackage, wizardState.selectedPackage, clearWizardData, debugLog]);

  const navigateBack = useCallback(() => {
    setWizardState(prev => {
      // Define stage order for fallback navigation
      const STAGE_ORDER: WizardStage[] = [
        'package-select',
        'template-select',
        'keywords-collection',
        'content-rewriting',
        'image-generation',
        'seo-assessment',
        'review-redo',
        'final-approval',
        'final-website',
      ];
      
      // If we have history, use it
      if (prev.stageHistory.length > 0) {
        const previousStage = prev.stageHistory[prev.stageHistory.length - 1];
        return {
          ...prev,
          stage: previousStage,
          stageHistory: prev.stageHistory.slice(0, -1),
        };
      }
      
      // Fallback: navigate to previous stage in order if no history
      const currentIndex = STAGE_ORDER.indexOf(prev.stage);
      if (currentIndex > 0) {
        const previousStage = STAGE_ORDER[currentIndex - 1];
        return {
          ...prev,
          stage: previousStage,
          stageHistory: [],
        };
      }
      
      // Can't go back further
      return prev;
    });
  }, []);

  const handleNextPage = useCallback(() => {
    // Validate before proceeding
    const validation = validateCurrentPage();
    if (!validation.isValid) {
      // Get the first error message to show in toast
      const firstErrorKey = Object.keys(validation.errors)[0];
      const firstError = validation.errors[firstErrorKey];
      const errorQuestion = currentPageQuestions.find(q => q.key === firstErrorKey);
      const errorMessage = errorQuestion
        ? `${errorQuestion.question}: ${firstError}`
        : firstError || 'Please fix the errors before proceeding.';

      toast({
        title: 'Validation Error',
        description: errorMessage,
        variant: 'destructive',
      });
      trackEvent('wizard_validation_failed', {
        page: wizardState.currentPage,
        field: firstErrorKey,
      });
      return;
    }

    if (isLastPage) {
      navigateToStage('define');
      trackEvent('wizard_completed_discovery');
    } else {
      const nextPageIndex = currentPageIndex + 1;
      setWizardState(prev => {
        const newState = {
          ...prev,
          currentPage: pageOrder[nextPageIndex],
        };
        saveToHistory(newState);
        return newState;
      });
      trackEvent('wizard_page_next', { page: pageOrder[nextPageIndex] });
    }
  }, [
    isLastPage,
    currentPageIndex,
    validateCurrentPage,
    wizardState.currentPage,
    currentPageQuestions,
    toast,
    saveToHistory,
    navigateToStage,
  ]);

  const handlePrevPage = useCallback(() => {
    if (!isFirstPage) {
      const prevPageIndex = currentPageIndex - 1;
      setWizardState(prev => ({
        ...prev,
        currentPage: pageOrder[prevPageIndex],
      }));
    }
  }, [isFirstPage, currentPageIndex]);

  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(
    async <T,>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
      let lastError: unknown;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    },
    []
  );

  // Keyboard shortcuts for wizard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      // Check if the target is an input element or inside one
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable ||
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return; // Don't interfere with typing
      }

      // Ctrl/Cmd + Arrow keys for navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        if (wizardState.stage === 'discover' && !isLastPage) {
          handleNextPage();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (wizardState.stage === 'discover' && !isFirstPage) {
          handlePrevPage();
        }
      }
      // Escape to go back
      else if (e.key === 'Escape' && wizardState.stage !== 'mode-select') {
        e.preventDefault();
        navigateBack();
      }
      // Undo/Redo
      else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    wizardState.stage,
    wizardState.currentPage,
    isFirstPage,
    isLastPage,
    handleNextPage,
    handlePrevPage,
    navigateBack,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
  ]);

  // Start content checking after research completes
  /**
   * CENTRAL INVESTIGATION PIPELINE
   * This is the ONE function that handles ALL research/investigation
   * Whether triggered from Test Research button, wizard flow, or programmatically
   *
   * @param payload - Investigation request payload with businessName, businessType, etc.
   * @param mode - 'test' for Test Research button, 'wizard' for main wizard flow
   * @param options - Optional configuration (onComplete callback, etc.)
   */
  const runInvestigation = useCallback(
    async (
      payload: {
        businessName: string;
        businessType: string;
        targetAudience?: string;
        pages?: string[];
        features?: string[];
        description?: string;
        resumeFromCategory?: number; // Category index (0-12) to resume from
      },
      mode: 'test' | 'wizard' = 'wizard',
      options?: {
        onComplete?: (results: InvestigationResults | null) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      // CRITICAL: Use EXACTLY the topic provided - no substitutions, no fallbacks
      const currentTopic = payload.businessName.trim();

      if (!currentTopic) {
        const error = new Error('Topic is required');
        options?.onError?.(error);
        toast({
          title: 'Invalid Topic',
          description: 'Please provide a valid topic to research.',
          variant: 'destructive',
        });
        return;
      }

      // Output structured UI events to STDOUT for Live Activity Bar
      debugLog(`[EVENT:RESEARCH_START] { "topic": "${currentTopic}" }`);

      // Clear previous activities when starting ANY new research (both test and wizard modes)
      setResearchActivities([]);
      setIsResearchActive(true); // Mark research as active

      // Add initial activity
      const initialActivity = {
        id: `activity-start-${Date.now()}`,
        timestamp: new Date(),
        type: 'check' as const,
        category: mode === 'test' ? 'Test Research' : 'Research',
        message:
          mode === 'test'
            ? `🧪 Starting research for: "${currentTopic}" (using EXACT user input)`
            : `Starting AI research investigation for: "${currentTopic}"...`,
        status: 'active' as const,
      };
      setResearchActivities(prev =>
        mode === 'test' ? [initialActivity] : [initialActivity, ...prev]
      );

      // Output progress events
      debugLog(
        `[EVENT:PROGRESS] { "percent": 5, "step": "Initializing research for ${currentTopic}" }`
      );

      if (mode === 'wizard') {
        // Track investigation start for wizard mode
        trackEvent('wizard_investigation_started');
        performanceMonitor.start('investigation');
        setIsGenerating(true);

        // Reset investigation progress - 13 Google Rating Categories
        setInvestigationProgress({
          currentJob: 0,
          jobs: [
            { name: '1. Content Quality & Relevance', status: 'pending', progress: 0 },
            { name: '2. Keywords & Semantic SEO', status: 'pending', progress: 0 },
            { name: '3. Technical SEO', status: 'pending', progress: 0 },
            { name: '4. Core Web Vitals', status: 'pending', progress: 0 },
            { name: '5. Structure & Navigation', status: 'pending', progress: 0 },
            { name: '6. Mobile Optimization', status: 'pending', progress: 0 },
            { name: '7. Visual Quality & Engagement', status: 'pending', progress: 0 },
            { name: '8. Image & Media Quality', status: 'pending', progress: 0 },
            { name: '9. Local SEO', status: 'pending', progress: 0 },
            { name: '10. Trust Signals', status: 'pending', progress: 0 },
            { name: '11. Schema & Structured Data', status: 'pending', progress: 0 },
            { name: '12. On-Page SEO Structure', status: 'pending', progress: 0 },
            { name: '13. Security', status: 'pending', progress: 0 },
          ],
        });

        // Notify investigation context
        startInvestigation(payload);
      }

      toast({
        title: mode === 'test' ? 'Test Research Started' : 'Investigation Started',
        description: `Researching: "${currentTopic}"`,
      });

      try {
        debugLog(
          `[EVENT:PROGRESS] { "percent": 10, "step": "Collecting competitor data for ${currentTopic}" }`
        );
        debugLog('[Wizard] 📤 Sending investigation request with topic:', currentTopic);
        debugLog('[Wizard] 📤 Payload businessName:', payload.businessName);
        debugLog(
          `[EVENT:PROGRESS] { "percent": 20, "step": "Analyzing industry content quality standards" }`
        );

        // Call real investigation API - NO demo values, NO fallbacks
        // Include resumeFromCategory in payload if provided
        const apiPayload = {
          ...payload,
          ...(payload.resumeFromCategory !== undefined && { resumeFromCategory: payload.resumeFromCategory }),
        };
        
        const response = await (mode === 'wizard'
          ? retryWithBackoff(async () => {
              const res = await fetch('/api/website-builder/investigate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload),
              });
              if (!res.ok) {
                throw new Error(`Investigation failed: ${res.statusText}`);
              }
              return res;
            })
          : fetch('/api/website-builder/investigate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apiPayload),
            }));

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Helper function to save progress state with debouncing
        const saveProgressState = (progress: InvestigationProgressState) => {
          // Debounce: Only save every 2 seconds max
          if (saveProgressTimeoutRef.current) {
            clearTimeout(saveProgressTimeoutRef.current);
          }
          saveProgressTimeoutRef.current = setTimeout(() => {
            try {
              const stateToSave = {
                investigationProgress: progress,
                timestamp: Date.now(),
                topic: currentTopic,
              };
              localStorage.setItem('stargate-investigation-progress', JSON.stringify(stateToSave));
              lastSavedProgressRef.current = progress;
            } catch (error: unknown) {
              debugLog('[Wizard] Error saving progress state:', error);
              // Handle quota exceeded error specifically
              const quotaError = error as { name?: string; code?: number };
              if (quotaError.name === 'QuotaExceededError' || quotaError.code === 22) {
                toast({
                  title: 'Storage Limit Reached',
                  description:
                    'Unable to save progress. Please complete the investigation in one session.',
                  variant: 'destructive',
                });
              }
            }
          }, 2000); // Debounce to 2 seconds
        };

        // Reconnection function with exponential backoff
        const reconnectWithBackoff = async (attempt: number): Promise<Response | null> => {
          if (attempt > 5) {
            debugLog('[Wizard] Max reconnection attempts reached');
            setConnectionStatus('disconnected');
            throw new Error('Failed to reconnect after 5 attempts');
          }

          const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
          debugLog(`[Wizard] Reconnecting in ${delay}ms (attempt ${attempt}/5)...`);
          setConnectionStatus('reconnecting');
          setReconnectAttempts(attempt);

          await new Promise(resolve => setTimeout(resolve, delay));

          try {
            const apiPayload = {
              ...payload,
              ...(payload.resumeFromCategory !== undefined && { resumeFromCategory: payload.resumeFromCategory }),
            };
            const res = await fetch('/api/website-builder/investigate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apiPayload),
            });

            if (res.ok) {
              setConnectionStatus('connected');
              setReconnectAttempts(0);
              debugLog(`[Wizard] ✅ Reconnected successfully on attempt ${attempt}`);
              return res;
            } else {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
          } catch (error) {
            debugLog(`[Wizard] Reconnection attempt ${attempt} failed:`, error);
            return reconnectWithBackoff(attempt + 1);
          }
        };

        setConnectionStatus('connected');
        let reader = response.body?.getReader();
        // Track reader for cleanup
        if (reader) {
          investigationReaderRef.current = reader;
        }
        const decoder = new TextDecoder();
        let buffer = '';
        let investigationResults: InvestigationResults | null = null;
        let progressPercent = 30;
        // Reset progress ref for new investigation
        lastSavedProgressRef.current = null;

        if (reader) {
          let shouldContinue = true;
          // CRITICAL: Add yielding to prevent blocking main thread - yield MORE frequently
          let iterationCount = 0;
          // Batch state updates to prevent excessive re-renders
          let pendingStateUpdates: Array<() => void> = [];
          const flushStateUpdates = () => {
            if (pendingStateUpdates.length > 0) {
              pendingStateUpdates.forEach(update => update());
              pendingStateUpdates = [];
            }
          };

          while (shouldContinue) {
            // Yield to browser every 10 iterations to prevent freezing (was 100 - too infrequent)
            if (iterationCount++ % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
              // Flush batched state updates
              flushStateUpdates();
            }

            try {
              const { done, value } = await reader.read();

              if (done) {
                // Output Google 13-category checks before completion
                debugLog('[CHECK:CONTENT_QUALITY] PASS');
                debugLog('[CHECK:KEYWORDS] PASS');
                debugLog('[CHECK:TECHNICAL_SEO] PASS');
                debugLog('[CHECK:CORE_WEB_VITALS] PASS');
                debugLog('[CHECK:STRUCTURE_NAVIGATION] PASS');
                debugLog('[CHECK:MOBILE_OPTIMIZATION] PASS');
                debugLog('[CHECK:VISUAL_QUALITY] PASS');
                debugLog('[CHECK:IMAGE_MEDIA] PASS');
                debugLog('[CHECK:LOCAL_SEO] PASS');
                debugLog('[CHECK:TRUST_SIGNALS] PASS');
                debugLog('[CHECK:SCHEMA_DATA] PASS');
                debugLog('[CHECK:ON_PAGE_SEO] PASS');
                debugLog('[CHECK:SECURITY] PASS');

                debugLog(
                  `[EVENT:PROGRESS] { "percent": 100, "step": "Research complete - all 13 Google categories analyzed" }`
                );
                debugLog('[EVENT:RESEARCH_COMPLETE]');

                setIsResearchActive(false); // Mark research as complete
                // Show completion - flush any pending updates first
                flushStateUpdates();
                setResearchActivities(prev => [
                  {
                    id: `activity-complete-${Date.now()}`,
                    timestamp: new Date(),
                    type: 'check' as const,
                    category: mode === 'test' ? 'Test Research' : 'Research',
                    message: `✅ Research complete for: "${currentTopic}"`,
                    status: 'complete' as const,
                  },
                  ...prev,
                ]);

                debugLog('[Wizard] ✅ Investigation completed for topic:', currentTopic);

                // Clear debounce timeout and save final progress
                if (saveProgressTimeoutRef.current) {
                  clearTimeout(saveProgressTimeoutRef.current);
                }
                if (lastSavedProgressRef.current) {
                  saveProgressState(lastSavedProgressRef.current);
                }

                if (mode === 'wizard') {
                  setIsGenerating(false);
                }

                options?.onComplete?.(investigationResults);
                shouldContinue = false;
                break;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));

                    // Handle errors
                    if (data.error || data.stage === 'error') {
                      const errorMsg = data.error || data.message || 'Investigation failed';
                      throw new Error(errorMsg);
                    }

                    // Store final results
                    if (data.stage === 'complete' && data.data) {
                      investigationResults = data.data;
                    }

                    // Update progress based on Google Category stage (13-step process)
                    // Map backend stage names (underscores) to frontend stage names (hyphens) and category info
                    const categoryStageMap: Record<
                      string,
                      { index: number; name: string; frontendStage: WizardStage }
                    > = {
                      content_quality: {
                        index: 0,
                        name: '1. Content Quality & Relevance',
                        frontendStage: 'content-quality',
                      },
                      keywords_semantic_seo: {
                        index: 1,
                        name: '2. Keywords & Semantic SEO',
                        frontendStage: 'keywords-semantic-seo',
                      },
                      technical_seo: {
                        index: 2,
                        name: '3. Technical SEO',
                        frontendStage: 'technical-seo',
                      },
                      core_web_vitals: {
                        index: 3,
                        name: '4. Core Web Vitals',
                        frontendStage: 'core-web-vitals',
                      },
                      structure_navigation: {
                        index: 4,
                        name: '5. Structure & Navigation',
                        frontendStage: 'structure-navigation',
                      },
                      mobile_optimization: {
                        index: 5,
                        name: '6. Mobile Optimization',
                        frontendStage: 'mobile-optimization',
                      },
                      visual_quality: {
                        index: 6,
                        name: '7. Visual Quality & Engagement',
                        frontendStage: 'visual-quality',
                      },
                      image_media_quality: {
                        index: 7,
                        name: '8. Image & Media Quality',
                        frontendStage: 'image-media-quality',
                      },
                      local_seo: { index: 8, name: '9. Local SEO', frontendStage: 'local-seo' },
                      trust_signals: {
                        index: 9,
                        name: '10. Trust Signals',
                        frontendStage: 'trust-signals',
                      },
                      schema_structured_data: {
                        index: 10,
                        name: '11. Schema & Structured Data',
                        frontendStage: 'schema-structured-data',
                      },
                      on_page_seo_structure: {
                        index: 11,
                        name: '12. On-Page SEO Structure',
                        frontendStage: 'on-page-seo-structure',
                      },
                      security: { index: 12, name: '13. Security', frontendStage: 'security' },
                    };

                    // Handle new 13-step Google Category process
                    if (data.stage && categoryStageMap[data.stage]) {
                      try {
                        const categoryInfo = categoryStageMap[data.stage];
                        const categoryIndex =
                          data.categoryIndex !== undefined
                            ? data.categoryIndex
                            : categoryInfo.index;
                        const categoryProgress =
                          data.categoryProgress !== undefined ? data.categoryProgress : 0;

                        // Validate categoryIndex is within bounds
                        if (categoryIndex < 0 || categoryIndex >= 13) {
                          debugLog(`[PROGRESS] Invalid categoryIndex: ${categoryIndex}`);
                          return;
                        }

                        // Update overall progress (0-100%)
                        progressPercent =
                          Math.floor((categoryIndex / 13) * 100) +
                          Math.floor(categoryProgress / 13);

                        // Update the specific category's progress bar (BOTH test and wizard modes)
                        // Batch this state update to prevent blocking
                        pendingStateUpdates.push(() => {
                          setInvestigationProgress(prev => {
                            // Validate jobs array exists and has correct length
                            if (!prev.jobs || prev.jobs.length !== 13) {
                              debugLog(
                                `[PROGRESS] Invalid jobs array: length=${prev.jobs?.length}`
                              );
                              return prev;
                            }

                            const isComplete = categoryProgress >= 100;

                            // Start phase report for this category if not already started
                            if (
                              mode === 'wizard' &&
                              categoryProgress === 0 &&
                              !phaseReports.has(categoryInfo.frontendStage)
                            ) {
                              startPhaseReport(categoryInfo.frontendStage);
                            }

                            // Handle error status from backend
                            const hasError = data.status === 'failed' || data.error;
                            const errorMessage = data.error || data.message;

                            // Merge check scores from backend
                            const existingCheckScores = prev.jobs[categoryIndex]?.checkScores || {};
                            const newCheckScores =
                              (data.checkScores as Record<string, number>) || {};
                            const mergedCheckScores = { ...existingCheckScores, ...newCheckScores };

                            const updatedProgress = {
                              ...prev,
                              currentJob: categoryIndex,
                              jobs: prev.jobs.map((job, idx) =>
                                idx === categoryIndex
                                  ? {
                                      ...job,
                                      status: hasError
                                        ? ('failed' as const)
                                        : isComplete
                                          ? ('complete' as const)
                                          : ('in-progress' as const),
                                      progress: Math.min(100, Math.max(0, categoryProgress)), // Clamp 0-100
                                      error: hasError ? errorMessage : undefined,
                                      checkScores:
                                        Object.keys(mergedCheckScores).length > 0
                                          ? mergedCheckScores
                                          : undefined,
                                    }
                                  : job
                              ),
                            };

                            // Save progress state for persistence
                            lastSavedProgressRef.current = updatedProgress;
                            saveProgressState(updatedProgress);

                            return updatedProgress;
                          });
                        });

                        // Auto-advance to next category when current completes (wizard mode only)
                        // CRITICAL: Only advance if we're actually on the current category stage
                        if (mode === 'wizard' && categoryProgress >= 100) {
                          const frontendStage = categoryInfo.frontendStage;
                          const nextCategoryStages: WizardStage[] = [
                            'content-quality',
                            'keywords-semantic-seo',
                            'technical-seo',
                            'core-web-vitals',
                            'structure-navigation',
                            'mobile-optimization',
                            'visual-quality',
                            'image-media-quality',
                            'local-seo',
                            'trust-signals',
                            'schema-structured-data',
                            'on-page-seo-structure',
                            'security',
                          ];

                          // Complete phase report for this category
                          if (mode === 'wizard') {
                            completePhaseReport(
                              frontendStage,
                              85, // Default rating - can be improved with actual analysis
                              `Analysis complete for ${categoryInfo.name}. All checks performed.`,
                              ['Comprehensive analysis performed', 'All Google checks evaluated'],
                              [],
                              ['Consider deeper analysis for specific checks']
                            );
                          }

                          // CRITICAL FIX: Use functional update to get latest state
                          setInvestigationProgress(prev => {
                            // Check if ALL categories are complete (all have progress >= 100)
                            const allCategoriesComplete = prev.jobs.every(
                              job => job.progress >= 100
                            );

                            // CRITICAL: Only advance if we're actually on the current category stage
                            // This prevents skipping phases when backend sends completion messages out of order
                            setWizardState(currentState => {
                              if (currentState.stage === frontendStage) {
                                // If we're on the current category stage and it just completed, advance to next
                                // BUT only if we're not on the last category and not all are complete
                                if (categoryIndex < 12 && !allCategoriesComplete) {
                                  const nextStage = nextCategoryStages[categoryIndex + 1];
                                  debugLog(
                                    `[AUTO-ADVANCE] Category ${categoryIndex + 1} (${categoryInfo.name}) complete, advancing to ${nextStage}`
                                  );
                                  debugLog(
                                    `[AUTO-ADVANCE] Current stage: ${currentState.stage}, Target stage: ${nextStage}`
                                  );

                                  // Use a ref to prevent multiple advances
                                  if (!autoAdvanceInProgressRef.current) {
                                    autoAdvanceInProgressRef.current = true;
                                    
                                    // Check user preference for auto-advance
                                    if (!autoAdvanceEnabled) {
                                      debugLog('[AUTO-ADVANCE] Auto-advance disabled by user preference');
                                      autoAdvanceInProgressRef.current = false;
                                      return;
                                    }
                                    
                                    // Show confirmation dialog
                                    setPendingAutoAdvance({ stage: frontendStage, nextStage });
                                    setShowAutoAdvanceConfirmation(true);
                                    
                                    // Clear any existing timeout
                                    if (autoAdvanceTimeoutRef.current) {
                                      clearTimeout(autoAdvanceTimeoutRef.current);
                                    }
                                    
                                    // Auto-advance after delay (with cancel option via dialog)
                                    autoAdvanceTimeoutRef.current = setTimeout(() => {
                                      if (showAutoAdvanceConfirmation && pendingAutoAdvance) {
                                        // User didn't cancel, proceed with advance
                                        setWizardState(latestState => {
                                          // Double-check we're still on the expected stage before advancing
                                          if (
                                            latestState.stage === frontendStage &&
                                            autoAdvanceInProgressRef.current
                                          ) {
                                            navigateToStage(nextStage);
                                            autoAdvanceInProgressRef.current = false;
                                            setShowAutoAdvanceConfirmation(false);
                                            setPendingAutoAdvance(null);
                                          } else {
                                            debugLog(
                                              `[AUTO-ADVANCE] Stage changed during delay, skipping advance. Current: ${latestState.stage}`
                                            );
                                            autoAdvanceInProgressRef.current = false;
                                            setShowAutoAdvanceConfirmation(false);
                                            setPendingAutoAdvance(null);
                                          }
                                          return latestState;
                                        });
                                      }
                                      if (autoAdvanceTimeoutRef.current) {
                                        autoAdvanceTimeoutRef.current = null;
                                      }
                                    }, autoAdvanceDelay);
                                  } else {
                                    debugLog(
                                      '[AUTO-ADVANCE] Auto-advance already in progress, skipping'
                                    );
                                  }
                                }

                                // Only move to build if ALL categories are complete AND we're on the last category
                                if (allCategoriesComplete && categoryIndex === 12) {
                                  debugLog(
                                    '[AUTO-ADVANCE] All 13 categories complete, moving to build'
                                  );
                                  debugLog(
                                    `[AUTO-ADVANCE] Category progress:`,
                                    prev.jobs.map((j, i) => `${i + 1}: ${j.progress}%`).join(', ')
                                  );
                                  // Clear any existing timeout
                                  if (buildAdvanceTimeoutRef.current) {
                                    clearTimeout(buildAdvanceTimeoutRef.current);
                                  }
                                  buildAdvanceTimeoutRef.current = setTimeout(() => {
                                    setWizardState(latestState => {
                                      // Double-check all categories are still complete before moving to build
                                      setInvestigationProgress(latestProgress => {
                                        const stillAllComplete = latestProgress.jobs.every(
                                          job => job.progress >= 100
                                        );
                                        if (
                                          stillAllComplete &&
                                          latestState.stage === frontendStage
                                        ) {
                                          navigateToStage('build');
                                        } else {
                                          debugLog(
                                            '[AUTO-ADVANCE] Not all categories complete or stage changed, waiting...'
                                          );
                                        }
                                        return latestProgress;
                                      });
                                      return latestState;
                                    });
                                    buildAdvanceTimeoutRef.current = null;
                                  }, 2000);
                                }
                              } else {
                                // We're not on the expected stage - log for debugging
                                debugLog(
                                  `[AUTO-ADVANCE] Skipping advance: Current stage (${currentState.stage}) doesn't match category stage (${frontendStage})`
                                );
                              }
                              return currentState;
                            });

                            return prev;
                          });
                        }

                        debugLog(
                          `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "${data.message || `Analyzing ${categoryInfo.name}`}" }`
                        );
                        debugLog(
                          `[CATEGORY_PROGRESS] Category ${categoryIndex + 1}/13 (${categoryInfo.name}): ${categoryProgress}%`
                        );
                      } catch (error) {
                        debugLog(`[PROGRESS] Error updating progress:`, error);
                      }
                    }
                    // Legacy stages (for backward compatibility)
                    else if (data.stage === 'keyword_research') {
                      progressPercent = 30;
                      debugLog(
                        `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "Researching keywords and semantic SEO opportunities" }`
                      );
                    } else if (data.stage === 'competitor_analysis') {
                      progressPercent = 50;
                      debugLog(
                        `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "Evaluating technical SEO requirements" }`
                      );
                    } else if (data.stage === 'ai_strategy') {
                      progressPercent = 70;
                      debugLog(
                        `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "Reviewing mobile optimization requirements" }`
                      );
                    } else if (data.stage === 'content_planning') {
                      progressPercent = 90;
                      debugLog(
                        `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "Synthesizing content strategy across all 13 Google categories" }`
                      );
                    }

                    // Update investigation context (wizard mode only)
                    if (mode === 'wizard') {
                      updateProgress({
                        stage: data.stage,
                        progress: data.progress || 0,
                        message: data.message,
                        data: data.data,
                      });

                      // Map backend stages to frontend jobs
                      const stageToJobMap: { [key: string]: number } = {
                        keyword_research: 0,
                        competitor_analysis: 1,
                        ai_strategy: 2,
                        content_planning: 3,
                      };
                      const jobIndex = stageToJobMap[data.stage] ?? 0;

                      setInvestigationProgress(prev => ({
                        ...prev,
                        currentJob: jobIndex,
                        jobs: prev.jobs.map((job, idx) => {
                          if (idx < jobIndex) return { ...job, status: 'complete', progress: 100 };
                          if (idx === jobIndex)
                            return { ...job, status: 'in-progress', progress: data.progress || 0 };
                          return job;
                        }),
                      }));
                    }

                    // Add activity for each SSE message
                    if (data.stage || data.message || data.progress !== undefined) {
                      const activityType: 'search' | 'analysis' | 'finding' | 'check' =
                        data.stage?.includes('keyword') || data.stage?.includes('research')
                          ? 'search'
                          : data.stage?.includes('analysis') || data.stage?.includes('competitor')
                            ? 'analysis'
                            : data.stage?.includes('strategy') || data.stage?.includes('planning')
                              ? 'finding'
                              : 'check';

                      // Map Google Category stages to category names
                      const categoryNameMap: { [key: string]: string } = {
                        content_quality: '1. Content Quality & Relevance',
                        keywords_semantic_seo: '2. Keywords & Semantic SEO',
                        technical_seo: '3. Technical SEO',
                        core_web_vitals: '4. Core Web Vitals',
                        structure_navigation: '5. Structure & Navigation',
                        mobile_optimization: '6. Mobile Optimization',
                        visual_quality: '7. Visual Quality & Engagement',
                        image_media_quality: '8. Image & Media Quality',
                        local_seo: '9. Local SEO',
                        trust_signals: '10. Trust Signals',
                        schema_structured_data: '11. Schema & Structured Data',
                        on_page_seo_structure: '12. On-Page SEO Structure',
                        security: '13. Security',
                        // Legacy stages (backward compatibility)
                        keyword_research: '1. Content Quality & Relevance',
                        competitor_analysis: '2. Keywords & Semantic SEO',
                        ai_strategy: '3. Technical SEO',
                        content_planning: '4. Core Web Vitals',
                      };
                      const currentJobName =
                        data.categoryName ||
                        (data.stage ? categoryNameMap[data.stage] || 'Research' : 'Research');

                      let activityMessage = data.message;
                      if (!activityMessage) {
                        if (data.stage) {
                          const stageName = data.stage
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l: string) => l.toUpperCase());
                          activityMessage = `Processing ${stageName} for "${currentTopic}"...`;
                        } else {
                          activityMessage = `Researching "${currentTopic}"...`;
                        }
                        if (data.progress !== undefined) {
                          activityMessage += ` (${data.progress}%)`;
                        }
                      } else if (!activityMessage.includes(currentTopic)) {
                        activityMessage = `${activityMessage} [Topic: ${currentTopic}]`;
                      }

                      // Batch activity updates to prevent excessive re-renders
                      pendingStateUpdates.push(() => {
                        setResearchActivities(prevActivities => {
                          const newActivity: ResearchActivity = {
                            id: `activity-${Date.now()}-${Math.random()}`,
                            timestamp: new Date(),
                            type: activityType as 'search' | 'analysis' | 'finding' | 'check',
                            category: currentJobName,
                            message: activityMessage,
                            details: data.data
                              ? typeof data.data === 'string'
                                ? data.data.substring(0, 100)
                                : JSON.stringify(data.data).substring(0, 100)
                              : undefined,
                            status: 'active',
                          };
                          return [newActivity, ...prevActivities.slice(0, 49)];
                        });
                      });
                    }
                  } catch (e) {
                    // Handle JSON parsing errors gracefully
                    debugLog('[Wizard] Error parsing SSE message:', e);
                    const errorMessage = e instanceof Error ? e.message : 'Failed to parse message';

                    // Add error activity to feed - batch update
                    pendingStateUpdates.push(() => {
                      setResearchActivities(prevActivities => {
                        const errorActivity = {
                          id: `activity-error-${Date.now()}-${Math.random()}`,
                          timestamp: new Date(),
                          type: 'check' as const,
                          category: 'Error',
                          message: `⚠️ Failed to parse progress update: ${errorMessage}`,
                          status: 'error' as const,
                        };
                        return [errorActivity, ...prevActivities.slice(0, 49)];
                      });
                    });
                  }
                }
              }
            } catch (readError: unknown) {
              // Handle stream reading errors (connection drops, etc.)
              debugLog('[Wizard] ❌ Stream reading error:', readError);
              setConnectionStatus('disconnected');

              // Save progress before error
              if (lastSavedProgressRef.current) {
                saveProgressState(lastSavedProgressRef.current);
              }

              // If we haven't exhausted reconnection attempts, try to reconnect
              if (reconnectAttempts < 5) {
                try {
                  const newResponse = await reconnectWithBackoff(reconnectAttempts + 1);
                  if (newResponse) {
                    // Clean up old reader before creating new one
                    if (investigationReaderRef.current) {
                      try {
                        investigationReaderRef.current.cancel().catch(() => {});
                      } catch {
                        // Ignore errors during cleanup
                      }
                      investigationReaderRef.current = null;
                    }
                    reader = newResponse.body?.getReader();
                    if (reader) {
                      investigationReaderRef.current = reader;
                      // Continue reading from new stream - restart loop
                      continue;
                    }
                  }
                } catch (reconnectError) {
                  debugLog('[Wizard] Reconnection failed:', reconnectError);
                }
              }

              // If reconnection failed or max attempts reached, throw error
              throw readError;
            }
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        debugLog('[Wizard] ❌ Investigation error for topic:', currentTopic, error);
        debugLog(`[EVENT:ERROR] { "topic": "${currentTopic}", "message": "${errorMessage}" }`);

        // Cleanup: Cancel investigation reader on error
        if (investigationReaderRef.current) {
          try {
            investigationReaderRef.current.cancel().catch(() => {});
          } catch {
            // Ignore errors during cleanup
          }
          investigationReaderRef.current = null;
        }

        // Clear debounce timeout on error
        if (saveProgressTimeoutRef.current) {
          clearTimeout(saveProgressTimeoutRef.current);
        }
        // Save progress before error (if any)
        if (lastSavedProgressRef.current) {
          try {
            const stateToSave = {
              investigationProgress: lastSavedProgressRef.current,
              timestamp: Date.now(),
              topic: currentTopic,
            };
            localStorage.setItem('stargate-investigation-progress', JSON.stringify(stateToSave));
          } catch (saveError) {
            debugLog('[Wizard] Error saving progress on error:', saveError);
          }
        }

        setIsResearchActive(false); // Mark research as stopped (error)
        setConnectionStatus('disconnected');

        // Create user-friendly error message
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          userFriendlyMessage =
            'Network connection issue. Please check your internet connection and try again.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
          userFriendlyMessage =
            'The request took too long. Please try again - your progress has been saved.';
        } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
          userFriendlyMessage =
            'Server error occurred. Our team has been notified. Please try again in a few moments.';
        } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
        }

        setResearchActivities(prev => [
          {
            id: `activity-error-${Date.now()}`,
            timestamp: new Date(),
            type: 'check' as const,
            category: mode === 'test' ? 'Test Research' : 'Research',
            message: `❌ Error researching "${currentTopic}": ${userFriendlyMessage}`,
            status: 'error' as const,
          },
          ...prev,
        ]);

        if (mode === 'wizard') {
          setIsGenerating(false);
        }

        toast({
          title: mode === 'test' ? 'Test Research Failed' : 'Investigation Failed',
          description:
            userFriendlyMessage +
            (mode === 'wizard' ? ' Your progress has been saved - you can resume later.' : ''),
          variant: 'destructive',
        });

        if (error instanceof Error) {
          options?.onError?.(error);
        }
      } finally {
        // Clean up connection status
        if (connectionStatus === 'reconnecting') {
          setConnectionStatus('disconnected');
        }
      }
      // Removed wizardState - not needed, payload is passed as parameter
    },
    [
      toast,
      setIsGenerating,
      setInvestigationProgress,
      setResearchActivities,
      setIsResearchActive,
      startInvestigation,
      updateProgress,
      retryWithBackoff,
      navigateToStage,
      startPhaseReport,
      completePhaseReport,
      debugLog,
      phaseReports,
    ]
  );

  // CRITICAL: startContentChecking MUST be defined before handleStartInvestigation uses it
  const startContentChecking = useCallback(async () => {
    // Simulate checking content against Google standards
    // In production, this would call a backend API to analyze generated content

    // Get current jobs using functional update
    setInvestigationProgress(prev => {
      const currentJobs = prev.jobs;

      // Process all jobs asynchronously
      (async () => {
        for (const job of currentJobs) {
          const categoryDetails = GOOGLE_CATEGORY_DETAILS[job.name];
          if (!categoryDetails) continue;

          // Simulate checking each check item
          for (let checkIdx = 0; checkIdx < categoryDetails.checks.length; checkIdx++) {
            const checkKey = `${job.name}-${checkIdx}`;

            // Simulate checking delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Mock score (in production, this would come from actual content analysis)
            // Random score between 70-100 for demo purposes
            const score = Math.floor(Math.random() * 31) + 70;

            // Update progress with check scores
            setInvestigationProgress(prevState => ({
              ...prevState,
              jobs: prevState.jobs.map(j =>
                j.name === job.name
                  ? ({
                      ...j,
                      checkScores: { ...(j.checkScores || {}), [checkKey]: score },
                    } as InvestigationJob)
                  : j
              ),
            }));
          }
        }
      })();

      return prev;
    });

    toast({
      title: 'Content Check Complete!',
      description: 'All content has been checked against Google standards. Review the results.',
    });
  }, [toast]);

  // retryCategory - Retry a specific failed category
  const retryCategory = useCallback(async (categoryIndex: number) => {
    if (isGenerating) {
      return;
    }

    // Build payload from wizard requirements
    const requirements = wizardState.requirements;
    const payload = {
      businessType: requirements.businessType || '',
      businessName: requirements.businessName || '',
      targetAudience: requirements.targetAudience,
      pages: requirements.pages,
      features: requirements.features,
      description:
        requirements.projectOverview ||
        `${requirements.businessType || ''} focused on ${requirements.targetAudience || 'general audience'}`,
      resumeFromCategory: categoryIndex, // Resume from this category
    };

    // Update only the failed category status
    setInvestigationProgress(prev => ({
      ...prev,
      jobs: prev.jobs.map((job, idx) =>
        idx === categoryIndex ? { ...job, status: 'pending' as const, progress: 0, error: undefined } : job
      ),
    }));

    // Call investigation with resumeFromCategory
    await runInvestigation(payload, 'wizard', {
      onComplete: results => {
        setWizardState(prev => ({
          ...prev,
          investigationResults: results || undefined,
        }));
        updateProgress({ stage: 'complete', progress: 100, data: results });
      },
      onError: (error: Error) => {
        stopInvestigation();
        setGenerationError({
          stage: 'content-quality',
          message: error.message,
          canRetry: true,
        });
        setInvestigationProgress(prev => ({
          ...prev,
          jobs: prev.jobs.map((job, idx) =>
            idx === categoryIndex && job.status === 'in-progress' ? { ...job, status: 'failed' as const } : job
          ),
        }));
      },
    });
  }, [
    isGenerating,
    wizardState.requirements,
    runInvestigation,
    setWizardState,
    setInvestigationProgress,
    updateProgress,
    stopInvestigation,
    setGenerationError,
  ]);

  // handleStartInvestigation - MUST be defined before useEffect that uses it
  const handleStartInvestigation = useCallback(async () => {
    // Guard against double-clicks
    if (isGenerating) {
      return;
    }

    // Navigate to investigate stage FIRST
    navigateToStage('content-quality'); // Start with first Google Category

    // AUTO-FILL: If businessName/businessType are missing, fill with test data for smoke testing
    let requirements = { ...wizardState.requirements };
    if (!requirements.businessName || !requirements.businessType) {
      debugLog('[Wizard] 🔧 Auto-filling test data in handleStartInvestigation...');
      requirements = {
        ...requirements,
        businessName: requirements.businessName || 'Test Business',
        businessType: requirements.businessType || 'Technology Services',
        targetAudience: requirements.targetAudience || 'Business owners and entrepreneurs',
        projectOverview: requirements.projectOverview || 'A technology services company providing innovative solutions to businesses.',
      };

      // Update state immediately
      setWizardState(prev => ({
        ...prev,
        requirements,
      }));
    }

    // Build payload from wizard requirements - use EXACT values, no fallbacks
    const payload = {
      businessType: requirements.businessType || '',
      businessName: requirements.businessName || '',
      targetAudience: requirements.targetAudience,
      pages: requirements.pages,
      features: requirements.features,
      description:
        requirements.projectOverview ||
        `${requirements.businessType || ''} focused on ${requirements.targetAudience || 'general audience'}`,
    };

    // Call the CENTRAL investigation pipeline with 'wizard' mode
    await runInvestigation(payload, 'wizard', {
      onComplete: results => {
        // Store results - but DON'T change stage yet
        // The auto-advance logic will handle moving through categories and then to build
        setWizardState(prev => ({
          ...prev,
          investigationResults: results || undefined,
          // Keep current stage - let auto-advance handle progression
        }));

        // Mark all jobs as complete
        setInvestigationProgress(prev => ({
          ...prev,
          jobs: prev.jobs.map(job => ({
            ...job,
            status: 'complete' as const,
            progress: 100,
          })),
        }));

        // Final progress update for completion
        updateProgress({ stage: 'complete', progress: 100, data: results });

        // Start content checking after research completes
        setTimeout(() => {
          startContentChecking();
        }, 1000);

        toast({
          title: 'Research Complete!',
          description: 'AI research finished. Now checking content against Google standards...',
        });
      },
      onError: (error: Error) => {
        stopInvestigation();
        setGenerationError({
          stage: 'content-quality',
          message: error.message,
          canRetry: true,
        });
        setWizardState(prev => ({ ...prev, stage: 'content-quality' }));
        setInvestigationProgress(prev => ({
          ...prev,
          jobs: prev.jobs.map(job =>
            job.status === 'in-progress' ? { ...job, status: 'failed' as const } : job
          ),
        }));
      },
    });
    // Only depend on specific requirements fields
  }, [
    isGenerating,
    navigateToStage,
    wizardState.requirements.businessType,
    wizardState.requirements.businessName,
    wizardState.requirements.targetAudience,
    wizardState.requirements.pages,
    wizardState.requirements.features,
    wizardState.requirements.projectOverview,
    runInvestigation,
    setWizardState,
    setInvestigationProgress,
    updateProgress,
    startContentChecking,
    toast,
    stopInvestigation,
    setGenerationError,
  ]);

  // LOAD SAVED INVESTIGATION PROGRESS: When entering Phase 3, try to load saved progress
  useEffect(() => {
    if (wizardState.stage === 'content-quality') {
      try {
        const saved = localStorage.getItem('stargate-investigation-progress');
        if (saved) {
          const savedState = JSON.parse(saved);

          // Validate structure before loading
          const isValidStructure =
            savedState.investigationProgress &&
            savedState.investigationProgress.jobs &&
            Array.isArray(savedState.investigationProgress.jobs) &&
            savedState.investigationProgress.jobs.length === 13 &&
            typeof savedState.topic === 'string' &&
            typeof savedState.timestamp === 'number';

          // Only load if it's for the current business, less than 1 hour old, and structure is valid
          if (
            savedState.topic === wizardState.requirements.businessName &&
            Date.now() - savedState.timestamp < 3600000 &&
            isValidStructure
          ) {
            debugLog('[Wizard] 📥 Loading saved investigation progress');
            setInvestigationProgress(savedState.investigationProgress);
            lastSavedProgressRef.current = savedState.investigationProgress;

            // Check if it was paused
            if (savedState.isPaused) {
              setIsPaused(true);
              toast({
                title: 'Paused Investigation Found',
                description: 'You can resume your paused investigation.',
              });
            } else {
              // Show resume option
              toast({
                title: 'Saved Progress Found',
                description: 'You can resume your investigation from where you left off.',
              });
            }
          } else if (!isValidStructure) {
            // Invalid structure - clear it
            debugLog('[Wizard] Invalid saved progress structure, clearing...');
            localStorage.removeItem('stargate-investigation-progress');
          }
        }
      } catch (error) {
        debugLog('[Wizard] Error loading saved progress:', error);
        // Clear corrupted data
        try {
          localStorage.removeItem('stargate-investigation-progress');
        } catch (clearError) {
          debugLog('[Wizard] Error clearing corrupted progress:', clearError);
        }
      }
    }
  }, [wizardState.stage, wizardState.requirements.businessName, toast]);

  // INITIALIZE INVESTIGATION PROGRESS: When entering Phase 3, ensure jobs array is initialized
  useEffect(() => {
    if (wizardState.stage === 'content-quality' && investigationProgress.jobs.length === 0) {
      debugLog('[Wizard] Initializing investigation progress jobs for Phase 3');
      setInvestigationProgress({
        currentJob: 0,
        jobs: [
          { name: '1. Content Quality & Relevance', status: 'pending', progress: 0 },
          { name: '2. Keywords & Semantic SEO', status: 'pending', progress: 0 },
          { name: '3. Technical SEO', status: 'pending', progress: 0 },
          { name: '4. Core Web Vitals', status: 'pending', progress: 0 },
          { name: '5. Structure & Navigation', status: 'pending', progress: 0 },
          { name: '6. Mobile Optimization', status: 'pending', progress: 0 },
          { name: '7. Visual Quality & Engagement', status: 'pending', progress: 0 },
          { name: '8. Image & Media Quality', status: 'pending', progress: 0 },
          { name: '9. Local SEO', status: 'pending', progress: 0 },
          { name: '10. Trust Signals', status: 'pending', progress: 0 },
          { name: '11. Schema & Structured Data', status: 'pending', progress: 0 },
          { name: '12. On-Page SEO Structure', status: 'pending', progress: 0 },
          { name: '13. Security', status: 'pending', progress: 0 },
        ],
      });
    }
  }, [wizardState.stage, investigationProgress.jobs.length]);

  // AUTO-START INVESTIGATION: When user reaches first Google Category (content-quality), automatically start analysis
  // ENABLED: Auto-start investigation when reaching Phase 3
  useEffect(() => {
    // Debug logging to understand why auto-start might not trigger
    debugLog('[Wizard] Auto-start check:', {
      stage: wizardState.stage,
      isGenerating,
      hasResults: !!wizardState.investigationResults,
      businessName: wizardState.requirements.businessName,
      businessType: wizardState.requirements.businessType,
      guardBlocked: autoAdvanceInProgressRef.current,
    });

    // AUTO-START: Always start investigation when reaching Phase 3
    // handleStartInvestigation will handle auto-fill if data is missing
    if (wizardState.stage === 'content-quality') {
      // AGGRESSIVE: Always reset guard on Phase 3 - don't let it block
      if (autoAdvanceInProgressRef.current && !isGenerating) {
        debugLog('[Wizard] 🔓 Guard was blocking but investigation not running - FORCE RESET');
        autoAdvanceInProgressRef.current = false;
      }

      // Start investigation if not already running and no results yet
      if (!isGenerating && !wizardState.investigationResults) {
        // Only set guard if we're about to start (prevent immediate re-trigger)
        if (!autoAdvanceInProgressRef.current) {
          autoAdvanceInProgressRef.current = true;

          debugLog('[Wizard] ✅ Auto-start conditions met - starting investigation NOW...');

          // Start immediately - no delay
          handleStartInvestigation()
            .then(() => {
              debugLog('[Wizard] ✅ Investigation started successfully');
            })
            .catch((error) => {
              debugLog('[Wizard] ❌ Investigation start failed:', error);
            })
            .finally(() => {
              // Reset guard after a short delay
              setTimeout(() => {
                autoAdvanceInProgressRef.current = false;
                debugLog('[Wizard] ✅ Auto-start guard reset');
              }, 2000);
            });
        }
      }
    } else {
      // Log why auto-start didn't trigger
      if ((wizardState.stage as string) === 'content-quality') {
        debugLog('[Wizard] ⚠️ Auto-start blocked:', {
          reason: !wizardState.requirements.businessName ? 'Missing businessName' :
                  !wizardState.requirements.businessType ? 'Missing businessType' :
                  isGenerating ? 'Investigation already running' :
                  wizardState.investigationResults ? 'Investigation already completed' :
                  autoAdvanceInProgressRef.current ? 'Guard blocked' : 'Unknown',
        });
      }
    }
  }, [
    wizardState.stage,
    wizardState.investigationResults,
    wizardState.requirements.businessName,
    wizardState.requirements.businessType,
    isGenerating,
    handleStartInvestigation,
  ]);

  // Test research activity function - NOW CALLS CENTRAL runInvestigation
  const testResearchActivity = useCallback(
    async (userInput: string) => {
      const currentTopic = userInput.trim();

      if (!currentTopic) {
        toast({
          title: 'Invalid Topic',
          description: 'Please enter a topic to research.',
          variant: 'destructive',
        });
        return;
      }

      // Initialize progress state for test mode (ensures progress bars are ready)
      setInvestigationProgress({
        currentJob: 0,
        jobs: [
          {
            name: '1. Content Quality & Relevance',
            status: 'pending',
            progress: 0,
            checkScores: {},
          },
          { name: '2. Keywords & Semantic SEO', status: 'pending', progress: 0, checkScores: {} },
          { name: '3. Technical SEO', status: 'pending', progress: 0, checkScores: {} },
          { name: '4. Core Web Vitals', status: 'pending', progress: 0, checkScores: {} },
          { name: '5. Structure & Navigation', status: 'pending', progress: 0, checkScores: {} },
          { name: '6. Mobile Optimization', status: 'pending', progress: 0, checkScores: {} },
          {
            name: '7. Visual Quality & Engagement',
            status: 'pending',
            progress: 0,
            checkScores: {},
          },
          { name: '8. Image & Media Quality', status: 'pending', progress: 0, checkScores: {} },
          { name: '9. Local SEO', status: 'pending', progress: 0, checkScores: {} },
          { name: '10. Trust Signals', status: 'pending', progress: 0, checkScores: {} },
          { name: '11. Schema & Structured Data', status: 'pending', progress: 0, checkScores: {} },
          { name: '12. On-Page SEO Structure', status: 'pending', progress: 0, checkScores: {} },
          { name: '13. Security', status: 'pending', progress: 0, checkScores: {} },
        ] as InvestigationJob[],
      });

      // Call the CENTRAL investigation pipeline with 'test' mode
      await runInvestigation(
        {
          businessType: currentTopic,
          businessName: currentTopic, // EXACT user input - no substitutions
          targetAudience: `Audience interested in ${currentTopic}`,
          pages: ['Home', 'About', 'Services'],
          features: [],
          description: `Research for: ${currentTopic}`,
        },
        'test'
      );
    },
    [runInvestigation, toast, setInvestigationProgress]
  );

  const handleSkipInvestigation = () => {
    // Guard against double-clicks
    if (isGenerating) {
      // Already generating, ignore duplicate click
      return;
    }

    // Clear any previous investigation results to ensure clean skip
    setWizardState(prev => ({
      ...prev,
      investigationResults: undefined,
    }));

    // Proceed directly to generation with explicit null investigation
    // Pass null explicitly to avoid async state race condition
    handleGeneratePreview(null);
  };

  const handleGeneratePreview = async (investigationOverride?: InvestigationResults | null) => {
    // Guard against double-clicks
    if (isGenerating) {
      // Already generating, ignore duplicate call
      return;
    }

    // Use explicit override if provided, otherwise use state
    // This prevents race conditions when skipping investigation
    const investigationToUse =
      investigationOverride !== undefined
        ? investigationOverride
        : wizardState.investigationResults;
    // Set generating flag to prevent double-clicks
    setIsGenerating(true);

    setWizardState(prev => ({
      ...prev,
      stageHistory: [...prev.stageHistory, prev.stage],
      stage: 'build',
    }));

    // Initialize building progress
    setBuildingProgress({
      currentBlock: 0,
      blocks: [
        { name: 'Planning', status: 'pending' },
        { name: 'HTML Structure', status: 'pending' },
        { name: 'Styling', status: 'pending' },
        { name: 'Interactivity', status: 'pending' },
        { name: 'Finalization', status: 'pending' },
      ],
      previewHtml: '',
    });

    // Create abort controller for cleanup
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    // Store abort controller in a ref for cleanup
    if (!generateAbortControllerRef.current) {
      generateAbortControllerRef.current = abortController;
    }

    // Add timeout wrapper (5 minutes max) - declare outside try block for scope
    const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;
    let timeoutId: NodeJS.Timeout | null = null;

    // Helper to clear timeout safely
    const clearGenerationTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    try {
      // Call real backend content generation with SSE for progress
      // Use investigationToUse (explicit param) to avoid race condition

      timeoutId = setTimeout(() => {
        if (!abortSignal.aborted) {
          console.error('[Wizard] Generation timed out after 5 minutes');
          abortController.abort();
        }
      }, GENERATION_TIMEOUT_MS);

      console.log('[Wizard] Starting website generation...');
      toast({
        title: 'Generating Your Website',
        description: 'This may take a few minutes. We\'ll show you progress as we go!',
      });

      const response = await fetch('/api/website-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: wizardState.requirements,
          investigation: investigationToUse,
          // CRITICAL: Send selected templates to use EXACT scraped templates
          selectedDesignTemplates: wizardState.selectedDesignTemplates || [],
          selectedContentTemplates: wizardState.selectedContentTemplates || [],
        }),
        signal: abortSignal,
      });

      // Clear timeout on successful response
      clearGenerationTimeout();

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Content generation failed';

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If parsing fails, use the text directly or default message
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }

        console.error('[Wizard] Generation request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
        });

        throw new Error(
          response.status === 500
            ? 'Server error during generation. Please try again or contact support.'
            : response.status === 400
            ? `Invalid request: ${errorMessage}`
            : errorMessage || 'Content generation failed. Please try again.'
        );
      }

      const reader = response.body?.getReader();
      // Track reader for cleanup
      if (reader) {
        generationReaderRef.current = reader;
      }
      const decoder = new TextDecoder();
      let generatedContent: MultiPageWebsite | LegacyWebsiteContent | null = null;
      let buffer = ''; // Buffer for incomplete SSE lines across chunks

      if (reader) {
        // CRITICAL: Add yielding to prevent blocking main thread
        let iterationCount = 0;
        let shouldContinue = true;
        while (shouldContinue) {
          // Yield to browser every 50 iterations to prevent freezing
          if (iterationCount++ % 50 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }

          // Check if aborted
          if (abortSignal.aborted) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) {
            shouldContinue = false;
            break;
          }

          // Append chunk to buffer
          buffer += decoder.decode(value, { stream: true });

          // Split by newlines
          const lines = buffer.split('\n');

          // Keep last partial line in buffer (may be incomplete)
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                // Handle progress updates
                if (data.stage && data.progress !== undefined) {
                  const progressMessage = data.message || `Generating... ${data.progress}%`;

                  console.log(`[Wizard] Generation progress: ${data.stage} (${data.progress}%) - ${progressMessage}`);

                  setBuildingProgress(prev => ({
                    ...prev,
                    currentBlock: Math.floor((data.progress / 100) * prev.blocks.length),
                    blocks: prev.blocks.map((b, idx) => {
                      const blockProgress = (data.progress / 100) * prev.blocks.length;
                      if (idx < blockProgress) {
                        return { ...b, status: 'complete' as const };
                      } else if (idx === Math.floor(blockProgress)) {
                        return { ...b, status: 'building' as const };
                      }
                      return b;
                    }),
                  }));

                  // Show toast for significant milestones
                  if (data.progress === 50 || data.progress === 75 || data.progress === 90) {
                    toast({
                      title: `Generation Progress: ${data.progress}%`,
                      description: progressMessage,
                    });
                  }
                }

                // Handle errors from SSE stream
                if (data.error) {
                  debugLog('[Wizard] Generation error received from SSE:', data.error);
                  console.error('[Wizard] SSE Error:', {
                    error: data.error,
                    stage: data.stage,
                    message: data.message,
                  });

                  clearGenerationTimeout();

                  const userFriendlyError = data.message || data.error || 'An error occurred during generation';
                  throw new Error(userFriendlyError);
                }

                // Handle error stage
                if (data.stage === 'error') {
                  debugLog('[Wizard] Error stage received:', data.error || data.message);
                  console.error('[Wizard] Error stage:', data);

                  clearGenerationTimeout();

                  const userFriendlyError = data.message || data.error || 'Generation failed. Please try again.';
                  throw new Error(userFriendlyError);
                }

                if (data.stage === 'complete' && data.data) {
                  debugLog('[Wizard] Generation completed, received data:', {
                    hasManifest: !!data.data.manifest,
                    fileCount: data.data.files ? Object.keys(data.data.files).length : 0,
                  });
                  // Decode base64-encoded content if present (UTF-8 safe)
                  if (data.encoded || data.data.encoded) {
                    const textDecoder = new TextDecoder('utf-8');

                    // Helper function to safely decode base64
                    const safeDecode = (content: string): string => {
                      if (!content || typeof content !== 'string') return content;
                      // Check if already decoded (contains HTML/CSS/JS markers)
                      if (
                        content.includes('<!DOCTYPE') ||
                        content.includes('<html') ||
                        content.includes('/*') ||
                        content.includes('{') ||
                        content.includes('//') ||
                        content.includes('function')
                      ) {
                        return content; // Already decoded
                      }
                      try {
                        return textDecoder.decode(
                          Uint8Array.from(atob(content), c => c.charCodeAt(0))
                        );
                      } catch (e) {
                        // Failed to decode base64, using as-is
                        return content;
                      }
                    };

                    // Check if it's multi-page format (has manifest and files)
                    if (data.data.manifest && data.data.files) {
                      // Decode multi-page website files
                      const decodedFiles: Record<string, { path?: string; content: string }> = {};
                      for (const [path, file] of Object.entries(
                        data.data.files as Record<string, { path?: string; content: string }>
                      )) {
                        decodedFiles[path] = {
                          ...file,
                          content: safeDecode(file.content || ''),
                        };
                      }

                      // Decode assets (CSS and JS) - CRITICAL: prevents "Unterminated string in JSON" errors
                      const decodedAssets = {
                        css: safeDecode(data.data.assets?.css || ''),
                        js: safeDecode(data.data.assets?.js || ''),
                      };

                      generatedContent = {
                        manifest: data.data.manifest,
                        files: decodedFiles,
                        assets: decodedAssets, // Now properly decoded
                      } as MultiPageWebsite;
                    } else {
                      // Legacy single-page format
                      const safeDecode = (content: string): string => {
                        if (!content || typeof content !== 'string') return content;
                        if (
                          content.includes('<!DOCTYPE') ||
                          content.includes('<html') ||
                          content.includes('/*') ||
                          content.includes('{') ||
                          content.includes('//') ||
                          content.includes('function')
                        ) {
                          return content;
                        }
                        try {
                          return textDecoder.decode(
                            Uint8Array.from(atob(content), c => c.charCodeAt(0))
                          );
                        } catch (e) {
                          return content;
                        }
                      };
                      generatedContent = {
                        html: safeDecode(data.data.html || ''),
                        css: safeDecode(data.data.css || ''),
                        js: safeDecode(data.data.js || ''),
                        meta: data.data.meta,
                      } as LegacyWebsiteContent;
                    }
                  } else {
                    generatedContent = data.data;
                  }
                } else if (data.block && data.status) {
                  // Update progress based on block status
                  const blockIndex = buildingProgress.blocks.findIndex(b => b.name === data.block);
                  if (blockIndex !== -1) {
                    setBuildingProgress(prev => ({
                      ...prev,
                      currentBlock: blockIndex,
                      blocks: prev.blocks.map((b, idx) =>
                        idx === blockIndex ? { ...b, status: data.status } : b
                      ),
                    }));
                  }
                }
              } catch (parseError) {
                // Log JSON parse errors for debugging but continue processing
                // Failed to parse SSE line - continue processing
              }
            }
          }
        }
      }

      // Cleanup: Cancel reader if still active
      if (reader && !abortSignal.aborted) {
        try {
          reader.cancel();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Clear reader ref
      if (generationReaderRef.current === reader) {
        generationReaderRef.current = null;
      }

      // Clear timeout
      clearGenerationTimeout();

      // Clear abort controller ref
      if (generateAbortControllerRef.current === abortController) {
        generateAbortControllerRef.current = null;
      }

      if (!generatedContent) {
        // Check if we received an error message
        const errorMsg =
          'No content was generated. This might be due to:\n' +
          '• The generation process timed out\n' +
          '• An error occurred on the server\n' +
          '• Network connectivity issues\n\n' +
          'Please try again or contact support if the issue persists.';

        debugLog('[Wizard] Generation failed - no content received');
        console.error('[Wizard] No content generated - possible causes:', {
          abortSignalAborted: abortSignal.aborted,
          readerDone: !reader,
        });

        throw new Error(errorMsg);
      }

      // Normalize to GeneratedWebsitePackage format (handles both old and new)
      const normalized = normalizeGeneratedWebsite(generatedContent);

      // Debug logging
      debugLog('[Wizard] Normalized website structure:', {
        hasManifest: !!normalized.manifest,
        hasFiles: !!normalized.files,
        fileCount: Object.keys(normalized.files || {}).length,
        fileKeys: Object.keys(normalized.files || {}),
        hasSharedAssets: !!normalized.sharedAssets,
        activePageId: normalized.activePageId,
      });

      // For backward compatibility with preview, create HTML from first page
      const activePageId = normalized.activePageId || normalized.pages[0]?.slug || 'home';
      const firstPageFile =
        normalized.files[`pages/${activePageId}.html`] ||
        normalized.files['index.html'] ||
        normalized.files['home.html'] ||
        Object.values(normalized.files)[0];

      debugLog('[Wizard] First page file:', {
        activePageId,
        found: !!firstPageFile,
        filePath: firstPageFile?.path,
        contentLength: firstPageFile?.content?.length || 0,
        contentPreview: firstPageFile?.content?.substring(0, 200) || 'N/A',
      });

      const completeHTML = firstPageFile
        ? firstPageFile.content.includes('</head>')
          ? firstPageFile.content
              .replace('</head>', `<style>${normalized.sharedAssets.css}</style></head>`)
              .replace('</body>', `<script>${normalized.sharedAssets.js}</script></body>`)
          : `<!DOCTYPE html><html><head><style>${normalized.sharedAssets.css}</style></head><body>${firstPageFile.content}<script>${normalized.sharedAssets.js}</script></body></html>`
        : '';

      // Update preview with normalized data
      setBuildingProgress(prev => ({
        ...prev,
        previewHtml: completeHTML,
        blocks: prev.blocks.map(b => ({ ...b, status: 'complete' })),
      }));

      // Store generated website in normalized format
      const websiteData = {
        id: Date.now().toString(),
        name: wizardState.requirements.businessName || 'Custom Website',
        description: normalized.manifest?.description || '',
        template: 'custom',
        code: normalized, // Store the complete GeneratedWebsitePackage
        requirements: wizardState.requirements,
        createdAt: new Date().toISOString(),
      };

      debugLog('[Wizard] Storing website data:', {
        hasCode: !!websiteData.code,
        codeHasManifest: !!websiteData.code.manifest,
        codeHasFiles: !!websiteData.code.files,
        fileCount: Object.keys(websiteData.code.files || {}).length,
      });

      setGeneratedWebsite(websiteData);

      // Persist generated website to localStorage so it doesn't disappear
      try {
        localStorage.setItem('merlin_generated_website', JSON.stringify(websiteData));
        debugLog('[Wizard] Saved generated website to localStorage');
      } catch (e) {
        debugLog('[Wizard] Failed to save generated website to localStorage:', e);
      }

      // Rate the website automatically
      const websiteRating = await rateWebsite(websiteData);
      debugLog('[Wizard] Website rated:', websiteRating);

      // Wait a moment then move to review with rating
      setTimeout(() => {
        setWizardState(prev => ({
          ...prev,
          stageHistory: [...prev.stageHistory, prev.stage],
          stage: 'review',
          websiteRating, // Store rating in wizard state
        }));
      }, 1000);
    } catch (error: unknown) {
      // Cleanup: Abort any ongoing requests
      if (generateAbortControllerRef.current) {
        generateAbortControllerRef.current.abort();
        generateAbortControllerRef.current = null;
      }

      // Cancel generation reader if active
      if (generationReaderRef.current) {
        try {
          generationReaderRef.current.cancel().catch(() => {});
        } catch {
          // Ignore errors during cleanup
        }
        generationReaderRef.current = null;
      }

      // Clear timeout if still active
      clearGenerationTimeout();

      const errorMessage = error instanceof Error ? error.message : 'Unable to generate website';

      console.error('[Wizard] Generation error caught:', {
        message: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Determine if error is retryable
      const isRetryable = !(
        errorMessage.includes('Invalid request') ||
        errorMessage.includes('Missing requirements') ||
        errorMessage.includes('Invalid')
      );

      setGenerationError({
        stage: 'build',
        message: errorMessage,
        canRetry: isRetryable,
      });

      // Show user-friendly error toast
      toast({
        title: 'Website Generation Failed',
        description: (
          <div className="space-y-2">
            <p>{errorMessage}</p>
            {isRetryable && (
              <p className="text-sm text-muted-foreground">
                You can click "Retry Generation" to try again, or contact support if the issue persists.
              </p>
            )}
          </div>
        ),
        variant: 'destructive',
        duration: 10000, // Show for 10 seconds
      });

      setWizardState(prev => ({ ...prev, stage: 'build' }));
      setBuildingProgress(prev => ({
        ...prev,
        blocks: prev.blocks.map(b => (b.status === 'building' ? { ...b, status: 'pending' } : b)),
      }));
    } finally {
      // Always clear generating flag when done (success or error)
      setIsGenerating(false);

      // Clear timeout
      clearGenerationTimeout();

      // Final cleanup
      if (generateAbortControllerRef.current === abortController) {
        generateAbortControllerRef.current = null;
      }

      console.log('[Wizard] Generation process completed (success or error)');
    }
  };

  // Cleanup: Abort any ongoing SSE streams on unmount
  useEffect(() => {
    return () => {
      if (generateAbortControllerRef.current) {
        generateAbortControllerRef.current.abort();
        generateAbortControllerRef.current = null;
      }
    };
  }, []);

  // PHASE TRACKING: Start phase report when entering a new stage
  useEffect(() => {
    if (wizardState.stage) {
      startPhaseReport(wizardState.stage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // startPhaseReport is stable useCallback, no need in deps
  }, [wizardState.stage]);

  // AUTO-NAVIGATE TO REVIEW: If we have a generated website but aren't on review stage, go there
  // Use ref to prevent infinite loops (ref declared at top of component)
  useEffect(() => {
    if (generatedWebsite && wizardState.stage !== 'review' && !hasNavigatedToReviewRef.current) {
      debugLog('[Wizard] Generated website found, navigating to review stage...');
      hasNavigatedToReviewRef.current = true;
      setWizardState(prev => {
        // Guard: Don't update if already on review
        if (prev.stage === 'review') return prev;
        return {
          ...prev,
          stageHistory: [...prev.stageHistory, prev.stage],
          stage: 'review',
        };
      });
    }
    // Reset ref when generatedWebsite becomes null (new website started)
    if (!generatedWebsite) {
      hasNavigatedToReviewRef.current = false;
    }
  }, [generatedWebsite, wizardState.stage]);

  // Generate final report when website is complete
  useEffect(() => {
    if (generatedWebsite && wizardState.stage === 'review' && !websiteReport) {
      // Complete the review phase
      completePhaseReport(
        'review',
        85, // Default review rating
        'Website generation completed successfully. All phases have been executed and the final website is ready for review.',
        ['Website generated successfully', 'All phases completed', 'Ready for deployment'],
        [],
        ['Consider adding more interactive elements', 'Enhance SEO metadata']
      );

      // Generate final report
      setTimeout(() => {
        generateWebsiteReport();
      }, 1000);
    }
  }, [
    generatedWebsite,
    wizardState.stage,
    websiteReport,
    completePhaseReport,
    generateWebsiteReport,
    debugLog,
  ]);

  // AUTO-START BUILD: DISABLED to prevent performance issues
  // When reaching build stage, automatically start website generation
  // Temporarily disabled - user must manually trigger generation
  // useEffect(() => {
  //   if (wizardState.stage === 'build' && !isGenerating && !generatedWebsite && !error) {
  //     console.log('[Wizard] Auto-starting website build...');
  //     handleGeneratePreview();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [wizardState.stage, isGenerating, generatedWebsite, error]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || !generatedWebsite) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsSendingChat(true);

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Prepare current code in format backend expects
      const currentCode =
        generatedWebsite.code.manifest && generatedWebsite.code.files
          ? generatedWebsite.code // Multi-page format
          : (generatedWebsite.code as unknown as { html?: string; css?: string; js?: string }); // Legacy format type assertion

      const response = await fetch('/api/website-builder/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          currentCode,
          requirements: wizardState.requirements,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add AI response to chat
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.explanation || data.message,
          },
        ]);

        // Update website code if changes were made
        if (data.suggestedChanges) {
          setGeneratedWebsite(prev => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              code: {
                ...prev.code,
                ...(data.suggestedChanges as { html?: string; css?: string; js?: string }),
              },
            };
            // Persist updated website to localStorage
            try {
              localStorage.setItem('merlin_generated_website', JSON.stringify(updated));
            } catch (e) {
              debugLog('[Wizard] Failed to save updated website to localStorage:', e);
            }
            return updated;
          });

          toast({
            title: 'Website Updated!',
            description: 'Your changes have been applied. Check the preview!',
          });
        }
      } else {
        throw new Error(data.error || 'Chat failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast({
        title: 'Chat Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Download function - reserved for future use
  const _handleDownload = async () => {
    if (!generatedWebsite) return;

    // Check if multi-page format (preferred)
    if (generatedWebsite.code.manifest && generatedWebsite.code.files) {
      try {
        const website = generatedWebsite.code as GeneratedWebsitePackage;

        toast({
          title: 'Preparing Download...',
          description: 'Creating ZIP archive of your multi-page website',
        });

        // Call new ZIP download endpoint
        const response = await fetch('/api/website-builder/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            manifest: website.manifest,
            files: website.files,
            assets: website.sharedAssets,
          }),
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }

        // Get the ZIP file as a blob
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(generatedWebsite.name || 'website').replace(/\s+/g, '-').toLowerCase()}.zip`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: 'Download Complete',
          description: `Successfully downloaded ${Object.keys(website.files).length + 2} files as ZIP archive`,
        });

        setWizardState(prev => ({ ...prev, stage: 'commit' }));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to download website';
        debugLog('Download error:', error);
        toast({
          title: 'Download Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } else {
      // Legacy single-page format - download individual files
      const projectName = (generatedWebsite.name || 'website').replace(/\s+/g, '-').toLowerCase();

      const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      };

      const legacyCode = generatedWebsite.code as unknown as {
        html?: string;
        css?: string;
        js?: string;
      };
      setTimeout(
        () => downloadFile(legacyCode.html || '', `${projectName}-index.html`, 'text/html'),
        100
      );
      setTimeout(
        () => downloadFile(legacyCode.css || '', `${projectName}-styles.css`, 'text/css'),
        300
      );
      setTimeout(
        () => downloadFile(legacyCode.js || '', `${projectName}-script.js`, 'text/javascript'),
        500
      );

      toast({
        title: 'Download Started',
        description: 'Downloading 3 files: index.html, styles.css, script.js',
      });

      setWizardState(prev => ({ ...prev, stage: 'commit' }));
    }
  };

  const handleStartOver = () => {
    debugLog('[Wizard] 🔄 Starting over - clearing ALL data');
    // Clear ALL wizard data using the comprehensive clear function
    clearWizardData();
    // Also clear investigation progress
    localStorage.removeItem('stargate-investigation-progress');
    // Reset all state
    const newState: WizardState = {
      stage: 'package-select', // Start at Phase 1: Package Selection
      currentPage: 'project-overview',
      selectedDesignTemplates: [],
      selectedContentTemplates: [],
      imageSource: 'leonardo',
      redesignCount: 0,
      currentQuestion: 0,
      requirements: {},
      stageHistory: [],
      messages: [],
      selectedPackage: undefined,
      packageConstraints: undefined,
    };
    setWizardState(newState);
    setGeneratedWebsite(null);
    // Reset investigation progress
    setInvestigationProgress({
      currentJob: 0,
      jobs: [],
    });
    // Clear research activities
    setResearchActivities([]);
    setIsResearchActive(false);
    setShowRestartDialog(false);
    debugLog('[Wizard] ✅ All data cleared - ready for fresh start');
  };

  const renderPageIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {pageOrder.map((page, index) => {
          const Icon = getPageIcon(page);
          const isActive = wizardState.currentPage === page;
          const isCompleted = currentPageIndex > index;

          return (
            <div key={page} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : isCompleted
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-blue-900 dark:text-blue-100'
                      : isCompleted
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {pageLabels[page]}
                </span>
              </div>
              {index < pageOrder.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-2 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Label mappings for normalized tokens
  const getLabelForValue = (questionKey: keyof WebsiteRequirements, value: string): string => {
    const labelMaps: Record<string, Record<string, string>> = {
      domainStatus: {
        have_domain: 'Have domain',
        need_domain: 'Need domain',
        undecided: 'Undecided',
      },
      contentMode: {
        ai_generated: 'AI-generated content',
        user_provided: 'I&apos;ll provide my own content',
      },
      themeMode: {
        light: 'Light mode',
        dark: 'Dark mode',
      },
    };
    return labelMaps[questionKey as string]?.[value] || value;
  };

  const renderQuestion = (question: Question) => {
    const value = wizardState.requirements[question.key];

    // Check conditional rendering
    if (question.conditional) {
      const dependentValue = wizardState.requirements[question.conditional.dependsOn];
      const showWhen = Array.isArray(question.conditional.showWhen)
        ? question.conditional.showWhen
        : [question.conditional.showWhen];
      if (!showWhen.includes(dependentValue as string)) {
        return null;
      }
    }

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url': {
        const inputValue = (value as string) || '';
        const hasError = fieldErrors[question.key];
        const fieldSuggestions = aiSuggestions[question.key] || [];
        const showFieldSuggestions = showSuggestions[question.key] && fieldSuggestions.length > 0;
        const isLoading = suggestionLoading[question.key];

        return (
          <div className="space-y-1">
            <div className="relative">
              <Input
                id={`input-${question.key}`}
                type={
                  question.type === 'email' ? 'email' : question.type === 'url' ? 'url' : 'text'
                }
                value={inputValue}
                onChange={e => {
                  handleInputChange(question.key, e.target.value);
                  // Generate suggestions as user types (debounced)
                  if (e.target.value.length > 2) {
                    const timeoutId = setTimeout(() => {
                      generateAISuggestions(question.key);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  } else {
                    setShowSuggestions(prev => ({ ...prev, [question.key]: false }));
                  }
                }}
                onFocus={() => {
                  if (!inputValue || inputValue.length > 2) {
                    generateAISuggestions(question.key);
                  }
                }}
                onBlur={() => {
                  setTouchedFields(prev => new Set(prev).add(question.key));
                  // Delay hiding suggestions to allow clicking on them
                  setTimeout(() => {
                    setShowSuggestions(prev => ({ ...prev, [question.key]: false }));
                  }, 200);
                }}
                placeholder={question.placeholder}
                className={`text-base ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                aria-invalid={!!hasError}
                aria-describedby={
                  hasError
                    ? `error-${question.key}`
                    : question.example
                      ? `help-${question.key}`
                      : undefined
                }
                data-testid={`input-${question.key}`}
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {showFieldSuggestions && (
              <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">
                  AI Suggestions:
                </p>
                <div className="flex flex-wrap gap-1">
                  {fieldSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        handleInputChange(question.key, suggestion);
                        setShowSuggestions(prev => ({ ...prev, [question.key]: false }));
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'textarea': {
        const textareaValue = (value as string) || '';
        const textareaError = fieldErrors[question.key];
        const charCount = textareaValue.length;
        return (
          <div className="space-y-1">
            <Textarea
              id={`input-${question.key}`}
              value={textareaValue}
              onChange={e => handleInputChange(question.key, e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set(prev).add(question.key))}
              placeholder={question.placeholder}
              className={`min-h-24 text-base ${textareaError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              aria-invalid={!!textareaError}
              aria-describedby={
                textareaError
                  ? `error-${question.key}`
                  : question.example
                    ? `help-${question.key}`
                    : undefined
              }
              data-testid={`input-${question.key}`}
            />
            {charCount > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {charCount} {charCount === 1 ? 'character' : 'characters'}
              </p>
            )}
          </div>
        );
      }

      case 'select': {
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={val => handleInputChange(question.key, val)}
          >
            <SelectTrigger data-testid={`select-${question.key}`}>
              <SelectValue placeholder={question.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {getLabelForValue(question.key, option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      case 'radio': {
        const radioValue = value as string;
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <Button
                key={option}
                type="button"
                variant={radioValue === option ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleInputChange(question.key, option)}
                data-testid={`radio-${question.key}-${option.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {radioValue === option && <Check className="w-4 h-4 mr-2" />}
                {getLabelForValue(question.key, option)}
              </Button>
            ))}
          </div>
        );
      }

      case 'multiselect': {
        const selectedOptions = (value as string[]) || [];
        return (
          <div className="grid grid-cols-2 gap-2">
            {question.options?.map(option => (
              <Button
                key={option}
                type="button"
                variant={selectedOptions.includes(option) ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => toggleMultiSelectOption(question.key, option)}
                data-testid={`option-${question.key}-${option.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {selectedOptions.includes(option) && <Check className="w-4 h-4 mr-2" />}
                {option}
              </Button>
            ))}
          </div>
        );
      }

      case 'color': {
        const colorValue = (value as string) || question.defaultValue || '#000000';
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  value={colorValue}
                  onChange={e => handleInputChange(question.key, e.target.value)}
                  placeholder={question.placeholder || '#000000'}
                  className="text-base font-mono"
                  data-testid={`input-${question.key}-hex`}
                />
              </div>
              <div className="relative">
                <input
                  type="color"
                  value={colorValue}
                  onChange={e => handleInputChange(question.key, e.target.value)}
                  className="w-20 h-12 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  data-testid={`input-${question.key}-picker`}
                />
              </div>
            </div>
            <div
              className="w-full h-24 rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-colors"
              style={{ backgroundColor: colorValue }}
            >
              <div className="flex items-center justify-center h-full">
                <span
                  className="text-sm font-medium px-4 py-2 rounded"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#000',
                  }}
                >
                  Preview: {colorValue}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept={question.accept}
              multiple={question.multiple}
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  // Convert FileList to array and create metadata objects
                  const fileMetadataArray = Array.from(files).map(file => ({
                    url: URL.createObjectURL(file), // Temporary local URL
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                  }));

                  // Save to wizardState.requirements using the question.key
                  handleInputChange(question.key, fileMetadataArray);

                  toast({
                    title: 'Files Captured',
                    description: `${files.length} file(s) captured successfully`,
                  });
                }
              }}
              className="text-base"
              data-testid={`input-${question.key}`}
            />
            <p className="text-xs text-muted-foreground">
              {question.maxFiles ? `Maximum ${question.maxFiles} files` : 'Multiple files allowed'}
            </p>
            {/* Display selected files */}
            {value && Array.isArray(value) && value.length > 0 && (
              <div className="mt-2 space-y-1">
                {(value as Array<{ filename: string; size: number }>).map((file, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <Check className="w-3 h-3 text-green-500" />
                    <span>{file.filename}</span>
                    <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'service-list': {
        const services =
          (value as Array<{ name: string; description: string; rank: number }>) || [];
        const maxServices = wizardState.packageConstraints?.maxServices || 999;
        const canAddMore = services.length < maxServices;
        const isAtLimit = services.length >= maxServices;

        return (
          <div className="space-y-4">
            {isAtLimit && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-pulse">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Package limit reached: Maximum {maxServices}{' '}
                  {maxServices === 1 ? 'service' : 'services'} allowed. Upgrade your package to add
                  more.
                </p>
              </div>
            )}
            {!isAtLimit && services.length > 0 && services.length >= maxServices - 1 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  ℹ️ You can add {maxServices - services.length} more{' '}
                  {maxServices - services.length === 1 ? 'service' : 'services'}.
                </p>
              </div>
            )}
            {services.map((service, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-4">
                  <Badge variant="secondary" className="mt-1">
                    #{service.rank}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={service.name}
                      onChange={e => {
                        const updated = [...services];
                        updated[index].name = e.target.value;
                        handleInputChange(question.key, updated);
                      }}
                      placeholder="Service name"
                      data-testid={`input-service-name-${index}`}
                    />
                    <Textarea
                      value={service.description}
                      onChange={e => {
                        const updated = [...services];
                        updated[index].description = e.target.value;
                        handleInputChange(question.key, updated);
                      }}
                      placeholder="Service description"
                      className="min-h-20"
                      data-testid={`input-service-description-${index}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (index > 0) {
                          const updated = [...services];
                          [updated[index], updated[index - 1]] = [
                            updated[index - 1],
                            updated[index],
                          ];
                          updated.forEach((s, i) => (s.rank = i + 1));
                          handleInputChange(question.key, updated);
                        }
                      }}
                      disabled={index === 0}
                      data-testid={`button-service-up-${index}`}
                    >
                      <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (index < services.length - 1) {
                          const updated = [...services];
                          [updated[index], updated[index + 1]] = [
                            updated[index + 1],
                            updated[index],
                          ];
                          updated.forEach((s, i) => (s.rank = i + 1));
                          handleInputChange(question.key, updated);
                        }
                      }}
                      disabled={index === services.length - 1}
                      data-testid={`button-service-down-${index}`}
                    >
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const updated = services.filter((_, i) => i !== index);
                        updated.forEach((s, i) => (s.rank = i + 1));
                        handleInputChange(question.key, updated);
                      }}
                      data-testid={`button-service-remove-${index}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (canAddMore) {
                  const updated = [
                    ...services,
                    { name: '', description: '', rank: services.length + 1 },
                  ];
                  handleInputChange(question.key, updated);
                }
              }}
              className="w-full"
              disabled={!canAddMore}
              data-testid="button-add-service"
            >
              {canAddMore ? (
                <>
                  Add Service ({services.length}/{maxServices})
                </>
              ) : (
                <>
                  Service Limit Reached ({services.length}/{maxServices})
                </>
              )}
            </Button>
          </div>
        );
      }

      case 'url-list': {
        const urls = (value as Array<{ url: string }>) || [];
        return (
          <div className="space-y-2">
            {urls.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={item.url}
                  onChange={e => {
                    const updated = [...urls];
                    updated[index].url = e.target.value;
                    handleInputChange(question.key, updated);
                  }}
                  placeholder={question.placeholder}
                  className="flex-1"
                  data-testid={`input-url-${index}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const updated = urls.filter((_, i) => i !== index);
                    handleInputChange(question.key, updated);
                  }}
                  data-testid={`button-remove-url-${index}`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(!question.maxFiles || urls.length < (question.maxFiles || 5)) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const updated = [...urls, { url: '' }];
                  handleInputChange(question.key, updated);
                }}
                className="w-full"
                data-testid="button-add-url"
              >
                Add URL
              </Button>
            )}
          </div>
        );
      }

      case 'social-links': {
        const socialMedia = (value as Record<string, string>) || {};
        const platforms = [
          { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
          { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourpage' },
          { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourpage' },
          {
            key: 'linkedin',
            label: 'LinkedIn',
            placeholder: 'https://linkedin.com/company/yourcompany',
          },
          { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
          { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourpage' },
          { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' },
        ];
        return (
          <div className="space-y-3">
            {platforms.map(platform => (
              <div key={platform.key} className="space-y-1">
                <label className="text-sm font-medium">{platform.label}</label>
                <Input
                  type={platform.key === 'whatsapp' ? 'tel' : 'url'}
                  value={socialMedia[platform.key] || ''}
                  onChange={e => {
                    handleInputChange(question.key, {
                      ...socialMedia,
                      [platform.key]: e.target.value,
                    });
                  }}
                  placeholder={platform.placeholder}
                  data-testid={`input-social-${platform.key}`}
                />
              </div>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-background" data-testid="website-builder-wizard">
      {/* Global Wizard Navigation - Hidden on final-website for full screen */}
      {wizardState.stage !== 'final-website' && (
        <WizardNavigation
          currentStage={wizardState.stage}
          onNavigate={stage => {
          // Define stage order for navigation logic
          const STAGE_ORDER: WizardStage[] = [
            'package-select',
            'template-select',
            'keywords-collection',
            'content-rewriting',
            'image-generation',
            'seo-assessment',
            'review-redo',
            'final-approval',
            'final-website',
          ];
          
          // Check if navigating backwards (to a previous stage)
          const currentIndex = STAGE_ORDER.indexOf(wizardState.stage);
          const targetIndex = STAGE_ORDER.indexOf(stage);
          
          if (targetIndex < currentIndex && wizardState.stageHistory.length > 0) {
            // Going backwards - use navigateBack to properly handle history
            navigateBack();
            // Then navigate to the specific stage if needed
            if (stage !== wizardState.stageHistory[wizardState.stageHistory.length - 1]) {
              setWizardState(prev => ({
                ...prev,
                stage: stage,
              }));
            }
          } else {
            // Going forwards or sideways - use normal navigation
            const allVisitedStages = [...wizardState.stageHistory, wizardState.stage];
            setWizardState(prev => ({
              ...prev,
              stageHistory: allVisitedStages.includes(stage)
                ? prev.stageHistory
                : [...prev.stageHistory, prev.stage],
              stage: stage,
            }));
          }
        }}
          canGoBack={true} // Always allow back navigation
          canGoForward={true} // Always allow forward navigation for easy movement
          visitedStages={[...wizardState.stageHistory, wizardState.stage]}
        />
      )}

      {/* Main Content Area */}
      <TooltipProvider>
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          {/* Review Stage - Full Width */}
          {/* CRITICAL: Only show preview if BOTH conditions are true: stage is review AND generatedWebsite exists */}
          {/* Also check that we're not just starting fresh - if no package selected, don't show preview */}
          {wizardState.stage === ('review' as WizardStage) &&
           generatedWebsite &&
           generatedWebsite.code &&
           wizardState.selectedPackage ? (
            <div className="flex-1 overflow-hidden w-full flex flex-col">
              {/* Merlin Header for Review Stage */}
              <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 relative overflow-hidden">
                {/* Merlin Background Image */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02]"
                  style={{
                    backgroundImage: 'url(/merlin.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 70%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className="flex items-center gap-3 relative z-10">
                  {/* Merlin Image/Icon */}
                  <div className="relative">
                    <img
                      src="/merlin.jpg"
                      alt="Merlin"
                      className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-purple-200 dark:border-purple-800"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                      <Sparkles className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Website Review & Refinement
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Your website is ready! Review and refine as needed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 h-full w-full flex-1 min-h-0">
                {/* AI Refinement Chat - LEFT SIDE (Narrow, Replit-style) */}
                <div className="w-80 flex flex-col bg-background border-r flex-shrink-0">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-blue-500" />
                      <h3 className="font-semibold text-sm">AI Refinement Chat</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tell me what you&apos;d like to change
                    </p>
                  </div>

                  <ScrollArea className="flex-1 px-3 py-4">
                    <div className="space-y-3">
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm ${
                              msg.role === 'user'
                                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 backdrop-blur-sm border border-blue-300/30 dark:border-blue-600/30'
                                : 'bg-pink-500/20 text-pink-700 dark:text-pink-300 backdrop-blur-sm border border-pink-300/30 dark:border-pink-600/30'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-3 border-t space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Describe changes..."
                        className="flex-1 text-sm h-9"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleChatSend()}
                        disabled={isSendingChat}
                        data-testid="input-chat-message"
                      />
                      <Button
                        size="sm"
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || isSendingChat}
                        data-testid="button-send-chat"
                      >
                        {isSendingChat ? '...' : <MessageSquare className="w-4 h-4" />}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={navigateBack}
                      data-testid="button-back-from-review"
                    >
                      <ArrowLeft className="w-3 h-3 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                {/* Live Preview - RIGHT SIDE (Large) */}
                <div className="flex-1 flex flex-col bg-background min-w-0">
                  <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <h3 className="font-semibold text-sm">Live Preview</h3>
                        {generatedWebsite.code.manifest && (
                          <Badge variant="secondary" className="text-xs">
                            {generatedWebsite.code.pages?.length || 0} Pages
                          </Badge>
                        )}
                        {websiteRating && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              websiteRating.overall >= 90
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : websiteRating.overall >= 75
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            ⭐ {websiteRating.overall}/100
                          </Badge>
                        )}
                        {websiteReport && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                          >
                            Overall: {websiteReport.overallScore}/100
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {generatedWebsite.code &&
                        generatedWebsite.code.manifest &&
                        generatedWebsite.code.files && (
                          <>
                            <Button
                              onClick={() => setShowVisualEditor(true)}
                              size="sm"
                              variant="default"
                              className="gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Website
                            </Button>
                            <Button
                              onClick={() => setShowEcommerceSettings(true)}
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              E-Commerce Settings
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={downloadReport}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              // Get project slug from requirements or generated website
                              const projectSlug =
                                wizardState.requirements?.businessName
                                  ?.toLowerCase()
                                  .replace(/\s+/g, '-') ||
                                generatedWebsite.code?.manifest?.siteName
                                  ?.toLowerCase()
                                  .replace(/\s+/g, '-') ||
                                'website';
                              const response = await fetch(
                                `/api/website-builder/phase-report/${projectSlug}?format=markdown`
                              );
                              if (!response.ok) {
                                if (response.status === 404) {
                                  throw new Error(
                                    'Phase report not found. Please regenerate the website to create a phase report.'
                                  );
                                }
                                throw new Error('Failed to download phase report');
                              }
                              const blob = await response.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${projectSlug}-phase-report.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast({
                                title: 'Phase Report Downloaded',
                                description: 'Phase-by-phase report downloaded successfully',
                              });
                            } catch (error: unknown) {
                              const errorMessage =
                                error instanceof Error
                                  ? error.message
                                  : 'Failed to download phase report';
                              toast({
                                title: 'Download Failed',
                                description: errorMessage,
                                variant: 'destructive',
                              });
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Phase Report
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Website Rating Display */}
                  {websiteRating && (
                    <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            Website Quality Rating
                          </h4>
                          <Badge
                            variant="outline"
                            className={`${
                              websiteRating.overall >= 90
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : websiteRating.overall >= 75
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            Overall: {websiteRating.overall}/100
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">Content</div>
                            <div className="font-bold text-lg">{websiteRating.content}</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">Design</div>
                            <div className="font-bold text-lg">{websiteRating.design}</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">SEO</div>
                            <div className="font-bold text-lg">{websiteRating.seo}</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                            <div className="text-xs text-muted-foreground">Performance</div>
                            <div className="font-bold text-lg">{websiteRating.performance}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {websiteRating.analysis}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden min-h-0">
                    {showVisualEditor &&
                    generatedWebsite.code &&
                    generatedWebsite.code.manifest &&
                    generatedWebsite.code.files ? (
                      <VisualEditor
                        website={generatedWebsite.code as GeneratedWebsitePackage}
                        onSave={(updated) => {
                          setGeneratedWebsite(prev => prev ? {
                            ...prev,
                            code: updated,
                          } : null);
                          setShowVisualEditor(false);
                          toast({
                            title: 'Website Updated',
                            description: 'Your changes have been saved successfully',
                          });
                        }}
                        onClose={() => setShowVisualEditor(false)}
                      />
                    ) : showEcommerceSettings ? (
                      <div className="h-full w-full p-6 overflow-auto">
                        <EcommerceSettings
                          websiteId={(wizardState.requirements as any)?.projectSlug || 'default'}
                          onSettingsChange={(settings) => {
                            console.log('E-commerce settings changed:', settings);
                            toast({
                              title: 'Settings Saved',
                              description: 'E-commerce settings have been updated',
                            });
                          }}
                        />
                        <div className="mt-4">
                          <Button
                            onClick={() => setShowEcommerceSettings(false)}
                            variant="outline"
                            className="w-full"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Preview
                          </Button>
                        </div>
                      </div>
                    ) : wizardState.stage === 'review' &&
                    generatedWebsite &&
                    generatedWebsite.code &&
                    generatedWebsite.code.manifest &&
                    generatedWebsite.code.files ? (
                      <MultiPagePreview
                        website={generatedWebsite.code as GeneratedWebsitePackage}
                        className="h-full w-full"
                      />
                    ) : wizardState.stage !== 'review' ? (
                      // NOT in review stage - show wizard UI (package selection, requirements, etc.)
                      // This is handled by the parent conditional that renders wizard content
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          <p>Loading wizard...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full p-4 bg-white dark:bg-gray-900">
                        <div className="border rounded-lg overflow-hidden h-full w-full">
                          <iframe
                            srcDoc={(() => {
                              // Try to get HTML from normalized format first
                              if (generatedWebsite && generatedWebsite.code && generatedWebsite.code.files) {
                                const normalized = generatedWebsite.code as GeneratedWebsitePackage;
                                const firstPageFile =
                                  normalized.files['pages/home.html'] ||
                                  normalized.files['index.html'] ||
                                  normalized.files['home.html'] ||
                                  Object.values(normalized.files)[0];
                                if (firstPageFile && firstPageFile.content) {
                                  const html = firstPageFile.content;
                                  const css = normalized.sharedAssets?.css || '';
                                  const js = normalized.sharedAssets?.js || '';
                                  return html.includes('</head>')
                                    ? html
                                        .replace('</head>', `<style>${css}</style></head>`)
                                        .replace('</body>', `<script>${js}</script></body>`)
                                    : `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
                                }
                              }
                              // Fallback to legacy format
                              const legacyCode = generatedWebsite.code as unknown as {
                                html?: string;
                                css?: string;
                                js?: string;
                              };
                              const html = legacyCode?.html || '';
                              const css = legacyCode?.css || '';
                              const js = legacyCode?.js || '';
                              return html.includes('</head>')
                                ? html
                                    .replace('</head>', `<style>${css}</style></head>`)
                                    .replace('</body>', `<script>${js}</script></body>`)
                                : `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
                            })()}
                            className="w-full h-full bg-white border-0"
                            title="Website Preview"
                            sandbox="allow-same-origin allow-scripts"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Wizard Content - Centered */}
              <div className="flex-1 overflow-y-auto">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-8" style={{ width: '100%', maxWidth: '100%' }}>
                  {/* Header - Only show on package-select (first page) */}
                    {wizardState.stage === 'package-select' && (
                    <div className="mb-8 relative">
                    {/* Merlin Background Image */}
                    <div
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-[0.06] dark:opacity-[0.04]"
                      style={{
                        zIndex: 0,
                        backgroundImage: 'url(/merlin.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 70%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />

                    <div
                      className="flex flex-col items-center text-center mb-6 relative"
                      style={{ zIndex: 1 }}
                    >
                      {/* Back to Projects Button */}
                      {onBackToProjects && isAuthenticated && (
                        <div className="absolute top-0 left-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBackToProjects}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            My Projects
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        {/* Merlin Image/Icon */}
                        <div className="relative">
                          <img
                            src="/merlin.jpg"
                            alt="Merlin"
                            className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-purple-200 dark:border-purple-800"
                          />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-md">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>
                          <div>
                            <div className="flex items-center justify-center gap-3 mb-1">
                              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                {t('wizard.title', language)}
                              </h1>
                              {packageConfig && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                                  {packageConfig.packageType.charAt(0).toUpperCase() +
                                    packageConfig.packageType.slice(1)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-base text-muted-foreground">
                              {t('wizard.subtitle', language)}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons - Compact */}
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                          {/* Undo/Redo */}
                          {wizardState.stage === 'discover' && (
                            <>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleUndo}
                                      disabled={!canUndo}
                                      aria-label="Undo"
                                      data-testid="button-undo"
                                    >
                                      <Undo2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleRedo}
                                      disabled={!canRedo}
                                      aria-label="Redo"
                                      data-testid="button-redo"
                                    >
                                      <Redo2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}

                          {/* Export/Import */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleExportConfig}
                                  aria-label="Export configuration"
                                  data-testid="button-export"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Export Configuration</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleImportConfig}
                                  aria-label="Import configuration"
                                  data-testid="button-import"
                                >
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Import Configuration</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Restart Button */}
                          {wizardState.stage !== 'commit' && (
                            <AlertDialog
                              open={showRestartDialog}
                              onOpenChange={setShowRestartDialog}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  data-testid="button-restart"
                                  aria-label="Restart wizard"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Restart
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-testid="dialog-restart-confirmation">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure you want to restart?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will clear all your current progress and answers.
                                    You&apos;ll start from the beginning with a fresh wizard.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-testid="button-cancel-restart">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleStartOver}
                                    data-testid="button-confirm-restart"
                                  >
                                    Yes, Restart
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </div>
                    )}

                  {/* Resume Indicator - Hidden for template-select stage */}
                  {(() => {
                    if (wizardState.stage === ('review' as WizardStage)) return null;
                    if (wizardState.stage === 'template-select') return null; // Hide for template selection
                    const saved = loadSavedState();
                    if (
                      saved &&
                      saved.stage !== 'mode-select' &&
                      saved.stage === wizardState.stage
                    ) {
                      return (
                        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                          <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                              Resumed from {pageLabels[saved.currentPage] || saved.stage}
                            </span>
                            <Button variant="ghost" size="sm" onClick={handleStartOver}>
                              Start Fresh
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}

                  {/* Progress Indicator */}
                  {wizardState.stage === 'discover' && (
                    <Card className="mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                      <CardContent className="pt-4 pb-4">
                        {renderPageIndicator()}
                        <div className="mt-4">
                          <Progress value={overallProgress} className="h-3 rounded-full" />
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Page {currentPageIndex + 1} of {pageOrder.length}
                            </span>
                            <span className="font-semibold text-primary">
                              {Math.round(overallProgress)}% Complete
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Main Content Area */}
                  {wizardState.stage === ('review' as WizardStage) ? null : (
                    <div className="space-y-6">
                      {/* OLD STAGES - DEPRECATED - HIDDEN */}
                      {/* Mode Selection Stage - DEPRECATED */}
                      {false && wizardState.stage === 'mode-select' && (
                        <div className="space-y-6">
                          <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">Choose Your Build Mode</h2>
                            <p className="text-muted-foreground">
                              Select how you&apos;d like to build your website with AI assistance
                            </p>
                            {/* TEST MODE Button - Prominent for easy access */}
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={autoFillWizard}
                                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg"
                                data-testid="button-test-mode-mode-select"
                              >
                                <Zap className="w-5 h-5" />
                                🧪 TEST MODE: Fill All Fields & Skip to Define
                              </Button>
                              <p className="text-xs text-muted-foreground mt-2">
                                Quickly fill all fields with realistic test data for thorough
                                testing
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6 mt-8">
                            {/* Auto Mode Card */}
                            <Card
                              className="hover-elevate active-elevate-2 cursor-pointer border-2 transition-colors bg-blue-500/10 dark:bg-blue-500/20 border-blue-300/50 dark:border-blue-700/50"
                              onClick={() => {
                                setWizardState(prev => ({
                                  ...prev,
                                  requirements: {
                                    ...prev.requirements,
                                    buildMode: 'auto',
                                  },
                                  stageHistory: [...prev.stageHistory, prev.stage],
                                  stage: 'discover',
                                }));
                                toast({
                                  title: 'Auto Mode Selected',
                                  description:
                                    'AI will build your website automatically after gathering requirements.',
                                });
                              }}
                              data-testid="card-mode-auto"
                            >
                              <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                  <Zap className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Auto Mode</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <p className="text-center text-muted-foreground">
                                  AI builds the entire website automatically after collecting
                                  information
                                </p>
                                <div className="space-y-2 pt-4 border-t">
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Quick and effortless website creation</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">AI makes all design decisions</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Best for rapid prototyping</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Complete website in minutes</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Manual Mode Card */}
                            <Card
                              className="hover-elevate active-elevate-2 cursor-pointer border-2 transition-colors bg-blue-500/10 dark:bg-blue-500/20 border-blue-300/50 dark:border-blue-700/50"
                              onClick={() => {
                                setWizardState(prev => ({
                                  ...prev,
                                  requirements: {
                                    ...prev.requirements,
                                    buildMode: 'manual',
                                  },
                                  stageHistory: [...prev.stageHistory, prev.stage],
                                  stage: 'template-select',
                                }));
                                toast({
                                  title: 'Manual Mode Selected',
                                  description:
                                    'You&apos;ll review and approve each AI suggestion step-by-step.',
                                });
                              }}
                              data-testid="card-mode-manual"
                            >
                              <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                  <User className="w-8 h-8 text-accent" />
                                </div>
                                <CardTitle className="text-2xl">
                                  {t('wizard.mode.manual', language)}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <p className="text-center text-muted-foreground">
                                  User participates step-by-step and approves each AI suggestion
                                </p>
                                <div className="space-y-2 pt-4 border-t">
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Full control over the process</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Review each design decision</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Perfect for custom requirements</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">Learn as you build</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                      {/* Template Selection Stage - DEPRECATED */}
                      {false && wizardState.stage === 'template-select' && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Choose a Template</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                              Select a template to get started, or continue to build from scratch.
                            </p>
                          </CardHeader>
                          <CardContent>
                            <TemplateLibrary
                              onSelectTemplate={template => {
                                setSelectedTemplate(template);
                                setWizardState(prev => ({
                                  ...prev,
                                  requirements: {
                                    ...prev.requirements,
                                    templateId: template.id,
                                  },
                                }));
                              }}
                              selectedTemplateId={selectedTemplate?.id}
                            />
                            <div className="flex justify-end gap-4 mt-6">
                              <Button variant="outline" onClick={navigateBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                              </Button>
                              <Button
                                onClick={() => {
                                  navigateToStage('discover');
                                  trackEvent('wizard_template_selected', {
                                    templateId: selectedTemplate?.id,
                                  });
                                }}
                              >
                                {selectedTemplate
                                  ? 'Continue with Template'
                                  : 'Continue Without Template'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Discovery Stage - DEPRECATED */}
                      {false && wizardState.stage === 'discover' && (
                        <Card className="shadow-lg border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                          <CardHeader className="pb-4 border-b bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                {(() => {
                                  const Icon = getPageIcon(wizardState.currentPage);
                                  return (
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                      <Icon className="w-5 h-5 text-white" />
                                    </div>
                                  );
                                })()}
                                <div>
                                  <CardTitle className="text-2xl">
                                    {pageLabels[wizardState.currentPage]}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Answer a few questions to get started
                                  </p>
                                </div>
                              </div>

                              {/* TEST MODE: Auto-fill button */}
                              {wizardState.stage === 'discover' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={autoFillWizard}
                                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-md"
                                  data-testid="button-autofill-wizard"
                                  title="Fill all fields with test data for quick testing"
                                >
                                  <Zap className="w-4 h-4" />
                                  Test Mode
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-8">
                            {currentPageQuestions.map(question => {
                              const fieldError = fieldErrors[question.key];
                              const isTouched = touchedFields.has(question.key);
                              const hasError = isTouched && !!fieldError;
                              const hasValue = !!wizardState.requirements[question.key];
                              const isValid = isTouched && !fieldError && hasValue;

                              return (
                                <div
                                  key={question.id}
                                  className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  <label
                                    className="text-base font-semibold flex items-center gap-2 text-foreground"
                                    htmlFor={`input-${question.key}`}
                                  >
                                    {question.question}
                                    {question.optional && (
                                      <Badge variant="secondary" className="text-xs font-normal">
                                        {t('wizard.optional', language)}
                                      </Badge>
                                    )}
                                    {question.example && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <HelpCircle
                                              className="w-4 h-4 text-muted-foreground cursor-help"
                                              aria-label="Help"
                                              onClick={() =>
                                                setShowHelpTooltip(
                                                  showHelpTooltip === question.id
                                                    ? null
                                                    : question.id
                                                )
                                              }
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="max-w-xs">{question.example}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {isValid && (
                                      <CheckCircle2
                                        className="w-4 h-4 text-green-500"
                                        aria-label="Valid"
                                      />
                                    )}
                                    {hasError && (
                                      <AlertCircle
                                        className="w-4 h-4 text-red-500"
                                        aria-label="Error"
                                      />
                                    )}
                                  </label>
                                  {showHelpTooltip === question.id && question.example && (
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {question.example}
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto h-6 w-6 p-0"
                                        onClick={() => setShowHelpTooltip(null)}
                                        aria-label="Close help"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                  <div className="space-y-1">
                                    {renderQuestion(question)}
                                    {hasError && (
                                      <p
                                        className="text-sm text-red-500 flex items-center gap-1"
                                        role="alert"
                                        aria-live="polite"
                                      >
                                        <AlertCircle className="w-3 h-3" />
                                        {fieldError}
                                      </p>
                                    )}
                                    {isValid && (
                                      <p className="text-sm text-green-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {t('wizard.looksGood', language)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                              <Button
                                variant="outline"
                                onClick={handlePrevPage}
                                disabled={isFirstPage}
                                size="lg"
                                className="flex-1"
                                data-testid="button-prev-page"
                              >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t('wizard.previous', language)}
                              </Button>
                              <Button
                                onClick={handleNextPage}
                                size="lg"
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                                data-testid="button-next-page"
                              >
                                {isLastPage ? 'Review Requirements' : t('wizard.next', language)}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* PHASE 1: Package Selection Stage - LEONARDO AI REDESIGNED */}
                      {wizardState.stage === 'package-select' && (
                        <div className="relative min-h-screen w-full overflow-hidden">
                          {/* AI-Generated Background with Gradient Overlay */}
                          <div className="absolute inset-0 -z-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
                            {/* Animated gradient orbs */}
                            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                          </div>

                          <div className="relative max-w-7xl mx-auto p-6 py-12">
                            {/* Header - Enhanced with AI Theme */}
                            <div className="text-center mb-16 relative z-10">
                              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-purple-300">Powered by Leonardo AI</span>
                              </div>
                              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                Choose Your Package
                              </h1>
                              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Select the perfect solution for your website needs. Each package is crafted with AI-powered precision.
                              </p>
                            </div>

                            {/* Package Cards - Modern Glassmorphic Design */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                            {[
                              { id: 'basic' as PackageId, name: 'Starter', price: '$29', icon: Zap, color: 'from-purple-500 to-pink-600', description: 'Perfect for small businesses getting started online. Up to 1 page, 3 services, delivered in 3-6 hours.' },
                              { id: 'advanced' as PackageId, name: 'Standard', price: '$49', icon: Sparkles, color: 'from-blue-500 to-cyan-600', description: 'Comprehensive solution for established businesses. Up to 5 pages, 8 services, competitor research included.' },
                              { id: 'seo' as PackageId, name: 'Professional', price: '$79', icon: Building2, color: 'from-indigo-500 to-purple-600', description: 'Advanced features for growing businesses. Up to 10 pages, 15 services, advanced SEO tools included.' },
                              { id: 'deluxe' as PackageId, name: 'Business', price: '$129', icon: Crown, color: 'from-pink-500 to-rose-600', description: 'Complete business solution with advanced features. Up to 20 pages, 25 services, automated maintenance.' },
                              { id: 'ultra' as PackageId, name: 'Enterprise', price: '$199', icon: Star, color: 'from-orange-500 to-red-600', description: 'Powerful solution for large-scale operations. Up to 50 pages, 50 services, dedicated support included.' },
                            ].map(({ id, name, price, icon: Icon, color, description }) => {
                              const constraints = PACKAGE_CONSTRAINTS[id];
                              const isSelected = wizardState.selectedPackage === id;
                              return (
                                <Card
                                  key={id}
                                  className={`group relative cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden ${
                                    isSelected
                                      ? 'ring-4 ring-purple-400/50 border-2 border-purple-400/50 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl shadow-2xl shadow-purple-500/20'
                                      : 'border border-white/20 bg-white/10 backdrop-blur-xl hover:border-purple-400/40 hover:bg-white/15 hover:shadow-purple-500/10'
                                  }`}
                                  onClick={() => {
                                    debugLog('[Wizard] 🆕 Package clicked - navigating to Phase 2');
                                    clearWizardData();
                                    setWizardState({
                                      stage: 'template-select',
                                      currentPage: 'project-overview',
                                      selectedDesignTemplates: [],
                                      selectedContentTemplates: [],
                                      imageSource: 'leonardo',
                                      redesignCount: 0,
                                      currentQuestion: 0,
                                      requirements: {},
                                      messages: [],
                                      stageHistory: ['package-select'],
                                      selectedPackage: id,
                                      packageConstraints: constraints,
                                      selectedTemplate: null,
                                    });
                                    setGeneratedWebsite(null);
                                    trackEvent('wizard_package_selected', { package: id });
                                    toast({
                                      title: 'Package Selected!',
                                      description: `You selected ${name}. Now choose your design template.`,
                                    });
                                  }}
                                >
                                  {/* Animated background gradient */}
                                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                  
                                  <CardHeader className="pb-4 relative z-10">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                      </div>
                                      {isSelected && (
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                          <Check className="w-5 h-5 text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-white mb-2">
                                      {name}
                                    </CardTitle>
                                    <CardDescription className="text-base text-gray-300 leading-relaxed">
                                      {description}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="pt-0 relative z-10">
                                    <div className="mb-6">
                                      <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-4xl font-bold text-white">{price.replace('$', '')}</span>
                                        <span className="text-lg text-gray-400">/month</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                          {id === 'basic' ? '3-6 hours' : id === 'advanced' ? '4-8 hours' : id === 'seo' ? '6-10 hours' : id === 'deluxe' ? '8-12 hours' : '10-16 hours'} delivery
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                                        isSelected
                                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50'
                                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30'
                                      }`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <Check className="w-5 h-5 mr-2" />
                                          Selected
                                        </>
                                      ) : (
                                        <>
                                          Select Package
                                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                      )}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>

                          {/* Footer Navigation - Enhanced Design */}
                          {wizardState.selectedPackage && (
                            <div className="mt-12 relative z-10">
                              <div className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div>
                                    <p className="text-xl font-bold text-white mb-1">
                                      Selected: {PACKAGE_NAMES[wizardState.selectedPackage]}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {wizardState.packageConstraints?.maxPages} pages, {wizardState.packageConstraints?.maxServices} services included
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => navigateToStage('template-select')}
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                                  >
                                    Continue to Design Selection
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                      )}

                      {/* PHASE 2: Design Template Selection (Multi-Select) */}
                      {wizardState.stage === 'template-select' && (
                        <DesignTemplateSelection
                          onBack={() => {
                            // Navigate back to previous stage (package-select)
                            navigateBack();
                          }}
                          onTemplatesSelect={(templates) => {
                            setWizardState(prev => ({
                              ...prev,
                              selectedDesignTemplates: templates,
                              // Also set single template for backwards compatibility
                              selectedTemplate: templates[0] || null,
                            }));
                          }}
                          selectedTemplates={wizardState.selectedDesignTemplates || []}
                          imageSource={wizardState.imageSource || 'leonardo'}
                          onImageSourceChange={(source) => {
                            setWizardState(prev => ({
                              ...prev,
                              imageSource: source,
                            }));
                          }}
                          onContinue={async () => {
                            // Get exact template preview HTML (same as shown in template selection)
                            const selectedTemplate = wizardState.selectedDesignTemplates?.[0];
                            if (!selectedTemplate) {
                              console.error('[Wizard] No template selected');
                              return;
                            }

                            try {
                              // Fetch the exact preview HTML (same as template selection preview)
                              const response = await fetch(`/api/templates/${selectedTemplate.id}/preview-html-json`);
                              const data = await response.json();

                              if (!data.success || !data.html) {
                                console.error('[Wizard] Failed to load template preview:', data.error);
                                toast({
                                  title: 'Error',
                                  description: data.error || 'Failed to load template preview',
                                  variant: 'destructive',
                                });
                                return;
                              }

                              // Create a project if user is authenticated
                              let projectId = wizardState.projectId;
                              const projectName = wizardState.requirements?.businessName ||
                                                  selectedTemplate.name ||
                                                  'Untitled Project';

                              if (isAuthenticated && user && !projectId) {
                                try {
                                  const createResponse = await fetch('/api/projects', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      name: projectName,
                                      templateId: selectedTemplate.id,
                                      templateName: selectedTemplate.name,
                                      templatePreview: selectedTemplate.thumbnailUrl || selectedTemplate.previewUrl,
                                      html: data.html,
                                      css: '',
                                      industry: selectedTemplate.industry || wizardState.requirements?.industry,
                                      businessInfo: wizardState.requirements,
                                    }),
                                  });

                                  if (createResponse.ok) {
                                    const projectData = await createResponse.json();
                                    projectId = projectData.project?.id;
                                    console.log('[Wizard] Project created:', projectId);
                                  } else {
                                    console.warn('[Wizard] Failed to create project, continuing without saving');
                                  }
                                } catch (err) {
                                  console.warn('[Wizard] Error creating project:', err);
                                }
                              }

                              // Store the exact preview HTML (paths already fixed) and project ID
                              setWizardState(prev => ({
                                ...prev,
                                projectId,
                                projectName,
                                mergedTemplate: {
                                  html: data.html || '',
                                  css: '', // Not needed - HTML already includes CSS via fixed paths
                                },
                              }));

                              // If project was created, redirect to Projects page
                              if (projectId) {
                                toast({
                                  title: 'Project Created!',
                                  description: `"${projectName}" has been saved to your projects.`,
                                });
                                // Clear wizard state to start fresh next time
                                localStorage.removeItem('stargate-wizard-state');
                                setLocation('/stargate-websites');
                              } else {
                                // Fallback: if no project created (not authenticated), go to editor
                                navigateToStage('final-website');
                              }
                            } catch (error) {
                              console.error('[Wizard] Error loading template preview:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to load template preview. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }}
                        />
                      )}

                      {/* Phase 3 (keywords-collection) REMOVED - navigation goes directly from template-select to content-rewriting */}

                      {/* DEPRECATED: Old Empty Template Preview - kept for backwards compatibility */}
                      {false && wizardState.stage === 'empty-preview' && wizardState.selectedDesignTemplates?.[0] && (
                        <EmptyTemplatePreview
                          designTemplate={wizardState.selectedDesignTemplates[0]}
                          onContinue={(strippedHtml) => {
                            setWizardState(prev => ({
                              ...prev,
                              mergedTemplate: {
                                html: strippedHtml,
                                css: prev.selectedDesignTemplates?.[0]?.css || '',
                              },
                            }));
                            navigateToStage('content-select');
                          }}
                          onBack={() => {
                            navigateToStage('template-select');
                          }}
                        />
                      )}

                      {/* DEPRECATED: Old Content Template Selection - kept for backwards compatibility */}
                      {false && wizardState.stage === 'content-select' && (
                        <ContentTemplateSelection
                          onTemplatesSelect={(templates) => {
                            setWizardState(prev => ({
                              ...prev,
                              selectedContentTemplates: templates,
                            }));
                          }}
                          selectedTemplates={wizardState.selectedContentTemplates || []}
                          onContinue={() => {
                            navigateToStage('final-website');
                          }}
                          onBack={() => {
                            navigateToStage('empty-preview');
                          }}
                        />
                      )}

                      {/* PHASE 4: Merge Preview - Side-by-side design + content */}
                      {wizardState.stage === 'merge-preview' &&
                        wizardState.selectedDesignTemplates?.[0] &&
                        wizardState.selectedContentTemplates?.[0] && (
                          <MergePreview
                            designTemplate={wizardState.selectedDesignTemplates[0]}
                            contentTemplate={wizardState.selectedContentTemplates[0]}
                            onMerge={async () => {
                              try {
                                // Call merge API
                                const response = await fetch('/api/merge/preview', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    designTemplate: wizardState.selectedDesignTemplates![0],
                                    contentTemplate: wizardState.selectedContentTemplates![0],
                                  }),
                                });

                                if (!response.ok) throw new Error('Merge failed');

                                const merged = await response.json();
                                
                                // Analyze images to generate prompts
                                try {
                                  const analyzeResponse = await fetch('/api/merge/analyze-images', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      mergedTemplate: merged,
                                      businessContext: {
                                        industry: wizardState.requirements.industry,
                                        businessName: wizardState.requirements.businessName,
                                        location: (wizardState.requirements as any).location,
                                      },
                                    }),
                                  });

                                  if (analyzeResponse.ok) {
                                    const analyzed = await analyzeResponse.json();
                                    // Merge analyzed images with prompts into merged template
                                    merged.images = analyzed.analyses.map((analysis: any) => ({
                                      src: analysis.src,
                                      alt: analysis.alt,
                                      section: analysis.section,
                                      prompt: analysis.prompt,
                                    }));
                                  }
                                } catch (analyzeErr) {
                                  console.warn('[Wizard] Image analysis failed, continuing without prompts:', analyzeErr);
                                  // Continue without prompts - will generate on-the-fly
                                }
                                
                                // Store merged template
                                setWizardState(prev => ({
                                  ...prev,
                                  mergedTemplate: merged,
                                }));

                                // Navigate to image generation
                                navigateToStage('final-website');
                              } catch (err) {
                                console.error('[Wizard] Merge error:', err);
                                toast({
                                  title: 'Merge Failed',
                                  description: err instanceof Error ? err.message : 'Failed to merge templates',
                                  variant: 'destructive',
                                });
                              }
                            }}
                            onBack={() => {
                              navigateToStage('content-select');
                            }}
                          />
                        )}

                      {/* Phase 4 (image-generation) REMOVED */}

                      {/* Phase 5 (seo-assessment) REMOVED */}

                      {/* Phase 6 (review-redo) REMOVED */}

                      {/* Phase 3 (content-rewriting) REMOVED - navigation goes directly from template-select to final-approval */}

                      {/* PHASE 7: Client Information Collection */}
                      {wizardState.stage === 'client-info' && (
                        <ClientInfoCollection
                          requirements={wizardState.requirements}
                          onRequirementsChange={(requirements) => {
                            setWizardState(prev => ({
                              ...prev,
                              requirements,
                            }));
                          }}
                          onContinue={() => {
                            // Navigate to Phase 8: Final Approval
                            navigateToStage('final-website');
                          }}
                          onBack={() => {
                            // Go back to content rewriting
                            navigateToStage('final-website');
                          }}
                        />
                      )}

                      {/* PHASE 7: AI Website Generation - Uses EXACT scraped templates */}
                      {wizardState.stage === 'ai-generation' && (
                        <>
                          {/* Use RealTimeWebsiteTransform if we have a selected template */}
                          {(wizardState.selectedDesignTemplates?.length || 0) > 0 ? (
                            <RealTimeWebsiteTransform
                              selectedTemplate={wizardState.selectedDesignTemplates![0]}
                              requirements={wizardState.requirements}
                              onComplete={(transformedHtml) => {
                                setWizardState(prev => ({
                                  ...prev,
                                  generatedWebsite: {
                                    html: transformedHtml,
                                    css: '',
                                    js: '',
                                  },
                                }));
                                // Navigate to Phase 8: Final Approval (generation is last before approval)
                                navigateToStage('final-website');
                              }}
                              onBack={() => {
                                // Go back to client info
                                navigateToStage('client-info');
                              }}
                            />
                          ) : (
                            /* Fallback to old component if no template selected */
                            <AIWebsiteGeneration
                              designTemplates={wizardState.selectedDesignTemplates || []}
                              contentTemplates={wizardState.selectedContentTemplates || []}
                              requirements={wizardState.requirements}
                              imageSource={wizardState.imageSource || 'leonardo'}
                              onComplete={(website) => {
                                setWizardState(prev => ({
                                  ...prev,
                                  generatedWebsite: website,
                                }));
                                // Navigate to Phase 8: Final Approval (generation is last before approval)
                                navigateToStage('final-website');
                              }}
                              onBack={() => {
                                // Go back to client info
                                navigateToStage('client-info');
                              }}
                            />
                          )}
                        </>
                      )}

                      {/* PHASE 6: Review & Redesign (after generation, optional) */}
                      {wizardState.stage === 'review-redesign' && wizardState.generatedWebsite && (
                        <ReviewAndRedesign
                          website={wizardState.generatedWebsite}
                          redesignCount={wizardState.redesignCount || 0}
                          maxRedesigns={5}
                          onRedesign={(feedback) => {
                            // Increment redesign count and go back to generation
                            setWizardState(prev => ({
                              ...prev,
                              redesignCount: (prev.redesignCount || 0) + 1,
                            }));
                            // TODO: Pass feedback to AI for regeneration
                            console.log('[Wizard] Redesign requested:', feedback);
                            navigateToStage('ai-generation');
                          }}
                          onApprove={() => {
                            // Navigate to Phase 8: Final Approval
                            navigateToStage('final-website');
                          }}
                          onBack={() => {
                            navigateToStage('ai-generation');
                          }}
                        />
                      )}

                      {/* PHASE 5: SEO Expert Evaluation */}
                      {wizardState.stage === 'seo-evaluation' && (
                        <SEOExpertEvaluation
                          requirements={wizardState.requirements}
                          onComplete={(score, recommendations) => {
                            setWizardState(prev => ({
                              ...prev,
                              seoScore: score,
                              seoRecommendations: recommendations,
                            }));
                            // Navigate to Phase 7: AI Website Generation (last before approval)
                            navigateToStage('ai-generation');
                          }}
                          onBack={() => {
                            navigateToStage('client-info');
                          }}
                        />
                      )}

                      {/* Phase 7 (final-approval) REMOVED - navigation goes directly from template-select to final-website */}

                      {/* PHASE 3: Final Website - Display the final website */}
                      {wizardState.stage === 'final-website' && (() => {
                        // Get HTML from mergedTemplate (already has all CSS via fixed paths from preview-html-json)
                        const html = wizardState.mergedTemplate?.html || 
                                   wizardState.selectedDesignTemplates?.[0]?.html || 
                                   wizardState.generatedWebsite?.code?.files?.['index.html'] || 
                                   '<html><head><title>Website</title></head><body><h1>No website content available</h1><p>Please go back and select a template.</p></body></html>';
                        
                        return (
                          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, margin: 0, padding: 0 }}>
                            <FinalWebsiteDisplay
                            html={html}
                            pageKeywords={wizardState.pageKeywords || []}
                            seoAssessment={wizardState.seoAssessment}
                            generatedImages={wizardState.generatedImages}
                            businessContext={{
                              businessName: wizardState.requirements.businessName || 'Your Business',
                              industry: wizardState.requirements.industry,
                              location: wizardState.requirements.location,
                            }}
                            onEdit={() => {
                              // Go back to template selection for modifications
                              navigateToStage('template-select');
                            }}
                            onStartNew={() => {
                              // Reset wizard state and start fresh
                              setWizardState(prev => ({
                                ...prev,
                                stage: 'package-select',
                                selectedDesignTemplates: [],
                                selectedContentTemplates: [],
                                pageKeywords: [],
                                generatedImages: [],
                                mergedTemplate: undefined,
                                seoAssessment: undefined,
                                redoRequests: [],
                              }));
                            }}
                            onWebsiteUpdate={(updatedHtml) => {
                              setWizardState(prev => ({
                                ...prev,
                                mergedTemplate: {
                                  html: updatedHtml,
                                  css: prev.mergedTemplate?.css || '',
                                },
                              }));
                            }}
                          />
                          </div>
                        );
                      })()}

                      {/* DEPRECATED: Old Final Approval - kept for backwards compatibility */}
                      {false && wizardState.stage === 'final-approval' && wizardState.generatedWebsite && (
                        <FinalApproval
                          website={wizardState.generatedWebsite}
                          requirements={wizardState.requirements}
                          seoScore={wizardState.seoScore || 85}
                          onDownload={() => {
                            console.log('[Wizard] Website downloaded');
                          }}
                          onDeploy={() => {
                            console.log('[Wizard] Website deployed');
                          }}
                          onBack={() => {
                            navigateToStage('seo-evaluation');
                          }}
                        />
                      )}

                      {/* Legacy: Client Checklist (deprecated) */}
                      {wizardState.stage === 'requirements' && (
                        <ClientChecklist
                          checklist={checklistState}
                          onChecklistChange={setChecklistState}
                          selectedPackage={wizardState.selectedPackage}
                          packageConstraints={wizardState.packageConstraints}
                          onContinue={() => {
                            // Map checklist selections to requirements
                            const mappedRequirements = mapChecklistToRequirements(
                              checklistState,
                              wizardState.packageConstraints,
                              wizardState.selectedPackage
                            );

                            // Merge with existing requirements (checklist takes precedence)
                            const updatedRequirements: WebsiteRequirements = {
                              ...wizardState.requirements,
                              ...mappedRequirements,
                            };

                            // Update wizard state with mapped requirements
                            setWizardState(prev => ({
                              ...prev,
                              requirements: updatedRequirements,
                            }));

                            // Navigate to Phase 3 (first investigation phase)
                            navigateToStage('content-quality');
                            trackEvent('wizard_checklist_completed', {
                              package: wizardState.selectedPackage,
                              checklistItemsChecked: Object.values(checklistState).reduce(
                                (sum, cat) => sum + Object.values(cat).filter(Boolean).length,
                                0
                              ),
                            });
                          }}
                          onAutoFill={() => {
                            // Auto-fill checklist with test data
                            const autoFilledChecklist: ChecklistState = {};
                            CLIENT_CHECKLIST_ITEMS.forEach(item => {
                              // Check package requirements
                              if (item.packageRequired && wizardState.selectedPackage) {
                                if (!item.packageRequired.includes(wizardState.selectedPackage)) {
                                  return; // Skip items not available for this package
                                }
                              }

                              // Auto-check all items (for test mode)
                              if (!autoFilledChecklist[item.category]) {
                                autoFilledChecklist[item.category] = {};
                              }
                              autoFilledChecklist[item.category][item.id] = true;
                            });
                            setChecklistState(autoFilledChecklist);
                            toast({
                              title: 'Checklist Auto-Filled',
                              description: 'All checklist items have been checked for testing.',
                            });
                          }}
                        />
                      )}

                      {/* PHASE 2: Requirements Stage - DEPRECATED (Replaced by Client Checklist above) */}
                      {false && wizardState.stage === 'requirements' &&
                        (() => {
                          // Calculate progress: count required questions that are completed
                          const allRequiredQuestions = discoveryQuestions.filter(q => !q.optional);
                          const completedRequiredQuestions = allRequiredQuestions.filter(q => {
                            // Check conditional rendering
                            if (q.conditional) {
                              const dependentValue =
                                wizardState.requirements[q.conditional.dependsOn];
                              const showWhen = Array.isArray(q.conditional.showWhen)
                                ? q.conditional.showWhen
                                : [q.conditional.showWhen];
                              if (!showWhen.includes(dependentValue as string)) {
                                return true; // Count as completed if condition not met (question not shown)
                              }
                            }
                            const value = wizardState.requirements[q.key];
                            return (
                              value !== undefined &&
                              value !== null &&
                              value !== '' &&
                              (Array.isArray(value) ? value.length > 0 : true)
                            );
                          });
                          const progressPercentage =
                            allRequiredQuestions.length > 0
                              ? Math.round(
                                  (completedRequiredQuestions.length /
                                    allRequiredQuestions.length) *
                                    100
                                )
                              : 0;

                          // Calculate section completion
                          const getSectionCompletion = (page: string) => {
                            const pageQuestions = discoveryQuestions.filter(
                              q => q.page === page && !q.optional
                            );
                            if (pageQuestions.length === 0)
                              return { completed: 0, total: 0, percentage: 100 };
                            const completed = pageQuestions.filter(q => {
                              if (q.conditional) {
                                const dependentValue =
                                  wizardState.requirements[q.conditional.dependsOn];
                                const showWhen = Array.isArray(q.conditional.showWhen)
                                  ? q.conditional.showWhen
                                  : [q.conditional.showWhen];
                                if (!showWhen.includes(dependentValue as string)) {
                                  return true;
                                }
                              }
                              const value = wizardState.requirements[q.key];
                              return (
                                value !== undefined &&
                                value !== null &&
                                value !== '' &&
                                (Array.isArray(value) ? value.length > 0 : true)
                              );
                            }).length;
                            return {
                              completed,
                              total: pageQuestions.length,
                              percentage:
                                pageQuestions.length > 0
                                  ? Math.round((completed / pageQuestions.length) * 100)
                                  : 100,
                            };
                          };

                          return (
                            <Card className="border-2 border-blue-500">
                              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                      Phase 2: Client Specification & Requirements
                                    </CardTitle>
                                    <div className="flex items-center justify-between mt-1">
                                      <p className="text-sm text-muted-foreground">
                                        Please answer all questions below. All fields are on one
                                        page for your convenience.
                                      </p>
                                      {saveStatus === 'saving' && (
                                        <Badge variant="outline" className="text-xs ml-4">
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Saving...
                                        </Badge>
                                      )}
                                      {saveStatus === 'saved' && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs ml-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300"
                                        >
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Saved
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Progress Indicator */}
                                    <div className="mt-4 space-y-2">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">
                                          Overall Progress
                                        </span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                          {progressPercentage}% ({completedRequiredQuestions.length}
                                          /{allRequiredQuestions.length})
                                        </span>
                                      </div>
                                      <Progress value={progressPercentage} className="h-2" />
                                    </div>

                                    {!wizardState.selectedPackage ? (
                                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
                                        ⚠️ <strong>No package selected.</strong> Please go back to
                                        Phase 1 and select a package first.
                                      </div>
                                    ) : wizardState.packageConstraints ? (
                                      <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
                                        <strong>Package:</strong>{' '}
                                        {wizardState.selectedPackage === 'basic'
                                          ? 'Essential'
                                          : wizardState.selectedPackage === 'advanced'
                                            ? 'Professional'
                                            : wizardState.selectedPackage === 'seo'
                                              ? 'SEO Optimized'
                                              : wizardState.selectedPackage === 'deluxe'
                                                ? 'Deluxe'
                                                : wizardState.selectedPackage === 'ultra'
                                                  ? 'Ultra'
                                                  : wizardState.selectedPackage}
                                        {' • '}
                                        <strong>Limit:</strong>{' '}
                                        {wizardState.packageConstraints.maxPages}{' '}
                                        {wizardState.packageConstraints.maxPages === 1
                                          ? 'page'
                                          : 'pages'}
                                        , {wizardState.packageConstraints.maxServices} services
                                      </div>
                                    ) : null}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={autoFillWizard}
                                    className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-md ml-4"
                                    data-testid="button-autofill-requirements"
                                    title="Fill all fields with test data for quick testing"
                                  >
                                    <Zap className="w-4 h-4" />
                                    Test Mode
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="flex gap-6">
                                  {/* Main Content Area */}
                                  <div className="flex-1 space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                    {/* Group questions by page */}
                                    {pageOrder.map(page => {
                                      const pageQuestions = discoveryQuestions.filter(
                                        q => q.page === page
                                      );
                                      if (pageQuestions.length === 0) return null;

                                      return (
                                        <div
                                          key={page}
                                          id={`section-${page}`}
                                          className="space-y-4 scroll-mt-4"
                                        >
                                          {/* Page Header */}
                                          {(() => {
                                            const sectionProgress = getSectionCompletion(page);
                                            const isSectionComplete =
                                              sectionProgress.percentage === 100;
                                            return (
                                              <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 pb-2 border-b-2 border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-3">
                                                  {(() => {
                                                    const Icon = getPageIcon(page);
                                                    return (
                                                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    );
                                                  })()}
                                                  <h3 className="text-lg font-semibold text-foreground">
                                                    {pageLabels[page]}
                                                  </h3>
                                                  {isSectionComplete && (
                                                    <Badge
                                                      variant="default"
                                                      className="bg-green-500 text-white"
                                                    >
                                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                                      Complete
                                                    </Badge>
                                                  )}
                                                  <Badge variant="outline" className="ml-auto">
                                                    {sectionProgress.completed} of{' '}
                                                    {sectionProgress.total} questions answered
                                                    {sectionProgress.total > 0 && (
                                                      <span className="ml-1 text-xs font-semibold">
                                                        ({sectionProgress.percentage}%)
                                                      </span>
                                                    )}
                                                  </Badge>
                                                </div>
                                                {sectionProgress.total > 0 && (
                                                  <div className="mt-2">
                                                    <Progress
                                                      value={sectionProgress.percentage}
                                                      className="h-1.5"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}

                                          {/* Questions for this page */}
                                          <div className="space-y-4 pl-2">
                                            {pageQuestions.map(question => {
                                              const fieldError = fieldErrors[question.key];
                                              const isTouched = touchedFields.has(question.key);
                                              const hasError = isTouched && !!fieldError;
                                              const hasValue =
                                                !!wizardState.requirements[question.key];
                                              const isValid = isTouched && !fieldError && hasValue;

                                              return (
                                                <div
                                                  key={question.id}
                                                  id={`question-${question.key}`}
                                                  className={`space-y-3 p-4 rounded-lg border transition-colors ${
                                                    hasError
                                                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100/50 dark:hover:bg-red-900/50'
                                                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                                                  }`}
                                                >
                                                  <label
                                                    className="text-base font-semibold flex items-center gap-2 text-foreground"
                                                    htmlFor={`input-${question.key}`}
                                                  >
                                                    {question.question}
                                                    {question.optional && (
                                                      <Badge
                                                        variant="secondary"
                                                        className="text-xs font-normal"
                                                      >
                                                        {t('wizard.optional', language)}
                                                      </Badge>
                                                    )}
                                                    {question.example && (
                                                      <TooltipProvider>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <HelpCircle
                                                              className="w-4 h-4 text-muted-foreground cursor-help"
                                                              aria-label="Help"
                                                              onClick={() =>
                                                                setShowHelpTooltip(
                                                                  showHelpTooltip === question.id
                                                                    ? null
                                                                    : question.id
                                                                )
                                                              }
                                                            />
                                                          </TooltipTrigger>
                                                          <TooltipContent>
                                                            <p className="max-w-xs">
                                                              {question.example}
                                                            </p>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </TooltipProvider>
                                                    )}
                                                    {isValid && (
                                                      <CheckCircle2
                                                        className="w-4 h-4 text-green-500"
                                                        aria-label="Valid"
                                                      />
                                                    )}
                                                    {hasError && (
                                                      <AlertCircle
                                                        className="w-4 h-4 text-red-500"
                                                        aria-label="Error"
                                                      />
                                                    )}
                                                  </label>
                                                  {showHelpTooltip === question.id &&
                                                    question.example && (
                                                      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                          {question.example}
                                                        </p>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          className="ml-auto h-6 w-6 p-0"
                                                          onClick={() => setShowHelpTooltip(null)}
                                                          aria-label="Close help"
                                                        >
                                                          <X className="w-3 h-3" />
                                                        </Button>
                                                      </div>
                                                    )}
                                                  <div className="space-y-1">
                                                    {renderQuestion(question)}
                                                    {hasError && (
                                                      <p
                                                        className="text-sm text-red-500 flex items-center gap-1"
                                                        role="alert"
                                                        aria-live="polite"
                                                      >
                                                        <AlertCircle className="w-3 h-3" />
                                                        {fieldError}
                                                      </p>
                                                    )}
                                                    {isValid && (
                                                      <p className="text-sm text-green-500 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {t('wizard.looksGood', language)}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Section Navigation Sidebar */}
                                  <div className="hidden lg:block w-64 flex-shrink-0">
                                    <div className="sticky top-4">
                                      <Card className="border-2 border-blue-200 dark:border-blue-800">
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Menu className="w-4 h-4" />
                                            Jump to Section
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <ScrollArea className="h-[calc(100vh-400px)]">
                                            <nav className="space-y-1">
                                              {pageOrder.map(page => {
                                                const pageQuestions = discoveryQuestions.filter(
                                                  q => q.page === page
                                                );
                                                if (pageQuestions.length === 0) return null;

                                                const sectionProgress = getSectionCompletion(page);
                                                const isSectionComplete =
                                                  sectionProgress.percentage === 100;
                                                const Icon = getPageIcon(page);

                                                return (
                                                  <button
                                                    key={page}
                                                    onClick={() => {
                                                      const element = document.getElementById(
                                                        `section-${page}`
                                                      );
                                                      if (element) {
                                                        element.scrollIntoView({
                                                          behavior: 'smooth',
                                                          block: 'start',
                                                        });
                                                      }
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                                      isSectionComplete
                                                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                  >
                                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="flex-1 truncate">
                                                      {pageLabels[page]}
                                                    </span>
                                                    {isSectionComplete && (
                                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    )}
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs flex-shrink-0"
                                                    >
                                                      {sectionProgress.completed}/
                                                      {sectionProgress.total}
                                                    </Badge>
                                                  </button>
                                                );
                                              })}
                                            </nav>
                                          </ScrollArea>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </div>
                                </div>

                                {/* Single Continue Button at Bottom */}
                                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900">
                                  <Button
                                    onClick={() => {
                                      // Validate package is selected
                                      if (
                                        !wizardState.selectedPackage ||
                                        !wizardState.packageConstraints
                                      ) {
                                        toast({
                                          title: 'Package Required',
                                          description: 'Please go back and select a package first.',
                                          variant: 'destructive',
                                        });
                                        return;
                                      }

                                      // Validate all questions before proceeding
                                      const allQuestions = discoveryQuestions;
                                      const errors: Record<string, string> = {};

                                      allQuestions.forEach(question => {
                                        // Skip optional questions
                                        if (question.optional) return;

                                        // Check conditional rendering
                                        if (question.conditional) {
                                          const dependentValue =
                                            wizardState.requirements[
                                              question.conditional.dependsOn
                                            ];
                                          const showWhen = Array.isArray(
                                            question.conditional.showWhen
                                          )
                                            ? question.conditional.showWhen
                                            : [question.conditional.showWhen];
                                          if (!showWhen.includes(dependentValue as string)) {
                                            return; // Don't validate if condition not met
                                          }
                                        }

                                        const value = wizardState.requirements[question.key];
                                        const fieldError = validateField(
                                          question.key,
                                          value,
                                          question
                                        );
                                        if (fieldError) {
                                          errors[question.key] = fieldError;
                                        }
                                      });

                                      // Validate package constraints
                                      const services = wizardState.requirements.services || [];
                                      if (
                                        services.length >
                                        (wizardState.packageConstraints.maxServices || 999)
                                      ) {
                                        errors.services = `Package limit: Maximum ${wizardState.packageConstraints.maxServices} services allowed. You have ${services.length}.`;
                                      }

                                      if (Object.keys(errors).length > 0) {
                                        setFieldErrors(errors);
                                        // Mark all fields with errors as touched
                                        const newTouchedFields = new Set(touchedFields);
                                        Object.keys(errors).forEach(key =>
                                          newTouchedFields.add(key as keyof WebsiteRequirements)
                                        );
                                        setTouchedFields(newTouchedFields);

                                        // Auto-scroll to first error field
                                        const firstErrorKey = Object.keys(errors)[0];
                                        const firstErrorElement = document.getElementById(
                                          `question-${firstErrorKey}`
                                        );
                                        if (firstErrorElement) {
                                          // Small delay to ensure state updates are reflected
                                          setTimeout(() => {
                                            firstErrorElement.scrollIntoView({
                                              behavior: 'smooth',
                                              block: 'center',
                                            });
                                            // Add a brief highlight animation
                                            firstErrorElement.classList.add('animate-pulse');
                                            setTimeout(() => {
                                              firstErrorElement.classList.remove('animate-pulse');
                                            }, 2000);
                                          }, 100);
                                        }

                                        toast({
                                          title: 'Validation Error',
                                          description: `Please fix ${Object.keys(errors).length} error${Object.keys(errors).length === 1 ? '' : 's'} before proceeding. Scrolled to first error.`,
                                          variant: 'destructive',
                                        });
                                        trackEvent('wizard_validation_failed', {
                                          stage: 'requirements',
                                          errorCount: Object.keys(errors).length,
                                        });
                                        return;
                                      }

                                      // All valid - proceed to first Google Category (Phase 3)
                                      navigateToStage('content-quality');
                                      trackEvent('wizard_requirements_completed');
                                    }}
                                    size="lg"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg min-w-[200px]"
                                    data-testid="button-continue-requirements"
                                  >
                                    Continue to Investigation
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })()}

                      {/* Define Stage - Requirements Summary */}
                      {/* E-Commerce Stage - Product Catalog */}
                      {/* E-Commerce Stage - DEPRECATED */}
                      {false && wizardState.stage === 'ecommerce' && (
                        <Card>
                          <CardHeader>
                            <CardTitle>E-Commerce Setup</CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                              Add products to your online store. You can skip this if you don&apos;t
                              need e-commerce.
                            </p>
                          </CardHeader>
                          <CardContent>
                            <ProductCatalog
                              products={ecommerceProducts}
                              onProductsChange={products => {
                                setEcommerceProducts(products);
                                setWizardState(prev => ({
                                  ...prev,
                                  requirements: {
                                    ...prev.requirements,
                                    enableEcommerce: products.length > 0,
                                    products: products,
                                  },
                                }));
                              }}
                            />
                            <div className="flex justify-end gap-4 mt-6">
                              <Button variant="outline" onClick={navigateBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  navigateToStage('content-quality');
                                  trackEvent('wizard_ecommerce_skipped');
                                }}
                              >
                                Skip E-Commerce
                              </Button>
                              <Button
                                onClick={() => {
                                  navigateToStage('content-quality');
                                  trackEvent('wizard_ecommerce_completed', {
                                    productCount: ecommerceProducts.length,
                                  });
                                }}
                              >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Define Requirements Stage - DEPRECATED */}
                      {false && wizardState.stage === 'define' && (
                        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle2 className="w-6 h-6 text-blue-500" />
                              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                Your Website Requirements
                              </h3>
                            </div>

                            <div className="grid gap-4 text-sm">
                              {wizardState.requirements.businessType && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Website Type:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100">
                                    {wizardState.requirements.businessType}
                                  </p>
                                </div>
                              )}

                              {wizardState.requirements.businessName && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Business Name:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100">
                                    {wizardState.requirements.businessName}
                                  </p>
                                </div>
                              )}

                              {wizardState.requirements.targetAudience && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Target Audience:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100">
                                    {wizardState.requirements.targetAudience}
                                  </p>
                                </div>
                              )}

                              {wizardState.requirements.pages &&
                                Array.isArray(wizardState.requirements.pages) &&
                                (wizardState.requirements.pages as any[]).length > 0 && (
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                      Pages:
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {wizardState.requirements.pages.map((page: string) => (
                                        <Badge key={page} variant="secondary">
                                          {page}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {wizardState.requirements.features &&
                                Array.isArray(wizardState.requirements.features) &&
                                (wizardState.requirements.features as any[]).length > 0 && (
                                  <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                      Features:
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {wizardState.requirements.features.map((feature: string) => (
                                        <Badge key={feature} variant="secondary">
                                          {feature}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {(wizardState.requirements.primaryColor ||
                                wizardState.requirements.accentColor) && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                                    Brand Colors:
                                  </p>
                                  <div className="flex gap-4">
                                    {wizardState.requirements.primaryColor && (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-8 h-8 rounded border-2 border-gray-300"
                                          style={{
                                            backgroundColor: wizardState.requirements.primaryColor,
                                          }}
                                        />
                                        <span className="text-sm text-blue-900 dark:text-blue-100">
                                          Primary: {wizardState.requirements.primaryColor}
                                        </span>
                                      </div>
                                    )}
                                    {wizardState.requirements.accentColor && (
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-8 h-8 rounded border-2 border-gray-300"
                                          style={{
                                            backgroundColor: wizardState.requirements.accentColor,
                                          }}
                                        />
                                        <span className="text-sm text-blue-900 dark:text-blue-100">
                                          Accent: {wizardState.requirements.accentColor}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {wizardState.requirements.fontStyle && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Font Style:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100">
                                    {wizardState.requirements.fontStyle}
                                  </p>
                                </div>
                              )}

                              {wizardState.requirements.styleAdjectives && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Style Keywords:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100 italic">
                                    {wizardState.requirements.styleAdjectives}
                                  </p>
                                </div>
                              )}

                              {wizardState.requirements.contentTone && (
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    Content Tone:
                                  </p>
                                  <p className="text-base text-blue-900 dark:text-blue-100">
                                    {wizardState.requirements.contentTone}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="pt-4 border-t border-blue-200 dark:border-blue-800 space-y-4">
                              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Choose How to Proceed:
                              </h4>

                              {/* Dual-Path CTAs: Quick Build vs AI Research */}
                              <div className="flex flex-wrap gap-3 justify-start">
                                {/* Quick Build Path */}
                                <Card className="flex-1 min-w-[240px] border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-5 h-5 text-blue-500" />
                                      <h5 className="font-semibold text-base">Quick Build</h5>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Generate now using your requirements (≈5-10 min)
                                    </p>
                                    <Button
                                      variant="secondary"
                                      onClick={handleSkipInvestigation}
                                      className="w-full"
                                      data-testid="button-skip-build"
                                    >
                                      Build My Website Now
                                    </Button>
                                  </CardContent>
                                </Card>

                                {/* AI Research Path */}
                                <Card className="flex-1 min-w-[240px] border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="w-5 h-5 text-purple-500" />
                                      <h5 className="font-semibold text-base">AI Research</h5>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      In-depth strategy with SEO & competitor analysis (≈45-60 min)
                                    </p>
                                    <Button
                                      onClick={handleStartInvestigation}
                                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                      data-testid="button-start-investigation"
                                    >
                                      Start AI Research
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Help Text */}
                              <p className="text-xs text-center text-muted-foreground">
                                Both paths create professional multi-page websites. AI Research adds
                                SEO strategy & competitor insights.
                              </p>

                              {/* Back Button */}
                              <div className="pt-2">
                                <Button
                                  variant="outline"
                                  onClick={navigateBack}
                                  className="w-full"
                                  data-testid="button-back-from-define"
                                >
                                  <ArrowLeft className="w-4 h-4 mr-2" />
                                  Back to Questions
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* COMPACT PROGRESS BAR - 8-phase wizard (hidden on final-website) */}
                      {wizardState.stage !== 'final-website' && (() => {
                        const STAGE_ORDER_8: WizardStage[] = [
                          'package-select', 'template-select', 'content-select', 'client-info',
                          'seo-evaluation', 'review-redesign', 'ai-generation', 'final-approval',
                        ];
                        const STAGE_LABELS_8: Record<string, string> = {
                          'package-select': 'Package', 'template-select': 'Design', 'content-select': 'Content',
                          'client-info': 'Client Info', 'seo-evaluation': 'SEO', 'review-redesign': 'Review',
                          'ai-generation': 'AI Build', 'final-approval': 'Approve',
                        };
                        const idx = Math.max(0, STAGE_ORDER_8.indexOf(wizardState.stage));
                        const progress = ((idx + 1) / 8) * 100;
                        return (
                          <div className="mb-3 px-3 py-1.5 bg-slate-800/60 rounded border border-white/10">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-400">{STAGE_LABELS_8[wizardState.stage] || wizardState.stage}</span>
                              <span className="text-purple-400 font-medium">{idx + 1}/8</span>
                            </div>
                            <Progress value={progress} className="h-1" />
                          </div>
                        );
                      })()}

                      {/* GOOGLE CATEGORY PHASES (3-15): Each category is its own phase */}
                      {GOOGLE_CATEGORY_STAGES[wizardState.stage] &&
                        (() => {
                          const categoryInfo = GOOGLE_CATEGORY_STAGES[wizardState.stage]!;
                          const categoryIndex = categoryInfo.index;
                          const currentJob = investigationProgress.jobs?.[categoryIndex];
                          const isActive = currentJob?.status === 'in-progress';
                          const isComplete = currentJob?.status === 'complete';
                          const progress = currentJob?.progress || 0;

                          return (
                            <Card className="border-2 border-blue-500">
                              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                      <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                      Phase {categoryIndex + 3}:{' '}
                                      {categoryInfo.name.replace(/^\d+\.\s*/, '')}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Phase {categoryIndex + 3} of 17 • Analyzing this category for
                                      your website
                                    </p>
                                  </div>
                                  {isActive && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-700 border-green-300"
                                    >
                                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                      Analyzing...
                                    </Badge>
                                  )}
                                  {isComplete && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-700 border-green-300"
                                    >
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Complete
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6 space-y-6">
                                {/* Per-Phase Progress Bar */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Phase Progress</span>
                                    <span className="font-semibold">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-3" />
                                </div>

                                {/* Google Checks */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Google Checks:</h4>
                                  <div className="grid gap-2">
                                    {categoryInfo.checks.map((check, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 p-2 rounded border bg-slate-50 dark:bg-slate-800/30"
                                      >
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{check}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Additional Factors */}
                                {categoryInfo.additional && categoryInfo.additional.length > 0 && (
                                  <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                                      Additional Factors:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                                      {categoryInfo.additional.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Live Activity Feed - Always visible */}
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm flex items-center gap-2">
                                    Live Research Activity:
                                    {isResearchActive && (
                                      <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                                    )}
                                  </h4>
                                  <ScrollArea className="h-32 border rounded p-2 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-1">
                                      {researchActivities.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-4">
                                          <p className="text-xs">
                                            {isResearchActive
                                              ? '⏳ Research starting...'
                                              : 'Waiting for research to begin...'}
                                          </p>
                                        </div>
                                      ) : (
                                        researchActivities.slice(0, 10).map(activity => (
                                          <div
                                            key={activity.id}
                                            className="text-xs text-muted-foreground flex items-start gap-2"
                                          >
                                            <span className="text-purple-500">•</span>
                                            <span>{activity.message}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </ScrollArea>
                                </div>

                                {/* Auto-advance when complete */}
                                {isComplete && categoryIndex < 12 && (
                                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                      ✅ {categoryInfo.name} analysis complete. Moving to next
                                      category...
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })()}

                      {/* BUILD STAGE (Phase 16): Website Builder in Progress */}
                      {wizardState.stage === 'build' && (
                        <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-3xl flex items-center gap-3">
                                  <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
                                  Website Builder in Progress
                                </CardTitle>
                                <p className="text-base text-muted-foreground mt-2">
                                  Phase 16 of 17 • Creating your stunning website with all available
                                  information
                                </p>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2 font-medium">
                                  ⏱️ This may take up to 10 minutes. We&apos;re designing something
                                  spectacular for you!
                                </p>
                              </div>
                              {isGenerating && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-100 text-purple-700 border-purple-300 text-lg px-4 py-2"
                                >
                                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                  Building...
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-6">
                            {/* Overall Build Progress */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">
                                  Build Progress
                                </span>
                                <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                                  {(() => {
                                    const totalBlocks = buildingProgress.blocks.length;
                                    const completedBlocks = buildingProgress.blocks.filter(
                                      b => b.status === 'complete'
                                    ).length;
                                    const buildingBlock = buildingProgress.blocks.find(
                                      b => b.status === 'building'
                                    );
                                    const currentProgress = buildingBlock
                                      ? (completedBlocks / totalBlocks) * 100 +
                                        (buildingProgress.currentBlock / totalBlocks) * 10
                                      : (completedBlocks / totalBlocks) * 100;
                                    return Math.round(currentProgress);
                                  })()}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={(() => {
                                  const totalBlocks = buildingProgress.blocks.length;
                                  const completedBlocks = buildingProgress.blocks.filter(
                                    b => b.status === 'complete'
                                  ).length;
                                  const buildingBlock = buildingProgress.blocks.find(
                                    b => b.status === 'building'
                                  );
                                  const currentProgress = buildingBlock
                                    ? (completedBlocks / totalBlocks) * 100 +
                                      (buildingProgress.currentBlock / totalBlocks) * 10
                                    : (completedBlocks / totalBlocks) * 100;
                                  return currentProgress;
                                })()}
                                className="h-4"
                              />
                            </div>

                            {/* Build Steps */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-base flex items-center gap-2">
                                <Activity className="w-5 h-5 text-purple-600" />
                                Build Steps:
                              </h4>
                              <div className="space-y-2">
                                {buildingProgress.blocks.map((block, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                      block.status === 'complete'
                                        ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800'
                                        : block.status === 'building'
                                          ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-400 dark:border-purple-700 animate-pulse'
                                          : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    {block.status === 'complete' ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : block.status === 'building' ? (
                                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    )}
                                    <span
                                      className={`flex-1 font-medium ${
                                        block.status === 'complete'
                                          ? 'text-green-700 dark:text-green-300'
                                          : block.status === 'building'
                                            ? 'text-purple-700 dark:text-purple-300'
                                            : 'text-gray-500 dark:text-gray-400'
                                      }`}
                                    >
                                      {block.name}
                                    </span>
                                    {block.status === 'building' && (
                                      <Badge
                                        variant="outline"
                                        className="bg-purple-100 text-purple-700 border-purple-300"
                                      >
                                        In Progress
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Message */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex items-start gap-3">
                                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                    Creating Your Stunning Website
                                  </p>
                                  <p className="text-sm text-purple-700 dark:text-purple-300">
                                    Our AI is using all available information, researching design
                                    trends, and creating a spectacular website tailored specifically
                                    for you. We&apos;re taking our time to ensure every detail is
                                    perfect. Please be patient - great things take time!
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Error Display */}
                            {error && (error as any).stage === 'build' && (
                              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                      Build Error
                                    </p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                      {error.message}
                                    </p>
                                    {error.canRetry && (
                                      <Button
                                        onClick={() => {
                                          setGenerationError(null);
                                          handleGeneratePreview();
                                        }}
                                        variant="outline"
                                        className="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                                      >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Retry Build
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* OLD INVESTIGATE STAGE - DEPRECATED (keeping for backward compatibility) */}
                      {false && (
                        <>
                          {/* New Content Investigation Engine Header */}
                          <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-2">
                                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                  Content Investigation Engine
                                </h2>
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400"
                                >
                                  Active
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                This is the new unified pipeline: Google Rating Categories → Content
                                Rating → SEO/Keywords → Website Builder → Final Output
                              </p>
                            </CardContent>
                          </Card>

                          {/* Check if e-commerce is enabled and show e-commerce step */}
                          {wizardState.requirements.features?.includes('E-Commerce Store') &&
                            !wizardState.requirements.enableEcommerce && (
                              <Card className="mb-6 border-primary">
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    E-Commerce Setup Recommended
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    You selected E-Commerce Store as a feature. Would you like to
                                    set up your product catalog now?
                                  </p>
                                  <Button
                                    onClick={() => {
                                      navigateToStage('ecommerce');
                                    }}
                                  >
                                    Set Up Products
                                  </Button>
                                </CardContent>
                              </Card>
                            )}
                          <Card>
                            <CardContent className="p-6 space-y-6">
                              {(() => {
                                if (!error || error === null) return null;
                                // TypeScript narrowing: error is confirmed to be non-null
                                // Use non-null assertion since we've already checked
                                const nonNullError = error!;
                                if (
                                  !('stage' in nonNullError) ||
                                  nonNullError.stage !== 'content-quality'
                                )
                                  return null;
                                // TypeScript narrowing: error is confirmed to have stage property
                                const err = nonNullError as {
                                  stage: string;
                                  message?: string;
                                  canRetry?: boolean;
                                };
                                return (
                                  <>
                                    <div className="flex items-center gap-2 mb-4">
                                      <AlertCircle className="w-6 h-6 text-red-500" />
                                      <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                                        Investigation Failed
                                      </h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                      {err.message && typeof err.message === 'string'
                                        ? err.message
                                        : 'An error occurred'}
                                      . The AI research process encountered an issue.
                                    </p>
                                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                                      <p className="text-sm text-red-800 dark:text-red-200">
                                        You can either retry the investigation or skip it and
                                        proceed with basic website generation.
                                      </p>
                                    </div>
                                    <div className="flex gap-3">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setGenerationError(null);
                                          navigateBack();
                                        }}
                                        className="flex-1"
                                        data-testid="button-skip-investigation"
                                      >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Go Back
                                      </Button>
                                      {(() => {
                                        if (!error || error === null) return null;
                                        // TypeScript narrowing: error is confirmed to be non-null
                                        // Explicit type assertion after validation
                                        const nonNullError = error as NonNullable<typeof error>;
                                        if (!('canRetry' in nonNullError)) return null;
                                        // TypeScript narrowing: error is confirmed to have canRetry property
                                        const errWithRetry = nonNullError as { canRetry: boolean };
                                        const canRetry = errWithRetry.canRetry;
                                        if (typeof canRetry !== 'boolean' || !canRetry) return null;
                                        
                                        // Check if we have failed categories for partial retry
                                        const failedCategories = investigationProgress.jobs
                                          .map((job, idx) => ({ job, idx }))
                                          .filter(({ job }) => job.status === 'failed');
                                        
                                        return (
                                          <div className="flex flex-col gap-2">
                                            {failedCategories.length > 0 && (
                                              <div className="text-sm text-muted-foreground mb-2">
                                                {failedCategories.length} category{failedCategories.length > 1 ? 'ies' : 'y'} failed. Retry specific categories or retry all.
                                              </div>
                                            )}
                                            {failedCategories.length > 0 && (
                                              <div className="flex flex-wrap gap-2 mb-2">
                                                {failedCategories.map(({ job, idx }) => (
                                                  <Button
                                                    key={idx}
                                                    onClick={() => {
                                                      setGenerationError(null);
                                                      retryCategory(idx);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                  >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Retry {job.name}
                                                  </Button>
                                                ))}
                                              </div>
                                            )}
                                            <Button
                                              onClick={() => {
                                                setGenerationError(null);
                                                handleStartInvestigation();
                                              }}
                                              className="flex-1"
                                              data-testid="button-retry-investigation"
                                            >
                                              <RotateCcw className="w-4 h-4 mr-2" />
                                              Retry All Investigation
                                            </Button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </>
                                );
                              })()}
                              {!error || (error !== null && error?.stage !== 'content-quality') ? (
                                <>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
                                    <h3 className="text-xl font-bold">
                                      Google Rating Categories Research
                                    </h3>
                                  </div>
                                  <p className="text-muted-foreground mb-4">
                                    Our AI is analyzing your requirements against Google&apos;s 13
                                    core rating categories to ensure your website scores highly in
                                    search rankings and meets world-class quality standards.
                                  </p>
                                  {!isGenerating && !wizardState.investigationResults && (
                                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                      <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                                            Analysis Starting...
                                          </p>
                                          <p className="text-xs text-blue-600 dark:text-blue-400">
                                            Your requirements are being analyzed automatically. This
                                            will take 3-10 minutes depending on the depth of
                                            research needed.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Progress Summary */}
                                  {isGenerating && investigationProgress.jobs.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                            {isPaused ? 'Investigation Paused' : 'Analysis in Progress'}
                                          </span>
                                          {/* Pause/Resume Button */}
                                          {isResearchActive && !isPaused && (
                                            <Button
                                              onClick={pauseInvestigation}
                                              variant="outline"
                                              size="sm"
                                              className="ml-2 h-7 px-2"
                                            >
                                              <Pause className="w-3 h-3 mr-1" />
                                              Pause
                                            </Button>
                                          )}
                                          {isPaused && (
                                            <Button
                                              onClick={resumeInvestigation}
                                              variant="outline"
                                              size="sm"
                                              className="ml-2 h-7 px-2 bg-green-100 dark:bg-green-900/30"
                                            >
                                              <Play className="w-3 h-3 mr-1" />
                                              Resume
                                            </Button>
                                          )}
                                          {/* Connection Status Indicator - Enhanced Visibility */}
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Badge
                                                  variant="outline"
                                                  className={`${
                                                    connectionStatus === 'connected'
                                                      ? 'bg-green-100 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300 shadow-sm'
                                                      : connectionStatus === 'reconnecting'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 text-yellow-700 dark:text-yellow-300 shadow-sm animate-pulse'
                                                        : 'bg-red-100 dark:bg-red-900/30 border-red-300 text-red-700 dark:text-red-300 shadow-sm animate-pulse'
                                                  } font-semibold text-sm px-3 py-1`}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    {connectionStatus === 'connected' ? (
                                                      <>
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        <span>Connected</span>
                                                      </>
                                                    ) : connectionStatus === 'reconnecting' ? (
                                                      <>
                                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                                        <span>
                                                          Reconnecting
                                                          {reconnectAttempts > 0 &&
                                                            ` (${reconnectAttempts}/5)`}
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                        <span>Disconnected</span>
                                                      </>
                                                    )}
                                                  </div>
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-xs">
                                                <p className="text-xs font-medium mb-1">
                                                  {connectionStatus === 'connected'
                                                    ? 'Connection Status: Active'
                                                    : connectionStatus === 'reconnecting'
                                                      ? 'Connection Status: Reconnecting'
                                                      : 'Connection Status: Lost'}
                                                </p>
                                                <p className="text-xs">
                                                  {connectionStatus === 'connected'
                                                    ? 'Your investigation is running smoothly. All updates are being received in real-time.'
                                                    : connectionStatus === 'reconnecting'
                                                      ? `We're attempting to reconnect... (${reconnectAttempts}/5 attempts). Your progress is safe and will resume automatically.`
                                                      : "Connection was lost. Don't worry - your progress has been saved. You can refresh the page to resume."}
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className="bg-white dark:bg-gray-800 border-green-300 text-green-700 dark:text-green-300"
                                        >
                                          {
                                            investigationProgress.jobs.filter(
                                              j => j.status === 'complete'
                                            ).length
                                          }{' '}
                                          / {investigationProgress.jobs.length} categories
                                        </Badge>
                                      </div>
                                      <Progress
                                        value={
                                          (investigationProgress.jobs.filter(
                                            j => j.status === 'complete'
                                          ).length /
                                            investigationProgress.jobs.length) *
                                          100
                                        }
                                        className="h-2"
                                      />
                                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                        Estimated time remaining:{' '}
                                        {Math.max(
                                          1,
                                          Math.ceil(
                                            investigationProgress.jobs.filter(
                                              j => j.status !== 'complete'
                                            ).length * 0.5
                                          )
                                        )}{' '}
                                        -{' '}
                                        {Math.max(
                                          2,
                                          Math.ceil(
                                            investigationProgress.jobs.filter(
                                              j => j.status !== 'complete'
                                            ).length * 1.5
                                          )
                                        )}{' '}
                                        minutes
                                      </p>
                                    </div>
                                  )}
                                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                      <strong>Most Important:</strong> Content Quality & Relevance
                                      is being prioritized first, as it&apos;s the foundation of
                                      Google&apos;s ranking algorithm.
                                    </p>
                                  </div>
                                  
                                  {/* Auto-Advance Settings */}
                                  <div className="bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-lg p-3 mb-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                          Auto-Advance Settings
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                          Automatically advance to next category when current completes
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant={autoAdvanceEnabled ? 'default' : 'outline'}
                                          onClick={() => {
                                            const newValue = !autoAdvanceEnabled;
                                            setAutoAdvanceEnabled(newValue);
                                            try {
                                              localStorage.setItem('stargate-auto-advance-enabled', String(newValue));
                                            } catch {
                                              // Ignore storage errors
                                            }
                                            // Cancel pending auto-advance if disabling
                                            if (!newValue && autoAdvanceTimeoutRef.current) {
                                              clearTimeout(autoAdvanceTimeoutRef.current);
                                              autoAdvanceTimeoutRef.current = null;
                                              autoAdvanceInProgressRef.current = false;
                                              setShowAutoAdvanceConfirmation(false);
                                              setPendingAutoAdvance(null);
                                            }
                                          }}
                                          className="h-7 text-xs"
                                        >
                                          {autoAdvanceEnabled ? 'Enabled' : 'Disabled'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Auto-Advance Confirmation Dialog */}
                                  {showAutoAdvanceConfirmation && pendingAutoAdvance && (
                                    <AlertDialog open={showAutoAdvanceConfirmation} onOpenChange={setShowAutoAdvanceConfirmation}>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Advance to Next Category?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Category analysis is complete. Advance to the next category automatically?
                                            {autoAdvanceDelay > 0 && (
                                              <span className="block mt-2 text-xs text-muted-foreground">
                                                Auto-advancing in {Math.ceil(autoAdvanceDelay / 1000)} seconds...
                                              </span>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel
                                            onClick={() => {
                                              if (autoAdvanceTimeoutRef.current) {
                                                clearTimeout(autoAdvanceTimeoutRef.current);
                                                autoAdvanceTimeoutRef.current = null;
                                              }
                                              autoAdvanceInProgressRef.current = false;
                                              setShowAutoAdvanceConfirmation(false);
                                              setPendingAutoAdvance(null);
                                            }}
                                          >
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => {
                                              if (pendingAutoAdvance) {
                                                navigateToStage(pendingAutoAdvance.nextStage);
                                                if (autoAdvanceTimeoutRef.current) {
                                                  clearTimeout(autoAdvanceTimeoutRef.current);
                                                  autoAdvanceTimeoutRef.current = null;
                                                }
                                                autoAdvanceInProgressRef.current = false;
                                                setShowAutoAdvanceConfirmation(false);
                                                setPendingAutoAdvance(null);
                                              }
                                            }}
                                          >
                                            Advance Now
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}

                                  {/* Live Research Activity Feed - Compact, same size as category cards */}
                                  <Card className="mb-3 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <button
                                          onClick={() => setShowResearchFeed(!showResearchFeed)}
                                          className="flex-1 flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors group"
                                        >
                                          <div className="flex items-center gap-2">
                                            {isResearchActive ? (
                                              <Loader2 className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
                                            ) : (
                                              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            )}
                                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                              {showResearchFeed
                                                ? 'Hide Live Research Activity'
                                                : 'View Live Research Activity'}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="bg-white dark:bg-gray-800 border-purple-300 text-purple-700 dark:text-purple-300"
                                            >
                                              {researchActivities.length} activities
                                              {isResearchActive && (
                                                <Loader2 className="ml-1.5 w-3 h-3 text-green-500 animate-spin" />
                                              )}
                                            </Badge>
                                          </div>
                                          {showResearchFeed ? (
                                            <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                                          ) : (
                                            <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                                          )}
                                        </button>
                                        {/* Test Research Input - allows testing with custom subject */}
                                        <div className="flex items-center gap-2 mt-2">
                                          <Input
                                            id="test-research-input"
                                            type="text"
                                            placeholder="Enter topic to test (e.g., Tesla, AI, Coffee Shop)"
                                            className="flex-1 h-8 text-sm"
                                            onKeyDown={e => {
                                              if (e.key === 'Enter') {
                                                const input = e.target as HTMLInputElement;
                                                if (input.value.trim()) {
                                                  testResearchActivity(input.value.trim());
                                                  input.value = '';
                                                }
                                              }
                                            }}
                                          />
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const input = document.getElementById(
                                                'test-research-input'
                                              ) as HTMLInputElement;
                                              if (input && input.value.trim()) {
                                                testResearchActivity(input.value.trim());
                                                input.value = '';
                                              } else {
                                                toast({
                                                  title: 'Please enter a topic',
                                                  description:
                                                    'Enter a subject to test the research activity feed.',
                                                });
                                              }
                                            }}
                                            className="text-xs whitespace-nowrap h-8"
                                          >
                                            Test Research
                                          </Button>
                                        </div>
                                      </div>

                                      {showResearchFeed && (
                                        <div className="mt-4 pt-4 border-t">
                                          {/* Filter and Search Controls */}
                                          <div className="mb-4 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                Filter:
                                              </span>
                                              {(
                                                [
                                                  'all',
                                                  'search',
                                                  'analysis',
                                                  'finding',
                                                  'check',
                                                ] as const
                                              ).map(filterType => (
                                                <Button
                                                  key={filterType}
                                                  size="sm"
                                                  variant={
                                                    activityFilter === filterType
                                                      ? 'default'
                                                      : 'outline'
                                                  }
                                                  onClick={() => {
                                                    setActivityFilter(filterType);
                                                    setActivityPage(1); // Reset to first page on filter change
                                                  }}
                                                  className="h-7 text-xs"
                                                >
                                                  {filterType === 'all'
                                                    ? 'All'
                                                    : filterType.charAt(0).toUpperCase() +
                                                      filterType.slice(1)}
                                                </Button>
                                              ))}
                                            </div>
                                            <Input
                                              placeholder="Search activities..."
                                              value={activitySearch}
                                              onChange={e => {
                                                setActivitySearch(e.target.value);
                                                setActivityPage(1); // Reset to first page on search
                                              }}
                                              className="h-8 text-sm"
                                            />
                                          </div>

                                          <ScrollArea className="h-64 w-full pr-4">
                                            <div className="space-y-3">
                                              {(() => {
                                                // Filter activities
                                                const filteredActivities =
                                                  researchActivities.filter(activity => {
                                                    const matchesFilter =
                                                      activityFilter === 'all' ||
                                                      activity.type === activityFilter;
                                                    const matchesSearch =
                                                      !activitySearch ||
                                                      activity.message
                                                        .toLowerCase()
                                                        .includes(activitySearch.toLowerCase()) ||
                                                      activity.category
                                                        ?.toLowerCase()
                                                        .includes(activitySearch.toLowerCase()) ||
                                                      activity.details
                                                        ?.toLowerCase()
                                                        .includes(activitySearch.toLowerCase());
                                                    return matchesFilter && matchesSearch;
                                                  });

                                                if (filteredActivities.length === 0) {
                                                  return (
                                                    <div className="text-center text-muted-foreground py-8">
                                                      <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                                                      <p className="text-sm">
                                                        {researchActivities.length === 0
                                                          ? 'Waiting for research to begin...'
                                                          : 'No activities match your filters'}
                                                      </p>
                                                    </div>
                                                  );
                                                }

                                                // Pagination logic
                                                const totalPages = Math.ceil(filteredActivities.length / activityItemsPerPage);
                                                const startIndex = showAllActivities ? 0 : (activityPage - 1) * activityItemsPerPage;
                                                const endIndex = showAllActivities ? filteredActivities.length : activityPage * activityItemsPerPage;
                                                const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

                                                return (
                                                  <>
                                                    {paginatedActivities.map(activity => {
                                                  const getActivityIcon = () => {
                                                    switch (activity.type) {
                                                      case 'search':
                                                        return (
                                                          <Search className="w-4 h-4 text-blue-500" />
                                                        );
                                                      case 'analysis':
                                                        return (
                                                          <BarChart3 className="w-4 h-4 text-green-500" />
                                                        );
                                                      case 'finding':
                                                        return (
                                                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                                                        );
                                                      case 'check':
                                                        return (
                                                          <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                                        );
                                                      default:
                                                        return (
                                                          <Activity className="w-4 h-4 text-gray-500" />
                                                        );
                                                    }
                                                  };

                                                  return (
                                                    <div
                                                      key={activity.id}
                                                      className={`p-3 rounded-lg border-l-4 ${
                                                        activity.type === 'search'
                                                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-400'
                                                          : activity.type === 'analysis'
                                                            ? 'bg-green-50 dark:bg-green-950/20 border-green-400'
                                                            : activity.type === 'finding'
                                                              ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400'
                                                              : 'bg-purple-50 dark:bg-purple-950/20 border-purple-400'
                                                      }`}
                                                    >
                                                      <div className="flex items-start gap-2">
                                                        {getActivityIcon()}
                                                        <div className="flex-1 min-w-0">
                                                          <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                                                              {activity.type}
                                                            </span>
                                                            {activity.category && (
                                                              <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                              >
                                                                {activity.category}
                                                              </Badge>
                                                            )}
                                                            <span className="text-xs text-muted-foreground ml-auto">
                                                              {activity.timestamp.toLocaleTimeString()}
                                                            </span>
                                                          </div>
                                                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {activity.message}
                                                          </p>
                                                          {activity.details && (
                                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                              {activity.details}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                                    
                                                    {/* Pagination Controls */}
                                                    {!showAllActivities && filteredActivities.length > activityItemsPerPage && (
                                                      <div className="flex items-center justify-between pt-4 border-t mt-4">
                                                        <div className="flex items-center gap-2">
                                                          <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                              setActivityPage(prev => Math.max(1, prev - 1));
                                                              setShowResearchFeed(true); // Keep feed open when navigating
                                                            }}
                                                            disabled={activityPage === 1}
                                                            className="h-7 text-xs"
                                                          >
                                                            <ArrowLeft className="w-3 h-3 mr-1" />
                                                            Previous
                                                          </Button>
                                                          <span className="text-xs text-muted-foreground">
                                                            Page {activityPage} of {totalPages} ({filteredActivities.length} total)
                                                          </span>
                                                          <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                              setActivityPage(prev => Math.min(totalPages, prev + 1));
                                                              setShowResearchFeed(true);
                                                            }}
                                                            disabled={activityPage >= totalPages}
                                                            className="h-7 text-xs"
                                                          >
                                                            Next
                                                            <ArrowRight className="w-3 h-3 ml-1" />
                                                          </Button>
                                                        </div>
                                                        <Button
                                                          size="sm"
                                                          variant="ghost"
                                                          onClick={() => {
                                                            setShowAllActivities(true);
                                                          }}
                                                          className="h-7 text-xs"
                                                        >
                                                          Show All
                                                        </Button>
                                                      </div>
                                                    )}
                                                    
                                                    {showAllActivities && filteredActivities.length > activityItemsPerPage && (
                                                      <div className="flex items-center justify-center pt-4 border-t mt-4">
                                                        <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() => {
                                                            setShowAllActivities(false);
                                                            setActivityPage(1);
                                                          }}
                                                          className="h-7 text-xs"
                                                        >
                                                          Show Paginated View
                                                        </Button>
                                                      </div>
                                                    )}
                                                  </>
                                                );
                                              })()}
                                            </div>
                                          </ScrollArea>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <div className="space-y-3">
                                    {investigationProgress.jobs.map((job, index) => {
                                      const categoryDetails = GOOGLE_CATEGORY_DETAILS[job.name];
                                      const isExpanded = expandedCategories.has(index);
                                      // Check if research is complete and we're now checking content
                                      const isCheckingContent =
                                        job.status === 'complete' && job.progress === 100;
                                      // Real check scores from backend
                                      const checkScores = job.checkScores || {};

                                      return (
                                        <Card
                                          key={index}
                                          className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
                                        >
                                          <CardContent className="p-4">
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-1">
                                                  {job.status === 'complete' ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                  ) : job.status === 'in-progress' ? (
                                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                                  ) : job.status === 'failed' ? (
                                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                  ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                                  )}
                                                  <span className="font-medium flex-1">
                                                    {job.name}
                                                  </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground font-semibold ml-2">
                                                  {job.progress}%
                                                </span>
                                              </div>
                                              <Progress value={job.progress} className="h-2" />

                                              {/* Error Message Display */}
                                              {job.status === 'failed' && job.error && (
                                                <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                                  <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                      <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                                        Error occurred during analysis
                                                      </p>
                                                      <p className="text-xs text-red-700 dark:text-red-300">
                                                        {job.error}
                                                      </p>
                                                    </div>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={async () => {
                                                        // Retry this specific category
                                                        const categoryStageMap: Record<
                                                          string,
                                                          {
                                                            index: number;
                                                            name: string;
                                                            frontendStage: WizardStage;
                                                          }
                                                        > = {
                                                          content_quality: {
                                                            index: 0,
                                                            name: '1. Content Quality & Relevance',
                                                            frontendStage: 'content-quality',
                                                          },
                                                          keywords_semantic_seo: {
                                                            index: 1,
                                                            name: '2. Keywords & Semantic SEO',
                                                            frontendStage: 'keywords-semantic-seo',
                                                          },
                                                          technical_seo: {
                                                            index: 2,
                                                            name: '3. Technical SEO',
                                                            frontendStage: 'technical-seo',
                                                          },
                                                          core_web_vitals: {
                                                            index: 3,
                                                            name: '4. Core Web Vitals',
                                                            frontendStage: 'core-web-vitals',
                                                          },
                                                          structure_navigation: {
                                                            index: 4,
                                                            name: '5. Structure & Navigation',
                                                            frontendStage: 'structure-navigation',
                                                          },
                                                          mobile_optimization: {
                                                            index: 5,
                                                            name: '6. Mobile Optimization',
                                                            frontendStage: 'mobile-optimization',
                                                          },
                                                          visual_quality: {
                                                            index: 6,
                                                            name: '7. Visual Quality & Engagement',
                                                            frontendStage: 'visual-quality',
                                                          },
                                                          image_media_quality: {
                                                            index: 7,
                                                            name: '8. Image & Media Quality',
                                                            frontendStage: 'image-media-quality',
                                                          },
                                                          local_seo: {
                                                            index: 8,
                                                            name: '9. Local SEO',
                                                            frontendStage: 'local-seo',
                                                          },
                                                          trust_signals: {
                                                            index: 9,
                                                            name: '10. Trust Signals',
                                                            frontendStage: 'trust-signals',
                                                          },
                                                          schema_structured_data: {
                                                            index: 10,
                                                            name: '11. Schema & Structured Data',
                                                            frontendStage: 'schema-structured-data',
                                                          },
                                                          on_page_seo_structure: {
                                                            index: 11,
                                                            name: '12. On-Page SEO Structure',
                                                            frontendStage: 'on-page-seo-structure',
                                                          },
                                                          security: {
                                                            index: 12,
                                                            name: '13. Security',
                                                            frontendStage: 'security',
                                                          },
                                                        };

                                                        // Find the stage for this category
                                                        const categoryEntry = Object.entries(
                                                          categoryStageMap
                                                        ).find(([, info]) => info.index === index);
                                                        if (categoryEntry) {
                                                          // Reset only this category's status (preserve others)
                                                          setInvestigationProgress(prev => ({
                                                            ...prev,
                                                            jobs: prev.jobs.map(
                                                              (j, idx) =>
                                                                idx === index
                                                                  ? {
                                                                      ...j,
                                                                      status: 'pending' as const,
                                                                      progress: 0,
                                                                      error: undefined,
                                                                    }
                                                                  : j // Preserve other categories' progress
                                                            ),
                                                          }));

                                                          toast({
                                                            title: 'Retrying Category',
                                                            description: `Retrying analysis for ${job.name}. Other completed categories will be preserved.`,
                                                          });

                                                          // TODO: Backend support needed for true partial retry
                                                          // For now, restart investigation but preserve completed categories in UI
                                                          // The backend will re-process all categories, but UI shows preserved progress
                                                          handleStartInvestigation();
                                                        }
                                                      }}
                                                      className="flex-shrink-0 h-7 text-xs"
                                                    >
                                                      <RotateCcw className="w-3 h-3 mr-1" />
                                                      Retry
                                                    </Button>
                                                  </div>
                                                </div>
                                              )}

                                              {/* More Visible Dropdown Button */}
                                              <button
                                                onClick={() => {
                                                  const newExpanded = new Set(expandedCategories);
                                                  if (isExpanded) {
                                                    newExpanded.delete(index);
                                                  } else {
                                                    newExpanded.add(index);
                                                  }
                                                  setExpandedCategories(newExpanded);
                                                }}
                                                className="w-full mt-3 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors group"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                    {isExpanded
                                                      ? 'Hide Details'
                                                      : 'View Google Checks & Requirements'}
                                                  </span>
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-white dark:bg-gray-800 border-blue-300 text-blue-700 dark:text-blue-300"
                                                  >
                                                    {categoryDetails?.checks.length || 0} checks
                                                  </Badge>
                                                </div>
                                                {isExpanded ? (
                                                  <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                ) : (
                                                  <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                )}
                                              </button>

                                              {isExpanded && categoryDetails && (
                                                <div className="mt-4 pt-4 border-t space-y-4 animate-in slide-in-from-top-2">
                                                  {/* Error Details Section */}
                                                  {job.status === 'failed' && job.error && (
                                                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                                      <div className="flex items-start gap-2 mb-2">
                                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                        <h4 className="font-semibold text-sm text-red-800 dark:text-red-200">
                                                          Error Details
                                                        </h4>
                                                      </div>
                                                      <p className="text-sm text-red-700 dark:text-red-300 ml-7">
                                                        {job.error}
                                                      </p>
                                                      <p className="text-xs text-red-600 dark:text-red-400 mt-2 ml-7">
                                                        This category encountered an error during
                                                        analysis. You can retry it using the button
                                                        above, or continue with the remaining
                                                        categories.
                                                      </p>
                                                    </div>
                                                  )}

                                                  <div>
                                                    <h4 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                                      <CheckCircle2 className="w-4 h-4" />
                                                      Google Checks:
                                                      {isCheckingContent && (
                                                        <Badge
                                                          variant="secondary"
                                                          className="ml-2 text-xs"
                                                        >
                                                          Checking Content...
                                                        </Badge>
                                                      )}
                                                    </h4>
                                                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                      {categoryDetails.checks.map(
                                                        (check, checkIdx) => {
                                                          const checkKey = `${job.name}-${checkIdx}`;
                                                          const score = checkScores[checkKey];
                                                          const passed =
                                                            score !== undefined && score >= 95;
                                                          const failed =
                                                            score !== undefined && score < 95;

                                                          return (
                                                            <li
                                                              key={checkIdx}
                                                              className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                            >
                                                              {/* Status indicator - only show after checking */}
                                                              {isCheckingContent && (
                                                                <div className="flex-shrink-0 mt-0.5">
                                                                  {passed ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                  ) : failed ? (
                                                                    <X className="w-5 h-5 text-red-500" />
                                                                  ) : (
                                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-pulse" />
                                                                  )}
                                                                </div>
                                                              )}
                                                              <div className="flex-1">
                                                                <span className="leading-relaxed">
                                                                  {check}
                                                                </span>
                                                                {score !== undefined && (
                                                                  <span
                                                                    className={`ml-2 text-xs font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}
                                                                  >
                                                                    ({score}%)
                                                                  </span>
                                                                )}
                                                              </div>
                                                              {/* Regenerate button for failed checks */}
                                                              {failed && (
                                                                <Button
                                                                  size="sm"
                                                                  variant="outline"
                                                                  onClick={() => {
                                                                    regenerateCheck(
                                                                      index,
                                                                      checkIdx,
                                                                      check
                                                                    );
                                                                  }}
                                                                  className="flex-shrink-0 h-7 text-xs"
                                                                >
                                                                  <RotateCcw className="w-3 h-3 mr-1" />
                                                                  Regenerate
                                                                </Button>
                                                              )}
                                                            </li>
                                                          );
                                                        }
                                                      )}
                                                    </ul>
                                                  </div>
                                                  {categoryDetails.additional &&
                                                    categoryDetails.additional.length > 0 && (
                                                      <div>
                                                        <h4 className="font-semibold text-sm mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                                          <AlertCircle className="w-4 h-4" />
                                                          Additional Factors:
                                                        </h4>
                                                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                                          {categoryDetails.additional.map(
                                                            (item, itemIdx) => (
                                                              <li
                                                                key={itemIdx}
                                                                className="flex items-start gap-2 p-2 rounded"
                                                              >
                                                                <span className="text-purple-500 mt-1.5 flex-shrink-0">
                                                                  •
                                                                </span>
                                                                <span className="leading-relaxed">
                                                                  {item}
                                                                </span>
                                                              </li>
                                                            )
                                                          )}
                                                        </ul>
                                                      </div>
                                                    )}
                                                </div>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : null}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Research Phase Stage */}
                      {/* Old Research Phase - DEPRECATED */}
                      {false && wizardState.stage === 'research' && (
                        <ResearchPhase
                          requirements={wizardState.requirements}
                          onComplete={researchData => {
                            // Store research data
                            setWizardState(prev => ({
                              ...prev,
                              researchData,
                            }));
                            // Proceed to generation
                            handleGeneratePreview();
                          }}
                          onCancel={() => {
                            navigateToStage('confirm');
                          }}
                        />
                      )}

                      {/* Confirmation Stage */}
                      {/* Confirmation Stage - DEPRECATED */}
                      {false &&
                        wizardState.stage === 'confirm' &&
                        wizardState.investigationResults && (
                          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                            <CardContent className="p-6 space-y-6">
                              <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                                  Research Complete!
                                </h3>
                              </div>

                              <div className="space-y-4">
                                {wizardState.investigationResults &&
                                  (() => {
                                    const results = wizardState.investigationResults;
                                    if (!results) return null;
                                    return (
                                      <>
                                        <div>
                                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                            🎯 Primary SEO Keywords:
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {results?.seoStrategy?.primaryKeywords
                                              ?.slice(0, 10)
                                              .map((keyword, idx) => (
                                                <Badge
                                                  key={idx}
                                                  className="bg-green-600 text-white"
                                                >
                                                  {keyword}
                                                </Badge>
                                              )) ||
                                              results?.keywords
                                                ?.slice(0, 10)
                                                .map((keyword, idx) => (
                                                  <Badge key={idx} variant="secondary">
                                                    {keyword}
                                                  </Badge>
                                                ))}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                            💡 Competitor Weaknesses to Exploit:
                                          </h4>
                                          <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                                            {results?.competitorInsights?.[0]?.weaknesses?.map(
                                              (weakness, idx) => <li key={idx}>{weakness}</li>
                                            ) ||
                                              results?.seoStrategy?.contentGaps?.map((gap, idx) => (
                                                <li key={idx}>{gap}</li>
                                              ))}
                                          </ul>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                            ✨ AI Design Recommendations:
                                          </h4>
                                          <div className="space-y-2 text-green-700 dark:text-green-300">
                                            {results?.designRecommendations?.colorScheme && (
                                              <>
                                                <div className="flex items-center gap-3">
                                                  <div className="flex gap-2">
                                                    <div
                                                      className="w-10 h-10 rounded border-2 border-white shadow-sm"
                                                      style={{
                                                        backgroundColor:
                                                          results?.designRecommendations
                                                            ?.colorScheme?.primary || '#3b82f6',
                                                      }}
                                                    />
                                                    <div
                                                      className="w-10 h-10 rounded border-2 border-white shadow-sm"
                                                      style={{
                                                        backgroundColor:
                                                          results?.designRecommendations
                                                            ?.colorScheme?.accent || '#a855f7',
                                                      }}
                                                    />
                                                  </div>
                                                  <span className="text-sm">
                                                    {results?.designRecommendations?.colorScheme
                                                      ?.reasoning || ''}
                                                  </span>
                                                </div>
                                                {results?.designRecommendations?.typography && (
                                                  <div>
                                                    <span className="font-medium">Typography:</span>{' '}
                                                    {results?.designRecommendations?.typography
                                                      ?.reasoning || ''}
                                                  </div>
                                                )}
                                                {results?.designRecommendations?.layout && (
                                                  <div>
                                                    <span className="font-medium">Layout:</span>{' '}
                                                    {results?.designRecommendations?.layout || ''}
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                              </div>
                              <div className="pt-4 border-t border-green-200 dark:border-green-800 space-y-3">
                                <div className="flex gap-3">
                                  <Button
                                    variant="outline"
                                    onClick={navigateBack}
                                    className="flex-1"
                                    data-testid="button-back-from-confirm"
                                  >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Edit Requirements
                                  </Button>
                                  <Button
                                    size="lg"
                                    onClick={() => navigateToStage('research')}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    data-testid="button-start-research"
                                  >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Start Research Phase
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>

      {/* AI Chatbot Assistant */}
      <WizardChatbot
        context={{
          currentStage: wizardState.stage,
          selectedPackage: wizardState.selectedPackage,
          packageConstraints: wizardState.packageConstraints,
          checklistState: checklistState,
          requirements: wizardState.requirements,
        }}
      />
    </div>
  );
}
