import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  let currentStage = "ADMIN_INIT";
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration: Firebase Admin null", stage: currentStage }, { status: 500 });
    }

    currentStage = "TOKEN_PARSE";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token format", stage: currentStage }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];

    currentStage = "TOKEN_VERIFY";
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e: any) {
      console.error("[Diagnostics] TOKEN_VERIFY error:", e);
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token", stage: currentStage }, { status: 401 });
    }

    currentStage = "ADMIN_CLAIM";
    // Strict Admin Authorization Check (Custom Claim ONLY)
    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: "Forbidden: Administrative privilege required", stage: currentStage }, { status: 403 });
    }

    currentStage = "FIRESTORE_QUERY";
    // Fetch real candidates from Firestore
    let candidatesSnapshot;
    try {
      candidatesSnapshot = await adminDb.collection("candidates").get();
    } catch (e: any) {
      console.error("[Diagnostics] FIRESTORE_QUERY error:", e);
      return NextResponse.json({ error: "Failed to fetch candidates from Firestore", message: e.message, stage: currentStage }, { status: 500 });
    }

    currentStage = "CANDIDATE_TRANSFORM";
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
          console.error(`[Diagnostics] Failed to fetch user doc for ${uid}:`, err);
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

    currentStage = "JSON_SERIALIZE";
    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error(`[Diagnostics] Exception in admin candidates GET route at stage ${currentStage}:`, error);
    return NextResponse.json({ 
      error: "Internal server error", 
      stage: currentStage, 
      message: error.message || "Unknown error" 
    }, { status: 500 });
  }
}
