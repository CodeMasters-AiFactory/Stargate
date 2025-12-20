/**
 * Lead Capture Service
 * Phase 3.3: Marketing Automation - Lead capture form management
 */

import * as fs from 'fs';
import * as path from 'path';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'url';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, radio, checkbox
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
    fields: string[]; // Field IDs
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
  score?: number; // Lead score
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'rejected';
}

/**
 * Get project directory for lead capture data
 */
function getLeadCaptureDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const leadDir = path.join(projectDir, 'lead-capture');
  
  if (!fs.existsSync(leadDir)) {
    fs.mkdirSync(leadDir, { recursive: true });
  }
  
  return leadDir;
}

/**
 * Lead Capture Form Management
 */

export async function getForms(websiteId: string): Promise<LeadCaptureForm[]> {
  const leadDir = getLeadCaptureDir(websiteId);
  const formsPath = path.join(leadDir, 'forms.json');
  
  if (!fs.existsSync(formsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(formsPath, 'utf-8');
    const forms: LeadCaptureForm[] = JSON.parse(content);
    return forms.map(form => ({
      ...form,
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt),
    }));
  } catch (error) {
    console.error(`[Lead Capture] Failed to load forms for ${websiteId}:`, error);
    return [];
  }
}

export async function getForm(websiteId: string, formId: string): Promise<LeadCaptureForm | null> {
  const forms = await getForms(websiteId);
  return forms.find(f => f.id === formId) || null;
}

export async function saveForm(websiteId: string, form: LeadCaptureForm): Promise<void> {
  const leadDir = getLeadCaptureDir(websiteId);
  const formsPath = path.join(leadDir, 'forms.json');
  
  const forms = await getForms(websiteId);
  const existingIndex = forms.findIndex(f => f.id === form.id);
  
  if (existingIndex >= 0) {
    forms[existingIndex] = { ...form, updatedAt: new Date() };
  } else {
    forms.push({ ...form, createdAt: new Date(), updatedAt: new Date() });
  }
  
  fs.writeFileSync(formsPath, JSON.stringify(forms, null, 2), 'utf-8');
  console.log(`[Lead Capture] Saved form: ${form.name} (${form.id}) for ${websiteId}`);
}

export async function deleteForm(websiteId: string, formId: string): Promise<void> {
  const leadDir = getLeadCaptureDir(websiteId);
  const formsPath = path.join(leadDir, 'forms.json');
  
  const forms = await getForms(websiteId);
  const filtered = forms.filter(f => f.id !== formId);
  
  fs.writeFileSync(formsPath, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`[Lead Capture] Deleted form: ${formId} for ${websiteId}`);
}

/**
 * Form Submissions Management
 */

export async function getSubmissions(websiteId: string, formId: string): Promise<FormSubmission[]> {
  const leadDir = getLeadCaptureDir(websiteId);
  const submissionsPath = path.join(leadDir, 'submissions', `${formId}.json`);
  
  if (!fs.existsSync(submissionsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(submissionsPath, 'utf-8');
    const submissions: FormSubmission[] = JSON.parse(content);
    return submissions.map(sub => ({
      ...sub,
      submittedAt: new Date(sub.submittedAt),
    }));
  } catch (error) {
    console.error(`[Lead Capture] Failed to load submissions for form ${formId}:`, error);
    return [];
  }
}

export async function saveSubmission(websiteId: string, submission: FormSubmission): Promise<void> {
  const leadDir = getLeadCaptureDir(websiteId);
  const submissionsDir = path.join(leadDir, 'submissions');
  
  if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true });
  }
  
  const submissionsPath = path.join(submissionsDir, `${submission.formId}.json`);
  const submissions = await getSubmissions(websiteId, submission.formId);
  
  submissions.push({ ...submission, submittedAt: new Date() });
  
  fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), 'utf-8');
  
  // Update form submissions count
  const form = await getForm(websiteId, submission.formId);
  if (form) {
    form.submissionsCount = submissions.length;
    await saveForm(websiteId, form);
  }
  
  console.log(`[Lead Capture] Saved submission for form ${submission.formId}`);
}

/**
 * Generate form HTML for embedding
 */
