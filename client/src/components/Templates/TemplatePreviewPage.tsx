/**
 * Template Preview Page
 * Full-page preview of a template website
 */

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TemplatePreviewPage() {
  const [, params] = useRoute('/template-preview/:id');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>('Template Preview');
  
  const templateId = params?.id;

  useEffect(() => {
    if (!templateId) {
      setError('Template ID not found');
      setLoading(false);
      return;
    }

    // Fetch template name for header
    fetch(`/api/templates/${templateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.template) {
          setTemplateName(data.template.name || 'Template Preview');
        }
      })
      .catch(() => {
        // Ignore errors fetching name
      });

    // Set loading timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [templateId]);

  const handleBack = () => {
    // Use browser history to go back to where the user came from
    // This works correctly whether they came from /merlin8/templates, marketplace, or elsewhere
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to templates page if no history
      setLocation('/merlin8/templates');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to load template preview');
  };

  if (!templateId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Template ID not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-purple-800 bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-slate-800 text-white border-purple-700 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{templateName}</h1>
              <p className="text-sm text-purple-200">Full Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-white">Loading template preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <iframe
          src={`/api/templates/${templateId}/preview-html`}
          className="w-full h-full border-0"
          title={`${templateName} Preview`}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}

