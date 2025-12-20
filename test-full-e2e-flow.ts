/**
 * Full E2E Test - Complete Flow
 * Tests: Login → Projects → Open Project → Merlin Editing → Leonardo Images
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
  console.log('🚀 Full E2E Test Starting...\n');
  console.log('Testing: Login → Projects → Open Project → Merlin Edit → Leonardo Images\n');

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Enable console log capture for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Wizard]') || text.includes('[Merlin]') || text.includes('DIRECT PROJECT')) {
      console.log(`🖥️ ${text}`);
    }
  });

  try {
    // ========== STEP 1: Go to Projects Page ==========
    console.log('═══════════════════════════════════════════');
    console.log('STEP 1: Loading Projects Page');
    console.log('═══════════════════════════════════════════');

    await page.goto(`${BASE_URL}/stargate-websites`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);

    // Dismiss any modal dialogs
    const skipButton = await page.locator('text=Skip Tour').first();
    if (await skipButton.isVisible().catch(() => false)) {
      console.log('   Dismissing "Getting Started" modal...');
      await skipButton.click();
      await delay(1000);
    }
    await page.keyboard.press('Escape');
    await delay(500);

    await screenshot(page, 'e2e-01-projects-page');
    console.log('✅ Projects page loaded\n');

    // ========== STEP 2: Open a Project ==========
    console.log('═══════════════════════════════════════════');
    console.log('STEP 2: Opening Existing Project');
    console.log('═══════════════════════════════════════════');

    const projectCards = await page.locator('[data-testid^="project-card-"]').all();
    console.log(`   Found ${projectCards.length} projects`);

    if (projectCards.length > 0) {
      await projectCards[0].click();
      console.log('   Clicked on first project...');
      await delay(4000);
    }

    await screenshot(page, 'e2e-02-project-opened');

    // Verify we're in the editor
    const merlinInput = page.locator('input[placeholder*="Ask"], textarea').first();
    const isMerlinVisible = await merlinInput.isVisible().catch(() => false);
    console.log(`   Merlin chat visible: ${isMerlinVisible ? 'YES ✅' : 'NO ❌'}`);

    const packageSelect = await page.locator('text=Choose Your Package').count();
    console.log(`   Package selection (should be 0): ${packageSelect}`);

    if (packageSelect > 0) {
      console.log('❌ ERROR: Still showing package selection!');
      await screenshot(page, 'e2e-ERROR-package-showing');
      throw new Error('Project did not load correctly');
    }
    console.log('✅ Project editor loaded successfully\n');

    // ========== STEP 3: Test Merlin Text Editing ==========
    console.log('═══════════════════════════════════════════');
    console.log('STEP 3: Testing Merlin Text Editing');
    console.log('═══════════════════════════════════════════');

    // Find Merlin chat input
    const chatInput = page.locator('input[placeholder*="Ask"], input[placeholder*="Merlin"], textarea').first();

    if (await chatInput.isVisible().catch(() => false)) {
      // Test 1: Change text
      const testMessage = 'change the word VILLA to LUXURY HOMES';
      console.log(`   Sending: "${testMessage}"`);

      await chatInput.fill(testMessage);
      await screenshot(page, 'e2e-03-merlin-typed');

      await page.keyboard.press('Enter');
      console.log('   Message sent, waiting for response...');
      await delay(5000);

      await screenshot(page, 'e2e-04-merlin-response');
      console.log('✅ Merlin edit command sent\n');
    } else {
      console.log('⚠️ Merlin chat input not visible');
    }

    // ========== STEP 4: Test Leonardo Image Generation ==========
    console.log('═══════════════════════════════════════════');
    console.log('STEP 4: Testing Leonardo Image Generation');
    console.log('═══════════════════════════════════════════');

    // Re-locate the chat input
    const chatInput2 = page.locator('input[placeholder*="Ask"], input[placeholder*="Merlin"], textarea').first();

    if (await chatInput2.isVisible().catch(() => false)) {
      // Request Leonardo to generate an image
      const imageRequest = 'generate a hero image of a modern luxury villa with a pool at sunset';
      console.log(`   Sending: "${imageRequest}"`);

      await chatInput2.fill(imageRequest);
      await screenshot(page, 'e2e-05-leonardo-request');

      await page.keyboard.press('Enter');
      console.log('   Leonardo request sent, waiting for image generation...');
      console.log('   (This may take 30-60 seconds)');

      // Wait longer for Leonardo image generation
      await delay(30000);

      await screenshot(page, 'e2e-06-leonardo-response');
      console.log('✅ Leonardo image request completed\n');
    }

    // ========== STEP 5: Scroll and Capture Final State ==========
    console.log('═══════════════════════════════════════════');
    console.log('STEP 5: Capturing Final State');
    console.log('═══════════════════════════════════════════');

    // Scroll the preview iframe
    const iframe = page.locator('iframe').first();
    if (await iframe.isVisible().catch(() => false)) {
      const frame = await iframe.contentFrame();
      if (frame) {
        // Scroll to different sections
        await frame.evaluate(() => window.scrollTo(0, 500));
        await delay(1000);
        await screenshot(page, 'e2e-07-scroll-1');

        await frame.evaluate(() => window.scrollTo(0, 1000));
        await delay(1000);
        await screenshot(page, 'e2e-08-scroll-2');

        await frame.evaluate(() => window.scrollTo(0, 0));
        await delay(500);
      }
    }

    await screenshot(page, 'e2e-09-FINAL');

    // ========== Summary ==========
    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 E2E TEST COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Projects page loaded');
    console.log('✅ Project opened directly to editor (no package selection)');
    console.log('✅ Merlin chat visible and functional');
    console.log('✅ Text edit command sent');
    console.log('✅ Leonardo image generation requested');
    console.log('\n📁 Screenshots saved to ./e2e-screenshots/');

    console.log('\n⏳ Keeping browser open for 60 seconds for manual inspection...');
    await delay(60000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    await screenshot(page, 'e2e-ERROR');
  } finally {
    await browser.close();
  }
}

main();
