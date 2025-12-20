import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, Code, Palette, CheckCircle2, XCircle, TrendingUp, DollarSign, HeadphonesIcon } from 'lucide-react';
import { PERMISSIONS } from '@/hooks/use-permissions';

type UserRole = 'administrator' | 'user' | 'technical' | 'designer' | 'marketing' | 'finance' | 'support';

interface RoleConfig {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  permissions: string[];
}

const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  administrator: {
    name: 'Administrator',
    description:
      'Full access to all features including user management, billing, and system administration',
    icon: Shield,
    color: 'from-red-500 to-pink-600',
    permissions: [
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
  },
  user: {
    name: 'User',
    description: 'Standard user with access to create websites and view own billing',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    permissions: [
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.VIEW_OWN_USAGE,
      PERMISSIONS.CREATE_WEBSITES,
      PERMISSIONS.EDIT_WEBSITES,
    ],
  },
  technical: {
    name: 'Technical',
    description: 'Technical staff with access to infrastructure, logs, and technical tools',
    icon: Code,
    color: 'from-green-500 to-emerald-600',
    permissions: [
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
  },
  designer: {
    name: 'Designer',
    description: 'Designer with access to website creation, editing, and template management',
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    permissions: [
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.VIEW_OWN_USAGE,
      PERMISSIONS.CREATE_WEBSITES,
      PERMISSIONS.EDIT_WEBSITES,
      PERMISSIONS.DELETE_WEBSITES,
      PERMISSIONS.MANAGE_TEMPLATES,
      PERMISSIONS.PUBLISH_WEBSITES,
    ],
  },
  marketing: {
    name: 'Marketing',
    description: 'Marketing department with access to analytics, marketing automation, and campaign tools',
    icon: TrendingUp,
    color: 'from-pink-500 to-rose-600',
    permissions: [
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.VIEW_OWN_USAGE,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.EXPORT_ANALYTICS,
      PERMISSIONS.ACCESS_MARKETING_TOOLS,
    ],
  },
  finance: {
    name: 'Finance',
    description: 'Finance department with access to billing, invoices, costs, and financial reporting',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    permissions: [
      PERMISSIONS.VIEW_ALL_BILLING,
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.VIEW_COSTS,
      PERMISSIONS.EXPORT_INVOICES,
      PERMISSIONS.VIEW_ALL_USAGE,
      PERMISSIONS.VIEW_OWN_USAGE,
    ],
  },
  support: {
    name: 'Support',
    description: 'Support department with access to user management, analytics, and support tools',
    icon: HeadphonesIcon,
    color: 'from-blue-500 to-cyan-600',
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.VIEW_OWN_USAGE,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.ACCESS_SUPPORT_TOOLS,
    ],
  },
};

const PERMISSION_CATEGORIES = {
  billing: {
    name: 'Billing & Invoices',
    permissions: [
      PERMISSIONS.VIEW_OWN_BILLING,
      PERMISSIONS.VIEW_ALL_BILLING,
      PERMISSIONS.MANAGE_INVOICES,
      PERMISSIONS.VIEW_COSTS,
      PERMISSIONS.EXPORT_INVOICES,
    ],
  },
  users: {
    name: 'User Management',
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS,
      PERMISSIONS.ASSIGN_ROLES,
    ],
  },
  usage: {
    name: 'Usage & Analytics',
    permissions: [
      PERMISSIONS.VIEW_OWN_USAGE,
      PERMISSIONS.VIEW_ALL_USAGE,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.EXPORT_ANALYTICS,
    ],
  },
  websites: {
    name: 'Website Building',
    permissions: [
      PERMISSIONS.CREATE_WEBSITES,
      PERMISSIONS.EDIT_WEBSITES,
      PERMISSIONS.DELETE_WEBSITES,
      PERMISSIONS.MANAGE_TEMPLATES,
      PERMISSIONS.PUBLISH_WEBSITES,
    ],
  },
  technical: {
    name: 'Technical',
    permissions: [
      PERMISSIONS.ACCESS_TECHNICAL_TOOLS,
      PERMISSIONS.MANAGE_INFRASTRUCTURE,
      PERMISSIONS.VIEW_LOGS,
      PERMISSIONS.MANAGE_SERVERS,
    ],
  },
  marketing: {
    name: 'Marketing',
    permissions: [
      PERMISSIONS.ACCESS_MARKETING_TOOLS,
    ],
  },
  support: {
    name: 'Support',
    permissions: [
      PERMISSIONS.ACCESS_SUPPORT_TOOLS,
    ],
  },
  admin: {
    name: 'Administration',
    permissions: [PERMISSIONS.FULL_ACCESS],
  },
} as const;

