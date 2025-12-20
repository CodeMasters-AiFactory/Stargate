/**
 * Projects API
 * Full CRUD for user website builder projects
 */

import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { projects } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export function registerProjectRoutes(app: Express) {

  // Get all projects for current user
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.userId, user.id))
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

  // Get single project by ID
  app.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check ownership (unless project is public)
      if (!project.isPublic && user?.id !== project.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(project);
    } catch (error) {
      console.error('[Projects API] Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Create new project (when user selects a template)
  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
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
        return res.status(400).json({ error: 'Project name is required' });
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
  app.put('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
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
  app.patch('/api/projects/:id/content', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
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

  // Delete project
  app.delete('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify ownership
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (existingProject.userId !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await db.delete(projects).where(eq(projects.id, id));

      res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
      console.error('[Projects API] Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // Get project files
  app.get('/api/projects/:id/files', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const [project] = await db
        .select({ files: projects.files })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
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

  console.log('[Projects API] Routes registered');
}
