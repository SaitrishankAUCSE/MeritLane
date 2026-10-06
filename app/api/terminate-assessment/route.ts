import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * POST /api/terminate-assessment
 *
 * Called by the client when the candidate triggers >= 3 integrity violations
 * (fullscreen exits, tab switches, back navigation) during an active assessment.
 *
 * This endpoint:
 * 1. Validates the authenticated candidate
 * 2. Confirms an assessment session is active for the given skill
 * 3. Records the failure with a 21-day integrity cooldown (NOT the standard 14-day)
 * 4. Clears the active assessment session server-side
 * 5. Returns the server-calculated retry timestamp
 *
 * The client MUST NOT be trusted to compute or supply the cooldown duration.
 */
export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { skill?: string; violationCount?: number };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { skill } = body;
    if (!skill) {
      return NextResponse.json({ error: "Skill is required" }, { status: 400 });
    }

    // Verify Firebase token
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

    // Validate that the candidate has an active assessment session for this skill
    if (!userData.assessmentStartedAt || userData.assessmentSkill !== skill) {
      // Session already cleared (e.g. double request) — still return 200 with cooldown info
      const existingFailed = userData.failedAssessments?.[skill];
      if (existingFailed) {
        const failedMs =
          typeof existingFailed.toMillis === "function"
            ? existingFailed.toMillis()
            : existingFailed;
        // 30-day cooldown for this specific language only
        const retryAvailableAt = new Date(failedMs + 30 * 24 * 60 * 60 * 1000).toISOString();
        return NextResponse.json({ success: true, retryAvailableAt, alreadyTerminated: true, cooldownDays: 30 });
      }
      return NextResponse.json({ error: "No active assessment session found" }, { status: 409 });
    }

    // Write the integrity termination record
    // Uses the same `failedAssessments[skill]` field the cooldown checker already reads.
    const serverNow = FieldValue.serverTimestamp();

    await userRef.update({
      // Standard cooldown field — this triggers the 30-day block in start-assessment for this skill only
      [`failedAssessments.${skill}`]: serverNow,

      // Integrity-specific record
      [`integrityTerminations.${skill}`]: serverNow,

      // Clear the active session
      assessmentStartedAt: FieldValue.delete(),
      assessmentVariant: FieldValue.delete(),
      assessmentSkill: FieldValue.delete(),
    });

    // Fetch the written timestamp so we can return the precise server-side retry date
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data() || {};
    const terminatedTimestamp = updatedData.failedAssessments?.[skill];
    const terminatedMs =
      terminatedTimestamp && typeof terminatedTimestamp.toMillis === "function"
        ? terminatedTimestamp.toMillis()
        : Date.now();

    // Specific said cooldown = 30 days for this specific language only
    const SPECIFIC_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
    const retryAvailableAt = new Date(terminatedMs + SPECIFIC_COOLDOWN_MS).toISOString();

    return NextResponse.json({
      success: true,
      retryAvailableAt,
      skill,
      cooldownDays: 30,
      reason: "integrity_termination",
    });
  } catch (error: any) {
    console.error("Error in terminate-assessment route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
