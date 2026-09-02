import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { skill, reason } = await req.json();
    if (!skill) {
      return NextResponse.json({ error: "Missing skill parameter" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    
    // Apply 14-day cooldown immediately in Firestore
    await userRef.update({
      [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
      [`failedAssessmentsFeedback.${skill}`]: `Assessment terminated: ${reason || "Fullscreen exited or user navigated away in the middle of the exam."}`,
      assessmentStartedAt: FieldValue.delete(),
      assessmentVariant: FieldValue.delete(),
      assessmentSkill: FieldValue.delete()
    });

    return NextResponse.json({
      success: true,
      terminated: true,
      cooldownDays: 14,
      message: "Assessment terminated and 14-day cooldown applied."
    }, { status: 200 });
  } catch (error: any) {
    console.error("Terminate assessment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
