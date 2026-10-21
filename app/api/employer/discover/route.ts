import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { CandidateProfile } from "@/lib/firebase/candidate";
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

    // Build a lookup map from the already-fetched snapshot
    const usersBatchMap = new Map<string, Record<string, any>>();
    usersCandidateSnapshot.docs.forEach((uDoc) => {
      usersBatchMap.set(uDoc.id, uDoc.data());
    });

    const candidateDocs: { id: string; data: Partial<CandidateProfile> }[] = [];
    const seenUids = new Set<string>();

    if (!candidatesSnapshot.empty) {
      for (const d of candidatesSnapshot.docs) {
        const cData = d.data() as CandidateProfile;
        const nameLower = (cData.name || "").toLowerCase().trim();
        const emailLower = ((cData as any).email || "").toLowerCase().trim();
        const isFakeOrTest =
          nameLower.startsWith("verified engineer") ||
          nameLower.includes("test candidate") ||
          emailLower.includes("example.com") ||
          emailLower.includes("pilot_test_");

        if (isFakeOrTest) {
          d.ref.delete().catch(() => null);
          continue;
        }

        if (seenUids.has(d.id)) continue;
        seenUids.add(d.id);
        candidateDocs.push({ id: d.id, data: cData });
      }
    }

    if (!usersCandidateSnapshot.empty) {
      for (const uDoc of usersCandidateSnapshot.docs) {
        const uData = uDoc.data();
        const nameLower = (uData.displayName || uData.name || "").toLowerCase().trim();
        const emailLower = (uData.email || "").toLowerCase().trim();
        const isFakeOrTest =
          nameLower.startsWith("verified engineer") ||
          nameLower.includes("test candidate") ||
          emailLower.includes("example.com") ||
          emailLower.includes("pilot_test_");

        if (isFakeOrTest) {
          uDoc.ref.delete().catch(() => null);
          continue;
        }

        if (seenUids.has(uDoc.id)) continue;
        seenUids.add(uDoc.id);

        candidateDocs.push({
          id: uDoc.id,
          data: {
            name: uData.displayName || uData.name || (uData.email ? uData.email.split("@")[0] : "Candidate"),
            college: uData.college || "",
            branch: uData.branch || "",
            gradYear: uData.gradYear || "",
            skills: uData.skills || [],
            projects: uData.projects || [],
            githubUrl: uData.githubUrl || "",
            resumeUrl: uData.resumeUrl || "",
            verificationStatus: uData.verificationStatus || "unverified",
            verifiedSkills: uData.verifiedSkills || {},
            updatedAt: uData.updatedAt || Date.now(),
          } as CandidateProfile,
        });
      }
    }

    if (candidateDocs.length === 0) {
      return NextResponse.json({ candidates: [] }, { status: 200 });
    }

    // Precompute skills that are verified by at least one candidate on the platform
    const platformVerifiedSkills = new Set<string>();
    for (const { data, id: uid } of candidateDocs) {
      const prefetchedUser = usersBatchMap.get(uid) || {};
      const verified = { ...(prefetchedUser.verifiedSkills || {}), ...(data.verifiedSkills || {}) };
      const scores = { ...(prefetchedUser.assessmentScores || {}), ...((data as any).assessmentScores || {}) };
      for (const [k, v] of Object.entries(verified)) {
        if ((v as any)?.status === "verified") {
          platformVerifiedSkills.add(canonicalizeSkill(k));
        }
      }
      for (const [k, score] of Object.entries(scores)) {
        if (typeof score === "number" && score >= 75) {
          platformVerifiedSkills.add(canonicalizeSkill(k));
        }
      }
    }

    const sanitizedCandidates = [];

    for (const { id: uid, data } of candidateDocs) {
      const prefetchedUser = usersBatchMap.get(uid) || {};

      const name = (data.name && data.name !== "Candidate" && data.name !== "—")
        ? data.name
        : (prefetchedUser.displayName || prefetchedUser.name || (prefetchedUser.email ? prefetchedUser.email.split("@")[0] : data.name || "Candidate"));

      const college = data.college || prefetchedUser.college || "";
      const branch = data.branch || prefetchedUser.branch || "";
      const degree = (data as any).degree || prefetchedUser.degree || "";
      const gradYear = data.gradYear || prefetchedUser.gradYear || "";
      const projects = (data.projects && data.projects.length > 0) ? data.projects : (prefetchedUser.projects || []);
      const githubUrl = data.githubUrl || prefetchedUser.githubUrl || "";
      const githubEvidence = data.githubEvidence || prefetchedUser.githubEvidence || null;
      const resumeUrl = data.resumeUrl || prefetchedUser.resumeUrl || "";
      const avatarUrl = data.avatarUrl || prefetchedUser.photoURL || prefetchedUser.avatarUrl || "";
      const avatarBadge = data.avatarBadge || prefetchedUser.avatarBadge || "auto";
      const targetRoles = (data.targetRoles && data.targetRoles.length > 0) ? data.targetRoles : (prefetchedUser.targetRoles || []);
      const preferredLocations = (data.preferredLocations && data.preferredLocations.length > 0) ? data.preferredLocations : (prefetchedUser.preferredLocations || []);
      const workPreference = data.workPreference || prefetchedUser.workPreference || "";
      const availability = data.availability || prefetchedUser.availability || "";
      const bio = data.bio || prefetchedUser.bio || "";
      const atsScore = data.atsScore ?? prefetchedUser.atsScore;
      const atsRating = data.atsRating ?? prefetchedUser.atsRating;
      const verificationStatus = data.verificationStatus || prefetchedUser.verificationStatus || "unverified";

      const assessmentScores: Record<string, number> = {
        ...(prefetchedUser.assessmentScores || {}),
        ...((data as any).assessmentScores || {}),
      };

      const verifiedSkillsObj: Record<string, any> = {
        ...(prefetchedUser.verifiedSkills || {}),
        ...(data.verifiedSkills || {}),
      };

      const candidateSkills: string[] = Array.from(new Set([
        ...(data.skills || []),
        ...(prefetchedUser.skills || []),
        ...Object.keys(verifiedSkillsObj),
        ...Object.keys(assessmentScores),
      ])).filter(Boolean);

      const totalSkillsCount = candidateSkills.length;

      // Count skills verified with score >= 75%
      const qualifiedSkillsCount = Object.entries(verifiedSkillsObj).filter(([skillName, s]: [string, any]) => {
        const score = typeof s?.score === "number" ? s.score : assessmentScores[skillName];
        return s?.status === "verified" && (score === undefined || score >= 75);
      }).length;

      const recordId = uid.slice(0, 8).toUpperCase();
      const telemetryId = "#" + recordId;
      const candidateKey = data.candidateKey || ("ML-" + recordId);

      // Normalize query tokens for Telemetry / Record ID matching
      const cleanQuery = searchQuery.trim().toLowerCase();
      const rawQuery = cleanQuery.replace(/^#/, "").replace(/^ml-?/, "").trim();

      const recordIdLower = recordId.toLowerCase();
      const candidateKeyLower = candidateKey.toLowerCase();
      const rawKeyLower = candidateKeyLower.replace(/^ml-?/, "");
      const uidLower = uid.toLowerCase();
      const nameLower = name.toLowerCase();

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

      // ── Apply Discovery Exclusion Filters ONLY if this is NOT a targeted ID/name lookup ──
      if (!isDirectTargetMatch) {
        // Filter: gradYear
        if (gradYearFilter && gradYearFilter !== "all" && gradYear !== gradYearFilter) {
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

        // Filter: minScore
        if (minScore > 0) {
          const verifiedSkillScores = Object.values(verifiedSkillsObj)
            .map((s: any) => s.score)
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
            name,
            college,
            degree,
            branch,
            recordId,
            telemetryId,
            candidateKey,
            ...candidateSkills,
            ...targetRoles,
            ...preferredLocations,
            workPreference,
            availability,
            bio,
            ...Object.keys(verifiedSkillsObj),
            ...projects.map((p: any) => p.title || ""),
            ...projects.map((p: any) => p.description || ""),
            ...projects.flatMap((p: any) => p.skillsUsed || []),
            githubEvidence?.githubUsername || "",
            githubUrl,
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
        matchReasons.push("Candidate Name Match (" + name + ")");
      }

      let matchedRequiredSkillCount = 0;
      const matchedSkills: string[] = [];

      for (const reqSkill of requiredSkills) {
        const canonicalReq = canonicalizeSkill(reqSkill);
        if (canonicalReq.length === 0) continue;

        let matched = false;

        // 1. Is this skill verified in candidate's verifiedSkills?
        const isVerified = Object.keys(verifiedSkillsObj).some(
          (k) => canonicalizeSkill(k) === canonicalReq && (verifiedSkillsObj[k] as any)?.status === "verified"
        );

        if (isVerified) {
          matchReasons.push(reqSkill.trim() + " - verified by MeritLane");
          matched = true;
        }

        // 2. Is this skill backed by completed assessment >= 75%?
        if (!matched && Object.keys(assessmentScores).some((k) => {
          const score = assessmentScores[k];
          return canonicalizeSkill(k) === canonicalReq && (typeof score === "number" ? score >= 75 : true);
        })) {
          matchReasons.push(reqSkill.trim() + " - assessment completed");
          matched = true;
        }

        // 3. Fallback: ONLY if NO candidate on the entire platform has verified this skill yet
        const isSkillVerifiedOnPlatform = platformVerifiedSkills.has(canonicalReq);

        if (!matched && !isSkillVerifiedOnPlatform) {
          if (candidateSkills.some((s) => canonicalizeSkill(s) === canonicalReq)) {
            matchReasons.push(reqSkill.trim() + " - claimed skill");
            matched = true;
          } else if (
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
        name,
        college,
        branch,
        degree,
        gradYear,
        candidateKey,
        avatarUrl,
        avatarBadge,
        targetRoles,
        preferredLocations,
        workPreference,
        availability,
        bio,
        skills: candidateSkills,
        matchedSkills: Array.from(new Set(matchedSkills)),
        matchedRequiredSkillCount,
        totalRequiredSkillCount: requiredSkills.length,
        projects,
        githubUrl,
        githubEvidence,
        resumeUrl,
        atsScore,
        atsRating,
        verificationStatus,
        assessmentScores,
        verifiedSkills: verifiedSkillsObj,
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
      if (b.qualifiedSkillsCount !== a.qualifiedSkillsCount) {
        return b.qualifiedSkillsCount - a.qualifiedSkillsCount;
      }
      if (b.matchReasons.length !== a.matchReasons.length) {
        return b.matchReasons.length - a.matchReasons.length;
      }
      return (b.skills?.length || 0) - (a.skills?.length || 0);
    });

    return NextResponse.json({ candidates: sanitizedCandidates }, { status: 200 });
  } catch (error: any) {
    console.error("Discover API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
