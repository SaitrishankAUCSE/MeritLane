import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const candidateUid = decodedToken.uid;

    // 1. Verify user role is candidate
    const userDoc = await adminDb.collection("users").doc(candidateUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "candidate") {
      return NextResponse.json({ error: "Forbidden: Only candidates can apply for jobs" }, { status: 403 });
    }

    // 2. Verify job exists and is actively published
    const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const job = jobDoc.data()!;
    if (job.status !== "published") {
      return NextResponse.json(
        { error: "This job is not currently accepting applications." },
        { status: 400 }
      );
    }

    // 3. Verify candidate profile exists
    const candidateDoc = await adminDb.collection("candidates").doc(candidateUid).get();
    if (!candidateDoc.exists) {
      return NextResponse.json(
        {
          error: "Candidate profile record not found. Please establish your profile before applying.",
          percentage: 0,
        },
        { status: 403 }
      );
    }

    const candidateProfile = candidateDoc.data() as any;

    // 4. CRITICAL GATE: Canonical Profile Completion must be EXACTLY 100%
    const completionResult = calculateProfileCompletion(candidateProfile);
    if (!completionResult.isComplete || completionResult.percentage < 100) {
      return NextResponse.json(
        {
          error: "Complete your profile to 100% before applying.",
          percentage: completionResult.percentage,
          missingFields: completionResult.missingFields,
          breakdown: completionResult.breakdown,
        },
        { status: 403 }
      );
    }

    // 5. ATOMIC DUPLICATE PROTECTION
    const applicationId = `${jobId}_${candidateUid}`;
    const applicationRef = adminDb.collection("jobApplications").doc(applicationId);
    const existingApp = await applicationRef.get();

    if (existingApp.exists) {
      return NextResponse.json(
        { error: "You have already applied to this job." },
        { status: 409 }
      );
    }

    // 6. Assemble application record
    const now = Date.now();
    const applicationData = {
      id: applicationId,
      jobId,
      employerId: job.employerId,
      candidateId: candidateUid,
      candidateName: candidateProfile.name || userDoc.data()?.name || "Candidate",
      candidateKey: candidateProfile.candidateKey || `ML-${candidateUid.slice(0, 8).toUpperCase()}`,
      candidateCollege: candidateProfile.college || "",
      candidateBranch: candidateProfile.branch || "",
      candidateGradYear: candidateProfile.gradYear || "",
      candidateSkills: candidateProfile.skills || [],
      candidateVerifiedSkills: candidateProfile.verifiedSkills || {},
      status: "applied", // Initial stage in hiring pipeline
      appliedAt: now,
      updatedAt: now,
    };

    // 7. Atomically save application and increment applicationCount on job
    const batch = adminDb.batch();
    batch.set(applicationRef, applicationData);
    batch.update(adminDb.collection("jobs").doc(jobId), {
      applicationCount: FieldValue.increment(1),
      updatedAt: now,
    });
    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully.",
        applicationId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/jobs/[id]/apply error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
