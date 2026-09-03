import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { calculateProfileCompletion } from "@/lib/profileCompletion";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const jobDoc = await adminDb.collection("jobs").doc(id).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobData = { id: jobDoc.id, ...jobDoc.data() } as any;

    let hasApplied = false;
    let candidateCompletion: any = null;

    // Optional candidate check if auth header is present
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && adminAuth) {
      try {
        const token = authHeader.split("Bearer ")[1];
        const decoded = await adminAuth.verifyIdToken(token);
        const candidateUid = decoded.uid;

        const appDoc = await adminDb
          .collection("jobApplications")
          .doc(`${id}_${candidateUid}`)
          .get();
        hasApplied = appDoc.exists;

        const candDoc = await adminDb.collection("candidates").doc(candidateUid).get();
        if (candDoc.exists) {
          candidateCompletion = calculateProfileCompletion(candDoc.data() as any);
        }
      } catch {
        // Non-blocking for unauthenticated public preview
      }
    }

    return NextResponse.json({ job: jobData, hasApplied, candidateCompletion }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/jobs/[id] error:", err);
    return NextResponse.json({ error: "Failed to load job details" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const jobDoc = await adminDb.collection("jobs").doc(id).get();
    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobDoc.data()!;
    if (job.employerId !== employerUid) {
      return NextResponse.json({ error: "Forbidden: You do not own this job" }, { status: 403 });
    }

    const body = await req.json();
    const { status, title, description, location, workMode, employmentType, requiredSkills, salaryRange } = body;

    const updatePayload: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (title && title.trim()) updatePayload.title = title.trim();
    if (description && description.trim()) updatePayload.description = description.trim();
    if (location && location.trim()) updatePayload.location = location.trim();
    if (workMode) updatePayload.workMode = workMode;
    if (employmentType) updatePayload.employmentType = employmentType;
    if (Array.isArray(requiredSkills)) updatePayload.requiredSkills = requiredSkills.map((s: string) => s.trim()).filter(Boolean);
    if (salaryRange !== undefined) updatePayload.salaryRange = salaryRange.trim();

    if (status) {
      const allowed = ["draft", "published", "paused", "closed"];
      if (!allowed.includes(status)) {
        return NextResponse.json({ error: "Invalid job status transition" }, { status: 400 });
      }
      updatePayload.status = status;
      if (status === "published" && !job.publishedAt) {
        updatePayload.publishedAt = Date.now();
      }
      if (status === "closed" && !job.closedAt) {
        updatePayload.closedAt = Date.now();
      }
    }

    await adminDb.collection("jobs").doc(id).update(updatePayload);

    return NextResponse.json({ success: true, message: "Job updated successfully." }, { status: 200 });
  } catch (err: any) {
    console.error("PATCH /api/jobs/[id] error:", err);
    return NextResponse.json({ error: err.message || "Failed to update job" }, { status: 500 });
  }
}
