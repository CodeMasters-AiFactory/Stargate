/**
 * Template Marketplace Screen
 * Phase 3.1: Template Marketplace - Main screen for template browsing and submission
 */

import { ClientTemplateGallery } from './ClientTemplateGallery';
import { Upload, ArrowLeft, Home } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { useIDE } from '@/hooks/use-ide';

export function TemplateMarketplaceScreen() {
  const { toast } = useToast();
  const { setState } = useIDE();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'paid'>('all');

  const handleBackToHome = () => {
    // CRITICAL: Clear query parameter FIRST before setting state
    // This prevents MainLayout from reading ?view=template-marketplace and syncing it back
    window.history.replaceState({}, '', '/');
    // Now set state to dashboard - MainLayout won't find query param to sync
    setState(prev => ({ ...prev, currentView: 'dashboard' }));
    setLocation('/');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a ZIP file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // For now, provide instructions - direct upload will be implemented
      toast({
        title: 'Template Upload',
        description: 'Please place ZIP files in your Downloads folder, then run: npm run import-templates',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Upload Info',
        description: 'Place template ZIP files in Downloads folder and run the import script.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <Home className="w-4 h-4" />
              Home
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Template Marketplace
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant={pricingFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPricingFilter('all')}
                className={cn(
                  pricingFilter === 'all'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                All Templates
              </Button>
              <Button
                variant={pricingFilter === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPricingFilter('free')}
                className={cn(
                  pricingFilter === 'free'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                Free Templates
              </Button>
              <Button
                variant={pricingFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPricingFilter('paid')}
                className={cn(
                  pricingFilter === 'paid'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                Premium Templates
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Template'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ClientTemplateGallery 
          pricingFilter={pricingFilter}
          onSelectTemplate={(template) => {
            toast({
              title: 'Template Selected',
              description: `Selected template: ${template.name}`,
            });
          }}
        />
      </div>
    </div>
  );
}

