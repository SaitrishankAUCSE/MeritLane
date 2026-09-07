import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";
import { getBankForSkill, selectAssignment, sanitiseCodingQuestion, sanitiseMcqs } from "@/lib/assessments/selector";

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

    const candidateRef = adminDb.collection("candidates").doc(uid);
    const candidateDoc = await candidateRef.get();
    
    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    const candidateData = candidateDoc.exists ? (candidateDoc.data() || {}) : {};
    const userData = userDoc.data() || {};
    
    // Validate skill belongs to candidate
    const normalizedSkill = skill.toLowerCase().trim();
    const candidateSkills: string[] = [
      ...(candidateData.skills || []),
      ...(userData.skills || [])
    ];
    
    const hasSkill = candidateSkills.some((s: string) => s && s.toLowerCase().trim() === normalizedSkill);
    if (!hasSkill && candidateSkills.length > 0) {
      return NextResponse.json({ error: "Requested skill is not part of your profile" }, { status: 403 });
    }

    const now = Date.now();

    // Check cooldown (unchanged)
    const isDev = process.env.NODE_ENV === "development";
    const bypassCooldown = isDev && (body.resetCooldown === true || req.nextUrl.searchParams.get("resetCooldown") === "true" || req.headers.get("x-dev-bypass-cooldown") === "true");

    if (!bypassCooldown && userData.failedAssessments && userData.failedAssessments[skill]) {
      const failedTimestamp = userData.failedAssessments[skill];
      const failedMs = typeof failedTimestamp.toMillis === "function" ? failedTimestamp.toMillis() : failedTimestamp;
      const isIntegrityTermination = !!(userData.integrityTerminations && userData.integrityTerminations[skill]);
      const cooldownMs = isIntegrityTermination ? 21 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000;
      const cooldownLabel = isIntegrityTermination ? "21-day integrity cooldown" : "14-day cooldown";

      if (now - failedMs < cooldownMs) {
        return NextResponse.json({
          error: `You are currently in a ${cooldownLabel} period for this skill.`,
          cooldownDays: isIntegrityTermination ? 21 : 14,
          retryAvailableAt: new Date(failedMs + cooldownMs).toISOString(),
        }, { status: 429 });
      }
    }

    // ─── Bank-aware path (Python and future skills) ─────────────────────────────
    const bank = await getBankForSkill(skill);
    const hasBankSupport = !!bank;

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
        let resumeContent: Record<string, unknown>;

        if (hasBankSupport && userData.assessmentEasyQuestionId && userData.assessmentMediumQuestionId) {
          // Bank-aware resume
          const seenAll = [...(bank!.easy), ...(bank!.mediumHard)];
          const easyQ = seenAll.find(q => q.id === userData.assessmentEasyQuestionId);
          const mediumQ = seenAll.find(q => q.id === userData.assessmentMediumQuestionId);
          const mcqIds: string[] = userData.assessmentMcqIds || [];
          const mcqItems = bank!.mcqs.filter(m => mcqIds.includes(m.id));

          resumeContent = {
            codingTasks: easyQ && mediumQ ? [sanitiseCodingQuestion(easyQ), sanitiseCodingQuestion(mediumQ)] : [],
            coding: easyQ ? sanitiseCodingQuestion(easyQ) : undefined,
            mcqs: sanitiseMcqs(mcqItems),
            hasCoding: true,
            timeLimitMinutes,
            assessmentType: "coding_capable",
          };
        } else {
          // Legacy content resume
          const activeSeed = userData.assessmentSeed || uid;
          const activeContent = getAssessmentContent(skill, activeSeed);
          resumeContent = {
            mcqs: activeContent.mcqs.map((mcq) => ({
              question: mcq.question,
              options: mcq.options,
              difficulty: mcq.difficulty,
              topic: mcq.topic
            })),
            coding: activeContent.coding,
            hasCoding: activeContent.hasCoding,
            timeLimitMinutes,
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
    let freshContent: Record<string, unknown>;
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
      firestoreUpdates.assessmentEasyQuestionId = assignment.easyId;
      firestoreUpdates.assessmentMediumQuestionId = assignment.mediumId;
      firestoreUpdates.assessmentMcqIds = assignment.mcqIds;
      // Clear legacy seed
      firestoreUpdates.assessmentSeed = FieldValue.delete();

      // Append seen questions to candidate doc (fire-and-forget, don't block response)
      candidateRef.update({
        [`seenQuestions.${normalizedSkill}.coding`]: FieldValue.arrayUnion(assignment.easyId, assignment.mediumId),
        [`seenQuestions.${normalizedSkill}.mcq`]: FieldValue.arrayUnion(...assignment.mcqIds),
      }).catch((e: Error) => console.error("[seenQuestions update failed]", e.message));

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
      // Legacy path: randomise with seed
      const freshSeed = `${uid}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
      firestoreUpdates.assessmentSeed = freshSeed;
      const legacyContent = getAssessmentContent(skill, freshSeed);

      freshContent = {
        mcqs: legacyContent.mcqs.map((mcq) => ({
          question: mcq.question,
          options: mcq.options,
          difficulty: mcq.difficulty,
          topic: mcq.topic
        })),
        coding: legacyContent.coding,
        hasCoding: legacyContent.hasCoding,
        timeLimitMinutes,
        assessmentType: hasBankSupport ? "coding_capable" : "mcq_only",
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
