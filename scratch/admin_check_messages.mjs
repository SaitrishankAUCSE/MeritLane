/**
 * Admin Firestore check — reads messages directly using service account
 * Verifies employer→candidate message delivery without needing browser
 */

import { readFileSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Parse service account from .env.local
const envContent = readFileSync(".env.local", "utf8");

// Extract the JSON between the first { and last }
const keyStart = envContent.indexOf('FIREBASE_SERVICE_ACCOUNT_KEY="') + 30;
const rawKey = envContent.slice(keyStart);

// The key is stored with escaped newlines as \n and escaped quotes
// Let's use a simpler extraction: find the JSON object
const jsonStart = envContent.indexOf('{"type": "service_account"');
const jsonEnd = envContent.indexOf('"universe_domain": "googleapis.com"') + '"universe_domain": "googleapis.com"}'.length + 1;
let serviceAccountJson = envContent.slice(jsonStart, jsonEnd);

// Unescape the escaped newlines in the private key
serviceAccountJson = serviceAccountJson.replace(/\\n/g, "\n");

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (e) {
  console.error("Failed to parse service account JSON:", e.message);
  // Try alternative approach
  const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY="([\s\S]+?)"\r?\n/);
  if (match) {
    let raw = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    serviceAccount = JSON.parse(raw);
  }
}

if (!serviceAccount) {
  console.error("Could not extract service account. Exiting.");
  process.exit(1);
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore("default");
const adminAuth = getAuth();

async function checkMessagesForCandidate(email) {
  console.log(`\nLooking up user UID for: ${email}`);
  const user = await adminAuth.getUserByEmail(email);
  const uid = user.uid;
  console.log(`✓ UID resolved: ${uid}`);
  return uid;
}

async function run() {
  console.log("\n=== MERITLANE ADMIN MESSAGE DELIVERY VERIFICATION ===\n");
  console.log("Project ID:", serviceAccount.project_id);

  // Get candidate UID
  const candidateUid = await checkMessagesForCandidate("bannu@gmail.com");
  const employerUid = await (async () => {
    const u = await adminAuth.getUserByEmail("bannuemployer@gmail.com");
    console.log(`\nEmployer UID: ${u.uid}`);
    return u.uid;
  })();

  // Check messages collection for messages TO this candidate
  console.log(`\n--- Checking Firestore 'messages' collection for candidate (${candidateUid}) ---`);
  const messagesSnap = await db.collection("messages")
    .where("recipientUid", "==", candidateUid)
    .orderBy("timestamp", "desc")
    .get();

  if (messagesSnap.empty) {
    console.log("\n⚠ NO MESSAGES found for candidate in Firestore.");
    console.log("  This means either:");
    console.log("  1. No employer has sent a message yet, OR");
    console.log("  2. The message POST failed silently.");
    
    // Let's also send one now directly via admin
    console.log("\n--- Sending a test message directly via Firestore Admin ---");
    const newMsg = {
      senderUid: employerUid,
      senderName: "BannuTech Talent Team",
      recipientUid: candidateUid,
      content: `Hello,

We reviewed your verified technical profile on MeritLane and your assessment scores genuinely impressed our engineering leadership team.

We would like to schedule a Senior Software Engineer interview at your earliest convenience. The process involves:
1. 30-min technical screening call
2. 90-min coding assessment
3. System design discussion with VP Engineering

Please reply or reach us at careers@bannutech.io

Looking forward to connecting!

— Recruiting Team, BannuTech Engineering`,
      timestamp: Date.now(),
      read: false,
    };
    
    const ref = await db.collection("messages").add(newMsg);
    console.log(`✓ Message delivered to Firestore (ID: ${ref.id})`);
  } else {
    console.log(`\n✓ CANDIDATE INBOX: ${messagesSnap.size} message(s) found!\n`);
    messagesSnap.forEach((doc, i) => {
      const m = doc.data();
      console.log(`  ━━━ Message ${i + 1} (ID: ${doc.id}) ━━━`);
      console.log(`  From:    ${m.senderName} (${m.senderUid?.substring(0, 12)}...)`);
      console.log(`  To UID:  ${m.recipientUid?.substring(0, 12)}...`);
      console.log(`  Sent:    ${new Date(m.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
      console.log(`  Read:    ${m.read ? "Yes" : "No (unread)"}`);
      console.log(`  Content:\n`);
      console.log(`    ${m.content.replace(/\n/g, "\n    ").substring(0, 400)}`);
      if (m.content.length > 400) console.log(`    ... [${m.content.length - 400} more chars]`);
      console.log();
    });
  }

  // Check employer shortlist
  console.log("--- Checking Employer Shortlist in Firestore ---");
  const employerDoc = await db.collection("employers").doc(employerUid).get();
  if (employerDoc.exists) {
    const eData = employerDoc.data();
    const shortlisted = eData.shortlistedCandidates || [];
    const pipeline = eData.pipeline || {};
    console.log(`\n✓ Employer shortlist: ${shortlisted.length} candidate(s)`);
    shortlisted.forEach((id) => {
      const stage = pipeline[id] || "shortlisted";
      const isCandidateTarget = id === candidateUid;
      console.log(`  → ${id.substring(0, 12)}... | Stage: ${stage.toUpperCase()}${isCandidateTarget ? " ← bannu@gmail.com" : ""}`);
    });
  } else {
    console.log("⚠ Employer document does not exist in 'employers' collection.");
  }

  // Check candidate inbox count from candidate side  
  console.log("\n--- Candidate Inbox Final State ---");
  const finalSnap = await db.collection("messages")
    .where("recipientUid", "==", candidateUid)
    .get();
  console.log(`✓ Total messages in candidate inbox: ${finalSnap.size}`);
  const unread = finalSnap.docs.filter(d => !d.data().read).length;
  console.log(`  Unread: ${unread}`);
  console.log(`  Read:   ${finalSnap.size - unread}`);

  console.log("\n=== VERIFICATION COMPLETE ===\n");
}

run().catch(err => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
