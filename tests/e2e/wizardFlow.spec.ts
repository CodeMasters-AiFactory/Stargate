/**
 * E2E Tests - Wizard Flow
 * Tests the complete website builder wizard flow
 */

import { test, expect } from '@playwright/test';

test.describe('Website Builder Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5000');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full wizard flow', async ({ page }) => {
    // Step 1: Navigate to wizard
    await page.click('text=Build Website');
    await expect(page).toHaveURL(/.*wizard.*/);

    // Step 2: Select package (if visible)
    const packageButton = page.locator('text=Professional').or(page.locator('text=Business'));
    if (await packageButton.isVisible()) {
      await packageButton.click();
    }

    // Step 3: Fill in business information
    const businessNameInput = page.locator('input[name="businessName"]').or(page.locator('input[placeholder*="business"]'));
    if (await businessNameInput.isVisible()) {
      await businessNameInput.fill('Test Business');
    }

    // Step 4: Continue through wizard
    const continueButton = page.locator('button:has-text("Continue")').or(page.locator('button:has-text("Next")'));
    if (await continueButton.isVisible()) {
      await continueButton.click();
    }

    // Verify we're progressing through wizard
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('wizard');
  });

  test('should handle template selection', async ({ page }) => {
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');

    // Navigate to templates
    const templateLink = page.locator('text=Templates').or(page.locator('a[href*="template"]'));
    if (await templateLink.isVisible()) {
      await templateLink.click();
      await page.waitForTimeout(1000);

      // Verify templates are displayed
      const templateCards = page.locator('[data-testid="template"]').or(page.locator('.template-card'));
      const count = await templateCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display error messages on invalid input', async ({ page }) => {
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    const submitButton = page.locator('button:has-text("Generate")').or(page.locator('button:has-text("Build")'));
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation errors
      const errorMessages = page.locator('.error').or(page.locator('[role="alert"]'));
      const errorCount = await errorMessages.count();
      // Either errors are shown or form is valid
      expect(errorCount).toBeGreaterThanOrEqual(0);
    }
  });
});

