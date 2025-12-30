/**
 * Projects API
 * Full CRUD for user website builder projects
 * Includes soft delete with 60-day trash retention
 */

import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { projects } from '../../shared/schema';
import { eq, desc, and, isNull, lt, or } from 'drizzle-orm';

// 60 days in milliseconds
const TRASH_RETENTION_DAYS = 60;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function registerProjectRoutes(app: Express) {

  // Get all projects for current user (excludes deleted/trashed projects)
  app.get('/api/projects', async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userProjects = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.userId, user.id),
            or(eq(projects.isDeleted, false), isNull(projects.isDeleted))
          )
        )
        .orderBy(desc(projects.updatedAt));

      res.json({
        projects: userProjects,
        count: userProjects.length,
      });
    } catch (error) {
      console.error('[Projects API] Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get trashed/deleted projects for current user
  app.get('/api/projects/trash', async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const trashedProjects = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.userId, user.id),
            eq(projects.isDeleted, true)
          )
        )
        .orderBy(desc(projects.deletedAt));

      // Calculate days remaining for each project
      const projectsWithExpiry = trashedProjects.map(project => {
        const deletedAt = project.deletedAt ? new Date(project.deletedAt).getTime() : Date.now();
        const expiresAt = deletedAt + TRASH_RETENTION_MS;
        const daysRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));

        return {
          ...project,
          daysRemaining,
          expiresAt: new Date(expiresAt).toISOString(),
        };
      });

      res.json({
        projects: projectsWithExpiry,
        count: projectsWithExpiry.length,
        retentionDays: TRASH_RETENTION_DAYS,
      });
    } catch (error) {
      console.error('[Projects API] Error fetching trashed projects:', error);
      res.status(500).json({ error: 'Failed to fetch trashed projects' });
    }
  });

  // Get single project by ID
  app.get('/api/projects/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      // Check ownership (unless project is public)
      if (!project.isPublic && user?.id !== project.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error('[Projects API] Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Create new project (when user selects a template)
  app.post('/api/projects', async (req: Request, res: Response): Promise<void> => {
    try {
      // DEBUG: Log incoming project creation request to trace source
      console.log('[Projects API DEBUG] =================================');
      console.log('[Projects API DEBUG] POST /api/projects called');
      console.log('[Projects API DEBUG] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[Projects API DEBUG] Headers:', JSON.stringify({
        'content-type': req.headers['content-type'],
        'referer': req.headers['referer'],
        'origin': req.headers['origin'],
        'x-requested-with': req.headers['x-requested-with'],
      }, null, 2));
      console.log('[Projects API DEBUG] Stack trace:');
      console.trace('[Projects API DEBUG] Called from:');
      console.log('[Projects API DEBUG] =================================');

      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        name,
        templateId,
        templateName,
        templatePreview,
        html,
        css,
        industry,
        description,
        businessInfo,
      } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }

      const [newProject] = await db
        .insert(projects)
        .values({
          name,
          userId: user.id,
          templateId,
          templateName,
          templatePreview,
          html,
          css,
          industry,
          description,
          businessInfo: businessInfo || {},
          status: 'draft',
          files: {},
          isDeleted: false,
        })
        .returning();

      console.log(`[Projects API] Created project "${name}" for user ${user.id}`);

      res.status(201).json({
        success: true,
        project: newProject,
      });
    } catch (error) {
      console.error('[Projects API] Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update project
  app.put('/api/projects/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (existingProject.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const {
        name,
        html,
        css,
        status,
        description,
        businessInfo,
        isPublic,
        files,
      } = req.body;

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...(name !== undefined && { name }),
          ...(html !== undefined && { html }),
          ...(css !== undefined && { css }),
          ...(status !== undefined && { status }),
          ...(description !== undefined && { description }),
          ...(businessInfo !== undefined && { businessInfo }),
          ...(isPublic !== undefined && { isPublic }),
          ...(files !== undefined && { files }),
          updatedAt: new Date(),
          lastEditedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      res.json({
        success: true,
        project: updatedProject,
      });
    } catch (error) {
      console.error('[Projects API] Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Save project content (auto-save endpoint)
  app.patch('/api/projects/:id/content', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (existingProject.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const { html, css } = req.body;

      await db
        .update(projects)
        .set({
          ...(html !== undefined && { html }),
          ...(css !== undefined && { css }),
          lastEditedAt: new Date(),
        })
        .where(eq(projects.id, id));

      res.json({ success: true, savedAt: new Date().toISOString() });
    } catch (error) {
      console.error('[Projects API] Error saving content:', error);
      res.status(500).json({ error: 'Failed to save content' });
    }
  });

  // Soft delete project (move to trash)
  app.delete('/api/projects/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const permanent = req.query.permanent === 'true';

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (existingProject.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (permanent) {
        // Permanent delete - actually remove from database
        await db.delete(projects).where(eq(projects.id, id));
        console.log(`[Projects API] Permanently deleted project ${id} for user ${user.id}`);
        res.json({ success: true, message: 'Project permanently deleted' });
      } else {
        // Soft delete - move to trash
        await db
          .update(projects)
          .set({
            isDeleted: true,
            deletedAt: new Date(),
          })
          .where(eq(projects.id, id));

        console.log(`[Projects API] Moved project ${id} to trash for user ${user.id}`);
        res.json({
          success: true,
          message: 'Project moved to trash',
          retentionDays: TRASH_RETENTION_DAYS,
        });
      }
    } catch (error) {
      console.error('[Projects API] Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // Restore project from trash
  app.post('/api/projects/:id/restore', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (existingProject.userId !== user.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (!existingProject.isDeleted) {
        res.status(400).json({ error: 'Project is not in trash' });
        return;
      }

      // Restore project
      const [restoredProject] = await db
        .update(projects)
        .set({
          isDeleted: false,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      console.log(`[Projects API] Restored project ${id} from trash for user ${user.id}`);

      res.json({
        success: true,
        message: 'Project restored',
        project: restoredProject,
      });
    } catch (error) {
      console.error('[Projects API] Error restoring project:', error);
      res.status(500).json({ error: 'Failed to restore project' });
    }
  });

  // Empty trash (permanently delete all trashed projects)
  app.delete('/api/projects/trash/empty', async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await db
        .delete(projects)
        .where(
          and(
            eq(projects.userId, user.id),
            eq(projects.isDeleted, true)
          )
        );

      console.log(`[Projects API] Emptied trash for user ${user.id}`);

      res.json({
        success: true,
        message: 'Trash emptied',
      });
    } catch (error) {
      console.error('[Projects API] Error emptying trash:', error);
      res.status(500).json({ error: 'Failed to empty trash' });
    }
  });

  // Auto-cleanup: Remove projects that have been in trash for more than 60 days
  // This should be called by a cron job or similar scheduled task
  app.post('/api/projects/cleanup', async (req: Request, res: Response): Promise<void> => {
    try {
      // This endpoint should be protected - only allow from internal/admin calls
      const apiKey = req.headers['x-api-key'];
      if (apiKey !== process.env.INTERNAL_API_KEY && process.env.NODE_ENV === 'production') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const cutoffDate = new Date(Date.now() - TRASH_RETENTION_MS);

      const result = await db
        .delete(projects)
        .where(
          and(
            eq(projects.isDeleted, true),
            lt(projects.deletedAt, cutoffDate)
          )
        );

      console.log(`[Projects API] Auto-cleanup: Removed projects deleted before ${cutoffDate.toISOString()}`);

      res.json({
        success: true,
        message: `Cleaned up projects older than ${TRASH_RETENTION_DAYS} days`,
        cutoffDate: cutoffDate.toISOString(),
      });
    } catch (error) {
      console.error('[Projects API] Error during cleanup:', error);
      res.status(500).json({ error: 'Failed to cleanup old projects' });
    }
  });

  // Get project files
  app.get('/api/projects/:id/files', async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [project] = await db
        .select({ files: projects.files })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json({
        files: project.files || {},
        count: Object.keys(project.files || {}).length,
      });
    } catch (error) {
      console.error('[Projects API] Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch project files' });
    }
  });

  console.log('[Projects API] Routes registered (with soft delete support)');
}
