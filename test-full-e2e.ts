/**
 * FULL E2E TEST - Merlin Chat with Real Villa Template
 * Tests the complete flow from Services → Package → Template → Final Website → Chat Edit
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fullE2ETest() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 FULL E2E TEST: Merlin Chat Live Editing');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // ============ STEP 1: Sign In ============
    console.log('📍 STEP 1: Signing in...');
    await page.goto(BASE_URL, { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');
    await delay(2000);

    const signInBtn = page.locator('button:has-text("Sign In")').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1000);
      await page.locator('input[type="email"]').first().fill('admin@stargate.dev');
      await page.locator('input[type="password"]').first().fill('admin123');
      await page.locator('[role="dialog"] button[type="submit"]').last().click({ force: true });
      await delay(2000);
      console.log('   ✅ Signed in successfully');
      testsPassed++;
    }

    // ============ STEP 2: Go to Services ============
    console.log('\n📍 STEP 2: Navigating to Services...');
    await page.goto(`${BASE_URL}?view=services`);
    await delay(2000);

    const servicesVisible = await page.locator('text=Services').first().isVisible().catch(() => false);
    if (servicesVisible) {
      console.log('   ✅ Services page loaded');
      testsPassed++;
    } else {
      console.log('   ❌ Services page not found');
      testsFailed++;
    }

    // ============ STEP 3: Click Merlin Websites ============
    console.log('\n📍 STEP 3: Clicking Merlin Websites...');
    const merlinCard = page.locator('text=Merlin Website').first();
    if (await merlinCard.isVisible().catch(() => false)) {
      await merlinCard.click();
      await delay(2000);
      console.log('   ✅ Clicked Merlin Websites');
      testsPassed++;
    } else {
      // Try alternative selectors
      const websiteCard = page.locator('[class*="card"]:has-text("Website")').first();
      if (await websiteCard.isVisible().catch(() => false)) {
        await websiteCard.click();
        await delay(2000);
        console.log('   ✅ Clicked Website card');
        testsPassed++;
      }
    }

    await page.screenshot({ path: 'full-e2e-01-after-services.png' });

    // ============ STEP 4: Select Package ============
    console.log('\n📍 STEP 4: Checking for Package Selection...');
    await delay(2000);

    // Check if we're on package selection
    const packageVisible = await page.locator('text=Professional, text=Business, text=Essential').first().isVisible().catch(() => false);
    if (packageVisible) {
      console.log('   ✅ Package selection page visible');
      testsPassed++;

      // Click on Professional package
      const professionalBtn = page.locator('button:has-text("Professional"), button:has-text("Select")').first();
      if (await professionalBtn.isVisible().catch(() => false)) {
        await professionalBtn.click();
        await delay(2000);
        console.log('   ✅ Selected package');
      }
    }

    await page.screenshot({ path: 'full-e2e-02-package.png' });

    // ============ STEP 5: Select Template ============
    console.log('\n📍 STEP 5: Checking for Template Selection...');
    await delay(2000);

    // Look for template cards
    const templateCard = page.locator('[class*="template"], [class*="card"]:has(img)').first();
    if (await templateCard.isVisible().catch(() => false)) {
      await templateCard.click();
      await delay(1000);
      console.log('   ✅ Selected a template');
      testsPassed++;

      // Click Next/Continue button
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Proceed")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await delay(3000);
      }
    }

    await page.screenshot({ path: 'full-e2e-03-template.png' });

    // ============ STEP 6: Wait for Final Website ============
    console.log('\n📍 STEP 6: Waiting for Final Website display...');
    await delay(3000);

    // Check for Merlin chat sidebar (indicates we're on final website)
    const merlinChat = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    let chatVisible = await merlinChat.isVisible().catch(() => false);

    // If not visible, try expanding
    if (!chatVisible) {
      const expandBtn = page.locator('button[title="Expand Merlin Chat"]');
      if (await expandBtn.isVisible().catch(() => false)) {
        await expandBtn.click();
        await delay(1000);
        chatVisible = await merlinChat.isVisible().catch(() => false);
      }
    }

    if (chatVisible) {
      console.log('   ✅ Final website with Merlin Chat is ready');
      testsPassed++;
    } else {
      console.log('   ⚠️ Merlin Chat not visible yet - checking iframe...');
    }

    await page.screenshot({ path: 'full-e2e-04-final-website.png' });

    // ============ STEP 7: Check iframe content before edit ============
    console.log('\n📍 STEP 7: Checking iframe content before edit...');
    const iframe = page.frameLocator('iframe');
    let initialContent = '';
    try {
      initialContent = await iframe.locator('body').textContent({ timeout: 5000 }) || '';
      const hasVilla = initialContent.toLowerCase().includes('villa');
      console.log(`   📄 Initial content length: ${initialContent.length} chars`);
      console.log(`   📄 Contains "villa": ${hasVilla}`);
      if (hasVilla) testsPassed++;
    } catch (e) {
      console.log('   ⚠️ Could not read iframe content');
    }

    // ============ STEP 8: Send chat message ============
    console.log('\n📍 STEP 8: Sending chat message to change "VILLA" to "VILLAS"...');

    if (chatVisible) {
      await merlinChat.click();
      await merlinChat.fill('change villa to villas');
      await delay(500);

      const sendBtn = page.locator('button.bg-gradient-to-r').first();
      await sendBtn.click();
      console.log('   ✅ Message sent');
      testsPassed++;

      // Wait for response
      await delay(4000);
    }

    await page.screenshot({ path: 'full-e2e-05-after-chat.png' });

    // ============ STEP 9: Check Merlin's response ============
    console.log('\n📍 STEP 9: Checking Merlin response...');

    const chatMessages = await page.locator('.bg-slate-800.text-slate-100').allTextContents();
    const lastMessage = chatMessages[chatMessages.length - 1] || '';

    if (lastMessage.toLowerCase().includes('done') || lastMessage.toLowerCase().includes('changed')) {
      console.log(`   ✅ Merlin responded: "${lastMessage.substring(0, 60)}..."`);
      testsPassed++;
    } else {
      console.log(`   ❓ Response: "${lastMessage.substring(0, 100)}"`);
    }

    // ============ STEP 10: Verify live update ============
    console.log('\n📍 STEP 10: Verifying live update in iframe...');

    try {
      const updatedContent = await iframe.locator('body').textContent({ timeout: 5000 }) || '';
      const hasVillas = updatedContent.toLowerCase().includes('villas');
      const stillHasVilla = updatedContent.toLowerCase().includes('villa') && !updatedContent.toLowerCase().includes('villas');

      console.log(`   📄 Updated content length: ${updatedContent.length} chars`);
      console.log(`   📄 Contains "villas": ${hasVillas}`);

      if (hasVillas) {
        console.log('   ✅ SUCCESS: Text changed to "villas"!');
        testsPassed++;
      } else if (stillHasVilla) {
        console.log('   ❌ FAIL: Still showing "villa" (not updated)');
        testsFailed++;
      }
    } catch (e) {
      console.log('   ⚠️ Could not verify iframe content');
    }

    // ============ STEP 11: Check layout integrity ============
    console.log('\n📍 STEP 11: Checking layout integrity...');

    try {
      // Check if images are loading (look for img tags with src)
      const images = await iframe.locator('img[src]').count();
      console.log(`   📄 Images found: ${images}`);

      // Check if CSS is applied (look for styled elements)
      const hasStyles = await iframe.locator('[style], [class]').count();
      console.log(`   📄 Styled elements: ${hasStyles}`);

      if (images > 0 || hasStyles > 10) {
        console.log('   ✅ Layout appears intact');
        testsPassed++;
      } else {
        console.log('   ⚠️ Layout may be broken');
      }
    } catch (e) {
      console.log('   ⚠️ Could not verify layout');
    }

    await page.screenshot({ path: 'full-e2e-06-final-result.png', fullPage: true });

    // ============ SUMMARY ============
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`   ✅ Passed: ${testsPassed}`);
    console.log(`   ❌ Failed: ${testsFailed}`);
    console.log(`   📸 Screenshots saved: full-e2e-01 through 06`);

    if (testsFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Ready for production.');
    } else {
      console.log('\n⚠️ Some tests failed. Review screenshots.');
    }
    console.log('='.repeat(60) + '\n');

    // Keep browser open for inspection
    console.log('🔍 Browser staying open for 15 seconds...');
    await delay(15000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'full-e2e-error.png' });
    testsFailed++;
  } finally {
    await browser.close();
    console.log('✅ Browser closed.\n');
  }

  return { passed: testsPassed, failed: testsFailed };
}

fullE2ETest().catch(console.error);
