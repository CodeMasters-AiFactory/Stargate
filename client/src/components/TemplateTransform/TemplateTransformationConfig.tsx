/**
 * Template Transformation Configuration
 * 
 * User selects what they want to transform:
 * - Content rewriting
 * - Image replacement
 * - Color management
 * - SEO optimization
 * - etc.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image as ImageIcon,
  Palette,
  Search,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Shield,
  Settings,
  CheckCircle2,
} from 'lucide-react';

export interface TransformationOptions {
  // Content & Branding
  rewriteContent: boolean;
  replaceBrandName: boolean;
  updateContactInfo: boolean;
  rewriteServices: boolean;
  
  // Images
  replaceImages: boolean;
  generateHeroImage: boolean;
  generateServiceImages: boolean;
  replaceLogo: boolean;
  
  // Colors & Design
  updateColors: boolean;
  adjustTypography: boolean;
  
  // SEO
  optimizeSEO: boolean;
  updateMetaTags: boolean;
  addSchemaMarkup: boolean;
  optimizeLocalSEO: boolean;
  
  // Technical
  removeTrackingScripts: boolean;
  optimizePerformance: boolean;
  updateUrls: boolean;
}

interface TemplateTransformationConfigProps {
  templateName: string;
  templateBrand: string;
  clientInfo?: {
    businessName: string;
    phone?: string;
    email?: string;
    city?: string;
  };
  onContinue: (options: TransformationOptions) => void;
  onBack?: () => void;
}

const DEFAULT_OPTIONS: TransformationOptions = {
  rewriteContent: true,
  replaceBrandName: true,
  updateContactInfo: true,
  rewriteServices: true,
  replaceImages: true,
  generateHeroImage: true,
  generateServiceImages: true,
  replaceLogo: false, // User provides logo
  updateColors: false,
  adjustTypography: false,
  optimizeSEO: true,
  updateMetaTags: true,
  addSchemaMarkup: true,
  optimizeLocalSEO: true,
  removeTrackingScripts: true,
  optimizePerformance: false,
  updateUrls: true,
};

export function TemplateTransformationConfig({
  templateName,
  templateBrand,
  clientInfo,
  onContinue,
  onBack,
}: TemplateTransformationConfigProps) {
  const [options, setOptions] = useState<TransformationOptions>(DEFAULT_OPTIONS);

  const toggleOption = (key: keyof TransformationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getSelectedCount = () => {
    return Object.values(options).filter(Boolean).length;
  };

  const getTotalCount = () => {
    return Object.keys(options).length;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Configure Transformation</h1>
        <p className="text-slate-400">
          Select what you want to transform for <strong className="text-white">{clientInfo?.businessName || 'your business'}</strong>
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>Template:</span>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            {templateName} ({templateBrand})
          </Badge>
        </div>
      </div>

      {/* Selected Count */}
      <div className="text-center">
        <p className="text-slate-400 text-sm">
          <strong className="text-white">{getSelectedCount()}</strong> of <strong className="text-white">{getTotalCount()}</strong> options selected
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content & Branding */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-cyan-400" />
              Content & Branding
            </CardTitle>
            <CardDescription className="text-slate-400">
              Rewrite content for your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="rewriteContent"
                checked={options.rewriteContent}
                onCheckedChange={() => toggleOption('rewriteContent')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="rewriteContent" className="text-white cursor-pointer">
                  Rewrite All Content
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  AI-rewrite paragraphs, headings, and descriptions
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="replaceBrandName"
                checked={options.replaceBrandName}
                onCheckedChange={() => toggleOption('replaceBrandName')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="replaceBrandName" className="text-white cursor-pointer">
                  Replace Brand Name
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  {templateBrand} → {clientInfo?.businessName || 'Your Business'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="updateContactInfo"
                checked={options.updateContactInfo}
                onCheckedChange={() => toggleOption('updateContactInfo')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="updateContactInfo" className="text-white cursor-pointer">
                  Update Contact Information
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Phone, email, and address
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="rewriteServices"
                checked={options.rewriteServices}
                onCheckedChange={() => toggleOption('rewriteServices')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="rewriteServices" className="text-white cursor-pointer">
                  Rewrite Service Descriptions
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Customize service descriptions for your business
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              Images
            </CardTitle>
            <CardDescription className="text-slate-400">
              Replace template images with new ones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="replaceImages"
                checked={options.replaceImages}
                onCheckedChange={() => toggleOption('replaceImages')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="replaceImages" className="text-white cursor-pointer">
                  Replace All Images
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Generate new images for your industry
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="generateHeroImage"
                checked={options.generateHeroImage}
                onCheckedChange={() => toggleOption('generateHeroImage')}
                disabled={!options.replaceImages}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="generateHeroImage" className={`cursor-pointer ${!options.replaceImages ? 'text-slate-500' : 'text-white'}`}>
                  Generate Hero Image
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Create custom hero banner
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="generateServiceImages"
                checked={options.generateServiceImages}
                onCheckedChange={() => toggleOption('generateServiceImages')}
                disabled={!options.replaceImages}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="generateServiceImages" className={`cursor-pointer ${!options.replaceImages ? 'text-slate-500' : 'text-white'}`}>
                  Generate Service Images
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Create images for each service
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="replaceLogo"
                checked={options.replaceLogo}
                onCheckedChange={() => toggleOption('replaceLogo')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="replaceLogo" className="text-white cursor-pointer">
                  Replace Logo
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Upload your logo (optional)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors & Design */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Palette className="w-5 h-5 text-pink-400" />
              Colors & Design
            </CardTitle>
            <CardDescription className="text-slate-400">
              Customize visual appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="updateColors"
                checked={options.updateColors}
                onCheckedChange={() => toggleOption('updateColors')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="updateColors" className="text-white cursor-pointer">
                  Update Color Scheme
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Adjust colors to match your brand
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="adjustTypography"
                checked={options.adjustTypography}
                onCheckedChange={() => toggleOption('adjustTypography')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="adjustTypography" className="text-white cursor-pointer">
                  Adjust Typography
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Change fonts and text styles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="w-5 h-5 text-green-400" />
              SEO Optimization
            </CardTitle>
            <CardDescription className="text-slate-400">
              Improve search engine visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="optimizeSEO"
                checked={options.optimizeSEO}
                onCheckedChange={() => toggleOption('optimizeSEO')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="optimizeSEO" className="text-white cursor-pointer">
                  Optimize SEO Content
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Rewrite content for SEO
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="updateMetaTags"
                checked={options.updateMetaTags}
                onCheckedChange={() => toggleOption('updateMetaTags')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="updateMetaTags" className="text-white cursor-pointer">
                  Update Meta Tags
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Title, description, keywords
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="addSchemaMarkup"
                checked={options.addSchemaMarkup}
                onCheckedChange={() => toggleOption('addSchemaMarkup')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="addSchemaMarkup" className="text-white cursor-pointer">
                  Add Schema Markup
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  Structured data for rich snippets
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="optimizeLocalSEO"
                checked={options.optimizeLocalSEO}
                onCheckedChange={() => toggleOption('optimizeLocalSEO')}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="optimizeLocalSEO" className="text-white cursor-pointer">
                  Optimize Local SEO
                </Label>
                <p className="text-sm text-slate-400 mt-1">
                  NAP consistency, Google Maps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical */}
        <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="w-5 h-5 text-yellow-400" />
              Technical Cleanup
            </CardTitle>
            <CardDescription className="text-slate-400">
              Clean up and optimize code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="removeTrackingScripts"
                  checked={options.removeTrackingScripts}
                  onCheckedChange={() => toggleOption('removeTrackingScripts')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="removeTrackingScripts" className="text-white cursor-pointer">
                    Remove Tracking Scripts
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">
                    Google Analytics, Facebook Pixel, etc.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="optimizePerformance"
                  checked={options.optimizePerformance}
                  onCheckedChange={() => toggleOption('optimizePerformance')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="optimizePerformance" className="text-white cursor-pointer">
                    Optimize Performance
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">
                    Minify CSS, optimize images
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="updateUrls"
                  checked={options.updateUrls}
                  onCheckedChange={() => toggleOption('updateUrls')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="updateUrls" className="text-white cursor-pointer">
                    Update URLs
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">
                    Canonical URLs, internal links
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-700">
        <div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-slate-400">
            {getSelectedCount()} selected
          </Badge>
          <Button
            onClick={() => onContinue(options)}
            disabled={getSelectedCount() === 0}
            className="bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Transformation
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

