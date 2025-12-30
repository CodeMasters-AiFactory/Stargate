/**
 * Image Generation Stage
 * Phase 5: Leonardo AI replaces images and videos in the website
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Wand2,
  Camera,
  Video,
} from 'lucide-react';
import type { GeneratedImage, PageKeywords } from '@/types/websiteBuilder';

interface DetectedImage {
  id: string;
  originalSrc: string;
  alt: string;
  section: string;
  width?: number;
  height?: number;
  type: 'image' | 'background' | 'video';
  prompt?: string;
  newUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error' | 'skipped';
  error?: string;
}

interface ImageGenerationStageProps {
  html: string;
  pageKeywords: PageKeywords[];
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
    services?: string[];
  };
  onComplete: (updatedHtml: string, generatedImages: GeneratedImage[]) => void;
  onBack?: () => void;
}

export function ImageGenerationStage({
  html,
  pageKeywords,
  businessContext,
  onComplete,
  onBack,
}: ImageGenerationStageProps) {
  const [images, setImages] = useState<DetectedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState(html);
  const [hasStarted, setHasStarted] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get all keywords for context
  const allKeywords = pageKeywords.flatMap(p => p.keywords);

  // Detect images in HTML
  useEffect(() => {
    const detectImages = () => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const detected: DetectedImage[] = [];
        let idCounter = 0;

        // Find all img elements
        doc.querySelectorAll('img').forEach((img) => {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          
          // Skip placeholder images or data URIs
          if (src.startsWith('data:') || src.includes('placeholder')) {
            return;
          }

          // Detect section from parent
          const section = detectSection(img);

          detected.push({
            id: `img-${idCounter++}`,
            originalSrc: src,
            alt,
            section,
            width: img.width || 0,
            height: img.height || 0,
            type: 'image',
            status: 'pending',
          });
        });

        // Find background images
        doc.querySelectorAll('[style*="background"]').forEach((el) => {
          const style = el.getAttribute('style') || '';
          const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match && match[1]) {
            const src = match[1];
            if (!src.startsWith('data:')) {
              detected.push({
                id: `bg-${idCounter++}`,
                originalSrc: src,
                alt: 'Background image',
                section: detectSection(el),
                type: 'background',
                status: 'pending',
              });
            }
          }
        });

        // Find video elements
        doc.querySelectorAll('video source, video').forEach((el) => {
          const src = el.getAttribute('src') || el.getAttribute('poster') || '';
          if (src && !src.startsWith('data:')) {
            detected.push({
              id: `vid-${idCounter++}`,
              originalSrc: src,
              alt: 'Video thumbnail',
              section: detectSection(el),
              type: 'video',
              status: 'pending',
            });
          }
        });

        setImages(detected);
      } catch (err) {
        console.error('[ImageGeneration] Error detecting images:', err);
        setError('Failed to detect images in HTML');
      }
    };

    detectImages();
  }, [html]);

  // Generate prompt for image
  const generatePrompt = useCallback((image: DetectedImage): string => {
    const { section, alt, type } = image;
    const { businessName, industry, location } = businessContext;

    // Section-specific prompts
    const sectionPrompts: Record<string, string> = {
      hero: `Professional hero image for ${businessName}, ${industry || 'business'} company${location ? ` in ${location}` : ''}. Modern, high-quality, inspiring business photograph. 16:9 aspect ratio.`,
      about: `Professional team or office photo for ${businessName}. Authentic, warm, inviting business atmosphere. Shows professionalism and expertise.`,
      services: `High-quality service illustration for ${industry || 'professional'} services. Clean, modern, professional imagery representing quality work.`,
      features: `Feature highlight image for ${businessName}. Clean, modern design showing ${allKeywords.slice(0, 3).join(', ') || 'professional services'}.`,
      testimonials: `Customer success imagery for ${businessName}. Happy, satisfied customers. Professional and trustworthy appearance.`,
      contact: `Contact section image for ${businessName}. Professional, welcoming, approachable business setting.`,
      gallery: `Portfolio/gallery image for ${industry || 'business'} company. High-quality work showcase.`,
      team: `Professional team member portrait. Modern business headshot with friendly, professional appearance.`,
      background: `Abstract professional background for ${industry || 'business'} website. Subtle, elegant, modern gradient or pattern.`,
    };

    let basePrompt = sectionPrompts[section] || sectionPrompts.hero;

    // Add alt text context if available
    if (alt && alt.length > 5) {
      basePrompt += ` Context: ${alt}.`;
    }

    // Add keywords for SEO context
    if (allKeywords.length > 0) {
      basePrompt += ` Keywords: ${allKeywords.slice(0, 5).join(', ')}.`;
    }

    // Video-specific adjustments
    if (type === 'video') {
      basePrompt = `Video thumbnail/poster: ${basePrompt}`;
    }

    return basePrompt;
  }, [businessContext, allKeywords]);

  // Generate single image
  const generateImage = useCallback(
    async (image: DetectedImage, index: number) => {
      setIsGenerating(true);
      setError(null);

      // Update status
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, status: 'generating' } : img))
      );

      try {
        const prompt = generatePrompt(image);

        // Call Leonardo API
        const response = await fetch('/api/website-builder/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            originalUrl: image.originalSrc,
            section: image.section,
            type: image.type,
            businessContext,
            width: image.width || 1024,
            height: image.height || 768,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();

        // Update image with new URL
        setImages((prev) =>
          prev.map((img, i) =>
            i === index
              ? { ...img, newUrl: data.imageUrl, prompt, status: 'completed' }
              : img
          )
        );

        // Update preview HTML
        updatePreviewHtml(image.id, data.imageUrl);

        // Small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Move to next image
        if (index < images.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('[ImageGeneration] Error:', err);
        
        setImages((prev) =>
          prev.map((img, i) =>
            i === index
              ? { ...img, status: 'error', error: err instanceof Error ? err.message : 'Generation failed' }
              : img
          )
        );

        // Continue to next image even on error
        if (index < images.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          setIsGenerating(false);
        }
      }
    },
    [images, businessContext, generatePrompt]
  );

  // Update preview HTML with new image
  const updatePreviewHtml = (imageId: string, newUrl: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(previewHtml, 'text/html');

      if (image.type === 'image') {
        // Find and update img element
        const imgEl = doc.querySelector(`img[src="${image.originalSrc}"]`);
        if (imgEl) {
          imgEl.setAttribute('src', newUrl);
        }
      } else if (image.type === 'background') {
        // Find and update background image
        doc.querySelectorAll('[style*="background"]').forEach((el) => {
          const style = el.getAttribute('style') || '';
          if (style.includes(image.originalSrc)) {
            el.setAttribute('style', style.replace(image.originalSrc, newUrl));
          }
        });
      } else if (image.type === 'video') {
        // Update video poster or source
        const videoEl = doc.querySelector(`video[poster="${image.originalSrc}"]`);
        if (videoEl) {
          videoEl.setAttribute('poster', newUrl);
        }
      }

      setPreviewHtml(doc.documentElement.outerHTML);
    } catch (err) {
      console.error('[ImageGeneration] Error updating preview:', err);
    }
  };

  // Start generation
  const startGenerating = () => {
    setHasStarted(true);
    setCurrentIndex(0);
    if (images.length > 0) {
      generateImage(images[0], 0);
    }
  };

  // Continue generation
  const continueGenerating = () => {
    if (currentIndex < images.length - 1 && !isGenerating) {
      generateImage(images[currentIndex + 1], currentIndex + 1);
    }
  };

  // Skip current image
  const skipImage = () => {
    setImages((prev) =>
      prev.map((img, i) => (i === currentIndex ? { ...img, status: 'skipped' } : img))
    );
    
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsGenerating(false);
    }
  };

  // Retry failed image
  const retryImage = (index: number) => {
    setCurrentIndex(index);
    generateImage(images[index], index);
  };

  // Complete stage
  const handleComplete = () => {
    const generatedImages: GeneratedImage[] = images
      .filter((img) => img.status === 'completed' && img.newUrl)
      .map((img) => ({
        originalUrl: img.originalSrc,
        newUrl: img.newUrl!,
        alt: img.alt,
        section: img.section,
        prompt: img.prompt || '',
      }));

    onComplete(previewHtml, generatedImages);
  };

  const currentImage = images[currentIndex];
  const progress = images.length > 0 ? ((currentIndex + 1) / images.length) * 100 : 0;
  const completedCount = images.filter((img) => img.status === 'completed').length;
  const errorCount = images.filter((img) => img.status === 'error').length;
  const allDone = images.length > 0 && images.every((img) => ['completed', 'skipped', 'error'].includes(img.status));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Image Generation</h2>
                <p className="text-sm text-slate-400">
                  AI is creating custom images for {businessContext.businessName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-900/20">
                <ImageIcon className="w-3 h-3 mr-1" />
                {images.filter((i) => i.type === 'image').length} Images
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-900/20">
                <Camera className="w-3 h-3 mr-1" />
                {images.filter((i) => i.type === 'background').length} Backgrounds
              </Badge>
              {images.filter((i) => i.type === 'video').length > 0 && (
                <Badge variant="outline" className="border-pink-500 text-pink-400 bg-pink-900/20">
                  <Video className="w-3 h-3 mr-1" />
                  {images.filter((i) => i.type === 'video').length} Videos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {showOriginal ? 'Original' : 'Updated'} Preview
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-slate-400 hover:text-white"
            >
              {showOriginal ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
              {showOriginal ? 'Show Updated' : 'Show Original'}
            </Button>
          </div>
          <div className="flex-1 overflow-auto bg-white relative">
            <iframe
              ref={iframeRef}
              srcDoc={showOriginal ? html : previewHtml}
              className="w-full h-full border-0"
              title="Image Generation Preview"
              sandbox="allow-same-origin allow-scripts"
            />
            {currentImage && isGenerating && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <Wand2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">
                  Generating {currentImage.section} {currentImage.type}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-96 flex flex-col bg-slate-800/30">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {!hasStarted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  Ready to Generate Images?
                </div>

                {images.length === 0 ? (
                  <Card className="bg-yellow-900/30 border-yellow-500/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">No images detected in template</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        The template doesn't have any images to replace. You can continue to the next step.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="bg-gradient-to-br from-orange-900/30 to-pink-900/30 border-orange-500/30">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                          <Wand2 className="w-4 h-4" />
                          <span className="font-medium">AI will generate:</span>
                        </div>
                        <div className="space-y-2">
                          {images.slice(0, 5).map((img) => (
                            <div key={img.id} className="flex items-center gap-2 text-xs text-slate-300">
                              {img.type === 'image' && <ImageIcon className="w-3 h-3 text-blue-400" />}
                              {img.type === 'background' && <Camera className="w-3 h-3 text-purple-400" />}
                              {img.type === 'video' && <Video className="w-3 h-3 text-pink-400" />}
                              <span className="capitalize">{img.section}</span>
                              <span className="text-slate-500">({img.type})</span>
                            </div>
                          ))}
                          {images.length > 5 && (
                            <div className="text-xs text-slate-500">
                              +{images.length - 5} more images
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <p className="text-sm text-slate-400">
                      AI will create {images.length} custom {images.length === 1 ? 'image' : 'images'} tailored 
                      to your business and industry.
                    </p>
                  </>
                )}

                <Button
                  onClick={images.length > 0 ? startGenerating : handleComplete}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500"
                >
                  {images.length > 0 ? (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Start Generating Images
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Skip to SEO Assessment
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium text-white">
                      {completedCount} of {images.length}
                    </span>
                  </div>
                  <Progress value={progress} className="bg-slate-700" />
                </div>

                {/* Current Image */}
                {currentImage && !allDone && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Current Image</div>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-200 capitalize">
                            {currentImage.section} {currentImage.type}
                          </Badge>
                        </div>
                        {isGenerating && (
                          <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                        )}
                      </div>
                      
                      {/* Original image preview */}
                      {currentImage.originalSrc && (
                        <div className="mt-2">
                          <div className="text-xs text-slate-500 mb-1">Original</div>
                          <img
                            src={currentImage.originalSrc}
                            alt={currentImage.alt}
                            className="w-full h-24 object-cover rounded border border-slate-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {isGenerating && (
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          AI is creating...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Error display */}
                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {isGenerating ? (
                    <div className="space-y-2">
                      <Button disabled className="w-full bg-slate-700 text-slate-400">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </Button>
                      <Button
                        variant="outline"
                        onClick={skipImage}
                        className="w-full border-slate-600 text-slate-300"
                      >
                        Skip This Image
                      </Button>
                    </div>
                  ) : allDone ? (
                    <Button
                      onClick={handleComplete}
                      size="lg"
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Continue to SEO Assessment
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={continueGenerating}
                      className="w-full gap-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500"
                    >
                      <Wand2 className="w-4 h-4" />
                      Continue Generating
                    </Button>
                  )}
                </div>

                {/* Images List */}
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    Images ({completedCount}/{images.length})
                    {errorCount > 0 && (
                      <span className="text-red-400 ml-2">({errorCount} failed)</span>
                    )}
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className={`flex items-center justify-between text-xs p-2 rounded ${
                          idx === currentIndex ? 'bg-orange-900/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {img.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          )}
                          {img.status === 'generating' && (
                            <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
                          )}
                          {img.status === 'pending' && (
                            <div className="w-3 h-3 rounded-full border border-slate-600" />
                          )}
                          {img.status === 'error' && (
                            <AlertCircle className="w-3 h-3 text-red-400" />
                          )}
                          {img.status === 'skipped' && (
                            <div className="w-3 h-3 rounded-full bg-slate-600" />
                          )}
                          <span className="truncate text-slate-300 capitalize">
                            {img.section}
                          </span>
                          <span className="text-slate-500">({img.type})</span>
                        </div>
                        {img.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryImage(idx)}
                            className="h-6 px-2 text-orange-400 hover:text-orange-300"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
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
                Back to Content
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Detect section from element's parent hierarchy
 */
function detectSection(element: Element): string {
  let current: Element | null = element;
  while (current) {
    const className = current.className?.toLowerCase() || '';
    const id = current.id?.toLowerCase() || '';
    const combined = `${className} ${id}`;

    if (combined.includes('hero') || combined.includes('banner')) return 'hero';
    if (combined.includes('about') || combined.includes('story')) return 'about';
    if (combined.includes('service') || combined.includes('feature')) return 'services';
    if (combined.includes('testimonial') || combined.includes('review')) return 'testimonials';
    if (combined.includes('team')) return 'team';
    if (combined.includes('contact')) return 'contact';
    if (combined.includes('gallery') || combined.includes('portfolio')) return 'gallery';
    if (combined.includes('footer')) return 'footer';
    if (combined.includes('header') || combined.includes('nav')) return 'header';

    current = current.parentElement;
  }
  return 'general';
}

