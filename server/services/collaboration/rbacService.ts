/**
 * Role-Based Access Control Service
 * Phase 3.4: Collaboration Features - Permission management
 */

export type Permission = 
  | 'read:project'
  | 'write:project'
  | 'delete:project'
  | 'publish:project'
  | 'manage:settings'
  | 'manage:members'
  | 'view:analytics'
  | 'manage:billing';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be modified
}

export interface ProjectPermission {
  projectId: string;
  userId: string;
  roleId: string;
  permissions: Permission[];
  grantedAt: Date;
}

/**
 * System roles
 */
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features',
    permissions: [
      'read:project',
      'write:project',
      'delete:project',
      'publish:project',
      'manage:settings',
      'manage:members',
      'view:analytics',
      'manage:billing',
    ],
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access except billing',
    permissions: [
      'read:project',
      'write:project',
      'delete:project',
      'publish:project',
      'manage:settings',
      'manage:members',
      'view:analytics',
    ],
    isSystem: true,
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can edit and publish projects',
    permissions: [
      'read:project',
      'write:project',
      'publish:project',
      'view:analytics',
    ],
    isSystem: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'read:project',
      'view:analytics',
    ],
    isSystem: true,
  },
];

/**
 * Get role by ID
 */
export function getRole(roleId: string): Role | null {
  return SYSTEM_ROLES.find(r => r.id === roleId) || null;
}

/**
 * Get all roles
 */
export function getAllRoles(): Role[] {
  return [...SYSTEM_ROLES];
}

/**
 * Check if user has permission
 */
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(roleId: string): Permission[] {
  const role = getRole(roleId);
  return role ? role.permissions : [];
}

/**
 * Check if user can perform action
 */
export function canPerformAction(
  userRoleId: string,
  requiredPermission: Permission
): boolean {
  const permissions = getPermissionsForRole(userRoleId);
  return hasPermission(permissions, requiredPermission);
}

