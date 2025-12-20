/**
 * Visual Editor API Routes
 * Handles saving/loading visual editor state and component operations
 */

import type { Express } from 'express';
import archiver from 'archiver';
import { generateComponentHTML } from '../services/componentHTMLGenerator';
import { getStorageService, saveWebsiteFile, readWebsiteFile, listWebsiteFiles } from '../services/azureStorage';
import { getAIDesignRecommendations, voteOnDesignDecision } from '../services/aiDesignCritic';
import {
  trackDesignDecision,
  getPreferenceProfile,
  getLearnedRecommendations,
  autoApplyLearnedStyles,
  getDesignInsights,
} from '../services/neuralDesignLearning';
import {
  getAllVariants,
  searchVariants,
  getVariantById,
  getVariantsForComponent,
  getRecommendedVariants,
  getVariantStatistics,
} from '../services/componentVariantGenerator';
import {
  getAgentProfiles,
  startAgentCompetition,
  getCompetitionResult,
  getCompetitionsForProject,
  selectWinner,
  getCompetitionStats,
  generateSingleDesign,
} from '../services/agentCompetition';

export function registerVisualEditorRoutes(app: Express) {
  // Get AI design recommendations
  app.post('/api/visual-editor/ai-recommendations', async (req, res) => {
    try {
      const { website, selectedElement, context } = req.body;

      if (!website) {
        return res.status(400).json({
          success: false,
          error: 'website is required',
        });
      }

      const result = await getAIDesignRecommendations({
        website,
        selectedElement,
        context,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI recommendations',
        recommendations: [], // Return empty array on error
      });
    }
  });

  // Vote on design decision
  app.post('/api/visual-editor/ai-vote', async (req, res) => {
    try {
      const { prompt, context } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'prompt is required',
        });
      }

      const result = await voteOnDesignDecision(prompt, context);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI vote',
      });
    }
  });

  // ============================================
  // NEURAL DESIGN LEARNING ENDPOINTS (Week 2)
  // ============================================

  // Track design decision
  app.post('/api/visual-editor/track-decision', async (req, res) => {
    try {
      const { userId, projectId, decisionType, action, before, after, context, metadata } = req.body;

      if (!userId || !projectId || !decisionType || !action) {
        return res.status(400).json({
          success: false,
          error: 'userId, projectId, decisionType, and action are required',
        });
      }

      await trackDesignDecision({
        userId,
        projectId,
        decisionType,
        action,
        before,
        after,
        context: context || {},
        metadata,
      });

      res.json({
        success: true,
        message: 'Design decision tracked successfully',
      });
    } catch (error) {
      console.error('Track decision error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track design decision',
      });
    }
  });

  // Get preference profile
  app.get('/api/visual-editor/preferences/:userId/:projectId', async (req, res) => {
    try {
      const { userId, projectId } = req.params;

      const profile = getPreferenceProfile(userId, projectId);

      res.json({
        success: true,
        profile: profile || null,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get preference profile',
      });
    }
  });

  // Get learned recommendations
  app.post('/api/visual-editor/learned-recommendations', async (req, res) => {
    try {
      const { userId, projectId, context } = req.body;

      if (!userId || !projectId) {
        return res.status(400).json({
          success: false,
          error: 'userId and projectId are required',
        });
      }

      const recommendations = await getLearnedRecommendations(userId, projectId, context || {});

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error('Learned recommendations error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get learned recommendations',
        recommendations: [],
      });
    }
  });

  // Auto-apply learned styles
  app.post('/api/visual-editor/auto-apply-styles', async (req, res) => {
    try {
      const { userId, projectId, componentType, baseStyles } = req.body;

      if (!userId || !projectId || !componentType) {
        return res.status(400).json({
          success: false,
          error: 'userId, projectId, and componentType are required',
        });
      }

      const result = await autoApplyLearnedStyles(userId, projectId, componentType, baseStyles || {});

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-apply styles',
        styles: baseStyles || {},
        applied: [],
      });
    }
  });

  // Get design insights
  app.get('/api/visual-editor/insights/:userId/:projectId', async (req, res) => {
    try {
      const { userId, projectId } = req.params;

      const insights = getDesignInsights(userId, projectId);

      res.json({
        success: true,
        insights,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get design insights',
        insights: [],
      });
    }
  });

  // ============================================
  // END NEURAL LEARNING ENDPOINTS
  // ============================================

  // ============================================
  // COMPONENT VARIANT ENDPOINTS (Week 3)
  // ============================================

  // Get all variants
  app.get('/api/visual-editor/variants', (req, res) => {
    try {
      const allVariants = getAllVariants();
      const stats = getVariantStatistics(allVariants);

      res.json({
        success: true,
        variants: allVariants,
        statistics: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get variants',
        variants: [],
      });
    }
  });

  // Search variants
  app.post('/api/visual-editor/variants/search', (req, res) => {
    try {
      const { query, filters } = req.body;
      const allVariants = getAllVariants();
      const results = searchVariants(allVariants, query || '', filters);

      res.json({
        success: true,
        results,
        total: results.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search variants',
        results: [],
        total: 0,
      });
    }
  });

  // Get variant by ID
  app.get('/api/visual-editor/variants/:variantId', (req, res) => {
    try {
      const { variantId } = req.params;
      const allVariants = getAllVariants();
      const variant = getVariantById(variantId, allVariants);

      if (!variant) {
        return res.status(404).json({
          success: false,
          error: 'Variant not found',
        });
      }

      res.json({
        success: true,
        variant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get variant',
      });
    }
  });

  // Get variants for component
  app.get('/api/visual-editor/variants/component/:componentId', (req, res) => {
    try {
      const { componentId } = req.params;
      const allVariants = getAllVariants();
      const variants = getVariantsForComponent(componentId, allVariants);

      res.json({
        success: true,
        variants,
        total: variants.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get component variants',
        variants: [],
        total: 0,
      });
    }
  });

  // Get recommended variants based on preferences
  app.post('/api/visual-editor/variants/recommended', (req, res) => {
    try {
      const { preferences } = req.body;
      const allVariants = getAllVariants();
      const recommended = getRecommendedVariants(allVariants, preferences || {});

      res.json({
        success: true,
        recommended,
        total: recommended.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommended variants',
        recommended: [],
        total: 0,
      });
    }
  });

  // Get variant statistics
  app.get('/api/visual-editor/variants/stats', (req, res) => {
    try {
      const allVariants = getAllVariants();
      const stats = getVariantStatistics(allVariants);

      res.json({
        success: true,
        statistics: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get variant statistics',
      });
    }
  });

  // ============================================
  // END COMPONENT VARIANT ENDPOINTS
  // ============================================

  // ============================================
  // AGENT COMPETITION ENDPOINTS (Week 4)
  // ============================================

  // Get all agent profiles
  app.get('/api/visual-editor/agent-competition/profiles', (req, res) => {
    try {
      const profiles = getAgentProfiles();

      res.json({
        success: true,
        profiles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get agent profiles',
        profiles: [],
      });
    }
  });

  // Start agent competition
  app.post('/api/visual-editor/agent-competition/start', async (req, res) => {
    try {
      const { componentType, context, requirements, userId, projectId } = req.body;

      if (!componentType) {
        return res.status(400).json({
          success: false,
          error: 'componentType is required',
        });
      }

      const competition = await startAgentCompetition({
        componentType,
        context,
        requirements,
        userId,
        projectId,
      });

      res.json({
        success: true,
        competition,
      });
    } catch (error) {
      console.error('Agent competition error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start agent competition',
      });
    }
  });

  // Get competition result by ID
  app.get('/api/visual-editor/agent-competition/:competitionId', (req, res) => {
    try {
      const { competitionId } = req.params;
      const competition = getCompetitionResult(competitionId);

      if (!competition) {
        return res.status(404).json({
          success: false,
          error: 'Competition not found',
        });
      }

      res.json({
        success: true,
        competition,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get competition result',
      });
    }
  });

  // Get all competitions for a project
  app.get('/api/visual-editor/agent-competition/project/:userId/:projectId', (req, res) => {
    try {
      const { userId, projectId } = req.params;
      const competitions = getCompetitionsForProject(userId, projectId);

      res.json({
        success: true,
        competitions,
        total: competitions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get competitions',
        competitions: [],
        total: 0,
      });
    }
  });

  // Select winner
  app.post('/api/visual-editor/agent-competition/select-winner', async (req, res) => {
    try {
      const { competitionId, winnerAgentId, userId, projectId } = req.body;

      if (!competitionId || !winnerAgentId) {
        return res.status(400).json({
          success: false,
          error: 'competitionId and winnerAgentId are required',
        });
      }

      const competition = selectWinner(competitionId, winnerAgentId, userId, projectId);

      if (!competition) {
        return res.status(404).json({
          success: false,
          error: 'Competition not found',
        });
      }

      res.json({
        success: true,
        competition,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to select winner',
      });
    }
  });

  // Get competition statistics
  app.get('/api/visual-editor/agent-competition/stats/:userId/:projectId', (req, res) => {
    try {
      const { userId, projectId } = req.params;
      const stats = getCompetitionStats(userId, projectId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get competition stats',
      });
    }
  });

  // Generate single design (non-competitive mode)
  app.post('/api/visual-editor/agent-competition/generate-single', async (req, res) => {
    try {
      const { philosophy, componentType, context, requirements, userId, projectId } = req.body;

      if (!philosophy || !componentType) {
        return res.status(400).json({
          success: false,
          error: 'philosophy and componentType are required',
        });
      }

      const design = await generateSingleDesign(philosophy, {
        componentType,
        context,
        requirements,
        userId,
        projectId,
      });

      res.json({
        success: true,
        design,
      });
    } catch (error) {
      console.error('Single design generation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate design',
      });
    }
  });

  // ============================================
  // END AGENT COMPETITION ENDPOINTS
  // ============================================

  // Generate component HTML
  app.post('/api/visual-editor/generate-component', async (req, res) => {
    try {
      const { componentId, variantId, props } = req.body;

      if (!componentId) {
        return res.status(400).json({
          success: false,
          error: 'componentId is required',
        });
      }

      const { html, css, js } = generateComponentHTML(componentId, variantId, props);

      res.json({
        success: true,
        html,
        css,
        js,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate component',
      });
    }
  });

  // Save visual editor state
  app.post('/api/visual-editor/save/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const { websitePackage, editorState } = req.body;

      if (!websitePackage) {
        return res.status(400).json({
          success: false,
          error: 'websitePackage is required',
        });
      }

      // Save website package
      await saveWebsiteFile(projectSlug, 'website-package.json', JSON.stringify(websitePackage, null, 2));

      // Save editor state if provided
      if (editorState) {
        await saveWebsiteFile(projectSlug, 'editor-state.json', JSON.stringify(editorState, null, 2));
      }

      res.json({
        success: true,
        message: 'Visual editor state saved',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save visual editor state',
      });
    }
  });

  // Load visual editor state
  app.get('/api/visual-editor/load/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;

      // Try to load website package
      let websitePackage = null;
      try {
        const packageContent = await readWebsiteFile(projectSlug, 'website-package.json');
        websitePackage = JSON.parse(packageContent);
      } catch (e) {
        // Package doesn't exist yet
      }

      // Try to load editor state
      let editorState = null;
      try {
        const stateContent = await readWebsiteFile(projectSlug, 'editor-state.json');
        editorState = JSON.parse(stateContent);
      } catch (e) {
        // State doesn't exist yet
      }

      res.json({
        success: true,
        websitePackage,
        editorState,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load visual editor state',
      });
    }
  });

  // Export website to HTML/CSS/JS
  app.post('/api/visual-editor/export/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const { format = 'zip' } = req.query;
      const { websitePackage } = req.body;

      // Use provided website package or load from storage
      let packageToExport = websitePackage;
      if (!packageToExport) {
        try {
          const packageContent = await readWebsiteFile(projectSlug, 'website-package.json');
          packageToExport = JSON.parse(packageContent);
        } catch (e) {
          return res.status(404).json({
            success: false,
            error: 'Website package not found',
          });
        }
      }

      if (format === 'zip') {
        // Generate ZIP package
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${projectSlug}.zip"`);

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
          res.status(500).json({
            success: false,
            error: err.message,
          });
        });

        archive.pipe(res);

        // Add all files from website package
        if (packageToExport.files) {
          for (const [filePath, fileData] of Object.entries(packageToExport.files)) {
            const file = fileData as any;
            let content = '';
            
            if (typeof file === 'object' && 'content' in file) {
              content = file.content as string;
            } else if (typeof file === 'string') {
              content = file;
            }

            // Handle base64 encoding
            if (content && content.length > 100 && !content.includes('<!DOCTYPE') && !content.includes('/*')) {
              try {
                const decoded = Buffer.from(content, 'base64').toString('utf-8');
                if (decoded.includes('<!DOCTYPE') || decoded.includes('/*') || decoded.includes('function')) {
                  content = decoded;
                }
              } catch (e) {
                // Already plain text
              }
            }

            archive.append(content, { name: filePath });
          }
        }

        // Add shared assets
        if (packageToExport.sharedAssets) {
          if (packageToExport.sharedAssets.css) {
            archive.append(packageToExport.sharedAssets.css, { name: 'styles.css' });
          }
          if (packageToExport.sharedAssets.js) {
            archive.append(packageToExport.sharedAssets.js, { name: 'script.js' });
          }
        }

        // Add manifest
        if (packageToExport.manifest) {
          archive.append(JSON.stringify(packageToExport.manifest, null, 2), { name: 'manifest.json' });
        }

        await archive.finalize();
      } else {
        // Return individual files as JSON
        res.json({
          success: true,
          files: packageToExport.files,
          sharedAssets: packageToExport.sharedAssets,
          manifest: packageToExport.manifest,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export website',
      });
    }
  });
}

