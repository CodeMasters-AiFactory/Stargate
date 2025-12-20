/**
 * Enterprise Features API Routes
 * SSO, white-labeling, custom domains, team workspaces
 */

import type { Express, Request, Response } from 'express';
import {
  registerSSOProvider,
  getSSOProvider,
  listSSOProviders,
  generateSAMLRequest,
  processOAuthCallback,
  validateSSOSession,
} from '../services/enterprise/SSO';
import {
  applyWhiteLabeling,
  generateWhiteLabelCSS,
} from '../services/enterprise/whiteLabel';
import {
  createWorkspace,
  getWorkspace,
  addWorkspaceMember,
  listUserWorkspaces,
} from '../services/enterprise/teamWorkspaces';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { requireAdmin } from '../middleware/permissions';

export function registerEnterpriseRoutes(app: Express): void {
  // ============================================
  // SSO ROUTES
  // ============================================

  /**
   * POST /api/enterprise/sso/providers
   * Register SSO provider
   */
  app.post('/api/enterprise/sso/providers', requireAdmin, async (req: Request, res: Response) => {
    try {
      const provider = req.body;
      registerSSOProvider(provider);
      res.json({
        success: true,
        providerId: provider.id,
      });
    } catch (error) {
      logError(error, 'Enterprise API - RegisterSSO');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/enterprise/sso/providers
   * List SSO providers
   */
  app.get('/api/enterprise/sso/providers', async (req: Request, res: Response) => {
    try {
      const providers = listSSOProviders();
      res.json({
        success: true,
        providers,
      });
    } catch (error) {
      logError(error, 'Enterprise API - ListSSO');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/enterprise/sso/auth/:providerId
   * Initiate SSO authentication
   */
  app.get('/api/enterprise/sso/auth/:providerId', async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;
      const { relayState } = req.query;

      const provider = getSSOProvider(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'SSO provider not found',
        });
      }

      if (provider.type === 'saml') {
        const { redirectUrl } = generateSAMLRequest(providerId, relayState as string);
        return res.redirect(redirectUrl);
      } else {
        // OAuth/OIDC flow
        const authUrl = `${provider.config.authorizationUrl}?client_id=${provider.config.clientId}&redirect_uri=${encodeURIComponent(req.headers.referer || '')}&response_type=code&scope=openid profile email`;
        return res.redirect(authUrl);
      }
    } catch (error) {
      logError(error, 'Enterprise API - SSOAuth');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/enterprise/sso/callback/:providerId
   * Handle SSO callback
   */
  app.get('/api/enterprise/sso/callback/:providerId', async (req: Request, res: Response) => {
    try {
      const { providerId } = req.params;
      const { code, state } = req.query;

      const result = processOAuthCallback(providerId, code as string, state as string);

      // Redirect to frontend with session
      res.redirect(`/?sso_session=${result.sessionId}`);
    } catch (error) {
      logError(error, 'Enterprise API - SSOCallback');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  // ============================================
  // WHITE-LABELING ROUTES
  // ============================================

  /**
   * POST /api/enterprise/white-label/apply
   * Apply white-labeling to website
   */
  app.post('/api/enterprise/white-label/apply', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { html, config } = req.body;

      if (!html || !config) {
        return res.status(400).json({
          success: false,
          error: 'html and config are required',
        });
      }

      const whiteLabeledHtml = applyWhiteLabeling(html, config);
      const css = generateWhiteLabelCSS(config);

      res.json({
        success: true,
        html: whiteLabeledHtml,
        css,
      });
    } catch (error) {
      logError(error, 'Enterprise API - WhiteLabel');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  // ============================================
  // CUSTOM DOMAINS ROUTES
  // ============================================

  /**
   * POST /api/enterprise/domains
   * Add custom domain
   */
  app.post('/api/enterprise/domains', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { domain, websiteId, sslEnabled } = req.body;

      if (!domain || !websiteId) {
        return res.status(400).json({
          success: false,
          error: 'domain and websiteId are required',
        });
      }

      // In production, integrate with DNS provider API
      res.json({
        success: true,
        domain,
        websiteId,
        sslEnabled: sslEnabled !== false,
        status: 'pending',
        message: 'Domain configuration pending DNS verification',
      });
    } catch (error) {
      logError(error, 'Enterprise API - AddDomain');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/enterprise/domains/:websiteId
   * Get domains for website
   */
  app.get('/api/enterprise/domains/:websiteId', async (req: Request, res: Response) => {
    try {
      const { websiteId } = req.params;

      // In production, fetch from database
      res.json({
        success: true,
        domains: [],
      });
    } catch (error) {
      logError(error, 'Enterprise API - GetDomains');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  // ============================================
  // TEAM WORKSPACES ROUTES
  // ============================================

  /**
   * POST /api/enterprise/workspaces
   * Create workspace
   */
  app.post('/api/enterprise/workspaces', async (req: Request, res: Response) => {
    try {
      const { name, organizationId, ownerId } = req.body;

      if (!name || !organizationId || !ownerId) {
        return res.status(400).json({
          success: false,
          error: 'name, organizationId, and ownerId are required',
        });
      }

      const workspace = createWorkspace(name, organizationId, ownerId);

      res.json({
        success: true,
        workspace,
      });
    } catch (error) {
      logError(error, 'Enterprise API - CreateWorkspace');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/enterprise/workspaces
   * List user workspaces
   */
  app.get('/api/enterprise/workspaces', async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required',
        });
      }

      const workspaces = listUserWorkspaces(userId as string);

      res.json({
        success: true,
        workspaces,
      });
    } catch (error) {
      logError(error, 'Enterprise API - ListWorkspaces');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/enterprise/workspaces/:workspaceId/members
   * Add member to workspace
   */
  app.post('/api/enterprise/workspaces/:workspaceId/members', async (req: Request, res: Response) => {
    try {
      const { workspaceId } = req.params;
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          error: 'userId and role are required',
        });
      }

      addWorkspaceMember(workspaceId, userId, role);

      res.json({
        success: true,
        message: 'Member added',
      });
    } catch (error) {
      logError(error, 'Enterprise API - AddMember');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

