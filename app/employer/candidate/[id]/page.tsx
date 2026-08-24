import React from "react";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { EmployerDossierActions } from "@/components/employer/EmployerDossierActions";
import { cookies, headers } from "next/headers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployerCandidateDossierPage({ params }: Props) {
  const { id } = await params;

  let candidateDoc;
  let userDoc;

  try {
    candidateDoc = await adminDb!.collection("candidates").doc(id).get();
    userDoc = await adminDb!.collection("users").doc(id).get();
  } catch (err) {
    console.error("Error fetching profile:", err);
    notFound();
  }

  if (!candidateDoc.exists) {
    notFound();
  }

  const rawCandidate = candidateDoc.data()!;
  const verifiedSkills = rawCandidate.verifiedSkills || {};
  const hasVerifiedSkills = Object.values(verifiedSkills).some((s: any) => s?.status === "verified");
  const isCandidateVerified = rawCandidate.verificationStatus === "verified" || hasVerifiedSkills;

  if (!isCandidateVerified) {
    notFound(); // Employers should only see verified candidates
  }

  const rawUser = userDoc.exists ? userDoc.data()! : {};
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

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Client Component for floating shortlist button and navigation */}
      <EmployerDossierActions candidateId={id} />
      
      {/* Reuse the Public Proof layout but hide its own top navbar */}
      <div className="flex-1 mt-16 pb-24">
        <PublicProofRecord id={id} candidate={candidate} user={user} hideHeader={true} />
      </div>
    </div>
  );
}

