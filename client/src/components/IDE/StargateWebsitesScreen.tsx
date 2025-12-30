import { WebsiteBuilderWizard } from './WebsiteBuilderWizard';
import { DashboardView } from './DashboardView';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { NavigationButtons } from './BackButton';

interface ProjectData {
  projectId: string;
  projectName: string;
  html: string;
  css?: string;
  businessInfo?: Record<string, any>;
  templateId?: string;
  templateName?: string;
}

export function StargateWebsitesScreen() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [location] = useLocation();
  // DEFAULT TO TRUE - Go directly to package selection wizard when navigating here
  const [showWizard, setShowWizard] = useState(true);
  const [checkedWizardState, setCheckedWizardState] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [remountKey, setRemountKey] = useState(Date.now());
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [initialProject, setInitialProject] = useState<ProjectData | null>(null);

  // Initialize wizard on mount - check for project slug in URL first
  useEffect(() => {
    // CRITICAL FIX: Always show wizard when this screen is mounted
    setShowWizard(true);

    // Check if we're on /editor/:projectSlug route - load that project directly
    if (location.startsWith('/editor/')) {
      const projectSlug = location.replace('/editor/', '');
      if (projectSlug) {
        console.log('[StargateWebsitesScreen] Detected /editor/ route with project slug:', projectSlug);
        loadMerlin8Project(projectSlug);
        return; // Don't run the rest of the initialization
      }
    }

    // Check if there's already valid wizard state
    const existingState = localStorage.getItem('stargate-wizard-state');
    let shouldReset = true;

    if (existingState) {
      try {
        const parsed = JSON.parse(existingState);
        // If we have a valid stage that's not package-select, preserve it
        if (parsed?.stage && ['template-select', 'quick-form', 'final-website'].includes(parsed.stage)) {
          shouldReset = false;
          setCurrentStage(parsed.stage);
          console.log('[StargateWebsitesScreen] Preserving existing wizard state:', parsed.stage);
        }
      } catch (e) {
        // Invalid JSON, reset
      }
    }

    if (shouldReset) {
      // Only reset if no valid state exists
      localStorage.removeItem('stargate-wizard-state');
      localStorage.removeItem('merlin_generated_website');
      localStorage.setItem('stargate-wizard-state', JSON.stringify({ stage: 'package-select' }));
      setCurrentStage('package-select');
      console.log('[StargateWebsitesScreen] Initialized fresh wizard at package-select');
    }

    setCheckedWizardState(true);
  }, [location]);

  // Load a Merlin 8 generated project from website_projects folder
  const loadMerlin8Project = async (projectSlug: string) => {
    setLoadingProject(true);
    console.log('[StargateWebsitesScreen] Loading Merlin 8 project:', projectSlug);

    try {
      // Try to load the generated HTML from website_projects folder
      const htmlResponse = await fetch(`/website_projects/${projectSlug}/merlin8-output/index.html`);

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        console.log('[StargateWebsitesScreen] ✅ Loaded Merlin 8 project HTML, length:', html.length);

        // Format the project name from slug
        const projectName = projectSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Set up the wizard state to go directly to final-website stage
        // Include all required fields that WebsiteBuilderWizard expects
        const wizardState = {
          stage: 'final-website',
          projectSlug: projectSlug,
          selectedPackage: 'pro', // Default package for editing
          businessInfo: {
            businessName: projectName,
          },
          requirements: {
            businessName: projectName,
            businessType: 'Business', // Generic type for loaded projects
            targetAudience: 'General',
            projectGoal: 'Website editing',
          },
          mergedTemplate: {
            html: html,
          },
          // Mark that this is a loaded project (not generated fresh)
          loadedFromProject: true,
        };

        localStorage.setItem('stargate-wizard-state', JSON.stringify(wizardState));
        setCurrentStage('final-website');
        setShowWizard(true);
        setRemountKey(Date.now());
        console.log('[StargateWebsitesScreen] ✅ Set up wizard for final-website stage');
      } else {
        console.warn('[StargateWebsitesScreen] ⚠️ Could not load Merlin 8 project, falling back to package-select');
        // Fall back to normal initialization
        localStorage.removeItem('stargate-wizard-state');
        localStorage.setItem('stargate-wizard-state', JSON.stringify({ stage: 'package-select' }));
        setCurrentStage('package-select');
      }
    } catch (err) {
      console.error('[StargateWebsitesScreen] Error loading Merlin 8 project:', err);
      // Fall back to normal initialization
      localStorage.removeItem('stargate-wizard-state');
      localStorage.setItem('stargate-wizard-state', JSON.stringify({ stage: 'package-select' }));
      setCurrentStage('package-select');
    } finally {
      setLoadingProject(false);
      setCheckedWizardState(true);
    }
  };

  // Handle opening an existing project
  const handleOpenProject = async (projectId: string) => {
    setEditingProjectId(projectId);
    setLoadingProject(true);
    console.log('[StargateWebsitesScreen] Opening project:', projectId);

    try {
      const res = await fetch(`/api/projects/${projectId}`, { credentials: 'include' });
      const project = await res.json();

      console.log('[StargateWebsitesScreen] Project loaded:', project?.name, 'HTML length:', project?.html?.length || 0);

      if (project && project.html) {
        // DIRECT PROJECT LOAD: Pass project data via props instead of localStorage
        // This bypasses all the localStorage race conditions in the wizard
        const projectData: ProjectData = {
          projectId: projectId,
          projectName: project.name,
          html: project.html,
          css: project.css || '',
          businessInfo: project.businessInfo || {},
          templateId: project.templateId,
          templateName: project.templateName,
        };

        console.log('[StargateWebsitesScreen] Setting initialProject for direct load');
        setInitialProject(projectData);
        setRemountKey(Date.now()); // Force remount wizard with new key
        setShowWizard(true);
      } else {
        console.warn('[StargateWebsitesScreen] Project has no HTML, starting fresh');
        // If project has no HTML, start the wizard from beginning with project context
        localStorage.removeItem('stargate-wizard-state');
        setInitialProject(null);
        setShowWizard(true);
        setRemountKey(Date.now());
      }
    } catch (err) {
      console.error('[StargateWebsitesScreen] Error loading project:', err);
    } finally {
      setLoadingProject(false);
    }
  };

  // Handle creating a new project
  const handleNewProject = () => {
    // Clear any existing wizard state
    localStorage.removeItem('stargate-wizard-state');
    setEditingProjectId(null);
    setInitialProject(null); // Clear any initial project data
    setShowWizard(true);
    setRemountKey(Date.now());
  };

  // Handle going back to projects list
  const handleBackToProjects = () => {
    console.log('[StargateWebsitesScreen] handleBackToProjects called - switching to projects view');
    setShowWizard(false);
    setEditingProjectId(null);
  };

  // Show loading state while checking auth or wizard state or loading project
  if (isLoading || !checkedWizardState || loadingProject) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-3 text-white/70">{loadingProject ? 'Loading project...' : 'Loading...'}</span>
      </div>
    );
  }

  // Show Dashboard/Projects view when user clicks "My Projects"
  if (!showWizard) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <DashboardView
          onGenerate={handleNewProject}
          onAIPlan={handleNewProject}
          onAllTools={handleNewProject}
          onOpenProject={handleOpenProject}
          username={user?.username}
        />
      </div>
    );
  }

  // Show the wizard (for new project or continuing existing session)
  // Check if wizard is at package-select stage (read from localStorage)
  const savedWizardState = localStorage.getItem('stargate-wizard-state');
  const isPackageSelectStage = !savedWizardState || (() => {
    try {
      const parsed = JSON.parse(savedWizardState);
      return parsed?.stage === 'package-select' || !parsed?.stage;
    } catch {
      return true;
    }
  })();

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Sticky Navigation Bar for Wizard - Hidden on package-select for cleaner look */}
      {!isPackageSelectStage && (
        <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <NavigationButtons
            backDestination="dashboard"
            backLabel="Back to Services"
            className="[&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:border-none [&_button]:text-white [&_button]:shadow-lg [&_button]:px-4 [&_button]:py-2"
          />
          <button
            onClick={handleBackToProjects}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            My Projects
          </button>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <WebsiteBuilderWizard
          key={remountKey}
          onBackToProjects={handleBackToProjects}
          initialProject={initialProject || undefined}
        />
      </div>
    </div>
  );
}
