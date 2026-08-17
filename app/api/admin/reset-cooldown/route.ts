import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Strict Admin Authorization
    const isAdmin = decodedToken.admin === true || decodedToken.email?.toLowerCase() === ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Administrative privilege required" }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(candidateId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Reset cooldown and active assessment timestamps
    await userRef.update({
      lastFailedAssessmentAt: FieldValue.delete(),
      assessmentStartedAt: FieldValue.delete(),
      assessmentVariant: FieldValue.delete(),
      cooldownResetBy: decodedToken.email || ADMIN_EMAIL,
      cooldownResetAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: "Candidate assessment cooldown successfully reset by administrator.",
      candidateId,
    });
  } catch (error: any) {
    console.error("Error resetting candidate cooldown:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
