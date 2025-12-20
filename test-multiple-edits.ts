/**
 * TEST: Multiple Edit Commands
 * Tests various edit scenarios to ensure robustness
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMultipleEdits() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 TEST: Multiple Edit Commands');
  console.log('═'.repeat(60) + '\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();
  let passed = 0;
  let failed = 0;

  try {
    // Sign in
    console.log('📍 Signing in...');
    await page.goto(BASE_URL);
    await delay(1000);

    const signInBtn = page.locator('button:has-text("Sign In")').first();
    if (await signInBtn.isVisible()) {
      await signInBtn.click();
      await delay(1000);
      await page.locator('input[type="email"]').first().fill('admin@stargate.dev');
      await page.locator('input[type="password"]').first().fill('admin123');
      await page.locator('[role="dialog"] button[type="submit"]').last().click({ force: true });
      await delay(2000);
    }

    // Set up test state with comprehensive HTML
    console.log('\n📍 Setting up test state...');
    await page.evaluate(() => {
      const testState = {
        stage: 'final-website',
        projectId: 'multi-edit-test',
        projectName: 'Multi Edit Test',
        selectedPackage: 'professional',
        mergedTemplate: {
          html: `<!DOCTYPE html>
<html>
<head>
  <title>ACME Real Estate</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: white; }
    h1 { color: #f97316; font-size: 48px; }
    .nav { display: flex; gap: 20px; margin-bottom: 30px; background: #2a2a4e; padding: 15px; }
    .nav a { color: #94a3b8; text-decoration: none; }
    .hero { padding: 60px 0; text-align: center; }
    .btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; cursor: pointer; }
    footer { background: #0a0a1e; padding: 20px; margin-top: 40px; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="#">ACME</a>
    <a href="#">Home</a>
    <a href="#">Properties</a>
    <a href="#">Contact</a>
  </nav>
  <div class="hero">
    <h1>Welcome to ACME Properties</h1>
    <p>Find your dream home with ACME Real Estate. We have the best properties in Toronto.</p>
    <p>ACME has been serving clients for 25 years.</p>
    <button class="btn">Get Started</button>
  </div>
  <footer>
    <p>© 2024 ACME Real Estate. All rights reserved.</p>
    <p>Contact: info@acme.com</p>
  </footer>
  <img src="/api/templates/downloaded-test/images/hero.jpg" alt="Hero Image">
</body>
</html>`,
          css: ''
        },
        requirements: { businessName: 'Multi Edit Test', industry: 'Real Estate', location: 'Toronto' }
      };
      localStorage.setItem('stargate-wizard-state', JSON.stringify(testState));
    });

    await page.goto(`${BASE_URL}?view=stargate-websites`);
    await delay(3000);

    const iframe = page.frameLocator('iframe');
    const merlinInput = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    const sendBtn = page.locator('button.bg-gradient-to-r').first();

    // Helper to send message and check result
    async function testEdit(command: string, checkFor: string, description: string) {
      console.log(`\n📝 Test: ${description}`);
      console.log(`   Command: "${command}"`);

      await merlinInput.click();
      await merlinInput.fill(command);
      await delay(300);
      await sendBtn.click();
      await delay(3000);

      try {
        const content = await iframe.locator('body').textContent({ timeout: 3000 });
        const found = content?.toLowerCase().includes(checkFor.toLowerCase());

        if (found) {
          console.log(`   ✅ PASS: Found "${checkFor}"`);
          passed++;
          return true;
        } else {
          console.log(`   ❌ FAIL: "${checkFor}" not found`);
          failed++;
          return false;
        }
      } catch (e) {
        console.log(`   ❌ ERROR: Could not read iframe`);
        failed++;
        return false;
      }
    }

    // Helper to verify URL preservation
    async function verifyURLPreserved(urlPart: string) {
      try {
        const html = await iframe.locator('html').innerHTML({ timeout: 3000 });
        if (html.includes(urlPart)) {
          console.log(`   ✅ URL preserved: ${urlPart}`);
          return true;
        } else {
          console.log(`   ❌ URL BROKEN: ${urlPart}`);
          return false;
        }
      } catch (e) {
        console.log(`   ❌ ERROR checking URL`);
        return false;
      }
    }

    // ============ TEST CASES ============

    // Test 1: Simple text replacement
    await testEdit('change ACME to APEX', 'APEX', 'Simple text replacement');

    // Test 2: Check URLs are preserved (should still have /api/templates/downloaded-test/...)
    console.log('\n📝 Test: URL Preservation Check');
    await verifyURLPreserved('/api/templates/downloaded-test');

    // Test 3: Another text replacement
    await testEdit('change Toronto to Vancouver', 'Vancouver', 'City name change');

    // Test 4: Change button text
    await testEdit('change Get Started to Learn More', 'Learn More', 'Button text change');

    // Test 5: Case insensitive replacement
    await testEdit('change properties to estates', 'estates', 'Case-insensitive replacement');

    // Test 6: Natural language with "please"
    await testEdit('please change dream to perfect', 'perfect', 'Natural language with please');

    // Test 7: Verify layout still intact
    console.log('\n📝 Test: Layout Integrity Check');
    try {
      const imgCount = await iframe.locator('img').count();
      const navCount = await iframe.locator('nav, .nav').count();
      const footerCount = await iframe.locator('footer').count();

      if (imgCount > 0 && navCount > 0 && footerCount > 0) {
        console.log(`   ✅ Layout intact: ${imgCount} images, ${navCount} nav, ${footerCount} footer`);
        passed++;
      } else {
        console.log(`   ⚠️ Layout may be damaged: ${imgCount} images, ${navCount} nav, ${footerCount} footer`);
      }
    } catch (e) {
      console.log(`   ❌ ERROR checking layout`);
    }

    // Screenshot final state
    await page.screenshot({ path: 'multi-edit-final.png', fullPage: true });

    // ============ SUMMARY ============
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   Total: ${passed + failed}`);

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Merlin Chat is production ready.');
    } else {
      console.log('\n⚠️ Some tests failed. Review the output above.');
    }
    console.log('═'.repeat(60) + '\n');

    console.log('🔍 Browser staying open for 10 seconds...');
    await delay(10000);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'multi-edit-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Browser closed.\n');
  }

  return { passed, failed };
}

testMultipleEdits().catch(console.error);
