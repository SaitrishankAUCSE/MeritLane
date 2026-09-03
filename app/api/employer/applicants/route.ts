import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
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

    // Verify user is employer
    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    // Fetch all applications where employerId is employerUid
    let appsSnap = await adminDb
      .collection("jobApplications")
      .where("employerId", "==", employerUid)
      .get();

    // Fallback: fetch employer's jobs first in case some older applications lacked employerId
    const jobsSnap = await adminDb
      .collection("jobs")
      .where("employerId", "==", employerUid)
      .get();

    const jobsMap: Record<string, any> = {};
    jobsSnap.forEach((doc) => {
      jobsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    const jobIds = Object.keys(jobsMap);
    const appsMap: Record<string, any> = {};

    appsSnap.forEach((doc) => {
      const data = doc.data();
      const job = jobsMap[data.jobId] || {};
      appsMap[doc.id] = {
        id: doc.id,
        ...data,
        jobTitle: job.title || "Job Opportunity",
        jobLocation: job.location || "Remote",
        jobWorkMode: job.workMode || "remote",
        jobDepartment: job.department || "Engineering",
      };
    });

    // If there are jobIds, query in batches if any applications didn't have employerId indexed
    if (jobIds.length > 0 && appsSnap.empty) {
      for (let i = 0; i < jobIds.length; i += 10) {
        const batch = jobIds.slice(i, i + 10);
        const batchSnap = await adminDb
          .collection("jobApplications")
          .where("jobId", "in", batch)
          .get();

        batchSnap.forEach((doc) => {
          const data = doc.data();
          const job = jobsMap[data.jobId] || {};
          appsMap[doc.id] = {
            id: doc.id,
            ...data,
            jobTitle: job.title || "Job Opportunity",
            jobLocation: job.location || "Remote",
            jobWorkMode: job.workMode || "remote",
            jobDepartment: job.department || "Engineering",
          };
        });
      }
    }

    const applications = Object.values(appsMap);
    applications.sort((a: any, b: any) => (b.appliedAt || 0) - (a.appliedAt || 0));

    return NextResponse.json(
      {
        applications,
        jobs: Object.values(jobsMap),
        totalCount: applications.length,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/employer/applicants error:", err);
    return NextResponse.json({ error: "Failed to fetch employer applicants" }, { status: 500 });
  }
}
