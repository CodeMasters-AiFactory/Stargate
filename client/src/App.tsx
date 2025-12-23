import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IDEProvider } from '@/components/providers/IDEProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AutomationCursor } from '@/components/ui/AutomationCursor';
import { OnboardingTour } from '@/components/Onboarding/OnboardingTour';
import { AuthProvider } from '@/contexts/AuthContext';
import { InvestigationProvider } from '@/contexts/InvestigationContext';
import { ResearchStatusProvider } from '@/contexts/ResearchStatusContext';
import { IDEProvider as IDEHookProvider } from '@/hooks/use-ide';
import NotFound from '@/pages/not-found';
import { trackRender } from '@/utils/renderTracker';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { queryClient } from './lib/queryClient';

// Lazy load heavy components for better code splitting
const MainLayout = lazy(() => import('@/components/IDE/MainLayout').then(module => ({ default: module.MainLayout })));
const TemplatePreviewPage = lazy(() => import('@/components/Templates/TemplatePreviewPage').then(module => ({ default: module.TemplatePreviewPage })));

// Merlin 8.0 Pages
const BuildChoice = lazy(() => import('@/pages/merlin8/BuildChoice'));
const QuickIntake = lazy(() => import('@/pages/merlin8/QuickIntake'));
const GeneratingProgress = lazy(() => import('@/pages/merlin8/GeneratingProgress'));

// Component that syncs URL with MainLayout view state
function MainLayoutWithRoute() {
  return <MainLayout />;
}

function Router() {
  // Only track once on mount, not on every render
  useEffect(() => {
    trackRender('Router', 'Initial mount');
  }, []); // Empty deps - only run once

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <Switch>
        {/* Merlin 8.0 Routes */}
        <Route path="/merlin8" component={BuildChoice} />
        <Route path="/merlin8/create" component={QuickIntake} />
        <Route path="/merlin8/generating" component={GeneratingProgress} />
        <Route path="/merlin8/templates" component={MainLayoutWithRoute} />
        
        {/* Editor with dynamic project slug */}
        <Route path="/editor/:projectSlug" component={MainLayoutWithRoute} />
        
        <Route path="/template-preview/:id" component={TemplatePreviewPage} />
        <Route path="/stargate-websites" component={MainLayoutWithRoute} />
        <Route path="/merlin" component={MainLayoutWithRoute} />
        <Route path="/wizard" component={MainLayoutWithRoute} />
        <Route path="/admin" component={MainLayoutWithRoute} />
        {/* Additional routes for direct URL access */}
        <Route path="/dashboard" component={MainLayoutWithRoute} />
        <Route path="/editor" component={MainLayoutWithRoute} />
        <Route path="/templates" component={MainLayoutWithRoute} />
        <Route path="/projects" component={MainLayoutWithRoute} />
        <Route path="/settings" component={MainLayoutWithRoute} />
        <Route path="/profile" component={MainLayoutWithRoute} />
        <Route path="/builder" component={MainLayoutWithRoute} />
        <Route path="/ide" component={MainLayoutWithRoute} />
        <Route path="/services" component={MainLayoutWithRoute} />
        <Route path="/apps" component={MainLayoutWithRoute} />
        <Route path="/deployments" component={MainLayoutWithRoute} />
        <Route path="/" component={MainLayout} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Only track once on mount, not on every render
  useEffect(() => {
    trackRender('App', 'Initial mount');
  }, []); // Empty deps - only run once

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <IDEHookProvider>
                <IDEProvider>
                  <InvestigationProvider>
                    <ResearchStatusProvider>
                      <Toaster />
                      <AutomationCursor enabled={true} />
                      <OnboardingTour />
                      <Router />
                    </ResearchStatusProvider>
                  </InvestigationProvider>
                </IDEProvider>
              </IDEHookProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
