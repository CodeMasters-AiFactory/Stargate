/**
 * Merlin 8.0 - Template Selection Page
 * Workflow 2: New Client - Choose Template
 *
 * Shows template gallery for users who want to start from a template
 * instead of AI generation from scratch
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ClientTemplateGallery } from '@/components/Templates/ClientTemplateGallery';
import { ArrowLeft, Sparkles, Wand2, ArrowRight, Zap } from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';

export default function Templates() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<BrandTemplate | null>(null);

  const handleSelectTemplate = (template: BrandTemplate) => {
    // Toggle selection - clicking same template deselects it
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(template);
    }
  };

  const handleUseTemplate = (template?: BrandTemplate) => {
    const templateToUse = template || selectedTemplate;
    if (templateToUse) {
      // Store selected template in sessionStorage
      sessionStorage.setItem('selectedTemplate', JSON.stringify(templateToUse));
      // Navigate to quick intake with template context
      setLocation('/merlin8/create?template=' + templateToUse.id);
    }
  };

  const handleBack = () => {
    // Go back to the build choice page (How would you like to build?)
    setLocation('/merlin8');
  };

  // Bypass - Skip template selection entirely
  const handleBypass = () => {
    sessionStorage.removeItem('selectedTemplate'); // Clear any template
    setLocation('/merlin8/create'); // Go straight to intake
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-purple-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-purple-200 hover:text-white hover:bg-purple-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Choices
            </Button>
            <div className="h-6 w-px bg-purple-700" />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Choose a Template
              </h1>
              <p className="text-sm text-purple-300">
                Browse 33+ professional templates • Click to select • Double-click to preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bypass Button - Skip template selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBypass}
              className="bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
              title="Skip template selection"
            >
              <Zap className="w-4 h-4 mr-1" />
              Bypass
            </Button>

            {/* Use Template Button - Only shows when template selected */}
            {selectedTemplate && (
              <Button
                onClick={() => handleUseTemplate()}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Use "{selectedTemplate.name}"
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Template Gallery */}
      <main className="flex-1 overflow-hidden pb-24">
        <ClientTemplateGallery
          onSelectTemplate={handleSelectTemplate}
          onProceed={handleUseTemplate}
          selectedTemplateId={selectedTemplate?.id}
        />
      </main>

      {/* Fixed Bottom Proceed Button - Only shows when template selected */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-blue-800/50 p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-900/50 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Selected: {selectedTemplate.name}</p>
                <p className="text-sm text-blue-300">{selectedTemplate.category}</p>
              </div>
            </div>
            <Button
              onClick={handleUseTemplate}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
            >
              Proceed with Template
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
