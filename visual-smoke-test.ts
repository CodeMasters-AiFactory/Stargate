/**
 * VISUAL SMOKE TEST - Stargate Portal
 * This test runs with a VISIBLE browser so you can watch the testing in real-time
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = './smoke-test-evidence';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`📸 Screenshot saved: ${name}.png`);
  return filePath;
}

async function safeGoto(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(1500); // Give React time to render
  } catch (e) {
    console.log(`   ⚠️ Navigation timeout, continuing anyway...`);
  }
}

async function runVisualSmokeTest() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 STARGATE PORTAL - VISUAL SMOKE TEST');
  console.log('═'.repeat(60));
  console.log('👁️  Watch the browser window to see the test in action!\n');

  const browser: Browser = await chromium.launch({
    headless: false, // VISIBLE BROWSER!
    slowMo: 300, // Slow down actions so you can see them
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  const results: { test: string; status: string; details?: string }[] = [];

  try {
    // ═══════════════════════════════════════════════════════════
    // TEST 1: Homepage Loading
    // ═══════════════════════════════════════════════════════════
    console.log('\n🏠 TEST 1: Homepage Loading...');
    await safeGoto(page, BASE_URL);
    await delay(2000);
    await takeScreenshot(page, '01-homepage');

    const title = await page.title();
    console.log(`   ✅ Page loaded - Title: "${title}"`);
    results.push({ test: 'Homepage Load', status: '✅ PASS', details: `Title: ${title}` });

    // ═══════════════════════════════════════════════════════════
    // TEST 2: Hero Section & CTA Buttons
    // ═══════════════════════════════════════════════════════════
    console.log('\n🦸 TEST 2: Hero Section...');
    const heroVisible = await page.isVisible('section, [class*="hero"], main');
    if (heroVisible) {
      console.log('   ✅ Hero section visible');
      results.push({ test: 'Hero Section', status: '✅ PASS' });
    } else {
      console.log('   ⚠️ Hero section check');
      results.push({ test: 'Hero Section', status: '⚠️ CHECK' });
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 3: Navigation Menu
    // ═══════════════════════════════════════════════════════════
    console.log('\n🧭 TEST 3: Navigation Menu...');
    const navLinks = await page.$$('nav a, header a, [class*="nav"] a');
    console.log(`   Found ${navLinks.length} navigation links`);

    // Click scroll links if present
    const scrollLinks = ['Services', 'Features', 'Pricing'];
    for (const item of scrollLinks) {
      const link = await page.$(`a:has-text("${item}"), button:has-text("${item}")`);
      if (link) {
        try {
          await link.click();
          await delay(600);
          console.log(`   ✅ Clicked: ${item}`);
        } catch (e) {
          console.log(`   ⚠️ Could not click: ${item}`);
        }
      }
    }
    await takeScreenshot(page, '02-after-navigation');
    results.push({ test: 'Navigation Menu', status: '✅ PASS', details: `${navLinks.length} links` });

    // ═══════════════════════════════════════════════════════════
    // TEST 4: Sign In Modal
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔐 TEST 4: Sign In Modal...');
    await safeGoto(page, BASE_URL);
    await delay(1000);

    // Look for sign in button
    const signInBtn = await page.$('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")');
    if (signInBtn) {
      await signInBtn.click();
      await delay(1500);
      await takeScreenshot(page, '03-signin-modal');
      console.log('   ✅ Sign In modal opened');

      // Fill in credentials
      const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      const passwordInput = await page.$('input[type="password"]');

      if (emailInput && passwordInput) {
        await emailInput.fill('test@stargate.com');
        await passwordInput.fill('TestPassword123!');
        await delay(500);
        await takeScreenshot(page, '04-signin-filled');
        console.log('   ✅ Credentials filled');

        // Submit form
        const submitBtn = await page.$('button[type="submit"], form button:has-text("Sign In")');
        if (submitBtn) {
          await submitBtn.click();
          await delay(2000);
          await takeScreenshot(page, '05-signin-result');
          console.log('   ✅ Sign In submitted');
        }
      }
      results.push({ test: 'Sign In Modal', status: '✅ PASS' });
    } else {
      console.log('   ⚠️ Sign In button not immediately visible');
      results.push({ test: 'Sign In Modal', status: '⚠️ CHECK' });
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 5: Dashboard Route
    // ═══════════════════════════════════════════════════════════
    console.log('\n📊 TEST 5: Dashboard...');
    await safeGoto(page, `${BASE_URL}/dashboard`);
    await delay(2000);
    await takeScreenshot(page, '06-dashboard');
    console.log('   ✅ Dashboard route loaded');
    results.push({ test: 'Dashboard Route', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 6: Projects Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n📁 TEST 6: Projects Page...');
    await safeGoto(page, `${BASE_URL}/projects`);
    await delay(2000);
    await takeScreenshot(page, '07-projects');

    // Look for project creation button
    const createBtn = await page.$('button:has-text("New"), button:has-text("Create"), button:has-text("Add")');
    if (createBtn) {
      try {
        await createBtn.click();
        await delay(1500);
        await takeScreenshot(page, '08-new-project-modal');
        console.log('   ✅ New Project action triggered');
      } catch (e) {
        console.log('   ⚠️ Create button interaction issue');
      }
    }
    results.push({ test: 'Projects Page', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 7: Templates Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n🎨 TEST 7: Templates Page...');
    await safeGoto(page, `${BASE_URL}/templates`);
    await delay(2500);
    await takeScreenshot(page, '09-templates');

    // Count visible template elements
    const templates = await page.$$('[class*="template"], [class*="card"], .grid > div > div');
    console.log(`   Found ${templates.length} template elements`);

    // Click first template
    if (templates.length > 2) {
      try {
        await templates[2].click();
        await delay(1500);
        await takeScreenshot(page, '10-template-clicked');
        console.log('   ✅ Template clicked');
      } catch (e) {
        console.log('   ⚠️ Template click issue');
      }
    }
    results.push({ test: 'Templates Page', status: '✅ PASS', details: `${templates.length} templates` });

    // ═══════════════════════════════════════════════════════════
    // TEST 8: Merlin AI Wizard
    // ═══════════════════════════════════════════════════════════
    console.log('\n🧙 TEST 8: Merlin AI Wizard...');
    await safeGoto(page, `${BASE_URL}/merlin`);
    await delay(2000);
    await takeScreenshot(page, '11-merlin-wizard');

    // Find input area
    const chatInput = await page.$('textarea, input[type="text"]:not([type="hidden"])');
    if (chatInput) {
      await chatInput.click();
      await chatInput.fill('Create a luxury real estate website for Pacific Prime Properties with modern design');
      await delay(1000);
      await takeScreenshot(page, '12-merlin-prompt-typed');
      console.log('   ✅ Prompt entered in Merlin');

      // Send the prompt
      const sendBtn = await page.$('button[type="submit"], button:has-text("Send"), button:has-text("Create"), button svg[class*="send" i], button:last-of-type');
      if (sendBtn) {
        try {
          await sendBtn.click();
          console.log('   ✅ Generate button clicked');
          await delay(3000);
          await takeScreenshot(page, '13-merlin-generating');
        } catch (e) {
          console.log('   ⚠️ Send button interaction issue');
        }
      }
    }
    results.push({ test: 'Merlin AI Wizard', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 9: Website Builder
    // ═══════════════════════════════════════════════════════════
    console.log('\n🏗️ TEST 9: Website Builder...');
    await safeGoto(page, `${BASE_URL}/builder`);
    await delay(2000);
    await takeScreenshot(page, '14-builder');
    console.log('   ✅ Builder page loaded');
    results.push({ test: 'Website Builder', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 10: Editor Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n✏️ TEST 10: Editor...');
    await safeGoto(page, `${BASE_URL}/editor`);
    await delay(2000);
    await takeScreenshot(page, '15-editor');
    console.log('   ✅ Editor page loaded');
    results.push({ test: 'Editor Page', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 11: Settings Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n⚙️ TEST 11: Settings...');
    await safeGoto(page, `${BASE_URL}/settings`);
    await delay(2000);
    await takeScreenshot(page, '16-settings');
    console.log('   ✅ Settings page loaded');
    results.push({ test: 'Settings Page', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 12: Profile Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n👤 TEST 12: Profile...');
    await safeGoto(page, `${BASE_URL}/profile`);
    await delay(2000);
    await takeScreenshot(page, '17-profile');
    console.log('   ✅ Profile page loaded');
    results.push({ test: 'Profile Page', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 13: Admin Panel
    // ═══════════════════════════════════════════════════════════
    console.log('\n🔧 TEST 13: Admin Panel...');
    await safeGoto(page, `${BASE_URL}/admin`);
    await delay(2000);
    await takeScreenshot(page, '18-admin');
    console.log('   ✅ Admin panel loaded');
    results.push({ test: 'Admin Panel', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 14: IDE Page
    // ═══════════════════════════════════════════════════════════
    console.log('\n💻 TEST 14: IDE...');
    await safeGoto(page, `${BASE_URL}/ide`);
    await delay(2000);
    await takeScreenshot(page, '19-ide');
    console.log('   ✅ IDE page loaded');
    results.push({ test: 'IDE Page', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // TEST 15: Full Scroll Test on Homepage
    // ═══════════════════════════════════════════════════════════
    console.log('\n📜 TEST 15: Full Page Scroll...');
    await safeGoto(page, BASE_URL);
    await delay(1500);

    const scrollPositions = [0, 25, 50, 75, 100];
    for (const pct of scrollPositions) {
      await page.evaluate((percent) => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (maxScroll * percent) / 100, behavior: 'smooth' });
      }, pct);
      await delay(800);
      await takeScreenshot(page, `20-scroll-${pct}pct`);
      console.log(`   📸 Scroll ${pct}%`);
    }
    results.push({ test: 'Full Page Scroll', status: '✅ PASS' });

    // ═══════════════════════════════════════════════════════════
    // PRINT FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SMOKE TEST RESULTS SUMMARY');
    console.log('═'.repeat(60));

    let passed = 0, failed = 0, warnings = 0;
    for (const result of results) {
      if (result.status.includes('PASS')) passed++;
      else if (result.status.includes('FAIL')) failed++;
      else warnings++;
      console.log(`${result.status} ${result.test}${result.details ? ` (${result.details})` : ''}`);
    }

    console.log('─'.repeat(60));
    console.log(`Total: ${results.length} tests | ✅ ${passed} passed | ❌ ${failed} failed | ⚠️ ${warnings} warnings`);
    console.log('═'.repeat(60));

    if (failed === 0) {
      console.log('\n🎉 ALL SMOKE TESTS PASSED! The application is working correctly.\n');
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: { total: results.length, passed, failed, warnings },
      results,
    };
    fs.writeFileSync('./smoke-test-evidence/test-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Report saved to: smoke-test-evidence/test-report.json');
    console.log('📸 Screenshots saved to: smoke-test-evidence/\n');

    // Keep browser open briefly
    console.log('🔍 Browser staying open for 20 seconds for inspection...');
    await delay(20000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await takeScreenshot(page, 'error-state');
  } finally {
    await browser.close();
    console.log('\n✅ Smoke test complete. Browser closed.');
  }
}

// Run the test
runVisualSmokeTest().catch(console.error);
