/**
 * Test Merlin + Leonardo Integration
 * Opens a project, uses Merlin to edit, and calls Leonardo for AI images
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function screenshot(page: any, name: string) {
  if (!fs.existsSync('./e2e-screenshots')) {
    fs.mkdirSync('./e2e-screenshots', { recursive: true });
  }
  await page.screenshot({ path: `./e2e-screenshots/${name}.png` });
  console.log(`📸 ${name}.png`);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Merlin + Leonardo Test Starting...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Step 1: Go directly to stargate-websites
    console.log('1️⃣ Loading Projects page...');
    await page.goto(`${BASE_URL}/stargate-websites`, { waitUntil: 'domcontentloaded' });
    await delay(3000);

    // Close any modals by pressing Escape multiple times
    await page.keyboard.press('Escape');
    await delay(500);
    await page.keyboard.press('Escape');
    await delay(500);
    await page.click('text=Skip Tour').catch(() => {});
    await delay(1000);
    await screenshot(page, 'leo-01-projects');

    // Step 2: Click on a PROJECT CARD (not Edit button) to open it
    console.log('2️⃣ Clicking on project card to open...');

    // Find project cards by data-testid
    const projectCards = await page.locator('[data-testid^="project-card-"]').all();
    console.log(`   Found ${projectCards.length} project cards`);

    if (projectCards.length > 0) {
      await projectCards[0].click();
      console.log('   ✓ Clicked first project card');
    } else {
      // Fallback: find any card element
      const cards = await page.locator('.cursor-pointer.group').all();
      console.log(`   Fallback: Found ${cards.length} cards with .cursor-pointer.group`);
      if (cards.length > 0) {
        await cards[0].click();
      }
    }

    await delay(4000);
    await screenshot(page, 'leo-02-after-card-click');

    // Step 3: Check current URL and wait for wizard to load
    const currentUrl = page.url();
    console.log(`   URL: ${currentUrl}`);

    // Wait for wizard to show final-website stage
    await delay(3000);
    await screenshot(page, 'leo-03-wizard-loaded');

    // Step 4: Find Merlin input
    console.log('3️⃣ Looking for Merlin chat...');

    // The Merlin chat should be visible in FinalWebsiteDisplay
    // Try to find the chat input
    let merlinInput = page.locator('input[placeholder*="Merlin"]').first();
    let isVisible = await merlinInput.isVisible().catch(() => false);

    if (!isVisible) {
      merlinInput = page.locator('input[placeholder*="Ask"]').first();
      isVisible = await merlinInput.isVisible().catch(() => false);
    }

    if (!isVisible) {
      merlinInput = page.locator('input[placeholder*="change"]').first();
      isVisible = await merlinInput.isVisible().catch(() => false);
    }

    if (!isVisible) {
      // Try textarea
      merlinInput = page.locator('textarea').first();
      isVisible = await merlinInput.isVisible().catch(() => false);
    }

    console.log(`   Merlin input visible: ${isVisible}`);

    // Let's also check what inputs exist on the page
    const allInputs = await page.locator('input').all();
    const allTextareas = await page.locator('textarea').all();
    console.log(`   Found ${allInputs.length} inputs and ${allTextareas.length} textareas`);

    for (let i = 0; i < Math.min(allInputs.length, 3); i++) {
      const placeholder = await allInputs[i].getAttribute('placeholder').catch(() => 'N/A');
      const type = await allInputs[i].getAttribute('type').catch(() => 'N/A');
      console.log(`   Input ${i}: type="${type}", placeholder="${placeholder}"`);
    }

    await screenshot(page, 'leo-04-looking-for-merlin');

    if (isVisible) {
      console.log('✅ Merlin chat found!');

      // Step 5: Test text replacement
      console.log('4️⃣ Testing text replacement...');
      await merlinInput.click();
      await merlinInput.fill('change the name VILLA to STARGATE VILLAS');
      await screenshot(page, 'leo-05-merlin-typed');

      // Find and click send button
      const sendBtn = page.locator('button[type="submit"], button svg[class*="send"], button:has(svg)').last();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }
      await delay(4000);
      await screenshot(page, 'leo-06-merlin-response');

      // Step 6: Request Leonardo to generate an image
      console.log('5️⃣ Requesting Leonardo AI image...');
      await merlinInput.click();
      await merlinInput.fill('Generate a beautiful luxury villa hero image using Leonardo AI');
      await screenshot(page, 'leo-07-leonardo-request');

      await page.keyboard.press('Enter');
      await delay(10000); // Wait for image generation
      await screenshot(page, 'leo-08-leonardo-response');

      // Step 7: Another edit request
      console.log('6️⃣ Making another edit...');
      await merlinInput.click();
      await merlinInput.fill('change the phone number to 555-STARGATE');
      await page.keyboard.press('Enter');
      await delay(3000);
      await screenshot(page, 'leo-09-phone-change');

    } else {
      console.log('⚠️ Merlin input not visible - checking page content');
      await screenshot(page, 'leo-ERROR-no-merlin');

      // Check if we're on the wizard
      const wizardText = await page.locator('text=Choose Your Package').isVisible().catch(() => false);
      const finalWebsite = await page.locator('text=Website Preview').isVisible().catch(() => false);
      console.log(`   On package selection: ${wizardText}`);
      console.log(`   On final website: ${finalWebsite}`);
    }

    // Step 8: Take final screenshots
    console.log('7️⃣ Capturing final state...');
    await screenshot(page, 'leo-10-final');

    console.log('\n✅ TEST COMPLETED!');
    console.log('📁 Screenshots saved to ./e2e-screenshots/');
    console.log('⏳ Keeping browser open for 60 seconds for inspection...');
    await delay(60000);

  } catch (error) {
    console.error('❌ Error:', error);
    await screenshot(page, 'leo-ERROR');
  } finally {
    await browser.close();
  }
}

main();
