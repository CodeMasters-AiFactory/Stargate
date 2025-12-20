import { chromium } from 'playwright';
import * as fs from 'fs';

async function captureErrors() {
  console.log('🔍 Launching browser to capture console errors...');

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    console.log(text);
    consoleMessages.push(text);
  });

  // Capture page errors
  const pageErrors: string[] = [];
  page.on('pageerror', error => {
    const errorText = `[PAGE ERROR] ${error.message}\n${error.stack}`;
    console.error(errorText);
    pageErrors.push(errorText);
  });

  // Capture failed requests
  const failedRequests: string[] = [];
  page.on('requestfailed', request => {
    const failText = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
    console.error(failText);
    failedRequests.push(failText);
  });

  try {
    console.log('📍 Navigating to http://localhost:5000...');
    await page.goto('http://localhost:5000', {
      waitUntil: 'domcontentloaded',  // Don't wait for networkidle (YouTube keeps making requests)
      timeout: 15000
    });

    // Wait a bit for React to initialize
    await page.waitForTimeout(5000);

    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n=== PAGE ERRORS ===');
    if (pageErrors.length === 0) {
      console.log('✅ No page errors!');
    } else {
      pageErrors.forEach(err => console.error(err));
    }

    console.log('\n=== FAILED REQUESTS ===');
    if (failedRequests.length === 0) {
      console.log('✅ No failed requests!');
    } else {
      failedRequests.forEach(req => console.error(req));
    }

    // Check what's actually rendered
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        isEmpty: !root || root.innerHTML.trim() === '',
        innerHTML: root?.innerHTML.substring(0, 500),
        hasReactRoot: !!(root as any)?._reactRootContainer || !!(root as any)?._reactRoot
      };
    });

    console.log('\n=== ROOT ELEMENT STATUS ===');
    console.log('Root is empty:', rootContent.isEmpty);
    console.log('Has React root:', rootContent.hasReactRoot);
    console.log('Root content preview:', rootContent.innerHTML);

    // Save to file
    const report = {
      timestamp: new Date().toISOString(),
      consoleMessages,
      pageErrors,
      failedRequests,
      rootContent
    };

    fs.writeFileSync('browser-error-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Error report saved to browser-error-report.json');

    // Keep browser open for inspection
    console.log('\n⏸️  Browser will stay open. Press Ctrl+C to close.');
    await page.waitForTimeout(300000); // 5 minutes

  } catch (error) {
    console.error('❌ Error during capture:', error);
  }
}

captureErrors().catch(console.error);
