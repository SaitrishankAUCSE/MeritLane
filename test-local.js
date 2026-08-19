const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to local dev server
  await page.goto('http://localhost:3000');
  
  // Wait a moment for the animation to start
  await page.waitForTimeout(500);
  
  // Take a screenshot
  await page.screenshot({ path: 'local-intro-screenshot.png' });
  console.log("Screenshot saved to local-intro-screenshot.png");
  
  await browser.close();
})();
