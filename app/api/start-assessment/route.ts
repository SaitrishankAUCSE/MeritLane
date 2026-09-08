import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";
import { getBankForSkill, selectAssignment, sanitiseCodingQuestion, sanitiseMcqs } from "@/lib/assessments/selector";
import { generateAndPublishSkillBank } from "@/lib/assessments/generator";

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
    const { skill } = body;
    
    if (!skill) {
      return NextResponse.json({ error: "Skill parameter is required" }, { status: 400 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data() || {};

    const candidateRef = adminDb.collection("candidates").doc(uid);
    let candidateDoc = await candidateRef.get();
    
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

    // 1. Global Proctoring Lockout Check (Overrides everything)
    if (userData.proctoringLockoutUntil && userData.proctoringLockoutUntil > now) {
      return NextResponse.json({
        error: "Your access to assessments is suspended due to a severe proctoring violation. Please contact support if you believe this was an error.",
        isProctoringLockout: true,
        retryAvailableAt: new Date(userData.proctoringLockoutUntil).toISOString(),
      }, { status: 403 });
    }

    // 2. Standard Cooldown Check
    const isDev = process.env.NODE_ENV === "development";
    const bypassCooldown = isDev && (body.resetCooldown === true || req.nextUrl.searchParams.get("resetCooldown") === "true" || req.headers.get("x-dev-bypass-cooldown") === "true");

    if (!bypassCooldown && userData.failedAssessments && userData.failedAssessments[skill]) {
      const failedTimestamp = userData.failedAssessments[skill];
      const failedMs = typeof failedTimestamp.toMillis === "function" ? failedTimestamp.toMillis() : failedTimestamp;
      const cooldownMs = 30 * 24 * 60 * 60 * 1000; // 30 days (1 month)
      const cooldownLabel = "30-day cooldown";

      if (now - failedMs < cooldownMs) {
        return NextResponse.json({
          error: `You are currently in a ${cooldownLabel} period for this skill.`,
          cooldownDays: 30,
          retryAvailableAt: new Date(failedMs + cooldownMs).toISOString(),
        }, { status: 429 });
      }
    }

    // ─── Bank-aware path (Firestore / Dynamic) ─────────────────────────────
    let bank = await getBankForSkill(skill);
    
    // JIT Generation if bank is missing or stale
    if (!bank) {
      try {
        await generateAndPublishSkillBank(skill);
        bank = await getBankForSkill(skill);
      } catch (err) {
        console.warn("JIT Generation fallback to built-in content bank:", err);
      }
    }

    const hasBankSupport = Boolean(bank);

    // Time limits per approved spec:
    // Coding-capable: 90 min | MCQ-only: 35 min
    const timeLimitMinutes = hasBankSupport ? 90 : 35;
    const sessionWindowMs = timeLimitMinutes * 60 * 1000;
    const gracePeriodMs = 2 * 60 * 1000;

    // Resume active session if within window
    if (userData.assessmentStartedAt && userData.assessmentSkill === skill) {
      const startedMs = userData.assessmentStartedAt.toMillis?.() || userData.assessmentStartedAt;
      if (now - startedMs < sessionWindowMs) {
        // Build resume content
        let resumeContent: Record<string, unknown> = {};

        if (hasBankSupport && userData.assessmentEasyQuestionId && userData.assessmentMediumQuestionId) {
          // Bank-aware resume
          const seenAll = [...(bank!.easy || []), ...(bank!.mediumHard || [])];
          const easyQ = seenAll.find(q => q.id === userData.assessmentEasyQuestionId);
          const mediumQ = seenAll.find(q => q.id === userData.assessmentMediumQuestionId);
          const mcqIds: string[] = userData.assessmentMcqIds || [];
          const mcqItems = (bank!.mcqs || []).filter(m => mcqIds.includes(m.id));

          resumeContent = {
            codingTasks: easyQ && mediumQ ? [sanitiseCodingQuestion(easyQ), sanitiseCodingQuestion(mediumQ)] : [],
            coding: easyQ ? sanitiseCodingQuestion(easyQ) : undefined,
            mcqs: sanitiseMcqs(mcqItems),
            hasCoding: !!(easyQ && mediumQ),
            timeLimitMinutes,
            assessmentType: easyQ && mediumQ ? "coding_capable" : "mcq_only",
          };
        } else {
          const candidateSeed = userData.assessmentSeed || uid;
          const builtinContent = getAssessmentContent(skill, candidateSeed, { sanitize: true });
          resumeContent = {
            ...builtinContent,
            codingTasks: builtinContent.coding ? [builtinContent.coding] : [],
            assessmentType: builtinContent.hasCoding ? "coding_capable" : "mcq_only",
            timeLimitMinutes: builtinContent.hasCoding ? 90 : 35,
          };
        }

        return NextResponse.json({ 
          message: "Resuming session",
          startedAt: startedMs,
          variant: userData.assessmentVariant || "A",
          skill,
          content: resumeContent
        }, { status: 200 });
      }
    }

    // ─── Start fresh session ────────────────────────────────────────────────────
    let freshContent: Record<string, unknown> = {};
    const firestoreUpdates: Record<string, unknown> = {
      assessmentStartedAt: FieldValue.serverTimestamp(),
      assessmentVariant: "A",
      assessmentSkill: skill,
    };

    if (hasBankSupport && bank) {
      // Read candidate's seen questions for this skill
      const seenRaw = candidateData.seenQuestions?.[normalizedSkill] || {};
      const seen = {
        coding: Array.isArray(seenRaw.coding) ? seenRaw.coding : [],
        mcq: Array.isArray(seenRaw.mcq) ? seenRaw.mcq : [],
      };

      // Select non-repeating assignment
      const assignment = selectAssignment(bank, seen, skill);

      // Store question IDs in user session
      firestoreUpdates.assessmentMcqIds = assignment.mcqIds;
      firestoreUpdates.assessmentSeed = FieldValue.delete();

      const candidateUpdates: Record<string, unknown> = {
        [`seenQuestions.${normalizedSkill}.mcq`]: FieldValue.arrayUnion(...assignment.mcqIds),
      };

      if (bank.easy?.length > 0 && bank.mediumHard?.length > 0 && assignment.easy && assignment.medium && assignment.easyId && assignment.mediumId) {
        firestoreUpdates.assessmentEasyQuestionId = assignment.easyId;
        firestoreUpdates.assessmentMediumQuestionId = assignment.mediumId;
        candidateUpdates[`seenQuestions.${normalizedSkill}.coding`] = FieldValue.arrayUnion(assignment.easyId, assignment.mediumId);

        freshContent = {
          codingTasks: [
            sanitiseCodingQuestion(assignment.easy),
            sanitiseCodingQuestion(assignment.medium),
          ],
          coding: sanitiseCodingQuestion(assignment.easy), // backward compat for page.tsx
          mcqs: sanitiseMcqs(assignment.mcqs),
          hasCoding: true,
          timeLimitMinutes,
          assessmentType: "coding_capable",
        };
      } else {
        // MCQ Only assignment
        freshContent = {
          mcqs: sanitiseMcqs(assignment.mcqs),
          hasCoding: false,
          timeLimitMinutes: 35,
          assessmentType: "mcq_only",
        };
      }

      candidateRef.update(candidateUpdates).catch((e: Error) => console.error("[seenQuestions update failed]", e.message));
    } else {
      const seed = Date.now();
      firestoreUpdates.assessmentSeed = seed;
      const builtinContent = getAssessmentContent(skill, seed, { sanitize: true });
      freshContent = {
        ...builtinContent,
        codingTasks: builtinContent.coding ? [builtinContent.coding] : [],
        assessmentType: builtinContent.hasCoding ? "coding_capable" : "mcq_only",
        timeLimitMinutes: builtinContent.hasCoding ? 90 : 35,
      };
    }

    await userRef.update(firestoreUpdates);
    const updatedDoc = await userRef.get();
    const startedAt = updatedDoc.data()?.assessmentStartedAt?.toMillis?.() || Date.now();

    return NextResponse.json({ 
      message: "Assessment started",
      startedAt,
      variant: "A",
      skill,
      content: freshContent
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error starting assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
