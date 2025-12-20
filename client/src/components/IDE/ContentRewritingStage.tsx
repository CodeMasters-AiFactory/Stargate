/**
 * Content Rewriting Stage
 * AI rewrites content using SEO keywords provided by the client
 * Phase 4 of the new wizard workflow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Sparkles,
  Target,
  TrendingUp,
  Tags,
  Search,
} from 'lucide-react';
import type { PageKeywords } from '@/types/websiteBuilder';

interface Section {
  id: string;
  type: string;
  selector: string;
  originalHtml: string;
  rewrittenHtml: string | null;
  status: 'pending' | 'rewriting' | 'completed' | 'error';
}

interface ContentRewritingStageProps {
  html: string;
  pageKeywords: PageKeywords[];  // Keywords per page from Phase 3
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
    services?: string[];
  };
  onComplete: (rewrittenHtml: string) => void;
  onBack?: () => void;
}

export function ContentRewritingStage({
  html,
  pageKeywords,
  businessContext,
  onComplete,
  onBack,
}: ContentRewritingStageProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState(html);
  const [hasStarted, setHasStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get all keywords combined from all pages
  const allKeywords = pageKeywords.flatMap(p => p.keywords);
  const uniqueKeywords = [...new Set(allKeywords)];

  // Extract sections from HTML
  useEffect(() => {
    const extractSections = () => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const extractedSections: Section[] = [];

        // Find all major sections
        const sectionElements = doc.querySelectorAll('section, [class*="section"], main > div, article');
        
        sectionElements.forEach((el, index) => {
          const htmlContent = el.innerHTML || '';
          
          // Skip empty sections
          if (htmlContent.trim().length < 50) return;

          const id = el.id || `section-${index}`;
          const classes = el.className || '';
          const type = detectSectionType(classes, htmlContent);

          extractedSections.push({
            id,
            type,
            selector: id ? `#${id}` : `.${classes.split(' ')[0]}`,
            originalHtml: htmlContent,
            rewrittenHtml: null,
            status: 'pending',
          });
        });

        // If no sections found, create one from body
        if (extractedSections.length === 0) {
          extractedSections.push({
            id: 'main-content',
            type: 'content',
            selector: 'body',
            originalHtml: doc.body?.innerHTML || html,
            rewrittenHtml: null,
            status: 'pending',
          });
        }

        setSections(extractedSections);
      } catch (err) {
        console.error('[ContentRewriting] Error extracting sections:', err);
        setError('Failed to parse HTML sections');
      }
    };

    extractSections();
  }, [html]);

  // Update preview HTML with rewritten sections
  useEffect(() => {
    if (sections.length === 0) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      sections.forEach((section) => {
        if (section.rewrittenHtml) {
          const element = doc.querySelector(section.selector);
          if (element) {
            element.innerHTML = section.rewrittenHtml;
          }
        }
      });

      setPreviewHtml(doc.documentElement.outerHTML);
    } catch (err) {
      console.error('[ContentRewriting] Error updating preview:', err);
    }
  }, [html, sections]);

  // Get relevant keywords for a section type
  const getKeywordsForSection = useCallback((sectionType: string): string[] => {
    // Map section types to page types for keyword matching
    const sectionToPageType: Record<string, string[]> = {
      'hero': ['home'],
      'about': ['about'],
      'features': ['services', 'home'],
      'services': ['services'],
      'testimonials': ['testimonials', 'home'],
      'pricing': ['pricing'],
      'contact': ['contact'],
      'faq': ['faq'],
      'team': ['team', 'about'],
      'gallery': ['gallery', 'portfolio'],
      'content': ['home', 'about'],
      'header': ['home'],
      'footer': ['contact', 'home'],
    };

    const relevantPageTypes = sectionToPageType[sectionType] || ['home'];
    const relevantKeywords: string[] = [];

    // Get keywords from matching page types
    pageKeywords.forEach(page => {
      if (relevantPageTypes.includes(page.type)) {
        relevantKeywords.push(...page.keywords);
      }
    });

    // If no specific keywords found, use all keywords
    if (relevantKeywords.length === 0) {
      return uniqueKeywords.slice(0, 5);
    }

    return [...new Set(relevantKeywords)];
  }, [pageKeywords, uniqueKeywords]);

  // Rewrite single section
  const rewriteSection = useCallback(
    async (section: Section, index: number) => {
      setIsRewriting(true);
      setError(null);

      // Update section status
      setSections((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: 'rewriting' } : s))
      );

      try {
        // Get relevant keywords for this section
        const sectionKeywords = getKeywordsForSection(section.type);

        // Call API to rewrite section with keywords
        const response = await fetch('/api/merge/rewrite-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html: section.originalHtml,
            sectionType: section.type,
            businessContext,
            keywords: sectionKeywords,
            allKeywords: uniqueKeywords,
            pageKeywords: pageKeywords, // Send full page keywords for context
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to rewrite section');
        }

        const data = await response.json();
        const rewrittenHtml = data.rewrittenHtml;

        // Update section with rewritten content
        setSections((prev) =>
          prev.map((s, i) =>
            i === index
              ? { ...s, rewrittenHtml, status: 'completed' }
              : s
          )
        );

        // Wait a bit for animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Move to next section
        if (index < sections.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          // All sections rewritten
          setIsRewriting(false);
        }
      } catch (err) {
        console.error('[ContentRewriting] Error rewriting section:', err);
        setError(err instanceof Error ? err.message : 'Failed to rewrite section');
        
        setSections((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'error' } : s))
        );
        
        setIsRewriting(false);
      }
    },
    [sections, businessContext, getKeywordsForSection, uniqueKeywords, pageKeywords]
  );

  // Start rewriting process
  const startRewriting = () => {
    setHasStarted(true);
    setCurrentIndex(0);
    if (sections.length > 0) {
      rewriteSection(sections[0], 0);
    }
  };

  // Continue to next section
  const continueRewriting = () => {
    if (currentIndex < sections.length - 1 && !isRewriting) {
      rewriteSection(sections[currentIndex + 1], currentIndex + 1);
    }
  };

  // Complete stage
  const handleComplete = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      sections.forEach((section) => {
        if (section.rewrittenHtml) {
          const element = doc.querySelector(section.selector);
          if (element) {
            element.innerHTML = section.rewrittenHtml;
          }
        }
      });

      const finalHtml = doc.documentElement.outerHTML;
      onComplete(finalHtml);
    } catch (err) {
      console.error('[ContentRewriting] Error completing:', err);
      onComplete(html); // Fallback to original HTML
    }
  };

  const currentSection = sections[currentIndex];
  const progress = sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;
  const allComplete = sections.length > 0 && sections.every(s => s.status === 'completed');
  const completedCount = sections.filter((s) => s.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Content Rewriting</h2>
                <p className="text-sm text-slate-400">
                  Merlin is writing SEO-optimized content for {businessContext.businessName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-900/20">
                <FileText className="w-3 h-3 mr-1" />
                {sections.length} Sections
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-400 bg-green-900/20">
                <Search className="w-3 h-3 mr-1" />
                {uniqueKeywords.length} Keywords
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview (LEFT) */}
        <div className="flex-1 flex flex-col border-r border-slate-700 relative">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700">
            <span className="text-sm font-medium text-slate-300">Live Preview</span>
          </div>
          <div className="flex-1 overflow-auto bg-white relative">
            {previewHtml ? (
              <>
                <iframe
                  ref={iframeRef}
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Content Rewriting Preview"
                  sandbox="allow-same-origin allow-scripts"
                />
                {/* Overlay for current section */}
                {currentSection && isRewriting && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <PenTool className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-medium">
                      Rewriting {currentSection.type} section...
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading preview...
              </div>
            )}
          </div>
        </div>

        {/* Controls (RIGHT) */}
        <div className="w-96 flex flex-col bg-slate-800/30">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {!hasStarted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Ready to Write Content?
                </div>
                
                {/* Keywords Summary */}
                <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-cyan-400">
                      <Tags className="w-4 h-4" />
                      <span className="font-medium">Your SEO Keywords:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {uniqueKeywords.slice(0, 10).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-200 text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {uniqueKeywords.length > 10 && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-400 text-xs">
                          +{uniqueKeywords.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pages Summary */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">Pages to Optimize:</span>
                    </div>
                    <div className="space-y-1">
                      {pageKeywords.map((page, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{page.name}</span>
                          <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                            {page.keywords.length} keywords
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <p className="text-sm text-slate-400">
                  AI will rewrite {sections.length} sections with SEO-optimized content 
                  using your keywords.
                </p>
                <Button 
                  onClick={startRewriting} 
                  size="lg" 
                  className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                >
                  <PenTool className="w-4 h-4" />
                  Start Writing Content
                </Button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-white">
                      {completedCount} of {sections.length}
                    </span>
                  </div>
                  <Progress value={progress} className="bg-slate-700" />
                </div>

                {/* Current Section Info */}
                {currentSection && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Current Section</div>
                        <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                          {currentSection.type}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Using Keywords</div>
                        <div className="flex flex-wrap gap-1">
                          {getKeywordsForSection(currentSection.type).slice(0, 4).map((kw, i) => (
                            <Badge key={i} variant="outline" className="border-cyan-600 text-cyan-400 text-xs">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isRewriting && (
                        <div className="flex items-center gap-2 text-sm text-cyan-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Merlin is writing...
                        </div>
                      )}
                      {currentSection.status === 'completed' && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Status */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {isRewriting ? (
                    <Button disabled className="w-full bg-slate-700 text-slate-400">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Writing...
                    </Button>
                  ) : allComplete ? (
                    <Button 
                      onClick={handleComplete} 
                      size="lg" 
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Continue to Images
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={continueRewriting} 
                      className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                    >
                      <PenTool className="w-4 h-4" />
                      Continue Writing
                    </Button>
                  )}
                </div>

                {/* Sections List */}
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    Sections ({completedCount}/{sections.length})
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className={`flex items-center gap-2 text-xs p-2 rounded ${
                          idx === currentIndex ? 'bg-cyan-900/30' : ''
                        }`}
                      >
                        {section.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                        )}
                        {section.status === 'rewriting' && (
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        )}
                        {section.status === 'pending' && (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        {section.status === 'error' && (
                          <AlertCircle className="w-3 h-3 text-red-400" />
                        )}
                        <span className="truncate text-slate-300">{section.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {onBack && (
            <div className="border-t border-slate-700 p-4">
              <Button 
                onClick={onBack} 
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Detect section type from classes and content
 */
function detectSectionType(classes: string, html: string): string {
  const combined = `${classes} ${html}`.toLowerCase();

  if (combined.includes('hero') || combined.includes('banner')) return 'hero';
  if (combined.includes('feature') || combined.includes('service')) return 'features';
  if (combined.includes('about') || combined.includes('story')) return 'about';
  if (combined.includes('testimonial') || combined.includes('review')) return 'testimonials';
  if (combined.includes('pricing') || combined.includes('plan')) return 'pricing';
  if (combined.includes('contact') || combined.includes('form')) return 'contact';
  if (combined.includes('footer')) return 'footer';
  if (combined.includes('header') || combined.includes('nav')) return 'header';
  if (combined.includes('faq')) return 'faq';
  if (combined.includes('team')) return 'team';
  if (combined.includes('gallery') || combined.includes('portfolio')) return 'gallery';

  return 'content';
}
