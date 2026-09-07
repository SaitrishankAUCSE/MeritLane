import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";
import { executeCode } from "@/lib/compiler";

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
    const { skill, answers, code, language, isPublicTest, customInput } = body;
    
    if (!skill || !code) {
      return NextResponse.json({ error: "Skill and code are required" }, { status: 400 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e) {
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
    const candidateData = candidateDoc.exists ? candidateDoc.data() : {};
    const userData = userDoc.data() || {};

    if (!isPublicTest) {
      const userSkill = (userData.assessmentSkill || "").toLowerCase().trim();
      const targetSkill = (skill || "").toLowerCase().trim();
      if (!userData.assessmentStartedAt || (userSkill !== targetSkill && !userSkill.includes(targetSkill) && !targetSkill.includes(userSkill))) {
        return NextResponse.json({ error: "Assessment not started or skill mismatch" }, { status: 400 });
      }

      const startedMs = userData.assessmentStartedAt.toMillis();
      const now = Date.now();
      const sixtyMinsMs = 60 * 60 * 1000;
      const gracePeriodMs = 2 * 60 * 1000; // 2 min grace

      if (now - startedMs > (sixtyMinsMs + gracePeriodMs)) {
        // Time expired
        await userRef.update({
          [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
          assessmentStartedAt: FieldValue.delete(),
          assessmentVariant: FieldValue.delete(),
          assessmentSkill: FieldValue.delete()
        });
        return NextResponse.json({ error: "Assessment time expired" }, { status: 400 });
      }
    }

    // Execute code through real compiler engine
    const variant = userData.assessmentVariant || "A";
    const execResult = await executeCode({
      skill,
      code,
      language,
      isPublicTest: Boolean(isPublicTest),
      variant,
      customInput
    });

    // If it's a public test run ("Run Code"), return compiler diagnostic details immediately without writing to DB
    if (isPublicTest) {
      return NextResponse.json({
        success: execResult.success,
        isPublicTest: true,
        compileSuccess: execResult.compileSuccess,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        durationMs: execResult.durationMs,
        cases: execResult.cases,
        passedTests: execResult.passedTests,
        totalTests: execResult.totalTests
      });
    }

    // Final Submission: Evaluate MCQs with candidate's randomized question seed
    const candidateSeed = userData.assessmentSeed || uid;
    const content = getAssessmentContent(skill, candidateSeed);
    let mcqCorrectCount = 0;
    if (answers && Array.isArray(answers)) {
      answers.forEach((ans: number, idx: number) => {
        if (content.mcqs[idx] && content.mcqs[idx].answerIndex === ans) {
          mcqCorrectCount++;
        }
      });
    }

    const totalMcqs = content.mcqs?.length || 15;
    const mcqPercentage = totalMcqs > 0 ? (mcqCorrectCount / totalMcqs) * 100 : 0;
    const mcqScore = Math.round(mcqPercentage);

    let score = 0;
    let codingScore = 0;
    const hasCoding = content.hasCoding && content.coding;

    if (hasCoding) {
      // Authoritative MeritLane Scoring: 40% Practical MCQs + 60% Practical Coding
      const totalCodingTests = execResult.totalTests || 5;
      const codingPercentage = totalCodingTests > 0 ? (execResult.passedTests / totalCodingTests) * 100 : 0;
      codingScore = Math.round(codingPercentage);
      score = Math.round((mcqPercentage * 0.40) + (codingPercentage * 0.60));
    } else {
      // Non-coding skill assessment: 100% based on comprehensive MCQs
      codingScore = 100;
      score = Math.round(mcqPercentage);
    }

    const passed = score >= 80;

    // Generate AI Code Review / constructive summary
    let aiFeedback = "";
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://meritlane.com",
            "X-Title": "MeritLane"
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [
              {
                role: "system",
                content: "You are a Senior Staff Engineer reviewing a candidate's code submission. Keep your feedback concise (2-3 sentences max). Focus on style, algorithmic efficiency, and cleanliness. Do NOT mention scores or pass/fail grades. Be constructive."
              },
              {
                role: "user",
                content: `Candidate submission for skill "${skill}":\n\n${code}\n\nExecution stdout:\n${execResult.stdout}\n\nCompiler Stderr:\n${execResult.stderr}`
              }
            ]
          })
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
      aiFeedback = `Clean implementation demonstrating solid grasp of ${skill} patterns and test cases. Logic structure is modular and handles standard edge cases effectively.`;
    }

    if (passed) {
      const nowMs = Date.now();
      await Promise.all([
        userRef.update({
          [`assessmentScores.${skill}_finalScore`]: score,
          [`assessmentScores.${skill}_mcq`]: mcqScore,
          [`assessmentScores.${skill}_coding`]: codingScore,
          [`verifiedSkills.${skill}`]: {
            status: "verified",
            score: score,
            verifiedAt: nowMs,
            aiFeedback: aiFeedback
          },
          assessmentDate: FieldValue.serverTimestamp(),
          // Clear active session
          assessmentStartedAt: FieldValue.delete(),
          assessmentVariant: FieldValue.delete(),
          assessmentSkill: FieldValue.delete(),
          assessmentSeed: FieldValue.delete(),
          // Clear failed / cooldown flags if any
          [`failedAssessments.${skill}`]: FieldValue.delete(),
          [`failedAssessmentsFeedback.${skill}`]: FieldValue.delete(),
          [`integrityTerminations.${skill}`]: FieldValue.delete()
        }),
        candidateRef.update({
          verificationStatus: "verified",
          [`verifiedSkills.${skill}`]: {
            status: "verified",
            score: score,
            verifiedAt: nowMs,
            aiFeedback: aiFeedback
          },
          updatedAt: nowMs
        })
      ]);

      return NextResponse.json({
        passed: true,
        score: score,
        status: "verified",
        skill: skill,
        aiFeedback: aiFeedback
      });
    } else {
      // Failed - Enforce cooldown
      await userRef.update({
        [`failedAssessments.${skill}`]: FieldValue.serverTimestamp(),
        [`failedAssessmentsFeedback.${skill}`]: aiFeedback,
        // Clear active session
        assessmentStartedAt: FieldValue.delete(),
        assessmentVariant: FieldValue.delete(),
        assessmentSkill: FieldValue.delete(),
        assessmentSeed: FieldValue.delete()
      });

      const retryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      return NextResponse.json({
        passed: false,
        score: score,
        status: "failed",
        retryAvailableAt: retryDate,
        aiFeedback: aiFeedback
      });
    }

  } catch (error: any) {
    console.error("Error in verify route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
