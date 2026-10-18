import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";
import { getBankForSkill, selectAssignment, sanitiseCodingQuestion, sanitiseMcqs } from "@/lib/assessments/selector";
import { generateAndPublishSkillBank } from "@/lib/assessments/generator";
import { selectRandomInterviewQuestions, getInterviewQuestionById } from "@/lib/assessments/interview-questions";

export async function POST(req: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { skill, track = "standard", switchTrack = false } = body;
    
    if (!skill) {
      return NextResponse.json({ error: "Skill parameter is required" }, { status: 400 });
    }

    const validTrack: "standard" | "advanced" = track === "advanced" ? "advanced" : "standard";

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userRef = adminDb.collection("users").doc(uid);
    const candidateRef = adminDb.collection("candidates").doc(uid);

    // Fetch user and candidate docs in parallel
    let [userDoc, candidateDoc] = await Promise.all([
      userRef.get(),
      candidateRef.get(),
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data() || {};

    if (!candidateDoc.exists) {
      await candidateRef.set({
        name: userData.displayName || "Candidate",
        email: userData.email || "",
        skills: [skill],
        verificationStatus: "draft",
        createdAt: new Date().toISOString(),
      }, { merge: true });
      candidateDoc = await candidateRef.get();
    }

    const candidateData = candidateDoc.exists ? (candidateDoc.data() || {}) : {};
    
    // Automatically ensure the requested skill is in the candidate's skills list
    const normalizedSkill = skill.toLowerCase().trim();
    const candidateSkills: string[] = [
      ...(candidateData.skills || []),
      ...(userData.skills || [])
    ];
    
    const hasSkill = candidateSkills.some((s: string) => s && s.toLowerCase().trim() === normalizedSkill);
    if (!hasSkill) {
      await candidateRef.update({
        skills: FieldValue.arrayUnion(skill)
      }).catch(() => {});
    }

    const now = Date.now();

    // 1. Dev & Admin Bypass / Cooldown Reset
    const isDev = process.env.NODE_ENV === "development";
    const ADMIN_EMAILS = ["saitrishankb9@gmail.com", "saitrishankb1311@gmail.com"];
    const isAdmin = decodedToken.admin === true || ADMIN_EMAILS.includes(decodedToken.email?.toLowerCase() || "");
    const bypassCooldown = (isDev || isAdmin) && (
      body.resetCooldown === true ||
      body.resetLockout === true ||
      req.nextUrl.searchParams.get("resetCooldown") === "true" ||
      req.headers.get("x-dev-bypass-cooldown") === "true"
    );

    if (bypassCooldown) {
      await userRef.update({
        proctoringLockoutUntil: FieldValue.delete(),
        [`skillLockoutUntil.${skill}`]: FieldValue.delete(),
        [`skillLockoutUntil.${normalizedSkill}`]: FieldValue.delete(),
        assessmentInfractionCount: FieldValue.delete(),
        assessmentViolationCount: FieldValue.delete(),
        assessmentLastViolationAt: FieldValue.delete(),
        [`failedAssessments.${skill}`]: FieldValue.delete(),
        [`failedAssessments.${normalizedSkill}`]: FieldValue.delete(),
      }).catch(() => {});
    }

    // 2. Specific Language / Skill Ban Check (Applies ONLY to that specific language, NOT all languages)
    const skillLockout = userData.skillLockoutUntil?.[skill] || userData.skillLockoutUntil?.[normalizedSkill];
    if (!isAdmin && !bypassCooldown && skillLockout && skillLockout > now) {
      return NextResponse.json({
        error: `Your access to the ${skill} assessment is temporarily suspended due to a proctoring violation. You may continue verifying other languages.`,
        isProctoringLockout: true,
        retryAvailableAt: new Date(skillLockout).toISOString(),
      }, { status: 403 });
    }

    // Check for integrity termination (30-day cooldown)
    const integrityTimestamp = userData.integrityTerminations?.[skill] || userData.integrityTerminations?.[normalizedSkill];
    if (!isAdmin && !bypassCooldown && integrityTimestamp) {
      const integrityMs = typeof integrityTimestamp.toMillis === "function" ? integrityTimestamp.toMillis() : integrityTimestamp;
      const cooldownDays = 30; // 30 days for termination
      const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

      if (now - integrityMs < cooldownMs) {
        return NextResponse.json({
          error: `Your access to the ${skill} assessment is temporarily suspended due to a prior integrity violation or early termination. You may re-attempt this skill after the 30-day cooldown period.`,
          cooldownDays,
          retryAvailableAt: new Date(integrityMs + cooldownMs).toISOString(),
        }, { status: 429 });
      }
    }

    // Check for normal failure (14-day cooldown)
    const failedTimestamp = userData.failedAssessments?.[skill] || userData.failedAssessments?.[normalizedSkill];
    if (!isAdmin && !bypassCooldown && failedTimestamp) {
      const failedMs = typeof failedTimestamp.toMillis === "function" ? failedTimestamp.toMillis() : failedTimestamp;
      const cooldownDays = 14; // 14 days for normal fail
      const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

      // Note: If they had an integrity termination, the 30-day block above catches it first.
      // This catches normal failures.
      if (now - failedMs < cooldownMs) {
        return NextResponse.json({
          error: `You are currently in a ${cooldownDays}-day cooldown period for ${skill}. You may take assessments for other skills.`,
          cooldownDays,
          retryAvailableAt: new Date(failedMs + cooldownMs).toISOString(),
        }, { status: 429 });
      }
    }

    // ─── Bank-aware path (Firestore / Dynamic) ─────────────────────────────
    let bank = await getBankForSkill(skill);
    
    // JIT Generation: create the bank if it doesn't exist yet
    if (!bank) {
      try {
        console.log(`[JIT] No bank found for "${skill}". Generating via AI…`);
        await generateAndPublishSkillBank(skill);
        bank = await getBankForSkill(skill);
      } catch (err) {
        console.warn("JIT Generation fallback to built-in content bank:", err);
      }
    }

    // JIT Expansion: if the candidate has seen ≥60% of the MCQ pool, silently
    // queue another generation batch in the background so the pool grows ahead
    // of their next attempt. We do NOT await this — it must not block the response.
    if (bank && bank.mcqs.length > 0) {
      const seenMcqRaw = candidateData.seenQuestions?.[normalizedSkill]?.mcq || [];
      const seenRatio = seenMcqRaw.length / bank.mcqs.length;
      if (seenRatio >= 0.6) {
        const nextBatch = Math.ceil(seenMcqRaw.length / 25);
        console.log(
          `[JIT-EXPAND] "${skill}": candidate has seen ${seenMcqRaw.length}/${bank.mcqs.length} MCQs (${Math.round(seenRatio * 100)}%). ` +
          `Queuing background batch #${nextBatch}…`
        );
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/generate-drafts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-seed-key": "meritlane-secret-seeder-key" },
          body: JSON.stringify({ skill, batchIndex: nextBatch }),
        }).catch(e => console.warn("[JIT-EXPAND] Background batch failed:", e.message));
      }
    }

    const hasBankSupport = Boolean(bank);

    // Time limits:
    // Coding-capable: 90 min | MCQ / Query / Error finding: 45 min
    const hasCodingPool = bank ? Boolean((bank.easy && bank.easy.length > 0) || (bank.mediumHard && bank.mediumHard.length > 0)) : false;
    const timeLimitMinutes = hasCodingPool ? 90 : 45;
    const sessionWindowMs = timeLimitMinutes * 60 * 1000;
    const gracePeriodMs = 2 * 60 * 1000; // 2-minute grace on top of the time limit


    // Resume active session if within window (unless switchTrack is explicitly requested)
    if (userData.assessmentStartedAt && userData.assessmentSkill === skill && !switchTrack) {
      const startedMs = userData.assessmentStartedAt.toMillis?.() || userData.assessmentStartedAt;
      if (now - startedMs < sessionWindowMs) {
        // Build resume content
        let resumeContent: Record<string, unknown> = {};

        if (hasBankSupport && userData.assessmentEasyQuestionId) {
          // Bank-aware resume
          let easyQ: any = undefined;
          let mediumQ: any = undefined;

          if (typeof userData.assessmentEasyQuestionId === "string" && userData.assessmentEasyQuestionId.startsWith("leetcode_")) {
            easyQ = await getInterviewQuestionById(userData.assessmentEasyQuestionId);
            if (userData.assessmentMediumQuestionId) {
              mediumQ = await getInterviewQuestionById(userData.assessmentMediumQuestionId);
            }
          }

          if (!easyQ) {
            const seenAll = [...(bank!.easy || []), ...(bank!.mediumHard || [])];
            const uniqueAll = Array.from(new Map(seenAll.map(q => [q.id, q])).values());
            const bankEasy = uniqueAll.find(q => q.id === userData.assessmentEasyQuestionId);
            if (bankEasy) easyQ = sanitiseCodingQuestion(bankEasy);
            if (userData.assessmentMediumQuestionId && userData.assessmentMediumQuestionId !== userData.assessmentEasyQuestionId) {
              const bankMed = uniqueAll.find(q => q.id === userData.assessmentMediumQuestionId);
              if (bankMed) mediumQ = sanitiseCodingQuestion(bankMed);
            }
          }

          const codingTasks = [];
          if (easyQ) codingTasks.push(easyQ);
          if (mediumQ && mediumQ.id !== easyQ?.id) codingTasks.push(mediumQ);

          const mcqIds: string[] = userData.assessmentMcqIds || [];
          const mcqItems = (bank!.mcqs || []).filter(m => mcqIds.includes(m.id));

          resumeContent = {
            codingTasks,
            coding: easyQ ? sanitiseCodingQuestion(easyQ) : undefined,
            mcqs: sanitiseMcqs(mcqItems),
            hasCoding: codingTasks.length > 0,
            timeLimitMinutes,
            assessmentType: codingTasks.length > 0 ? "coding_capable" : "mcq_only",
          };
        } else {
          const candidateSeed = userData.assessmentSeed || uid;
          const builtinContent = getAssessmentContent(skill, candidateSeed, { sanitize: true });
          if (!builtinContent) {
            return NextResponse.json({ error: `Assessment content for ${skill} is not available.` }, { status: 404 });
          }
          resumeContent = {
            ...builtinContent,
            codingTasks: builtinContent.codingTasks || (builtinContent.coding ? [builtinContent.coding] : []),
            assessmentType: builtinContent.hasCoding ? "coding_capable" : "mcq_only",
            timeLimitMinutes: builtinContent.hasCoding ? 90 : 35,
          };
        }

        const activeTrack: "standard" | "advanced" = userData.assessmentTrack || (userData.assessmentMediumQuestionId ? "standard" : "advanced");

        return NextResponse.json({ 
          message: "Resuming session",
          startedAt: startedMs,
          variant: userData.assessmentVariant || "A",
          skill,
          track: activeTrack,
          content: {
            ...resumeContent,
            track: activeTrack,
          }
        }, { status: 200 });
      }
    }

    // ─── Start fresh session ────────────────────────────────────────────────────
    let freshContent: Record<string, unknown> = {};
    const firestoreUpdates: Record<string, unknown> = {
      assessmentStartedAt: FieldValue.serverTimestamp(),
      assessmentVariant: "A",
      assessmentSkill: skill,
      assessmentTrack: validTrack,
    };

    if (hasBankSupport && bank) {
      // Read candidate's seen questions for this skill
      const seenRaw = candidateData.seenQuestions?.[normalizedSkill] || {};
      const seen = {
        coding: Array.isArray(seenRaw.coding) ? seenRaw.coding : [],
        mcq: Array.isArray(seenRaw.mcq) ? seenRaw.mcq : [],
      };

      // Select non-repeating assignment (seeded by uid for per-user uniqueness)
      const assignment = selectAssignment(bank, seen, skill, uid);

      // Store question IDs in user session
      firestoreUpdates.assessmentMcqIds = assignment.mcqIds;
      firestoreUpdates.assessmentSeed = FieldValue.delete();

      const candidateUpdates: Record<string, unknown> = {
        [`seenQuestions.${normalizedSkill}.mcq`]: FieldValue.arrayUnion(...assignment.mcqIds),
      };

      // Pick coding questions from 500 top interview questions pool if skill has coding
      let interviewAssignment = null;
      if (hasCodingPool) {
        interviewAssignment = await selectRandomInterviewQuestions(
          uid,
          skill,
          seen.coding,
          `${uid}::${skill}::${Date.now()}`,
          validTrack
        );
      }

      if (interviewAssignment && interviewAssignment.tasks.length > 0) {
        const codingTasks = interviewAssignment.tasks;
        const easyId = interviewAssignment.easyId;
        const mediumId = interviewAssignment.mediumId;

        firestoreUpdates.assessmentEasyQuestionId = easyId;
        const codingIdsToMarkSeen = [easyId];

        if (mediumId && mediumId !== easyId) {
          firestoreUpdates.assessmentMediumQuestionId = mediumId;
          codingIdsToMarkSeen.push(mediumId);
        } else {
          firestoreUpdates.assessmentMediumQuestionId = FieldValue.delete();
        }

        candidateUpdates[`seenQuestions.${normalizedSkill}.coding`] = FieldValue.arrayUnion(...codingIdsToMarkSeen);

        freshContent = {
          codingTasks,
          coding: codingTasks[0], // backward compat for page.tsx
          mcqs: sanitiseMcqs(assignment.mcqs),
          hasCoding: true,
          timeLimitMinutes: 90,
          assessmentType: "coding_capable",
          track: validTrack,
        };
      } else if (assignment.easy && assignment.easyId) {
        const hasDistinctMedium = Boolean(
          assignment.medium && assignment.mediumId && assignment.mediumId !== assignment.easyId
        );
        const codingTasks = [sanitiseCodingQuestion(assignment.easy)];
        
        firestoreUpdates.assessmentEasyQuestionId = assignment.easyId;
        const codingIdsToMarkSeen = [assignment.easyId];

        if (hasDistinctMedium) {
          codingTasks.push(sanitiseCodingQuestion(assignment.medium!));
          firestoreUpdates.assessmentMediumQuestionId = assignment.mediumId;
          codingIdsToMarkSeen.push(assignment.mediumId!);
        } else {
          firestoreUpdates.assessmentMediumQuestionId = FieldValue.delete();
        }

        candidateUpdates[`seenQuestions.${normalizedSkill}.coding`] = FieldValue.arrayUnion(...codingIdsToMarkSeen);

        freshContent = {
          codingTasks,
          coding: sanitiseCodingQuestion(assignment.easy), // backward compat for page.tsx
          mcqs: sanitiseMcqs(assignment.mcqs),
          hasCoding: true,
          timeLimitMinutes: 90,
          assessmentType: "coding_capable",
          track: validTrack,
        };
      } else {
        // MCQ / Query Writing / Error Finding assignment
        freshContent = {
          mcqs: sanitiseMcqs(assignment.mcqs),
          hasCoding: false,
          timeLimitMinutes: 45,
          assessmentType: "mcq_only",
          track: validTrack,
        };
      }

      candidateRef.update(candidateUpdates).catch((e: Error) => console.error("[seenQuestions update failed]", e.message));
    } else {
      const seed = Date.now();
      firestoreUpdates.assessmentSeed = seed;
      const builtinContent = getAssessmentContent(skill, seed, { sanitize: true });
      if (!builtinContent) {
        return NextResponse.json({ error: `Assessment content for ${skill} is not available.` }, { status: 404 });
      }
      freshContent = {
        ...builtinContent,
        codingTasks: builtinContent.codingTasks || (builtinContent.coding ? [builtinContent.coding] : []),
        assessmentType: builtinContent.hasCoding ? "coding_capable" : "mcq_only",
        timeLimitMinutes: builtinContent.hasCoding ? 90 : 45,
      };
    }

    await userRef.update(firestoreUpdates);
    // Use local timestamp — saves an extra Firestore read after update
    const startedAt = Date.now();

    return NextResponse.json({ 
      message: "Assessment started",
      startedAt,
      variant: "A",
      skill,
      track: validTrack,
      content: {
        ...freshContent,
        track: validTrack,
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error starting assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
