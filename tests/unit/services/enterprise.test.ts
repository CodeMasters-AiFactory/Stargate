/**
 * Unit Tests - Enterprise Features
 */

import { describe, it, expect } from 'vitest';
import {
  registerSSOProvider,
  getSSOProvider,
  listSSOProviders,
  generateSAMLRequest,
  processOAuthCallback,
  validateSSOSession,
} from '../../../server/services/enterprise/SSO';
import {
  applyWhiteLabeling,
  generateWhiteLabelCSS,
} from '../../../server/services/enterprise/whiteLabel';
import {
  createWorkspace,
  getWorkspace,
  addWorkspaceMember,
  listUserWorkspaces,
} from '../../../server/services/enterprise/teamWorkspaces';

describe('Enterprise Features', () => {
  describe('SSO Service', () => {
    it('should register SSO provider', () => {
      const provider = {
        id: 'test-saml',
        name: 'Test SAML',
        type: 'saml' as const,
        enabled: true,
        config: {
          entityId: 'test-entity',
          ssoUrl: 'https://sso.example.com',
        },
      };

      registerSSOProvider(provider);
      const retrieved = getSSOProvider('test-saml');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-saml');
      expect(retrieved?.name).toBe('Test SAML');
    });

    it('should list all SSO providers', () => {
      const providers = listSSOProviders();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should generate SAML request', () => {
      const provider = {
        id: 'test-saml',
        name: 'Test SAML',
        type: 'saml' as const,
        enabled: true,
        config: {
          ssoUrl: 'https://sso.example.com',
        },
      };

      registerSSOProvider(provider);
      const { samlRequest, redirectUrl } = generateSAMLRequest('test-saml');

      expect(samlRequest).toBeDefined();
      expect(redirectUrl).toContain('https://sso.example.com');
    });

    it('should process OAuth callback', () => {
      const provider = {
        id: 'test-oauth',
        name: 'Test OAuth',
        type: 'oauth' as const,
        enabled: true,
        config: {
          clientId: 'test-client',
          clientSecret: 'test-secret',
        },
      };

      registerSSOProvider(provider);
      const result = processOAuthCallback('test-oauth', 'auth-code');

      expect(result).toBeDefined();
      expect(result.userId).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.attributes).toBeDefined();
    });

    it('should validate SSO session', () => {
      const provider = {
        id: 'test-oauth',
        name: 'Test OAuth',
        type: 'oauth' as const,
        enabled: true,
        config: {},
      };

      registerSSOProvider(provider);
      const { sessionId } = processOAuthCallback('test-oauth', 'code');
      const session = validateSSOSession(sessionId);

      expect(session).toBeDefined();
      expect(session?.sessionId).toBe(sessionId);
    });
  });

  describe('White-Labeling Service', () => {
    const sampleHTML = `
      <html>
      <head>
        <title>Test</title>
      </head>
      <body>
        <img src="old-logo.png" alt="Logo" />
        <p>Powered by Stargate</p>
      </body>
      </html>
    `;

    const config = {
      organizationId: 'org-1',
      brandName: 'Custom Brand',
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
      removePoweredBy: true,
    };

    it('should apply white-labeling to HTML', () => {
      const result = applyWhiteLabeling(sampleHTML, config);

      expect(result).toContain('Custom Brand');
      expect(result).toContain('https://example.com/logo.png');
      expect(result).not.toContain('Powered by Stargate');
    });

    it('should generate white-label CSS', () => {
      const css = generateWhiteLabelCSS(config);

      expect(css).toContain('#FF0000');
      expect(css).toContain('#00FF00');
      expect(css).toContain('https://example.com/logo.png');
    });
  });

  describe('Team Workspaces Service', () => {
    it('should create workspace', () => {
      const workspace = createWorkspace('Test Workspace', 'org-1', 'user-1');

      expect(workspace).toBeDefined();
      expect(workspace.name).toBe('Test Workspace');
      expect(workspace.organizationId).toBe('org-1');
      expect(workspace.ownerId).toBe('user-1');
      expect(workspace.members.length).toBe(1);
      expect(workspace.members[0].role).toBe('owner');
    });

    it('should get workspace', () => {
      const workspace = createWorkspace('Test Workspace', 'org-1', 'user-1');
      const retrieved = getWorkspace(workspace.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(workspace.id);
    });

    it('should add member to workspace', () => {
      const workspace = createWorkspace('Test Workspace', 'org-1', 'user-1');
      addWorkspaceMember(workspace.id, 'user-2', 'editor');

      const updated = getWorkspace(workspace.id);
      expect(updated?.members.length).toBe(2);
      expect(updated?.members.find(m => m.userId === 'user-2')?.role).toBe('editor');
    });

    it('should list user workspaces', () => {
      const workspace1 = createWorkspace('Workspace 1', 'org-1', 'user-1');
      const workspace2 = createWorkspace('Workspace 2', 'org-1', 'user-2');
      addWorkspaceMember(workspace2.id, 'user-1', 'editor');

      const userWorkspaces = listUserWorkspaces('user-1');
      expect(userWorkspaces.length).toBe(2);
    });
  });
});

