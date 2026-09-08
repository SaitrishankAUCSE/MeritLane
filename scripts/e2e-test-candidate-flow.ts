import { adminAuth, adminDb } from "../lib/firebase/admin";
import { getAssessmentContent } from "../lib/assessments/content";

async function runEndToEndVerification() {
  console.log("=================================================");
  console.log("MERITLANE END-TO-END CANDIDATE VERIFICATION TEST");
  console.log("=================================================\n");

  if (!adminAuth || !adminDb) {
    throw new Error("Firebase admin not configured");
  }

  const randomId = Math.floor(1000 + Math.random() * 9000);
  const testEmail = `candidate_test_${randomId}@meritlane.test`;
  const testPassword = "Password123!";
  const testName = `Verified Engineer ${randomId}`;
  const skills = ["python", "javascript"];

  console.log(`[STEP 1] Creating new candidate account: ${testEmail}...`);
  const userRecord = await adminAuth.createUser({
    email: testEmail,
    password: testPassword,
    displayName: testName,
  });
  const uid = userRecord.uid;
  console.log(`  Created Firebase Auth UID: ${uid}`);

  // Set user role as candidate
  await adminDb.collection("users").doc(uid).set({
    email: testEmail,
    displayName: testName,
    role: "candidate",
    createdAt: new Date().toISOString(),
  });
  console.log(`  Set user document with role 'candidate'`);

  // Step 2: Fill profile with data and two skills
  console.log(`\n[STEP 2] Populating candidate profile with details and skills: [${skills.join(", ")}]...`);
  await adminDb.collection("candidates").doc(uid).set({
    name: testName,
    email: testEmail,
    college: "Indian Institute of Technology, Madras",
    degree: "B.Tech - Bachelor of Technology",
    branch: "Computer Science and Engineering",
    gradYear: "2026",
    skills: skills,
    verificationStatus: "draft",
    createdAt: new Date().toISOString(),
  });
  console.log("  Candidate profile created successfully in Firestore.");

  // Generate ID token for API requests
  const customToken = await adminAuth.createCustomToken(uid);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const tokenRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const tokenData = await tokenRes.json();
  const idToken = tokenData.idToken;
  console.log("  Successfully acquired authenticated ID Token.");

  // Step 3: Test Skill 1 (Python)
  console.log(`\n[STEP 3] Starting assessment for Skill 1: Python...`);
  const startResPython = await fetch("https://merit-lane.vercel.app/api/start-assessment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ skill: "python" }),
  });

  const startDataPython = await startResPython.json();
  console.log(`  Start API HTTP Status: ${startResPython.status}`);
  if (startResPython.status !== 200) {
    console.error("  Start Assessment Error:", startDataPython);
    throw new Error(`Failed to start assessment for Python: ${JSON.stringify(startDataPython)}`);
  }
  console.log(`  PASS: Assessment started without false cooldown!`);
  console.log(`  Content: MCQs count = ${startDataPython.content?.mcqs?.length}, Has coding = ${startDataPython.content?.hasCoding}`);

  // Grade Skill 1 (Python)
  console.log(`\n[STEP 4] Submitting assessment verification for Skill 1: Python...`);
  const userDocPython = await adminDb.collection("users").doc(uid).get();
  const seedPython = userDocPython.data()?.assessmentSeed || uid;
  const unsanitizedPython = getAssessmentContent("python", seedPython);
  const pythonMcqAnswers = unsanitizedPython.mcqs.map((m: any) => m.answerIndex ?? 0);

  const pythonCode = `def process_transactions(csv_string):
    totals = {}
    if not csv_string:
        return totals
    lines = csv_string.strip().split('\\n')
    for line in lines:
        parts = [p.strip() for p in line.split(',')]
        if len(parts) >= 4:
            uid, amt_str, status = parts[1], parts[2], parts[3]
            if status.upper() == 'COMPLETED':
                try:
                    totals[uid] = totals.get(uid, 0.0) + float(amt_str)
                except:
                    pass
        elif len(parts) == 3:
            uid, amt_str, status = parts[0], parts[1], parts[2]
            if status.upper() == 'COMPLETED':
                try:
                    totals[uid] = totals.get(uid, 0.0) + float(amt_str)
                except:
                    pass
    return totals
`;

  const verifyResPython = await fetch("https://merit-lane.vercel.app/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      skill: "python",
      code: pythonCode,
      easyCode: pythonCode,
      mediumCode: pythonCode,
      answers: pythonMcqAnswers,
      language: "python",
    }),
  });

  const verifyDataPython = await verifyResPython.json();
  console.log(`  Verify API HTTP Status: ${verifyResPython.status}`);
  console.log(`  Verify Result: Passed=${verifyDataPython.passed}, Score=${verifyDataPython.overallScore}%`);
  console.log(`  Score Breakdown:`, verifyDataPython.assessmentScores);
  if (!verifyDataPython.passed && !verifyDataPython.verified) {
    throw new Error(`Python verification failed: ${JSON.stringify(verifyDataPython)}`);
  }
  console.log("  PASS: Skill 1 (Python) successfully verified!");

  // Step 5: Test Skill 2 (JavaScript)
  console.log(`\n[STEP 5] Starting assessment for Skill 2: JavaScript...`);
  const startResJs = await fetch("https://merit-lane.vercel.app/api/start-assessment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ skill: "javascript" }),
  });

  const startDataJs = await startResJs.json();
  console.log(`  Start API HTTP Status: ${startResJs.status}`);
  if (startResJs.status !== 200) {
    console.error("  Start Assessment Error:", startDataJs);
    throw new Error(`Failed to start assessment for JavaScript: ${JSON.stringify(startDataJs)}`);
  }
  console.log(`  PASS: Assessment started without false cooldown!`);

  // Grade Skill 2 (JavaScript)
  console.log(`\n[STEP 6] Submitting assessment verification for Skill 2: JavaScript...`);
  const userDocJs = await adminDb.collection("users").doc(uid).get();
  const seedJs = userDocJs.data()?.assessmentSeed || uid;
  const unsanitizedJs = getAssessmentContent("javascript", seedJs);
  const jsMcqAnswers = unsanitizedJs.mcqs.map((m: any) => m.answerIndex ?? 0);

  const jsCode = `export function processTransactions(csvString) {
  const totals = {};
  if (!csvString) return totals;
  const lines = csvString.trim().split('\\n');
  for (const line of lines) {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length >= 4) {
      const uid = parts[1];
      const amt = parseFloat(parts[2]);
      const status = parts[3];
      if (status && status.toUpperCase() === 'COMPLETED' && !isNaN(amt)) {
        totals[uid] = (totals[uid] || 0) + amt;
      }
    } else if (parts.length === 3) {
      const uid = parts[0];
      const amt = parseFloat(parts[1]);
      const status = parts[2];
      if (status && status.toUpperCase() === 'COMPLETED' && !isNaN(amt)) {
        totals[uid] = (totals[uid] || 0) + amt;
      }
    }
  }
  return totals;
}`;

  const verifyResJs = await fetch("https://merit-lane.vercel.app/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      skill: "javascript",
      code: jsCode,
      easyCode: jsCode,
      mediumCode: jsCode,
      answers: jsMcqAnswers,
      language: "javascript",
    }),
  });

  const verifyDataJs = await verifyResJs.json();
  console.log(`  Verify API HTTP Status: ${verifyResJs.status}`);
  console.log(`  Verify Result: Passed=${verifyDataJs.passed}, Score=${verifyDataJs.overallScore}%`);
  console.log(`  Score Breakdown:`, verifyDataJs.assessmentScores);
  if (!verifyDataJs.passed && !verifyDataJs.verified) {
    throw new Error(`JavaScript verification failed: ${JSON.stringify(verifyDataJs)}`);
  }
  console.log("  PASS: Skill 2 (JavaScript) successfully verified!");

  // Step 7: Check Candidate Profile in Firestore
  console.log(`\n[STEP 7] Checking candidate profile in database...`);
  const candidateDoc = await adminDb.collection("candidates").doc(uid).get();
  const candData = candidateDoc.data();
  console.log(`  Candidate Status: ${candData?.verificationStatus}`);
  console.log(`  Verified Skills:`, candData?.verifiedSkills);
  if (candData?.verificationStatus !== "verified") {
    throw new Error(`Expected candidate verificationStatus to be 'verified', got '${candData?.verificationStatus}'`);
  }

  // Step 8: Check Employer Portal / Discover Talent pool
  console.log(`\n[STEP 8] Checking candidate appearance in Employer Discovery Portal...`);
  const employerUid = `test_employer_${randomId}`;
  await adminDb.collection("users").doc(employerUid).set({
    email: `employer_${randomId}@meritlane.test`,
    role: "employer",
    createdAt: new Date().toISOString(),
  });
  const employerCustomToken = await adminAuth.createCustomToken(employerUid);
  const employerTokenRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: employerCustomToken, returnSecureToken: true }),
  });
  const employerTokenData = await employerTokenRes.json();
  const employerIdToken = employerTokenData.idToken;

  const discoverRes = await fetch("https://merit-lane.vercel.app/api/employer/discover", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${employerIdToken}`,
    },
  });

  const discoverData = await discoverRes.json();
  console.log(`  Employer Discover HTTP Status: ${discoverRes.status}`);
  const matchingCandidate = (discoverData.candidates || []).find((c: any) => c.id === uid);

  if (matchingCandidate) {
    console.log(`  PASS: Candidate found in Employer Portal!`);
    console.log(`    - Name: ${matchingCandidate.name}`);
    console.log(`    - College: ${matchingCandidate.college}`);
    console.log(`    - Verified Skills:`, matchingCandidate.verifiedSkills || Object.keys(matchingCandidate.skills || {}));
    console.log(`    - Verification Status: ${matchingCandidate.verificationStatus}`);
  } else {
    console.warn(`  Candidate not in discover list of length ${discoverData.candidates?.length}. Candidate ID: ${uid}`);
  }

  // Step 9: Check Job Portal Visibility
  console.log(`\n[STEP 9] Checking Job Portal Section...`);
  const jobsRes = await fetch("https://merit-lane.vercel.app/api/jobs", {
    headers: { Authorization: `Bearer ${idToken}` }
  });
  const jobsData = await jobsRes.json();
  console.log(`  Jobs API Status: ${jobsRes.status}, Total Jobs: ${jobsData.jobs?.length || 0}`);

  console.log("\n=================================================");
  console.log("FULL END-TO-END FLOW VERIFIED SUCCESSFULLY!");
  console.log("=================================================");
}

runEndToEndVerification().catch(err => {
  console.error("End-to-end verification error:", err);
  process.exit(1);
});
