/**
 * Lead Capture Types
 * Phase 3.3: Marketing Automation
 */

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'url';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  conditional?: {
    showIf: {
      field: string;
      operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
    };
  };
}

export interface ConditionalLogic {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
  value: any;
  actions: Array<{
    type: 'show' | 'hide' | 'require' | 'disable' | 'setValue';
    targetField: string;
    value?: any;
  }>;
}

export interface LeadCaptureForm {
  id: string;
  name: string;
  websiteId: string;
  fields: FormField[];
  conditionalLogic: ConditionalLogic[];
  settings: {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    enableNotifications: boolean;
    notificationEmail?: string;
    enableAutoResponse: boolean;
    autoResponseEmail?: {
      subject: string;
      body: string;
    };
  };
  multiStep: boolean;
  steps?: Array<{
    id: string;
    title: string;
    fields: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
  submissionsCount: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  websiteId: string;
  data: Record<string, any>;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  score?: number;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'rejected';
}

