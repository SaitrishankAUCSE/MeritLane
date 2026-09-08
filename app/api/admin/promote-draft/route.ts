import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { MCQQuestion, CodingQuestion } from "@/lib/assessments/bank/types";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

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

  const userRecord = await adminAuth.getUser(decodedToken.uid);
  const isAdmin = userRecord.email?.toLowerCase() === ADMIN_EMAIL || decodedToken.admin === true;
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { skill, itemId, itemType, action } = await req.json();
  // action: "approve" | "reject"
  // itemType: "mcq" | "coding"

  if (!skill || !itemId || !itemType || !action) {
    return NextResponse.json({ error: "skill, itemId, itemType, action are required" }, { status: 400 });
  }

  const skillKey = skill.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const draftRef = adminDb
    .collection("questionDrafts")
    .doc(skillKey)
    .collection(itemType === "mcq" ? "mcqs" : "coding")
    .doc(itemId);

  const draftSnap = await draftRef.get();
  if (!draftSnap.exists) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const draftData = draftSnap.data()!;

  if (action === "reject") {
    await draftRef.delete();
    return NextResponse.json({ success: true, action: "rejected" });
  }

  if (action === "approve") {
    // Promote to live bank in Firestore
    const liveRef = adminDb
      .collection("questionBank")
      .doc(skillKey)
      .collection(itemType === "mcq" ? "mcqs" : "coding")
      .doc(itemId);

    const promotedData = {
      ...draftData,
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: decodedToken.email,
      status: "live",
    };

    // Remove staging-only fields
    delete (promotedData as any).proposedReferenceCode;
    delete (promotedData as any).proposedWrongCode;

    await liveRef.set(promotedData);
    await draftRef.delete();

    // Increment live count on parent doc
    const parentRef = adminDb.collection("questionBank").doc(skillKey);
    await parentRef.set({
      skill: skillKey,
      [`${itemType}Count`]: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true, action: "approved", promotedId: itemId });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
