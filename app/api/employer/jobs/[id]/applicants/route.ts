import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(
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
    const employerUid = decodedToken.uid;

    const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobDoc.data()!;
    if (job.employerId !== employerUid) {
      return NextResponse.json({ error: "Forbidden: You do not own this job" }, { status: 403 });
    }

    const appsSnap = await adminDb
      .collection("jobApplications")
      .where("jobId", "==", jobId)
      .get();

    const applicants: any[] = [];
    appsSnap.forEach((d) => {
      applicants.push({ id: d.id, ...d.data() });
    });

    applicants.sort((a, b) => b.appliedAt - a.appliedAt);

    return NextResponse.json({ job: { id: jobDoc.id, ...job }, applicants }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/employer/jobs/[id]/applicants error:", err);
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
  }
}

export async function PATCH(
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
    const employerUid = decodedToken.uid;

    const jobDoc = await adminDb.collection("jobs").doc(jobId).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobDoc.data()!;
    if (job.employerId !== employerUid) {
      return NextResponse.json({ error: "Forbidden: You do not own this job" }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, stage } = body;
    if (!candidateId || !stage) {
      return NextResponse.json({ error: "Missing candidateId or stage" }, { status: 400 });
    }

    const validStages = ["applied", "shortlisted", "interviewing", "offer", "hired", "rejected"];
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: "Invalid pipeline stage" }, { status: 400 });
    }

    const applicationId = `${jobId}_${candidateId}`;
    const appRef = adminDb.collection("jobApplications").doc(applicationId);
    const appDoc = await appRef.get();
    if (!appDoc.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const now = Date.now();
    // 1. Update application document
    await appRef.update({
      status: stage,
      updatedAt: now,
    });

    // 2. Sync with existing employer pipeline
    const employerRef = adminDb.collection("employers").doc(employerUid);
    await employerRef.set(
      {
        pipeline: {
          [candidateId]: stage === "applied" ? "shortlisted" : stage,
        },
        updatedAt: now,
      },
      { merge: true }
    );

    return NextResponse.json(
      { success: true, message: `Applicant moved to ${stage}.`, stage },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH /api/employer/jobs/[id]/applicants error:", err);
    return NextResponse.json({ error: err.message || "Failed to update applicant" }, { status: 500 });
  }
}