export function RoleManagement() {
  const { isAdmin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('administrator');
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, string[]>>({
    administrator: ROLE_CONFIGS.administrator.permissions,
    user: ROLE_CONFIGS.user.permissions,
    technical: ROLE_CONFIGS.technical.permissions,
    designer: ROLE_CONFIGS.designer.permissions,
    marketing: ROLE_CONFIGS.marketing.permissions,
    finance: ROLE_CONFIGS.finance.permissions,
    support: ROLE_CONFIGS.support.permissions,
  });

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">You need administrator privileges to manage roles.</p>
      </div>
    );
  }

  const togglePermission = (role: UserRole, permission: string) => {
    setRolePermissions(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission];

      return {
        ...prev,
        [role]: updated,
      };
    });
  };

  const handleSave = async () => {
    // TODO: Save role permissions to backend
    console.log('Saving role permissions:', rolePermissions);
    // This will be implemented when we add the backend endpoint
  };

  const currentRole = ROLE_CONFIGS[selectedRole];
  const currentPermissions = rolePermissions[selectedRole] || [];
  const Icon = currentRole.icon;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selection */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
            <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
              <CardTitle className="text-blue-700 dark:text-blue-300">Roles</CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">Select a role to configure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
              {(Object.keys(ROLE_CONFIGS) as UserRole[]).map(role => {
                const config = ROLE_CONFIGS[role];
                const RoleIcon = config.icon;
                const isSelected = selectedRole === role;
                const rolePerms = rolePermissions[role] || [];

                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <RoleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{config.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {rolePerms.length} permissions
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
            <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentRole.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-700 dark:text-blue-300">{currentRole.name} Permissions</CardTitle>
                    <CardDescription className="mt-1 text-blue-600 dark:text-blue-400">{currentRole.description}</CardDescription>
                  </div>
                </div>
                <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
              </div>
            </CardHeader>
            <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
              <Tabs defaultValue="billing" className="w-full">
                <TabsList className="grid w-full grid-cols-6 max-h-12 overflow-x-auto">
                  {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                  <TabsContent key={key} value={key} className="space-y-4 mt-6">
                    <div className="space-y-3">
                      {category.permissions.map(permission => {
                        const hasPermission = currentPermissions.includes(permission);
                        const isFullAccess = permission === PERMISSIONS.FULL_ACCESS;

                        // Administrator always has full access - disable editing
                        const isDisabled = selectedRole === 'administrator' && isFullAccess;

                        return (
                          <div
                            key={permission}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              hasPermission
                                ? 'bg-primary/10 border-primary/50'
                                : 'bg-muted/50 border-border'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Checkbox
                                checked={hasPermission || isDisabled}
                                onCheckedChange={() =>
                                  !isDisabled && togglePermission(selectedRole, permission)
                                }
                                disabled={isDisabled}
                                className="flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">
                                  {permission
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {getPermissionDescription(permission)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {hasPermission && <CheckCircle2 className="w-5 h-5 text-primary" />}
                              {!hasPermission && !isDisabled && (
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    [PERMISSIONS.VIEW_OWN_BILLING]: 'View your own billing information and invoices',
    [PERMISSIONS.VIEW_ALL_BILLING]: 'View all users billing information and invoices',
    [PERMISSIONS.MANAGE_INVOICES]: 'Create, edit, and manage invoices',
    [PERMISSIONS.VIEW_COSTS]: 'View cost breakdowns and pricing information',
    [PERMISSIONS.EXPORT_INVOICES]: 'Export invoices to various formats',
    [PERMISSIONS.VIEW_USERS]: 'View list of users',
    [PERMISSIONS.CREATE_USERS]: 'Create new user accounts',
    [PERMISSIONS.EDIT_USERS]: 'Edit user account information',
    [PERMISSIONS.DELETE_USERS]: 'Delete user accounts',
    [PERMISSIONS.ASSIGN_ROLES]: 'Assign roles to users',
    [PERMISSIONS.VIEW_OWN_USAGE]: 'View your own resource usage statistics',
    [PERMISSIONS.VIEW_ALL_USAGE]: 'View all users resource usage statistics',
    [PERMISSIONS.VIEW_ANALYTICS]: 'View analytics and reports',
    [PERMISSIONS.EXPORT_ANALYTICS]: 'Export analytics data',
    [PERMISSIONS.CREATE_WEBSITES]: 'Create new websites',
    [PERMISSIONS.EDIT_WEBSITES]: 'Edit existing websites',
    [PERMISSIONS.DELETE_WEBSITES]: 'Delete websites',
    [PERMISSIONS.MANAGE_TEMPLATES]: 'Manage website templates',
    [PERMISSIONS.PUBLISH_WEBSITES]: 'Publish websites to production',
    [PERMISSIONS.ACCESS_TECHNICAL_TOOLS]: 'Access technical development tools',
    [PERMISSIONS.MANAGE_INFRASTRUCTURE]: 'Manage server infrastructure',
    [PERMISSIONS.VIEW_LOGS]: 'View system logs',
    [PERMISSIONS.MANAGE_SERVERS]: 'Manage server configurations',
    [PERMISSIONS.ACCESS_MARKETING_TOOLS]: 'Access marketing automation, campaigns, and analytics tools',
    [PERMISSIONS.ACCESS_SUPPORT_TOOLS]: 'Access customer support tools and user management',
    [PERMISSIONS.FULL_ACCESS]: 'Full administrative access to all features',
  };

  return descriptions[permission] || 'No description available';
}
