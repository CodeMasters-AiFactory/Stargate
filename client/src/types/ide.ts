export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isOpen?: boolean;
  isDirty?: boolean;
}

export interface Tab {
  id: string;
  path: string;
  name: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: Record<string, string>;
  isPublic: boolean;
  template: string;
}

export interface MerlinPackageSelection {
  packageType: 'basic' | 'advanced' | 'seo' | 'deluxe' | 'ultra';
  siteType: 'personal' | 'business' | 'corporate' | 'ecommerce';
}

export interface IDEState {
  currentProject: Project | null;
  openTabs: Tab[];
  activeTabId: string | null;
  fileTree: FileNode[];
  isLoading: boolean;
  bottomPanelHeight: number;
  rightPanelWidth: number;
  leftPanelWidth: number;
  activeBottomPanel: 'terminal' | 'problems' | 'output' | 'debug';
  currentView:
    | 'home'
    | 'website'
    | 'website-page'
    | 'services'
    | 'stargate-ide'
    | 'stargate-websites'
    | 'merlin-packages'
    | 'apps'
    | 'deployments'
    | 'usage'
    | 'explorer'
    | 'templates'
    | 'project-creation'
    | 'agent'
    | 'console'
    | 'shell'
    | 'preview'
    | 'git'
    | 'database'
    | 'storage'
    | 'secrets'
    | 'multiplayer'
    | 'history'
    | 'extensions'
    | 'analytics'
    | 'analytics-advanced'
    | 'quantum'
    | 'security'
    | 'aiplanning'
    | 'marketing'
    | 'collaboration'
    | 'admin'
    | 'download'
    | 'download-project'
    | 'template-marketplace'
    | 'monitoring'
    | 'live-testing'
    | 'website-analysis'
    | 'website-debugger'
    | 'merlin-quick-generate'
    | 'dashboard'  // Dashboard view
    | 'landing'    // Landing page view
    | 'ide'        // IDE view
    | 'pandora'    // PANDORA service
    | 'regis'      // Regis Core service
    | 'nero'       // Nero Core service
    | 'titan-ticket'  // Titan Ticket Master
    | 'titan-support' // Titan Support Master
    | 'ai-factory'   // AI Factory
    | 'blog'         // Blog management
    | 'blog-editor'  // Blog editor
    | 'blog-post'    // Blog post view
    | 'performance'  // Performance analytics
    | 'cms'          // Content management
    | 'settings'     // Settings panel
    | 'backup';      // Backup management
  merlinPackage?: MerlinPackageSelection;
  merlinQuickGenerate?: {
    requirements: Record<string, unknown>;
    skipChecklist: boolean;
  };
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  type: 'completion' | 'improvement' | 'fix';
  text: string;
  confidence: number;
  action?: () => void;
}

export interface TerminalLine {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error';
  timestamp: Date;
}
