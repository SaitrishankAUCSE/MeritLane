import { chromium } from "playwright";

async function run() {
  console.log("=== PLAYWRIGHT CANDIDATE INBOX VERIFICATION ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log("1. Navigating to login page...");
    await page.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    console.log("2. Entering candidate credentials (bannu@gmail.com / bannu999)...");
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill("bannu@gmail.com");
    await passwordInput.fill("bannu999");

    console.log("3. Submitting login form...");
    const submitBtn = page.locator('button[type="submit"]:has-text("Sign In")').first();
    await submitBtn.click();

    console.log("4. Waiting for authentication and redirection from /login...");
    try {
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
      console.log("   Redirected to:", page.url());
    } catch (e) {
      console.log("   Still on URL:", page.url());
    }

    await page.waitForTimeout(2000);

    // If role selector is shown
    const candidateRoleBtn = page.locator('button:has-text("Candidate"), div:has-text("Candidate")').first();
    if (await candidateRoleBtn.isVisible().catch(() => false)) {
      console.log("   Role selection modal detected. Selecting Candidate role...");
      await candidateRoleBtn.click();
      const confirmBtn = page.locator('button:has-text("Continue"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
      }
      await page.waitForTimeout(2000);
    }

    console.log("5. Navigating to https://merit-lane.vercel.app/candidate/inbox ...");
    await page.goto("https://merit-lane.vercel.app/candidate/inbox", { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);

    console.log("6. Final URL:", page.url());

    // Screenshot candidate inbox
    const artifactPath = "C:/Users/saitr/.gemini/antigravity-ide/brain/1085409c-bedd-43c1-823e-efeb7b337ea1/candidate_inbox_verified.png";
    await page.screenshot({ path: artifactPath, fullPage: true });
    console.log(`✓ Screenshot saved to: ${artifactPath}`);

    // Extract text from the page
    const pageText = await page.innerText("body");
    console.log("\n=== CANDIDATE INBOX SCREEN CONTENT ===");
    console.log(pageText);
    console.log("=======================================\n");

  } catch (err) {
    console.error("Error during verification:", err);
  } finally {
    await browser.close();
    console.log("=== PLAYWRIGHT VERIFICATION COMPLETE ===");
  }
}

run();
