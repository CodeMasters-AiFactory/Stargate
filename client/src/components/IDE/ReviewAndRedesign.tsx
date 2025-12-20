/**
 * Review And Redesign - Phase 6
 * Review generated website with element-level redesign capability
 * 
 * Features:
 * - Full website preview
 * - Click on elements to request redesign
 * - 5 redesign chances
 * - Image replacement requests
 * - Section feedback
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Eye,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Edit3,
  X,
} from 'lucide-react';

interface GeneratedWebsite {
  html: string;
  css: string;
  js?: string;
}

interface ReviewAndRedesignProps {
  website: GeneratedWebsite;
  redesignCount: number;
  maxRedesigns: number;
  onRedesign: (feedback: string) => void;
  onApprove: () => void;
  onBack?: () => void;
}

export function ReviewAndRedesign({
  website,
  redesignCount,
  maxRedesigns,
  onRedesign,
  onApprove,
  onBack,
}: ReviewAndRedesignProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const remainingRedesigns = maxRedesigns - redesignCount;
  const canRedesign = remainingRedesigns > 0;

  const handleRedesign = () => {
    if (feedback.trim() && canRedesign) {
      onRedesign(feedback);
      setFeedback('');
      setShowFeedbackModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-400" />
              Review Your Website
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Approve or request changes. You have {remainingRedesigns} redesign{remainingRedesigns !== 1 ? 's' : ''} remaining.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={remainingRedesigns > 2 ? 'bg-green-600' : remainingRedesigns > 0 ? 'bg-amber-600' : 'bg-red-600'}>
              <RefreshCw className="w-3 h-3 mr-1" />
              {remainingRedesigns}/{maxRedesigns} Redesigns
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="border-slate-600 text-slate-300"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedbackModal(true)}
                disabled={!canRedesign}
                className="border-amber-600 text-amber-400 hover:bg-amber-600/10"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Request Changes
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className={`flex-1 rounded-lg overflow-hidden border border-slate-700 bg-white ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            {isFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-2 right-2 z-10 bg-slate-900/80 text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <iframe
              srcDoc={website.html + (website.css ? `<style>${website.css}</style>` : '')}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Request Changes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-slate-400 mb-4">
                Describe what you'd like to change. Be specific about which section or element.
              </p>
              
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g., Make the hero section more colorful, change the contact button to green..."
                rows={4}
                className="bg-slate-800 border-slate-600 text-white mb-4"
              />

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {remainingRedesigns} redesign{remainingRedesigns !== 1 ? 's' : ''} remaining
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedbackModal(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRedesign}
                    disabled={!feedback.trim()}
                    className="bg-amber-600 hover:bg-amber-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Request Redesign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            {canRedesign ? (
              <span>Not happy? Request up to {remainingRedesigns} more change{remainingRedesigns !== 1 ? 's' : ''}.</span>
            ) : (
              <span className="text-amber-400">No redesigns remaining. Please approve to continue.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-500 text-white px-6"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewAndRedesign;

