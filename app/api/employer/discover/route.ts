import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
import { JobPosting } from "@/lib/firebase/employer";
import { UserProfile } from "@/lib/firebase/users";

const normalizeSkill = (val: string) => val.trim().toLowerCase().replace(/\s+/g, ' ');

const skillAliases: Record<string, string> = {
  "nodejs": "node",
  "node.js": "node",
  "reactjs": "react",
  "vuejs": "vue",
  "postgres": "postgresql"
};

const canonicalize = (val: string) => {
  const norm = normalizeSkill(val);
  return skillAliases[norm] || norm;
};

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

    // 3. Verify Employer Owns the Role
    const { roleId } = await req.json();
    if (!roleId) {
      return NextResponse.json({ error: "Missing roleId" }, { status: 400 });
    }

    const employerDoc = await adminDb.collection("employers").doc(employerUid).get();
    if (!employerDoc.exists) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    const employerData = employerDoc.data();
    const roles: JobPosting[] = employerData?.roles || [];
    const targetRole = roles.find((r) => r.id === roleId);

    if (!targetRole) {
      return NextResponse.json({ error: "Role not found or does not belong to this employer" }, { status: 403 });
    }

    const requiredSkills = targetRole.skills || [];

    // 4. Fetch Verified Candidates Only
    const candidatesSnapshot = await adminDb
      .collection("candidates")
      .where("verificationStatus", "==", "verified")
      .get();

    if (candidatesSnapshot.empty) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    // 5. Build Sanitized Candidates Array with Matching Logic
    const sanitizedCandidates = [];

    for (const doc of candidatesSnapshot.docs) {
      const data = doc.data() as CandidateProfile;
      const uid = doc.id;

      // 5a. Match reasoning
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
        const canonicalReq = canonicalize(reqSkill);
        if (canonicalReq.length === 0) continue;
        
        let matched = false;

        // 1. Check verified skills (Exact match on canonicalized string)
        if (candidateSkills.some(s => canonicalize(s) === canonicalReq)) {
          matchReasons.push(`${reqSkill.trim()} — verified`);
          matched = true;
        }

        // 2. Check assessments (Exact match on canonicalized string)
        if (!matched && Object.keys(assessmentScores).some(k => canonicalize(k) === canonicalReq)) {
          matchReasons.push(`${reqSkill.trim()} — assessment completed`);
          matched = true;
        }

        // 3. Check projects (Word boundary regex match on text fields)
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

      // Add general assessment reason if they took any tests but it wasn't a specific skill match
      const testNames = Object.keys(assessmentScores).map(k => k.split('_')[0]);
      if (testNames.length > 0) {
        matchReasons.push(`Technical assessment (${testNames.join(', ')}) completed`);
      }

      // Add general project count reason
      const relevantProjectsCount = projects.filter(p => 
        requiredSkills.some(s => {
          const canonicalReq = canonicalize(s);
          if (canonicalReq.length === 0) return false;
          const regex = new RegExp(`(^|\\W)${escapeRegExp(canonicalReq)}($|\\W)`, 'i');
          return (p.title && regex.test(p.title)) || (p.description && regex.test(p.description));
        })
      ).length;

      if (relevantProjectsCount > 0) {
        matchReasons.push(`${relevantProjectsCount} relevant project signal(s)`);
      }

      // Skip candidates with no matches if skills are required
      const isIncluded = requiredSkills.length === 0 || matchedRequiredSkillCount > 0;

      if (!isIncluded) {
        continue;
      }

      // 5b. Strip Sensitive Data
      sanitizedCandidates.push({
        uid, // Required for shortlisting
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
        matchReasons: Array.from(new Set(matchReasons)),
      });
    }

    // 6. Sort by overlap (highest first)
    // Primary sort: matched skills count. Secondary sort: total match reasons (projects + assessments)
    sanitizedCandidates.sort((a, b) => {
      if (b.matchedRequiredSkillCount !== a.matchedRequiredSkillCount) {
        return b.matchedRequiredSkillCount - a.matchedRequiredSkillCount;
      }
      return b.matchReasons.length - a.matchReasons.length;
    });

    if (sanitizedCandidates.length === 0) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    return NextResponse.json({ 
      candidates: sanitizedCandidates 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Employer discover API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
