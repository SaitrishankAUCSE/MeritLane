import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from 'firebase-admin/firestore';
import { getAssessmentContent } from "@/lib/assessments/content";

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
    
    if (!candidateDoc.exists) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    const candidateData = candidateDoc.exists ? (candidateDoc.data() || {}) : {};
    const userData = userDoc.data() || {};
    
    // Validate skill belongs to candidate (check candidateDoc skills or userDoc declared skills)
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

    // Check cooldown — integrity terminations use a 21-day window; normal failures use 14-day
    if (userData.failedAssessments && userData.failedAssessments[skill]) {
      const failedTimestamp = userData.failedAssessments[skill];
      const failedMs = typeof failedTimestamp.toMillis === "function" ? failedTimestamp.toMillis() : failedTimestamp;

      // Detect integrity termination (written by /api/terminate-assessment)
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

    // Check if an attempt is already active
    if (userData.assessmentStartedAt && userData.assessmentSkill === skill) {
      const startedMs = userData.assessmentStartedAt.toMillis();
      const fortyFiveMinsMs = 45 * 60 * 1000;
      
      if (now - startedMs < fortyFiveMinsMs) {
        const activeSeed = userData.assessmentSeed || uid;
        const activeContent = getAssessmentContent(skill, activeSeed);
        const sanitizedActiveContent = {
          mcqs: activeContent.mcqs.map((mcq) => ({
            question: mcq.question,
            options: mcq.options
          })),
          coding: activeContent.coding
        };

        return NextResponse.json({ 
          message: "Resuming session",
          startedAt: startedMs,
          variant: userData.assessmentVariant || "A",
          skill: skill,
          content: sanitizedActiveContent
        }, { status: 200 });
      }
    }

    // Generate a fresh unique attempt seed so questions and options are dynamically shuffled every time
    const freshAttemptSeed = `${uid}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    const freshContent = getAssessmentContent(skill, freshAttemptSeed);

    const sanitizedFreshContent = {
      mcqs: freshContent.mcqs.map((mcq) => ({
        question: mcq.question,
        options: mcq.options
      })),
      coding: freshContent.coding
    };

    // Assign a variant (A or B)
    const newVariant = Math.random() > 0.5 ? "A" : "B";

    // Start a fresh session with dynamic seed
    await userRef.update({
      assessmentStartedAt: FieldValue.serverTimestamp(),
      assessmentVariant: newVariant,
      assessmentSkill: skill,
      assessmentSeed: freshAttemptSeed
    });

    const updatedDoc = await userRef.get();
    const startedAt = updatedDoc.data()?.assessmentStartedAt?.toMillis() || Date.now();

    return NextResponse.json({ 
      message: "Assessment started",
      startedAt: startedAt,
      variant: newVariant,
      skill: skill,
      content: sanitizedFreshContent
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error starting assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
