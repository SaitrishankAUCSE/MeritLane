"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Workspace } from "@/components/proof/Workspace";
import { SectionHeader } from "@/components/proof/SectionHeader";
import { ProofThread, EvidenceBlock, ProofCoverage } from "@/components/proof/ProofThread";
import { ProofTrace } from "@/components/ui/ProofTrace";
import Link from "next/link";

function MetaCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">{label}</p>
      <div className="mt-1 break-words text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

function ActionLink({ href, children, primary }: { href: string; children: React.ReactNode, primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-w-[200px] items-center justify-between border ${
        primary 
          ? 'border-foreground bg-foreground text-background hover:bg-zinc-200' 
          : 'border-border bg-surface hover:border-foreground text-foreground'
      } px-5 py-3.5 text-sm font-medium transition-colors`}
    >
      <span>{children}</span>
      <span className="ml-4 font-mono">{primary ? "→" : "↗"}</span>
    </Link>
  );
}

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
      <div className="mx-auto max-w-5xl pt-8 pb-20">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center border border-border bg-surface-low font-serif text-3xl text-foreground">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={name} className="h-full w-full object-cover grayscale" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
                Identity Overview
              </p>
              <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {name}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionLink href="/candidate/profile" primary={!isProfileComplete}>
              Open Workspace
            </ActionLink>
            {status !== "verified" && assessmentCount === 0 && (
              <ActionLink href="/candidate/assessment" primary={isProfileComplete}>
                Start Assessment
              </ActionLink>
            )}
            {status === "verified" && user?.uid && (
              <ActionLink href={`/p/${user.uid}`} primary>
                View Public Record
              </ActionLink>
            )}
          </div>
        </header>

        {/* Dashboard Metrics Grid */}
        <div className="mb-16 grid grid-cols-2 gap-px bg-border sm:grid-cols-4 border border-border">
          <div className="bg-surface p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">State</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 ${status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <p className="font-serif text-xl capitalize text-foreground">{status.replace("_", " ")}</p>
            </div>
          </div>
          <div className="bg-surface p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Evidence</p>
            <p className="mt-3 font-serif text-2xl text-foreground">
              {completionScore}<span className="text-sm text-muted-foreground ml-1">%</span>
            </p>
          </div>
          <div className="bg-surface p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Claims</p>
            <p className="mt-3 font-serif text-2xl text-foreground">{profile?.skills?.length || 0}</p>
          </div>
          <div className="bg-surface p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Projects</p>
            <p className="mt-3 font-serif text-2xl text-foreground">{profile?.projects?.length || 0}</p>
          </div>
        </div>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_300px]">
          
          {/* Main Content Area */}
          <article className="min-w-0">
            {status !== "verified" && (
              <section className="mb-14">
                <SectionHeader title="Priority Protocol" kicker="Action Required" />
                <div className="border border-border bg-surface p-6 sm:p-8">
                  {(!hasSkills || !hasProjects) ? (
                    <div>
                      <h3 className="font-serif text-2xl text-foreground">Supply Technical Evidence</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                        Your technical record lacks the necessary evidence for verification. Declare your primary skills and link the GitHub repositories where you applied them.
                      </p>
                      <div className="mt-6">
                        <ActionLink href="/candidate/profile" primary>
                          Open Workspace
                        </ActionLink>
                      </div>
                    </div>
                  ) : assessmentCount === 0 ? (
                    <div>
                      <h3 className="font-serif text-2xl text-foreground">Begin Technical Assessment</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                        Your project evidence is attached. The final step is to validate your claims through a brief, focused technical assessment to achieve a Verified status.
                      </p>
                      <div className="mt-6">
                        <ActionLink href="/candidate/assessment" primary>
                          Start Assessment
                        </ActionLink>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-serif text-2xl text-foreground">Verification Under Review</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                        Your evidence and assessment scores are being reviewed. Your profile will become discoverable to employers once the audit is complete.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section>
              <SectionHeader title="Skill Claims" kicker="01" />

              {status === "changes_required" && profile?.verificationReason && (
                <div className="mb-10 border-l-2 border-danger pl-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">Audit feedback</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{profile.verificationReason}</p>
                </div>
              )}

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
                            <span className="text-[14px]">Assessment signal</span>
                            <span className="font-serif text-xl">
                              {String(Object.values(userProfile.assessmentScores)[0] ?? "—")}
                            </span>
                          </div>
                        </EvidenceBlock>
                      )}
                      {relatedProject && (
                        <EvidenceBlock source="Project evidence">
                          <p className="text-[14px]">{relatedProject.title}</p>
                        </EvidenceBlock>
                      )}
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-outline">
                        Meritlane · {status === "verified" ? "Verified" : status.replace("_", " ")}
                      </p>
                    </ProofThread>
                  );
                })}

                {(!profile?.skills || profile.skills.length === 0) && (
                  <ProofThread claim="No technical claims yet" kicker="Identity" status="draft">
                    <EvidenceBlock source="Profile">
                      <p className="text-[14px] text-muted-foreground">
                        Declare skills and attach project evidence in the technical identity workspace.
                      </p>
                    </EvidenceBlock>
                    <div className="mt-6">
                      <ActionLink href="/candidate/profile" primary>
                        Add Claims
                      </ActionLink>
                    </div>
                  </ProofThread>
                )}
              </div>
            </section>
          </article>

          {/* Right Sidebar - System Logs / History */}
          <aside>
            <section className="mb-12">
              <SectionHeader title="Timeline" kicker="02" />
              <ol className="space-y-0 mt-6 border-l border-border/50 ml-1.5">
                {status === "verified" && (
                  <li className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600 ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Verification passed</p>
                    <p className="mt-1 text-xs text-muted-foreground">Profile is now public</p>
                  </li>
                )}
                {hasAssessments && (
                  <li className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Assessment recorded</p>
                  </li>
                )}
                {hasProjects && (
                  <li className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Project evidence attached</p>
                  </li>
                )}
                <li className="relative pl-6 pb-6 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Identity initialized</p>
                </li>
              </ol>
            </section>

            <section>
              <SectionHeader title="Proof Trace" kicker="03" />
              <div className="mt-6">
                <ProofTrace
                  status={status}
                  assessmentScores={userProfile?.assessmentScores}
                  assessmentDate={userProfile?.assessmentDate}
                  candidateName={name}
                  size="sm"
                />
              </div>
            </section>
          </aside>

        </div>
      </div>
    </Workspace>
  );
}
