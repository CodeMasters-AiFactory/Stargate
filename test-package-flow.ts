/**
 * Quick test to verify Package Selection flow
 * Services Dashboard → Merlin Websites → Package Selection Page
 */

import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPackageFlow() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTING: Services → Merlin Websites → Package Selection');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Go to homepage
    console.log('📍 Step 1: Loading homepage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await delay(1000);
    console.log('   ✅ Homepage loaded');

    // Step 2: Sign in first
    console.log('\n📍 Step 2: Signing in...');
    const signInBtn = page.locator('button:has-text("Sign In")').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1500);

      // Fill credentials in the modal
      const emailInput = page.locator('input[type="email"], input[id*="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@stargate.dev');
        await delay(300);
        await passwordInput.fill('admin123');
        await delay(300);

        // Click submit button inside the modal dialog
        const submitBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Sign In")').last();
        await submitBtn.click({ force: true });
        await delay(2000);
        console.log('   ✅ Signed in');
      }
    }

    // Step 3: Navigate to Services Dashboard
    console.log('\n📍 Step 3: Going to Services Dashboard...');
    await page.goto(`${BASE_URL}?view=services`);
    await delay(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-flow-01-services.png' });
    console.log('   📸 Screenshot: test-flow-01-services.png');

    // Step 4: Click on "Merlin Websites"
    console.log('\n📍 Step 4: Clicking on Merlin Websites...');
    const merlinCard = page.locator('text=Merlin Websites, text=Merlin Website').first();

    if (await merlinCard.isVisible()) {
      await merlinCard.click();
      await delay(2000);
      console.log('   ✅ Clicked Merlin Websites');
    } else {
      // Try finding by description
      const websiteCard = page.locator('[class*="card"]:has-text("Website")').first();
      if (await websiteCard.isVisible()) {
        await websiteCard.click();
        await delay(2000);
        console.log('   ✅ Clicked Website card');
      } else {
        console.log('   ⚠️ Could not find Merlin Websites card');
      }
    }

    // Take screenshot of what loaded
    await page.screenshot({ path: 'test-flow-02-after-click.png' });
    console.log('   📸 Screenshot: test-flow-02-after-click.png');

    // Step 5: Verify Package Selection page is showing
    console.log('\n📍 Step 5: Verifying Package Selection page...');

    // Check for package-related content
    const packageIndicators = [
      'package',
      'Essential',
      'Professional',
      'Business',
      'Enterprise',
      'Choose your plan',
      'pricing',
      '$19',
      '$49',
      'month'
    ];

    let foundPackagePage = false;
    for (const indicator of packageIndicators) {
      const element = page.locator(`text=${indicator}`).first();
      if (await element.isVisible().catch(() => false)) {
        console.log(`   ✅ Found package indicator: "${indicator}"`);
        foundPackagePage = true;
        break;
      }
    }

    if (!foundPackagePage) {
      // Check what page we're actually on
      const pageContent = await page.textContent('body');
      console.log('\n   ⚠️ Package page not detected. Current page contains:');

      if (pageContent?.includes('Welcome back')) {
        console.log('   ❌ FAIL: Dashboard is showing instead of Package Selection!');
      } else if (pageContent?.includes('Projects')) {
        console.log('   ❌ FAIL: Projects page is showing instead of Package Selection!');
      } else if (pageContent?.includes('IDE') || pageContent?.includes('Editor')) {
        console.log('   ❌ FAIL: IDE/Editor is showing instead of Package Selection!');
      } else {
        console.log('   ❓ Unknown page. Taking detailed screenshot...');
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'test-flow-03-final.png', fullPage: true });
    console.log('   📸 Screenshot: test-flow-03-final.png');

    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    if (foundPackagePage) {
      console.log('✅ TEST PASSED: Package Selection page is showing correctly!');
    } else {
      console.log('❌ TEST FAILED: Package Selection page did not appear.');
      console.log('   Check the screenshots for details.');
    }
    console.log('═══════════════════════════════════════════════════\n');

    // Keep browser open for inspection
    console.log('🔍 Browser staying open for 15 seconds for inspection...');
    await delay(15000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'test-flow-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Test complete. Browser closed.\n');
  }
}

testPackageFlow().catch(console.error);
