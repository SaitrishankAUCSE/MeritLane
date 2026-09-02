"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Lock, Copy, Check, GitCommit, Network } from "lucide-react";

interface PublicProofRecordProps {
  id: string;
  candidate: any;
  user: any;
  hideHeader?: boolean;
}

export function PublicProofRecord({ id, candidate, user, hideHeader = false }: PublicProofRecordProps) {
  const [copied, setCopied] = useState(false);
  const name = candidate.name || "Anonymous Candidate";
  const skills = candidate.skills || ["Software Engineering"];
  const projects = candidate.projects || [];
  const recordId = id.substring(0, 8).toLowerCase();
  const avatarUrl = user?.photoURL || "";
  
  const verifiedDate = candidate.verifiedAt 
    ? new Date(candidate.verifiedAt).toISOString()
    : (candidate.updatedAt ? new Date(candidate.updatedAt).toISOString() : new Date().toISOString());

  const hasAnyVerifiedSkill = skills.some((skill: string) => candidate.verifiedSkills?.[skill]?.status === "verified");
  const isPractitionerVerified = candidate.verificationStatus === "verified" || hasAnyVerifiedSkill;
  const totalProofs = skills.length + projects.length;

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] text-[#1C1917] font-sans">
      
      {/* Top Navbar */}
      {!hideHeader && (
        <header className="flex h-[72px] items-center justify-between px-8 lg:px-16 border-b border-[#E7E2DA] bg-white">
          <Link href="/" className="font-serif text-[26px] font-medium tracking-tight text-[#1C1917]">Meritlane</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 rounded-lg border border-[#E7E2DA] hover:border-[#1C1917] transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Link copied" : "Copy public link"}
            </button>
            <div className="font-mono text-[10px] tracking-[0.1em] text-[#78716C] uppercase flex items-center gap-2">
              <Shield className="h-3 w-3" /> Public artifact
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-16 pb-10 sm:pb-14 border-b border-[#E7E2DA] bg-white">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start max-w-[1200px] mx-auto">
          <div className="h-[96px] w-[96px] sm:h-[120px] sm:w-[120px] shrink-0 rounded-2xl border border-[#E7E2DA] overflow-hidden bg-[#F8F6F3]">
            {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover grayscale opacity-90" /> : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-[#78716C]">
                {name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-1 sm:mt-2">
            <h1 className="font-serif text-[32px] sm:text-[42px] lg:text-[48px] text-[#1C1917] tracking-tight leading-[1.1] mb-3 sm:mb-4">
              {name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-[12px] sm:text-[13px] font-sans font-medium">
              {isPractitionerVerified ? (
                <div className="flex items-center gap-2 text-[#16A34A]">
                  <CheckCircle2 className="h-[14px] w-[14px] text-[#16A34A]" />
                  <span>Verified Practitioner</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#78716C]">
                  <span>Self-Declared Candidate</span>
                </div>
              )}
              <div className="w-px h-3 bg-[#E7E2DA]" />
              <div className="text-[#78716C] lowercase tracking-normal font-mono text-[12px]">ID: {recordId}</div>
            </div>
            
            <p className="max-w-2xl text-[14px] sm:text-[16px] leading-[1.6] text-[#78716C] font-sans italic">
              Verified assertion of skills and professional history. All claims below are backed by verifiable evidence evaluated by the Meritlane system.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Column Main Grid */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 py-12 sm:py-20 bg-[#FAFAFA]">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-10 lg:gap-24">
          
          {/* Left: Assertion metadata */}
          <aside className="space-y-10">
            <h3 className="text-[13px] font-sans font-medium text-[#737373] mb-8">Assertion metadata</h3>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#737373]">Last Verified</div>
              <div className="text-[13px] text-[#0D0D0D] font-mono break-all">{verifiedDate}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#737373]">Verified By</div>
              <div className="text-[13px] text-[#737373]">MeritLane Verification System</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-[13px] font-sans font-medium text-[#737373]">Total Proofs</div>
              <div className="text-[13px] text-[#737373]">{totalProofs} Evidence Items</div>
            </div>

            {candidate.college && (
              <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
                <div className="text-[13px] font-sans font-medium text-[#737373]">Education</div>
                <div className="text-[13px] text-[#0D0D0D]">{candidate.college}</div>
                <div className="text-[12px] text-[#666666]">{candidate.branch}</div>
                <div className="text-[11px] font-mono text-[#666666]">Class of {candidate.gradYear}</div>
              </div>
            )}

            {candidate.githubEvidence && (
              <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
                <div className="flex items-center gap-2 text-[#15803D]">
                  <Shield className="h-[14px] w-[14px]" />
                  <div className="text-[13px] font-sans font-medium">Automated Evidence</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded-sm">
                    <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-1">Repos</div>
                    <div className="text-[14px] font-serif text-[#0D0D0D]">{candidate.githubEvidence.repoCount}</div>
                  </div>
                  <div className="p-3 bg-white border border-[#E5E5E5] rounded-sm">
                    <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-1">Commits</div>
                    <div className="text-[14px] font-serif text-[#0D0D0D]">~{candidate.githubEvidence.totalCommits}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#737373] uppercase tracking-wider mb-2">Verified Languages</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {candidate.githubEvidence.topLanguages.map((lang: string) => (
                      <span key={lang} className="text-[10px] font-mono bg-white border border-[#E5E5E5] text-[#0D0D0D] px-2 py-0.5 rounded-sm">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#666666] flex items-center gap-1.5 mt-2">
                  <GitCommit className="h-3 w-3" /> Source: GitHub OAuth
                </div>
              </div>
            )}
          </aside>

          {/* Center: Proof Map */}
          <article>
            <h2 className="font-serif text-[36px] text-[#0D0D0D] mb-12">Proof Map</h2>
            
            <div className="space-y-24">
              {skills.map((skill: string, index: number) => {
                const projectEvidence = projects.find((p: any) => p.supportsClaim === skill) || null;
                const isVerified = candidate.verifiedSkills?.[skill]?.status === "verified";
                const verifiedAt = candidate.verifiedSkills?.[skill]?.verifiedAt;
                const verifiedDate = verifiedAt ? new Date(verifiedAt).toISOString().split('T')[0] : "";

                return (
                  <div key={index} className="relative">
                    {/* Status Mark */}
                    <div className={`absolute -left-6 top-3 h-1.5 w-1.5 ${isVerified ? 'bg-[#15803D]' : 'bg-[#D2D2D2]'}`} />
                    
                    <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-2 leading-[1.2]">
                      {skill}
                    </h3>
                    <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.15em]">
                      {isVerified ? (
                        <span className="text-[#15803D]">✓ Verified by MeritLane</span>
                      ) : (
                        <span className="text-[#666666]">Self-Declared (Unverified)</span>
                      )}
                    </div>
                    
                    {isVerified ? (
                      <p className="text-[14px] text-[#737373] leading-[1.6] mb-8 max-w-[500px]">
                        Passed rigorous technical assessment. Demonstrated structural competency and technical fluency in {skill} on {verifiedDate}.
                      </p>
                    ) : (
                      <p className="text-[14px] text-[#737373] leading-[1.6] mb-8 max-w-[500px]">
                        Pending technical verification. Evidence provided is currently under review or awaiting assessment completion.
                      </p>
                    )}
                    
                    {/* Primary Evidence Block */}
                    {projectEvidence && (
                      <div className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                          <Network className="h-[14px] w-[14px] text-[#15803D]" />
                          <span className="text-[13px] font-sans font-medium text-[#15803D]">Primary Evidence</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5E5] pb-4 gap-4">
                          <div className="text-[15px] text-[#0D0D0D] font-medium">{projectEvidence.title}</div>
                          {projectEvidence.repoUrl && (
                            <a 
                              href={projectEvidence.repoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-[#F3F3F1] text-[#15803D] font-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-none border border-[#E5E5E5] hover:bg-[#F3F3F1] hover:text-[#0D0D0D] transition-colors shrink-0 text-center"
                            >
                              View Repository
                            </a>
                          )}
                        </div>
                        <p className="mt-4 text-[13px] text-[#737373] leading-relaxed">
                          {projectEvidence.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Evidence Density Rating */}
                    <div className="mb-12">
                      <div className="flex items-center w-full mb-3">
                        <div className="h-[1px] bg-[#E5E5E5] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#D2D2D2] -top-[2px]" />
                        </div>
                        <div className="h-[1px] bg-[#E5E5E5] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#D2D2D2] -top-[2px]" />
                        </div>
                        <div className="h-[1px] bg-[#F3F3F1] flex-1 relative">
                          <div className="absolute left-0 h-1.5 w-[1px] bg-[#D2D2D2] -top-[2px]" />
                          <div className="absolute right-0 h-1.5 w-[1px] bg-[#E5E5E5] -top-[2px]" />
                        </div>
                      </div>
                      <div className="text-[13px] font-sans font-medium text-[#737373]">
                        Evidence Density Rating: {projectEvidence ? "High" : "Standard"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Verification Disclaimer & Meaning */}
            <div className="mt-16 pt-8 border-t border-[#E7E2DA] space-y-4">
              <div className="border border-[#E7E2DA] bg-white rounded-2xl p-6 sm:p-7">
                <h4 className="text-[15px] font-semibold text-[#1C1917] mb-2">
                  What this verification means
                </h4>
                <p className="text-[13px] text-[#78716C] leading-relaxed mb-3">
                  MeritLane verification represents that this candidate completed a timed, monitored technical assessment scoring 80% or higher, or provided validated repository evidence. It certifies that the candidate demonstrated the evaluated competencies under structured evaluation conditions.
                </p>
                <p className="text-[12px] text-[#A8A29E] leading-relaxed">
                  Verification does not guarantee employment or certify every aspect of a candidate&apos;s professional ability. Employers should evaluate candidates holistically according to their own technical and organizational requirements.
                </p>
              </div>
            </div>

            {/* Security Footer */}
            <div className="mt-8 pt-6 border-t border-[#E7E2DA] flex items-start gap-4">
              <Lock className="h-5 w-5 text-[#78716C] shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-medium text-[#1C1917] mb-1">Protected Public Record</div>
                <div className="text-[13px] text-[#78716C] leading-relaxed max-w-2xl">
                  This public record is maintained by MeritLane and reflects the candidate&apos;s verified assessment results and linked evidence. 
                  Candidates cannot modify verified claims without re-assessment.
                </div>
              </div>
            </div>
          </article>

          {/* Right: Security & Network Activity */}
          <aside className="space-y-10 lg:pl-10 lg:border-l border-[#E5E5E5]">
            
            <div>
              <h3 className="text-[13px] font-sans font-medium text-[#737373] mb-6 border-b border-[#E5E5E5] pb-3">
                Security Profile
              </h3>
              <div className="flex items-start gap-3 text-[12px] font-sans text-[#666666] leading-relaxed">
                <Shield className="h-4 w-4 text-[#15803D] shrink-0 mt-0.5" />
                This record is protected. Verified claims can only be updated through re-assessment via the MeritLane platform.
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-sans font-medium text-[#737373] mb-6 border-b border-[#E5E5E5] pb-3">
                Record Activity
              </h3>
              
              <div className="space-y-6">
                <div className="relative pl-6">
                  <div className="absolute left-[3px] top-1.5 bottom-[-24px] w-[1px] bg-[#F3F3F1]" />
                  <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#15803D]" />
                  <div className="text-[12px] font-sans font-medium text-[#0D0D0D] mb-1">Verification Issued</div>
                  <div className="text-[10px] font-mono text-[#666666]">Record: {recordId}</div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[3px] top-1.5 bottom-[-24px] w-[1px] bg-[#F3F3F1]" />
                  <div className="absolute left-[1px] top-1.5 h-1.5 w-1.5 rounded-full bg-[#D2D2D2]" />
                  <div className="text-[12px] font-sans text-[#666666] mb-1">Evidence Synchronized</div>
                  <div className="text-[10px] font-mono text-[#666666]">Candidate Profile</div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute left-[1px] top-1.5 h-1.5 w-1.5 rounded-full bg-[#D2D2D2]" />
                  <div className="text-[12px] font-sans text-[#666666] mb-1">Identity Claim Created</div>
                  <div className="text-[10px] font-mono text-[#666666]">Account authenticated</div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>

    </div>
  );
}

