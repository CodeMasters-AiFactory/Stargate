import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, HeadphonesIcon, Users, Code, Palette } from 'lucide-react';
import { useIDE } from '@/hooks/use-ide';
import { useAuth } from '@/contexts/AuthContext';

interface Department {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  permission?: string;
  route?: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Marketing automation, campaigns, analytics, and template marketplace',
    icon: TrendingUp,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    permission: 'access_marketing_tools',
    route: 'marketing',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Billing, invoices, costs, financial reporting, and usage analytics',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    permission: 'view_all_billing',
    route: 'finance',
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Customer support tools, user management, and analytics',
    icon: HeadphonesIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    permission: 'access_support_tools',
    route: 'support',
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Infrastructure, logs, servers, and technical development tools',
    icon: Code,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    permission: 'access_technical_tools',
    route: 'technical',
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Website creation, editing, templates, and publishing',
    icon: Palette,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    permission: 'manage_templates',
    route: 'designer',
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'View and manage all users, roles, and permissions',
    icon: Users,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    permission: 'view_users',
    route: 'users',
  },
];

export function DepartmentAccess() {
  const { setState } = useIDE();
  const { isAdmin, hasPermission } = useAuth();

  const handleDepartmentClick = (department: Department) => {
    if (department.route) {
      setState(prev => ({ ...prev, currentView: department.route as any }));
    }
  };

  const checkAccess = (department: Department): boolean => {
    if (isAdmin) return true;
    if (!department.permission) return false;
    return hasPermission(department.permission);
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {isAdmin
          ? 'As Administrator, you have access to all departments. Click any department to access it.'
          : 'Access departments based on your assigned permissions.'}
      </p>
      <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {DEPARTMENTS.map(department => {
            const Icon = department.icon;
            const hasAccess = checkAccess(department);

            return (
              <Card
                key={department.id}
                className={`cursor-pointer transition-all hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700 ${
                  hasAccess
                    ? 'hover:border-blue-500 border-2'
                    : 'opacity-50 cursor-not-allowed border border-dashed'
                }`}
                onClick={() => hasAccess && handleDepartmentClick(department)}
              >
                <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${department.bgColor}`}>
                      <Icon className={`w-6 h-6 ${department.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-700 dark:text-blue-300">{department.name}</CardTitle>
                      {!hasAccess && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Permission required</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
                  <p className="text-sm text-muted-foreground">{department.description}</p>
                  {hasAccess && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleDepartmentClick(department)}
                    >
                      Access Department
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

