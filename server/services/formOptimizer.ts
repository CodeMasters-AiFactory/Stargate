/**
 * Form Optimizer Service
 * Enhances forms with progressive fields, validation, and abandonment tracking
 */

export interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: string;
  };
  showCondition?: string; // JavaScript condition for progressive fields
}

/**
 * Generate optimized form HTML
 */
export function generateOptimizedForm(
  fields: FormField[],
  options: {
    formId?: string;
    action?: string;
    method?: string;
    submitText?: string;
    enableProgressive?: boolean;
    enableValidation?: boolean;
    enableTracking?: boolean;
  } = {}
): string {
  const {
    formId = 'contact-form',
    action = '#',
    method = 'POST',
    submitText = 'Submit',
    enableProgressive = true,
    enableValidation = true,
    enableTracking = true
  } = options;

  const formFields = fields.map((field, index) => {
    const fieldId = `${formId}-${field.name}`;
    const requiredAttr = field.required ? 'required' : '';
    const ariaRequired = field.required ? 'aria-required="true"' : '';
    
    // Progressive field attributes
    const progressiveAttr = enableProgressive && field.showCondition
      ? `data-show-condition="${field.showCondition}" style="display: none;"`
      : '';

    // Validation attributes
    const validationAttrs = enableValidation && field.validation
      ? [
          field.validation.pattern ? `pattern="${field.validation.pattern}"` : '',
          field.validation.minLength ? `minlength="${field.validation.minLength}"` : '',
          field.validation.maxLength ? `maxlength="${field.validation.maxLength}"` : ''
        ].filter(Boolean).join(' ')
      : '';

    // Tracking attributes
    const trackingAttr = enableTracking
      ? `data-track-field="true" data-field-name="${field.name}"`
      : '';

    let inputHTML = '';

    if (field.type === 'textarea') {
      inputHTML = `
        <textarea
          id="${fieldId}"
          name="${field.name}"
          placeholder="${field.placeholder || ''}"
          ${requiredAttr}
          ${validationAttrs}
          ${trackingAttr}
          ${ariaRequired}
          class="form-input"
          rows="6"
        ></textarea>
      `;
    } else if (field.type === 'select') {
      inputHTML = `
        <select
          id="${fieldId}"
          name="${field.name}"
          ${requiredAttr}
          ${trackingAttr}
          ${ariaRequired}
          class="form-input"
        >
          <option value="">${field.placeholder || 'Select...'}</option>
        </select>
      `;
    } else {
      inputHTML = `
        <input
          type="${field.type}"
          id="${fieldId}"
          name="${field.name}"
          placeholder="${field.placeholder || ''}"
          ${requiredAttr}
          ${validationAttrs}
          ${trackingAttr}
          ${ariaRequired}
          class="form-input"
        />
      `;
    }

    return `
    <div class="form-group" ${progressiveAttr}>
      <label for="${fieldId}" class="form-label">
        ${field.label}
        ${field.required ? '<span class="required-indicator">*</span>' : ''}
      </label>
      ${inputHTML}
      <span class="form-error" id="${fieldId}-error" role="alert"></span>
      <span class="form-help" id="${fieldId}-help"></span>
    </div>
    `;
  }).join('\n    ');

  const trackingScript = enableTracking
    ? `
<script>
  // Form abandonment tracking
  let formStartTime = Date.now();
  let formFieldsInteracted = new Set();
  
  document.getElementById('${formId}').addEventListener('focusin', function(e) {
    if (e.target.matches('input, textarea, select')) {
      formFieldsInteracted.add(e.target.name);
      trackFormInteraction('${formId}', e.target.name, 'focus');
    }
  });
  
  document.getElementById('${formId}').addEventListener('focusout', function(e) {
    if (e.target.matches('input, textarea, select')) {
      trackFormInteraction('${formId}', e.target.name, 'blur', e.target.value);
    }
  });
  
  function trackFormInteraction(formId, fieldName, event, value) {
    // Track to analytics
    if (window.trackConversion) {
      window.trackConversion('form_interaction', {
        formId: formId,
        fieldName: fieldName,
        event: event,
        hasValue: !!value,
        timeOnForm: Date.now() - formStartTime
      });
    }
  }
  
  // Track form abandonment
  window.addEventListener('beforeunload', function() {
    if (formFieldsInteracted.size > 0) {
      const timeOnForm = Date.now() - formStartTime;
      if (window.trackConversion) {
        window.trackConversion('form_abandonment', {
          formId: '${formId}',
          fieldsInteracted: formFieldsInteracted.size,
          timeOnForm: timeOnForm
        });
      }
    }
  });
</script>
    `.trim()
    : '';

  return `
<form
  id="${formId}"
  class="optimized-form"
  action="${action}"
  method="${method}"
  novalidate
  data-track-form="true"
>
    ${formFields}
    
    <div class="form-actions">
      <button type="submit" class="btn btn-primary btn-lg cta-optimized" data-conversion-event="form_submit">
        ${submitText}
      </button>
    </div>
</form>
${trackingScript}
  `.trim();
}

