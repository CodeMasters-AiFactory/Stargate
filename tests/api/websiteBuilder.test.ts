/**
 * API Tests - Website Builder Endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestServer, stopTestServer, testData } from '../utils/testHelpers';

describe('Website Builder API', () => {
  let baseUrl: string;

  beforeAll(async () => {
    const { server } = await startTestServer();
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://localhost:${address.port}`;
    } else {
      baseUrl = 'http://localhost:5000';
    }
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
  });

  describe('GET /api/templates', () => {
    it('should return templates list', async () => {
      const response = await fetch(`${baseUrl}/api/templates`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.templates || data)).toBe(true);
    });

    it('should filter templates by category', async () => {
      const response = await fetch(`${baseUrl}/api/templates?category=Business`);
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data.templates || data)).toBe(true);
    });
  });

  describe('POST /api/website-builder/generate', () => {
    it('should accept valid generation request', async () => {
      const requirements = testData.websiteRequirements();
      const response = await fetch(`${baseUrl}/api/website-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements }),
      });

      // Should accept request (may timeout, but should not error immediately)
      expect([200, 201, 202]).toContain(response.status);
    }, 30000); // 30 second timeout

    it('should validate required fields', async () => {
      const response = await fetch(`${baseUrl}/api/website-builder/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      // Should return validation error
      expect([400, 422]).toContain(response.status);
    });
  });

  describe('POST /api/merge', () => {
    it('should merge design and content templates', async () => {
      const response = await fetch(`${baseUrl}/api/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designTemplateId: 'test-design',
          contentTemplateId: 'test-content',
          clientInfo: testData.clientInfo(),
        }),
      });

      // Should accept merge request
      expect([200, 201, 202]).toContain(response.status);
    });
  });
});

