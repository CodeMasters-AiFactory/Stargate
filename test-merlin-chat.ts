/**
 * Quick test to verify Merlin Chat functionality
 * Tests the chat on the final-website display
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMerlinChat() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🧪 TESTING: Merlin Chat on Final Website Display');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Go to homepage and sign in
    console.log('📍 Step 1: Loading homepage...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await delay(1000);

    // Sign in
    console.log('\n📍 Step 2: Signing in...');
    const signInBtn = page.locator('button:has-text("Sign In")').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1500);

      const emailInput = page.locator('input[type="email"], input[id*="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@stargate.dev');
        await delay(300);
        await passwordInput.fill('admin123');
        await delay(300);

        const submitBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Sign In")').last();
        await submitBtn.click({ force: true });
        await delay(2000);
        console.log('   ✅ Signed in');
      }
    }

    // Step 3: Set up wizard state with a test website to simulate final-website stage
    console.log('\n📍 Step 3: Setting up test website state...');
    await page.evaluate(() => {
      const testState = {
        stage: 'final-website',
        projectId: 'test-project',
        projectName: 'Test Coffee Shop',
        selectedPackage: 'business',
        mergedTemplate: {
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Coffee Shop</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; min-height: 100vh; }
    .hero { text-align: center; padding: 100px 20px; }
    h1 { font-size: 3rem; margin-bottom: 20px; background: linear-gradient(to right, #f97316, #eab308); -webkit-background-clip: text; background-clip: text; color: transparent; }
    p { font-size: 1.25rem; color: #94a3b8; max-width: 600px; margin: 0 auto; }
    .cta { margin-top: 30px; }
    .btn { display: inline-block; padding: 12px 32px; background: linear-gradient(to right, #f97316, #eab308); color: black; border-radius: 9999px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Welcome to Test Coffee Shop</h1>
    <p>Experience the finest artisan coffee, freshly roasted and brewed to perfection.</p>
    <div class="cta">
      <a href="#menu" class="btn">View Our Menu</a>
    </div>
  </div>
</body>
</html>`,
          css: ''
        },
        requirements: {
          businessName: 'Test Coffee Shop',
          industry: 'Restaurant',
          location: 'New York'
        }
      };
      localStorage.setItem('stargate-wizard-state', JSON.stringify(testState));
    });
    console.log('   ✅ Test website state set');

    // Step 4: Navigate to stargate-websites to trigger the wizard
    console.log('\n📍 Step 4: Navigating to Merlin Wizard...');
    await page.goto(`${BASE_URL}?view=stargate-websites`);
    await delay(3000);

    // Take screenshot
    await page.screenshot({ path: 'test-merlin-01-wizard-loaded.png' });
    console.log('   📸 Screenshot: test-merlin-01-wizard-loaded.png');

    // Step 5: Check if Merlin Chat sidebar is visible
    console.log('\n📍 Step 5: Looking for Merlin Chat...');

    // First check if sidebar is collapsed and expand it
    const expandBtn = page.locator('button[title="Expand Merlin Chat"]');
    if (await expandBtn.isVisible().catch(() => false)) {
      console.log('   📍 Sidebar is collapsed, expanding...');
      await expandBtn.click();
      await delay(1000);
    }

    // Look for the specific input placeholder used by MerlinChatSidebar
    const merlinInput = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    const foundInput = await merlinInput.isVisible().catch(() => false);
    console.log(`   ${foundInput ? '✅' : '❌'} Merlin chat input visible: ${foundInput}`);

    // Look for greeting message
    const greetingVisible = await page.locator('text=What do you want to do today').isVisible().catch(() => false);
    console.log(`   ${greetingVisible ? '✅' : '❌'} Merlin greeting visible: ${greetingVisible}`);

    // Take another screenshot
    await page.screenshot({ path: 'test-merlin-02-chat-state.png', fullPage: true });
    console.log('   📸 Screenshot: test-merlin-02-chat-state.png');

    // Step 6: Try to send a message if chat is found
    console.log('\n📍 Step 6: Attempting to send a test message...');

    if (foundInput) {
      await merlinInput.click();
      await merlinInput.fill('Make the title text gold');
      await delay(500);
      console.log('   ✅ Typed message');

      // Find send button by looking for the gradient button next to input
      const sendBtn = page.locator('button.bg-gradient-to-r').first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        console.log('   ✅ Send button clicked!');
        await delay(5000); // Wait for API response
      }

      await page.screenshot({ path: 'test-merlin-03-after-message.png' });
      console.log('   📸 Screenshot: test-merlin-03-after-message.png');
    } else {
      console.log('   ⚠️ Could not find chat input field');
      // Log what's on the page
      const bodyText = await page.locator('body').textContent();
      console.log('   Page contains:', bodyText?.substring(0, 300));
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 TEST COMPLETE - Check screenshots for details');
    console.log('═══════════════════════════════════════════════════\n');

    // Keep browser open for inspection
    console.log('🔍 Browser staying open for 20 seconds for inspection...');
    await delay(20000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'test-merlin-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Test complete. Browser closed.\n');
  }
}

testMerlinChat().catch(console.error);
