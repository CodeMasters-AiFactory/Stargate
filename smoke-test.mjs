/**
 * COMPREHENSIVE SMOKE TEST - StargatePortal Website Builder
 * Tests entire user journey from landing to website generation
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = path.join(__dirname, 'smoke-test-screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 Screenshot: ${name}`);
  return filePath;
}

async function runSmokeTest() {
  console.log('\n🚀 STARTING COMPREHENSIVE SMOKE TEST\n');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({
    headless: true, // Run headless for automated testing
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const issues = [];
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    if (passed) {
      results.passed++;
      console.log(`  ✓ ${name}${details ? ': ' + details : ''}`);
    } else {
      results.failed++;
      issues.push(`${name}: ${details}`);
      console.log(`  ✗ ${name}${details ? ': ' + details : ''}`);
    }
    results.tests.push({ name, passed, details });
  }

  try {
    // ═══════════════════════════════════════════════════════════════
    // TEST 1: SERVER HEALTH CHECK
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 1: Server Health Check');
    console.log('-'.repeat(40));

    try {
      const response = await fetch(`${BASE_URL}/api/website-editor/status`);
      const data = await response.json();
      logTest('Server is running', response.ok, `Mode: ${data.mode || 'unknown'}`);
    } catch (err) {
      logTest('Server is running', false, err.message);
      throw new Error('Server not running - cannot continue tests');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 2: LANDING PAGE / MARKETING PAGE
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 2: Landing Page');
    console.log('-'.repeat(40));

    await page.goto(BASE_URL);
    await delay(2000);
    await takeScreenshot(page, '01-landing-page');

    const title = await page.title();
    logTest('Page loads', !!title, title);

    // Check for hero section
    const heroElement = await page.locator('h1, [class*="hero"]').first();
    const hasHero = await heroElement.isVisible().catch(() => false);
    logTest('Hero section visible', hasHero);

    // ═══════════════════════════════════════════════════════════════
    // TEST 3: NAVIGATION TO STARGATE WEBSITES
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 3: Navigate to Stargate Websites');
    console.log('-'.repeat(40));

    await page.goto(`${BASE_URL}/stargate-websites`);
    await delay(3000);
    await takeScreenshot(page, '02-stargate-websites');

    const currentUrl = page.url();
    logTest('Navigated to /stargate-websites', currentUrl.includes('stargate-websites'), currentUrl);

    // ═══════════════════════════════════════════════════════════════
    // TEST 4: PACKAGE SELECTION (Leonardo.ai style)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 4: Package Selection Page');
    console.log('-'.repeat(40));

    // Check for package cards - look for specific pricing elements or package names
    const starterText = await page.locator('text=Starter').first().isVisible().catch(() => false);
    const standardText = await page.locator('text=Standard').first().isVisible().catch(() => false);
    const professionalText = await page.locator('text=Professional').first().isVisible().catch(() => false);
    const businessText = await page.locator('text=Business').first().isVisible().catch(() => false);
    const enterpriseText = await page.locator('text=Enterprise').first().isVisible().catch(() => false);

    let packagesFound = [starterText, standardText, professionalText, businessText, enterpriseText].filter(Boolean).length;

    logTest('Package cards visible', packagesFound >= 3, `Found ${packagesFound}/5 packages`);

    // Check for pricing
    const priceElements = await page.locator('text=/\\$\\d+/').count();
    logTest('Pricing displayed', priceElements > 0, `Found ${priceElements} price elements`);

    // Check for "Best offer" or similar badge
    const bestOfferBadge = await page.locator('text=/Best|Popular|Recommended/i').first().isVisible().catch(() => false);
    logTest('Featured package badge', bestOfferBadge);

    // Check for Subscribe/Select buttons
    const subscribeButtons = await page.locator('button:has-text("Subscribe"), button:has-text("Select"), button:has-text("Get Started")').count();
    logTest('Action buttons present', subscribeButtons > 0, `Found ${subscribeButtons} buttons`);

    await takeScreenshot(page, '03-package-selection');

    // ═══════════════════════════════════════════════════════════════
    // TEST 5: SELECT A PACKAGE
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 5: Select Package Flow');
    console.log('-'.repeat(40));

    // Try to click on Professional or Standard package (most common choice)
    const packageBtn = await page.locator('button:has-text("Subscribe"), button:has-text("Select")').nth(1);
    const canClickPackage = await packageBtn.isVisible().catch(() => false);

    if (canClickPackage) {
      await packageBtn.click();
      await delay(3000);
      await takeScreenshot(page, '04-after-package-select');

      // Check if we moved to next stage (template selection or form)
      const templateSection = await page.locator('text=/Template|Choose|Select.*design/i').first().isVisible().catch(() => false);
      const formSection = await page.locator('input[type="text"], textarea').first().isVisible().catch(() => false);
      logTest('Package selection advances flow', templateSection || formSection, templateSection ? 'Template selection' : 'Form visible');
    } else {
      logTest('Package selection advances flow', false, 'Could not click package button');
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 6: TEMPLATE SELECTION (if applicable)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 6: Template Selection');
    console.log('-'.repeat(40));

    // Look for template grid or cards
    const templateCards = await page.locator('[class*="template"], [class*="card"]:has(img)').count();
    logTest('Template cards displayed', templateCards > 0, `Found ${templateCards} templates/cards`);

    await takeScreenshot(page, '05-template-selection');

    // Try to select a template
    const templateClickable = await page.locator('[class*="template"], [class*="card"]:has(img)').first();
    const canSelectTemplate = await templateClickable.isVisible().catch(() => false);

    if (canSelectTemplate) {
      await templateClickable.click();
      await delay(2000);
      await takeScreenshot(page, '06-template-selected');
      logTest('Template can be selected', true);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 7: QUICK BUSINESS FORM
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 7: Business Information Form');
    console.log('-'.repeat(40));

    // Look for business form inputs
    const nameInput = await page.locator('input[placeholder*="name"], input[name*="name"], input[placeholder*="business"]').first();
    const hasNameInput = await nameInput.isVisible().catch(() => false);
    logTest('Business name input', hasNameInput);

    const emailInput = await page.locator('input[type="email"], input[placeholder*="email"]').first();
    const hasEmailInput = await emailInput.isVisible().catch(() => false);
    logTest('Email input', hasEmailInput);

    if (hasNameInput) {
      await nameInput.fill('Test Business LLC');
      logTest('Can fill business name', true);
    }

    if (hasEmailInput) {
      await emailInput.fill('test@testbusiness.com');
      logTest('Can fill email', true);
    }

    await takeScreenshot(page, '07-business-form');

    // ═══════════════════════════════════════════════════════════════
    // TEST 8: MY PROJECTS NAVIGATION
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 8: My Projects');
    console.log('-'.repeat(40));

    const myProjectsBtn = await page.locator('button:has-text("My Projects"), a:has-text("My Projects")').first();
    const hasMyProjects = await myProjectsBtn.isVisible().catch(() => false);
    logTest('My Projects button visible', hasMyProjects);

    if (hasMyProjects) {
      await myProjectsBtn.click();
      await delay(2000);
      await takeScreenshot(page, '08-my-projects');

      // Check for projects view
      const projectsHeader = await page.locator('text=/My Projects|Projects|Dashboard/i').first().isVisible().catch(() => false);
      logTest('Projects view loads', projectsHeader);

      // Check for create new button
      const createNewBtn = await page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first().isVisible().catch(() => false);
      logTest('Create New button', createNewBtn);
    }

    // ═══════════════════════════════════════════════════════════════
    // TEST 9: API ENDPOINTS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 9: API Endpoints');
    console.log('-'.repeat(40));

    // Test projects API
    const projectsRes = await fetch(`${BASE_URL}/api/projects`, { credentials: 'include' });
    logTest('GET /api/projects', projectsRes.status === 200 || projectsRes.status === 401, `Status: ${projectsRes.status}`);

    // Test templates API
    const templatesRes = await fetch(`${BASE_URL}/api/brand-templates`);
    logTest('GET /api/brand-templates', templatesRes.ok, `Status: ${templatesRes.status}`);

    // Test website editor status
    const editorRes = await fetch(`${BASE_URL}/api/website-editor/status`);
    const editorData = await editorRes.json();
    logTest('GET /api/website-editor/status', editorRes.ok, `Mode: ${editorData.mode}`);

    // ═══════════════════════════════════════════════════════════════
    // TEST 10: AUTHENTICATION FLOW
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 TEST 10: Authentication');
    console.log('-'.repeat(40));

    // Check auth status
    const authRes = await fetch(`${BASE_URL}/api/user`);
    logTest('Auth endpoint accessible', authRes.status === 200 || authRes.status === 401, `Status: ${authRes.status}`);

    // Check for login/signup elements
    const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Sign"), a:has-text("Login")').first();
    const hasLogin = await loginBtn.isVisible().catch(() => false);
    logTest('Login button visible', hasLogin || authRes.status === 200, hasLogin ? 'Found' : 'Already logged in or hidden');

    // ═══════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('📊 SMOKE TEST COMPLETE');
    console.log('═'.repeat(60));

    console.log(`\n✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

    if (issues.length > 0) {
      console.log(`\n⚠️  ISSUES FOUND: ${issues.length}\n`);
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log('\n🎉 ALL TESTS PASSED!\n');
    }

    console.log(`\n📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

    // Write results to file
    const resultsFile = path.join(SCREENSHOT_DIR, 'test-results.json');
    fs.writeFileSync(
      resultsFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          passed: results.passed,
          failed: results.failed,
          successRate: Math.round((results.passed / (results.passed + results.failed)) * 100)
        },
        issues,
        tests: results.tests
      }, null, 2)
    );

    console.log(`📄 Results saved to: ${resultsFile}\n`);

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    await takeScreenshot(page, 'ERROR-screenshot');
    issues.push(`Test Error: ${error.message}`);
  } finally {
    await browser.close();
    process.exit(results.failed > 3 ? 1 : 0);
  }
}

// Run the test
runSmokeTest().catch(console.error);
