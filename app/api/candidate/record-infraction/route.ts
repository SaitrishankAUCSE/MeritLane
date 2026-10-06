import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const uid = decodedToken.uid;
  const userRef = adminDb.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userData = userDoc.data() || {};
  const skill = userData.assessmentSkill;
  
  if (!skill) {
    // If no active assessment, tracking a violation doesn't make sense.
    return NextResponse.json({ error: "No active assessment found" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const isForceTerminate = Boolean(body?.forceTerminate);

  // Atomically increment the violation count for the current attempt
  const violationCount = isForceTerminate ? 99 : (userData.assessmentViolationCount || 0) + 1;

  if (violationCount === 1) {
    await userRef.update({
      assessmentViolationCount: violationCount,
      assessmentLastViolationAt: Date.now()
    });
    return NextResponse.json({ 
      action: "warn", 
      message: "Proctoring violation recorded. Next violation will terminate the assessment." 
    }, { status: 200 });
  }

  if (violationCount >= 2) {
    const ADMIN_EMAILS = ["saitrishankb9@gmail.com", "saitrishankb1311@gmail.com"];
    const isAdmin = decodedToken.admin === true || ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || "");
    // Ban is strictly for specific said days (30 days) for this specific language only, NOT for all languages
    const BAN_DAYS = 30;
    const lockoutTimestamp = isAdmin ? null : Date.now() + (BAN_DAYS * 24 * 60 * 60 * 1000);

    const sessionClearFields = {
      assessmentStartedAt: FieldValue.delete(),
      assessmentVariant: FieldValue.delete(),
      assessmentSkill: FieldValue.delete(),
      assessmentSeed: FieldValue.delete(),
      assessmentEasyQuestionId: FieldValue.delete(),
      assessmentMediumQuestionId: FieldValue.delete(),
      assessmentMcqIds: FieldValue.delete(),
      assessmentViolationCount: FieldValue.delete(),
      assessmentLastViolationAt: FieldValue.delete()
    };

    const batch = adminDb.batch();
    
    // 1. Update User Record - Ban strictly for this language only
    const userUpdate: Record<string, any> = {
      [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
      [`proctoringTerminations.${skill}`]: FieldValue.serverTimestamp(),
      proctoringLockoutUntil: FieldValue.delete(), // ensure no global ban
      ...sessionClearFields
    };
    if (lockoutTimestamp) {
      userUpdate[`skillLockoutUntil.${skill}`] = lockoutTimestamp;
    } else {
      userUpdate[`skillLockoutUntil.${skill}`] = FieldValue.delete();
    }
    batch.update(userRef, userUpdate);

    // 2. Update Candidate Record
    const candidateRef = adminDb.collection("candidates").doc(uid);
    batch.set(candidateRef, {
      verificationStatus: "unverified",
      [`failedAssessments.${skill}`]: FieldValue.serverTimestamp()
    }, { merge: true });

    await batch.commit();

    return NextResponse.json({ 
      action: "terminate", 
      message: `Assessment terminated due to proctoring violation. A ${BAN_DAYS}-day cooldown applies specifically to ${skill}. Other languages remain accessible.` 
    }, { status: 200 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
