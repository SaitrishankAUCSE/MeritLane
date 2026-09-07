import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// GET /api/stats — public platform statistics using admin SDK (bypasses Firestore security rules)
export async function GET(_req: NextRequest) {
  try {
    if (!adminDb) {
      // Return zeros gracefully if admin not configured
      return NextResponse.json({
        registeredCandidates: 0,
        activeEmployers: 0,
        verifiedProfiles: 0,
      }, { status: 200 });
    }

    const [
      candidateSnap,
      employerSnap,
      verifiedSnap,
    ] = await Promise.all([
      adminDb.collection("users").where("role", "==", "candidate").count().get(),
      adminDb.collection("users").where("role", "==", "employer").count().get(),
      adminDb.collection("candidates").where("verificationStatus", "==", "verified").count().get(),
    ]);

    return NextResponse.json({
      registeredCandidates: candidateSnap.data().count,
      activeEmployers: employerSnap.data().count,
      verifiedProfiles: verifiedSnap.data().count,
    }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/stats error:", err);
    // Return zeros gracefully — stats are cosmetic, don't break the page
    return NextResponse.json({
      registeredCandidates: 0,
      activeEmployers: 0,
      verifiedProfiles: 0,
    }, { status: 200 });
  }
}
