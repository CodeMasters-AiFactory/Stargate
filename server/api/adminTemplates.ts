/**
 * Admin Template Management API Routes
 * CRUD operations for brand templates (admin only)
 */

import type { Express } from 'express';
import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../middleware/permissions';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { BRAND_TEMPLATES } from '../services/brandTemplateLibrary';
import * as fs from 'fs';
import * as path from 'path';

// Local file storage path
const TEMPLATES_DIR = path.join(process.cwd(), 'scraped_templates');

export function registerAdminTemplateRoutes(app: Express) {
  // Get all templates (from DB + files + library)
  app.get('/api/admin/templates', requireAdmin, async (_req, res) => {
    try {
      const allTemplates: any[] = [];

      // ============================================
      // STEP 1: Get templates from DATABASE
      // ============================================
      if (db) {
        try {
          const dbTemplates = await db
            .select()
            .from(brandTemplates)
            .where(eq(brandTemplates.isActive, true));

          allTemplates.push(
            ...dbTemplates.map((t: typeof brandTemplates.$inferSelect) => ({
              ...t,
              source: 'database' as const,
            }))
          );

          console.log(`[Admin Templates] ✅ Loaded ${dbTemplates.length} templates from database`);
        } catch (dbError) {
          console.warn('[Admin Templates] ⚠️ Database query failed:', getErrorMessage(dbError));
        }
      }

      // ============================================
      // STEP 2: Get templates from FILES
      // ============================================
      try {
        const indexPath = path.join(TEMPLATES_DIR, 'index.json');
        if (fs.existsSync(indexPath)) {
          const indexData = fs.readFileSync(indexPath, 'utf-8');
          const fileTemplates = JSON.parse(indexData);

          // Only add templates that aren't already in the database list
          for (const fileTemplate of fileTemplates) {
            if (!allTemplates.find(t => t.id === fileTemplate.id)) {
              allTemplates.push({
                id: fileTemplate.id,
                name: fileTemplate.name,
                brand: fileTemplate.brand,
                category: fileTemplate.industry || 'general',
                industry: fileTemplate.industry,
                locationCountry: fileTemplate.locationCountry,
                locationState: fileTemplate.locationState,
                thumbnail: null,
                colors: {},
                typography: {},
                layout: {},
                css: '',
                darkMode: false,
                tags: [],
                source: 'file' as const,
                isActive: true,
                createdAt: fileTemplate.createdAt || new Date().toISOString(),
                updatedAt: fileTemplate.createdAt || new Date().toISOString(),
              });
            }
          }

          console.log(`[Admin Templates] ✅ Added ${fileTemplates.length} templates from files`);
        }
      } catch (fileError) {
        console.warn('[Admin Templates] ⚠️ File index load failed:', getErrorMessage(fileError));
      }

      // ============================================
      // STEP 3: Add library templates (for reference)
      // ============================================
      for (const libTemplate of BRAND_TEMPLATES) {
        if (!allTemplates.find(t => t.id === libTemplate.id)) {
          allTemplates.push({
            id: libTemplate.id,
            name: libTemplate.name,
            brand: libTemplate.brand,
            category: libTemplate.category,
            industry: libTemplate.industry,
            thumbnail: libTemplate.thumbnail,
            colors: libTemplate.colors,
            typography: libTemplate.typography,
            layout: libTemplate.layout,
            css: libTemplate.css,
            darkMode: libTemplate.darkMode,
            tags: libTemplate.tags,
            source: 'library' as const,
            isActive: true,
            createdAt: null,
            updatedAt: null,
          });
        }
      }

      console.log(`[Admin Templates] ✅ Total templates: ${allTemplates.length} (DB: ${allTemplates.filter(t => t.source === 'database').length}, Files: ${allTemplates.filter(t => t.source === 'file').length}, Library: ${allTemplates.filter(t => t.source === 'library').length})`);

      res.json({
        success: true,
        templates: allTemplates,
        count: allTemplates.length,
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Get all');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to get templates',
      });
    }
  });

  // Get template page by template ID and path
  app.get('/api/admin/templates/:id/page/:path', requireAdmin, async (req, res) => {
    try {
      const { id, path } = req.params;
      const decodedPath = decodeURIComponent(path);
      
      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }
      
      const { templatePages } = await import('../../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // Find page by template ID and path
      const [page] = await db
        .select()
        .from(templatePages)
        .where(and(
          eq(templatePages.templateId, id),
          eq(templatePages.path, decodedPath === '/' ? '/' : decodedPath)
        ))
        .limit(1);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      
      return res.json({
        success: true,
        page: {
          id: page.id,
          url: page.url,
          path: page.path,
          htmlContent: page.htmlContent,
          cssContent: page.cssContent,
          jsContent: page.jsContent,
          title: page.title,
        },
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Get Page');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to get template page',
      });
    }
  });

  // Get single template by ID
  app.get('/api/admin/templates/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Check database first
      const dbTemplate = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);

      if (dbTemplate.length > 0) {
        return res.json({
          success: true,
          template: { ...dbTemplate[0], source: 'database' },
        });
      }

      // Check library
      const libraryTemplate = BRAND_TEMPLATES.find(t => t.id === id);
      if (libraryTemplate) {
        return res.json({
          success: true,
          template: { ...libraryTemplate, source: 'library' },
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Get by ID');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to get template',
      });
    }
  });

  // Create new template
  app.post('/api/admin/templates', requireAdmin, async (req, res) => {
    try {
      const templateData = req.body;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Validate required fields
      if (!templateData.id || !templateData.name || !templateData.brand || !templateData.category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: id, name, brand, category',
        });
      }

      // Check if template already exists
      const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, templateData.id)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Template with this ID already exists',
        });
      }

      // Insert new template
      const newTemplate = await db
        .insert(brandTemplates)
        .values({
          id: templateData.id,
          name: templateData.name,
          brand: templateData.brand,
          category: templateData.category,
          industry: templateData.industry || null,
          thumbnail: templateData.thumbnail || '/templates/default.jpg',
          colors: templateData.colors || {},
          typography: templateData.typography || {},
          layout: templateData.layout || {},
          css: templateData.css || '',
          darkMode: templateData.darkMode || false,
          tags: templateData.tags || [],
          ranking: templateData.ranking || null,
          // Premium/Free template system - default to free
          isPremium: templateData.isPremium !== undefined ? templateData.isPremium : false,
          price: templateData.price || null,
          // Approval system - new templates need approval (default to false - pending approval)
          isApproved: templateData.isApproved !== undefined ? templateData.isApproved : false,
          isActive: templateData.isActive !== undefined ? templateData.isActive : false, // Inactive until approved
        })
        .returning();

      return res.json({
        success: true,
        template: newTemplate[0],
        message: 'Template created successfully',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Create');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to create template',
      });
    }
  });

  // Update template
  app.put('/api/admin/templates/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const templateData = req.body;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      // Check if template exists in database
      const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Template not found in database. Library templates cannot be updated. Create a new template instead.',
        });
      }

      // Update template
      const updated = await db
        .update(brandTemplates)
        .set({
          name: templateData.name,
          brand: templateData.brand,
          category: templateData.category,
          industry: templateData.industry,
          thumbnail: templateData.thumbnail,
          colors: templateData.colors,
          typography: templateData.typography,
          layout: templateData.layout,
          css: templateData.css,
          darkMode: templateData.darkMode,
          tags: templateData.tags,
          ranking: templateData.ranking,
          // Design quality fields
          isDesignQuality: templateData.isDesignQuality !== undefined ? templateData.isDesignQuality : existing[0].isDesignQuality,
          designCategory: templateData.designCategory !== undefined ? templateData.designCategory : existing[0].designCategory,
          designScore: templateData.designScore !== undefined ? templateData.designScore : existing[0].designScore,
          designAwardSource: templateData.designAwardSource !== undefined ? templateData.designAwardSource : existing[0].designAwardSource,
          // Premium/Free template system
          isPremium: templateData.isPremium !== undefined ? templateData.isPremium : existing[0].isPremium || false,
          price: templateData.price !== undefined ? templateData.price : existing[0].price || null,
          // Approval system
          isApproved: templateData.isApproved !== undefined ? templateData.isApproved : existing[0].isApproved,
          isActive: templateData.isActive !== undefined ? templateData.isActive : (templateData.isApproved === true ? true : existing[0].isActive),
          updatedAt: new Date(),
        })
        .where(eq(brandTemplates.id, id))
        .returning();

      return res.json({
        success: true,
        template: updated[0],
        message: 'Template updated successfully',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Update');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to update template',
      });
    }
  });

  // Move template to Design Quality or Top Search
  app.post('/api/admin/templates/:id/move-to-design', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isDesignQuality = true, designCategory } = req.body;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const updated = await db
        .update(brandTemplates)
        .set({
          isDesignQuality: isDesignQuality,
          designCategory: designCategory || existing[0].industry || 'General',
          updatedAt: new Date(),
        })
        .where(eq(brandTemplates.id, id))
        .returning();

      return res.json({
        success: true,
        template: updated[0],
        message: isDesignQuality ? 'Template moved to Design Quality' : 'Template moved to Top Search',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Move to Design');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({ success: false, error: errorMessage || 'Failed to move template' });
    }
  });

  // Delete template (soft delete by setting isActive to false, or hard delete)
  app.delete('/api/admin/templates/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { hardDelete } = req.query;
    
    console.log(`[Admin Templates] DELETE request: ${id}`);
    
    let deletedFromDatabase = false;
    let deletedFromFile = false;

    try {
      // Step 1: Try database deletion
      if (db) {
        try {
          const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
          if (existing.length > 0) {
            if (hardDelete === 'true') {
              await db.delete(brandTemplates).where(eq(brandTemplates.id, id));
            } else {
              await db.update(brandTemplates).set({ isActive: false, updatedAt: new Date() }).where(eq(brandTemplates.id, id));
            }
            deletedFromDatabase = true;
            console.log(`[Admin Templates] ✅ Deleted from database: ${id}`);
          }
        } catch (dbError) {
          console.warn('[Admin Templates] Database delete error:', getErrorMessage(dbError));
        }
      }

      // Step 2: Try file system deletion
      const indexPath = path.join(TEMPLATES_DIR, 'index.json');
      
      // Check if index exists and find template
      if (fs.existsSync(indexPath)) {
        try {
          const indexData = fs.readFileSync(indexPath, 'utf-8');
          const index = JSON.parse(indexData);
          const templateIndex = index.findIndex((t: any) => t.id === id);
          
          if (templateIndex >= 0) {
            const template = index[templateIndex];
            const filename = template.filename || `${id}.json`;
            const filePath = path.join(TEMPLATES_DIR, filename);
            
            // Delete the file
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`[Admin Templates] ✅ Deleted file: ${filename}`);
            }
            
            // Remove from index
            index.splice(templateIndex, 1);
            fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
            deletedFromFile = true;
            console.log(`[Admin Templates] ✅ Removed from index: ${id}`);
          }
        } catch (fileError) {
          console.error('[Admin Templates] File delete error:', getErrorMessage(fileError));
        }
      }
      
      // Step 3: Also try direct file deletion (in case not in index)
      if (!deletedFromFile) {
        const directFile = path.join(TEMPLATES_DIR, `${id}.json`);
        if (fs.existsSync(directFile)) {
          try {
            fs.unlinkSync(directFile);
            deletedFromFile = true;
            console.log(`[Admin Templates] ✅ Deleted file directly: ${id}.json`);
          } catch (unlinkError) {
            console.warn('[Admin Templates] Direct file delete error:', getErrorMessage(unlinkError));
          }
        }
      }

      // Step 4: Check if library template
      const libraryTemplate = BRAND_TEMPLATES.find(t => t.id === id);
      if (libraryTemplate && !deletedFromDatabase && !deletedFromFile) {
        return res.status(403).json({
          success: false,
          error: 'Library templates cannot be deleted.',
        });
      }

      // Step 5: Return result
      if (deletedFromDatabase || deletedFromFile) {
        const messages: string[] = [];
        if (deletedFromDatabase) messages.push(hardDelete === 'true' ? 'database' : 'database (deactivated)');
        if (deletedFromFile) messages.push('file system');
        
        return res.json({
          success: true,
          message: `Template deleted from ${messages.join(' and ')}`,
        });
      }

      // Not found
      return res.status(404).json({
        success: false,
        error: `Template ${id} not found in database or file system.`,
      });

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error('[Admin Templates] ❌ Delete exception:', errorMessage);
      if (error instanceof Error) {
        console.error('[Admin Templates] Stack:', error.stack);
      }
      logError(error, 'Admin Templates - Delete');
      return res.status(500).json({
        success: false,
        error: `Server error: ${errorMessage}`,
      });
    }
  });

  // Delete ALL templates (hard delete)
  app.delete('/api/admin/templates', requireAdmin, async (_req, res) => {
    console.log('[Admin Templates] DELETE ALL request received');
    
    let deletedCount = 0;

    try {
      // Delete from database
      if (db) {
        try {
          const result = await db.delete(brandTemplates);
          console.log('[Admin Templates] ✅ Deleted all templates from database');
          deletedCount = (result as any).rowCount || 0;
        } catch (dbError) {
          console.warn('[Admin Templates] Database delete all error:', getErrorMessage(dbError));
        }
      }

      // Delete template files
      if (fs.existsSync(TEMPLATES_DIR)) {
        try {
          const files = fs.readdirSync(TEMPLATES_DIR);
          for (const file of files) {
            if (file.endsWith('.json')) {
              fs.unlinkSync(path.join(TEMPLATES_DIR, file));
              deletedCount++;
            }
          }
          console.log('[Admin Templates] ✅ Deleted all template files');
        } catch (fileError) {
          console.warn('[Admin Templates] File delete error:', getErrorMessage(fileError));
        }
      }

      return res.json({
        success: true,
        message: `Deleted all templates (${deletedCount} items)`,
        deletedCount,
      });

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.error('[Admin Templates] ❌ Delete all exception:', errorMessage);
      logError(error, 'Admin Templates - Delete All');
      return res.status(500).json({
        success: false,
        error: `Server error: ${errorMessage}`,
      });
    }
  });

  // Duplicate template (create a copy)
  app.post('/api/admin/templates/:id/duplicate', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { newId, newName } = req.body;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      if (!newId || !newName) {
        return res.status(400).json({
          success: false,
          error: 'newId and newName are required',
        });
      }

      // Get source template
      const sourceTemplate = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      if (sourceTemplate.length === 0) {
        // Try library
        const libraryTemplate = BRAND_TEMPLATES.find(t => t.id === id);
        if (!libraryTemplate) {
          return res.status(404).json({
            success: false,
            error: 'Template not found',
          });
        }

        // Create from library template
        const duplicated = await db
          .insert(brandTemplates)
          .values({
            id: newId,
            name: newName,
            brand: libraryTemplate.brand,
            category: libraryTemplate.category,
            industry: libraryTemplate.industry || null,
            thumbnail: libraryTemplate.thumbnail,
            colors: libraryTemplate.colors,
            typography: libraryTemplate.typography,
            layout: libraryTemplate.layout,
            css: libraryTemplate.css,
            darkMode: libraryTemplate.darkMode,
            tags: libraryTemplate.tags,
          // Approval system - duplicated templates need approval
          isApproved: false, // Pending approval
          isActive: false, // Inactive until approved
          })
          .returning();

        return res.json({
          success: true,
          template: duplicated[0],
          message: 'Template duplicated successfully',
        });
      }

      // Duplicate from database
      const duplicated = await db
        .insert(brandTemplates)
        .values({
          id: newId,
          name: newName,
          brand: sourceTemplate[0].brand,
          category: sourceTemplate[0].category,
          industry: sourceTemplate[0].industry,
          thumbnail: sourceTemplate[0].thumbnail,
          colors: sourceTemplate[0].colors,
          typography: sourceTemplate[0].typography,
          layout: sourceTemplate[0].layout,
          css: sourceTemplate[0].css,
          darkMode: sourceTemplate[0].darkMode,
          tags: sourceTemplate[0].tags,
          ranking: sourceTemplate[0].ranking,
          // Approval system - duplicated templates need approval
          isApproved: false, // Pending approval
          isActive: false, // Inactive until approved
        })
        .returning();

      return res.json({
        success: true,
        template: duplicated[0],
        message: 'Template duplicated successfully',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Duplicate');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to duplicate template',
      });
    }
  });

  // Approve template
  app.post('/api/admin/templates/:id/approve', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      const updated = await db
        .update(brandTemplates)
        .set({
          isApproved: true,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(brandTemplates.id, id))
        .returning();

      return res.json({
        success: true,
        template: updated[0],
        message: 'Template approved successfully',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Approve');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to approve template',
      });
    }
  });

  // Disapprove template
  app.post('/api/admin/templates/:id/disapprove', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      if (!db) {
        return res.status(500).json({ error: 'Database not available' });
      }

      const existing = await db.select().from(brandTemplates).where(eq(brandTemplates.id, id)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Template not found',
        });
      }

      const updated = await db
        .update(brandTemplates)
        .set({
          isApproved: false,
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(brandTemplates.id, id))
        .returning();

      return res.json({
        success: true,
        template: updated[0],
        message: 'Template disapproved successfully',
      });
    } catch (error: unknown) {
      logError(error, 'Admin Templates - Disapprove');
      const errorMessage = getErrorMessage(error);
      return res.status(500).json({
        success: false,
        error: errorMessage || 'Failed to disapprove template',
      });
    }
  });
}

