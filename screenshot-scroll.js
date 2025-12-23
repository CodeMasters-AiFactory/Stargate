const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:8080');
  await page.evaluate(() => window.scrollTo(0, 850));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/CURSOR PROJECTS/StargatePortal/PHOENIX-F1-STATS.png' });
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/CURSOR PROJECTS/StargatePortal/PHOENIX-F1-CARDS.png' });
  await browser.close();
  console.log('Screenshots captured!');
})();
