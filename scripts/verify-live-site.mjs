import { chromium } from "playwright";
import path from "node:path";

async function checkSite() {
  console.log("Launching headless browser via Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const artifactDir = "C:\\Users\\saitr\\.gemini\\antigravity-ide\\brain\\5d438e1b-5501-461d-aba2-a2ae9edac0aa";

  console.log("Navigating to https://merit-lane.vercel.app/ ...");
  await page.goto("https://merit-lane.vercel.app/", { waitUntil: "networkidle" });
  console.log("Page Title:", await page.title());

  const landingPath = path.join(artifactDir, "prod_live_landing.png");
  await page.screenshot({ path: landingPath, fullPage: false });
  console.log("Saved landing screenshot to:", landingPath);

  console.log("Navigating to https://merit-lane.vercel.app/candidate/assessment ...");
  await page.goto("https://merit-lane.vercel.app/candidate/assessment", { waitUntil: "networkidle" });
  console.log("Assessment Page Title:", await page.title());

  const assessPath = path.join(artifactDir, "prod_live_assessment.png");
  await page.screenshot({ path: assessPath, fullPage: false });
  console.log("Saved assessment screenshot to:", assessPath);

  await browser.close();
  console.log("Playwright browser check completed successfully!");
}

checkSite().catch(err => {
  console.error("Playwright verification error:", err);
  process.exit(1);
});
