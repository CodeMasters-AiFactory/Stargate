import { chromium } from 'playwright';

async function openBrowser() {
  console.log('🌐 Launching browser...');

  const browser = await chromium.launch({
    headless: false, // Show the browser window
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null, // Use full window size
  });

  const page = await context.newPage();

  console.log('📍 Navigating to http://localhost:5000...');
  await page.goto('http://localhost:5000', {
    waitUntil: 'domcontentloaded', // Just wait for DOM to load, not all network requests
    timeout: 30000 // 30 second timeout
  });

  // Wait a bit more for React to render
  await page.waitForTimeout(3000);

  console.log('✅ Page loaded!');
  console.log('📸 Taking screenshot...');

  await page.screenshot({ path: 'page-loaded.png', fullPage: true });

  console.log('✅ Screenshot saved as page-loaded.png');
  console.log('');
  console.log('Browser will stay open. Check the browser window!');
  console.log('Press Ctrl+C to close when done.');

  // Keep the browser open
  await page.waitForTimeout(300000); // Wait 5 minutes before auto-closing

  await browser.close();
}

openBrowser().catch(console.error);
