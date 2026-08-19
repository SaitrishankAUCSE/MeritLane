import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { JobPosting } from "@/lib/firebase/employer";
import { UserProfile } from "@/lib/firebase/users";
import { canonicalizeSkill } from "@/lib/skills";

const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const employerUid = decodedToken.uid;

    // 2. Verify User is an Employer
    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const employerDoc = await adminDb.collection("employers").doc(employerUid).get();
    if (!employerDoc.exists) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    const employerData = employerDoc.data();
    const shortlistedUids: string[] = employerData?.shortlistedCandidates || [];

    if (shortlistedUids.length === 0) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    // Optional: roleId to calculate match reasons against a specific role
    const body = await req.json().catch(() => ({}));
    const roleId = body.roleId;

    let requiredSkills: string[] = [];
    if (roleId) {
      const roles: JobPosting[] = employerData?.roles || [];
      const targetRole = roles.find((r) => r.id === roleId);
      if (targetRole) {
        requiredSkills = targetRole.skills || [];
      }
    }

    // 4. Fetch the Shortlisted Candidates
    const sanitizedCandidates = [];

    for (const uid of shortlistedUids) {
      const doc = await adminDb.collection("candidates").doc(uid).get();
      if (!doc.exists) continue;

      const data = doc.data() as CandidateProfile;
      
      const matchReasons: string[] = [];
      const candidateSkills = data.skills || [];
      const projects = data.projects || [];
      
      let assessmentScores: Record<string, number> = {};
      try {
        const uDoc = await adminDb.collection("users").doc(uid).get();
        if (uDoc.exists) {
          const uData = uDoc.data() as UserProfile;
          if (uData.assessmentScores && Object.keys(uData.assessmentScores).length > 0) {
            assessmentScores = uData.assessmentScores;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch assessment scores for candidate:", uid);
      }

      let matchedRequiredSkillCount = 0;
      const matchedSkills: string[] = [];

      for (const reqSkill of requiredSkills) {
        const canonicalReq = canonicalizeSkill(reqSkill);
        if (canonicalReq.length === 0) continue;
        
        let matched = false;

        if (candidateSkills.some(s => canonicalizeSkill(s) === canonicalReq)) {
          matchReasons.push(`${reqSkill.trim()} — verified`);
          matched = true;
        }

        if (!matched && Object.keys(assessmentScores).some(k => canonicalizeSkill(k) === canonicalReq)) {
          matchReasons.push(`${reqSkill.trim()} — assessment completed`);
          matched = true;
        }

        if (!matched && projects.some(p => {
          const regex = new RegExp(`(^|\\W)${escapeRegExp(canonicalReq)}($|\\W)`, 'i');
          return (p.title && regex.test(p.title)) || (p.description && regex.test(p.description));
        })) {
          matchReasons.push(`${reqSkill.trim()} — demonstrated in project`);
          matched = true;
        }

        if (matched) {
          matchedRequiredSkillCount++;
          matchedSkills.push(reqSkill.trim());
        }
      }

      if (requiredSkills.length > 0) {
        const testNames = Object.keys(assessmentScores).map(k => k.split('_')[0]);
        if (testNames.length > 0) {
          matchReasons.push(`Technical assessment (${Array.from(new Set(testNames)).join(', ')}) completed`);
        }

        const relevantProjectsCount = projects.filter(p => 
          requiredSkills.some(s => {
            const canonicalReq = canonicalizeSkill(s);
            if (canonicalReq.length === 0) return false;
            const regex = new RegExp(`(^|\\W)${escapeRegExp(canonicalReq)}($|\\W)`, 'i');
            return (p.title && regex.test(p.title)) || (p.description && regex.test(p.description));
          })
        ).length;

        if (relevantProjectsCount > 0) {
          matchReasons.push(`${relevantProjectsCount} relevant project signal(s)`);
        }
      } else {
        if (candidateSkills.length > 0) {
          matchReasons.push(`${candidateSkills.length} verified technical skill(s)`);
        }
        const testNames = Object.keys(assessmentScores).map(k => k.split('_')[0]);
        if (testNames.length > 0) {
          const uniqueTests = Array.from(new Set(testNames));
          matchReasons.push(`Technical assessment (${uniqueTests.join(', ')}) completed`);
        }
        if (projects.length > 0) {
          matchReasons.push(`${projects.length} verified project signal(s)`);
        }
      }
      
      sanitizedCandidates.push({
        uid,
        name: data.name,
        college: data.college,
        branch: data.branch,
        gradYear: data.gradYear,
        skills: candidateSkills,
        matchedSkills: requiredSkills.length > 0 ? Array.from(new Set(matchedSkills)) : candidateSkills,
        matchedRequiredSkillCount,
        totalRequiredSkillCount: requiredSkills.length,
        projects: projects,
        githubUrl: data.githubUrl,
        resumeUrl: data.resumeUrl,
        verificationStatus: data.verificationStatus,
        assessmentScores,
        matchReasons: Array.from(new Set(matchReasons)),
      });
    }

    sanitizedCandidates.sort((a, b) => {
      if (b.matchedRequiredSkillCount !== a.matchedRequiredSkillCount) {
        return b.matchedRequiredSkillCount - a.matchedRequiredSkillCount;
      }
      return b.matchReasons.length - a.matchReasons.length;
    });

    return NextResponse.json({ 
      candidates: sanitizedCandidates 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Employer shortlisted API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
