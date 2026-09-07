import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// GET /api/public/candidates — publicly readable verified candidate profiles for homepage preview
// Uses admin SDK so Firestore security rules are bypassed for server-to-server reads
export async function GET(_req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    const snap = await adminDb
      .collection("candidates")
      .where("verificationStatus", "==", "verified")
      .limit(20)
      .get();

    const candidates = snap.docs.map((doc) => {
      const data = doc.data();
      // Only return public-safe fields — no PII
      return {
        id: doc.id,
        name: data.name || "Anonymous",
        skills: data.skills || [],
        verifiedSkills: data.verifiedSkills || {},
        branch: data.branch || "",
        college: data.college || "",
        gradYear: data.gradYear || "",
        atsScore: data.atsScore || null,
        verificationStatus: data.verificationStatus || "",
        candidateKey: data.candidateKey || `ML-${doc.id.slice(0, 8).toUpperCase()}`,
      };
    });

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/public/candidates error:", err);
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
}
