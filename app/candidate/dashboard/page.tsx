"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { fetchCandidateProfile, CandidateProfile } from "@/lib/firebase/candidate";
import { Workspace } from "@/components/proof/Workspace";
import { SectionHeader } from "@/components/proof/SectionHeader";
import { ProofThread, EvidenceBlock } from "@/components/proof/ProofThread";
import { ProofTrace } from "@/components/ui/ProofTrace";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Clock, ShieldCheck, AlertCircle, FileCode2 } from "lucide-react";

function ActionLink({ href, children, primary }: { href: string; children: React.ReactNode, primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-w-[200px] items-center justify-between border ${
        primary 
          ? 'border-foreground bg-foreground text-background hover:bg-zinc-200' 
          : 'border-border bg-surface hover:border-foreground text-foreground'
      } px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.01]`}
    >
      <span>{children}</span>
      <span className="ml-4 font-mono">{primary ? "→" : "↗"}</span>
    </Link>
  );
}

// System Clock component for a technical feel
function SystemClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toISOString().replace("T", " ").substring(0, 19) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
      <Clock className="h-3 w-3" />
      <span>SYS_TIME: {time || "SYNCING..."}</span>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CandidateDashboardPage() {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCandidateProfile(user.uid)
        .then((p) => setProfile(p))
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
        <div className="mx-auto max-w-5xl pt-8 pb-20 space-y-8 animate-pulse">
          <div className="h-24 w-full bg-surface-high border border-border" />
          <div className="h-32 w-full bg-surface-low border border-border" />
          <div className="grid grid-cols-3 gap-8">
            <div className="h-64 col-span-2 bg-surface border border-border" />
            <div className="h-64 bg-surface border border-border" />
          </div>
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

  return (
    <Workspace>
      <motion.div 
        className="mx-auto max-w-5xl pt-8 pb-20"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        
        {/* Header Section */}
        <motion.header variants={itemVariants} className="mb-12 flex flex-col gap-8 md:flex-row md:items-start md:justify-between border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center border border-border bg-surface-low font-serif text-3xl text-foreground shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={name} className="h-full w-full object-cover grayscale" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">
                  Primary Node
                </p>
                <SystemClock />
              </div>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {name}
              </h1>
              {profile?.college && (
                <p className="mt-1 text-sm text-muted-foreground">{profile.college}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-end">
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
                Public Record
              </ActionLink>
            )}
          </div>
        </motion.header>

        {/* System Diagnostics / Metrics Grid */}
        <motion.div variants={itemVariants} className="mb-16 grid grid-cols-2 gap-px bg-border sm:grid-cols-4 border border-border overflow-hidden">
          <div className="bg-surface p-6 relative group transition-colors hover:bg-surface-high">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">State</p>
              {status === 'verified' ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <Activity className="h-4 w-4 text-amber-500" />}
            </div>
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-sm ${status === 'verified' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <p className="font-serif text-xl capitalize text-foreground">{status.replace("_", " ")}</p>
            </div>
          </div>
          
          <div className="bg-surface p-6 relative group transition-colors hover:bg-surface-high">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Integrity</p>
            </div>
            <div className="flex items-end gap-1">
              <p className="font-serif text-2xl text-foreground leading-none">{completionScore}</p>
              <span className="text-sm text-muted-foreground font-mono mb-0.5">%</span>
            </div>
            <div className="w-full h-1 bg-surface-low mt-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${completionScore === 100 ? 'bg-foreground' : 'bg-outline'}`}
              />
            </div>
          </div>

          <div className="bg-surface p-6 relative group transition-colors hover:bg-surface-high">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Claims</p>
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-serif text-2xl text-foreground">{profile?.skills?.length || 0}</p>
          </div>

          <div className="bg-surface p-6 relative group transition-colors hover:bg-surface-high">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-outline">Projects</p>
            </div>
            <p className="font-serif text-2xl text-foreground">{profile?.projects?.length || 0}</p>
          </div>
        </motion.div>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_300px]">
          
          {/* Main Content Area */}
          <article className="min-w-0">
            {status !== "verified" && (
              <motion.section variants={itemVariants} className="mb-14">
                <SectionHeader title="Priority Protocol" kicker="Action Required" />
                <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-foreground" />
                  
                  {(!hasSkills || !hasProjects) ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="h-5 w-5 text-foreground" />
                        <h3 className="font-serif text-2xl text-foreground">Supply Technical Evidence</h3>
                      </div>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">
                        Your technical record lacks the necessary evidence for verification. Declare your primary skills and link the GitHub repositories where you applied them to proceed.
                      </p>
                      <div className="mt-6">
                        <ActionLink href="/candidate/profile" primary>
                          Open Workspace
                        </ActionLink>
                      </div>
                    </div>
                  ) : assessmentCount === 0 ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="h-5 w-5 text-foreground" />
                        <h3 className="font-serif text-2xl text-foreground">Begin Technical Assessment</h3>
                      </div>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">
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
                      <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-serif text-2xl text-foreground">Verification Under Review</h3>
                      </div>
                      <p className="text-[15px] leading-relaxed text-muted-foreground">
                        Your evidence and assessment scores are currently being audited. Your profile will become discoverable to employers once the audit is successfully completed.
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            <motion.section variants={itemVariants}>
              <SectionHeader title="Skill Claims" kicker="01" />

              {status === "changes_required" && profile?.verificationReason && (
                <div className="mb-10 border-l-2 border-danger pl-4 py-1">
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
            </motion.section>
          </article>

          {/* Right Sidebar - System Logs / History */}
          <motion.aside variants={itemVariants}>
            <section className="mb-12">
              <SectionHeader title="Timeline" kicker="02" />
              <ol className="space-y-0 mt-6 border-l border-border/50 ml-1.5">
                {status === "verified" && (
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-600 ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Verification passed</p>
                    <p className="mt-1 text-xs text-muted-foreground">Profile is now public</p>
                  </motion.li>
                )}
                {hasAssessments && (
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Assessment recorded</p>
                  </motion.li>
                )}
                {hasProjects && (
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative pl-6 pb-6 last:pb-0">
                    <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Project evidence attached</p>
                  </motion.li>
                )}
                <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative pl-6 pb-6 last:pb-0">
                  <span aria-hidden="true" className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-outline ring-4 ring-surface" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">Identity initialized</p>
                </motion.li>
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
          </motion.aside>

        </div>
      </motion.div>
    </Workspace>
  );
}
