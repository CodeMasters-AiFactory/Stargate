/**
 * Template Preview Component
 * Embedded preview panel showing template in real-time
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, Tablet, Smartphone, Maximize2, X } from 'lucide-react';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    brand: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      surface?: string;
      text?: string;
      textMuted?: string;
    };
    typography?: {
      headingFont?: string;
      bodyFont?: string;
    };
    layout?: {
      heroStyle?: string;
      sections?: string[];
    };
    css?: string;
    darkMode?: boolean;
  } | null;
  onClose?: () => void;
  className?: string;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export function TemplatePreview({ template, onClose, className = '' }: TemplatePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!template) {
    return (
      <div className={`flex items-center justify-center h-full bg-slate-900/50 ${className}`}>
        <div className="text-center text-slate-400">
          <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a template to preview</p>
        </div>
      </div>
    );
  }

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const generatePreviewHTML = () => {
    // Safe access to template properties with defaults
    const typography = template.typography || { headingFont: 'system-ui, sans-serif', bodyFont: 'system-ui, sans-serif' };
    const colors = template.colors || {
      primary: '#000000',
      secondary: '#000000',
      accent: '#000000',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textMuted: '#666666',
    };
    const layout = template.layout || { sections: ['hero', 'features', 'about'] };
    
    return `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name} Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${typography.bodyFont || 'system-ui, sans-serif'};
      background: ${colors.background || '#FFFFFF'};
      color: ${colors.text || '#000000'};
      line-height: 1.6;
    }
    ${template.css || ''}
    .preview-hero {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${colors.primary || '#000000'}20;
      padding: 2rem;
      text-align: center;
    }
    .preview-hero h1 {
      font-family: ${typography.headingFont || 'system-ui, sans-serif'};
      font-size: ${device === 'mobile' ? '2rem' : device === 'tablet' ? '3rem' : '4rem'};
      color: ${colors.text || '#000000'};
      margin-bottom: 1rem;
    }
    .preview-section {
      padding: 3rem 2rem;
      background: ${colors.surface || colors.background || '#F5F5F5'};
      margin: 2rem 0;
      border-radius: 8px;
    }
    .preview-btn {
      background: ${colors.primary || '#000000'};
      color: ${colors.text === colors.background ? '#fff' : colors.text || '#000000'};
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      margin: 1rem;
    }
  </style>
</head>
<body>
  <div class="preview-hero">
    <div>
      <h1>${template.brand} Style</h1>
      <p style="color: ${colors.textMuted || colors.text || '#666666'}80; font-size: 1.2rem;">
        ${template.name} Preview
      </p>
      <button class="preview-btn">Get Started</button>
    </div>
  </div>
  ${(layout.sections || ['hero', 'features', 'about']).slice(1, 4).map((section, i) => `
    <div class="preview-section">
      <h2 style="color: ${colors.primary || '#000000'}; margin-bottom: 1rem;">${section}</h2>
      <p style="color: ${colors.textMuted || colors.text || '#666666'}80;">
        This is a preview of the ${section.toLowerCase()} section. 
        The actual template will include full content and styling.
      </p>
    </div>
  `).join('')}
</body>
</html>
    `;
  };

  const previewHTML = generatePreviewHTML();
  const previewBlob = new Blob([previewHTML], { type: 'text/html' });
  const previewUrl = URL.createObjectURL(previewBlob);

  return (
    <Card className={`bg-slate-900 border-slate-700 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold">{template.name}</h3>
          <span className="text-xs text-slate-400">by {template.brand}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice('desktop')}
              className={`h-8 px-2 ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice('tablet')}
              className={`h-8 px-2 ${device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDevice('mobile')}
              className={`h-8 px-2 ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="relative overflow-auto" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '600px' }}>
        <div
          className="mx-auto bg-white"
          style={{
            width: deviceWidths[device],
            minHeight: '100%',
            transition: 'width 0.3s ease',
          }}
        >
          <iframe
            src={previewUrl}
            className="w-full border-0"
            style={{
              height: '100%',
              minHeight: '600px',
            }}
            title={`${template.name} Preview`}
          />
        </div>
      </div>
    </Card>
  );
}

