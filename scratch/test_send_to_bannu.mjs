import { chromium } from "playwright";

async function run() {
  console.log("=== TARGETED TEST: SEND TO CANDIDATE bannu@gmail.com ===");
  const browser = await chromium.launch({ headless: true });

  // STEP 1: Log in as candidate bannu@gmail.com to get their UID from the browser session
  const candidateCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const candidatePage = await candidateCtx.newPage();

  console.log("1. Candidate logging in to obtain UID...");
  await candidatePage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  await candidatePage.locator('input[type="email"]').first().fill("bannu@gmail.com");
  await candidatePage.locator('input[type="password"]').first().fill("bannu999");
  await candidatePage.locator('button[type="submit"]').first().click();
  await candidatePage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await candidatePage.waitForTimeout(3000);

  // Get candidate UID from localStorage or page context
  const candidateUid = await candidatePage.evaluate(async () => {
    return new Promise((resolve) => {
      // Find auth state from indexedDB or Firebase config
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith("firebase:authUser")) {
          const authData = JSON.parse(localStorage.getItem(k) || "{}");
          return resolve(authData.uid);
        }
      }
      resolve(null);
    });
  });

  console.log("   Candidate UID resolved:", candidateUid);

  // STEP 2: Log in as employer bannuemployer@gmail.com and send message to candidateUid
  const employerCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const employerPage = await employerCtx.newPage();

  console.log("\n2. Employer logging in...");
  await employerPage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  await employerPage.locator('input[type="email"]').first().fill("bannuemployer@gmail.com");
  await employerPage.locator('input[type="password"]').first().fill("bannu999");
  await employerPage.locator('button[type="submit"]').first().click();
  await employerPage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await employerPage.waitForTimeout(3000);

  // Send message directly to candidateUid via the employer's authenticated fetch
  console.log("3. Sending interview invitation to candidate UID:", candidateUid);
  const sendResult = await employerPage.evaluate(async ({ targetUid }) => {
    // Get Firebase ID token
    let token = "";
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("firebase:authUser")) {
        const authData = JSON.parse(localStorage.getItem(k) || "{}");
        token = authData.stsTokenManager?.accessToken || "";
      }
    }

    const content = "Hello Bannu! We reviewed your verified technical assessments on MeritLane and would love to invite you for a Senior Software Engineer interview with our engineering team.";

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        recipientId: targetUid,
        content: content
      })
    });

    const data = await res.json();
    return { status: res.status, data };
  }, { targetUid: candidateUid });

  console.log("   Send Result:", JSON.stringify(sendResult));

  // STEP 3: Now refresh Candidate's Inbox page
  console.log("\n4. Candidate refreshing /candidate/inbox to verify message delivery...");
  await candidatePage.goto("https://merit-lane.vercel.app/candidate/inbox", { waitUntil: "networkidle" });
  await candidatePage.waitForTimeout(4000);

  const screenshotPath = "C:/Users/saitr/.gemini/antigravity-ide/brain/1085409c-bedd-43c1-823e-efeb7b337ea1/candidate_inbox_delivered.png";
  await candidatePage.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ Screenshot saved to: ${screenshotPath}`);

  const inboxText = await candidatePage.innerText("body");
  console.log("\n=== CANDIDATE INBOX CONTENTS ===");
  console.log(inboxText);
  console.log("================================\n");

  await candidateCtx.close();
  await employerCtx.close();
  await browser.close();
}

run();
