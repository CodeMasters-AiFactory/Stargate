/**
 * Language Selector Component
 * Select and generate websites in multiple languages
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  locale: string;
}

export interface LanguageSelectorProps {
  websiteId?: string;
  currentHtml?: string;
  onLanguageGenerated?: (language: string, html: string) => void;
}

export function LanguageSelector({
  websiteId,
  currentHtml,
  onLanguageGenerated,
}: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLanguages, setGeneratedLanguages] = useState<Set<string>>(new Set(['en']));

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await fetch('/api/multi-language/languages');
      const data = await response.json();
      if (data.success) {
        setLanguages(data.languages || []);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const handleGenerate = async (langCode?: string) => {
    const targetLang = langCode || selectedLanguage;
    
    if (!currentHtml) {
      toast.error('No website content available');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/multi-language/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: currentHtml,
          targetLanguage: targetLang,
          sourceLanguage: 'en',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedLanguages(prev => new Set([...prev, targetLang]));
        toast.success(`Website generated in ${data.language.nativeName}`);
        if (onLanguageGenerated) {
          onLanguageGenerated(targetLang, data.html);
        }
      } else {
        toast.error(data.error || 'Failed to generate website');
      }
    } catch (error) {
      console.error('Failed to generate website:', error);
      toast.error('Failed to generate website');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!currentHtml) {
      toast.error('No website content available');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/multi-language/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: currentHtml,
          sourceLanguage: 'en',
        }),
      });

      const data = await response.json();
      if (data.success) {
        const allCodes = data.languages.map((l: any) => l.language);
        setGeneratedLanguages(new Set(allCodes));
        toast.success(`Generated websites in ${data.count} languages`);
      } else {
        toast.error(data.error || 'Failed to generate websites');
      }
    } catch (error) {
      console.error('Failed to generate all languages:', error);
      toast.error('Failed to generate websites');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Multi-Language Support
        </CardTitle>
        <CardDescription>
          Generate your website in 15+ languages with RTL support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Language</label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lang.nativeName}</span>
                    <div className="flex items-center gap-2 ml-4">
                      {lang.rtl && <Badge variant="outline" className="text-xs">RTL</Badge>}
                      {generatedLanguages.has(lang.code) && (
                        <Badge variant="default" className="text-xs">Generated</Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !currentHtml}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate {languages.find(l => l.code === selectedLanguage)?.nativeName}
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateAll}
            disabled={isGenerating || !currentHtml}
          >
            <Download className="w-4 h-4 mr-2" />
            Generate All
          </Button>
        </div>

        {/* Generated Languages */}
        {generatedLanguages.size > 1 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Generated Languages</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(generatedLanguages).map(code => {
                const lang = languages.find(l => l.code === code);
                return (
                  <Badge key={code} variant="secondary">
                    {lang?.nativeName || code}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

