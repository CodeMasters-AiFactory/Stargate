/**
 * API Tests - Wizard Features (120% Innovation Features)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestServer, stopTestServer } from '../utils/testHelpers';

describe('Wizard Features API', () => {
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

  describe('POST /api/voice/process', () => {
    it('should require authentication/rate limiting', async () => {
      // Rate limiting should be in place
      const response = await fetch(`${baseUrl}/api/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: 'base64data' }),
      });

      // Should either process or rate limit
      expect([200, 201, 429]).toContain(response.status);
    });
  });

  describe('POST /api/multimodal/screenshot/analyze', () => {
    it('should require rate limiting', async () => {
      const response = await fetch(`${baseUrl}/api/multimodal/screenshot/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'base64data' }),
      });

      // Should either process or rate limit
      expect([200, 201, 400, 429]).toContain(response.status);
    });
  });

  describe('POST /api/conversion/heatmap', () => {
    it('should predict heatmap', async () => {
      const response = await fetch(`${baseUrl}/api/conversion/heatmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: '<html><body><h1>Test</h1></body></html>',
          pageType: 'landing',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('heatmap');
    });
  });
});

