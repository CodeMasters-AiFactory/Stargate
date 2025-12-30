/**
 * CMS API Routes
 * Complete content management system API
 */

import type { Express, Request, Response } from 'express';
import {
  createContentType,
  getContentTypes,
  getContentTypeById,
  updateContentType,
  deleteContentType,
  createContentEntry,
  getContentEntries,
  getContentEntry,
  updateContentEntry,
  deleteContentEntry,
  createContentRelation,
  getContentRelations,
  deleteContentRelation,
  createContentRevision,
  getContentRevisions,
  restoreContentRevision,
  type ContentTypeField,
} from '../services/cmsService';

export function registerCMSRoutes(app: Express) {
  // ============================================
  // CONTENT TYPES
  // ============================================

  // Create content type
  app.post('/api/cms/content-types', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId, name, fields } = req.body;

      if (!websiteId || !name || !fields || !Array.isArray(fields)) {
        res.status(400).json({
          success: false,
          error: 'websiteId, name, and fields array are required',
        });
        return;
      }

      const contentTypeId = await createContentType(websiteId, name, fields as ContentTypeField[]);

      res.json({
        success: true,
        contentTypeId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content type',
      });
    }
  });

  // Get content types
  app.get('/api/cms/content-types/:websiteId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const contentTypes = await getContentTypes(websiteId);

      res.json({
        success: true,
        contentTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content types',
      });
    }
  });

  // Get single content type
  app.get('/api/cms/content-types/:websiteId/:contentTypeId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { contentTypeId } = req.params;
      const contentType = await getContentTypeById(contentTypeId);

      if (!contentType) {
        res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
        return;
      }

      res.json({
        success: true,
        contentType,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content type',
      });
    }
  });

  // Update content type
  app.patch('/api/cms/content-types/:contentTypeId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { contentTypeId } = req.params;
      const updates = req.body;

      const success = await updateContentType(contentTypeId, updates);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content type updated',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update content type',
      });
    }
  });

  // Delete content type
  app.delete('/api/cms/content-types/:contentTypeId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { contentTypeId } = req.params;
      const success = await deleteContentType(contentTypeId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Content type not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content type deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content type',
      });
    }
  });

  // ============================================
  // CONTENT ENTRIES
  // ============================================

  // Create content entry
  app.post('/api/cms/entries', async (req: Request, res: Response): Promise<void> => {
    try {
      const { contentTypeId, websiteId, data, status, publishedAt } = req.body;

      if (!contentTypeId || !websiteId || !data) {
        res.status(400).json({
          success: false,
          error: 'contentTypeId, websiteId, and data are required',
        });
        return;
      }

      const entryId = await createContentEntry(
        contentTypeId,
        websiteId,
        data,
        status,
        publishedAt ? new Date(publishedAt) : undefined
      );

      res.json({
        success: true,
        entryId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content entry',
      });
    }
  });

  // Get content entries
  app.get('/api/cms/entries/:websiteId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { websiteId } = req.params;
      const {
        contentTypeId,
        status,
        search,
        limit,
        offset,
      } = req.query;

      const entries = await getContentEntries(websiteId, {
        contentTypeId: contentTypeId as string,
        status: status as string | undefined,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        entries,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content entries',
      });
    }
  });

  // Get single content entry
  app.get('/api/cms/entries/:websiteId/:entryId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId } = req.params;
      const entry = await getContentEntry(entryId);

      if (!entry) {
        res.status(404).json({
          success: false,
          error: 'Content entry not found',
        });
        return;
      }

      res.json({
        success: true,
        entry,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content entry',
      });
    }
  });

  // Update content entry
  app.patch('/api/cms/entries/:entryId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId } = req.params;
      const updates = req.body;

      const success = await updateContentEntry(entryId, updates);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Content entry not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content entry updated',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update content entry',
      });
    }
  });

  // Delete content entry
  app.delete('/api/cms/entries/:entryId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId } = req.params;
      const success = await deleteContentEntry(entryId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Content entry not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content entry deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content entry',
      });
    }
  });

  // ============================================
  // CONTENT RELATIONS
  // ============================================

  // Create content relation
  app.post('/api/cms/relations', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId, relatedEntryId, relationType } = req.body;

      if (!entryId || !relatedEntryId || !relationType) {
        res.status(400).json({
          success: false,
          error: 'entryId, relatedEntryId, and relationType are required',
        });
        return;
      }

      const relationId = await createContentRelation(entryId, relatedEntryId, relationType);

      res.json({
        success: true,
        relationId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content relation',
      });
    }
  });

  // Get content relations
  app.get('/api/cms/relations/:entryId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId } = req.params;
      const relations = await getContentRelations(entryId);

      res.json({
        success: true,
        relations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content relations',
      });
    }
  });

  // Delete content relation
  app.delete('/api/cms/relations/:relationId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { relationId } = req.params;
      const success = await deleteContentRelation(relationId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Content relation not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content relation deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete content relation',
      });
    }
  });

  // ============================================
  // CONTENT VERSIONING
  // ============================================

  // Get content revisions
  app.get('/api/cms/revisions/:entryId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId } = req.params;
      const revisions = await getContentRevisions(entryId);

      res.json({
        success: true,
        revisions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get content revisions',
      });
    }
  });

  // Restore content revision
  app.post('/api/cms/revisions/:entryId/restore/:revisionId', async (req: Request, res: Response): Promise<void> => {
    try {
      const { entryId, revisionId } = req.params;
      const success = await restoreContentRevision(entryId, revisionId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Entry or revision not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Content revision restored',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore content revision',
      });
    }
  });
}
