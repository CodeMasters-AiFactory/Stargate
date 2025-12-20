/**
 * Test Utilities and Helpers
 * Shared utilities for testing
 */

import type { Express } from 'express';
import type { Server } from 'http';

/**
 * Test server instance
 */
let testServer: Server | null = null;
let testApp: Express | null = null;

/**
 * Start test server
 */
export async function startTestServer(): Promise<{ app: Express; server: Server }> {
  if (testServer && testApp) {
    return { app: testApp, server: testServer };
  }

  const express = await import('express');
  const { createServer } = await import('http');
  const { registerRoutes } = await import('../../server/routes');

  const app = express.default();
  const server = await registerRoutes(app);

  testApp = app;
  testServer = server;

  return { app, server };
}

/**
 * Stop test server
 */
export async function stopTestServer(): Promise<void> {
  if (testServer) {
    return new Promise((resolve) => {
      testServer!.close(() => {
        testServer = null;
        testApp = null;
        resolve();
      });
    });
  }
}

/**
 * Create test user session
 */
export function createTestSession(): { sessionId: string; userId: string } {
  return {
    sessionId: `test-session-${Date.now()}`,
    userId: `test-user-${Date.now()}`,
  };
}

/**
 * Mock API response
 */
export function mockApiResponse<T>(data: T, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

/**
 * Wait for async operation
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test data builders
 */
export const testData = {
  clientInfo: () => ({
    businessName: 'Test Business',
    industry: 'Technology',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
    },
    services: ['Web Development', 'Consulting'],
    targetAudience: 'Small businesses',
    stylePreferences: ['Modern', 'Professional'],
  }),

  template: () => ({
    id: 'test-template-1',
    name: 'Test Template',
    category: 'Business',
    isDesignQuality: true,
    isContentQuality: false,
  }),

  websiteRequirements: () => ({
    businessName: 'Test Business',
    industry: 'Technology',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
    },
    services: ['Web Development'],
    pages: ['Home', 'About', 'Services', 'Contact'],
  }),
};

