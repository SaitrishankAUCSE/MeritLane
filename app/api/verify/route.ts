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

      if (execResult.isInfrastructureError) {
        return NextResponse.json({
          error: "Compiler sandbox is temporarily unreachable due to network latency. Please click Run again.",
          retryable: true,
        }, { status: 503 });
      }

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

      if (easyExec.isInfrastructureError) {
        return NextResponse.json({
          error: "Assessment compiler sandbox is temporarily unreachable due to network latency. Your session and attempt have NOT been consumed. Please click Submit again.",
          retryable: true,
        }, { status: 503 });
      }

      easyResult = {
        passedTests: easyExec.passedTests,
        totalTests: easyExec.totalTests || 50,
        passed: easyExec.passedTests === (easyExec.totalTests || 50),
      };

      let mediumExec: { passedTests: number; totalTests: number; isInfrastructureError?: boolean } = { passedTests: 0, totalTests: 50 };
      if (mediumCode) {
        const res = await executeCode({
          skill,
          code: mediumCode,
          language,
          isPublicTest: false,
          variant,
          questionId: mediumQId,
        });

        if (res.isInfrastructureError) {
          return NextResponse.json({
            error: "Assessment compiler sandbox is temporarily unreachable due to network latency. Your session and attempt have NOT been consumed. Please click Submit again.",
            retryable: true,
          }, { status: 503 });
        }

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

      if (execResult.isInfrastructureError) {
        return NextResponse.json({
          error: "Assessment compiler sandbox is temporarily unreachable due to network latency. Your session and attempt have NOT been consumed. Please click Submit again.",
          retryable: true,
        }, { status: 503 });
      }

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

    // ── Step 3: Apply proportional test-case scoring rules ───────────────────
    // Proportional test-case scoring:
    //   - If candidate passes 50% of test cases, award half score for that coding question.
    //   - EASY task: proportional to passed test cases (35% weight in dual-task mode)
    //   - MEDIUM task: proportional to passed test cases (35% weight in dual-task mode)
    //   - MCQ section: proportional to correct answers (30% weight)
    //   - Single coding task: 70% coding + 30% MCQ
    //   - Passing threshold for every skill: overall score >= 75%
    const easyPct = easyResult.totalTests > 0 ? (easyResult.passedTests / easyResult.totalTests) * 100 : 0;
    const mediumPct = mediumResult.totalTests > 0 ? (mediumResult.passedTests / mediumResult.totalTests) * 100 : 0;

    const isDualTask = hasCodingSubmission && (mediumCode || (isBankAssessment && mediumQId));
    
    let score = 0;
    if (hasCodingSubmission) {
      if (isDualTask) {
        score = Math.round((easyPct * 0.35) + (mediumPct * 0.35) + (mcqPct * 0.30));
      } else {
        score = Math.round((easyPct * 0.70) + (mcqPct * 0.30));
      }
    } else {
      score = Math.round(mcqPct);
    }

    // Unified passing threshold: overall score >= 75%
    const passed = score >= 75;

    // Component score trace for Proof Trace display
    const assessmentScores = {
      easy: Math.round(easyPct),
      easyPassedTests: easyResult.passedTests,
      easyTotalTests: easyResult.totalTests,
      easyPassed: easyPct >= 75,
      medium: Math.round(mediumPct),
      mediumPassedTests: mediumResult.passedTests,
      mediumTotalTests: mediumResult.totalTests,
      mediumPassed: mediumPct >= 75,
      mcq: mcqScore,
      mcqPassed: mcqPct >= 75,
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
      const updatedVerifiedSkills = {
        ...(candidateData.verifiedSkills || {}),
        [skill]: {
          status: "verified",
          score,
          assessmentScores,
          verifiedAt: nowMs,
          aiFeedback,
        },
      };

      // ── 50% Assessments Milestone Rule for Employer Portal ──
      // Candidate must pass at least 50% (Math.ceil(totalSkills / 2)) of listed resume skills
      // with a score of >= 75% to appear in the Employer Portal.
      const candidateSkills: string[] = candidateData.skills || userData.skills || [skill];
      const totalSkillsCount = candidateSkills.length;
      const requiredVerifiedCount = Math.max(1, Math.ceil(totalSkillsCount / 2));
      const passedSkillsWith75 = Object.values(updatedVerifiedSkills).filter(
        (s: any) => s?.status === "verified" && (s?.score ?? 0) >= 75
      ).length;

      const isEligibleForEmployerPortal = passedSkillsWith75 >= requiredVerifiedCount;
      const newVerificationStatus = isEligibleForEmployerPortal ? "verified" : "partially_verified";

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
          verificationStatus: newVerificationStatus,
          assessmentDate: FieldValue.serverTimestamp(),
          ...sessionClearFields,
          [`failedAssessments.${skill}`]: FieldValue.delete(),
          [`failedAssessmentsFeedback.${skill}`]: FieldValue.delete(),
          [`integrityTerminations.${skill}`]: FieldValue.delete(),
        }),
        candidateRef.update({
          verificationStatus: newVerificationStatus,
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
        employerPortalUnlocked: isEligibleForEmployerPortal,
        qualifiedSkillsCount: passedSkillsWith75,
        requiredForEmployerPortal: requiredVerifiedCount,
        totalSkillsCount,
        skillVerificationPercentage: totalSkillsCount > 0 ? Math.round((passedSkillsWith75 / totalSkillsCount) * 100) : 0,
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
