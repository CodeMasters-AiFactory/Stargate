import { useAuth } from '@/contexts/AuthContext';
import { useIDE } from '@/hooks/use-ide';
import { trackRender } from '@/utils/renderTracker';
import React, { lazy, memo, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { BottomPanel } from './BottomPanel';
import { FileExplorer } from './FileExplorer';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { TopNavbar } from './TopNavbar';

// Lazy load heavy components for better code splitting
// All components use named exports, so we need to transform them to default exports
const AppsScreen = lazy(() => import('./AppsScreen').then(m => ({ default: m.AppsScreen })));
const DeploymentsScreen = lazy(() => import('./DeploymentsScreen').then(m => ({ default: m.DeploymentsScreen })));
const UsageScreen = lazy(() => import('./UsageScreen').then(m => ({ default: m.UsageScreen })));
const AIAgentSidebar = lazy(() => import('./AIAgentSidebar').then(m => ({ default: m.AIAgentSidebar })));
const StargateIDEPage = lazy(() => import('./StargateIDEPage').then(m => ({ default: m.StargateIDEPage })));
const ProjectCreationPage = lazy(() => import('./ProjectCreationPage').then(m => ({ default: m.ProjectCreationPage })));
const MarketingLandingPage = lazy(() => import('./MarketingLandingPage').then(m => ({ default: m.MarketingLandingPage })));
const ServicesScreen = lazy(() => import('./ServicesScreen').then(m => ({ default: m.ServicesScreen })));
const StargateWebsitesScreen = lazy(() => import('./StargateWebsitesScreen').then(m => ({ default: m.StargateWebsitesScreen })));
const WebsiteAnalysis = lazy(() => import('./WebsiteAnalysis').then(m => ({ default: m.WebsiteAnalysis })));
const WebsiteGenerationDebugger = lazy(() => import('./WebsiteGenerationDebugger').then(m => ({ default: m.WebsiteGenerationDebugger })));
const CodeEditor = lazy(() => import('./CodeEditor').then(m => ({ default: m.CodeEditor })));
const LivePreview = lazy(() => import('./LivePreview').then(m => ({ default: m.LivePreview })));
const SecretsManager = lazy(() => import('./SecretsManager').then(m => ({ default: m.SecretsManager })));
const GitManager = lazy(() => import('./GitManager').then(m => ({ default: m.GitManager })));
const MonitoringDashboard = lazy(() => import('./MonitoringDashboard').then(m => ({ default: m.MonitoringDashboard })));
const TemplateSelector = lazy(() => import('./TemplateSelector').then(m => ({ default: m.TemplateSelector })));
const ProjectCreationFlow = lazy(() => import('./ProjectCreationFlow').then(m => ({ default: m.ProjectCreationFlow })));
const MemoryAwareAgent = lazy(() => import('../AI/MemoryAwareAgent').then(m => ({ default: m.MemoryAwareAgent })));
const LiveTestingPanel = lazy(() => import('./LiveTestingPanel').then(m => ({ default: m.LiveTestingPanel })));
const MerlinPackageSelection = lazy(() => import('./MerlinPackageSelection').then(m => ({ default: m.MerlinPackageSelection })));
const MerlinQuickGenerate = lazy(() => import('./MerlinQuickGenerate').then(m => ({ default: m.MerlinQuickGenerate })));
const DownloadProjectScreen = lazy(() => import('./DownloadProjectScreen').then(m => ({ default: m.DownloadProjectScreen })));
const MarketingScreen = lazy(() => import('../Marketing/MarketingScreen').then(m => ({ default: m.MarketingScreen })));
const AdvancedAnalyticsScreen = lazy(() => import('../Analytics/AdvancedAnalyticsScreen').then(m => ({ default: m.AdvancedAnalyticsScreen })));
const TemplateMarketplaceScreen = lazy(() => import('../Templates/TemplateMarketplaceScreen').then(m => ({ default: m.TemplateMarketplaceScreen })));
const CollaborationScreen = lazy(() => import('../Collaboration/CollaborationScreen').then(m => ({ default: m.CollaborationScreen })));
const AdminPanel = lazy(() => import('../Admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const BackupScreen = lazy(() => import('./BackupScreen').then(m => ({ default: m.BackupScreen })));
const SettingsScreen = lazy(() => import('./SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const BlogList = lazy(() => import('../Blog/BlogList').then(m => ({ default: m.BlogList })));
const PerformanceDashboard = lazy(() => import('../Performance/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));
const CMSScreen = lazy(() => import('../CMS/CMSScreen').then(m => ({ default: m.CMSScreen })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Memoize MainLayout to prevent unnecessary re-renders
export const MainLayout = memo(function MainLayout() {
  const { state, setState } = useIDE();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const prevStateRef = useRef(state);
  const prevAuthRef = useRef({ isAuthenticated, isLoading });
  const hasInitializedRef = useRef(false); // Track if initial sync has happened

  // PERMANENT FIX: Only sync URL → View on INITIAL mount, not on every render
  // This prevents redirects when refreshing the page
  useEffect(() => {
    // Only sync on initial mount (first render)
    if (hasInitializedRef.current) {
      return; // Don't sync on subsequent renders - preserve current view
    }

    hasInitializedRef.current = true; // Mark as initialized

    // Check for view query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    
    // Sync URL → View only on initial mount
    if (viewParam) {
      console.log(`[MainLayout] Initial sync: URL view parameter → ${viewParam}`);
      setState(prev => ({ ...prev, currentView: viewParam as any }));
      return;
    }
    
    // Handle /editor/:projectSlug routes - restore wizard state for refresh persistence
    if (location.startsWith('/editor/')) {
      const projectSlug = location.replace('/editor/', '');
      console.log(`[MainLayout] Editor route detected with project: ${projectSlug}`);

      // Try to restore wizard state from localStorage
      const savedState = localStorage.getItem('stargate-wizard-state');
      if (savedState) {
        try {
          const wizardState = JSON.parse(savedState);
          // If the saved state has the same project (by comparing business name slug)
          // Check both businessInfo (new) and requirements.businessName (legacy)
          const businessName = wizardState.businessInfo?.businessName ||
                               wizardState.requirements?.businessName || '';
          const savedSlug = businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          if (savedSlug === projectSlug || wizardState.stage === 'final-website') {
            console.log(`[MainLayout] Restoring wizard state for project: ${projectSlug}, stage: ${wizardState.stage}`);
            setState(prev => ({ ...prev, currentView: 'stargate-websites' as any }));
            return;
          }
        } catch (e) {
          console.error('[MainLayout] Failed to parse wizard state:', e);
        }
      }
      // Default to stargate-websites for any editor route
      setState(prev => ({ ...prev, currentView: 'stargate-websites' as any }));
      return;
    }

    // Map URL paths to views
    const pathToView: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/editor': 'ide',
      '/ide': 'ide',
      '/templates': 'templates',
      '/projects': 'apps',
      '/settings': 'settings',
      '/profile': 'profile',
      '/builder': 'ide',
      '/services': 'services',
      '/apps': 'apps',
      '/deployments': 'deployments',
      '/admin': 'admin',
      '/merlin': 'stargate-websites',
      '/wizard': 'stargate-websites',
      '/stargate-websites': 'stargate-websites',
    };

    const targetView = pathToView[location];
    if (targetView && state.currentView !== targetView) {
      console.log(`[MainLayout] Initial sync: URL ${location} → ${targetView} view`);
      setState(prev => ({ ...prev, currentView: targetView as any }));
    }
  }, []); // Empty deps - only run once on mount

  // Track re-renders and identify cause
  useEffect(() => {
    const reasons: string[] = [];

    // Check if IDE state changed
    if (prevStateRef.current !== state) {
      const changedKeys: string[] = [];
      if (prevStateRef.current.currentView !== state.currentView) changedKeys.push('currentView');
      if (prevStateRef.current.currentProject?.id !== state.currentProject?.id)
        changedKeys.push('currentProject');
      if (prevStateRef.current.activeTabId !== state.activeTabId) changedKeys.push('activeTabId');
      if (prevStateRef.current.openTabs.length !== state.openTabs.length)
        changedKeys.push('openTabs.length');
      if (prevStateRef.current.fileTree.length !== state.fileTree.length)
        changedKeys.push('fileTree.length');
      if (prevStateRef.current.isLoading !== state.isLoading) changedKeys.push('isLoading');

      if (changedKeys.length > 0) {
        reasons.push(`IDE state: ${changedKeys.join(', ')}`);
      } else {
        reasons.push('IDE state: unknown change');
      }
      prevStateRef.current = state;
    }

    // Check if auth state changed
    if (
      prevAuthRef.current.isAuthenticated !== isAuthenticated ||
      prevAuthRef.current.isLoading !== isLoading
    ) {
      reasons.push(`Auth: isAuthenticated=${isAuthenticated}, isLoading=${isLoading}`);
      prevAuthRef.current = { isAuthenticated, isLoading };
    }

    trackRender('MainLayout', reasons.length > 0 ? reasons.join(' | ') : 'Unknown');
  }, [state, isAuthenticated, isLoading]); // Track when these change
  // Persist sidebar collapsed state - load from localStorage, default to false
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  
  // Save sidebar state to localStorage whenever it changes
  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Debug log removed to prevent console spam - uncomment if needed for debugging
  // console.log('MainLayout render - currentView:', state.currentView);
  const [_sidebarWidth] = useState(192); // Reduced from 250 to 192 (12rem)
  const [aiSidebarCollapsed, setAiSidebarCollapsed] = useState(false);

  const switchToApps = () => {
    console.log('switchToApps called!'); // Debug log
    setState(prev => ({
      ...prev,
      currentView: 'apps',
    }));
  };

  const switchToDashboard = () => {
    // Redirect to Merlin Website Wizard (no longer using Services Dashboard)
    setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
  };

  const switchToDeployments = () => {
    setState(prev => ({ ...prev, currentView: 'deployments' }));
  };

  const switchToUsage = () => {
    setState(prev => ({ ...prev, currentView: 'usage' }));
  };

  const switchToLanding = () => {
    // Marketing Landing Page - Public marketing website
    setState(prev => ({ ...prev, currentView: 'landing' }));
  };
  
  const switchToIDE = () => {
    // Stargate IDE - Full IDE interface with code editor
    setState(prev => ({ ...prev, currentView: 'ide' }));
  };

  const switchToTemplates = () => {
    setState(prev => ({ ...prev, currentView: 'templates' }));
    setSelectedTemplate(null);
  };

  const switchToHome = () => {
    setState(prev => ({ ...prev, currentView: 'home' }));
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setState(prev => ({ ...prev, currentView: 'project-creation' }));
  };

  const handleCreateProject = async (projectData: any) => {
    console.log('Creating project:', projectData);

    try {
      // Create project via API (or in-memory for demo)
      const projectId = `project-${Date.now()}`;
      const newProject = {
        id: projectId,
        name: projectData.name || 'New Project',
        template: projectData.template || 'react',
        isPublic: projectData.isPublic || false,
        files: projectData.files || getTemplateFiles(projectData.template || 'react'),
        createdAt: new Date().toISOString(),
      };

      // In a real implementation, this would call an API
      // For now, we'll update the IDE state directly
      setState(prev => ({
        ...prev,
        currentProject: newProject,
        currentView: 'explorer',
        fileTree: buildFileTreeFromFiles(newProject.files),
      }));

      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to create project:', error);
      // Still switch back to apps view on error
      setState(prev => ({ ...prev, currentView: 'apps' }));
      setSelectedTemplate(null);
    }
  };

  const getTemplateFiles = (template: string): Record<string, string> => {
    const templates: Record<string, Record<string, string>> = {
      react: {
        'package.json': JSON.stringify(
          {
            name: 'my-app',
            version: '1.0.0',
            dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' },
          },
          null,
          2
        ),
        'src/App.jsx': `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Welcome to React</h1>
    </div>
  );
}

export default App;`,
        'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
        'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
      },
      vanilla: {
        'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <h1>Hello World</h1>
  <script src="app.js"></script>
</body>
</html>`,
        'app.js': `console.log('Hello World');`,
      },
    };
    return templates[template] || templates.react;
  };

  const buildFileTreeFromFiles = (files: Record<string, string>): any[] => {
    const tree: any[] = [];
    const pathMap: Map<string, any> = new Map();

    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const node: any = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : [],
            isOpen: true,
          };

          pathMap.set(currentPath, node);

          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = pathMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          }
        }
      });
    });

    return tree;
  };

  // Hide sidebar for package selection, landing page, IDE, dashboard, quick generate, or when not authenticated
  const showSidebar = state.currentView !== 'merlin-packages' && state.currentView !== 'merlin-quick-generate' && state.currentView !== 'landing' && state.currentView !== 'ide' && state.currentView !== 'dashboard' && state.currentView !== 'stargate-websites' && isAuthenticated;

  // Set default view based on authentication status
  // Only run once when auth status is determined and no view is set
  // Set default view on mount - use ref to prevent re-triggering
  const hasSetDefaultViewRef = React.useRef(false);
  React.useEffect(() => {
    // Reset to default view if on root path and viewing templates
    if (location === '/' && (state.currentView === 'templates' || state.currentView === 'template-marketplace')) {
      console.log('[MainLayout] Resetting from templates view to default on root path');
      hasSetDefaultViewRef.current = false; // Allow reset
    }

    // Only set default view once (or when reset is needed)
    // For authenticated users, default to home (services dashboard)
    // For non-authenticated users, default to website-page (actual website)
    // IMPORTANT: Only set default if view is empty/undefined, NOT if user explicitly navigated
    if (
      !hasSetDefaultViewRef.current &&
      !isLoading &&
      (location === '/' || !state.currentView)
    ) {
      hasSetDefaultViewRef.current = true;
      // Authenticated users default to website wizard, non-authenticated default to landing page
      const defaultView = isAuthenticated ? 'stargate-websites' : 'landing';
      setState(prev => {
        // ONLY set default view if view is empty/undefined
        // NEVER override if user has explicitly set a view (e.g., via BackButton)
        if (!prev.currentView) {
          console.log('[MainLayout] Setting default view:', defaultView);
          return { ...prev, currentView: defaultView };
        }
        // Don't override existing views - user may have navigated explicitly
        console.log('[MainLayout] Keeping existing view:', prev.currentView);
        return prev;
      });
    }
  }, [isAuthenticated, isLoading, location]); // REMOVED state.currentView from deps to prevent override

  // Show loading state only during initial auth check
  if (isLoading && !state.currentView) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-foreground overflow-hidden">
      {/* Left Sidebar - Full Height (hidden for package selection or when not authenticated) */}
      {showSidebar && (
        <Sidebar
          activePanel={
            state.currentView === 'apps'
              ? 'explorer'
              : state.currentView === 'ide'
                ? 'stargate-ide'
                : state.currentView === 'landing'
                  ? 'landing'
                  : state.currentView === 'dashboard'
                    ? 'dashboard'
                    : state.currentView
          }
          currentModule="stargate"
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
          onModuleChange={module => {
            console.log('Switching to module:', module);
            // Module switching logic
            switch (module) {
              case 'stargate':
                // 'ide' = Stargate IDE - Full IDE interface
                setState(prev => ({ ...prev, currentView: 'ide' }));
                break;
              case 'services':
                setState(prev => ({ ...prev, currentView: 'services' }));
                break;
              default:
                // Default to IDE
                setState(prev => ({ ...prev, currentView: 'ide' }));
            }
          }}
          onPanelChange={panel => {
            console.log('Panel change:', panel); // Debug log
            if (panel === 'dashboard') setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
            if (panel === 'landing') switchToLanding();
            if (panel === 'stargate-ide') switchToIDE();
            if (panel === 'home') switchToDashboard(); // Legacy support
            if (panel === 'website') switchToLanding(); // Legacy support
            if (panel === 'website-page') switchToLanding(); // Legacy support
            if (panel === 'services') setState(prev => ({ ...prev, currentView: 'services' }));
            if (panel === 'stargate-websites') {
              // Check authentication before accessing products
              if (!isAuthenticated) {
                // This will show the login screen since showSidebar will be false
                return;
              }
              // Go directly to wizard - Phase 1 (package selection) is inside the wizard
              setState(prev => ({ ...prev, currentView: 'stargate-websites' }));
              setLocation('/stargate-websites');
            }
            if (panel === 'explorer') {
              console.log('Switching to apps via explorer'); // Debug log
              switchToApps();
            }
            if (panel === 'deployments') switchToDeployments();
            if (panel === 'usage') switchToUsage();
            if (panel === 'templates') switchToTemplates();
            if (panel === 'agent') setState(prev => ({ ...prev, currentView: 'agent' }));
            // Add all the new functionality
            if (panel === 'console') setState(prev => ({ ...prev, currentView: 'console' }));
            if (panel === 'shell') setState(prev => ({ ...prev, currentView: 'shell' }));
            if (panel === 'preview') setState(prev => ({ ...prev, currentView: 'preview' }));
            if (panel === 'git') setState(prev => ({ ...prev, currentView: 'git' }));
            if (panel === 'database') setState(prev => ({ ...prev, currentView: 'database' }));
            if (panel === 'storage') setState(prev => ({ ...prev, currentView: 'storage' }));
            if (panel === 'secrets') setState(prev => ({ ...prev, currentView: 'secrets' }));
            if (panel === 'download') setState(prev => ({ ...prev, currentView: 'download' }));
            if (panel === 'multiplayer')
              setState(prev => ({ ...prev, currentView: 'multiplayer' }));
            if (panel === 'history') setState(prev => ({ ...prev, currentView: 'history' }));
            if (panel === 'extensions') setState(prev => ({ ...prev, currentView: 'extensions' }));
            if (panel === 'analytics') setState(prev => ({ ...prev, currentView: 'analytics' }));
            if (panel === 'live-testing')
              setState(prev => ({ ...prev, currentView: 'live-testing' }));
            if (panel === 'website-debugger')
              setState(prev => ({ ...prev, currentView: 'website-debugger' }));
            if (panel === 'admin') setState(prev => ({ ...prev, currentView: 'admin' }));
            if (panel === 'marketing') setState(prev => ({ ...prev, currentView: 'marketing' }));
            if (panel === 'analytics-advanced') setState(prev => ({ ...prev, currentView: 'analytics-advanced' }));
            if (panel === 'template-marketplace') setState(prev => ({ ...prev, currentView: 'template-marketplace' }));
            if (panel === 'collaboration') setState(prev => ({ ...prev, currentView: 'collaboration' }));
          }}
        />
      )}

      {/* Main Content Area with Top Navigation */}
      <div className="flex-1 flex flex-col h-full">
        {/* Top Navigation Bar (hidden for package selection and website page) */}
        {showSidebar && (
          <TopNavbar
            currentSection={
              state.currentView === 'ide'
                ? 'Stargate IDE'
                : state.currentView === 'dashboard'
                  ? 'Dashboard'
                  : state.currentView === 'services'
                    ? 'Services'
                    : state.currentView === 'stargate-websites'
                      ? 'Merlin Website Wizard'
                      : state.currentView === 'apps'
                        ? 'Applications'
                        : state.currentView === 'deployments'
                          ? 'Deployments'
                          : state.currentView === 'usage'
                            ? 'Usage Analytics'
                            : state.currentView === 'agent'
                              ? 'AI Assistant'
                              : state.currentView === 'templates'
                                ? 'Templates'
                                : state.currentView === 'git'
                                  ? 'Git Version Control'
                                  : state.currentView === 'analytics'
                                    ? 'Monitoring Dashboard'
                                    : state.currentView === 'live-testing'
                                      ? 'Live Testing'
                                      : state.currentView === 'website-debugger'
                                        ? 'Website Generation Debugger'
                                        : state.currentView === 'marketing'
                                          ? 'Marketing Automation'
                                          : state.currentView === 'analytics-advanced'
                                            ? 'Advanced Analytics'
                                            : state.currentView === 'template-marketplace'
                                              ? 'Template Marketplace'
                                              : state.currentView === 'collaboration'
                                                ? 'Collaboration'
                                                : state.currentView === 'blog'
                                                  ? 'Blog'
                                                  : state.currentView === 'performance'
                                                    ? 'Performance'
                                                    : state.currentView === 'cms'
                                                      ? 'CMS'
                                                      : 'Dashboard'
            }
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto h-full">
          <Suspense fallback={<LoadingFallback />}>
            {state.currentView === 'dashboard' ? (
            /* Redirect dashboard to Merlin Website Wizard */
            <StargateWebsitesScreen />
          ) : state.currentView === 'ide' ? (
            /* Stargate IDE - Full IDE Interface with code editor */
            <StargateIDEPage />
          ) : state.currentView === 'landing' ? (
            /* Marketing Landing Page - Public marketing website */
            <MarketingLandingPage />
          ) : state.currentView === 'project-creation' ? (
            /* Project Creation Page - Create new projects interface */
            <ProjectCreationPage />
          ) : !isAuthenticated && (location === '/' || !state.currentView) ? (
            /* Landing Page for Non-Authenticated Users */
            <MarketingLandingPage />
          ) : state.currentView === 'services' ? (
            /* Services Screen - Full Width */
            <ServicesScreen />
          ) : state.currentView === 'merlin-packages' ? (
            /* Merlin Package Selection - Choose package before starting wizard */
            <MerlinPackageSelection />
          ) : state.currentView === 'merlin-quick-generate' ? (
            /* Merlin Quick Generate - Skip checklist, generate directly! */
            <MerlinQuickGenerate />
          ) : state.currentView === 'stargate-websites' ? (
            /* Merlin Website Wizard - Full Width */
            <StargateWebsitesScreen />
          ) : state.currentView === 'website-analysis' ? (
            /* Website Analysis - Full Width */
            <WebsiteAnalysis />
          ) : state.currentView === 'website-debugger' ? (
            /* Website Generation Debugger - Full Width */
            <WebsiteGenerationDebugger
              onComplete={result => {
                console.log('Website generation complete!', result);
              }}
              onError={error => {
                console.error('Website generation error:', error);
              }}
            />
          ) : state.currentView === 'apps' ? (
            /* Apps Management Screen - Full Width */
            <AppsScreen />
          ) : state.currentView === 'deployments' ? (
            /* Deployments Screen - Full Width */
            <DeploymentsScreen />
          ) : state.currentView === 'usage' ? (
            /* Usage Screen - Full Width */
            <UsageScreen />
          ) : state.currentView === 'settings' ? (
            /* Settings Screen - Full Width */
            <SettingsScreen />
          ) : state.currentView === 'backup' ? (
            /* Backup Screen - Full Width */
            <BackupScreen />
          ) : state.currentView === 'templates' ? (
            /* Template Selector - Full Width */
            <TemplateSelector onTemplateSelect={handleTemplateSelect} onBack={switchToHome} />
          ) : (state.currentView as string) === 'project-creation' ? (
            /* Project Creation Flow - Full Width */
            <ProjectCreationFlow
              template={selectedTemplate}
              onBack={switchToTemplates}
              onCreateProject={handleCreateProject}
            />
          ) : state.currentView === 'agent' ? (
            /* Memory-Aware AI Agent - Full Width */
            <div className="h-full p-6">
              <MemoryAwareAgent
                userId="default-user"
                agentId="persistent-agent"
                onProjectCreate={projectData => {
                  console.log('Project created via memory-aware agent:', projectData);
                  // Switch to apps view to show the created project
                  setState(prev => ({ ...prev, currentView: 'apps' }));
                }}
                className="h-full w-full"
              />
            </div>
          ) : state.currentView === 'console' ? (
            /* Console View */
            <div className="w-full p-8">
              <h1 className="text-2xl font-bold mb-4">Console</h1>
              <div className="bg-black text-green-400 font-mono p-4 rounded h-96 overflow-y-auto">
                <div>$ npm start</div>
                <div>Starting development server...</div>
                <div className="text-blue-400">Server running on port 5000</div>
                <div className="text-yellow-400">Ready for connections</div>
                <div className="animate-pulse">$|</div>
              </div>
            </div>
          ) : state.currentView === 'shell' ? (
            /* Shell/Terminal View */
            <div className="w-full p-8">
              <h1 className="text-2xl font-bold mb-4">Shell</h1>
              <div className="bg-gray-900 text-white font-mono p-4 rounded h-96">
                <div className="text-green-400">user@stargate:~$ </div>
                <div>Type commands here...</div>
                <div className="text-gray-500">Available: ls, cd, npm, git, python, etc.</div>
                <div className="animate-pulse mt-2">user@stargate:~$ |</div>
              </div>
            </div>
          ) : state.currentView === 'preview' ? (
            /* Live Preview - Full Screen */
            <LivePreview isVisible={true} />
          ) : state.currentView === 'git' ? (
            /* Git Manager */
            <GitManager />
          ) : state.currentView === 'database' ? (
            /* Database View */
            <div className="w-full p-8">
              <h1 className="text-2xl font-bold mb-4">Database</h1>
              <div className="bg-card p-4 rounded border">
                <h3 className="font-semibold mb-4">PostgreSQL Database</h3>
                <div className="bg-gray-900 text-green-400 font-mono p-3 rounded text-sm">
                  <div>postgres=# SELECT * FROM users;</div>
                  <div className="mt-2">Connected to: stargate_dev</div>
                  <div>Status: Active</div>
                </div>
              </div>
            </div>
          ) : state.currentView === 'secrets' ? (
            /* Secrets Manager */
            <SecretsManager projectId="demo-project-1" />
          ) : state.currentView === 'analytics' ? (
            /* Monitoring Dashboard */
            <MonitoringDashboard />
          ) : state.currentView === 'live-testing' ? (
            /* Live Testing Panel - Like Replit's Live Testing */
            <LiveTestingPanel />
          ) : state.currentView === 'download' ? (
            /* Download Project Screen - Full Width */
            <DownloadProjectScreen />
          ) : state.currentView === 'admin' ? (
            /* Admin Panel - Full Width */
            <AdminPanel />
          ) : state.currentView === 'marketing' ? (
            /* Marketing Automation Screen - Full Width */
            <MarketingScreen />
          ) : state.currentView === 'analytics-advanced' ? (
            /* Advanced Analytics Screen - Full Width */
            <AdvancedAnalyticsScreen />
          ) : state.currentView === 'template-marketplace' ? (
            /* Template Marketplace Screen - Full Width */
            <TemplateMarketplaceScreen />
          ) : state.currentView === 'collaboration' ? (
            /* Collaboration Screen - Full Width */
            <CollaborationScreen />
          ) : state.currentView === 'blog' ? (
            /* Blog Management - Full Width */
            <BlogList
              websiteId={state.currentProject?.id || 'default'}
              onNewPost={() => {
                setState(prev => ({ ...prev, currentView: 'blog-editor' }));
              }}
              onEditPost={(postId) => {
                setState(prev => ({ ...prev, currentView: 'blog-editor', blogPostId: postId } as any));
              }}
              onViewPost={(postId) => {
                setState(prev => ({ ...prev, currentView: 'blog-post', blogPostId: postId } as any));
              }}
            />
          ) : state.currentView === 'blog-editor' ? (
            /* Blog Editor - Full Width */
            <div className="h-full">
              <Suspense fallback={<LoadingFallback />}>
                {(() => {
                  const BlogEditor = lazy(() => import('../Blog/BlogEditor').then(m => ({ default: m.BlogEditor })));
                  return (
                    <BlogEditor
                      websiteId={state.currentProject?.id || 'default'}
                      postId={(state as any).blogPostId}
                      onSave={() => {
                        setState(prev => ({ ...prev, currentView: 'blog' }));
                      }}
                      onCancel={() => {
                        setState(prev => ({ ...prev, currentView: 'blog' }));
                      }}
                    />
                  );
                })()}
              </Suspense>
            </div>
          ) : state.currentView === 'blog-post' ? (
            /* Blog Post Display - Full Width */
            <div className="h-full">
              <Suspense fallback={<LoadingFallback />}>
                {(() => {
                  const BlogPost = lazy(() => import('../Blog/BlogPost').then(m => ({ default: m.BlogPost })));
                  return (
                    <BlogPost
                      websiteId={state.currentProject?.id || 'default'}
                      postSlug={(state as any).blogPostId || ''}
                      onBack={() => {
                        setState(prev => ({ ...prev, currentView: 'blog' }));
                      }}
                    />
                  );
                })()}
              </Suspense>
            </div>
          ) : state.currentView === 'performance' ? (
            /* Performance Dashboard - Full Width */
            <PerformanceDashboard websiteId={state.currentProject?.id || 'default'} />
          ) : state.currentView === 'cms' ? (
            /* CMS Management - Full Width */
            <CMSScreen websiteId={state.currentProject?.id || 'default'} />
          ) : state.currentView === 'pandora' ? (
            /* PANDORA Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">PANDORA</h2>
                <p className="text-muted-foreground">Multi-AI Collaboration Platform</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'regis' ? (
            /* Regis Core Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Regis Core</h2>
                <p className="text-muted-foreground">AI Routing & Cost Optimization</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'nero' ? (
            /* Nero Core Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Nero Core</h2>
                <p className="text-muted-foreground">AI Firewall & Security</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'quantum' ? (
            /* Quantum Core Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Quantum Core</h2>
                <p className="text-muted-foreground">Quantum Investigations</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'titan-ticket' ? (
            /* Titan Ticket Master Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Titan Ticket Master</h2>
                <p className="text-muted-foreground">Advanced Ticket Management</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'titan-support' ? (
            /* Titan Support Master Service - Placeholder */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Titan Support Master</h2>
                <p className="text-muted-foreground">Customer Support Platform</p>
                <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
              </div>
            </div>
          ) : state.currentView === 'ai-factory' ? (
            /* AI Factory Service - Global App Marketplace */
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">AI Factory</h2>
                <p className="text-muted-foreground">Global App Marketplace</p>
                <p className="text-sm text-muted-foreground mt-2">Sell your apps and programs to the entire world</p>
                <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
              </div>
            </div>
          ) : (
            <>
              {/* File Explorer */}
              <div className="w-64 min-w-64 max-w-80">
                <FileExplorer isVisible={true} />
              </div>

              {/* Code Editor with Console at Bottom */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
                <TabBar />
                <div className="flex-1 overflow-hidden min-h-0">
                  <CodeEditor />
                </div>
                <BottomPanel />
              </div>

              {/* AI Assistant - Only show in code editor view */}
              <AIAgentSidebar
                isCollapsed={aiSidebarCollapsed}
                onToggle={() => setAiSidebarCollapsed(!aiSidebarCollapsed)}
              />
            </>
          )}
          </Suspense>
        </div>
      </div>
    </div>
  );
});
