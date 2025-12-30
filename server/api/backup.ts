/**
 * Backup API Routes
 * Website backup and restore functionality
 */

import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { websiteDrafts } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/permissions';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Backup storage directory
const BACKUPS_DIR = path.join(process.cwd(), 'website_backups');

// Ensure backups directory exists
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

interface BackupMetadata {
  id: string;
  websiteId: string;
  websiteName: string;
  name: string;
  description?: string;
  createdAt: string;
  size: number;
  version: string;
  status: 'completed' | 'failed' | 'in_progress';
  data: any; // Website data (HTML, CSS, etc.)
}

export function registerBackupRoutes(app: Express) {
  /**
   * GET /api/websites/backups
   * List all backups for the authenticated user
   */
  app.get('/api/websites/backups', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get all website drafts for the user (these represent websites)
      const drafts = await db
        .select()
        .from(websiteDrafts)
        .where(eq(websiteDrafts.userId, userId))
        .orderBy(desc(websiteDrafts.createdAt));

      // For now, create mock backups from drafts
      // In production, you'd have a separate backups table
      const backups: BackupMetadata[] = drafts.map((draft, _index) => ({
        id: draft.id,
        websiteId: draft.sessionId,
        websiteName: draft.name || 'Untitled Website',
        name: `Backup ${new Date(draft.createdAt || new Date()).toLocaleDateString()}`,
        description: draft.description || undefined,
        createdAt: draft.createdAt?.toISOString() || new Date().toISOString(),
        size: JSON.stringify(draft.code).length, // Approximate size
        version: draft.version || '1.0.0',
        status: 'completed' as const,
        data: draft.code,
      }));

      res.json({ backups });
    } catch (error) {
      console.error('[Backup API] Error listing backups:', error);
      res.status(500).json({ error: 'Failed to list backups' });
    }
  });

  /**
   * POST /api/websites/backup
   * Create a new backup
   */
  app.post('/api/websites/backup', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, description, websiteId } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Backup name is required' });
        return;
      }

      // Get the latest draft for the website (or use websiteId if provided)
      let draft;
      if (websiteId) {
        const drafts = await db
          .select()
          .from(websiteDrafts)
          .where(and(eq(websiteDrafts.sessionId, websiteId), eq(websiteDrafts.userId, userId)))
          .orderBy(desc(websiteDrafts.createdAt))
          .limit(1);

        if (drafts.length === 0) {
          res.status(404).json({ error: 'Website not found' });
          return;
        }
        draft = drafts[0];
      } else {
        // Get the most recent draft
        const drafts = await db
          .select()
          .from(websiteDrafts)
          .where(eq(websiteDrafts.userId, userId))
          .orderBy(desc(websiteDrafts.createdAt))
          .limit(1);

        if (drafts.length === 0) {
          res.status(404).json({ error: 'No website found to backup' });
          return;
        }
        draft = drafts[0];
      }

      // Create backup metadata
      const backupId = randomUUID();
      const backup: BackupMetadata = {
        id: backupId,
        websiteId: draft.sessionId,
        websiteName: draft.name || 'Untitled Website',
        name,
        description,
        createdAt: new Date().toISOString(),
        size: JSON.stringify(draft.code).length,
        version: draft.version || '1.0.0',
        status: 'completed',
        data: draft.code,
      };

      // Save backup to file system
      const backupPath = path.join(BACKUPS_DIR, `${backupId}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

      res.json({
        success: true,
        backup: {
          id: backup.id,
          websiteId: backup.websiteId,
          websiteName: backup.websiteName,
          name: backup.name,
          description: backup.description,
          createdAt: backup.createdAt,
          size: backup.size,
          version: backup.version,
          status: backup.status,
        },
      });
    } catch (error) {
      console.error('[Backup API] Error creating backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  });

  /**
   * POST /api/websites/restore/:backupId
   * Restore a website from a backup
   */
  app.post('/api/websites/restore/:backupId', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { backupId } = req.params;

      // Load backup from file system
      const backupPath = path.join(BACKUPS_DIR, `${backupId}.json`);
      if (!fs.existsSync(backupPath)) {
        res.status(404).json({ error: 'Backup not found' });
        return;
      }

      const backupData = fs.readFileSync(backupPath, 'utf-8');
      const backup: BackupMetadata = JSON.parse(backupData);

      // Verify backup belongs to user (if we had a user field in backup)
      // For now, we'll trust the backupId

      // Create a new draft from the backup
      const newDraft = await db.insert(websiteDrafts).values({
        sessionId: backup.websiteId,
        userId,
        name: backup.websiteName,
        description: `Restored from backup: ${backup.name}`,
        template: null,
        requirements: {},
        code: backup.data,
        status: 'draft',
        version: backup.version,
        metadata: {
          restoredFrom: backupId,
          restoredAt: new Date().toISOString(),
        },
      }).returning();

      res.json({
        success: true,
        message: 'Website restored successfully',
        draft: newDraft[0],
      });
    } catch (error) {
      console.error('[Backup API] Error restoring backup:', error);
      res.status(500).json({ error: 'Failed to restore backup' });
    }
  });

  /**
   * DELETE /api/websites/backup/:backupId
   * Delete a backup
   */
  app.delete('/api/websites/backup/:backupId', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { backupId } = req.params;

      // Delete backup file
      const backupPath = path.join(BACKUPS_DIR, `${backupId}.json`);
      if (!fs.existsSync(backupPath)) {
        res.status(404).json({ error: 'Backup not found' });
        return;
      }

      fs.unlinkSync(backupPath);

      res.json({
        success: true,
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      console.error('[Backup API] Error deleting backup:', error);
      res.status(500).json({ error: 'Failed to delete backup' });
    }
  });

  /**
   * GET /api/websites/backup/:backupId/download
   * Download a backup as a file
   */
  app.get('/api/websites/backup/:backupId/download', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { backupId } = req.params;

      // Load backup from file system
      const backupPath = path.join(BACKUPS_DIR, `${backupId}.json`);
      if (!fs.existsSync(backupPath)) {
        res.status(404).json({ error: 'Backup not found' });
        return;
      }

      const backupData = fs.readFileSync(backupPath, 'utf-8');
      const backup: BackupMetadata = JSON.parse(backupData);

      // Set headers for download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="backup-${backup.name.replace(/[^a-z0-9]/gi, '_')}.json"`
      );

      res.send(backupData);
    } catch (error) {
      console.error('[Backup API] Error downloading backup:', error);
      res.status(500).json({ error: 'Failed to download backup' });
    }
  });
}

