/**
 * Image Replacement Stage
 * One-by-one Leonardo AI image generation
 * Shows progress as each image is replaced
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
} from 'lucide-react';

interface ImageInfo {
  src: string;
  alt: string;
  section: string;
  prompt: string;
}

interface ImageReplacementStageProps {
  mergedHtml: string;
  images: ImageInfo[];
  businessContext?: {
    industry?: string;
    businessName?: string;
    location?: string;
  };
  onComplete: (updatedHtml: string) => void;
  onBack?: () => void;
}

export function ImageReplacementStage({
  mergedHtml,
  images,
  businessContext,
  onComplete,
  onBack,
}: ImageReplacementStageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replacedImages, setReplacedImages] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState(mergedHtml);
  const [hasStarted, setHasStarted] = useState(false);

  // Update preview HTML when images are replaced
  useEffect(() => {
    let updatedHtml = mergedHtml;
    replacedImages.forEach((newSrc, oldSrc) => {
      updatedHtml = updatedHtml.replace(new RegExp(oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newSrc);
    });
    setPreviewHtml(updatedHtml);
  }, [mergedHtml, replacedImages]);

  // Replace single image
  const replaceImage = useCallback(
    async (image: ImageInfo, index: number) => {
      setIsGenerating(true);
      setError(null);

      try {
        // Generate prompt if not available
        let prompt = image.prompt;
        if (!prompt) {
          // Analyze single image to generate prompt
          try {
            const analyzeResponse = await fetch('/api/merge/analyze-images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mergedTemplate: { html: mergedHtml },
                businessContext,
                singleImageSrc: image.src,
              }),
            });

            if (analyzeResponse.ok) {
              const analyzed = await analyzeResponse.json();
              if (analyzed.analyses && analyzed.analyses.length > 0) {
                prompt = analyzed.analyses[0].prompt;
              }
            }
          } catch (analyzeErr) {
            console.warn('[ImageReplacement] Failed to analyze image, using fallback prompt:', analyzeErr);
          }

          // Fallback prompt if analysis failed
          if (!prompt) {
            prompt = `Professional ${image.section} image for ${businessContext?.businessName || 'business'} in ${businessContext?.industry || 'business'} industry${image.alt ? `: ${image.alt}` : ''}`;
          }
        }

        // Call API to generate image
        const response = await fetch('/api/merge/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            section: image.section,
            businessContext,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const data = await response.json();
        const newImageUrl = data.imageUrl;

        // Update replaced images map
        setReplacedImages((prev) => {
          const next = new Map(prev);
          next.set(image.src, newImageUrl);
          return next;
        });

        // Move to next image
        if (index < images.length - 1) {
          setCurrentIndex(index + 1);
        } else {
          // All images replaced
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('[ImageReplacement] Error generating image:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate image');
        setIsGenerating(false);
      }
    },
    [images, businessContext, mergedHtml]
  );

  // Start generation process
  const startGeneration = () => {
    setHasStarted(true);
    setCurrentIndex(0);
    if (images.length > 0) {
      replaceImage(images[0], 0);
    }
  };

  // Continue to next image
  const continueGeneration = () => {
    if (currentIndex < images.length - 1) {
      replaceImage(images[currentIndex + 1], currentIndex + 1);
    }
  };

  // Skip current image
  const skipImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Complete stage
  const handleComplete = () => {
    let finalHtml = mergedHtml;
    replacedImages.forEach((newSrc, oldSrc) => {
      finalHtml = finalHtml.replace(new RegExp(oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newSrc);
    });
    onComplete(finalHtml);
  };

  const currentImage = images[currentIndex];
  const progress = images.length > 0 ? ((currentIndex + 1) / images.length) * 100 : 0;
  const allComplete = currentIndex >= images.length - 1 && !isGenerating;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Generate Custom Images</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Replace template images with AI-generated ones tailored to your business
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <ImageIcon className="w-3 h-3" />
              {images.length} Images
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview (LEFT) */}
        <div className="flex-1 flex flex-col border-r">
          <div className="bg-muted/50 px-4 py-2 border-b">
            <span className="text-sm font-medium">Preview</span>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading preview...
              </div>
            )}
          </div>
        </div>

        {/* Controls (RIGHT) */}
        <div className="w-96 flex flex-col border-l bg-muted/30">
          <div className="p-6 space-y-6">
            {!hasStarted ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Ready to Generate Images?
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll replace {images.length} images one by one using Leonardo AI. Each image will be
                  tailored to your business context.
                </p>
                <Button onClick={startGeneration} size="lg" className="w-full gap-2">
                  <Wand2 className="w-4 h-4" />
                  Start Image Generation
                </Button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {currentIndex + 1} of {images.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>

                {/* Current Image Info */}
                {currentImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Section</div>
                        <Badge variant="secondary">{currentImage.section}</Badge>
                      </div>
                      {currentImage.alt && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Description</div>
                          <p className="text-sm">{currentImage.alt}</p>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">AI Prompt</div>
                        <p className="text-xs bg-muted p-2 rounded">{currentImage.prompt}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status */}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating image {currentIndex + 1}...
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {isGenerating ? (
                    <Button disabled className="w-full">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </Button>
                  ) : allComplete ? (
                    <Button onClick={handleComplete} size="lg" className="w-full gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Continue to Content Rewriting
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <>
                      <Button onClick={continueGeneration} className="w-full gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Generate Next Image
                      </Button>
                      <Button onClick={skipImage} variant="outline" className="w-full">
                        Skip This Image
                      </Button>
                    </>
                  )}
                </div>

                {/* Replaced Images List */}
                {replacedImages.size > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Completed ({replacedImages.size})</div>
                    <div className="space-y-1">
                      {Array.from(replacedImages.keys()).map((_src, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="truncate">Image {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {onBack && (
            <div className="border-t p-4">
              <Button onClick={onBack} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

