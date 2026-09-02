import { chromium } from "playwright";

async function run() {
  console.log("=== TARGETED TEST: SEND TO CANDIDATE bannu@gmail.com ===");
  const browser = await chromium.launch({ headless: true });

  // STEP 1: Log in as candidate bannu@gmail.com to get their UID
  const candidateCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const candidatePage = await candidateCtx.newPage();

  console.log("1. Candidate logging in (bannu@gmail.com / bannu999)...");
  await candidatePage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  await candidatePage.locator('input[type="email"]').first().fill("bannu@gmail.com");
  await candidatePage.locator('input[type="password"]').first().fill("bannu999");
  await candidatePage.locator('button[type="submit"]').first().click();
  await candidatePage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await candidatePage.waitForTimeout(3000);

  // Read Firebase Auth from IndexedDB in candidate browser
  const candidateAuth = await candidatePage.evaluate(async () => {
    return new Promise((resolve) => {
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(["firebaseLocalStorage"], "readonly");
          const store = tx.objectStore("firebaseLocalStorage");
          const getAll = store.getAll();
          getAll.onsuccess = () => {
            const items = getAll.result || [];
            for (const item of items) {
              if (item.value && item.value.uid) {
                return resolve({
                  uid: item.value.uid,
                  email: item.value.email,
                  token: item.value.stsTokenManager?.accessToken
                });
              }
            }
            resolve(null);
          };
          getAll.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  });

  console.log("   Candidate Auth Info:", JSON.stringify(candidateAuth));

  // STEP 2: Log in as employer bannuemployer@gmail.com
  const employerCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const employerPage = await employerCtx.newPage();

  console.log("\n2. Employer logging in (bannuemployer@gmail.com / bannu999)...");
  await employerPage.goto("https://merit-lane.vercel.app/login", { waitUntil: "networkidle" });
  await employerPage.locator('input[type="email"]').first().fill("bannuemployer@gmail.com");
  await employerPage.locator('input[type="password"]').first().fill("bannu999");
  await employerPage.locator('button[type="submit"]').first().click();
  await employerPage.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 20000 });
  await employerPage.waitForTimeout(3000);

  // Send message using the employer's token from IndexedDB
  console.log("3. Sending interview invitation to candidate UID:", candidateAuth.uid);
  const sendResult = await employerPage.evaluate(async ({ targetUid }) => {
    return new Promise((resolve) => {
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onsuccess = async () => {
        const db = req.result;
        try {
          const tx = db.transaction(["firebaseLocalStorage"], "readonly");
          const store = tx.objectStore("firebaseLocalStorage");
          const getAll = store.getAll();
          getAll.onsuccess = async () => {
            const items = getAll.result || [];
            let token = "";
            for (const item of items) {
              if (item.value && item.value.stsTokenManager) {
                token = item.value.stsTokenManager.accessToken;
                break;
              }
            }

            const content = `Hello Bannu!

We reviewed your verified technical assessments and code repositories on MeritLane and were thoroughly impressed by your problem-solving depth.

We would like to invite you for a 45-minute technical interview for our Senior Software Engineering team.

Please reply to this message or contact us at hiring@bannutech.io to confirm your availability.

Best regards,
BannuTech Global Engineering Team`;

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
            resolve({ status: res.status, data });
          };
        } catch (e) {
          resolve({ error: e.message });
        }
      };
      req.onerror = () => resolve({ error: "IndexedDB failed" });
    });
  }, { targetUid: candidateAuth.uid });

  console.log("   Send Result:", JSON.stringify(sendResult));

  // STEP 3: Refresh Candidate's Inbox page
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
