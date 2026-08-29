import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { JobPosting } from "@/lib/firebase/employer";
import { UserProfile } from "@/lib/firebase/users";
import { canonicalizeSkill } from "@/lib/skills";

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth!.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    const userDoc = await adminDb!.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    let roleId = null;
    let filterSkills: string[] = [];
    let searchQuery = "";
    
    try {
      const body = await req.json();
      roleId = body.roleId;
      if (body.skills && Array.isArray(body.skills)) filterSkills = body.skills;
      if (body.searchQuery) searchQuery = body.searchQuery.trim().toLowerCase();
    } catch (e) {
    }

    let requiredSkills: string[] = filterSkills;

    if (roleId) {
      const employerDoc = await adminDb!.collection("employers").doc(employerUid).get();
      if (employerDoc.exists) {
        const employerData = employerDoc.data();
        const roles = employerData?.roles || [];
        const targetRole = roles.find((r: any) => r.id === roleId);
        if (targetRole && targetRole.skills) {
          requiredSkills = [...new Set([...requiredSkills, ...targetRole.skills])];
        }
      }
    }

    const candidatesSnapshot = await adminDb!
      .collection("candidates")
      .where("verificationStatus", "==", "verified")
      .get();

    if (candidatesSnapshot.empty) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    const sanitizedCandidates = [];

    for (const doc of candidatesSnapshot.docs) {
      const data = doc.data() as CandidateProfile;
      const uid = doc.id;

      const matchReasons: string[] = [];
      const candidateSkills = data.skills || [];
      const projects = data.projects || [];
      
      let assessmentScores: Record<string, number> = {};
      try {
        const uDoc = await adminDb!.collection("users").doc(uid).get();
        if (uDoc.exists) {
          const uData = uDoc.data() as UserProfile;
          if (uData.assessmentScores && Object.keys(uData.assessmentScores).length > 0) {
            assessmentScores = uData.assessmentScores;
          }
        }
      } catch (err) {
      }

      let matchedRequiredSkillCount = 0;
      const matchedSkills: string[] = [];

      for (const reqSkill of requiredSkills) {
        const canonicalReq = canonicalizeSkill(reqSkill);
        if (canonicalReq.length === 0) continue;
        
        let matched = false;

        const isVerified = Object.keys(data.verifiedSkills || {}).some(k => 
          canonicalizeSkill(k) === canonicalReq && data.verifiedSkills![k].status === "verified"
        );
        
        if (isVerified) {
          matchReasons.push(reqSkill.trim() + " - verified by MeritLane");
          matched = true;
        }

        if (!matched && Object.keys(assessmentScores).some(k => canonicalizeSkill(k) === canonicalReq)) {
          matchReasons.push(reqSkill.trim() + " - assessment completed");
          matched = true;
        }

        if (!matched && projects.some(p => {
          const regex = new RegExp("(^|\\W)" + escapeRegExp(canonicalReq) + "($|\\W)", "i");
          return (p.title && regex.test(p.title)) || (p.description && regex.test(p.description));
        })) {
          matchReasons.push(reqSkill.trim() + " - demonstrated in project");
          matched = true;
        }

        if (matched) {
          matchedRequiredSkillCount++;
          matchedSkills.push(reqSkill.trim());
        }
      }

      const testNames = Object.keys(assessmentScores).map(k => k.split("_")[0]);
      if (testNames.length > 0) {
        matchReasons.push("Technical assessment (" + testNames.join(", ") + ") completed");
      }

      const relevantProjectsCount = projects.filter(p => 
        requiredSkills.some(s => {
          const canonicalReq = canonicalizeSkill(s);
          if (canonicalReq.length === 0) return false;
          const regex = new RegExp("(^|\\W)" + escapeRegExp(canonicalReq) + "($|\\W)", "i");
          return (p.title && regex.test(p.title)) || (p.description && regex.test(p.description));
        })
      ).length;

      if (relevantProjectsCount > 0) {
        matchReasons.push(relevantProjectsCount + " relevant project signal(s)");
      }

      if (searchQuery) {
        const searchableText = [
          data.name || "",
          data.college || "",
          data.branch || "",
          ...(data.skills || []),
          ...projects.map((p: any) => p.title || ""),
          ...projects.map((p: any) => p.description || "")
        ].join(" ").toLowerCase();
        
        if (!searchableText.includes(searchQuery)) {
          continue;
        }
      }

      const isIncluded = requiredSkills.length === 0 || matchedRequiredSkillCount > 0;
      if (!isIncluded) {
        continue;
      }

      sanitizedCandidates.push({
        uid,
        name: data.name,
        college: data.college,
        branch: data.branch,
        gradYear: data.gradYear,
        skills: candidateSkills,
        matchedSkills: Array.from(new Set(matchedSkills)),
        matchedRequiredSkillCount,
        totalRequiredSkillCount: requiredSkills.length,
        projects: projects,
        githubUrl: data.githubUrl,
        resumeUrl: data.resumeUrl,
        verificationStatus: data.verificationStatus,
        assessmentScores,
        verifiedSkills: data.verifiedSkills || {},
        matchReasons: Array.from(new Set(matchReasons)),
      });
    }

    sanitizedCandidates.sort((a, b) => {
      if (b.matchedRequiredSkillCount !== a.matchedRequiredSkillCount) {
        return b.matchedRequiredSkillCount - a.matchedRequiredSkillCount;
      }
      return b.matchReasons.length - a.matchReasons.length;
    });

    return NextResponse.json({ candidates: sanitizedCandidates }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

