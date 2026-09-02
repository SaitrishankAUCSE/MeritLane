/**
 * End-to-end message delivery test:
 * 1. Get a valid Firebase ID token for bannuemployer@gmail.com
 * 2. Find a candidate UID for bannu@gmail.com in Firestore  
 * 3. POST a message via /api/messages as the employer
 * 4. GET messages as the candidate and verify delivery
 */

const BASE_URL = "https://merit-lane.vercel.app";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function getFirebaseToken(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Firebase sign-in failed for ${email}: ${err.error?.message}`);
  }
  const data = await res.json();
  return { idToken: data.idToken, localId: data.localId };
}

async function apiCall(method, path, token, body) {
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  if (!FIREBASE_API_KEY) {
    console.error("NEXT_PUBLIC_FIREBASE_API_KEY not set in environment");
    process.exit(1);
  }

  console.log("\n=== MERITLANE EMPLOYER→CANDIDATE MESSAGE DELIVERY TEST ===\n");

  // STEP 1: Login as employer
  console.log("STEP 1: Signing in as EMPLOYER (bannuemployer@gmail.com)...");
  const employer = await getFirebaseToken("bannuemployer@gmail.com", "bannu999");
  console.log(`  ✓ Employer UID: ${employer.localId}`);

  // STEP 2: Login as candidate to get their UID
  console.log("\nSTEP 2: Signing in as CANDIDATE (bannu@gmail.com) to get UID...");
  const candidate = await getFirebaseToken("bannu@gmail.com", "bannu999");
  console.log(`  ✓ Candidate UID: ${candidate.localId}`);

  // STEP 3: Discover candidates as employer
  console.log("\nSTEP 3: Employer searches for candidates via Discovery Engine...");
  const discover = await apiCall("POST", "/api/employer/discover", employer.idToken, { searchQuery: "", skills: [] });
  console.log(`  [${discover.status}] Discovery API`);
  if (discover.data.candidates?.length > 0) {
    console.log(`  ✓ Found ${discover.data.candidates.length} verified candidate(s).`);
    discover.data.candidates.forEach((c, i) => {
      console.log(`    [${i + 1}] ${c.name || "Anonymous"} (UID: ${c.uid.substring(0, 12)}...)`);
    });
  } else {
    console.log("  ⚠ No verified candidates found. Message will be sent directly using known UID.");
  }

  // STEP 4: Employer shortlists the candidate
  console.log("\nSTEP 4: Employer shortlists the candidate...");
  const shortlist = await apiCall("POST", "/api/employer/shortlist", employer.idToken, {
    candidateId: candidate.localId,
  });
  console.log(`  [${shortlist.status}] Shortlist API → ${JSON.stringify(shortlist.data)}`);

  // STEP 5: Employer sets pipeline stage to "interviewing"
  console.log("\nSTEP 5: Employer updates pipeline stage to INTERVIEWING...");
  const pipeline = await apiCall("POST", "/api/employer/pipeline", employer.idToken, {
    candidateId: candidate.localId,
    stage: "interviewing",
  });
  console.log(`  [${pipeline.status}] Pipeline API → ${JSON.stringify(pipeline.data)}`);

  // STEP 6: Employer generates AI Summary for candidate
  console.log("\nSTEP 6: Employer requests AI Recruiter Brief for the candidate...");
  const ai = await apiCall("POST", "/api/employer/ai-summary", employer.idToken, {
    candidateId: candidate.localId,
  });
  console.log(`  [${ai.status}] AI Summary API`);
  if (ai.data.summary) {
    console.log(`  ✓ AI Recruiter Brief generated:\n`);
    console.log(`     "${ai.data.summary.substring(0, 300)}..."`);
  } else {
    console.log(`  ⚠ Summary: ${JSON.stringify(ai.data)}`);
  }

  // STEP 7: Employer sends an interview invitation message
  const interviewMessage = `Hello,

We reviewed your verified technical profile and evidence on MeritLane — your project work and assessment scores are genuinely impressive.

We would like to invite you for a technical interview for a Senior Software Engineering role on our team. The interview would be a 45-minute technical discussion followed by a short system design exercise.

Please respond to this message or reach out at hiring@bannuemployer.com to schedule a time that works for you.

Looking forward to speaking with you!

— Recruiter, BannuTech Engineering`;

  console.log("\nSTEP 7: Employer sends INTERVIEW INVITATION message to candidate...");
  const msg = await apiCall("POST", "/api/messages", employer.idToken, {
    recipientId: candidate.localId,
    content: interviewMessage,
  });
  console.log(`  [${msg.status}] Messages API → ${JSON.stringify(msg.data)}`);

  // STEP 8: Verify message delivery from candidate's perspective
  console.log("\nSTEP 8: Logging in as CANDIDATE to check inbox...");
  const inbox = await apiCall("GET", "/api/messages", candidate.idToken, null);
  console.log(`  [${inbox.status}] Candidate Inbox API`);
  if (inbox.data.messages?.length > 0) {
    console.log(`  ✓ CANDIDATE INBOX HAS ${inbox.data.messages.length} MESSAGE(S):\n`);
    inbox.data.messages.forEach((m, i) => {
      console.log(`  ─── Message ${i + 1} ───`);
      console.log(`  From:    ${m.senderName}`);
      console.log(`  Date:    ${new Date(m.timestamp).toLocaleString()}`);
      console.log(`  Preview: ${m.content.substring(0, 120)}...`);
      console.log();
    });
  } else {
    console.log(`  ⚠ No messages found in candidate inbox.`);
    console.log(`  Full response: ${JSON.stringify(inbox.data)}`);
  }

  // STEP 9: Verify shortlist from employer's shortlist/list endpoint
  console.log("\nSTEP 9: Verify employer's shortlist contains the candidate...");
  const shortlistList = await apiCall("GET", "/api/employer/shortlist/list", employer.idToken, null);
  console.log(`  [${shortlistList.status}] Shortlist List API`);
  if (shortlistList.data.candidates?.length > 0) {
    console.log(`  ✓ Shortlist has ${shortlistList.data.candidates.length} candidate(s).`);
    shortlistList.data.candidates.forEach((c) => {
      const stage = shortlistList.data.pipeline?.[c.uid] || "shortlisted";
      console.log(`    → ${c.name || "Candidate"} | Stage: ${stage.toUpperCase()}`);
    });
  } else {
    console.log(`  ⚠ Shortlist empty. Response: ${JSON.stringify(shortlistList.data)}`);
  }

  console.log("\n=== END-TO-END FLOW COMPLETE ===\n");
}

run().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
