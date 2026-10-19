import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { resolveSkillKey } from "@/lib/assessments/content";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin is not initialized" }, { status: 500 });
    }

    const body = await req.json();
    const {
      uid,
      name,
      email,
      phone,
      college,
      branch,
      gradYear,
      githubUrl,
      resumeUrl,
      bio,
      candidateKey,
      skills,
    } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing candidate uid" }, { status: 400 });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ message: "No skills to process", recorded: 0 }, { status: 200 });
    }

    // Filter out skills that do NOT have a pre-built assessment track in MeritLane
    const newSkills = skills.filter((s: string) => {
      if (!s || typeof s !== "string") return false;
      const resolved = resolveSkillKey(s);
      return !resolved;
    });

    if (newSkills.length === 0) {
      return NextResponse.json({ message: "All skills are already supported", recorded: 0 }, { status: 200 });
    }

    const batch = adminDb.batch();
    const recordedList: string[] = [];

    for (const rawSkill of newSkills) {
      const cleanSkill = String(rawSkill).trim();
      if (!cleanSkill) continue;

      const slug = cleanSkill.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const docId = `${uid}_${slug}`;
      const docRef = adminDb.collection("newSkillRequests").doc(docId);

      batch.set(
        docRef,
        {
          id: docId,
          candidateUid: uid,
          candidateName: name || "",
          candidateEmail: email || "",
          candidatePhone: phone || "",
          candidateCollege: college || "",
          candidateBranch: branch || "",
          candidateGradYear: gradYear || "",
          candidateGithubUrl: githubUrl || "",
          candidateResumeUrl: resumeUrl || "",
          candidateBio: bio || "",
          candidateKey: candidateKey || "",
          skill: cleanSkill,
          allSkills: skills,
          status: "pending",
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      recordedList.push(cleanSkill);
    }

    await batch.commit();

    return NextResponse.json({
      message: `Recorded ${recordedList.length} new skill request(s)`,
      recorded: recordedList.length,
      newSkills: recordedList,
    });
  } catch (error: any) {
    console.error("[Candidate New Skills Error]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || String(error) },
      { status: 500 }
    );
  }
}
