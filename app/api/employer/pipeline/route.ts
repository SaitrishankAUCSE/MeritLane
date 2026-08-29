import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const { candidateId, stage } = await req.json();
    if (!candidateId || !stage) {
      return NextResponse.json({ error: "Missing candidateId or stage" }, { status: 400 });
    }

    const validStages = ["shortlisted", "interviewing", "offer", "rejected", "hired"];
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: "Invalid pipeline stage" }, { status: 400 });
    }

    // Verify candidate exists
    const candidateDoc = await adminDb.collection("candidates").doc(candidateId).get();
    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const employerRef = adminDb.collection("employers").doc(employerUid);
    
    // Set the specific candidate's pipeline stage
    await employerRef.set({
      [`pipeline.${candidateId}`]: stage
    }, { merge: true });

    return NextResponse.json({ success: true, stage }, { status: 200 });
  } catch (e: any) {
    console.error("Pipeline POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
