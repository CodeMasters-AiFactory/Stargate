/**
 * Internationalization (i18n) Service
 * Phase 2.4: Multi-language Foundation
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ar';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface Translations {
  [language: string]: TranslationKey;
}

// Default translations (English)
const defaultTranslations: TranslationKey = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    projects: 'Projects',
    settings: 'Settings',
    templates: 'Templates',
    components: 'Components',
  },
  websiteBuilder: {
    generate: 'Generate Website',
    preview: 'Preview',
    publish: 'Publish',
    save: 'Save Website',
    export: 'Export Code',
  },
  emailMarketing: {
    campaigns: 'Campaigns',
    subscribers: 'Subscribers',
    templates: 'Templates',
    analytics: 'Analytics',
    createCampaign: 'Create Campaign',
    sendCampaign: 'Send Campaign',
  },
};

// Store for loaded translations
const translations: Translations = {
  en: defaultTranslations,
};

// Current language
let currentLanguage: SupportedLanguage = 'en';

/**
 * Get translation for a key
 */
export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[currentLanguage] || translations.en;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return params[paramKey] || `{{${paramKey}}}`;
    });
  }
  
  return value;
}

/**
 * Set current language
 */
export function setLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', lang);
  }
}

/**
 * Get current language
 */
export function getLanguage(): SupportedLanguage {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('preferred-language') as SupportedLanguage;
    if (saved) {
      currentLanguage = saved;
    }
  }
  return currentLanguage;
}

/**
 * Load translations for a language
 */
export async function loadTranslations(lang: SupportedLanguage): Promise<void> {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (response.ok) {
      const data = await response.json();
      translations[lang] = { ...defaultTranslations, ...data };
    }
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, using English fallback`);
  }
}

/**
 * Initialize i18n system
 */
export function initI18n(): void {
  // Detect browser language
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    const savedLang = localStorage.getItem('preferred-language') as SupportedLanguage;
    const lang = savedLang || (['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'].includes(browserLang) ? browserLang : 'en');
    setLanguage(lang);
    loadTranslations(lang);
  }
}

