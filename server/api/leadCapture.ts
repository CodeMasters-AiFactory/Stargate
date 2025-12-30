/**
 * Lead Capture API Routes
 * Phase 3.3: Marketing Automation - Lead capture form APIs
 */

import type { Express, Request, Response } from 'express';
import {
  getForms,
  getForm,
  saveForm,
  deleteForm,
  getSubmissions,
  saveSubmission,
  generateFormHTML,
  type LeadCaptureForm,
  type FormSubmission,
} from '../services/leadCaptureService';
import { sendEmail } from '../services/marketing';

export function registerLeadCaptureRoutes(app: Express) {
  // ===== FORM MANAGEMENT =====
  
  // Get all forms for a website
  app.get('/api/lead-capture/:websiteId/forms', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const forms = await getForms(websiteId);

      res.json({
        success: true,
        forms,
        count: forms.length,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch forms',
      });
    }
  });
  
  // Get a specific form
  app.get('/api/lead-capture/:websiteId/forms/:formId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      const form = await getForm(websiteId, formId);

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
        });
        return;
      }

      res.json({
        success: true,
        form,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch form',
      });
    }
  });
  
  // Create or update a form
  app.post('/api/lead-capture/:websiteId/forms', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const formData: LeadCaptureForm = req.body;

      if (!formData.id) {
        formData.id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      formData.websiteId = websiteId;
      formData.submissionsCount = formData.submissionsCount || 0;

      await saveForm(websiteId, formData);

      res.json({
        success: true,
        form: formData,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to save form',
      });
    }
  });
  
  // Update a form
  app.put('/api/lead-capture/:websiteId/forms/:formId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      const formData: Partial<LeadCaptureForm> = req.body;

      const existingForm = await getForm(websiteId, formId);
      if (!existingForm) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
        });
        return;
      }

      const updatedForm: LeadCaptureForm = {
        ...existingForm,
        ...formData,
        id: formId,
        websiteId,
        updatedAt: new Date(),
      };

      await saveForm(websiteId, updatedForm);

      res.json({
        success: true,
        form: updatedForm,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to update form',
      });
    }
  });
  
  // Delete a form
  app.delete('/api/lead-capture/:websiteId/forms/:formId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      await deleteForm(websiteId, formId);

      res.json({
        success: true,
        message: 'Form deleted successfully',
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to delete form',
      });
    }
  });
  
  // Get form HTML for embedding
  app.get('/api/lead-capture/:websiteId/forms/:formId/html', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      const form = await getForm(websiteId, formId);

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
        });
        return;
      }

      const html = generateFormHTML(form);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to generate form HTML',
      });
    }
  });
  
  // ===== FORM SUBMISSIONS =====
  
  // Submit a form
  app.post('/api/lead-capture/:websiteId/forms/:formId/submit', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      const formData: Record<string, unknown> = req.body;

      const form = await getForm(websiteId, formId);
      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found',
        });
        return;
      }

      // Create submission
      const submission: FormSubmission = {
        id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        formId,
        websiteId,
        data: formData,
        submittedAt: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers['referer'],
        status: 'new',
      };

      await saveSubmission(websiteId, submission);

      // Send notification email if enabled
      if (form.settings.enableNotifications && form.settings.notificationEmail) {
        const emailSubject = `New Form Submission: ${form.name}`;
        const emailBody = `
          <h2>New Form Submission</h2>
          <p><strong>Form:</strong> ${form.name}</p>
          <p><strong>Submitted:</strong> ${submission.submittedAt.toLocaleString()}</p>
          <h3>Submission Data:</h3>
          <ul>
            ${Object.entries(formData).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
          </ul>
        `;

        await sendEmail(form.settings.notificationEmail, emailSubject, emailBody);
      }

      // Send auto-response email if enabled
      if (form.settings.enableAutoResponse && form.settings.autoResponseEmail && formData.email) {
        await sendEmail(
          formData.email as string,
          form.settings.autoResponseEmail.subject,
          form.settings.autoResponseEmail.body
        );
      }

      res.json({
        success: true,
        submissionId: submission.id,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to submit form',
      });
    }
  });
  
  // Get form submissions
  app.get('/api/lead-capture/:websiteId/forms/:formId/submissions', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, formId } = req.params;
      const submissions = await getSubmissions(websiteId, formId);

      res.json({
        success: true,
        submissions,
        count: submissions.length,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch submissions',
      });
    }
  });
  
  // Get a specific submission
  app.get('/api/lead-capture/:websiteId/submissions/:submissionId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, submissionId } = req.params;

      // Get all forms to find which one has this submission
      const forms = await getForms(websiteId);
      let submission: FormSubmission | null = null;

      for (const form of forms) {
        const submissions = await getSubmissions(websiteId, form.id);
        const found = submissions.find(s => s.id === submissionId);
        if (found) {
          submission = found;
          break;
        }
      }

      if (!submission) {
        res.status(404).json({
          success: false,
          error: 'Submission not found',
        });
        return;
      }

      res.json({
        success: true,
        submission,
      });
    } catch (_error: unknown) {
      res.status(500).json({
        success: false,
        error: _error instanceof Error ? _error.message : 'Failed to fetch submission',
      });
    }
  });
}

