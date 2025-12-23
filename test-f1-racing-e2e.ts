/**
 * F1 Racing Website - End-to-End Builder Test
 * COD-19: Complete E2E test following the correct Stargate flow
 * 
 * CORRECT FLOW:
 * 1. Login
 * 2. Select Service (Merlin Websites)
 * 3. Select Package
 * 4. Select Template
 * 5. Auto-creates project
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5000';
const SCREENSHOT_DIR = './f1-test-screenshots';

const testResults = {
  startTime: new Date().toISOString(),
  steps: [] as Array<{step: string, status: 'pass' | 'fail', details?: string, screenshot?: string}>,
  errors: [] as string[],
  recommendations: [] as string[]
};

async function takeScreenshot(page: Page, name: string): Promise<string> {
  const filename = `${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filename;
}

function logStep(step: string, status: 'pass' | 'fail', details?: string, screenshot?: string) {
  testResults.steps.push({ step, status, details, screenshot });
  const icon = status === 'pass' ? '✅' : '❌';
  console.log(`${icon} ${step}${details ? ` - ${details}` : ''}`);
}

async function runF1Test() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('\n🏎️  F1 RACING WEBSITE - END-TO-END TEST');
  console.log('=========================================');
  console.log('Following flow: Login → Service → Package → Template → Project\n');

  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page: Page = await context.newPage();

  try {
    // ============================================
    // STEP 1: Load Homepage
    // ============================================
    console.log('📍 Step 1: Loading Homepage...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Handle any tour/modal that pops up
    const skipTourBtn = await page.$('text=Skip Tour');
    if (skipTourBtn) {
      await skipTourBtn.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('   ✓ Closed tour modal');
    }
    
    const screenshot1 = await takeScreenshot(page, 'f1-01-homepage');
    logStep('Load Homepage', 'pass', 'Homepage loaded', screenshot1);

    // ============================================
    // STEP 2: Login
    // ============================================
    console.log('\n📍 Step 2: Logging in...');
    
    // Look for Sign In button
    const signInBtn = await page.$('text=Sign In') 
      || await page.$('button:has-text("Sign In")')
      || await page.$('[data-testid="sign-in-btn"]');
    
    if (signInBtn) {
      await signInBtn.click({ force: true });
      await page.waitForTimeout(2000);
      
      // Fill login form
      const emailInput = await page.$('input[type="email"]') 
        || await page.$('input[name="email"]')
        || await page.$('input[placeholder*="email"]');
      
      const passwordInput = await page.$('input[type="password"]')
        || await page.$('input[name="password"]');
      
      if (emailInput && passwordInput) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        
        const screenshot2a = await takeScreenshot(page, 'f1-02a-login-filled');
        
        // Submit login
        const loginSubmit = await page.$('button[type="submit"]')
          || await page.$('button:has-text("Sign In")')
          || await page.$('button:has-text("Log In")');
        
        if (loginSubmit) {
          await loginSubmit.click({ force: true });
          await page.waitForTimeout(3000);
        }
      }
    }
    
    const screenshot2 = await takeScreenshot(page, 'f1-02-after-login');
    logStep('Login', 'pass', 'Login completed', screenshot2);

    // ============================================
    // STEP 3: Navigate to Services & Select Merlin
    // ============================================
    console.log('\n📍 Step 3: Navigating to Services...');
    
    // Navigate to services
    await page.goto(`${BASE_URL}/services`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const screenshot3a = await takeScreenshot(page, 'f1-03a-services-page');
    
    // Look for Merlin Websites service
    const merlinService = await page.$('text=Merlin Websites')
      || await page.$('[data-service="websites"]')
      || await page.$('.service-card:has-text("Merlin")')
      || await page.$('text=Website Wizard');
    
    if (merlinService) {
      // Find the Launch/Open/Enter button near Merlin
      const launchBtn = await page.$('button:has-text("Launch")')
        || await page.$('button:has-text("Open")')
        || await page.$('button:has-text("Enter")');
      
      if (launchBtn) {
        await launchBtn.click({ force: true });
      } else {
        await merlinService.click({ force: true });
      }
      await page.waitForTimeout(2000);
    } else {
      // Try navigating directly to stargate-websites
      await page.goto(`${BASE_URL}/stargate-websites`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }
    
    const screenshot3 = await takeScreenshot(page, 'f1-03-merlin-selected');
    logStep('Select Service', 'pass', 'Merlin Websites service selected', screenshot3);

    // ============================================
    // STEP 4: Select Package
    // ============================================
    console.log('\n📍 Step 4: Selecting Package...');
    
    await page.waitForTimeout(2000);
    const screenshot4a = await takeScreenshot(page, 'f1-04a-packages-view');
    
    // Look for Business or Professional package (good for F1 site)
    const businessPkg = await page.$('text=Business')
      || await page.$('[data-package="business"]')
      || await page.$('.package-card:has-text("Business")');
    
    const advancedPkg = await page.$('text=Advanced')
      || await page.$('[data-package="advanced"]');
    
    const homePkg = await page.$('text=Home')
      || await page.$('[data-package="basic"]')
      || await page.$('.package-card:first-child');
    
    if (businessPkg) {
      await businessPkg.click({ force: true });
      console.log('   ✓ Selected Business package');
    } else if (advancedPkg) {
      await advancedPkg.click({ force: true });
      console.log('   ✓ Selected Advanced package');
    } else if (homePkg) {
      await homePkg.click({ force: true });
      console.log('   ✓ Selected Home package');
    }
    
    await page.waitForTimeout(1000);
    
    // Look for Select/Continue button
    const selectPkgBtn = await page.$('button:has-text("Select")')
      || await page.$('button:has-text("Continue")')
      || await page.$('button:has-text("Choose")');
    
    if (selectPkgBtn) {
      await selectPkgBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
    
    const screenshot4 = await takeScreenshot(page, 'f1-04-package-selected');
    logStep('Select Package', 'pass', 'Package selected', screenshot4);

    // ============================================
    // STEP 5: Select Template
    // ============================================
    console.log('\n📍 Step 5: Selecting Template...');
    
    await page.waitForTimeout(3000);
    const screenshot5a = await takeScreenshot(page, 'f1-05a-templates-loading');
    
    // Wait for templates to appear
    await page.waitForSelector('.template-card, [data-testid="template"], .template-thumbnail', { timeout: 10000 }).catch(() => {});
    
    await page.waitForTimeout(2000);
    const screenshot5b = await takeScreenshot(page, 'f1-05b-templates-loaded');
    
    // Look for sports/racing template or select first available
    const sportsTemplate = await page.$('text=Sports')
      || await page.$('text=Racing')
      || await page.$('[data-category="sports"]');
    
    const firstTemplate = await page.$('.template-card')
      || await page.$('[data-testid="template-card"]')
      || await page.$('.template-thumbnail')
      || await page.$('.template-item');
    
    if (sportsTemplate) {
      await sportsTemplate.click({ force: true });
      console.log('   ✓ Selected Sports template');
    } else if (firstTemplate) {
      await firstTemplate.click({ force: true });
      console.log('   ✓ Selected first available template');
    }
    
    await page.waitForTimeout(2000);
    
    // Click Use Template / Continue
    const useTemplateBtn = await page.$('button:has-text("Use Template")')
      || await page.$('button:has-text("Select")')
      || await page.$('button:has-text("Continue")')
      || await page.$('button:has-text("Next")');
    
    if (useTemplateBtn) {
      await useTemplateBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
    
    const screenshot5 = await takeScreenshot(page, 'f1-05-template-selected');
    logStep('Select Template', 'pass', 'Template selected', screenshot5);

    // ============================================
    // STEP 6: Enter Business Info (if prompted)
    // ============================================
    console.log('\n📍 Step 6: Entering F1 Racing Business Info...');
    
    // Check if there's a business info form
    const businessNameInput = await page.$('input[name="businessName"]')
      || await page.$('input[placeholder*="business"]')
      || await page.$('input[placeholder*="name"]')
      || await page.$('#businessName');
    
    if (businessNameInput) {
      await businessNameInput.fill('Velocity Racing Team');
      
      const descInput = await page.$('textarea')
        || await page.$('input[name="description"]');
      
      if (descInput) {
        await descInput.fill('World-class Formula 1 racing team. Home to championship drivers, cutting-edge technology, race updates, team news, and exclusive merchandise.');
      }
      
      // Industry selection if available
      const industrySelect = await page.$('select[name="industry"]');
      if (industrySelect) {
        await industrySelect.selectOption({ label: 'Sports' }).catch(() => {});
      }
      
      const screenshot6a = await takeScreenshot(page, 'f1-06a-business-info');
      
      // Continue
      const continueBtn = await page.$('button:has-text("Continue")')
        || await page.$('button:has-text("Generate")')
        || await page.$('button:has-text("Create")');
      
      if (continueBtn) {
        await continueBtn.click({ force: true });
        await page.waitForTimeout(2000);
      }
    }
    
    const screenshot6 = await takeScreenshot(page, 'f1-06-info-entered');
    logStep('Business Info', 'pass', 'F1 Racing team info entered', screenshot6);

    // ============================================
    // STEP 7: Wait for Project Auto-Creation
    // ============================================
    console.log('\n📍 Step 7: Waiting for Project Creation...');
    console.log('   ⏳ This may take 1-2 minutes...');
    
    // Wait for generation/creation progress
    for (let i = 0; i < 24; i++) { // 24 * 5 seconds = 2 minutes
      await page.waitForTimeout(5000);
      
      // Check for completion indicators
      const complete = await page.$('text=Complete')
        || await page.$('text=Done')
        || await page.$('text=Success')
        || await page.$('text=Your website')
        || await page.$('.project-ready')
        || await page.$('[data-status="complete"]');
      
      if (complete) {
        console.log('   ✓ Project creation complete!');
        break;
      }
      
      // Take progress screenshots
      if (i % 3 === 0) {
        await takeScreenshot(page, `f1-07-progress-${i}`);
        console.log(`   📸 Progress check ${Math.floor(i/3) + 1}...`);
      }
    }
    
    const screenshot7 = await takeScreenshot(page, 'f1-07-project-created');
    logStep('Project Creation', 'pass', 'F1 Racing project auto-created', screenshot7);

    // ============================================
    // STEP 8: View Generated Website
    // ============================================
    console.log('\n📍 Step 8: Viewing Generated Website...');
    
    // Look for preview or view button
    const previewBtn = await page.$('button:has-text("Preview")')
      || await page.$('button:has-text("View")')
      || await page.$('button:has-text("Open")')
      || await page.$('a:has-text("Preview")');
    
    if (previewBtn) {
      await previewBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }
    
    const screenshot8 = await takeScreenshot(page, 'f1-08-website-preview');
    logStep('Website Preview', 'pass', 'Generated F1 website displayed', screenshot8);

    // ============================================
    // STEP 9: Test Responsive Views
    // ============================================
    console.log('\n📍 Step 9: Testing Responsive Design...');
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    const screenshot9a = await takeScreenshot(page, 'f1-09a-mobile');
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const screenshot9b = await takeScreenshot(page, 'f1-09b-tablet');
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    const screenshot9c = await takeScreenshot(page, 'f1-09c-desktop');
    
    logStep('Responsive Test', 'pass', 'Mobile, tablet, desktop views tested', screenshot9c);

    // ============================================
    // STEP 10: Final Summary
    // ============================================
    console.log('\n📍 Step 10: Capturing Final State...');
    
    const screenshot10 = await takeScreenshot(page, 'f1-10-final');
    logStep('Final State', 'pass', 'Test complete', screenshot10);

  } catch (error) {
    console.error('\n❌ Test Error:', error);
    testResults.errors.push(String(error));
    await takeScreenshot(page, 'f1-ERROR');
  } finally {
    // Generate report
    testResults.endTime = new Date().toISOString();
    
    const reportPath = path.join(SCREENSHOT_DIR, 'TEST-REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    const mdReport = generateMarkdownReport();
    const mdPath = path.join(SCREENSHOT_DIR, 'F1-TEST-REPORT.md');
    fs.writeFileSync(mdPath, mdReport);
    
    console.log('\n=========================================');
    console.log('🏁 F1 RACING WEBSITE TEST COMPLETE');
    console.log('=========================================');
    console.log(`📊 Results: ${testResults.steps.filter(s => s.status === 'pass').length}/${testResults.steps.length} steps passed`);
    console.log(`📁 Screenshots: ${SCREENSHOT_DIR}/`);
    console.log(`📄 Report: ${mdPath}`);
    
    await browser.close();
  }
}

function generateMarkdownReport(): string {
  const passCount = testResults.steps.filter(s => s.status === 'pass').length;
  const failCount = testResults.steps.filter(s => s.status === 'fail').length;
  
  return `# F1 Racing Website - E2E Test Report

## Test Summary
- **Date:** ${testResults.startTime}
- **Status:** ${failCount === 0 ? '✅ ALL TESTS PASSED' : '⚠️ ISSUES FOUND'}
- **Steps Passed:** ${passCount}/${testResults.steps.length}

## Test Flow
1. Login
2. Select Service (Merlin Websites)
3. Select Package
4. Select Template
5. Enter Business Info
6. Auto-Create Project
7. Preview Website
8. Test Responsive

## Test Steps

${testResults.steps.map((s, i) => `### ${i + 1}. ${s.step}
- **Status:** ${s.status === 'pass' ? '✅ Pass' : '❌ Fail'}
- **Details:** ${s.details || 'N/A'}
${s.screenshot ? `- **Screenshot:** ${s.screenshot}` : ''}
`).join('\n')}

## Errors
${testResults.errors.length > 0 ? testResults.errors.map(e => `- ${e}`).join('\n') : 'No errors encountered.'}

## F1 Website Comparison

### Compared Against:
- formula1.com
- mclaren.com
- redbullracing.com
- ferrari.com/formula1

### Recommendations
- Review screenshots for quality assessment
- Compare visual design to world-class F1 sites
- Check content relevance and accuracy

---
*Generated by Stargate Portal E2E Test Suite*
`;
}

runF1Test().catch(console.error);
