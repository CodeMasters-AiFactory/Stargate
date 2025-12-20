/**
 * Quick E2E Test - Simplified version
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
  console.log('🚀 Quick E2E Test Starting...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Step 1: Homepage
    console.log('1️⃣ Loading homepage...');
    await page.goto(BASE_URL, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await delay(2000);
    await screenshot(page, '01-homepage');

    // Step 2: Click Sign In
    console.log('2️⃣ Clicking Sign In...');
    await page.click('text=Sign In', { timeout: 5000 }).catch(() => {});
    await delay(1000);
    await screenshot(page, '02-signin-modal');

    // Step 3: Fill credentials
    console.log('3️⃣ Filling credentials...');
    await page.fill('input[type="email"]', 'admin@stargate.com').catch(() => {});
    await page.fill('input[type="password"]', 'admin123').catch(() => {});
    await screenshot(page, '03-credentials-filled');

    // Step 4: Submit login
    console.log('4️⃣ Submitting login...');
    await page.click('button[type="submit"]').catch(() => {});
    await delay(3000);
    await screenshot(page, '04-after-login');

    // Step 5: Go to Stargate Websites
    console.log('5️⃣ Going to Stargate Websites...');
    await page.goto(`${BASE_URL}/stargate-websites`, { waitUntil: 'domcontentloaded' });
    await delay(3000);
    await screenshot(page, '05-stargate-websites');

    // Step 6: Click New Website / Merlin
    console.log('6️⃣ Starting new website...');
    await page.click('text=New Website').catch(() =>
      page.click('text=Create').catch(() =>
        page.click('text=Start').catch(() => {})
      )
    );
    await delay(2000);
    await screenshot(page, '06-wizard-start');

    // Step 7: Select a package
    console.log('7️⃣ Selecting package...');
    await page.click('text=Professional').catch(() =>
      page.click('text=Premium').catch(() =>
        page.click('[data-package]').catch(() => {})
      )
    );
    await delay(1000);
    await page.click('text=Continue').catch(() =>
      page.click('text=Next').catch(() => {})
    );
    await delay(3000);
    await screenshot(page, '07-after-package');

    // Step 8: Wait for templates
    console.log('8️⃣ Waiting for templates...');
    await delay(3000);
    await screenshot(page, '08-templates-view');

    // Step 9: Click first template
    console.log('9️⃣ Selecting template...');
    const templateCards = await page.locator('.cursor-pointer').all();
    console.log(`   Found ${templateCards.length} clickable items`);
    if (templateCards.length > 0) {
      await templateCards[0].click();
      await delay(1000);
    }
    await screenshot(page, '09-template-selected');

    // Step 10: Click Continue
    console.log('🔟 Clicking Continue...');
    await page.click('text=Continue').catch(() =>
      page.click('text=Select').catch(() =>
        page.click('text=Next').catch(() => {})
      )
    );
    await delay(5000);
    await screenshot(page, '10-after-continue');

    // Check current URL
    const url = page.url();
    console.log(`\n📍 Current URL: ${url}`);

    // Step 11: If on projects page, look for project
    if (url.includes('stargate-websites')) {
      console.log('✅ On Projects page!');
      await delay(2000);
      await screenshot(page, '11-projects-page');

      // Try to open the project
      console.log('1️⃣1️⃣ Looking for project to open...');
      await page.click('text=Open').catch(() =>
        page.click('text=Edit').catch(() => {})
      );
      await delay(3000);
      await screenshot(page, '12-project-opened');
    }

    // Step 12: Test Merlin
    console.log('1️⃣2️⃣ Testing Merlin...');
    const merlinInput = page.locator('input[placeholder*="Merlin"], textarea, input[placeholder*="Ask"]').first();
    if (await merlinInput.isVisible().catch(() => false)) {
      await merlinInput.fill('change the email to test@example.com');
      await screenshot(page, '13-merlin-typed');
      await page.keyboard.press('Enter');
      await delay(3000);
      await screenshot(page, '14-merlin-response');
    }

    // Final state
    await screenshot(page, '15-FINAL');

    console.log('\n✅ TEST COMPLETED!');
    console.log('⏳ Keeping browser open for 60 seconds...');
    await delay(60000);

  } catch (error) {
    console.error('❌ Error:', error);
    await screenshot(page, 'ERROR');
  } finally {
    await browser.close();
  }
}

main();
