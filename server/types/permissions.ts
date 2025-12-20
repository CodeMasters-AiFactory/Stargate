/**
 * Permission System Types and Definitions
 * Defines all available permissions in the system
 */

export type PermissionCategory = 
  | 'billing' 
  | 'users' 
  | 'usage' 
  | 'websites' 
  | 'technical' 
  | 'admin';

export interface Permission {
  id: string;
  name: string;
  category: PermissionCategory;
  description: string;
}

/**
 * All available permissions in the system
 */
export const PERMISSIONS = {
  // Billing & Invoices
  VIEW_OWN_BILLING: 'view_own_billing',
  VIEW_ALL_BILLING: 'view_all_billing',
  MANAGE_INVOICES: 'manage_invoices',
  VIEW_COSTS: 'view_costs',
  EXPORT_INVOICES: 'export_invoices',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  ASSIGN_ROLES: 'assign_roles',
  
  // Usage & Analytics
  VIEW_OWN_USAGE: 'view_own_usage',
  VIEW_ALL_USAGE: 'view_all_usage',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // Website Building
  CREATE_WEBSITES: 'create_websites',
  EDIT_WEBSITES: 'edit_websites',
  DELETE_WEBSITES: 'delete_websites',
  MANAGE_TEMPLATES: 'manage_templates',
  PUBLISH_WEBSITES: 'publish_websites',
  
  // Technical
  ACCESS_TECHNICAL_TOOLS: 'access_technical_tools',
  MANAGE_INFRASTRUCTURE: 'manage_infrastructure',
  VIEW_LOGS: 'view_logs',
  MANAGE_SERVERS: 'manage_servers',
  
  // Marketing
  ACCESS_MARKETING_TOOLS: 'access_marketing_tools',
  
  // Support
  ACCESS_SUPPORT_TOOLS: 'access_support_tools',
  
  // Admin (Full Access)
  FULL_ACCESS: 'full_access',
} as const;

/**
 * Permission definitions with categories and descriptions
 */
export const PERMISSION_DEFINITIONS: Record<string, { category: PermissionCategory; description: string }> = {
  [PERMISSIONS.VIEW_OWN_BILLING]: {
    category: 'billing',
    description: 'View own billing information and invoices',
  },
  [PERMISSIONS.VIEW_ALL_BILLING]: {
    category: 'billing',
    description: 'View all users billing information and invoices',
  },
  [PERMISSIONS.MANAGE_INVOICES]: {
    category: 'billing',
    description: 'Create, edit, and manage invoices',
  },
  [PERMISSIONS.VIEW_COSTS]: {
    category: 'billing',
    description: 'View cost breakdowns and pricing information',
  },
  [PERMISSIONS.EXPORT_INVOICES]: {
    category: 'billing',
    description: 'Export invoices to various formats',
  },
  [PERMISSIONS.VIEW_USERS]: {
    category: 'users',
    description: 'View list of users',
  },
  [PERMISSIONS.CREATE_USERS]: {
    category: 'users',
    description: 'Create new user accounts',
  },
  [PERMISSIONS.EDIT_USERS]: {
    category: 'users',
    description: 'Edit user account information',
  },
  [PERMISSIONS.DELETE_USERS]: {
    category: 'users',
    description: 'Delete user accounts',
  },
  [PERMISSIONS.ASSIGN_ROLES]: {
    category: 'users',
    description: 'Assign roles to users',
  },
  [PERMISSIONS.VIEW_OWN_USAGE]: {
    category: 'usage',
    description: 'View own resource usage statistics',
  },
  [PERMISSIONS.VIEW_ALL_USAGE]: {
    category: 'usage',
    description: 'View all users resource usage statistics',
  },
  [PERMISSIONS.VIEW_ANALYTICS]: {
    category: 'usage',
    description: 'View analytics and reports',
  },
  [PERMISSIONS.EXPORT_ANALYTICS]: {
    category: 'usage',
    description: 'Export analytics data',
  },
  [PERMISSIONS.CREATE_WEBSITES]: {
    category: 'websites',
    description: 'Create new websites',
  },
  [PERMISSIONS.EDIT_WEBSITES]: {
    category: 'websites',
    description: 'Edit existing websites',
  },
  [PERMISSIONS.DELETE_WEBSITES]: {
    category: 'websites',
    description: 'Delete websites',
  },
  [PERMISSIONS.MANAGE_TEMPLATES]: {
    category: 'websites',
    description: 'Manage website templates',
  },
  [PERMISSIONS.PUBLISH_WEBSITES]: {
    category: 'websites',
    description: 'Publish websites to production',
  },
  [PERMISSIONS.ACCESS_TECHNICAL_TOOLS]: {
    category: 'technical',
    description: 'Access technical development tools',
  },
  [PERMISSIONS.MANAGE_INFRASTRUCTURE]: {
    category: 'technical',
    description: 'Manage server infrastructure',
  },
  [PERMISSIONS.VIEW_LOGS]: {
    category: 'technical',
    description: 'View system logs',
  },
  [PERMISSIONS.MANAGE_SERVERS]: {
    category: 'technical',
    description: 'Manage server configurations',
  },
  [PERMISSIONS.FULL_ACCESS]: {
    category: 'admin',
    description: 'Full administrative access to all features',
  },
};

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