/**
 * Generate form validation JavaScript
 */
export function generateFormValidationScript(formId: string): string {
  return `
<script>
(function() {
  const form = document.getElementById('${formId}');
  if (!form) return;
  
  // Real-time validation
  const inputs = form.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('invalid')) {
        validateField(this);
      }
    });
  });
  
  function validateField(field) {
    const errorElement = document.getElementById(field.id + '-error');
    const helpElement = document.getElementById(field.id + '-help');
    
    // Clear previous errors
    field.classList.remove('invalid', 'valid');
    if (errorElement) errorElement.textContent = '';
    if (helpElement) helpElement.textContent = '';
    
    // Required validation
    if (field.hasAttribute('required') && !field.value.trim()) {
      field.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = 'This field is required';
      }
      return false;
    }
    
    // Pattern validation
    if (field.hasAttribute('pattern') && field.value) {
      const pattern = new RegExp(field.getAttribute('pattern'));
      if (!pattern.test(field.value)) {
        field.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'Please enter a valid value';
        }
        return false;
      }
    }
    
    // Length validation
    if (field.hasAttribute('minlength') && field.value.length < parseInt(field.getAttribute('minlength'))) {
      field.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = \`Minimum \${field.getAttribute('minlength')} characters required\`;
      }
      return false;
    }
    
    if (field.hasAttribute('maxlength') && field.value.length > parseInt(field.getAttribute('maxlength'))) {
      field.classList.add('invalid');
      if (errorElement) {
        errorElement.textContent = \`Maximum \${field.getAttribute('maxlength')} characters allowed\`;
      }
      return false;
    }
    
    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.classList.add('invalid');
        if (errorElement) {
          errorElement.textContent = 'Please enter a valid email address';
        }
        return false;
      }
    }
    
    // Valid
    if (field.value) {
      field.classList.add('valid');
    }
    
    return true;
  }
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (isValid) {
      // Track successful submission
      if (window.trackConversion) {
        window.trackConversion('form_submit_success', {
          formId: '${formId}',
          timeOnForm: Date.now() - formStartTime
        });
      }
      
      // Submit form (or handle via AJAX)
      form.submit();
    } else {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
  
  // Progressive field display
  form.querySelectorAll('[data-show-condition]').forEach(field => {
    const condition = field.getAttribute('data-show-condition');
    const parent = field.closest('.form-group');
    
    // Evaluate condition (simplified - in production, use a proper expression evaluator)
    try {
      const shouldShow = eval(condition);
      if (shouldShow) {
        parent.style.display = 'block';
      }
    } catch (e) {
      console.warn('Could not evaluate condition:', condition);
    }
  });
})();
</script>
  `.trim();
}

/**
 * Generate form CSS
 */
export function generateFormCSS(): string {
  return `
/* Optimized Form Styles */
.optimized-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-size: 0.875rem;
}

.required-indicator {
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.invalid {
  border-color: #ef4444;
}

.form-input.invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input.valid {
  border-color: #10b981;
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  min-height: 1.25rem;
}

.form-help {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 48px; /* Touch target optimization */
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
}
  `.trim();
}

