const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/login');
  // Need to login first or just see if it redirects to login
  await page.goto('http://localhost:3000/candidate/assessment');
  console.log('Final URL:', page.url());
  
  await browser.close();
})();
