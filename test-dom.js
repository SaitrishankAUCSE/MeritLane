const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set up console listener
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(500);
  
  const hasIntro = await page.evaluate(() => {
    return !!document.querySelector('svg');
  });
  
  console.log('SVG exists in DOM?', hasIntro);
  
  const path = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return null;
    return svg.innerHTML;
  });
  
  if (path) {
    console.log('SVG innerHTML:', path.substring(0, 200));
  }
  
  await browser.close();
})();
