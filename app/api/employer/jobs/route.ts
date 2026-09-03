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

    const userDoc = await adminDb.collection("users").doc(employerUid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "employer") {
      return NextResponse.json({ error: "Forbidden: Not an employer" }, { status: 403 });
    }

    const snap = await adminDb
      .collection("jobs")
      .where("employerId", "==", employerUid)
      .get();

    const jobs: any[] = [];
    snap.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    jobs.sort((a, b) => b.updatedAt - a.updatedAt);

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/employer/jobs error:", err);
    return NextResponse.json({ error: "Failed to fetch employer jobs" }, { status: 500 });
  }
}
