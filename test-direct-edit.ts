/**
 * DIRECT TEST - Use existing Villa project and test Merlin Chat editing
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function directEditTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 DIRECT TEST: Edit Existing Villa Project');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

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
      console.log('   ✅ Signed in');
    }

    // ============ STEP 2: Click on Villa Agency project ============
    console.log('\n📍 STEP 2: Looking for Villa Agency project...');

    // First go to dashboard
    await page.goto(`${BASE_URL}?view=dashboard`, { timeout: 30000 });
    await delay(2000);

    await page.screenshot({ path: 'direct-01-dashboard.png' });

    // Click on Villa Agency project card
    const villaProject = page.locator('text=Villa Agency').first();
    if (await villaProject.isVisible().catch(() => false)) {
      await villaProject.click();
      await delay(3000);
      console.log('   ✅ Clicked Villa Agency project');
    } else {
      console.log('   ⚠️ Villa Agency not found, trying Quick Actions...');

      // Try New Website quick action
      const newWebsiteBtn = page.locator('text=New Website').first();
      if (await newWebsiteBtn.isVisible().catch(() => false)) {
        await newWebsiteBtn.click();
        await delay(2000);
        console.log('   ✅ Clicked New Website');
      }
    }

    await page.screenshot({ path: 'direct-02-after-click.png' });

    // ============ STEP 3: Navigate through wizard if needed ============
    console.log('\n📍 STEP 3: Checking current state...');
    await delay(2000);

    // Check if we need to select package
    const packageBtn = page.locator('button:has-text("Select"), button:has-text("Choose")').first();
    if (await packageBtn.isVisible().catch(() => false)) {
      await packageBtn.click();
      await delay(2000);
      console.log('   ✅ Selected package');
    }

    // Check if we need to select template
    const templateCard = page.locator('[data-template], .template-card, [class*="template"]').first();
    if (await templateCard.isVisible().catch(() => false)) {
      await templateCard.click();
      await delay(1000);

      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await delay(3000);
      }
      console.log('   ✅ Selected template');
    }

    await page.screenshot({ path: 'direct-03-state.png' });

    // ============ STEP 4: Check for Merlin Chat ============
    console.log('\n📍 STEP 4: Looking for Merlin Chat...');

    // Try to expand if collapsed
    const expandBtn = page.locator('button[title="Expand Merlin Chat"]');
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click();
      await delay(1000);
      console.log('   ✅ Expanded Merlin Chat');
    }

    const merlinInput = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    const chatVisible = await merlinInput.isVisible().catch(() => false);

    if (chatVisible) {
      console.log('   ✅ Merlin Chat is visible');
    } else {
      console.log('   ❌ Merlin Chat NOT visible');

      // Let's manually set up the wizard state
      console.log('\n📍 Setting up wizard state manually...');
      await page.evaluate(() => {
        const testState = {
          stage: 'final-website',
          projectId: 'villa-test',
          projectName: 'Villa Test',
          selectedPackage: 'professional',
          mergedTemplate: {
            html: `<!DOCTYPE html>
<html>
<head>
  <title>VILLA Agency</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: white; }
    h1 { color: #f97316; font-size: 48px; }
    .nav { display: flex; gap: 20px; margin-bottom: 30px; }
    .nav a { color: #94a3b8; text-decoration: none; }
    .hero { padding: 60px 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="nav">
    <a href="#">VILLA</a>
    <a href="#">Home</a>
    <a href="#">Properties</a>
    <a href="#">Contact</a>
  </div>
  <div class="hero">
    <h1>Welcome to VILLA Paradise</h1>
    <p>Find your dream VILLA today. We have the best VILLA rentals in Toronto, Canada.</p>
    <p>VILLA special offers available now!</p>
  </div>
  <img src="/api/templates/downloaded-s61DU7Qt-villa-agency-real-estate-html5-template/assets/assets/images/banner-01.jpg" alt="Villa">
</body>
</html>`,
            css: ''
          },
          requirements: { businessName: 'Villa Test', industry: 'Real Estate', location: 'Toronto' }
        };
        localStorage.setItem('stargate-wizard-state', JSON.stringify(testState));
      });

      await page.goto(`${BASE_URL}?view=stargate-websites`);
      await delay(3000);
      console.log('   ✅ Set up wizard state and navigated');
    }

    await page.screenshot({ path: 'direct-04-before-edit.png' });

    // ============ STEP 5: Get initial iframe content ============
    console.log('\n📍 STEP 5: Checking initial iframe content...');
    const iframe = page.frameLocator('iframe');
    let initialVillaCount = 0;

    try {
      const bodyText = await iframe.locator('body').textContent({ timeout: 5000 });
      initialVillaCount = (bodyText?.match(/VILLA/gi) || []).length;
      console.log(`   📄 Found "VILLA" ${initialVillaCount} times`);
    } catch (e) {
      console.log('   ⚠️ Could not read iframe');
    }

    // ============ STEP 6: Send edit command ============
    console.log('\n📍 STEP 6: Sending edit command...');

    // Re-check for input
    const input = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    if (await input.isVisible().catch(() => false)) {
      await input.click();
      await input.fill('change villa to villas');
      await delay(300);

      const sendBtn = page.locator('button.bg-gradient-to-r').first();
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
        console.log('   ✅ Sent message: "change villa to villas"');
      }

      await delay(4000);
    } else {
      console.log('   ❌ Input not found');
    }

    await page.screenshot({ path: 'direct-05-after-edit.png' });

    // ============ STEP 7: Check response and verify ============
    console.log('\n📍 STEP 7: Checking results...');

    // Check chat response
    const chatMessages = await page.locator('.bg-slate-800.text-slate-100').allTextContents();
    const lastMsg = chatMessages[chatMessages.length - 1] || 'No response';
    console.log(`   💬 Merlin: "${lastMsg.substring(0, 80)}..."`);

    // Check iframe update
    try {
      const updatedText = await iframe.locator('body').textContent({ timeout: 5000 });
      const villasCount = (updatedText?.match(/villas/gi) || []).length;
      const villaCount = (updatedText?.match(/\bvilla\b/gi) || []).length;

      console.log(`   📄 "villas" count: ${villasCount}`);
      console.log(`   📄 "villa" count (standalone): ${villaCount}`);

      // Check if images are still loading
      const imgCount = await iframe.locator('img').count();
      console.log(`   🖼️ Images in iframe: ${imgCount}`);

      if (villasCount > 0) {
        console.log('\n   ✅ SUCCESS: Text was changed to "villas"!');
      }
      if (imgCount > 0) {
        console.log('   ✅ SUCCESS: Images are intact!');
      }
    } catch (e) {
      console.log('   ⚠️ Could not verify iframe');
    }

    await page.screenshot({ path: 'direct-06-final.png', fullPage: true });

    // ============ SUMMARY ============
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST COMPLETE - Check screenshots');
    console.log('='.repeat(60));
    console.log('   direct-01-dashboard.png');
    console.log('   direct-02-after-click.png');
    console.log('   direct-03-state.png');
    console.log('   direct-04-before-edit.png');
    console.log('   direct-05-after-edit.png');
    console.log('   direct-06-final.png');
    console.log('='.repeat(60) + '\n');

    console.log('🔍 Browser staying open for 15 seconds...');
    await delay(15000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'direct-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Browser closed.\n');
  }
}

directEditTest().catch(console.error);
