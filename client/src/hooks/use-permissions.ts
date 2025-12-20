/**
 * Permission checking hooks
 */

import { useAuth } from '@/contexts/AuthContext';

// Permission constants (client-side version)
export const PERMISSIONS = {
  VIEW_OWN_BILLING: 'view_own_billing',
  VIEW_ALL_BILLING: 'view_all_billing',
  MANAGE_INVOICES: 'manage_invoices',
  VIEW_COSTS: 'view_costs',
  EXPORT_INVOICES: 'export_invoices',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  ASSIGN_ROLES: 'assign_roles',
  VIEW_OWN_USAGE: 'view_own_usage',
  VIEW_ALL_USAGE: 'view_all_usage',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  CREATE_WEBSITES: 'create_websites',
  EDIT_WEBSITES: 'edit_websites',
  DELETE_WEBSITES: 'delete_websites',
  MANAGE_TEMPLATES: 'manage_templates',
  PUBLISH_WEBSITES: 'publish_websites',
  ACCESS_TECHNICAL_TOOLS: 'access_technical_tools',
  MANAGE_INFRASTRUCTURE: 'manage_infrastructure',
  VIEW_LOGS: 'view_logs',
  MANAGE_SERVERS: 'manage_servers',
  ACCESS_MARKETING_TOOLS: 'access_marketing_tools',
  ACCESS_SUPPORT_TOOLS: 'access_support_tools',
  FULL_ACCESS: 'full_access',
} as const;

// Import role permissions from server config
// For now, we'll define a simplified version on the client side
const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrator: [
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.VIEW_ALL_BILLING,
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.VIEW_COSTS,
    PERMISSIONS.EXPORT_INVOICES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_ALL_USAGE,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
    PERMISSIONS.DELETE_WEBSITES,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.PUBLISH_WEBSITES,
    PERMISSIONS.ACCESS_TECHNICAL_TOOLS,
    PERMISSIONS.MANAGE_INFRASTRUCTURE,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_SERVERS,
  ],
  user: [
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
  ],
  technical: [
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_ALL_USAGE,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ACCESS_TECHNICAL_TOOLS,
    PERMISSIONS.MANAGE_INFRASTRUCTURE,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_SERVERS,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
  ],
  designer: [
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
    PERMISSIONS.DELETE_WEBSITES,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.PUBLISH_WEBSITES,
  ],
};

/**
 * Check if a role has a permission
 */
function roleHasPermission(role: string | null | undefined, permission: string): boolean {
  if (!role) return false;

  // Administrator always has all permissions
  if (role === 'administrator') {
    return true;
  }

  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission) || rolePerms.includes(PERMISSIONS.FULL_ACCESS);
}

/**
 * Hook to check if current user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { role } = useAuth();
  return roleHasPermission(role || null, permission);
}

/**
 * Hook to check if current user is administrator
 */
export function useIsAdmin(): boolean {
  const { role } = useAuth();
  return role === 'administrator';
}

/**
 * Hook to check if current user has a specific role
 */
export function useHasRole(requiredRole: string): boolean {
  const { role } = useAuth();
  return role === requiredRole;
}
