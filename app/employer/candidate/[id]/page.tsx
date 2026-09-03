import React from "react";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";
import { PublicProofRecord } from "@/components/public-record/PublicProofRecord";
import { EmployerDossierActions } from "@/components/employer/EmployerDossierActions";
import { cookies, headers } from "next/headers";
import { ContextGuide } from "@/components/ui/ContextGuide";

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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="border border-[#E7E2DA] bg-white p-10 rounded-2xl max-w-md shadow-xs space-y-4">
          <h2 className="text-[20px] font-serif font-bold text-[#1C1917]">Candidate Dossier Not Found</h2>
          <p className="text-[13px] text-[#78716C] leading-relaxed font-sans">
            The requested candidate record could not be located in the verification registry.
          </p>
          <div className="pt-2">
            <a
              href="/employer/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-[12px] font-mono font-semibold rounded-full uppercase tracking-wider hover:bg-[#064E3B] transition-colors"
            >
              Back to Talent Discovery
            </a>
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
      };
    }
  }

  const candidate = {
    name: rawCandidate.name || rawUser.name || "Candidate",
    skills: rawCandidate.skills || [],
    projects: rawCandidate.projects || [],
    college: rawCandidate.college || "",
    branch: rawCandidate.branch || "",
    gradYear: rawCandidate.gradYear || "",
    githubEvidence: rawCandidate.githubEvidence || null,
    githubUrl: rawCandidate.githubUrl || null,
    verificationStatus: rawCandidate.verificationStatus || (hasVerifiedSkills ? "verified" : "draft"),
    verifiedSkills: sanitizedVerifiedSkills,
    verifiedAt: parseTimestamp(rawCandidate.verifiedAt) || null,
    updatedAt: parseTimestamp(rawCandidate.updatedAt) || null,
  };

  const user = {
    photoURL: rawUser.photoURL || "",
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Client Component for floating shortlist button, message, AI summary, and navigation */}
      <EmployerDossierActions candidateId={id} candidateName={candidate.name} />

      {/* Candidate Public Proof Layout */}
      <div className="flex-1 mt-16 pb-24">
        <div className="max-w-[1000px] mx-auto px-6 mt-6">
          <ContextGuide
            storageKey="employer_dossier"
            title="Candidate Dossier"
            description="You are viewing the verified claims and technical evidence for this candidate."
            steps={[
              {
                title: "Review Claims",
                description: "Inspect claimed and formally assessed capabilities.",
                isCompleted: true,
              },
              {
                title: "Review Evidence",
                description: "Click into repositories to inspect commit history and code quality.",
                isCompleted: false,
              },
              {
                title: "Shortlist or Message",
                description: "Use the top action bar to invite to an interview or save to your hiring pipeline.",
                isCompleted: false,
              },
            ]}
          />
        </div>
        <PublicProofRecord id={id} candidate={candidate} user={user} hideHeader={true} />
      </div>
    </div>
  );
}

