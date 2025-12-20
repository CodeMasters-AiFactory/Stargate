/**
 * Marketing Automation Service
 * Integrates with email marketing and CRM services
 */

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: string[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  source: string;
  websiteId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Send email via SendGrid (or other email service)
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendGridApiKey) {
    // Fallback to console in development
    console.log('Email (dev mode):', { to, subject });
    return { success: true, messageId: 'dev-message-id' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
          },
        ],
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@stargate.com',
          name: process.env.SENDGRID_FROM_NAME || 'Stargate',
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
          ...(textContent
            ? [
                {
                  type: 'text/plain',
                  value: textContent,
                },
              ]
            : []),
        ],
      }),
    });

    if (response.ok) {
      const messageId = response.headers.get('x-message-id') || undefined;
      return { success: true, messageId };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add contact to Mailchimp list
 */
export async function addToMailchimpList(
  email: string,
  listId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const mailchimpApiKey = process.env.MAILCHIMP_API_KEY;
  const mailchimpServer = process.env.MAILCHIMP_SERVER;

  if (!mailchimpApiKey || !mailchimpServer) {
    console.log('Mailchimp (dev mode):', { email, listId });
    return { success: true };
  }

  try {
    const response = await fetch(
      `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mailchimpApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: metadata || {},
        }),
      }
    );

    if (response.ok || response.status === 400) {
      // 400 might mean already subscribed, which is fine
      return { success: true };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create lead capture form HTML
 */
export function generateLeadCaptureForm(config: {
  websiteId: string;
  formId: string;
  fields: Array<{ name: string; type: string; required: boolean; label: string }>;
  submitText?: string;
  successMessage?: string;
}): { html: string; css: string; js: string } {
  const { websiteId, formId, fields, submitText = 'Subscribe', successMessage = 'Thank you for subscribing!' } = config;

  const fieldsHtml = fields
    .map(
      field => `
    <div class="form-field">
      <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
      <input
        type="${field.type}"
        id="${field.name}"
        name="${field.name}"
        ${field.required ? 'required' : ''}
        placeholder="${field.label}"
      />
    </div>
  `
    )
    .join('');

  const html = `
    <form id="${formId}" class="lead-capture-form">
      ${fieldsHtml}
      <button type="submit" class="submit-btn">${submitText}</button>
      <div class="form-message" id="${formId}-message"></div>
    </form>
  `;

  const css = `
    .lead-capture-form {
      max-width: 500px;
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
    .form-field input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-field input:focus {
      outline: none;
      border-color: #3b82f6;
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
    .submit-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
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
  `;

  const js = `
    (function() {
      const form = document.getElementById('${formId}');
      const messageEl = document.getElementById('${formId}-message');
      
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const response = await fetch('/api/marketing/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              websiteId: '${websiteId}',
              ...data,
            }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            messageEl.textContent = '${successMessage}';
            messageEl.className = 'form-message success';
            form.reset();
          } else {
            throw new Error(result.error || 'Failed to submit');
          }
        } catch (error) {
          messageEl.textContent = error.message || 'An error occurred. Please try again.';
          messageEl.className = 'form-message error';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = '${submitText}';
        }
      });
    })();
  `;

  return { html, css, js };
}

