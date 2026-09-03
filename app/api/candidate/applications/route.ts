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
    const candidateUid = decodedToken.uid;

    const snap = await adminDb
      .collection("jobApplications")
      .where("candidateId", "==", candidateUid)
      .get();

    const applications: any[] = [];
    for (const doc of snap.docs) {
      const appData = doc.data();
      let jobTitle = "Opportunity";
      let companyName = "Verified Employer";
      let location = "Remote";
      let workMode = "remote";
      let jobStatus = "published";

      try {
        const jobDoc = await adminDb.collection("jobs").doc(appData.jobId).get();
        if (jobDoc.exists) {
          const jd = jobDoc.data()!;
          jobTitle = jd.title || jobTitle;
          companyName = jd.companyName || companyName;
          location = jd.location || location;
          workMode = jd.workMode || workMode;
          jobStatus = jd.status || jobStatus;
        }
      } catch {}

      applications.push({
        id: doc.id,
        ...appData,
        jobTitle,
        companyName,
        location,
        workMode,
        jobStatus,
      });
    }

    applications.sort((a, b) => b.appliedAt - a.appliedAt);

    return NextResponse.json({ applications }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/candidate/applications error:", err);
    return NextResponse.json({ error: "Failed to fetch candidate applications" }, { status: 500 });
  }
}
