/**
 * Debug Test: Check exact console output for Merlin Chat
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function debugMerlinChat() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔍 DEBUG: Merlin Chat State Flow');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
  });

  const page = await context.newPage();

  // Capture ALL console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    // Print important ones immediately
    if (text.includes('MerlinChat') || text.includes('FinalWebsiteDisplay') || text.includes('onWebsiteUpdate')) {
      console.log(`🖥️ ${text}`);
    }
  });

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

    // Set up test state
    console.log('\n📍 Setting up test state...');
    await page.evaluate(() => {
      const testState = {
        stage: 'final-website',
        projectId: 'debug-test',
        projectName: 'Debug Test',
        selectedPackage: 'business',
        mergedTemplate: {
          html: `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>VILLA Test</h1><p>VILLA content</p></body></html>`,
          css: ''
        },
        requirements: { businessName: 'Debug Test', industry: 'Test', location: 'Test' }
      };
      localStorage.setItem('stargate-wizard-state', JSON.stringify(testState));
    });

    // Load wizard
    console.log('\n📍 Loading wizard...');
    await page.goto(`${BASE_URL}?view=stargate-websites`);
    await delay(3000);

    // Check initial iframe content
    console.log('\n📍 Checking initial content...');
    const iframe = page.frameLocator('iframe');
    try {
      const initialBody = await iframe.locator('body').textContent({ timeout: 3000 });
      console.log(`   Initial iframe content: "${initialBody?.substring(0, 100)}"`);
    } catch (e) {
      console.log('   Could not read iframe');
    }

    // Send message
    console.log('\n📍 Sending chat message...');
    const merlinInput = page.locator('input[placeholder="Ask Merlin to make changes..."]');
    await merlinInput.fill('change VILLA to VILLAS');
    await page.locator('button.bg-gradient-to-r').first().click();

    console.log('\n📍 Waiting for response and checking logs...');
    await delay(5000);

    // Check updated iframe content
    console.log('\n📍 Checking updated content...');
    try {
      const updatedBody = await iframe.locator('body').textContent({ timeout: 3000 });
      console.log(`   Updated iframe content: "${updatedBody?.substring(0, 100)}"`);

      if (updatedBody?.includes('VILLAS')) {
        console.log('\n   ✅ SUCCESS: VILLAS found in iframe!');
      } else if (updatedBody?.includes('VILLA')) {
        console.log('\n   ❌ FAIL: Still showing VILLA (not updated)');
      }
    } catch (e) {
      console.log('   Could not read iframe');
    }

    // Print all relevant console logs
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 ALL RELEVANT CONSOLE LOGS:');
    console.log('═══════════════════════════════════════════════════');

    const relevantLogs = consoleLogs.filter(log =>
      log.includes('MerlinChat') ||
      log.includes('FinalWebsiteDisplay') ||
      log.includes('Website') ||
      log.includes('HTML')
    );

    if (relevantLogs.length > 0) {
      relevantLogs.forEach(log => console.log(`   ${log}`));
    } else {
      console.log('   No relevant logs found! The debug messages might not be firing.');
    }

    console.log('\n🔍 Browser staying open for 15 seconds...');
    await delay(15000);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugMerlinChat().catch(console.error);
