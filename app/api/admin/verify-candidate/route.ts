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
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token format" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e: any) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    // Strict Custom Claim Authorization Check
    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: "Forbidden: Administrative privilege required" }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, status, reason } = body;

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json({ error: "Invalid or missing candidateId" }, { status: 400 });
    }

    const allowedStatuses = ["verified", "changes_required", "rejected"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value. Allowed: verified, changes_required, rejected" }, { status: 400 });
    }

    if ((status === "changes_required" || status === "rejected") && (!reason || !reason.trim())) {
      return NextResponse.json({ error: `A reason is required when setting status to ${status}` }, { status: 400 });
    }

    const candidateRef = adminDb.collection("candidates").doc(candidateId);
    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate record not found" }, { status: 404 });
    }

    // Securely derive audit fields from verified server token
    const verifiedByUid = decodedToken.uid;
    const verifiedByEmail = decodedToken.email || "";

    const candidateUpdate: Record<string, any> = {
      verificationStatus: status,
      verificationReason: reason ? reason.trim() : null,
      verifiedAt: FieldValue.serverTimestamp(),
      verifiedByUid,
      verifiedByEmail,
      updatedAt: Date.now(),
    };

    await candidateRef.update(candidateUpdate);

    // Synchronize verifiedBadge on user document
    const userRef = adminDb.collection("users").doc(candidateId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      if (status === "verified") {
        await userRef.update({
          verifiedBadge: true,
          verificationDate: FieldValue.serverTimestamp(),
        });
      } else {
        await userRef.update({
          verifiedBadge: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Candidate verification status updated to ${status}`,
      candidateId,
      status,
    });
  } catch (error: any) {
    console.error("Error in admin verify-candidate POST route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
