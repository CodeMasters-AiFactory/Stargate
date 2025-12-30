/**
 * InspirationPicker - Step 1 of Professional Design flow
 * Allows users to browse and select premium templates as inspiration
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  Sparkles,
  X,
  SkipForward,
  Palette
} from 'lucide-react';

interface SelectedInspiration {
  id: string;
  name: string;
  thumbnail: string;
}

interface InspirationPickerProps {
  selectedInspirations: SelectedInspiration[];
  onSelect: (inspirations: SelectedInspiration[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

// Sample premium templates for inspiration (will be replaced with actual data)
const SAMPLE_INSPIRATIONS = [
  { id: '1', name: 'Luxe Portfolio', category: 'Portfolio', thumbnail: '/api/placeholder/400/300', style: 'Luxury' },
  { id: '2', name: 'Modern Agency', category: 'Agency', thumbnail: '/api/placeholder/400/300', style: 'Modern' },
  { id: '3', name: 'Elegant E-commerce', category: 'E-commerce', thumbnail: '/api/placeholder/400/300', style: 'Elegant' },
  { id: '4', name: 'Bold Startup', category: 'Startup', thumbnail: '/api/placeholder/400/300', style: 'Bold' },
  { id: '5', name: 'Minimalist Studio', category: 'Creative', thumbnail: '/api/placeholder/400/300', style: 'Minimalist' },
  { id: '6', name: 'Corporate Professional', category: 'Corporate', thumbnail: '/api/placeholder/400/300', style: 'Professional' },
  { id: '7', name: 'Creative Studio', category: 'Creative', thumbnail: '/api/placeholder/400/300', style: 'Creative' },
  { id: '8', name: 'Tech Innovator', category: 'Technology', thumbnail: '/api/placeholder/400/300', style: 'Futuristic' },
  { id: '9', name: 'Restaurant Delight', category: 'Restaurant', thumbnail: '/api/placeholder/400/300', style: 'Warm' },
];

export function InspirationPicker({
  selectedInspirations,
  onSelect,
  onNext,
  onSkip
}: InspirationPickerProps) {
  const [selected, setSelected] = useState<SelectedInspiration[]>(selectedInspirations);
  const [previewTemplate, setPreviewTemplate] = useState<typeof SAMPLE_INSPIRATIONS[0] | null>(null);

  const MAX_SELECTIONS = 3;

  const handleToggleSelect = (template: typeof SAMPLE_INSPIRATIONS[0]) => {
    const isSelected = selected.some(s => s.id === template.id);

    if (isSelected) {
      // Remove from selection
      const newSelected = selected.filter(s => s.id !== template.id);
      setSelected(newSelected);
      onSelect(newSelected);
    } else if (selected.length < MAX_SELECTIONS) {
      // Add to selection
      const newInspiration: SelectedInspiration = {
        id: template.id,
        name: template.name,
        thumbnail: template.thumbnail
      };
      const newSelected = [...selected, newInspiration];
      setSelected(newSelected);
      onSelect(newSelected);
    }
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 border border-fuchsia-500/30 rounded-full text-fuchsia-300 text-sm mb-4">
          <Palette className="w-4 h-4" />
          <span>Step 1: Choose Your Inspirations</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What designs{' '}
          <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            inspire you?
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Browse our premium templates and select up to 3 that match your vision.
          This helps our designers understand your style preferences.
        </p>
      </div>

      {/* Selection Counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${selected.length > 0 ? 'text-fuchsia-400 fill-fuchsia-400' : 'text-slate-500'}`} />
          <span className="text-slate-300">
            <span className="font-bold text-fuchsia-400">{selected.length}</span> of {MAX_SELECTIONS} selected
          </span>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          Skip this step
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {SAMPLE_INSPIRATIONS.map((template) => {
          const isSelected = selected.some(s => s.id === template.id);
          const canSelect = selected.length < MAX_SELECTIONS || isSelected;

          return (
            <div
              key={template.id}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-fuchsia-400 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
                  : canSelect
                  ? 'hover:ring-2 hover:ring-fuchsia-400/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canSelect && handleToggleSelect(template)}
            >
              {/* Thumbnail */}
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 relative">
                {/* Placeholder gradient - replace with actual images */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-800 to-fuchsia-900/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-fuchsia-400/30" />
                </div>

                {/* Selection Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-fuchsia-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 bg-fuchsia-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-slate-800/80">
                <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">{template.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-fuchsia-400">{template.style}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_30px_rgba(251,146,60,0.5)] flex items-center gap-2"
        >
          {selected.length > 0 ? `Continue with ${selected.length} Selection${selected.length > 1 ? 's' : ''}` : 'Continue Without Selections'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video bg-gradient-to-br from-purple-900/50 via-slate-800 to-fuchsia-900/30 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-fuchsia-400/50 mx-auto mb-4" />
                <p className="text-slate-400">Template Preview</p>
                <h2 className="text-2xl font-bold text-white">{previewTemplate.name}</h2>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{previewTemplate.name}</h3>
                <p className="text-slate-400">{previewTemplate.category} • {previewTemplate.style} Style</p>
              </div>
              <button
                onClick={() => {
                  handleToggleSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  selected.some(s => s.id === previewTemplate.id)
                    ? 'bg-fuchsia-500 text-white'
                    : 'bg-slate-800 hover:bg-fuchsia-500 text-white'
                }`}
              >
                {selected.some(s => s.id === previewTemplate.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    Selected
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Select as Inspiration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
