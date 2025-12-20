/**
 * Multi-Language Website Generator
 * Generate websites in 10+ languages with RTL support
 */

import * as cheerio from 'cheerio';
import { getErrorMessage, logError } from '../utils/errorHandler';

export type SupportedLanguage = 
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'nl' // Dutch
  | 'ru' // Russian
  | 'zh' // Chinese
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'ar' // Arabic (RTL)
  | 'he' // Hebrew (RTL)
  | 'hi' // Hindi
  | 'tr' // Turkish;

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, locale: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, locale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, locale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, locale: 'de-DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, locale: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, locale: 'pt-BR' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, locale: 'nl-NL' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, locale: 'ru-RU' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, locale: 'zh-CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, locale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, locale: 'ko-KR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, locale: 'ar-SA' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true, locale: 'he-IL' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, locale: 'hi-IN' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false, locale: 'tr-TR' },
];

// Simple translation dictionary (in production, use proper translation API)
const TRANSLATION_DICT: Record<string, Record<SupportedLanguage, string>> = {
  'Get Started': {
    en: 'Get Started',
    es: 'Comenzar',
    fr: 'Commencer',
    de: 'Loslegen',
    it: 'Inizia',
    pt: 'Começar',
    nl: 'Aan de slag',
    ru: 'Начать',
    zh: '开始',
    ja: '始める',
    ko: '시작하기',
    ar: 'ابدأ',
    he: 'התחל',
    hi: 'शुरू करें',
    tr: 'Başla',
  },
  'Learn More': {
    en: 'Learn More',
    es: 'Saber más',
    fr: 'En savoir plus',
    de: 'Mehr erfahren',
    it: 'Scopri di più',
    pt: 'Saiba mais',
    nl: 'Meer informatie',
    ru: 'Узнать больше',
    zh: '了解更多',
    ja: '詳細を見る',
    ko: '더 알아보기',
    ar: 'اعرف المزيد',
    he: 'למד עוד',
    hi: 'और जानें',
    tr: 'Daha fazla bilgi',
  },
  'Contact Us': {
    en: 'Contact Us',
    es: 'Contáctanos',
    fr: 'Contactez-nous',
    de: 'Kontaktieren Sie uns',
    it: 'Contattaci',
    pt: 'Entre em contato',
    nl: 'Neem contact op',
    ru: 'Свяжитесь с нами',
    zh: '联系我们',
    ja: 'お問い合わせ',
    ko: '문의하기',
    ar: 'اتصل بنا',
    he: 'צור קשר',
    hi: 'संपर्क करें',
    tr: 'İletişime geçin',
  },
};

/**
 * Translate text to target language
 */
export async function translateText(
  text: string,
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'en'
): Promise<string> {
  if (targetLanguage === sourceLanguage) {
    return text;
  }

  // Check dictionary first
  if (TRANSLATION_DICT[text] && TRANSLATION_DICT[text][targetLanguage]) {
    return TRANSLATION_DICT[text][targetLanguage];
  }

  // For production, integrate with translation API (Google Translate, DeepL, etc.)
  // For now, return original text with a note
  console.log(`[MultiLanguageGenerator] Translation needed: "${text}" -> ${targetLanguage}`);
  return text; // Placeholder - would use actual translation service
}

/**
 * Generate multi-language website
 */
export async function generateMultiLanguageWebsite(
  html: string,
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'en'
): Promise<{
  html: string;
  language: LanguageConfig;
  rtl: boolean;
}> {
  try {
    const language = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
    if (!language) {
      throw new Error(`Unsupported language: ${targetLanguage}`);
    }

    const $ = cheerio.load(html);

    // Set language attribute
    $('html').attr('lang', targetLanguage);
    $('html').attr('dir', language.rtl ? 'rtl' : 'ltr');

    // Update meta tags
    $('meta[name="language"]').attr('content', targetLanguage);
    if (!$('meta[name="language"]').length) {
      $('head').prepend(`<meta name="language" content="${targetLanguage}">`);
    }

    // Translate text content
    const textElements = $('h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, td, th');
    
    for (let i = 0; i < textElements.length; i++) {
      const element = textElements.eq(i);
      const originalText = element.text().trim();
      
      if (originalText && originalText.length > 0) {
        const translated = await translateText(originalText, targetLanguage, sourceLanguage);
        element.text(translated);
      }
    }

    // Translate alt text
    $('img').each((_, el) => {
      const $img = $(el);
      const alt = $img.attr('alt');
      if (alt) {
        translateText(alt, targetLanguage, sourceLanguage).then(translated => {
          $img.attr('alt', translated);
        });
      }
    });

    // Translate placeholder text
    $('input[placeholder], textarea[placeholder]').each((_, el) => {
      const $input = $(el);
      const placeholder = $input.attr('placeholder');
      if (placeholder) {
        translateText(placeholder, targetLanguage, sourceLanguage).then(translated => {
          $input.attr('placeholder', translated);
        });
      }
    });

    // Add RTL styles if needed
    if (language.rtl) {
      if (!$('head style[data-rtl]').length) {
        $('head').append(`
          <style data-rtl>
            body { direction: rtl; text-align: right; }
            .text-left { text-align: right !important; }
            .text-right { text-align: left !important; }
            .ml-auto { margin-left: 0 !important; margin-right: auto !important; }
            .mr-auto { margin-right: 0 !important; margin-left: auto !important; }
          </style>
        `);
      }
    }

    // Add language switcher component
    if (!$('.language-switcher').length) {
      const switcher = generateLanguageSwitcher(targetLanguage);
      $('body').prepend(switcher);
    }

    return {
      html: $.html(),
      language,
      rtl: language.rtl,
    };
  } catch (error) {
    logError(error, 'MultiLanguageGenerator - GenerateWebsite');
    throw new Error(`Failed to generate multi-language website: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate language switcher component
 */
function generateLanguageSwitcher(currentLanguage: SupportedLanguage): string {
  const languages = SUPPORTED_LANGUAGES.map(lang => ({
    code: lang.code,
    name: lang.nativeName,
    current: lang.code === currentLanguage,
  }));

  return `
    <div class="language-switcher" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
      <select id="language-selector" style="padding: 8px 12px; border-radius: 4px; border: 1px solid #ccc;">
        ${languages.map(lang => 
          `<option value="${lang.code}" ${lang.current ? 'selected' : ''}>${lang.name}</option>`
        ).join('')}
      </select>
      <script>
        document.getElementById('language-selector').addEventListener('change', function(e) {
          const lang = e.target.value;
          const url = new URL(window.location);
          url.searchParams.set('lang', lang);
          window.location.href = url.toString();
        });
      </script>
    </div>
  `;
}

/**
 * Get SEO metadata for language
 */
export function getLanguageSEOMetadata(language: SupportedLanguage, baseMetadata: {
  title?: string;
  description?: string;
}): {
  title: string;
  description: string;
  hreflang: string;
} {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === language);
  
  return {
    title: baseMetadata.title || 'Website',
    description: baseMetadata.description || '',
    hreflang: lang?.locale || language,
  };
}

console.log('[MultiLanguageGenerator] 🌍 Service loaded - 15 languages supported');

