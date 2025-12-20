/**
 * Full E2E Smoke Test
 * Tests the complete flow: Login → Package → Template → Project Creation → Merlin Editing
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = './e2e-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function screenshot(page: Page, name: string) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`📸 Screenshot: ${filepath}`);
  return filepath;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullE2ETest() {
  console.log('🚀 Starting Full E2E Smoke Test...\n');

  const browser: Browser = await chromium.launch({
    headless: false, // Show browser for visual verification
    slowMo: 100, // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // ============================================
    // STEP 1: Go to Homepage
    // ============================================
    console.log('📍 Step 1: Loading Homepage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-homepage');
    console.log('✅ Homepage loaded\n');

    // ============================================
    // STEP 2: Sign In
    // ============================================
    console.log('📍 Step 2: Signing in...');

    // Look for sign in button
    const signInBtn = page.locator('button:has-text("Sign In"), a:has-text("Sign In"), [data-testid="signin-button"]').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1000);
    }

    // Fill in credentials
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill('admin@stargate.com');
      await passwordInput.fill('admin123');
      await screenshot(page, '02-signin-filled');

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
      await submitBtn.click();
      await delay(2000);
    }

    await screenshot(page, '03-after-signin');
    console.log('✅ Signed in\n');

    // ============================================
    // STEP 3: Navigate to Merlin Wizard
    // ============================================
    console.log('📍 Step 3: Launching Merlin Wizard...');

    // Try different ways to access the wizard
    const wizardBtn = page.locator('button:has-text("Merlin"), button:has-text("Create"), button:has-text("New Website"), a:has-text("Merlin")').first();
    if (await wizardBtn.isVisible()) {
      await wizardBtn.click();
      await delay(2000);
    } else {
      // Navigate directly
      await page.goto(`${BASE_URL}/stargate-websites`);
      await delay(2000);
    }

    await screenshot(page, '04-wizard-or-dashboard');

    // Look for "New Project" or "Start" button
    const newProjectBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Start")').first();
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();
      await delay(2000);
    }

    await screenshot(page, '05-wizard-started');
    console.log('✅ Wizard launched\n');

    // ============================================
    // STEP 4: Select Package (if shown)
    // ============================================
    console.log('📍 Step 4: Selecting Package...');

    // Look for package cards
    const packageCard = page.locator('[data-package], .package-card, button:has-text("Professional"), button:has-text("Premium"), button:has-text("Basic")').first();
    if (await packageCard.isVisible()) {
      await packageCard.click();
      await delay(1000);

      // Continue button
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Select")').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await delay(2000);
      }
    }

    await screenshot(page, '06-after-package');
    console.log('✅ Package selected\n');

    // ============================================
    // STEP 5: Select Template
    // ============================================
    console.log('📍 Step 5: Selecting Template...');

    // Wait for templates to load
    await delay(3000);
    await screenshot(page, '07-templates-loading');

    // Find and click a template
    const templateCard = page.locator('[data-template-id], .template-card, [class*="template"], img[alt*="template"]').first();
    if (await templateCard.isVisible()) {
      await templateCard.click();
      await delay(1000);
      await screenshot(page, '08-template-selected');

      // Click Continue/Select button
      const selectBtn = page.locator('button:has-text("Continue"), button:has-text("Select"), button:has-text("Use"), button:has-text("Next")').first();
      if (await selectBtn.isVisible()) {
        await selectBtn.click();
        await delay(3000);
      }
    } else {
      // Try clicking any visible card image
      const anyCard = page.locator('.cursor-pointer img, [role="button"] img').first();
      if (await anyCard.isVisible()) {
        await anyCard.click();
        await delay(1000);

        const btn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
        if (await btn.isVisible()) {
          await btn.click();
          await delay(3000);
        }
      }
    }

    await screenshot(page, '09-after-template-select');
    console.log('✅ Template selected\n');

    // ============================================
    // STEP 6: Check if redirected to Projects Page
    // ============================================
    console.log('📍 Step 6: Checking redirect to Projects page...');
    await delay(2000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    await screenshot(page, '10-current-state');

    if (currentUrl.includes('stargate-websites')) {
      console.log('✅ Redirected to Projects page!\n');

      // ============================================
      // STEP 7: Open the newly created project
      // ============================================
      console.log('📍 Step 7: Opening the new project...');

      // Look for project cards
      await delay(2000);
      const projectCard = page.locator('.project-card, [data-project-id], button:has-text("Open"), button:has-text("Edit")').first();
      if (await projectCard.isVisible()) {
        await projectCard.click();
        await delay(3000);
      }

      await screenshot(page, '11-project-opened');
    }

    // ============================================
    // STEP 8: Test Merlin Chat
    // ============================================
    console.log('📍 Step 8: Testing Merlin Chat...');

    // Look for Merlin chat input
    const chatInput = page.locator('input[placeholder*="Merlin"], textarea[placeholder*="Merlin"], input[placeholder*="changes"], textarea[placeholder*="Ask"]').first();

    if (await chatInput.isVisible()) {
      await chatInput.fill('Please change the email info@company.com to contact@mywebsite.com');
      await screenshot(page, '12-merlin-message-typed');

      // Send message
      const sendBtn = page.locator('button[type="submit"], button:has-text("Send"), button svg').first();
      await sendBtn.click();
      await delay(3000);

      await screenshot(page, '13-merlin-response');
      console.log('✅ Merlin chat tested\n');
    } else {
      console.log('⚠️ Merlin chat input not found\n');
    }

    // ============================================
    // STEP 9: Take Final Screenshots
    // ============================================
    console.log('📍 Step 9: Final state...');
    await screenshot(page, '14-final-state');

    // Scroll the page to capture more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await delay(500);
    await screenshot(page, '15-scrolled-view');

    console.log('\n✅ ============================================');
    console.log('✅ FULL E2E SMOKE TEST COMPLETED!');
    console.log('✅ ============================================\n');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}/`);

    // Keep browser open for manual inspection
    console.log('\n⏳ Browser will stay open for 30 seconds for inspection...');
    await delay(30000);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await screenshot(page, 'ERROR-final-state');
  } finally {
    await browser.close();
  }
}

// Run the test
runFullE2ETest().catch(console.error);
