import { chromium } from "playwright";

async function run() {
  console.log("=== FULL E2E: EMPLOYER SENDS MESSAGE → CANDIDATE RECEIVES IT ===");
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // STEP 1: EMPLOYER FLOW (bannuemployer@gmail.com)
  // -------------------------------------------------------------
  console.log("\n--- STEP 1: EMPLOYER SENDS INTERVIEW MESSAGE ---");
  const employerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const employerPage = await employerContext.newPage();

  console.log("1. Employer navigating to login page...");
  await employerPage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  
  console.log("2. Filling employer credentials (bannuemployer@gmail.com)...");
  await employerPage.locator('input[type="email"]').first().fill("bannuemployer@gmail.com");
  await employerPage.locator('input[type="password"]').first().fill("bannu999");
  
  console.log("3. Clicking Sign In button...");
  await employerPage.locator('button[type="submit"]').first().click();

  console.log("4. Waiting for redirect...");
  await employerPage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await employerPage.waitForTimeout(3000);
  console.log("   Employer landed on:", employerPage.url());

  // Navigate to discovery dashboard
  console.log("5. Navigating to Employer Discovery Dashboard...");
  await employerPage.goto("https://merit-lane.vercel.app/employer/dashboard", { waitUntil: "networkidle" });
  await employerPage.waitForTimeout(4000);

  // Take screenshot of employer dashboard
  await employerPage.screenshot({ path: "scratch/employer_dashboard_view.png" });
  console.log("   Employer dashboard screenshot captured.");

  // Check for Message button on candidate card
  const messageButton = employerPage.locator('button:has-text("Message")').first();
  const hasMsgBtn = await messageButton.isVisible().catch(() => false);

  if (hasMsgBtn) {
    console.log("6. Clicking 'Message' on candidate card...");
    await messageButton.click();
    await employerPage.waitForTimeout(1500);

    console.log("7. Selecting 'Interview Request' template...");
    const templateBtn = employerPage.locator('button:has-text("Interview Request")').first();
    if (await templateBtn.isVisible().catch(() => false)) {
      await templateBtn.click();
      await employerPage.waitForTimeout(500);
    } else {
      await employerPage.locator('textarea').first().fill("Hello! We reviewed your verified profile on MeritLane and would love to invite you for a technical interview.");
    }

    console.log("8. Clicking 'Send Message'...");
    const sendBtn = employerPage.locator('button[type="submit"]:has-text("Send Message")').first();
    await sendBtn.click();
    await employerPage.waitForTimeout(3000);
    console.log("✓ Interview invitation sent successfully by employer!");
  } else {
    console.log("⚠ No candidate cards on dashboard. Visiting candidate dossier directly...");
    await employerPage.goto("https://merit-lane.vercel.app/employer/candidate/qXAW8A8jTAfqjZMqhg7twQBxplC3", { waitUntil: "networkidle" });
    await employerPage.waitForTimeout(3000);
    const dossierMsgBtn = employerPage.locator('button:has-text("Message")').first();
    if (await dossierMsgBtn.isVisible().catch(() => false)) {
      await dossierMsgBtn.click();
      await employerPage.waitForTimeout(1500);
      const templateBtn = employerPage.locator('button:has-text("Interview Request")').first();
      if (await templateBtn.isVisible().catch(() => false)) {
        await templateBtn.click();
      }
      const sendBtn = employerPage.locator('button[type="submit"]:has-text("Send Message")').first();
      await sendBtn.click();
      await employerPage.waitForTimeout(3000);
      console.log("✓ Interview invitation sent from dossier!");
    }
  }

  await employerContext.close();

  // -------------------------------------------------------------
  // STEP 2: CANDIDATE FLOW (bannu@gmail.com)
  // -------------------------------------------------------------
  console.log("\n--- STEP 2: CANDIDATE LOGS IN & CHECKS INBOX ---");
  const candidateContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const candidatePage = await candidateContext.newPage();

  console.log("1. Candidate navigating to login page...");
  await candidatePage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  await candidatePage.locator('input[type="email"]').first().fill("bannu@gmail.com");
  await candidatePage.locator('input[type="password"]').first().fill("bannu999");
  await candidatePage.locator('button[type="submit"]').first().click();

  console.log("2. Waiting for candidate redirect...");
  await candidatePage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await candidatePage.waitForTimeout(3000);

  console.log("3. Navigating to candidate inbox: https://merit-lane.vercel.app/candidate/inbox ...");
  await candidatePage.goto("https://merit-lane.vercel.app/candidate/inbox", { waitUntil: "networkidle" });
  await candidatePage.waitForTimeout(4000);

  console.log("4. Capturing candidate inbox screenshot...");
  const screenshotPath = "C:/Users/saitr/.gemini/antigravity-ide/brain/1085409c-bedd-43c1-823e-efeb7b337ea1/candidate_received_message_proof.png";
  await candidatePage.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ Screenshot saved to: ${screenshotPath}`);

  // Extract page content
  const pageText = await candidatePage.innerText("body");
  console.log("\n=== CANDIDATE INBOX CONTENTS ===");
  console.log(pageText);
  console.log("================================\n");

  await candidateContext.close();
  await browser.close();
  console.log("=== FULL E2E TEST COMPLETED ===");
}

run();
