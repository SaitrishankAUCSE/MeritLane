import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
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
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const candidateRef = adminDb.collection("candidates").doc(uid);
    const candidateDoc = await candidateRef.get();
    const candidateData = candidateDoc.exists ? candidateDoc.data() : {};

    const userData = userDoc.data() || {};

    if (candidateData?.verificationStatus === "verified") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    const now = Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    if (userData.lastFailedAssessmentAt) {
      const lastFailMs = userData.lastFailedAssessmentAt.toMillis();
      if (now - lastFailMs < fourteenDaysMs) {
        const daysLeft = Math.ceil((fourteenDaysMs - (now - lastFailMs)) / (1000 * 60 * 60 * 24));
        return NextResponse.json({ 
          error: `Cooldown active. You can try again in ${daysLeft} days.`,
          cooldownDays: daysLeft 
        }, { status: 403 });
      }
    }

    // Check if an attempt is already active or expired
    if (userData.assessmentStartedAt) {
      const startedMs = userData.assessmentStartedAt.toMillis();
      const fortyFiveMinsMs = 45 * 60 * 1000;
      
      if (now - startedMs < fortyFiveMinsMs) {
        // Resume active session
        return NextResponse.json({ 
          message: "Resuming session",
          startedAt: startedMs,
          variant: userData.assessmentVariant || "A"
        }, { status: 200 });
      } else {
        // Attempt expired! Mark as failure and enforce cooldown immediately
        await userRef.update({
          lastFailedAssessmentAt: FieldValue.serverTimestamp(),
          assessmentStartedAt: FieldValue.delete(),
          assessmentVariant: FieldValue.delete()
        });
        
        return NextResponse.json({ 
          error: `Cooldown active. You can try again in 14 days.`,
          cooldownDays: 14 
        }, { status: 403 });
      }
    }

    // Assign a variant (A or B)
    const newVariant = Math.random() > 0.5 ? "A" : "B";

    // Start a fresh session
    await userRef.update({
      assessmentStartedAt: FieldValue.serverTimestamp(),
      assessmentVariant: newVariant
    });

    // Fetch the timestamp we just wrote to return it to the client
    const updatedDoc = await userRef.get();
    const startedAt = updatedDoc.data()?.assessmentStartedAt?.toMillis() || Date.now();

    return NextResponse.json({ 
      message: "Assessment started",
      startedAt: startedAt,
      variant: newVariant
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error starting assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
