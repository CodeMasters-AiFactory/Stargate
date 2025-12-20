/**
 * Test Project Opening - Debug version
 * Tests if clicking a project card properly loads the project editor
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function screenshot(page: any, name: string) {
  if (!fs.existsSync('./e2e-screenshots')) {
    fs.mkdirSync('./e2e-screenshots', { recursive: true });
  }
  await page.screenshot({ path: `./e2e-screenshots/${name}.png`, fullPage: true });
  console.log(`📸 ${name}.png`);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔬 Testing Project Open Functionality...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Enable console log capture
  page.on('console', msg => {
    if (msg.text().includes('[StargateWebsitesScreen]') || msg.text().includes('[Wizard]')) {
      console.log(`🖥️ BROWSER: ${msg.text()}`);
    }
  });

  try {
    // Step 1: Go directly to stargate-websites (we're already logged in from previous tests)
    console.log('1️⃣ Loading Projects page...');
    await page.goto(`${BASE_URL}/stargate-websites`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);

    // Close any modal dialogs (Getting Started Guide, etc)
    console.log('   Checking for modal dialogs...');
    const skipButton = await page.locator('text=Skip Tour').first();
    if (await skipButton.isVisible().catch(() => false)) {
      console.log('   Found "Skip Tour" - clicking to dismiss modal');
      await skipButton.click();
      await delay(1000);
    }

    // Also try clicking outside the modal or pressing Escape
    const closeButton = await page.locator('[aria-label="Close"], button:has-text("×"), button:has-text("Close")').first();
    if (await closeButton.isVisible().catch(() => false)) {
      console.log('   Found close button - clicking');
      await closeButton.click();
      await delay(500);
    }

    await page.keyboard.press('Escape');
    await delay(500);

    // Check localStorage before clicking
    const stateBefore = await page.evaluate(() => localStorage.getItem('stargate-wizard-state'));
    console.log('   localStorage BEFORE click:', stateBefore ? 'has state' : 'empty');
    if (stateBefore) {
      const parsed = JSON.parse(stateBefore);
      console.log('   Stage before:', parsed.stage);
    }

    await screenshot(page, 'open-01-projects-list');

    // Step 2: Find and click a project card
    console.log('2️⃣ Looking for project cards...');
    const projectCards = await page.locator('[data-testid^="project-card-"]').all();
    console.log(`   Found ${projectCards.length} project cards with data-testid`);

    if (projectCards.length === 0) {
      // Try alternative selectors
      const cardsByClass = await page.locator('.cursor-pointer.group').all();
      console.log(`   Found ${cardsByClass.length} cards by class`);
    }

    if (projectCards.length > 0) {
      // Get the project ID
      const testId = await projectCards[0].getAttribute('data-testid');
      console.log(`   Clicking card: ${testId}`);

      await projectCards[0].click();
      console.log('   ✓ Card clicked!');

      // Wait a moment for the async handler
      await delay(3000);

      // Check localStorage AFTER click
      const stateAfter = await page.evaluate(() => localStorage.getItem('stargate-wizard-state'));
      console.log('   localStorage AFTER click:', stateAfter ? 'has state' : 'empty');
      if (stateAfter) {
        const parsed = JSON.parse(stateAfter);
        console.log('   Stage after:', parsed.stage);
        console.log('   ProjectId:', parsed.projectId);
        console.log('   Has mergedTemplate:', !!parsed.mergedTemplate);
        if (parsed.mergedTemplate) {
          console.log('   HTML length:', parsed.mergedTemplate.html?.length || 0);
        }
      }

      await screenshot(page, 'open-02-after-click');

      // Check what page we're on
      const pageTitle = await page.locator('h1, h2').first().textContent().catch(() => 'N/A');
      console.log('   Page title:', pageTitle);

      // Check for Merlin input
      const merlinInputs = await page.locator('input[placeholder*="Merlin"], input[placeholder*="Ask"], textarea[placeholder*="change"]').all();
      console.log(`   Merlin inputs found: ${merlinInputs.length}`);

      // Check for package selection (indicates we're on wrong page)
      const packageSelect = await page.locator('text=Choose Your Package').count();
      console.log(`   Package selection visible: ${packageSelect > 0 ? 'YES (WRONG!)' : 'No (good)'}`);

      // Check for website preview iframe
      const iframes = await page.locator('iframe').all();
      console.log(`   Iframes found: ${iframes.length}`);

      await delay(2000);
      await screenshot(page, 'open-03-final-state');
    }

    console.log('\n✅ Debug test completed!');
    console.log('⏳ Keeping browser open for 30 seconds...');
    await delay(30000);

  } catch (error) {
    console.error('❌ Error:', error);
    await screenshot(page, 'open-ERROR');
  } finally {
    await browser.close();
  }
}

main();
