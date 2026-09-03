import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase admin not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const skill = searchParams.get("skill")?.toLowerCase().trim();
    const workMode = searchParams.get("workMode");
    const employmentType = searchParams.get("employmentType");

    // Only published jobs are visible publicly or to candidates
    const snap = await adminDb
      .collection("jobs")
      .where("status", "==", "published")
      .get();

    let jobs: any[] = [];
    snap.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    // Sort newest first
    jobs.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt));

    // Filter in memory for maximum search flexibility
    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(search) ||
          j.companyName?.toLowerCase().includes(search) ||
          j.location?.toLowerCase().includes(search) ||
          j.description?.toLowerCase().includes(search)
      );
    }
    if (skill) {
      jobs = jobs.filter((j) =>
        Array.isArray(j.requiredSkills) &&
        j.requiredSkills.some((sk: string) => sk.toLowerCase().includes(skill))
      );
    }
    if (workMode && workMode !== "all") {
      jobs = jobs.filter((j) => j.workMode === workMode);
    }
    if (employmentType && employmentType !== "all") {
      jobs = jobs.filter((j) => j.employmentType === employmentType);
    }

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/jobs error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Only employers can create jobs" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      department,
      description,
      location,
      workMode,
      employmentType,
      requiredSkills,
      salaryRange,
      status = "published",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Job title is required." }, { status: 400 });
    }
    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }
    if (!location || !location.trim()) {
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    }
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return NextResponse.json({ error: "At least one required skill must be specified." }, { status: 400 });
    }

    const validStatuses = ["draft", "published"];
    const jobStatus = validStatuses.includes(status) ? status : "published";

    // Resolve company name
    let companyName = "Verified Organization";
    const employerDoc = await adminDb.collection("employers").doc(employerUid).get();
    if (employerDoc.exists && employerDoc.data()?.companyName) {
      companyName = employerDoc.data()?.companyName;
    } else if (userDoc.data()?.name) {
      companyName = userDoc.data()?.name;
    }

    const now = Date.now();
    const jobData = {
      employerId: employerUid,
      companyName,
      title: title.trim(),
      department: department?.trim() || "",
      description: description.trim(),
      location: location.trim(),
      workMode: workMode || "remote",
      employmentType: employmentType || "full-time",
      requiredSkills: requiredSkills.map((s: string) => s.trim()).filter(Boolean),
      salaryRange: salaryRange?.trim() || "",
      status: jobStatus,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now,
      ...(jobStatus === "published" ? { publishedAt: now } : {}),
    };

    const docRef = await adminDb.collection("jobs").add(jobData);

    return NextResponse.json(
      {
        success: true,
        jobId: docRef.id,
        message: jobStatus === "published" ? "Job published successfully." : "Job saved as draft.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/jobs error:", err);
    return NextResponse.json({ error: err.message || "Failed to create job" }, { status: 500 });
  }
}
