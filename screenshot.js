const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  
  await page.goto('http://localhost:5000/merlin8');
  await page.waitForTimeout(1000);
  
  // Try to click Skip Tour if it exists
  try {
    await page.click('text=Skip Tour', { timeout: 3000 });
    await page.waitForTimeout(500);
  } catch (e) {
    console.log('No tour modal found or already dismissed');
  }
  
  // Try to click X button if modal still exists
  try {
    await page.click('[aria-label="Close"]', { timeout: 1000 });
  } catch (e) {}
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:\\CURSOR PROJECTS\\StargatePortal\\MERLIN8-UI-FINAL.png', fullPage: true });
  
  await browser.close();
})();
