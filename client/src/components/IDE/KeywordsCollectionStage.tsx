/**
 * Keywords Collection Stage
 * Phase 3: Client specifies which pages they want and keywords for each page
 * This replaces the old content template selection
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Tags,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  Search,
} from 'lucide-react';
import type { PageKeywords, PageType } from '@/types/websiteBuilder';

interface KeywordsCollectionStageProps {
  initialPages?: PageKeywords[];
  businessName?: string;
  industry?: string;
  onComplete: (pages: PageKeywords[]) => void;
  onBack: () => void;
}

const PAGE_TYPES: { value: PageType; label: string; description: string }[] = [
  { value: 'home', label: 'Home', description: 'Main landing page with hero section' },
  { value: 'about', label: 'About Us', description: 'Company history and team info' },
  { value: 'services', label: 'Services', description: 'List of services offered' },
  { value: 'contact', label: 'Contact', description: 'Contact form and information' },
  { value: 'blog', label: 'Blog', description: 'Articles and news posts' },
  { value: 'portfolio', label: 'Portfolio', description: 'Work samples and projects' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing plans and packages' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'team', label: 'Team', description: 'Team members and bios' },
  { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
  { value: 'gallery', label: 'Gallery', description: 'Photo/video gallery' },
  { value: 'custom', label: 'Custom Page', description: 'Custom page with your content' },
];

const DEFAULT_PAGES: PageKeywords[] = [
  { name: 'Home', type: 'home', keywords: [] },
  { name: 'About Us', type: 'about', keywords: [] },
  { name: 'Services', type: 'services', keywords: [] },
  { name: 'Contact', type: 'contact', keywords: [] },
];

export function KeywordsCollectionStage({
  initialPages,
  businessName = 'Your Business',
  industry = '',
  onComplete,
  onBack,
}: KeywordsCollectionStageProps) {
  const [pages, setPages] = useState<PageKeywords[]>(
    initialPages && initialPages.length > 0 ? initialPages : DEFAULT_PAGES
  );
  const [keywordInputs, setKeywordInputs] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Add a new page
  const addPage = useCallback(() => {
    setPages(prev => [
      ...prev,
      { name: '', type: 'custom', keywords: [] }
    ]);
  }, []);

  // Remove a page
  const removePage = useCallback((index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update page name
  const updatePageName = useCallback((index: number, name: string) => {
    setPages(prev => prev.map((page, i) => 
      i === index ? { ...page, name } : page
    ));
  }, []);

  // Update page type
  const updatePageType = useCallback((index: number, type: PageType) => {
    setPages(prev => prev.map((page, i) => {
      if (i !== index) return page;
      const typeInfo = PAGE_TYPES.find(pt => pt.value === type);
      return {
        ...page,
        type,
        name: page.name || typeInfo?.label || ''
      };
    }));
  }, []);

  // Add keyword to a page
  const addKeyword = useCallback((index: number, keyword?: string) => {
    // If keyword not provided, try to get it from state or find the input element
    let keywordToAdd = keyword;
    if (!keywordToAdd || keywordToAdd.trim() === '') {
      keywordToAdd = keywordInputs[index] || '';
      // If still empty, try to find the input element directly using multiple selectors
      if (!keywordToAdd || keywordToAdd.trim() === '') {
        // Try data-page-index first
        let inputElement = document.querySelector(`input[data-page-index="${index}"]`) as HTMLInputElement;
        if (!inputElement || !inputElement.value) {
          // Try finding by placeholder and position
          const allInputs = document.querySelectorAll('input[placeholder*="keyword"], input[placeholder*="Keyword"]');
          if (allInputs[index]) {
            inputElement = allInputs[index] as HTMLInputElement;
          }
        }
        if (inputElement && inputElement.value) {
          keywordToAdd = inputElement.value;
          console.log(`[KeywordsCollectionStage] Read keyword from DOM for page ${index}: "${keywordToAdd}"`);
        }
      }
    }
    
    const trimmed = keywordToAdd.trim().toLowerCase();
    if (!trimmed) {
      console.log(`[KeywordsCollectionStage] No keyword to add for page ${index}`);
      return;
    }
    
    console.log(`[KeywordsCollectionStage] Adding keyword "${trimmed}" to page ${index}`);
    
    setPages(prev => {
      const updated = prev.map((page, i) => {
        if (i !== index) return page;
        if (page.keywords.includes(trimmed)) {
          console.log(`[KeywordsCollectionStage] Keyword "${trimmed}" already exists for page ${index}`);
          return page; // No duplicates
        }
        const newKeywords = [...page.keywords, trimmed];
        console.log(`[KeywordsCollectionStage] Updated page ${index} keywords:`, newKeywords);
        return { ...page, keywords: newKeywords };
      });
      console.log(`[KeywordsCollectionStage] All pages after adding keyword:`, updated);
      return updated;
    });
    
    // Clear input
    setKeywordInputs(prev => ({ ...prev, [index]: '' }));
    // Also clear the DOM input if it exists
    const inputElement = document.querySelector(`input[data-page-index="${index}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }, [keywordInputs]);

  // Remove keyword from a page
  const removeKeyword = useCallback((pageIndex: number, keywordIndex: number) => {
    setPages(prev => prev.map((page, i) => {
      if (i !== pageIndex) return page;
      return { 
        ...page, 
        keywords: page.keywords.filter((_, ki) => ki !== keywordIndex)
      };
    }));
  }, []);

  // Handle keyword input change
  const handleKeywordInputChange = (index: number, value: string) => {
    setKeywordInputs(prev => ({ ...prev, [index]: value }));
  };

  // Handle keyword input keydown (Enter to add)
  const handleKeywordKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(index, keywordInputs[index] || '');
    }
  };

  // Validate and complete
  const handleComplete = () => {
    console.log('[KeywordsCollectionStage] Continue button clicked');
    console.log('[KeywordsCollectionStage] Current pages:', JSON.stringify(pages, null, 2));
    
    // CRITICAL FIX: Before validation, sync any keywords from DOM inputs that might not be in state
    // This handles cases where browser automation or manual typing didn't trigger React onChange
    const allInputs = document.querySelectorAll('input[data-page-index], input[placeholder*="keyword" i], input[placeholder*="Keyword"]');
    console.log(`[KeywordsCollectionStage] Found ${allInputs.length} keyword input elements in DOM`);
    
    let foundKeywords = false;
    allInputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement;
      const pageIndexAttr = htmlInput.getAttribute('data-page-index');
      const value = htmlInput.value?.trim();
      
      if (value) {
        const pageIndex = pageIndexAttr ? parseInt(pageIndexAttr) : -1;
        if (pageIndex >= 0 && pageIndex < pages.length) {
          console.log(`[KeywordsCollectionStage] Found keyword "${value}" in DOM input for page ${pageIndex}`);
          // Check if this keyword is already in the page's keywords array
          const currentPage = pages[pageIndex];
          if (!currentPage.keywords.includes(value.toLowerCase())) {
            console.log(`[KeywordsCollectionStage] Adding keyword "${value}" to page ${pageIndex} from DOM`);
            addKeyword(pageIndex, value);
            foundKeywords = true;
          }
        }
      }
    });
    
    // If we found keywords, wait a moment for state to update
    if (foundKeywords) {
      setTimeout(() => {
        validateAndComplete();
      }, 200);
    } else {
      validateAndComplete();
    }
  };
  
  // Separate validation function
  const validateAndComplete = () => {
    // Re-read pages state (it might have been updated)
    setPages(currentPages => {
      console.log('[KeywordsCollectionStage] Validating pages:', JSON.stringify(currentPages, null, 2));
      
      // Validation
      const validPages = currentPages.filter(p => p.name.trim() !== '');
      console.log('[KeywordsCollectionStage] Valid pages:', JSON.stringify(validPages, null, 2));
      
      if (validPages.length === 0) {
        console.log('[KeywordsCollectionStage] Validation failed: No pages with names');
        setError('Please add at least one page with a name.');
        return currentPages;
      }

      // Auto-add default keywords to pages that don't have any
      const pagesWithKeywords = validPages.map(page => {
        if (page.keywords.length === 0) {
          // Auto-generate a default keyword based on page name
          const defaultKeyword = page.name.toLowerCase().replace(/\s+/g, ' ').trim();
          console.log(`[KeywordsCollectionStage] Auto-adding default keyword "${defaultKeyword}" to page "${page.name}"`);
          return { ...page, keywords: [defaultKeyword] };
        }
        return page;
      });

      console.log('[KeywordsCollectionStage] Validation passed, calling onComplete with pages:', JSON.stringify(pagesWithKeywords, null, 2));
      setError(null);
      onComplete(pagesWithKeywords);
      return currentPages;
    });
  };

  // Calculate total keywords
  const totalKeywords = pages.reduce((sum, page) => sum + page.keywords.length, 0);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Tags className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pages & Keywords</h1>
            <p className="text-sm text-slate-400">
              Define your website pages and SEO keywords for {businessName}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-900/20">
            <FileText className="w-3 h-3 mr-1" />
            {pages.filter(p => p.name.trim()).length} Pages
          </Badge>
          <Badge variant="outline" className="border-green-500 text-green-400 bg-green-900/20">
            <Search className="w-3 h-3 mr-1" />
            {totalKeywords} Keywords
          </Badge>
          {industry && (
            <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-900/20">
              <Sparkles className="w-3 h-3 mr-1" />
              {industry}
            </Badge>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Instructions */}
      <Card className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-slate-300">
                <strong className="text-blue-400">How it works:</strong> Add pages for your website, 
                then add SEO keywords for each page. Our AI will use these keywords to write 
                optimized content that ranks well on Google.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Tip: Use 3-5 keywords per page. Include your main service + location for local SEO 
                (e.g., "plumber atlanta", "emergency plumbing services")
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <div className="flex-1 mb-6">
        {pages.map((page, index) => (
          <div key={index}>
            <Card 
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
            >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                  <div className="flex items-center gap-3 flex-1">
                    {/* Page Type Select */}
                    <Select 
                      value={page.type} 
                      onValueChange={(value: PageType) => updatePageType(index, value)}
                    >
                      <SelectTrigger className="w-[180px] bg-slate-900 border-slate-600">
                        <SelectValue placeholder="Page type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_TYPES.map(pt => (
                          <SelectItem key={pt.value} value={pt.value}>
                            <div className="flex flex-col">
                              <span>{pt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Page Name Input */}
                    <Input
                      value={page.name}
                      onChange={(e) => updatePageName(index, e.target.value)}
                      placeholder="Page name (e.g., Home, About Us)"
                      className="flex-1 bg-slate-900 border-slate-600"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePage(index)}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Keywords Section */}
              <div className="space-y-3">
                <Label className="text-sm text-slate-400 flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  SEO Keywords for this page
                </Label>

                {/* Keywords Tags */}
                {page.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {page.keywords.map((keyword, ki) => (
                      <Badge
                        key={ki}
                        variant="secondary"
                        className="bg-blue-900/40 text-blue-300 border border-blue-700 cursor-pointer hover:bg-red-900/40 hover:text-red-300 hover:border-red-700 transition-colors"
                        onClick={() => removeKeyword(index, ki)}
                      >
                        {keyword}
                        <span className="ml-1 opacity-50">×</span>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Keyword Input */}
                <div className="flex gap-2">
                  <Input
                    value={keywordInputs[index] || ''}
                    onChange={(e) => handleKeywordInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeywordKeyDown(index, e)}
                    placeholder="Type a keyword and press Enter"
                    className="flex-1 bg-slate-900 border-slate-600"
                    data-page-index={index}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      // Read directly from the sibling input element
                      const inputElement = e.currentTarget.previousElementSibling as HTMLInputElement;
                      // Also try finding by data-page-index attribute
                      const inputByAttr = document.querySelector(`input[data-page-index="${index}"]`) as HTMLInputElement;
                      const domValue = inputElement?.value || inputByAttr?.value || '';
                      const stateValue = keywordInputs[index] || '';
                      const value = domValue || stateValue;
                      
                      console.log(`[KeywordsCollectionStage] Add button clicked for page ${index}, value from DOM: "${domValue}", from state: "${stateValue}", using: "${value}"`);
                      
                      if (value.trim()) {
                        addKeyword(index, value);
                      } else {
                        console.log(`[KeywordsCollectionStage] No value found to add for page ${index}`);
                      }
                    }}
                    className="border-slate-600 hover:bg-blue-900/30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Keyword Suggestions */}
                {page.keywords.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Suggested: "{page.name.toLowerCase()} {industry?.toLowerCase() || 'services'}", 
                    "best {page.name.toLowerCase()}", "{businessName.toLowerCase()} {page.name.toLowerCase()}"
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Bright Neon Blue Divider Between Pages */}
          {index < pages.length - 1 && (
            <div className="h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-6 opacity-100 shadow-2xl shadow-cyan-400/80 animate-pulse"></div>
          )}
          </div>
        ))}

        {/* Add Page Button */}
        <Button
          variant="outline"
          onClick={addPage}
          className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Page
        </Button>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 text-slate-300 border-slate-600 hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Template
        </Button>

        <div className="flex items-center gap-4">
          {pages.filter(p => p.name.trim() && p.keywords.length > 0).length === pages.filter(p => p.name.trim()).length && pages.some(p => p.name.trim()) && (
            <Badge variant="outline" className="border-green-500 text-green-400 bg-green-900/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Ready to continue
            </Badge>
          )}
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[KeywordsCollectionStage] Button clicked, calling handleComplete');
              handleComplete();
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white gap-2"
            type="button"
          >
            Continue to Content Rewriting
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

