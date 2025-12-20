/**
 * Team Workspaces Service
 * Enterprise team and workspace management
 */

import { db } from '../../db';
import { getErrorMessage, logError } from '../../utils/errorHandler';

export interface Workspace {
  id: string;
  name: string;
  organizationId: string;
  ownerId: string;
  members: Array<{
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
  }>;
  projects: string[];
  settings: {
    maxMembers?: number;
    maxProjects?: number;
    features: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: string[];
  joinedAt: Date;
}

// In-memory store (use database in production)
const workspaces = new Map<string, Workspace>();
const teamMembers = new Map<string, TeamMember[]>();

/**
 * Create workspace
 */
export function createWorkspace(
  name: string,
  organizationId: string,
  ownerId: string
): Workspace {
  const workspace: Workspace = {
    id: `workspace-${Date.now()}`,
    name,
    organizationId,
    ownerId,
    members: [
      {
        userId: ownerId,
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
    projects: [],
    settings: {
      features: ['all'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  workspaces.set(workspace.id, workspace);
  teamMembers.set(workspace.id, [
    {
      userId: ownerId,
      workspaceId: workspace.id,
      role: 'owner',
      permissions: ['all'],
      joinedAt: new Date(),
    },
  ]);

  console.log(`[TeamWorkspaces] ✅ Created workspace: ${name}`);
  return workspace;
}

/**
 * Get workspace
 */
export function getWorkspace(workspaceId: string): Workspace | null {
  return workspaces.get(workspaceId) || null;
}

/**
 * Add member to workspace
 */
export function addWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: 'admin' | 'editor' | 'viewer'
): void {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const member = {
    userId,
    role,
    joinedAt: new Date(),
  };

  workspace.members.push(member);
  workspace.updatedAt = new Date();

  const members = teamMembers.get(workspaceId) || [];
  members.push({
    userId,
    workspaceId,
    role,
    permissions: getPermissionsForRole(role),
    joinedAt: new Date(),
  });
  teamMembers.set(workspaceId, members);

  console.log(`[TeamWorkspaces] ✅ Added member ${userId} to workspace ${workspaceId}`);
}

/**
 * Get permissions for role
 */
function getPermissionsForRole(role: 'owner' | 'admin' | 'editor' | 'viewer'): string[] {
  switch (role) {
    case 'owner':
      return ['all'];
    case 'admin':
      return ['read', 'write', 'delete', 'manage_members', 'manage_settings'];
    case 'editor':
      return ['read', 'write'];
    case 'viewer':
      return ['read'];
    default:
      return [];
  }
}

/**
 * List user workspaces
 */
export function listUserWorkspaces(userId: string): Workspace[] {
  return Array.from(workspaces.values()).filter(w =>
    w.members.some(m => m.userId === userId)
  );
}

console.log('[TeamWorkspaces] 👥 Service loaded - Team management ready');

