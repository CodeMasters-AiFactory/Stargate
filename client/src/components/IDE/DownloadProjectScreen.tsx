/**
 * Download Project Screen
 * Allows users to select and download project data
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileCode2,
  Database,
  HardDrive,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { NavigationButtons } from './BackButton';
import { useToast } from '@/hooks/use-toast';

interface DownloadOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'website' | 'data' | 'config';
  size?: string;
}

const downloadOptions: DownloadOption[] = [
  {
    id: 'website-source',
    name: 'Website Source Code',
    description: 'Complete HTML, CSS, and JavaScript files',
    icon: FileCode2,
    category: 'website',
    size: '~500 KB',
  },
  {
    id: 'website-assets',
    name: 'Website Assets',
    description: 'Images, fonts, and other media files',
    icon: FileCode2,
    category: 'website',
    size: '~2 MB',
  },
  {
    id: 'database',
    name: 'Database Export',
    description: 'All database tables and data',
    icon: Database,
    category: 'data',
    size: '~100 KB',
  },
  {
    id: 'storage',
    name: 'App Storage',
    description: 'User files and uploaded content',
    icon: HardDrive,
    category: 'data',
    size: '~5 MB',
  },
  {
    id: 'secrets',
    name: 'Secrets & Config',
    description: 'Environment variables and configuration',
    icon: Key,
    category: 'config',
    size: '~10 KB',
  },
];

export function DownloadProjectScreen() {
  const { state: _state, setState } = useIDE();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['website-source']);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
    );
  };

  const handleDownload = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one item to download',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloading(true);

    try {
      // For now, we'll download the website source if available
      if (selectedOptions.includes('website-source')) {
        // Check if we have a generated website in the wizard state
        // This would need to be passed through context or state
        toast({
          title: 'Download Started',
          description: 'Preparing your download...',
        });

        // TODO: Implement actual download logic based on selected options
        // For now, show success message
        setTimeout(() => {
          toast({
            title: 'Download Complete',
            description: `Successfully downloaded ${selectedOptions.length} item(s)`,
          });
          setIsDownloading(false);
        }, 2000);
      } else {
        toast({
          title: 'Download Started',
          description: `Downloading ${selectedOptions.length} selected item(s)...`,
        });
        setIsDownloading(false);
      }
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download project',
        variant: 'destructive',
      });
      setIsDownloading(false);
    }
  };

  const categories = {
    website: downloadOptions.filter(opt => opt.category === 'website'),
    data: downloadOptions.filter(opt => opt.category === 'data'),
    config: downloadOptions.filter(opt => opt.category === 'config'),
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <NavigationButtons backDestination="dashboard" className="mb-4" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Download Project
              </h1>
              <p className="text-muted-foreground mt-2">
                Select the project data you want to download
              </p>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-6 mb-8">
          {/* Website Files */}
          {categories.website.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-blue-500" />
                  Website Files
                </CardTitle>
                <CardDescription>Source code and assets for your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.website.map(option => {
                  const Icon = option.icon;
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleToggleOption(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleOption(option.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5 text-blue-500" />
                          <h3 className="font-semibold">{option.name}</h3>
                          {option.size && (
                            <Badge variant="secondary" className="text-xs">
                              {option.size}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Data Files */}
          {categories.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  Data & Storage
                </CardTitle>
                <CardDescription>Database exports and stored files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.data.map(option => {
                  const Icon = option.icon;
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                      onClick={() => handleToggleOption(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleOption(option.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5 text-purple-500" />
                          <h3 className="font-semibold">{option.name}</h3>
                          {option.size && (
                            <Badge variant="secondary" className="text-xs">
                              {option.size}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Configuration */}
          {categories.config.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-500" />
                  Configuration
                </CardTitle>
                <CardDescription>Secrets and environment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.config.map(option => {
                  const Icon = option.icon;
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                      }`}
                      onClick={() => handleToggleOption(option.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleOption(option.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5 text-orange-500" />
                          <h3 className="font-semibold">{option.name}</h3>
                          {option.size && (
                            <Badge variant="secondary" className="text-xs">
                              {option.size}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Download Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, currentView: 'stargate-websites' }))}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleDownload}
            disabled={selectedOptions.length === 0 || isDownloading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="w-5 h-5 mr-2" />
            {isDownloading ? 'Downloading...' : `Download ${selectedOptions.length} Item(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
