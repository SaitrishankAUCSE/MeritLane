import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
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

    // Strict Admin Authorization Check (Custom Claim ONLY)
    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: "Forbidden: Administrative privilege required" }, { status: 403 });
    }

    // Fetch real candidates from Firestore
    const candidatesSnapshot = await adminDb.collection("candidates").get();
    const candidates = await Promise.all(
      candidatesSnapshot.docs.map(async (docSnap) => {
        const candidateData = docSnap.data();
        const uid = docSnap.id;

        // Fetch corresponding user doc for account metadata and assessment records
        let userData: Record<string, any> = {};
        try {
          const userDoc = await adminDb!.collection("users").doc(uid).get();
          if (userDoc.exists) {
            userData = userDoc.data() || {};
          }
        } catch (err) {
          console.error(`Failed to fetch user doc for ${uid}:`, err);
        }

        const safeDate = (val: any) => {
          if (!val) return null;
          if (typeof val.toDate === "function") return val.toDate().toISOString();
          if (val instanceof Date) return val.toISOString();
          if (typeof val === "string") return val;
          if (typeof val === "number") return new Date(val).toISOString();
          if (val._seconds) return new Date(val._seconds * 1000).toISOString();
          return null;
        };

        return {
          uid,
          name: candidateData.name || userData.displayName || "",
          email: candidateData.email || userData.email || "",
          college: candidateData.college || "",
          branch: candidateData.branch || "",
          gradYear: candidateData.gradYear || "",
          githubUrl: candidateData.githubUrl || "",
          resumeUrl: candidateData.resumeUrl || "",
          skills: candidateData.skills || [],
          projects: candidateData.projects || [],
          verificationStatus: candidateData.verificationStatus || "draft",
          verificationReason: candidateData.verificationReason || null,
          verifiedAt: safeDate(candidateData.verifiedAt),
          verifiedByUid: candidateData.verifiedByUid || null,
          verifiedByEmail: candidateData.verifiedByEmail || null,
          updatedAt: safeDate(candidateData.updatedAt),
          verifiedBadge: Boolean(userData.verifiedBadge),
          assessmentScores: userData.assessmentScores || null,
          assessmentDate: safeDate(userData.assessmentDate),
        };
      })
    );

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error("Error in admin candidates GET route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
