import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
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
    let minScore = 0;
    let requireLiveProject = false;
    let requireGithub = false;
    let minCommits = 0;
    let matchMode: "any" | "all" = "any";
    let gradYearFilter = "";

    try {
      const body = await req.json();
      roleId = body.roleId;
      if (body.skills && Array.isArray(body.skills)) filterSkills = body.skills;
      if (body.searchQuery) searchQuery = body.searchQuery.trim().toLowerCase();
      if (typeof body.minScore === "number") minScore = body.minScore;
      if (typeof body.requireLiveProject === "boolean") requireLiveProject = body.requireLiveProject;
      if (typeof body.requireGithub === "boolean") requireGithub = body.requireGithub;
      if (typeof body.minCommits === "number") minCommits = body.minCommits;
      if (body.matchMode === "all") matchMode = "all";
      if (body.gradYear) gradYearFilter = body.gradYear.trim();
    } catch {
      // Body parsing fallback
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

    // Parallel fetch candidates and candidate users to minimize latency
    const [candidatesSnapshot, usersCandidateSnapshot] = await Promise.all([
      adminDb!.collection("candidates").get(),
      adminDb!.collection("users").where("role", "==", "candidate").get(),
    ]);

    // Build a lookup map from the already-fetched snapshot → eliminates N+1 per-candidate reads
    const usersBatchMap = new Map<string, Record<string, any>>();
    usersCandidateSnapshot.docs.forEach((uDoc) => {
      usersBatchMap.set(uDoc.id, uDoc.data());
    });

    const candidateDocs: { id: string; data: CandidateProfile }[] = [];

    if (!candidatesSnapshot.empty) {
      candidatesSnapshot.docs.forEach((d) => {
        candidateDocs.push({ id: d.id, data: d.data() as CandidateProfile });
      });
    }

    if (!usersCandidateSnapshot.empty) {
      usersCandidateSnapshot.docs.forEach((uDoc) => {
        const uData = uDoc.data();
        if (!candidateDocs.some((c) => c.id === uDoc.id) && (uData.skills || uData.college)) {
          candidateDocs.push({
            id: uDoc.id,
            data: {
              name: uData.displayName || uData.name || "Candidate",
              college: uData.college || "",
              branch: uData.branch || "",
              gradYear: uData.gradYear || "",
              skills: uData.skills || [],
              projects: uData.projects || [],
              githubUrl: uData.githubUrl || "",
              resumeUrl: uData.resumeUrl || "",
              verificationStatus: uData.verificationStatus || "draft",
              verifiedSkills: uData.verifiedSkills || {},
              updatedAt: uData.updatedAt || Date.now(),
            } as CandidateProfile,
          });
        }
      });
    }

    if (candidateDocs.length === 0) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    const sanitizedCandidates = [];

    for (const { id: uid, data } of candidateDocs) {
      const recordId = uid.slice(0, 8).toUpperCase();
      const telemetryId = "#" + recordId;
      const candidateKey = data.candidateKey || ("ML-" + recordId);
      const projects = data.projects || [];
      const githubUrl = data.githubUrl || "";
      const githubEvidence = data.githubEvidence;
      const candidateSkills = data.skills || [];
      const totalSkillsCount = candidateSkills.length;
      const verifiedSkillsObj = data.verifiedSkills || {};

      // Normalize query tokens for Telemetry / Record ID matching
      const cleanQuery = searchQuery.trim().toLowerCase();
      const rawQuery = cleanQuery.replace(/^#/, "").replace(/^ml-?/, "").trim();

      const recordIdLower = recordId.toLowerCase();
      const candidateKeyLower = candidateKey.toLowerCase();
      const rawKeyLower = candidateKeyLower.replace(/^ml-?/, "");
      const uidLower = uid.toLowerCase();
      const nameLower = (data.name || "").toLowerCase();

      // Check if this candidate directly matches an explicit ID or unique query
      const isDirectIdMatch =
        cleanQuery.length >= 3 &&
        (
          recordIdLower === rawQuery ||
          recordIdLower === cleanQuery ||
          telemetryId.toLowerCase() === cleanQuery ||
          candidateKeyLower === cleanQuery ||
          rawKeyLower === rawQuery ||
          rawKeyLower === cleanQuery ||
          uidLower.startsWith(rawQuery) ||
          uidLower.startsWith(cleanQuery) ||
          (cleanQuery.startsWith("ml-") && candidateKeyLower.includes(cleanQuery)) ||
          (cleanQuery.startsWith("ml-") && ("ml-" + recordIdLower).includes(cleanQuery))
        );

      const isDirectNameMatch =
        cleanQuery.length >= 3 && nameLower.includes(cleanQuery);

      const isDirectTargetMatch = isDirectIdMatch || isDirectNameMatch;

      // Retrieve assessment scores from the pre-fetched map (zero extra Firestore reads)
      let assessmentScores: Record<string, number> = {};
      const prefetchedUser = usersBatchMap.get(uid);
      if (prefetchedUser?.assessmentScores && Object.keys(prefetchedUser.assessmentScores).length > 0) {
        assessmentScores = prefetchedUser.assessmentScores;
      }

      // Count skills verified with score >= 75%
      const qualifiedSkillsCount = Object.entries(verifiedSkillsObj).filter(([skillName, s]) => {
        const score = typeof s?.score === "number" ? s.score : assessmentScores[skillName];
        return s?.status === "verified" && (score === undefined || score >= 75);
      }).length;

      // ── Apply Discovery Exclusion Filters ONLY if this is NOT a targeted ID/name lookup ──
      if (!isDirectTargetMatch) {
        // Filter: gradYear
        if (gradYearFilter && gradYearFilter !== "all" && data.gradYear !== gradYearFilter) {
          continue;
        }

        // Filter: requireLiveProject
        if (requireLiveProject && !projects.some((p: any) => p.liveUrl && p.liveUrl.trim().length > 0)) {
          continue;
        }

        // Filter: requireGithub / minCommits
        if (requireGithub && !githubUrl && !githubEvidence) {
          continue;
        }
        if (minCommits > 0 && (!githubEvidence || (githubEvidence.totalCommits || 0) < minCommits)) {
          continue;
        }

        // ── Platform Rule: 50% Skills Milestone with 75%+ Score ──
        if (totalSkillsCount === 0) {
          continue;
        }

        const requiredVerifiedCount = Math.max(1, Math.ceil(totalSkillsCount / 2));
        if (qualifiedSkillsCount < requiredVerifiedCount) {
          continue;
        }

        // Filter: minScore
        if (minScore > 0) {
          const verifiedSkillScores = Object.values(data.verifiedSkills || {})
            .map((s) => s.score)
            .filter((score): score is number => typeof score === "number");
          const allScores = [...verifiedSkillScores, ...Object.values(assessmentScores)];
          const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
          if (maxScore < minScore) {
            continue;
          }
        }

        // General search query token check
        if (searchQuery) {
          const searchableTokens = [
            data.name || "",
            data.college || "",
            data.degree || "",
            data.branch || "",
            recordId,
            telemetryId,
            candidateKey,
            ...(data.skills || []),
            ...(data.targetRoles || []),
            ...(data.preferredLocations || []),
            data.workPreference || "",
            data.availability || "",
            data.bio || "",
            ...Object.keys(data.verifiedSkills || {}),
            ...projects.map((p: any) => p.title || ""),
            ...projects.map((p: any) => p.description || ""),
            ...projects.flatMap((p: any) => p.skillsUsed || []),
            data.githubEvidence?.githubUsername || "",
            data.githubUrl || "",
          ]
            .join(" ")
            .toLowerCase();

          const queryWords = searchQuery.replace(/^#/, "").split(/\s+/).filter(Boolean);
          const matchesQuery = queryWords.every((word) => searchableTokens.includes(word));
          if (!matchesQuery) {
            continue;
          }
        }
      }

      const matchReasons: string[] = [];

      if (isDirectIdMatch) {
        matchReasons.push("Candidate ID Match (" + candidateKey + ")");
      } else if (isDirectNameMatch) {
        matchReasons.push("Candidate Name Match (" + data.name + ")");
      }

      let matchedRequiredSkillCount = 0;
      const matchedSkills: string[] = [];

      for (const reqSkill of requiredSkills) {
        const canonicalReq = canonicalizeSkill(reqSkill);
        if (canonicalReq.length === 0) continue;

        let matched = false;

        const isVerified = Object.keys(data.verifiedSkills || {}).some(
          (k) => canonicalizeSkill(k) === canonicalReq && data.verifiedSkills![k].status === "verified"
        );

        if (isVerified) {
          matchReasons.push(reqSkill.trim() + " - verified by MeritLane");
          matched = true;
        }

        if (!matched && Object.keys(assessmentScores).some((k) => canonicalizeSkill(k) === canonicalReq)) {
          matchReasons.push(reqSkill.trim() + " - assessment completed");
          matched = true;
        }

        if (!matched && candidateSkills.some((s) => canonicalizeSkill(s) === canonicalReq)) {
          matchReasons.push(reqSkill.trim() + " - core skill");
          matched = true;
        }

        if (
          !matched &&
          projects.some((p: any) => {
            const regex = new RegExp("(^|\\W)" + escapeRegExp(canonicalReq) + "($|\\W)", "i");
            return (
              (p.title && regex.test(p.title)) ||
              (p.description && regex.test(p.description)) ||
              (p.skillsUsed && p.skillsUsed.some((s: string) => canonicalizeSkill(s) === canonicalReq))
            );
          })
        ) {
          matchReasons.push(reqSkill.trim() + " - demonstrated in project");
          matched = true;
        }

        if (matched) {
          matchedRequiredSkillCount++;
          matchedSkills.push(reqSkill.trim());
        }
      }

      const testNames = Object.keys(assessmentScores).map((k) => k.split("_")[0]);
      if (testNames.length > 0) {
        matchReasons.push("Technical assessment (" + testNames.join(", ") + ") completed");
      }

      const relevantProjectsCount = projects.filter((p: any) =>
        requiredSkills.some((s) => {
          const canonicalReq = canonicalizeSkill(s);
          if (canonicalReq.length === 0) return false;
          const regex = new RegExp("(^|\\W)" + escapeRegExp(canonicalReq) + "($|\\W)", "i");
          return (
            (p.title && regex.test(p.title)) ||
            (p.description && regex.test(p.description)) ||
            (p.skillsUsed && p.skillsUsed.some((sk: string) => canonicalizeSkill(sk) === canonicalReq))
          );
        })
      ).length;

      if (relevantProjectsCount > 0) {
        matchReasons.push(relevantProjectsCount + " relevant project signal(s)");
      }

      // Check matchMode ("all" requires every required skill to be matched) - only for generic searches
      if (!isDirectTargetMatch && requiredSkills.length > 0) {
        const isIncluded =
          matchMode === "all"
            ? matchedRequiredSkillCount === requiredSkills.length
            : matchedRequiredSkillCount > 0;

        if (!isIncluded) {
          continue;
        }
      }

      const skillVerificationPct = totalSkillsCount > 0 ? Math.round((qualifiedSkillsCount / totalSkillsCount) * 100) : 0;

      sanitizedCandidates.push({
        uid,
        name: data.name,
        college: data.college,
        branch: data.branch,
        gradYear: data.gradYear,
        candidateKey,
        avatarUrl: data.avatarUrl || "",
        avatarBadge: data.avatarBadge || "auto",
        targetRoles: data.targetRoles || [],
        preferredLocations: data.preferredLocations || [],
        workPreference: data.workPreference || "",
        availability: data.availability || "",
        bio: data.bio || "",
        skills: candidateSkills,
        matchedSkills: Array.from(new Set(matchedSkills)),
        matchedRequiredSkillCount,
        totalRequiredSkillCount: requiredSkills.length,
        projects: projects,
        githubUrl: data.githubUrl,
        githubEvidence: data.githubEvidence,
        resumeUrl: data.resumeUrl,
        atsScore: data.atsScore,
        atsRating: data.atsRating,
        verificationStatus: data.verificationStatus,
        assessmentScores,
        verifiedSkills: data.verifiedSkills || {},
        qualifiedSkillsCount,
        totalSkillsCount,
        skillVerificationPct,
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
    console.error("Discover API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
