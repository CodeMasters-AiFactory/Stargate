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
import React, { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ClientTopBar } from './ClientTopBar';
import { MerlinChatSidebar } from './MerlinChatSidebar';

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
  };
  onEdit?: () => void;  // Go back to review/redo stage
  onStartNew?: () => void;  // Start a new website
  onWebsiteUpdate?: (updatedHtml: string) => void; // Callback when HTML changes
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export function FinalWebsiteDisplay({
  html,
  css,
  pageKeywords,
  seoAssessment,
  generatedImages = [],
  businessContext,
  onEdit,
  onStartNew,
  onWebsiteUpdate,
}: FinalWebsiteDisplayProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published' | 'publishing'>('draft');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Merlin sidebar state
  const [merlinSidebarWidth, setMerlinSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-width');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [merlinSidebarCollapsed, setMerlinSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('merlin-sidebar-collapsed');
    return saved === 'true';
  });

  const collapsedWidth = 8; // Minimal width for expand button visibility
  const currentSidebarWidth = merlinSidebarCollapsed ? collapsedWidth : merlinSidebarWidth;

  // Track iframe key to force re-render when HTML changes
  const [iframeKey, setIframeKey] = useState(0);

  // Combine HTML and CSS into a complete document
  const fullHtml = React.useMemo(() => {
    // If HTML already has a complete structure, inject CSS into <head>
    if (html.includes('</head>') || html.includes('</HEAD>')) {
      // Inject CSS before </head>
      const cssTag = css ? `<style>${css}</style>` : '';
      return html.replace(/<\/head>/i, `${cssTag}</head>`);
    }

    // If HTML has <html> tag but no <head>, add head with CSS
    if (html.includes('<html') || html.includes('<HTML')) {
      const cssTag = css ? `<head><style>${css}</style></head>` : '<head></head>';
      if (html.includes('</html>') || html.includes('</HTML>')) {
        return html.replace(/<\/html>/i, `${cssTag}</html>`);
      }
      // Insert after <html> tag
      return html.replace(/<html[^>]*>/i, `$&${cssTag}`);
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
  ${html}
</body>
</html>`;
  }, [html, css, businessContext.businessName]);

  // Viewport dimensions
  const viewportWidths: Record<ViewportSize, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

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

  // Download as ZIP (would need server-side implementation)
  const downloadZIP = async () => {
    try {
      const response = await fetch('/api/website-builder/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          businessName: businessContext.businessName,
          pageKeywords,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessContext.businessName.toLowerCase().replace(/\s+/g, '-')}-website.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to HTML download
        downloadHTML();
      }
    } catch {
      // Fallback to HTML download
      downloadHTML();
    }
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

  // Open in new tab
  const openInNewTab = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Update iframe when html changes - force re-render with key
  React.useEffect(() => {
    // Force iframe to re-render by incrementing key
    setIframeKey(prev => prev + 1);
    // Mark as dirty when HTML changes
    setIsDirty(true);
  }, [html]); // Only depend on html prop, not fullHtml (to avoid double updates)

  // Handle save
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // TODO: Implement actual save API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    setPublishStatus('publishing');
    try {
      // TODO: Implement actual publish API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setPublishStatus('published');
    } catch (error) {
      setPublishStatus('draft');
      console.error('Publish failed:', error);
    }
  };

  // Handle preview mode change
  const handlePreviewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(mode);
    setViewport(mode);
  };

  // Left sidebar state (matching top nav style)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('left-sidebar-collapsed');
    return saved === 'true';
  });
  const leftSidebarWidth = leftSidebarCollapsed ? 48 : 180;
  const [, setLocation] = useLocation();

  return (
    <div className="flex bg-slate-900" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', margin: 0, padding: 0 }}>
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
            onClick={() => setLocation('/?view=dashboard')}
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
            onClick={() => setLocation('/stargate-websites')}
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
            onClick={() => setLocation('/?view=templates')}
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
            onClick={() => setLocation('/?view=usage')}
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
            onClick={() => setLocation('/?view=performance')}
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
            onClick={() => setLocation('/?view=blog')}
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
            onClick={() => setLocation('/?view=cms')}
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
            onClick={() => setLocation('/?view=backup')}
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
            onClick={() => setLocation('/?view=settings')}
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
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
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
              onClick={() => setShowShareDialog(false)}
              className="border-slate-600 text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
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
              onClick={() => setShowCodeDialog(false)}
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

