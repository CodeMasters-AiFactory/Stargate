/**
 * Wizard Features API Routes
 * API endpoints for the enhanced website wizard features
 */

import type { Express, Request, Response } from 'express';
import { generatePageByPage } from '../services/pageByPageGenerator';
import { detectKeywords, addCustomKeywords } from '../services/keywordDetector';
import { calculateSEOScore } from '../services/seoPreview';
import { generatePageVariations } from '../services/variationGenerator';
import { saveVersionSnapshot, restoreVersion, listVersions } from '../services/versionHistory';
import { submitForApproval, processApproval, getApprovalStatus } from '../services/approvalWorkflow';
import { mixTemplateElements } from '../services/templateMixer';
import { batchReplaceImages, batchUpdateContent, batchUpdateContactInfo } from '../services/batchOperations';
import { checkTemplateHealth, scheduleTemplateCheck } from '../services/templateMonitor';
import { getIndustryInsights } from '../services/industryInsights';
import { logError, getErrorMessage } from '../utils/errorHandler';

export function registerWizardFeaturesRoutes(app: Express) {
  /**
   * POST /api/wizard/generate-page-by-page
   * Generate website page by page with progress
   */
  app.post('/api/wizard/generate-page-by-page', async (req: Request, res: Response): Promise<void> => {
    try {
      const { mergedTemplate, clientInfo } = req.body;

      if (!mergedTemplate || !clientInfo) {
        res.status(400).json({ error: 'mergedTemplate and clientInfo are required' });
        return;
      }

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const sendProgress = (progress: any) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      };

      // Generate website ID for real-time preview
      const websiteId = req.body.websiteId || `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const results = await generatePageByPage(
        mergedTemplate,
        clientInfo,
        (progress) => {
          sendProgress({
            type: 'page-progress',
            ...progress,
          });
        },
        websiteId // Pass websiteId for real-time preview
      );

      sendProgress({
        type: 'complete',
        results,
      });

      res.end();
    } catch (error) {
      logError(error, 'WizardFeatures - GeneratePageByPage');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/detect-keywords
   * Detect keywords from page content
   */
  app.post('/api/wizard/detect-keywords', async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageHtml, pageName, industry } = req.body;

      if (!pageHtml || !industry) {
        res.status(400).json({ error: 'pageHtml and industry are required' });
        return;
      }

      const keywords = await detectKeywords(pageHtml, pageName || 'Page', industry);

      res.json({ keywords });
    } catch (error) {
      logError(error, 'WizardFeatures - DetectKeywords');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/add-custom-keywords
   * Add custom keywords to detected keywords
   */
  app.post('/api/wizard/add-custom-keywords', async (req: Request, res: Response): Promise<void> => {
    try {
      const { detectedKeywords, customKeywords } = req.body;

      if (!detectedKeywords || !customKeywords) {
        res.status(400).json({ error: 'detectedKeywords and customKeywords are required' });
        return;
      }

      const updated = addCustomKeywords(detectedKeywords, customKeywords);

      res.json({ keywords: updated });
    } catch (error) {
      logError(error, 'WizardFeatures - AddCustomKeywords');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/seo-preview
   * Calculate SEO score
   */
  app.post('/api/wizard/seo-preview', async (req: Request, res: Response): Promise<void> => {
    try {
      const { html, keywords } = req.body;

      if (!html) {
        res.status(400).json({ error: 'html is required' });
        return;
      }

      const seoScore = await calculateSEOScore(html, keywords || []);

      res.json({ seoScore });
    } catch (error) {
      logError(error, 'WizardFeatures - SEOPreview');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/generate-variations
   * Generate A/B test variations
   */
  app.post('/api/wizard/generate-variations', async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageHtml, clientInfo, options } = req.body;

      if (!pageHtml || !clientInfo) {
        res.status(400).json({ error: 'pageHtml and clientInfo are required' });
        return;
      }

      const variations = await generatePageVariations(pageHtml, clientInfo, options);

      res.json({ variations });
    } catch (error) {
      logError(error, 'WizardFeatures - GenerateVariations');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/versions/save
   * Save version snapshot
   */
  app.post('/api/wizard/versions/save', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, stage, snapshot, metadata } = req.body;

      if (!websiteId || !stage || !snapshot) {
        res.status(400).json({ error: 'websiteId, stage, and snapshot are required' });
        return;
      }

      const versionId = await saveVersionSnapshot(websiteId, stage, snapshot, metadata);

      res.json({ versionId });
    } catch (error) {
      logError(error, 'WizardFeatures - SaveVersion');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * GET /api/wizard/versions/:websiteId
   * List all versions for a website
   */
  app.get('/api/wizard/versions/:websiteId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;

      const versions = await listVersions(websiteId);

      res.json({ versions });
    } catch (error) {
      logError(error, 'WizardFeatures - ListVersions');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/versions/restore
   * Restore a version
   */
  app.post('/api/wizard/versions/restore', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, versionId } = req.body;

      if (!websiteId || !versionId) {
        res.status(400).json({ error: 'websiteId and versionId are required' });
        return;
      }

      const snapshot = await restoreVersion(websiteId, versionId);

      res.json({ snapshot });
    } catch (error) {
      logError(error, 'WizardFeatures - RestoreVersion');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/approval/submit
   * Submit for approval
   */
  app.post('/api/wizard/approval/submit', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, stage, requestedBy, comments } = req.body;

      if (!websiteId || !stage || !requestedBy) {
        res.status(400).json({ error: 'websiteId, stage, and requestedBy are required' });
        return;
      }

      const approvalId = await submitForApproval(websiteId, stage, requestedBy, comments);

      res.json({ approvalId });
    } catch (error) {
      logError(error, 'WizardFeatures - SubmitApproval');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/approval/process
   * Process approval
   */
  app.post('/api/wizard/approval/process', async (req: Request, res: Response): Promise<void> => {
    try {
      const { approvalId, approved, reviewedBy, comments, changeRequests } = req.body;

      if (!approvalId || approved === undefined || !reviewedBy) {
        res.status(400).json({ error: 'approvalId, approved, and reviewedBy are required' });
        return;
      }

      const approval = await processApproval(approvalId, approved, reviewedBy, comments, changeRequests);

      res.json({ approval });
    } catch (error) {
      logError(error, 'WizardFeatures - ProcessApproval');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * GET /api/wizard/approval/:websiteId
   * Get approval status
   */
  app.get('/api/wizard/approval/:websiteId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const { stage } = req.query;

      const approvals = await getApprovalStatus(websiteId, stage as string | undefined);

      res.json({ approvals });
    } catch (error) {
      logError(error, 'WizardFeatures - GetApprovalStatus');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/templates/mix
   * Mix template elements
   */
  app.post('/api/wizard/templates/mix', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templates } = req.body;

      if (!templates || !Array.isArray(templates) || templates.length === 0) {
        res.status(400).json({ error: 'templates array is required' });
        return;
      }

      const mixed = await mixTemplateElements(templates);

      res.json({ mixed });
    } catch (error) {
      logError(error, 'WizardFeatures - MixTemplates');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/batch/replace-images
   * Batch replace images
   */
  app.post('/api/wizard/batch/replace-images', async (req: Request, res: Response): Promise<void> => {
    try {
      const { pages, replacements } = req.body;

      if (!pages || !replacements) {
        res.status(400).json({ error: 'pages and replacements are required' });
        return;
      }

      const result = await batchReplaceImages(pages, replacements);

      res.json({ result });
    } catch (error) {
      logError(error, 'WizardFeatures - BatchReplaceImages');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/batch/update-content
   * Batch update content
   */
  app.post('/api/wizard/batch/update-content', async (req: Request, res: Response): Promise<void> => {
    try {
      const { pages, updates } = req.body;

      if (!pages || !updates) {
        res.status(400).json({ error: 'pages and updates are required' });
        return;
      }

      const result = await batchUpdateContent(pages, updates);

      res.json({ result });
    } catch (error) {
      logError(error, 'WizardFeatures - BatchUpdateContent');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/batch/update-contact
   * Batch update contact information
   */
  app.post('/api/wizard/batch/update-contact', async (req: Request, res: Response): Promise<void> => {
    try {
      const { pages, contactInfo } = req.body;

      if (!pages || !contactInfo) {
        res.status(400).json({ error: 'pages and contactInfo are required' });
        return;
      }

      const result = await batchUpdateContactInfo(pages, contactInfo);

      res.json({ result });
    } catch (error) {
      logError(error, 'WizardFeatures - BatchUpdateContact');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * GET /api/wizard/monitor/template-health/:templateId
   * Check template health
   */
  app.get('/api/wizard/monitor/template-health/:templateId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;

      const health = await checkTemplateHealth(templateId);

      res.json({ health });
    } catch (error) {
      logError(error, 'WizardFeatures - CheckTemplateHealth');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * POST /api/wizard/monitor/schedule
   * Schedule template check
   */
  app.post('/api/wizard/monitor/schedule', async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, frequency } = req.body;

      if (!templateId || !frequency) {
        res.status(400).json({ error: 'templateId and frequency are required' });
        return;
      }

      const job = await scheduleTemplateCheck(templateId, frequency);

      res.json({ job });
    } catch (error) {
      logError(error, 'WizardFeatures - ScheduleCheck');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });

  /**
   * GET /api/wizard/insights/industry/:industry
   * Get industry insights
   */
  app.get('/api/wizard/insights/industry/:industry', async (req: Request, res: Response): Promise<void> => {
    try {
      const { industry } = req.params;

      const insights = await getIndustryInsights(industry);

      res.json({ insights });
    } catch (error) {
      logError(error, 'WizardFeatures - GetIndustryInsights');
      res.status(500).json({ error: getErrorMessage(error) });
    }
  });
}

