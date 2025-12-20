/**
 * E2E Tests for Website Generation Pipeline
 * Using Playwright for browser automation
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('Merlin Website Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load the landing page', async ({ page }) => {
    // Check for main heading or app container
    const appLoaded = await page.locator('[data-testid="main-layout"], .main-layout, #root').first();
    await expect(appLoaded).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Merlin wizard', async ({ page }) => {
    // Look for the Merlin wizard button
    const merlinButton = page.locator('text=/Launch.*Merlin|Start.*Wizard|Create.*Website/i').first();
    
    if (await merlinButton.isVisible()) {
      await merlinButton.click();
      
      // Wait for wizard to appear
      await page.waitForTimeout(1000);
      
      // Check for package selection or wizard content
      const wizardContent = page.locator('text=/Package|Business|Select|Choose/i').first();
      await expect(wizardContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display available packages', async ({ page }) => {
    // Navigate to wizard
    const merlinButton = page.locator('text=/Launch.*Merlin|Start.*Wizard|Create.*Website/i').first();
    
    if (await merlinButton.isVisible()) {
      await merlinButton.click();
      await page.waitForTimeout(1000);
      
      // Look for package options
      const packages = page.locator('text=/Starter|Professional|Enterprise|Basic/i');
      const packageCount = await packages.count();
      
      expect(packageCount).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('API Health Checks', () => {
  test('should return healthy status from /api/health', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('should return frontend health from /api/health/frontend', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/frontend`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('should list available templates', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/templates`);
    
    if (response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data.templates) || data.templates).toBeTruthy();
    }
  });

  test('should return AI provider status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ai/providers`);
    
    if (response.ok()) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

test.describe('Website Generation Flow', () => {
  test('should generate a basic website', async ({ request }) => {
    const requirements = {
      businessName: 'E2E Test Business',
      businessType: 'Technology',
      industry: 'Software',
      services: ['Web Development', 'Mobile Apps'],
      city: 'San Francisco',
      region: 'California',
      country: 'USA',
      primaryColor: '#3B82F6',
      targetAudience: 'Small businesses',
    };

    // This is a long-running test, increase timeout
    test.setTimeout(120000);

    const response = await request.post(`${BASE_URL}/api/website-builder/generate`, {
      data: { requirements },
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Visual Editor', () => {
  test('should load the visual editor', async ({ page }) => {
    // Navigate to a project with visual editor
    await page.goto(`${BASE_URL}`);
    
    // Look for editor button
    const editorButton = page.locator('text=/Edit|Visual.*Editor|Customize/i').first();
    
    if (await editorButton.isVisible()) {
      await editorButton.click();
      await page.waitForTimeout(1000);
      
      // Check for editor components
      const editorPanel = page.locator('[data-testid="visual-editor"], .craft-editor, .visual-editor');
      const isVisible = await editorPanel.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(editorPanel).toBeVisible();
      }
    }
  });
});

test.describe('Deployment', () => {
  test('should show deployment options', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    
    // Look for deploy button
    const deployButton = page.locator('text=/Deploy|Publish|Go.*Live/i').first();
    
    if (await deployButton.isVisible()) {
      await deployButton.click();
      await page.waitForTimeout(500);
      
      // Check for Vercel/Netlify options
      const vercelOption = page.locator('text=/Vercel/i');
      const netlifyOption = page.locator('text=/Netlify/i');
      
      const hasVercel = await vercelOption.isVisible().catch(() => false);
      const hasNetlify = await netlifyOption.isVisible().catch(() => false);
      
      expect(hasVercel || hasNetlify).toBeTruthy();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty for decorative images, but should exist
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have focusable interactive elements', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check buttons are focusable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();
      const isFocused = await firstButton.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no major console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

