import { WebsiteBuilderWizard } from './WebsiteBuilderWizard';
import { DashboardView } from './DashboardView';
import { useEffect, useState } from 'react';
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
  const [showWizard, setShowWizard] = useState(false);
  const [checkedWizardState, setCheckedWizardState] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [remountKey, setRemountKey] = useState(Date.now());
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [initialProject, setInitialProject] = useState<ProjectData | null>(null);

  // Check if there's an active wizard session
  useEffect(() => {
    const savedState = localStorage.getItem('stargate-wizard-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const stage = parsed?.stage;
        setCurrentStage(stage);
        // If there's an active wizard session past the initial stage, show the wizard
        if (stage && stage !== 'mode-select' && stage !== 'discover') {
          setShowWizard(true);
        }
      } catch (e) {
        setCurrentStage(null);
      }
    }
    setCheckedWizardState(true);
  }, []);

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

  // If authenticated and not in wizard mode, show the dashboard with projects
  if (isAuthenticated && !showWizard) {
    return (
      <div className="h-full flex flex-col overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Sticky Navigation Bar */}
        <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <NavigationButtons
            backDestination="dashboard"
            backLabel="Back to Services"
            className="[&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:border-none [&_button]:text-white [&_button]:shadow-lg [&_button]:px-4 [&_button]:py-2"
          />
        </div>
        <div className="p-6">
          <DashboardView
            onGenerate={handleNewProject}
            onAIPlan={() => {}} // TODO: Implement AI planning
            onAllTools={() => {}} // TODO: Implement tools
            onOpenProject={handleOpenProject}
            username={user?.username}
          />
        </div>
      </div>
    );
  }

  // Show the wizard (for new project or continuing existing session)
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Sticky Navigation Bar for Wizard */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <NavigationButtons
          backDestination="dashboard"
          backLabel="Back to Services"
          className="[&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:border-none [&_button]:text-white [&_button]:shadow-lg [&_button]:px-4 [&_button]:py-2"
        />
        <button
          onClick={handleBackToProjects}
          className="text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/10"
        >
          My Projects
        </button>
      </div>
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
