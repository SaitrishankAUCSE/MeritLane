import React from "react";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { EmployerDossierActions } from "@/components/employer/EmployerDossierActions";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployerCandidateDossierPage({ params }: Props) {
  const { id } = await params;

  let candidateDoc: any = null;
  let userDoc: any = null;

  try {
    if (adminDb) {
      const [cDoc, uDoc] = await Promise.all([
        adminDb.collection("candidates").doc(id).get(),
        adminDb.collection("users").doc(id).get(),
      ]);
      candidateDoc = cDoc;
      userDoc = uDoc;
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
  }

  if (!candidateDoc?.exists && !userDoc?.exists) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-10 max-w-md shadow-xs space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-[#101010]">Candidate Dossier Not Found</h2>
          <p className="text-xs text-black/60 leading-relaxed font-sans">
            The requested candidate record could not be located in the verification registry.
          </p>
          <div className="pt-2">
            <Link href="/employer/dashboard">
              <Button className="rounded-full bg-[#101010] text-white hover:bg-black text-xs px-5 py-2.5">
                Back to Talent Discovery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawCandidate = candidateDoc?.exists ? candidateDoc.data()! : {};
  const rawUser = userDoc?.exists ? userDoc.data()! : {};
  const verifiedSkills = rawCandidate.verifiedSkills || {};
  const hasVerifiedSkills = Object.values(verifiedSkills).some((s: any) => s?.status === "verified");

  const parseTimestamp = (val: any) =>
    val && typeof val === "object" && val.toDate ? val.toDate().toISOString() : val;

  const sanitizedVerifiedSkills: Record<string, any> = {};
  for (const [skillKey, skillVal] of Object.entries(verifiedSkills as Record<string, any>)) {
    if (skillVal) {
      sanitizedVerifiedSkills[skillKey] = {
        status: skillVal.status || "unverified",
        verifiedAt:
          typeof skillVal.verifiedAt === "number"
            ? skillVal.verifiedAt
            : parseTimestamp(skillVal.verifiedAt),
        score: skillVal.score || undefined,
        track: skillVal.track || undefined,
        badge: skillVal.badge || undefined,
      };
    }
  }

  const candidate = {
    name: rawCandidate.name || rawUser.displayName || rawUser.name || "Candidate",
    skills: rawCandidate.skills || rawUser.skills || [],
    projects: rawCandidate.projects || rawUser.projects || [],
    college: rawCandidate.college || rawUser.college || "",
    degree: rawCandidate.degree || rawUser.degree || "",
    branch: rawCandidate.branch || rawUser.branch || "",
    gradYear: rawCandidate.gradYear || rawUser.gradYear || "",
    verificationStatus: rawCandidate.verificationStatus || (hasVerifiedSkills ? "verified" : "draft"),
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
    candidateKey: rawCandidate.candidateKey || rawUser.candidateKey || (id ? `ML-${id.substring(0, 8).toUpperCase()}` : ""),
    avatarUrl: rawCandidate.avatarUrl || rawUser.photoURL || "",
    avatarBadge: rawCandidate.avatarBadge || "auto",
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
    photoURL: rawUser.photoURL || "",
  };

  return (
    <div className="relative min-h-screen bg-[#F8F8F6] flex flex-col">
      {/* Client Component for floating shortlist button, message, AI summary, and navigation */}
      <EmployerDossierActions candidateId={id} candidateName={candidate.name} />

      {/* Candidate Public Proof Layout */}
      <div className="flex-1 mt-16 pb-24">
        <PublicProofRecord id={id} candidate={candidate} user={user} hideHeader={true} />
      </div>
    </div>
  );
}
