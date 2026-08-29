import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb!.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    // Verify candidate exists
    const candidateDoc = await adminDb!.collection("candidates").doc(candidateId).get();
    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const employerRef = adminDb!.collection("employers").doc(employerUid);
    
    // Idempotent addition
    await employerRef.set({
      shortlistedCandidates: FieldValue.arrayUnion(candidateId),
      [`pipeline.${candidateId}`]: "shortlisted"
    }, { merge: true });

    return NextResponse.json({ success: true, shortlisted: true }, { status: 200 });
  } catch (e: any) {
    console.error("Shortlist POST error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb!.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });
    }

    const employerRef = adminDb!.collection("employers").doc(employerUid);
    
    // Idempotent removal
    await employerRef.update({
      shortlistedCandidates: FieldValue.arrayRemove(candidateId)
    });

    return NextResponse.json({ success: true, shortlisted: false }, { status: 200 });
  } catch (e: any) {
    console.error("Shortlist DELETE error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb!.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const employerDoc = await adminDb!.collection("employers").doc(employerUid).get();
    const shortlistedCandidates = employerDoc.data()?.shortlistedCandidates || [];

    return NextResponse.json({ shortlistedCandidates }, { status: 200 });
  } catch (e: any) {
    console.error("Shortlist GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

