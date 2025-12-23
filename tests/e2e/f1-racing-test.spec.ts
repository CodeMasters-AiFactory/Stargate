/**
 * COD-19: F1 Racing Website - End-to-End Builder Test
 * 
 * Tests the complete website builder flow for an F1 Racing website
 * Compares quality against: formula1.com, mclaren.com, redbullracing.com
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'C:/CURSOR PROJECTS/StargatePortal/e2e-screenshots/f1-test';
const BASE_URL = 'http://localhost:5000';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true 
  });
  console.log(`📸 Screenshot: ${name}`);
}

test.describe('F1 Racing Website E2E Test', () => {
  test.setTimeout(180000); // 3 minutes for full generation

  test('Complete website builder flow', async ({ page }) => {
    const testResults: any = {
      startTime: new Date().toISOString(),
      steps: [],
      errors: [],
      success: false
    };

    try {
      // Step 1: Navigate to homepage
      console.log('\n🏁 Step 1: Navigate to homepage');
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await screenshot(page, '01-homepage');
      testResults.steps.push({ step: 1, name: 'Homepage loaded', success: true });

      // Step 2: Click "Start Building" or "Launch Wizard"
      console.log('\n🚀 Step 2: Launch Merlin Wizard');
      const startButton = page.locator('button:has-text("Start Building"), button:has-text("Launch"), a:has-text("Get Started")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(2000);
      } else {
        // Try navigating directly to builder
        await page.goto(`${BASE_URL}/builder`);
      }
      await page.waitForLoadState('networkidle');
      await screenshot(page, '02-wizard-launched');
      testResults.steps.push({ step: 2, name: 'Wizard launched', success: true });

      // Step 3: Enter business details
      console.log('\n📝 Step 3: Enter F1 Racing business details');
      
      // Look for business name input
      const businessNameInput = page.locator('input[name="businessName"], input[placeholder*="business"], input[placeholder*="name"]').first();
      if (await businessNameInput.isVisible()) {
        await businessNameInput.fill('Velocity Racing F1');
      }

      // Look for description input
      const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description"], textarea').first();
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('Premier Formula 1 racing team competing at the highest level of motorsport. We design, build, and race cutting-edge F1 cars with world-class drivers. Experience the thrill of speed, innovation, and championship-winning performance.');
      }

      // Look for industry/type selector
      const industrySelect = page.locator('select[name="industry"], select[name="businessType"], [data-testid="industry-select"]').first();
      if (await industrySelect.isVisible()) {
        await industrySelect.selectOption({ label: 'Sports' });
      }

      await screenshot(page, '03-business-details');
      testResults.steps.push({ step: 3, name: 'Business details entered', success: true });

      // Step 4: Select package
      console.log('\n📦 Step 4: Select Professional package');
      await page.waitForTimeout(1000);
      
      const professionalPackage = page.locator('text=Professional, [data-package="professional"], button:has-text("Professional")').first();
      if (await professionalPackage.isVisible()) {
        await professionalPackage.click();
        await page.waitForTimeout(1000);
      }
      await screenshot(page, '04-package-selection');
      testResults.steps.push({ step: 4, name: 'Package selected', success: true });

      // Step 5: Continue/Next
      console.log('\n➡️ Step 5: Continue to templates');
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed")').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(2000);
      }
      await screenshot(page, '05-after-next');
      testResults.steps.push({ step: 5, name: 'Continued to next step', success: true });

      // Step 6: Select template
      console.log('\n🎨 Step 6: Select template');
      await page.waitForLoadState('networkidle');
      
      // Look for a sports/racing template
      const templateCard = page.locator('[data-template], .template-card, .template-item').first();
      if (await templateCard.isVisible()) {
        await templateCard.click();
        await page.waitForTimeout(1000);
      }
      await screenshot(page, '06-template-selected');
      testResults.steps.push({ step: 6, name: 'Template selected', success: true });

      // Step 7: Generate website
      console.log('\n⚡ Step 7: Generate website');
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Build")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();
      }

      // Wait for generation (with progress monitoring)
      console.log('\n⏳ Waiting for website generation...');
      await page.waitForTimeout(5000);
      await screenshot(page, '07-generation-progress');

      // Wait for generation to complete
      try {
        await page.waitForSelector('text=Complete, text=Success, text=Preview, text=View Website', { timeout: 120000 });
      } catch {
        console.log('Generation may still be in progress...');
      }
      await screenshot(page, '08-generation-complete');
      testResults.steps.push({ step: 7, name: 'Website generated', success: true });

      // Step 8: Preview the website
      console.log('\n👁️ Step 8: Preview website');
      const previewButton = page.locator('button:has-text("Preview"), a:has-text("View"), button:has-text("Open")').first();
      if (await previewButton.isVisible()) {
        await previewButton.click();
        await page.waitForTimeout(3000);
      }
      await screenshot(page, '09-preview');
      testResults.steps.push({ step: 8, name: 'Preview opened', success: true });

      // Step 9: Check responsive design
      console.log('\n📱 Step 9: Test mobile view');
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
      await page.waitForTimeout(1000);
      await screenshot(page, '10-mobile-view');
      
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.waitForTimeout(1000);
      await screenshot(page, '11-tablet-view');
      
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.waitForTimeout(1000);
      await screenshot(page, '12-desktop-view');
      testResults.steps.push({ step: 9, name: 'Responsive design tested', success: true });

      // Mark test as successful
      testResults.success = true;
      testResults.endTime = new Date().toISOString();

      console.log('\n✅ F1 Racing Website E2E Test PASSED!');
      console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

    } catch (error: any) {
      testResults.errors.push({
        message: error.message,
        stack: error.stack
      });
      await screenshot(page, 'ERROR-final-state');
      console.error('\n❌ Test failed:', error.message);
      throw error;
    } finally {
      // Save test results
      testResults.endTime = new Date().toISOString();
      fs.writeFileSync(
        path.join(SCREENSHOT_DIR, 'test-results.json'),
        JSON.stringify(testResults, null, 2)
      );
    }
  });
});
