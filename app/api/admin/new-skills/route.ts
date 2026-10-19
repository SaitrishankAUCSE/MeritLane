import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { resolveSkillKey } from "@/lib/assessments/content";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

const ADMIN_EMAIL = "saitrishankb9@gmail.com";

async function verifyAdmin(req: NextRequest) {
  if (!adminAuth) throw new Error("Firebase Admin Auth null");
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid token format");
  }
  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  if (decodedToken.admin !== true && decodedToken.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Administrative privilege required");
  }
  return decodedToken;
}

export async function GET(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    try {
      await verifyAdmin(req);
    } catch (authErr: any) {
      return NextResponse.json({ error: authErr.message || "Unauthorized" }, { status: 401 });
    }

    const safeDate = (val: any) => {
      if (!val) return null;
      if (typeof val.toDate === "function") return val.toDate().toISOString();
      if (val instanceof Date) return val.toISOString();
      if (typeof val === "string") return val;
      if (typeof val === "number") return new Date(val).toISOString();
      if (val._seconds) return new Date(val._seconds * 1000).toISOString();
      return null;
    };

    // 1. Fetch explicitly recorded requests from newSkillRequests
    const snapshot = await adminDb.collection("newSkillRequests").get();
    const recordedMap = new Map<string, any>();

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      recordedMap.set(docSnap.id, {
        id: docSnap.id,
        candidateUid: data.candidateUid || "",
        candidateName: data.candidateName || "Anonymous Candidate",
        candidateEmail: data.candidateEmail || "",
        candidatePhone: data.candidatePhone || "",
        candidateCollege: data.candidateCollege || "",
        candidateBranch: data.candidateBranch || "",
        candidateGradYear: data.candidateGradYear || "",
        candidateGithubUrl: data.candidateGithubUrl || "",
        candidateResumeUrl: data.candidateResumeUrl || "",
        candidateBio: data.candidateBio || "",
        candidateKey: data.candidateKey || "",
        skill: data.skill || "",
        allSkills: data.allSkills || [],
        status: data.status || "pending",
        createdAt: safeDate(data.createdAt),
        updatedAt: safeDate(data.updatedAt),
      });
    });

    // 2. Cross-reference candidates collection to catch any legacy or freshly added unlisted skills
    try {
      const candidatesSnap = await adminDb.collection("candidates").get();
      for (const candDoc of candidatesSnap.docs) {
        const cand = candDoc.data();
        const candUid = candDoc.id;
        const skills: string[] = cand.skills || [];

        for (const rawSkill of skills) {
          if (!rawSkill || typeof rawSkill !== "string") continue;
          const isResolved = resolveSkillKey(rawSkill);
          if (!isResolved) {
            const cleanSkill = rawSkill.trim();
            const slug = cleanSkill.toLowerCase().replace(/[^a-z0-9]/g, "_");
            const docId = `${candUid}_${slug}`;

            if (!recordedMap.has(docId)) {
              recordedMap.set(docId, {
                id: docId,
                candidateUid: candUid,
                candidateName: cand.name || "Candidate",
                candidateEmail: cand.email || "",
                candidatePhone: cand.phone || "",
                candidateCollege: cand.college || "",
                candidateBranch: cand.branch || "",
                candidateGradYear: cand.gradYear || "",
                candidateGithubUrl: cand.githubUrl || "",
                candidateResumeUrl: cand.resumeUrl || "",
                candidateBio: cand.bio || "",
                candidateKey: cand.candidateKey || "",
                skill: cleanSkill,
                allSkills: skills,
                status: "pending",
                createdAt: safeDate(cand.updatedAt || cand.createdAt) || new Date().toISOString(),
                updatedAt: safeDate(cand.updatedAt) || new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (candScanErr) {
      console.warn("[Admin New Skills] Failed candidate cross-scan:", candScanErr);
    }

    const newSkills = Array.from(recordedMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ newSkills, count: newSkills.length });
  } catch (error: any) {
    console.error("[Admin New Skills GET Error]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    try {
      await verifyAdmin(req);
    } catch (authErr: any) {
      return NextResponse.json({ error: authErr.message || "Unauthorized" }, { status: 401 });
    }

    const { id, status, notes } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const docRef = adminDb.collection("newSkillRequests").doc(id);
    await docRef.set(
      {
        status,
        notes: notes || "",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ message: "Status updated successfully", id, status });
  } catch (error: any) {
    console.error("[Admin New Skills PATCH Error]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: "Firebase Admin is not configured" }, { status: 500 });
    }

    try {
      await verifyAdmin(req);
    } catch (authErr: any) {
      return NextResponse.json({ error: authErr.message || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    await adminDb.collection("newSkillRequests").doc(id).delete();
    return NextResponse.json({ message: "Skill request removed successfully", id });
  } catch (error: any) {
    console.error("[Admin New Skills DELETE Error]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || String(error) },
      { status: 500 }
    );
  }
}
