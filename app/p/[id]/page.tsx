import React from "react";
import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  let candidateDoc;
  let userDoc;

  try {
    candidateDoc = await adminDb!.collection("candidates").doc(id).get();
    userDoc = await adminDb!.collection("users").doc(id).get();
  } catch (err) {
    console.error("Error fetching public profile:", err);
    notFound();
  }

  if (!candidateDoc.exists) {
    notFound();
  }

  const rawCandidate = candidateDoc.data()!;

  const verifiedSkills = rawCandidate.verifiedSkills || {};
  const hasVerifiedSkills = Object.values(verifiedSkills).some((s: any) => s?.status === "verified");
  const isCandidateVerified = rawCandidate.verificationStatus === "verified" || hasVerifiedSkills;

  // Must have at least one verified skill or verified status to be publicly accessible
  if (!isCandidateVerified) {
    notFound();
  }

  const rawUser = userDoc.exists ? userDoc.data()! : {};

  // Deep clone to strip Firestore Timestamps and extract ONLY safe public fields
  // CRITICAL SECURITY FIX: Do not pass the entire document to a Client Component
  // or it will serialize private emails and failed assessment attempts to the browser.
  const parseTimestamp = (val: any) => val && typeof val === "object" && val.toDate ? val.toDate().toISOString() : val;
  
  const sanitizedVerifiedSkills: Record<string, any> = {};
  for (const [skillKey, skillVal] of Object.entries(verifiedSkills as Record<string, any>)) {
    if (skillVal) {
      sanitizedVerifiedSkills[skillKey] = {
        status: skillVal.status || "unverified",
        verifiedAt: typeof skillVal.verifiedAt === "number" ? skillVal.verifiedAt : parseTimestamp(skillVal.verifiedAt),
        score: skillVal.score || undefined
      };
    }
  }

  const candidate = {
    name: rawCandidate.name || "",
    skills: rawCandidate.skills || [],
    projects: rawCandidate.projects || [],
    college: rawCandidate.college || "",
    degree: rawCandidate.degree || "",
    branch: rawCandidate.branch || "",
    gradYear: rawCandidate.gradYear || "",
    verificationStatus: rawCandidate.verificationStatus || (hasVerifiedSkills ? "verified" : "draft"),
    verifiedSkills: sanitizedVerifiedSkills,
    verifiedAt: parseTimestamp(rawCandidate.verifiedAt) || null,
    updatedAt: parseTimestamp(rawCandidate.updatedAt) || null,
  };
  
  const user = {
    photoURL: rawUser.photoURL || "",
  };

  return <PublicProofRecord id={id} candidate={candidate} user={user} />;
}

