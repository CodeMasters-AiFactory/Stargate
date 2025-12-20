/**
 * Language Switcher Component
 * Phase 2.4: Multi-language Foundation
 */

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { setLanguage, getLanguage, type SupportedLanguage, initI18n } from '@/lib/i18n';

const languages: Array<{ code: SupportedLanguage; name: string; flag: string }> = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // Initialize i18n on mount
    initI18n();
    setCurrentLang(getLanguage());
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setCurrentLang(lang);
    // Reload page to apply language changes
    window.location.reload();
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <SelectValue>
            {currentLanguage ? (
              <span>{currentLanguage.flag} {currentLanguage.name}</span>
            ) : (
              'Select Language'
            )}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span>{lang.flag} {lang.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

