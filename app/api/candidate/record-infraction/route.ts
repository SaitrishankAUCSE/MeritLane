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
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await req.json();
    const { skill, type, count, timestamp = Date.now() } = body;

    if (!skill || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(uid);
    const candidateRef = adminDb.collection("candidates").doc(uid);

    const infractionRecord = {
      skill,
      type,
      count,
      timestamp,
      recordedAt: Date.now()
    };

    await Promise.all([
      userRef.update({
        assessmentInfractions: FieldValue.arrayUnion(infractionRecord),
        lastInfractionAt: timestamp
      }),
      candidateRef.update({
        assessmentInfractions: FieldValue.arrayUnion(infractionRecord)
      }).catch(() => {})
    ]);

    return NextResponse.json({ success: true, recorded: true });
  } catch (error: any) {
    console.error("Error recording integrity infraction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
