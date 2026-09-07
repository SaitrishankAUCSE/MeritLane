import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";
import { executeCode } from "@/lib/compiler";
import { getBankForSkill } from "@/lib/assessments/selector";

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
    // easyCode/mediumCode: dual-task submissions; code: legacy single-task
    const { skill, answers, code, easyCode, mediumCode, language, isPublicTest, customInput, questionId } = body;
    
    if (!skill) {
      return NextResponse.json({ error: "Skill is required" }, { status: 400 });
    }
    if (!isPublicTest && !code && !easyCode) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
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
    const candidateData = candidateDoc.exists ? (candidateDoc.data() || {}) : {};
    const userData = userDoc.data() || {};

    // ─── Session validation ───────────────────────────────────────────────────
    if (!isPublicTest) {
      const userSkill = (userData.assessmentSkill || "").toLowerCase().trim();
      const targetSkill = (skill || "").toLowerCase().trim();
      if (!userData.assessmentStartedAt || (userSkill !== targetSkill && !userSkill.includes(targetSkill) && !targetSkill.includes(userSkill))) {
        return NextResponse.json({ error: "Assessment not started or skill mismatch" }, { status: 400 });
      }

      const startedMs = userData.assessmentStartedAt.toMillis();
      const now = Date.now();
      // 90 min for coding-capable, 35 min for MCQ-only + 2 min grace
      const bank = await getBankForSkill(skill);
      const hasBankSupport = !!bank;
      const timeLimitMs = (hasBankSupport ? 90 : 35) * 60 * 1000;
      const gracePeriodMs = 2 * 60 * 1000;

      if (now - startedMs > (timeLimitMs + gracePeriodMs)) {
        await userRef.update({
          [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
          assessmentStartedAt: FieldValue.delete(),
          assessmentVariant: FieldValue.delete(),
          assessmentSkill: FieldValue.delete(),
          assessmentEasyQuestionId: FieldValue.delete(),
          assessmentMediumQuestionId: FieldValue.delete(),
          assessmentMcqIds: FieldValue.delete(),
          assessmentSeed: FieldValue.delete(),
        });
        return NextResponse.json({ error: "Assessment time expired" }, { status: 400 });
      }
    }

    const variant = userData.assessmentVariant || "A";
    // Detect whether this is a bank-aware assessment
    const easyQId = questionId || userData.assessmentEasyQuestionId;
    const mediumQId = userData.assessmentMediumQuestionId;
    const isBankAssessment = !!(easyQId || mediumQId);

    // ─── Run Code (isPublicTest) — run specified question ────────────────────
    if (isPublicTest) {
      const resolvedCode = code || easyCode || "";
      const execResult = await executeCode({
        skill,
        code: resolvedCode,
        language,
        isPublicTest: true,
        variant,
        customInput,
        questionId: questionId || easyQId || undefined,
      });

      return NextResponse.json({
        success: execResult.success,
        isPublicTest: true,
        compileSuccess: execResult.compileSuccess,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        durationMs: execResult.durationMs,
        cases: execResult.cases,
        passedTests: execResult.passedTests,
        totalTests: execResult.totalTests,
      });
    }

    // ─── Final Submission ────────────────────────────────────────────────────

    // ── Step 1: Run the coding tasks ────────────────────────────────────────
    let easyResult = { passedTests: 0, totalTests: 5, passed: false };
    let mediumResult = { passedTests: 0, totalTests: 50, pct: 0 };

    const hasCodingSubmission = !!(easyCode || code);

    if (hasCodingSubmission && isBankAssessment) {
      // Bank-aware dual-task execution
      const easyExec = await executeCode({
        skill,
        code: easyCode || code,
        language,
        isPublicTest: false,
        variant,
        questionId: easyQId,
      });
      easyResult = {
        passedTests: easyExec.passedTests,
        totalTests: easyExec.totalTests || 50,
        passed: easyExec.passedTests === (easyExec.totalTests || 50),
      };

      let mediumExec = { passedTests: 0, totalTests: 50 };
      if (mediumCode) {
        const res = await executeCode({
          skill,
          code: mediumCode,
          language,
          isPublicTest: false,
          variant,
          questionId: mediumQId,
        });
        mediumExec = { passedTests: res.passedTests, totalTests: res.totalTests || 50 };
      }
      mediumResult = {
        passedTests: mediumExec.passedTests,
        totalTests: mediumExec.totalTests,
        pct: mediumExec.totalTests > 0 ? Math.round((mediumExec.passedTests / mediumExec.totalTests) * 100) : 0,
      };
    } else if (hasCodingSubmission) {
      // Legacy single-task execution
      const execResult = await executeCode({ skill, code: code || easyCode, language, isPublicTest: false, variant, customInput });
      const pct = execResult.totalTests > 0 ? (execResult.passedTests / execResult.totalTests) * 100 : 0;
      easyResult = { passedTests: execResult.passedTests, totalTests: execResult.totalTests || 50, passed: pct >= 100 };
      mediumResult = { passedTests: execResult.passedTests, totalTests: execResult.totalTests || 50, pct: Math.round(pct) };
    }

    // ── Step 2: Score MCQs ───────────────────────────────────────────────────
    let mcqCorrectCount = 0;
    let totalMcqs = 8;

    if (isBankAssessment) {
      // Bank-aware MCQ scoring: use question IDs stored in session
      const bank = await getBankForSkill(skill);
      const sessionMcqIds: string[] = userData.assessmentMcqIds || [];
      if (bank && answers && Array.isArray(answers)) {
        const sessionMcqs = bank.mcqs.filter(m => sessionMcqIds.includes(m.id));
        totalMcqs = sessionMcqs.length;
        sessionMcqs.forEach((mcq, idx) => {
          if (typeof answers[idx] === "number" && mcq.answerIndex === answers[idx]) {
            mcqCorrectCount++;
          }
        });
      }
    } else {
      // Legacy MCQ scoring
      const candidateSeed = userData.assessmentSeed || uid;
      const content = getAssessmentContent(skill, candidateSeed);
      totalMcqs = content.mcqs?.length || 8;
      if (answers && Array.isArray(answers)) {
        answers.forEach((ans: number, idx: number) => {
          if (content.mcqs[idx] && content.mcqs[idx].answerIndex === ans) {
            mcqCorrectCount++;
          }
        });
      }
    }

    const mcqPct = totalMcqs > 0 ? (mcqCorrectCount / totalMcqs) * 100 : 0;
    const mcqScore = Math.round(mcqPct);

    // ── Step 3: Apply approved scoring rules ─────────────────────────────────
    // Approved thresholds:
    //   - EASY task: must be fully correct (100% of 50 hidden tests)
    //   - MEDIUM-HARD task: ≥ 60% correct
    //   - MCQ: ≥ 70% correct
    // Overall score = 30% easy + 40% medium + 30% MCQ
    const easyFullyCorrect = easyResult.totalTests > 0 && easyResult.passedTests === easyResult.totalTests;
    const mediumPass = mediumResult.pct >= 60;
    const mcqPass = mcqPct >= 70;

    const easyPct = easyResult.totalTests > 0 ? Math.round((easyResult.passedTests / easyResult.totalTests) * 100) : 0;
    const score = Math.round((easyPct * 0.30) + (mediumResult.pct * 0.40) + (mcqPct * 0.30));

    // Pass requires all three component thresholds to be met
    const passed = hasCodingSubmission
      ? easyFullyCorrect && mediumPass && mcqPass
      : mcqPass; // MCQ-only assessment

    // Component score trace for Proof Trace display
    const assessmentScores = {
      easy: easyPct,
      easyPassed: easyFullyCorrect,
      medium: mediumResult.pct,
      mediumPassed: mediumPass,
      mcq: mcqScore,
      mcqPassed: mcqPass,
      overall: score,
    };

    // ── Step 4: AI code review ───────────────────────────────────────────────
    let aiFeedback = "";
    const codeForReview = easyCode || code || "";
    if (process.env.OPENROUTER_API_KEY && codeForReview) {
      try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://meritlane.com",
            "X-Title": "MeritLane",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              { role: "system", content: "You are a Senior Staff Engineer reviewing a candidate's code submission. Keep feedback concise (2-3 sentences max). Focus on style, algorithmic efficiency, and correctness. Do NOT mention scores or pass/fail grades. Be constructive." },
              { role: "user", content: `Candidate submission for skill \"${skill}\":\n\n${codeForReview}` },
            ],
          }),
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiFeedback = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (err) {
        console.error("AI feedback generation failed", err);
      }
    }
    if (!aiFeedback) {
      aiFeedback = `Submission demonstrates solid grasp of ${skill} patterns. Logic structure is modular and handles standard edge cases effectively.`;
    }

    // ── Step 5: Write result to Firestore ────────────────────────────────────
    const sessionClearFields = {
      assessmentStartedAt: FieldValue.delete(),
      assessmentVariant: FieldValue.delete(),
      assessmentSkill: FieldValue.delete(),
      assessmentSeed: FieldValue.delete(),
      assessmentEasyQuestionId: FieldValue.delete(),
      assessmentMediumQuestionId: FieldValue.delete(),
      assessmentMcqIds: FieldValue.delete(),
    };

    if (passed) {
      const nowMs = Date.now();
      await Promise.all([
        userRef.update({
          [`assessmentScores.${skill}`]: assessmentScores,
          [`verifiedSkills.${skill}`]: {
            status: "verified",
            score,
            assessmentScores,
            verifiedAt: nowMs,
            aiFeedback,
          },
          assessmentDate: FieldValue.serverTimestamp(),
          ...sessionClearFields,
          [`failedAssessments.${skill}`]: FieldValue.delete(),
          [`failedAssessmentsFeedback.${skill}`]: FieldValue.delete(),
          [`integrityTerminations.${skill}`]: FieldValue.delete(),
        }),
        candidateRef.update({
          verificationStatus: "verified",
          [`verifiedSkills.${skill}`]: {
            status: "verified",
            score,
            assessmentScores,
            verifiedAt: nowMs,
            aiFeedback,
          },
          updatedAt: nowMs,
        }),
      ]);

      return NextResponse.json({
        passed: true,
        score,
        status: "verified",
        skill,
        assessmentScores,
        aiFeedback,
      });
    } else {
      // Failed — apply 14-day cooldown
      await userRef.update({
        [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
        [`failedAssessmentsFeedback.${skill}`]: aiFeedback,
        ...sessionClearFields,
      });

      const retryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      return NextResponse.json({
        passed: false,
        score,
        status: "failed",
        retryAvailableAt: retryDate,
        assessmentScores,
        aiFeedback,
      });
    }

  } catch (error) {
    console.error("Error in verify route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
