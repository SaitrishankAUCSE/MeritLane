import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { UserProfile } from "@/lib/firebase/users";

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
    const shortlistedIds = employerDoc.data()?.shortlistedCandidates || [];

    if (shortlistedIds.length === 0) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    const sanitizedCandidates = [];

    // Chunk fetching since Firebase `in` query limits to 10
    // But we can just loop over them since it is a shortlist
    for (const uid of shortlistedIds) {
      const doc = await adminDb!.collection("candidates").doc(uid).get();
      if (!doc.exists) continue;

      const data = doc.data() as CandidateProfile;
      
      let assessmentScores: Record<string, number> = {};
      try {
        const uDoc = await adminDb!.collection("users").doc(uid).get();
        if (uDoc.exists) {
          const uData = uDoc.data() as UserProfile;
          if (uData.assessmentScores) {
            assessmentScores = uData.assessmentScores;
          }
        }
      } catch (err) {}

      sanitizedCandidates.push({
        uid,
        name: data.name,
        college: data.college,
        branch: data.branch,
        gradYear: data.gradYear,
        skills: data.skills || [],
        projects: data.projects || [],
        githubUrl: data.githubUrl,
        resumeUrl: data.resumeUrl,
        verificationStatus: data.verificationStatus,
        assessmentScores,
        verifiedSkills: data.verifiedSkills || {},
      });
    }

    return NextResponse.json({ candidates: sanitizedCandidates }, { status: 200 });
  } catch (e: any) {
    console.error("Shortlist LIST GET error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

