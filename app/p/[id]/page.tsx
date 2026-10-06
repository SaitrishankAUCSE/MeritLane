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
    // Fetch both docs in parallel for faster server-side rendering
    [candidateDoc, userDoc] = await Promise.all([
      adminDb!.collection("candidates").doc(id).get(),
      adminDb!.collection("users").doc(id).get(),
    ]);
  } catch (err) {
    console.error("Error fetching public profile:", err);
    notFound();
  }

  if (!candidateDoc?.exists && !userDoc?.exists) {
    notFound();
  }

  const rawCandidate = candidateDoc?.exists ? candidateDoc.data()! : {};
  const rawUser = userDoc?.exists ? userDoc.data()! : {};

  const verifiedSkills = rawCandidate.verifiedSkills || rawUser.verifiedSkills || {};
  const hasVerifiedSkills = Object.values(verifiedSkills).some((s: any) => s?.status === "verified");

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
    name: rawCandidate.name || rawUser.displayName || "Candidate",
    skills: rawCandidate.skills || rawUser.skills || [],
    projects: rawCandidate.projects || rawUser.projects || [],
    college: rawCandidate.college || rawUser.college || "",
    degree: rawCandidate.degree || rawUser.degree || "",
    branch: rawCandidate.branch || rawUser.branch || "",
    gradYear: rawCandidate.gradYear || rawUser.gradYear || "",
    verificationStatus: rawCandidate.verificationStatus || (hasVerifiedSkills ? "verified" : "unverified"),
    verifiedSkills: sanitizedVerifiedSkills,
    githubEvidence: rawCandidate.githubEvidence || rawUser.githubEvidence || null,
    githubUsername: rawCandidate.githubUsername || rawUser.githubUsername || "",
    githubUrl: rawCandidate.githubUrl || rawUser.githubUrl || (rawCandidate.githubUsername ? `https://github.com/${rawCandidate.githubUsername}` : ""),
    linkedinUrl: rawCandidate.linkedinUrl || rawUser.linkedinUrl || "",
    portfolioUrl: rawCandidate.portfolioUrl || rawUser.portfolioUrl || "",
    resumeUrl: rawCandidate.resumeUrl || rawUser.resumeUrl || "",
    resumeFileName: rawCandidate.resumeFileName || rawUser.resumeFileName || "",
    resumeText: rawCandidate.resumeText || rawUser.resumeText || "",
    resumePdfDataUrl: rawCandidate.resumePdfDataUrl || rawUser.resumePdfDataUrl || "",
    candidateKey: rawCandidate.candidateKey || rawUser.candidateKey || "",
    avatarUrl: rawCandidate.avatarUrl || rawUser.photoURL || "",
    atsScore: rawCandidate.atsScore || rawUser.atsScore || null,
    atsRating: rawCandidate.atsRating || rawUser.atsRating || "",
    targetRoles: rawCandidate.targetRoles || rawUser.targetRoles || [],
    preferredLocations: rawCandidate.preferredLocations || rawUser.preferredLocations || [],
    workPreference: rawCandidate.workPreference || rawUser.workPreference || "",
    availability: rawCandidate.availability || rawUser.availability || "",
    bio: rawCandidate.bio || rawUser.bio || "",
    headline: rawCandidate.headline || rawUser.headline || "",
    verifiedAt: parseTimestamp(rawCandidate.verifiedAt || rawUser.verifiedAt) || null,
    updatedAt: parseTimestamp(rawCandidate.updatedAt || rawUser.updatedAt) || null,
  };
  
  const user = {
    photoURL: rawUser.photoURL || rawCandidate.avatarUrl || "",
  };

  return <PublicProofRecord id={id} candidate={candidate} user={user} />;
}
