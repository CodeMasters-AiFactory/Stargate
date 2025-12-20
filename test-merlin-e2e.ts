/**
 * End-to-End Test: Merlin Chat Live Updates
 * Tests that chat commands actually update the website preview
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMerlinLiveUpdates() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 E2E TEST: Merlin Chat Live Website Updates');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[MerlinChat]') || text.includes('[FinalWebsiteDisplay]')) {
      console.log(`   🖥️ BROWSER: ${text}`);
    }
  });

  try {
    // Step 1: Go to homepage and sign in
    console.log('📍 Step 1: Loading homepage and signing in...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await delay(1000);

    const signInBtn = page.locator('button:has-text("Sign In")').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1000);

      const emailInput = page.locator('input[type="email"], input[id*="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@stargate.dev');
        await passwordInput.fill('admin123');

        const submitBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Sign In")').last();
        await submitBtn.click({ force: true });
        await delay(2000);
        console.log('   ✅ Signed in');
      }
    }

    // Step 2: Set up a test website with known content
    console.log('\n📍 Step 2: Setting up test website state...');
    await page.evaluate(() => {
      const testState = {
        stage: 'final-website',
        projectId: 'test-live-update',
        projectName: 'Live Update Test',
        selectedPackage: 'business',
        mergedTemplate: {
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Website</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 40px; background: #1a1a2e; color: white; }
    h1 { font-size: 3rem; color: #f97316; }
    p { font-size: 1.2rem; color: #94a3b8; }
    .highlight { background: yellow; padding: 2px 8px; }
  </style>
</head>
<body>
  <h1>Welcome to VILLA Paradise</h1>
  <p>The best VILLA rentals in the world. Choose your dream VILLA today!</p>
  <p class="highlight">VILLA special offer: 20% off!</p>
</body>
</html>`,
          css: ''
        },
        requirements: {
          businessName: 'Live Update Test',
          industry: 'Real Estate',
          location: 'Miami'
        }
      };
      localStorage.setItem('stargate-wizard-state', JSON.stringify(testState));
    });
    console.log('   ✅ Test state set with "VILLA" text (should appear 4 times)');

    // Step 3: Navigate to stargate-websites to load the wizard
    console.log('\n📍 Step 3: Loading the website builder...');
    await page.goto(`${BASE_URL}?view=stargate-websites`);
    await delay(3000);

    await page.screenshot({ path: 'e2e-01-initial-state.png' });
    console.log('   📸 Screenshot: e2e-01-initial-state.png');

    // Step 4: Check if we can see "VILLA" in the iframe
    console.log('\n📍 Step 4: Verifying initial content...');
    const iframe = page.frameLocator('iframe');

    // Try to find VILLA text in the iframe
    let villaCount = 0;
    try {
      const bodyText = await iframe.locator('body').textContent({ timeout: 5000 });
      villaCount = (bodyText?.match(/VILLA/g) || []).length;
      console.log(`   ✅ Found "VILLA" ${villaCount} times in iframe content`);
    } catch (e) {
      console.log('   ⚠️ Could not read iframe content (may be cross-origin)');
    }

    // Step 5: Find and use the Merlin Chat
    console.log('\n📍 Step 5: Using Merlin Chat to change text...');

    // Expand sidebar if collapsed
    const expandBtn = page.locator('button[title="Expand Merlin Chat"]');
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click();
      await delay(500);
    }

    const merlinInput = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    const inputVisible = await merlinInput.isVisible().catch(() => false);

    if (!inputVisible) {
      console.log('   ❌ FAIL: Merlin chat input not found!');
      await page.screenshot({ path: 'e2e-error-no-input.png' });
      return;
    }

    console.log('   ✅ Merlin chat input found');

    // Send the change command
    await merlinInput.click();
    await merlinInput.fill('change VILLA to VILLAS');
    await delay(300);

    await page.screenshot({ path: 'e2e-02-message-typed.png' });
    console.log('   📸 Screenshot: e2e-02-message-typed.png');

    // Click send
    const sendBtn = page.locator('button.bg-gradient-to-r').first();
    await sendBtn.click();
    console.log('   ✅ Send button clicked');

    // Wait for response
    await delay(3000);

    await page.screenshot({ path: 'e2e-03-after-send.png' });
    console.log('   📸 Screenshot: e2e-03-after-send.png');

    // Step 6: Check Merlin's response message
    console.log('\n📍 Step 6: Checking Merlin response...');

    // Look for the success message in the chat
    const chatMessages = await page.locator('.bg-slate-800.text-slate-100').allTextContents();
    const lastMessage = chatMessages[chatMessages.length - 1] || '';

    if (lastMessage.includes('Done!') && lastMessage.includes('changed')) {
      console.log(`   ✅ Merlin responded: "${lastMessage.substring(0, 80)}..."`);
    } else if (lastMessage.includes("couldn't find")) {
      console.log(`   ⚠️ Merlin couldn't find text: "${lastMessage}"`);
    } else {
      console.log(`   ❓ Merlin response: "${lastMessage.substring(0, 100)}"`);
    }

    // Step 7: Verify the iframe content changed
    console.log('\n📍 Step 7: Verifying live update...');

    try {
      const newBodyText = await iframe.locator('body').textContent({ timeout: 5000 });
      const newVillaCount = (newBodyText?.match(/VILLA/g) || []).length;
      const villasCount = (newBodyText?.match(/VILLAS/g) || []).length;

      console.log(`   📊 After change: "VILLA" appears ${newVillaCount} times, "VILLAS" appears ${villasCount} times`);

      if (villasCount > 0 && newVillaCount === 0) {
        console.log('   ✅ SUCCESS: Website updated live!');
      } else if (villasCount > 0) {
        console.log('   ⚠️ PARTIAL: Some text changed but not all');
      } else {
        console.log('   ❌ FAIL: Website did not update');
      }
    } catch (e) {
      console.log('   ⚠️ Could not verify iframe content');
    }

    // Final screenshot
    await page.screenshot({ path: 'e2e-04-final-state.png', fullPage: true });
    console.log('   📸 Screenshot: e2e-04-final-state.png');

    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 E2E TEST COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log('Check browser console logs above for [MerlinChat] and [FinalWebsiteDisplay] messages');
    console.log('These will show if the state update flow is working correctly.\n');

    // Keep browser open briefly for inspection
    console.log('🔍 Browser staying open for 10 seconds...');
    await delay(10000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'e2e-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Browser closed.\n');
  }
}

testMerlinLiveUpdates().catch(console.error);
