const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--start-maximized']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'candidate@test.com');
  await page.type('input[type="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:3000/candidate/assessment?skill=MySQL', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Clicking the Start Assessment button...');
  const startBtn = await page.waitForSelector('button ::-p-text(Start Assessment)');
  await startBtn.click();
  await new Promise(r => setTimeout(r, 3000));

  const afterClickState = await page.evaluate(() => ({
    fullscreenElement: Boolean(document.fullscreenElement),
    fullscreenEnabled: document.fullscreenEnabled,
    url: window.location.href
  }));
  console.log('After click state:', afterClickState);

  await browser.close();
})();
