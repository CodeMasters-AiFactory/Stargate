/**
 * Final Website Display
 * Phase 9: Display the final approved website with download/share options
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GeneratedImage, PageKeywords, SEOAssessmentResult } from '@/types/websiteBuilder';
import {
  Archive,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Database,
  Download,
  FileText,
  FolderOpen,
  Layout,
  LayoutDashboard,
  Loader2,
  Rocket,
  Save,
  Settings,
  Share2,
  Zap
} from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ClientTopBar } from './ClientTopBar';
import { MerlinChatSidebar } from './MerlinChatSidebar';
import { WebsiteBuildProgress } from './WebsiteBuildProgress';

interface FinalWebsiteDisplayProps {
  html: string;
  css?: string;  // Optional CSS to inject
  pageKeywords: PageKeywords[];
  seoAssessment?: SEOAssessmentResult;
  generatedImages?: GeneratedImage[];
  businessContext: {
    businessName: string;
    industry?: string;
    location?: string;
    email?: string;
    hasOwnPhotos?: boolean;
  };
  autoBuildPending?: boolean;  // NEW: Trigger auto-build on mount
  onAutoBuildComplete?: () => void;  // NEW: Callback when auto-build finishes
  onEdit?: () => void;  // Go back to review/redo stage
  onStartNew?: () => void;  // Start a new website
  onWebsiteUpdate?: (updatedHtml: string) => void; // Callback when HTML changes
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export function FinalWebsiteDisplay({
  html,
  css,
  pageKeywords: _pageKeywords,
  seoAssessment: _seoAssessment,
  generatedImages: _generatedImages = [],
  businessContext,
  autoBuildPending,
  onAutoBuildComplete,
  onEdit: _onEdit,
  onStartNew: _onStartNew,
  onWebsiteUpdate,
}: FinalWebsiteDisplayProps) {
  const [_viewport, _setViewport] = useState<ViewportSize>('desktop');
  const [_showShareDialog, _setShowShareDialog] = useState(false);
  const [_showCodeDialog, _setShowCodeDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published' | 'publishing'>('draft');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Auto-build state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStep, setBuildStep] = useState('');
  const [currentHtml, setCurrentHtml] = useState(html);

  // Merlin sidebar state
  const [merlinSidebarWidth, setMerlinSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-width');
    return saved ? parseInt(saved, 10) : 420; // Increased default width for better readability
  });
  const [merlinSidebarCollapsed, setMerlinSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-collapsed');
    return saved === 'true';
  });

  // Track iframe key to force re-render when HTML changes
  const [iframeKey, setIframeKey] = useState(0);

  // Auto-build effect - runs when autoBuildPending is true
  useEffect(() => {
    if (!autoBuildPending) return;

    // Start auto-build process
    const runAutoBuild = async () => {
      setIsBuilding(true);
      setBuildProgress(0);
      setBuildStep('setup');

      try {
        // Use the sync endpoint for simpler implementation
        const response = await fetch('/api/website-editor/auto-build-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateHtml: html,
            businessInfo: {
              name: businessContext.businessName,
              industry: businessContext.industry || 'Business',
              location: businessContext.location || '',
              email: businessContext.email || '',
              hasOwnPhotos: businessContext.hasOwnPhotos || false,
            },
          }),
        });

        const data = await response.json() as { success: boolean; html?: string; error?: string };

        if (data.success && data.html) {
          // Update the HTML with the auto-built version
          setCurrentHtml(data.html);
          onWebsiteUpdate?.(data.html);
          setBuildProgress(100);
          setBuildStep('complete');

          // Wait a moment before hiding the progress
          await new Promise<void>((resolve) => setTimeout(resolve, 1500));
        } else {
          console.error('[Auto-Build] Failed:', data.error);
        }
      } catch (_error: unknown) {
        console.error('[Auto-Build] Error:', _error);
      } finally {
        setIsBuilding(false);
        onAutoBuildComplete?.();
      }
    };

    runAutoBuild();
  }, [autoBuildPending]);

  // Update currentHtml when html prop changes (from external source)
  useEffect(() => {
    if (!isBuilding) {
      setCurrentHtml(html);
    }
  }, [html, isBuilding]);

  // Combine HTML and CSS into a complete document
  // Use currentHtml which may be updated by auto-build
  const fullHtml = React.useMemo(() => {
    const sourceHtml = currentHtml || html;

    // If HTML already has a complete structure, inject CSS into <head>
    if (sourceHtml.includes('</head>') || sourceHtml.includes('</HEAD>')) {
      // Inject CSS before </head>
      const cssTag = css ? `<style>${css}</style>` : '';
      return sourceHtml.replace(/<\/head>/i, `${cssTag}</head>`);
    }

    // If HTML has <html> tag but no <head>, add head with CSS
    if (sourceHtml.includes('<html') || sourceHtml.includes('<HTML')) {
      const cssTag = css ? `<head><style>${css}</style></head>` : '<head></head>';
      if (sourceHtml.includes('</html>') || sourceHtml.includes('</HTML>')) {
        return sourceHtml.replace(/<\/html>/i, `${cssTag}</html>`);
      }
      // Insert after <html> tag
      return sourceHtml.replace(/<html[^>]*>/i, `$&${cssTag}`);
    }

    // If HTML is just body content, wrap it with full structure
    const cssTag = css ? `<style>${css}</style>` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessContext.businessName} Website</title>
  ${cssTag}
</head>
<body>
  ${sourceHtml}
</body>
</html>`;
  }, [currentHtml, html, css, businessContext.businessName]);

  // Download HTML file
  const downloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessContext.businessName.toLowerCase().replace(/\s+/g, '-')}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy HTML to clipboard
  const copyHTML = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Update iframe when html changes - force re-render with key
  React.useEffect(() => {
    // Force iframe to re-render by incrementing key
    setIframeKey(prev => prev + 1);
    // Mark as dirty when HTML changes
    setIsDirty(true);
  }, [html]); // Only depend on html prop, not fullHtml (to avoid double updates)

  // Helper function to save HTML to file system
  const saveToFileSystem = async (htmlToSave: string, showStatus: boolean = true) => {
    if (showStatus) setSaveStatus('saving');
    try {
      // Generate project slug from business name
      const projectSlug = businessContext.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Call the save API endpoint
      const response = await fetch('/api/website-editor/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectSlug,
          html: htmlToSave,
        }),
      });

      const data = await response.json() as { success: boolean; savedAt?: string; error?: string };

      if (data.success) {
        if (showStatus) {
          setSaveStatus('saved');
          setIsDirty(false);
          setTimeout(() => setSaveStatus(null), 2000);
        }
        console.log('[FinalWebsiteDisplay] Saved successfully:', data.savedAt);
        return true;
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (_error: unknown) {
      if (showStatus) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
      console.error('[FinalWebsiteDisplay] Save failed:', _error);
      return false;
    }
  };

  // Handle save - persist to file system for file-based projects
  const handleSave = async () => {
    // Use currentHtml which contains all Merlin edits
    const htmlToSave = currentHtml || html;
    await saveToFileSystem(htmlToSave, true);
  };

  // Handle auto-save from Merlin edits
  const handleAutoSave = async (updatedHtml: string) => {
    // Save silently without changing status indicators
    await saveToFileSystem(updatedHtml, false);
  };

  // Handle publish
  const handlePublish = async () => {
    setPublishStatus('publishing');
    try {
      // TODO: Implement actual publish API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      setPublishStatus('published');
    } catch (_error: unknown) {
      setPublishStatus('draft');
      console.error('Publish failed:', _error);
    }
  };

  // Handle preview mode change
  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(mode);
    _setViewport(mode);
  };

  // Left sidebar state (matching top nav style)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('left-sidebar-collapsed');
    return saved === 'true';
  });
  const leftSidebarWidth = leftSidebarCollapsed ? 48 : 180;
  const [location, _setLocation] = useLocation();

  // Sync URL with project slug for refresh persistence
  useEffect(() => {
    if (businessContext.businessName) {
      const projectSlug = businessContext.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const expectedPath = `/editor/${projectSlug}`;

      // Only update if not already on the correct editor path
      if (!location.startsWith('/editor/')) {
        console.log('[FinalWebsiteDisplay] Syncing URL to:', expectedPath);
        window.history.replaceState({}, '', expectedPath);
      }
    }
  }, [businessContext.businessName, location]);

  return (
    <div className="flex bg-slate-900" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', margin: 0, padding: 0 }}>
      {/* Auto-Build Progress Overlay */}
      {isBuilding && (
        <WebsiteBuildProgress
          businessName={businessContext.businessName}
          industry={businessContext.industry || 'Business'}
          isBuilding={isBuilding}
          currentStep={buildStep}
          progress={buildProgress}
          onCancel={() => {
            setIsBuilding(false);
            onAutoBuildComplete?.();
          }}
          onComplete={() => {
            setIsBuilding(false);
          }}
        />
      )}

      {/* Left Sidebar - Flows into Top Bar */}
      <div
        className="h-full bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 border-r border-blue-900/50 flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: leftSidebarWidth }}
      >
        {/* Sidebar Header - Same height as top bar for visual flow */}
        <div className="h-10 flex items-center justify-between px-2 border-b border-blue-900/50">
          {!leftSidebarCollapsed && (
            <span className="text-xs font-bold text-white/90 truncate">Stargate</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newState = !leftSidebarCollapsed;
              setLeftSidebarCollapsed(newState);
              localStorage.setItem('left-sidebar-collapsed', String(newState));
            }}
            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-slate-800/50"
          >
            {leftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Save & Publish Actions */}
        <div className="px-1 py-2 border-b border-blue-900/50 space-y-1">
          {/* Save Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2",
              isDirty && "text-blue-400"
            )}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
            ) : (
              <Save className="w-4 h-4 flex-shrink-0" />
            )}
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>}
          </Button>

          {/* Publish Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2",
              publishStatus === 'published' && "text-green-400"
            )}
            onClick={handlePublish}
            disabled={publishStatus === 'publishing'}
          >
            {publishStatus === 'publishing' ? (
              <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 flex-shrink-0" />
            )}
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">{publishStatus === 'publishing' ? 'Publishing...' : publishStatus === 'published' ? 'Published' : 'Publish'}</span>}
          </Button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 py-2 space-y-0.5 overflow-y-auto px-1">
          {/* Dashboard */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Dashboard</span>}
          </Button>

          {/* Projects */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/stargate-websites')}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Projects</span>}
          </Button>

          {/* Templates */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=templates')}
          >
            <Layout className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Templates</span>}
          </Button>

          {/* Divider */}
          <div className="border-t border-blue-900/50 my-2" />

          {/* Usage / Analytics */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=usage')}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Usage</span>}
          </Button>

          {/* Performance */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=performance')}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Performance</span>}
          </Button>

          {/* Divider */}
          <div className="border-t border-blue-900/50 my-2" />

          {/* Blog */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=blog')}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Blog</span>}
          </Button>

          {/* CMS */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=cms')}
          >
            <Database className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">CMS</span>}
          </Button>

          {/* Divider */}
          <div className="border-t border-blue-900/50 my-2" />

          {/* Backup */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=backup')}
          >
            <Archive className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Backup</span>}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-white/70 hover:text-white hover:bg-slate-800/50 h-8",
              leftSidebarCollapsed ? "px-2 justify-center" : "px-2"
            )}
            onClick={() => _setLocation('/?view=settings')}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!leftSidebarCollapsed && <span className="ml-2 text-xs">Settings</span>}
          </Button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar - Flows from sidebar header */}
        <ClientTopBar
          websiteName={businessContext.businessName || 'My Website'}
          onSave={handleSave}
          onPublish={handlePublish}
          onPreviewModeChange={handlePreviewModeChange}
          isDirty={isDirty}
          publishStatus={publishStatus}
          saveStatus={saveStatus}
          previewMode={previewMode}
        />

        {/* Content below top bar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Merlin Chat Sidebar - Resizable & Collapsible */}
          <MerlinChatSidebar
            currentHtml={html}
            businessContext={businessContext}
            onWebsiteUpdate={(updatedHtml) => {
              if (onWebsiteUpdate) {
                onWebsiteUpdate(updatedHtml);
                setIsDirty(true);
              }
            }}
            onAutoSave={handleAutoSave}
            width={merlinSidebarWidth}
            onWidthChange={(newWidth) => {
              setMerlinSidebarWidth(newWidth);
              localStorage.setItem('merlin-sidebar-width', newWidth.toString());
            }}
            isCollapsed={merlinSidebarCollapsed}
            onToggleCollapse={() => setMerlinSidebarCollapsed(!merlinSidebarCollapsed)}
          />

          {/* Website Preview - Right Side */}
          <div className="flex-1 overflow-hidden" style={{ position: 'relative' }}>
            <iframe
              key={`preview-iframe-${iframeKey}`}
              ref={iframeRef}
              srcDoc={fullHtml}
              className="border-0"
              title="Final Website Preview"
              sandbox="allow-same-origin allow-scripts"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto'
              }}
            />
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={_showShareDialog} onOpenChange={_setShowShareDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-400" />
              Share Website
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Share your website with others for review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Preview Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value="Preview link will be generated when deployed"
                  className="bg-slate-800 border-slate-700 text-slate-400"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    // Would generate a temporary preview link
                  }}
                  className="border-slate-600"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Deploy your website to get a shareable link.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => _setShowShareDialog(false)}
              className="border-slate-600 text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={_showCodeDialog} onOpenChange={_setShowCodeDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Website Code
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              View and copy the HTML source code.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="relative">
              <pre className="bg-slate-800 p-4 rounded-lg overflow-auto max-h-[50vh] text-xs text-slate-300 font-mono">
                {html}
              </pre>
              <Button
                size="sm"
                onClick={copyHTML}
                className="absolute top-2 right-2 gap-1"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => _setShowCodeDialog(false)}
              className="border-slate-600 text-slate-300"
            >
              Close
            </Button>
            <Button onClick={downloadHTML} className="gap-2">
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

