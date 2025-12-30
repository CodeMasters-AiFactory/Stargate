import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IDEProvider } from '@/components/providers/IDEProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AutomationCursor } from '@/components/ui/AutomationCursor';
import { AdminRoute } from '@/components/Auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { InvestigationProvider } from '@/contexts/InvestigationContext';
import { ResearchStatusProvider } from '@/contexts/ResearchStatusContext';
import { IDEProvider as IDEHookProvider } from '@/hooks/use-ide';
import NotFound from '@/pages/not-found';
import { trackRender } from '@/utils/renderTracker';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Switch, useLocation, Redirect } from 'wouter';
import { queryClient } from './lib/queryClient';

// Lazy load heavy components for better code splitting
const MainLayout = lazy(() => import('@/components/IDE/MainLayout').then(module => ({ default: module.MainLayout })));
const TemplatePreviewPage = lazy(() => import('@/components/Templates/TemplatePreviewPage').then(module => ({ default: module.TemplatePreviewPage })));

// Merlin 8.0 Pages
const BuildChoice = lazy(() => import('@/pages/merlin8/BuildChoice'));
const QuickIntake = lazy(() => import('@/pages/merlin8/QuickIntake'));
const GeneratingProgress = lazy(() => import('@/pages/merlin8/GeneratingProgress'));
const TemplatesPage = lazy(() => import('@/pages/merlin8/Templates'));
const MerlinPackages = lazy(() => import('@/pages/merlin8/Packages'));
const ProfessionalDesign = lazy(() => import('@/pages/merlin8/ProfessionalDesign'));

// Onboarding Page
const OnboardingPage = lazy(() => import('@/pages/Onboarding'));

// Home Landing Page
const HomePage = lazy(() => import('@/pages/Home'));

// Contact Page (Workflow 3)
const ContactPage = lazy(() => import('@/pages/Contact'));

// Pricing Page
const PricingPageComponent = lazy(() => import('@/components/PricingPage').then(module => ({ default: module.PricingPage })));

// Wrapper for PricingPage to work with wouter routes
function PricingPageWithRoute() {
  return <PricingPageComponent />;
}

// Component that syncs URL with MainLayout view state
function MainLayoutWithRoute() {
  return <MainLayout />;
}

// Protected admin route - requires administrator role
function ProtectedAdminLayout() {
  return (
    <AdminRoute fallbackPath="/">
      <MainLayout />
    </AdminRoute>
  );
}

// Component that redirects first-time users to onboarding
function HomeWithOnboardingRedirect() {
  const [location] = useLocation();
  const isOnboardingCompleted = localStorage.getItem('stargate-tour-completed') === 'true';

  // Only redirect from root path, and only if onboarding not completed
  if (location === '/' && !isOnboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }

  // Show the Landing Page (Home.tsx) at root URL
  return <HomePage />;
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
        {/* Onboarding Route */}
        <Route path="/onboarding" component={OnboardingPage} />

        {/* Merlin 8.0 Routes */}
        <Route path="/merlin8/packages" component={MerlinPackages} />
        <Route path="/merlin8" component={BuildChoice} />
        <Route path="/merlin8/create" component={QuickIntake} />
        <Route path="/merlin8/generating" component={GeneratingProgress} />
        <Route path="/merlin8/templates" component={TemplatesPage} />
        <Route path="/merlin8/professional" component={ProfessionalDesign} />
        
        {/* Editor with dynamic project slug */}
        <Route path="/editor/:projectSlug" component={MainLayoutWithRoute} />
        
        <Route path="/template-preview/:id" component={TemplatePreviewPage} />
        <Route path="/stargate-websites" component={MainLayoutWithRoute} />
        <Route path="/merlin" component={MainLayoutWithRoute} />
        <Route path="/wizard" component={MainLayoutWithRoute} />
        <Route path="/admin" component={ProtectedAdminLayout} />
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
        <Route path="/contact" component={ContactPage} />
        <Route path="/pricing" component={PricingPageWithRoute} />
        <Route path="/" component={HomeWithOnboardingRedirect} />
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
