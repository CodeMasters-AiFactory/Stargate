/**
 * Role Templates Configuration
 * Defines default permissions for each role
 */

import { PERMISSIONS } from '../types/permissions';

export type UserRole = 'administrator' | 'user' | 'technical' | 'designer' | 'marketing' | 'finance' | 'support';

/**
 * Default role templates with their permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  administrator: [
    // All permissions
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
    // Basic user permissions
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
  ],
  
  technical: [
    // Technical staff permissions
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
    // Designer permissions
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.CREATE_WEBSITES,
    PERMISSIONS.EDIT_WEBSITES,
    PERMISSIONS.DELETE_WEBSITES,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.PUBLISH_WEBSITES,
  ],
  marketing: [
    // Marketing department permissions
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.ACCESS_MARKETING_TOOLS,
  ],
  finance: [
    // Finance department permissions
    PERMISSIONS.VIEW_ALL_BILLING,
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.VIEW_COSTS,
    PERMISSIONS.EXPORT_INVOICES,
    PERMISSIONS.VIEW_ALL_USAGE,
    PERMISSIONS.VIEW_OWN_USAGE,
  ],
  support: [
    // Support department permissions
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_OWN_BILLING,
    PERMISSIONS.VIEW_OWN_USAGE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.ACCESS_SUPPORT_TOOLS,
  ],
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  administrator: 'Full access to all features including user management, billing, and system administration',
  user: 'Standard user with access to create websites and view own billing',
  technical: 'Technical staff with access to infrastructure, logs, and technical tools',
  designer: 'Designer with access to website creation, editing, and template management',
  marketing: 'Marketing department with access to analytics, marketing automation, and campaign tools',
  finance: 'Finance department with access to billing, invoices, costs, and financial reporting',
  support: 'Support department with access to user management, analytics, and support tools',
};

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: UserRole, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];
  
  // Administrator always has all permissions
  if (role === 'administrator') {
    return true;
  }
  
  // Check if permission is in role's permission list
  return rolePerms.includes(permission) || rolePerms.includes(PERMISSIONS.FULL_ACCESS);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role];
}