export function generateFormHTML(form: LeadCaptureForm): string {
  const fieldsHtml = form.fields.map(field => {
    if (form.multiStep) {
      // Multi-step forms will be handled by JavaScript
      return '';
    }
    
    let fieldHtml = '';
    const conditionalAttr = field.conditional 
      ? `data-conditional="${JSON.stringify(field.conditional).replace(/"/g, '&quot;')}"`
      : '';
    
    switch (field.type) {
      case 'textarea':
        fieldHtml = `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            <textarea
              id="${field.name}"
              name="${field.name}"
              ${field.required ? 'required' : ''}
              placeholder="${field.placeholder || ''}"
              rows="4"
            ></textarea>
          </div>
        `;
        break;
      case 'select':
        const options = (field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('');
        fieldHtml = `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
              <option value="">Select ${field.label}</option>
              ${options}
            </select>
          </div>
        `;
        break;
      case 'checkbox':
        const checkboxes = (field.options || []).map(opt => `
          <label class="checkbox-label">
            <input type="checkbox" name="${field.name}" value="${opt}">
            ${opt}
          </label>
        `).join('');
        fieldHtml = `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label>${field.label}${field.required ? ' *' : ''}</label>
            ${checkboxes}
          </div>
        `;
        break;
      case 'radio':
        const radios = (field.options || []).map(opt => `
          <label class="radio-label">
            <input type="radio" name="${field.name}" value="${opt}" ${field.required ? 'required' : ''}>
            ${opt}
          </label>
        `).join('');
        fieldHtml = `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label>${field.label}${field.required ? ' *' : ''}</label>
            ${radios}
          </div>
        `;
        break;
      default:
        fieldHtml = `
          <div class="form-field" data-field-id="${field.id}" ${conditionalAttr}>
            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
            <input
              type="${field.type}"
              id="${field.name}"
              name="${field.name}"
              ${field.required ? 'required' : ''}
              placeholder="${field.placeholder || ''}"
              ${field.validation?.min ? `min="${field.validation.min}"` : ''}
              ${field.validation?.max ? `max="${field.validation.max}"` : ''}
              ${field.validation?.pattern ? `pattern="${field.validation.pattern}"` : ''}
            />
          </div>
        `;
    }
    
    return fieldHtml;
  }).join('');
  
  const formHtml = `
    <form id="lead-form-${form.id}" class="lead-capture-form" data-form-id="${form.id}" data-website-id="${form.websiteId}">
      ${fieldsHtml}
      <button type="submit" class="submit-btn">${form.settings.submitButtonText || 'Submit'}</button>
      <div class="form-message" id="form-message-${form.id}"></div>
    </form>
    <script>
      (function() {
        const form = document.getElementById('lead-form-${form.id}');
        const messageDiv = document.getElementById('form-message-${form.id}');
        
        form.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            if (data[key]) {
              if (Array.isArray(data[key])) {
                data[key].push(value);
              } else {
                data[key] = [data[key], value];
              }
            } else {
              data[key] = value;
            }
          });
          
          try {
            const response = await fetch('/api/lead-capture/${form.websiteId}/forms/${form.id}/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            const result = await response.json();
            
            if (result.success) {
              messageDiv.className = 'form-message success';
              messageDiv.textContent = '${form.settings.successMessage || 'Thank you for your submission!'}';
              form.reset();
              ${form.settings.redirectUrl ? `setTimeout(() => { window.location.href = '${form.settings.redirectUrl}'; }, 2000);` : ''}
            } else {
              messageDiv.className = 'form-message error';
              messageDiv.textContent = result.error || 'An error occurred. Please try again.';
            }
          } catch (error) {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = 'An error occurred. Please try again.';
          }
        });
        
        // Handle conditional logic
        ${form.conditionalLogic.length > 0 ? `
        const conditionalRules = ${JSON.stringify(form.conditionalLogic)};
        conditionalRules.forEach(rule => {
          const sourceField = form.querySelector('[name="' + rule.field + '"]');
          if (sourceField) {
            sourceField.addEventListener('change', function() {
              const value = this.value || this.checked;
              rule.actions.forEach(action => {
                const targetField = form.querySelector('[data-field-id="' + action.targetField + '"]');
                if (targetField) {
                  if (action.type === 'show') {
                    targetField.style.display = '';
                  } else if (action.type === 'hide') {
                    targetField.style.display = 'none';
                  } else if (action.type === 'require') {
                    const input = targetField.querySelector('input, select, textarea');
                    if (input) input.required = true;
                  } else if (action.type === 'disable') {
                    const input = targetField.querySelector('input, select, textarea');
                    if (input) input.disabled = true;
                  }
                }
              });
            });
          }
        });
        ` : ''}
      })();
    </script>
    <style>
      .lead-capture-form {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .form-field {
        margin-bottom: 1.5rem;
      }
      .form-field label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #1f2937;
      }
      .form-field input,
      .form-field select,
      .form-field textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s;
      }
      .form-field input:focus,
      .form-field select:focus,
      .form-field textarea:focus {
        outline: none;
        border-color: #3b82f6;
      }
      .checkbox-label,
      .radio-label {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        font-weight: normal;
      }
      .checkbox-label input,
      .radio-label input {
        width: auto;
        margin-right: 0.5rem;
      }
      .submit-btn {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.2s;
      }
      .submit-btn:hover {
        background: #2563eb;
      }
      .form-message {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 8px;
        display: none;
      }
      .form-message.success {
        background: #d1fae5;
        color: #065f46;
        display: block;
      }
      .form-message.error {
        background: #fee2e2;
        color: #991b1b;
        display: block;
      }
    </style>
  `;
  
  return formHtml;
}

