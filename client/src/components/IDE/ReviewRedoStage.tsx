/**
 * Review & Redo Stage
 * Phase 7: Client can review and request changes to content or images
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  ArrowLeft,
  PenTool,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2,
  FileText,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Eye,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import type { PageKeywords, SEOAssessmentResult, RedoRequest } from '@/types/websiteBuilder';

interface ReviewRedoStageProps {
  html: string;
  pageKeywords: PageKeywords[];
  seoAssessment?: SEOAssessmentResult;
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
  };
  onRedoContent: (request: RedoRequest) => void;
  onRedoImages: (request: RedoRequest) => void;
  onApprove: () => void;
  onBack?: () => void;
}

export function ReviewRedoStage({
  html,
  pageKeywords,
  seoAssessment,
  businessContext,
  onRedoContent,
  onRedoImages,
  onApprove,
  onBack,
}: ReviewRedoStageProps) {
  const [showRedoContentDialog, setShowRedoContentDialog] = useState(false);
  const [showRedoImagesDialog, setShowRedoImagesDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle page selection
  const togglePage = (pageName: string) => {
    setSelectedPages((prev) =>
      prev.includes(pageName)
        ? prev.filter((p) => p !== pageName)
        : [...prev, pageName]
    );
  };

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(pageKeywords.map((p) => p.name));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedPages([]);
    setFeedback('');
  };

  // Handle content redo request
  const handleRedoContent = () => {
    const request: RedoRequest = {
      type: 'content',
      pages: selectedPages.length > 0 ? selectedPages : pageKeywords.map((p) => p.name),
      feedback: feedback || undefined,
    };
    onRedoContent(request);
    setShowRedoContentDialog(false);
    clearSelection();
  };

  // Handle images redo request
  const handleRedoImages = () => {
    const request: RedoRequest = {
      type: 'images',
      pages: selectedPages.length > 0 ? selectedPages : pageKeywords.map((p) => p.name),
      feedback: feedback || undefined,
    };
    onRedoImages(request);
    setShowRedoImagesDialog(false);
    clearSelection();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Review Your Website</h2>
                <p className="text-sm text-slate-400">
                  Review and request changes before final approval
                </p>
              </div>
            </div>
            {seoAssessment && (
              <Badge 
                variant="outline" 
                className={`text-lg px-4 py-1 ${
                  seoAssessment.overallScore >= 80 
                    ? 'border-green-500 text-green-400 bg-green-900/20' 
                    : seoAssessment.overallScore >= 60
                    ? 'border-yellow-500 text-yellow-400 bg-yellow-900/20'
                    : 'border-red-500 text-red-400 bg-red-900/20'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                SEO: {seoAssessment.overallScore}/100
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Website Preview</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-600 text-slate-400">
                <FileText className="w-3 h-3 mr-1" />
                {pageKeywords.length} Pages
              </Badge>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full border-0"
              title="Website Review Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="w-[400px] flex flex-col bg-slate-800/30">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Review Message */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-300">
                      Your website for <strong className="text-white">{businessContext.businessName}</strong> is ready for review!
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Take your time to review the content and images. If you'd like changes, 
                      use the buttons below to request specific modifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Summary */}
            {seoAssessment && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    SEO Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(seoAssessment.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 capitalize">{key}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            value.score >= 80 
                              ? 'border-green-600 text-green-400' 
                              : value.score >= 60
                              ? 'border-yellow-600 text-yellow-400'
                              : 'border-red-600 text-red-400'
                          }`}
                        >
                          {value.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pages Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Pages Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pageKeywords.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-slate-300">{page.name}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-600 text-slate-500 text-xs">
                        {page.keywords.length} keywords
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300 mb-2">Need Changes?</div>
              
              {/* Redo Content Button */}
              <Button
                variant="outline"
                onClick={() => setShowRedoContentDialog(true)}
                className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-cyan-500"
              >
                <div className="p-1.5 bg-cyan-900/50 rounded">
                  <PenTool className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Redo Content</div>
                  <div className="text-xs text-slate-500">Rewrite text for specific pages</div>
                </div>
              </Button>

              {/* Redo Images Button */}
              <Button
                variant="outline"
                onClick={() => setShowRedoImagesDialog(true)}
                className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-orange-500"
              >
                <div className="p-1.5 bg-orange-900/50 rounded">
                  <ImageIcon className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Redo Images</div>
                  <div className="text-xs text-slate-500">Regenerate images for specific pages</div>
                </div>
              </Button>
            </div>

            {/* Approval Section */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <div className="text-sm font-medium text-slate-300">Happy with everything?</div>
              <Button
                onClick={onApprove}
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve Website
                <ArrowRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-slate-500 text-center">
                This will finalize your website for launch
              </p>
            </div>
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
                Back to Assessment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Redo Content Dialog */}
      <Dialog open={showRedoContentDialog} onOpenChange={setShowRedoContentDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-cyan-400" />
              Redo Content
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Select which pages you want to rewrite content for.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Page Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Select Pages</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllPages}
                  className="text-xs text-cyan-400 h-auto p-0"
                >
                  Select All
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pageKeywords.map((page) => (
                  <div 
                    key={page.name}
                    className="flex items-center space-x-2 p-2 rounded bg-slate-800/50 hover:bg-slate-800"
                  >
                    <Checkbox
                      id={`content-${page.name}`}
                      checked={selectedPages.includes(page.name)}
                      onCheckedChange={() => togglePage(page.name)}
                      className="border-slate-600"
                    />
                    <Label 
                      htmlFor={`content-${page.name}`}
                      className="text-sm text-slate-300 cursor-pointer flex-1"
                    >
                      {page.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedPages.length === 0 && (
                <p className="text-xs text-slate-500">
                  Leave empty to rewrite all pages
                </p>
              )}
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Feedback (Optional)</Label>
              <Textarea
                placeholder="What would you like changed? E.g., 'Make the tone more professional' or 'Add more details about services'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRedoContentDialog(false);
                clearSelection();
              }}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedoContent}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Redo Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redo Images Dialog */}
      <Dialog open={showRedoImagesDialog} onOpenChange={setShowRedoImagesDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-orange-400" />
              Redo Images
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Select which pages you want to regenerate images for.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Page Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Select Pages</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={selectAllPages}
                  className="text-xs text-orange-400 h-auto p-0"
                >
                  Select All
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pageKeywords.map((page) => (
                  <div 
                    key={page.name}
                    className="flex items-center space-x-2 p-2 rounded bg-slate-800/50 hover:bg-slate-800"
                  >
                    <Checkbox
                      id={`images-${page.name}`}
                      checked={selectedPages.includes(page.name)}
                      onCheckedChange={() => togglePage(page.name)}
                      className="border-slate-600"
                    />
                    <Label 
                      htmlFor={`images-${page.name}`}
                      className="text-sm text-slate-300 cursor-pointer flex-1"
                    >
                      {page.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedPages.length === 0 && (
                <p className="text-xs text-slate-500">
                  Leave empty to regenerate all images
                </p>
              )}
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Style Guidance (Optional)</Label>
              <Textarea
                placeholder="What style would you prefer? E.g., 'More modern and vibrant' or 'Professional corporate look'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRedoImagesDialog(false);
                clearSelection();
              }}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedoImages}
              className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Redo Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

