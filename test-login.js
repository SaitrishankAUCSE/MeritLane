const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', (err) => {
    console.log('PAGE ERROR:', err.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/login');
  
  console.log("Waiting for auth switch to load...");
  await page.waitForSelector('input[name="email"]');
  
  console.log("Filling form...");
  await page.type('input[name="email"]', 'testcandidate@example.com');
  await page.type('input[name="password"]', 'password123');
  
  console.log("Clicking sign in...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for navigation...");
  // Wait for either the dashboard to load, or the error to appear
  try {
    await page.waitForNavigation({ timeout: 10000 });
    console.log("Navigated to:", page.url());
    
    // Wait a bit to see if client-side crash happens
    await new Promise(r => setTimeout(r, 3000));
    console.log("Final URL:", page.url());
  } catch (e) {
    console.log("Navigation timeout or error:", e.message);
  }
  
  await browser.close();
})();
