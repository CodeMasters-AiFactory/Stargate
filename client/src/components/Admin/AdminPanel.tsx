import React, { useState, lazy, Suspense } from 'react';
import { DepartmentAccess } from './DepartmentAccess';
import { RoleManagement } from './RoleManagement';
import { TemplateManagement } from './TemplateManagement';
import { TemplateFineTuning } from './TemplateFineTuning';
import { TemplateQA } from './TemplateQA';
import { FinalProduct } from './FinalProduct';
import { RewrittenTemplates } from './RewrittenTemplates';
import { ReimagedTemplates } from './ReimagedTemplates';
import { SEOTemplates } from './SEOTemplates';
import { VerifiedTemplates } from './VerifiedTemplates';
const WebsiteScraper = lazy(() => import('./WebsiteScraper').then(m => ({ default: m.WebsiteScraper })));
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  FileText,
  Globe,
  Key,
  Sparkles,
  CheckCircle2,
  Image,
  Search,
  Rocket,
  ArrowLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pipeline'); // Default to Template Pipeline
  const [pipelineTab, setPipelineTab] = useState('scraper'); // Default sub-tab
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Navigate to home - MainLayout will handle view reset
    setLocation('/');
  };

  // Main sections - 3 top-level tabs
  const mainSections = [
    {
      id: 'users',
      label: 'Permissions',
      icon: Key,
      description: 'Manage roles and permissions',
      color: 'text-cyan-400',
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      description: 'Department access control',
      color: 'text-cyan-400',
    },
    {
      id: 'pipeline',
      label: 'Template Factory',
      icon: Sparkles,
      description: 'Template processing pipeline',
      color: 'text-cyan-400',
    },
  ] as const;

  // Pipeline sub-tabs
  const pipelineTabs = [
    { id: 'scraper', label: 'Scraper', icon: Globe },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'rewritten', label: 'Rewritten', icon: CheckCircle2 },
    { id: 'reimaged', label: 'Reimaged', icon: Image },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'verified', label: 'Verified', icon: CheckCircle2 },
    { id: 'studio', label: 'Fine-Tuning', icon: Sparkles },
    { id: 'qa', label: 'QA', icon: CheckCircle2 },
    { id: 'final', label: 'Final Product', icon: Rocket },
  ] as const;

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 h-full overflow-y-auto" data-testid="admin-panel">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-cyan-300 hover:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                Administrator Panel
              </h1>
              <p className="text-sm text-cyan-300/70 mt-1">
                Manage users, templates, and system settings
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs - Just 2 sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-blue-900/50 border border-cyan-500/30 rounded-lg">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 data-[state=active]:bg-cyan-500/20 data-[state=active]:shadow-lg data-[state=active]:border-cyan-400",
                    "transition-all duration-200 text-lg font-semibold",
                    "hover:bg-cyan-500/10"
                  )}
                >
                  <Icon className={cn("w-4 h-4", section.color)} />
                  <span className="text-cyan-300">{section.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-8 mt-6">
            {/* Roles & Permissions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Role Permissions</h2>
                  <p className="text-sm text-cyan-300/70 mt-1">
                    Configure user roles and system permissions
                  </p>
                </div>
              </div>
              <RoleManagement />
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-8 mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Departments</h2>
                  <p className="text-sm text-cyan-300/70 mt-1">
                    Manage department access and organization structure
                  </p>
                </div>
              </div>
              <DepartmentAccess />
            </div>
          </TabsContent>

          {/* Template Factory / Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-6">
            <div className="space-y-4">
              {/* Pipeline Sub-Navigation */}
              <div className="flex flex-wrap gap-2 p-2 bg-blue-900/30 rounded-lg border border-cyan-500/20">
                {pipelineTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPipelineTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
                        pipelineTab === tab.id
                          ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-lg shadow-cyan-500/20"
                          : "text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Pipeline Content */}
              <div className="min-h-[500px]">
                {pipelineTab === 'scraper' && (
                  <Suspense fallback={<div className="p-4 text-center">Loading Website Scraper...</div>}>
                    <WebsiteScraper />
                  </Suspense>
                )}
                {pipelineTab === 'templates' && (
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
                    <CardContent className="pt-6">
                      <TemplateManagement />
                    </CardContent>
                  </Card>
                )}
                {pipelineTab === 'rewritten' && <RewrittenTemplates />}
                {pipelineTab === 'reimaged' && <ReimagedTemplates />}
                {pipelineTab === 'seo' && <SEOTemplates />}
                {pipelineTab === 'verified' && <VerifiedTemplates />}
                {pipelineTab === 'studio' && <TemplateFineTuning />}
                {pipelineTab === 'qa' && <TemplateQA />}
                {pipelineTab === 'final' && <FinalProduct />}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
