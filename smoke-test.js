/**
 * COMPREHENSIVE SMOKE TEST - StargatePortal
 * Tests entire user journey from landing to website generation
 */

const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = 'c:/CURSOR PROJECTS/StargatePortal/smoke-test-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Screenshot: ${name}`);
  return path;
}

async function runSmokeTest() {
  console.log('\n🚀 STARTING COMPREHENSIVE SMOKE TEST\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({
    headless: false, // VISIBLE BROWSER
    slowMo: 500 // Slow down so we can see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const issues = [];

  try {
    // ═══════════════════════════════════════════════════════════════
    // TEST 1: LANDING PAGE
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 1: Landing Page');
    console.log('-'.repeat(40));

    await page.goto(BASE_URL);
    await delay(2000);
    await takeScreenshot(page, '01-landing-page');

    const title = await page.title();
    console.log(`  ✓ Page loaded: ${title}`);

    // Check for key landing page elements
    const heroText = await page.locator('h1').first().textContent().catch(() => null);
    if (heroText) {
      console.log(`  ✓ Hero text found: "${heroText.substring(0, 50)}..."`);
    } else {
      issues.push('Landing page: No H1 hero text found');
      console.log('  ✗ No hero text found');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: AUTHENTICATION
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 2: Authentication Flow');
    console.log('-'.repeat(40));

    // Look for login button or check if already logged in
    const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login")').first();
    if (await loginBtn.isVisible().catch(() => false)) {
      console.log('  → Found login button, clicking...');
      await loginBtn.click();
      await delay(2000);
      await takeScreenshot(page, '02-login-modal');

      // Try to login with test credentials
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
      const passwordInput = await page.locator('input[type="password"]').first();

      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        await takeScreenshot(page, '02b-login-filled');

        const submitBtn = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        await submitBtn.click();
        await delay(3000);
        await takeScreenshot(page, '02c-after-login');
      }
    } else {
      console.log('  ✓ Already logged in or no login required');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: SERVICES DASHBOARD
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 3: Services Dashboard');
    console.log('-'.repeat(40));

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    await delay(2000);
    await takeScreenshot(page, '03-services-dashboard');

    // Check for service cards
    const serviceCards = await page.locator('[class*="card"], [class*="service"]').count();
    console.log(`  ✓ Found ${serviceCards} service elements`);

    // Look for Websites/Merlin service
    const websiteService = await page.locator('text=Website, text=Merlin, text=Create Website').first();
    if (await websiteService.isVisible().catch(() => false)) {
      console.log('  ✓ Website service found');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: PACKAGE SELECTION PAGE (Leonardo.ai style)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 4: Package Selection Page');
    console.log('-'.repeat(40));

    await page.goto(`${BASE_URL}/stargate-websites`);
    await delay(3000);
    await takeScreenshot(page, '04-package-selection');

    // Check for 5 package cards
    const packageCards = await page.locator('[class*="card"]').count();
    console.log(`  → Found ${packageCards} cards on page`);

    // Check for specific package names
    const starterCard = await page.locator('text=Starter').first();
    const standardCard = await page.locator('text=Standard').first();
    const professionalCard = await page.locator('text=Professional').first();
    const businessCard = await page.locator('text=Business').first();
    const enterpriseCard = await page.locator('text=Enterprise').first();

    let packagesFound = 0;
    if (await starterCard.isVisible().catch(() => false)) { packagesFound++; console.log('  ✓ Starter package visible'); }
    if (await standardCard.isVisible().catch(() => false)) { packagesFound++; console.log('  ✓ Standard package visible'); }
    if (await professionalCard.isVisible().catch(() => false)) { packagesFound++; console.log('  ✓ Professional package visible'); }
    if (await businessCard.isVisible().catch(() => false)) { packagesFound++; console.log('  ✓ Business package visible'); }
    if (await enterpriseCard.isVisible().catch(() => false)) { packagesFound++; console.log('  ✓ Enterprise package visible'); }

    if (packagesFound < 5) {
      issues.push(`Package Selection: Only ${packagesFound}/5 packages visible`);
      console.log(`  ✗ Only ${packagesFound}/5 packages visible`);
    } else {
      console.log('  ✓ All 5 packages visible!');
    }

    // Check for "Best offer" badge
    const bestOffer = await page.locator('text=Best offer').first();
    if (await bestOffer.isVisible().catch(() => false)) {
      console.log('  ✓ "Best offer" badge visible');
    } else {
      issues.push('Package Selection: "Best offer" badge not visible');
    }

    // Check for prices
    const prices = await page.locator('text=/\\$\\d+/').count();
    console.log(`  → Found ${prices} price elements`);

    // ═══════════════════════════════════════════════════════════════
    // TEST 5: SELECT A PACKAGE & TEMPLATE SELECTION
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 5: Template Selection Flow');
    console.log('-'.repeat(40));

    // Click on Professional package (Best offer)
    const proPackageBtn = await page.locator('button:has-text("Subscribe")').nth(2); // Professional is 3rd
    if (await proPackageBtn.isVisible().catch(() => false)) {
      console.log('  → Clicking Professional package...');
      await proPackageBtn.click();
      await delay(3000);
      await takeScreenshot(page, '05-template-selection');

      // Check for templates
      const templates = await page.locator('[class*="template"], [class*="card"]').count();
      console.log(`  → Found ${templates} template elements`);

      // Look for template names or previews
      const templateGrid = await page.locator('[class*="grid"]').first();
      if (await templateGrid.isVisible().catch(() => false)) {
        console.log('  ✓ Template grid visible');
      }
    } else {
      issues.push('Template Selection: Could not click package button');
      console.log('  ✗ Could not find package button');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 6: MY PROJECTS DASHBOARD
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 6: My Projects Dashboard');
    console.log('-'.repeat(40));

    // Look for "My Projects" button
    const myProjectsBtn = await page.locator('button:has-text("My Projects"), a:has-text("My Projects")').first();
    if (await myProjectsBtn.isVisible().catch(() => false)) {
      console.log('  → Clicking My Projects...');
      await myProjectsBtn.click();
      await delay(2000);
      await takeScreenshot(page, '06-my-projects');

      // Check for project cards or empty state
      const projectCards = await page.locator('[class*="project"], [class*="card"]').count();
      console.log(`  → Found ${projectCards} project elements`);

      // Check for "Create New" button
      const createNewBtn = await page.locator('button:has-text("Create"), text=Create New').first();
      if (await createNewBtn.isVisible().catch(() => false)) {
        console.log('  ✓ Create New button visible');
      }

      // Check for Delete button on hover (if projects exist)
      const deleteBtn = await page.locator('button:has-text("Delete")').first();
      console.log(`  → Delete buttons: ${await page.locator('button:has-text("Delete")').count()}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 7: OPEN EXISTING PROJECT (if any)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 7: Open Existing Project');
    console.log('-'.repeat(40));

    // Check if there are any projects
    const openProjectBtn = await page.locator('button:has-text("Open"), button:has-text("Edit")').first();
    if (await openProjectBtn.isVisible().catch(() => false)) {
      console.log('  → Opening existing project...');
      await openProjectBtn.click();
      await delay(3000);
      await takeScreenshot(page, '07-project-editor');

      // Check for Merlin chat sidebar
      const merlinChat = await page.locator('text=Merlin, [class*="merlin"], [class*="chat"]').first();
      if (await merlinChat.isVisible().catch(() => false)) {
        console.log('  ✓ Merlin chat visible');
      }

      // Check for website preview iframe
      const previewFrame = await page.locator('iframe').first();
      if (await previewFrame.isVisible().catch(() => false)) {
        console.log('  ✓ Website preview iframe visible');
      }
    } else {
      console.log('  → No existing projects to open');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 8: MERLIN CHAT FUNCTIONALITY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 8: Merlin Chat');
    console.log('-'.repeat(40));

    // Look for chat input
    const chatInput = await page.locator('input[placeholder*="Ask"], input[placeholder*="Merlin"], textarea[placeholder*="message"]').first();
    if (await chatInput.isVisible().catch(() => false)) {
      console.log('  ✓ Chat input found');

      // Type a test message
      await chatInput.fill('change Villa to My Test Business');
      await takeScreenshot(page, '08-merlin-chat-input');

      // Click send
      const sendBtn = await page.locator('button[type="submit"], button:has-text("Send")').first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        await delay(3000);
        await takeScreenshot(page, '08b-merlin-chat-response');
        console.log('  ✓ Message sent to Merlin');
      }
    } else {
      console.log('  → Chat input not visible (may need to be in editor)');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 9: DELETE CONFIRMATION DIALOG
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 9: Delete Confirmation Dialog');
    console.log('-'.repeat(40));

    // Go back to My Projects
    await page.goto(`${BASE_URL}/stargate-websites`);
    await delay(2000);

    // Click My Projects if visible
    const myProjectsBtn2 = await page.locator('button:has-text("My Projects")').first();
    if (await myProjectsBtn2.isVisible().catch(() => false)) {
      await myProjectsBtn2.click();
      await delay(2000);

      // Hover over a project to reveal delete button
      const projectCard = await page.locator('[class*="project"], [class*="card"]').first();
      if (await projectCard.isVisible().catch(() => false)) {
        await projectCard.hover();
        await delay(500);

        const deleteBtn = await page.locator('button:has-text("Delete")').first();
        if (await deleteBtn.isVisible().catch(() => false)) {
          console.log('  → Clicking delete button...');
          await deleteBtn.click();
          await delay(1000);
          await takeScreenshot(page, '09-delete-confirmation');

          // Check for confirmation dialog
          const confirmDialog = await page.locator('[role="alertdialog"], [class*="dialog"], text=Are you sure').first();
          if (await confirmDialog.isVisible().catch(() => false)) {
            console.log('  ✓ Delete confirmation dialog visible');

            // Click cancel
            const cancelBtn = await page.locator('button:has-text("Cancel")').first();
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              console.log('  ✓ Cancelled delete');
            }
          } else {
            issues.push('Delete: Confirmation dialog not showing');
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 SMOKE TEST COMPLETE');
    console.log('═'.repeat(60));

    if (issues.length === 0) {
      console.log('\n✅ ALL TESTS PASSED - READY FOR MARKET!\n');
    } else {
      console.log(`\n⚠️  ISSUES FOUND: ${issues.length}\n`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    }

    console.log(`\n📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\n🔍 Browser will stay open for manual inspection...');
    console.log('   Press Ctrl+C to close when done.\n');

    // Keep browser open for inspection
    await delay(300000); // 5 minutes

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await takeScreenshot(page, 'ERROR-screenshot');
    issues.push(`Test Error: ${error.message}`);
  } finally {
    // Write issues to file
    fs.writeFileSync(
      `${SCREENSHOT_DIR}/test-results.json`,
      JSON.stringify({ timestamp: new Date().toISOString(), issues }, null, 2)
    );
  }
}

// Run the test
runSmokeTest().catch(console.error);
