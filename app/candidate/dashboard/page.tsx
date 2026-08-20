"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { ExternalLink, AlertCircle } from "lucide-react";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Button } from "@/components/ui/Button";
import { ProofTrace } from "@/components/ui/ProofTrace";
import { Workspace } from "@/components/proof/Workspace";
import { SectionHeader } from "@/components/proof/SectionHeader";
import { ProofThread, EvidenceBlock, ProofCoverage } from "@/components/proof/ProofThread";
import { StatusMark } from "@/components/proof/StatusMark";
import { TechnicalRecord } from "@/components/proof/Workspace";

export default function CandidateDashboardPage() {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => {
          setProfile(p);
        })
        .catch((err) => console.error(err))
        .finally(() => setDataLoading(false));
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && user?.email?.toLowerCase() === "saitrishankb9@gmail.com") {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return (
      <Workspace>
        <div className="space-y-6 animate-pulse">
          <div className="h-16 w-1/3 bg-surface-high" />
          <div className="h-80 w-full bg-surface-low" />
        </div>
      </Workspace>
    );
  }

  const status = profile?.verificationStatus || "draft";
  const name = profile?.name || user?.displayName?.split(" ")[0] || "Engineer";
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  const hasBasicInfo = !!(profile?.name && profile?.college);
  const hasSkills = !!(profile?.skills && profile.skills.length > 0);
  const hasGithub = !!(profile?.githubUrl);
  const hasProjects = !!(profile?.projects && profile.projects.length > 0);

  let completionScore = 0;
  if (hasBasicInfo) completionScore += 25;
  if (hasSkills) completionScore += 25;
  if (hasGithub) completionScore += 20;
  if (hasProjects) completionScore += 30;

  const isProfileComplete = completionScore >= 100;
  const assessmentCount = userProfile?.assessmentScores ? Object.keys(userProfile.assessmentScores).length : 0;
  const hasAssessments = assessmentCount > 0;
  const coverageFilled = [hasBasicInfo, hasSkills, hasGithub, hasProjects].filter(Boolean).length;

  return (
    <Workspace>
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-12">
        <aside className="lg:w-1/5 shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-low text-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={name} className="h-full w-full object-cover grayscale" />
              ) : (
                initial
              )}
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight">{name}</h1>
            <p className="font-data mt-2 uppercase text-muted-foreground">
              {profile?.branch || "Technical identity"}
            </p>
            <div className="mt-8 space-y-1">
              <TechnicalRecord label="College" value={profile?.college || "—"} />
              <TechnicalRecord label="Verification" value={<StatusMark status={status as any} />} />
              <TechnicalRecord label="Public record" value={status === "verified" ? "Live" : "Not published"} />
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <Button variant="secondary" size="sm" href="/candidate/profile">
                Open workspace
              </Button>
              {status === "verified" && user?.uid && (
                <Button variant="primary" size="sm" href={`/p/${user.uid}`} leftIcon={<ExternalLink className="h-4 w-4" />}>
                  View public record
                </Button>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <SectionHeader title="Proof Threads" kicker="Active Assessment" />

          {status === "changes_required" && profile?.verificationReason && (
            <div className="mb-10 flex items-start gap-3 border border-danger/30 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              <div>
                <p className="font-label mb-2 text-danger">Audit feedback</p>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{profile.verificationReason}</p>
              </div>
            </div>
          )}

          <div className="mb-12">
            <p className="font-label mb-3 text-outline">Proof coverage</p>
            <ProofCoverage points={4} filled={coverageFilled} />
            <p className="font-data mt-3 text-outline">{completionScore}% of required evidence attached</p>
          </div>

          <div className="proof-focus-group space-y-4">
            {(profile?.skills || []).slice(0, 6).map((skill) => {
              const relatedProject = profile?.projects?.find((p) =>
                `${p.title} ${p.description}`.toLowerCase().includes(skill.toLowerCase())
              );
              const assessed = assessmentCount > 0;
              return (
                <ProofThread
                  key={skill}
                  claim={skill}
                  kicker="Technical claim"
                  status={status === "verified" ? "verified" : assessed ? "assessed" : "declared"}
                >
                  {assessed && userProfile?.assessmentScores && (
                    <EvidenceBlock source="Technical assessment">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px]">Assessment signal</span>
                        <span className="font-serif text-2xl">
                          {String(Object.values(userProfile.assessmentScores)[0] ?? "—")}
                        </span>
                      </div>
                    </EvidenceBlock>
                  )}
                  {relatedProject && (
                    <EvidenceBlock source="Project evidence">
                      <p className="text-[15px]">{relatedProject.title}</p>
                    </EvidenceBlock>
                  )}
                  <p className="font-data text-outline">
                    Meritlane · {status === "verified" ? "Verified" : status.replace("_", " ")}
                  </p>
                </ProofThread>
              );
            })}

            {(!profile?.skills || profile.skills.length === 0) && (
              <ProofThread claim="No technical claims yet" kicker="Identity" status="draft">
                <EvidenceBlock source="Profile">
                  <p className="text-[15px] text-muted-foreground">
                    Declare skills and attach project evidence in the technical identity workspace.
                  </p>
                </EvidenceBlock>
              </ProofThread>
            )}
          </div>
        </section>

        <aside className="lg:w-1/4 shrink-0 space-y-10">
          <div>
            <p className="font-label mb-4 text-outline">Next actions</p>
            <div className="space-y-4">
              {!isProfileComplete && (
                <div>
                  <p className="text-[15px] text-foreground">Complete identity</p>
                  <Button variant="ghost" size="xs" href="/candidate/profile" className="mt-2 px-0">
                    [+] Supply evidence
                  </Button>
                </div>
              )}
              {status !== "verified" && assessmentCount === 0 && (
                <div>
                  <p className="text-[15px] text-foreground">Technical assessment</p>
                  <Button variant="ghost" size="xs" href="/candidate/assessment" className="mt-2 px-0">
                    [+] Start
                  </Button>
                </div>
              )}
              {hasProjects && status !== "verified" && (
                <div>
                  <p className="text-[15px] text-foreground">Review repositories</p>
                  <Button variant="ghost" size="xs" href="/candidate/profile" className="mt-2 px-0">
                    [+] Open projects
                  </Button>
                </div>
              )}
              {status === "verified" && (
                <p className="text-[15px] text-muted-foreground">Record is live and discoverable.</p>
              )}
            </div>
          </div>

          <div>
            <p className="font-label mb-4 text-outline">Verification history</p>
            <div className="relative space-y-5 border-l border-border pl-4">
              {status === "verified" && (
                <p className="text-[15px]">Verification passed</p>
              )}
              {hasAssessments && <p className="text-[15px] text-muted-foreground">Assessment recorded</p>}
              {hasProjects && <p className="text-[15px] text-muted-foreground">Project evidence attached</p>}
              <p className="text-[15px] text-outline">Identity initialized</p>
            </div>
          </div>

          <div>
            <ProofTrace
              status={status}
              assessmentScores={userProfile?.assessmentScores}
              assessmentDate={userProfile?.assessmentDate}
              candidateName={name}
              size="sm"
            />
          </div>
        </aside>
      </div>
    </Workspace>
  );
}
